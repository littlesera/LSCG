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
    Version: string;
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
    Version: string = LSCG_VERSION;
    CollarModule: CollarPublicSettingsModel = <CollarPublicSettingsModel>{chokeLevel: 0, enabled: false};
    HypnoModule: HypnoPublicSettingsModel = <HypnoPublicSettingsModel>{
        enabled: false,
        activatedAt: 0,
        recoveredAt: 0,
        cycleTime: 30,
        enableCycle: true,
        overrideMemberIds: "",
        overrideWords: "",
        awakeners: "",
        allowLocked: false,
        remoteAccess: false,
        remoteAccessRequiredTrance: true,
        limitRemoteAccessToHypnotizer: true,
        allowRemoteModificationOfMemberOverride: false,
        cooldownTime: 0,
        enableArousal: false,
        immersive: false,
        triggerTime: 5,
        locked: false,
        hypnotized: false,
        hypnotizedBy: 0,
    };
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
        drugLevelMultiplier: 100,
        asleep: false,
        brainwashed: false
    };
}