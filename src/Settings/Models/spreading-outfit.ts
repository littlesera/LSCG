import { BaseSettingsModel, ModuleStats } from "./base";


export interface SpreadingOutfitModuleStats extends ModuleStats {
    CurrentOutfitIndex: number;
    CurrentRepeatNumber: number;
    NextActivationTime: number; // in ms
    LastUsedOutfitIndex: number;
}

export interface SpreadingOutfitSettingsModel extends SpreadingOutfitPublicSettingsModel {
    AllowSelfStop: boolean;
}

export interface SpreadingOutfitPublicSettingsModel extends BaseSettingsModel {
    Active: boolean;
    AllowedRemote: "Public" | "Friend" | "Whitelist" | "Lover" | "Owner" | "Self";
    Locked: boolean;
    Lockable: boolean;
    Outfit1: SpreadingOutfitCodeConfig;
    Outfit2: SpreadingOutfitCodeConfig;
    Outfit3: SpreadingOutfitCodeConfig;
    RepeatInterval: number; // in min
    ItemInterval: number; // in sec
    RepeatNumber: number;
    StartSpreadingTriggerWords: string;
    ActivateCurseTriggerWords: string;
    Internal: SpreadingOutfitModuleStats;
}

export interface SpreadingOutfitCodeConfig {
    Code: string;
    Enabled: boolean;
}