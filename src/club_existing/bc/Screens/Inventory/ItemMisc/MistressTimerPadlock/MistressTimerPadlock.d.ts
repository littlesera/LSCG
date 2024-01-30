declare function InventoryItemMiscMistressTimerPadlockDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscMistressTimerPadlockClickHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 *
 * @param {number} TimeToAdd
 * @param {boolean} PlayerMemberNumberToList
 */
declare function InventoryItemMiscMistressTimerPadlockAdd(TimeToAdd: number, PlayerMemberNumberToList?: boolean): void;
declare const MistressTimerChooseList: number[];
declare let MistressTimerChooseIndex: number;
