/**
 * Get an asset-appropriate array with button coordinates, based on the number to be displayed per page.
 * @param {Asset} Asset - The relevant asset
 * @param {boolean} ShowImages - Whether images should be shown or not.
 * Note that whether an asset is clothing-based or not takes priority over this option.
 * @returns {[number, number][][]} The coordinates array
 */
declare function ExtendedItemGetXY(Asset: Asset, ShowImages?: boolean): [number, number][][];
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
 * @param {boolean} Refresh - Whether the character and relevant item should be refreshed
 * @returns {boolean} Whether properties were updated or not
 */
declare function ExtendedItemInit(C: Character, Item: Item, Refresh?: boolean): boolean;
/**
 * Helper init function for extended items without an archetype.
 * Note that on the long term this function should ideally be removed in favor of adding appropriate archetypes.
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {ItemProperties} Properties - A record that maps property keys to their default value.
 *        The type of each value is used for basic validation.
 * @param {boolean} Refresh - Whether the character and relevant item should be refreshed
 * @returns {boolean} Whether properties were updated or not
 */
declare function ExtendedItemInitNoArch(C: Character, Item: Item, Properties: ItemProperties, Refresh?: boolean): boolean;
/**
 * Loads the item's extended item menu
 * @param {ExtendedItemData<any>} data
 * @returns {void} Nothing
 */
declare function ExtendedItemLoad({ functionPrefix, dialogPrefix, parentOption }: ExtendedItemData<any>): void;
/**
 * Draw a single button in the extended item type selection screen.
 * @param {ExtendedItemOption | ModularItemModule} Option - The new extended item option
 * @param {ExtendedItemOption} CurrentOption - The current extended item option
 * @param {number} X - The X coordinate of the button
 * @param {number} Y - The Y coordinate of the button
 * @param {string} DialogPrefix - The prefix to the dialog keys for the display strings describing each extended type.
 *     The full dialog key will be <Prefix><Option.Name>
 * @param {boolean} ShowImages - Denotes whether images should be shown for the specific item
 * @param {Item} Item - The item in question; defaults to {@link DialogFocusItem}
 * @param {boolean | null} IsSelected - Whether the button is already selected or not. If `null` compute this value by checking if the item's current type matches `Option`.
 * @see {@link TypedItemDraw}
 */
declare function ExtendedItemDrawButton(Option: ExtendedItemOption | ModularItemModule, CurrentOption: ExtendedItemOption, DialogPrefix: string, X: number, Y: number, ShowImages?: boolean, Item?: Item, IsSelected?: boolean | null): void;
/**
 * Determine the background color for the item option's button
 * @param {Character} C - The character wearing the item
 * @param {ExtendedItemOption | ModularItemModule} Option - A type for the extended item
 * @param {ExtendedItemOption} CurrentOption - The currently selected option for the item
 * @param {boolean} Hover - TRUE if the mouse cursor is on the button
 * @param {boolean} IsSelected - TRUE if the item's current type matches Option
 * @param {Item} Item - The item in question; defaults to {@link DialogFocusItem}
 * @returns {string} The name or hex code of the color
 */
declare function ExtendedItemGetButtonColor(C: Character, Option: ExtendedItemOption | ModularItemModule, CurrentOption: ExtendedItemOption, Hover: boolean, IsSelected: boolean, Item?: Item): string;
/**
 * Exit function for the extended item dialog.
 *
 * Used for:
 *  1. Removing the cache from memory
 *  2. Calling item-appropriate `Exit` functions
 *  3. Setting {@link DialogFocusItem} and {@link ExtendedItemSubscreen} back to `null`
 * @returns {void} - Nothing
 */
declare function ExtendedItemExit(): void;
/**
 * Sets a typed item's type and properties to the option provided.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose type to set
 * @param {ItemProperties} previousProperty - The typed item options for the item
 * @param {ItemProperties} newProperty - The option to set
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @returns {void} Nothing
 */
declare function ExtendedItemSetProperty(C: Character, item: Item, previousProperty: ItemProperties, newProperty: ItemProperties, push?: boolean): void;
/**
 * Checks whether the character meets the requirements for an extended type option. This will check against their Bondage
 * skill if applying the item to another character, or their Self Bondage skill if applying the item to themselves.
 * @template {ExtendedItemOption} T
 * @param {Item} item - The item in question
 * @param {Character} C - The character in question
 * @param {T} Option - The selected type definition
 * @param {T} CurrentOption - The current type definition
 * @returns {string|null} null if the player meets the option requirements. Otherwise a string message informing them
 * of the requirements they do not meet
 */
declare function ExtendedItemRequirementCheckMessage<T extends ExtendedItemOption>(item: Item, C: Character, Option: T, CurrentOption: T): string | null;
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
 * @param {Character} C - The character wearing the item
 * @param {Item} Item - The extended item to validate
 * @param {T} Option - The selected option
 * @param {T} CurrentOption - The currently applied option on the item
 * @returns {string} - Returns a non-empty message string if the item failed validation, or an empty string otherwise
 */
