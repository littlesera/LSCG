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
    paired_arousal = "Pairing", 
    orgasm_siphon = "Siphoning", 
    outfit = "Outfit"
}

export interface SpellDefinition {
    Name: string;
    Creator: number;
    Effects: LSCGSpellEffect[];
    AllowPotion: boolean;
}

export interface MagicSettingsModel extends MagicPublicSettingsModel {
    knownSpells: SpellDefinition[];    
}

export interface MagicPublicSettingsModel extends BaseSettingsModel{
    blockedSpellEffects: LSCGSpellEffect[];
}