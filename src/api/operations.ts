import { getModule } from "modules";
import type { MagicModule } from "Modules/magic";
import type { HypnoModule } from "Modules/hypno";
import type { CollarModule } from "Modules/collar";
import type { LeashingModule } from "Modules/leashing";
import type { StateModule } from "Modules/states";
import {
    LSCGBuiltInStateType, LSCGCollarOperations, LSCGDoseOptions, LSCGDrugOperations, LSCGDrugType, LSCGHypnoOperations,
    LSCGLeashingOperations, LSCGMagicOperations, LSCGOperationScope, LSCGOperationsApi, LSCGStateHandle, LSCGStatesOperations,
} from "./types";
import { isLSCGReady } from "./ready";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import { builtInStates } from "./builtInStates";
import { doseDrug, drugLevels } from "./drugs";

export const OPERATION_SCOPES: readonly LSCGOperationScope[] = ["magic", "hypno", "collar", "leashing", "states", "drugs"];

/** What the player sees when deciding whether to allow a scope. */
export const OPERATION_SCOPE_LABELS: Readonly<Record<LSCGOperationScope, { label: string; description: string }>> = {
    magic: { label: "Magic", description: "Cast spells you know on yourself, and dispel spells that haven't taken hold." },
    hypno: { label: "Hypnosis", description: "Put you under hypnosis or wake you." },
    collar: { label: "Collar", description: "Tighten and loosen your collar (only as far as your own collar settings allow)." },
    leashing: { label: "Leashing", description: "Let go of what you are holding and try to break free of what holds you." },
    states: { label: "States", description: "Turn states on you on and off: sleep, hypnosis, arousal, denial, blindness, deafness, freezing, gagging, x-ray vision." },
    drugs: { label: "Drugs", description: "Give you doses of drugs." },
};

const isScope = (value: unknown): value is LSCGOperationScope => typeof value === "string" && (OPERATION_SCOPES as readonly string[]).includes(value);

// ---------------------------------------------------------------------------------------------------------------
// Grants and requests
// ---------------------------------------------------------------------------------------------------------------

/** Kept in localStorage per player, not in the saved settings: those are exported, shared and imported, and a file
 *  someone sends must not be able to hand an extension control of the player. Never leaves this browser. */
const GRANTS_KEY_PREFIX = "LSCG_ExtensionGrants_";

function grantsKey(): string | undefined {
    const member = (globalThis as any).Player?.MemberNumber;
    return typeof member === "number" ? GRANTS_KEY_PREFIX + member : undefined;
}

function readGrants(): Record<string, LSCGOperationScope[]> {
    const key = grantsKey();
    if (!key) return {};
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "{}");
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
        const result: Record<string, LSCGOperationScope[]> = Object.create(null);
        for (const [id, scopes] of Object.entries(parsed))
            if (Array.isArray(scopes))
                result[id] = scopes.filter(isScope);
        return result;
    } catch {
        return {};
    }
}

export function grantedScopes(extensionId: string): LSCGOperationScope[] {
    return readGrants()[extensionId] ?? [];
}

export function isScopeGranted(extensionId: string, scope: LSCGOperationScope): boolean {
    return grantedScopes(extensionId).includes(scope);
}

type GrantListener = (extensionId: string) => void;
let _grantListeners: GrantListener[] = [];

/** Watches grants and requests: the settings page and extensions' `onChange` hang off this. */
export function onOperationsChange(listener: GrantListener): () => void {
    _grantListeners.push(listener);
    return () => { _grantListeners = _grantListeners.filter(l => l !== listener); };
}

function notify(extensionId: string): void {
    for (const listener of [..._grantListeners]) {
        try {
            listener(extensionId);
        } catch (e) {
            console.error("LSCG: operations listener failed", e);
        }
    }
}

