/**
 * Loads the preference censored words screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsLoad(): void;
/**
 * Sets the censored words for the player. Redirected to from the main Run function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsRun(): void;
/**
 * Handles click events for the censored words preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsClick(): void;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenCensoredWordsExit(): boolean;
/** @type {string[]} */
declare var PreferenceCensoredWordsList: string[];
declare var PreferenceCensoredWordsOffset: number;
