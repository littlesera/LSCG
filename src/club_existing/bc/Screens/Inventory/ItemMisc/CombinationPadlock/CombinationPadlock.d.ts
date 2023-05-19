/** @type {ExtendedItemCallbacks.Init} */
declare function InventoryItemMiscCombinationPadlockInit(C: Character, Item: Item): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemMiscCombinationPadlockLoad(): void;
declare function InventoryItemMiscCombinationPadlockModifyInput(e: any): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemMiscCombinationPadlockDraw(): void;
declare function InventoryItemMiscCombinationPadlockUnlock(C: any, Item: any): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemMiscCombinationPadlockClick(): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemMiscCombinationPadlockExit(): void;
declare let CombinationPadlockPlayerIsBlind: boolean;
declare let CombinationPadlockBlindCombinationOffset: any;
declare let CombinationPadlockCombinationLastValue: string;
declare let CombinationPadlockNewCombinationLastValue: string;
declare let CombinationPadlockLoaded: boolean;
