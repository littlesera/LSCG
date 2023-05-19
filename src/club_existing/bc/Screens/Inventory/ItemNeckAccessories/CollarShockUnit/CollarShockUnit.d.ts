/** @type {ExtendedItemScriptHookCallbacks.Draw<ExtendedItemData>} */
declare function InventoryItemNeckAccessoriesCollarShockUnitDrawHook(Data: ExtendedItemData<any>, OriginalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Click<ExtendedItemData>} */
declare function InventoryItemNeckAccessoriesCollarShockUnitClickHook(Data: ExtendedItemData<any>, OriginalFunction: () => void): void;
declare function InventoryItemNeckAccessoriesCollarShockUnitResetCount(): void;
/**
 * @typedef {{ ChangeTime?: number, DisplayCount?: number, LastTriggerCount?: number }} ShockUnitPersistentData
 */
/** @type {ExtendedItemCallbacks.BeforeDraw<ShockUnitPersistentData>} */
declare function AssetsItemNeckAccessoriesCollarShockUnitBeforeDraw(data: DynamicDrawingData<ShockUnitPersistentData>): DynamicBeforeDrawOverrides;
/** @type {ExtendedItemCallbacks.ScriptDraw<ShockUnitPersistentData>} */
declare function AssetsItemNeckAccessoriesCollarShockUnitScriptDraw(data: DynamicScriptCallbackData<ShockUnitPersistentData>): void;
type ShockUnitPersistentData = {
    ChangeTime?: number;
    DisplayCount?: number;
    LastTriggerCount?: number;
};