declare function ExtendedItemValidate<T extends ExtendedItemOption>(C: Character, Item: Item, { Prerequisite, AllowLock }: T, CurrentOption: T): string;
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
 * @param {Asset} asset - The asset for the typed item
 * @param {CommonChatTags} tag - The tag to map to a dictionary entry
 * @returns {DictionaryBuilder} - The originally passed dictionary builder, modified inplace
 */
declare function ExtendedItemMapChatTagToDictionaryEntry(dictionary: DictionaryBuilder, C: Character, asset: Asset, tag: CommonChatTags): DictionaryBuilder;
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
 * @param {boolean} ShowImages — Denotes whether images should be shown for the specific item
 * @param {boolean} IsSelected - Whether the button is selected or not
 * @returns {void} Nothing
 */
declare function ExtendedItemCustomDraw(Name: string, X: number, Y: number, ShowImages?: boolean, IsSelected?: boolean): void;
/**
 * Helper click function for creating custom buttons, including extended item permission support.
 * @param {string} Name - The name of the button and its pseudo-type
 * @param {() => void} Callback - A callback to be executed whenever the button is clicked and all requirements are met
 * @param {boolean} Worn - `true` if the player is changing permissions for an item they're wearing
 * @returns {boolean} `false` if the item's requirement check failed and `true` otherwise
 */
declare function ExtendedItemCustomClick(Name: string, Callback: () => void, Worn?: boolean): boolean;
/**
 * Helper publish + exit function for creating custom buttons whose clicks exit the dialog menu.
 *
 * If exiting the dialog menu is undesirable then something akin to the following example should be used instead:
 * @example
 * if (ServerPlayerIsInChatRoom()) {
 *     ChatRoomPublishCustomAction(Name, false, Dictionary);
 * }
 * @param {string} Name - Tag of the action to send
 * @param {Character} C - The affected character
 * @param {ChatMessageDictionary | null} Dictionary - Dictionary of tags and data to send to the room (if any).
 * @returns {void} Nothing
 */
declare function ExtendedItemCustomExit(Name: string, C: Character, Dictionary?: ChatMessageDictionary | null): void;
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
 * @param {Item} Item - The item whose data should be extracted
 * @param {Archetype} Archetype - The archetype corresponding to the lookup table
 * @param {string} Type - The item's type. Only relevant in the case of {@link VariableHeightData}
 * @returns {null | ExtendedDataLookupStruct[Archetype]} The item's data or `null` if the lookup failed
 */
declare function ExtendedItemGetData<Archetype extends ExtendedArchetype>(Item: Item, Archetype: Archetype, Type?: string): ExtendedDataLookupStruct[Archetype];
/**
 * Constructs the chat message dictionary for the extended item based on the items configuration data.
 * @template {ExtendedItemOption} OptionType
 * @param {ExtendedItemChatData<OptionType>} chatData - The chat data that triggered the message.
 * @param {ExtendedItemData<OptionType>} data - The extended item data for the asset
 * @returns {DictionaryBuilder} - The dictionary for the item based on its required chat tags
 */
declare function ExtendedItemBuildChatMessageDictionary<OptionType extends ExtendedItemOption>(chatData: ExtendedItemChatData<OptionType>, { asset, chatTags, dictionary }: ExtendedItemData<OptionType>): DictionaryBuilder;
/**
 * Return {@link ExtendedItemDialog.chat} if it's a string or call it using chat data based on a fictional extended item option.
 * Generally used for getting a chat prefix for extended item buttons with custom functionality.
 * @param {string} Name - The name of the pseudo-type
 * @param {ExtendedItemData} Data - The extended item data
 * @returns {string} The dialogue prefix for the custom chatroom messages
 */
declare function ExtendedItemCustomChatPrefix(Name: string, Data: ExtendedItemData<any>): string;
/**
 * Register archetypical subscreens for the passed extended item options
 * @param {Asset} asset - The asset whose subscreen is being registered
 * @param {VariableHeightConfig | VibratingItemConfig | TextItemConfig} config - The subscreens extended item config
 * @param {TypedItemOption | ModularItemOption} option - The parent item's extended item option
 * @returns {null | VariableHeightData | VibratingItemData | TextItemData} - The subscreens extended item data or `null` if no archetypical subscreen is present
 */
declare function ExtendedItemRegisterSubscreen(asset: Asset, config: VariableHeightConfig | VibratingItemConfig | TextItemConfig, option: TypedItemOption | ModularItemOption): null | VariableHeightData | VibratingItemData | TextItemData;
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
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @returns {string|undefined} - undefined or an empty string if the option was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
declare function ExtendedItemSetOption<OptionType extends TypedItemOption | ModularItemOption | VibratingItemOption>(data: ModularItemData | TypedItemData | VibratingItemData, C: Character, item: Item, newOption: OptionType, previousOption: OptionType, push?: boolean): string | undefined;
/** A temporary hack for registering extra archetypes for a single screen. */
declare function ExtendedItemManualRegister(): void;
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
