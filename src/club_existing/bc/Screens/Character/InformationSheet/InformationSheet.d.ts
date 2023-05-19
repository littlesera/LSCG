/**
 * Loads the Information Sheet, cache the sub screens
 * @returns {void} - Nothing
 */
declare function InformationSheetLoad(): void;
/**
 * Draw the lover for the character
 * @param {Character} C - The character whose information sheet should be displayed
 * @param {number} L - The lover index
 * @returns {void} - Nothing
 */
declare function InformationSheetDrawLover(C: Character, L: number): void;
/**
 * Main function of the character info screen. It's called continuously, so be careful
 * to add time consuming functions or loops here
 * @returns {void} - Nothing
 */
declare function InformationSheetRun(): void;
/**
 * Display the second part of the information sheet for reputation & skills
 * @returns {void} - Nothing
 */
declare function InformationSheetSecondScreenRun(): void;
/**
 * Handles the click events on the screen
 * @returns {void} - Nothing
 */
declare function InformationSheetClick(): void;
/**
 * Cleanup all elements, if the user exits the screen
 * @returns {void} - Nothing
 */
declare function InformationSheetExit(): void;
/**
 * Loads the information sheet for a character
 * @param {Character} C - The character whose information sheet should be displayed
 * @returns {void} - Nothing
 */
declare function InformationSheetLoadCharacter(C: Character): void;
declare var InformationSheetBackground: string;
/** @type {null | Character} */
declare var InformationSheetSelection: null | Character;
/** @type {"" | ModuleType} */
declare var InformationSheetPreviousModule: "" | ModuleType;
declare var InformationSheetPreviousScreen: string;
declare var InformationSheetSecondScreen: boolean;
