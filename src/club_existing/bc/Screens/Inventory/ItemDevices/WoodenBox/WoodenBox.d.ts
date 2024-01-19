declare function InventoryItemDevicesWoodenBoxLoadHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesWoodenBoxDrawHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesWoodenBoxExitHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesWoodenBoxPublishActionHook(data: TypedItemData, originalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => void, C: Character, item: Item, newOption: any, previousOption: any): void;
declare function AssetsItemDevicesWoodenBoxAfterDrawHook(data: TypedItemData, originalFunction: (drawData: DynamicDrawingData<Record<string, unknown>>) => void, drawData: DynamicDrawingData<Record<string, unknown>>): void;
