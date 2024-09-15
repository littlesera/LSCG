/**
 * Registers an extended item.
 * @param {Asset} asset - The asset being registered
 * @param {NoArchItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The superscreen's option (if applicable)
 * @returns {NoArchItemData} - The generated extended item data for the asset
 */
declare function NoArchItemRegister(asset: Asset, config: NoArchItemConfig, parentOption?: null | ExtendedItemOption): NoArchItemData;
/**
 * Parse the passed text item draw data as passed via the extended item config
 * @param {NoArchConfigDrawData | undefined} drawData - The to-be parsed draw data
 * @return {ExtendedItemDrawData<ElementMetaData.NoArch>} - The parsed draw data
 */
declare function NoArchGetDrawData(drawData: NoArchConfigDrawData | undefined): ExtendedItemDrawData<ElementMetaData.NoArch>;
/**
 * Generates an asset's typed item data
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {NoArchItemConfig} config - The item's extended item configuration
 * @param {null | ExtendedItemOption} parentOption - The parent extended item option of the super screens (if any)
 * @returns {NoArchItemData} - The generated typed item data for the asset
 */
declare function NoArchCreateNoArchItemData(asset: Asset, { DialogPrefix, ChatTags, Dictionary, ScriptHooks, BaselineProperty, DrawData, AllowEffect, Name, }: NoArchItemConfig, parentOption?: null | ExtendedItemOption): NoArchItemData;
/**
 * A lookup for the text item configurations for each registered text item
 * @const
 * @type {Record<string, NoArchItemData>}
 * @see {@link NoArchItemData}
 */
declare const NoArchItemDataLookup: Record<string, NoArchItemData>;
declare namespace NoArch {
    function Init(data: ExtendedItemData<any>, C: Character, item: Item, push?: boolean, refresh?: boolean): boolean;
    function Draw(data: ExtendedItemData<any>): void;
    function Click(data: ExtendedItemData<any>): boolean;
}
