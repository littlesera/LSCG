/**
 * Prepares the graphics settings subscreen
 */
declare function PreferenceSubscreenGraphicsLoad(): void;
/**
 * Sets the graphical preferences for a player. Redirected to from the main Run function if the player is in the
 * visibility settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGraphicsRun(): void;
/**
 * Handles click events for the audio preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGraphicsClick(): void;
declare function PreferenceSubscreenGraphicsExit(): boolean;
/** @type {SettingsVFXName[]} */
declare var PreferenceSettingsVFXList: SettingsVFXName[];
declare var PreferenceSettingsVFXIndex: number;
/** @type {SettingsVFXVibratorName[]} */
declare var PreferenceSettingsVFXVibratorList: SettingsVFXVibratorName[];
declare var PreferenceSettingsVFXVibratorIndex: number;
/** @type {SettingsVFXFilterName[]} */
declare var PreferenceSettingsVFXFilterList: SettingsVFXFilterName[];
declare var PreferenceSettingsVFXFilterIndex: number;
/** @type {GraphicsFontName[]} */
declare var PreferenceGraphicsFontList: GraphicsFontName[];
/** @type {WebGLPowerPreference[]} */
declare var PreferenceGraphicsPowerModes: WebGLPowerPreference[];
declare var PreferenceGraphicsFontIndex: number;
/** @type {null | number} */
declare var PreferenceGraphicsAnimationQualityIndex: null | number;
/** @type {null | number} */
declare var PreferenceGraphicsPowerModeIndex: null | number;
/** @type {null | WebGLContextAttributes} */
declare var PreferenceGraphicsWebGLOptions: null | WebGLContextAttributes;
declare var PreferenceGraphicsAnimationQualityList: number[];
declare var PreferenceGraphicsFrameLimit: number[];
