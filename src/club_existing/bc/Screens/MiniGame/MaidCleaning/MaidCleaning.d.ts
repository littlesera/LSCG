/**
 * Generates all the spots to clean for the main cleaning minigame
 * @param {number} MaxSpot - Maximum amount of spots to generate
 * @returns {void} - Nothing
 */
declare function MaidCleaningGenerateSpots(MaxSpot: number): void;
/**
 * Draw the cleaning spots for the maid cleaning mini game
 * @returns {void} - Nothing
 */
declare function MaidCleaningDrawSpots(): void;
/**
 * Loads the maid cleaning mini game. It will select a random background and generate spots based on the difficulty
 * @returns {void} - Nothing
 */
declare function MaidCleaningLoad(): void;
/**
 * Runs the maid cleaning mini game
 * @returns {void} - Nothing
 */
declare function MaidCleaningRun(): void;
/**
 * Ends the game and sends the result back to the screen
 * @param {boolean} Victory - Whether or not the game was won
 * @returns {void} - Nothing
 */
declare function MaidCleaningEnd(Victory: boolean): void;
/**
 * Handles moving the player on the screen with a click, used for mobile users
 * @returns {void} - Nothing
 */
declare function MaidCleaningDoMove(): void;
/**
 * The player can use the C key to cheat and add 10 extra seconds to win the game
 * @returns {void} - Nothing
 */
declare function MaidCleaningKeyDown(): void;
/**
 * Handles clicks during the maid cleaning minigame. On mobile, we need to move the player on a click.
 */
declare function MaidCleaningClick(): void;
declare var MaidCleaningBackground: string;
/** @type {null | { X: number, Y: number, T: number }[]} */
declare var MaidCleaningSpots: null | {
    X: number;
    Y: number;
    T: number;
}[];
declare var MaidCleaningPlayerX: number;
declare var MaidCleaningPlayerY: number;
declare var MaidCleaningSpotSize: number;
