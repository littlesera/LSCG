/** @type {ExtendedItemCallbacks.Init} */
declare function InventoryItemMiscTimerPasswordPadlockInit(C: Character, Item: Item): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemMiscTimerPasswordPadlockLoad(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemMiscTimerPasswordPadlockDraw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemMiscTimerPasswordPadlockClick(): void;
declare function InventoryItemMiscTimerPasswordPadlockAdd(TimeToAdd: any, PlayerMemberNumberToList: any): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemMiscTimerPasswordPadlockExit(): void;
declare const PasswordTimerChooseList: number[];
declare let PasswordTimerChooseIndex: number;
