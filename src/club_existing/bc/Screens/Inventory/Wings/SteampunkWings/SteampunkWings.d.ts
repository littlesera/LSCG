/**
 * @typedef {{ State?: number, StateGears?: number, Modifier?: number, ModifierGears?: number, ChangeTime?: number, FrameTime?: number, DrawRequested?: boolean }} SteampunkWingsPersistentData
 */
/** @type {ExtendedItemCallbacks.BeforeDraw<SteampunkWingsPersistentData>} */
declare function AssetsWingsSteampunkWingsBeforeDraw({ PersistentData, L, LayerType: lt }: DynamicDrawingData<SteampunkWingsPersistentData>): DynamicBeforeDrawOverrides;
/** @type {ExtendedItemCallbacks.ScriptDraw<SteampunkWingsPersistentData>} */
declare function AssetsWingsSteampunkWingsScriptDraw({ C, Item, PersistentData }: DynamicScriptCallbackData<SteampunkWingsPersistentData>): void;
type SteampunkWingsPersistentData = {
    State?: number;
    StateGears?: number;
    Modifier?: number;
    ModifierGears?: number;
    ChangeTime?: number;
    FrameTime?: number;
    DrawRequested?: boolean;
};
