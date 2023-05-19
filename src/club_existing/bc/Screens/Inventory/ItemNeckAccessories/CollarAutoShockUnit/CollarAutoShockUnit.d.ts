/** @type {ExtendedItemScriptHookCallbacks.Draw<ModularItemData>} */
declare function InventoryItemNeckAccessoriesCollarAutoShockUnitDraw(Data: ModularItemData, OriginalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Click<ModularItemData>} */
declare function InventoryItemNeckAccessoriesCollarAutoShockUnitClick(Data: ModularItemData, OriginalFunction: () => void): void;
/**
 * @typedef {{ ChangeTime?: number, LastMessageLen?: number }} AutoShockUnitPersistentData
 */
/** @type {ExtendedItemCallbacks.BeforeDraw<AutoShockUnitPersistentData>} */
declare function AssetsItemNeckAccessoriesCollarAutoShockUnitBeforeDraw(data: DynamicDrawingData<AutoShockUnitPersistentData>): DynamicBeforeDrawOverrides;
/** @type {ExtendedItemCallbacks.ScriptDraw<AutoShockUnitPersistentData>} */
declare function AssetsItemNeckAccessoriesCollarAutoShockUnitScriptDraw(data: DynamicScriptCallbackData<AutoShockUnitPersistentData>): void;
type AutoShockUnitPersistentData = {
    ChangeTime?: number;
    LastMessageLen?: number;
};
