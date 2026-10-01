import { BaseSettingsModel, ModuleStats } from "./base";

export interface DrugSpecificSettingsModel {
    weakKeywords: string[];
    strongKeywords: string[];
}

export interface InjectorModuleStats extends ModuleStats {
    forcedOrgasmCount: number;
    sedatedCount: number;
    brainwashedCount: number;
    curedCount: number;
    successfulNettingsCount: number;
    totalNettingsCount: number;
}

/** One extension drug's level bar, as published to other players. */
export interface ExtensionDrugBar {
    id: string;
    level: number;
    max: number;
    color: string;
}

export interface InjectorSettingsModel extends InjectorPublicSettingsModel {
    //immersive: boolean;
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
    enableContinuousDelivery: boolean;
    continuousDeliveryActivatedAt: number;
    continuousDeliveryTimeout: number;
    continuousDeliveryForever: boolean;
    stats: InjectorModuleStats;
    sipLimit: number;
    /** Extension drugs the player has opted in to (like enableSedative, but per drug). */
    enabledExtensionDrugs: string[];
    /** Current level of each extension drug, by id. */
    extensionDrugLevels: Record<string, number>;
}

export interface InjectorPublicSettingsModel extends BaseSettingsModel {
    //asleep: boolean;
    //brainwashed: boolean;
    sedativeLevel: number;
    mindControlLevel: number;
    hornyLevel: number;
    drugLevelMultiplier: number;
    sedativeMax: number;
    mindControlMax: number;
    hornyLevelMax: number;
    /** Extension drug bars. Filled at sync time from the registry and levels, never persisted. */
    drugLevels?: ExtensionDrugBar[];
}