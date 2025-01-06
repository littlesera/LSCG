import { BaseSettingsModel } from "./base";

export const KNOWN_SPELLS_LIMIT: number = 48;

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
    dispell = "Dispell",
    xRay = "X-Ray Vision",
    barrier = "Magic Barrier",
    disarm = "Disarming",
    denial = "Denying",
    orgasm = "Forced Orgasm"
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
    Code: string;
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
    Effects: LSCGSpellEffect[];
    AllowPotion: boolean;
    AllowVoiceCast: boolean;
    Outfit?: OutfitConfig;
    Polymorph?: PolymorphConfig;
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    knownSpells: SpellDefinition[];
    allowChangePronouns: boolean;
}

export interface MagicPublicSettingsModel extends BaseSettingsModel{
    blockedSpellEffects: LSCGSpellEffect[];
    bypassForSelfEffects: LSCGSpellEffect[]; // Awkward second collection to preserve existing blocks...
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
}