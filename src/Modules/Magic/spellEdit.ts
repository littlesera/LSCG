import { ABSOLUTE_MAX_SPELL_EFFECTS, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import { effectTier, getSpellEffect } from "./spellEffects";

/** The most a single effect's settings may weigh once serialised, whoever sent them. */
export const MAX_EFFECT_CONFIG_SIZE = 1024;

/** How many copies of an effect one spell may hold. Unknown effects are unique. */
export function stackLimit(effect: SpellEffectId | string): number {
    return Math.max(1, Math.floor(getSpellEffect(effect)?.stackable ?? 1));
}

/** Whether the spell can take another copy of `effect`, not counting the slot at `ignoreIndex` (the one being changed). */
export function canHaveEffect(spell: SpellDefinition, effect: SpellEffectId, ignoreIndex?: number): boolean {
    const copies = spell.Effects.filter((e, i) => e === effect && i !== ignoreIndex).length;
    return copies < stackLimit(effect);
}

/** Every change to a spell's list of effects goes through here, so `Effects` and `Configs` stay lined up. */
export function addEffect(spell: SpellDefinition, effect: SpellEffectId) {
    spell.Effects.push(effect);
    retier(spell);
}

export function setEffect(spell: SpellDefinition, index: number, effect: SpellEffectId) {
    spell.Effects[index] = effect;
    if (spell.Configs) spell.Configs[index] = null;
    retier(spell);
}

export function removeEffect(spell: SpellDefinition, index: number) {
    if (index < 0 || index >= spell.Effects.length) return;
    spell.Effects.splice(index, 1);
    spell.Configs?.splice(index, 1);
    if (spell.Configs && spell.Configs.every(c => c == null)) delete spell.Configs;
    retier(spell);
}

/** The stored settings of one effect slot with its schema's defaults filled in, for the editor. Not sanitized:
 *  half-typed values stay visible so they can be corrected. Undefined when the effect has no settings. */
export function editableConfig(spell: SpellDefinition, index: number): any {
    const schema = getSpellEffect(spell.Effects[index])?.config;
    if (!schema) return undefined;
    const stored = spell.Configs?.[index];
    return { ...schema.defaults(), ...(stored && typeof stored === "object" ? stored : {}) };
}

export function writeConfig(spell: SpellDefinition, index: number, config: unknown) {
    const configs = spell.Configs ??= [];
    configs[index] = config;
    retier(spell);
}

/** A spell's total power: each effect's tier (for ones that depend on their settings, the tier of the sanitized settings),
 *  every copy counted. Effects with no tier (an extension's, or one not installed) count for nothing. */
export function spellTier(spell: SpellDefinition): number {
    return spell.Effects.reduce((total, effect, index) => total + effectTier(effect, effectConfigFor(spell, index)), 0);
}

/** Stores the spell's current total power on it. */
export function retier(spell: SpellDefinition) {
    spell.Tier = spellTier(spell);
}

/** The settings an effect applies with: sanitized by its schema, so remote input never reaches `apply` as sent. */
export function effectConfigFor(spell: SpellDefinition, index: number): unknown {
    return getSpellEffect(spell.Effects[index])?.config?.sanitize(spell.Configs?.[index]);
}

/** A spell as it should be stored or applied when it comes from another player. Strings only for effects, each unique effect once
 *  and each stackable one up to its limit, within the overall ceiling, in order (the order they are applied in). Every effect's
 *  settings go through its own schema and travel with it, so dropping a copy drops its settings. Edits the spell in place. */
export function sanitizeSpell(spell: SpellDefinition): SpellDefinition {
    const ids: unknown[] = Array.isArray(spell.Effects) ? spell.Effects : [];
    const stored: unknown[] = Array.isArray(spell.Configs) ? spell.Configs : [];
    const copies = new Map<string, number>();
    const effects: SpellEffectId[] = [];
    const configs: unknown[] = [];
    ids.forEach((id, i) => {
        if (typeof id !== "string" || id === "" || effects.length >= ABSOLUTE_MAX_SPELL_EFFECTS)
            return;
        const count = copies.get(id) ?? 0;
        if (count >= stackLimit(id))
            return;
        copies.set(id, count + 1);
        effects.push(id as SpellEffectId);
        const schema = getSpellEffect(id)?.config;
        const config = schema ? schema.sanitize(stored[i]) : null;
        configs.push(config !== null && JSON.stringify(config).length <= MAX_EFFECT_CONFIG_SIZE ? config : null);
    });
    spell.Effects = effects;
    if (configs.some(c => c != null))
        spell.Configs = configs;
    else
        delete spell.Configs;
    retier(spell);
    return spell;
}
