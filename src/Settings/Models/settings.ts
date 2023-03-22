import { CollarSettingsModel } from "./collar";
import { HypnoSettingsModel } from "./hypno";

export interface SettingsModel {
    ChokeCollar: CollarSettingsModel;
    Hypno: HypnoSettingsModel;
}