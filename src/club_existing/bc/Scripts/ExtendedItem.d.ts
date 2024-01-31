/**
 * @template {any[]} T
 * @template RT
 * @param {ExtendedItemData<any>} data
 * @param {string} name
 * @param {null | ExtendedItemCallback<T, RT>} originalFunction
 */
declare function ExtendedItemCreateCallback<T extends any[], RT>(data: ExtendedItemData<any>, name: string, originalFunction: ExtendedItemCallback<T, RT>): void;
/**
 * Construct the extended item's archetypical callbacks and place them in the main namespace.
 * @template {ExtendedItemOption} T
 * @param {ExtendedItemData<T>} data - The extended item data
 * @param {ExtendedItemCallbackStruct<T>} defaults - The default archetypical callbacks
 */
declare function ExtendedItemCreateCallbacks<T extends ExtendedItemOption>(data: ExtendedItemData<T>, defaults: ExtendedItemCallbackStruct<T>): void;
/**
 * Convert that passed extended item config script hooks into their item data counterpart.
 * @template {ExtendedItemData<any>} DataType
 * @template {ExtendedItemOption} OptionType
 * @param {ExtendedItemCapsScriptHooksStruct<DataType, OptionType>} scriptHooks - The extended item config script hooks
 * @returns {ExtendedItemScriptHookStruct<DataType, OptionType>} - The extended item data script hooks
 */
declare function ExtendedItemParseScriptHooks<DataType extends ExtendedItemData<any>, OptionType extends ExtendedItemOption>(scriptHooks: ExtendedItemCapsScriptHooksStruct<DataType, OptionType>): ExtendedItemScriptHookStruct<DataType, OptionType>;
/**
 * Initialize the extended item properties
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} Push - Whether to push to changes to the server
 * @param {boolean} Refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {boolean} Whether properties were updated or not
 */
declare function ExtendedItemInit(C: Character, Item: Item, Push?: boolean, Refresh?: boolean): boolean;
/**
 * Helper init function for extended items without an archetype.
 * Note that on the long term this function should ideally be removed in favor of adding appropriate archetypes.
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {ItemProperties} Properties - A record that maps property keys to their default value.
 *        The type of each value is used for basic validation.
 * @param {boolean} Push - Whether to push to changes to the server
 * @param {boolean} Refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {boolean} Whether properties were updated or not
 */
declare function ExtendedItemInitNoArch(C: Character, Item: Item, Properties: ItemProperties, Push?: boolean, Refresh?: boolean): boolean;
/**
 * Loads the item's extended item menu
 * @param {ExtendedItemData<any>} data
 * @returns {void} Nothing
 */
declare function ExtendedItemLoad(data: ExtendedItemData<any>): void;
/**
 * Draw a single button in the extended item type selection screen.
 * @param {ExtendedItemOption | ModularItemModule} Option - The new extended item option
 * @param {ExtendedItemOption} CurrentOption - The current extended item option
 * @param {ElementData<ElementMetaData>} buttonData - The X coordinate of the button
 * @param {string} DialogPrefix - The prefix to the dialog keys for the display strings describing each extended type.
 *     The full dialog key will be <Prefix><Option.Name>
 * @param {Item} Item - The item in question; defaults to {@link DialogFocusItem}
 * @param {boolean | null} IsSelected - Whether the button is already selected or not. If `null` compute this value by checking if the item's current type matches `Option`.
 * @see {@link TypedItemDraw}
 */
declare function ExtendedItemDrawButton(Option: ExtendedItemOption | ModularItemModule, CurrentOption: ExtendedItemOption, DialogPrefix: string, buttonData: ElementData<ElementMetaData>, Item?: Item, IsSelected?: boolean | null): void;
/**
 * Determine the background color for the item option's button
 * @param {ExtendedItemData<any>} data - The extended item data
 * @param {Character} C - The character wearing the item
 * @param {ExtendedItemOption | ModularItemModule} Option - A type for the extended item
 * @param {ExtendedItemOption} CurrentOption - The currently selected option for the item
 * @param {boolean} Hover - TRUE if the mouse cursor is on the button
 * @param {boolean} IsSelected - TRUE if the item's current type matches Option
 * @param {Item} Item - The item in question; defaults to {@link DialogFocusItem}
 * @returns {string} The name or hex code of the color
 */
