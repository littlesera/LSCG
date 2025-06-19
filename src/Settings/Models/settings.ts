import { BoopsModule } from "Modules/boops";
import { InjectorModule } from "Modules/injector";
import { BaseSettingsModel, GlobalPublicSettingsModel, GlobalSettingsModel, LipstickSettingsModel, MiscSettingsModel, OpacityPublicSettingsModel, OpacitySettingsModel, SplatterSettingsModel } from "./base";
import { CollarModel, CollarPublicSettingsModel, CollarSettingsModel } from "./collar";
import { HypnoPublicSettingsModel, HypnoSettingsModel } from "./hypno";
import { InjectorPublicSettingsModel, InjectorSettingsModel } from "./injector";
import { ActivitySettingsModel } from "./activities";
import { StateModule } from "Modules/states";
import { StatePublicSettingsModel, StateSettingsModel } from "./states";
import { MagicPublicSettingsModel, MagicSettingsModel } from "./magic";
import { ChaoticItemModule } from "Modules/chaotic-item";
import { SpreadingOutfitPublicSettingsModel, SpreadingOutfitSettingsModel } from "./spreading-outfit";


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
    StateModule: StateSettingsModel;
    MagicModule: MagicSettingsModel;
    SpreadingOutfitModule: SpreadingOutfitSettingsModel;
    OpacityModule: OpacitySettingsModel;
    LeashingModule: BaseSettingsModel;
    ChaoticItemModule: BaseSettingsModel;
    SplatterModule: SplatterSettingsModel;
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
    StateModule: StatePublicSettingsModel;
    MagicModule: MagicPublicSettingsModel;
    SpreadingOutfitModule: SpreadingOutfitPublicSettingsModel;
    OpacityModule: OpacityPublicSettingsModel;
    LeashingModule: BaseSettingsModel;
    ChaoticItemModule: BaseSettingsModel;
    SplatterModule: SplatterSettingsModel;
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
        allowButtons: false,
        anyCollar: false,
        knockout: false,
        knockoutMinutes: 2
    };
    HypnoModule: HypnoPublicSettingsModel = <HypnoPublicSettingsModel>{
        enabled: false,
        activatedAt: 0,
        recoveredAt: 0,
        cycleTime: 30,
        enableCycle: true,
        overrideMemberIds: "",
        randomTrigger: false,
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
        speakTriggers: "",
        silenceTriggers: "",
        allowSuggestions: false,
        suggestionRequireHypnotizer: true,
        allowSuggestionRemoval: true,
        blockedInstructions: [],
        alwaysSubmit: false,
        alwaysSubmitMemberIds: ""
    };
    BoopsModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    LeashingModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
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
    StateModule: StatePublicSettingsModel = <StatePublicSettingsModel>{
        enabled: true,
        immersive: false,
        states: []
    };
    MagicModule: MagicPublicSettingsModel = <MagicPublicSettingsModel>{
        enabled: false,
        enableWildMagic: false,
        forceWildMagic: false,
        trueWildMagic: false,
        blockedSpellEffects: [],
        bypassForSelfEffects: [],
        lockable: false,
        locked: false,
        remoteAccess: false,
        remoteAccessRequiredTrance: false,
        limitRemoteAccessToHypnotizer: false,
        remoteMemberIds: "",
        neverDefend: false,
        noDefenseMemberIds: "",
        limitedDuration: true,
        maxDuration: 0,
        allowOutfitToChangeNeckItems: false,
        allowChangeGenitals: true,
        requireWhitelist: false,
        blockXRay: true
    };
    OpacityModule: OpacityPublicSettingsModel = <OpacityPublicSettingsModel>{
        enabled: true,
        preventExternalMod: false
    };
    SpreadingOutfitModule: SpreadingOutfitPublicSettingsModel = <SpreadingOutfitPublicSettingsModel>{
        enabled: false,
        Active: false,
        Locked: false,
        Lockable: false,
        AllowedRemote: "Self",
        Outfit1: {Code: "", Enabled: false},
        Outfit2: {Code: "", Enabled: false},
        Outfit3: {Code: "", Enabled: false},
        RepeatInterval: 10,
        RepeatNumber: 5,
        ItemInterval: 30,
        Internal: {CurrentOutfitIndex: 0, CurrentRepeatNumber: 0, NextActivationTime: 0, LastUsedOutfitIndex: -1},
        StartSpreadingTriggerWords: "",
        ActivateCurseTriggerWords: ""
    };
    ChaoticItemModule: BaseSettingsModel = <BaseSettingsModel>{enabled: false};
    SplatterModule: SplatterSettingsModel = <SplatterSettingsModel>{
        enabled: false,
        giver: false,
        taker: false,
        colorOverride: null,
        opacityOverride: null,
        uncontrollableWhenBound: true,
        autoSplat: true,
        blacklist: [],
        whitelist: [],
        requireLover: false,
        minArousal: 90
    };
}