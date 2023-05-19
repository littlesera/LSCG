/**
 * Triggered when a player is fully restrained from a daily job dialog
 * @returns {void} - Nothing
 */
declare function DailyJobPlayerFullRestrain(): void;
/**
 * Loads a puppy girl and fully restrain her
 * @param {"0"|"1"|"2"|"3"|"4"} GirlNum - Number of the puppy to load
 * @returns {Character} - The generated puppy girl
 */
declare function DailyJobPuppyLoad(GirlNum: "0" | "1" | "2" | "3" | "4"): Character;
/**
 * Loads the daily job room screen characters. This changes based on the current job being performed.
 * @returns {void} - Nothing
 */
declare function DailyJobLoad(): void;
/**
 * Runs and draws the daily job room. Empty as daily jobs are ran from other rooms.
 * @returns {void} - Nothing
 */
declare function DailyJobRun(): void;
/**
 * Handles clicks in the daily job room. Empty as daily jobs are ran from other rooms.
 * @returns {void} - Nothing
 */
declare function DailyJobClick(): void;
/**
 * In search mission, draws the extra button for the job
 * @returns {void} - Nothing
 */
declare function DailyJobSubSearchRun(): void;
/**
 * In search mission, handles clicks on the extra button for the job
 * @returns {void} - Nothing
 */
declare function DailyJobSubSearchClick(): void;
/**
 * Checks if the player is currently searching for a daily job
 * @returns {boolean} - Returns TRUE if the job search process is active
 */
declare function DailyJobSubSearchIsActive(): boolean;
/**
 * Triggered when the kidnap daily job fight minigame is started
 * @returns {void} - Nothing
 */
declare function DailyJobKidnapStart(): void;
/**
 * Triggered at the end of the kidnap daily job fight mini-game
 * @returns {void} - Nothing
 */
declare function DailyJobKidnapEnd(): void;
/**
 * Triggered when the kidnap daily job fight mini-game is won. Sends the player back to the main hall.
 * @returns {void} - Nothing
 */
declare function DailyJobKidnapSuccess(): void;
/**
 * Triggered when the kidnap daily job fight mini-game is lost. Sends the player back to the main hall and allow the player to retry later.
 * @returns {void} - Nothing
 */
declare function DailyJobKidnapFail(): void;
/**
 * Triggered when the puppy walker job minigame is started
 * @returns {void} - Nothing
 */
declare function DailyJobPuppyGameStart(): void;
/**
 * Triggered at the end of the puppy walker job fight mini-game
 * @returns {void} - Nothing
 */
declare function DailyJobPuppyGameEnd(): void;
/**
 * Triggered when a daily job ends, sends the player back to the main hall
 * @returns {void} - Nothing
 */
declare function DailyJobEnd(): void;
/**
 * Triggered when the player is turned into a puppy by the Mistress
 * @returns {void} - Nothing
 */
declare function DailyJobPuppyPlayer(): void;
/**
 * Triggered when the player is restrained during the dojo minigame
 * @returns {void} - Nothing
 */
declare function DailyJobDojoRestrainPlayer(): void;
/**
 * Triggered when the dojo struggle job minigame is started
 * @returns {void} - Nothing
 */
declare function DailyJobDojoGameStart(): void;
/**
 * Triggered at the end of the dojo struggle job minigame
 * @returns {void} - Nothing
 */
declare function DailyJobDojoGameEnd(): void;
declare var DailyJobBackground: string;
/** @type {null | NPCCharacter} */
declare var DailyJobOpponent: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobPuppyMistress: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobPuppy1: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobPuppy2: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobPuppy3: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobPuppy4: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var DailyJobDojoTeacher: null | NPCCharacter;
