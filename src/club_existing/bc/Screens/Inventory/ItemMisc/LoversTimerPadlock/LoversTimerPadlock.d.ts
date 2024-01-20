declare function InventoryItemMiscLoversTimerPadlockInit(C: Character, item: Item, push: boolean, refresh: boolean): boolean;
declare function InventoryItemMiscLoversTimerPadlockLoad(): void;
/**
 * @param {Character} C
 * @returns {boolean} - Whether the passed character is elligble for full control over the lock
 */
declare function InventoryItemMiscLoversTimerPadlockValidator(C: Character): boolean;
declare function InventoryItemMiscLoversTimerPadlockDraw(): void;
declare function InventoryItemMiscLoversTimerPadlockClick(): void;
declare function InventoryItemMiscLoversTimerPadlockExit(): void;
declare const LoverTimerChooseList: number[];
declare let LoverTimerChooseIndex: number;
