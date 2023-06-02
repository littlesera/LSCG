import { BoopsModule } from "Modules/boops";
import { InjectorModule } from "Modules/injector";
import { BaseSettingsModel, GlobalSettingsModel, MiscSettingsModel } from "./base";
import { CollarPublicSettingsModel, CollarSettingsModel } from "./collar";
import { HypnoPublicSettingsModel, HypnoSettingsModel } from "./hypno";
import { InjectorPublicSettingsModel, InjectorSettingsModel } from "./injector";

export interface SettingsModel {
    CollarModule: CollarSettingsModel;
    HypnoModule: HypnoSettingsModel;
    BoopsModule: BaseSettingsModel;
    LipstickModule: BaseSettingsModel;
    GlobalModule: GlobalSettingsModel;
    MiscModule: MiscSettingsModel;
    InjectorModule: InjectorSettingsModel;
}

export interface IPublicSettingsModel extends BaseSettingsModel {
    CollarModule: CollarPublicSettingsModel;
    HypnoModule: HypnoPublicSettingsModel;
    BoopsModule: BaseSettingsModel;
    LipstickModule: BaseSettingsModel;
    GlobalModule: BaseSettingsModel;
    MiscModule: BaseSettingsModel;
    InjectorModule: InjectorPublicSettingsModel;
}

export class PublicSettingsModel implements IPublicSettingsModel {
    enabled: boolean = false;
    CollarModule: CollarPublicSettingsModel = <CollarPublicSettingsModel>{chokeLevel: 0, enabled: false};
    HypnoModule: HypnoPublicSettingsModel = <HypnoPublicSettingsModel>{activatedAt: 0, recoveredAt: 0, enabled: false};
    BoopsModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    LipstickModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    GlobalModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    MiscModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    InjectorModule: InjectorPublicSettingsModel = <InjectorPublicSettingsModel>{
        enabled: false, 
        sedativeLevel: 0,
        sedativeMax: 5,
        mindControlLevel: 0,
        mindControlMax: 5,
        hornyLevel: 0,
        hornyLevelMax: 5,
        drugLevelMultiplier: 100
    };
}