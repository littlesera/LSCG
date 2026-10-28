// lockedSpellEffects: effects a remote user has locked on the player, which fizzle on their step whenever the
// player casts (CastSpellActual) -- stripped from the spell before it is sent or applied, with every other effect
// keeping its own settings and answers. Only the caster's client enforces it. The remote write path (who may change
// the list) is covered with the other remote settings in core-remote.test.ts and remote-access-gate.test.ts.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LSCGSpellEffect, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { spellEffects } from "Modules/Magic/spellEffects";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("MagicModule locked spell effects", () => {
	let magic: MagicModule;
	let states: StateModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , , , magic, states] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(), new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
		});
		states.init();
		magic.init();
		addToRoom(player());
		alice = addToRoom(makeCharacter({
			MemberNumber: 2, Nickname: "Alice",
			LSCG: { MagicModule: { enabled: true }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 } },
		}));
		magic.settings.enabled = true;
	});

	const spell = (name: string, effects: SpellEffectId[], overrides: Partial<SpellDefinition> = {}): SpellDefinition =>
		({ Name: name, Creator: 1, Effects: effects, AllowPotion: false, AllowVoiceCast: false, ...overrides });

	/** The spell as it went out to `alice`, or undefined if nothing was sent. */
	const lastSpellMessage = () => sent.hidden().filter(m => m.command?.name === "spell").at(-1);
	const sentSpell = () => lastSpellMessage()?.command?.args?.find(a => a.name === "spell")?.value as SpellDefinition | undefined;
	const sentPaired = () => lastSpellMessage()?.command?.args?.find(a => a.name === "paired")?.value;

	describe("the setting", () => {
		it("starts empty, and an older save without it gets the empty default", () => {
			expect(magic.settings.lockedSpellEffects).toEqual([]);
			expect(magic.defaultSettings.lockedSpellEffects).toEqual([]);
		});

	});

	describe("lockedEffectIndexes", () => {
		it("finds each copy of a locked effect by position", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			expect(magic.lockedEffectIndexes(spell("s", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]))).toEqual([0, 2]);
		});

		it("is empty when nothing is locked, or the spell has no locked effect", () => {
			expect(magic.lockedEffectIndexes(spell("s", [LSCGSpellEffect.deafened]))).toEqual([]);
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			expect(magic.lockedEffectIndexes(spell("s", [LSCGSpellEffect.blindness]))).toEqual([]);
		});
	});

	describe("casting on someone else", () => {
		it("sends the spell untouched when nothing in it is locked", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			magic.CastSpellActual(spell("s", [LSCGSpellEffect.blindness]), alice as never, false);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
			expect(sent.local().some(a => a.includes("fizzles"))).toBe(false);
		});

		it("drops a locked effect, fizzling that step, and the rest of the spell goes ahead", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.slumber]), alice as never, false);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness, LSCGSpellEffect.slumber]);
			expect(sent.local().filter(a => a.includes("Deafen") && a.includes("Hush") && a.includes("fizzles"))).toHaveLength(1);
			expect(sent.actions().some(a => a.includes("fizzles"))).toBe(false); // not in public chat
		});

		it("fizzles every copy of a locked effect separately", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), alice as never, false);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
			expect(sent.local().filter(a => a.includes("fizzles"))).toHaveLength(2);
		});

		it("keeps each remaining effect's settings, delay and answers lined up with it", () => {
			const A = "test.a" as SpellEffectId;
			const B = "test.b" as SpellEffectId;
			const undo = [
				spellEffects.register({ id: A, label: "A", description: "t", tier: 1, apply: () => {} }),
				spellEffects.register({ id: B, label: "B", description: "t", tier: 1, apply: () => {} }),
			];
			try {
				magic.settings.lockedSpellEffects = [A];
				const s = spell("mix", [A, B, LSCGSpellEffect.blindness], { Configs: ["cfgA", "cfgB", null], Delays: [null, 1500, 2500] });
				magic.CastSpellActual(s, alice as never, false, undefined, { 0: { word: "a" }, 1: { word: "b" } });
				const out = sentSpell()!;
				expect(out.Effects).toEqual([B, LSCGSpellEffect.blindness]);
				expect(out.Configs).toEqual(["cfgB", null]);
				expect(out.Delays).toEqual([1500, 2500]);
				const args = lastSpellMessage()?.command?.args?.find(a => a.name === "args")?.value;
				expect(args).toEqual({ 0: { word: "b" } });
			} finally {
				undo.forEach(u => u());
			}
		});

		it("does not change the spell the caster knows", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const known = spell("Hush", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]);
			magic.CastSpellActual(known, alice as never, false);
			expect(known.Effects).toEqual([LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]);
		});

		it("when every effect is locked, nothing is sent and the whole spell fizzles", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness];
			const closeMenu = vi.spyOn(magic, "CloseSpellMenu");
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]), alice as never, false);
			expect(sentSpell()).toBeUndefined();
			expect(sent.local().some(a => a.includes("Hush") && a.includes("fizzles entirely"))).toBe(true);
			expect(sent.actions().some(a => a.includes("fizzles"))).toBe(false);
			expect(closeMenu).toHaveBeenCalled();
		});

		it("unlocking restores casting", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]), alice as never, false);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
			magic.settings.lockedSpellEffects = [];
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]), alice as never, false);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]);
		});

		it("locks extension effects by their namespaced id", () => {
			const EXT = "ext.shout" as SpellEffectId;
			const undo = spellEffects.register({ id: EXT, label: "Shout", description: "t", tier: 1, apply: () => {} });
			try {
				magic.settings.lockedSpellEffects = [EXT];
				magic.CastSpellActual(spell("loud", [EXT, LSCGSpellEffect.blindness]), alice as never, false);
				expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
			} finally {
				undo();
			}
		});
	});

	describe("paired spells", () => {
		const PAIRED = LSCGSpellEffect.paired_arousal;

		it("a locked pairing effect drops the pairing, so no second target is named", () => {
			magic.settings.lockedSpellEffects = [PAIRED];
			const bob = addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob", LSCG: { MagicModule: { enabled: true } } }));
			magic.CastSpellActual(spell("link", [PAIRED, LSCGSpellEffect.blindness]), alice as never, false, bob as never);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
			expect(sentPaired()).toBeUndefined();
		});

		it("keeps the pairing when a different effect is the locked one", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.blindness];
			const bob = addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob", LSCG: { MagicModule: { enabled: true } } }));
			magic.CastSpellActual(spell("link", [PAIRED, LSCGSpellEffect.blindness]), alice as never, false, bob as never);
			expect(sentSpell()?.Effects).toEqual([PAIRED]);
			expect(sentPaired()).toBe(3);
		});
	});

	describe("casting on yourself, by voice or by wild magic", () => {
		it("a locked effect never takes hold on the caster, the others do", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.blindness];
			magic.CastSpellActual(spell("self", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), player() as never, false);
			vi.advanceTimersByTime(1000 + 2000 * 3);
			expect(states.BlindState.Active).toBe(false);
			expect(states.DeafState.Active).toBe(true);
			expect(sent.local().some(a => a.includes("fizzles"))).toBe(true);
		});

		it("a fully locked self-cast does nothing", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.blindness];
			magic.CastSpellActual(spell("self", [LSCGSpellEffect.blindness]), player() as never, false);
			vi.advanceTimersByTime(1000 + 2000 * 3);
			expect(states.BlindState.Active).toBe(false);
		});

		it("a voice cast goes through the same lock", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			magic.CastSpellActual(spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]), alice as never, true);
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
		});

		it("wild magic goes through the same lock", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const known = spell("Hush", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]);
			vi.spyOn(magic, "AvailableSpells", "get").mockReturnValue([known]);
			magic.settings.trueWildMagic = false;
			vi.spyOn(Math, "random").mockReturnValue(0);
			try {
				magic.CastWildMagic(alice as never);
			} finally {
				vi.restoreAllMocks();
			}
			expect(sentSpell()?.Effects).toEqual([LSCGSpellEffect.blindness]);
		});
	});

	describe("GetSpellStatus", () => {
		it("marks a locked effect, and a spell with only some locked is still castable", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const status = magic.GetSpellStatus(spell("s", [LSCGSpellEffect.deafened, LSCGSpellEffect.blindness]), alice as never);
			expect(status.effects.map(e => e.status)).toEqual(["locked", "ok"]);
			expect(status.castable).toBe(true);
		});

		it("a spell with every effect locked can't be cast", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const status = magic.GetSpellStatus(spell("s", [LSCGSpellEffect.deafened]), alice as never);
			expect(status.castable).toBe(false);
		});

		it("lock wins over the target having blocked the effect", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			(alice.LSCG.MagicModule as { blockedSpellEffects?: string[] }).blockedSpellEffects = [LSCGSpellEffect.deafened];
			expect(magic.GetSpellStatus(spell("s", [LSCGSpellEffect.deafened]), alice as never).effects[0].status).toBe("locked");
		});

		it("choosing a fully locked spell does not cast it", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const cast = vi.spyOn(magic, "CastSpellInitial");
			(globalThis as unknown as { CurrentCharacter: unknown }).CurrentCharacter = alice;
			magic.ChooseSpell(spell("s", [LSCGSpellEffect.deafened]));
			expect(cast).not.toHaveBeenCalled();
		});
	});

	describe("what the lock does not touch", () => {
		it("spells cast on the player by others, and the player's own blocked list", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.blindness];
			expect(magic.effectIsAllowed(LSCGSpellEffect.blindness, alice as never)).toBe(true);
			magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
			expect(magic.effectIsAllowed(LSCGSpellEffect.blindness, alice as never)).toBe(false);
		});

		it("teaching a spell", () => {
			magic.settings.lockedSpellEffects = [LSCGSpellEffect.deafened];
			const s = spell("Hush", [LSCGSpellEffect.deafened]);
			magic.TeachSpellActual(s, alice as never);
			vi.advanceTimersByTime(5000);
			const taught = sent.hidden().find(m => m.command?.name === "spell-teach")?.command?.args?.find(a => a.name === "spell")?.value as SpellDefinition | undefined;
			expect(taught?.Effects).toEqual([LSCGSpellEffect.deafened]);
		});
	});

	afterEach(() => {
		vi.clearAllTimers();
	});
});
