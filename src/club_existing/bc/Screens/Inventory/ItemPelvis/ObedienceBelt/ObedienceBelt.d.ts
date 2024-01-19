declare function InventoryItemPelvisObedienceBelts1Load(): void;
declare function InventoryItemPelvisObedienceBelts1Draw(): void;
declare function InventoryItemPelvisObedienceBelts1Click(): void;
declare function InventoryItemPelvisObedienceBelts1Exit(): void;
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
