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
 * @returns {string|undefined} - undefined or an empty string if the option was set correctly. Otherwise, returns a string
 * informing the player of the requirements that are not met.
 */
declare function VibratorModeSetOption(data: VibratingItemData, C: Character, item: Item, newOption: VibratingItemOption, previousOption: VibratingItemOption, push?: boolean): string | undefined;
/**
 * Generates an asset's vibrating item data
 * @param {Asset} asset - The asset to generate vibrating item data for
 * @param {VibratingItemConfig} config - The item's extended item configuration
 * @returns {VibratingItemData} - The generated vibrating item data for the asset
 */
declare function VibratorModeCreateData(asset: Asset, { Options, ScriptHooks, BaselineProperty, Dictionary, DialogPrefix }: VibratingItemConfig, parentOption?: any): VibratingItemData;
/**
 * Gather all extended item options for a given list of modes.
 * @param {readonly VibratorModeSet[]} modeSet
 * @returns {VibratingItemOption[]}
 */
declare function VibratorModeGetOptions(modeSet?: readonly VibratorModeSet[]): VibratingItemOption[];
/**
 * Loads the vibrating item's extended item menu.
 * @param {VibratingItemData} data
 */
declare function VibratorModeLoad({ dialogPrefix: { header } }: VibratingItemData): void;
/** @type {ExtendedItemCallbacks.Validate<ExtendedItemOption>} */
declare function VibratorModeValidate(C: Character, item: Item, option: ExtendedItemOption, currentOption: ExtendedItemOption): string;
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
 * Sets the AllowEffect property for a vibrating item
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
declare function VibratorModeSetAllowEffect({ asset, modeSet }: VibratingItemData): void;
/**
 * Sets the Effect property for a vibrating item
 * @param {VibratingItemData} data - The vibrating item data for the asset
 * @returns {void} - Nothing
 */
declare function VibratorModeSetEffect({ asset }: VibratingItemData): void;
/**
 * Generate coordinates for vibrator buttons
 * @param {readonly VibratorModeSet[]} modeSet - The vibrator mode sets for the item
 * @param {number} Y - The y-coordinate at which to start drawing the controls
 * @returns {[X: number, Y: number][]} - The button coordinates
 */
declare function VibratorModeGenerateCoords(modeSet: readonly VibratorModeSet[], Y?: number): [X: number, Y: number][];
/**
 * Common draw function for vibrators
 * @param {VibratingItemData} data
 * @param {number} [Y] - The y-coordinate at which to start drawing the controls
 * @returns {void} - Nothing
 */
declare function VibratorModeDraw(data: VibratingItemData, Y?: number): void;
/**
 * Common click function for vibrators
 * @param {VibratingItemData} data
 * @param {number} [Y] - The y-coordinate at which the extended item controls were drawn
 * @returns {void} - Nothing
 */
declare function VibratorModeClick(data: VibratingItemData, Y?: number): void;
/**
 * Gets a vibrator mode from VibratorModeOptions
 * @param {VibratorMode} ModeName - The name of the mode from VibratorMode, e.g. VibratorMode.OFF
 * @returns {VibratingItemOption} - The option gotten
 */
declare function VibratorModeGetOption(ModeName: VibratorMode): VibratingItemOption;
/**
 * @typedef {{ Mode?: VibratorMode, ChangeTime?: number, LastChange?: number }} VibratorModePersistentData
 */
/**
 * Common dynamic script draw function for vibrators. This function is called every frame. TO make use of dynamic script draw on vibrators,
 * ensure your item has a `Assets<AssetGroup><AssetName>ScriptDraw` function defined that calls this function, and that your asset
 * definition in Female3DCG.js has `DynamicScriptDraw: true` set. See the Heart Piercings for examples.
 * @type {ExtendedItemCallbacks.ScriptDraw<VibratorModePersistentData>}
 */
