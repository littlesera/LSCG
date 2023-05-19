/**
 * Post-render drawing function. Draws custom text in a slight arc to mimic the
 * curvature of the bowl.
 * @type {ExtendedItemScriptHookCallbacks.AfterDraw<TextItemData>}
 */
declare function AssetsItemDevicesPetBowlAfterDrawHook(data: TextItemData, originalFunction: (drawData: DynamicDrawingData<Record<string, unknown>>) => void, { C, A, CA, X, Y, L, drawCanvas, drawCanvasBlink, AlphaMasks, Color }: DynamicDrawingData<Record<string, unknown>>): void;
