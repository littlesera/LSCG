/**
 * Loads the NPC collaring cutscene by creating the random NPCs and setting the stage
 * @returns {void} - Nothing
 */
declare function NPCCollaringLoad(): void;
/**
 * Runs and draws the NPC collaring cutscene
 * @returns {void} - Nothing
 */
declare function NPCCollaringRun(): void;
/**
 * Handles clicks during the NPC collaring cutscene. Clicking anywhere on the screen advances the cutscene. At the end of the cutscene, NPCs are saved and the player is sent back to her room with her sub.
 * @returns {void} - Nothing
 */
declare function NPCCollaringClick(): void;
declare var NPCCollaringBackground: string;
/** @type {null | NPCCharacter} */
declare var NPCCollaringSub: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCCollaringMistressLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCCollaringMistressRight: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCCollaringGirlLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCCollaringGirlRight: null | NPCCharacter;
