import { BaseSettingsModel, ModuleStats } from "./base";

export interface CollarSettingsModel extends CollarPublicSettingsModel {        
    stats: CollarModuleStats;
}

export interface CollarModuleStats extends ModuleStats {
    collarPassoutCount: number;
    handPassoutCount: number;
    gagPassoutCount: number;
}

export interface CollarPublicSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
    collarPurchased: boolean;
    allowedMembers: string;
    remoteAccess: boolean;
    lockable: boolean;
    locked: boolean;
    immersive: boolean;
    anyCollar: boolean;
    limitToCrafted: boolean;
    collar: CollarModel;
    tightTrigger: string;
    looseTrigger: string;
    allowSelfTightening: boolean;
    allowSelfLoosening: boolean;
}

export interface CollarModel {
    name: string;
    creator: number;
}