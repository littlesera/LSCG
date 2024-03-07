declare function InventoryItemMouthFuturisticPanelGagDrawHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemMouthFuturisticPanelGagClickHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemMouthFuturisticPanelGagSetOptionHook(data: ModularItemData, originalFunction: (C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption, push: boolean, refresh: boolean) => void, C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption, push: boolean, refresh: boolean): void;
/**
 * Send message for an automatic gag inflation.
 * @param {Character} C - The selected character
 * @param {Item} Item - The item in question
 * @param {string} OptionName - The name of the newly choosen option within the `Gag` module
 * @param {boolean} Deflate - Whether the gag is deflated or not
 * @return {void} Nothing
 */
declare function InventoryItemMouthFuturisticPanelGagPublishActionTrigger(C: Character, Item: Item, OptionName: string, Deflate: boolean): void;
/**
 * Helper function for handling automatic gag inflation and deflation.
 * @param {Character} C - The selected character
 * @param {Item} Item - The item in question
 * @param {ModularItemOption} previousOption
 * @param {ModularItemModule} module
 * @param {boolean} Deflate - Whether this function is triggered by an automatic deflation or not
 * @returns {ModularItemOption}
 */
declare function InventoryItemMouthFuturisticPanelGagTriggerGetOptions(C: Character, Item: Item, previousOption: ModularItemOption, module: ModularItemModule, Deflate: boolean): ModularItemOption;
/**
 * Helper function for handling automatic gag inflation and deflation.
 * @param {ModularItemData} data
 * @param {Character} C - The selected character
 * @param {Item} Item - The item in question
 * @param {boolean} Deflate - Whether this function is triggered by an automatic deflation or not
 * @return {void}
 */
declare function InventoryItemMouthFuturisticPanelGagTrigger(data: ModularItemData, C: Character, Item: Item, Deflate: boolean): void;
/**
 * @typedef {{ LastMessageLen?: number, UpdateTime?: number, ChangeTime?: number }} FuturisticPanelGagPersistentData
 */
/**
 * @param {ModularItemData} data
 * @param {DynamicScriptCallbackData<FuturisticPanelGagPersistentData>} drawData
 */
declare function AssetsItemMouthFuturisticPanelGagScriptUpdatePlayer(data: ModularItemData, drawData: DynamicScriptCallbackData<FuturisticPanelGagPersistentData>): void;
declare function AssetsItemMouthFuturisticPanelGagScriptDrawHook(data: ModularItemData, originalFunction: (drawData: DynamicScriptCallbackData<FuturisticPanelGagPersistentData>) => void, drawData: DynamicScriptCallbackData<FuturisticPanelGagPersistentData>): void;
declare function AssetsItemMouthFuturisticPanelGagBeforeDrawHook(data: ModularItemData, originalFunction: (drawData: DynamicDrawingData<FuturisticPanelGagPersistentData>) => DynamicBeforeDrawOverrides, drawData: DynamicDrawingData<FuturisticPanelGagPersistentData>): DynamicBeforeDrawOverrides;
type FuturisticPanelGagPersistentData = {
    LastMessageLen?: number;
    UpdateTime?: number;
    ChangeTime?: number;
};