declare function ExtendedItemGetButtonColor(data: ExtendedItemData<any>, C: Character, Option: ExtendedItemOption | ModularItemModule, CurrentOption: ExtendedItemOption, Hover: boolean, IsSelected: boolean, Item?: Item): string;
/**
 * Exit function for the extended item dialog.
 *
 * This function will check if there's an extended subscreen and unload it to move back
 * to the main extended subscreen, or unload the whole extended subscreen and unfocus the item.
 *
 * It will cleanup the shared state from extended screens appropriately, call their unload (Exit)
 * callback, and set either {@link DialogFocusItem} or {@link ExtendedItemSubscreen} back to `null`.
 *
 * Note that you shouldn't need to call this function directly. The correct way to "exit" from an
 * extended item is to call {@link DialogLeaveFocusItem}, which will call this and refresh the dialog
 * UI.
 * @returns {void} - Nothing
 */
declare function ExtendedItemExit(): void;
/**
 * Sets a typed item's type and properties to the option provided.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose type to set
 * @param {ItemProperties} previousProperty - The typed item options for the item
 * @param {ItemProperties} newProperty - The option to set
 * @param {boolean} push - Whether to push to changes to the server
 * @param {boolean} refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {void} Nothing
 */
declare function ExtendedItemSetProperty(C: Character, item: Item, previousProperty: ItemProperties, newProperty: ItemProperties, push?: boolean, refresh?: boolean): void;
/**
 * Checks whether the character meets the requirements for an extended type option. This will check against their Bondage
 * skill if applying the item to another character, or their Self Bondage skill if applying the item to themselves.
 * @template {ExtendedItemOption} T
 * @param {null | ExtendedItemData<T>} data
 * @param {Character} C - The character in question
 * @param {Item} item - The item in question
 * @param {T} Option - The selected type definition
 * @param {T} CurrentOption - The current type definition
 * @param {boolean} permitExisting - Determines whether the validation should allow the new option and previous option
 * to be identical. Defaults to false.
 * @returns {string|null} null if the player meets the option requirements. Otherwise a string message informing them
 * of the requirements they do not meet
 */
declare function ExtendedItemRequirementCheckMessage<T extends ExtendedItemOption>(data: ExtendedItemData<T>, C: Character, item: Item, Option: T, CurrentOption: T, permitExisting?: boolean): string | null;
/**
 * Checks whether the player is able to select an option based on it's self-selection criteria (whether or not the
 * wearer may select the option)
 * @param {Character} C - The character on whom the bondage is applied
 * @param {ExtendedItemOption} Option - The option whose requirements should be checked against
 * @returns {string | undefined} - undefined if the
 */
declare function ExtendedItemCheckSelfSelect(C: Character, Option: ExtendedItemOption): string | undefined;
/**
 * Checks whether the player meets an option's self-bondage/bondage skill level requirements
 * @param {Character} C - The character on whom the bondage is applied
 * @param {Item} Item - The item whose options are being checked
 * @param {ExtendedItemOption} Option - The option whose requirements should be checked against
 * @returns {string|undefined} - undefined if the player meets the option's skill level requirements. Otherwise returns
 * a string message informing them of the requirements they do not meet.
 */
declare function ExtendedItemCheckSkillRequirements(C: Character, Item: Item, Option: ExtendedItemOption): string | undefined;
/**
 * Checks whether the character meets an option's required bought items
 * @param {ExtendedItemOption} Option - The option being checked
 * @returns {string|undefined} undefined if the requirement is met, otherwise the error message
 */
declare function ExtendedItemCheckBuyGroups(Option: ExtendedItemOption): string | undefined;
/**
 * Checks whether a change from the given current option to the newly selected option is valid.
 * @template {ExtendedItemOption} T
 * @param {null | ExtendedItemData<T>} data - The extended item data
 * @param {Character} C - The character wearing the item
 * @param {Item} Item - The extended item to validate
 * @param {T} newOption - The selected option
 * @param {T} previousOption - The currently applied option on the item
 * @param {boolean} [permitExisting] - Determines whether the validation should allow the new option and previous option
 * to be identical. Defaults to false.
 * @returns {string} - Returns a non-empty message string if the item failed validation, or an empty string otherwise
 */
declare function ExtendedItemValidate<T extends ExtendedItemOption>(data: ExtendedItemData<T>, C: Character, Item: Item, newOption: T, previousOption: T, permitExisting?: boolean): string;
/**
 * Simple getter for the function prefix used for the passed extended item - used for calling standard
 * extended item functions (e.g. if the currently focused it is the hemp rope arm restraint, this will return
 * "InventoryItemArmsHempRope", allowing functions like InventoryItemArmsHempRopeLoad to be called)
 * @param {Item} Item - The extended item in question; defaults to {@link DialogFocusItem}
 * @returns {string} The extended item function prefix for the currently focused item
 */
