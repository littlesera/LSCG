/**
 * Builds all the assets that can be used to dress up the character
 * @param {Character} C - The character whose appearance is modified
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceBuildAssets(C: Character): void;
/**
 * Makes sure the character appearance is valid from inventory and asset requirement. This function is called during the login process.
 * @param {Character} C - The character whose appearance is checked
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceValidate(C: Character): void;
/**
 * Resets the character to it's default appearance
 * @param {Character} C - The character to redress to its default appearance
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceSetDefault(C: Character): void;
/**
 * Checks wether an item group is required for this asset
 * @param {Character} C - The character, whose assets are used for the check
 * @param {AssetGroupBodyName} GroupName - The name of the group to check
 * @returns {boolean} - Returns TRUE if the item group is required from
 */
declare function CharacterAppearanceRequired(C: Character, GroupName: AssetGroupBodyName): boolean;
/**
 * Checks, wether the item group must be hidden for a certain asset
 * @param {Character} C - The character, whose assets are used for the check
 * @param {AssetGroupName} GroupName - The name of the group to check
 * @returns {boolean} - Returns TRUE if the item group must be hidden and not chosen
 */
declare function CharacterAppearanceMustHide(C: Character, GroupName: AssetGroupName): boolean;
/**
 * Sets a full random set of items for a character. Only items that do not have the "Random" property set to false will be used.
 * @param {Character} C - The character to dress
 * @param {boolean} [ClothOnly=false] - Defines, if only clothes should be used
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceFullRandom(C: Character, ClothOnly?: boolean): void;
/**
 * Removes all items that can be removed, making the character naked. Checks for a blocking of CosPlayItem removal.
 * @param {Character} C - The character to undress
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceNaked(C: Character): void;
/**
 * Removes one layer of clothing: outer clothes, then underwear, then body-cosplay clothes, then nothing
 * @param {Character} C - The character to undress
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceStripLayer(C: Character): void;
/**
 * Check whether a layer must be visible given a provided type record.
 * @param {AllowTypes.Data} allowTypes - The layer's allowed types
 * @param {TypeRecord} typeRecord - The type record in question.
 * @returns {boolean} - Whether the layer should be visible
 */
declare function CharacterAppearanceAllowForTypes(allowTypes: AllowTypes.Data, typeRecord: TypeRecord): boolean;
/**
 * Determines whether an asset layer should be rendered, assuming the asset itself is visible.
 * @param {Character} C - The character wearing the item
 * @param {AssetLayer} layer - The layer to check visibility for
 * @param {Asset} asset - The asset that the layer belongs to
 * @param {TypeRecord} [typeRecord] - The item's type, if it has one
 * @returns {boolean} - TRUE if the layer should be visible, FALSE otherwise
 */
declare function CharacterAppearanceIsLayerVisible(C: Character, layer: AssetLayer, asset: Asset, typeRecord?: TypeRecord): boolean;
/**
 * Builds a filtered and sorted set of appearance layers, each representing a drawable layer of a character's current appearance. Layers
 * that will not be drawn (because their asset is not visible or they do not permit the current asset type) are filtered out at this stage.
 * @param {Character} C - The character to build the layers for
 * @return {Mutable<AssetLayer>[]} - A sorted set of (shallow copied) layers, sorted by layer drawing priority
 */
declare function CharacterAppearanceSortLayers(C: Character): Mutable<AssetLayer>[];
/**
 * Determines whether an item or a whole item group is visible or not
 * @param {Character} C - The character whose assets are checked
 * @param {string} AssetName - The name of the asset to check
 * @param {AssetGroupName} GroupName - The name of the item group to check
 * @param {boolean} Recursive - If TRUE, then other items which are themselves hidden will not hide this item. Parameterising this prevents
 *     infinite loops.
 * @returns {boolean} - Returns TRUE if we can show the item or the item group
 */
declare function CharacterAppearanceVisible(C: Character, AssetName: string, GroupName: AssetGroupName, Recursive?: boolean): boolean;
/**
 * Determines whether the player has set this item to not appear on screen
 * @param {string} AssetName - The name of the asset to check
 * @param {AssetGroupName} GroupName - The name of the item group to check
 * @returns {boolean} - TRUE if the item is hidden
 */
declare function CharacterAppearanceItemIsHidden(AssetName: string, GroupName: AssetGroupName): boolean;
/**
 * Calculates and sets the height modifier which affects the character's vertical position on screen
 * @param {Character} C - The character whose height modifier must be calculated
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceSetHeightModifiers(C: Character): void;
/**
 * Draws the character canvas
 * @param {Character} C - The character to draw
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceBuildCanvas(C: Character): void;
/**
 * Returns a value from the character current appearance
 * @param {Character} C - The character to get values from
 * @param {AssetGroupName} Group - The name of the group, whose values we want to get
 * @param {string} Type - The name of the value, we want to get
 * @returns {*} - The return value
 */
