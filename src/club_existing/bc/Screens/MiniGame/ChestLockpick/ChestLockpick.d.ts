/**
 * Loads the mini game, resets the speed and difficulty
 * @returns {void} - Nothing
 */
declare function ChestLockpickLoad(): void;
/**
 * Runs the chest lock pick mini game and draws its components on screen
 * @returns {void} - Nothing
 */
declare function ChestLockpickRun(): void;
/**
 * Handles clicks during the mini game
 * @returns {void} - Nothing
 */
declare function ChestLockpickClick(): void;
/**
 * Handles the key press in the mini game, the C cheat key removes a pick lock requirement
 * @returns {void} - Nothing
 */
declare function ChestLockpickKeyDown(): void;
/** @type {null | string} */
declare var ChestLockpickBackground: null | string;
declare var ChestLockpickChestImage: string;
declare var ChestLockpickSpeed: number;
declare var ChestLockpickAngle: number;
declare var ChestLockpickHoleAngle: number;
declare var ChestLockpickCount: number;
