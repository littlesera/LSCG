/**
 * Construct a record mapping all crafting-valid asset names to a list of matching elligble assets.
 * Elligble assets are defined as crafting-valid assets with either a matching {@link Asset.Name} or {@link Asset.CraftGroup}.
 * @see {@link CraftingAssets}
 * @returns {Record<string, Asset[]>}
 */
declare function CraftingAssetsPopulate(): Record<string, Asset[]>;
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
 */
declare function CraftingUpdatePreview(): void;
/**
 * Run the club crafting room if all possible modes
 * @returns {void} - Nothing
 */
declare function CraftingRun(): void;
declare function CraftingResize(load: boolean): void;
declare function CraftingUnload(): void;
/**
 * Update {@link CraftingSelectedItem.ItemProperties} with a select few properties from the passed item.
 * @param {Item} item - The item whose properties should be coppied.
 * @returns {void}
 */
declare function CraftingUpdateFromItem(item: Item): void;
/**
 * Return a list of all searchable asset names.
 * @returns {string[]}
 */
declare function CraftingGetAllAssetNames(): string[];
/**
 * Sets the new mode and creates or removes the inputs
 * @param {CraftingMode} NewMode - The new mode to set
 * @returns {void} - Nothing
 */
declare function CraftingModeSet(NewMode: CraftingMode): void;
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
 * @param {string | (null | CraftingItem)[]} Data The serialized crafting data or already-decompressed crafting item list
 * @returns {(null | CraftingItem)[]}
 */
declare function CraftingDecompressServerData(Data: string | (null | CraftingItem)[]): (null | CraftingItem)[];
/**
 * Loads the server packet and creates the crafting array for the player
 * @param {string | (null | CraftingItem)[]} Packet - The packet or already-decompressed crafting item list
 * @returns {void} - Nothing
 */
declare function CraftingLoadServer(Packet: string | (null | CraftingItem)[]): void;
/**
 * Advance to the next crafting reordering mode, or set the mode to the specified value.
 * @param {CraftingReorderType} newmode - The mode to set.  If null, advance to next mode.
 */
declare function CraftingReorderModeSet(newmode?: CraftingReorderType): void;
declare function CraftingClick(event: MouseEvent | TouchEvent): void;
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
/** Restore the DOM elements of the `Name` subscreen to their default state. */
declare function CraftingExitResetElements(): void;
/**
 * When the player exits the crafting room
 * @param {boolean} allowPanelClose - Whether an exit call in the `Name` mode is allowed to close the side panels before performing a proper exit of the subscreen
 * @returns {void} - Nothing
 */
declare function CraftingExit(allowPanelClose?: boolean): void;
/**
 * Applies the craft to all matching items
 * @param {CraftingItem} Craft
 * @param {Asset} Item
 */
declare function CraftingAppliesToItem(Craft: CraftingItem, Item: Asset): boolean;
/**
 * Builds the item list from the player inventory, filters by the search box content
 * @returns {Asset[]} - Nothing
 */
declare function CraftingItemListBuild(): Asset[];
/**
 * Validate and sanitinize crafting properties of the passed item inplace.
 * @param {CraftingItem} Craft - The crafted item properties or `null`
 * @param {Asset | null} asset - The matching Asset. Will be extracted from the player inventory if `null`
 * @param {boolean} Warn - Whether a warning should logged whenever the crafting validation fails
 * @param {boolean} checkPlayerInventory - Whether or not the player must own the crafted item's underlying asset
 * @return {CraftingStatusType} - One of the {@link CraftingStatusType} status codes; 0 denoting an unrecoverable validation error
 */
declare function CraftingValidate(Craft: CraftingItem, asset?: Asset | null, Warn?: boolean, checkPlayerInventory?: boolean): CraftingStatusType;
/** The background of the crafting screen. */
declare var CraftingBackground: string;
/**
 * The active subscreen within the crafting screen:
 * * `"Slot"`: The main crafting screens wherein the {@link CraftingItem} is selected, created or destroyed.
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
/** An offset used for the pagination of {@link Player.Crafting}. */
declare let CraftingOffset: number;
/**
 * A list of all assets valid for crafting, potentially filtered by a user-provided keyword.
 * @type {never}
 * @deprecated
 */
declare let CraftingItemList: never;
/**
 * The character used for the crafting preview.
 * @type {Character | null}
 */
declare let CraftingPreview: Character | null;
/** Whether the crafting character preview should be naked or not. */
declare let CraftingNakedPreview: boolean;
/** Whether exiting the crafting menu should return you to the chatroom or, otherwise, the main hall. */
declare let CraftingReturnToChatroom: boolean;
/** List of item indices collected for swapping.
 * @type {number[]}
 */
