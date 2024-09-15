/**
 * Attaches event listeners required for the color picker to the canvas
 * @returns {void} - Nothing
 */
declare function ColorPickerAttachEventListener(): void;
/**
 * Removes the color picker related event listeners from the canvas
 * @returns {void} - Nothing
 */
declare function ColorPickerRemoveEventListener(): void;
/**
 * Helper to guard for TouchEvents
 * @param {Event} event
 * @returns {event is TouchEvent}
 */
declare function isTouchEvent(event: Event): event is TouchEvent;
/**
 * When the touch/mouse event begins to be registered. On mobile we only fire it once
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerStartPick(Event: MouseEvent | TouchEvent): void;
/**
 * When we stop registering the touch/mouse event, to remove the attached event listeners
 * @returns {void} - Nothing
 */
declare function ColorPickerEndPick(): void;
/**
 * Gets the coordinates of the current event on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {{X: number, Y: number}} - Coordinates of the click/touch event on the canvas
 */
declare function ColorPickerGetCoordinates(Event: MouseEvent | TouchEvent): {
    X: number;
    Y: number;
};
/**
 * Sets the picked hue based on the Event coordinates on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerPickHue(Event: MouseEvent | TouchEvent): void;
/**
 * Sets the picked saturation (SV) based on the Event coordinates on the canvas
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerPickSV(Event: MouseEvent | TouchEvent): void;
/**
 * Sets the picked HSV from the color palette
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerSelectFromPalette(Event: MouseEvent | TouchEvent): void;
/**
 * Handles clicking on the favorite colors palette
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerSelectFromFavorites(Event: MouseEvent | TouchEvent): void;
/**
 * Handles the previous, next, and save button functionality for the color picker.
 * @param {MouseEvent|TouchEvent} Event - The touch/mouse event
 * @returns {void} - Nothing
 */
declare function ColorPickerSelectButton(Event: MouseEvent | TouchEvent): void;
/**
 * Alters the color picker display based on the selected value
 * @param {boolean} [sourceElementChanged=false] - True if the color was updated by the text input element
 * @returns {void} - Nothing
 */
declare function ColorPickerNotify(sourceElementChanged?: boolean): void;
/**
 * Removes the color picker and its listeners from the canvas
 * @return {void} - Nothing
 */
declare function ColorPickerHide(): void;
/**
 * Checks if two hex color codes are equal, will convert short hand hex codes (#FFF is equal to #FFFFFF)
 * @param {HexColor} Color1 - First color to compare
 * @param {HexColor} Color2 - Second color to compare
 * @returns {boolean} - Returns TRUE if the two colors are the same
 */
declare function ColorPickerCSSColorEquals(Color1: HexColor, Color2: HexColor): boolean;
/**
 * Draws the color picker on the canvas
 * @param {number} X - Coordinate on the X axis
 * @param {number} Y - Coordinate on the Y axis
 * @param {number} Width - Width of the color picker
 * @param {number} Height - Height of the color picker
 * @param {HTMLInputElement} Src - Input element that can contain a hex color code
 * @param {ColorPickerCallbackType} [Callback] - Callback to execute when the selected color changes
 * @returns {void} - Nothing
 */
declare function ColorPickerDraw(X: number, Y: number, Width: number, Height: number, Src: HTMLInputElement, Callback?: ColorPickerCallbackType): void;
/**
 * Parses a hex color code and converts it to a HSV object
 * @param {HexColor} Color - Hex color code
 * @param {HSVColor} [DefaultHSV] - The HSV to output if the color is not valid
 * @returns {HSVColor} - The HSV color from a hex color code
 * @see {@link https://gist.github.com/mjackson/5311256}
 */
declare function ColorPickerCSSToHSV(Color: HexColor, DefaultHSV?: HSVColor): HSVColor;
/**
 * Converts a HSV object into a valid hex code to use in the css
 * @param {HSVColor} HSV - HSV value to convert
 * @returns {HexColor} - Hex color code corresponding to the given HSV
 */
declare function ColorPickerHSVToCSS(HSV: HSVColor): HexColor;
/**
 * Returns the array of default colors for the list of favorite colors.
 * @returns {HSVColor[]} - Array of default colors
 */
declare function GetDefaultSavedColors(): HSVColor[];
declare var ColorPickerX: number;
declare var ColorPickerY: number;
declare var ColorPickerWidth: number;
declare var ColorPickerHeight: number;
declare var ColorPickerInitialHSV: HSVColor;
declare var ColorPickerLastHSV: HSVColor;
declare var ColorPickerHSV: HSVColor;
/** @type {HTMLInputElement} */
declare var ColorPickerSourceElement: HTMLInputElement;
/** @type {ColorPickerCallbackType} */
declare let ColorPickerCallback: ColorPickerCallbackType;
/** @type {string} */
declare var ColorPickerCSS: string;
/** @type {boolean} */
declare var ColorPickerIsDefault: boolean;
/** @type {null | number} */
declare var ColorPickerSelectedFavoriteIndex: null | number;
declare var ColorPickerFavoritesPage: number;
/** @type {HSVColor[]} */
declare var DefaultSavedColors: HSVColor[];
declare var ColorPickerHueBarHeight: number;
declare var ColorPickerSVPanelGap: number;
declare var ColorPickerPaletteHeight: number;
declare var ColorPickerPaletteGap: number;
declare var ColorPickerFavoritesPaletteHeight: number;
declare var ColorPickerFavoritesPaletteGap: number;
declare namespace ColorPickerLayout {
    let HueBarOffset: number;
    let HueBarHeight: number;
    let SVPanelOffset: number;
    let SVPanelHeight: number;
    let PaletteOffset: number;
    let PaletteHeight: number;
    let FavoritesPaletteOffset: number;
    let FavoritesPaletteHeight: number;
    let ButtonOffset: number;
    let NextButtonX: number;
    let SaveButtonX: number;
    let PrevButtonX: number;
}
declare const ColorPickerNumSaved: 18;
