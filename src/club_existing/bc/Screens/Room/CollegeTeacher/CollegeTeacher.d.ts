/**
 * Checks, if the teacher can be invited to the player's room
 * @returns {boolean} - Returns true, if the player can invite the teacher to her room, false otherwise
 */
declare function CollegeTeacherCanInviteToPrivateRoom(): boolean;
/**
 * Checks, if Mildred's love level is higher than a given value
 * @param {string} LoveLevel - The level of love to check against
 * @returns {boolean} - Returns true, if Mildred's love is equal or higher than the given level, false otherwise
 */
declare function CollegeTeacherMildredLoveIs(LoveLevel: string): boolean;
/**
 * Checks, if Mildred won the Literature Class quiz and player is not owned
 * @returns {boolean} - Returns true if Mildred is Dominant and player is not owned
 */
declare function CollegeTeacherIsMildredDominant(): boolean;
/**
 * Checks, if Mildred lost the Literature Class quiz
 * @returns {boolean} - Returns true if Mildred is Submissive
 */
declare function CollegeTeacherIsMildredSubmissive(): boolean;
/**
 * Fully dress-up Mildred
 * @param {Character} C - The character object to dress up
 * @returns {void} - Nothing
 */
declare function CollegeTeacherMildredClothes(C: Character): void;
/**
 * Loads the teacher's lounge and generates Mildred
 * @returns {void} - Nothing
 */
declare function CollegeTeacherLoad(): void;
/**
 * Runs the room (shows the player and Mildred)
 * @returns {void} - Nothing
 */
declare function CollegeTeacherRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function CollegeTeacherClick(): void;
/**
 * When Mildred love towards the player changes, it can also trigger an event.
 * When a good or bad move is done, her expression will change quickly.
 * @param {string} LoveChange - The amount, the teacher's love changes
 * @param {string} Event - The event to trigger
 * @returns {void} - Nothing
 */
declare function CollegeTeacherMildredLoveChange(LoveChange: string, Event: string): void;
/**
 * Dress back the player and Mildred
 * @returns {void} - Nothing
 */
declare function CollegeTeacherDressBack(): void;
/**
 * Sets the current background for the scene
 * @param {string} New - The name of the new background
 * @returns {void} - Nothing
 */
declare function CollegeTeacherNewBackground(New: string): void;
/**
 * When the plater invites Mildred to her room, she gets the pillory
 * @param {string} Role - How Mildred should join private room (Default: "None")
 * @returns {void} - Nothing
 */
declare function CollegeTeacherInviteToPrivateRoom(Role?: string): void;
declare var CollegeTeacherBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeTeacherMildred: null | NPCCharacter;
declare var CollegeTeacherMildredLove: number;
