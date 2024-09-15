/**
 * Construct an array with X & Y coordinates for the name tag extended item menu.
 * @param {number} Count - The number of buttons
 * @returns {ExtendedItemConfigDrawData<{}>} - The array with X & Y coordinates
 */
declare function InventoryItemNeckAccessoriesCollarNameTagGetDrawData(Count: number, X?: number, Y?: number): ExtendedItemConfigDrawData<{}>;
declare function InventoryItemNeckAccessoriesCollarNameTagPublishActionHook(data: TypedItemData, originalFunction: (C: Character, item: Item, newOption: TypedItemOption, previousOption: TypedItemOption) => void, C: Character, item: Item, newOption: TypedItemOption, previousOption: TypedItemOption): void;
