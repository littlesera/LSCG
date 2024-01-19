/**
 * Loads the character login screen. Imports data from the Bondage College if necessary
 * and creates the input fields. This function is called dynamically.
 * @returns {void} - Nothing
 */
declare function CreationLoad(): void;
/**
 * Runs the character creation screen. Draws all needed input fields and buttons.
 * If the import of Bondage College data is possible, an appropriate check box is drawn.
 * The function is called dynamically.
 * @returns {void} - Nothing
 */
declare function CreationRun(): void;
/**
 * Handles the server response to a creation request. Creates the character, if possible,
 * initializes the basic data and sends the newborn to the maid in the main hall.
 * @param {ServerAccountCreateResponse} data - The recieved data from the server
 * @returns {void} - Nothing
 */
declare function CreationResponse(data: ServerAccountCreateResponse): void;
/**
 * Handles click events in the creation dialog.
 * Imports data from Bondage College and creates a character.
 * @returns {void} - Nothing
 */
declare function CreationClick(): void;
/**
 * Does the cleanup, if the user exits the screen
 * @returns {void} - Nothing
 */
declare function CreationExit(): void;
declare var CreationBackground: string;
declare var CreationMessage: string;
