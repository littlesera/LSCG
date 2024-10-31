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
 * Handles mouse down during the mini game
 * @returns {void} - Nothing
 */
declare function ChestLockpickMouseDown(): void;
/**
 * Handles clicks during the mini game
 * @returns {void} - Nothing
 */
declare function ChestLockpickClick(): void;
declare function ChestLockpickKeyDown(event: KeyboardEvent): boolean;
/** @type {null | string} */
declare var ChestLockpickBackground: null | string;
declare var ChestLockpickChestImage: string;
declare var ChestLockpickSpeed: number;
declare var ChestLockpickAngle: number;
declare var ChestLockpickHoleAngle: number;
declare var ChestLockpickCount: number;
