/**
 * Loads the item color UI with the provided character, item and positioning parameters.
 * @param {Character} c - The character being colored
 * @param {Item} item - The item being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} [includeResetButton] - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
declare function ItemColorLoad(c: Character, item: Item, x: number, y: number, width: number, height: number, includeResetButton?: boolean): void;
/**
 * Draws the item color UI according to its current state
 * @param {Character} c - The character being colored
 * @param {AssetGroupName} group - The name of the item group being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} includeResetButton - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
declare function ItemColorDraw(c: Character, group: AssetGroupName, x: number, y: number, width: number, height: number, includeResetButton: boolean): void;
/**
 * Draws the item color UI in default mode
 * @param {number} x - The x-coordinate at which to draw the default UI
 * @param {number} y - The y-coordinate at which to draw the default UI
 * @returns {void} - Nothing
 */
declare function ItemColorDrawDefault(x: number, y: number): void;
/**
 * Click handler for the item color UI according to its current state
 * @param {Character} c - The character being colored
 * @param {AssetGroupName} group - The name of the item group being colored
 * @param {number} x - The x-coordinate at which the UI was drawn
 * @param {number} y - The y-coordinate at which the UI was drawn
 * @param {number} width - The width with which the UI was drawn
 * @param {number} height - The height with which the UI was drawn
 * @param {boolean} includeResetButton - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
declare function ItemColorClick(c: Character, group: AssetGroupName, x: number, y: number, width: number, height: number, includeResetButton: boolean): void;
/**
 * Click handler for the item color UI when it's in default mode
 * @param {number} x - The x-coordinate at which the default UI was drawn
 * @param {number} y - The y-coordinate at which the default UI was drawn
 * @param {number} width - The width with which the default UI was drawn
 * @returns {void} - Nothing
 */
declare function ItemColorClickDefault(x: number, y: number, width: number): void;
/**
 * Handles pagination clicks on the item color UI
 * @returns {void} - Nothing
 */
declare function ItemColorPaginationClick(): void;
/**
 *  Handles exit button clicks on the item color UI
 *  @returns {void} - Nothing
 */
declare function ItemColorExitClick(): void;
/**
 * Saves any item color changes and exits the item color screen completely
 * @returns {void} - Nothing
 */
declare function ItemColorSaveAndExit(): void;
/**
 * Discards any item color changes and exits the item color screen completely
 * @returns {void} - Nothing
 */
declare function ItemColorCancelAndExit(): void;
/**
 * Handles save button clicks on the item color UI
 * @returns {void} - Nothing
 */
declare function ItemColorSaveClick(): void;
/**
 * Handles color picker cancellation clicks when the item color UI is in color picker mode
 * @returns {void} - Nothing
 */
declare function ItemColorPickerCancel(): void;
/**
 * Takes the item color UI out of color picker mode. If the item being colored only has a single color index, this function calls any
 * registered item color exit handlers
 * @param {boolean} save - Whether or not changes should be saved on exiting color picker mode
 * @returns {void} - Nothing
 */
declare function ItemColorCloseColorPicker(save: boolean): void;
/**
 * Gets the color indices that belong in the provided color group
 * @param {ColorGroup} colorGroup - The color group to fetch color indices for
 * @returns {number[]} - A list of color indices for any layers within the provided color group
 */
declare function ItemColorGetColorIndices(colorGroup: ColorGroup): number[];
/**
 * Toggles the item color UI into color picker mode
 * @param {ColorGroup} colorGroup - The color group that is being colored
 * @returns {void} - Nothing
 */
declare function ItemColorOpenPicker(colorGroup: ColorGroup): void;
/**
 * Cycles a color group's color to the next color in the asset group's color schema, or to "Default" if the color group is not currently
 * colored with a single color from the color schema
 * @param {ColorGroup} colorGroup - The color group that is being colored
 * @returns {void} - Nothing
 */
declare function ItemColorNextColor(colorGroup: ColorGroup): void;
/**
 * Switches the item color UI to the next layer within the provided color group
 * @param {ColorGroup} colorGroup - The color group whose layers to cycle
 * @returns {void} - Nothing
 */
declare function ItemColorNextLayer(colorGroup: ColorGroup): void;
/**
 * Switches the item color UI to the previous layer within the provided color group
 * @param {ColorGroup} colorGroup - The color group whose layers to cycle
 * @returns {void} - Nothing
 */
