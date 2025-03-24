export interface BaseSettingsModel {
    enabled: boolean;
}

export interface ModuleStats {

}

export interface GlobalSettingsModel extends GlobalPublicSettingsModel {
    edgeBlur: boolean;
    showCheckRolls: boolean;
    blockSettingsWhileRestrained: boolean;
    seeSharedCrafts: boolean;
    hideResizing: boolean;
    erectionDetection: boolean;
    tamperproofEnabled: boolean;
    tamperproofElectricityEnabled: boolean;
}

export interface GlobalPublicSettingsModel extends BaseSettingsModel {
    sharePublicCrafting: boolean;
}

export interface LipstickSettingsModel extends BaseSettingsModel {
    dry: boolean;
}

export interface SplatterSettingsModel extends BaseSettingsModel {
    giver: boolean;
    taker: boolean;
    autoSplat: boolean;
    uncontrollableWhenBound: boolean;
    colorOverride: string | null;
    opacityOverride: string | null;
    whitelist: number[] | null;
    blacklist: number[] | null;
    requireLover: boolean;
    minArousal: number;
}

export interface MiscSettingsModel extends BaseSettingsModel {
    chloroformEnabled: boolean;
    chloroformedAt: number;
    chloroformPotencyTime: number;
    //immersiveChloroform: boolean;
    infiniteChloroformPotency: boolean;
    handChokeEnabled: boolean;
    gagChokeEnabled: boolean;
}

export interface OpacitySettingsModel extends OpacityPublicSettingsModel {
}

export interface OpacityPublicSettingsModel extends BaseSettingsModel {
    preventExternalMod: boolean;
}