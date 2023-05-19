/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemPelvisObedienceBelts1Load(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemPelvisObedienceBelts1Draw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemPelvisObedienceBelts1Click(): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemPelvisObedienceBelts1Exit(): void;
/**
 * @param {Item} Item
 */
declare function InventoryObedienceBeltCheckPunish(Item: Item): "" | "Orgasm" | "StandUp";
/**
 * @param {DynamicScriptCallbackData<ObedienceBeltPersistentData>} data
 * @param {number} LastTime
 */
declare function AssetsItemPelvisObedienceBeltUpdate(data: DynamicScriptCallbackData<ObedienceBeltPersistentData>, LastTime: number): void;
/**
 * @typedef {{ UpdateTime?: number, LastMessageLen?: number, CheckTime?: number }} ObedienceBeltPersistentData
 */
/** @type {ExtendedItemCallbacks.ScriptDraw<ObedienceBeltPersistentData>} */
declare function AssetsItemPelvisObedienceBeltScriptDraw(data: DynamicScriptCallbackData<ObedienceBeltPersistentData>): void;
/** @type {ExtendedItemScriptHookCallbacks.AfterDraw<TextItemData, ObedienceBeltPersistentData>} */
declare function AssetsItemPelvisObedienceBeltAfterDrawHook(data: TextItemData, originalFunction: (drawData: DynamicDrawingData<ObedienceBeltPersistentData>) => void, { C, A, CA, X, Y, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color }: DynamicDrawingData<ObedienceBeltPersistentData>): void;
type ObedienceBeltPersistentData = {
    UpdateTime?: number;
    LastMessageLen?: number;
    CheckTime?: number;
};
