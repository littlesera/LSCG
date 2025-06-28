import { BaseSettingsModel, ModuleStats } from "./base";

export type SpreadSpeed = "slow" | "medium" | "fast" | "instant";
export type ItemType = "cloth" | "bind" | "cosplay" | "body" | "gender";

export interface CursedItemModel {
    Name: string;
    Enabled: boolean;
    OutfitKey: string;
    Speed: SpreadSpeed;
    Inexhaustable: boolean;
    Filter: ItemType[];
}

export interface CursedItemWorn {
    ItemName: string;
    CurseName: string;
    Crafter: number;
    OutfitCode: string;
    Speed: SpreadSpeed;
    Inexhaustable: boolean;
    lastTick: number;
}

export interface SpreadingOutfitSettingsModel extends BaseSettingsModel {
    Allowed: "Public" | "Friend" | "Whitelist" | "Lover" | "Owner" | "Self";
    Vulnerable: boolean;
    CursedItems: CursedItemModel[];
}