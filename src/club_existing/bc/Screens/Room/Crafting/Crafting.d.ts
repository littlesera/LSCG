/**
 * Returns TRUE if a crafting item has an effect from a list or allows that effect
 * @param {Asset} Item - The item asset to validate
 * @param {EffectName[]} Effect - The list of effects to validate
 * @returns {Boolean} - TRUE if the item has that effect
 */
declare function CraftingItemHasEffect(Item: Asset, Effect: EffectName[]): boolean;
/**
 * Shows the crating screen and remember if the entry came from an online chat room
 * @param {boolean} FromChatRoom - TRUE if we come from an online chat room
 * @returns {void} - Nothing
 */
declare function CraftingShowScreen(FromChatRoom: boolean): void;
/**
 * Loads the club crafting room in slot selection mode, creates a dummy character for previews
 * @returns {void} - Nothing
 */
declare function CraftingLoad(): void;
/**
 * Update the crafting character preview image, applies the item on all possible body parts
 * @returns {void} - Nothing
 */
declare function CraftingUpdatePreview(): void;
/**
 * Run the club crafting room if all possible modes
 * @returns {void} - Nothing
 */
declare function CraftingRun(): void;
/**
 * Update {@link CraftingSelectedItem.ItemProperties} with a select few properties from the passed item.
 * @param {Item} item - The item whose properties should be coppied.
 * @returns {void}
 */
declare function CraftingUpdateFromItem(item: Item): void;
/**
 * Sets the new mode and creates or removes the inputs
 * @param {CraftingMode} NewMode - The new mode to set
 * @returns {void} - Nothing
 */
declare function CraftingModeSet(NewMode: CraftingMode): void;
/**
 * @this {HTMLInputElement}
 * @returns {void};
 */
declare function CraftingPriorityKeyUp(this: HTMLInputElement): void;
/**
 * When the color or type field is updated manually, we update the preview image
 * @returns {void} - Nothing
 */
declare function CraftingKeyUp(): void;
/**
 * Helper function for parsing the `InputPriority` HTML element.
 * @returns {number | null}
 */
declare function CraftingParsePriorityElement(): number | null;
/**
 * Serialize a single crafted item into a string in order to prepare it for server saving
 * @param {CraftingItem} craft The crafted item
 * @returns {string} The serialized crafted item
 * @see {@link CraftingSaveServer}
 */
declare function CraftingSerialize(craft: CraftingItem): string;
/**
 * Prepares a compressed packet of the crafting data and sends it to the server
 * @returns {void} - Nothing
 */
declare function CraftingSaveServer(): void;
/**
 * Deserialize a single crafted item from a string in order to parse data received from the server.
 * @param {string} craftString The serialized crafted item
 * @returns {null | CraftingItem} The crafted item or `null` if either its {@link CraftingItem.Item} or {@link CraftingItem.Name} property is invalid
 * @see {@link CraftingDecompressServerData}
 */
declare function CraftingDeserialize(craftString: string): null | CraftingItem;
/**
 * Deserialize and unpack the crafting data from the server.
 * @param {string | (null | CraftingItem)[]} Data The serialized crafting data
 * @returns {(null | CraftingItem)[]}
 */
declare function CraftingDecompressServerData(Data: string | (null | CraftingItem)[]): (null | CraftingItem)[];
/**
 * Loads the server packet and creates the crafting array for the player
 * @param {string} Packet - The packet
 * @returns {void} - Nothing
 */
declare function CraftingLoadServer(Packet: string): void;
/**
 * Advance to the next crafting reordering mode, or set the mode to the specified value.
 * @param {CraftingReorderType} newmode - The mode to set.  If null, advance to next mode.
 */
declare function CraftingReorderModeSet(newmode?: CraftingReorderType): void;
/**
 * Handles clicks in the crafting room.
 * @returns {void} - Nothing
 */
declare function CraftingClick(): void;
/**
 * Refreshes the preview model with a slight delay so the item color process is done
 * @returns {void} - Nothing
 * */
declare function CraftingRefreshPreview(): void;
/**
 * Converts the currently selected item into a crafting item.
 * @return {CraftingItem}
 * */
declare function CraftingConvertSelectedToItem(): CraftingItem;
/**
 * Convert a crafting item to its selected format.
 * @param {CraftingItem} Craft
 * @returns {CraftingItemSelected}
 */
declare function CraftingConvertItemToSelected(Craft: CraftingItem): CraftingItemSelected;
/**
 * When the player exits the crafting room
 * @returns {void} - Nothing
 */
declare function CraftingExit(): void;
/**
 * Applies the craft to all matching items
 * @param {CraftingItem} Craft
 * @param {Asset} Item
 */
declare function CraftingAppliesToItem(Craft: CraftingItem, Item: Asset): false | Asset;
/**
 * Builds the item list from the player inventory, filters by the search box content
 * @returns {void} - Nothing
 */
