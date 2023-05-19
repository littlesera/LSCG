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
declare function GetUpPhysics(delta: any): void;
/**
 * Runs the get up mini game and draws the characters and items on screen
 * @returns {void} - Nothing
 */
declare function GetUpRun(): void;
/**
 * Validates the clicks during the horse walk mini game for mobile, moves the character and validates touched items
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
