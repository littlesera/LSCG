// SpellEffectsState: the list of things spells did to the player that have to be undone later. Each entry has its own expiry and
// is ended by running out, a dispel or safeword, calling its effect's onEnd. Entries are plain data saved with the player.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { MagicModule } from "Modules/magic";
import { spellEffects, type SpellEffectContext } from "Modules/Magic/spellEffects";
import type { SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import { boot, resetWorld } from "../harness/world";
import { timerProcess } from "../harness/time";

const EFFECT = "test.entry" as SpellEffectId;
const MINUTE = 60_000;

describe("SpellEffectsState", () => {
	let states: StateModule;
	let magic: MagicModule;
	let coreModule: CoreModule;
	const onEnd = vi.fn();
	const onRoomSync = vi.fn();
	let unregister: () => void;

	beforeAll(() => {
		[coreModule, states, magic] = boot(new CoreModule(), new StateModule(), new MagicModule()) as [CoreModule, StateModule, MagicModule];
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		onEnd.mockReset();
		onRoomSync.mockReset();
		unregister = spellEffects.register({ id: EFFECT, label: "Test", description: "t", tier: 2, apply: () => {}, onEnd, onRoomSync });
	});

	afterEach(() => unregister());

	const state = () => states.SpellEffectsState;
	const ctx = (duration?: number): SpellEffectContext => ({
		effect: EFFECT, sender: { MemberNumber: 7 } as Character, senderName: "Bob", magic, index: 0, duration,
		spell: { Name: "bind", Creator: 7, Effects: [EFFECT], AllowPotion: false, AllowVoiceCast: false } as SpellDefinition,
	});

	it("records an entry with the effect's tier, the caster and the spell, and activates the state", () => {
		expect(state().Active).toBe(false);
		const entry = state().Add(ctx(5 * MINUTE), { group: "ItemArms" });
		expect(state().Active).toBe(true);
		expect(entry).toMatchObject({ effect: EFFECT, tier: 2, spellName: "bind", by: 7, duration: 5 * MINUTE, activatedAt: Date.now(), data: { group: "ItemArms" } });
		expect(state().EntriesFor(EFFECT)).toEqual([entry]);
		expect(state().config.activatedBy).toBe(7);
	});

	it("ends each entry on its own clock, and the state with its last entry", () => {
		const short = state().Add(ctx(2 * MINUTE));
		const long = state().Add(ctx(10 * MINUTE));
		vi.advanceTimersByTime(3 * MINUTE);
		state().Tick(Date.now());
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(onEnd.mock.calls[0][0]).toEqual(short);
		expect(onEnd.mock.calls[0][1]).toBe("expired");
		expect(state().Active).toBe(true);
		vi.advanceTimersByTime(8 * MINUTE);
		state().Tick(Date.now());
		expect(onEnd.mock.calls[1][0]).toEqual(long);
		expect(state().Active).toBe(false);
		expect(state().entries).toEqual([]);
	});

	it("is driven by the game's timer, and entries with no duration never expire", () => {
		state().Add(ctx(MINUTE));
		state().Add(ctx(0));
		vi.advanceTimersByTime(60 * MINUTE);
		timerProcess();
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(state().Active).toBe(true);
		expect(state().entries).toHaveLength(1);
	});

	it("a dispel ends every entry, with the reason", () => {
		state().Add(ctx(MINUTE));
		state().Add(ctx(0));
		states.Clear(false, true);
		expect(onEnd).toHaveBeenCalledTimes(2);
		expect(onEnd.mock.calls.map(c => c[1])).toEqual(["dispel", "dispel"]);
		expect(state().Active).toBe(false);
		expect(state().entries).toEqual([]);
	});

	it("safeword ends every entry", () => {
		state().Add(ctx(MINUTE));
		states.safeword();
		expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ effect: EFFECT }), "safeword", expect.anything());
		expect(state().Active).toBe(false);
	});

	it("keeps counting down across a relog: entries are plain data on absolute time", () => {
		state().Add(ctx(5 * MINUTE), { pieces: [{ group: "ItemArms", asset: "Web" }] });
		states.settings.states = JSON.parse(JSON.stringify(states.settings.states));
		vi.advanceTimersByTime(6 * MINUTE);
		state().Tick(Date.now());
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(onEnd.mock.calls[0][0].data).toEqual({ pieces: [{ group: "ItemArms", asset: "Web" }] });
		expect(state().Active).toBe(false);
	});

	it("one entry failing to end doesn't stop the others", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		onEnd.mockImplementationOnce(() => { throw new Error("boom"); });
		state().Add(ctx(MINUTE));
		state().Add(ctx(MINUTE));
		states.Clear(false, true);
		expect(onEnd).toHaveBeenCalledTimes(2);
		expect(state().Active).toBe(false);
		warn.mockRestore();
	});

	it("can end or update a single entry, and ignores one it doesn't have", () => {
		const a = state().Add(ctx(0), { n: 1 });
		const b = state().Add(ctx(0), { n: 2 });
		state().Update(a, { n: 9 });
		expect(state().entries[0].data).toEqual({ n: 9 });
		state().End(a, "manual");
		expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ id: a.id }), "manual", expect.anything());
		state().End(a, "manual"); // already gone
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(state().Active).toBe(true);
		state().End(b, "manual");
		expect(state().Active).toBe(false);
	});

	it("tells each effect to re-apply its entries on a room sync", () => {
		const entry = state().Add(ctx(0));
		state().RoomSync();
		expect(onRoomSync).toHaveBeenCalledWith(entry, expect.anything());
	});

	it("keeps its entries out of what other players are sent", () => {
		state().Add(ctx(0), { secret: "web on the arms" });
		expect(JSON.stringify(Player.LSCG.StateModule)).toContain("web on the arms");
		const published = JSON.stringify(coreModule.publicSettings.StateModule);
		expect(published).toContain("spell-effects"); // that the state is active is public...
		expect(published).not.toContain("web on the arms"); // ...what it holds isn't
	});
});
