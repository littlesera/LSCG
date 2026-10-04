import { h } from "tsx-dom";
import { BaseModule } from "base";
import { getModule } from "modules";
import { OpacitySettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { hookFunction, isDrawingOverridable, isOutfitEditorCharacter, onCanvasResize, patchFunction } from "../utils";
import { Button } from "Dom/kit";
import { StateModule } from "./states";
import { endsWith, kebabCase, replace } from "lodash-es";
import styles from "./opacity.scss?inline";
import { IsSoulBind } from "./States/AstralProjectionState";
import { GetDotedPathType, PatchHook } from "bondage-club-mod-sdk";

interface OpacitySlider {
    ElementId: string;
    Value: number;
}

interface PropertiesWithLayerOverrides extends ItemProperties {
    LayerOverrides: { DrawingLeft: TopLeft.Data; DrawingTop: TopLeft.Data; }[];
}

const root = "lscg-layers";
const ID = Object.freeze({
    root,
    container: `${root}-container`,
    styles: `${root}-style`,
    exit: `${root}-exit`,
    tabs: `${root}-tabs`,
    mainToolbar: `${root}-toolbar`,
    allLayersCheck: `${root}-all-layers-check`,
    leadLined: `${root}-lead-lined-check`,

    opacity: `${root}-opacity`,
    opacityMain: `${root}-opacity-main`,
    opacityLayers: `${root}-opacity-layers`,

    transform: `${root}-transform`,
    transformFields: `${root}-transform-fields`,
    transformHint: `${root}-transform-hint`,
    layerButtons: `${root}-layer-buttons`,
});

type Tab = "opacity" | "translate" | "rotate" | "scale";
const TAB_LABELS: Record<Tab, string> = { opacity: "Opacity", translate: "Translate", rotate: "Rotate", scale: "Scale" };

/** One number a transform tab edits, e.g. the X of a translation. `layer` is -1 for the whole item, else a layer index. */
interface TransformAxis {
    label: string;
    min: number;
    max: number;
    step: number;
    /** Arrow-key step, and the step of the on-screen buttons with shift (keys) / always (buttons). */
    fine: number;
    big: number;
    decLabel: string;
    incLabel: string;
    read(layer: number): number;
    write(layer: number, value: number): void;
}

interface TransformTab {
    axes: TransformAxis[];
    hint: string;
    /** Which axis an arrow key changes, and in which direction. */
    keys: Partial<Record<string, [axis: number, sign: 1 | -1]>>;
    /** With Alt held, an arrow key changes every axis together by this sign (tabs with linked axes only). */
    syncKeys?: Partial<Record<string, 1 | -1>>;
    /** What a canvas drag of (dx, dy) canvas pixels changes, with the axes linked (Shift or Alt) or not: pairs of axis and delta. */
    drag(dx: number, dy: number, linked: boolean): [axis: number, delta: number][];
}

type NativeTransform = "Rotation" | "ScaleX" | "ScaleY";

export class OpacityModule extends BaseModule {
    OpacityMainSlider: OpacitySlider = {
        ElementId: ID.opacityMain,
        Value: 100,
    };
    OpacityLayerSliders: OpacitySlider[] = [];

    OpacityItem: ItemColorItem | null = null;
    OpacityCharacter: OtherCharacter | null = null;
    get ShowAllOpacityLayers(): boolean {
        return (document.getElementById(ID.allLayersCheck) as HTMLInputElement)?.checked;
    };

    ActiveTab: Tab = "opacity";
    /** Whether the active tab is one of the transforms, which the character can be dragged for. */
    get TransformMode(): boolean {
        return this.ActiveTab !== "opacity";
    }
    /** The layer the transform tabs edit: an index into the item's layers, or -1 for the whole item. */
    SelectedLayer: number = -1;
    private axisInputs: HTMLInputElement[] = [];
    lastX: number = 0;
    lastY: number = 0;
    /** An abort controller for removing the canvas-attached translation listeners */
    listenerRemover: null | AbortController = null;

    domUI = Object.freeze({
        shape: [40, 80, 650, 740] as RectTuple,
        visibility: "visible",
        dom: <div id={ID.root} class="lscg-screen lscg-layers-root HideOnPopup">
            <style id={ID.styles}>{styles}</style>
            <div id={ID.tabs} role="tablist">
                {(Object.keys(TAB_LABELS) as Tab[]).map(tab =>
                    Button(TAB_LABELS[tab], () => this.setTab(tab), { class: "lscg-layers-tab" }))}
            </div>
            <div id={ID.container}>
                <div id={ID.opacity} class="lscg-layers-body">
                    <div id={ID.mainToolbar}>
                        <label class="lscg-layers-check">
                            {ElementCheckbox.Create(ID.allLayersCheck, (evt) => this.onToggleAllLayers(evt))}
                            All Layers
                        </label>
                        <label class="lscg-layers-check">
                            {ElementCheckbox.Create(ID.leadLined, (evt) => this.onToggleLeadLined(evt), { checked: !!this.OpacityItem?.Property?.LSCGLeadLined })}
                            Lead-Lined
                        </label>
                    </div>
                    <div id={ID.opacityMain}></div>
                    <div id={ID.opacityLayers} class="lscg-layers-listing scroll-box" style="display:none"></div>
                </div>
                <div id={ID.transform} class="lscg-layers-body" style="display:none">
                    <div id={ID.transformFields}></div>
                    <small id={ID.transformHint}></small>
                    <div id={ID.layerButtons} class="lscg-layers-listing scroll-box"></div>
                </div>
            </div>
        </div>,
    });

    get settings(): OpacitySettingsModel {
        return super.settings as OpacitySettingsModel;
	}

    get defaultSettings() {
        return {
            enabled: true,
            preventExternalMod: false,
        } as OpacitySettingsModel;
    }

    CanChangeOpacityOnCharacter(C: OtherCharacter): boolean {
        return C.IsPlayer() || !(C.LSCG?.OpacityModule?.preventExternalMod ?? false);
    }

    ShowDomUI() {
        this.HideDomUI();
        document.body.appendChild(this.domUI.dom);

        this.PopulateLayers();
    }

    HideDomUI() {
        const domEle = document.getElementById(ID.root);
        if (domEle) {
            domEle.remove();
        }
    }

    ResizeDomUI(load: boolean) {
        // Different positions based on the width/height ratio
        const heightRatio = MainCanvas.canvas.clientHeight / 1000;
        const widthRatio = MainCanvas.canvas.clientWidth / 2000;

        const left = MainCanvas.canvas.offsetLeft + this.domUI.shape[0] * widthRatio;
        const top = MainCanvas.canvas.offsetTop + this.domUI.shape[1] * heightRatio;
        const width = this.domUI.shape[2] * widthRatio;
        const height = this.domUI.shape[3] * heightRatio;

        const style: Partial<CSSStyleDeclaration> = {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
        };
        if (load) {
            style.fontFamily = CommonGetFontName();
            style.visibility = this.domUI.visibility;
        }

        const elem = document.getElementById(ID.root) as HTMLElement;
        if (elem)
            Object.assign(elem.style, style);
    }

    PopulateLayers() {
        if (!this.OpacityItem || !this.OpacityItem.Asset || !this.OpacityItem.Asset.Layer || !Array.isArray(this.OpacityItem.Asset.Layer))
            return;


        document.getElementById(ID.opacityLayers)?.replaceChildren(...[]);
        document.getElementById(ID.layerButtons)?.replaceChildren(...[]);
        const leadLined = document.getElementById(ID.leadLined) as HTMLInputElement;
        if (leadLined)
            leadLined.checked = this.OpacityItem.Property?.LSCGLeadLined ?? false;
        // BC's property whitelist drops LSCGLeadLined from every bundle, so on an outfit item the box would do nothing
        const leadLinedLabel = leadLined?.closest("label");
        if (leadLinedLabel)
            leadLinedLabel.style.display = isOutfitEditorCharacter(this.OpacityCharacter) ? "none" : "";

        const opacityArr = this.getOpacity();
        let opacityValue = 100;
        if (opacityArr.length >= 1) {
            opacityValue = Math.round(100 * Math.max(...opacityArr));
        }
        const mainOpacitySlider = this.createOpacitySlider("Opacity %", ID.opacityMain + "-main", opacityValue, (evt) => this.onOpacityChange(evt), 0, 100);
        document.getElementById(ID.opacityMain)?.replaceChildren(mainOpacitySlider);
        this.OpacityMainSlider = {
            ElementId: ID.opacityMain + "-main",
            Value: opacityValue,
        };
        this.OpacityLayerSliders = [];

        const allLayersButton = this.createLayerButton("All Layers", b => this.onClickLayer(b));
        allLayersButton.classList.add("selected");
        document.getElementById(ID.layerButtons)?.appendChild(allLayersButton);

        if (this.OpacityItem.Asset.Layer.length <= 1) {
            const allLayersCheck = document.getElementById(ID.allLayersCheck) as HTMLInputElement;
            if (allLayersCheck) {
                allLayersCheck.checked = false;
                this.onToggleAllLayers();
            }
        }

        this.OpacityItem.Asset.Layer.forEach((layer: AssetLayer, ix, arr) => {
            const layerName = layer.Name;
            if (layerName) {
                // Create and add layer dom elements
                const opacityVal = Math.round(opacityArr[ix] * 100);

                const opacityId = ID.opacityLayers + "_" + kebabCase(layerName);
                const opacitySlider = this.createOpacitySlider(
                    layerName,
                    opacityId,
                    opacityVal,
                    (evt) => this.onOpacityChange(evt, layer),
                    0,//Math.round(layer.MinOpacity * 100),
                    Math.round(layer.MaxOpacity * 100),
                );
                const layerButton = this.createLayerButton(layerName, b => this.onClickLayer(b, layer));

                document.getElementById(ID.opacityLayers)?.appendChild(opacitySlider);
                document.getElementById(ID.layerButtons)?.appendChild(layerButton);
                this.OpacityLayerSliders.push({
                    ElementId: opacityId,
                    Value: (layer.Opacity ?? 1) * 100,
                } as OpacitySlider);
            }
        });

        this.SelectedLayer = -1;
        this.setTab("opacity");
    }

    createOpacitySlider(label: string, id: string, val: number, onChange: (evt: Event) => void, min: number, max: number) {
        return  <fieldset id={id} class="lscg-opacity-slider">
                    <legend>{label}</legend>
                    <div class="lscg-opacity-slider-inputs">
                        <input id={id + "_Range"} type="range" min={min} max={max} step="1" onInput={onChange} class="range-input" value={val}></input>
                        <input id={id + "_Number"} type="number" min={min} max={max} step="1" onInput={onChange} value={val} inputMode="numeric"></input>
                    </div>
                </fieldset>;
    }

    createLayerButton(label: string | undefined, onClick: (button: HTMLButtonElement) => void) {
        const button = Button(label ?? "", b => onClick(b), { class: "lscg-layer-button" });
        button.id = ID.layerButtons + "_" + kebabCase(label);
        return button;
    }

    onOpacityChange(evt: Event, layer?: AssetLayer | undefined) {
        // If layer is undefined, consider it the main slider
        const input = evt.target as HTMLInputElement;
        const value = input.value;
        this._updateOpacityValue(input.id);
        if (endsWith(input.id, "_Range")) {
            const targetId = replace(input.id, "_Range", "_Number");
            const targetEle = document.getElementById(targetId) as HTMLInputElement;
            if (targetEle) targetEle.value = value;
        } else {
            const targetId = replace(input.id, "_Number", "_Range");
            const targetEle = document.getElementById(targetId) as HTMLInputElement;
            if (targetEle) targetEle.value = value;
        }
        if (!layer) {
            this.OpacityLayerSliders.forEach(s => {
                const rangeSlider = document.getElementById(s.ElementId + "_Range") as HTMLInputElement;
                const numericSlider = document.getElementById(s.ElementId + "_Number") as HTMLInputElement;
                if (rangeSlider) rangeSlider.value = value;
                if (numericSlider) numericSlider.value = value;
            });
        }

        // Mirror the opacity value changes to the builtin BC opacity slider
        const C = ItemColorCharacter;
        const item = ItemColorItem;
        if (!C || !item) {
            return;
        }

        let layerColorIndex = -1;
        if (layer) {
            const sharedLayers = item.Asset.Layer.filter(l => l !== layer && l.ColorIndex === layer.ColorIndex);
            if (CharacterAppearanceIsLayerVisible(C, layer, item.Asset, item.Property?.TypeRecord)) {
                // The layer is visible, propagate the changes to the BC slider
                layerColorIndex = layer.ColorIndex;
            } else if (!sharedLayers.some(layer => CharacterAppearanceIsLayerVisible(C, layer, item.Asset, item.Property?.TypeRecord))) {
                // The layer is invisible but so are all other `ColorIndex`-shared layers
                // As a fallback: propagate the changes to the BC slider lest you end up with _none_ of the LSCG sliders affecting the BC one
                layerColorIndex = layer.ColorIndex;
            }
        }
        if (!layer || ItemColorPickerIndices.includes(layerColorIndex)) {
            const rootID: string = ColorPicker.ids.root;
            const opacityRange: null | HTMLInputElement = document.querySelector(`#${rootID} input[name="opacity"]`);
            if (opacityRange) {
                opacityRange.valueAsNumber = Math.round(input.valueAsNumber * (255 / 100)); // switch from a [0, 100] interval to [0, 255]
            }
        }

        this.UpdatePreview();
    }

    onToggleAllLayers(evt?: Event) {
        const main = document.getElementById(ID.opacityMain);
        const layers = document.getElementById(ID.opacityLayers);
        if (!main || !layers) return;

        if (this.ShowAllOpacityLayers) {
            main.style.display = "none";
            layers.style.display = "";
        } else {
            main.style.display = "";
            layers.style.display = "none";
        }
    }

    setTab(tab: Tab) {
        this.ActiveTab = tab;
        const opacity = document.getElementById(ID.opacity);
        const transform = document.getElementById(ID.transform);
        if (!opacity || !transform) return;
        opacity.style.display = tab === "opacity" ? "" : "none";
        transform.style.display = tab === "opacity" ? "none" : "";
        document.querySelectorAll(`#${ID.tabs} .lscg-layers-tab`).forEach((b, i) => {
            const active = (Object.keys(TAB_LABELS) as Tab[])[i] === tab;
            b.classList.toggle("selected", active);
            b.setAttribute("role", "tab");
            b.setAttribute("aria-selected", String(active));
        });
        if (tab !== "opacity") this.buildTransformFields();
    }

    onToggleLeadLined(evt?: Event) {
        if (!this.OpacityItem)
            return;
        this.OpacityItem.Property.LSCGLeadLined = (evt?.target as HTMLInputElement)?.checked ?? false;
    }

    onClickLayer(button: HTMLButtonElement, layer?: AssetLayer) {
        if (!this.OpacityItem || !this.OpacityItem.Asset || !this.OpacityItem.Asset.Layer)
            return;

        document.querySelectorAll(`#${ID.layerButtons} .lscg-layer-button`).forEach(b => b.classList.remove("selected"));
        this.SelectedLayer = layer ? this.OpacityItem.Asset.Layer.indexOf(layer) : -1;
        button.classList.add("selected");
        this.refreshTransformFields();
    }

    /** Cleanup for the color-picker DOM's canvas resize listener. */
    _unhookResize: null | (() => void) = null;

    load(): void {
        hookFunction("ItemColorLoad", 1, async (args, next) => {
            const ret = next(args);
            await ret;
            const C = args[0] as OtherCharacter;
            const Item = ItemColorItem;
            if (Item && this.CanChangeOpacityOnCharacter(C) && isDrawingOverridable(Item)) {
                this.OpacityCharacter = C;
                this.OpacityItem = Item;

                this.ShowDomUI();

                this._unhookResize?.();
                this._unhookResize = onCanvasResize(load => this.ResizeDomUI(load));

                this.TranslateRemoveEventListener();
                this.TranslateAttachEventListener();
            }
            return ret;
        }, ModuleCategory.Opacity);

        // Reset the LSCG inputs back to their initial opacity upon exiting the color picker without saving
        hookFunction("ItemColorRevert", 0, ([type, ...args], next) => {
            const layersEntries = (ItemColorPickerLayers as Map<number, AssetLayer>).entries();
            const opacityField = `${type as "initial" | "default"}Opacity` as const;

            const colorState: ItemColorStateType & { initialOpacity: readonly number[], defaultOpacity: readonly number[] } | null = ItemColorState;
            if (this.OpacityItem && colorState) {
                for (const [i, layer] of layersEntries) {
                    const name = `${ID.opacityLayers}_${kebabCase(layer.Name ?? layer.Asset.Name)}`;
                    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(`#${name}_Range, #${name}_Number`);
                    inputs.forEach(lscgInput => lscgInput.valueAsNumber = Math.round(colorState[opacityField][i] * 100));
                }

                // If we're changing the entire item/all layers
                const allLayers = ItemColorGetColorableLayers(this.OpacityItem);
                if (allLayers.length === ItemColorPickerIndices.length) {
                    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[id*="${this.OpacityMainSlider.ElementId}"]`);
                    inputs.forEach(lscgInput => lscgInput.valueAsNumber = Math.round(colorState[opacityField][0] * 100));
                }
            }
            return next([type, ...args]);
        });

        hookFunction("ColorPickerExit", 1, (args, next) => {
            this.OpacityCharacter = null;
            this.OpacityItem = null;
            this.HideDomUI();

            this.TranslateRemoveEventListener();
            this._unhookResize?.();
            this._unhookResize = null;
            next(args);
        }, ModuleCategory.Opacity);

        // *** Hack in actual updating of the translation overrides ***
        hookFunction("CommonCallFunctionByNameWarn", 2, (args, next) => {
            const [funcName, funcArgs] = args;
            if (!/Assets(.+)BeforeDraw/i.test(funcName) || !funcArgs) {
                return next(args);
            }

            const params = funcArgs as Parameters<PatchHook<GetDotedPathType<typeof globalThis, "AssetsItemArmsHempRopeBeforeDraw">>>[0][0];
            const { C: origC, CA, GroupName: groupName, Property: origProp, L } = params;
            const C = origC as OtherCharacter;
            const Property = origProp as PropertiesWithLayerOverrides;
            const ret = CommonCallFunctionByName(...args) ?? {};

            if (this.Enabled && !!CA && isDrawingOverridable(CA) && !!Property) {
                let layerName = L.trim();
                if (layerName[0] == "_")
                    layerName = layerName.slice(1);
                const layerIx = CA.Asset.Layer.findIndex(l => (l.Name ?? "") == layerName);

                let xOverride = Property?.LayerOverrides?.[layerIx]?.DrawingLeft?.[PoseType.DEFAULT] ?? undefined;
                let yOverride = Property?.LayerOverrides?.[layerIx]?.DrawingTop?.[PoseType.DEFAULT] ?? undefined;

                // Adjust for pose. BIGGER change would be to actually save the lscg translate as offsets instead of overrides... which... should be done but will suck >.<
                if (!!xOverride || !!yOverride) {
                    for (const drawPose of C.DrawPose) {
                        const PoseDef = PoseRecord[drawPose];
                        if (PoseDef && PoseDef.MovePosition) {
                            const MovePosition = PoseDef.MovePosition.find(MP => MP.Group === groupName);
                            if (MovePosition) {
                                if (xOverride) xOverride += MovePosition.X;
                                if (yOverride) yOverride += MovePosition.Y;
                            }
                        }
                    }
                }

                if (xOverride) ret.X = xOverride;
                if (yOverride) ret.Y = yOverride + CanvasUpperOverflow;
            }
            return ret;
        }, ModuleCategory.Opacity);
    }

    run() {
        hookFunction("CommonDrawAppearanceBuild", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            if (this.Enabled) {
                C.Appearance?.forEach(item => {
                    const A = item.Asset;
                    if (isDrawingOverridable(A) || IsSoulBind(item)) {
                        (A as any).DynamicBeforeDraw = true;
                    }
                });
            }
            // Hack fix in case the body style was actually removed
            if (InventoryGet(C, "BodyStyle") == null) {
                InventoryWear(C, "Original", "BodyStyle");
            }
            return next(args);
        }, ModuleCategory.Opacity);

        patchFunction("CharacterAppearanceVisible", {
            "const Excluded = HideItemExclude?.includes(GroupName + AssetName);" :
            "const Excluded = !((item.Property != null) && (item.Property.Hide != null) && (item.Property.Hide.indexOf(GroupName) >= 0)) && HideItemExclude?.includes('*') || HideItemExclude?.includes(GroupName + AssetName);",
        });

        // Prevent see-through items from contributing cross-group alpha masks (GroupAlpha) to other layers.
        // The CharacterAppearanceSortLayers hook sets HideItemExclude=["*"] before next() runs, so the flag
        // is already present when BC accumulates groupAlphas inside CharacterAppearanceSortLayers.
        patchFunction("CharacterAppearanceSortLayers", {
            "drawLayer.Alpha.forEach(alpha => {": "if (!item.Property?.HideItemExclude?.includes('*')) drawLayer.Alpha.forEach(alpha => {",
        });

        hookFunction("CommonDrawApplyLayerAlphaMasks", 1, (args, next) => {
            const [C, layer] = args as unknown as [OtherCharacter, AssetLayer, ...unknown[]];
            if (this.Enabled) {
                const item = C.DrawAppearance?.find(i => i.Asset === layer.Asset);
                if (item && this.isSeeThrough(item, C)) {
                    return;
                }
            }
            return next(args);
        }, ModuleCategory.Opacity);

        hookFunction("AssetLayerSort", 1, (args, next) => {
            const ret = next(args);
            if (this.Enabled) {
                ret.forEach((layer: AssetLayer) => {
                    (layer.MinOpacity as any) = 0;
                });
            }
            return ret;
        }, ModuleCategory.Opacity);

        hookFunction("CharacterAppearanceSortLayers", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            if (!C || !this.Enabled)
                return next(args);

            C.DrawAppearance?.forEach(item => {
                if (this.isSeeThrough(item, C)) {
                    if (!item.Property)
                        item.Property = {};
                    // @ts-expect-error: Exclude from BC's HideItem system to prevent it from overriding the LSCG opacity changes
                    item.Property.HideItemExclude = ["*"];
                }

                if (item.Asset.Name == "Penis") {
                    const xrayActive = getModule<StateModule>("StateModule")?.XRayState?.Active && getModule<StateModule>("StateModule")?.XRayState?.CanViewXRay(C);
                    const transpPants = !!this.getOpacity(InventoryGet(C, "ClothLower"));
                    const transpUnderwear = !!this.getOpacity(InventoryGet(C, "Panties"));
                    if ((xrayActive || transpPants || transpUnderwear) && (!item.Property || !item.Property?.OverridePriority)) {
                        if (!item.Property)
                            item.Property = {};
                        item.Property.OverridePriority = 18;
                    }
                }
            });
            return next(args);
        }, ModuleCategory.Opacity);
    }

    private isSeeThrough(item: Item, C: OtherCharacter): boolean {
        const xray = getModule<StateModule>("StateModule")?.XRayState;
        const xrayActive = xray?.Active && xray?.CanViewXRay(C);
        const opacity = this.getOpacity(item);
        let hasOpacitySettings = false;
        if (typeof opacity === "number") {
            hasOpacitySettings = item.Asset.Layer.some(l => l.Opacity !== opacity);
        } else if (Array.isArray(opacity)) {
            hasOpacitySettings = !opacity.every((opac, i) => opac === item.Asset.Layer[i]?.Opacity);
        }
        return (hasOpacitySettings || !!xrayActive || IsSoulBind(item)) && !item.Property?.LSCGLeadLined;
    }

    getOpacity(item?: null): number[];
    getOpacity(item?: Item | null): number | number[] | undefined;
    getOpacity(item?: Item | null): number | number[] | undefined {
        if (!item)
            item = this.OpacityItem;
        return this.getOpacityFromProperties(item);
    }

    getOpacityFromProperties(item?: null | Item): number | number[] | undefined {
        if (item?.Property?.LSCGOpacity != null) {
            const sanitizedProps = Object.assign(item.Property, ItemColorSanitizeProperty(item));
            this.setOpacityInProperty(item.Asset, sanitizedProps, item.Property.LSCGOpacity);
        }
        return item?.Property?.Opacity ?? 1;
    }

    setOpacity(item: ItemColorItem, value: number | number[]) {
        this.setOpacityInProperty(item.Asset, item.Property, value);
    }

    setOpacityInProperty(asset: Asset, props: ItemColorProperties, value: number | number[]) {
        if (typeof value === "number") {
            value = Array(asset.Layer.length).fill(value);
        }
        for (const [i, layer] of asset.Layer.entries()) {
            if (i >= value.length || i >= props.Opacity.length) {
                break;
            }
            props.Opacity[i] = CommonClamp(value[i], 0, layer.MaxOpacity);
        }
        if (props.LSCGOpacity)
            delete props.LSCGOpacity;
    }

    isDragging: boolean = false;

    TranslateStart(elem: HTMLElement, evt: PointerEvent) {
        if (this.TransformMode && MouseIn(700, 0, 500, 1000)) {
            this.isDragging = true;
            this.lastX = MouseX;
            this.lastY = MouseY;
        }
        elem.setPointerCapture(evt.pointerId);
        const ui = document.getElementById(ID.root);
        if (ui) {
            ui.classList.add("lscg-translate-dragging");
        }
    }

    TranslateMove(elem: HTMLElement, evt: PointerEvent) {
        if (!this.isDragging || !this.TransformMode) return;

        const mX = Math.min(Math.max(MouseX, 700), 1200);
        const mY = Math.min(Math.max(MouseY, 0), 1000);
        const changes = this.activeTransform().drag(mX - this.lastX, mY - this.lastY, evt.shiftKey || evt.altKey);
        changes.forEach(([axis, delta]) => this.applyDelta(axis, delta));
        this.lastX = mX;
        this.lastY = mY;
        this.UpdatePreview();
    }

    TranslateEnd(elem: HTMLElement, evt: PointerEvent) {
        elem.releasePointerCapture(evt.pointerId);
        this.isDragging = false;
        const ui = document.getElementById(ID.root);
        if (ui) {
            ui.classList.remove("lscg-translate-dragging");
        }
    }

    OpacityChange(slider: OpacitySlider) {
        const value = Math.round(this._updateOpacityValue(slider.ElementId) * 100);
        slider.Value = value;
        document.getElementById(slider.ElementId + "_Text")?.setAttribute("value", value);
        this.UpdatePreview();
    }

    OpacityTextChange(slider: OpacitySlider) {
        const value = Math.round(this._updateOpacityValue(slider.ElementId + "_Text") * 100);
        slider.Value = value;
        document.getElementById(slider.ElementId)?.setAttribute("value", value);
        this.UpdatePreview();
    }

    private get itemProperty(): Record<string, any> {
        return (this.OpacityItem!.Property ??= {} as ItemColorProperties) as Record<string, any>;
    }

    private layerName(layer: number): string {
        return this.OpacityItem!.Asset.Layer[layer]?.Name ?? "";
    }

    /** Translation is LSCG's own per-layer `LayerOverrides` (absolute draw positions); asset layer defaults fill the gaps. */
    private readTranslation(prop: "DrawingLeft" | "DrawingTop", layer: number): number {
        const ix = Math.max(layer, 0);
        const assetLayer = AssetGet("Female3DCG", this.OpacityItem!.Asset.Group.Name, this.OpacityItem!.Asset.Name)?.Layer[ix] ?? this.OpacityItem!.Asset.Layer[ix];
        const override = (this.itemProperty as PropertiesWithLayerOverrides).LayerOverrides?.[ix]?.[prop];
        return (override ?? assetLayer[prop])?.[PoseType.DEFAULT] ?? assetLayer[prop][PoseType.DEFAULT];
    }

    private writeTranslation(prop: "DrawingLeft" | "DrawingTop", layer: number, value: number) {
        const properties = this.itemProperty as PropertiesWithLayerOverrides;
        const layerCount = this.OpacityItem!.Asset.Layer.length;
        if (!properties.LayerOverrides || properties.LayerOverrides.length != layerCount) {
            const previous = Object.assign({}, properties.LayerOverrides);
            properties.LayerOverrides = [];
            for (let i = 0; i < layerCount; i++) {
                if (previous[i])
                    properties.LayerOverrides.push(previous[i]);
                else {
                    const defaultLayer = this.OpacityItem!.Asset.Layer[i];
                    properties.LayerOverrides.push({
                        DrawingLeft: defaultLayer.DrawingLeft,
                        DrawingTop: defaultLayer.DrawingTop,
                    });
                }
            }
        }
        const targets = layer < 0 ? properties.LayerOverrides : [properties.LayerOverrides[layer]];
        targets.forEach(lo => lo[prop] = { "": value });
    }

    /** Rotation and scale are BC's own: item-wide `Rotation`/`ScaleX`/`ScaleY`, with `Layer*` records by layer name on top
     *  (rotation adds, scale multiplies). Values at their default are removed rather than saved. */
    private readNative(prop: NativeTransform, layer: number): number {
        const p = this.itemProperty;
        return (layer < 0 ? p[prop] : p[`Layer${prop}`]?.[this.layerName(layer)]) ?? (prop === "Rotation" ? 0 : 1);
    }

    private writeNative(prop: NativeTransform, layer: number, value: number) {
        const p = this.itemProperty;
        const isDefault = value === (prop === "Rotation" ? 0 : 1);
        if (layer < 0) {
            if (isDefault) delete p[prop];
            else p[prop] = value;
            return;
        }
        const key = `Layer${prop}`;
        const record = p[key] ??= {};
        if (isDefault) delete record[this.layerName(layer)];
        else record[this.layerName(layer)] = value;
        if (!Object.keys(record).length) delete p[key];
    }

    private nativeAxis(prop: NativeTransform, label: string, min: number, max: number, step: number, fine: number, big: number, dec: string, inc: string): TransformAxis {
        const round = (v: number) => CommonClamp(Math.round(v / step) * step, min, max);
        return {
            label, min, max, step, fine, big, decLabel: dec, incLabel: inc,
            read: layer => this.readNative(prop, layer),
            write: (layer, value) => this.writeNative(prop, layer, Math.round(round(value) * 100) / 100),
        };
    }

    private _transforms: Record<Exclude<Tab, "opacity">, TransformTab> | undefined;
    private get transforms(): Record<Exclude<Tab, "opacity">, TransformTab> {
        return this._transforms ??= {
            translate: {
                axes: [
                    { label: "X", min: -2000, max: 2000, step: 1, fine: 1, big: 10, decLabel: "◀", incLabel: "▶",
                        read: l => this.readTranslation("DrawingLeft", l), write: (l, v) => this.writeTranslation("DrawingLeft", l, Math.round(v)) },
                    { label: "Y", min: -2000, max: 2000, step: 1, fine: 1, big: 10, decLabel: "▲", incLabel: "▼",
                        read: l => this.readTranslation("DrawingTop", l), write: (l, v) => this.writeTranslation("DrawingTop", l, Math.round(v)) },
                ],
                hint: "Drag the character, or use the arrow keys (shift for bigger steps).",
                keys: { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [1, -1], ArrowDown: [1, 1] },
                drag: (dx, dy) => [[0, dx], [1, dy]],
            },
            rotate: {
                axes: [this.nativeAxis("Rotation", "Angle", -180, 180, 1, 1, 10, "↺", "↻")],
                hint: "Drag the character left or right, or use the arrow keys (shift for bigger steps). A layer's angle adds to All Layers.",
                keys: { ArrowLeft: [0, -1], ArrowDown: [0, -1], ArrowRight: [0, 1], ArrowUp: [0, 1] },
                drag: dx => [[0, dx / 2]],
            },
            scale: {
                axes: [
                    this.nativeAxis("ScaleX", "Width", 0.01, 3, 0.01, 0.01, 0.1, "−", "+"),
                    this.nativeAxis("ScaleY", "Height", 0.01, 3, 0.01, 0.01, 0.1, "−", "+"),
                ],
                hint: "Drag the character: sideways for width, up and down for height, or both together while holding Shift (right or up for bigger). Arrow keys work too: shift for bigger steps, Alt to change both. A layer's scale multiplies All Layers.",
                keys: { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowDown: [1, -1], ArrowUp: [1, 1] },
                syncKeys: { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 },
                drag: (dx, dy, linked) => linked ? [[0, (dx - dy) / 200], [1, (dx - dy) / 200]] : [[0, dx / 200], [1, -dy / 200]],
            },
        };
    }

    activeTransform(): TransformTab {
        return this.transforms[this.ActiveTab as Exclude<Tab, "opacity">];
    }

    /** Rebuilds the number boxes and buttons for the active transform tab. */
    buildTransformFields() {
        const fields = document.getElementById(ID.transformFields);
        const hint = document.getElementById(ID.transformHint);
        if (!fields || !this.OpacityItem) return;
        const tab = this.activeTransform();
        if (hint) hint.textContent = tab.hint;
        this.axisInputs = tab.axes.map((axis, i) => <input type="number" aria-label={axis.label} min={axis.min} max={axis.max} step={axis.step}
            onChange={(evt: Event) => this.onAxisInput(i, evt.target as HTMLInputElement)} /> as HTMLInputElement);
        fields.replaceChildren(...tab.axes.map((axis, i) => <div class="lscg-transform-axis">
            <span class="lscg-transform-label">{axis.label}</span>
            <div>
                {Button(axis.decLabel, () => this.applyDelta(i, -axis.big, true), { ariaLabel: `${axis.label} down` })}
                {this.axisInputs[i]}
                {Button(axis.incLabel, () => this.applyDelta(i, axis.big, true), { ariaLabel: `${axis.label} up` })}
            </div>
        </div>), ElementButton.Create(`${root}-transform-reset`, () => this.resetTransform(), { image: "./Icons/Reset.png", tooltip: "Reset", tooltipPosition: "bottom" }, { button: { classList: ["lscg-button"] } }));
        this.refreshTransformFields();
    }

    refreshTransformFields() {
        if (!this.OpacityItem || !this.TransformMode) return;
        const axes = this.activeTransform().axes;
        this.axisInputs.forEach((input, i) => {
            if (document.activeElement !== input) input.value = String(Math.round(axes[i].read(this.SelectedLayer) * 100) / 100);
        });
    }

    onAxisInput(axis: number, input: HTMLInputElement) {
        const a = this.activeTransform().axes[axis];
        const value = parseFloat(input.value);
        if (Number.isFinite(value)) a.write(this.SelectedLayer, CommonClamp(value, a.min, a.max));
        this.refreshTransformFields();
        this.UpdatePreview();
    }

    /** Changes one axis of the selected layer (or every layer) by `delta`. */
    applyDelta(axis: number, delta: number, preview: boolean = false) {
        if (!this.OpacityItem) return;
        const a = this.activeTransform().axes[axis];
        a.write(this.SelectedLayer, CommonClamp(a.read(this.SelectedLayer) + delta, a.min, a.max));
        this.refreshTransformFields();
        if (preview) this.UpdatePreview();
    }

    resetTransform() {
        if (!this.OpacityItem?.Property) return;
        const layers = this.SelectedLayer < 0 ? [-1, ...this.OpacityItem.Asset.Layer.keys()] : [this.SelectedLayer];
        if (this.ActiveTab === "translate") {
            const overrides = (this.itemProperty as PropertiesWithLayerOverrides).LayerOverrides;
            this.OpacityItem.Asset.Layer.forEach((layer, i) => {
                if (!overrides?.[i] || !layers.includes(i)) return;
                overrides[i].DrawingLeft = layer.DrawingLeft ?? { [PoseType.DEFAULT]: 1 };
                overrides[i].DrawingTop = layer.DrawingTop ?? { [PoseType.DEFAULT]: 1 };
            });
        } else {
            const reset = (this.ActiveTab === "rotate" ? ["Rotation"] : ["ScaleX", "ScaleY"]) as NativeTransform[];
            layers.forEach(l => reset.forEach(prop => this.writeNative(prop, l, prop === "Rotation" ? 0 : 1)));
        }
        this.refreshTransformFields();
        this.UpdatePreview();
    }

    _updateOpacityValue(fromElementId: string): number {
        if (!this.OpacityItem)
            return 1;

        const value = Math.round(parseFloat(ElementValue(fromElementId))) / 100;
        const mainValue = Math.round(parseFloat(ElementValue(this.OpacityMainSlider.ElementId + "_Number"))) / 100;
        if (fromElementId == this.OpacityMainSlider.ElementId + "_Range" || fromElementId == this.OpacityMainSlider.ElementId + "_Number") {
            // Closing the color picker will automatically shrink the array to a number/undefined if appropriate (see `ItemColorFireExit()`)
            this.setOpacity(this.OpacityItem, value);
            if (value > 1) {
                // TODO: Is this property still used or relevant in this context?
                delete this.OpacityItem.Property.LSCGOpacity;
            }
        } else {
            let opacityArr = this.getOpacity();
            if (!Array.isArray(opacityArr))
                opacityArr = new Array(this.OpacityLayerSliders.length).fill(mainValue);
            const ix = this.OpacityLayerSliders.findIndex(s => s.ElementId + "_Range" == fromElementId || s.ElementId + "_Number" == fromElementId);
            opacityArr[ix] = value;
            this.setOpacity(this.OpacityItem, opacityArr);
        }

        return value;
    }

    UpdatePreview = CommonLimitFunction(() => {
        if (this.OpacityCharacter)
            CharacterLoadCanvas(this.OpacityCharacter);
    }, 10, 99);

    TranslateAttachEventListener() {
        const CanvasElement = document.getElementById("MainCanvas");
        if (!CanvasElement)
            return;

        const controller = this.listenerRemover = new AbortController();
        CanvasElement.addEventListener("pointerdown", evt => this.TranslateStart(CanvasElement, evt), { signal: controller.signal });
        CanvasElement.addEventListener("pointermove", evt => this.TranslateMove(CanvasElement, evt), { signal: controller.signal });
        CanvasElement.addEventListener("pointerup", evt => this.TranslateEnd(CanvasElement, evt), { signal: controller.signal });
        CanvasElement.addEventListener("pointercancel", evt => this.TranslateEnd(CanvasElement, evt), { signal: controller.signal });

        // Arrow keys nudge the active transform (shift for the bigger step, Alt to change linked axes together), unless typing in a field.
        // Not Ctrl or Cmd: with arrows those are system shortcuts on a Mac (spaces, Mission Control).
        window.addEventListener("keydown", evt => {
            if (!this.TransformMode || evt.ctrlKey || evt.metaKey) return;
            if (evt.target instanceof HTMLInputElement || evt.target instanceof HTMLTextAreaElement || evt.target instanceof HTMLSelectElement) return;
            const tab = this.activeTransform();
            const sync = evt.altKey ? tab.syncKeys?.[evt.key] : undefined;
            const key = tab.keys[evt.key];
            if (evt.altKey ? !sync : !key) return;
            evt.preventDefault(); // also keeps Alt+arrow from navigating the browser back or forward
            if (sync) {
                tab.axes.forEach((axis, i) => this.applyDelta(i, sync * (evt.shiftKey ? axis.big : axis.fine)));
                this.UpdatePreview();
                return;
            }
            const axis = tab.axes[key![0]];
            this.applyDelta(key![0], key![1] * (evt.shiftKey ? axis.big : axis.fine), true);
        }, { signal: controller.signal });

        // Propagate the vanilla BC opacity slider changes to LSCG
        const rootID: string = ColorPicker.ids.root;
        const opacityModule = this;
        document.querySelector(`#${rootID} input[name="opacity"]`)?.addEventListener(
            "input",
            function (this: HTMLInputElement, ev: Event) {
                if (!opacityModule.OpacityItem) {
                    return;
                }

                const allLayers = ItemColorGetColorableLayers(opacityModule.OpacityItem);
                const selectors = ItemColorPickerIndices.flatMap(i => {
                    // Grab all layers that map to the same `Item.Color` array index (see the layer's `CopyLayerColor` property)
                    const copyColorLayers = allLayers[i].Asset.Layer.filter(l => l.ColorIndex === i);
                    return copyColorLayers.flatMap(layer => {
                        const name = `${ID.opacityLayers}_${kebabCase(layer.Name ?? layer.Asset.Name)}`;
                        return [`#${name}_Range`,`#${name}_Number`];
                    });
                });
                if (allLayers.length === ItemColorPickerIndices.length) { // If we're changing the entire item/all layers
                    selectors.push(`input[id*="${opacityModule.OpacityMainSlider.ElementId}"]`);
                }
                const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(selectors.join(", "));
                inputs.forEach(lscgInput => lscgInput.valueAsNumber = Math.round(this.valueAsNumber * (100 / 255)));
            },
        );
    }

    TranslateRemoveEventListener() {
        const CanvasElement = document.getElementById("MainCanvas");
        if (!CanvasElement)
            return;

        // Remove the translation listeners
        this.listenerRemover?.abort();
        this.listenerRemover = null;
    }
}
