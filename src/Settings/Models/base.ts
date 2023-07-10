export interface BaseSettingsModel {
    enabled: boolean;
}

export interface ModuleStats {

}

export interface GlobalSettingsModel extends BaseSettingsModel {
    edgeBlur: boolean;
    showCheckRolls: boolean;
    blockSettingsWhileRestrained: boolean;
}

export interface LipstickSettingsModel extends BaseSettingsModel {
    dry: boolean;
}

export interface MiscSettingsModel extends BaseSettingsModel {
    chloroformEnabled: boolean;
    chloroformedAt: number;
    chloroformPotencyTime: number;
    immersiveChloroform: boolean;
    infiniteChloroformPotency: boolean;
    handChokeEnabled: boolean;
    gagChokeEnabled: boolean;
}