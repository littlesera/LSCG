/**
 * Loads the lucky wheel customization screen
 * @returns {void} - Nothing
 */
declare function WheelFortuneCustomizeLoad(): void;
/**
 * Draws the lucky wheel customization screen
 * @returns {void} - Nothing
 */
declare function WheelFortuneCustomizeRun(): void;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function WheelFortuneCustomizeClick(): void;
/**
 * Handles exiting from the screen, updates the lucky wheel in the online shared settings
 * @param {boolean} Save - Whether to push the updated selection to the server
 * @returns {void} - Nothing
 */
declare function WheelFortuneCustomizeExit(Save?: boolean): void;
declare var WheelFortuneCustomizeBackground: string;
declare var WheelFortuneCustomizeOffset: number;
declare var WheelFortuneCustomizeList: string;
