import { Registry } from "api/registry";
import { cleanEffect, LSCGSpellEffect, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import type { MagicModule } from "Modules/magic";
import { BUILTIN_SPELL_EFFECTS } from "./builtinEffects";

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
    /** Display name of the extension that registered it; undefined for built-ins. */
    source?: string;
    apply(ctx: SpellEffectContext): void;
    /** Paired effects: runs on the second target once the first has been hit. */
    applyPaired?(ctx: SpellEffectContext, originalTarget: Character): void;
}

export const spellEffects = new Registry<SpellEffectDefinition>("spell effect");
BUILTIN_SPELL_EFFECTS.forEach(def => spellEffects.register(def));

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

/** Description plus, for extension effects, which extension added it. */
export function effectTooltip(id: SpellEffectId | string | undefined): string {
    const source = getSpellEffect(id)?.source;
    return [effectDescription(id), source ? `Added by extension: ${source}` : ""].filter(t => !!t).join("\n");
}

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
