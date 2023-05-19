/**
 * Returns TRUE if the wheel of fortune can add an item on the specified asset slot
 * @param {String} AssetName - The asset name
 * @param {AssetGroupName} GroupName - The asset group to focus
 * @returns {boolean} - TRUE if we can add
 */
declare function WheelFortuneCanWear(AssetName: string, GroupName: AssetGroupName): boolean;
/**
 * Puts the player in random futuristic bondage
 * @returns {void} - Nothing
 */
declare function WheelFortuneFuturisticBondage(): void;
/**
 * Puts the player in random hogtie bondage
 * @returns {void} - Nothing
 */
declare function WheelFortuneHogtie(): void;
/**
 * Puts the player in random shibari rope bondage
 * @returns {void} - Nothing
 */
declare function WheelFortuneShibari(): void;
/**
 * Sends the player to the isolation for a number of minutes
 * @param {number} Minutes - The number of minutes
 * @returns {void} - Nothing
 */
declare function WheelFortuneIsolationCell(Minutes: number): void;
/**
 * Block the wardrobe for the user for a set time, or add to the current blocked time
 * @param {number} Minutes - The number of minutes
 * @returns {void} - Nothing
 */
declare function WheelFortuneBlockWardrobe(Minutes: number): void;
/**
 * Wears an item from the lucky wheel spin
 * @param {AssetGroupName} Group - The asset group to focus
 * @param {number} Minutes - The number of minutes
 * @returns {void} - Nothing
 */
declare function WheelFortuneInventoryWear(Group: AssetGroupName, Minutes: number): void;
/**
 * Loads the lucky wheel mini game and builds the wheel
 * @returns {void} - Nothing
 */
declare function WheelFortuneLoad(): void;
/**
 * Draws the full lucky wheel
 * @returns {void} - Nothing
 */
declare function WheelFortuneDraw(FullWheel: any, Pos: any, MaxPos: any, X: any, Y: any, Zoom: any): void;
/**
 * Runs the lucky wheel mini game
 * @returns {void} - Nothing
 */
declare function WheelFortuneRun(): void;
/**
 * Handles clicks during the mini game
 * @returns {void} - Nothing
 */
declare function WheelFortuneClick(): void;
/**
 * If the user clicks to spin the wheel, we keep the starting position
 * @returns {void} - Nothing
 */
declare function WheelFortuneMouseDown(): void;
/**
 * If the user releases the mouse/finger to spin the wheel
 * @returns {void} - Nothing
 */
declare function WheelFortuneMouseUp(): void;
/**
 * When the wheel result is set, we publish it and return to the chat room
 * @returns {void} - Nothing
 */
declare function WheelFortuneResult(): void;
/**
 * When the mini exits
 * @returns {void} - Nothing
 */
declare function WheelFortuneExit(): void;
declare var WheelFortuneBackground: string;
/** @type {"" | ModuleType} */
declare var WheelFortuneEntryModule: "" | ModuleType;
declare var WheelFortuneEntryScreen: string;
/** @type {null | Character} */
declare var WheelFortuneCharacter: null | Character;
declare var WheelFortuneRoleplay: boolean;
declare var WheelFortuneForced: boolean;
declare var WheelFortunePos: number;
declare var WheelFortunePosMax: number;
declare var WheelFortuneVelocity: number;
declare var WheelFortuneVelocityTime: number;
/** @type {null | number} */
declare var WheelFortunePosY: null | number;
declare var WheelFortuneInitY: number;
declare var WheelFortuneInitTime: number;
declare var WheelFortuneValue: string;
declare var WheelFortuneList: string;
declare var WheelFortuneEncaseList: string[];
declare var WheelFortuneEncaseClosedList: string[];
declare var WheelFortunePasswordChar: string[];
declare var WheelFortuneDefault: string;
/** @type {WheelFortuneOptionType[]} */
declare var WheelFortuneOption: WheelFortuneOptionType[];