declare function CraftingItemListBuild(): void;
/**
 * Validate and sanitinize crafting properties of the passed item inplace.
 * @param {CraftingItem} Craft - The crafted item properties or `null`
 * @param {Asset | null} asset - The matching Asset. Will be extracted from the player inventory if `null`
 * @param {boolean} Warn - Whether a warning should logged whenever the crafting validation fails
 * @return {CraftingStatusType} - One of the {@link CraftingStatusType} status codes; 0 denoting an unrecoverable validation error
 */
declare function CraftingValidate(Craft: CraftingItem, asset?: Asset | null, Warn?: boolean): CraftingStatusType;
/** The background of the crafting screen. */
declare var CraftingBackground: string;
/**
 * The active subscreen within the crafting screen:
 * * `"Slot"`: The main crafting screens wherein the {@link CraftingItem} is selected, created or destroyed.
 * * `"Item"`: The item selection screen wherein the underlying {@link Asset} is selected.
 * * `"Property"`: The {@link CraftingPropertyType} selection screen.
 * * `"Lock"`: The {@link CraftingLockList} selection screen.
 * * `"Name"`: The main menu wherein the crafted item is customized, allowing for the specification of names, descriptions, colors, extended item types, _etc._
 * * `"Color"`: A dedicated coloring screen for the crafted item.
 * * `"Extended"`: The extended item menu.
 * @type {CraftingMode}
 */
declare let CraftingMode: CraftingMode;
/** Whether selecting a crafted item in the crafting screen should destroy it. */
declare let CraftingDestroy: boolean;
/** The index of the selected crafted item within the crafting screen. */
declare let CraftingSlot: number;
/**
 * The currently selected crafted item in the crafting screen.
 * @type {CraftingItemSelected | null}
 */
declare let CraftingSelectedItem: CraftingItemSelected | null;
/** An offset used for the pagination of {@link CraftingItemList} and all crafted items. */
declare let CraftingOffset: number;
/**
 * A list of all assets valid for crafting, potentially filtered by a user-provided keyword.
 * @type {Asset[]}
 */
declare let CraftingItemList: Asset[];
/**
 * The character used for the crafting preview.
 * @type {Character | null}
 */
declare let CraftingPreview: Character | null;
/** Whether the crafting character preview should be naked or not. */
declare let CraftingNakedPreview: boolean;
/** Whether exiting the crafting menu should return you to the chatroom or, otherwise, the main hall. */
declare let CraftingReturnToChatroom: boolean;
/** Pagination offset used for the `Priority` {@link CraftingMode}. */
declare let CraftingOverridePriorityOffset: number;
/** List of item indices collected for swapping.
 * @type {number[]}
 */
declare let CraftingReorderList: number[];
/** @type {CraftingReorderType} */
declare let CraftingReorderMode: CraftingReorderType;
/**
 * @type {null | TextCache}
 */
declare let CraftingLayerNames: null | TextCache;
/** The separator used between different crafted items when serializing them. */
declare const CraftingSerializeItemSep: "§";
/** The separator used between fields within a single crafted item when serializing them. */
declare const CraftingSerializeFieldSep: "¶";
/**
 * Regexp pattern for sanitizing to-be serialized crafted item string data by finding all
 * special separator characters (see {@link CraftingSerializeItemSep} and {@link CraftingSerializeFieldSep}).
 */
declare const CraftingSerializeSanitize: RegExp;
/**
 * Map crafting properties to their respective validation function.
 * @type {Map<CraftingPropertyType, (asset: Asset) => boolean>}
 */
declare const CraftingPropertyMap: Map<CraftingPropertyType, (asset: Asset) => boolean>;
/**
 * An enum with status codes for crafting validation.
 * @property OK - The validation proceded without errors
 * @property ERROR - The validation produced one or more errors that were successfully resolved
 * @property CRITICAL_ERROR - The validation produced an unrecoverable error
 * @type {{OK: 2, ERROR: 1, CRITICAL_ERROR: 0}}
 */
declare const CraftingStatusType: {
    OK: 2;
    ERROR: 1;
    CRITICAL_ERROR: 0;
};
/**
 * The Names of all locks that can be automatically applied to crafted items.
 * An empty string implies the absence of a lock.
 * @type {readonly (AssetLockType | "")[]}
 */
declare const CraftingLockList: readonly (AssetLockType | "")[];
/**
 * A set of item property names that should never be stored in {@link CraftingItem.ItemProperty}.
 * @type {Set<keyof ItemProperties>}
 */
declare const CraftingPropertyExclude: Set<keyof ItemProperties>;
/**
 * A record with tools for validating {@link CraftingItem} properties.
 * @type {Record<keyof CraftingItem, CratingValidationStruct>}
 * @see {@link CratingValidationStruct}
 * @todo Let the Validate/GetDefault functions take the respective attribute rather than the entire {@link CraftingItem}
 */
declare const CraftingValidationRecord: Record<keyof CraftingItem, CratingValidationStruct>;
