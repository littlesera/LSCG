import { BaseSettingsModel } from "./base";

export interface CollarSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
    allowedMembers: string;
    collar: CollarModel;
}

export interface CollarModel {
    name: string;
    creator: number;
}