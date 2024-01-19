declare function CollegeChessCanStripPlayer(): boolean;
declare function CollegeChessCanStripOpponent(): boolean;
declare function CollegeChessCanMakeLove(): boolean;
/**
 * Loads the college chest screen by generating the opponent.
 * @returns {void} - Nothing
 */
declare function CollegeChessLoad(): void;
/**
 * Runs and draws the college chess screen.  Shows the player and the opponent.
 * @returns {void} - Nothing
 */
declare function CollegeChessRun(): void;
/**
 * Handles clicks in the college chess court screen
 * @returns {void} - Nothing
 */
declare function CollegeChessClick(): void;
/**
 * Starts the chess mini game on the given difficulty.
 * @param {number} Difficulty - Difficulty factor of the minigame, changes the depth of the chess script
 * @param {string} Bet - The type of bet that will go on the game
 * @returns {void} - Nothing
 */
declare function CollegeChessGameStart(Difficulty: number, Bet: string): void;
/**
 * In strip or bondage chess, a player can lose one piece of cloth
 * @returns {void} - Nothing, the returns are quick exit short cuts
 */
declare function CollegeChessStrip(C: any): void;
/**
 * In bondage chess, a player can get restrained progressively
 * @param {Character} C
 * @returns {void} - Nothing, the returns are quick exit short cuts
 */
declare function CollegeChessRestrain(C: Character): void;
/**
 * Called from the chess game to see if we must apply changes (strip or restrain) any opponent
 * @returns {void} - Nothing
 */
declare function CollegeChessGameProgress(): void;
/**
 * Called from the chess game when the player concedes, the AI never concedes
 * @returns {void} - Nothing
 */
declare function CollegeChessGameConcede(): void;
/**
 * Triggered when the chess game ends.
 * @returns {void} - Nothing
 */
declare function CollegeChessGameEnd(): void;
/**
 * When both the player and the opponent should dress back up, we restore the backup appearance
 * @returns {void} - Nothing
 */
declare function CollegeChessRestoreAppearance(): void;
/**
 * A few activities can trigger a medium blush for the opponent
 * @returns {void} - Nothing
 */
declare function CollegeChessOpponentBlush(): void;
/**
 * The player can be restrained by the opponent after losing a bondage chess game
 * @returns {void} - Nothing
 */
declare function CollegeChessPlayerFullBondage(): void;
declare var CollegeChessBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeChessOpponent: null | NPCCharacter;
declare var CollegeChessDifficulty: number;
declare var CollegeChessBet: string;
/** @type {null | Item[]} */
declare var CollegeChessPlayerAppearance: null | Item[];
/** @type {null | Item[]} */
declare var CollegeChessOpponentAppearance: null | Item[];
