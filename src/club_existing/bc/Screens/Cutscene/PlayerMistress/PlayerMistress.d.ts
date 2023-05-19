/**
 * Loads the mistress promotion cutscene by creating the random maids and mistress, and setting the stage
 * @returns {void} - Nothing
 */
declare function PlayerMistressLoad(): void;
/**
 * Runs and draws the mistress promotion cutscene
 * @returns {void} - Nothing
 */
declare function PlayerMistressRun(): void;
/**
 * Handles clicks during the mistress promotion cutscene. Clicking anywhere on the screen advances the cutscene. At the end of the cutscene, the player stays in the management room but the state goes back to normal.
 * @returns {void} - Nothing
 */
declare function PlayerMistressClick(): void;
declare var PlayerMistressBackground: string;
/** @type {null | NPCCharacter} */
declare var PlayerMistressMistressLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var PlayerMistressMistressRight: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var PlayerMistressMaidLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var PlayerMistressMaidRight: null | NPCCharacter;
