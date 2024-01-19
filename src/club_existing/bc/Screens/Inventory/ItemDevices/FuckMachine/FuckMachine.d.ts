declare function AssetsItemDevicesFuckMachineBeforeDrawHook(data: VibratingItemData, originalFunction: (drawData: DynamicDrawingData<FuckMachinePersistentData>) => DynamicBeforeDrawOverrides, drawData: DynamicDrawingData<FuckMachinePersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsItemDevicesFuckMachineScriptDrawHook(data: VibratingItemData, originalFunction: (drawData: DynamicScriptCallbackData<FuckMachinePersistentData>) => void, drawData: DynamicScriptCallbackData<FuckMachinePersistentData>): void;
type FuckMachinePersistentData = {
    DildoState?: number;
    Modifier?: number;
    Speed?: number;
    FuckChangeTime?: number;
    Mode?: VibratorMode;
    ChangeTime?: number;
    LastChange?: number;
};
