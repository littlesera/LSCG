/** @type {ExtendedItemCallbacks.Init} */
declare function InventoryItemMiscOwnerTimerPadlockInit(C: Character, Item: Item): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemMiscOwnerTimerPadlockLoad(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemMiscOwnerTimerPadlockDraw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemMiscOwnerTimerPadlockClick(): void;
declare function InventoryItemMiscOwnerTimerPadlockAdd(TimeToAdd: any, PlayerMemberNumberToList: any): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemMiscOwnerTimerPadlockExit(): void;
declare const OwnerTimerChooseList: number[];
declare let OwnerTimerChooseIndex: number;
