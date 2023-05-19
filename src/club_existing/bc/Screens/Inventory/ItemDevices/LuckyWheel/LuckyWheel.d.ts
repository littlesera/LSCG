/**
 * Helper to generate section labels
 * @param {number} num
 * @returns {string}
 */
declare function ItemDevicesLuckyWheelLabelForNum(num: number): string;
/** @type {ExtendedItemScriptHookCallbacks.Draw<ModularItemData>} */
declare function InventoryItemDevicesLuckyWheelDrawHook(data: ModularItemData, next: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Click<ModularItemData>} */
declare function InventoryItemDevicesLuckyWheelClickHook(data: ModularItemData, next: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.Init<ModularItemData>} */
declare function InventoryItemDevicesLuckyWheelInitHook(data: ModularItemData, originalFunction: (C: Character, item: Item, refresh: boolean) => boolean, character: Character, item: Item, refresh: boolean): boolean;
/** @type {ExtendedItemCallbacks.Load} */
declare function InventoryItemDevicesLuckyWheelGame0Load(): void;
/** @type {ExtendedItemCallbacks.Draw} */
declare function InventoryItemDevicesLuckyWheelGame0Draw(): void;
/** @type {ExtendedItemCallbacks.Click} */
declare function InventoryItemDevicesLuckyWheelGame0Click(): void;
/** @type {ExtendedItemCallbacks.Exit} */
declare function InventoryItemDevicesLuckyWheelGame0Exit(): void;
declare function InventoryItemDevicesLuckyWheelUpdate(): void;
declare function InventoryItemDevicesLuckyWheelTrigger(): void;
declare function InventoryItemDevicesLuckyWheelStoppedTurning(C: any, Item: any, Angle: any): void;
/**
 * @typedef {{ AnimationAngleState?: number, AnimationSpeed?: number, ChangeTime?: number, LightStep?: number }} LuckyWheelPersistentData
 */
/** @type {ExtendedItemCallbacks.ScriptDraw<LuckyWheelPersistentData>} */
declare function AssetsItemDevicesLuckyWheelScriptDraw({ C, PersistentData, Item }: DynamicScriptCallbackData<LuckyWheelPersistentData>): void;
/** @type {ExtendedItemCallbacks.AfterDraw<LuckyWheelPersistentData>} */
declare function AssetsItemDevicesLuckyWheelAfterDraw({ C, PersistentData, A, X, Y, L, Property, drawCanvas, drawCanvasBlink, AlphaMasks, Color, Opacity }: DynamicDrawingData<LuckyWheelPersistentData>): void;
declare var ItemDevicesLuckyWheelMinTexts: number;
declare var ItemDevicesLuckyWheelMaxTexts: number;
declare var ItemDevicesLuckyWheelMaxTextLength: number;
declare var ItemDevicesLuckyWheelFont: string;
declare var ItemDevicesLuckyWheelAnimationMaxSpeed: number;
declare var ItemDevicesLuckyWheelAnimationMinSpeed: number;
declare var ItemDevicesLuckyWheelAnimationSpeedStep: number;
declare var ItemDevicesLuckyWheelAnimationFrameTime: number;
declare var ItemDevicesLuckyWheelRowTop: number;
declare var ItemDevicesLuckyWheelRowLeft: number;
declare var ItemDevicesLuckyWheelRowHeight: number;
declare var ItemDevicesLuckyWheelRowLength: number;
type LuckyWheelPersistentData = {
    AnimationAngleState?: number;
    AnimationSpeed?: number;
    ChangeTime?: number;
    LightStep?: number;
};
