// Remove Curse: lifts one magical effect from the target. The caster picks which from what the target has published, or it is left to chance (a voice
// cast, a potion, or no choice). The target's own client decides what is really there to lift, whatever it was told.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LeashingModule } from "Modules/leashing";
import { LSCGSpellEffect, type SpellDefinition } from "Settings/Models/magic";
import { RANDOM_EFFECT, REMOVE_CURSE_EFFECT, removableOn } from "Modules/Magic/effects/removeCurse";
import { sanitizeCastArgs, spellCastPrompts } from "Modules/Magic/spellEdit";
import { ACTIVE_EFFECTS_KEY } from "Modules/Magic/activeEffects";
import { getSpellEffect } from "Modules/Magic/spellEffects";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, type FixtureCharacter } from "../harness/fixtures";
import { becomePlayer, deliver, outgoing } from "../harness/wire";
import { restoreRandom, seedRandom } from "../harness/time";
import { sent } from "../harness/room";

const FAILS = [0.99, 0.0];

describe("Remove Curse", () => {
	let magic: MagicModule;
	let states: StateModule;
	let leashing: LeashingModule;

	beforeAll(() => {
		[, , , , , , magic, states, leashing] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
			new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new LeashingModule());
		vi.useFakeTimers();
	});

	let alice: FixtureCharacter;

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
		});
		states.init();
		magic.init();
		leashing.Pairings = [];
		addToRoom(player());
		alice = addToRoom(makeCharacter({
			MemberNumber: 2, Nickname: "Alice",
			LSCG: { MagicModule: { enabled: true }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 } },
		}));
		magic.settings.enabled = true;
		vi.stubGlobal("CharacterRefresh", vi.fn());
		vi.stubGlobal("InventoryAllow", vi.fn(() => true));
		vi.stubGlobal("SkillGetWithRatio", vi.fn(() => 0));
		vi.stubGlobal("TypedItemDataLookup", {});
		vi.stubGlobal("TypedItemSetOptionByName", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		restoreRandom();
	});

	const spell = (): SpellDefinition => ({ Name: "Lift", Creator: 2, Effects: [LSCGSpellEffect.removeCurse], AllowPotion: false, AllowVoiceCast: false });
	/** The spell lands on the player, with the caster's answer if there is one. */
	const cast = (answer?: string) => {
		magic.IncomingSpell(alice as never, spell(), null, 1, false, answer ? { 0: { target: answer } } : undefined);
		vi.advanceTimersByTime(2500);
		return sent.actions();
	};
	const web = () => {
		makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Web", Category: [] } as never);
		makeAsset(makeGroup({ Name: "ItemMouth" }), { Name: "WebGag", Category: [] } as never);
		makeAsset(makeGroup({ Name: "ItemHead" }), { Name: "WebBlindfold", Category: [] } as never);
		magic.IncomingSpell(alice as never, { ...spell(), Effects: [LSCGSpellEffect.web], Configs: [{ Min: 1, Max: 1 }] }, null, 1);
		vi.advanceTimersByTime(2500);
		sent.actions();
	};
	const worn = () => player().Appearance.map((i: any) => i.Asset.Name);
	const published = (...entries: unknown[]) => makeCharacter({
		MemberNumber: 3, Nickname: "Bea",
		LSCG: { StateModule: { states: entries } },
	});

	describe("what the caster can see on the target", () => {
		it("lists each active state once, and what spells put on them one by one, from what they have published", () => {
			const bea = published(
				{ type: "blind", active: true }, { type: "deaf", active: false }, { type: "hypnotized", active: true },
				{ type: "spell-effects", active: true, extensions: { [ACTIVE_EFFECTS_KEY]: [{ id: "a1", effect: "Web" }, { id: "b2", effect: "Grasping" }] } },
			);
			expect(removableOn(bea as never)).toEqual([
				{ key: "state:blind", label: expect.any(String) }, { key: "state:hypnotized", label: expect.any(String) },
				{ key: "entry:a1", label: "Web" }, { key: "entry:b2", label: "Grasping" },
			]);
		});

		it("is empty for someone with nothing on them, or who has published nothing", () => {
			expect(removableOn(published({ type: "blind", active: false }) as never)).toEqual([]);
			expect(removableOn(makeCharacter({ MemberNumber: 4, Nickname: "Cy", LSCG: {} }) as never)).toEqual([]);
		});

		it("works on the player's own settings too, for a spell cast on yourself", () => {
			states.BlindState.Activate(2);
			expect(removableOn(player() as never).map(r => r.key)).toEqual(["state:blind"]);
		});

		it("the spell effects state publishes which effects are on the player, and nothing of how they are undone", () => {
			web();
			const entry = states.SpellEffectsState.entries[0];
			const list = states.SpellEffectsState.config.extensions[ACTIVE_EFFECTS_KEY];
			expect(list).toEqual([{ id: entry.id, effect: LSCGSpellEffect.web }]);
			expect(JSON.stringify(list)).not.toContain("ItemArms");
			states.SpellEffectsState.End(entry, "manual");
			expect(states.SpellEffectsState.config.extensions[ACTIVE_EFFECTS_KEY]).toBeUndefined();
		});
	});

	describe("asking the caster", () => {
		const prompt = (target?: unknown) => getSpellEffect(LSCGSpellEffect.removeCurse)!.config!.castPrompts!({}, target as never);

		it("offers a random one first and then each effect on the target, with a random one chosen", () => {
			const [only] = prompt(published({ type: "blind", active: true }, { type: "spell-effects", active: true, extensions: { [ACTIVE_EFFECTS_KEY]: [{ id: "a1", effect: "Web" }] } }));
			expect(only.default).toBe(RANDOM_EFFECT);
			expect(only.open).toBe(true);
			expect(only.options.map(o => o.value)).toEqual([RANDOM_EFFECT, "state:blind", "entry:a1"]);
		});

		it("asks nothing of a caster whose target has nothing to lift", () => {
			expect(prompt(published())).toEqual([]);
		});

		it("with no target to look at, only the random choice is offered", () => {
			expect(prompt()[0].options.map(o => o.value)).toEqual([RANDOM_EFFECT]);
		});

		it("the menu's questions for a spell see the target", () => {
			const bea = published({ type: "blind", active: true });
			expect(spellCastPrompts(spell(), bea as never)[0].prompts[0].options.map(o => o.value)).toEqual([RANDOM_EFFECT, "state:blind"]);
			expect(spellCastPrompts(spell(), published() as never)).toEqual([]);
		});

		it("the answer is accepted off the wire if it is short and plain, because only the target can check it", () => {
			const ok = (value: unknown) => sanitizeCastArgs({ 0: { target: value } }, spell());
			expect(ok("state:blind")).toEqual({ 0: { target: "state:blind" } });
			expect(ok("entry:lk3j-ab12")).toEqual({ 0: { target: "entry:lk3j-ab12" } });
			expect(ok(RANDOM_EFFECT)).toEqual({ 0: { target: RANDOM_EFFECT } });
			for (const bad of ["x".repeat(65), "<script>", "", 5, null, { a: 1 }, "a/b"])
				expect(ok(bad), String(bad)).toBeUndefined();
		});
	});

	describe("lifting", () => {
		it("lifts the one effect the caster picked and leaves the others", () => {
			states.BlindState.Activate(2);
			states.DeafState.Activate(2);
			const out = cast("state:blind");
			expect(states.BlindState.Active).toBe(false);
			expect(states.DeafState.Active).toBe(true);
			expect(out.some(a => /^The spell breaks the .+ effect on Sera\.$/.test(a))).toBe(true);
		});

		it("lifts one thing a spell put on them, taking the items off with it", () => {
			web();
			states.BlindState.Activate(2);
			const entry = states.SpellEffectsState.entries[0];
			cast(`entry:${entry.id}`);
			expect(worn()).toEqual([]);
			expect(states.SpellEffectsState.entries).toEqual([]);
			expect(states.BlindState.Active).toBe(true);
		});

		it("with no choice it lifts exactly one, at random", () => {
			for (const [roll, expected] of [[0.0, "blind"], [0.99, "deaf"]] as const) {
				states.BlindState.Activate(2);
				states.DeafState.Activate(2);
				seedRandom([roll]);
				cast();
				restoreRandom();
				expect(states.BlindState.Active, `roll ${roll}`).toBe(expected !== "blind");
				expect(states.DeafState.Active, `roll ${roll}`).toBe(expected !== "deaf");
				states.safeword();
			}
		});

		it("'random' is the same as no choice", () => {
			states.BlindState.Activate(2);
			states.DeafState.Activate(2);
			cast(RANDOM_EFFECT);
			expect(Number(states.BlindState.Active) + Number(states.DeafState.Active)).toBe(1);
		});

		it("a choice that isn't on the target any more (it wore off, or never was) is left to chance among what is", () => {
			states.BlindState.Activate(2);
			cast("state:deaf");
			expect(states.BlindState.Active).toBe(false);
			states.BlindState.Activate(2);
			cast("entry:not-a-thing");
			expect(states.BlindState.Active).toBe(false);
		});

		it("says so when there is nothing to lift", () => {
			const out = cast();
			expect(out.some(a => a.includes("finds none"))).toBe(true);
		});

		it("never touches the spell that is lifting, or anything it isn't asked to", () => {
			states.BlindState.Activate(2);
			states.DeafState.Activate(2);
			states.HornyState.Activate(2);
			cast("state:deaf");
			expect([states.BlindState.Active, states.DeafState.Active, states.HornyState.Active]).toEqual([true, false, true]);
		});

		it("is beneficial: there is no save against it, even for someone who defends", () => {
			expect(REMOVE_CURSE_EFFECT.beneficial).toBe(true);
			states.BlindState.Activate(2);
			seedRandom([0.0, 0.99]);
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell() }, { name: "args", value: { 0: { target: "state:blind" } } }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			restoreRandom();
			expect(states.BlindState.Active).toBe(false);
			expect(sent.actions().some(a => a.startsWith("Save vs"))).toBe(false);
		});

		it("each of several things picked by several castings goes one at a time", () => {
			states.BlindState.Activate(2);
			states.DeafState.Activate(2);
			states.HornyState.Activate(2);
			cast("state:blind");
			cast("state:horny");
			expect([states.BlindState.Active, states.DeafState.Active, states.HornyState.Active]).toEqual([false, true, false]);
		});
	});

	describe("between two players", () => {
		const CASTER = { memberNumber: 1, nickname: "Caster" };
		const TARGET = { memberNumber: 2, nickname: "Target" };
		const start = (me: typeof CASTER, other: typeof TARGET) => {
			const world = becomePlayer({ ...me, lscg: { MagicModule: { enabled: true } } }, { ...other, lscg: { MagicModule: { enabled: true } } });
			leashing.Pairings = [];
			states.init();
			magic.init();
			magic.settings.enabled = true;
			return world;
		};

		/** The caster casts at a target who has blindness and deafness on; returns what the target's world is left with. */
		const castAcross = (setup: (target: FixtureCharacter) => void, how: { answer?: string; say?: string } = {}) => {
			const { other: targetThere } = start(CASTER, TARGET);
			setup(targetThere);
			const full = { ...spell(), AllowVoiceCast: !!how.say, CastingPhrase: "lift" } as SpellDefinition;
			if (how.say) {
				magic.settings.knownSpells = [full];
				magic.CheckForSpellVoiceCasting(how.say);
			} else {
				magic.CastSpellActual(structuredClone(full), targetThere, false, undefined, how.answer ? { 0: { target: how.answer } } : undefined);
			}
			const packets = outgoing();
			const { other: casterThere } = start(TARGET, CASTER);
			states.BlindState.Activate(1);
			states.DeafState.Activate(1);
			seedRandom([...FAILS, 0.99]);
			deliver(casterThere, packets);
			vi.advanceTimersByTime(1000 + 2000 + 500);
			restoreRandom();
			return { blind: states.BlindState.Active, deaf: states.DeafState.Active, packets };
		};
		const nothing = () => undefined;

		it("the caster's pick crosses the wire and lifts that effect on the target", () => {
			const r = castAcross(nothing, { answer: "state:deaf" });
			expect(r.packets.hidden.find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { target: "state:deaf" } } });
			expect({ blind: r.blind, deaf: r.deaf }).toEqual({ blind: true, deaf: false });
		});

		it("a voice cast has no choice, so one of them is lifted at random", () => {
			const r = castAcross(nothing, { say: "lift Target" });
			expect(r.packets.hidden.find(m => m.command?.name === "spell")?.command?.args.some(a => a.name === "args")).toBe(false);
			expect(Number(r.blind) + Number(r.deaf)).toBe(1);
		});

		it("a made-up pick from a hostile caster is ignored", () => {
			const r = castAcross(nothing, { answer: "state:../../x" });
			expect(Number(r.blind) + Number(r.deaf)).toBe(1);
		});
	});
});

