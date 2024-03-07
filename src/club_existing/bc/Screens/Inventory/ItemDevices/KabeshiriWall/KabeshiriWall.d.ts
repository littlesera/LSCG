declare function InventoryItemDevicesKabeshiriWallLoadHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesKabeshiriWallDrawHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesKabeshiriWallPublishActionHook(data: ModularItemData, originalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => void, C: Character, item: Item, newOption: any, previousOption: any): void;
declare function InventoryItemDevicesKabeshiriWallExitHook(data: ModularItemData, originalFunction: () => void): void;
declare function AssetsItemDevicesKabeshiriWallAfterDrawHook(data: ModularItemData, originalFunction: (drawData: DynamicDrawingData<Record<string, unknown>>) => void, drawData: DynamicDrawingData<Record<string, unknown>>): void;
