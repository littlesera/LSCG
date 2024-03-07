declare function InventoryItemNeckAccessoriesCollarShockUnitDrawHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function InventoryItemNeckAccessoriesCollarShockUnitClickHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function InventoryItemNeckAccessoriesCollarShockUnitResetCount(): void;
declare function AssetsItemNeckAccessoriesCollarShockUnitBeforeDrawHook(data: ExtendedItemData<any>, originalFunction: (drawData: DynamicDrawingData<ShockUnitPersistentData>) => DynamicBeforeDrawOverrides, drawData: DynamicDrawingData<ShockUnitPersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsItemNeckAccessoriesCollarShockUnitScriptDrawHook(data: ExtendedItemData<any>, originalFunction: (drawData: DynamicScriptCallbackData<ShockUnitPersistentData>) => void, drawData: DynamicScriptCallbackData<ShockUnitPersistentData>): void;
type ShockUnitPersistentData = {
    ChangeTime?: number;
    DisplayCount?: number;
    LastTriggerCount?: number;
};
