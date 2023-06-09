export interface BaseSettingsModel {
    enabled: boolean;
}

export interface GlobalSettingsModel extends BaseSettingsModel {
    edgeBlur: boolean;
    showCheckRolls: boolean;
}

export interface MiscSettingsModel extends BaseSettingsModel {
    chloroformEnabled: boolean;
    immersiveChloroform: boolean;
    handChokeEnabled: boolean;
    gagChokeEnabled: boolean;
}