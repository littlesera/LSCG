// Spell effect registry: built-in parity with the old hardcoded lists, extension effects end to end,
// unknown effects, per-target spell status, defaultBlocked, knownEffects advertising, and wild magic picks.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { ABSOLUTE_MAX_SPELL_EFFECTS, DEFAULT_MAX_SPELL_EFFECTS, DamageSave, DamageType, LSCGSpellEffect, maxSpellEffects,  type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { builtInEffectIds, effectDescription, effectDomain, effectLabel, effectSchool, effectsInDomain, effectsInSchool, effectsInTier, effectTier, effectTooltip, extensionEffectIds, getSpellEffect, spellEffects, spellIsBeneficial } from "Modules/Magic/spellEffects";
import { SPELL_DOMAINS, SPELL_TIERS, SpellDomain, SpellSchool } from "Modules/Magic/taxonomy";
import { damageTier, MAX_DAMAGE_ROLL } from "Modules/Magic/effects/damage";
import { retier, spellTier } from "Modules/Magic/spellEdit";
import { addEffect, canHaveEffect, effectConfigFor, removeEffect, sanitizeSpell, setEffect, stackLimit, writeConfig } from "Modules/Magic/spellEdit";
import { sanitizeDamageConfig } from "Modules/Magic/effects/damage";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { restoreRandom, seedRandom } from "../harness/time";

