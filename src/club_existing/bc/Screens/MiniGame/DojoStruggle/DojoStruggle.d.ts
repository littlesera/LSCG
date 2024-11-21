/**
 * Loads the dojo struggle mini game and prepare the rope walls
 * @returns {void} - Nothing
 */
declare function DojoStruggleLoad(): void;
/**
 * Runs the dojo struggle mini game and draws the relevant information on screen
 * @returns {void} - Nothing
 */
declare function DojoStruggleRun(): void;
/**
 * Handles clicks during the dojo struggle mini game
 * @returns {void} - Nothing
 */
declare function DojoStruggleClick(): void;
/**
 * Handles mouse down during the dojo struggle mini game
 * @returns {void} - Nothing
 */
declare function DojoStruggleMouseDown(): void;
declare function DojoStruggleKeyDown(event: KeyboardEvent): boolean;
declare var DojoStruggleBackground: string;
declare var DojoStrugglePosition: number;
declare var DojoStruggleImpulse: number;
/** @type {number[]} */
declare var DojoStruggleRope: number[];
