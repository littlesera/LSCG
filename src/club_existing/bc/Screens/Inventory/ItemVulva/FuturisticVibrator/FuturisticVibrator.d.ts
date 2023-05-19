/** @type {ExtendedItemScriptHookCallbacks.Load<VibratingItemData>} */
declare function InventoryItemVulvaFuturisticVibratorLoadHook(data: VibratingItemData, originalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Draw<VibratingItemData>} */
declare function InventoryItemVulvaFuturisticVibratorDrawHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemVulvaFuturisticVibratorPreviousAccessMode(current: any): "" | "ProhibitSelf" | "LockMember";
declare function InventoryItemVulvaFuturisticVibratorNextAccessMode(current: any): "" | "ProhibitSelf" | "LockMember";
/** @type {ExtendedItemScriptHookCallbacks.Click<VibratingItemData>} */
declare function InventoryItemVulvaFuturisticVibratorClickHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemVulvaFuturisticVibratorClickSet(): void;
/** @type {ExtendedItemScriptHookCallbacks.Exit<VibratingItemData>} */
declare function InventoryItemVulvaFuturisticVibratorExitHook(data: VibratingItemData, originalFunction: () => void): void;
/**
 * @param {string} msg
 * @param {readonly string[]} TriggerValues
 * @returns {string[]}
 */
declare function InventoryItemVulvaFuturisticVibratorDetectMsg(msg: string, TriggerValues: readonly string[]): string[];
/**
 * @param {Character} C
 * @param {Item} Item
 * @param {ItemVulvaFuturisticVibratorAccessMode} Mode
 */
declare function InventoryItemVulvaFuturisticVibratorSetAccessMode(C: Character, Item: Item, Mode: ItemVulvaFuturisticVibratorAccessMode): void;
/**
 * @param {Item} Item
 * @param {boolean} Increase
 * @returns {VibratorMode}
 */
declare function InventoryItemVulvaFuturisticVibratorGetMode(Item: Item, Increase: boolean): VibratorMode;
/**
 * @param {VibratingItemData} data
 * @param {Character} C
 * @param {Item} Item
 * @param {VibratingItemOption} newOption
 * @param {VibratingItemOption} previousOption
 */
declare function InventoryItemVulvaFuturisticVibratorSetMode(data: VibratingItemData, C: Character, Item: Item, newOption: VibratingItemOption, previousOption: VibratingItemOption): void;
/**
 * @param {VibratingItemData} data
 * @param {Character} C
 * @param {Item} Item
 * @param {number} LastTime
 */
declare function InventoryItemVulvaFuturisticVibratorHandleChat(data: VibratingItemData, C: Character, Item: Item, LastTime: number): void;
/**
 * @typedef {{ CheckTime?: number, Mode?: VibratorMode, ChangeTime?: number, LastChange?: number }} FuturisticVibratorPersistentData
 */
/** @type {ExtendedItemScriptHookCallbacks.ScriptDraw<VibratingItemData, FuturisticVibratorPersistentData>} */
declare function AssetsItemVulvaFuturisticVibratorScriptDrawHook(data: VibratingItemData, originalFunction: (drawData: DynamicScriptCallbackData<FuturisticVibratorPersistentData>) => void, drawData: DynamicScriptCallbackData<FuturisticVibratorPersistentData>): void;
declare var ItemVulvaFuturisticVibratorTriggers: string[];
/** @type {string[]} */
declare var ItemVulvaFuturisticVibratorTriggerValues: string[];
/** @type {{EVERYONE: "", PROHIBIT_SELF: "ProhibitSelf", LOCK_MEMBER_ONLY: "LockMember"}} */
declare const ItemVulvaFuturisticVibratorAccessMode: {
    EVERYONE: "";
    PROHIBIT_SELF: "ProhibitSelf";
    LOCK_MEMBER_ONLY: "LockMember";
};
declare const ItemVulvaFuturisticVibratorAccessModes: ("" | "ProhibitSelf" | "LockMember")[];
type FuturisticVibratorPersistentData = {
    CheckTime?: number;
    Mode?: VibratorMode;
    ChangeTime?: number;
    LastChange?: number;
};
