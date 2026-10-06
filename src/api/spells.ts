import { LSCGSpellEffectContext, LSCGSpellEffectDefinition, LSCGSpellsApi } from "./types";
import { builtInStates } from "./builtInStates";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import { spellInfo } from "./events";
import { effectTier, isBuiltInEffect, spellEffects, type SpellEffectContext } from "Modules/Magic/spellEffects";
import { SendAction } from "utils";

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
            return spellEffects.all().map(d => ({
                id: d.id, label: d.label, description: d.description, builtIn: isBuiltInEffect(d.id),
                ...(d.domain ? { domain: d.domain, school: d.school, tier: effectTier(d.id) } : {}),
            }));
        },
    };
}
