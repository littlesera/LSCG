import { LSCGSpellEffect, SpellEffectId } from "Settings/Models/magic";
import { conjure, ConjureConfig, ConjureSet, sanitizeConjureConfig, unconjure } from "../conjure";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

export const WEB_SET: ConjureSet = {
    noun: "webs",
    options: [
        { group: "ItemArms", asset: "Web", ladder: ["Tangled", "Wrapped", "Cocooned"], primary: true },
        { group: "ItemMouth", asset: "WebGag" },
        { group: "ItemHead", asset: "WebBlindfold" },
    ],
    messages: {
        bind: "Sticky strands of web burst from the spell and wrap around %NAME%!",
        tighten: "The webs around %NAME% pull tighter, new strands spinning over the old.",
        nothing: "Webs reach for %NAME%, but there is nothing left for them to hold.",
        end: "The webs binding %NAME% crumble away to dust.",
    },
};

export const SLIME_SET: ConjureSet = {
    noun: "slime",
    options: [
        { group: "ItemArms", asset: "Slime", primary: true },
        { group: "ItemLegs", asset: "Slime" },
        { group: "ItemFeet", asset: "Slime" },
        { group: "ItemMouth", asset: "Slime" },
        { group: "ItemHead", asset: "Slime" },
        { group: "ItemHood", asset: "Slime" },
        { group: "ItemBoots", asset: "Slime" },
    ],
    messages: {
        bind: "Thick slime oozes out of the spell and spreads over %NAME%, hardening as it goes!",
        tighten: "More slime pours over %NAME%.",
        nothing: "Slime creeps toward %NAME%, but finds nowhere to cling.",
        end: "The slime clinging to %NAME% melts away.",
    },
};

export const ROPES_SET: ConjureSet = {
    noun: "ropes",
    options: [
        { group: "ItemArms", asset: "HempRope", ladder: ["WristTie", "BoxTie", "TightBoxtie"], primary: true },
        { group: "ItemLegs", asset: "HempRope", ladder: ["Basic", "FullBinding"] },
        { group: "ItemFeet", asset: "HempRope", ladder: ["Basic", "FullBinding"] },
        { group: "ItemPelvis", asset: "HempRope" },
        { group: "ItemTorso", asset: "HempRopeHarness" },
        { group: "ItemTorso2", asset: "HempRopeHarness" },
        { group: "ItemVulva", asset: "HempRopeBelt" },
        { group: "ItemHands", asset: "HempRopeCuffs" },
    ],
    messages: {
        bind: "Ropes snake out of the spell and bind %NAME%, knotting themselves tight!",
        tighten: "The ropes on %NAME% cinch tighter, new loops winding over the old.",
        nothing: "Ropes coil around %NAME%, but find nothing left to tie.",
        end: "The conjured ropes binding %NAME% fray into nothing.",
    },
};

/** A spell effect that conjures restraints from a set: how many pieces (a range, rolled each cast) and optionally a crafted version of the
 *  set's main item. Each piece is recorded so it comes off when the spell ends. */
function conjureEffect(id: SpellEffectId, description: string, set: ConjureSet, craftable: string[]): SpellEffectDefinition {
    const sanitize = (raw: unknown): ConjureConfig => {
        const config = sanitizeConjureConfig(raw);
        // A crafted item only counts if it is one this effect can wear
        if (config.Craft && !craftable.includes(config.Craft.Item as string))
            delete config.Craft;
        return config;
    };
    return {
        id,
        label: id,
        description,
        stackable: 3,
        onSave: "negate",
        config: {
            defaults: (): ConjureConfig => ({ Min: 1, Max: 2 }),
            sanitize,
            summary: (c: ConjureConfig) => {
                const clean = sanitize(c);
                const pieces = clean.Min === clean.Max ? `${clean.Min}` : `${clean.Min} to ${clean.Max}`;
                return `${id} settings: ${pieces} ${clean.Max === 1 ? "piece" : "pieces"}${clean.Craft ? `, crafted ${clean.Craft.Name || clean.Craft.Item}` : ""}`;
            },
        },
        apply: ctx => { conjure(ctx, set, (ctx.config as ConjureConfig | undefined) ?? sanitize(undefined)); },
        onEnd: (entry, reason) => unconjure(entry, reason, set),
    };
}

export const WEB_EFFECT = conjureEffect(LSCGSpellEffect.web, "Binds the target in sticky webs on a few slots: the arms, and sometimes the mouth and eyes. A repeat casting pulls them tighter. They fade when the spell ends.", WEB_SET, ["Web"]);
export const SLIME_EFFECT = conjureEffect(LSCGSpellEffect.slime, "Coats the target in hardening slime on a few slots. A repeat casting covers more of them. It melts away when the spell ends.", SLIME_SET, ["Slime"]);
export const ROPES_EFFECT = conjureEffect(LSCGSpellEffect.ropes, "Ties the target with conjured hemp rope on a few slots. A repeat casting ties them tighter. The ropes vanish when the spell ends.", ROPES_SET, ["HempRope"]);

/** The assets a crafted item may be chosen from in each effect's settings, for the editor. */
export const CONJURE_CRAFTABLE: Partial<Record<string, string[]>> = {
    [LSCGSpellEffect.web]: ["Web"],
    [LSCGSpellEffect.slime]: ["Slime"],
    [LSCGSpellEffect.ropes]: ["HempRope"],
};
