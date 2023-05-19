/**
 * Check if we must start a Pandora ransom for one of the girls in the private room
 * @returns {boolean} - TRUE if a ransom or more was started
 */
declare function PrivateRansomStart(): boolean;
/**
 * Loads the private ransom note screen
 * @returns {void} - Nothing.
 */
declare function PrivateRansomLoad(): void;
/**
 * Draws the character and the ransom note
 * @returns {void} - Nothing.
 */
declare function PrivateRansomRun(): void;
/**
 * Handles clicks in the ransom note
 * @returns {void} - Nothing.
 */
declare function PrivateRansomClick(): void;
/**
 * When the player leaves the note, we go back to the private room
 * @returns {void} - Nothing.
 */
declare function PrivateRansomExit(): void;
declare var PrivateRansomBackground: string;
/** @type {null | NPCCharacter} */
declare var PrivateRansomCharacter: null | NPCCharacter;