declare function ExtendedItemFunctionPrefix(Item?: Item): string;
/**
 * Simple getter for the key of the currently focused extended item in the ExtendedItemOffsets lookup
 * @returns {string} The offset lookup key for the currently focused extended item
 */
declare function ExtendedItemOffsetKey(): string;
/**
 * Gets the pagination offset of the currently focused extended item
 * @returns {number} The pagination offset for the currently focused extended item
 */
declare function ExtendedItemGetOffset(): number;
/**
 * Sets the pagination offset for the currently focused extended item
 * @param {number} Offset - The new offset to set
 * @returns {void} Nothing
 */
declare function ExtendedItemSetOffset(Offset: number): void;
/**
 * Maps a chat tag to a dictionary entry for use in item chatroom messages.
 * @param {DictionaryBuilder} dictionary - The to-be updated dictionary builder
 * @param {Character} C - The target character
 * @param {Item} item - The typed item
 * @param {CommonChatTags} tag - The tag to map to a dictionary entry
 * @returns {DictionaryBuilder} - The originally passed dictionary builder, modified inplace
 */
declare function ExtendedItemMapChatTagToDictionaryEntry(dictionary: DictionaryBuilder, C: Character, { Asset, Craft }: Item, tag: CommonChatTags): DictionaryBuilder;
/**
 * Construct an array of inventory icons for a given asset and type
 * @param {Character} C - The target character
 * @param {Asset} Asset - The asset for the typed item
 * @param {string | null} Type - The type of the asse
 * @param {readonly EffectName[]} [Effects]
 * @returns {InventoryIcon[]} - The inventory icons
 */
declare function ExtendItemGetIcons(C: Character, Asset: Asset, Type?: string | null, Effects?: readonly EffectName[]): InventoryIcon[];
/**
 * Creates an asset's extended item NPC dialog function
 * @param {Asset} Asset - The asset for the typed item
 * @param {string} FunctionPrefix - The prefix of the new `NpcDialog` function
 * @param {string | ExtendedItemNPCCallback<ExtendedItemOption>} NpcPrefix - A dialog prefix or a function for creating one
 * @returns {void} - Nothing
 */
declare function ExtendedItemCreateNpcDialogFunction(Asset: Asset, FunctionPrefix: string, NpcPrefix: string | ExtendedItemNPCCallback<ExtendedItemOption>): void;
/**
 * Helper click function for creating custom buttons, including extended item permission support.
 * @param {string} Name - The name of the button and its pseudo-type
 * @param {number} X - The X coordinate of the button
 * @param {number} Y - The Y coordinate of the button
 * @param {string | null} imagePath — The pa
 * @param {boolean} IsSelected - Whether the button is selected or not
 * @param {boolean} ChangeWhenLocked - Whether the button can be clicked when locked
 * @returns {void} Nothing
 */
declare function ExtendedItemCustomDraw(Name: string, X: number, Y: number, imagePath?: string | null, IsSelected?: boolean, ChangeWhenLocked?: boolean): void;
/**
 * Helper click function for creating custom check boxes, including extended item permission support.
 * @param {string} name - The name of the checkbox and its pseudo-type
 * @param {number} x - The X coordinate of the checkbox
 * @param {number} y - The Y coordinate of the checkbox
 * @param {boolean} isChecked - Whether the checkbox is checked or not
 * @param {Object} options
 * @param {string} [options.text] - Label associated with the checkbox
 * @param {number} [options.width] - Width of the checkbox
 * @param {number} [options.height] - Height of the checkbox
 * @param {boolean} [options.changeWhenLocked] - Whether the checkbox can be toggled when locked
 * @param {string} [options.textColor]
 */
declare function ExtendedItemDrawCheckbox(name: string, x: number, y: number, isChecked: boolean, options?: {
    text?: string;
    width?: number;
    height?: number;
    changeWhenLocked?: boolean;
    textColor?: string;
}): void;
/**
 * Helper click function for creating custom buttons, including extended item permission support.
 * @param {string} Name - The name of the button and its pseudo-type
 * @param {() => void} Callback - A callback to be executed whenever the button is clicked and all requirements are met
 * @param {boolean} Worn - `true` if the player is changing permissions for an item they're wearing
 * @returns {boolean} `false` if the item's requirement check failed and `true` otherwise
 */
declare function ExtendedItemCustomClick(Name: string, Callback: () => void, Worn?: boolean, ChangeWhenLocked?: boolean): boolean;
/**
 * Helper click function for creating custom buttons, including extended item permission support, and pushing the changes to the server.
 * @param {Character} C - The character
 * @param {Item} item - The item
 * @param {string} name - The name of the button and its pseudo-type
 * @param {() => void} callback - A callback to be executed whenever the button is clicked and all requirements are met
 * @param {boolean} worn - `true` if the player is changing permissions for an item they're wearing
 * @param {boolean} changeWhenLocked - Whether the button r
 * @returns {boolean} `false` if the item's requirement check failed and `true` otherwise
 */
