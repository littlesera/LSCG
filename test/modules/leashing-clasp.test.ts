// Clasped leashes: someone holding a leash the vanilla way clasps it to another player's leash or collar, and from
// then on each of the two pulls the other along.
//
// Player (member 1) is one end of a clasp, or the one who made it. Clasps arrive like any LSCG command, so most of
// these go through CoreModule's real routing with receive.command(). Who everyone else is clasped to comes from their
// room settings, set with listClasps().
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import bcModSDK from "bondage-club-mod-sdk";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { Leashing, LeashingModule } from "Modules/leashing";
import { registerExtension } from "api/extensions";
import { registerModule } from "modules";
import { addToRoom, boot, currentBcLite, player, resetWorld } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureAsset, type FixtureCharacter, type FixtureItem } from "../harness/fixtures";
import { advance, useFakeTimers, useRealTimers } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

const lscgOn = () => ({ GlobalModule: { enabled: true }, LeashingModule: { enabled: true, clasps: [] as number[] } });

// The BC function underneath one of LSCG's hooks, to see what LeashingModule hands it
function original(name: string): Mock {
	return bcModSDK.getPatchingInfo().get(name)?.original as Mock;
}

describe("LeashingModule clasped leashes", () => {
	let leashing: LeashingModule;
	let activities: ActivityModule;
	let collarLeash: FixtureAsset;
	let chainLeash: FixtureAsset;
	let collar: FixtureAsset;
	let other: FixtureAsset;

	beforeAll(() => {
		[, , leashing, activities] = boot(new CoreModule(), new ConsentModule(), new LeashingModule(), new ActivityModule());
		// Escapes always win here
		class ItemUseModule {
			MakeActivityCheck() {
				return { AttackerRoll: { Total: 1, TotalStr: "" }, DefenderRoll: { Total: 0, TotalStr: "" } };
			}
		}
		registerModule(new ItemUseModule() as never);
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "PlayerA", LSCG: lscgOn() });
		leashing.Pairings = [];
		leashing.claspChangeQueued = false;
		leashing.leashLook = undefined;
		// The game lists us among the room's characters too
		addToRoom(player());
		g.Player.OnlineSharedSettings = { AllowPlayerLeashing: true };
		g.ChatRoomLeashList = [];
		g.ChatRoomLeashPlayer = null;
		g.ChatRoomData.BlockCategory = [];
		g.ChatRoomData.Name = "Here";
		g.ServerChatRoomGetAllowItem.mockImplementation(() => true);
		g.ChatRoomCanBeLeashed.mockImplementation(() => true);
		original("ChatRoomCanBeLeashedBy").mockReturnValue(true);
		const restraints = makeGroup({ Name: "ItemNeckRestraints" });
		collarLeash = makeAsset(restraints, { Name: "CollarLeash", AllowEffect: ["IsLeashed"] });
		chainLeash = makeAsset(restraints, { Name: "ChainLeash" });
		other = makeAsset(makeGroup({ Name: "ItemDevices" }), { Name: "WoodenBox" });
		collar = makeAsset(makeGroup({ Name: "ItemNeck" }), { Name: "LeatherCollar" });
		wearLeash(player());
	});

	afterEach(() => {
		for (const name of ["ServerHandleLeashBeep", "ChatRoomMapViewLeash", "CharacterRefreshLeash", "ChatRoomCanLeave", "ChatRoomCanBeLeashedBy"])
			original(name).mockReset();
		useRealTimers();
	});

	function wearLeash(C: FixtureCharacter, extra: { lock?: boolean; asset?: FixtureAsset; color?: string; held?: boolean } = {}): FixtureItem {
		wear(C, makeItem(collar));
		const effects = extra.held ? ["Leash", "IsLeashed"] : ["Leash"];
		const item = wear(C, makeItem(extra.asset ?? collarLeash, { Property: { Effect: effects, ...(extra.lock ? { LockedBy: "MetalPadlock" } : {}) } }));
		if (extra.color) (item as never as { Color: string }).Color = extra.color;
		return item;
	}

	// Leashable by something other than the leash slot
	function wearPelvisLeash(C: FixtureCharacter): FixtureItem {
		return wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemPelvis" }), { Name: "PelvisChainLeash" }), { Property: { Effect: ["Leash"] } }));
	}

	function join(memberNumber: number, opts: { lscg?: boolean; leash?: boolean; nickname?: string } = {}): FixtureCharacter {
		const C = addToRoom(makeCharacter({
			MemberNumber: memberNumber,
			Nickname: opts.nickname ?? `Player${String.fromCharCode(64 + memberNumber)}`,
			LSCG: opts.lscg === false ? undefined : lscgOn(),
		}));
		(C as never as { OnlineSharedSettings: object }).OnlineSharedSettings = { AllowPlayerLeashing: true };
		if (opts.leash !== false) wearLeash(C);
		else wear(C, makeItem(collar));
		return C;
	}

	// LSCG commands sent to other players, as [target, name, args]
	function commands(name?: string) {
		return sent.hidden()
			.filter(m => !name || m.command?.name === name)
			.map(m => [m.target, m.command?.name, m.command?.args]);
	}

	// The vanilla hidden leash messages (HoldLeash, StopHoldLeash, RemoveLeash...), as [Content, Target]
	function gameHidden() {
		return sent.raw()
			.filter(([type, data]) => type === "ChatRoomChat" && data?.Type === "Hidden" && data?.Content !== "LSCGMsg")
			.map(([, data]) => [data.Content, data.Target]);
	}

	function releaseBeeps() {
		return sent.beeps().filter(b => b.message.command?.name === "release").map(b => [b.target, b.message.command?.args]);
	}

	const leashArgs = (pairedMember: number, extra: { name: string; value: unknown }[] = []) => [
		{ name: "pairedMember", value: pairedMember },
		{ name: "type", value: "leash" },
		{ name: "isSource", value: false },
		...extra,
	];

	// Someone (the clasper) clasping us to pairedMember
	function claspedBy(clasper: FixtureCharacter, pairedMember: number, shared?: boolean) {
		receive.command(clasper, "add-leashing", leashArgs(pairedMember, shared === undefined ? [] : [{ name: "shared", value: shared }]));
	}

	function clasps() {
		return leashing.Pairings.filter(p => p.Type === "leash").map(p => ({ with: p.PairedMember, by: p.PairedBy, shared: !!p.SharedLeash }));
	}

	// Who C says they're clasped to in their room settings
	function listClasps(C: FixtureCharacter, partners: number[]) {
		(C.LSCG as { LeashingModule: { clasps: number[] } }).LeashingModule.clasps = partners;
	}

	// Our end of a clasp to each of these
	function claspedTo(...members: number[]) {
		leashing.Pairings = members.map(n => new Leashing(n, 1, false, "leash"));
	}

	function stuck(C: FixtureCharacter, effect = "Freeze") {
		wear(C, makeItem(other, { Property: { Effect: [effect] } }));
	}

	function escape() {
		useFakeTimers();
		leashing.escapeAttempted = 0;
		leashing.TryEscape();
		advance(4000);
	}

	// The other end letting go of us
	function releasedBy(C: FixtureCharacter) {
		receive.beep(C, { IsLSCG: true, type: "command", reply: false, settings: null, target: 1, version: "v0.0.0",
			command: { name: "release", args: [{ name: "type", value: "leash" }, { name: "isSource", value: false }] } } as LSCGMessageModel);
	}

	function publicPackets() {
		return sent.hidden().filter(m => m.type === "sync").map(m => (m.settings as { LeashingModule: { clasps: number[] } }).LeashingModule.clasps);
	}

	describe("who a clasp can join", () => {
		it("we can clasp while our own leashing is on", () => {
			expect(leashing.CanClaspWith(g.Player)).toBe(true);
			g.Player.LSCG.LeashingModule.enabled = false;
			expect(leashing.CanClaspWith(g.Player)).toBe(false);
		});

		it("someone else needs LSCG with both it and its leashing on", () => {
			const on = join(2);
			const without = join(3, { lscg: false });
			const leashingOff = join(4);
			leashingOff.LSCG = { GlobalModule: { enabled: true }, LeashingModule: { enabled: false, clasps: [] } };
			const lscgOff = join(5);
			lscgOff.LSCG = { GlobalModule: { enabled: false }, LeashingModule: { enabled: true, clasps: [] } };
			expect([on, without, leashingOff, lscgOff].map(C => leashing.CanClaspWith(C as never))).toEqual([true, false, false, false]);
		});

		it("and a version that knows clasps, which is one that sends them", () => {
			const old = join(2);
			old.LSCG = { GlobalModule: { enabled: true }, LeashingModule: { enabled: true } };
			expect(leashing.CanClaspWith(old as never)).toBe(false);
		});
	});

	describe("which leash Clasp Leash uses", () => {
		it("the one leash we hold, never the target's own", () => {
			const b = join(2);
			const c = join(3);
			expect(leashing.HeldLeash(c as never)).toBeNull();
			g.ChatRoomLeashList = [2];
			expect(leashing.HeldLeash(c as never)).toBe(b);
			expect(leashing.HeldLeash(b as never)).toBeNull();
		});

		it("nothing while we hold more than one, so it's never a guess which", () => {
			join(2);
			join(3);
			const d = join(4);
			g.ChatRoomLeashList = [2, 3];
			expect(leashing.HeldLeash(d as never)).toBeNull();
		});

		it("nothing once we couldn't let go of it the vanilla way any more", () => {
			const b = join(2);
			const c = join(3);
			g.ChatRoomLeashList = [2];

			player().flags.canInteract = false;
			expect(leashing.HeldLeash(c as never)).toBeNull();
			player().flags.canInteract = true;

			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			expect(leashing.HeldLeash(c as never)).toBeNull();
			g.ServerChatRoomGetAllowItem.mockImplementation(() => true);

			(b as never as { OnlineSharedSettings: object }).OnlineSharedSettings = { AllowPlayerLeashing: false };
			expect(leashing.HeldLeash(c as never)).toBeNull();
			expect(g.ChatRoomLeashList).toEqual([2]);
		});

		it("leashes on people who've left the room don't count towards the one", () => {
			const b = join(2);
			const c = join(3);
			g.ChatRoomLeashList = [99, 2];
			expect(leashing.HeldLeash(c as never)).toBe(b);
		});

		it("a held leash that can't be held any more is dropped, not clasped", () => {
			join(2);
			const c = join(3);
			g.ChatRoomLeashList = [2];
			g.ChatRoomCanBeLeashed.mockImplementation((C: FixtureCharacter) => C.MemberNumber !== 2);
			expect(leashing.HeldLeash(c as never)).toBeNull();
			expect(g.ChatRoomLeashList).toEqual([]);
		});
	});

	describe("clasping two other players together", () => {
		it("leash to leash: we let go quietly, and both ends get the clasp", () => {
			const b = join(2);
			const c = join(3);
			g.ChatRoomLeashList = [2];

			expect(leashing.ClaspLeash(b as never, c as never)).toBe(false);

			expect(gameHidden()).toEqual([["StopHoldLeash", 2]]);
			expect(sent.raw().some(([, data]) => data?.Type === "Action" && data?.Content === "StopHoldLeash")).toBe(false);
			expect(g.ChatRoomLeashList).toEqual([]);
			expect(commands("add-leashing")).toEqual([
				[2, "add-leashing", leashArgs(3, [{ name: "shared", value: false }, { name: "slot", value: "ItemNeck" }, { name: "pairedSlot", value: "ItemNeck" }])],
				[3, "add-leashing", leashArgs(2, [{ name: "shared", value: false }, { name: "slot", value: "ItemNeck" }, { name: "pairedSlot", value: "ItemNeck" }])],
			]);
			expect(clasps()).toEqual([]);
		});

		it("leash to collar: the collar gets the end of the leash, named for whose it is, before the clasp is sent", () => {
			const b = join(2);
			const c = join(3, { leash: false });
			g.ChatRoomLeashList = [2];

			expect(leashing.ClaspLeash(b as never, c as never)).toBe(true);

			const craft = { Name: "End of PlayerB's leash", Description: "", Effects: {}, Private: false };
			expect(g.InventoryWear).toHaveBeenCalledWith(c, "CollarLeash", "ItemNeckRestraints", undefined, null, null, craft);
			expect(g.ChatRoomCharacterItemUpdate).toHaveBeenCalledWith(c, "ItemNeckRestraints");
			const serverSend = currentBcLite().ServerSend.mock;
			const firstClasp = serverSend.calls.findIndex(([, data]) => data?.Dictionary?.[0]?.message?.command?.name === "add-leashing");
			expect(g.InventoryWear.mock.invocationCallOrder[0]).toBeLessThan(serverSend.invocationCallOrder[firstClasp]);
			expect(commands("add-leashing").map(([target, , args]) => [target, (args as { name: string; value: unknown }[]).find(a => a.name === "shared")?.value]))
				.toEqual([[2, false], [3, true]]);
		});

		it("the end copies the held leash and its colour", () => {
			const b = join(2);
			wearLeash(b, { asset: chainLeash, color: "#AA0000" });
			const c = join(3, { leash: false });
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, c as never);
			expect(g.InventoryWear).toHaveBeenCalledWith(c, "ChainLeash", "ItemNeckRestraints", "#AA0000", null, null, expect.anything());
		});

		it("a leash we hold that isn't on a collar gives a collar-less target a plain collar leash, like a pelvis leash held through the dialog", () => {
			const b = join(2, { leash: false });
			b.Appearance = [];
			wearPelvisLeash(b);
			const c = join(3, { leash: false });
			g.Asset.push(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "CollarLeash" }));
			g.ChatRoomLeashList = [2];
			expect(leashing.HeldLeash(c as never)).toBe(b);
			leashing.ClaspLeash(b as never, c as never);
			expect(g.InventoryWear).toHaveBeenCalledWith(c, "CollarLeash", "ItemNeckRestraints", undefined, null, null, expect.anything());
		});

		it("clasps onto a target's leash wherever it is, and onto its collar too", () => {
			const b = join(2);
			const c = join(3, { leash: false });
			wearPelvisLeash(c);
			g.ChatRoomLeashList = [2];
			g.InventoryAllow = vi.fn(() => true);
			g.InventoryBlockedOrLimited = vi.fn(() => false);
			expect(leashing.CanClaspAt(b as never, c as never, "ItemPelvis")).toBe(true);
			expect(leashing.CanClaspAt(b as never, c as never, "ItemNeck")).toBe(true);
			expect(leashing.CanClaspAt(b as never, c as never, "ItemMouth")).toBe(false);
		});

		it("two clasps from different zones between the same two people are two clasps", () => {
			const b = join(2);
			wearPelvisLeash(b);
			const c = join(3);
			g.ChatRoomLeashList = [2];
			leashing.HoldLeash(b as never, "ItemPelvis");
			leashing.ClaspLeash(b as never, c as never, "ItemNeck");
			leashing.HoldLeash(b as never, "ItemNeck");
			leashing.ClaspLeash(b as never, c as never, "ItemNeck");
			expect(commands("add-leashing").map(([, , args]) => (args as { name: string; value: unknown }[]).find(a => a.name === "slot")?.value))
				.toEqual(["ItemPelvis", "ItemNeck", "ItemNeck", "ItemNeck"]);
		});

		it("the end's name fits BC's 30 characters and leaves out the craft separators", () => {
			const b = join(2, { nickname: "Ana§stasia¶ Rosewood" });
			const c = join(3, { leash: false });
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, c as never);
			const name = g.InventoryWear.mock.calls[0][6].Name as string;
			expect(name).toBe("End of Anastasia Rosew's leash");
			expect(name.length).toBeLessThanOrEqual(30);
		});

		it("onto ourselves: our end is added here, and the other end is told", () => {
			const b = join(2);
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, g.Player);
			expect(clasps()).toEqual([{ with: 2, by: 1, shared: false }]);
			expect(commands("add-leashing")).toEqual([[2, "add-leashing", leashArgs(1, [{ name: "shared", value: false }, { name: "slot", value: "ItemNeck" }, { name: "pairedSlot", value: "ItemNeck" }])]]);
		});
	});

	describe("our end of a clasp arriving", () => {
		it("from someone with item permission on us, remembering who made it and whether the leash is shared", () => {
			join(2);
			const c = join(3);
			claspedBy(c, 2, true);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: true }]);
		});

		it("the same clasp arriving twice is kept once", () => {
			join(2);
			const c = join(3);
			claspedBy(c, 2);
			claspedBy(c, 2);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: false }]);
		});

		it("clasping the same two again keeps the leash shared, though our slot's now taken by its end", () => {
			join(2);
			const c = join(3);
			claspedBy(c, 2, true);
			claspedBy(c, 2, false);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: true }]);
		});

		it("extensions see it start and end like any grab, as a leash", () => {
			join(2);
			const c = join(3);
			const api = registerExtension({ id: "clasp-events", name: "Clasp events", version: "1" });
			const seen: unknown[] = [];
			api.events.on("grab.added", payload => seen.push(["added", payload]));
			api.events.on("grab.removed", payload => seen.push(["removed", payload]));
			try {
				claspedBy(c, 2);
				leashing.RemoveLeashings(2, false, "leash");
			} finally {
				api.dispose();
			}
			expect(seen).toEqual([
				["added", { type: "leash", pairedMember: 2, isSource: false }],
				["removed", { type: "leash", pairedMember: 2, isSource: false }],
			]);
		});

		it("not from someone without item permission on us, and the other end is told to let go", () => {
			join(2);
			const c = join(3);
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			claspedBy(c, 2);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
			expect(sent.actions()).toEqual([]);
		});

		it("not while our leashing is off, whatever the clasper last saw of our settings", () => {
			join(2);
			const c = join(3);
			g.Player.LSCG.LeashingModule.enabled = false;
			claspedBy(c, 2);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("is refused, and the other end told to let go, when our own leashing setting is off", () => {
			g.Player.OnlineSharedSettings = { AllowPlayerLeashing: false };
			join(2);
			claspedBy(join(3), 2);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("is refused when the clasper couldn't leash us themselves, like with an owner's padlock on our leash", () => {
			original("ChatRoomCanBeLeashedBy").mockReturnValue(false);
			join(2);
			claspedBy(join(3), 2);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("held in place, we still take a clasp from someone who could otherwise leash us", () => {
			const b = join(2);
			listClasps(b, [1]);
			stuck(b);
			claspedTo(2);
			join(4);
			claspedBy(join(3), 4);
			expect(clasps().map(c => c.with)).toEqual([2, 4]);
		});

		it("refusing it again keeps a clasp we already had", () => {
			join(2);
			const c = join(3);
			claspedBy(c, 2);
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			claspedBy(c, 2);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: false }]);
			expect(releaseBeeps()).toEqual([]);
		});

		it("an extension can refuse it, and the other end is told to let go", () => {
			join(2);
			const c = join(3);
			const api = registerExtension({ id: "clasp-veto", name: "Clasp veto", version: "1" });
			let seen: unknown;
			api.events.before("grab.beforeIncoming", ctx => {
				seen = { ...ctx.payload };
				ctx.cancel();
			});
			try {
				claspedBy(c, 2);
			} finally {
				api.dispose();
			}
			expect(seen).toEqual({ type: "leash", sender: 3 });
			expect(clasps()).toEqual([]);
			expect(releaseBeeps()).toEqual([[2, [{ name: "type", value: "leash" }, { name: "isSource", value: false }]]]);
			expect(sent.actions().some(a => a.includes("slips out of the clasp"))).toBe(true);
		});

		it("takes our leash from whoever held it the vanilla way, and shows it as held", () => {
			useFakeTimers();
			join(2);
			const c = join(3);
			join(4);
			g.ChatRoomLeashPlayer = 4;
			claspedBy(c, 2);
			expect(gameHidden()).toContainEqual(["RemoveLeash", 4]);
			expect(g.ChatRoomLeashPlayer).toBeNull();
			advance(1);
			expect(original("CharacterRefreshLeash")).toHaveBeenCalled();
		});

		it("is refused if we turn out to have no leash on, without extensions seeing it come and go", () => {
			join(2);
			const c = join(3);
			player().Appearance = [];
			const api = registerExtension({ id: "clasp-none", name: "Clasp none", version: "1" });
			const seen: unknown[] = [];
			api.events.on("grab.added", payload => seen.push(payload));
			api.events.on("grab.removed", payload => seen.push(payload));
			try {
				claspedBy(c, 2);
			} finally {
				api.dispose();
			}
			expect(clasps()).toEqual([]);
			expect(seen).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});
	});

	describe("a clasp coming undone", () => {
		it("several at once refresh our leash's look, and send our room settings, just once after they're gone", () => {
			useFakeTimers();
			wearLeash(player(), { held: true });
			join(2);
			join(3);
			claspedTo(2, 3);
			leashing.BreakClasps();
			expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
			expect(publicPackets()).toEqual([]);
			advance(1);
			expect(original("CharacterRefreshLeash")).toHaveBeenCalledOnce();
			expect(publicPackets()).toEqual([[]]);
		});

		it("a change that leaves our leash looking right doesn't send our appearance", () => {
			useFakeTimers();
			wearLeash(player(), { held: true });
			join(2);
			join(3);
			claspedTo(2, 3);
			leashing.RemoveLeashings(3, false, "leash");
			advance(1);
			expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
			expect(publicPackets()).toEqual([[2]]);
		});

		it("our room settings say who we're clasped to", () => {
			useFakeTimers();
			join(2);
			claspedBy(join(3), 2);
			advance(1);
			expect(publicPackets()).toEqual([[2]]);
		});

		it("the other end being unclasped keeps our side of the shared leash on our collar", () => {
			const b = join(2);
			claspedBy(join(3), 2, true);
			releasedBy(b);
			expect(clasps()).toEqual([]);
			expect(g.InventoryRemove).not.toHaveBeenCalled();
		});

		it("someone unclasping our end only needs us to let them, and we tell the other end", () => {
			join(2);
			const d = join(4);
			claspedBy(join(3), 2);
			g.ServerChatRoomGetAllowItem.mockImplementation((C: FixtureCharacter) => C.MemberNumber === 4);
			receive.command(d, "remove-leashing", leashArgs(2, [{ name: "at", value: 1 }]));
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("letting go at our end takes the shared leash off with it, unless it's padlocked", () => {
			const b = join(2);
			claspedBy(join(3), 2, true);
			receive.command(b, "remove-leashing", leashArgs(2, [{ name: "at", value: 1 }]));
			expect(clasps()).toEqual([]);
			expect(g.InventoryRemove).toHaveBeenCalledWith(g.Player, "ItemNeckRestraints");

			g.InventoryRemove.mockClear();
			wearLeash(player(), { lock: true });
			claspedBy(join(4), 2, true);
			receive.command(b, "remove-leashing", leashArgs(2, [{ name: "at", value: 1 }]));
			expect(g.InventoryRemove).not.toHaveBeenCalled();
		});

		it("a leash-to-leash clasp leaves both leashes where they are", () => {
			const b = join(2);
			claspedBy(join(3), 2, false);
			receive.command(b, "remove-leashing", leashArgs(2, [{ name: "at", value: 1 }]));
			expect(clasps()).toEqual([]);
			expect(g.InventoryRemove).not.toHaveBeenCalled();
		});

		it("someone who's neither an end nor allowed to touch us can't undo it", () => {
			claspedBy(join(3), 2);
			join(2);
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			receive.command(join(4), "remove-leashing", leashArgs(2, [{ name: "at", value: 1 }]));
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: false }]);
		});

		it("breaking one clasp leaves the others, and breaking all tells every other end", () => {
			join(2);
			join(3);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash"), new Leashing(2, 2, false, "collar")];
			leashing.BreakClasps(2);
			expect(leashing.Pairings.map(p => `${p.Type}:${p.PairedMember}`)).toEqual(["leash:3", "collar:2"]);
			leashing.BreakClasps();
			expect(leashing.Pairings.map(p => `${p.Type}:${p.PairedMember}`)).toEqual(["collar:2"]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2, 3]);
		});

		it("any anchor we wear is our end, and a clasp lasts as long as there's one", () => {
			player().Appearance = [];
			wear(player(), makeItem(collar));
			wearPelvisLeash(player());
			join(2);
			claspedBy(join(3), 2);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: false }]);

			player().Appearance = player().Appearance.filter(item => item.Asset.Group.Name !== "ItemPelvis");
			g.CharacterRefresh(g.Player);
			expect(clasps()).toEqual([{ with: 2, by: 3, shared: false }]);
			player().Appearance = [];
			g.CharacterRefresh(g.Player);
			expect(clasps()).toEqual([]);
		});

		it("clasps on different zones are separate: letting go of one keeps the other", () => {
			join(2);
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemVulvaPiercings" }), { Name: "ClitRing" })));
			leashing.Pairings = [
				new Leashing(2, 1, false, "leash", false, "ItemNeck", "ItemNeck"),
				new Leashing(2, 1, false, "leash", false, "ItemVulvaPiercings", "ItemNeck"),
			];
			leashing.UnclaspFrom(2, "ItemVulvaPiercings");
			expect(leashing.Clasps.map(p => p.Slot)).toEqual(["ItemNeck"]);
			// What they tell us about their end of it names the zone, so only that clasp goes
			leashing.Pairings.push(new Leashing(2, 1, false, "leash", false, "ItemVulvaPiercings", "ItemNeck"));
			leashing.IncomingRelease(2, "leash", undefined, "ItemVulvaPiercings", "ItemNeck");
			expect(leashing.Clasps.map(p => p.Slot)).toEqual(["ItemNeck"]);
		});

		it("a clasp on a zone ends when that zone's anchor is gone, not the others", () => {
			join(2);
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemVulvaPiercings" }), { Name: "ClitRing" })));
			leashing.Pairings = [
				new Leashing(2, 1, false, "leash", false, "ItemNeck", "ItemNeck"),
				new Leashing(2, 1, false, "leash", false, "ItemVulvaPiercings", "ItemNeck"),
			];
			player().Appearance = player().Appearance.filter(item => item.Asset.Group.Name !== "ItemVulvaPiercings");
			g.CharacterRefresh(g.Player);
			expect(leashing.Clasps.map(p => p.Slot)).toEqual(["ItemNeck"]);
		});

		it("unclasping at their ring takes the end of the line off our own collar", () => {
			const b = join(2, { leash: false });
			b.Appearance = [];
			wear(b, makeItem(makeAsset(makeGroup({ Name: "ItemVulvaPiercings" }), { Name: "ClitRing" }), { Property: { Effect: ["Leash"] } }));
			// Our collar had no leash; the clasp put the end of theirs on it
			player().Appearance = [];
			wear(player(), makeItem(collar));
			wearLeash(player());
			leashing.Pairings = [new Leashing(2, 1, false, "leash", true, "ItemNeck", "ItemVulvaPiercings")];
			listClasps(b, [1]);
			leashing.UnclaspLeash(2, 1, "ItemVulvaPiercings");
			expect(leashing.Clasps).toEqual([]);
			expect(g.InventoryRemove).toHaveBeenCalledWith(g.Player, "ItemNeckRestraints");
		});

		it("only the collar end of a clasp is told it's shared, so the other end keeps its own leash", () => {
			const b = join(2, { leash: false });
			b.Appearance = [];
			wear(b, makeItem(makeAsset(makeGroup({ Name: "ItemVulvaPiercings" }), { Name: "ClitRing" }), { Property: { Effect: ["Leash"] } }));
			g.Asset.push(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "CollarLeash" }));
			player().Appearance = [];
			wear(player(), makeItem(collar));
			g.ChatRoomLeashList = [2];
			leashing.HoldLeash(b as never, "ItemVulvaPiercings");
			expect(leashing.ClaspLeash(b as never, g.Player, "ItemNeck")).toBe(true);
			expect(commands("add-leashing")).toEqual([[2, "add-leashing", expect.arrayContaining([{ name: "shared", value: false }])]]);
			expect(clasps()).toEqual([{ with: 2, by: 1, shared: true }]);
		});

		it("remembers where a held line was grabbed", () => {
			const b = join(2);
			wearPelvisLeash(b);
			leashing.HoldLeash(b as never, "ItemPelvis");
			expect(leashing.HeldZone(b as never)).toBe("ItemPelvis");
			leashing.LetGoOfLeash(b as never, false);
			expect(leashing.HeldZone(b as never)).toBe("ItemNeck");
		});

		it("taking our leash off unclasps us", () => {
			join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			player().Appearance = [];
			g.CharacterRefresh(g.Player);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});
	});

	describe("the Clasp Leash and Unclasp Leash activities", () => {
		const neck = { Name: "ItemNeck" };
		const pelvis = { Name: "ItemPelvis" };
		function prereq(name: string) {
			const found = activities.CustomPrerequisiteFuncs.get(name);
			if (!found) throw new Error(`Expected a registered "${name}" custom prerequisite -- has activities.ts renamed it?`);
			return found;
		}
		function action(name: string) {
			const found = activities.CustomActionCallbacks.get(`LSCG_${name}`);
			if (!found) throw new Error(`Expected a registered "LSCG_${name}" activity action -- has activities.ts renamed it?`);
			return found;
		}

		it("Clasp Leash is offered on someone it could reach, while we hold exactly one other leash", () => {
			join(2);
			const c = join(3);
			const noLSCG = join(4, { lscg: false });
			const canClasp = (C: FixtureCharacter) => prereq("CanClaspLeash")(g.Player, C as never, neck as never);
			original("ChatRoomCanBeLeashedBy").mockReturnValue(true);
			expect(canClasp(c)).toBe(false);
			g.ChatRoomLeashList = [2];
			expect(canClasp(c)).toBe(true);
			expect(canClasp(noLSCG)).toBe(false);
			g.ChatRoomLeashList = [2, 3];
			expect(canClasp(join(5))).toBe(false);
		});

		it("Hold is offered on the zone the leash is worn in, Clasp on every anchor", () => {
			join(2);
			const c = join(3, { leash: false });
			wearPelvisLeash(c);
			g.ChatRoomLeashList = [2];
			g.InventoryAllow = vi.fn(() => true);
			g.InventoryBlockedOrLimited = vi.fn(() => false);
			original("ChatRoomCanBeLeashedBy").mockReturnValue(true);
			expect(leashing.CanHoldLeash(c as never, pelvis as never)).toBe(true);
			expect(leashing.CanHoldLeash(c as never, neck as never)).toBe(false);
			expect(prereq("CanClaspLeash")(g.Player, c as never, pelvis as never)).toBe(true);
			expect(prereq("CanClaspLeash")(g.Player, c as never, neck as never)).toBe(true);
			expect(prereq("CanClaspLeash")(g.Player, c as never, { Name: "ItemNose" } as never)).toBe(false);
		});

		it("Clasp Leash clasps to the collar when its leash slot holds something else", () => {
			join(2);
			const c = join(3);
			wear(c, makeItem(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "CollarChainShort" })));
			g.ChatRoomLeashList = [2];
			expect(prereq("CanClaspLeash")(g.Player, c as never, neck as never)).toBe(true);
		});

		it("Clasp Leash says what it clasped onto, in place of the activity's own line", () => {
			join(2);
			g.ChatRoomLeashList = [2];
			expect(action("ClaspLeash")(join(3) as never, {} as never, undefined)).toBe(false);
			g.ChatRoomLeashList = [2];
			action("ClaspLeash")(join(4, { leash: false }) as never, {} as never, undefined);
			g.ChatRoomLeashList = [2];
			action("ClaspLeash")(g.Player, {} as never, undefined);
			expect(sent.actions()).toEqual([
				expect.stringContaining("to PlayerC's leash."),
				expect.stringContaining("to PlayerD's collar."),
				expect.stringContaining("own leash."),
			]);
		});

		// [target, at] of each remove-leashing sent
		// Who each remove-leashing went to
		const unclasps = () => commands("remove-leashing").map(([target]) => target);

		it("Unclasp Leash on someone clasped to us only undoes our clasp with them", () => {
			const b = join(2);
			listClasps(b, [1, 3]);
			listClasps(join(3), [2]);
			claspedTo(2, 4);
			expect(prereq("TargetHasClaspedLeash")(g.Player, b as never, neck as never)).toBe(true);
			action("UnclaspLeash")(b as never, {} as never, undefined);
			expect(clasps().map(c => c.with)).toEqual([4]);
			expect(unclasps()).toEqual([2]);
		});

		it("Unclasp Leash on ourselves undoes all of our clasps, and tells the other ends", () => {
			join(2);
			join(3);
			claspedTo(2, 3);
			action("UnclaspLeash")(g.Player, {} as never, undefined);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2, 3]);
		});

		it("Unclasp Leash on anyone else undoes all of theirs, at their end only", () => {
			const b = join(2);
			listClasps(b, [3, 4]);
			listClasps(join(3), [2, 4]);
			listClasps(join(4), [2, 3]);
			action("UnclaspLeash")(b as never, {} as never, undefined);
			expect(unclasps()).toEqual([2, 2]);
		});

		it("Unclasp Leash only counts clasps both ends list, so nobody can claim one", () => {
			const b = join(2);
			listClasps(b, [3]);
			listClasps(join(3), []);
			listClasps(join(4), [1]);
			expect(prereq("TargetHasClaspedLeash")(g.Player, b as never, neck as never)).toBe(false);
			expect(prereq("TargetHasClaspedLeash")(g.Player, g.ChatRoomCharacter.find((C: FixtureCharacter) => C.MemberNumber === 4), neck as never)).toBe(false);
		});

		it("Unclasp Leash only needs us to be allowed to touch the end it's used on", () => {
			const b = join(2);
			const c = join(3);
			listClasps(b, [3]);
			listClasps(c, [2]);
			g.ServerChatRoomGetAllowItem.mockImplementation((_: unknown, C: FixtureCharacter) => C.MemberNumber !== 3);
			expect(prereq("TargetHasClaspedLeash")(g.Player, b as never, neck as never)).toBe(true);
		});

		it("Unclasp Leash isn't offered on someone not clasped, or whose end is padlocked", () => {
			const stranger = join(2);
			const locked = join(3);
			wearLeash(locked, { lock: true });
			listClasps(locked, [4]);
			listClasps(join(4), [3]);
			expect(prereq("TargetHasClaspedLeash")(g.Player, stranger as never, neck as never)).toBe(false);
			expect(prereq("TargetHasClaspedLeash")(g.Player, locked as never, neck as never)).toBe(false);
		});

		it("with our own end padlocked we can't unclasp it, but can still reach the other end", () => {
			wearLeash(player(), { lock: true });
			const b = join(2);
			listClasps(b, [1]);
			claspedTo(2);
			expect(prereq("TargetHasClaspedLeash")(g.Player, g.Player, neck as never)).toBe(false);
			expect(prereq("TargetHasClaspedLeash")(g.Player, b as never, neck as never)).toBe(true);
		});
	});

	describe("padlocks and escaping", () => {
		it("a padlock on our own leash locks our end of every clasp, and nothing else", () => {
			wearLeash(player(), { lock: true });
			const clasp = new Leashing(2, 1, false, "leash");
			const grab = new Leashing(3, 3, false, "collar");
			expect(leashing.IsLocked(clasp)).toBe(true);
			expect(leashing.IsLocked(grab)).toBe(false);
			expect(leashing.CanEscape(clasp)).toBe(false);
			expect(leashing.CanEscape(grab)).toBe(true);
		});

		it("a padlock on a leash that isn't on our collar doesn't lock our end", () => {
			wearPelvisLeash(player()).Property = { Effect: ["Leash"], LockedBy: "MetalPadlock" };
			expect(leashing.IsLocked(new Leashing(2, 1, false, "leash"))).toBe(false);
			expect(leashing.IsLocked(new Leashing(2, 1, false, "leash", undefined, "ItemPelvis"))).toBe(true);
		});

		it("a padlock on the other end's leash doesn't lock ours", () => {
			wearLeash(join(2), { lock: true });
			expect(leashing.IsLocked(new Leashing(2, 1, false, "leash"))).toBe(false);
		});

		it("trying to escape a locked clasp says it's locked", () => {
			wearLeash(player(), { lock: true });
			join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			leashing.escapeAttempted = 0;
			leashing.TryEscape();
			expect(sent.local().some(html => html.includes("Your leash is locked"))).toBe(true);
		});

		it("escaping a clasp undoes it, and tells the other end", () => {
			join(2);
			claspedTo(2);
			escape();
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("the other end letting go undoes it here too", () => {
			const b = join(2);
			claspedTo(2);
			releasedBy(b);
			expect(clasps()).toEqual([]);
		});

		it("escaping someone's grab leaves a locked clasp with them alone, at both ends", () => {
			wearLeash(player(), { lock: true });
			join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(2, 2, false, "hand")];
			escape();
			expect(leashing.Pairings.map(p => p.Type)).toEqual(["leash"]);
			expect(releaseBeeps()).toEqual([]);
			expect(commands("escape").map(([target]) => target)).toEqual([2]);
		});

		it("someone escaping our grab doesn't undo a clasp with them", () => {
			const b = join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(2, 1, true, "arm")];
			leashing.IncomingEscape(b as never, 1);
			expect(leashing.Pairings.map(p => p.Type)).toEqual(["leash"]);
		});
	});

	describe("safewords", () => {
		it("LSCG's safeword undoes our clasps and drops a shared leash we wear", () => {
			join(2);
			claspedBy(join(3), 2, true);
			leashing.safeword();
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
			expect(g.InventoryRemove).toHaveBeenCalledWith(g.Player, "ItemNeckRestraints");
		});

		it("but a padlocked shared leash stays on", () => {
			wearLeash(player(), { lock: true });
			join(2);
			claspedBy(join(3), 2, true);
			leashing.safeword();
			expect(g.InventoryRemove).not.toHaveBeenCalled();
		});

		it("BC's safeword undoes our clasps", () => {
			join(2);
			claspedBy(join(3), 2);
			g.ChatRoomSafewordRelease();
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});
	});

	describe("leaving, walking and being pulled", () => {
		it("we can't leave while clasped to someone who can't walk or is shut in", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			const b = join(2);
			claspedTo(2);
			expect(g.ChatRoomCanLeave()).toBe(true);
			for (const effect of ["Freeze", "Tethered", "Mounted", "Enclose", "OneWayEnclose"]) {
				stuck(b, effect);
				expect(g.ChatRoomCanLeave()).toBe(false);
			}
		});

		it("nor while anyone further along, in a chain or a circle, is", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			const [b, c, d, e] = [join(2), join(3), join(4), join(5)];
			listClasps(b, [1, 3]);
			listClasps(c, [2, 4]);
			listClasps(d, [3, 5]);
			listClasps(e, [4]);
			claspedTo(2);
			expect(g.ChatRoomCanLeave()).toBe(true);
			stuck(e);
			expect(g.ChatRoomCanLeave()).toBe(false);
			// Round in a circle too
			listClasps(e, [4, 1]);
			claspedTo(2, 5);
			expect(g.ChatRoomCanLeave()).toBe(false);
			// Only links both ends list count
			listClasps(d, [3]);
			listClasps(e, [4]);
			claspedTo(2);
			expect(g.ChatRoomCanLeave()).toBe(true);
		});

		it("someone stuck who only grabbed us doesn't keep us here", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			stuck(join(2));
			leashing.Pairings = [new Leashing(2, 2, true, "collar")];
			expect(g.ChatRoomCanLeave()).toBe(true);
		});

		it("a grab of ours that stops us walking doesn't hold the others in place", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			const b = join(2);
			listClasps(b, [1]);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 3, false, "collar")];
			expect(g.Player.CanWalk()).toBe(false);
			expect(leashing.HeldInPlace(b as never)).toBe(false);
		});

		it("held in place, nothing but our clasps can pull us, like being tethered", () => {
			listClasps(join(2), [1]);
			claspedTo(2);
			stuck(player());
			leashing.Pairings.push(new Leashing(3, 3, false, "arm"));
			expect(g.ChatRoomCanBeLeashedBy(2, g.Player)).toBe(true);
			expect(g.ChatRoomCanBeLeashedBy(3, g.Player)).toBe(false);
			expect(g.ChatRoomCanBeLeashedBy(4, g.Player)).toBe(false);
		});

		it("someone else held in place can't be leashed by us either, so vanilla doesn't offer to hold it", () => {
			const b = join(2);
			const c = join(3);
			listClasps(b, [3]);
			listClasps(c, [2]);
			original("ChatRoomCanBeLeashedBy").mockReturnValue(true);
			expect(g.ChatRoomCanBeLeashedBy(1, b)).toBe(true);
			stuck(c);
			expect(g.ChatRoomCanBeLeashedBy(1, b)).toBe(false);
		});

		it("but Clasp Leash can still clasp onto them", () => {
			const b = join(2);
			const c = join(3);
			listClasps(b, [3]);
			listClasps(c, [2]);
			stuck(c);
			original("ChatRoomCanBeLeashedBy").mockReturnValue(true);
			g.ChatRoomCanBeLeashed.mockImplementation((C: FixtureCharacter) => g.ChatRoomCanBeLeashedBy(1, C));
			expect(leashing.CanClaspAt(join(4) as never, b as never)).toBe(true);
		});

		it("a clasp doesn't stop us walking, like holding hands, while a collar grab does", () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			expect(g.Player.CanWalk()).toBe(true);
			leashing.Pairings = [new Leashing(2, 2, false, "collar")];
			expect(g.Player.CanWalk()).toBe(false);
		});

		it("the player we're clasped to may pull us; a stranger may not", () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			expect(g.ChatRoomCanBeLeashedBy(2, g.Player)).toBe(true);
			original("ChatRoomCanBeLeashedBy").mockReturnValue(false);
			expect(g.ChatRoomCanBeLeashedBy(4, g.Player)).not.toBe(true);
		});

		it("not in a room that blocks leashing", () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			g.ChatRoomData.BlockCategory = ["Leashing"];
			original("ChatRoomCanBeLeashedBy").mockReturnValue(false);
			expect(g.ChatRoomCanBeLeashedBy(2, g.Player)).not.toBe(true);
		});

		it("leaving names the player we lead out by the leash", () => {
			join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			g.ChatRoomLeave();
			expect(sent.actions()).toEqual([expect.stringContaining("leads PlayerB out of the room by the leash.")]);
		});
	});

	describe("following through rooms", () => {
		const beep = (from: number, room: string) => g.ServerHandleLeashBeep({ MemberNumber: from, ChatRoomName: room });

		// The room we're following into lives on from the last test until a follow ends, so end one
		beforeEach(() => g.ChatRoomBreakLeash(null));
		// The game following a pull, which starts by leaving the room
		const following = () => original("ServerHandleLeashBeep").mockImplementation(async () => {
			g.ChatRoomData.Name = undefined;
		});

		it("a second pull into the room we're already following into is ignored until we've synced there", async () => {
			following();
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
			await beep(2, "Elsewhere");
			await beep(3, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledOnce();
			g.ChatRoomSync({ Name: "Elsewhere" });
			await beep(3, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledTimes(2);
		});

		it("a pull the game ignores for our leashing being off doesn't hold up the next one into that room", async () => {
			join(4);
			g.ChatRoomLeashPlayer = 4;
			g.Player.OnlineSharedSettings = { AllowPlayerLeashing: false };
			await beep(4, "Elsewhere");
			g.Player.OnlineSharedSettings = { AllowPlayerLeashing: true };
			await beep(4, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledTimes(2);
		});

		it("a follow that fails once we've left for the lobby still undoes the clasp", async () => {
			join(2);
			claspedTo(2);
			original("ServerHandleLeashBeep").mockImplementation(async () => {
				g.ServerPlayerIsInChatRoom.mockReturnValue(false);
				g.ChatRoomBreakLeash("RoomFull");
			});
			try {
				await beep(2, "Elsewhere");
			} finally {
				g.ServerPlayerIsInChatRoom.mockReturnValue(true);
			}
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("held in place, a clasp partner who got out anyway lets go of us instead of pulling us after them", async () => {
			const c = join(3);
			listClasps(c, [1]);
			stuck(c);
			claspedTo(2, 3);
			await beep(2, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).not.toHaveBeenCalled();
			expect(clasps().map(p => p.with)).toEqual([3]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});

		it("a failed follow stops ignoring that room", async () => {
			following();
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			await beep(2, "Elsewhere");
			g.ChatRoomBreakLeash(null);
			await beep(2, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledTimes(2);
		});

		it("on a map, one pull a frame: the vanilla leash first, else the first clasp out of reach", () => {
			const at = (C: FixtureCharacter, X: number, Y: number) => {
				(C as never as { MapData: object }).MapData = { Pos: { X, Y } };
			};
			at(player(), 10, 10);
			at(join(2), 20, 10);
			at(join(3), 0, 10);
			at(join(4), 10, 20);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
			const pulledTo: (number | null)[] = [];
			original("ChatRoomMapViewLeash").mockImplementation(() => {
				pulledTo.push(g.ChatRoomLeashPlayer);
				const holder = g.ChatRoomCharacter.find((C: FixtureCharacter) => C.MemberNumber === g.ChatRoomLeashPlayer);
				if (holder) at(player(), holder.MapData.Pos.X - 2, holder.MapData.Pos.Y);
			});

			g.ChatRoomMapViewLeash();
			expect(pulledTo).toEqual([null, 2]);

			pulledTo.length = 0;
			g.ChatRoomLeashPlayer = 4;
			g.ChatRoomMapViewLeash();
			expect(pulledTo).toEqual([4]);

			// One that can't reach us leaves it to the next
			pulledTo.length = 0;
			g.ChatRoomLeashPlayer = null;
			at(player(), 10, 10);
			original("ChatRoomMapViewLeash").mockImplementation(() => {
				pulledTo.push(g.ChatRoomLeashPlayer);
				if (g.ChatRoomLeashPlayer === 3) at(player(), 2, 10);
			});
			g.ChatRoomMapViewLeash();
			expect(pulledTo).toEqual([null, 2, 3]);

			// Nobody pulls us about by a clasp while we're stuck in place
			pulledTo.length = 0;
			at(player(), 10, 10);
			stuck(player());
			g.ChatRoomMapViewLeash();
			expect(pulledTo).toEqual([null]);
		});
	});

	describe("how our leash looks", () => {
		it("vanilla shows it held by whoever we're clasped to, while nobody holds it the vanilla way", () => {
			const seen: unknown[] = [];
			original("CharacterRefreshLeash").mockImplementation(() => seen.push(g.ChatRoomLeashPlayer));
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			g.CharacterRefreshLeash(g.Player);
			g.ChatRoomLeashPlayer = 4;
			g.CharacterRefreshLeash(g.Player);
			g.ChatRoomLeashPlayer = null;
			g.CharacterRefreshLeash(join(3));
			expect(seen).toEqual([2, 4, null]);
			expect(g.ChatRoomLeashPlayer).toBeNull();
		});

		it("a leash swapped in while clasped is shown held again", () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			g.CharacterRefresh(g.Player);
			expect(original("CharacterRefreshLeash")).toHaveBeenCalledOnce();
			wearLeash(player(), { held: true });
			g.CharacterRefresh(g.Player);
			expect(original("CharacterRefreshLeash")).toHaveBeenCalledOnce();
		});

		it("nothing changes without a clasp", () => {
			g.CharacterRefresh(g.Player);
			expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
		});

		it("not refreshed over and over: it's only redone when it's wrong, as each one sends our whole appearance", () => {
			wearLeash(player(), { held: true });
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "HempRope", AllowEffect: ["IsLeashed"] })));
			claspedTo(2);
			g.CharacterRefresh(g.Player);
			g.CharacterRefresh(g.Player);
			expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
			// Shut in a box, it's not held (vanilla won't leash someone shut in), and stays that way
			wearLeash(player());
			stuck(player(), "Enclose");
			original("ChatRoomCanBeLeashedBy").mockReturnValue(false);
			g.CharacterRefresh(g.Player);
			g.CharacterRefresh(g.Player);
			expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
		});

		it("whoever we're clasped to isn't checked on every refresh, as BCX says so in chat each time it says no", () => {
			let asked = 0;
			const bcx = bcModSDK.registerMod({ name: "BCXish", fullName: "BCXish", version: "1" });
			bcx.hookFunction("ChatRoomCanBeLeashedBy", 4, () => {
				asked++;
				return false;
			});
			try {
				wearLeash(player(), { held: true });
				claspedTo(2);
				for (let i = 0; i < 5; i++)
					g.CharacterRefresh(g.Player);
				expect(asked).toBe(1);
			} finally {
				bcx.unload();
			}
		});

		it("whose clasp icons we draw on someone: who they list that lists them back", () => {
			const b = join(2);
			const c = join(3);
			const d = join(4);
			const stranger = join(5);
			listClasps(b, [1]);
			listClasps(c, [4, 5]);
			listClasps(d, [3]);
			claspedTo(2);
			expect(leashing.ClaspPartners(b as never)).toEqual([1]);
			expect(leashing.ClaspPartners(c as never)).toEqual([4]);
			expect(leashing.ClaspPartners(d as never)).toEqual([3]);
			expect(leashing.ClaspPartners(stranger as never)).toEqual([]);
		});
	});
});
