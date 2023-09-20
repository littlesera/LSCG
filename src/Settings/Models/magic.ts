import { BaseSettingsModel } from "./base";

export enum LSCGSpellType {
    hypnotizing = "Hypnotizing", 
    slumber = "Slumbering", 
    horny = "Arousing", 
    blindness = "Blinding", 
    deafened = "Deafening", 
    muted = "Muting", 
    frozen = "Petrifying", 
    paired_arousal = "Pairing", 
    orgasm_siphon = "Siphoning", 
    outfit = "Growing"
}

export interface SpellDefinition {
    Name: string;
    Types: LSCGSpellType[];
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    knownSpells: SpellDefinition[];    
}

export interface MagicPublicSettingsModel extends BaseSettingsModel{
    blockedSpellTypes: LSCGSpellType[];
}