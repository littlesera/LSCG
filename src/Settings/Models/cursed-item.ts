import { BaseSettingsModel, ModuleStats } from "./base";

export type SpreadSpeed = "slow" | "medium" | "fast" | "instant" | "custom";
export type ItemType = "cloth" | "bind" | "cosplay" | "body" | "gender";

export enum StripLevel {
    NONE = 0,       // 000
    CLOTHES = 1,    // 001
    UNDERWEAR = 2,  // 010
    COSPLAY = 4     // 100
}

export interface CursedItemModel {
    Name: string;
    Enabled: boolean;
    OutfitKey: string;
    Speed: SpreadSpeed;
    CustomSpeed: number;
    Inexhaustable: boolean;
    SuppressEmote: boolean;
    Filter: ItemType[];
    Strip: StripLevel;
    InstaStrip: boolean;
}

export interface CursedItemWorn {
    ItemName: string;
    CurseName: string;
    Crafter: number;
    OutfitCode: string;
    Speed: SpreadSpeed;
    CustomSpeed: number;
    Inexhaustable: boolean;
    SuppressEmote: boolean;
    Strip: StripLevel;
    InstaStrip: boolean;
    lastTick: number;
    BlockedGroups: string[];
}

export interface CursedItemSettingsModel extends BaseSettingsModel {
    Allowed: "Public" | "Friend" | "Whitelist" | "Lover" | "Owner" | "Self";
    Vulnerable: boolean;
    CursedItems: CursedItemModel[];
    SuppressEmote: boolean;
    AlwaysExhaust: boolean;
    BlockExistingGroups: boolean;
}