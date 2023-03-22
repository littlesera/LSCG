import { BaseSettingsModel } from "./base";

export interface CollarSettingsModel extends BaseSettingsModel {
    chokeLevel: number;
    allowedMembers: number[];    
}