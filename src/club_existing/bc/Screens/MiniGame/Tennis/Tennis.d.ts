/**
 * Called when a player servers, the angle can vary by 45 degrees up or down
 * @param {boolean} CharacterLeftServe - TRUE if the character serving the ball is the left one.
 * @returns {void} - Nothing
 */
declare function TennisServe(CharacterLeftServe: boolean): void;
/**
 * Gets the current score/status of the game
 * @param {number} PointFor - Point of the player
 * @param {number} PointAgainst - Point of the NPC
 * @returns {string} - Score in text, or current status (Win, loss, advantage)
 */
declare function TennisGetScore(PointFor: number, PointAgainst: number): string;
/**
 * Loads the tennis mini game and sets the difficulty ratio before serving the first ball
 * @returns {void} - Nothing
 */
declare function TennisLoad(): void;
/**
 * Runs the tennis mini game and draws its components on screen
 * @returns {void} - Nothing
 */
declare function TennisRun(): void;
/**
 * Checks if the tennis game should end. The tennis game ends when a player has 4 or more points, and is leading by at least 2 points
 * @returns {void} - Nothing
 */
declare function TennisVerifyEnd(): void;
/**
 * Handles clicks during the tennis mini game
 * @returns {void} - Nothing
 */
declare function TennisClick(): void;
/**
 * Handles the key press in the tennis mini game, the C cheat key gives you one point toward winning
 * @returns {void} - Nothing
 */
declare function TennisKeyDown(): void;
declare var TennisBackground: string;
/** @type {null | NPCCharacter} */
declare var TennisCharacterLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var TennisCharacterRight: null | NPCCharacter;
declare var TennisCharacterLeftPoint: number;
declare var TennisCharacterRightPoint: number;
declare var TennisCharacterLeftRacket: number;
declare var TennisCharacterRightRacket: number;
declare var TennisBallX: number;
declare var TennisBallY: number;
declare var TennisBallSpeed: number;
/** Angle of the ball.  Angle is in radians (0 is right, PI / 2 is up, PI is left, 3 PI / 2 is down)*/
declare var TennisBallAngle: number;
