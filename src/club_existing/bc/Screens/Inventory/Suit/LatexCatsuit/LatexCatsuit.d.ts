declare function InventorySuitLatexCatsuitLoadHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventorySuitLatexCatsuitDrawHook(data: TypedItemData, originalFunction: () => void): void;
declare function InventorySuitLatexCatsuitPublishActionHook(data: TypedItemData, originalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => void, C: Character, item: Item, newOption: any, previousOption: any): void;
declare function InventorySuitLatexCatsuitExitHook(data: TypedItemData, originalFunction: () => void): void;
declare function AssetsSuitLatexCatsuitAfterDraw(drawData: DynamicDrawingData<Record<string, unknown>>): void;
