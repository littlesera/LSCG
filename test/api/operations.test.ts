// Operations: what an extension may do to the player once they allow it. The permission gate (denied, requested, granted,
// revoked, kept per player), then each scope's calls against the real modules.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { announceReady, apiCapabilities } from "api";
import { OPERATION_SCOPES, operationRequests, setScopeGranted } from "api/operations";
import type { LSCGOperationScope } from "api/types";
import { boot, resetWorld } from "../harness/world";

// Readiness is one-way for the module, so this runs before the block below calls announceReady().
describe("extension operations before LSCG is ready", () => {
    it("says so, once allowed, rather than failing somewhere inside a module", () => {
        const g = globalThis as any;
        const had = g.Player;
        g.Player = { MemberNumber: 1 };
        const early = registerExtension({ id: "early-ops", name: "Early", version: "1" });
        setScopeGranted("early-ops", "hypno", true);
        expect(() => early.operations.hypno.isHypnotized()).toThrow(/onReady/);
        early.dispose();
        localStorage.clear();
        g.Player = had;
    });
});

describe("extension operations", () => {
    let states: StateModule;
    let leashing: LeashingModule;
    let hypno: HypnoModule;
    let injector: InjectorModule;
    let api: ModApiHandle;
    let ids = 0;

    beforeAll(() => {
        [, , , leashing, injector, hypno, states] = boot(
            new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
            new InjectorModule(), new HypnoModule(), new StateModule(),
        );
        announceReady();
        vi.useFakeTimers();
    });

    beforeEach(() => {
        localStorage.clear();
        resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
        states.init();
        injector.init();
        api = registerExtension({ id: `ops-${++ids}`, name: "Ops Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    const allow = (...scopes: LSCGOperationScope[]) => scopes.forEach(s => setScopeGranted(api.id, s, true));

    it("is advertised as a capability", () => {
        expect(apiCapabilities.has("operations")).toBe(true);
    });

    describe("permission", () => {
        it("denies every scope until the player allows it, naming the error so callers can tell", () => {
            let error: Error | undefined;
            try { api.operations.hypno.trigger(); } catch (e) { error = e as Error; }
            expect(error?.name).toBe("LSCGPermissionError");
            expect(error?.message).toMatch(/hasn't allowed the "hypno"/);
            expect(api.operations.granted()).toEqual([]);
            expect(api.operations.isGranted("hypno")).toBe(false);
        });

        it("shows the player a request for a denied call, and for one the extension makes", () => {
            expect(() => api.operations.collar.release()).toThrow();
            api.operations.request(["magic", "drugs"], "  Casting for the quest  ");
            const request = operationRequests().find(r => r.id === api.id)!;
            expect([...request.scopes].sort()).toEqual(["collar", "drugs", "magic"]);
            expect(request.name).toBe("Ops Pack");
            expect(request.reason).toBe("Casting for the quest");
            expect(api.operations.granted()).toEqual([]);
        });

        it("rejects a request for a scope that doesn't exist", () => {
            expect(() => api.operations.request(["root" as LSCGOperationScope])).toThrow(/request needs a list of scopes/);
            expect(() => api.operations.request([])).toThrow();
        });

        it("grants one scope at a time, tells the extension, and takes it back", () => {
            const seen: LSCGOperationScope[][] = [];
            api.operations.onChange(granted => seen.push(granted));
            setScopeGranted(api.id, "states", true);
            setScopeGranted(api.id, "hypno", true);
            setScopeGranted(api.id, "states", false);
            expect(api.operations.granted()).toEqual(["hypno"]);
            expect(seen).toEqual([["states"], ["states", "hypno"], ["hypno"]]);
            expect(() => api.operations.states.get("blind")).toThrow(/hasn't allowed/);
        });

        it("keeps grants per player and per extension, off the settings that get exported", () => {
            allow("hypno");
            const other = registerExtension({ id: `${api.id}-other`, name: "Other", version: "1" });
            expect(other.operations.isGranted("hypno")).toBe(false);
            other.dispose();
            expect(JSON.stringify((globalThis as any).Player.LSCG)).not.toContain(api.id);
            (globalThis as any).Player.MemberNumber = 2;
            expect(api.operations.isGranted("hypno")).toBe(false);
            (globalThis as any).Player.MemberNumber = 1;
            expect(api.operations.isGranted("hypno")).toBe(true);
        });

        it("ignores a corrupted store, and unknown scopes in it", () => {
            localStorage.setItem("LSCG_ExtensionGrants_1", "{nope");
            expect(api.operations.granted()).toEqual([]);
            localStorage.setItem("LSCG_ExtensionGrants_1", JSON.stringify({ [api.id]: ["hypno", "root", 5] }));
            expect(api.operations.granted()).toEqual(["hypno"]);
        });

        it("forgets an extension's request when it is disposed", () => {
            api.operations.request(["magic"]);
            api.dispose();
            expect(operationRequests().some(r => r.id === api.id)).toBe(false);
            api = registerExtension({ id: `ops-after-${++ids}`, name: "Ops Pack", version: "1" });
        });

        it("lists a handle's scopes", () => {
            expect(api.operations.scopes).toEqual(OPERATION_SCOPES);
        });
    });

    describe("states", () => {
        it("drives a state on the player, and checks the scope on every use of the handle", () => {
            allow("states");
            const blind = api.operations.states.get("blind")!;
            expect(blind.active).toBe(false);
            blind.activate();
            expect(blind.active).toBe(true);
            setScopeGranted(api.id, "states", false);
            expect(() => blind.recover()).toThrow(/hasn't allowed/);
            expect(() => blind.active).toThrow(/hasn't allowed/);
            allow("states");
            blind.recover();
            expect(blind.active).toBe(false);
        });

        it("has no handle for a state that can't be driven", () => {
            allow("states");
            expect(api.operations.states.get("nope" as never)).toBeUndefined();
        });
    });

    describe("hypno", () => {
        it("puts the player under and wakes them", () => {
            allow("hypno");
            hypno.settings.enabled = true;
            expect(api.operations.hypno.isHypnotized()).toBe(false);
            expect(api.operations.hypno.awaken()).toBe(false);
            expect(api.operations.hypno.trigger()).toBe(true);
            expect(api.operations.hypno.isHypnotized()).toBe(true);
            expect(api.operations.hypno.trigger()).toBe(false);
            expect(api.operations.hypno.awaken()).toBe(true);
            expect(api.operations.hypno.isHypnotized()).toBe(false);
        });

        it("won't trigger when the player has hypnosis off", () => {
            allow("hypno");
            hypno.settings.enabled = false;
            expect(api.operations.hypno.trigger()).toBe(false);
        });
    });

    describe("leashing", () => {
        it("lists grabs, and lets go of only what the player holds, of the type asked", () => {
            allow("leashing");
            leashing.Pairings = [];
            leashing.AddLeashing({ PairedMember: 5, PairedBy: 5, IsSource: true, Type: "arm" } as never);
            leashing.AddLeashing({ PairedMember: 6, PairedBy: 6, IsSource: true, Type: "ear" } as never);
            leashing.AddLeashing({ PairedMember: 7, PairedBy: 7, IsSource: false, Type: "arm" } as never);
            expect(api.operations.leashing.list()).toEqual([
                { type: "arm", member: 5, holding: true },
                { type: "ear", member: 6, holding: true },
                { type: "arm", member: 7, holding: false },
            ]);
            expect(api.operations.leashing.release("ear")).toBe(1);
            expect(api.operations.leashing.release()).toBe(1);
            expect(api.operations.leashing.list()).toEqual([{ type: "arm", member: 7, holding: false }]);
        });
    });

    describe("drugs", () => {
        it("doses and reads levels once allowed", () => {
            injector.settings.enabled = true;
            expect(() => api.operations.drugs.dose("horny")).toThrow(/hasn't allowed/);
            allow("drugs");
            expect(api.operations.drugs.getLevels()).toEqual([]);
            expect(() => api.operations.drugs.dose("" as never)).toThrow(/needs a drug type/);
        });
    });

});
