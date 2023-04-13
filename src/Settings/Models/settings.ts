import { BaseSettingsModel, GlobalSettingsModel, MiscSettingsModel } from "./base";
import { CollarSettingsModel } from "./collar";
import { HypnoSettingsModel } from "./hypno";

export interface SettingsModel {
    CollarModule: CollarSettingsModel;
    HypnoModule: HypnoSettingsModel;
    BoopsModule: BaseSettingsModel;
    LipstickModule: BaseSettingsModel;
    GlobalModule: GlobalSettingsModel;
    MiscModule: MiscSettingsModel;
}