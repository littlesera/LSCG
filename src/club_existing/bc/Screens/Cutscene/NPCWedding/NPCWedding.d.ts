/**
 * Puts a wedding dress on a specified character
 * @param {Character} C - The character that must wear the ring.
 * @param {string} Dress - The asset name of wedding dress to wear.
 * @returns {void} - Nothing.
 */
declare function NPCWeddingDress(C: Character, Dress: string): void;
/**
 * Puts a bridesmaid dress on a specified character
 * @param {Character} C - The character that must wear the ring.
 * @returns {void} - Nothing.
 */
declare function NPCWeddingBridesmaid(C: Character): void;
/**
 * Loads the NPC wedding cutscene by creating the random NPCs and setting the stage
 * @returns {void} - Nothing
 */
declare function NPCWeddingLoad(): void;
/**
 * Runs and draws the NPC wedding cutscene
 * @returns {void} - Nothing
 */
declare function NPCWeddingRun(): void;
/**
 * Handles clicks during the NPC wedding cutscene. Clicking anywhere on the screen advances the cutscene. At the end of the cutscene, the player is sent back to her private room.
 * @returns {void} - Nothing
 */
declare function NPCWeddingClick(): void;
declare var NPCWeddingBackground: string;
/** @type {null | NPCCharacter} */
declare var NPCWeddingWife: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCWeddingGirlLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCWeddingGirlRight: null | NPCCharacter;
