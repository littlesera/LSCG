declare function PreferenceSubscreenAudioLoad(): void;
/**
 * Sets the audio preferences for the player. Redirected to from the main Run function if the player is in the audio
 * settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenAudioRun(): void;
/**
 * Handles click events for the audio preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenAudioClick(): void;
/**
 * Exits the preference screen.
 */
declare function PreferenceSubscreenAudioExit(): boolean;
declare var PreferenceSettingsVolumeList: number[];
declare var PreferenceSettingsVolumeIndex: number;
declare var PreferenceSettingsMusicVolumeIndex: number;
