import { BaseSettingsModel } from "./base";

export interface InjectorSettingsModel extends InjectorPublicSettingsModel {
    immersive: boolean;
    enableSedative: boolean;
    enableMindControl: boolean;
    enableHorny: boolean;
    sedativeKeywords: string[];
    mindControlKeywords: string[];
    hornyKeywords: string[];
    netgunKeywords: string[];
    cureKeywords: string[];
    hornyTickTime: number;
    sedativeCooldown: number;
    mindControlCooldown: number;
    hornyCooldown: number;
    netgunIsChaotic: boolean;
    showDrugLevels: boolean;
}

export interface InjectorPublicSettingsModel extends BaseSettingsModel {
    asleep: boolean;
    brainwashed: boolean;
    sedativeLevel: number;
    mindControlLevel: number;
    hornyLevel: number;
    drugLevelMultiplier: number;
    sedativeMax: number;
    mindControlMax: number;
    hornyLevelMax: number;
}