/**
 * Loads the player's wardrobe safe spots. If a spot is not named yet, initializes it with the player's name
 * @returns {void} - Nothing
 */
declare function WardrobeLoadCharacterNames(): void;
/**
 * Makes sure the wardrobe is of the correct length. If someone tampered with the wardrobe's size, all
 * extended slots are deleted
 * @returns {void} - Nothing
 */
declare function WardrobeFixLength(): void;
/**
 * Loads all wardrobe characters. If the slot of the wardrobe is currently unused, display a randomly dressed character.
 * Saves the current wardrobe on the server
 * @param {boolean} Fast
 * @returns {void} - Nothing
 */
declare function WardrobeLoadCharacters(Fast: boolean): void;
/**
 * Loads the player's wardrobe. when the player opens the wardrobe screen for the first time.
 * This function is called dynamically.
 * @returns {void} - Nothing
 *
 */
declare function WardrobeLoad(): void;
/**
 * Shows the wardrobe screen. This function is called dynamically on a repeated basis. So don't call complex functions
 * or use extended loops in this function.
 * @returns {void} - Nothing
 */
declare function WardrobeRun(): void;
/**
 * Handles the click events in the wardrobe screen. Clicks are propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function WardrobeClick(): void;
/**
 * Advance to the next reordering mode, or set the mode to the specified
 * value.  The reordering mode cycles through the values:
 * "None" -> "Select" -> "Place"
 *
 * @param {WardrobeReorderType} newmode - The mode to set.  If null, advance to next mode.
 */
declare function WardrobeReorderModeSet(newmode?: WardrobeReorderType): void;
/**
 * Exits the wardorbe screen and sends the player back to her private room
 * @returns {void} - Nothing
 */
declare function WardrobeExit(): void;
/**
 * Set a wardrobe character name, sync it with server
 * @param {number} W - The number of the wardrobe slot to save
 * @param {string} Name - The name of the wardrobe slot
 * @param {boolean} [Push=false] -If set to true, the changes are pushed to the server
 */
declare function WardrobeSetCharacterName(W: number, Name: string, Push?: boolean): void;
/**
 * Reduces a given asset to the attributes needed for the wardrobe
 * @param {Item} A - The asset that should be reduced
 * @returns {ItemBundle} - The bundled asset
 */
declare function WardrobeAssetBundle(A: Item): ItemBundle;
/**
 * Load character appearance from wardrobe, only load clothes on others
 * @param {Character} C - The character the appearance should be loaded for
 * @param {number} W - The spot in the wardrobe the appearance should be loaded to
 * @param {boolean} [Update=false] - If set to true, the appearance will be updated to the server
 * @returns {void} - Nothing
 */
declare function WardrobeFastLoad(C: Character, W: number, Update?: boolean): void;
/**
 * Saves character appearance in player's wardrobe, use player's body as base for others
 * @param {Character} C - The character, whose appearance should be saved
 * @param {number} W - The spot in the wardrobe the current outfit should be saved to
 * @param {boolean} [Push=false] - If set to true, the wardrobe is saved on the server
 * @returns {void} - Nothing
 */
declare function WardrobeFastSave(C: Character, W: number, Push?: boolean): void;
/**
 * Swap two slots in the wardrobe.  Will silently do nothing if either
 * index is out of range.
 *
 * @param {number} a - Slot index
 * @param {number} b - The other slot index
 * @returns {void} - Nothing
 */
declare function WardrobeSwapSlots(a: number, b: number): void;
/**
 * Unconditionally pushes entire wardrobe to the server.  Used primarily after
 * reordering the wardrobe slots.
 *
 * @returns {void} - Nothing
 */
declare function WardrobePushAll(): void;
/**
 * Returns the expressions of character C as a single big object
 * @param {Character} C - The character whose expressions should be returned
 * @returns {Partial<Record<ExpressionGroupName, ExpressionName>>} Expression - The expresssion of a character
 */
declare function WardrobeGetExpression(C: Character): Partial<Record<ExpressionGroupName, ExpressionName>>;
/**
 * Checks if a given group of a character can be accessed.
 * @param {Character} C - The character in the wardrobe
 * @param {AssetGroup} Group - The group to check for accessibility
 * @param {object} [Options] - Options to use for the check
 * @param {boolean} Options.ExcludeNonCloth - Removes anything that's not clothing.
 * @returns {boolean} - Whether the zone can be altered or not.
 */
declare function WardrobeGroupAccessible(C: Character, Group: AssetGroup, Options?: {
    ExcludeNonCloth: boolean;
}): boolean;
declare var WardrobeBackground: string;
/** @type {Character[]} */
declare var WardrobeCharacter: Character[];
declare var WardrobeSelection: number;
declare var WardrobeOffset: number;
declare var WardrobeSize: number;
/** @type {WardrobeReorderType} */
declare var WardrobeReorderMode: WardrobeReorderType;
/** @type {number[]} */
declare var WardrobeReorderList: number[];
