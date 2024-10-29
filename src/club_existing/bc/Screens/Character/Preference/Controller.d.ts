/**
 * Sets the controller preferences for the player. Redirected to from the main Run function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenControllerRun(): void;
/**
 * Handles click events for the controller preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenControllerClick(): void;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenControllerExit(): boolean;
declare var PreferenceSettingsSensitivityList: number[];
declare var PreferenceSettingsSensitivityIndex: number;
declare var PreferenceSettingsDeadZoneList: number[];
declare var PreferenceSettingsDeadZoneIndex: number;
declare var PreferenceCalibrationStage: number;
