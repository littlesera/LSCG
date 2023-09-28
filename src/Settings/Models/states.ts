import { BaseSettingsModel, ModuleStats } from "./base";

export interface StateConfig {
    type: LSCGState;
    active: boolean;
    activatedBy: number;
    activatedAt: number;
    recoveredAt: number;
    activationCount: number;
    extensions: any;
    duration: number | undefined;
}

export interface StateSettingsModel extends StatePublicSettingsModel {
    
}

export interface StatePublicSettingsModel extends BaseSettingsModel {
    states: StateConfig[];
    immersive: boolean;
}