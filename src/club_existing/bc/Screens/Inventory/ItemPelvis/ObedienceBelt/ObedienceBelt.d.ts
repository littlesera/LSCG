declare function InventoryItemPelvisObedienceBelts1DrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisObedienceBelts1ClickHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * @param {Item} Item
 * @param {Character} C
 */
declare function InventoryObedienceBeltCheckPunish(Item: Item, C: Character): "" | "Struggle" | "Orgasm" | "StandUp";
/**
 * @param {DynamicScriptCallbackData<ObedienceBeltPersistentData>} data
 * @param {number} LastTime
 */
declare function AssetsItemPelvisObedienceBeltUpdate(data: DynamicScriptCallbackData<ObedienceBeltPersistentData>, LastTime: number): void;
declare function AssetsItemPelvisObedienceBeltScriptDraw(drawData: DynamicScriptCallbackData<ObedienceBeltPersistentData>): void;
declare function AssetsItemPelvisObedienceBeltAfterDrawHook(data: TextItemData, originalFunction: (drawData: DynamicDrawingData<ObedienceBeltPersistentData>) => void, drawData: DynamicDrawingData<ObedienceBeltPersistentData>): void;
type ObedienceBeltPersistentData = {
    UpdateTime?: number;
    LastMessageLen?: number;
    CheckTime?: number;
};
