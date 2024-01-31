/**
 * Registers a typed extended item.
 * This automatically creates the item's archetype-specific functions (load, draw, etc.) and asset properties.
 * @param {Asset} asset - The asset being registered
 * @param {TypedItemConfig} config - The item's typed item configuration
 * @returns {TypedItemData} - The generated extended item data for the asset
 */
declare function TypedItemRegister(asset: Asset, config: TypedItemConfig): TypedItemData;
/**
 * Parse and pre-process the passed item options.
 * @param {Asset} asset - The item options asset
 * @param {readonly TypedItemOptionConfig[]} protoOptions - The unparsed extended item options
 * @param {undefined | boolean} changeWhenLocked - See {@link TypedItemConfig.ChangeWhenLocked}
 * @param {string} screenName
 * @returns {TypedItemOption[]} The newly generated extended item options
 */
declare function TypedItemBuildOptions(protoOptions: readonly TypedItemOptionConfig[], asset: Asset, changeWhenLocked: undefined | boolean, screenName: string): TypedItemOption[];
/**
 * Parse the passed typed item draw data as passed via the extended item config
 * @param {Asset} asset - The asset in question
 * @param {ExtendedItemConfigDrawData<Partial<ElementMetaData.Typed>> | undefined} drawData - The to-be parsed draw data
 * @param {readonly { Name: string }[]} options - The list of extended item options
 * @param {Partial<ElementMetaData.Typed>} overrideMetaData
 * @return {ExtendedItemDrawData<ElementMetaData.Typed>} - The parsed draw data
 */
declare function TypedItemGetDrawData(asset: Asset, drawData: ExtendedItemConfigDrawData<Partial<ElementMetaData.Typed>> | undefined, options: readonly {
    Name: string;
}[], overrideMetaData?: Partial<ElementMetaData.Typed>): ExtendedItemDrawData<ElementMetaData.Typed>;
/**
 * Generates an asset's typed item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {TypedItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The parent extended item option of the super screens (if any)
 * @returns {TypedItemData} - The generated typed item data for the asset
 */
declare function TypedItemCreateTypedItemData(asset: Asset, { Options, DialogPrefix, ChatTags, Dictionary, ChatSetting, DrawImages, ChangeWhenLocked, ScriptHooks, DrawData, AllowEffect, BaselineProperty, Name, }: TypedItemConfig, parentOption?: null | ExtendedItemOption): TypedItemData;
/**
 *
 * @param {TypedItemData} data
 * @param {Character} C
 * @param {Item} item
 * @param {TypedItemOption} newOption
 * @param {TypedItemOption} previousOption
 */
declare function TypedItemPublishAction(data: TypedItemData, C: Character, item: Item, newOption: TypedItemOption, previousOption: TypedItemOption): void;
/**
 * Generates an asset's AllowEffect property based on its typed item data.
 * @param {TypedItemData | VibratingItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
declare function TypedItemGenerateAllowEffect({ asset, options, allowEffect }: TypedItemData | VibratingItemData): void;
/**
 * Generates an asset's AllowBlock property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
declare function TypedItemGenerateAllowBlock({ asset, options }: TypedItemData): void;
/**
 * Generates an asset's AllowHide & AllowHideItem properties based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
declare function TypedItemGenerateAllowHide({ asset, options }: TypedItemData): void;
/**
 * Generates an asset's AllowTint property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
declare function TypedItemGenerateAllowTint({ asset, options }: TypedItemData): void;
/**
 * Generates an asset's AllowLockType property based on its typed item data.
 * @param {TypedItemData} data - The typed item's data
 * @returns {void} - Nothing
 */
declare function TypedItemGenerateAllowLockType({ name, asset, options }: TypedItemData): void;
/**
 * Sets the AllowLock and AllowLockType properties on an asset based on an AllowLockType array and the total number of
 * possible types.
 * @param {Mutable<Asset>} asset - The asset to set properties on
 * @param {Record<string, Set<number>>} allowLockType - The AllowLockType record indicating which of the asset's types permit locks
 * @param {boolean} allowAll
 * @returns {void} - Nothing
 */
