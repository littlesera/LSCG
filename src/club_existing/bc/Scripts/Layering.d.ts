declare namespace Layering {
    let Character: null | Character;
    let Display: null | LayeringDisplay;
    let Item: null | Item;
    let Readonly: boolean;
    const Asset: Asset;
    let OverridePriority: AssetLayerOverridePriority;
    let _PriorityDefault: undefined | AssetLayerOverridePriority;
    let _Readonly: boolean;
    /**
     * Return whether the layering sub screen has currently been initialized (be it either active or unloaded)
     * @returns {boolean}
     */
    function IsActive(): boolean;
    let DisplayDefault: Readonly<LayeringDisplay>;
    let ID: Readonly<{
        root: "layering";
        buttonGrid: "layering-button-grid";
        resetButton: "layering-reset-button";
        exitButton: "layering-exit-button";
        hideButton: "layering-hide-button";
        hideTooltip: "layering-hide-button-tooltip";
        lockButton: "layering-lock-button";
        assetHeader: "layering-asset-header";
        assetGrid: "layering-asset-grid";
        layerHeader: "layering-layer-header";
        layerDIV: "layering-layer-div";
        layerOuterGrid: "layering-layer-outer-grid";
    }>;
    let _ExitCallbacks: ((screen: string, C: Character, item: Item) => void)[];
    /**
     * @private
     * Initialize the object-based variant of {@link AssetLayerOverridePriority}
     */
    function _InitOverridePriorityObject(): void;
    /**
     * @private
     * @param {string} name - The name of the layer
     * @param {number} priority - The stringified layer priority
     * @param {string} defaultPriority - The stringified default priority of the layer
     */
    function _ApplyLayerPriority(name: string, priority: number, defaultPriority: string): void;
    /**
     * @private
     * @param {number} priority - The layer priority
     * @param {string} defaultPriority - The stringified default priority of the layer
     */
    function _ApplyAssetPriority(priority: number, defaultPriority: string): void;
    /**
     * Event listener for `input` events involving layer priorities
     * @private
     * @param {Event} event
     */
    function _LayerInputListener(event: Event): void;
    /**
     * Event listener for `input` events involving asset priorities
     * @private
     * @param {Event} event
     */
    function _AssetInputListener(event: Event): void;
    let _CharacterRefresh: typeof CharacterRefresh;
    /**
     * Event listener for `click` events of the reset button
     * @this {HTMLButtonElement}
     * @param {Event} ev
     * @private
     */
    function _ResetClickListener(this: HTMLButtonElement, ev: Event): void;
    /**
     * Event listener for `click` events of the show hidden layers button
     * @this {HTMLButtonElement}
     * @param {Event} ev
     * @private
     */
    function _ShowLayersClickListener(this: HTMLButtonElement, ev: Event): void;
    /**
     * Update the background colors of the `number`-based input elements, the color change depending on whether one is changing an asset- or layer-specific priority.
     * @private
     * @param {"layer-priority" | "asset-priority"} activeType
     */
    function _UpdateInputColors(activeType: "layer-priority" | "asset-priority"): void;
    /**
     * Group all layers by their {@link AssetLayer.CopyLayerColor} properties
     * @private
     * @param {readonly AssetLayer[]} layers
     * @returns {Record<string, AssetLayer[]>}
     */
    function _GroupLayers(layers: readonly AssetLayer[]): Record<string, AssetLayer[]>;
    /**
     * Return the default `Property.OverridePriority` of the current item.
     *
     * This is generally `undefined`, though certain extended item options do overwrite it.
     * @private
     * @returns {undefined | AssetLayerOverridePriority}
     */
    function _GetDefaultPriority(): undefined | AssetLayerOverridePriority;
    /**
     * Update all input elements and buttons with the passed {@link Layering.Readonly} status.
     * @param {boolean} isReadonly
     * @private
     */
    function _ApplyReadonly(isReadonly: boolean): void;
    /**
     * Initialize the layering subscreen
     * @param {Item} item - The affected item
     * @param {Character} character - The item's owning character
     * @param {null | Partial<LayeringDisplay>} display - The shape of the layering subscreen
     * @param {boolean} reload - Whether we're loading or reloading the screen.
     * A reload pushes any current changes towards the server and reinitializes all DOM elements.
     * @returns {HTMLDivElement} The div containing the layering subscreen
     */
    function Init(item: Item, character: Character, display?: null | Partial<LayeringDisplay>, reload?: boolean, readonly?: boolean): HTMLDivElement;
    function Load(): void;
    function Resize(load: boolean): void;
    function Unload(): void;
    /**
     * @satisfies {ScreenFunctions["Exit"]}
     * @param {boolean} reload - Whether the exit call is part of a reload (see {@link Layering.Init})
     */
    function Exit(reload?: boolean): void;
    /**
     * Register screen-specific callbacks to-be executed after calling {@link Layering.Exit}.
     *
     * Callbacks registered herein must be used _exclusively_ for setting up the next screen, and not for tearing down the layering sub screen.
     * As such, they are ignored when performing a reload of the layering sub screen (see {@link Layering.Init})
     * @param {readonly LayeringExitOptions[]} options
     */
    function RegisterExitCallbacks(...options: readonly LayeringExitOptions[]): void;
}