describe("effect domains, schools and tiers", () => {
    const L = LSCGSpellEffect;
    const spell = (name: string, effects: SpellEffectId[]) => ({ Name: name, Creator: 2, Effects: effects, AllowPotion: false, AllowVoiceCast: false }) as SpellDefinition;
    const ids = (...e: LSCGSpellEffect[]) => e.sort();

    it("every built-in has a domain, a school and a tier from 1 to 5", () => {
        for (const id of builtInEffectIds()) {
            expect(SPELL_DOMAINS.map(d => d.id), id).toContain(effectDomain(id));
            expect(Object.values(SpellSchool), id).toContain(effectSchool(id));
            expect(SPELL_TIERS, id).toContain(effectTier(id));
        }
    });

    it("lists each domain's effects", () => {
        const group = (d: SpellDomain) => effectsInDomain(d).sort();
        expect(group(SpellDomain.mind)).toEqual(ids(L.hypnotizing, L.slumber, L.command));
        expect(group(SpellDomain.senses)).toEqual(ids(L.blindness, L.deafened, L.xRay, L.project));
        expect(group(SpellDomain.form)).toEqual(ids(L.enlarge, L.polymorph, L.outfit, L.dissolve));
        expect(group(SpellDomain.binding)).toEqual(ids(L.muted, L.frozen, L.tighten, L.loosen, L.disarm, L.web, L.slime, L.ropes, L.grasp));
        expect(group(SpellDomain.desire)).toEqual(ids(L.horny, L.denial, L.orgasm, L.orgasm_siphon, L.paired_arousal));
        expect(group(SpellDomain.harm)).toEqual(ids(L.damage));
        expect(group(SpellDomain.fortune)).toEqual(ids(L.bless, L.bane));
        expect(group(SpellDomain.warding)).toEqual(ids(L.barrier, L.dispel));
    });

    it("lists each school's effects", () => {
        const group = (d: SpellSchool) => effectsInSchool(d).sort();
        expect(group(SpellSchool.abjuration)).toEqual(ids(L.barrier, L.dispel));
        expect(group(SpellSchool.conjuration)).toEqual(ids(L.project, L.web, L.slime, L.ropes, L.grasp));
        expect(group(SpellSchool.divination)).toEqual(ids(L.xRay));
        expect(group(SpellSchool.enchantment)).toEqual(ids(L.hypnotizing, L.slumber, L.horny, L.bless, L.bane, L.paired_arousal, L.denial, L.orgasm, L.command));
        expect(group(SpellSchool.evocation)).toEqual(ids(L.damage));
        expect(group(SpellSchool.illusion)).toEqual(ids(L.muted, L.outfit));
        expect(group(SpellSchool.necromancy)).toEqual(ids(L.blindness, L.deafened, L.orgasm_siphon));
        expect(group(SpellSchool.transmutation)).toEqual(ids(L.frozen, L.enlarge, L.polymorph, L.disarm, L.tighten, L.loosen, L.dissolve));
    });

    it("lists each tier's effects (an effect whose tier depends on its settings by its lowest)", () => {
        const tier = (t: 1 | 2 | 3 | 4 | 5) => effectsInTier(t).sort();
        expect(tier(1)).toEqual(ids(L.loosen, L.tighten, L.disarm, L.horny, L.muted, L.bless, L.bane, L.damage, L.dissolve));
        expect(tier(2)).toEqual(ids(L.blindness, L.deafened, L.xRay, L.enlarge, L.outfit, L.denial, L.orgasm, L.web, L.ropes, L.command));
        expect(tier(3)).toEqual(ids(L.slumber, L.hypnotizing, L.frozen, L.paired_arousal, L.orgasm_siphon, L.barrier, L.slime, L.grasp));
        expect(tier(4)).toEqual(ids(L.polymorph, L.project, L.dispel));
        expect(tier(5)).toEqual([]);
    });

    it("extension effects have none of them, and count for nothing in a spell's power", () => {
        const id = "ext.shrink" as SpellEffectId;
        expect(effectDomain(id)).toBeUndefined();
        expect(effectTier(id)).toBe(0);
        expect(effectTier("nobody.knows")).toBe(0);
    });

    it("the tooltip names the school and tier", () => {
        expect(effectTooltip(L.hypnotizing)).toContain("Enchantment, tier 3");
    });

    describe("Damaging's tier comes from its roll", () => {
        it.each([
            ["", 1], ["1d8", 1], ["2d4", 1], ["2d8", 2], ["3d6+2", 2], ["4d10", 3], ["8d6", 3], ["10d10+12", 4], ["20d12", 5], [`1d${MAX_DAMAGE_ROLL}`, 5],
        ])("%j is tier %i", (Roll, tier) => {
            expect(damageTier({ Roll })).toBe(tier);
            expect(effectTier(L.damage, { Roll })).toBe(tier);
        });

        it("negative modifiers don't lower it, and a roll above the top tier is rejected", () => {
            expect(damageTier({ Roll: "4d10 - 30" })).toBe(3);
            expect(sanitizeDamageConfig({ Type: "Fire", Roll: "22d12" }).Roll).toBe("");
            expect(sanitizeDamageConfig({ Type: "Fire", Roll: "20d12" }).Roll).toBe("20d12");
        });
    });

    describe("a spell's total power", () => {
        const withDamage = (...rolls: string[]) => ({ ...spell("x", rolls.map(() => LSCGSpellEffect.damage)), Configs: rolls.map(Roll => ({ Type: "Fire", Roll })) }) as SpellDefinition;

        it("adds every effect's tier, counting each copy and each copy's own roll", () => {
            expect(spellTier(spell("x", [L.hypnotizing, L.blindness]))).toBe(5);
            expect(spellTier(withDamage("", "2d8", "4d10"))).toBe(1 + 2 + 3);
            expect(spellTier(spell("x", [L.horny, "ext.shrink" as SpellEffectId]))).toBe(1);
        });

        it("is stored on the spell and recomputed whenever its effects or their settings change", () => {
            const s = spell("x", [L.damage]);
            retier(s);
            expect(s.Tier).toBe(1);
            addEffect(s, L.hypnotizing);
            expect(s.Tier).toBe(4);
            writeConfig(s, 0, { Type: "Fire", Roll: "4d10" });
            expect(s.Tier).toBe(6);
            removeEffect(s, 1);
            expect(s.Tier).toBe(3);
        });

        it("is worked out again for a spell from another player, whatever it claims", () => {
            const s = sanitizeSpell({ ...spell("x", [L.horny]), Tier: 99 });
            expect(s.Tier).toBe(1);
        });
    });
});

