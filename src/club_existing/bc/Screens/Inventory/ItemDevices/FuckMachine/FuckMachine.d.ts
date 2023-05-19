/**
 * @typedef {{ DildoState?: number, Modifier?: number, Speed?: number, FuckChangeTime?: number, Mode?: VibratorMode, ChangeTime?: number, LastChange?: number }} FuckMachinePersistentData
 */
/** @type {ExtendedItemCallbacks.BeforeDraw<FuckMachinePersistentData>} */
declare function AssetsItemDevicesFuckMachineBeforeDraw({ PersistentData, L, Y, Property }: DynamicDrawingData<FuckMachinePersistentData>): DynamicBeforeDrawOverrides;
/** @type {ExtendedItemCallbacks.ScriptDraw<FuckMachinePersistentData>} */
declare function AssetsItemDevicesFuckMachineScriptDraw(data: DynamicScriptCallbackData<FuckMachinePersistentData>): void;
type FuckMachinePersistentData = {
    DildoState?: number;
    Modifier?: number;
    Speed?: number;
    FuckChangeTime?: number;
    Mode?: VibratorMode;
    ChangeTime?: number;
    LastChange?: number;
};
