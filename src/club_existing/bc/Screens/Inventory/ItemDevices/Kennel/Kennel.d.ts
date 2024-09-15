declare function AssetsItemDevicesKennelBeforeDraw(drawData: DynamicDrawingData<KennelPersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsItemDevicesKennelScriptDraw(drawData: DynamicScriptCallbackData<KennelPersistentData>): void;
/**
 * @param {Character} C
 * @returns {string}
 */
declare function InventoryItemDevicesKennelGetAudio(C: Character): string;
type KennelPersistentData = {
    DoorState?: number;
    DrawRequested?: boolean;
    MustChange?: boolean;
    ChangeTime?: number;
};
