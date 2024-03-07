declare function InventoryItemArmsTransportJacketLoadHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventoryItemArmsTransportJacketDrawHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventoryItemArmsTransportJacketPublishActionHook(data: TypedItemData, originalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => void, C: Character, item: Item, newOption: any, previousOption: any): void;
declare function InventoryItemArmsTransportJacketExitHook(data: TypedItemData, originalFunction: () => void): void;
declare function AssetsItemArmsTransportJacketAfterDraw(drawData: DynamicDrawingData<Record<string, unknown>>): void;
