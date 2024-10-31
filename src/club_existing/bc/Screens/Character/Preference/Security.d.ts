/**
 * Loads the preference security screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityLoad(): void;
/**
 * Sets the security preferences for a player. Redirected to from the main Run function if the player is in the
 * security settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityRun(): void;
/**
 * Handles the click events in the security settings dialog for a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityClick(): void;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenSecurityExit(): boolean;