declare function CharacterAppearanceGetCurrentValue(C: Character, Group: AssetGroupName, Type: string): any;
/**
 * Repositions the character horizonally to centre them, since shorter characters will shrink towards the left
 * @param {Character} C - The character to reposition
 * @param {number} HeightRatio - The character's height ratio
 * @returns {number} - The amount to move the character along the X co-ordinate
 */
declare function CharacterAppearanceXOffset(C: Character, HeightRatio: number): number;
/**
 * Repositions the character vertically towards the bottom of the canvas (the 'floor'), since shorter characters will be shrunk towards the
 * top HeightRatioProportion controls how much of this offset applies with 1 (max) positioning them on the "floor" and 0 (min) leaving them
 * up at the 'ceiling'
 * @param {Character} C - The character to reposition
 * @param {number} HeightRatio - The character's height ratio
 * @param {boolean} [IgnoreUpButton=false] - Whether or not to ignore the up button status
 * @returns {number} - The amounnt to move the character along the Y co-ordinate
 */
declare function CharacterAppearanceYOffset(C: Character, HeightRatio: number, IgnoreUpButton?: boolean): number;
/**
 * Loads the character appearance screen and keeps a backup of the previous appearance. The function name is created dynamically.
 * @returns {void} - Nothing
 */
declare function AppearanceLoad(): void;
/**
 * Build the buttons in the top menu
 * @param {Character} C - The character the appearance is being set for
 * @returns {void} - Nothing
 */
declare function AppearanceMenuBuild(C: Character): void;
/**
 * Checks if the appearance is locked for the current player
 * @param {Character} C - The character to validate
 * @param {String} GroupName - The group name to validate, can be "ALL" to check all groups
 * @returns {boolean} - Return TRUE if the appearance group isn't blocked
 */
declare function AppearanceGroupAllowed(C: Character, GroupName: string): boolean;
/**
 * Run the character appearance selection screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
declare function AppearanceRun(): void;
/**
 * Calculates the background color of the preview image for and item
 * @param {Character} C - The character whose appearance we are viewing
 * @param {DialogInventoryItem} item - The item to calculate the color for
 * @param {boolean} hover - Whether or not the item is currently hovering over the preview image
 * @returns {string} - A CSS color string determining the color that the preview icon should be drawn in
 */
declare function AppearanceGetPreviewImageColor(C: Character, item: DialogInventoryItem, hover: boolean): string;
/**
 * Draw the top-row menu buttons for the appearance screen
 * @returns {void} - Nothing
 */
declare function AppearanceMenuDraw(): void;
/**
 * Create a list of characters with different items from the group applied, to use as the preview images
 * @param {Character} C - The character that the dialog inventory has been loaded for
 * @param {boolean} buildCanvases - Determines whether the preview canvases need to be (re)built, e.g. for the initial load or due to an appearance change
 * @returns {void} - Nothing
 */
declare function AppearancePreviewBuild(C: Character, buildCanvases: boolean): void;
/**
 * Delete all characters created for preview images
 * @returns {void} - Nothing
 */
declare function AppearancePreviewCleanup(): void;
/**
 * Returns whether the the 3x3 grid "Cloth" appearance mode should include the character in the preview images
 * @param {AssetGroup} assetGroup - The group to check
 * @returns {boolean} - If TRUE the previews will be drawn with the character
 */
declare function AppearancePreviewUseCharacter(assetGroup: AssetGroup): boolean;
/**
 * Sets an item in the character appearance
 * @param {Character} C - The character whose appearance should be changed
 * @param {AssetGroupName} Group - The name of the corresponding groupr for the item
 * @param {Asset|null} ItemAsset - The asset collection of the item to be changed
 * @param {string|string[]} [NewColor] - The new color (as "#xxyyzz" hex value) for that item
 * @param {number} [DifficultyFactor=0] - The difficulty, on top of the base asset difficulty, that should be assigned
 * to the item
 * @param {number} [ItemMemberNumber=-1] - The member number of the player adding the item - defaults to -1
 * @param {boolean} [Refresh=true] - Determines, wether the character should be redrawn after the item change
 * @returns {null | Item} - Thew newly created item or `null` if the asset does not exist
 */
declare function CharacterAppearanceSetItem(C: Character, Group: AssetGroupName, ItemAsset: Asset | null, NewColor?: string | string[], DifficultyFactor?: number, ItemMemberNumber?: number, Refresh?: boolean): null | Item;
/**
 * Cycle in the appearance assets to find the next item in a group
 * @param {Character} C - The character whose assets are used
 * @param {AssetGroupName} Group - The name of the group to cycle
 * @param {boolean} [Forward=true] - Sets the direction of the cycling
 * @returns {Asset|null} - The next item to select, or null if there's none applicable
 */
