import { LSCGBuiltInStateType, LSCGBuiltInStatesApi, LSCGSpellEffectContext, LSCGSpellEffectDefinition, LSCGSpellsApi, LSCGStateHandle } from "./types";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import { spellInfo } from "./events";
import { isBuiltInEffect, spellEffects, type SpellEffectContext } from "Modules/Magic/spellEffects";
import type { StateModule } from "Modules/states";
import { SendAction } from "utils";

/** States an extension may drive directly; the rest need special entry points (outfits, pairings, sizes...). */
const DRIVABLE_STATES: readonly LSCGBuiltInStateType[] = ["asleep", "hypnotized", "horny", "denied", "blind", "deaf", "frozen", "gagged", "x-ray-vision"];

function builtInStates(stateModule: StateModule, defaultActivator?: number): LSCGBuiltInStatesApi {
    return {
        get(type: LSCGBuiltInStateType): LSCGStateHandle | undefined {
            if (DRIVABLE_STATES.indexOf(type) < 0) return undefined;
            const state = stateModule.States.find(s => s.Type === type);
            if (!state) return undefined;
            return Object.freeze({
                type,
                get active() { return state.Active; },
                activate: (activatedBy?: number, durationMs?: number) => {
                    const duration = typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : undefined;
                    state.Activate(activatedBy ?? defaultActivator, duration);
                },
                recover: () => { state.Recover(); },
            });
        },
    };
}

function publicContext(ctx: SpellEffectContext): LSCGSpellEffectContext {
    return Object.freeze({
        effect: ctx.effect,
        spell: Object.freeze(spellInfo(ctx.spell)),
        sender: ctx.sender?.MemberNumber,
        duration: ctx.duration,
        sendAction: (text: string) => SendAction(String(text), ctx.sender),
        states: builtInStates(ctx.magic.stateModule, ctx.sender?.MemberNumber),
    });
}

/** Builds the `spells` member of an extension handle. */
export function createSpellsApi(owner: ErrorOwner & { readonly info: { name: string } }, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGSpellsApi {
    const mine = new Map<string, () => void>();
    return {
        registerEffect(definition: LSCGSpellEffectDefinition): () => void {
            if (!definition || typeof definition.apply !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: a spell effect needs an apply(ctx) function.`);
            const id = scopedId(definition.name);
            const unregister = spellEffects.register({
                id,
                label: String(definition.label || definition.name),
                description: String(definition.description ?? ""),
                beneficial: !!definition.beneficial,
                forcesDuration: !!definition.forcesDuration,
                allowRandom: !!definition.allowRandom,
                defaultBlocked: !!definition.defaultBlocked,
                source: owner.info.name,
                apply: ctx => { safeInvoke(owner, () => definition.apply(publicContext(ctx))); },
            });
            const remove = () => {
                if (mine.delete(definition.name)) unregister();
            };
            mine.set(definition.name, remove);
            track(remove);
            return remove;
        },
        unregisterEffect(name: string): boolean {
            const remove = mine.get(name);
            if (!remove) return false;
            remove();
            return true;
        },
        listEffects() {
            return spellEffects.all().map(d => ({ id: d.id, label: d.label, description: d.description, builtIn: isBuiltInEffect(d.id) }));
        },
    };
}
