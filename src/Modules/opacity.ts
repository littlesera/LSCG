import { BaseModule } from "base";
import { getModule } from "modules";
import { OpacitySettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { hookFunction, isCloth } from "../utils";
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

                this.OpacityLayerSliders = [];
                if (this.OpacityItem.Asset.Layer.length > 0) {
                    this.OpacityItem.Asset.Layer.forEach(l => {
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
                        this.OpacityLayerSliders.push(layerSlider);
                    });
                }

                if (Array.isArray(this.getOpacity())) {
                    this.opacityAllLayer = true;
                    this.DrawOpacityLayerSliders();
                } else {
                    this.opacityAllLayer = false;
                    this.DrawMainOpacitySlider();
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
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorDraw", 1, (args, next) => {
            if (this.OpacityCharacter && this.CanChangeOpacityOnCharacter(this.OpacityCharacter) && this.OpacityItem && isCloth(this.OpacityItem)) {
                let prev = MainCanvas.textAlign;
                MainCanvas.textAlign = "left";
                
                // Draw "All Layers" checkbox
                if (this.OpacityItem.Asset?.Layer.length > 1) {
                    DrawCheckbox(50, 120 - 32, 64, 64, "", this.opacityAllLayer, this.OpacityItem.Asset?.Layer.length <= 1);
                    DrawTextFit("All Layers", 120, 120, 300, "White", "Gray");
                    if (MouseIn(50, 120 - 32, 64, 64)) 
                        drawTooltip(50, 50, 800, "Modify opacity levels for each asset layer", "left");
                }

                // Draw "All Layers" checkbox
                DrawCheckbox(350, 120 - 32, 64, 64, "", this.OpacityItem?.Property?.LSCGLeadLined ?? false);
                DrawTextFit("Lead-Lined", 420, 120, 300, "White", "Gray");
                if (MouseIn(350, 120 - 32, 64, 64)) 
                    drawTooltip(50, 50, 800, "Line this item with x-ray blocking lead.", "left");

                MainCanvas.textAlign = prev;
            }
            next(args);
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorClick", 1, (args, next) => {
            next(args);
            if (this.OpacityCharacter && this.CanChangeOpacityOnCharacter(this.OpacityCharacter) && this.OpacityItem && isCloth(this.OpacityItem)) {
                if (this.OpacityItem.Asset?.Layer.length > 1 && MouseIn(50, 120 - 32, 64, 64)) {
                    this.opacityAllLayer = !this.opacityAllLayer;
    
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
                    this.UpdatePreview();
                } else if (MouseIn(350, 120 - 32, 64, 64)) {
                    if (!this.OpacityItem.Property)
                        this.OpacityItem.Property = {};
                    this.OpacityItem.Property.LSCGLeadLined = !this.OpacityItem.Property.LSCGLeadLined;
                }
            }
        }, ModuleCategory.Opacity)

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
                        ret.Opacity = Math.min((ret.Opacity ?? Property.Opacity ?? 1), (overrideOpacity ?? originalLayerOpacity ?? 1));
                    }
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
        return item?.Property?.LSCGOpacity ?? item?.Property?.Opacity ?? 1;
    }

    setOpacity(item: Item, value: number | number[]) {
        if (!item.Property)
            item.Property = {};
        item.Property.LSCGOpacity = value;
        if (!Array.isArray(value))
            item.Property.Opacity = value;
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
    });
}