/**
 * Loads the magic school laboratory and the teacher
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeLoad(): void;
/**
 * Runs the room
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeRun(): void;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeClick(): void;
/**
 * When the spell ends, we remove some restraints if the player succeeded
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeSpellEnd(): void;
/**
 * Sets the difficulty for the escape challenge
 * @param {number} Seconds - The number of seconds before the challenge ends
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeSetTime(Seconds: number): void;
/**
 * Starts the escape challenge and sets the clock
 * @returns {void} - Nothing
 */
declare function MagicSchoolEscapeStart(): void;
declare var MagicSchoolEscapeBackground: string;
/** @type {null | NPCCharacter} */
declare var MagicSchoolEscapeInstructor: null | NPCCharacter;
declare var MagicSchoolEscapeSeconds: number;
declare var MagicSchoolEscapeTimer: number;
