declare function InventoryItemBreastForbiddenChastityBraDrawHook(data: TypedItemData | ModularItemData, originalFunction: () => void): void;
declare function InventoryItemBreastForbiddenChastityBraClickHook(data: TypedItemData | ModularItemData, originalFunction: () => void): void;
declare function AssetsItemBreastForbiddenChastityBraScriptDrawHook(data: TypedItemData | ModularItemData, originalFunction: (drawData: DynamicScriptCallbackData<ForbiddenChastityBraPersistentData>) => void, drawData: DynamicScriptCallbackData<ForbiddenChastityBraPersistentData>): void;
type ForbiddenChastityBraPersistentData = {
    UpdateTime?: number;
    CheckTime?: number;
    LastMessageLen?: number;
    LastTriggerCount?: number;
    DisplayCount?: number;
};
