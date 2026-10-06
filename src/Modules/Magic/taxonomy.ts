import { LSCGSpellEffect } from "Settings/Models/magic";

/** What an effect does to its target, in our own terms. Drives how effects are grouped in the spell editor and block list. */
export enum SpellDomain {
    mind = "Mind",
    senses = "Senses",
    form = "Form",
    binding = "Binding",
    desire = "Desire",
    harm = "Harm",
    fortune = "Fortune",
    warding = "Warding",
}

/** Display order and a line of explanation for each domain. */
export const SPELL_DOMAINS: { id: SpellDomain; description: string }[] = [
    { id: SpellDomain.mind, description: "Effects on the target's will and thoughts." },
    { id: SpellDomain.senses, description: "Effects on what the target can see, hear and perceive." },
    { id: SpellDomain.form, description: "Effects on the target's body, size and clothing." },
    { id: SpellDomain.binding, description: "Effects that restrain, gag or hold the target." },
    { id: SpellDomain.desire, description: "Effects on the target's arousal and release." },
    { id: SpellDomain.harm, description: "Effects that hurt the target." },
    { id: SpellDomain.fortune, description: "Effects that help or hinder the target's skills." },
    { id: SpellDomain.warding, description: "Effects that protect, or take other magic away." },
];

/** The eight classic schools of magic. Flavour for now, kept so they can drive filters and specialisation later. */
export enum SpellSchool {
    abjuration = "Abjuration",
    conjuration = "Conjuration",
    divination = "Divination",
    enchantment = "Enchantment",
    evocation = "Evocation",
    illusion = "Illusion",
    necromancy = "Necromancy",
    transmutation = "Transmutation",
}

/** How powerful an effect is in an RPG sense, 1 (cantrip) to 5. Data for later spell trees and crafting costs; 5 is unused so far. */
export type SpellTier = 1 | 2 | 3 | 4 | 5;
export const SPELL_TIERS: SpellTier[] = [1, 2, 3, 4, 5];

export interface EffectTaxonomy {
    domain: SpellDomain;
    school: SpellSchool;
    /** The effect's tier, or its lowest tier for an effect whose tier depends on its settings (which then define their own). */
    tier: SpellTier;
}

const { mind, senses, form, binding, desire, harm, fortune, warding } = SpellDomain;
const { abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation } = SpellSchool;

/** Every built-in effect's domain, school and tier, in one place so they can be tuned together. Typed over the whole enum, so
 *  adding an effect without classifying it is a compile error. */
export const BUILTIN_TAXONOMY: Record<Exclude<LSCGSpellEffect, LSCGSpellEffect.none>, EffectTaxonomy> = {
    [LSCGSpellEffect.hypnotizing]: { domain: mind, school: enchantment, tier: 3 },
    [LSCGSpellEffect.slumber]: { domain: mind, school: enchantment, tier: 3 },
    [LSCGSpellEffect.horny]: { domain: desire, school: enchantment, tier: 1 },
    [LSCGSpellEffect.blindness]: { domain: senses, school: necromancy, tier: 2 },
    [LSCGSpellEffect.deafened]: { domain: senses, school: necromancy, tier: 2 },
    [LSCGSpellEffect.muted]: { domain: binding, school: illusion, tier: 1 },
    [LSCGSpellEffect.frozen]: { domain: binding, school: transmutation, tier: 3 },
    [LSCGSpellEffect.enlarge]: { domain: form, school: transmutation, tier: 2 },
    [LSCGSpellEffect.bless]: { domain: fortune, school: enchantment, tier: 1 },
    [LSCGSpellEffect.bane]: { domain: fortune, school: enchantment, tier: 1 },
    [LSCGSpellEffect.paired_arousal]: { domain: desire, school: enchantment, tier: 3 },
    [LSCGSpellEffect.orgasm_siphon]: { domain: desire, school: necromancy, tier: 3 },
    [LSCGSpellEffect.outfit]: { domain: form, school: illusion, tier: 2 },
    [LSCGSpellEffect.polymorph]: { domain: form, school: transmutation, tier: 4 },
    [LSCGSpellEffect.dispel]: { domain: warding, school: abjuration, tier: 4 },
    [LSCGSpellEffect.xRay]: { domain: senses, school: divination, tier: 2 },
    [LSCGSpellEffect.barrier]: { domain: warding, school: abjuration, tier: 3 },
    [LSCGSpellEffect.disarm]: { domain: binding, school: transmutation, tier: 1 },
    [LSCGSpellEffect.denial]: { domain: desire, school: enchantment, tier: 2 },
    [LSCGSpellEffect.orgasm]: { domain: desire, school: enchantment, tier: 2 },
    [LSCGSpellEffect.project]: { domain: senses, school: conjuration, tier: 4 },
    [LSCGSpellEffect.tighten]: { domain: binding, school: transmutation, tier: 1 },
    [LSCGSpellEffect.loosen]: { domain: binding, school: transmutation, tier: 1 },
    [LSCGSpellEffect.damage]: { domain: harm, school: evocation, tier: 1 },
    [LSCGSpellEffect.dissolve]: { domain: form, school: transmutation, tier: 1 },
    [LSCGSpellEffect.web]: { domain: binding, school: conjuration, tier: 2 },
    [LSCGSpellEffect.slime]: { domain: binding, school: conjuration, tier: 3 },
    [LSCGSpellEffect.ropes]: { domain: binding, school: conjuration, tier: 2 },
    [LSCGSpellEffect.command]: { domain: mind, school: enchantment, tier: 2 },
    [LSCGSpellEffect.grasp]: { domain: binding, school: conjuration, tier: 3 },
    [LSCGSpellEffect.removeCurse]: { domain: warding, school: abjuration, tier: 1 },
};

export function domainDescription(domain: SpellDomain): string {
    return SPELL_DOMAINS.find(d => d.id === domain)?.description ?? "";
}

/** Position of a domain in the display order. */
export function domainOrder(domain: SpellDomain): number {
    return SPELL_DOMAINS.findIndex(d => d.id === domain);
}
