// Extension drugs: registration and validation, detection from crafted items, the per-drug opt-in, dose delivery by
// drink / injection / breath, levels and decay, wearing off, curing, the bars published to other players, and the
// crafting-screen and settings entries.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { MiscModule } from "Modules/misc";
import { StateModule } from "Modules/states";
import { KitContext } from "../../src/Dom/kit";
import { buildInjectorTabs } from "../../src/Settings/injector-pages";
import { DRUG_BAR_DIMENSIONS } from "../../src/constants/ui-dimensions";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { extensionDrugs, DEFAULT_DRUG_COLOR, MAX_EXTENSION_BARS } from "api/drugs";
import { apiCapabilities } from "api";
import type { LSCGDrugDefinition, LSCGDrugDoseContext } from "api/types";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";

describe("extension drugs", () => {
    let injector: InjectorModule;
    let core: CoreModule;
    let states: StateModule;
    let api: ModApiHandle;
    let handheldGroup: ReturnType<typeof makeGroup>;
    let sender: FixtureCharacter;
    let ids = 0;

    beforeAll(() => {
        [core, , , , injector, , states] = boot(
            new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
            new InjectorModule(), new HypnoModule(), new StateModule(),
        );
        vi.useFakeTimers();
    });

    beforeEach(() => {
        resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
        states.init();
        injector.init();
        injector.settings.enabled = true;
        injector.settings.extensionDrugLevels = {};
        injector.settings.enabledExtensionDrugs = [];
        handheldGroup = makeGroup({ Name: "ItemHandheld" });
        sender = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
        api = registerExtension({ id: `drugs-${++ids}`, name: "Drug Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    const id = (name: string) => `${api.id}.${name}`;
    const euphoria = (overrides: Partial<LSCGDrugDefinition> = {}): LSCGDrugDefinition => ({
        name: "euphoria", label: "Euphoria", keywords: ["euphoria"], onDose: () => {}, ...overrides,
    });
    const give = (craftName: string, asset = "GlassFilled", description = "") =>
        wear(sender, makeItem(makeAsset(handheldGroup, { Name: asset }), { Craft: { Name: craftName, Description: description } }));
    const opt = (name: string, on = true) => injector.SetExtensionDrugEnabled(id(name), on);

    it("is advertised as a capability", () => {
        expect(apiCapabilities.has("drugs")).toBe(true);
    });

    describe("registration", () => {
        it("registers under the extension's namespace, with defaults", () => {
            api.drugs.register(euphoria());
            expect(extensionDrugs.get(id("euphoria"))).toMatchObject({
                id: id("euphoria"), source: "Drug Pack", label: "Euphoria", keywords: ["euphoria"], color: DEFAULT_DRUG_COLOR, max: 10, decayPerMinute: 1,
            });
        });

        it("rejects duplicates and bad definitions, registering nothing", () => {
            api.drugs.register(euphoria());
            expect(() => api.drugs.register(euphoria())).toThrow(/already registered/);
            expect(() => api.drugs.register(euphoria({ name: "a.b" }))).toThrow(/invalid name/);
            expect(() => api.drugs.register(euphoria({ name: "x", keywords: [] }))).toThrow(/at least one keyword/);
            expect(() => api.drugs.register(euphoria({ name: "x", keywords: [" "] }))).toThrow(/keyword 1/);
            expect(() => api.drugs.register(euphoria({ name: "x", label: "" }))).toThrow(/label/);
            expect(() => api.drugs.register(euphoria({ name: "x", onDose: undefined as never }))).toThrow(/onDose/);
            expect(() => api.drugs.register(euphoria({ name: "x", max: 0 }))).toThrow(/max/);
            expect(() => api.drugs.register(euphoria({ name: "x", decayPerMinute: -1 }))).toThrow(/decayPerMinute/);
            expect(extensionDrugs.has(id("x"))).toBe(false);
        });

        it("unregister and dispose remove it", () => {
            api.drugs.register(euphoria());
            expect(api.drugs.unregister("euphoria")).toBe(true);
            expect(api.drugs.unregister("euphoria")).toBe(false);
            api.drugs.register(euphoria());
            api.dispose();
            expect(extensionDrugs.has(id("euphoria"))).toBe(false);
        });
    });

    describe("detection", () => {
        it("a crafted item is the drug if its name or description has a keyword, alongside LSCG's own", () => {
            api.drugs.register(euphoria());
            expect(injector.GetDrugTypes({ Name: "Pure Euphoria", Description: "" } as never)).toEqual([id("euphoria")]);
            expect(injector.GetDrugTypes({ Name: "Mystery", Description: "a hint of EUPHORIA, and a sedative" } as never)).toEqual(["sedative", id("euphoria")]);
            expect(injector.GetDrugTypes({ Name: "Water", Description: "" } as never)).toEqual([]);
        });

        it("leaves LSCG's own detection alone when no extension drugs exist", () => {
            expect(injector.GetDrugTypes({ Name: "Tranquilizer Serum", Description: "" } as never)).toEqual(["sedative"]);
        });
    });

    describe("opting in", () => {
        it("a drug does nothing to a player who hasn't enabled it", () => {
            const onDose = vi.fn();
            api.drugs.register(euphoria({ onDose }));
            give("Euphoria Cocktail");
            expect(injector.IsDrugAllowed(sender as never)).toBe(false);
            injector.ProcessDruggedDrink(sender as never);
            expect(onDose).not.toHaveBeenCalled();
        });

        it("enabling one drug doesn't enable another", () => {
            const first = vi.fn();
            const second = vi.fn();
            api.drugs.register(euphoria({ onDose: first }));
            api.drugs.register(euphoria({ name: "calm", label: "Calm", keywords: ["calm"], onDose: second }));
            opt("euphoria");
            give("Euphoria and Calm");
            injector.ProcessDruggedDrink(sender as never);
            expect(first).toHaveBeenCalledOnce();
            expect(second).not.toHaveBeenCalled();
        });

        it("makes the item count as an allowed drug, and can be turned off again", () => {
            api.drugs.register(euphoria());
            give("Euphoria Cocktail");
            opt("euphoria");
            expect(injector.IsDrugAllowed(sender as never)).toBe(true);
            opt("euphoria", false);
            expect(injector.IsDrugAllowed(sender as never)).toBe(false);
        });

        it("is off when the whole module is off", () => {
            api.drugs.register(euphoria());
            opt("euphoria");
            injector.settings.enabled = false;
            expect(injector.Enabled).toBe(false);
        });
    });

    describe("doses", () => {
        it("a drink delivers the drink multiplier and the sender", () => {
            const onDose = vi.fn();
            api.drugs.register(euphoria({ onDose }));
            opt("euphoria");
            give("Euphoria Cocktail");
            injector.ProcessDruggedDrink(sender as never);
            expect(onDose).toHaveBeenCalledOnce();
            expect(onDose.mock.calls[0][0]).toMatchObject({ drug: id("euphoria"), method: "drink", multiplier: 2, sender: 5, level: 0, max: 10 });
        });

        it("an injection delivers the site multiplier and where it went", () => {
            const doses: LSCGDrugDoseContext[] = [];
            api.drugs.register(euphoria({ onDose: ctx => { doses.push({ ...ctx }); } }));
            opt("euphoria");
            give("Euphoria Shot", "MedicalInjector");
            injector.ProcessInjection(sender as never, "ItemNeck");
            injector.ProcessInjection(sender as never, "ItemFeet");
            expect(doses.map(d => [d.method, d.multiplier, d.location])).toEqual([["inject", 2, "ItemNeck"], ["inject", 0.8, "ItemFeet"]]);
        });

        it("a breath delivers a small dose with no sender", () => {
            const onDose = vi.fn();
            api.drugs.register(euphoria({ onDose }));
            injector.ApplyExtensionDrug(id("euphoria"), "breath", { multiplier: 0.15 });
            expect(onDose.mock.calls[0][0]).toMatchObject({ method: "breath", multiplier: 0.15, sender: undefined });
        });

        it("a dose can raise the level, which is kept within 0 and max and saved", () => {
            api.drugs.register(euphoria({ max: 4, onDose: ctx => { ctx.addLevel(ctx.multiplier * 3); } }));
            opt("euphoria");
            give("Euphoria Cocktail");
            injector.ProcessDruggedDrink(sender as never);
            expect(injector.GetExtensionLevel(id("euphoria"))).toBe(4);
            expect(injector.settings.extensionDrugLevels[id("euphoria")]).toBe(4);
        });

        it("ctx.level is live, and setLevel returns the clamped value", () => {
            let seen: number[] = [];
            api.drugs.register(euphoria({
                onDose: ctx => {
                    seen.push(ctx.level);
                    ctx.addLevel(3);
                    seen.push(ctx.level);
                    seen.push(ctx.setLevel(999));
                    seen.push(ctx.setLevel(Number.NaN));
                },
            }));
            injector.ApplyExtensionDrug(id("euphoria"), "drink", { multiplier: 1 });
            expect(seen).toEqual([0, 3, 10, 0]);
        });

        it("the dose can drive a built-in state and send an emote", () => {
            api.drugs.register(euphoria({
                onDose: ctx => {
                    ctx.sendAction("%NAME% giggles.");
                    ctx.states.get("blind")?.activate(undefined, 5000);
                    expect(ctx.states.get("redressed" as never)).toBeUndefined();
                },
            }));
            injector.ApplyExtensionDrug(id("euphoria"), "drink", { multiplier: 1, sender: sender as never });
            expect(states.BlindState.Active).toBe(true);
            expect(states.BlindState.config.activatedBy).toBe(5);
        });

        it("an error in onDose is contained and counted", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.drugs.register(euphoria({ onDose: () => { throw new Error("boom"); } }));
            expect(() => injector.ApplyExtensionDrug(id("euphoria"), "drink", { multiplier: 1 })).not.toThrow();
            expect(api.errorCount).toBe(1);
            err.mockRestore();
        });

        it("a drug that was unregistered after the item was checked is skipped", () => {
            expect(() => injector.ApplyExtensionDrug("gone.drug", "drink", { multiplier: 1 })).not.toThrow();
        });
    });

    describe("events", () => {
        it("drug.applied lists extension drugs with the built-ins, and drug.beforeApply can veto them", () => {
            api.drugs.register(euphoria());
            opt("euphoria");
            injector.settings.enableSedative = true;
            give("Sedative Euphoria");
            const applied = vi.fn();
            api.events.on("drug.applied", applied);
            injector.ProcessDruggedDrink(sender as never);
            expect(applied.mock.calls[0][0].types).toEqual(["sedative", id("euphoria")]);

            const onDose = vi.fn();
            api.drugs.unregister("euphoria");
            api.drugs.register(euphoria({ onDose }));
            api.events.before("drug.beforeApply", ctx => { ctx.payload.types = ctx.payload.types.filter(t => t !== id("euphoria")); });
            injector.ProcessDruggedDrink(sender as never);
            expect(onDose).not.toHaveBeenCalled();
        });
    });

    describe("levels over time", () => {
        const minute = () => vi.advanceTimersByTime(60_000);
        const tick = (times: number) => { for (let i = 0; i < times; i++) injector.ExtensionDrugTick(); };
        const ticksPerMinute = () => 60_000 / injector.cooldownTickMs;

        it("falls by the drug's own rate each minute, and is forgotten at 0", () => {
            api.drugs.register(euphoria({ decayPerMinute: 2 }));
            injector.SetExtensionLevel(id("euphoria"), 5);
            tick(ticksPerMinute());
            expect(injector.GetExtensionLevel(id("euphoria"))).toBeCloseTo(3, 5);
            tick(ticksPerMinute() * 2);
            expect(injector.GetExtensionLevel(id("euphoria"))).toBe(0);
            expect(injector.settings.extensionDrugLevels).toEqual({});
            minute();
        });

        it("decayPerMinute 0 never wears off by itself", () => {
            api.drugs.register(euphoria({ decayPerMinute: 0 }));
            injector.SetExtensionLevel(id("euphoria"), 5);
            tick(ticksPerMinute() * 10);
            expect(injector.GetExtensionLevel(id("euphoria"))).toBe(5);
        });

        it("runs onTick while the level is above 0, but only for a drug the player enabled", () => {
            const onTick = vi.fn();
            api.drugs.register(euphoria({ onTick }));
            injector.SetExtensionLevel(id("euphoria"), 5);
            injector.ExtensionDrugTick();
            expect(onTick).not.toHaveBeenCalled();
            opt("euphoria");
            injector.ExtensionDrugTick();
            expect(onTick).toHaveBeenCalledOnce();
            expect(onTick.mock.calls[0][0]).toMatchObject({ drug: id("euphoria"), max: 10 });
            expect(onTick.mock.calls[0][0].level).toBeLessThan(5);
        });

        it("runs onWearOff once when the level reaches 0, whether by decay or setLevel", () => {
            const onWearOff = vi.fn();
            api.drugs.register(euphoria({ onWearOff, decayPerMinute: 60 }));
            injector.SetExtensionLevel(id("euphoria"), 0.05);
            injector.ExtensionDrugTick();
            expect(onWearOff).toHaveBeenCalledOnce();

            injector.SetExtensionLevel(id("euphoria"), 3);
            injector.SetExtensionLevel(id("euphoria"), 0);
            expect(onWearOff).toHaveBeenCalledTimes(2);
            injector.SetExtensionLevel(id("euphoria"), 0);
            expect(onWearOff).toHaveBeenCalledTimes(2);
        });

        it("runs onFull whenever a dose overflows the bar, once even if onFull doses again", () => {
            const onFull = vi.fn((ctx: { addLevel(n: number): number }) => { ctx.addLevel(5); });
            api.drugs.register(euphoria({ onFull, onDose: ctx => { ctx.addLevel(ctx.multiplier); } }));
            injector.ApplyExtensionDrug(id("euphoria"), "drink", { multiplier: 6 });
            expect(onFull).not.toHaveBeenCalled();
            injector.ApplyExtensionDrug(id("euphoria"), "drink", { multiplier: 6 });
            expect(onFull).toHaveBeenCalledOnce();
        });

        it("runs onSpike at random on a tick, never at a near-empty bar when the roll is high", () => {
            const onSpike = vi.fn();
            api.drugs.register(euphoria({ onSpike, spikeChance: 1, decayPerMinute: 0 }));
            opt("euphoria");
            injector.SetExtensionLevel(id("euphoria"), 10);
            const roll = vi.spyOn(Math, "random").mockReturnValue(0.5);
            injector.ExtensionDrugTick();
            expect(onSpike).toHaveBeenCalledOnce();
            injector.SetExtensionLevel(id("euphoria"), 1);
            injector.ExtensionDrugTick();
            expect(onSpike).toHaveBeenCalledOnce();
            roll.mockRestore();
        });

        it("runs threshold callbacks as the level crosses them, in bar order, rising and falling", () => {
            const log: string[] = [];
            const t = (at: number) => ({ at, onReach: () => { log.push(`up${at}`); }, onDrop: () => { log.push(`down${at}`); } });
            api.drugs.register(euphoria({ thresholds: [t(1), t(0.3), t(0.6)] }));
            injector.SetExtensionLevel(id("euphoria"), 4);
            expect(log).toEqual(["up0.3"]);
            injector.SetExtensionLevel(id("euphoria"), 10);
            expect(log).toEqual(["up0.3", "up0.6", "up1"]);
            injector.SetExtensionLevel(id("euphoria"), 2);
            expect(log.slice(3)).toEqual(["down1", "down0.6", "down0.3"]);
        });

        it("rejects a threshold outside (0, 1]", () => {
            expect(() => api.drugs.register(euphoria({ thresholds: [{ at: 0 }] }))).toThrow(/threshold 1/);
            expect(() => api.drugs.register(euphoria({ thresholds: [{ at: 1.5 }] }))).toThrow(/threshold 1/);
        });

        it("ticks each drug at its own tickSeconds, decaying by decayPerMinute either way", () => {
            const fast = vi.fn(), slow = vi.fn();
            api.drugs.register(euphoria({ name: "fast", label: "Fast", keywords: ["fast"], onTick: fast, tickSeconds: 1, decayPerMinute: 6 }));
            api.drugs.register(euphoria({ name: "slow", label: "Slow", keywords: ["slow"], onTick: slow, decayPerMinute: 6 }));
            opt("fast"); opt("slow");
            injector.SetExtensionLevel(id("fast"), 5);
            injector.SetExtensionLevel(id("slow"), 5);
            // The module polls once a second; do the same by hand.
            for (let i = 0; i < 12; i++) { injector.ExtensionDrugTick(Date.now()); vi.advanceTimersByTime(1000); }
            expect(fast).toHaveBeenCalledTimes(12);
            expect(slow).toHaveBeenCalledTimes(2);
            // Decay is wall-clock: the first tick owes nothing, then 11s have passed for fast and 6s for slow.
            expect(injector.GetExtensionLevel(id("fast"))).toBeCloseTo(5 - 1.1);
            expect(injector.GetExtensionLevel(id("slow"))).toBeCloseTo(5 - 0.6);
        });

        it("an antidote (and a safeword) clears extension drugs and runs onWearOff", () => {
            const onWearOff = vi.fn();
            api.drugs.register(euphoria({ onWearOff }));
            injector.SetExtensionLevel(id("euphoria"), 7);
            injector.DoCure();
            expect(injector.GetExtensionLevel(id("euphoria"))).toBe(0);
            expect(onWearOff).toHaveBeenCalledOnce();

            injector.SetExtensionLevel(id("euphoria"), 7);
            injector.safeword();
            expect(injector.GetExtensionLevel(id("euphoria"))).toBe(0);
        });

        it("keeps a level for a drug whose extension isn't loaded, without publishing it", () => {
            api.drugs.register(euphoria());
            injector.SetExtensionLevel(id("euphoria"), 5);
            api.dispose();
            expect(injector.settings.extensionDrugLevels[id("euphoria")]).toBe(5);
            expect(injector.PublicExtensionBars()).toEqual([]);
            injector.ExtensionDrugTick();
            expect(injector.settings.extensionDrugLevels[id("euphoria")]).toBe(5);
        });
    });

    describe("api.drugs.dose", () => {
        it("doses an extension drug only if the player opted in, firing drug.applied", () => {
            const onDose = vi.fn((ctx: LSCGDrugDoseContext) => { ctx.addLevel(ctx.multiplier); });
            api.drugs.register(euphoria({ onDose }));
            const applied = vi.fn();
            api.events.on("drug.applied", applied);
            expect(api.drugs.dose(id("euphoria"))).toBe(false);
            opt("euphoria");
            expect(api.drugs.dose(id("euphoria"), { multiplier: 3, method: "inject" })).toBe(true);
            expect(onDose.mock.calls[0][0]).toMatchObject({ method: "inject", multiplier: 3 });
            expect(api.drugs.getLevel(id("euphoria"))).toBe(3);
            expect(applied).toHaveBeenCalledOnce();
        });

        it("can be vetoed by drug.beforeApply, and returns false for an unknown drug", () => {
            api.drugs.register(euphoria());
            opt("euphoria");
            api.events.before("drug.beforeApply", ctx => ctx.cancel("no"));
            expect(api.drugs.dose(id("euphoria"))).toBe(false);
            expect(api.drugs.dose("nobody.nothing")).toBe(false);
        });

        it("doses a built-in drug the player enabled, without the minigame when asked", () => {
            injector.settings.enableSedative = true;
            injector.sedativeLevel = 0;
            expect(api.drugs.dose("sedative", { multiplier: 1, minigame: false })).toBe(true);
            expect(api.drugs.getLevel("sedative")).toBeGreaterThan(0);
            injector.settings.enableSedative = false;
            expect(api.drugs.dose("sedative", { minigame: false })).toBe(false);
        });
    });

    describe("level events and saving", () => {
        it("emits drug.levelChanged for built-in and extension drugs", () => {
            const seen: unknown[] = [];
            api.events.on("drug.levelChanged", p => seen.push(p));
            api.drugs.register(euphoria());
            injector.SetExtensionLevel(id("euphoria"), 4);
            injector.sedativeLevel = 0;
            injector.sedativeLevel = 3;
            expect(seen).toEqual([
                { type: id("euphoria"), previous: 0, level: 4, max: 10 },
                { type: "sedative", previous: 0, level: 3, max: injector.settings.sedativeMax * injector.drugLevelMultiplier },
            ]);
        });

        it("doesn't save on decay ticks, only on doses and wear-off", () => {
            api.drugs.register(euphoria({ decayPerMinute: 6 }));
            const saves = vi.fn();
            api.events.on("settings.saved", saves);
            injector.SetExtensionLevel(id("euphoria"), 5);
            vi.advanceTimersByTime(2000);
            const afterDose = saves.mock.calls.length;
            expect(afterDose).toBeGreaterThan(0);
            for (let i = 0; i < 5; i++) injector.ExtensionDrugTick();
            vi.advanceTimersByTime(60_000);
            expect(saves).toHaveBeenCalledTimes(afterDose);
            expect(injector.GetExtensionLevel(id("euphoria"))).toBeCloseTo(2);
            injector.SetExtensionLevel(id("euphoria"), 0);
            vi.advanceTimersByTime(2000);
            expect(saves.mock.calls.length).toBeGreaterThan(afterDose);
        });

        it("decays by wall-clock time while online, capped so time asleep or logged out doesn't count", () => {
            api.drugs.register(euphoria({ decayPerMinute: 1 }));
            injector.SetExtensionLevel(id("euphoria"), 10);
            const t = Date.now();
            injector.ExtensionDrugTick(t);          // first sight: nothing owed yet
            injector.ExtensionDrugTick(t + 60_000); // a minute later in one go, as a throttled tab would
            expect(injector.GetExtensionLevel(id("euphoria"))).toBeCloseTo(9, 5);
            injector.ExtensionDrugTick(t + 60_000 + 3_600_000); // an hour with the laptop shut: only 2 minutes count
            expect(injector.GetExtensionLevel(id("euphoria"))).toBeCloseTo(7, 5);
        });

        it("saves decayed levels every few minutes without publishing, and only if they changed", () => {
            api.drugs.register(euphoria({ decayPerMinute: 1 }));
            injector.SetExtensionLevel(id("euphoria"), 5);
            injector.SaveDecayedLevels(); // clear anything earlier tests left unsaved
            vi.advanceTimersByTime(2000);
            const saves = vi.fn();
            api.events.on("settings.saved", saves);
            injector.SaveDecayedLevels();
            expect(saves).not.toHaveBeenCalled();
            injector.ExtensionDrugTick();
            injector.SaveDecayedLevels();
            expect(saves).toHaveBeenCalledWith({ published: false });
            vi.advanceTimersByTime(2000);
            injector.SaveDecayedLevels();
            expect(saves).toHaveBeenCalledOnce();
        });

        it("publishes decay rates and estimates another player's level between syncs", () => {
            api.drugs.register(euphoria({ decayPerMinute: 6 }));
            injector.SetExtensionLevel(id("euphoria"), 5);
            expect(injector.PublicExtensionBars()[0].decayPerSec).toBeCloseTo(0.1);
            const rates = injector.DecayRatesPerSec();
            expect(rates.sedative).toBeCloseTo(injector.drugLevelMultiplier * 1000 / injector.settings.sedativeCooldown);
            expect(InjectorModule.EstimateLevel(5, 0.1, 1000, 11_000)).toBeCloseTo(4);
            expect(InjectorModule.EstimateLevel(5, 0.1, 1000, 100_000)).toBe(0);
            expect(InjectorModule.EstimateLevel(5, undefined, 1000, 11_000)).toBe(5); // an old client: no estimate
            expect(InjectorModule.EstimateLevel(5, 0.1, undefined, 11_000)).toBe(5);   // our own: already live
        });
    });

    describe("built-in decay overrides", () => {
        afterEach(() => { injector.settings.decayMinutes = {}; injector.SetDecayOverride("sedative", undefined); });

        it("uses the default until the player sets minutes per dose, and 0 goes back to the default", () => {
            const fallback = injector.defaultSettings.sedativeCooldown;
            expect(injector.settings.sedativeCooldown).toBe(fallback);
            injector.SetDecayOverride("sedative", 10);
            expect(injector.GetDecayOverride("sedative")).toBe(10);
            expect(injector.settings.sedativeCooldown).toBe(600_000);
            expect(injector.DecayRatesPerSec().sedative).toBeCloseTo(injector.drugLevelMultiplier / 600);
            injector.SetDecayOverride("sedative", 0);
            expect(injector.GetDecayOverride("sedative")).toBeUndefined();
            expect(injector.settings.sedativeCooldown).toBe(fallback);
        });

        it("survives a reload, where defaults are otherwise re-applied", () => {
            injector.SetDecayOverride("sedative", 10);
            injector.settings.sedativeCooldown = 1;
            const reloaded = new InjectorModule();
            reloaded.init();
            reloaded.load();
            expect(reloaded.settings.sedativeCooldown).toBe(600_000);
            reloaded.unload();
        });
    });

    describe("bars published to the room", () => {
        it("lists only drugs with a level, with their colour and max", () => {
            api.drugs.register(euphoria({ color: "#ff00ff", max: 8 }));
            api.drugs.register(euphoria({ name: "calm", label: "Calm", keywords: ["calm"] }));
            expect(injector.PublicExtensionBars()).toEqual([]);
            injector.SetExtensionLevel(id("euphoria"), 4);
            expect(injector.PublicExtensionBars()).toEqual([{ id: id("euphoria"), level: 4, max: 8, color: "#ff00ff", decayPerSec: 1 / 60 }]);
        });

        it("goes out in the public settings packet", () => {
            api.drugs.register(euphoria());
            injector.SetExtensionLevel(id("euphoria"), 4);
            expect(core.publicSettings.InjectorModule.drugLevels).toEqual([{ id: id("euphoria"), level: 4, max: 10, color: DEFAULT_DRUG_COLOR, decayPerSec: 1 / 60 }]);
            expect(injector.settings).not.toHaveProperty("drugLevels");
        });

        it("draws the player's own from the registry, and others' from what they published, sanity-checked", () => {
            api.drugs.register(euphoria());
            injector.SetExtensionLevel(id("euphoria"), 4);
            expect(injector.ExtensionBarsFor(player() as never, undefined)).toHaveLength(1);

            const other = { IsPlayer: () => false } as never;
            const published = [
                { id: "a.good", level: 2, max: 5, color: "#abc" },
                { id: "a.badcolor", level: 2, max: 5, color: "url(javascript:alert(1))<>" },
                { id: "a.empty", level: 0, max: 5, color: "red" },
                { id: "a.nan", level: Number.NaN, max: 5, color: "red" },
                { id: "a.nomax", level: 1, max: 0, color: "red" },
                null,
            ] as never;
            expect(injector.ExtensionBarsFor(other, published)).toEqual([
                { id: "a.good", level: 2, max: 5, color: "#abc" },
                { id: "a.badcolor", level: 2, max: 5, color: DEFAULT_DRUG_COLOR },
            ]);
            expect(injector.ExtensionBarsFor(other, "nope" as never)).toEqual([]);
            expect(injector.ExtensionBarsFor(other, undefined)).toEqual([]);
        });

        it("caps how many bars one player can make appear, so they fit in two rows with LSCG's own three", () => {
            expect(MAX_EXTENSION_BARS + 3).toBeLessThanOrEqual(DRUG_BAR_DIMENSIONS.BARS_PER_ROW * DRUG_BAR_DIMENSIONS.MAX_ROWS);
            const many = Array.from({ length: 40 }, (_, i) => ({ id: `x.d${i}`, level: 1, max: 5, color: "red" }));
            expect(injector.ExtensionBarsFor({ IsPlayer: () => false } as never, many)).toHaveLength(MAX_EXTENSION_BARS);
        });

        it("when over the cap keeps the fullest bars, in their original order", () => {
            const bars = Array.from({ length: MAX_EXTENSION_BARS + 3 }, (_, i) => ({ id: `x.d${i}`, level: i === 0 || i === 1 || i === 2 ? 1 : 4, max: 5, color: "red" }));
            const kept = InjectorModule.FullestBars(bars).map(b => b.id);
            expect(kept).toHaveLength(MAX_EXTENSION_BARS);
            expect(kept).not.toContain("x.d0");
            expect(kept).not.toContain("x.d1");
            expect(kept).not.toContain("x.d2");
            expect(kept).toEqual([...kept].sort((a, b) => Number(a.slice(3)) - Number(b.slice(3))));
            expect(InjectorModule.FullestBars(bars.slice(0, 3))).toHaveLength(3);
        });

        it("the player's own published bars follow the same cap", () => {
            for (let i = 0; i < MAX_EXTENSION_BARS + 4; i++) {
                api.drugs.register(euphoria({ name: `d${i}`, label: `D${i}`, keywords: [`d${i}`] }));
                injector.SetExtensionLevel(id(`d${i}`), i + 1 > 10 ? 10 : i + 1);
            }
            const bars = injector.PublicExtensionBars();
            expect(bars).toHaveLength(MAX_EXTENSION_BARS);
            expect(bars.map(b => b.id)).toContain(id(`d${MAX_EXTENSION_BARS + 3}`)); // the fullest are kept
            expect(bars.map(b => b.id)).not.toContain(id("d0"));
        });

        describe("drawing", () => {
            const draw = (count: number) => {
                const rect = vi.fn();
                (globalThis as any).DrawRect = rect;
                (globalThis as any).DrawEmptyRect = vi.fn();
                injector.DrawBars({ IsPlayer: () => true } as never, 100, 200, 1, Array.from({ length: count }, (_, i) => ({ type: `x.d${i}`, level: 1, max: 2, color: "red" })));
                // the first call per bar is its black background: x, y, width, height
                return rect.mock.calls.filter(c => c[4] === "Black").map(c => ({ x: c[0] as number, y: c[1] as number }));
            };

            it("puts the first row side by side, as before", () => {
                const bars = draw(3);
                const { X_OFFSET, Y_OFFSET, BAR_SPACING } = DRUG_BAR_DIMENSIONS;
                expect(bars).toEqual([0, 1, 2].map(i => ({ x: 100 + X_OFFSET + BAR_SPACING * i, y: 200 + Y_OFFSET })));
            });

            it("wraps past a full row onto a second row above, starting over from the left", () => {
                const perRow = DRUG_BAR_DIMENSIONS.BARS_PER_ROW;
                const bars = draw(perRow + 2);
                expect(bars[perRow].x).toBe(bars[0].x);
                expect(bars[perRow + 1].x).toBe(bars[1].x);
                expect(bars[perRow].y).toBe(bars[0].y - DRUG_BAR_DIMENSIONS.ROW_SPACING);
                expect(bars[perRow - 1].y).toBe(bars[0].y);
            });

            it("keeps every bar within the character's width, and never draws more than the rows allow", () => {
                const bars = draw(100);
                expect(bars).toHaveLength(DRUG_BAR_DIMENSIONS.BARS_PER_ROW * DRUG_BAR_DIMENSIONS.MAX_ROWS);
                const widest = Math.max(...bars.map(b => b.x - 100)) + DRUG_BAR_DIMENSIONS.BAR_WIDTH * DRUG_BAR_DIMENSIONS.BAR_ZOOM;
                expect(widest).toBeLessThanOrEqual(500);
            });

            it("a bar's own colour is used", () => {
                const rect = vi.fn();
                (globalThis as any).DrawRect = rect;
                (globalThis as any).DrawEmptyRect = vi.fn();
                injector.DrawBars({ IsPlayer: () => true } as never, 0, 0, 1, [{ type: "x.d", level: 1, max: 2, color: "#ff00ff" }]);
                expect(rect.mock.calls.some(c => c[4] === "#ff00ff")).toBe(true);
            });
        });
    });

    describe("crafting screen and settings", () => {
        it("the crafting screen offers each drug, with element ids that are safe for any name", () => {
            api.drugs.register(euphoria({ name: "weird name!", label: "Weird", keywords: ["weird"], description: "Odd." }));
            const misc = new MiscModule();
            const option = misc.allDrugOptions.find(o => o.label === "Weird")!;
            expect(option).toMatchObject({ type: "checkbox", keywords: ["weird"] });
            expect(option.description).toContain("Odd.");
            expect(option.id_button).toMatch(/^crafting-lscg-effects-ext-[a-z0-9_-]+-checkbox$/);
            expect(option.id_label).not.toBe(option.id_button);
            // the built-ins are still there, first
            expect(misc.allDrugOptions.slice(0, 4).map(o => o.label)).toEqual(["Sedative", "Aphrodisiac", "Mind control", "Antidote"]);
            expect(misc.getAllOptionsElem().some(o => o.id_button === option.id_button)).toBe(true);
        });

        it("only offers it for the same items as the built-in drugs", () => {
            api.drugs.register(euphoria());
            const option = new MiscModule().allDrugOptions.find(o => o.label === "Euphoria")!;
            (globalThis as any).CraftingSelectedItem = { Asset: { Name: "Mug" } };
            expect(option.condition()).toBe(true);
            (globalThis as any).CraftingSelectedItem = { Asset: { Name: "Rope" } };
            expect(option.condition()).toBe(false);
            (globalThis as any).CraftingSelectedItem = undefined;
        });

        describe("the Drug Enhancements settings (DOM)", () => {
            const tabs = (misc: Record<string, unknown> = {}) => buildInjectorTabs(new KitContext(), injector.settings, misc as never, injector);
            const render = (label: string, misc?: Record<string, unknown>) => {
                const root = document.createElement("div");
                document.body.append(root);
                root.append(...tabs(misc).find(t => t.label === label)!.render());
                return root;
            };
            const row = (root: HTMLElement, label: string) =>
                Array.from(root.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === label) as HTMLElement;
            const change = (el: HTMLInputElement) => el.dispatchEvent(new Event("change"));
            afterEach(() => document.body.replaceChildren());

            it("has a tab each for general options, drugs, and gases & chloroform", () => {
                expect(tabs().map(t => t.label)).toEqual(["General", "Drugs", "Gases & chloroform"]);
            });

            it("general options read and write the injector settings, and the sip limit is off while disabled", () => {
                injector.settings.enabled = false;
                injector.settings.sipLimit = 0;
                const root = render("General");
                const sips = row(root, "Filled glass sip limit").querySelector("input") as HTMLInputElement;
                expect(sips.disabled).toBe(true);
                const enabled = row(root, "Enabled").querySelector("input") as HTMLInputElement;
                enabled.checked = true; change(enabled);
                expect(injector.settings.enabled).toBe(true);
                expect((row(root, "Filled glass sip limit").querySelector("input") as HTMLInputElement).disabled).toBe(false);
                const sips2 = row(root, "Filled glass sip limit").querySelector("input") as HTMLInputElement;
                sips2.value = "4"; change(sips2);
                expect(injector.settings.sipLimit).toBe(4);
                const chaotic = row(root, "Chaotic net gun").querySelector("input") as HTMLInputElement;
                chaotic.checked = true; change(chaotic);
                expect(injector.settings.netgunIsChaotic).toBe(true);
            });

            it("LSCG's own drugs have their opt-in toggles", () => {
                injector.settings.enableSedative = false;
                const root = render("Drugs");
                const box = row(root, "Sedative").querySelector("input") as HTMLInputElement;
                box.checked = true; change(box);
                expect(injector.settings.enableSedative).toBe(true);
                expect(row(root, "Brainwash drug")).toBeDefined();
                expect(row(root, "Aphrodisiac")).toBeDefined();
            });

            it("says so when no extension adds a drug", () => {
                expect(render("Drugs").textContent).toContain("No installed extension adds a drug.");
            });

            it("lists each extension drug with its source and keywords, and opts in per drug, with no page limit", () => {
                for (let i = 0; i < 25; i++)
                    api.drugs.register(euphoria({ name: `d${i}`, label: `Drug ${i}`, keywords: [`d${i}`, `alt ${i}`], description: "Odd." }));
                const root = render("Drugs");
                const rows = Array.from(root.querySelectorAll("tbody tr"));
                expect(rows).toHaveLength(25);
                const first = rows[0];
                expect(first.textContent).toContain("Drug 0");
                expect(first.textContent).toContain("Drug Pack");
                expect(first.textContent).toContain('"d0"');
                expect(first.textContent).toContain('"alt 0"');
                const box = first.querySelector("input[type=checkbox]") as HTMLInputElement;
                expect(box.checked).toBe(false);
                box.checked = true; change(box);
                expect(injector.ExtensionDrugEnabled(id("d0"))).toBe(true);
                expect(injector.ExtensionDrugEnabled(id("d1"))).toBe(false);
            });

            it("gases and chloroform write to the right modules' settings", () => {
                const misc = { chloroformEnabled: false, infiniteChloroformPotency: false };
                const root = render("Gases & chloroform", misc);
                const chloro = row(root, "Enable chloroform").querySelector("input") as HTMLInputElement;
                chloro.checked = true; change(chloro);
                expect(misc.chloroformEnabled).toBe(true);
                const forever = row(root, "Chloroform never fades").querySelector("input") as HTMLInputElement;
                forever.checked = true; change(forever);
                expect(misc.infiniteChloroformPotency).toBe(true);
                const gas = row(root, "Inexhaustible gases").querySelector("input") as HTMLInputElement;
                gas.checked = true; change(gas);
                expect(injector.settings.continuousDeliveryForever).toBe(true);
            });
        });
    });
});
