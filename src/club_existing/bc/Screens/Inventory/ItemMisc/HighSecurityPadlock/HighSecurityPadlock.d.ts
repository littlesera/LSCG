declare function InventoryItemMiscHighSecurityPadlockInitHook(data: NoArchItemData, originalFunction: (C: Character, item: Item, push: boolean, refresh: boolean) => boolean, C: Character, item: Item, push: boolean, refresh: boolean): boolean;
declare function InventoryItemMiscHighSecurityPadlockLoadHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * @param {Character} C
 * @param {Item} Item
 * @returns {boolean}
 */
declare function InventoryItemMiscHighSecurityPadlockPlayerHasKeys(C: Character, Item: Item): boolean;
declare function InventoryItemMiscHighSecurityPadlockDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscHighSecurityPadlockClickHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemMiscHighSecurityPadlockExitHook(data: NoArchItemData, originalFunction: () => void): void;
declare var InventoryItemMiscHighSecurityPadlockPlayerCanUnlock: boolean;
declare var HighSecurityPadlockConfigOwner: boolean;
declare var HighSecurityPadlockConfigLover: boolean;
declare var HighSecurityPadlockConfigWhitelist: boolean;
