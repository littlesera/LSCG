// Extension API events emitted by real modules: state transitions (with recover reasons), the incoming-spell
// before-hooks, the incoming-grab veto, and the drug before-hook.
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
import { registerExtension, type ModApiHandle } from "api/extensions";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("extension API events from LSCG modules", () => {
    let magic: MagicModule;
    let states: StateModule;
    let leashing: LeashingModule;
    let injector: InjectorModule;
    let alice: FixtureCharacter;
    let api: ModApiHandle;
    let ids = 0;

    beforeAll(() => {
        [, , , , , injector, magic, states, leashing] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
            new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new LeashingModule());
        vi.useFakeTimers();
    });

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
        api = registerExtension({ id: `integration-${++ids}`, name: "Integration", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    function spell(name: string, effects: LSCGSpellEffect[]): SpellDefinition {
        return { Name: name, Creator: 2, Effects: effects, AllowPotion: false, AllowVoiceCast: false };
    }

    describe("state events", () => {
        it("fire only on transitions, with the reason for recovery", () => {
            const activated = vi.fn();
            const recovered = vi.fn();
            api.events.on("state.activated", activated);
            api.events.on("state.recovered", recovered);

            states.BlindState.Activate(2, 60_000);
            states.BlindState.Activate(2, 60_000); // already active: no second event
            expect(activated).toHaveBeenCalledOnce();
            expect(activated).toHaveBeenCalledWith({ type: "blind", activatedBy: 2, duration: 60_000 });

            states.BlindState.Recover();
            states.BlindState.Recover(); // already inactive: no second event
            expect(recovered).toHaveBeenCalledOnce();
            expect(recovered).toHaveBeenLastCalledWith({ type: "blind", reason: "manual" });
        });

        it("reports expiry, safeword, and dispel", () => {
            const reasons: string[] = [];
            api.events.on("state.recovered", p => reasons.push(`${p.type}:${p.reason}`));

            states.BlindState.Activate(2, 1000);
            states.BlindState.Tick(Date.now() + 5000);

            states.DeafState.Activate(2);
            states.safeword();

            states.FrozenState.Activate(2);
            magic.IncomingSpell(alice as never, spell("dispel", [LSCGSpellEffect.dispel]), null, 1);
            vi.advanceTimersByTime(2500);

            expect(reasons).toEqual(["blind:expired", "deaf:safeword", "frozen:dispel"]);
        });
    });

    describe("incoming spells", () => {
        it("emits received and effectApplied for each effect", () => {
            const received = vi.fn();
            const applied: string[] = [];
            api.events.on("spell.received", received);
            api.events.on("spell.effectApplied", p => applied.push(p.effect));
            magic.IncomingSpell(alice as never, spell("double", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), null, 1);
            vi.advanceTimersByTime(4500);
            expect(received).toHaveBeenCalledOnce();
            expect(received.mock.calls[0][0]).toMatchObject({ sender: 2, effects: ["Blinding", "Deafening"] });
            expect(applied).toEqual(["Blinding", "Deafening"]);
        });

        it("spell.beforeReceive can veto the whole spell", () => {
            api.events.before("spell.beforeReceive", ctx => ctx.cancel("warded"));
            magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 1);
            vi.advanceTimersByTime(2500);
            expect(states.BlindState.Active).toBe(false);
            expect(sent.actions().some(a => a.includes("fizzles") && a.includes("warded"))).toBe(true);
        });

        it("spell.beforeReceive can remove effects and change the duration, but not add effects", () => {
            magic.settings.limitedDuration = true;
            api.events.before("spell.beforeReceive", ctx => {
                ctx.payload.effects = ctx.payload.effects.filter(e => e !== "Blinding").concat(["Petrifying"]);
                ctx.payload.duration = 42_000;
            });
            magic.IncomingSpell(alice as never, spell("double", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), null, 1);
            vi.advanceTimersByTime(4500);
            expect(states.BlindState.Active).toBe(false);
            expect(states.FrozenState.Active).toBe(false);
            expect(states.DeafState.Active).toBe(true);
            expect(states.DeafState.config.duration).toBe(42_000);
        });

        it("spell.beforeEffect can veto one effect or change its duration", () => {
            magic.settings.limitedDuration = true;
            api.events.before("spell.beforeEffect", ctx => {
                if (ctx.payload.effect === "Blinding") ctx.cancel();
                else ctx.payload.duration = 7_000;
            });
            magic.IncomingSpell(alice as never, spell("double", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), null, 1);
            vi.advanceTimersByTime(4500);
            expect(states.BlindState.Active).toBe(false);
            expect(states.DeafState.Active).toBe(true);
            expect(states.DeafState.config.duration).toBe(7_000);
            expect(sent.actions().some(a => a.includes("fails to take hold"))).toBe(true);
        });

        it("keeps LSCG's duration when an extension supplies a nonsense one", () => {
            magic.settings.limitedDuration = true;
            api.events.before("spell.beforeReceive", ctx => { ctx.payload.duration = -5; });
            magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 2);
            vi.advanceTimersByTime(2500);
            expect(states.BlindState.Active).toBe(true);
            expect(states.BlindState.config.duration).toBe(2 * 5 * 60_000);
        });
    });

    describe("grabs", () => {
        it("emits added and removed", () => {
            const added = vi.fn();
            const removed = vi.fn();
            api.events.on("grab.added", added);
            api.events.on("grab.removed", removed);
            leashing.IncomingGrab(alice as never, "arm");
            leashing.IncomingRelease(2, "arm", true);
            expect(added).toHaveBeenCalledWith({ type: "arm", pairedMember: 2, isSource: false });
            expect(removed).toHaveBeenCalledWith({ type: "arm", pairedMember: 2, isSource: false });
        });

        it("grab.beforeIncoming can refuse a grab and tells the grabber to release", () => {
            api.events.before("grab.beforeIncoming", ctx => ctx.cancel());
            leashing.IncomingGrab(alice as never, "arm");
            expect(leashing.Pairings).toHaveLength(0);
            const beep = sent.beeps().find(b => b.message.command?.name === "release");
            expect(beep?.target).toBe(2);
            expect(beep?.message.command?.args).toEqual([{ name: "type", value: "arm" }, { name: "isSource", value: false }]);
        });
    });

    describe("drugs", () => {
        it("only offers enabled drug types, and drug.beforeApply can remove some or cancel", () => {
            injector.settings.enableSedative = true;
            injector.settings.enableHorny = false;
            expect(injector.EnabledDrugTypes(["sedative", "horny", "antidote"])).toEqual(["sedative", "antidote"]);

            const off = api.events.before("drug.beforeApply", ctx => {
                ctx.payload.types = ctx.payload.types.filter(t => t !== "sedative").concat(["mindcontrol"]);
            });
            expect(injector.HookDrugApply(["sedative", "antidote"], "drink", alice as never)).toEqual(["antidote"]);
            off();

            api.events.before("drug.beforeApply", ctx => ctx.cancel());
            expect(injector.HookDrugApply(["sedative"], "inject", alice as never, "ItemArms")).toEqual([]);
        });
    });
});
