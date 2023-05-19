/** @type {ExtendedItemCallbacks.Init} */
declare function InventoryItemMiscMistressTimerPadlockInit(C: Character, Item: Item): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemMiscMistressTimerPadlockLoad(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemMiscMistressTimerPadlockDraw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemMiscMistressTimerPadlockClick(): void;
declare function InventoryItemMiscMistressTimerPadlockAdd(TimeToAdd: any, PlayerMemberNumberToList: any): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemMiscMistressTimerPadlockExit(): void;
declare const MistressTimerChooseList: number[];
declare let MistressTimerChooseIndex: number;