declare function VibratorModeScriptDraw(Data: DynamicScriptCallbackData<VibratorModePersistentData>): void;
/**
 * Vibrator update function for the Random mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateRandom(Item: Item, C: Character, PersistentData: VibratorModePersistentData): void;
/**
 * Vibrator update function for the Escalate mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateEscalate(Item: Item, C: Character, PersistentData: VibratorModePersistentData): void;
/**
 * Vibrator update function for the Tease mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateTease(Item: Item, C: Character, PersistentData: VibratorModePersistentData): void;
/**
 * Vibrator update function for the Deny mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateDeny(Item: Item, C: Character, PersistentData: VibratorModePersistentData): void;
/**
 * Vibrator update function for the Edge mode
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateEdge(Item: Item, C: Character, PersistentData: VibratorModePersistentData): void;
/**
 * Vibrator update function for vibrator state machine modes
 * @param {Item} Item - The item that is being updated
 * @param {Character} C - The character that the item is equipped on
 * @param {VibratorModePersistentData} PersistentData - Persistent animation data for the item
 * @param {readonly VibratorModeState[]} TransitionsFromDefault - The possible vibrator states that may be transitioned to from
 * the default state
 * @returns {void} - Nothing
 */
declare function VibratorModeUpdateStateBased(Item: Item, C: Character, PersistentData: VibratorModePersistentData, TransitionsFromDefault: readonly VibratorModeState[]): void;
/**
 * Vibrator update function for vibrator state machine modes in the Default state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * @param {readonly VibratorModeState[]} TransitionsFromDefault - The possible vibrator states that may be transitioned to from
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
declare function VibratorModeStateUpdateDefault(C: Character, Arousal: number, TimeSinceLastChange: number, OldIntensity: VibratorIntensity, TransitionsFromDefault: readonly VibratorModeState[]): StateAndIntensity;
/**
 * Vibrator update function for vibrator state machine modes in the Deny state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
declare function VibratorModeStateUpdateDeny(C: Character, Arousal: number, TimeSinceLastChange: number, OldIntensity: VibratorIntensity): StateAndIntensity;
/**
 * Vibrator update function for vibrator state machine modes in the Orgasm state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
declare function VibratorModeStateUpdateOrgasm(C: Character, Arousal: number, TimeSinceLastChange: number, OldIntensity: VibratorIntensity): StateAndIntensity;
/**
 * Vibrator update function for vibrator state machine modes in the Rest state
 * @param {Character} C - The character that the item is equipped on
 * @param {number} Arousal - The current arousal of the character
 * @param {number} TimeSinceLastChange - The time in milliseconds since the vibrator intensity was last changed
 * @param {VibratorIntensity} OldIntensity - The current intensity of the vibrating item
 * the default state
 * @returns {StateAndIntensity} - The updated state and intensity of the vibrator
 */
declare function VibratorModeStateUpdateRest(C: Character, Arousal: number, TimeSinceLastChange: number, OldIntensity: VibratorIntensity): StateAndIntensity;
/**
 * Publishes a chatroom message for an automatic change in vibrator intensity. Does nothing if the vibrator's intensity
 * did not change.
 * @param {Character} C - The character that the vibrator is equipped on
 * @param {Item} Item - The vibrator item
 * @param {number} OldIntensity - The previous intensity of the vibrator
 * @param {number} Intensity - The new intensity of the vibrator
 * @returns {void} - Nothing
 */
declare function VibratorModePublish(C: Character, Item: Item, OldIntensity: number, Intensity: number): void;
/**
 * Initialize the vibrating item properties
 * @param {VibratingItemData} data
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} Refresh - Whether the character and relevant item should be refreshed and pushed to the server
 * @returns {boolean} Whether properties were initialized or not
 */
declare function VibratorModeInit(data: VibratingItemData, C: Character, Item: Item, Refresh?: boolean): boolean;
/**
 * An alias for {@link TypedItemSetOptionByName}.
 * @type {typeof TypedItemSetOptionByName}
 */
declare function VibratorModeSetOptionByName(C: Character, itemOrGroupName: AssetGroupName | Item, optionName: string, push?: boolean): string;
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
 *     Standard: VibratingItemOption[],
 *     Advanced: VibratingItemOption[],
 * }}
 * @constant
 */
declare var VibratorModeOptions: {
    Standard: VibratingItemOption[];
    Advanced: VibratingItemOption[];
};
/**
 * An alias for the vibrators OFF mode. See {@link VibratorModeOptions}.
 */
declare const VibratorModeOff: VibratingItemOption;
/** A list with all advanced vibrator mode-names. */
declare const VibratorModesAdvanced: VibratorMode[];
/**
 * A lookup for the vibrator configurations for each registered vibrator item
 * @const
 * @type {Record<string, VibratingItemData>}
 */
declare const VibratorModeDataLookup: Record<string, VibratingItemData>;
type VibratorModePersistentData = {
    Mode?: VibratorMode;
    ChangeTime?: number;
    LastChange?: number;
};
