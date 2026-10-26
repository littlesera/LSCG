// Every LSCG command can arrive from any player, with anything in it: nothing makes the sender use LSCG's own UI. Here
// a stranger -- in the room, but not someone the player's item permissions let touch them, not paired with them, not
// their owner, lover or on any list -- sends each command, by chat and by beep, with hostile arguments. None of them may
// change the player's settings, grab or pair them, touch their arousal, or put the sender's markup into their chat.
// A new command that skips its sender check fails here.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { LeashingModule } from "Modules/leashing";
import { MagicModule } from "Modules/magic";
import { CursedItemModule } from "Modules/cursed-item";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { MiscModule } from "Modules/misc";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { receive, sent } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

const COMMANDS = [
	"debug", "grab", "release", "remote", "escape", "collar-tighten", "collar-loosen", "collar-stats", "photo", "spell", "spell-teach",
	"pair", "unpair", "pairing-update", "get-spell", "get-spell-response", "get-suggestions", "get-suggestions-response", "set-suggestions",
	"add-leashing", "remove-leashing", "craft-share", "splat", "swap-ask", "swap-respond", "cursed-item-request", "cursed-item-response",
	"h5-execute", "consent-offer", "consent-answer", "consent-force", "consent-force-result", "speech-settings-set", "speech-settings-get",
	"speech-settings-response",
] as const;

const MARKUP = `<img src=x onerror="window.__lscgPwned=1">`;

describe("incoming commands from someone who may not touch the player", () => {
	let leashing: LeashingModule;
	let states: StateModule;
	let booted: { init(): void }[];
	let stranger: FixtureCharacter;
	let before: string;

	beforeAll(() => {
		booted = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(), new CollarModule(), new InjectorModule(),
			new HypnoModule(), new StateModule(), new LeashingModule(), new MagicModule(), new CursedItemModule(), new OutfitCollectionModule(),
			new MiscModule(),
		);
		states = booted[7] as StateModule;
		leashing = booted[8] as LeashingModule;
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", ArousalSettings: { Progress: 10 }, LSCG: { GlobalModule: { enabled: true } } });
		for (const m of booted) m.init();
		// Everything that takes remote input is switched on and open to remote access -- the sender still mustn't get in
		const L = player().LSCG;
		for (const key of ["HypnoModule", "CollarModule", "MagicModule", "InjectorModule", "LeashingModule", "CursedItemModule", "MiscModule"])
			Object.assign(L[key], { enabled: true, remoteAccess: true, breathplayEnabled: true, Vulnerable: true, allowSuggestions: true });
		// Magic goes by its own whitelist rather than item permissions: this player has it on
		L.MagicModule.requireWhitelist = true;
		leashing.Pairings = [];
		addToRoom(player());
		stranger = addToRoom(makeCharacter({ MemberNumber: 666, Nickname: "Stranger", LSCG: { GlobalModule: { enabled: true } } }));
		// Item permissions don't let the stranger touch the player
		g.ServerChatRoomGetAllowItem.mockImplementation((source: { MemberNumber?: number }) => source?.MemberNumber !== 666);
		player().BlackList = [];
		g.__lscgPwned = undefined;
		// A state's saved entry is created the first time it's read; that alone isn't a change
		states.States.forEach(st => st.config);
		before = JSON.stringify(player().LSCG);
	});

	afterEach(() => {
		g.ServerChatRoomGetAllowItem.mockImplementation(() => true);
		vi.clearAllTimers();
	});

	/** Every argument any command reads, set to something hostile. */
	function hostileArgs(): { name: string; value: unknown }[] {
		const settings = JSON.parse(JSON.stringify(player().LSCG)) as Record<string, Record<string, unknown>>;
		for (const module of Object.values(settings))
			if (module && typeof module === "object") Object.assign(module, { remoteAccess: false, enabled: false, locked: true, overrideWords: MARKUP, tightTrigger: MARKUP });
		return [
			{ name: "type", value: "hair" }, { name: "pairedMember", value: 666 }, { name: "isSource", value: false },
			{ name: "progress", value: 100 }, { name: "settings", value: settings }, { name: "id", value: 1 }, { name: "target", value: 1 },
			{ name: "craft", value: { Item: "Charm", Lock: MARKUP, Name: MARKUP, Description: MARKUP } },
			{ name: "suggestions", value: [{ id: "x", name: MARKUP, trigger: "go", instructions: [] }] }, { name: "removed", value: [] },
			{ name: "spell", value: { Name: MARKUP, Effects: [], AllowPotion: true } }, { name: "item", value: { Group: "ItemArms", Name: "Rope", Craft: { Name: MARKUP } } },
			{ name: "answer", value: "accepted" }, { name: "success", value: true }, { name: "flow", value: "nope" },
			{ name: "itemName", value: MARKUP }, { name: "originator", value: 1 }, { name: "", value: MARKUP },
		];
	}

	function message(name: string): LSCGMessageModel {
		return {
			IsLSCG: true, type: "command", reply: false, target: 1, version: "v0",
			settings: hostileArgs().find(a => a.name === "settings")!.value,
			command: { name, args: [{ name: "x", value: MARKUP }, ...hostileArgs()] },
		} as unknown as LSCGMessageModel;
	}

	for (const name of COMMANDS) {
		it(`"${name}" changes nothing about the player`, () => {
			// Pair up the paired states' arousal checks: the stranger isn't paired with us
			receive.hidden(stranger, message(name));
			receive.beep(stranger, message(name));
			vi.advanceTimersByTime(10_000);

			expect(JSON.parse(JSON.stringify(player().LSCG))).toEqual(JSON.parse(before));
			expect(leashing.Pairings.filter(p => !p.IsSource)).toEqual([]);
			expect(player().ArousalSettings.Progress).toBe(10);
			expect(g.ActivityOrgasmPrepare).not.toHaveBeenCalled();
			expect(sent.local().join("\n")).not.toContain("onerror=");
			expect(document.body.innerHTML).not.toContain("onerror=");
			expect(states.States.filter(s => s.Active)).toEqual([]);
		});
	}

	it("a refused grab tells the grabber to let go", () => {
		receive.hidden(stranger, message("grab"));
		expect(sent.beeps().some(b => b.target === 666 && b.message.command?.name === "release")).toBe(true);
	});

	it("someone the player's permissions allow can still grab them", () => {
		const friend = addToRoom(makeCharacter({ MemberNumber: 777 }));
		receive.command(friend, "grab", [{ name: "type", value: "hair" }]);
		expect(leashing.Pairings).toMatchObject([{ PairedMember: 777, Type: "hair", IsSource: false }]);
	});

	it("only a partner's pairing update reaches a paired state", () => {
		const partner = addToRoom(makeCharacter({ MemberNumber: 777 }));
		states.ArousalPairedState.Pairings = [{ PairedMember: 777, PairedBy: 777, IsSource: false }] as never;
		receive.command(stranger, "pairing-update", [{ name: "type", value: "arousal-paired" }, { name: "progress", value: 100 }]);
		expect(player().ArousalSettings.Progress).toBe(10);
		receive.command(partner, "pairing-update", [{ name: "type", value: "arousal-paired" }, { name: "progress", value: 55 }]);
		expect(player().ArousalSettings.Progress).toBe(55);
		receive.command(stranger, "unpair", [{ name: "type", value: "arousal-paired" }]);
		expect(states.ArousalPairedState.Pairings).toHaveLength(1);
		receive.command(partner, "unpair", [{ name: "type", value: "arousal-paired" }]);
		expect(states.ArousalPairedState.Pairings).toHaveLength(0);
	});
});
