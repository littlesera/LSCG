/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function LARPCanPlayClubCard(): boolean;
/**
 * Loads the LARP introduction room NPC
 * @returns {void} - Nothing
 */
declare function LARPLoad(): void;
/**
 * Runs and draws the LARP introduction screen. The screen can be used to search for daily jobs.
 * @returns {void} - Nothing
 */
declare function LARPRun(): void;
/**
 * Handles clicks in the LARP introduction screen. And adds the LARP Backgrounds to the list of seletable backgrounds.
 * @returns {void} - Nothing
 */
declare function LARPClick(): void;
/**
 * Sets the new LARP class selected by the player
 * @param {string} NewClass - Name of the newly selected class
 * @returns {void} - Nothing
 */
declare function LARPSelectClass(NewClass: string): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function LARPClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function LARPClubCardEnd(): void;
declare var LARPBackground: string;
/** @type {null | NPCCharacter} */
declare var LARPOrganiser: null | NPCCharacter;
