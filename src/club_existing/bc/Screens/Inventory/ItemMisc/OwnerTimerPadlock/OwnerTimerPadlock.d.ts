/**
 * @param {Character} C
 * @returns {boolean} - Whether the passed character is elligble for full control over the lock
 */
declare function InventoryItemMiscOwnerTimerPadlockValidator(C: Character): boolean;
/**
 * @param {NoArchItemData} data
 * @param {null | (() => void)} originalFunction
 * @param {(C: Character) => boolean} validator
 * @satisfies {ExtendedItemScriptHookCallbacks.Draw<NoArchItemData>}
 */
declare function InventoryItemMiscOwnerTimerPadlockDrawHook({ asset }: NoArchItemData, originalFunction: null | (() => void), validator?: (C: Character) => boolean): void;
/**
 * @param {NoArchItemData} data
 * @param {null | (() => void)} originalFunction
 * @param {(C: Character) => boolean} validator
 * @satisfies {ExtendedItemScriptHookCallbacks.Draw<NoArchItemData>}
 */
declare function InventoryItemMiscOwnerTimerPadlockClickHook(data: NoArchItemData, originalFunction: null | (() => void), validator?: (C: Character) => boolean): void;
/**
 * @param {number} TimeToAdd
 * @param {boolean} PlayerMemberNumberToList
 */
declare function InventoryItemMiscOwnerTimerPadlockAdd(TimeToAdd: number, PlayerMemberNumberToList?: boolean): void;
declare const OwnerTimerChooseList: number[];
declare let OwnerTimerChooseIndex: number;
