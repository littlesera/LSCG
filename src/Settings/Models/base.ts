export interface BaseSettingsModel {
    enabled: boolean;
}

export interface GlobalSettingsModel extends BaseSettingsModel {
    edgeBlur: boolean;
    showCheckRolls: boolean;
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