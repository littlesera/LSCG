declare function AssetsItemNipplesLactationPumpBeforeDraw(drawData: DynamicDrawingData<LactationPumpPersistentData>): DynamicBeforeDrawOverrides;
declare function LactationPumpGetRandomDuration(): number;
declare function AssetsItemNipplesLactationPumpScriptDraw(drawData: DynamicScriptCallbackData<LactationPumpPersistentData>): void;
declare const LactationPumpDuration: 10000;
type LactationPumpPersistentData = {
    LastSuction?: number;
    SuctionDuration?: number;
};
