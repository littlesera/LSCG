/**
 * @typedef {{ DoorState?: number, DrawRequested?: boolean, MustChange?: boolean, ChangeTime?: number }} KennelPersistentData
 */
/** @type {ExtendedItemCallbacks.BeforeDraw<KennelPersistentData>} */
declare function AssetsItemDevicesKennelBeforeDraw({ PersistentData, L, Property }: DynamicDrawingData<KennelPersistentData>): DynamicBeforeDrawOverrides;
/** @type {ExtendedItemCallbacks.ScriptDraw<KennelPersistentData>} */
declare function AssetsItemDevicesKennelScriptDraw({ C, PersistentData, Item }: DynamicScriptCallbackData<KennelPersistentData>): void;
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
