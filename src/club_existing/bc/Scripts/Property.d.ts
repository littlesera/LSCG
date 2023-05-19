/**
 * Construct an item-specific ID for a properties input element (_e.g._ an opacity slider).
 * @param {string} Name - The name of the input element
 * @param {Item} Item - The item for whom the ID should be constructed; defaults to {@link DialogFocusItem}
 * @returns {string} - The ID of the property
 */
declare function PropertyGetID(Name: string, Item?: Item): string;
/**
 * Load function for items with opacity sliders. Constructs the opacity slider.
 * @param {null | ExtendedItemData<any>} Data - The items extended item data
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @param {string} thumbIcon The icon to use for the range input's "thumb" (handle).
 * @returns {HTMLInputElement} - The new or pre-existing range input element of the opacity slider
 */
declare function PropertyOpacityLoad(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void), thumbIcon?: string): HTMLInputElement;
/**
 * Draw function for items with opacity sliders. Draws the opacity slider and further opacity-related information.
 * @param {null | ExtendedItemData<any>} Data - The items extended item data
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @param {number} XOffset - An offset for all text and slider X coordinates
 * @param {number} YOffset - An offset for all text and slider Y coordinates
 * @param {string} LabelKeyword - The keyword of the opacity label
 * @returns {void} Nothing
 */
declare function PropertyOpacityDraw(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void), XOffset?: number, YOffset?: number, LabelKeyword?: string): void;
/**
 * Exit function for items with opacity sliders. Updates the items opacity, deletes the slider and (optionally) refreshes the character and item.
 * @param {null | ExtendedItemData<any>} Data - The items extended item data
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @param {boolean} Refresh - Whether character parameters and the respective item should be refreshed or not
 * @returns {boolean} Whether the opacity was updated or not
 */
declare function PropertyOpacityExit(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void), Refresh?: boolean): boolean;
/**
 * Validation function for items with opacity sliders.
 * @type {ExtendedItemScriptHookCallbacks.Validate<ExtendedItemData<any>, any>}
 */
declare function PropertyOpacityValidate(Data: ExtendedItemData<any>, OriginalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => string, C: Character, Item: Item, Option: any, CurrentOption: any): string;
/**
 * Helper fuction for publishing shock-related actions.
 * @param {Character} C - The shocked character; defaults to the {@link CharacterGetCurrent} output
 * @param {Item} Item - The shocking item; defaults to {@link DialogFocusItem}
 * @param {boolean} Automatic - Whether the shock was triggered automatically or otherwise manually
 */
declare function PropertyShockPublishAction(C?: Character, Item?: Item, Automatic?: boolean): void;
/**
 * Check if a given message warants automatic punishment given the provided sensitivety level
 * @param {0 | 1 | 2 | 3} Sensitivity - The auto-punishment sensitivety
 * @param {string} msg - The to-be checked message
 * @returns {boolean} Whether the passed message should trigger automatic speech-based punishment
 */
declare function PropertyAutoPunishParseMessage(Sensitivity: 0 | 1 | 2 | 3, msg: string): boolean;
/**
 * Check whether the last uttered message should trigger automatic punishment from the provided item
 * @param {Item} Item - The item in question
 * @param {number | null} LastMessageLen - The length of {@link ChatRoomLastMessage} prior to the last message (if applicable)
 * @returns {boolean} Whether the last message should trigger automatic speech-based punishment
 */
declare function PropertyAutoPunishDetectSpeech(Item: Item, LastMessageLen?: number | null): boolean;
/**
 * Merge all passed item properties into the passed output, merging (and shallow copying) arrays if necessary.
 * @param {ItemProperties} output - The to be updated properties
 * @param {readonly ItemProperties[]} args - The additional item properties to be merged into the output
 * @returns {ItemProperties} - The passed output modified inplace
 */
declare function PropertyUnion(output: ItemProperties, ...args: readonly ItemProperties[]): ItemProperties;
/**
 * Remove all passed item properties from the passed output, removing (and shallow copying) array entries if necessary.
 * @param {ItemProperties} output - The to-be updated properties
 * @param {readonly ItemProperties[]} args - The additional item properties to be removed from the output
 * @returns {ItemProperties} - The passed output modified inplace
 */
declare function PropertyDifference(output: ItemProperties, ...args: readonly ItemProperties[]): ItemProperties;
/**
 * Property.js
 * -----------
 * A module with common helper functions for the handling of specific {@link ItemProperties} properties.
 * Note that more generic extended item functions should be confined to `ExtendedItem.js`.
 */
/**
 * A Map that maps input element IDs to their original value is defined in, _.e.g_, {@link PropertyOpacityLoad}.
 * Used as fallback in case an invalid opacity value is encountered when exiting.
 * @type {Map<string, any>}
 */
declare const PropertyOriginalValue: Map<string, any>;
declare function PropertyOpacityChange(C: any, Item: any, Opacity: any): void;
/**
 * A set of group names whose auto-punishment has successfully been handled by {@link PropertyAutoPunishDetectSpeech}.
 * If a group name is absent from the set then it's eligible for action-based punishment triggers.
 * The initial set is populated by {@link AssetLoadAll} after all asset groups are defined.
 * @type {Set<AssetGroupName>}
 */
declare let PropertyAutoPunishHandled: Set<AssetGroupName>;
/**
 * A list of keywords that can trigger automatic punishment when included in `/me`- or `*`-based messages
 * @type {readonly string[]}
 */
declare const PropertyAutoPunishKeywords: readonly string[];