/** The player's decision. Returns false if it couldn't be saved. */
export function setScopeGranted(extensionId: string, scope: LSCGOperationScope, granted: boolean): boolean {
    const key = grantsKey();
    if (!key || !isScope(scope)) return false;
    const all = readGrants();
    const others = (all[extensionId] ?? []).filter(s => s !== scope);
    all[extensionId] = granted ? [...others, scope] : others;
    if (all[extensionId].length === 0) delete all[extensionId];
    try {
        localStorage.setItem(key, JSON.stringify(all));
    } catch (e) {
        console.warn("LSCG: couldn't save extension permissions", e);
        return false;
    }
    notify(extensionId);
    return true;
}

export interface OperationRequest {
    id: string;
    name: string;
    scopes: Set<LSCGOperationScope>;
    /** What the extension said it wants the scopes for, if it said. */
    reason?: string;
}

/** Extensions that asked for scopes this page load, shown on the settings page whether or not they were granted. */
const requests = new Map<string, OperationRequest>();

export function operationRequests(): OperationRequest[] {
    return [...requests.values()];
}

function addRequest(owner: { id: string; info: { name: string } }, scopes: LSCGOperationScope[], reason?: string): void {
    const entry = requests.get(owner.id) ?? { id: owner.id, name: owner.info.name, scopes: new Set<LSCGOperationScope>() };
    const before = entry.scopes.size;
    scopes.forEach(s => entry.scopes.add(s));
    if (typeof reason === "string" && reason.trim() !== "") entry.reason = reason.trim().slice(0, 200);
    requests.set(owner.id, entry);
    if (entry.scopes.size !== before || reason !== undefined) notify(owner.id);
}

// ---------------------------------------------------------------------------------------------------------------
// The API
// ---------------------------------------------------------------------------------------------------------------

function permissionError(owner: ErrorOwner, scope: LSCGOperationScope): Error {
    const error = new Error(`LSCG[ext:${owner.id}]: the player hasn't allowed the "${scope}" operations. They can in LSCG settings, Extensions.`);
    error.name = "LSCGPermissionError";
    return error;
}

