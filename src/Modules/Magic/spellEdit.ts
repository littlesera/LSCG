import { ABSOLUTE_MAX_SPELL_EFFECTS, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import { CastArgs, CastPrompt, effectTier, getSpellEffect, SaveBehavior } from "./spellEffects";

/** The most a single effect's settings may weigh once serialised, whoever sent them. */
export const MAX_EFFECT_CONFIG_SIZE = 1024;

/** The longest an effect may wait for the one before it, whoever asks (a spell's author, an extension, a listener). */
export const MAX_EFFECT_DELAY = 30_000;

/** How long an effect waits for the one before it unless the spell, the effect or a listener says otherwise. */
export const DEFAULT_EFFECT_DELAY = 2000;

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
    spell.Delays?.splice(index, 1);
    if (spell.Delays && spell.Delays.every(d => d == null)) delete spell.Delays;
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

/** The delay (ms) the spell's author set for the effect at `index`, or undefined when they left it at the effect's default. */
export function effectDelayFor(spell: SpellDefinition, index: number): number | undefined {
    return cleanDelay(spell.Delays?.[index]);
}

/** Sets (ms) or clears (undefined) the author's delay for the effect at `index`. */
export function writeDelay(spell: SpellDefinition, index: number, delay: number | undefined) {
    const clean = cleanDelay(delay);
    if (clean === undefined) {
        if (!spell.Delays) return;
        spell.Delays[index] = null;
        if (spell.Delays.every(d => d == null)) delete spell.Delays;
        return;
    }
    const delays = spell.Delays ??= [];
    while (delays.length < spell.Effects.length) delays.push(null);
    delays[index] = clean;
}

/** A delay from anywhere: a finite, non-negative number of ms within the maximum, else undefined. */
export function cleanDelay(delay: unknown): number | undefined {
    return typeof delay === "number" && Number.isFinite(delay) && delay >= 0 ? Math.min(Math.round(delay), MAX_EFFECT_DELAY) : undefined;
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
    const delays: (number | null)[] = [];
    const storedDelays: unknown[] = Array.isArray(spell.Delays) ? spell.Delays : [];
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
        delays.push(cleanDelay(storedDelays[i]) ?? null);
    });
    spell.Effects = effects;
    if (configs.some(c => c != null))
        spell.Configs = configs;
    else
        delete spell.Configs;
    if (delays.some(d => d != null))
        spell.Delays = delays;
    else
        delete spell.Delays;
    retier(spell);
    return spell;
}

/** What a save does to the effect at `index`, or undefined when it doesn't declare one. */
export function saveBehaviorFor(spell: SpellDefinition, index: number): SaveBehavior | undefined {
    const onSave = getSpellEffect(spell.Effects[index])?.onSave;
    return typeof onSave === "function" ? onSave(effectConfigFor(spell, index)) : onSave;
}

/** The questions a menu cast of this spell asks the caster, with which effect copy each belongs to. With the target, a question can offer choices
 *  drawn from them (which of their effects to lift). */
export function spellCastPrompts(spell: SpellDefinition, target?: Character): { index: number; effect: SpellEffectId; prompts: CastPrompt[] }[] {
    return spell.Effects.flatMap((effect, index) => {
        const schema = getSpellEffect(effect)?.config;
        const config = effectConfigFor(spell, index);
        const prompts = schema?.castPrompts?.(config, target) ?? [];
        return prompts.length > 0 ? [{ index, effect, prompts }] : [];
    });
}

/** What an open answer may look like: short and plain, like a state name or an id. The effect checks it against what is really there. */
const OPEN_ANSWER = /^[A-Za-z0-9:_. -]{1,64}$/;

/** Cast answers from another player, kept only where they answer a real question with one of its options. Edits nothing; call it on a
 *  spell that has already been through sanitizeSpell. */
export function sanitizeCastArgs(raw: unknown, spell: SpellDefinition): CastArgs | undefined {
    if (!raw || typeof raw !== "object")
        return undefined;
    const clean: CastArgs = {};
    for (const { index, prompts } of spellCastPrompts(spell)) {
        const answers = (raw as CastArgs)[index];
        if (!answers || typeof answers !== "object")
            continue;
        for (const prompt of prompts) {
            const value = answers[prompt.key];
            if (typeof value === "string" && (prompt.open ? OPEN_ANSWER.test(value) : prompt.options.some(o => o.value === value)))
                (clean[index] ??= {})[prompt.key] = value;
        }
    }
    return Object.keys(clean).length > 0 ? clean : undefined;
}

/** Answers picked out of the words of a voice cast, from whichever effects can read them. */
export function voiceCastArgs(spell: SpellDefinition, text: string): CastArgs | undefined {
    const args: CastArgs = {};
    spell.Effects.forEach((effect, index) => {
        const answers = getSpellEffect(effect)?.config?.fromVoice?.(effectConfigFor(spell, index), text);
        const picked = answers ? Object.fromEntries(Object.entries(answers).filter(([, v]) => typeof v === "string")) : {};
        if (Object.keys(picked).length > 0)
            args[index] = picked;
    });
    return sanitizeCastArgs(args, spell);
}

/** A copy of the spell with only some of its effects, and the cast answers moved to their new positions. */
export function pickEffects(spell: SpellDefinition, castArgs: CastArgs | undefined, indexes: number[]): { spell: SpellDefinition; castArgs: CastArgs | undefined } {
    const picked: SpellDefinition = { ...spell, Effects: indexes.map(i => spell.Effects[i]), Configs: indexes.map(i => spell.Configs?.[i] ?? null) };
    if (spell.Delays) picked.Delays = indexes.map(i => spell.Delays?.[i] ?? null);
    const moved: CastArgs = {};
    indexes.forEach((from, to) => { if (castArgs?.[from]) moved[to] = castArgs[from]; });
    return { spell: picked, castArgs: Object.keys(moved).length > 0 ? moved : undefined };
}
