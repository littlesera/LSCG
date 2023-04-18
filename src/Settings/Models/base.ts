export interface BaseSettingsModel {
    enabled: boolean;
}

export interface GlobalSettingsModel extends BaseSettingsModel {
    edgeBlur: boolean;
}

export interface MiscSettingsModel extends BaseSettingsModel {
    chloroformEnabled: boolean;
    handChokeEnabled: boolean;
}