declare function ExtendedItemCustomClickAndPush(C: Character, item: Item, name: string, callback: () => void, worn?: boolean, changeWhenLocked?: boolean): boolean;
/**
 * Helper publish + exit function for creating custom buttons whose clicks exit the dialog menu.
 *
 * If exiting the dialog menu is undesirable then something akin to the following example should be used instead:
 * @example
 * if (ServerPlayerIsInChatRoom()) {
 *     ChatRoomPublishCustomAction(Name, false, Dictionary);
 * }
 * @param {string} Name - Tag of the action to send
 * @param {ChatMessageDictionary | null} Dictionary - Dictionary of tags and data to send to the room (if any).
 * @returns {void} Nothing
 */
declare function ExtendedItemCustomExit(Name: string, Dictionary?: ChatMessageDictionary | null): void;
/**
 * Common draw function for drawing the header of the extended item menu screen.
 * Automatically applies any Locked and/or Vibrating options to the preview.
 * @param {number} X - Position of the preview box on the X axis
 * @param {number} Y - Position of the preview box on the Y axis
 * @param {Item} Item - The item for whom the preview box should be drawn
 * @returns {void} Nothing
 */
declare function ExtendedItemDrawHeader(X?: number, Y?: number, Item?: Item): void;
/**
 * Extract the passed item's data from one of the extended item lookup tables
 * @template {ExtendedArchetype} Archetype
 * @param {Asset} asset - The item whose data should be extracted
 * @param {Archetype} Archetype - The archetype corresponding to the lookup table
 * @param {string} Type - The item's type. Only relevant in the case of {@link VariableHeightData}
 * @returns {null | ExtendedDataLookupStruct[Archetype]} The item's data or `null` if the lookup failed
 */
declare function ExtendedItemGetData<Archetype extends ExtendedArchetype>(asset: Asset, Archetype: Archetype, Type?: string): ExtendedDataLookupStruct[Archetype];
/**
 * Constructs the chat message dictionary for the extended item based on the items configuration data.
 * @template {ExtendedItemOption} OptionType
 * @param {ExtendedItemChatData<OptionType>} chatData - The chat data that triggered the message.
 * @param {ExtendedItemData<OptionType>} data - The extended item data for the asset
 * @param {Item} item
 * @returns {DictionaryBuilder} - The dictionary for the item based on its required chat tags
 */
declare function ExtendedItemBuildChatMessageDictionary<OptionType extends ExtendedItemOption>(chatData: ExtendedItemChatData<OptionType>, { chatTags, dictionary }: ExtendedItemData<OptionType>, item: Item): DictionaryBuilder;
/**
 * Return {@link ExtendedItemDialog.chat} if it's a string or call it using chat data based on a fictional extended item option.
 * Generally used for getting a chat prefix for extended item buttons with custom functionality.
 * @param {string} Name - The name of the pseudo-type
 * @param {ExtendedItemData} Data - The extended item data
 * @returns {string} The dialogue prefix for the custom chatroom messages
 */
declare function ExtendedItemCustomChatPrefix(Name: string, Data: ExtendedItemData<any>): string;
/**
 * Gather and return all subscreen properties of the passed option.
 * @param {Item} item - The item in question
 * @param {ExtendedItemOption} option - The extended item option
 * @returns {ItemProperties} - The item properties of the option's subscreen (if any)
 */
declare function ExtendedItemGatherSubscreenProperty(item: Item, option: ExtendedItemOption): ItemProperties;
/**
 * Sets an extended item's type and properties to the option provided.
 * @template {ModularItemOption | TypedItemOption | VibratingItemOption} OptionType
 * @param {ModularItemData | TypedItemData | VibratingItemData} data - The extended item data
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose type to set
 * @param {OptionType} newOption - The to-be applied extended item option
 * @param {OptionType} previousOption - The previously applied extended item option
 * @param {boolean} push - Whether to push to changes to the server
 * @param {boolean} refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 */
