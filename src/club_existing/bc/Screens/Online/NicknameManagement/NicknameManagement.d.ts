/**
 * Loads the Nickname Management screen
 * @returns {void} - Nothing
 */
declare function NicknameManagementLoad(): void;
/**
 * Draws the Nickname Management controls
 * @returns {void} - Nothing
 */
declare function NicknameManagementRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function NicknameManagementClick(): void;
/**
 * Handles exiting from the screen, updates the sub rules
 * @param {boolean} Save - Received rule data object.
 * @returns {void} - Nothing
 */
declare function NicknameManagementExit(Save?: boolean): void;
declare var NicknameManagementBackground: string;
/** @type {null | Character | NPCCharacter} */
declare var NicknameManagementTarget: null | Character | NPCCharacter;
declare var NicknameManagementLock: boolean;
