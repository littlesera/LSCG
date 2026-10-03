// PairedBaseState's generic pairing mechanics (DoPair/RespondToPairing/AddPairing dedupe/
// RemovePairing/RemovePairingsByMember/auto-recover-when-empty/unpair beeps), exercised
// through OrgasmSiphonedState (the simplest concrete subclass -- it adds only Update() and
// an ActivityOrgasmStart hook, no Recover()/pairing overrides of its own). ArousalPairedState
// gets its own tests below for what it specifically adds (Update, PingArousal, Tick, the
// Recover() emote).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { boot, resetWorld, player } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("PairedBaseState (via OrgasmSiphonedState)", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	function beepsTo(memberNumber: number) {
		return sent.beeps().filter(b => b.target === memberNumber);
	}

	it("DoPair() records a source pairing and activates", () => {
		const target = makeCharacter({ MemberNumber: 2 });
		const matchmaker = makeCharacter({ MemberNumber: 3 });
		states.OrgasmSiphonedState.DoPair(target as never, matchmaker as never, 5000);
		expect(states.OrgasmSiphonedState.Active).toBe(true);
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 2, PairedBy: 3, IsSource: true }]);
		expect(states.settings.states.find(s => s.type === "orgasm-siphoned")?.duration).toBe(5000);
	});

	it("RespondToPairing() records a non-source pairing, activates, and returns the pairing", () => {
		const source = makeCharacter({ MemberNumber: 2 });
		const matchmaker = makeCharacter({ MemberNumber: 3 });
		const pairing = states.OrgasmSiphonedState.RespondToPairing(source as never, matchmaker as never, 5000);
		expect(pairing).toEqual({ PairedMember: 2, PairedBy: 3, IsSource: false });
		expect(states.OrgasmSiphonedState.Active).toBe(true);
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 2, PairedBy: 3, IsSource: false }]);
	});

	it("AddPairing() with the same PairedMember updates the existing entry instead of duplicating it", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 3, IsSource: true });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 4, IsSource: false });
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 2, PairedBy: 4, IsSource: false }]);
	});

	it("RemovePairing() drops just the matching member, keeping the state active if others remain", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 3, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.RemovePairing(2);
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 3, PairedBy: 1, IsSource: true }]);
		expect(states.OrgasmSiphonedState.Active).toBe(true);
	});

	it("RemovePairing() of the last pairing auto-recovers the state", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.RemovePairing(2);
		expect(states.OrgasmSiphonedState.Active).toBe(false);
	});

	it("RemovePairingsByMember() drops every pairing a given matchmaker made", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 9, IsSource: true });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 3, PairedBy: 9, IsSource: true });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 4, PairedBy: 10, IsSource: true });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.RemovePairingsByMember(9);
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 4, PairedBy: 10, IsSource: true }]);
	});

	it("Recover() sends an 'unpair' beep to every paired member and clears the pairings", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 3, PairedBy: 1, IsSource: false });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.Recover();
		expect(states.OrgasmSiphonedState.Active).toBe(false);
		expect(states.OrgasmSiphonedState.Pairings).toEqual([]);
		expect(beepsTo(2)[0]?.message.command).toEqual({ name: "unpair", args: [{ name: "type", value: "orgasm-siphoned" }] });
		expect(beepsTo(3)[0]?.message.command).toEqual({ name: "unpair", args: [{ name: "type", value: "orgasm-siphoned" }] });
	});

	it("Recover() never sends the generic 'wears off' emote, even when passed emote=true", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.Recover(true);
		expect(sent.actions()).toEqual([]);
	});

	it("ClearAllPairings() is equivalent to Recover()", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.Activate(1);
		states.OrgasmSiphonedState.ClearAllPairings();
		expect(states.OrgasmSiphonedState.Active).toBe(false);
		expect(beepsTo(2)).toHaveLength(1);
	});

	it("NotifyUnpair() sends a standalone 'unpair' beep without touching the pairings list", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.OrgasmSiphonedState.NotifyUnpair(2);
		expect(beepsTo(2)[0]?.message.command).toEqual({ name: "unpair", args: [{ name: "type", value: "orgasm-siphoned" }] });
		expect(states.OrgasmSiphonedState.Pairings).toEqual([{ PairedMember: 2, PairedBy: 1, IsSource: true }]);
	});
});

