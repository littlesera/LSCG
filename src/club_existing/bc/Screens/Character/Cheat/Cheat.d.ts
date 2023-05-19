/**
 * Checks if the cheats are valid
 * @returns {void} - Nothing
 */
declare function CheatValidate(): void;
/**
 * Checks if the cheat is currently active
 * @param {string} CheatName - Name of the cheat to check for
 * @returns {boolean} - Returns TRUE if the cheat is currently active
 */
declare function CheatActive(CheatName: string): boolean;
/**
 * Gets the factor for a given cheat. The bonus factor is added if active.
 * @param {string} CheatName - Name of the cheat to check for
 * @param {number} Factor - Bonus factor on top of the cheat
 * @returns {number} - The total factor for the given cheat
 */
declare function CheatFactor(CheatName: string, Factor: number): number;
/**
 * Imports the cheats from local storage (only works before the game is loaded)
 * @returns {void} - Nothing
 */
declare function CheatImport(): void;
/**
 * Exports the cheats to local storage. Each one is its own item.
 * @returns {void} - Nothing
 */
declare function CheatExport(): void;
/**
 * Runs and draws the cheat screen
 * @returns {void} - Nothing
 */
declare function CheatRun(): void;
/**
 * Handles clicks in the cheat screen.
 * @returns {void} - Nothing
 */
declare function CheatClick(): void;
/**
 * Handles exiting the cheat screen by saving the cheats and going back to the login screen.
 * @returns {void} - Nothing
 */
declare function CheatExit(): void;
declare var CheatBackground: string;
declare var CheatAllow: boolean;
declare var CheatList: string[];
declare var CheatBonusList: string[];
declare var CheatBonusFactor: number;
declare var CheatBonusTime: number;
/** @type {string[]} */
declare var CheatActivated: string[];
declare var CheatBrowserName: string;
declare var CheatBrowserVersion: string;
declare var CheatBrowserTime: number;