describe("built-in spell effects", () => {
    const real = Object.values(LSCGSpellEffect).filter(e => e !== LSCGSpellEffect.none);

    it("registers every LSCGSpellEffect (except None), in enum order", () => {
        expect(builtInEffectIds()).toEqual(real);
        real.forEach(id => expect(effectDescription(id)).not.toBe(""));
    });

    it("keeps the flags of the old hardcoded lists", () => {
        const flagged = (flag: "beneficial" | "paired" | "forcesDuration") => spellEffects.all().filter(d => d[flag]).map(d => d.id).sort();
        expect(flagged("beneficial")).toEqual([LSCGSpellEffect.barrier, LSCGSpellEffect.bless, LSCGSpellEffect.dispel, LSCGSpellEffect.loosen, LSCGSpellEffect.xRay].sort());
        expect(flagged("paired")).toEqual([LSCGSpellEffect.orgasm_siphon, LSCGSpellEffect.paired_arousal].sort());
        expect(flagged("forcesDuration")).toEqual([LSCGSpellEffect.bane]);
        expect(getSpellEffect(LSCGSpellEffect.outfit)?.configurable).toBe("outfit");
        expect(getSpellEffect(LSCGSpellEffect.polymorph)?.configurable).toBe("polymorph");
    });

    it("still resolves the legacy 'dispell' spelling", () => {
        expect(getSpellEffect("Dispell")?.id).toBe(LSCGSpellEffect.dispel);
    });

    it("labels and describes unknown effects instead of failing", () => {
        expect(effectLabel("gone.effect")).toBe("(unavailable) gone.effect");
        expect(effectDescription("gone.effect")).toMatch(/isn't installed/);
    });
});

describe("extension spell effects", () => {
    let magic: MagicModule;
    let states: StateModule;
    let core: CoreModule;
    let alice: FixtureCharacter;
    let api: ModApiHandle;
    let ids = 0;

    beforeAll(() => {
        [core, , , , , , magic, states] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
            new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new OutfitCollectionModule());
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
        magic.settings.limitedDuration = true;
        api = registerExtension({ id: `spells-${++ids}`, name: "Spell Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    function spell(name: string, effects: SpellEffectId[]): SpellDefinition {
        return { Name: name, Creator: 2, Effects: effects, AllowPotion: false, AllowVoiceCast: false };
    }

    it("registers under the extension's namespace and is listed", () => {
        api.spells.registerEffect({ name: "shrink", label: "Shrinking", description: "Makes you tiny.", apply: () => {} });
        const id = `${api.id}.shrink`;
        expect(getSpellEffect(id)?.source).toBe("Spell Pack");
        expect(extensionEffectIds()).toContain(id);
        expect(api.spells.listEffects().find(e => e.id === id)).toEqual({ id, label: "Shrinking", description: "Makes you tiny.", builtIn: false });
        expect(() => api.spells.registerEffect({ name: "shrink", label: "x", description: "", apply: () => {} })).toThrow(/already registered/);
    });

    it("applies on an incoming spell with a public context that can drive built-in states", () => {
        const apply = vi.fn((ctx) => {
            ctx.sendAction("%NAME% shrinks!");
            ctx.states.get("blind")?.activate(undefined, ctx.duration);
        });
        api.spells.registerEffect({ name: "shrink", label: "Shrinking", description: "", apply });
        const id = `${api.id}.shrink` as SpellEffectId;
        magic.IncomingSpell(alice as never, spell("tiny", [id]), null, 2);
        vi.advanceTimersByTime(2500);

        expect(apply).toHaveBeenCalledOnce();
        const ctx = apply.mock.calls[0][0];
        expect(ctx).toMatchObject({ effect: id, sender: 2, duration: 2 * 5 * 60_000, spell: { name: "tiny", effects: [id] } });
        expect(Object.isFrozen(ctx)).toBe(true);
        expect(sent.actions().some(a => a.includes("shrinks!"))).toBe(true);
        expect(states.BlindState.Active).toBe(true);
        expect(states.BlindState.config.activatedBy).toBe(2);
        expect(states.BlindState.config.duration).toBe(2 * 5 * 60_000);
    });

    it("only exposes the drivable built-in states", () => {
        let ctx: any;
        api.spells.registerEffect({ name: "peek", label: "Peek", description: "", apply: c => { ctx = c; } });
        magic.IncomingSpell(alice as never, spell("peek", [`${api.id}.peek` as SpellEffectId]), null, 1);
        vi.advanceTimersByTime(2500);
        expect(ctx.states.get("asleep")?.type).toBe("asleep");
        expect(ctx.states.get("redressed")).toBeUndefined();
    });

    it("contains a throwing effect, still applying the spell's other effects", () => {
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        api.spells.registerEffect({ name: "boom", label: "Boom", description: "", apply: () => { throw new Error("boom"); } });
        magic.IncomingSpell(alice as never, spell("mixed", [`${api.id}.boom` as SpellEffectId, LSCGSpellEffect.deafened]), null, 1);
        vi.advanceTimersByTime(4500);
        expect(api.errorCount).toBe(1);
        expect(states.DeafState.Active).toBe(true);
        err.mockRestore();
    });

    it("an unknown (or uninstalled) effect fizzles with a message; the rest of the spell still applies", () => {
        api.spells.registerEffect({ name: "temp", label: "Temp", description: "", apply: () => {} });
        api.spells.unregisterEffect("temp");
        magic.IncomingSpell(alice as never, spell("mixed", [`${api.id}.temp` as SpellEffectId, LSCGSpellEffect.blindness]), null, 1);
        vi.advanceTimersByTime(4500);
        expect(sent.actions().some(a => a.includes("unfamiliar"))).toBe(true);
        expect(states.BlindState.Active).toBe(true);
    });

    it("dispose() unregisters the extension's effects", () => {
        api.spells.registerEffect({ name: "gone", label: "Gone", description: "", apply: () => {} });
        const id = `${api.id}.gone`;
        api.dispose();
        expect(getSpellEffect(id)).toBeUndefined();
    });

    it("a beneficial extension effect keeps an all-beneficial spell beneficial", () => {
        api.spells.registerEffect({ name: "heal", label: "Heal", description: "", beneficial: true, apply: () => {} });
        api.spells.registerEffect({ name: "hurt", label: "Hurt", description: "", apply: () => {} });
        expect(spellIsBeneficial(spell("s", [LSCGSpellEffect.bless, `${api.id}.heal` as SpellEffectId]))).toBe(true);
        expect(spellIsBeneficial(spell("s", [LSCGSpellEffect.bless, `${api.id}.hurt` as SpellEffectId]))).toBe(false);
        expect(spellIsBeneficial(spell("s", [LSCGSpellEffect.bless, "gone.effect" as SpellEffectId]))).toBe(false);
    });

    describe("GetSpellStatus (caster side)", () => {
        it("marks extension effects unsupported unless the target advertises them", () => {
            api.spells.registerEffect({ name: "shrink", label: "Shrinking", description: "", apply: () => {} });
            const id = `${api.id}.shrink` as SpellEffectId;
            const s = spell("mixed", [LSCGSpellEffect.blindness, id]);

            let status = magic.GetSpellStatus(s, alice as never);
            expect(status.effects).toEqual([{ id: LSCGSpellEffect.blindness, status: "ok" }, { id, status: "unsupported" }]);
            expect(status.castable).toBe(true);
            expect(magic.GetSpellStatus(spell("only", [id]), alice as never).castable).toBe(false);

            alice.LSCG.MagicModule.knownEffects = [id];
            status = magic.GetSpellStatus(s, alice as never);
            expect(status.effects[1].status).toBe("ok");
        });

        it("respects the target's blocks, and self-bypass only when casting on yourself", () => {
            alice.LSCG.MagicModule.blockedSpellEffects = [LSCGSpellEffect.blindness];
            alice.LSCG.MagicModule.bypassForSelfEffects = [LSCGSpellEffect.blindness];
            expect(magic.GetSpellStatus(spell("b", [LSCGSpellEffect.blindness]), alice as never).castable).toBe(false);

            magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
            magic.settings.bypassForSelfEffects = [LSCGSpellEffect.blindness];
            expect(magic.GetSpellStatus(spell("b", [LSCGSpellEffect.blindness]), player() as never).castable).toBe(true);
        });
    });

    it("defaultBlocked applies once, so a player's later unblock sticks", () => {
        api.spells.registerEffect({ name: "risky", label: "Risky", description: "", defaultBlocked: true, apply: () => {} });
        const id = `${api.id}.risky` as SpellEffectId;
        magic.SyncExtensionEffects(false);
        expect(magic.settings.blockedSpellEffects).toContain(id);

        magic.settings.blockedSpellEffects = magic.settings.blockedSpellEffects.filter(e => e !== id);
        magic.SyncExtensionEffects(false);
        expect(magic.settings.blockedSpellEffects).not.toContain(id);
    });

    it("advertises extension effects and newer built-ins, but not the legacy set, in the public settings packet", () => {
        api.spells.registerEffect({ name: "shrink", label: "Shrinking", description: "", apply: () => {} });
        const known = core.publicSettings.MagicModule.knownEffects;
        expect(known).toContain(`${api.id}.shrink`);
        expect(known).toContain(LSCGSpellEffect.tighten);
        expect(known).toContain(LSCGSpellEffect.loosen);
        expect(known).not.toContain(LSCGSpellEffect.blindness);
    });

    it("treats newer built-ins as unsupported on clients that don't advertise them (older LSCG)", () => {
        const s = spell("squeeze", [LSCGSpellEffect.tighten]);
        expect(magic.GetSpellStatus(s, alice as never).effects[0].status).toBe("unsupported");
        alice.LSCG.MagicModule.knownEffects = [LSCGSpellEffect.tighten];
        expect(magic.GetSpellStatus(s, alice as never).effects[0].status).toBe("ok");
    });

    describe("Tightening / Loosening", () => {
        beforeEach(() => {
            vi.stubGlobal("SkillGetLevel", () => 2);
            vi.stubGlobal("TightenLoosenFacialExpression", vi.fn());
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        function restraint(group: string, difficulty: number, extra: Parameters<typeof makeItem>[1] = {}, assetOverrides: Record<string, unknown> = {}) {
            const asset = makeAsset(makeGroup({ Name: group }), { Name: `${group}Thing`, Difficulty: difficulty, AllowTighten: true, ...assetOverrides } as never);
            return wear(player(), makeItem(asset, extra)) as any;
        }

        it("tightens unlocked restraints by BC's 'a lot' step, capped at BC's maximum", () => {
            const arms = restraint("ItemArms", 3);
            const legs = restraint("ItemLegs", 5, {}, {});
            legs.Difficulty = 9; // max = skill 2 + 4 + asset 5 = 11
            magic.IncomingSpell(alice as never, spell("squeeze", [LSCGSpellEffect.tighten]), null, 1);
            vi.advanceTimersByTime(2500);
            expect(arms.Difficulty).toBe(7);
            expect(legs.Difficulty).toBe(11);
            expect(sent.actions().some(a => a.includes("cinches tighter"))).toBe(true);
        });

        it("counts crafted Secure in the maximum, like BC", () => {
            const arms = restraint("ItemArms", 0, { Craft: { Effects: { Secure: 1 } } });
            arms.Difficulty = 4; // max = 2 + 4 + 0 + 4 = 10
            magic.IncomingSpell(alice as never, spell("squeeze", [LSCGSpellEffect.tighten]), null, 1);
            vi.advanceTimersByTime(2500);
            expect(arms.Difficulty).toBe(8);
        });

        it("loosens down to BC's minimum of -10", () => {
            const arms = restraint("ItemArms", 0);
            arms.Difficulty = -8;
            magic.IncomingSpell(alice as never, spell("relief", [LSCGSpellEffect.loosen]), null, 1);
            vi.advanceTimersByTime(2500);
            expect(arms.Difficulty).toBe(-10);
            expect(sent.actions().some(a => a.includes("slacken"))).toBe(true);
        });

        it("skips locked items, non-restraint groups, and items that can't be tightened", () => {
            const locked = restraint("ItemArms", 2, { Property: { LockedBy: "MetalPadlock" } });
            const cloth = wear(player(), makeItem(makeAsset(makeGroup({ Name: "Cloth", Category: "Appearance" }), { Name: "Shirt", Difficulty: 0, AllowTighten: true } as never))) as any;
            const fixed = restraint("ItemFeet", 2, {}, { AllowTighten: false });
            magic.IncomingSpell(alice as never, spell("squeeze", [LSCGSpellEffect.tighten]), null, 1);
            vi.advanceTimersByTime(2500);
            expect(locked.Difficulty).toBeUndefined();
            expect(cloth.Difficulty).toBeUndefined();
            expect(fixed.Difficulty).toBeUndefined();
            expect(sent.actions().some(a => a.includes("finds nothing it can tighten"))).toBe(true);
        });
    });

    describe("Damaging", () => {
        const damageSpell = (damage?: unknown) => ({ ...spell("zap", [LSCGSpellEffect.damage]), Configs: damage === undefined ? undefined : [damage] } as SpellDefinition);
        const cast = (s: SpellDefinition) => {
            magic.IncomingSpell(alice as never, s, null, 1);
            vi.advanceTimersByTime(2500);
            return sent.actions().filter(a => a.includes("damage"));
        };

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("is a harmful, configurable effect", () => {
            const def = getSpellEffect(LSCGSpellEffect.damage);
            expect(def?.config).toBeDefined();
            expect(def?.stackable).toBe(3);
            expect(spellIsBeneficial(damageSpell())).toBe(false);
        });

        it("rolls the dice and shows the type, total and the dice rolled", () => {
            vi.spyOn(Math, "random").mockReturnValue(0.5); // every d6 comes up 4
            const out = cast(damageSpell({ Type: "Fire", Roll: "2d6 + 2" }));
            expect(out).toHaveLength(1);
            expect(out[0]).toContain("takes 10 fire damage");
            expect(out[0]).toContain("zap");
            expect(out[0]).toContain("2d6 + 2 = [4, 4] + 2");
        });

        it("is an emote with no number when there's no roll, using Force when no type was chosen", () => {
            const out = cast(damageSpell({ Type: "Psychic", Roll: "" }));
            expect(out[0]).toContain("psychic damage");
            expect(out[0]).not.toMatch(/\d/);
            expect(cast(damageSpell()).at(-1)).toContain("force damage");
        });

        it("ignores a roll or type it can't use rather than failing", () => {
            const out = cast(damageSpell({ Type: "Mind Flayer", Roll: "9999d9999" }));
            expect(out[0]).toContain("force damage");
            expect(out[0]).not.toMatch(/\d/);
        });

        it("sanitizeDamageConfig keeps a known type and a valid roll, tidied, and falls back to safe defaults", () => {
            expect(sanitizeDamageConfig({ Type: "Cold", Roll: "1d8+3" })).toEqual({ Type: DamageType.cold, Roll: "1d8 + 3", Save: DamageSave.half });
            expect(sanitizeDamageConfig({ Type: 5, Roll: { x: 1 } })).toEqual({ Type: DamageType.force, Roll: "", Save: DamageSave.half });
            expect(sanitizeDamageConfig("nope")).toEqual({ Type: DamageType.force, Roll: "", Save: DamageSave.half });
            expect(sanitizeDamageConfig(null)).toEqual({ Type: DamageType.force, Roll: "", Save: DamageSave.half });
        });
    });

    describe("stacking effects and per-copy settings", () => {
        const dmg = (Type: string, Roll = "") => ({ Type, Roll });
        const stacked = (): SpellDefinition => ({
            ...spell("storm", [LSCGSpellEffect.damage, LSCGSpellEffect.blindness, LSCGSpellEffect.damage]),
            Configs: [dmg("Fire", "1d4"), null, dmg("Cold", "1d6")],
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("most effects are unique; Damaging stacks up to its limit", () => {
            expect(stackLimit(LSCGSpellEffect.blindness)).toBe(1);
            expect(stackLimit("someone.unknown")).toBe(1);
            expect(stackLimit(LSCGSpellEffect.damage)).toBe(3);
            const s = spell("x", [LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.blindness]);
            expect(canHaveEffect(s, LSCGSpellEffect.damage)).toBe(true);
            addEffect(s, LSCGSpellEffect.damage);
            expect(canHaveEffect(s, LSCGSpellEffect.damage)).toBe(false);
            expect(canHaveEffect(s, LSCGSpellEffect.damage, 0)).toBe(true); // changing one of the copies is fine
            expect(canHaveEffect(s, LSCGSpellEffect.blindness)).toBe(false);
        });

        it("removing or replacing an effect keeps each copy's settings with it", () => {
            const s = stacked();
            removeEffect(s, 0);
            expect(s.Effects).toEqual([LSCGSpellEffect.blindness, LSCGSpellEffect.damage]);
            expect(s.Configs).toEqual([null, dmg("Cold", "1d6")]);
            expect(effectConfigFor(s, 1)).toMatchObject({ Type: DamageType.cold, Roll: "1d6" });
            setEffect(s, 1, LSCGSpellEffect.deafened);
            expect(s.Configs).toEqual([null, null]); // the replacement starts with no settings of its own
            removeEffect(s, 1);
            expect(s.Configs).toBeUndefined(); // nothing left to keep
        });

        it("incoming spells keep stackable copies with their own settings and drop the rest", () => {
            const lots = [dmg("Fire"), dmg("Cold"), dmg("Acid"), dmg("Poison")];
            const s = sanitizeSpell({
                ...spell("storm", [LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.blindness, LSCGSpellEffect.blindness]),
                Configs: [...lots, { not: "used" }, { Also: "dropped" }],
            });
            expect(s.Effects).toEqual([LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.blindness]);
            expect(s.Configs).toHaveLength(4);
            expect((s.Configs as any[]).slice(0, 3).map(c => c.Type)).toEqual(["Fire", "Cold", "Acid"]);
            expect((s.Configs as any[])[3]).toBeNull(); // no settings for an effect that has none
        });

        it("settings are sanitized, oversized ones dropped, and the whole list removed when nothing is left", () => {
            const s = sanitizeSpell({
                ...spell("x", [LSCGSpellEffect.damage, LSCGSpellEffect.damage]),
                Configs: [dmg("Mind Flayer", "9999d9999"), { Type: "Fire", Roll: "1d4", Junk: "x".repeat(5000) }],
            });
            expect((s.Configs as any[])[0]).toEqual({ Type: DamageType.force, Roll: "", Save: DamageSave.half });
            expect((s.Configs as any[])[1]).toMatchObject({ Type: DamageType.fire, Roll: "1d4" });
            expect(JSON.stringify(s.Configs).length).toBeLessThan(300);
            expect(sanitizeSpell({ ...spell("y", [LSCGSpellEffect.blindness]), Configs: [{ anything: 1 }] }).Configs).toBeUndefined();
        });

        it("each copy applies with its own settings and announces its own result", () => {
            vi.spyOn(Math, "random").mockReturnValue(0.99); // every die at its top face
            magic.IncomingSpell(alice as never, stacked(), null, 1);
            vi.advanceTimersByTime(2000 * 3 + 500);
            const out = sent.actions();
            expect(out.some(a => a.includes("takes 4 fire damage"))).toBe(true);
            expect(out.some(a => a.includes("takes 6 cold damage"))).toBe(true);
            expect(states.BlindState.Active).toBe(true);
        });

        it("a blocked effect blocks every copy of it", () => {
            magic.settings.blockedSpellEffects = [LSCGSpellEffect.damage];
            expect(magic.filterAllowedSpellEffects(stacked(), alice as never)).toEqual([LSCGSpellEffect.blindness]);
        });
    });

    describe("Dissolving Clothes", () => {
        const cloth = (name: string, over: Record<string, unknown> = {}, groupOver: Record<string, unknown> = {}) => {
            const group = makeGroup({ Name: name, Category: "Appearance", Clothing: true, ...groupOver } as never);
            return wear(player(), makeItem(makeAsset(group, { Name: `${name}Thing`, ...over } as never))) as any;
        };
        const dissolve = (layers?: string) => ({ ...spell("poof", [LSCGSpellEffect.dissolve]), Configs: layers ? [{ Layers: layers }] : undefined }) as SpellDefinition;
        const cast = (s: SpellDefinition) => {
            magic.IncomingSpell(alice as never, s, null, 1);
            vi.advanceTimersByTime(2500);
            return sent.actions();
        };
        const worn = () => player().Appearance.map((i: any) => i.Asset.Group.Name).sort();

        beforeEach(() => {
            vi.stubGlobal("CharacterRefresh", vi.fn());
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it("dissolves clothing by default and leaves underwear, cosplay, body and restraints alone", () => {
            cloth("Cloth");
            cloth("Bra", {}, { Underwear: true });
            cloth("Hat", {}, { BodyCosplay: true });
            cloth("Eyes", {}, { Clothing: false });
            const cuffs = wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Cuffs" } as never))) as any;
            const out = cast(dissolve());
            expect(worn()).toEqual(["Bra", "Eyes", "Hat", "ItemArms"]);
            expect(player().Appearance).toContain(cuffs);
            expect(out.some(a => a.includes("clothes dissolve into glittering dust"))).toBe(true);
        });

        it("can take underwear only, or both", () => {
            cloth("Cloth");
            cloth("Bra", {}, { Underwear: true });
            cast(dissolve("underwear"));
            expect(worn()).toEqual(["Cloth"]);
            cloth("Bra", {}, { Underwear: true });
            cast(dissolve("both"));
            expect(worn()).toEqual([]);
        });

        it("says so when there is nothing to dissolve", () => {
            cloth("Eyes", {}, { Clothing: false });
            const out = cast(dissolve());
            expect(out.some(a => a.includes("finds no clothes to dissolve"))).toBe(true);
            expect(worn()).toEqual(["Eyes"]);
        });

        it("an unknown layer from another player falls back to clothing", () => {
            cloth("Cloth");
            cloth("Bra", {}, { Underwear: true });
            cast(dissolve("everything"));
            expect(worn()).toEqual(["Bra"]);
        });

        it("two copies can take different layers", () => {
            cloth("Cloth");
            cloth("Bra", {}, { Underwear: true });
            const s = { ...spell("poof", [LSCGSpellEffect.dissolve, LSCGSpellEffect.dissolve]), Configs: [{ Layers: "clothing" }, { Layers: "underwear" }] } as SpellDefinition;
            cast(s);
            vi.advanceTimersByTime(2000);
            expect(worn()).toEqual([]);
        });

        it("takes no save of its own: someone who never defends loses the clothes however the dice fall", () => {
            cloth("Cloth");
            magic.settings.neverDefend = true;
            seedRandom([0.0, 0.99]);
            magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: dissolve() }] } } as never);
            vi.advanceTimersByTime(1000 + 2500);
            restoreRandom();
            expect(worn()).toEqual([]);
            expect(sent.actions().some(a => a.includes("resists"))).toBe(false);
        });
    });

    describe("how many effects a spell can have", () => {
        it("a player's limit is 3 by default, and a bad saved value falls back to it", () => {
            expect(DEFAULT_MAX_SPELL_EFFECTS).toBe(3);
            expect(magic.settings.maxSpellEffects).toBe(3);
            expect(maxSpellEffects(magic.settings)).toBe(3);
            for (const bad of [undefined, 0, -1, 1.5, "4", Number.NaN, Infinity])
                expect(maxSpellEffects({ maxSpellEffects: bad as never })).toBe(3);
        });

        it("a raised limit is honoured, up to the ceiling", () => {
            expect(maxSpellEffects({ maxSpellEffects: 5 })).toBe(5);
            expect(maxSpellEffects({ maxSpellEffects: 1 })).toBe(1);
            expect(maxSpellEffects({ maxSpellEffects: 999 })).toBe(ABSOLUTE_MAX_SPELL_EFFECTS);
        });

        it("effects from another player are strings only, each unique one once, within the ceiling, in order", () => {
            const lots = Array.from({ length: 30 }, (_, i) => `x.e${i}`);
            const cleaned = sanitizeSpell({ Name: "x", Creator: 2, Effects: ["Blinding", 5, null, "", "Blinding", { a: 1 }, "Deafening", ...lots], AllowPotion: false, AllowVoiceCast: false } as never).Effects;
            expect(cleaned.slice(0, 2)).toEqual(["Blinding", "Deafening"]);
            expect(cleaned).toHaveLength(ABSOLUTE_MAX_SPELL_EFFECTS);
            expect(sanitizeSpell({ Name: "x", Effects: "nope" } as never).Effects).toEqual([]);
            expect(sanitizeSpell({ Name: "x" } as never).Effects).toEqual([]);
        });

        it("a spell taught by another player is stored within those limits", () => {
            const lots = Array.from({ length: 30 }, (_, i) => `x.e${i}`);
            const taught = { Name: "greedy", Creator: 2, Effects: [LSCGSpellEffect.blindness, 7, ...lots], AllowPotion: false, AllowVoiceCast: false };
            magic.IncomingSpellTeachCommand(alice as never, { command: { name: "spell-teach", args: [{ name: "spell", value: taught }] } } as never);
            const stored = magic.settings.knownSpells.find(sp => sp.Name === "greedy")!;
            expect(stored.Effects).toHaveLength(ABSOLUTE_MAX_SPELL_EFFECTS);
            expect(stored.Effects[0]).toBe(LSCGSpellEffect.blindness);
        });

        it("a cast spell applies at most the ceiling's worth of effects, in order", () => {
            const applied: string[] = [];
            const effects = Array.from({ length: 12 }, (_, i) => {
                api.spells.registerEffect({ name: `e${i}`, label: `E${i}`, description: "", apply: () => {} });
                return `${api.id}.e${i}` as SpellEffectId;
            });
            api.events.on("spell.effectApplied", p => applied.push(p.effect));
            magic.IncomingSpell(alice as never, spell("flood", effects), null, 1);
            vi.advanceTimersByTime(2000 * 12 + 500);
            expect(applied).toEqual(effects.slice(0, ABSOLUTE_MAX_SPELL_EFFECTS));
        });

        it("effects are applied in the order the spell lists them", () => {
            const applied: string[] = [];
            api.events.on("spell.effectApplied", p => applied.push(p.effect));
            magic.IncomingSpell(alice as never, spell("ordered", [LSCGSpellEffect.muted, LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), null, 1);
            vi.advanceTimersByTime(7000);
            expect(applied).toEqual([LSCGSpellEffect.muted, LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]);
        });
    });

    it("wild magic picks distinct, eligible effects", () => {
        api.spells.registerEffect({ name: "never", label: "Never", description: "", apply: () => {} });
        for (let i = 0; i < 100; i++) {
            const effects = magic.RandomSpell.Effects;
            expect(effects.length).toBeGreaterThan(0);
            expect(new Set(effects).size).toBe(effects.length);
            effects.forEach(e => expect(getSpellEffect(e)?.allowRandom).toBe(true));
        }
    });
});
