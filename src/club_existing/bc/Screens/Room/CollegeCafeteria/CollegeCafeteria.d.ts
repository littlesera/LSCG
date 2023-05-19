/**
 * Checks, if the query matches the current state of Sidney
 * @param {string} QueryStatus - The query to compare
 * @returns {boolean} - Returns true, if the query matches the state of Sidney, false otherwise
 */
declare function CollegeCafeteriaSidneyStatusIs(QueryStatus: string): boolean;
/**
 * CHecks, if Sidney can be invited to the player's room
 * @returns {boolean} - Returns true, if the player can invite Sidney, false otherwise
 */
declare function CollegeCafeteriaCanInviteToPrivateRoom(): boolean;
/**
 * Loads the cafeteria and generates Sidney according to her current state
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaLoad(): void;
/**
 * Runs the room (shows the player and Sidney)
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaClick(): void;
/**
 * When Sidney love towards the player changes
 * @param {string} LoveChange - The amount the love of Sidney changes
 * @param {string} MoneyChange - The amount of money, the plyer looses
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaSidneyLoveChange(LoveChange: string, MoneyChange: string): void;
/**
 * Starts the fight between Sidney and the player
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaFightStart(): void;
/**
 * Resolves the fight between the player and Sidney
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaFightEnd(): void;
/**
 * When the plater invites Sidney to her room, she also gets a college dunce hat
 * @returns {void} - Nothing
 */
declare function CollegeCafeteriaInviteToPrivateRoom(): void;
declare var CollegeCafeteriaBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeCafeteriaSidney: null | NPCCharacter;
declare var CollegeCafeteriaSidneyStatus: string;
declare var CollegeCafeteriaSidneyLove: number;
/** @type {null | NPCCharacter} */
declare var CollegeCafeteriaStudentRight: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var CollegeCafeteriaStudentFarRight: null | NPCCharacter;
