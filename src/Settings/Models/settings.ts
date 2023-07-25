import { BoopsModule } from "Modules/boops";
import { InjectorModule } from "Modules/injector";
import { BaseSettingsModel, GlobalPublicSettingsModel, GlobalSettingsModel, LipstickSettingsModel, MiscSettingsModel } from "./base";
import { CollarModel, CollarPublicSettingsModel, CollarSettingsModel } from "./collar";
import { HypnoPublicSettingsModel, HypnoSettingsModel } from "./hypno";
import { InjectorPublicSettingsModel, InjectorSettingsModel } from "./injector";
import { ActivitySettingsModel } from "./activities";

export interface SettingsModel {
    Version: string;
    RethrowExceptions: boolean;
    CollarModule: CollarSettingsModel;
    HypnoModule: HypnoSettingsModel;
    BoopsModule: BaseSettingsModel;
    LipstickModule: LipstickSettingsModel;
    GlobalModule: GlobalSettingsModel;
    MiscModule: MiscSettingsModel;
    InjectorModule: InjectorSettingsModel;
    ActivityModule: ActivitySettingsModel;
}

export interface IPublicSettingsModel extends BaseSettingsModel {
    Version: string;
    CollarModule: CollarPublicSettingsModel;
    HypnoModule: HypnoPublicSettingsModel;
    BoopsModule: BaseSettingsModel;
    LipstickModule: LipstickSettingsModel;
    GlobalModule: GlobalPublicSettingsModel;
    MiscModule: BaseSettingsModel;
    InjectorModule: InjectorPublicSettingsModel;
}

export class PublicSettingsModel implements IPublicSettingsModel {
    enabled: boolean = false;
    Version: string = LSCG_VERSION;
    CollarModule: CollarPublicSettingsModel = <CollarPublicSettingsModel>{
        enabled: false,
        chokeLevel: 0,
        collarPurchased: false,
        allowedMembers: "",
        remoteAccess: false,
        lockable: false,
        locked: false,
        immersive: false,
        limitToCrafted: false,
        collar: <CollarModel>{creator: -1, name:""},
        tightTrigger: "",
        looseTrigger: "",
        allowSelfTightening: false,
        allowSelfLoosening: false,
        anyCollar: false        
    };
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
    LipstickModule: LipstickSettingsModel = <LipstickSettingsModel>{
        enabled: false,
        dry: false
    };
    GlobalModule: GlobalPublicSettingsModel = <GlobalPublicSettingsModel>{
        enabled: false,
        sharePublicCrafting: false
    };
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