declare function TypedItemSetAllowLockType(asset: Mutable<Asset>, allowLockType: Record<string, Set<number>>, allowAll?: boolean): void;
/**
 * Returns the options configuration array for a typed item
 * @param {AssetGroupName} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @returns {TypedItemOption[]|null} - The options array for the item, or null if no typed item data was found
 */
declare function TypedItemGetOptions(groupName: AssetGroupName, assetName: string): TypedItemOption[] | null;
/**
 * Returns a list of typed item option names available for the given asset, or an empty array if the asset is not typed
 * @param {AssetGroupName} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @returns {string[]} - The option names available for the asset, or an empty array if the asset is not typed or no
 * typed item data was found
 */
declare function TypedItemGetOptionNames(groupName: AssetGroupName, assetName: string): string[];
/**
 * Returns the named option configuration object for a typed item
 * @param {AssetGroupName} groupName - The name of the asset group
 * @param {string} assetName - The name of the asset
 * @param {string} optionName - The name of the option
 * @returns {TypedItemOption|null} - The named option configuration object, or null if none was found
 */
declare function TypedItemGetOption(groupName: AssetGroupName, assetName: string, optionName: string): TypedItemOption | null;
/**
 * Validates a selected option. A typed item may provide a custom validation function. Returning a non-empty string from
 * the validation function indicates that the new option is not compatible with the character's current state (generally
 * due to prerequisites or other requirements).
 * @template {ExtendedItemOption} T
 * @param {null | ExtendedItemData<T>} data
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose options are being validated
 * @param {T} option - The new option
 * @param {T} previousOption - The previously applied option
 * @param {boolean} [permitExisting] - Determines whether the validation should allow the new option and previous option
 * to be identical. Defaults to false.
 * @returns {string|undefined} - undefined or an empty string if the validation passes. Otherwise, returns a string
 * message informing the player of the requirements that are not met.
 */
declare function TypedItemValidateOption<T extends ExtendedItemOption>(data: ExtendedItemData<T>, C: Character, item: Item, option: T, previousOption: T, permitExisting?: boolean): string | undefined;
/**
 * Sets a typed item's type and properties to the option whose name matches the provided option name parameter.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item | AssetGroupName} itemOrGroupName - The item whose type to set, or the group name for the item
 * @param {string} optionName - The name of the option to set
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @param {null | Character} [C_Source] - The character setting the new item option. If `null`, assume that it is _not_ the player character.
 * @param refresh Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {string|undefined} - undefined or an empty string if the type was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
declare function TypedItemSetOptionByName(C: Character, itemOrGroupName: Item | AssetGroupName, optionName: string, push?: boolean, C_Source?: null | Character, refresh?: boolean): string | undefined;
/**
 * Finds the currently set option on the given typed item
 * @template {TypedItemOption | VibratingItemOption} T
 * @param {ExtendedItemData<T> & { options: T[] }} data
 * @param {Item} item - The equipped item
 * @returns {T} - The option which is currently applied to the item, or the first item in the options
 * array if no type is set.
 */
declare function TypedItemFindPreviousOption<T extends TypedItemOption | VibratingItemOption>({ name, options }: ExtendedItemData<T> & {
    options: T[];
}, item: Item): T;
/**
 * Sets a typed item's type to a random option, respecting prerequisites and option validation.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item | AssetGroupName} itemOrGroupName - The item whose type to set, or the group name for the item
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 * @param {null | Character} [C_Source] - The character setting the new item option. If `null`, assume that it is _not_ the player character.
 * @returns {string|undefined} - undefined or an empty string if the type was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
declare function TypedItemSetRandomOption(C: Character, itemOrGroupName: Item | AssetGroupName, push?: boolean, C_Source?: null | Character): string | undefined;
/**
 * Initialize the typed item properties
 * @param {TypedItemData | VibratingItemData} Data - The item's extended item data
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} Push - Whether to push to changes to the server
 * @param {boolean} Refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @param {"Type" | "Mode"} field
 * @returns {boolean} Whether properties were initialized or not
 */
