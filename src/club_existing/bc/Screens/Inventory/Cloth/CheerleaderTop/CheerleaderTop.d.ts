/** @type {ExtendedItemScriptHookCallbacks.AfterDraw<TextItemData>} */
declare function AssetsClothCheerleaderTopAfterDrawHook(data: TextItemData, originalFunction: (drawData: DynamicDrawingData<Record<string, unknown>>) => void, { CA, C, A, G, X, Y, L, drawCanvas, drawCanvasBlink, AlphaMasks, Color }: DynamicDrawingData<Record<string, unknown>>): void;
declare namespace AssetsClothCheerleaderTopData {
    namespace _Small {
        const shearFactor: number;
        const width: number;
        const yOffset: number;
    }
    namespace _Normal {
        const shearFactor_1: number;
        export { shearFactor_1 as shearFactor };
        const width_1: number;
        export { width_1 as width };
        const yOffset_1: number;
        export { yOffset_1 as yOffset };
    }
    namespace _Large {
        const shearFactor_2: number;
        export { shearFactor_2 as shearFactor };
        const width_2: number;
        export { width_2 as width };
        const yOffset_2: number;
        export { yOffset_2 as yOffset };
    }
    namespace _XLarge {
        const shearFactor_3: number;
        export { shearFactor_3 as shearFactor };
        const width_3: number;
        export { width_3 as width };
        const yOffset_3: number;
        export { yOffset_3 as yOffset };
    }
}
