import { BaseSettingsModel } from "./base";

export interface CollarSettingsModel extends CollarPublicSettingsModel {        
    
}

export interface CollarPublicSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
    collarPurchased: boolean;
    allowedMembers: string;
    remoteAccess: boolean;
    lockable: boolean;
    locked: boolean;
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