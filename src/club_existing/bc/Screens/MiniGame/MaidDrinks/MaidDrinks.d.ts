/**
 * Generates a full sequence
 * @param {number} StartTime - Start time of the sequence
 */
declare function MaidDrinksGenerateMove(StartTime: number): void;
/**
 * Loads the maid drinks mini game and its NPCs
 * @returns {void} - Nothing
 */
declare function MaidDrinksLoad(): void;
/**
 * Draws the icons for the mini game
 * @returns {void} - Nothing
 */
declare function MaidDrinksDrawIcons(): void;
/**
 * Draws the bars to tell when the moves will hit
 * @param {number} SquareType - Type of the bar to draw (0 to 3)
 * @returns {void} - Nothing
 */
declare function MaidDrinksDrawBar(SquareType: number): void;
/**
 * Generates random customers for the mini game (makes them visible for a random amount of time)
 * @returns {void} - Nothing
 */
declare function MaidDrinksCustomers(): void;
/**
 * Runs and draws the maid drinks mini game
 * @returns {void} - Nothing
 */
declare function MaidDrinksRun(): void;
/**
 * Ends the maid drinks mini game and sends the result back to the screen
 * @param {boolean} Victory - Whether or not the player one the mini game
 * @returns {void} - Nothing
 */
declare function MaidDrinksEnd(Victory: boolean): void;
/**
 * Used when the player hits, at 100 progress the player wins and the game ends
 * @returns {void} - Nothing
 */
declare function MaidDrinksHit(): void;
/**
 * Used when the player misses, the penalty is bigger on higher difficulties. When below zero progress, the player fails the mini game.
 * @returns {void} - Nothing
 */
declare function MaidDrinksMiss(): void;
/**
 * Used when the player tries to do a specific move type
 * @param {number} MoveType - Type of move made by the player
 * @returns {void} - Nothing
 */
declare function MaidDrinksDoMove(MoveType: number): void;
/**
 * Handles key presses during the maid drinks mini game. (Both keyboard and mobile)
 * @returns {void} - Nothing
 */
declare function MaidDrinksKeyDown(): void;
/**
 * Handles clicks during the maid drinks mini game (only on mobile, to replace the keyboard)
 * @returns {void} - Nothing
 */
declare function MaidDrinksClick(): void;
declare var MaidDrinksBackground: string;
/** @type {null | NPCCharacter} */
declare var MaidDrinksCustomerLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var MaidDrinksCustomerRight: null | NPCCharacter;
declare var MaidDrinksCustomerLeftTimer: number;
declare var MaidDrinksCustomerRightTimer: number;
declare var MaidDrinksCustomerLeftVisible: boolean;
declare var MaidDrinksCustomerRightVisible: boolean;
declare var MaidDrinksMaxSequence: number;
/** @type {{ Type: number, Time: number }[]} */
declare var MaidDrinksMove: {
    Type: number;
    Time: number;
}[];
declare var MaidDrinksLastMoveType: number;
declare var MaidDrinksLastMoveTypeTimer: number;
declare var MaidDrinksKeyUpper: number[];
declare var MaidDrinksKeyLower: number[];
