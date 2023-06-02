import { BaseSettingsModel } from "./base";

export interface CollarSettingsModel extends CollarPublicSettingsModel {    
    allowedMembers: string;
    collar: CollarModel;
    tightTrigger: string;
    looseTrigger: string;
}

export interface CollarPublicSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
}

export interface CollarModel {
    name: string;
    creator: number;
}