/**
 * Registers a typed extended item. This automatically creates the item's load, draw and click functions. It will also
 * generate the asset's AllowType array.
 * @param {Asset} asset - The asset being registered
 * @param {TextItemConfig} config - The item's typed item configuration
 * @param {null | ExtendedItemOption} parentOption
 * @param {boolean} createCallbacks - Whether the archetype-specific callbacks should be created or not
 * @returns {TextItemData} - The generated extended item data for the asset
 */
declare function TextItemRegister(asset: Asset, config: TextItemConfig, parentOption?: null | ExtendedItemOption, createCallbacks?: boolean): TextItemData;
/**
 * Generates an asset's typed item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {TextItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The parent extended item option of the super screens (if any)
 * @returns {TextItemData} - The generated typed item data for the asset
 */
declare function TextItemCreateTextItemData(asset: Asset, { MaxLength, Font, DialogPrefix, ChatTags, Dictionary, ScriptHooks, BaselineProperty, EventListeners, DrawData, PushOnPublish, }: TextItemConfig, parentOption?: null | ExtendedItemOption): TextItemData;
/**
 * @param {TextItemData} data - The extended item data
 * @param {Item} item - The item in question
 * @returns {{ newOption: TextItemOption, previousOption: TextItemOption }}
 */
declare function TextItemConstructOptions({ textNames }: TextItemData, item: Item): {
    newOption: TextItemOption;
    previousOption: TextItemOption;
};
/**
 * Revert all text item properties back to their previous state prior to opening the extended item menu
 * @param {TextItemData} data - The extended item data
 * @param {Item} item - The item in question
 */
declare function TextItemPropertyRevert({ textNames }: TextItemData, item: Item): void;
/**
 * A lookup for the text item configurations for each registered text item
 * @const
 * @type {Record<string, TextItemData>}
 * @see {@link TextItemData}
 */
declare const TextItemDataLookup: Record<string, TextItemData>;
declare namespace TextItem {
    function Init({ asset, font, baselineProperty, maxLength }: TextItemData, C: Character, item: Item, refresh?: boolean): boolean;
    function Load(data: TextItemData): void;
    function Draw({ asset, drawData, textNames }: TextItemData): void;
    function Click({ functionPrefix, drawData }: TextItemData): void;
    function Exit(data: TextItemData, publishAction?: boolean): void;
    function PublishAction(data: TextItemData, C: Character, item: Item, newOption: TextItemOption, previousOption: TextItemOption): void;
}
/**
 * Throttled callback for handling text changes.
 * @type {TextItemEventListener}
 */
declare const TextItemChange: TextItemEventListener;
/**
 * Throttled callback for handling text changes that do not require a canvas.
 * @type {TextItemEventListener}
 */
declare const TextItemChangeNoCanvas: TextItemEventListener;
