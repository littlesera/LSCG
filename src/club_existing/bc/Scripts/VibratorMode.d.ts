/**
 * Registers a vibrator item. This automatically creates the item's load, draw, click and scriptDraw functions.
 * @param {Asset} asset - The asset being registered
 * @param {VibratingItemConfig} config - The item's vibrator item configuration
 * @param {null | ExtendedItemOption} parentOption - The extended item option of the super screen that this archetype was initialized from (if any)
 * @returns {VibratingItemData} - The generated extended item data for the asset
 */
declare function VibratorModeRegister(asset: Asset, config: VibratingItemConfig, parentOption?: null | ExtendedItemOption): VibratingItemData;
/**
 * Sets an extended item's type and properties to the option provided.
 * @param {VibratingItemData} data - The extended item data
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose type to set
 * @param {VibratingItemOption} newOption - The to-be applied extended item option
 * @param {VibratingItemOption} previousOption - The previously applied extended item option
 * @param {boolean} [push] - Whether or not appearance updates should be persisted (only applies if the character is the
 * player) - defaults to false.
 */
declare function VibratorModeSetOption(data: VibratingItemData, C: Character, item: Item, newOption: VibratingItemOption, previousOption: VibratingItemOption, push?: boolean): void;
/**
 * Parse the passed typed item draw data as passed via the extended item config
 * @param {readonly VibratorModeSet[]} modeSet - The vibrator mode sets for the item
 * @param {ExtendedItemConfigDrawData<{ drawImage?: false }> | undefined} drawData - The to-be parsed draw data
 * @param {number} y - The y-coordinate at which to start drawing the controls
 * @return {ExtendedItemDrawData<ElementMetaData.Vibrating>} - The parsed draw data
 */
declare function VibratorModeGetDrawData(modeSet: readonly VibratorModeSet[], drawData: ExtendedItemConfigDrawData<{
    drawImage?: false;
}> | undefined, y?: number): ExtendedItemDrawData<ElementMetaData.Vibrating>;
/**
 * Generates an asset's vibrating item data
 * @param {Asset} asset - The asset to generate vibrating item data for
 * @param {VibratingItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The parent extended item option of the super screens (if any)
 * @returns {VibratingItemData} - The generated vibrating item data for the asset
 */
declare function VibratorModeCreateData(asset: Asset, { Options, ScriptHooks, BaselineProperty, Dictionary, DialogPrefix, DrawData, ChatTags, AllowEffect, Name, }: VibratingItemConfig, parentOption?: null | ExtendedItemOption): VibratingItemData;
declare function VibratorModeDialogPrefix(data: VibratingItemData, C: Character, item: Item): string;
/**
 * Construct all extended item options for a given list of modes.
 * @param {VibratingItemData} data - The extended item data
 * @param {readonly VibratorModeSet[]} modeSet - The vibrator mods
 * @returns {VibratingItemOption[]} - The generated vibrating item options
 */
declare function VibratorModeGetOptions(data: VibratingItemData, modeSet: readonly VibratorModeSet[]): VibratingItemOption[];
/**
 * @param {VibratingItemData} data
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose options are being validated
 * @param {VibratingItemOption} newOption - The new option
 * @param {VibratingItemOption} previousOption - The previously applied option
 * @param {boolean} permitExisting - Determines whether the validation should allow the new option and previous option
 * to be identical. Defaults to `false`.
 * @returns {string|undefined} - undefined or an empty string if the validation passes. Otherwise, returns a string
 * message informing the player of the requirements that are not met.
 */
declare function VibratorModeValidate(data: VibratingItemData, C: Character, item: Item, newOption: VibratingItemOption, previousOption: VibratingItemOption, permitExisting?: boolean): string | undefined;
/**
 * Publish a vibrator action and exit the dialog of applicable
 * @param {VibratingItemData} data
 * @param {Character} C - The character wearing the item
 * @param {Item} item - The item in question
 * @param {VibratingItemOption} newOption - The newly selected option
 * @param {VibratingItemOption} previousOption - The currently selected option
 */
declare function VibratorModePublishAction(data: VibratingItemData, C: Character, item: Item, newOption: VibratingItemOption, previousOption: VibratingItemOption): void;
/**
 * Sets asset properties common to all vibrating items
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
declare function VibratorModeSetAssetProperties(data: VibratingItemData): void;
/**
 * @typedef {{ Mode?: VibratorMode, ChangeTime?: number, LastChange?: number }} VibratorModePersistentData
 */
/**
 * Common dynamic script draw function for vibrators. This function is called every frame. TO make use of dynamic script draw on vibrators,
 * ensure your item has a `Assets<AssetGroup><AssetName>ScriptDraw` function defined that calls this function, and that your asset
 * definition in Female3DCG.js has `DynamicScriptDraw: true` set. See the Heart Piercings for examples.
 * @param {VibratingItemData} data
 * @param {DynamicScriptCallbackData<VibratorModePersistentData>} drawData
 */