declare function CharacterAppearanceNextItem(C: Character, Group: AssetGroupName, Forward?: boolean): Asset | null;
/**
 * Find the next color for the item
 * @param {Character} C - The character whose items are cycled
 * @param {AssetGroupName} Group - The name of the group for which we are color cycling
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceNextColor(C: Character, Group: AssetGroupName): void;
/**
 * Moves the offset to get new character appearance items
 * @param {Character} C - The character whose visible groups are used for calculation
 * @param {number} Move - The amount the next asset group should be moved before it is displayed
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceMoveGroup(C: Character, Move: number): void;
/**
 * Sets the color for a specific group
 * @param {Character} C - The character whose item group should be colored
 * @param {string} Color - The color (in the format "#rrggbb") to be applied to the group
 * @param {AssetGroupName} Group - The name of the group, whose color should be changed
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceSetColorForGroup(C: Character, Color: string, Group: AssetGroupName): void;
/**
 * Advance to the next reordering mode, or set the mode to the specified
 * value.  The reordering mode cycles through the values:
 * "None" -> "Select" -> "Place"
 *
 * @param {WardrobeReorderType} newmode - The mode to set.  If null, advance to next mode.
 */
declare function AppearanceWardrobeReorderModeSet(newmode?: WardrobeReorderType): void;
/**
 * Handle the clicks in the character appearance selection screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
declare function AppearanceClick(): void;
/**
 * Handles the Click events for the top-row buttons in the Appearance screen
 * @param {Character} C - The character the appearance is being set for
 * @returns {void} - Nothing
 */
declare function AppearanceMenuClick(C: Character): void;
/**
 * Handle the exiting of the appearance screen. The function name is created dynamically.
 * @returns {void} - Nothing
 */
declare function AppearanceExit(): void;
/**
 * Common cleanup that must happen when the appearance editor closes
 */
declare function CharacterAppearanceClose(): void;
/**
 * Restore the characters appearance backup, if the exit button is clicked
 * @param {Character} C - The character, whose appearance backup should be used
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceExit(C: Character): void;
/**
 * Handle the confirmation click in the wardrobe screen.
 * @param {Character} C - The character who has been changed
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceReady(C: Character): void;
/**
 * Copy the appearance from a character to another
 * @param {Character} FromC - The character to copy from
 * @param {Character} ToC - The character to copy to
 */
declare function CharacterAppearanceCopy(FromC: Character, ToC: Character): void;
/**
 * Loads the appearance editing screen for a character
 * @param {Character} C - The character for whom the appearance screen should be loaded
 * @param {(result: boolean) => void} [resultCallback] - A callback executed when the appearance editor closes.
 *  If not specified, it will change back to the previous screen automatically, otherwise the caller is
 *  reponsible for screen changes, and `result` will be true if the appearance change was made, false otherwise.
 * @returns {void} - nothing
 */
declare function CharacterAppearanceLoadCharacter(C: Character, resultCallback?: (result: boolean) => void): void;
/**
 * Load wardrobe menu in appearance selection screen
 * @param {Character} C - The character whose wardrobe should be loaded
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceWardrobeLoad(C: Character): void;
/**
 * Serialises a character's appearance into an abbreviated string for backup purposes
 * @param {Character} C - The character whose appearance should be serialised
 * @returns {string} - A serialised version of the character's current appearance
 */
declare function CharacterAppearanceStringify(C: Character): string;
/**
 * Serialize items to JSON, breaking the cyclic link between Item, Asset & Group
 * by serializing that into a single string representing the link.
 * @param {readonly Item[] | Item | any} Item
 * @returns {string}
 */
declare function AppearanceItemStringify(Item: readonly Item[] | Item | any): string;
/**
 * Restores a character's appearance from a serialised string generated by CharacterAppearanceStringify
 * @param {Character} C - The character whose appearance should be restored
 * @param {string} backup - The serialised appearance to restore
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceRestore(C: Character, backup: string): void;
/**
 * @param {string} stringified
 * @returns {any}
 */
declare function AppearanceItemParse(stringified: string): any;
/**
 * Opens the color picker for a selected item
 * @param {Character} C - The character the appearance is being changed for
 * @param {Item} Item - The currently selected item
 * @param {AssetGroupName} AssetGroup - The focused group
 * @param {"" | "Wardrobe" | "Cloth" | "Color"} CurrentMode - The mode to revert to on exiting the color picker
 * @returns {void}
 */
