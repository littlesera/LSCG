declare function AssetsWingsSteampunkWingsBeforeDraw(drawData: DynamicDrawingData<SteampunkWingsPersistentData>): DynamicBeforeDrawOverrides;
declare function AssetsWingsSteampunkWingsScriptDraw(drawData: DynamicScriptCallbackData<SteampunkWingsPersistentData>): void;
type SteampunkWingsPersistentData = {
    State?: number;
    StateGears?: number;
    Modifier?: number;
    ModifierGears?: number;
    ChangeTime?: number;
    FrameTime?: number;
    DrawRequested?: boolean;
};