declare function TypedItemInit({ options, name, baselineProperty, asset }: TypedItemData | VibratingItemData, C: Character, Item: Item, Push?: boolean, Refresh?: boolean, field?: "Type" | "Mode"): boolean;
/**
 * Draws the extended item type selection screen
 * @param {TypedItemData | VibratingItemData} data - An Array of type definitions for each allowed extended type. The first item
 *     in the array should be the default option.
 * @returns {void} Nothing
 */
declare function TypedItemDraw(data: TypedItemData | VibratingItemData): void;
/**
 * Handles clicks on the extended item type selection screen
 * @param {TypedItemData | VibratingItemData} data
 * @returns {void} Nothing
 */
declare function TypedItemClick(data: TypedItemData | VibratingItemData): void;
/**
 * Handler function called when an option on the type selection screen is clicked
 * @template {TypedItemOption | VibratingItemOption} T
 * @param {ExtendedItemData<T> & { options: T[] }} data
 * @param {Character} C - The character wearing the item
 * @param {T} Option - The selected type definition
 * @returns {void} Nothing
 */
declare function TypedItemHandleOptionClick<T extends TypedItemOption | VibratingItemOption>(data: ExtendedItemData<T> & {
    options: T[];
}, C: Character, Option: T): void;
/**
 * Handler function for setting the type of an typed item
 * @template {TypedItemOption | VibratingItemOption} T
 * @param {ExtendedItemData<T> & { options: T[] }} data
 * @param {Character} C - The character wearing the item
 * @param {T} newOption - The selected type definition
 * @returns {void} Nothing
 */
declare function TypedItemSetType<T extends TypedItemOption | VibratingItemOption>(data: ExtendedItemData<T> & {
    options: T[];
}, C: Character, newOption: T): void;
/**
 * TypedItem.js
 * ------------
 * This file contains utilities related to typed extended items (items that allow switching between a selection of
 * different states). It is generally not necessary to call functions in this file directly - these are called from
 * Asset.js when an item is first registered.
 *
 * All dialogue for typed items should be added to `Dialog_Player.csv`. To implement a typed item, you need the
 * following dialogue entries (these dialogue keys can also be configured through the item's configuration if custom
 * dialogue keys are needed):
 *  * "<GroupName><AssetName>Select" - This is the text that will be displayed at the top of the extended item screen
 *    (usually a prompt for the player to select a type)
 *  * For each type:
 *    * "<GroupName><AssetName><TypeName>" - This is the display name for the given type
 *  * If the item's chat setting is configured to `TO_ONLY`, you will need a chatroom message for each type, which will
 *    be sent when that type is selected. It should have the format "<GroupName><AssetName>Set<TypeName>" (e.g.
 *    "ItemArmsLatexBoxtieLeotardSetPolished" - "SourceCharacter polishes the latex of DestinationCharacter leotard
 *    until it's shiny")
 *  * If the item's chat setting is configured to `FROM_TO`, you will need a chatroom message for each possible type
 *    pairing, which will be sent when the item's type changes from the first type to the second type. It should have
 *    the format "<GroupName><AssetName>Set<Type1>To<Type2>".
 */
/**
 * A lookup for the typed item configurations for each registered typed item
 * @const
 * @type {Record<string, TypedItemData>}
 * @see {@link TypedItemData}
 */
declare const TypedItemDataLookup: Record<string, TypedItemData>;
/**
 * An enum encapsulating the possible chatroom message settings for typed items
 * - TO_ONLY - The item has one chatroom message per type (indicating that the type has been selected)
 * - FROM_TO - The item has a chatroom message for from/to type pairing
 * - SILENT - The item doesn't publish an action when a type is selected.
 * @type {Record<"TO_ONLY"|"FROM_TO"|"SILENT", TypedItemChatSetting>}
 */
declare const TypedItemChatSetting: Record<"TO_ONLY" | "FROM_TO" | "SILENT", TypedItemChatSetting>;
