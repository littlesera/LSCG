/**
 * Checks if the player can go to the tennis court
 * @returns {boolean} - Returns true if the player can go to the tennis court
 */
declare function CollegeEntranceCanGoTennis(): boolean;
/**
 * Checks if the player can go inside the college
 * @returns {boolean} - Returns true if the player can go inside the college
 */
declare function CollegeEntranceCanGoInside(): boolean;
/**
 * Checks if the player can go to the detention room
 * @returns {boolean} - Returns true if the player can go to the detention room
 */
declare function CollegeEntranceCanGoDetention(): boolean;
/**
 * Checks if the player can go to the teacher room
 * @returns {boolean} - Returns true if the player can go to the teacher room
 */
declare function CollegeEntranceCanGoTeacher(): boolean;
/**
 * Loads the college entrance room and its student NPC
 * @returns {void} - Nothing
 */
declare function CollegeEntranceLoad(): void;
/**
 * Runs and draws the college entrance room with the player and the student
 * @returns {void} - Nothing
 */
declare function CollegeEntranceRun(): void;
/**
 * Handles clicks in the college entrance room
 * @returns {void} - Nothing
 */
declare function CollegeEntranceClick(): void;
/**
 * Changes a given character into college student clothes
 * @param {Character} C - Character to dress as a college student
 * @returns {void} - Nothing
 */
declare function CollegeEntranceWearStudentClothes(C: Character): void;
/**
 * Checks if the player is wearing tennis clothes
 * @returns {boolean} - Returns TRUE if the player is wearing tennis clothes
 */
declare function CollegeEntranceIsWearingTennisClothes(): boolean;
/**
 * Checks if the player is wearing college clothes
 * @returns {boolean} - Returns TRUE if the player is wearing college clothes
 */
declare function CollegeEntranceIsWearingCollegeClothes(): boolean;
declare var CollegeEntranceBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeEntranceStudent: null | NPCCharacter;
