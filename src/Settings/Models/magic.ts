import { SpiritTextType } from "Settings/magic";
import { BaseSettingsModel } from "./base";

export const KNOWN_SPELLS_LIMIT: number = 48;

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
    loosen = "Loosening"
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

export interface SpellDefinition {
    Name: string;
    CastingPhrase?: string;
    Creator: number;
    Effects: SpellEffectId[];
    AllowPotion: boolean;
    AllowVoiceCast: boolean;
    Outfit?: OutfitConfig;
    Polymorph?: PolymorphConfig;
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    knownSpells: SpellDefinition[];
    allowChangePronouns: boolean;
    spiritTextFormat: SpiritTextType;
    spiritFormOutfitKey: string;
    disableSoulBindings: boolean;
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