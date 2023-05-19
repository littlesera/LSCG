/**
 * Change the current screen to the background selection screen
 * @param {string[]} List - The list of possible Background names
 * @param {number} Idx - The index of the current background
 * @param {(selection: string) => void} Callback - The function to call when a new background has been selected
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionMake(List: string[], Idx: number, Callback: (selection: string) => void): void;
/**
 * Comapres two backgrounds by their description
 * @param {object} a - The first object to compare
 * @param {string} a.Description - The description of object a. Is used for comparision
 * @param {object} b - The second object to compar
 * @param {string} b.Description - The description of object b. Is used for comparision
 * @returns {number} - Returns -1 if the description of object a is less then that of b, 1 otherwise
 */
declare function BackGroundSelectionSort(a: {
    Description: string;
}, b: {
    Description: string;
}): number;
/**
 * Initializes the Background selection screen.
 * Function coiuld be called dynamically, so the body has to be there, even if it does nothing.
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionLoad(): void;
/**
 * Handles input in the text box in the topmost row of the selection screen
 * and changes the offset of the background selection appropriately
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionInputChanged(): void;
/**
 * When a new value is selected in the tag selection drop-down, we refresh the displayed background
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionTagChanged(): void;
/**
 * Draws the Background selection screen:
 * - draws all the buttons and the text input field on the topmost rows
 * - paints the first (max) 12 possible backgrounds in the lower part of the screen
 * The function is called dynamically
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionRun(): void;
/**
 * Handles clicks in the background selection screen:
 * - Exit: Exit the screen without changes
 * - Accept: Exit the screen with a new background
 * - Prev: Paints the previous 12 backgrounds
 * - Next: Paints the nextt 12 backgrounds
 * - Click on any background: Sets this background for selection
 * This function is called dynamically
 *
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionClick(): void;
/**
 * Handles key events in the background selection screen:
 * - When the user presses "enter", we exit
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionKeyDown(): void;
/**
 * Handles the exit of the selection screen. Sets the new background, if necessary, and
 * calls the previously defined callback function. Then exits the screen to the screen, the player was before
 * @param {boolean} SetBackground - Defines, wether the background must be changed (true) or not (false)
 * @returns {void} - Nothing
 */
declare function BackgroundSelectionExit(SetBackground: boolean): void;
declare var BackgroundSelectionBackground: string;
/** @type {string[]} */
declare var BackgroundSelectionList: string[];
/** @type {BackgroundTag[]} */
declare var BackgroundSelectionTagList: BackgroundTag[];
declare var BackgroundSelectionIndex: number;
declare var BackgroundSelectionSelect: string;
declare var BackgroundSelectionSelectName: string;
declare var BackgroundSelectionSize: number;
declare var BackgroundSelectionOffset: number;
/** @type {null | ((selection: string) => void)} */
declare var BackgroundSelectionCallback: (selection: string) => void;
/** @type {"" | ModuleType} */
declare var BackgroundSelectionPreviousModule: "" | ModuleType;
declare var BackgroundSelectionPreviousScreen: string;
/** @type {{ Name: string, Description: string, Low: string }[]} */
declare var BackgroundSelectionAll: {
    Name: string;
    Description: string;
    Low: string;
}[];
/** @type {{ Name: string, Description: string, Low: string }[]} */
declare var BackgroundSelectionView: {
    Name: string;
    Description: string;
    Low: string;
}[];
