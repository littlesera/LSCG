/**
 * Helper to generate section labels
 * @param {number} num
 * @returns {string}
 */
declare function ItemDevicesLuckyWheelLabelForNum(num: number): string;
declare function InventoryItemDevicesLuckyWheelDrawHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelClickHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemDevicesLuckyWheelInitHook(data: ModularItemData, originalFunction: (C: Character, item: Item, push: boolean, refresh: boolean) => boolean, C: Character, item: Item, push: boolean, refresh: boolean): boolean;
declare function InventoryItemDevicesLuckyWheelg0Load(): void;
declare function InventoryItemDevicesLuckyWheelg0Draw(): void;
declare function InventoryItemDevicesLuckyWheelg0Click(): void;
declare function InventoryItemDevicesLuckyWheelg0Exit(): void;
declare function InventoryItemDevicesLuckyWheelUpdate(): void;
declare function InventoryItemDevicesLuckyWheelTrigger(): void;
declare function InventoryItemDevicesLuckyWheelStoppedTurning(C: any, Item: any, Angle: any): void;
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
