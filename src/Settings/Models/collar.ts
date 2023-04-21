import { BaseSettingsModel } from "./base";

export interface CollarSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
    allowedMembers: string;
    collar: CollarModel;
    tightTrigger: string;
    looseTrigger: string;
}

export interface CollarModel {
    name: string;
    creator: number;
}