declare function ItemColorPreviousLayer(colorGroup: ColorGroup): void;
/**
 * @param {Item} item
 * @param {readonly AssetLayer[]} colorableLayers
 * @returns {ColorGroup[]}
 */
declare function ItemColorGetGroups(item: Item, colorableLayers: readonly AssetLayer[]): ColorGroup[];
/**
 * Builds the item color UI's current state based on the provided character, item and position parameters. This only rebuilds the state if
 * needed.
 * @param {Character} c - The character being colored
 * @param {Item} item - The item being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} [includeResetButton=false] - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
declare function ItemColorStateBuild(c: Character, item: Item, x: number, y: number, width: number, height: number, includeResetButton?: boolean): void;
/**
 * Returns layers of the asset which can be given distinct colors
 * @param {Item} item - The item to be colored
 * @returns {AssetLayer[]} - The colourable layers
 */
declare function ItemColorGetColorableLayers(item: Item): AssetLayer[];
/**
 * Returns whether or not the item can have only a single color or multiple colors
 * @param {Item} item - The item to be colored
 * @returns {boolean} - Whether the item only allows one color
 */
declare function ItemColorIsSimple(item: Item): boolean;
/**
 * Fetches the color button text key for the provided item color. If the item's color is already a string, the color string is returned.
 * Otherwise, returns "Many" or "Default" as appropriate.
 * @param {string | readonly string[]} color - The item color
 * @returns {string} - The appropriate color button key for the provided item color(s)
 */
declare function ItemColorGetColorButtonTextKey(color: string | readonly string[]): string;
/**
 * Fetches the color button text for the provided item color. If the item's color is already a string, the color string is returned.
 * Otherwise, returns "Many" or "Default" as appropriate.
 * @param {string | readonly string[]} color - The item color
 * @returns {string} - The appropriate color button text for the provided item color(s), translated to the current game language
 */
declare function ItemColorGetColorButtonText(color: string | readonly string[]): string;
/**
 * Registers an exit callback to the item color UI which will be called when the UI is exited.
 * @param {itemColorExitListener} callback - The exit listener to register
 * @returns {void} - Nothing
 */
declare function ItemColorOnExit(callback: itemColorExitListener): void;
/**
 * Handles exiting the item color UI. Appropriate text caches are dropped, and any registered exit listeners are called.
 * @param {boolean} save - Whether or not the appearance changes applied by the item color UI should be saved
 * @returns {void} - Nothing
 */
declare function ItemColorFireExit(save: boolean): void;
/**
 * Resets color UI related global variables back to their default states.
 * @returns {void} - Nothing
 */
declare function ItemColorReset(): void;
/**
 * Check whether the current colors of the item match the item's default colors
 * @param {Item} Item - The appearance item to check
 * @returns {boolean} - Whether the item has default color(s)
 */
declare function ItemColorIsDefault(Item: Item): boolean;
declare namespace ItemColorConfig {
    let buttonSpacing: 20;
    let buttonSize: 65;
    let headerButtonSize: 90;
    let colorPickerButtonWidth: 65;
    let colorDisplayWidth: 160;
    let colorInputHeight: 45;
}
declare namespace ItemColorMode {
    let DEFAULT: "Default";
    let COLOR_PICKER: "ColorPicker";
}
/** @type {Character} */
declare let ItemColorCharacter: Character;
/** @type {Item} */
declare let ItemColorItem: Item;
/** @type {ItemColorMode} */
declare let ItemColorCurrentMode: ItemColorMode;
/** @type {string} */
declare let ItemColorStateKey: string;
/** @type {ItemColorStateType} */
declare let ItemColorState: ItemColorStateType;
/** @type {number} */
declare let ItemColorPage: number;
/** @type {Record<string, number>} */
declare let ItemColorLayerPages: Record<string, number>;
/** @type {string} */
declare let ItemColorPickerBackup: string;
/** @type {number[]} */
declare let ItemColorPickerIndices: number[];
/** @type {itemColorExitListener[]} */
declare let ItemColorExitListeners: itemColorExitListener[];
/** @type {string} */
declare let ItemColorBackup: string;
declare let ItemColorText: TextCache;
/** @type {TextCache} */
declare let ItemColorLayerNames: TextCache;
/** @type {TextCache} */
declare let ItemColorGroupNames: TextCache;
/**
 * A debounced callback for when the item color picker changes its value. This sets the color for the currently selected set of color
 * indices
 * @type {(color: string) => void}
 */
declare const ItemColorOnPickerChange: (color: string) => void;
