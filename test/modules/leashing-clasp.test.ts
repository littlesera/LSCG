// Clasped leashes: someone holding a leash the vanilla way clasps it to another player's leash or collar, and from
// then on each of the two pulls the other along.
//
// Player (member 1) is one end of a clasp, or the one who made it. Clasps arrive like any LSCG command, so most of
// these go through CoreModule's real routing with receive.command().
import { afterEach, beforeAll, beforeEach, describe, expect, it, type Mock } from "vitest";
import bcModSDK from "bondage-club-mod-sdk";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { Leashing, LeashingModule } from "Modules/leashing";
import { registerExtension } from "api/extensions";
import { addToRoom, boot, currentBcLite, player, resetWorld } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureAsset, type FixtureCharacter, type FixtureItem } from "../harness/fixtures";
import { advance, useFakeTimers, useRealTimers } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

const lscgOn = () => ({ GlobalModule: { enabled: true }, LeashingModule: { enabled: true } });

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
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "PlayerA", LSCG: lscgOn() });
		leashing.Pairings = [];
		leashing.ClaspedLeashes = [];
		leashing.leashLookQueued = false;
		g.Player.OnlineSharedSettings = { AllowPlayerLeashing: true };
		g.ChatRoomLeashList = [];
		g.ChatRoomLeashPlayer = null;
		g.ChatRoomData.BlockCategory = [];
		g.ChatRoomData.Name = "Here";
		g.ServerChatRoomGetAllowItem.mockImplementation(() => true);
		g.ChatRoomCanBeLeashed.mockImplementation(() => true);
		const restraints = makeGroup({ Name: "ItemNeckRestraints" });
		collarLeash = makeAsset(restraints, { Name: "CollarLeash", AllowEffect: ["IsLeashed"] });
		chainLeash = makeAsset(restraints, { Name: "ChainLeash" });
		other = makeAsset(makeGroup({ Name: "ItemDevices" }), { Name: "WoodenBox" });
		collar = makeAsset(makeGroup({ Name: "ItemNeck" }), { Name: "LeatherCollar" });
		wearLeash(player());
	});

	afterEach(() => {
		for (const name of ["ServerHandleLeashBeep", "ChatRoomMapViewLeash", "CharacterRefreshLeash", "ChatRoomCanLeave"])
			original(name).mockReset();
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
			leashingOff.LSCG = { GlobalModule: { enabled: true }, LeashingModule: { enabled: false } };
			const lscgOff = join(5);
			lscgOff.LSCG = { GlobalModule: { enabled: false }, LeashingModule: { enabled: true } };
			expect([on, without, leashingOff, lscgOff].map(C => leashing.CanClaspWith(C as never))).toEqual([true, false, false, false]);
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
		it("leash to leash: we let go quietly, both ends get the clasp, and we remember making it", () => {
			const b = join(2);
			const c = join(3);
			g.ChatRoomLeashList = [2];

			expect(leashing.ClaspLeash(b as never, c as never)).toBe(false);

			expect(gameHidden()).toEqual([["StopHoldLeash", 2]]);
			expect(sent.raw().some(([, data]) => data?.Type === "Action" && data?.Content === "StopHoldLeash")).toBe(false);
			expect(g.ChatRoomLeashList).toEqual([]);
			expect(commands("add-leashing")).toEqual([
				[2, "add-leashing", leashArgs(3, [{ name: "shared", value: false }])],
				[3, "add-leashing", leashArgs(2, [{ name: "shared", value: false }])],
			]);
			expect(leashing.ClaspedLeashes).toEqual([{ a: 2, b: 3 }]);
			expect(clasps()).toEqual([]);
		});

		it("clasping the same two again keeps one record", () => {
			const b = join(2);
			const c = join(3);
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, c as never);
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, c as never);
			expect(leashing.ClaspedLeashes).toEqual([{ a: 2, b: 3 }]);
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
				.toEqual([[2, true], [3, true]]);
		});

		it("the end copies the held leash and its colour", () => {
			const b = join(2);
			wearLeash(b, { asset: chainLeash, color: "#AA0000" });
			const c = join(3, { leash: false });
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, c as never);
			expect(g.InventoryWear).toHaveBeenCalledWith(c, "ChainLeash", "ItemNeckRestraints", "#AA0000", null, null, expect.anything());
		});

		it("nothing to clasp when the leash we hold isn't on their collar, like a pelvis leash held through the dialog", () => {
			const b = join(2, { leash: false });
			wearPelvisLeash(b);
			const c = join(3, { leash: false });
			g.ChatRoomLeashList = [2];
			expect(leashing.HeldLeash(c as never)).toBeNull();
			activities.CustomActionCallbacks.get("LSCG_ClaspLeash")?.(c as never, {} as never, undefined);
			expect(g.InventoryWear).not.toHaveBeenCalled();
			expect(commands("add-leashing")).toEqual([]);
			// Still held, so they can let go of it through the dialog
			expect(g.ChatRoomLeashList).toEqual([2]);
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

		it("onto ourselves: our end is added here, the other end is told, and there's nothing to remember", () => {
			const b = join(2);
			g.ChatRoomLeashList = [2];
			leashing.ClaspLeash(b as never, g.Player);
			expect(clasps()).toEqual([{ with: 2, by: 1, shared: false }]);
			expect(commands("add-leashing")).toEqual([[2, "add-leashing", leashArgs(1, [{ name: "shared", value: false }])]]);
			expect(leashing.ClaspedLeashes).toEqual([]);
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

		it("not from someone without item permission on us", () => {
			join(2);
			const c = join(3);
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			claspedBy(c, 2);
			expect(clasps()).toEqual([]);
		});

		it("not while our leashing is off, whatever the clasper last saw of our settings", () => {
			join(2);
			const c = join(3);
			g.Player.LSCG.LeashingModule.enabled = false;
			claspedBy(c, 2);
			expect(clasps()).toEqual([]);
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
			join(2);
			const c = join(3);
			join(4);
			g.ChatRoomLeashPlayer = 4;
			claspedBy(c, 2);
			expect(gameHidden()).toContainEqual(["RemoveLeash", 4]);
			expect(g.ChatRoomLeashPlayer).toBeNull();
			expect(original("CharacterRefreshLeash")).toHaveBeenCalled();
		});

		it("is dropped at both ends if we turn out to have no leash on", () => {
			join(2);
			const c = join(3);
			player().Appearance = [];
			claspedBy(c, 2);
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
		});
	});

	describe("a clasp coming undone", () => {
		it("tells whoever made it", () => {
			join(2);
			const c = join(3);
			claspedBy(c, 2);
			leashing.RemoveLeashings(2, false, "leash");
			expect(commands("remove-leashing")).toEqual([[3, "remove-leashing", [
				{ name: "pairedMember", value: 2 },
				{ name: "type", value: "leash" },
				{ name: "ended", value: true },
			]]]);
		});

		it("doesn't tell anyone when it was made by the other end, or its maker has gone", () => {
			const b = join(2);
			claspedBy(b, 2);
			leashing.RemoveLeashings(2, false, "leash");
			const c = join(3);
			claspedBy(c, 2);
			g.ChatRoomCharacter = g.ChatRoomCharacter.filter((C: FixtureCharacter) => C.MemberNumber !== 3);
			leashing.RemoveLeashings(2, false, "leash");
			expect(commands("remove-leashing")).toEqual([]);
		});

		it("the maker forgets it whichever end says so, without needing permission", () => {
			const b = join(2);
			const c = join(3);
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			leashing.ClaspedLeashes = [{ a: 2, b: 3 }, { a: 2, b: 4 }];
			receive.command(c, "remove-leashing", [{ name: "pairedMember", value: 2 }, { name: "type", value: "leash" }, { name: "ended", value: true }]);
			expect(leashing.ClaspedLeashes).toEqual([{ a: 2, b: 4 }]);
			leashing.ClaspedLeashes = [{ a: 2, b: 3 }];
			receive.command(b, "remove-leashing", [{ name: "pairedMember", value: 3 }, { name: "type", value: "leash" }, { name: "ended", value: true }]);
			expect(leashing.ClaspedLeashes).toEqual([]);
		});

		it("several at once refresh our leash's look just once, after they're gone", () => {
			useFakeTimers();
			try {
				join(2);
				join(3);
				leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
				leashing.BreakClasps();
				expect(original("CharacterRefreshLeash")).not.toHaveBeenCalled();
				advance(1);
				expect(original("CharacterRefreshLeash")).toHaveBeenCalledOnce();
			} finally {
				useRealTimers();
			}
		});

		it("the other end letting go keeps the shared leash on our collar", () => {
			const b = join(2);
			claspedBy(join(3), 2, true);
			receive.command(b, "remove-leashing", leashArgs(2, [{ name: "at", value: 2 }]));
			expect(clasps()).toEqual([]);
			expect(g.InventoryRemove).not.toHaveBeenCalled();
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

		it("only our collar leash is our end: a pelvis leash doesn't take a clasp, or keep one when the collar leash comes off", () => {
			player().Appearance = [];
			wear(player(), makeItem(collar));
			wearPelvisLeash(player());
			join(2);
			claspedBy(join(3), 2);
			expect(clasps()).toEqual([]);

			wearLeash(player());
			claspedBy(join(4), 2);
			expect(clasps()).toEqual([{ with: 2, by: 4, shared: false }]);
			player().Appearance = player().Appearance.filter(item => item.Asset.Group.Name !== "ItemNeckRestraints");
			g.CharacterRefresh(g.Player);
			expect(clasps()).toEqual([]);
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
			const canClasp = (C: FixtureCharacter) => prereq("CanClaspLeash")(g.Player, C as never, null as never);
			expect(canClasp(c)).toBe(false);
			g.ChatRoomLeashList = [2];
			expect(canClasp(c)).toBe(true);
			expect(canClasp(noLSCG)).toBe(false);
			g.ChatRoomLeashList = [2, 3];
			expect(canClasp(join(5))).toBe(false);
		});

		it("Clasp Leash can't reach a leash slot holding something else", () => {
			join(2);
			const c = join(3);
			wear(c, makeItem(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "CollarChainShort" })));
			g.ChatRoomLeashList = [2];
			expect(prereq("CanClaspLeash")(g.Player, c as never, null as never)).toBe(false);
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

		it("Unclasp Leash on someone clasped to us only undoes our clasp with them", () => {
			join(2);
			join(3);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
			expect(prereq("TargetHasClaspedLeash")(g.Player, join(2) as never, null as never)).toBe(true);
			action("UnclaspLeash")(g.ChatRoomCharacter.find((C: FixtureCharacter) => C.MemberNumber === 2), {} as never, undefined);
			expect(clasps().map(c => c.with)).toEqual([3]);
			expect(commands("remove-leashing").map(([target]) => target)).toEqual([2]);
		});

		it("Unclasp Leash on ourselves undoes all of our clasps", () => {
			join(2);
			join(3);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
			action("UnclaspLeash")(g.Player, {} as never, undefined);
			expect(clasps()).toEqual([]);
			expect(commands("remove-leashing").map(([target]) => target)).toEqual([2, 3]);
		});

		it("Unclasp Leash on someone we clasped to others undoes all of theirs we made, and only those", () => {
			const b = join(2);
			join(3);
			join(4);
			leashing.ClaspedLeashes = [{ a: 2, b: 3 }, { a: 2, b: 4 }, { a: 3, b: 4 }];
			action("UnclaspLeash")(b as never, {} as never, undefined);
			expect(leashing.ClaspedLeashes).toEqual([{ a: 3, b: 4 }]);
			expect(commands("remove-leashing").map(([target, , args]) => [target, (args as { name: string; value: unknown }[]).find(a => a.name === "at")?.value]))
				.toEqual([[2, 2], [3, 2], [2, 2], [4, 2]]);
		});

		it("Unclasp Leash isn't offered on someone not clasped, or whose end is padlocked", () => {
			const stranger = join(2);
			const locked = join(3);
			wearLeash(locked, { lock: true });
			leashing.ClaspedLeashes = [{ a: 3, b: 4 }];
			expect(prereq("TargetHasClaspedLeash")(g.Player, stranger as never, null as never)).toBe(false);
			expect(prereq("TargetHasClaspedLeash")(g.Player, locked as never, null as never)).toBe(false);
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

		it("the other end escaping our clasp undoes it here too", () => {
			const b = join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			leashing.IncomingEscape(b as never, 1);
			expect(clasps()).toEqual([]);
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

		it("BC's safeword undoes our clasps and tells whoever made them", () => {
			join(2);
			claspedBy(join(3), 2);
			g.ChatRoomSafewordRelease();
			expect(clasps()).toEqual([]);
			expect(releaseBeeps().map(([target]) => target)).toEqual([2]);
			expect(commands("remove-leashing").map(([target]) => target)).toEqual([3]);
		});
	});

	describe("leaving, walking and being pulled", () => {
		it("we can't leave while clasped to someone who can't walk or is shut in", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			const b = join(2);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			expect(g.ChatRoomCanLeave()).toBe(true);
			b.flags.canWalk = false;
			expect(g.ChatRoomCanLeave()).toBe(false);
			b.flags.canWalk = true;
			for (const effect of ["Enclose", "OneWayEnclose"]) {
				wear(b, makeItem(other, { Property: { Effect: [effect] } }));
				expect(g.ChatRoomCanLeave()).toBe(false);
			}
		});

		it("someone stuck who only grabbed us doesn't keep us here", () => {
			original("ChatRoomCanLeave").mockReturnValue(true);
			join(2).flags.canWalk = false;
			leashing.Pairings = [new Leashing(2, 2, true, "collar")];
			expect(g.ChatRoomCanLeave()).toBe(true);
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
			expect(g.ChatRoomCanBeLeashedBy(4, g.Player)).not.toBe(true);
		});

		it("not in a room that blocks leashing", () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			g.ChatRoomData.BlockCategory = ["Leashing"];
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

		it("a second pull into the room we're already following into is ignored until we've synced there", async () => {
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 1, false, "leash")];
			await beep(2, "Elsewhere");
			await beep(3, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledOnce();
			g.ChatRoomSync({ Name: "Elsewhere" });
			await beep(3, "Elsewhere");
			expect(original("ServerHandleLeashBeep")).toHaveBeenCalledTimes(2);
		});

		it("a failed follow stops ignoring that room", async () => {
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

		it("whose clasp icon we draw on someone: theirs with us, or the other end of one we made", () => {
			const b = join(2);
			const c = join(3);
			const d = join(4);
			const stranger = join(5);
			leashing.Pairings = [new Leashing(2, 1, false, "leash")];
			leashing.ClaspedLeashes = [{ a: 3, b: 4 }];
			expect(leashing.ClaspPartnerOf(b as never)).toBe(g.Player);
			expect(leashing.ClaspPartnerOf(c as never)).toBe(d);
			expect(leashing.ClaspPartnerOf(d as never)).toBe(c);
			expect(leashing.ClaspPartnerOf(stranger as never)).toBeNull();
		});
	});
});
