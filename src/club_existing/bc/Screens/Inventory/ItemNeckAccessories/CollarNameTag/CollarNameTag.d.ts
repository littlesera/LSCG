/** @type {ExtendedItemScriptHookCallbacks.Draw<TypedItemData>} */
declare function InventoryItemNeckAccessoriesCollarNameTagDrawHook(Data: TypedItemData, OriginalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Click<TypedItemData>} */
declare function InventoryItemNeckAccessoriesCollarNameTagClickHook(Data: TypedItemData, OriginalFunction: () => void): void;
/**
 * Construct an array with X & Y coordinates for the name tag extended item menu.
 * @param {number} Count - The number of buttons
 * @returns {[number, number][]} - The array with X & Y coordinates
 */
declare function InventoryItemNeckAccessoriesCollarNameTagGetXY(Count: number, X?: number, Y?: number): [number, number][];
/** @type {ExtendedItemScriptHookCallbacks.PublishAction<TypedItemData, TypedItemOption>} */
declare function InventoryItemNeckAccessoriesCollarNameTagPublishActionHook(data: TypedItemData, OriginalFunction: (C: Character, item: Item, newOption: TypedItemOption, previousOption: TypedItemOption) => void, C: Character, item: Item, newOption: TypedItemOption, previousOption: TypedItemOption): void;