declare function AppearanceItemColor(C: Character, Item: Item, AssetGroup: AssetGroupName, CurrentMode: "" | "Wardrobe" | "Cloth" | "Color"): void;
/**
 * Combine two sets of appearance changes from the same base, favouring the newer changes where conflicting
 * @param {readonly Item[]} BaseAppearance - The previous appearance before either of the other two sets of changes were made
 * @param {Item[]} PrevAppearance - The first set of appearance changes
 * @param {readonly Item[]} NewAppearance - The second set of appearance changes, overriding any conflicts with the first
 * @returns {Item[]} - The final merged appearance
 */
declare function CharacterAppearanceResolveAppearance(BaseAppearance: readonly Item[], PrevAppearance: Item[], NewAppearance: readonly Item[]): Item[];
/**
 * Select from two potential changes to an item, preferring the newer if different to the original item
 * @param {Item} BaseItem - The item before any changes were made
 * @param {Item} PrevItem - The first item change
 * @param {Item} NewItem - The second item change
 * @return {Item} - The item to keep
 */
declare function CharacterAppearanceResolveItem(BaseItem: Item, PrevItem: Item, NewItem: Item): Item;
/**
 * Merge the incoming appearance changes from the online sync to the currently selected appearance
 * @param {Character} C - The character with changes to merge
 * @param {readonly Item[]} currentAppearance - The appearance before the sync's changes are applied
 * @returns {void} - Nothing
 */
declare function CharacterAppearanceResolveSync(C: Character, currentAppearance: readonly Item[]): void;
/**
 * Returns whether an asset with a specific gender is allowed in the current chatroom space
 * @param {Asset} asset
 */
declare function CharacterAppearanceGenderAllowed(asset: Asset): boolean;
declare var AppearanceBackground: string;
/** Offset for the group view */
declare var CharacterAppearanceOffset: number;
/** Number of entries per group page */
declare var CharacterAppearanceNumGroupPerPage: number;
/** Number of entries per cloth page */
declare var CharacterAppearanceNumClothPerPage: number;
/** Number of entries per wardrobe page */
declare var CharacterAppearanceWardrobeNumPerPage: number;
declare var CharacterAppearanceHeaderText: string;
declare var CharacterAppearanceHeaderTextTime: number;
/** @type {null | string} */
declare var CharacterAppearanceBackup: null | string;
/** @type {null | string} */
declare var CharacterAppearanceInProgressBackup: null | string;
/**
 * The list of all customizable groups
 * @type {AssetGroup[]}
 */
declare var CharacterAppearanceGroups: AssetGroup[];
/**
 * The list of all assets (owned or available)
 *
 * @type {Asset[]}
 */
declare var CharacterAppearanceAssets: Asset[];
/** @type {AssetGroupName} */
declare var CharacterAppearanceColorPickerGroupName: AssetGroupName;
declare var CharacterAppearanceColorPickerBackup: string;
declare var CharacterAppearanceColorPickerRefreshTimer: any;
/** @type {Character | null} */
declare var CharacterAppearanceSelection: Character | null;
/** @type {(accept: boolean) => void} */
declare var CharacterAppearanceResultCallback: (accept: boolean) => void;
declare var CharacterAppearanceReturnRoom: string;
/** @type {ModuleType} */
declare var CharacterAppearanceReturnModule: ModuleType;
declare var CharacterAppearanceWardrobeOffset: number;
declare var CharacterAppearanceWardrobeText: string;
declare var CharacterAppearanceWardrobeName: string;
declare var CharacterAppearanceForceUpCharacter: number;
/** @type {"" | ExpressionNameMap["Emoticon"]} */
declare var CharacterAppearancePreviousEmoticon: "" | ExpressionNameMap["Emoticon"];
/** @type {"" | "Wardrobe" | "Cloth" | "Color"} */
declare var CharacterAppearanceMode: "" | "Wardrobe" | "Cloth" | "Color";
/** @type {"" | "Wardrobe" | "Cloth" | "Color"} */
declare var CharacterAppearanceMenuMode: "" | "Wardrobe" | "Cloth" | "Color";
/** @type {null | Item} */
declare var CharacterAppearanceCloth: null | Item;
/** @type {DialogMenuButton[]} */
declare var AppearanceMenu: DialogMenuButton[];
/** @type {Character[]} */
declare var AppearancePreviews: Character[];
declare var AppearanceUseCharacterInPreviewsSetting: boolean;
/**
 * List of item indices collected for swapping.
 * #type {number[]}
 */
declare let AppearanceWardrobeReorderList: any[];
/** @type {WardrobeReorderType} */
declare let AppearanceWardrobeReorderMode: WardrobeReorderType;
declare const CanvasUpperOverflow: 700;
declare const CanvasLowerOverflow: 150;
declare const CanvasDrawWidth: 500;
declare const CanvasDrawHeight: number;
declare namespace AppearancePermissionColors {
    let red: string[];
    let amber: string[];
    let green: string[];
}