/** Builds the `operations` member of an extension handle. */
export function createOperationsApi(owner: ErrorOwner & { readonly info: { name: string } }, track: (disposer: () => void) => void): LSCGOperationsApi {
    // The page lists requests; an extension that goes away takes its own off.
    track(() => {
        if (requests.delete(owner.id)) notify(owner.id);
    });

    /** Checks the scope is allowed (asking the player if not) and that LSCG is up, then runs `fn` with extension errors contained by the caller. */
    function guarded<T>(scope: LSCGOperationScope, fn: () => T): T {
        if (!isScopeGranted(owner.id, scope)) {
            addRequest({ id: owner.id, info: owner.info }, [scope]);
            throw permissionError(owner, scope);
        }
        if (!isLSCGReady() || !Player?.LSCG)
            throw new Error("LSCG: operations aren't available until LSCG is ready (use onReady).");
        return fn();
    }

    const magic: LSCGMagicOperations = {
        list: () => guarded("magic", () => {
            const module = getModule<MagicModule>("MagicModule");
            if (!module?.Enabled) return [];
            return module.AvailableSpells.map(s => Object.freeze({
                name: s.Name,
                effects: Object.freeze([...(s.Effects ?? [])] as string[]),
                voiceCastable: !!s.AllowVoiceCast,
                potion: !!s.AllowPotion,
            }));
        }),
        castOnSelf: name => guarded("magic", () => {
            if (typeof name !== "string" || name === "")
                throw new Error(`LSCG[ext:${owner.id}]: castOnSelf needs a spell name.`);
            return !!getModule<MagicModule>("MagicModule")?.CastKnownSpellOnSelf(name);
        }),
        dispel: () => guarded("magic", () => getModule<MagicModule>("MagicModule")?.CancelPendingSpells("dispel") ?? 0),
    };

    const hypno: LSCGHypnoOperations = {
        isHypnotized: () => guarded("hypno", () => !!getModule<HypnoModule>("HypnoModule")?.hypnoActivated),
        trigger: () => guarded("hypno", () => {
            const module = getModule<HypnoModule>("HypnoModule");
            if (!module?.Enabled || module.hypnoActivated || module.IsOnCooldown())
                return false;
            module.StartTriggerWord(false);
            return true;
        }),
        awaken: () => guarded("hypno", () => {
            const module = getModule<HypnoModule>("HypnoModule");
            if (!module?.hypnoActivated)
                return false;
            module.TriggerRestore("other");
            return true;
        }),
    };

    const collar: LSCGCollarOperations = {
        getChokeLevel: () => guarded("collar", () => getModule<CollarModule>("CollarModule")?.totalChokeLevel ?? 0),
        tighten: () => guarded("collar", () => {
            const module = getModule<CollarModule>("CollarModule");
            if (!module?.Enabled || !module.breathplayEnabled || !module.AllowedMember(Player, true))
                return false;
            module.IncreaseCollarChoke();
            return true;
        }),
        loosen: () => guarded("collar", () => {
            const module = getModule<CollarModule>("CollarModule");
            if (!module?.Enabled || !module.AllowedMember(Player, false))
                return false;
            module.DecreaseCollarChoke();
            return true;
        }),
        release: () => guarded("collar", () => {
            const module = getModule<CollarModule>("CollarModule");
            if (!module?.Enabled)
                return false;
            module.ReleaseCollar();
            return true;
        }),
    };

    const leashing: LSCGLeashingOperations = {
        list: () => guarded("leashing", () =>
            (getModule<LeashingModule>("LeashingModule")?.Pairings ?? []).map(p => Object.freeze({ type: p.Type as string, member: p.PairedMember, holding: p.IsSource }))),
        release: type => guarded("leashing", () => {
            const module = getModule<LeashingModule>("LeashingModule");
            if (!module) return 0;
            const held = module.Pairings.filter(p => p.IsSource && (type === undefined || p.Type === type));
            module.NotifyUnleashings(held);
            for (const p of held) {
                module.RemoveLeashings(p.PairedMember, true, p.Type, p.Slot, p.PairedSlot);
                if (module.IsBidirectionalType(p.Type))
                    module.RemoveLeashings(p.PairedMember, false, p.Type, p.Slot, p.PairedSlot);
            }
            return held.length;
        }),
        escape: () => guarded("leashing", () => { getModule<LeashingModule>("LeashingModule")?.TryEscape(); }),
    };

    const states: LSCGStatesOperations = {
        get: (type: LSCGBuiltInStateType): LSCGStateHandle | undefined => guarded("states", () => {
            const stateModule = getModule<StateModule>("StateModule");
            const handle = stateModule ? builtInStates(stateModule).get(type) : undefined;
            if (!handle) return undefined;
            // The handle outlives this call, and the player may take the scope back in between: check again on each use.
            return Object.freeze({
                type: handle.type,
                get active() { return guarded("states", () => handle.active); },
                activate: (activatedBy?: number, durationMs?: number) => guarded("states", () => handle.activate(activatedBy, durationMs)),
                recover: () => guarded("states", () => handle.recover()),
            });
        }),
    };

    const drugs: LSCGDrugOperations = {
        dose: (type: LSCGDrugType, options?: LSCGDoseOptions) => guarded("drugs", () => doseDrug(owner, type, options)),
        getLevels: () => guarded("drugs", () => drugLevels()),
    };

    const watchers = new Set<() => void>();

    return {
        scopes: OPERATION_SCOPES,
        granted: () => grantedScopes(owner.id),
        isGranted: scope => isScopeGranted(owner.id, scope),
        request(scopes: LSCGOperationScope[], reason?: string): void {
            if (!Array.isArray(scopes) || scopes.length === 0 || !scopes.every(isScope))
                throw new Error(`LSCG[ext:${owner.id}]: request needs a list of scopes from: ${OPERATION_SCOPES.join(", ")}.`);
            addRequest({ id: owner.id, info: owner.info }, scopes, reason);
        },
        onChange(handler: (granted: LSCGOperationScope[]) => void): () => void {
            if (typeof handler !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: onChange needs a function.`);
            const stop = onOperationsChange(id => {
                if (id === owner.id) safeInvoke(owner, () => handler(grantedScopes(owner.id)));
            });
            const remove = () => { stop(); watchers.delete(remove); };
            watchers.add(remove);
            track(remove);
            return remove;
        },
        magic, hypno, collar, leashing, states, drugs,
    };
}
