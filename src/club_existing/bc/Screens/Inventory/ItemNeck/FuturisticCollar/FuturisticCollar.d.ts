declare function InventoryItemNeckFuturisticCollarLoadHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckFuturisticCollarDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckFuturisticCollarExitHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckFuturisticCollarClickHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * @param {Character} C
 * @param {AssetLockType} LockType
 * @returns
 */
declare function InventoryItemNeckFuturisticCollarCanLock(C: Character, LockType: AssetLockType): boolean;
/**
 * @param {Character} C
 * @param {boolean} [OnlyUnlockable]
 * @returns
 */
declare function InventoryItemNeckFuturisticCollarGetItems(C: Character, OnlyUnlockable?: boolean): Item[];
/**
 * @param {Character} C
 * @param {AssetLockType} LockType
 */
declare function InventoryItemNeckFuturisticCollarLockdown(C: Character, LockType: AssetLockType): void;
/**
 * @param {Character} C
 * @param {Item} Item
 * @param {Item} LockItem
 * @param {boolean} Attempt
 * @returns {boolean}
 */
declare function InventoryItemNeckFuturisticCollarCanUnlock(C: Character, Item: Item, LockItem: Item, Attempt: boolean): boolean;
/**
 * @param {Character} C
 */
declare function InventoryItemNeckFuturisticCollarUnlock(C: Character): void;
/**
 * @param {Character} C
 * @param {Item} FromItem
 */
declare function InventoryItemNeckFuturisticCollarColor(C: Character, FromItem: Item): void;
/**
 * @param {Character} C
 * @param {Item} Item
 * @param {"Leg"|"Arm"|"Chastity"|"Collar"} Permission
 */
declare function InventoryItemNeckFuturisticCollarTogglePermission(C: Character, Item: Item, Permission: "Leg" | "Arm" | "Chastity" | "Collar"): void;
/**
 * @param {Character} C
 * @param {Item} Item
 */
declare function InventoryItemNeckFuturisticCollarToggleRemotes(C: Character, Item: Item): void;
declare var FuturisticCollarPage: number;
declare var FuturisticCollarMaxPage: number;
