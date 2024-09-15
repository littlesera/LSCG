/**
 * Helper to generate section labels
 * @param {number} num
 * @returns {string}
 */
declare function ItemDevicesLuckyWheelLabelForNum(num: number): string;
declare function InventoryItemDevicesLuckyWheelDrawHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelClickHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelInitHook(data: ModularItemData, originalFunction: (C: Character, item: Item, push: boolean, refresh: boolean) => boolean, C: Character, item: Item, push: boolean, refresh: boolean): boolean;
declare function InventoryItemDevicesLuckyWheelg0LoadHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelg0DrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelg0ClickHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelg0ExitHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelUpdate(): void;
declare function InventoryItemDevicesLuckyWheelTrigger(): void;
/**
 * @param {Character} C
 * @param {Item} Item
 * @param {number} Angle
 */
declare function InventoryItemDevicesLuckyWheelStoppedTurning(C: Character, Item: Item, Angle: number): void;
declare function AssetsItemDevicesLuckyWheelScriptDraw(drawData: DynamicScriptCallbackData<LuckyWheelPersistentData>): void;
declare function AssetsItemDevicesLuckyWheelAfterDraw(drawData: DynamicDrawingData<LuckyWheelPersistentData>): void;
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
