import { BaseSettingsModel, ModuleStats } from "./base";

export interface ActivitySettingsModel extends ActivityPublicSettingsModel {
    activities: ActivityEntryModel[];
    stats: ActivityModuleStats;
}

export interface ActivityModuleStats extends ModuleStats {
    
}

export interface ActivityPublicSettingsModel extends BaseSettingsModel {
    
}

export interface ActivityEntryModel {
    name: string;
    group: string;
    hypno: boolean;
    hypnoThreshold: number;
    hypnoRequiredRepeats: number;
    orgasm: boolean;
    orgasmThreshold: number;
    awakener: boolean;
    allowedMemberIds: number[];
}