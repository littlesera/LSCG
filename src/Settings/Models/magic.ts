import { BaseSettingsModel } from "./base";

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
    reduce = "Reducing",
    paired_arousal = "Pairing", 
    orgasm_siphon = "Siphoning", 
    outfit = "Outfit",
    dispell = "Dispell"
}

export enum OutfitOption {
    clothes_only = "Clothes Only",
    binds_only = "Restraints Only",
    both = "Clothes and Restraints"
}
export interface OutfitConfig {
    Code: string;
    Option: OutfitOption;
}
export interface SpellDefinition {
    Name: string;
    Creator: number;
    Effects: LSCGSpellEffect[];
    AllowPotion: boolean;
    Outfit?: OutfitConfig;
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    
}

export interface MagicPublicSettingsModel extends BaseSettingsModel{
    knownSpells: SpellDefinition[];
    blockedSpellEffects: LSCGSpellEffect[];
    enableWildMagic: boolean;
    trueWildMagic: boolean;
    forceWildMagic: boolean;
    lockable: boolean;
    locked: boolean;

    // remote access
    remoteAccess: boolean;
    remoteAccessRequiredTrance: boolean;
    limitRemoteAccessToHypnotizer: boolean;
    remoteMemberIds: string;
}