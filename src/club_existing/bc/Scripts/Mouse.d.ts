/**
 * Check if the mouse position is within the boundaries of a given zone (Useful for UI components)
 * @param {number} Left - Starting position on the X axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Width - Width of the zone
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
declare function MouseIn(Left: number, Top: number, Width: number, Height: number): boolean;
/**
 * Check if the mouse position is within the boundaries of a given zone along the X axis
 * @param {number} Left - Starting position on the X axis
 * @param {number} Width - Width of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
declare function MouseXIn(Left: number, Width: number): boolean;
/**
 * Check if the mouse position is within the boundaries of a given zone along the Y axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the click occurred in the given zone
 */
declare function MouseYIn(Top: number, Height: number): boolean;
/**
 * A common check for whether the specified position is being hovered over
 * @param {number} Left - Starting position on the X axis
 * @param {number} Top - Starting position on the Y axis
 * @param {number} Width - Width of the zone
 * @param {number} Height - Height of the zone
 * @returns {boolean} - Returns TRUE if the mouse is currently hovering over the specified zone
 */
declare function MouseHovering(Left: number, Top: number, Width: number, Height: number): boolean;
declare var MouseX: number;
declare var MouseY: number;
