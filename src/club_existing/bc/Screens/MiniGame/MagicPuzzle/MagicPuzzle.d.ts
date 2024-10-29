/**
 * Loads the magic puzzle mini game and sets the difficulty ratio
 * @returns {void} - Nothing
 */
declare function MagicPuzzleLoad(): void;
/**
 * Returns the time in seconds with 3 digits milliseconds
 * @param {number} Time
 * @returns {string} - Formatted string
 */
declare function MagicPuzzleTime(Time: number): string;
/**
 * Validates where the puzzle square is, validated 4 times for each end of the square
 * @param {number} X - X coordinate
 * @param {number} Y - Y coordinate
 * @returns {void} - Nothing
 */
declare function MagicPuzzleValidate(X: number, Y: number): void;
/**
 * Prevents cheats in the mini-game by validating the last X and Y positions
 * @returns {void} - Nothing
 */
declare function MagicPuzzleAntiCheat(): void;
/**
 * Runs the magic puzzle mini game
 * @returns {void} - Nothing
 */
declare function MagicPuzzleRun(): void;
/**
 * Add the current square position onto the trail and trim the end
 * @returns {void} - Nothing
 */
declare function MagicPuzzleBuildTrail(): void;
/**
 * Draw a trail of faded past squares following the current square's position
 * @returns {void} - Nothing
 */
declare function MagicPuzzleDrawTrail(): void;
/**
 * Adjust one colour to be closer to another
 * @param {HexColor} startingColor - Hex code of the starting colour
 * @param {HexColor} targetColor - Hex code of the colour to transition to
 * @param {number} progressPercentage - The percentage the colour should transition, with 0 = none and 1 = fully
 * @returns {HexColor} - The final composed colour
 */
declare function MagicPuzzleTransitionToColor(startingColor: HexColor, targetColor: HexColor, progressPercentage: number): HexColor;
/**
 * Handles clicks during the mini game, the bottom part will end the game
 * @returns {void} - Nothing
 */
declare function MagicPuzzleClick(): void;
/**
 * Handles mouse downs during the mini game, to start it
 * @returns {void} - Nothing
 */
declare function MagicPuzzleMouseDown(): void;
declare function MagicPuzzleKeyDown(event: KeyboardEvent): boolean;
/**
 * When the magic puzzle must end
 * @returns {void} - Nothing
 */
declare function MagicPuzzleEnd(): void;
declare var MagicPuzzleBackground: string;
declare var MagicPuzzleStart: number;
declare var MagicPuzzleFinish: number;
declare var MagicPuzzleSize: number;
declare var MagicPuzzleSpell: number;
declare var MagicPuzzleAutoExit: boolean;
declare var MagicPuzzleCanStart: boolean;
declare var MagicPuzzleTimer: number;
declare var MagicPuzzleLastMouseX: number;
declare var MagicPuzzleLastMouseY: number;
/** @type { { X: number, Y: number }[] } */
declare var MagicPuzzleTrail: {
    X: number;
    Y: number;
}[];
declare var MagicPuzzleTrailLimit: number;
declare var MagicPuzzleTrailRainbow: boolean;
