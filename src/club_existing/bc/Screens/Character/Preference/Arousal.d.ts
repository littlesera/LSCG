declare function PreferenceSubscreenArousalLoad(): void;
/**
 * Sets the arousal preferences for a player. Redirected to from the main Run function if the player is in the arousal
 * settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenArousalRun(): void;
/**
 * Gets a color code for a given arousal factor
 * @param {number} Factor - The factor that should be translated in a color code
 * @returns {string} - The color for the given factor in the format "#rrggbbaa"
 */
declare function PreferenceGetFactorColor(Factor: number): string;
/**
 * Handles the click events for the arousal settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenArousalClick(): void;
/**
 * Loads the activity factor combo boxes based on the current activity selected
 * @returns {void} - Nothing
 */
declare function PreferenceLoadActivityFactor(): void;
/**
 * Loads the fetish factor combo boxes based on the current fetish selected
 * @returns {void} - Nothing
 */
declare function PreferenceLoadFetishFactor(): void;
/**
 * Increment the passed arousal factor.
 * @param {ArousalFactor} factor
 * @returns {ArousalFactor}
 */
declare function PreferenceIncrementArousalFactor(factor: ArousalFactor): ArousalFactor;
/**
 * Decrement the passed arousal factor.
 * @param {ArousalFactor} factor
 * @returns {ArousalFactor}
 */
declare function PreferenceDecrementArousalFactor(factor: ArousalFactor): ArousalFactor;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenArousalExit(): boolean;
/** @type {ArousalActiveName[]} */
declare var PreferenceArousalActiveList: ArousalActiveName[];
declare var PreferenceArousalActiveIndex: number;
/** @type {ArousalVisibleName[]} */
declare var PreferenceArousalVisibleList: ArousalVisibleName[];
declare var PreferenceArousalVisibleIndex: number;
/** @type {ArousalAffectStutterName[]} */
declare var PreferenceArousalAffectStutterList: ArousalAffectStutterName[];
declare var PreferenceArousalAffectStutterIndex: number;
/** @type {null | ActivityName[]} */
declare var PreferenceArousalActivityList: null | ActivityName[];
declare var PreferenceArousalActivityIndex: number;
/** @type {ArousalFactor} */
declare var PreferenceArousalActivityFactorSelf: ArousalFactor;
/** @type {ArousalFactor} */
declare var PreferenceArousalActivityFactorOther: ArousalFactor;
/** @type {ArousalFactor} */
declare var PreferenceArousalZoneFactor: ArousalFactor;
/** @type {null | FetishName[]} */
declare var PreferenceArousalFetishList: null | FetishName[];
declare var PreferenceArousalFetishIndex: number;
/** @type {ArousalFactor} */
declare var PreferenceArousalFetishFactor: ArousalFactor;
/**
 * By default on new characters, all activities are neutral on self and others
 * */
declare var PreferenceArousalActivityDefaultCompressedString: string;
/**
 * By default on new characters, all zones are of neutral preference and vulva/clit/butt can trigger an orgasm
 */
declare var PreferenceArousalZoneDefaultCompressedString: string;
/**
 * By default on new characters, all festishes are of neutral preference
 */
declare var PreferenceArousalFetishDefaultCompressedString: string;
