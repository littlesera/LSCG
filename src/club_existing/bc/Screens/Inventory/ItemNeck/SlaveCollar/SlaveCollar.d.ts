/** @type {ExtendedItemCallbacks.Init} */
declare function InventoryItemNeckSlaveCollarInit(C: Character, Item: Item, Refresh: boolean): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemNeckSlaveCollarLoad(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemNeckSlaveCollarDraw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemNeckSlaveCollarClick(): void;
/**
 * Sets the slave collar model
 * @type {TypedItemSetTypeCallback}
 */
declare function InventoryItemNeckSlaveCollarSetType(NewType: string): void;
declare var InventoryItemNeckSlaveCollarColorMode: boolean;
/** @type {ItemColor} */
declare var InventoryItemNeckSlaveCollarColor: ItemColor;
declare var InventoryItemNeckSlaveCollarOffset: number;
/** @type {(TypedItemOption & { Image: string })[]} */
declare var InventoryItemNeckSlaveCollarTypes: (TypedItemOption & {
    Image: string;
})[];
