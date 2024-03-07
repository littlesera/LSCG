/**
 * Registers a modular extended item. This automatically creates the item's load, draw and click functions.
 * @param {Asset} asset - The asset being registered
 * @param {ModularItemConfig} config - The item's modular item configuration
 * @returns {ModularItemData} - The generated extended item data for the asset
 */
declare function ModularItemRegister(asset: Asset, config: ModularItemConfig): ModularItemData;
/**
 * Initialize the modular item properties
 * @param {ModularItemData} Data - The item's extended item data
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} Push - Whether to push to changes to the server
 * @param {boolean} Refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {boolean} Whether properties were initialized or not
 */
declare function ModularItemInit(Data: ModularItemData, C: Character, Item: Item, Push?: boolean, Refresh?: boolean): boolean;
/**
 * @param {ModularItemData} data
 */
declare function ModularItemLoad(data: ModularItemData): void;
/**
 * @param {ModularItemData} data
 */
declare function ModularItemClick(data: ModularItemData): void;
/**
 * @param {ModularItemData} data
 */
declare function ModularItemDraw(data: ModularItemData): void;
/**
 * Parse the and pre-process the passed modules (and their options)
 * @param {Asset} asset - The asset in question
 * @param {readonly ModularItemModuleConfig[]} modules - An object describing a single module for a modular item.
 * @param {boolean | undefined} [changeWhenLocked] - See {@link ModularItemConfig.ChangeWhenLocked}
 * @returns {ModularItemModule[]} - The updated modules and options
 */
declare function ModularItemBuildModules(asset: Asset, modules: readonly ModularItemModuleConfig[], changeWhenLocked?: boolean | undefined): ModularItemModule[];
/**
 * Generates an asset's modular item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {ModularItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The parent extended item option of the super screens (if any)
 * @returns {ModularItemData} - The generated modular item data for the asset
 */
declare function ModularItemCreateModularData(asset: Asset, { Modules, ChatSetting, ChatTags, ChangeWhenLocked, DialogPrefix, ScriptHooks, Dictionary, DrawData, BaselineProperty, AllowEffect, DrawImages, Name, }: ModularItemConfig, parentOption?: null | ExtendedItemOption): ModularItemData;
/**
 * Creates a modular item's base draw function (for the module selection screen)
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {() => void} - The modular item's base draw function
 */
declare function ModularItemCreateDrawBaseFunction(data: ModularItemData): () => void;
/**
 * Maps a modular item option to a button definition for rendering the option's button.
 * @param {ModularItemOption} option - The option to draw a button for
 * @param {ModularItemModule} module - A reference to the option's parent module
 * @param {ModularItemData} data - The modular item's data
 * @param {number} currentOptionIndex - The currently selected option index for the module
 * @returns {ModularItemButtonDefinition} - A button definition array representing the provided option
 */
declare function ModularItemMapOptionToButtonDefinition(option: ModularItemOption, module: ModularItemModule, { dialogPrefix }: ModularItemData, currentOptionIndex: number): ModularItemButtonDefinition;
/**
 * Draws a module screen from the provided button definitions and modular item data.
 * @param {string} moduleName - The name of the module whose page is being drawn
 * @param {readonly ModularItemButtonDefinition[]} buttonDefinitions - A list of button definitions to draw
 * @param {ModularItemData} data - The modular item's data
 * @param {ExtendedItemDrawData<ElementMetaData.Modular>} drawData
 * @returns {void} - Nothing
 */
declare function ModularItemDrawCommon(moduleName: string, buttonDefinitions: readonly ModularItemButtonDefinition[], data: ModularItemData, { paginate, pageCount, elementData, itemsPerPage }: ExtendedItemDrawData<ElementMetaData.Modular>): void;
/**
 * Draws the extended item screen for a given module.
 * @param {ModularItemModule} module - The module whose screen to draw
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemDrawModule(module: ModularItemModule, data: ModularItemData): void;
/**
 * Generates a click function for a modular item's module selection screen
 * @param {ModularItemData} data - The modular item's data
 * @returns {function(): void} - A click handler for the modular item's module selection screen
 */
