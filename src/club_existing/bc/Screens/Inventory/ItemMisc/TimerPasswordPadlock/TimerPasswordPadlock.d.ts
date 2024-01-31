declare function InventoryItemMiscTimerPasswordPadlockLoadHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscTimerPasswordPadlockDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscTimerPasswordPadlockClickHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * @param {number} TimeToAdd
 * @param {boolean} PlayerMemberNumberToList
 */
declare function InventoryItemMiscTimerPasswordPadlockAdd(TimeToAdd: number, PlayerMemberNumberToList?: boolean): void;
declare const PasswordTimerChooseList: number[];
declare let PasswordTimerChooseIndex: number;
