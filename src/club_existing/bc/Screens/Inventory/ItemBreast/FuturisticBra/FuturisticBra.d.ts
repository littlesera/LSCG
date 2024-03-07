/**
 * @param {Character} C
 * @returns {{bpm: number, breathing: "Low" | "Med" | "High" | "Action", temp: number}}
 */
declare function InventoryItemBreastFuturisticBraUpdate(C: Character): {
    bpm: number;
    breathing: "Low" | "Med" | "High" | "Action";
    temp: number;
};
declare function InventoryItemBreastFuturisticBraDrawHook(data: TypedItemData, originalFunction: () => void): void;
declare function AssetsItemBreastFuturisticBraBeforeDraw(drawData: DynamicDrawingData<FuturisticBraPersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsItemBreastFuturisticBraAfterDraw(drawData: DynamicDrawingData<FuturisticBraPersistentData>): void;
declare function AssetsItemBreastFuturisticBraScriptDraw(drawData: DynamicScriptCallbackData<FuturisticBraPersistentData>): void;
type FuturisticBraPersistentData = {
    UpdateTime?: number;
    ShowHeart?: boolean;
};