declare function ModularItemCreateClickBaseFunction(data: ModularItemData): () => void;
/**
 * A generic click handler for a module's screen
 * @param {ModularItemModule} module - The module whose screen we are currently in
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemClickModule(module: ModularItemModule, data: ModularItemData): void;
/**
 * A common click handler for modular item screens. Note that pagination is not currently handled, but will be added
 * in the future.
 * @param {ModularItemData} data
 * @param {ExtendedItemDrawData<ElementMetaData.Modular>} drawData
 * @param {function(): void} exitCallback - A callback to be called when the exit button has been clicked
 * @param {function(number): void} itemCallback - A callback to be called when an item has been clicked
 * @param {function(number): void} paginateCallback - A callback to be called when a pagination button has been clicked
 * @returns {void} - Nothing
 */
declare function ModularItemClickCommon(data: ModularItemData, { paginate, elementData }: ExtendedItemDrawData<ElementMetaData.Modular>, exitCallback: () => void, itemCallback: (arg0: number) => void, paginateCallback: (arg0: number) => void): void;
/**
 * Handles page changing for modules
 * @param {string} moduleName - The name of the module whose page should be modified
 * @param {number} delta - The page delta to apply to the module's current page
 * @param {ModularItemData} data - The modular item's data
 * @param {ExtendedItemDrawData<ElementMetaData.Modular>} drawData
 * @returns {void} - Nothing
 */
declare function ModularItemChangePage(moduleName: string, delta: number, data: ModularItemData, { pageCount }: ExtendedItemDrawData<ElementMetaData.Modular>): void;
/**
 * Transitions between pages within a modular item's extended item menu
 * @param {string} newModule - The name of the new module to transition to
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemModuleTransition(newModule: string, data: ModularItemData): void;
/**
 * Parses the focus item's current type into an array representing the currently selected module options
 * @param {ModularItemData} data - The modular item's data
 * @param {null | TypeRecord} typeRecord - The type string for a modular item. If null, use a type string extracted from the selected module options
 * @returns {number[]} - An array of numbers representing the currently selected options for each of the item's modules
 */
declare function ModularItemParseCurrent({ asset, modules }: ModularItemData, typeRecord: null | TypeRecord): number[];
/**
 * Merges all of the selected module options for a modular item into a single Property object to set on the item
 * @param {ModularItemData} data - The modular item's data
 * @param {readonly number[]} moduleValues - The numeric values representing the current options for each module
 * @param {ItemProperties|null} BaselineProperty - Initial properties
 * @returns {ItemProperties} - A property object created from combining each module of the modular item
 */
declare function ModularItemMergeModuleValues({ asset, modules }: ModularItemData, moduleValues: readonly number[], BaselineProperty?: ItemProperties | null): ItemProperties;
/**
 * Sanitize and merge all modular item properties
 * @param {ItemProperties} Property - The to-be sanitized properties
 * @param {ItemProperties} mergedProperty - The to-be returned object with the newly sanitized properties
 * @param {Asset} Asset - The relevant asset
 * @returns {ItemProperties} - The updated merged properties
 */
declare function ModularItemSanitizeProperties(Property: ItemProperties, mergedProperty: ItemProperties, Asset: Asset): ItemProperties;
/**
 * Generates the type string for a modular item from its modules and their current values.
 * @param {AssetOverrideHeight} currentValue - The OverrideHeight for the future item
 * @param {AssetOverrideHeight} newValue - The OverrideHeight being merged
 * @returns {AssetOverrideHeight | undefined} - A string type generated from the selected option values for each module
 */
declare function ModularItemMergeOverrideHeight(currentValue: AssetOverrideHeight, newValue: AssetOverrideHeight): AssetOverrideHeight | undefined;
/**
 * Sets a modular item's type based on a change in a module's option selection.
 * @param {ModularItemModule} module - The module that changed
 * @param {number} index - The index of the newly chosen option within the module
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemSetType(module: ModularItemModule, index: number, data: ModularItemData): void;
/**
 * Publishes the chatroom message for a modular item when one of its modules has changed.
 * @param {ModularItemData} data
 * @param {Character} C
 * @param {Item} item
 * @param {ModularItemOption} newOption
 * @param {ModularItemOption} previousOption
 * @returns {void} - Nothing
 */
