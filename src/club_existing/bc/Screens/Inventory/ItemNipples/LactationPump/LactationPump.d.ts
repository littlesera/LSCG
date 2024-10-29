declare function AssetsItemNipplesLactationPumpBeforeDraw(drawData: DynamicDrawingData<LactationPumpPersistentData>): DynamicBeforeDrawOverrides;
declare function LactationPumpGetRandomDuration(): number;
declare function AssetsItemNipplesLactationPumpScriptDraw(drawData: DynamicScriptCallbackData<LactationPumpPersistentData>): void;
/** Minimum time (in ms) the pump waits between its messages. Max is two times that. */
declare const LactationPumpDuration: number;
type LactationPumpPersistentData = {
    LastSuction?: number;
    SuctionDuration?: number;
};