describe("OrgasmSiphonedState", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		globalThis.ActivityOrgasmRuined = false;
	});

	it("Update() forces the player's arousal to 100 and prepares an orgasm", () => {
		player().ArousalSettings = { Progress: 10 } as never;
		states.OrgasmSiphonedState.Update(1, []);
		expect(player().ArousalSettings.Progress).toBe(100);
		expect(globalThis.ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
	});

	it("Init()'s ActivityOrgasmStart hook ruins the player's orgasm and beeps every source pairing", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		globalThis.ActivityOrgasmStart(player() as never);
		expect(globalThis.ActivityOrgasmRuined).toBe(true);
		const beep = sent.beeps().find(b => b.target === 2);
		expect(beep?.message.command).toEqual({ name: "pairing-update", args: [{ name: "type", value: "orgasm-siphoned" }] });
	});

	it("does nothing when there are no source pairings", () => {
		globalThis.ActivityOrgasmStart(player() as never);
		expect(globalThis.ActivityOrgasmRuined).toBe(false);
		expect(sent.beeps()).toEqual([]);
	});

	it("does not intercept another character's orgasm", () => {
		const other = makeCharacter({ MemberNumber: 5, flags: { isPlayer: false } });
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		globalThis.ActivityOrgasmStart(other as never);
		expect(globalThis.ActivityOrgasmRuined).toBe(false);
	});

	it("a response (non-source) pairing does not trigger the siphon", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: false });
		globalThis.ActivityOrgasmStart(player() as never);
		expect(globalThis.ActivityOrgasmRuined).toBe(false);
		expect(sent.beeps()).toEqual([]);
	});
});

describe("ArousalPairedState", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		globalThis.CurrentScreen = "ChatRoom";
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	it("Update() applies the sent progress, resets the progress timer, and syncs the room", () => {
		player().ArousalSettings = { Progress: 10, ProgressTimer: 5, OrgasmTimer: 0, OrgasmCount: 0 } as never;
		states.ArousalPairedState.Update(2, [{ name: "progress", value: 42 }]);
		expect(player().ArousalSettings.Progress).toBe(42);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((player().ArousalSettings as any).ProgressTimer).toBe(0);
		expect(globalThis.ActivityOrgasmPrepare).not.toHaveBeenCalled();
		const raw = sent.raw();
		expect(raw.some(([type]) => type === "ChatRoomCharacterArousalUpdate")).toBe(true);
	});

	it("Update() with progress 100 also prepares an orgasm", () => {
		player().ArousalSettings = { Progress: 10, ProgressTimer: 0, OrgasmTimer: 0, OrgasmCount: 0 } as never;
		states.ArousalPairedState.Update(2, [{ name: "progress", value: 100 }]);
		expect(globalThis.ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
	});

	it("Update() with a non-numeric or missing progress does nothing", () => {
		player().ArousalSettings = { Progress: 10 } as never;
		states.ArousalPairedState.Update(2, []);
		expect(player().ArousalSettings.Progress).toBe(10);
	});

	it("PingArousal() beeps every pairing with the current progress", () => {
		states.ArousalPairedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		player().ArousalSettings = { Progress: 55 } as never;
		states.ArousalPairedState.PingArousal();
		const beep = sent.beeps().find(b => b.target === 2);
		expect(beep?.message.command).toEqual({ name: "pairing-update", args: [{ name: "type", value: "arousal-paired" }, { name: "progress", value: 55 }] });
	});

	it("PingArousal() caps the reported progress at 99 while a siphon is active", () => {
		states.OrgasmSiphonedState.AddPairing({ PairedMember: 9, PairedBy: 1, IsSource: true });
		states.ArousalPairedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		player().ArousalSettings = { Progress: 100 } as never;
		states.ArousalPairedState.PingArousal();
		const beep = sent.beeps().find(b => b.target === 2);
		expect(beep?.message.command?.args).toContainEqual({ name: "progress", value: 99 });
	});

	it("Tick() pings arousal only when Progress has changed since the last tick", () => {
		states.ArousalPairedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		player().ArousalSettings = { Progress: 30 } as never;
		states.ArousalPairedState.Tick(Date.now());
		expect(sent.beeps()).toHaveLength(1);

		states.ArousalPairedState.Tick(Date.now());
		expect(sent.beeps()).toHaveLength(1);

		player().ArousalSettings = { Progress: 31 } as never;
		states.ArousalPairedState.Tick(Date.now());
		expect(sent.beeps()).toHaveLength(2);
	});

	it("Recover(true) sends the breathing-calms-down emote", () => {
		states.ArousalPairedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.ArousalPairedState.Activate(1);
		states.ArousalPairedState.Recover(true);
		expect(sent.actions()).toEqual([emote("%NAME%'s breathing calms down as %PRONOUN% regains control of %POSSESSIVE% arousal.")]);
	});

	it("Recover(false) sends no emote", () => {
		states.ArousalPairedState.AddPairing({ PairedMember: 2, PairedBy: 1, IsSource: true });
		states.ArousalPairedState.Activate(1);
		states.ArousalPairedState.Recover(false);
		expect(sent.actions()).toEqual([]);
	});
});
