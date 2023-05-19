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
declare var LARPBackground: string;
/** @type {null | NPCCharacter} */
declare var LARPOrganiser: null | NPCCharacter;
