declare function InventoryItemMiscCombinationPadlockLoadHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * @param {Event & { target: { value: string }}} e
 */
declare function InventoryItemMiscCombinationPadlockModifyInput(e: Event & {
    target: {
        value: string;
    };
}): void;
declare function InventoryItemMiscCombinationPadlockDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscCombinationPadlockClickHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscCombinationPadlockExitHook(data: NoArchItemData, originalFunction: () => void): void;
declare let CombinationPadlockPlayerIsBlind: boolean;
declare let CombinationPadlockBlindCombinationOffset: any;
declare let CombinationPadlockCombinationLastValue: string;
declare let CombinationPadlockNewCombinationLastValue: string;
declare let CombinationPadlockLoaded: boolean;