declare let CraftingReorderList: number[];
/** @type {CraftingReorderType} */
declare let CraftingReorderMode: CraftingReorderType;
/**
 * A record mapping all crafting-valid asset names to a list of matching elligble assets.
 *
 * Elligble assets are defined as crafting-valid assets with either a matching {@link Asset.Name} or {@link Asset.CraftGroup}.
 *
 * The first asset in each list is guaranteed to satisfy `Asset.Group.Name === Asset.DynamicGroupName` _if_ any of the list members satisfy this condition.
 * @type {Record<string, Asset[]>}
 */
declare let CraftingAssets: Record<string, Asset[]>;
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
declare namespace CraftingID {
    let root: "crafting-screen";
    let topBar: "crafting-top-bar";
    let header: "crafting-header";
    let menuBar: "crafting-menu-bar";
    let downloadButton: "crafting-download-button";
    let uploadButton: "crafting-upload-button";
    let acceptButton: "crafting-accept-button";
    let cancelButton: "crafting-cancel-button";
    let exitButton: "crafting-exit-button";
    let leftPanel: "crafting-left-panel";
    let assetButton: "crafting-asset-button";
    let assetPanel: "crafting-asset-panel";
    let assetGrid: "crafting-asset-grid";
    let assetSearch: "crafting-asset-search";
    let assetHeader: "crafting-asset-header";
    let padlockButton: "crafting-padlock-button";
    let padlockPanel: "crafting-padlock-panel";
    let padlockGrid: "crafting-padlock-grid";
    let padlockSearch: "crafting-padlock-search";
    let padlockHeader: "crafting-padlock-header";
    let propertyButton: "crafting-property-button";
    let propertyPanel: "crafting-property-panel";
    let propertyGrid: "crafting-property-grid";
    let propertySearch: "crafting-property-search";
    let propertyHeader: "crafting-property-header";
    let centerPanel: "crafting-center-panel";
    let undressButton: "crafting-undress-button";
    let rightPanel: "crafting-right-panel";
    let nameInput: "crafting-name-input";
    let nameLabel: "crafting-name-label";
    let descriptionInput: "crafting-description-input";
    let descriptionLabel: "crafting-description-label";
    let colorsButton: "crafting-colors-button";
    let colorsInput: "crafting-colors-input";
    let colorsLabel: "crafting-colors-label";
    let layeringInput: "crafting-layering-input";
    let layeringButton: "crafting-layering-button";
    let layeringLabel: "crafting-layering-label";
    let privateCheckbox: "crafting-private-checkbox";
    let privateLabel: "crafting-private-label";
    let extendedButton: "crafting-extended-button";
    let extendedLabel: "crafting-extended-label";
    let asciiDescriptionCheckbox: "crafting-ascii-description-checkbox";
    let asciidescriptionLabel: "crafting-ascii-description-label";
}
declare namespace CraftingDescription {
    let ExtendedDescriptionMarker: "\0";
    let Pattern: RegExp;
    let PatternASCII: RegExp;
    function Decode(description: string): string;
    function Encode(description: string): string;
}
declare namespace CraftingEventListeners {
    let _ClickPrivate: (this: HTMLInputElement, ev: Event) => void;
    let _InputLayering: (this: HTMLInputElement, ev: Event) => void;
    let _ChangeName: (this: HTMLInputElement, ev: Event) => void;
    let _ChangeDescription: (this: HTMLTextAreaElement, ev: Event) => void;
    let _InputDescription: (this: HTMLTextAreaElement, ev: Event) => void;
    let _ChangeColor: (this: HTMLInputElement, ev: Event) => void;
    let _ClickExtended: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickLayering: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickColors: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickUndress: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickAccept: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickExit: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickUpload: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickDownload: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickExpand: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickProperty: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickPadlock: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickAsset: (this: HTMLButtonElement, ev: Event) => void;
    let _ClickRadio: (this: HTMLButtonElement, ev: Event) => void;
    let _InputSearch: (this: HTMLInputElement, ev: Event) => Promise<void>;
    let _ClickAsciiDescription: (this: HTMLInputElement, ev: Event) => void;
}
declare namespace CraftingElements {
    function _SearchInputGetDataList(controls: string): () => string[];
    function _SearchInput(id: string, controls: string, placeholder: string): HTMLInputElement;
    function _RadioButton(id: string, onClick: (this: HTMLButtonElement, ev: Event) => any, assetImage?: null | Asset, dataAttributes?: null | Partial<Record<string, string | number | boolean>>, label?: null | string, children?: null | readonly (string | Node)[], asset?: null | Asset, first?: boolean): HTMLButtonElement;
}
/**
 * A record with tools for validating {@link CraftingItem} properties.
 * @type {Record<keyof CraftingItem, CratingValidationStruct>}
 * @see {@link CratingValidationStruct}
 * @todo Let the Validate/GetDefault functions take the respective attribute rather than the entire {@link CraftingItem}
 */
declare const CraftingValidationRecord: Record<keyof CraftingItem, CratingValidationStruct>;
