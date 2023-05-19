/**
 * Registers a variable height extended item. This automatically creates the item's load, draw and click functions.
 * @param {Asset} asset - The asset being registered
 * @param {VariableHeightConfig} config - The variable height configuration
 * @param {null | ExtendedItemOption} parentOption - The extended item option of the super screen that this archetype was initialized from (if any)
 * @returns {VariableHeightData} - The generated extended item data for the asset
 */
declare function VariableHeightRegister(asset: Asset, config: VariableHeightConfig, parentOption?: null | ExtendedItemOption): VariableHeightData;
/**
 * Generates an asset's variable height data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {VariableHeightConfig} config - The variable height configuration
 * @param {null | ExtendedItemOption} parentOption
 * @returns {VariableHeightData} - The generated variable height data for the asset
 */
declare function VariableHeightCreateData(asset: Asset, { MaxHeight, MinHeight, Slider, DialogPrefix, ChatTags, Dictionary, GetHeightFunction, SetHeightFunction, ScriptHooks, BaselineProperty }: VariableHeightConfig, parentOption?: null | ExtendedItemOption): VariableHeightData;
/**
 * @param {VariableHeightData} data - The variable height data for the asset
 */
declare function VariableHeightLoad({ maxHeight, minHeight, slider, getHeight, setHeight, dialogPrefix }: VariableHeightData): void;
/**
 * @param {VariableHeightData} data - The variable height data for the asset
 * @returns {void} - Nothing
 */
declare function VariableHeightDraw({ slider, drawImages, dialogPrefix }: VariableHeightData): void;
/**
 * @param {VariableHeightData} data - The variable height data for the asset
 * @returns {void} - Nothing
 */
declare function VariableHeightClick(data: VariableHeightData): void;
/**
 * Exit handler for the item's extended item screen. Updates the character and removes UI components.
 * @returns {void} - Nothing
 */
declare function VariableHeightExit(): void;
/**
 * Publishes a custom action to the chat for the height change
 * @param {VariableHeightData} data
 * @param {Character} C
 * @param {Item} item
 * @param {VariableHeightOption} newOption
 * @param {VariableHeightOption} previousOption
 */
declare function VariableHeightPublishAction(data: VariableHeightData, C: Character, item: Item, newOption: VariableHeightOption, previousOption: VariableHeightOption): void;
/**
 * Retrieve the current height position override if set, accounting for inversion
 * @param {ItemProperties} property - Property of the item determining the variable height
 * @returns {number | null} - The height value between 0 and 1, null if missing or invalid
 */
declare function VariableHeightGetOverrideHeight(property: ItemProperties): number | null;
/**
 * Reposition the character vertically when upside-down, accounting for height ratio and inversion
 * @param {ItemProperties} property - Property of the item determining the variable height
 * @param {number} height - The 0 to 1 height setting to use
 * @param {number} maxHeight - The maximum number of the item's height range
 * @param {number} minHeight - The minimum number of the item's height range
 * @returns {void} - Nothing
 */
declare function VariableHeightSetOverrideHeight(property: ItemProperties, height: number, maxHeight: number, minHeight: number): void;
/**
 * Initialize the variable height item properties
 * @param {VariableHeightData} Data
 * @param {Item} Item - The item in question
 * @param {Character} C - The character that has the item equiped
 * @param {boolean} Refresh -  Whether the character and relevant item should be refreshed and pushed to the server
 * @returns {boolean} Whether properties were initialized or not
 */
declare function VariableHeightInit(Data: VariableHeightData, C: Character, Item: Item, Refresh: boolean): boolean;
/**
 * Dynamically construct the next and previous extended item option for the passed item
 * @param {Item} item - The item in question
 * @returns {{ newOption: VariableHeightOption, previousOption: VariableHeightOption }}
 */
declare function VariableHeightConstructOptions(item: Item): {
    newOption: VariableHeightOption;
    previousOption: VariableHeightOption;
};
/**
 * Revert all item properties back to their previous state prior to opening the extended item menu
 * @param {Character} C - The character in question
 * @param {Item} item - The item in question
 */
declare function VariableHeightPropertyRevert(C: Character, item: Item): void;
/**
 * The name of vertical slider element
 * @const {string}
 */
declare const VariableHeightSliderId: "VariableHeightSlider";
/**
 * The name of the numerical percentage input element
 * @const {string}
 */
declare const VariableHeightNumerId: "VariableHeightNumber";
/**
 * A lookup for the variable height configurations for each registered variable height item
 * @const
 * @type {Record<string, VariableHeightData>}
 */
declare const VariableHeightDataLookup: Record<string, VariableHeightData>;
declare function VariableHeightChange(height: any, maxHeight: any, minHeight: any, setHeight: any, fromElementId: any): void;