declare function ExtendedItemSetOption<OptionType extends TypedItemOption | ModularItemOption | VibratingItemOption>(data: ModularItemData | TypedItemData | VibratingItemData, C: Character, item: Item, newOption: OptionType, previousOption: OptionType, push?: boolean, refresh?: boolean): void;
/** A temporary hack for registering extra archetypes for a single screen. */
declare function ExtendedItemManualRegister(): void;
/**
 * Parse the passed draw data as passed via the extended item config
 * @template {ElementMetaData} MetaData
 * @param {ExtendedItemConfigDrawData<Partial<MetaData>> | undefined} drawData - The to-be parsed draw data
 * @param {Pick<ExtendedItemDrawData<MetaData>, "elementData" | "itemsPerPage">} defaults - The default draw data
 * @return {ExtendedItemDrawData<MetaData>} - The parsed draw data
 */
declare function ExtendedItemGetDrawData<MetaData extends ElementMetaData>(drawData: ExtendedItemConfigDrawData<Partial<MetaData>>, defaults: Pick<ExtendedItemDrawData<MetaData>, "elementData" | "itemsPerPage">): ExtendedItemDrawData<MetaData>;
/**
 * Pre-process the passed extended item option and return a shallow copy.
 * @template {Pick<ExtendedItemOption, "Property" | "Prerequisite">} T
 * @param {T} option The to-be processed extended item option
 * @param {Asset} asset
 * @returns {T}
 */
declare function ExtendedItemParseOptions<T extends Pick<ExtendedItemOption, "Prerequisite" | "Property">>(option: T, asset: Asset): T;
/**
 * Set an extended items properties based on the passed type record
 * @param {Character} C - The character in question
 * @param {AssetGroupName | Item} itemOrGroupName - The item or the item's group
 * @param {null | TypeRecord} typeRecord - The archetypical items type record. If `null` only apply `options.properties`
 * @param {Object} options
 * @param {boolean} [options.push] - Whether to push the item changes to the server
 * @param {Character} [options.C_Source] - The character updating the item (if any)
 * @param {boolean} [options.refresh] - Whether to refresh the character after setting the item properties
 * @param {ItemProperties} [options.properties] - Extra item properties to be set on the item, the allowed list of properties being defined by {@link ExtendedItemData.baselineProperty}
 * @returns {void}
 */
declare function ExtendedItemSetOptionByRecord(C: Character, itemOrGroupName: AssetGroupName | Item, typeRecord?: null | TypeRecord, options?: {
    push?: boolean;
    C_Source?: Character;
    refresh?: boolean;
    properties?: ItemProperties;
}): void;
/**
 * Take an old {@link ItemProperties.Type} and convert it into a {@link ItemProperties.TypeRecord}.
 * @param {Asset} asset - The asset in question
 * @param {null | string} type - The to-be convert type string
 * @returns {TypeRecord} The newly created type record
 */
declare function ExtendedItemTypeToRecord(asset: Asset, type: null | string): TypeRecord;
/**
 * Utility file for handling extended items
 */
/**
 * A lookup for the current pagination offset for all extended item options. Offsets are only recorded if the extended
 * item requires pagination. Example format:
 * ```json
 * {
 *     "ItemArms/HempRope": 4,
 *     "ItemArms/Web": 0
 * }
 * ```
 * @type {Record<string, number>}
 * @constant
 */
declare var ExtendedItemOffsets: Record<string, number>;
/**
 * The X & Y co-ordinates of each option's button, based on the number to be displayed per page.
 * @type {[number, number][][]}
 */
declare const ExtendedXY: [number, number][][];
/**
 * The X & Y co-ordinates of each option's button, based on the number to be displayed per page.
 * @type {[number, number][][]}
 */
declare const ExtendedXYWithoutImages: [number, number][][];
/**
 * The X & Y co-ordinates of each option's button, based on the number to be displayed per page.
 * @type {[number, number][][]}
 */
declare const ExtendedXYClothes: [number, number][][];
/**
 * The X & Y co-ordinates of each option's button, based on the number to be displayed per page.
 * @type {[number, number][][]}
 */
declare const ExtendedXYClothesWithoutImages: [number, number][][];
/** Memoization of the requirements check */
declare const ExtendedItemRequirementCheckMessageMemo: MemoizedFunction<typeof ExtendedItemRequirementCheckMessage>;
/**
 * The current display mode
 * @type {boolean}
 */
declare var ExtendedItemPermissionMode: boolean;
/**
 * Tracks whether a selected option's subscreen is active - if active, the value is the name of the current subscreen's
 * corresponding option
 * @type {string|null}
 */
declare var ExtendedItemSubscreen: string | null;
declare function ExtendedItemGatherOptions(item: Item): ExtendedItemOptionUnion[];
declare namespace ExtendedItemTighten {
    function Draw({ asset }: ExtendedItemData<any>, item: Item, buttonCoords: RectTuple): void;
    function Click({ asset }: ExtendedItemData<any>, item: Item, buttonCoords: RectTuple): boolean;
}
