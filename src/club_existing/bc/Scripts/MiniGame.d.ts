declare function MiniGameLoad(): void;
/**
 * Starts a given mini game at a set difficulty and keeps
 * @param {string} GameType - Name of the mini-game to launch
 * @param {number|string} Difficulty - Difficulty Ration for the mini-game
 * @param {string} ReturnFunction - Callback name to execute once the mini-game is over
 * @returns {void} - Nothing
 */
declare function MiniGameStart(GameType: string, Difficulty: number | string, ReturnFunction: string): void;
declare function MiniGameEnd(): void;
/**
 * Checks if the C key is being pressed and if cheats are available
 * @returns {boolean} - TRUE if C and cheats are allowed
 */
declare function MiniGameCheatKeyDown(): boolean;
declare var MiniGameType: string;
declare var MiniGameVictory: boolean;
declare var MiniGamePerfect: boolean;
/** @type {number} */
declare var MiniGameDifficulty: number;
/** @type {string} */
declare var MiniGameDifficultyMode: string;
declare var MiniGameDifficultyRatio: number;
declare var MiniGameAdvancedPayment: number;
declare var MiniGameReturnFunction: string;
declare var MiniGameProgress: number;
declare var MiniGameTimer: number;
declare var MiniGameEnded: boolean;
declare var MiniGameCheatAvailable: boolean;
declare let KDPatched: boolean;