declare function VibratorModeScriptDraw(data: VibratingItemData, drawData: DynamicScriptCallbackData<VibratorModePersistentData>): void;
/**
 * Vibrator update function for vibrator state machine modes
 * @param {VibratingItemData} data - The vibrating item data
 * @param {Character} C - The character that the item is equipped on
 * @param {Item} item - The item that is being updated
 * @param {VibratorModePersistentData} persistentData - Persistent animation data for the item
 * @param {readonly VibratorModeState[]} transitionsFromDefault - The possible vibrator states that may be transitioned to from
 * the default state
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateStateBased(data: VibratingItemData, C: Character, item: Item, persistentData: VibratorModePersistentData, transitionsFromDefault: readonly VibratorModeState[]): void;
/**
 * Publishes a chatroom message for an automatic change in vibrator intensity. Does nothing if the vibrator's intensity
 * did not change.
 * @param {VibratingItemData} data
 * @param {Character} C - The character that the vibrator is equipped on
 * @param {Item} item - The vibrator item
 * @param {number} oldIntensity - The previous intensity of the vibrator
 * @param {number} newIntensity - The new intensity of the vibrator
 * @returns {void} - Nothing
 */
declare function VibratorModePublish(data: VibratingItemData, C: Character, item: Item, oldIntensity: number, newIntensity: number): void;
/**
 * Initialize the vibrating item properties
 * @param {VibratingItemData} data
 * @param {Item} item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} push - Whether to push to changes to the server
 * @param {boolean} refresh - Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
 * @returns {boolean} Whether properties were initialized or not
 */
declare function VibratorModeInit(data: VibratingItemData, C: Character, item: Item, push?: boolean, refresh?: boolean): boolean;
declare function VibratorModeSetOptionByName(C: Character, itemOrGroupName: AssetGroupName | Item, optionName: string, push?: boolean, C_Source?: Character, refresh?: boolean): string;
/**
 * Return the (standard) vibrator mode one would get by incrementing/decrementing the passed mode.
 * @param {VibratorMode} mode - The current vibrator mode
 * @param {boolean} decrement - Whether the mode should be decremented rather than incremented
 * @returns {VibratorMode} The new vibrator mode
 */
declare function VibratorModeIntensityIncrement(mode: VibratorMode, decrement?: boolean): VibratorMode;
/**
 * An enum for the possible vibrator modes
 * @readonly
 * @type {{OFF: "Off", LOW: "Low", MEDIUM: "Medium", HIGH: "High", MAXIMUM: "Maximum", RANDOM: "Random", ESCALATE: "Escalate", TEASE: "Tease", DENY: "Deny", EDGE: "Edge"}}
 */
declare var VibratorMode: {
    OFF: "Off";
    LOW: "Low";
    MEDIUM: "Medium";
    HIGH: "High";
    MAXIMUM: "Maximum";
    RANDOM: "Random";
    ESCALATE: "Escalate";
    TEASE: "Tease";
    DENY: "Deny";
    EDGE: "Edge";
};
/**
 * An enum for the possible vibrator states when a vibrator is in a state machine mode
 * @type {{DEFAULT: "Default", DENY: "Deny", ORGASM: "Orgasm", REST: "Rest"}}
 */
declare var VibratorModeState: {
    DEFAULT: "Default";
    DENY: "Deny";
    ORGASM: "Orgasm";
    REST: "Rest";
};
/**
 * An enum for the vibrator configuration sets that a vibrator can have
 * @type {{STANDARD: "Standard", ADVANCED: "Advanced"}}
 */
declare var VibratorModeSet: {
    STANDARD: "Standard";
    ADVANCED: "Advanced";
};
/**
 * A record of the various available vibrator sets of vibrator modes
 * @type {{
 *     Standard: VibratingItemOptionConfig[],
 *     Advanced: VibratingItemOptionConfig[],
 * }}
 * @constant
 */
declare var VibratorModeOptions: {
    Standard: VibratingItemOptionConfig[];
    Advanced: VibratingItemOptionConfig[];
};
/**
 * An alias for the vibrators OFF mode. See {@link VibratorModeOptions}.
 */
declare const VibratorModeOff: VibratingItemOptionConfig;
/** A list with all advanced vibrator mode-names. */
declare const VibratorModesAdvanced: VibratorMode[];
/**
 * A lookup for the vibrator configurations for each registered vibrator item
 * @const
 * @type {Record<string, VibratingItemData>}
 */
declare const VibratorModeDataLookup: Record<string, VibratingItemData>;
/**
 * Namespace with helper functions for {@link VibratorModeScriptDraw}
 * @type {Partial<Record<VibratorMode, (data: VibratingItemData, C: Character, item: Item, persistentData: VibratorModePersistentData) => void>>}
 * @namespace
 */
declare const VibratorModeUpdate: Partial<Record<VibratorMode, (data: VibratingItemData, C: Character, item: Item, persistentData: VibratorModePersistentData) => void>>;
declare namespace VibratorModeStateUpdate {
    function Default(C: Character, arousal: number, timeSinceLastChange: number, oldIntensity: VibratorIntensity, transitionsFromDefault: readonly VibratorModeState[]): StateAndIntensity;
    function Deny(C: Character, arousal: number, timeSinceLastChange: number, oldIntensity: VibratorIntensity): StateAndIntensity;
    function Orgasm(C: Character, arousal: number, timeSinceLastChange: number, oldIntensity: VibratorIntensity): StateAndIntensity;
    function Rest(C: Character, arousal: number, timeSinceLastChange: number, oldIntensity: VibratorIntensity): StateAndIntensity;
}
type VibratorModePersistentData = {
    Mode?: VibratorMode;
    ChangeTime?: number;
    LastChange?: number;
};
