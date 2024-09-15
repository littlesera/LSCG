/**
 * Loads the club card room and the tutor
 * @returns {void} - Nothing
 */
declare function ClubCardLoungeLoad(): void;
/**
 * Runs and draws the club card  room with the player and tutor
 * @returns {void} - Nothing
 */
declare function ClubCardLoungeRun(): void;
/**
 * Handles clicks in the college entrance room
 * @returns {void} - Nothing
 */
declare function ClubCardLoungeClick(): void;
/**
 * When the practice game starts
 * @returns {void} - Nothing
 */
declare function ClubCardLoungePraticeGameStart(): void;
/**
 * When the practice game ends
 * @returns {void} - Nothing
 */
declare function ClubCardLoungePraticeGameEnd(): void;
declare var ClubCardLoungeBackground: string;
/** @type {null | NPCCharacter} */
declare var ClubCardLoungeTutor: null | NPCCharacter;
