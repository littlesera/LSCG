/**
 * Loads the Sarah/Amanda/Sophie intro cutscene by creating the NPCs and setting the stage based on the current state the player is at in the story
 * @returns {void} - Nothing
 */
declare function SarahIntroLoad(): void;
/**
 * Runs and draws the Sarah/Amanda/Sophie intro cutscene
 * @returns {void} - Nothing
 */
declare function SarahIntroRun(): void;
/**
 * Handles clicks during the Sarah/Amanda/Sophie intro cutscene. Clicking anywhere on the screen advances the cutscene. At the end of the cutscene, the player is sent back to Sarah's room.
 * @returns {void} - Nothing
 */
declare function SarahIntroClick(): void;
declare var SarahIntroBackground: string;
declare var SarahIntroDone: boolean;
declare var SarahIntroType: string;
declare var AmandaIntroTime: number;
declare var AmandaIntroDone: boolean;
declare var SophieIntroTime: number;
declare var SophieIntroDone: boolean;
