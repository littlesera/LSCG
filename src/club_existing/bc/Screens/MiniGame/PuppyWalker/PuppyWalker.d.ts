/**
 * Loads the puppy walker mini game and sets the difficulty, it's a little faster on mobile because it's easier.
 * @returns {void} - Nothing
 */
declare function PuppyWalkerLoad(): void;
/**
 * Draws the puppy girl if she hasn't escaped
 * @param {Character} Puppy - The puppy character to draw
 * @param {number} X - Position on the X axis
 * @param {number} Fail - Amount of failures for this puppy
 * @returns {void} - Nothing
 */
declare function PuppyWalkerDraw(Puppy: Character, X: number, Fail: number): void;
/**
 * Runs the puppy walker mini game and draws the relevant information on the screen
 * @returns {void} - Nothing
 */
declare function PuppyWalkerRun(): void;
/**
 * Validates if the mini game must end. The mini game ends when the timer is up or if a puppy escaped. Failing 3 moves of a given type counts as an escape.
 * @returns {void} - Nothing
 */
declare function PuppyWalkerVerifyEnd(): void;
/**
 * Validate the moves, we raise the escape counter if it was invalid
 * @param {number} MoveType - Type of move done, goes from 0 to 3. It represents the index of the PuppyWalkerEscape array
 * @returns {void} - Nothing
 */
declare function PuppyWalkerDoMove(MoveType: number): void;
/**
 * Handles clicks during the puppy walker minigame
 * @returns {void} - Nothing
 */
declare function PuppyWalkerClick(): void;
declare var PuppyWalkerBackground: string;
declare var PuppyWalkerMoves: number[];
declare var PuppyWalkerMovesTimer: number[];
declare var PuppyWalkerEscape: number[];
declare var PuppyWalkerGenerateMoveTimer: number;
