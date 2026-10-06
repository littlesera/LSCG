import { SpiritTextType } from "Settings/magic";
import { BaseSettingsModel } from "./base";

export const KNOWN_SPELLS_LIMIT: number = 48;

/** How many effects one of the player's spells can have, unless their settings say otherwise. Kept as a per-player
 *  setting so a future progression system can raise it. Spells apply their effects in order, one after another. */
export const DEFAULT_MAX_SPELL_EFFECTS: number = 3;

/** The most effects any spell may have, whoever made it. A client can't know the limit of the player a spell came
 *  from, so this is what it will accept from others, keeping stored and applied spells to a sane size. */
export const ABSOLUTE_MAX_SPELL_EFFECTS: number = 8;

/** The player's effect limit per spell, whatever the saved settings hold. */
export function maxSpellEffects(settings?: { maxSpellEffects?: number }): number {
    const limit = settings?.maxSpellEffects;
    return typeof limit === "number" && Number.isInteger(limit) && limit >= 1
        ? Math.min(limit, ABSOLUTE_MAX_SPELL_EFFECTS)
        : DEFAULT_MAX_SPELL_EFFECTS;
}

/** A spell effect id: a built-in effect, or an extension's namespaced "<extension id>.<name>". */
export type SpellEffectId = LSCGSpellEffect | `${string}.${string}`;

export function cleanEffect<T extends SpellEffectId>(effect: T) : T {
		if (effect?.toLocaleLowerCase() == "dispell")
			return LSCGSpellEffect.dispel as T;
		return effect;
	}

export enum LSCGSpellEffect {
    none = "None",
    hypnotizing = "Hypnotizing", 
    slumber = "Slumbering", 
    horny = "Arousing", 
    blindness = "Blinding", 
    deafened = "Deafening", 
    muted = "Gagged", 
    frozen = "Petrifying",
    enlarge = "Enlarging",
    //reduce = "Reducing",
    bless = "Bless",
    bane = "Bane",
    paired_arousal = "Pairing", 
    orgasm_siphon = "Siphoning", 
    outfit = "Outfit",
    polymorph = "Polymorph",
    dispel = "Dispel",
    xRay = "X-Ray Vision",
    barrier = "Magic Barrier",
    disarm = "Disarming",
    denial = "Denying",
    orgasm = "Forced Orgasm",
    project = "Astral Projection",
    tighten = "Tightening",
    loosen = "Loosening",
    damage = "Damaging",
    dissolve = "Dissolving Clothes",
    web = "Web",
    slime = "Slime",
    ropes = "Conjured Ropes",
    command = "Commanding",
    grasp = "Grasping",
    removeCurse = "Remove Curse"
}

export enum OutfitOption {
    clothes_only = "Clothes Only",
    binds_only = "Restraints Only",
    both = "Clothes and Restraints"
}

// Deprecated
export enum PolymorphOption {
    cosplay_only = "Cosplay Only",
    body_only = "Whole Body Only",
    both = "Body and Cosplay",
}

export interface ItemBundleConfig {
    Code: string; // Expanded to full outfit code on status apply...
    Key: string;
}

export interface OutfitConfig extends ItemBundleConfig {
    Option: OutfitOption;
}

export interface PolymorphConfig extends ItemBundleConfig {
    IncludeCosplay: boolean;
    IncludeSkin: boolean;
    IncludeHair: boolean;
    IncludeGenitals: boolean;
    IncludeAllBody: boolean;    
}

/** The classic damage types. Only flavour for now: they name what hit the target. */
export enum DamageType {
    acid = "Acid",
    bludgeoning = "Bludgeoning",
    cold = "Cold",
    fire = "Fire",
    force = "Force",
    lightning = "Lightning",
    necrotic = "Necrotic",
    piercing = "Piercing",
    poison = "Poison",
    psychic = "Psychic",
    radiant = "Radiant",
    slashing = "Slashing",
    thunder = "Thunder",
}

/** What a successful save does to a spell's damage. */
export enum DamageSave {
    half = "Half damage",
    none = "No damage",
}

export interface DamageConfig {
    Type: DamageType;
    /** What the target's save does to the damage. Half damage when missing. */
    Save?: DamageSave;
    /** A dice expression such as "2d6 + 2"; empty for damage with no number. */
    Roll: string;
}

export const DEFAULT_DAMAGE_TYPE = DamageType.force;

export interface SpellDefinition {
    Name: string;
    CastingPhrase?: string;
    Creator: number;
    Effects: SpellEffectId[];
    AllowPotion: boolean;
    AllowVoiceCast: boolean;
    Outfit?: OutfitConfig;
    Polymorph?: PolymorphConfig;
    /** Each effect's own settings, by position: `Configs[i]` belongs to `Effects[i]`, since the same effect may appear more
     *  than once with different settings. Entries are missing or null for effects with none. Kept aligned by spellEdit.ts. */
    Configs?: unknown[];
    /** The spell's total power: every effect's tier added up, counting each copy. Always worked out from the effects (never taken from
     *  another player's spell); stored so it can later set a spell's cost. */
    Tier?: number;
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    knownSpells: SpellDefinition[];
    allowChangePronouns: boolean;
    spiritTextFormat: SpiritTextType;
    spiritFormOutfitKey: string;
    disableSoulBindings: boolean;
    /** Most effects one of this player's spells can have (see DEFAULT_MAX_SPELL_EFFECTS). */
    maxSpellEffects: number;
    /** Extension spell effects this player has been shown, so `defaultBlocked` applies only once. */
    seenExtensionEffects: string[];
}

export interface MagicPublicSettingsModel extends BaseSettingsModel{
    blockedSpellEffects: SpellEffectId[];
    bypassForSelfEffects: SpellEffectId[]; // Awkward second collection to preserve existing blocks...
    /** Non-legacy spell effects this client can apply (newer built-ins and extension effects). Filled at sync time, never persisted. */
    knownEffects?: string[];
    enableWildMagic: boolean;
    trueWildMagic: boolean;
    forceWildMagic: boolean;
    lockable: boolean;
    locked: boolean;
    allowOutfitToChangeNeckItems: boolean;
    allowChangeGenitals: boolean;

    // remote access
    remoteAccess: boolean;
    remoteAccessRequiredTrance: boolean;
    limitRemoteAccessToHypnotizer: boolean;
    remoteMemberIds: string;

    // spell defense
    neverDefend: boolean;
    noDefenseMemberIds: string;
    limitedDuration: boolean;
    maxDuration: number;
    requireWhitelist: boolean;

    // XRay Block
    blockXRay: boolean;

    // Colors
    projectionTintColor: string;
    hideCorporeal: boolean;
}