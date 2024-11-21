/**
 * Ends the game and sends the result back to the screen
 * @param {boolean} Victory - Whether or not the player has won
 * @returns {void} - Nothing
 */
declare function GetUpEnd(Victory: boolean): void;
/**
 * Loads the Get Up mini game
 * @returns {void} - Nothing
 */
declare function GetUpLoad(): void;
/**
 * @param {number} delta
 */
declare function GetUpPhysics(delta: number): void;
/**
 * Runs the get up mini game and draws the characters and items on screen
 * @returns {void} - Nothing
 */
declare function GetUpRun(): void;
/**
 * Handles mouse click events for the get up mini game
 * @returns {void} - Nothing
 */
declare function GetUpMouseDown(): void;
/**
 * Handles mouse click events for the get up mini game
 * @returns {void} - Nothing
 */
declare function GetUpClick(): void;
declare var GetUpVelocity: number;
declare var GetUpPosition: number;
declare var GetUpAcceleration: number;
declare var GetUpMaxPosition: number;
declare var GetUpGameDuration: number;
declare var GetUpNextTick: number;
declare var GetUpText: string;
declare var GetUpChallenge: number;
declare var GetUpBackground: string;
