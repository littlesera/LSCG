declare function InventoryItemNeckAccessoriesCollarAutoShockUnitDrawHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemNeckAccessoriesCollarAutoShockUnitClickHook(data: ModularItemData, originalFunction: () => void): void;
declare function AssetsItemNeckAccessoriesCollarAutoShockUnitBeforeDrawHook(data: ExtendedItemData<any>, originalFunction: (drawData: DynamicDrawingData<AutoShockUnitPersistentData>) => DynamicBeforeDrawOverrides, drawData: DynamicDrawingData<AutoShockUnitPersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsItemNeckAccessoriesCollarAutoShockUnitScriptDrawHook(data: ExtendedItemData<any>, originalFunction: (drawData: DynamicScriptCallbackData<AutoShockUnitPersistentData>) => void, drawData: DynamicScriptCallbackData<AutoShockUnitPersistentData>): void;
type AutoShockUnitPersistentData = {
    ChangeTime?: number;
    LastMessageLen?: number;
};
