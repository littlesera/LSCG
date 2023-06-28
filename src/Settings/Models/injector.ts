import { BaseSettingsModel } from "./base";

export interface DrugSpecificSettingsModel {
    weakKeywords: string[];
    strongKeywords: string[];
}

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
    heartbeat: boolean;
    sedativeCooldown: number;
    mindControlCooldown: number;
    hornyCooldown: number;
    netgunIsChaotic: boolean;
    showDrugLevels: boolean;
    allowBoopRestore: boolean;
    continuousDeliveryActivatedAt: number;
    continuousDeliveryTimeout: number;
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