import { BaseModule } from "base";
import { getModule } from "modules";
import { OpacitySettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { LSCG_TEAL, hookFunction, isCloth, mouseTooltip } from "../utils";
import { StateModule } from "./states";
import { drawTooltip } from "Settings/settingUtils";

interface OpacitySlider {
    ElementId: string;
    Element: HTMLInputElement | null;
    TextElement: HTMLInputElement | null;
    LabelId: string;
    Label: HTMLLabelElement | null;
    Value: number;
}

interface TranslationValue {
    layerName: string;
    xValue: number;
    yValue: number;
}

interface PropertiesWithLayerOverrides extends ItemProperties {
    LayerOverrides: any[];
}

export class OpacityModule extends BaseModule {
    OpacityMainSlider: OpacitySlider = {
        ElementId: "LSCG_OpacitySlider",
        Element: null,
        TextElement: null,
        LabelId: "LSCG_OpacitySlider_Label",
        Label: null,
        Value: 0
    };
    OpacityLayerSliders: OpacitySlider[] = [];

    OpacityItem: Item | null = null;
    OpacityCharacter: OtherCharacter | null = null;
    opacityAllLayer: boolean = false;

    TranslationMode: boolean = false;
    TranslationButtons: TranslationValue[] = [];
    SelectedTranslationLayer: number = -1;
    TranslateXElementId: string = "LSCG_TranslateX";
    TranslateYElementId: string = "LSCG_TranslateY";
    TranslateXElement: HTMLInputElement | undefined;
    TranslateYElement: HTMLInputElement | undefined;
    lastX: number = 0;
    lastY: number = 0;

    get settings(): OpacitySettingsModel {
        return super.settings as OpacitySettingsModel;
	}

    get defaultSettings() {
        return <OpacitySettingsModel>{
            enabled: true,
            preventExternalMod: false
        };
    }

    CanChangeOpacityOnCharacter(C: OtherCharacter): boolean {
        return C.IsPlayer() || !(C.LSCG?.OpacityModule?.preventExternalMod ?? false);
    }

    load(): void {
        hookFunction("ItemColorLoad", 1, (args, next) => {
            next(args);
            let C = args[0] as OtherCharacter;
            let Item = args[1] as Item;
            if (this.CanChangeOpacityOnCharacter(C) && isCloth(Item)) {
                this.OpacityCharacter = C;
                this.OpacityItem = Item;

                this.OpacityMainSlider.Element = ElementCreateRangeInput(this.OpacityMainSlider.ElementId, 100, 0, 100, 1);
                this.OpacityMainSlider.Element.addEventListener("input", (e) => this.OpacityChange(this.OpacityMainSlider));
                this.OpacityMainSlider.TextElement = ElementCreateInput(this.OpacityMainSlider.ElementId + "_Text", "number", this.OpacityMainSlider.Value + "");
                ElementSetAttribute(this.OpacityMainSlider.ElementId + "_Text", "min", "0");
                ElementSetAttribute(this.OpacityMainSlider.ElementId + "_Text", "max", "100");
                ElementSetAttribute(this.OpacityMainSlider.ElementId + "_Text", "step", "1");
                this.OpacityMainSlider.TextElement.addEventListener("input", (e) => this.OpacityTextChange(this.OpacityMainSlider));
                this.OpacityMainSlider.Label = this.CreateOpacityLabel(this.OpacityMainSlider.LabelId, this.OpacityMainSlider.ElementId);
                ElementPosition(this.OpacityMainSlider.ElementId, -999, -999, 300, 20);
                ElementPosition(this.OpacityMainSlider.ElementId + "_Text", -999, -999, 300, 20);
                ElementPosition(this.OpacityMainSlider.LabelId, -999, -999, 300, 20);

                this.CreateTranslationInputElements();
                this.TranslateRemoveEventListener();
                this.TranslateAttachEventListener();

                this.OpacityLayerSliders = [];
                this.TranslationButtons = [];
                if (this.OpacityItem.Asset.Layer.length > 0) {
                    this.OpacityItem.Asset.Layer.forEach(l => {
                        this.OpacityLayerSliders.push(this.CreateOpacitySlider(l))
                        this.TranslationButtons.push(this.CreateTranslationButton(l))
                    });
                }

                if (!this.TranslationMode) {
                    if (Array.isArray(this.getOpacity())) {
                        this.opacityAllLayer = true;
                        this.DrawOpacityLayerSliders();
                    } else {
                        this.opacityAllLayer = false;
                        this.DrawMainOpacitySlider();
                    }
                }
                else {
                    this.DrawTranslationButtons();
                }
            }
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorFireExit", 1, (args, next) => {
            next(args);
            this.OpacityCharacter = null;
            this.OpacityItem = null;
            ElementRemove(this.OpacityMainSlider.ElementId);
            ElementRemove(this.OpacityMainSlider.ElementId + "_Text");
            ElementRemove(this.OpacityMainSlider.LabelId);
            this.OpacityLayerSliders.forEach(s => {
                ElementRemove(s.ElementId);
                ElementRemove(s.ElementId + "_Text");
                ElementRemove(s.LabelId);
            });
            this.OpacityLayerSliders = [];
            this.TranslationButtons = [];
            this.TranslationMode = false;
            ElementRemove(this.TranslateXElementId);
            ElementRemove(this.TranslateYElementId);
            this.TranslateRemoveEventListener();
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorDraw", 1, (args, next) => {
            if (this.OpacityCharacter && this.OpacityItem && isCloth(this.OpacityItem)) {
                let prev = MainCanvas.textAlign;
                MainCanvas.textAlign = "left";
                
                if (this.CanChangeOpacityOnCharacter(this.OpacityCharacter)) {
                    // Draw "All Layers" checkbox
                    if (this.OpacityItem.Asset?.Layer.length > 1) {
                        DrawCheckbox(50, 120 - 32, 64, 64, "", this.opacityAllLayer, this.TranslationMode || this.OpacityItem.Asset?.Layer.length <= 1);
                        DrawTextFit("All Layers", 120, 120, 300, "White", "Gray");
                        if (MouseIn(50, 120 - 32, 64, 64)) 
                            drawTooltip(50, 150, 800, "Modify opacity levels for each asset layer", "left");
                    }

                    // Draw "All Layers" checkbox
                    DrawCheckbox(350, 120 - 32, 64, 64, "", this.OpacityItem?.Property?.LSCGLeadLined ?? false, this.TranslationMode);
                    DrawTextFit("Lead-Lined", 420, 120, 300, "White", "Gray");
                    if (MouseIn(350, 120 - 32, 64, 64)) 
                        drawTooltip(50, 150, 800, "Line this item with x-ray blocking lead.", "left");
                }

                // Draw "Translate" checkbox
                DrawCheckbox(650, 120 - 32, 64, 64, "", this.TranslationMode ?? false);
                DrawTextFit("Translate", 720, 120, 300, "White", "Gray");
                if (MouseIn(650, 120 - 32, 64, 64)) 
                    drawTooltip(50, 150, 800, "Switch to x/y translation mode.", "left");

                if (!!this.OpacityItem && this.TranslationMode) {
                    DrawButton(1020, 180 - 32, 64, 64, "", "White", undefined, "Reset", false);
                    DrawImageResize("Icons/Reset.png", 1020, 180 - 32, 64, 64);
                    MainCanvas.textAlign = "center";
                    DrawButton(20, 260, 300, 64, "All", this.SelectedTranslationLayer < 0 ? LSCG_TEAL : "White", undefined, undefined, false);
                    if (this.OpacityItem.Asset.Layer.length > 1) {
                        this.OpacityItem.Asset.Layer.forEach((layer, ix, arr) => {
                            let xMod = Math.floor(ix / 8);
                            let yMod = (ix % 7) + 1;
                            DrawButton(20 + (xMod * 420), 260 + (yMod * 100), 300, 64, layer.Name ?? "", this.SelectedTranslationLayer == ix ? LSCG_TEAL : "White", undefined, undefined, false);
                        });
                    }
                }

                MainCanvas.textAlign = prev;
            }
            next(args);
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorClick", 1, (args, next) => {
            next(args);
            if (this.OpacityCharacter && this.OpacityItem && isCloth(this.OpacityItem)) {
                if (this.CanChangeOpacityOnCharacter(this.OpacityCharacter)) {
                    if (!this.TranslationMode && this.OpacityItem.Asset?.Layer.length > 1 && MouseIn(50, 120 - 32, 64, 64)) {
                        this.opacityAllLayer = !this.opacityAllLayer;        
                        this.ShowOpacitySliders();
                        this.UpdatePreview();
                    } else if (!this.TranslationMode && MouseIn(350, 120 - 32, 64, 64)) {
                        if (!this.OpacityItem.Property)
                            this.OpacityItem.Property = {};
                        this.OpacityItem.Property.LSCGLeadLined = !this.OpacityItem.Property.LSCGLeadLined;
                    } 
                }
                if (MouseIn(650, 120 - 32, 64, 64)) {
                    this.TranslationMode = !this.TranslationMode;
                    if (this.TranslationMode) {
                        this.DrawTranslationButtons();
                    }
                    else {
                        this.HideTranslateElements();
                        if (this.opacityAllLayer) {
                            this.DrawOpacityLayerSliders();
                        } else {
                            this.DrawMainOpacitySlider();
                        }
                    }
                } else if (this.TranslationMode) {
                    if (MouseIn(20, 260, 300, 64)) {
                        this.SelectedTranslationLayer = -1;
                        this.SetTranslationElementValues();
                    } else if (MouseIn(1020, 180-32, 64, 64)) {
                        this.ResetTranslation();
                    } else if (this.OpacityItem.Asset.Layer.length > 1) {
                        this.OpacityItem.Asset.Layer.forEach((layer, ix, arr) => {
                            let xMod = Math.floor(ix / 8);
                            let yMod = (ix % 7) + 1;
                            if (MouseIn(20 + (xMod * 420), 260 + (yMod * 100), 300, 64)) {
                                this.SelectedTranslationLayer = ix;
                                this.SetTranslationElementValues();
                            }
                        });
                        
                    }
                }
            }
        }, ModuleCategory.Opacity);
        
        hookFunction("CommonCallFunctionByNameWarn", 2, (args, next) => {
            let funcName = args[0];
            let params = args[1];
            if (!params) {
                return next(args);
            }
            let C = params['C'] as OtherCharacter;
            let CA = params['CA'] as Item;
            let Property = params['Property'];
            let regex = /Assets(.+)BeforeDraw/i;
            if (regex.test(funcName)) {
                let ret = CommonCallFunctionByName(args[0], args[1]) ?? {};
                if (this.Enabled && !!CA && isCloth(CA) && !!Property) {
                    let layerName = (params['L'] as string ?? "").trim();
                    if (layerName[0] == '_')
                        layerName = layerName.slice(1);
                    let layerIx = CA.Asset.Layer.findIndex(l => l.Name == layerName);
                    let originalLayerOpacity = CA.Asset.Layer[layerIx]?.Opacity ?? CA.Asset.Opacity ?? 1;
                    let overrideOpacity = (Array.isArray(Property?.LSCGOpacity) ? Property?.LSCGOpacity[layerIx] : Property?.LSCGOpacity) ?? undefined;
                    if (overrideOpacity !== undefined) {
                        ret.Opacity = Math.max((ret.Opacity ?? Property.Opacity ?? 1), (overrideOpacity ?? originalLayerOpacity ?? 1));
                    }

                    let xOverride = Property?.LayerOverrides?.[layerIx]?.DrawingLeft?.[PoseType.DEFAULT] ?? undefined;
                    let yOverride = Property?.LayerOverrides?.[layerIx]?.DrawingTop?.[PoseType.DEFAULT] ?? undefined;
                    if (!!xOverride) ret.X = xOverride;
                    if (!!yOverride) ret.Y = yOverride + CanvasUpperOverflow;
                }
                return ret
            } else
                return next(args);
        }, ModuleCategory.Opacity);
    }

    run() {
        hookFunction("CommonDrawAppearanceBuild", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            let callbacks = args[1];
            if (this.Enabled) {
                C.AppearanceLayers?.forEach((Layer) => {
                    const A = Layer.Asset;
                    if (isCloth(A)) {
                        (<any>A).DynamicBeforeDraw = true;
                    }
                });
            }
            return next(args);
        }, ModuleCategory.Opacity);

        // hookFunction("AppearanceItemParse", 1, (args, next) => {
        //     if (!this.Enabled)
        //         return next(args);
                
        //     let stringified = args[0];
        //     let tempAppearance = JSON.parse(stringified) as Item[] | Item;
        //     let propertiesByAsset = new Map<string, any>();
        //     if (Array.isArray(tempAppearance))
        //         tempAppearance.forEach(item => propertiesByAsset.set((<any>item.Asset as string), item.Property));
        //     else {
        //         propertiesByAsset.set((<any>tempAppearance.Asset as string), tempAppearance.Property)
        //     }
        //     return JSON.parse(stringified, (key: string, value: any) =>                                                                                                  {
        //         if (key === "Asset") {
        //             const FGA = value.split("/");
        //             let asset = AssetGet(FGA[0], FGA[1], FGA[2]); // make our own copy of asset obj
        //             let layerOverrides = propertiesByAsset.get(value)?.LayerOverrides ?? undefined;
        //             if (!!asset && !!layerOverrides) {
        //                 (<any>asset).BackupLayer = Object.assign({}, asset.Layer);
        //                 asset.Layer.forEach((layer, ix, arr) => {
        //                     let overrides = layerOverrides[ix];
        //                     if (!!overrides) Object.assign(layer, overrides);
        //                 });
        //             }
        //             return asset;
        //         }
        //         return value;
        //     });
        // }, ModuleCategory.Opacity);

        hookFunction("CharacterAppearanceSortLayers", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            if (!C.MemberNumber || !this.Enabled)
                return next(args);

            let xray = getModule<StateModule>("StateModule")?.XRayState;
            let xrayActive = xray?.Active && xray?.CanViewXRay(C);
            C.DrawAppearance?.forEach(item => {
                let opacity = this.getOpacity(item)
                let hasOpacitySettings = opacity !== undefined && opacity != 1;
                if ((hasOpacitySettings || xrayActive) && !item.Property?.LSCGLeadLined) {
                    item.Asset = Object.assign({}, item.Asset);
                    (<any>item.Asset).Layer = item.Asset.Layer.map(l => Object.assign({}, l));
                    item?.Asset?.Layer?.forEach(layer => {
                        (<any>layer).Alpha = [];
                    });
                    (<any>item.Asset).Hide = [];
                    (<any>item.Asset).HideItem = [];
                    (<any>item.Asset).HideItemAttribute = [];
                } else {
                    let defaultAsset = AssetMap.get(`${item?.Asset?.Group?.Name}/${item.Asset.Name}`);
                    if (!!defaultAsset) {
                        item.Asset = Object.assign({}, defaultAsset);
                        (<any>item.Asset).Layer = defaultAsset.Layer.map(l => Object.assign({}, l));
                    }
                }

                if (item.Asset.Name == "Penis") {
                    let transpPants = !!this.getOpacity(InventoryGet(C, "ClothLower"));
                    let transpUnderwear = !!this.getOpacity(InventoryGet(C, "Panties"));
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

    getOpacity(item?: Item | null): number | number[] | undefined {
        if (!item)
            item = this.OpacityItem;
        return this.getOpacityFromProperties(item?.Property);
        
    }

    getOpacityFromProperties(props?: ItemProperties | null): number | number[] | undefined {
        if (!!props && !!props.LSCGOpacity)
            this.setOpacityInProperty(props, props.LSCGOpacity);
        return props?.Opacity ?? 1;
    }

    setOpacity(item: Item, value: number | number[]) {
        if (!item.Property)
            item.Property = {};
        this.setOpacityInProperty(item.Property, value);
    }

    setOpacityInProperty(props: ItemProperties, value: number | number[]) {
        props.Opacity = value;
        if (!!props.LSCGOpacity)
            delete props.LSCGOpacity;
    }

    isDragging: boolean = false;
    TranslateStart(evt: TouchEvent | MouseEvent) {
        if (isTouchEvent(evt) && evt.changedTouches) {
            if (evt.changedTouches.length > 1) return;
        }
        ColorPickerGetCoordinates(evt);      
        if (this.TranslationMode && MouseIn(700, 0, 500, 1000)) {
            this.isDragging = true;
            this.lastX = MouseX;
            this.lastY = MouseY;
        }
    }

    TranslateMove(evt: TouchEvent | MouseEvent) {
        if (!this.isDragging || !this.TranslationMode) return;
        if (isTouchEvent(evt) && evt.changedTouches) {
            if (evt.changedTouches.length > 1) return;
        }
        
        ColorPickerGetCoordinates(evt);
        let mX = Math.min(Math.max(MouseX, 700), 1200);
        let mY = Math.min(Math.max(MouseY, 0), 1000);
        let dX = mX - this.lastX;
        let dY = mY - this.lastY;
        let curX = Math.round(parseFloat(ElementValue(this.TranslateXElementId)));
        let curY = Math.round(parseFloat(ElementValue(this.TranslateYElementId)));
        ElementValue(this.TranslateXElementId, curX + dX + "");
        ElementValue(this.TranslateYElementId, curY + dY + "");
        this._updateTranslationValue(this.TranslateXElementId);
        this._updateTranslationValue(this.TranslateYElementId);
        this.lastX = mX;
        this.lastY = mY;
        this.UpdatePreview();
    }

    TranslateEnd(evt: TouchEvent | MouseEvent) {
        this.isDragging = false;
    }

    DrawTranslationButtons() {
        this.HideAllOpacitySliders();

        let selectedLayer = this.TranslationButtons[Math.max(this.SelectedTranslationLayer, 0)];
        let translationXValue = selectedLayer?.xValue;
        let translationYValue = selectedLayer?.yValue;

        ElementPosition(this.TranslateXElementId, 720, 180, 128, 40);
        ElementPosition(this.TranslateYElementId, 900, 180, 128, 40);
        ElementValue(this.TranslateXElementId, "" + translationXValue);
        ElementValue(this.TranslateYElementId, "" + translationYValue);
    }

    HideAllOpacitySliders() {
        ElementPosition(this.OpacityMainSlider.LabelId, -999, -999, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId, -999, -999, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId + "_Text", -999, -999, 300, 40);

        this.OpacityLayerSliders.forEach((layerSlider, ix, arr) => {
            let xMod = Math.floor(ix / 5);
            ElementPosition(layerSlider.LabelId, -999, -999, 300, 20);
            ElementPosition(layerSlider.ElementId, -999, -999, 300, 20);
            ElementPosition(layerSlider.ElementId + "_Text", -999, -999, 300, 40);
        });
    }

    CreateOpacitySlider(l: AssetLayer): OpacitySlider {
        let layerSuffix = `${this.OpacityItem?.Asset.Name}_${l.Name}`;
        let layerSlider = <OpacitySlider>{
            ElementId: `LSCGOpacity_${layerSuffix}`,
            LabelId: `LSCGOpacityLabel_${layerSuffix}`,
        };
        layerSlider.Element = ElementCreateRangeInput(layerSlider.ElementId, 100, 0, 100, 1);
        layerSlider.Element.addEventListener("input", (e) => this.OpacityChange(layerSlider));
        layerSlider.Element = ElementCreateInput(layerSlider.ElementId + "_Text", "number", layerSlider.Value + "");
        ElementSetAttribute(layerSlider.ElementId + "_Text", "min", "0");
        ElementSetAttribute(layerSlider.ElementId + "_Text", "max", "100");
        ElementSetAttribute(layerSlider.ElementId + "_Text", "step", "1");
        layerSlider.Element.addEventListener("input", (e) => this.OpacityTextChange(layerSlider));
        layerSlider.Label = this.CreateOpacityLabel(layerSlider.LabelId, layerSlider.ElementId, l.Name);
        ElementPosition(layerSlider.ElementId, -999, -999, 300, 20);
        ElementPosition(layerSlider.ElementId + "_Text", -999, -999, 300, 20);
        ElementPosition(layerSlider.LabelId, -999, -999, 300, 20);
        return layerSlider;
    }

    HideTranslateElements() {
        ElementPosition(this.TranslateXElementId, -999, -999, 300, 20);
        ElementPosition(this.TranslateYElementId, -999, -999, 300, 20);
    }

    CreateTranslationInputElements() {
        this.TranslateXElement = ElementCreateInput(this.TranslateXElementId, "number", "");    
        ElementSetAttribute(this.TranslateXElementId, "step", "1");
        this.TranslateXElement.addEventListener("input", (e) => this.TranslationTextChange(this.TranslateXElementId));

        this.TranslateYElement = ElementCreateInput(this.TranslateYElementId, "number", "");
        ElementSetAttribute(this.TranslateYElementId, "step", "1");
        this.TranslateYElement.addEventListener("input", (e) => this.TranslationTextChange(this.TranslateYElementId));
        this.HideTranslateElements();
    }

    CreateTranslationButton(l: AssetLayer): TranslationValue {
        let translationValue = <TranslationValue>{
            layerName: l.Name,
            xValue: l.DrawingLeft[PoseType.DEFAULT],
            yValue: l.DrawingTop[PoseType.DEFAULT]
        };        
        return translationValue;
    }

    ShowOpacitySliders() {
        if (!this.OpacityItem)
            return;
        if (!this.OpacityItem.Property)
            this.OpacityItem.Property = {};
        let opacity = this.getOpacity();

        if (this.opacityAllLayer) {
            if (!Array.isArray(opacity)) {
                this.setOpacity(this.OpacityItem, new Array(this.OpacityLayerSliders.length).fill(opacity));
            }
            this.DrawOpacityLayerSliders();
        } else {
            if (Array.isArray(opacity)) {
                this.setOpacity(this.OpacityItem, Math.max(...opacity))
            }
            this.DrawMainOpacitySlider();
        }
    }

    DrawOpacityLayerSliders() {
        ElementPosition(this.OpacityMainSlider.LabelId, -999, -999, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId, -999, -999, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId + "_Text", -999, -999, 300, 40);

        this.OpacityLayerSliders.forEach((layerSlider, ix, arr) => {
            let xMod = Math.floor(ix / 8);
            let yMod = ix % 8;
            let opacityArr = this.getOpacity();
            ElementPosition(layerSlider.LabelId, 200 + (xMod * 420), 200 + (yMod * 100), 300, 20);
            ElementPosition(layerSlider.ElementId, 200 + (xMod * 420), 260 + (yMod * 100), 300, 20);
            ElementPosition(layerSlider.ElementId + "_Text", 420 + (xMod * 420), 260 + (yMod * 100), 128, 40);
            let valStr = "" + (((<number[]>opacityArr)[ix] ?? 1) * 100);
            ElementValue(layerSlider.ElementId, valStr);
            ElementValue(layerSlider.ElementId + "_Text", valStr);
        });
    }

    DrawMainOpacitySlider() {
        this.OpacityLayerSliders.forEach((layerSlider, ix, arr) => {
            let xMod = Math.floor(ix / 5);
            ElementPosition(layerSlider.LabelId, -999, -999, 300, 20);
            ElementPosition(layerSlider.ElementId, -999, -999, 300, 20);
            ElementPosition(layerSlider.ElementId + "_Text", -999, -999, 300, 40);
        });

        let opacityRaw = this.getOpacity();
        let opacityValue = (Array.isArray(opacityRaw) ? 1 : (opacityRaw ?? 1)) * 100;

        ElementPosition(this.OpacityMainSlider.LabelId, 200, 200, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId, 200, 260, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId + "_Text", 420, 260, 128, 40);
        ElementValue(this.OpacityMainSlider.ElementId, "" + opacityValue);
        ElementValue(this.OpacityMainSlider.ElementId + "_Text", "" + opacityValue);
    }

    CreateOpacityLabel(labelId: string, sliderId: string, overrideText?: string | null | undefined) {
        if (document.getElementById(labelId) == null) {
            const label = document.createElement("label");
            label.setAttribute("id", labelId);
            label.setAttribute("for", sliderId);
            label.style.pointerEvents = "none";
            label.style.color = "#FFF";
            label.innerText = overrideText ?? "Opacity %";
            document.body.appendChild(label);
            return label;
        } else
            return document.getElementById(labelId) as HTMLLabelElement;
    }

    OpacityChange(slider: OpacitySlider) {
        let value = Math.round(this._updateOpacityValue(slider.ElementId) * 100);
        slider.Value = value;
        ElementValue(slider.ElementId + "_Text", value + "");
        this.UpdatePreview();
    }

    OpacityTextChange(slider: OpacitySlider) {
        let value = Math.round(this._updateOpacityValue(slider.ElementId + "_Text") * 100);
        slider.Value = value;
        ElementValue(slider.ElementId, value + "");
        this.UpdatePreview();
    }

    TranslationTextChange(elementId: string) {
        let value = Math.round(this._updateTranslationValue(elementId));
        ElementValue(elementId, value + "");
        this.UpdatePreview();
    }

    SetTranslationElementValues() {
        if (!this.OpacityItem)
            return;
        let asset = this.OpacityItem.Asset;
        let origAsset = Object.assign({}, AssetGet("Female3DCG", this.OpacityItem.Asset.Group.Name, this.OpacityItem.Asset.Name));
        if (!origAsset)
            origAsset = Object.assign({}, asset);
        let assetLayer = origAsset.Layer[Math.max(this.SelectedTranslationLayer, 0)];
        let layer: any = (<PropertiesWithLayerOverrides>this.OpacityItem?.Property)?.LayerOverrides?.[Math.max(this.SelectedTranslationLayer, 0)] ?? undefined;
        if (!layer)
            layer = assetLayer;
        let x = (layer["DrawingLeft"] ? layer["DrawingLeft"][PoseType.DEFAULT] : assetLayer["DrawingLeft"][PoseType.DEFAULT]) ?? assetLayer["DrawingLeft"][PoseType.DEFAULT];
        let y = (layer["DrawingTop"] ? layer["DrawingTop"][PoseType.DEFAULT] : assetLayer["DrawingTop"][PoseType.DEFAULT]) ?? assetLayer["DrawingTop"][PoseType.DEFAULT];
        ElementValue(this.TranslateXElementId, x + "");
        ElementValue(this.TranslateYElementId, y + "");
    }

    _updateTranslationValue(fromElementId: string): number {
        if (!this.OpacityItem)
            return 0;
        let value = Math.round(parseFloat(ElementValue(fromElementId)));
        if (!this.OpacityItem.Property)
            this.OpacityItem.Property = {};
        let properties = (<PropertiesWithLayerOverrides>this.OpacityItem.Property);
        let layerCount = this.OpacityItem.Asset.Layer.length;
        if (!properties.LayerOverrides || properties.LayerOverrides.length != layerCount) {
            let previous = Object.assign({}, properties.LayerOverrides);
            properties.LayerOverrides = [];
            for (var i = 0; i < layerCount; i++) {
                if (!!previous[i])
                    properties.LayerOverrides.push(previous[i]);
                else {
                    let defaultLayer = this.OpacityItem?.Asset.Layer[i];
                    properties.LayerOverrides.push({
                        DrawingLeft: defaultLayer.DrawingLeft,
                        DrawingTop: defaultLayer.DrawingTop
                    });
                }
            };
        }
        if (fromElementId == this.TranslateXElementId) {
            if (this.SelectedTranslationLayer < 0)
                properties.LayerOverrides.forEach(lo => lo.DrawingLeft = {"": value});
            else
                properties.LayerOverrides[this.SelectedTranslationLayer].DrawingLeft = {"": value};
        } else {
            if (this.SelectedTranslationLayer < 0)
                properties.LayerOverrides.forEach(lo => lo.DrawingTop = {"": value});
            else
                properties.LayerOverrides[this.SelectedTranslationLayer].DrawingTop = {"": value};
        }
        return value;
    }

    _updateOpacityValue(fromElementId: string): number {
        if (!this.OpacityItem)
            return 1;

        let value = Math.round(parseFloat(ElementValue(fromElementId))) / 100;
        let C = Player;
        if (!this.OpacityItem.Property)
            this.OpacityItem.Property = {};
        if (fromElementId == this.OpacityMainSlider.ElementId || fromElementId == this.OpacityMainSlider.ElementId + "_Text") {
            if (value < 1)
                this.setOpacity(this.OpacityItem, value);
            else delete this.OpacityItem.Property.LSCGOpacity;
        } else {
            let opacityArr = this.getOpacity();
            if (!Array.isArray(opacityArr))
                opacityArr = [];
            let ix = this.OpacityLayerSliders.findIndex(s => s.ElementId == fromElementId || s.ElementId + "_Text" == fromElementId);
            opacityArr[ix] = value;
            this.setOpacity(this.OpacityItem, opacityArr);
        }

        return value;
    }

    UpdatePreview = CommonLimitFunction(() => {
        if (!!this.OpacityCharacter)
            CharacterLoadCanvas(this.OpacityCharacter);
    }, 10, 99);

    TranslateAttachEventListener() {
        let CanvasElement = document.getElementById("MainCanvas");
        if (!CanvasElement)
            return;
        if (!CommonIsMobile) {
            CanvasElement.addEventListener("mousedown", evt => this.TranslateStart(evt));
            CanvasElement.addEventListener("mouseup", evt => this.TranslateEnd(evt));
            CanvasElement.addEventListener("mousemove", evt => this.TranslateMove(evt));
        }
        CanvasElement.addEventListener("touchstart", evt => this.TranslateStart(evt));
        CanvasElement.addEventListener("touchend", evt => this.TranslateEnd(evt));
        CanvasElement.addEventListener("touchmove", evt => this.TranslateMove(evt));
    }
    
    TranslateRemoveEventListener() {
        let CanvasElement = document.getElementById("MainCanvas");
        if (!CanvasElement)
            return;
        CanvasElement.removeEventListener("mousedown", evt => this.TranslateStart(evt));
        CanvasElement.removeEventListener("touchstart", evt => this.TranslateStart(evt));
        CanvasElement.removeEventListener("mousemove", evt => this.TranslateMove(evt));
        CanvasElement.removeEventListener("touchmove", evt => this.TranslateMove(evt));
        CanvasElement.removeEventListener("mouseup", evt => this.TranslateEnd(evt));
        CanvasElement.removeEventListener("touchend", evt => this.TranslateEnd(evt));
    }
    
    ResetTranslation() {
        if (!this.OpacityItem)
            return;
        (<PropertiesWithLayerOverrides>this.OpacityItem.Property).LayerOverrides.forEach(layer => {
            layer.DrawingLeft = this.OpacityItem?.Asset.DrawingLeft;
            layer.DrawingTop = this.OpacityItem?.Asset.DrawingTop;
            this.SelectedTranslationLayer = -1;
        });
        this.SetTranslationElementValues();
        this.UpdatePreview();
    }
}