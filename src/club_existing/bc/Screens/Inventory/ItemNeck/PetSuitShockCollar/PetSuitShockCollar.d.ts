declare function InventoryItemNeckPetSuitShockCollars1DrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckPetSuitShockCollars1ClickHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckPetSuitShockCollarResetCount(): void;
declare function AssetsItemNeckPetSuitShockCollarBeforeDraw(drawData: DynamicDrawingData<PetSuitShockCollarPersistentData>): DynamicBeforeDrawOverrides;
/**
 * @param {Item} Item
 */
declare function InventoryPetSuitShockCollarCheckPunish(Item: Item): "" | "Struggle" | "Activity" | "StandUp";
/**
 * @param {DynamicScriptCallbackData<FuturisticChastityBeltPersistentData>} data
 * @param {number} LastTime
 */
declare function AssetsItemNeckPetSuitShockCollarUpdate(data: DynamicScriptCallbackData<FuturisticChastityBeltPersistentData>, LastTime: number): void;
declare function AssetsItemNeckPetSuitShockCollarScriptDraw(drawData: DynamicScriptCallbackData<PetSuitShockCollarPersistentData>): void;
type PetSuitShockCollarPersistentData = {
    UpdateTime?: number;
    CheckTime?: number;
    LastMessageLen?: number;
    LastTriggerCount?: number;
    DisplayCount?: number;
};
