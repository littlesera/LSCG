/**
 * Checks if the player can invite an extra player to their private room. (Used for Julia.)
 * @returns {boolean} - Returns TRUE if the player has a private room and at least one empty place in it.
 */
declare function CollegeTheaterCanInviteToPrivateRoom(): boolean;
/**
 * Checks if Julia's love level is of a given level.
 * @param {number} LoveLevel - The love level threshold to check for.
 * @returns {boolean} - Returns TRUE if the current love level of Julia is at or above the given level
 */
declare function CollegeTheaterJuliaLoveIs(LoveLevel: number): boolean;
/**
 * Checks if the player can pick their role. The player can pick their role when they are a switch (not too submissive or dominant)
 * @returns {boolean} - Returns TRUE if the player can choose her role.
 */
declare function CollegeTheaterCanChooseRole(): boolean;
/**
 * Gives the teacher room key to the player.
 * @returns {void} - Nothing
 */
declare function CollegeTheaterGetTeacherKey(): void;
/**
 * Checks if Julia stopped rebellion as Queen in College and if player doesn't have owner.
 * @returns {boolean} - Returns TRUE if Julia stopped rebellion as Queen in College and if player doesn't have owner
 */
declare function CollegeTheaterIsJuliaQueen(): boolean;
/**
 * Checks if Julia submitted as a damsel in College.
 * @returns {boolean} - Returns TRUE if Julia submitted as a damsel in College
 */
declare function CollegeTheaterIsJuliaDamsel(): boolean;
/**
 * Dresses Julia in her full theater outfit.
 * @param {Character} C - The character object to dress up
 * @returns {void} - Nothing
 */
declare function CollegeTheaterJuliaClothes(C: Character): void;
/**
 * Loads the college theater screen, generates Julia like she is in bondage college. Julia is not generated if she is in the player's private room.
 * @returns {void} - Nothing
 */
declare function CollegeTheaterLoad(): void;
/**
 * Runs and draws the College Theater screen, show the player and Julia
 * @returns {void} - Nothing
 */
declare function CollegeTheaterRun(): void;
/**
 * Handles clicks in the college theater screen
 * @returns {void} - Nothing
 */
declare function CollegeTheaterClick(): void;
/**
 * Dresses the two given characters for the play
 * @param {Character} C1 - First character for the play (the witch)
 * @param {Character} C2 - Second character for the play (the maiden)
 * @returns {void} - Nothing
 */
declare function CollegeTheaterPlayClothes(C1: Character, C2: Character): void;
/**
 * Puts ropes of a random color on a given character
 * @param {Character} C - Character to tie with ropes
 * @returns {void} - Nothing
 */
declare function CollegeTheaterRandomRope(C: Character): void;
/**
 * Puts 3 belts of a random color on a given character
 * @param {Character} C - Character to put belts
 * @returns {void} - Nothing
 */
declare function CollegeTheaterRandomBelt(C: Character): void;
/**
 * Strips a character to her underwear
 * @param {Character} C - Character to strip
 * @returns {void} - Nothing
 */
declare function CollegeTheaterUnderwear(C: Character): void;
/**
 * Triggered when Julia's love towards the player changes, it can also trigger an event.  When a good or bad move is done, her expression will change quickly.
 * @param {string} LoveChange - Number representing the change in love
 * @param {string} Event - The event that may have occured for the love factor to change.
 * @returns {void} - Nothing
 */
declare function CollegeTheaterJuliaLoveChange(LoveChange: string, Event: string): void;
/**
 * Desses the player and Julia at the end of the play.
 * @returns {void} - Nothing
 */
declare function CollegeTheaterDressBack(): void;
/**
 * Triggered when the player invites Julia to their private room. The player receives the accessories used during the play.
 * @param {string} Role - The role the player add during the play
 * @returns {void} - Nothing
 */
declare function CollegeTheaterInviteToPrivateRoom(Role: string): void;
declare var CollegeTheaterBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeTheaterJulia: null | NPCCharacter;
declare var CollegeTheaterJuliaLove: number;
declare var CollegeTheaterRandomColors: string[];
