/**
 * Loads the password reset screen
 * @returns {void} Nothing
 */
declare function PasswordResetLoad(): void;
/**
 * Runs the password reset screen
 * @returns {void} Nothing
 */
declare function PasswordResetRun(): void;
/**
 * Handles a password reset response
 * @param {string} msg - The password reset response message to be displayed to the player
 * @returns {void} Nothing
 */
declare function PasswordResetResponse(msg: string): void;
/**
 * Handles player click events on the password reset screen
 * @returns {void} Nothing
 */
declare function PasswordResetClick(): void;
/**
 * Sends the player back to the login screen
 * @returns {void} Nothing
 */
declare function PasswordResetExit(): void;
declare var PasswordResetBackground: string;
declare var PasswordResetMessage: string;
