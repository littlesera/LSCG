import { Registry } from "api/registry";
import { cleanEffect, LSCGSpellEffect, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import type { MagicModule } from "Modules/magic";
import type { SpellEffectEndReason, SpellEffectEntry } from "Modules/States/SpellEffectsState";
import type { StateRestrictions } from "Modules/States/BaseState";
import { BUILTIN_SPELL_EFFECTS } from "./builtinEffects";
import { BUILTIN_TAXONOMY, SPELL_TIERS, SpellDomain, SpellSchool, SpellTier, domainDescription, domainOrder } from "./taxonomy";

/** One question the caster is asked when casting a spell with this effect (which command word, say). */
export interface CastPrompt {
    /** Where the answer goes in the effect's cast answers. */
    key: string;
    label: string;
    /** The choices shown. Empty when asked without a target to look at. */
    options: { value: string; label: string }[];
    /** The right answer depends on the target (which of their effects), which only the target's own client can check. Any short plain value is
     *  accepted off the wire, and the effect must check it against what is really there. */
    open?: boolean;
    /** The option used when the cast can't ask (voice, potion, wild magic) and nothing in the words picked one. */
    default: string;
}

/** The caster's answers to a spell's cast-time questions: `castArgs[index][key] = value`, per effect copy (its position in the spell). */
export type CastArgs = Record<string, Record<string, string>>;

/** What a successful save does to an effect. "half" effects use the saved flag to take less and still apply when the spell is otherwise
 *  resisted outright; "negate" effects simply don't apply to someone who saves. */
export type SaveBehavior = "half" | "negate";

/** Everything an effect's apply needs. Built-in effects use the module directly; extension effects get a narrower public context. */
export interface SpellEffectContext {
    effect: SpellEffectId;
    sender: Character | null;
    senderName: string;
    spell: SpellDefinition;
    paired?: Character | null;
    /** This effect's duration in ms; 0 or undefined means no expiry. */
    duration?: number;
    magic: MagicModule;
    /** Which of the spell's effects this is, since the same effect can appear more than once. */
    index: number;
    /** This effect's settings for this copy, already sanitized by its schema; undefined for effects without one. */
    config?: unknown;
    /** The target rolled a save against this spell. Only set for effects that declare an `onSave` behaviour of "half". */
    saved?: boolean;
    /** The caster's answers to this effect's cast-time questions, already checked against its options; missing keys mean "use the default". */
    castArgs?: Record<string, string>;
}

/** What an effect with settings of its own needs besides how it looks in the editor (that lives in Settings/magic-effect-editors.tsx,
 *  so effect logic never imports UI). Settings are stored per copy in `SpellDefinition.Configs`. */
export interface EffectConfigSchema<T = any> {
    defaults(): T;
    /** Strict: anything not valid is replaced by a safe value. Used on everything that arrives from another player and before apply. */
    sanitize(raw: unknown): T;
    /** The line shown when the settings section is closed. Receives the stored settings with defaults filled in, not sanitized. */
    summary(config: T): string;
    /** The settings still need the player's attention (the section opens by itself). */
    needsAttention?(config: T): boolean;
    /** Questions to ask the caster when casting a spell with these settings. Only a menu cast can ask; others use each prompt's default. */
    castPrompts?(config: T, target?: Character): CastPrompt[];
    /** Answers picked out of the words of a voice cast (the text after the target's name), or undefined when none were. */
    fromVoice?(config: T, text: string): Record<string, string> | undefined;
}

export interface SpellEffectDefinition {
    id: SpellEffectId;
    label: string;
    description: string;
    /** No save roll and no duration when every effect of a spell is beneficial. */
    beneficial?: boolean;
    /** Needs a second target; excluded from potions. Built-in only. */
    paired?: boolean;
    /** Gets a duration even when the target allows unlimited-duration spells. */
    forcesDuration?: boolean;
    /** Eligible for wild magic. */
    allowRandom?: boolean;
    /** Blocked by default the first time a player sees it. */
    defaultBlocked?: boolean;
    /** Has a "Configure" action in the spell editor. Built-in only. */
    configurable?: "outfit" | "polymorph";
    /** Settings of its own, one set per copy of the effect in a spell. */
    config?: EffectConfigSchema;
    /** What it does, in our terms; set for every built-in from BUILTIN_TAXONOMY, missing for extension effects. */
    domain?: SpellDomain;
    /** The classic school of magic it belongs to; flavour only for now. */
    school?: SpellSchool;
    /** How powerful it is, 1-5. A function when the effect's own settings change that (damage by its roll), given the sanitized settings. */
    tier?: SpellTier | ((config: any) => SpellTier);
    /** What a save does to this effect (see SaveBehavior). Without it, a full resist stops the effect and a save does nothing else. May depend on the
     *  effect's settings. */
    onSave?: SaveBehavior | ((config: any) => SaveBehavior);
    /** The most copies of this effect one spell may hold. Unique (1) when missing. */
    stackable?: number;
    /** Display name of the extension that registered it; undefined for built-ins. */
    source?: string;
    apply(ctx: SpellEffectContext): void;
    /** For effects that recorded entries in the spell effects state (SpellEffectsState.Add): undo one when it ends. It has already been
     *  removed from the list. `reason` is why: it ran out, the player was dispelled or used safeword. */
    onEnd?(entry: SpellEffectEntry, reason: SpellEffectEndReason, magic: MagicModule | undefined): void;
    /** For effects that recorded entries: what this entry stops the player doing (walking, using their arms, ...), only ever "true". */
    restrictions?(entry: SpellEffectEntry): Partial<Record<keyof StateRestrictions, "true">>;
    /** For effects that recorded entries: called about once a second while the entry lasts, for things that happen over time. */
    onTick?(entry: SpellEffectEntry, now: number, magic: MagicModule | undefined): void;
    /** For effects that recorded entries: whether this entry keeps the player from leaving the room. */
    holdsInPlace?(entry: SpellEffectEntry): boolean;
    /** Re-apply an entry that doesn't survive a room change by itself. Called for each of this effect's entries on every room sync. */
    onRoomSync?(entry: SpellEffectEntry, magic: MagicModule | undefined): void;
    /** Paired effects: runs on the second target once the first has been hit. */
    applyPaired?(ctx: SpellEffectContext, originalTarget: Character): void;
}

export const spellEffects = new Registry<SpellEffectDefinition>("spell effect");
BUILTIN_SPELL_EFFECTS.forEach(def => {
    const taxonomy = BUILTIN_TAXONOMY[def.id as keyof typeof BUILTIN_TAXONOMY];
    spellEffects.register({ ...def, domain: taxonomy.domain, school: taxonomy.school, tier: def.tier ?? taxonomy.tier });
});

const builtInIds = new Set<string>(BUILTIN_SPELL_EFFECTS.map(d => d.id));

/** Effects every Magic™ client has had since before clients advertised what they support. Clients that don't send
 *  `knownEffects` (older LSCG) are assumed to support exactly these. Never add to this list: new built-ins are
 *  advertised like extension effects, so casters can tell when an older client can't apply them. */
const LEGACY_EFFECT_IDS = new Set<string>([
    LSCGSpellEffect.hypnotizing, LSCGSpellEffect.slumber, LSCGSpellEffect.horny, LSCGSpellEffect.blindness,
    LSCGSpellEffect.deafened, LSCGSpellEffect.muted, LSCGSpellEffect.frozen, LSCGSpellEffect.enlarge,
    LSCGSpellEffect.bless, LSCGSpellEffect.bane, LSCGSpellEffect.paired_arousal, LSCGSpellEffect.orgasm_siphon,
    LSCGSpellEffect.outfit, LSCGSpellEffect.polymorph, LSCGSpellEffect.dispel, LSCGSpellEffect.xRay,
    LSCGSpellEffect.barrier, LSCGSpellEffect.disarm, LSCGSpellEffect.denial, LSCGSpellEffect.orgasm,
    LSCGSpellEffect.project,
]);

export function isLegacyEffect(id: string): boolean {
    return LEGACY_EFFECT_IDS.has(cleanEffect(id as SpellEffectId));
}

export function legacyEffectIds(): SpellEffectId[] {
    return [...LEGACY_EFFECT_IDS] as SpellEffectId[];
}

/** What this client tells others it can apply beyond the legacy set: newer built-ins and extension effects. */
export function advertisedEffectIds(): SpellEffectId[] {
    return spellEffects.all().filter(d => !isLegacyEffect(d.id)).map(d => d.id);
}

export function isBuiltInEffect(id: string): boolean {
    return builtInIds.has(cleanEffect(id as SpellEffectId));
}

export function getSpellEffect(id: SpellEffectId | string | undefined): SpellEffectDefinition | undefined {
    if (!id) return undefined;
    return spellEffects.get(cleanEffect(id as SpellEffectId));
}

/** Every effect a spell can use on this client: built-ins (in their original order), then extension effects. */
export function allEffectIds(): SpellEffectId[] {
    return spellEffects.all().map(d => d.id);
}

export function builtInEffectIds(): SpellEffectId[] {
    return BUILTIN_SPELL_EFFECTS.map(d => d.id);
}

export function extensionEffectIds(): SpellEffectId[] {
    return spellEffects.all().filter(d => !isBuiltInEffect(d.id)).map(d => d.id);
}

export function effectLabel(id: SpellEffectId | string | undefined): string {
    if (!id || id === LSCGSpellEffect.none) return LSCGSpellEffect.none;
    return getSpellEffect(id)?.label ?? `(unavailable) ${id}`;
}

export function effectDescription(id: SpellEffectId | string | undefined): string {
    if (!id || id === LSCGSpellEffect.none) return "";
    return getSpellEffect(id)?.description ?? "This effect comes from an extension that isn't installed.";
}

/** Added by an installed extension (shown with an extension icon so it stands apart from built-ins). */
export function isExtensionEffect(id: SpellEffectId | string | undefined): boolean {
    return !!getSpellEffect(id)?.source;
}

/** Description plus, for built-ins, its school and tier and, for extension effects, which extension added it. */
export function effectTooltip(id: SpellEffectId | string | undefined): string {
    const def = getSpellEffect(id);
    const classification = def?.school ?? "";
    return [effectDescription(id), classification, def?.source ? `Added by extension: ${def.source}` : ""].filter(t => !!t).join("\n");
}

export function effectDomain(id: SpellEffectId | string | undefined): SpellDomain | undefined {
    return getSpellEffect(id)?.domain;
}

export function effectSchool(id: SpellEffectId | string | undefined): SpellSchool | undefined {
    return getSpellEffect(id)?.school;
}

/** An effect's tier. For one whose tier depends on its settings: the tier of `config` (the sanitized settings), or of its
 *  defaults when none is given, which is its lowest. 0 for an effect with no tier (an extension's, or one that isn't installed). */
export function effectTier(id: SpellEffectId | string | undefined, config?: unknown): number {
    const def = getSpellEffect(id);
    if (!def || def.tier === undefined) return 0;
    return typeof def.tier === "function" ? def.tier(config ?? def.config?.defaults()) : def.tier;
}

export function effectsInDomain(domain: SpellDomain): SpellEffectId[] {
    return spellEffects.all().filter(d => d.domain === domain).map(d => d.id);
}

export function effectsInSchool(school: SpellSchool): SpellEffectId[] {
    return spellEffects.all().filter(d => d.school === school).map(d => d.id);
}

/** Effects whose lowest tier is `tier`. */
export function effectsInTier(tier: SpellTier): SpellEffectId[] {
    return spellEffects.all().filter(d => effectTier(d.id) === tier).map(d => d.id);
}

export { SPELL_TIERS, domainDescription, domainOrder };

export function isPairedEffect(id: SpellEffectId | string): boolean {
    return !!getSpellEffect(id)?.paired;
}

export function spellHasPairedEffect(spell: SpellDefinition | undefined): boolean {
    return spell?.Effects?.some(isPairedEffect) ?? false;
}

/** Every effect is beneficial (and known); unknown effects count as harmful. */
export function spellIsBeneficial(spell: SpellDefinition): boolean {
    return spell.Effects.every(e => !!getSpellEffect(e)?.beneficial);
}

export function spellForcesDuration(spell: SpellDefinition): boolean {
    return spell.Effects.some(e => !!getSpellEffect(e)?.forcesDuration);
}
