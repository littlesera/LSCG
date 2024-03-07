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
}

export interface GlobalPublicSettingsModel extends BaseSettingsModel {
    sharePublicCrafting: boolean;
}

export interface LipstickSettingsModel extends BaseSettingsModel {
    dry: boolean;
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