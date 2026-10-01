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
import { LSCGSpellEffect, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { builtInEffectIds, effectDescription, effectLabel, extensionEffectIds, getSpellEffect, spellEffects, spellIsBeneficial } from "Modules/Magic/spellEffects";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

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
