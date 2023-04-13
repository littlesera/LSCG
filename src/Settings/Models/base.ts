export interface BaseSettingsModel {
    enabled: boolean;
}

export interface GlobalSettingsModel extends BaseSettingsModel {
    edgeBlur: boolean;
}