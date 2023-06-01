import { BaseSettingsModel } from "./base";

export interface InjectorSettingsModel extends BaseSettingsModel {
    sedativeKeywords: string[];
    mindControlKeywords: string[];
    hornyKeywords: string[];
    netgunKeywords: string[];
    cureKeywords: string[];
    tickLength: number;
    sedativeCooldown: number;
    mindControlCooldown: number;
    hornyCooldown: number;
    netgunIsChaotic: boolean;
}