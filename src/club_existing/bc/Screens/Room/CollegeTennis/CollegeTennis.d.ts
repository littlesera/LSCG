/**
 * Checks if Jennifer is currently in the given status.
 * @param {string} QueryStatus - Status to query
 * @returns {boolean} - Returns TRUE if Jennifer is currently in that status
 */
declare function CollegeTennisJenniferStatusIs(QueryStatus: string): boolean;
/**
 * Checks if the player can invite a new character to a private room. (Used for Jennifer.)
 * @returns {boolean} - Returns TRUE if the player has a private room and an empty spot in it.
 */
declare function CollegeTennisCanInviteToPrivateRoom(): boolean;
/**
 * Loads the tennis screen by generating Jennifer. The player's relationship with her from the bondage college is taken into consideration.
 * @returns {void} - Nothing
 */
declare function CollegeTennisLoad(): void;
/**
 * Runs and draws the tennis screen. Shows the player and Jennifer
 * @returns {void} - Nothing
 */
declare function CollegeTennisRun(): void;
/**
 * Handles clicks in the tennis court screen
 * @returns {void} - Nothing
 */
declare function CollegeTennisClick(): void;
/**
 * Starts the tennis mini game on the given difficulty. The player is equipped with a racket.
 * @param {"Easy"|"Normal"|"Hard"} Difficulty - Difficulty factor of the minigame
 * @returns {void} - Nothing
 */
declare function CollegeTennisGameStart(Difficulty: "Easy" | "Normal" | "Hard"): void;
/**
 * Triggered when the tennis game ends. Winning opens a dialog option to allow the player to invite Jennifer to their room.
 * @returns {void} - Nothing
 */
declare function CollegeTennisGameEnd(): void;
/**
 * Triggered when Jennifer is invited to the player's private room. The player earns a tennis racket.
 * @returns {void} - Nothing
 */
declare function CollegeTennisInviteToPrivateRoom(): void;
declare var CollegeTennisBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeTennisJennifer: null | NPCCharacter;
declare var CollegeTennisJenniferStatus: string;
declare var CollegeTennisJenniferWillJoinRoom: boolean;