declare function ModularItemPublishAction(data: ModularItemData, C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption): void;
/**
 * Generates and sets the AllowLock and AllowLockType properties for an asset based on its modular item data. For types
 * where two independent options declare conflicting AllowLock properties (i.e. one option declares AllowLock: false and
 * another declares AllowLock: true), the resulting type will permit locking (i.e. true overrides false).
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemGenerateAllowLockType({ asset, modules }: ModularItemData): void;
/**
 * Generates and assigns a modular asset's AllowType, AllowEffect and AllowBlock properties, along with the AllowTypes
 * properties on the asset layers based on the values set in its module definitions.
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
declare function ModularItemGenerateValidationProperties(data: ModularItemData): void;
/**
 * Hide an HTML element if a given module is not active.
 * @param {ModularItemData} Data - The modular item data
 * @param {string} ID - The id of the element
 * @param {string} Module - The module that must be active
 * @returns {boolean} Whether the module is active or not
 */
declare function ModularItemHideElement(Data: ModularItemData, ID: string, Module: string): boolean;
/**
 * ModularItem.js
 * --------------
 * This file contains utilities related to modular extended items (for example the High Security Straitjacket). It is
 * generally not necessary to call functions in this file directly - these are called from Asset.js when an item is
 * first registered.
 *
 * A modular item is a typed item, but each type may be comprised of several independent "modules". For example, the
 * High Security Straitjacket has 3 different modules: crotch panel (c), arms (a), and crotch straps (s), and each
 * module can be configured independently. The resulting type then uses an abbreviated format which represents the
 * module values comprising that type. Each module contains a number of options that may be chosen for that module.
 *
 * For example "c0a1s2" - represents the type where the crotch panel module uses option 0, the arms module uses option
 * 1, and the crotch straps module uses option 2. The properties of the type will be derived from a combination of the
 * properties of each of the type's module options. For example, difficulty will be calculated by summing up the
 * difficulties for each of its module options.
 *
 * All dialogue for modular items should be added to `Dialog_Player.csv`. To implement a modular item, you need the
 * following dialogue entries:
 * * "<GroupName><AssetName>SelectBase" - This is the text that will be displayed on the module selection screen (e.g.
 *   `ItemArmsHighSecurityStraitJacketSelectBase` - "Configure Straitjacket")
 * * For each module:
 *   * "<GroupName><AssetName>Select<ModuleName>" - This is the text that will be displayed on the module's subscreen
 *     (e.g. `ItemArmsHighSecurityStraitJacketSelectCrotch` - "Configure crotch panel")
 *   * "<GroupName><AssetName>Module<ModuleName>" - This is the text that will be used to describe the module (under
 *     the module's button) in the module selection screen (e.g. `ItemArmsHighSecurityStraitJacketModuleCrotch` -
 *     "Crotch Panel")
 * * For each option:
 *   * "<GroupName><AssetName>Option<ModuleKey><OptionNumber>" - This is the text that will be used to describe the
 *     option (under the option's button) in the module subscreen for the module containing that option (e.g.
 *     `ItemArmsHighSecurityStraitJacketOptionc0` - "No crotch panel")
 * * If the item's chat setting is configured to `PER_MODULE`, you will need a chatroom message for each module,
 *   which will be sent when that module changes. It should have the format "<GroupName><AssetName>Set<ModuleName>"
 *   (e.g. `ItemArmsHighSecurityStraitJacketSetCrotch` - "SourceCharacter changed the crotch panel on
 *   DestinationCharacter straitjacket")
 * * If the item's chat setting is configured to `PER_OPTION`, you will need a chatroom message for each option, which
 *   will be sent when that option is selected. It should have the format
 *   "<GroupName><AssetName>Set<ModuleKey><OptionNumber>" (e.g. `ItemArmsHighSecurityStraitJacketSetc0` -
 *   "SourceCharacter removes the crotch panel from DestinationCharacter straitjacket")
 */
/**
 * The keyword used for the base menu on modular items
 * @const {string}
 */
declare const ModularItemBase: "Base";
/**
 * A lookup for the modular item configurations for each registered modular item
 * @const
 * @type {Record<string, ModularItemData>}
 * @see {@link ModularItemData}
 */
declare const ModularItemDataLookup: Record<string, ModularItemData>;
/**
 * An enum encapsulating the possible chatroom message settings for modular items
 * - PER_MODULE - The item has one chatroom message per module (messages for individual options within a module are all
 * the same)
 * - PER_OPTION - The item has one chatroom message per option (for finer granularity - each individual option within a
 * module can have its own chatroom message)
 * @type {Record<"PER_MODULE"|"PER_OPTION", ModularItemChatSetting>}
 */
declare const ModularItemChatSetting: Record<"PER_MODULE" | "PER_OPTION", ModularItemChatSetting>;
