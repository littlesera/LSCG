/**
 * Loads the item properties
 * @returns {void} Nothing
 */
declare function TightenLoosenItemLoad(): void;
/**
 * Draws the extended tighten / loosen menu
 * @returns {void} Nothing
 */
declare function TightenLoosenItemDraw(): void;
/**
 * Sets a facial expression for the character being tightneded/loosened
 * @param {Character} C - The character affected
 * @param {"" | ExpressionNameMap["Blush"]} Blush - The blush style
 * @param {"" | ExpressionNameMap["Eyes"]} Eyes - The eyes style
 * @param {"" | ExpressionNameMap["Eyebrows"]} Eyebrows - The eyebrows style
 * @returns {void} Nothing
 */
declare function TightenLoosenFacialExpression(C: Character, Blush: "" | ExpressionNameMap["Blush"], Eyes: "" | ExpressionNameMap["Eyes"], Eyebrows: "" | ExpressionNameMap["Eyebrows"]): void;
/**
 * Handles clicks on the tighten / loosen menu
 * @returns {void} Nothing
 */
declare function TightenLoosenItemClick(): void;
/**
 * Exit function for sub menu
 * @returns {void} - Nothing
 */
declare function TightenLoosenItemExit(): void;
declare var TightenLoosenItemMaximumDifficulty: number;
declare var TightenLoosenItemMinimumDifficulty: number;
