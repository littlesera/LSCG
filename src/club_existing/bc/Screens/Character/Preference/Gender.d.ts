/**
 * Sets the gender preferences for a player. Redirected to from the main Run function if the player is in the
 * gender settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGenderRun(): void;
/**
 * Draws the two checkbox row for a gender setting
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {string} Text - The text for the setting's description
 * @param {PreferenceGenderSetting} Setting - The player setting the row corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceGenderDrawSetting(Left: number, Top: number, Text: string, Setting: PreferenceGenderSetting): void;
/**
 * Handles the click events for the notifications settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGenderClick(): void;
/**
 * Handles the click for a gender setting row
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {PreferenceGenderSetting} Setting - The player setting the row corresponds to
 * @param {boolean} MutuallyExclusive - Whether only one option can be enabled at a time
 * @returns {void} - Nothing
 */
declare function PreferenceGenderClickSetting(Left: number, Top: number, Setting: PreferenceGenderSetting, MutuallyExclusive: boolean): void;
