import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel, OpacitySettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetTargetCharacter, IsIncapacitated, OnActivity, SendAction, getRandomInt, hookFunction, isCloth, removeAllHooksByModule, setOrIgnoreBlush } from "../utils";
import { MiscModule } from "./misc";
import { StateModule } from "./states";
import { drawTooltip } from "Settings/settingUtils";

interface OpacitySlider {
    ElementId: string;
    Element: HTMLInputElement | null;
    LabelId: string;
    Label: HTMLLabelElement | null;
    Value: number;
}

export class OpacityModule extends BaseModule {
    OpacityMainSlider: OpacitySlider = {
        ElementId: "LSCG_OpacitySlider",
        Element: null,
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

                this.OpacityMainSlider.Element = ElementCreateRangeInput(this.OpacityMainSlider.ElementId, 1, 0, 1, 0.01);
                this.OpacityMainSlider.Element.addEventListener("input", (e) => this.OpacityChange(this.OpacityMainSlider));
                this.OpacityMainSlider.Label = this.CreateOpacityLabel(this.OpacityMainSlider.LabelId, this.OpacityMainSlider.ElementId);
                ElementPosition(this.OpacityMainSlider.ElementId, -999, -999, 300, 20);
                ElementPosition(this.OpacityMainSlider.LabelId, -999, -999, 300, 20);

                this.OpacityLayerSliders = [];
                if (this.OpacityItem.Asset.Layer.length > 0) {
                    this.OpacityItem.Asset.Layer.forEach(l => {
                        let layerSuffix = `${this.OpacityItem?.Asset.Name}_${l.Name}`;
                        let layerSlider = <OpacitySlider>{
                            ElementId: `LSCGOpacity_${layerSuffix}`,
                            LabelId: `LSCGOpacityLabel_${layerSuffix}`,
                        };
                        layerSlider.Element = ElementCreateRangeInput(layerSlider.ElementId, 1, 0, 1, 0.01);
                        layerSlider.Element.addEventListener("input", (e) => this.OpacityChange(layerSlider));
                        layerSlider.Label = this.CreateOpacityLabel(layerSlider.LabelId, layerSlider.ElementId, l.Name);
                        ElementPosition(layerSlider.ElementId, -999, -999, 300, 20);
                        ElementPosition(layerSlider.LabelId, -999, -999, 300, 20);
                        this.OpacityLayerSliders.push(layerSlider);
                    });
                }

                if (Array.isArray(this.OpacityItem?.Property?.LSCGOpacity)) {
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
            ElementRemove(this.OpacityMainSlider.LabelId);
            this.OpacityLayerSliders.forEach(s => {
                ElementRemove(s.ElementId);
                ElementRemove(s.LabelId);
            });
            this.OpacityLayerSliders = [];
        }, ModuleCategory.Opacity);

        hookFunction("ItemColorDraw", 1, (args, next) => {
            if (this.OpacityCharacter && this.CanChangeOpacityOnCharacter(this.OpacityCharacter) && this.OpacityItem && isCloth(this.OpacityItem)) {
                let prev = MainCanvas.textAlign;
                MainCanvas.textAlign = "left";
                
                // Draw "All Layers" checkbox
                DrawCheckbox(50, 120 - 32, 64, 64, "", this.opacityAllLayer, this.OpacityItem.Asset?.Layer.length <= 1);
                DrawTextFit("All Layers", 120, 120, 300, "White", "Gray");
                if (MouseIn(50, 120 - 32, 64, 64)) 
                    drawTooltip(50, 50, 800, "Modify opacity levels for each asset layer", "left");

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

                    if (this.opacityAllLayer) {
                        if (!Array.isArray(this.OpacityItem.Property.LSCGOpacity)) {
                            let opac = this.OpacityItem?.Property?.LSCGOpacity ?? 1;
                            if (!this.OpacityItem.Property)
                                this.OpacityItem.Property = {};
                            this.OpacityItem.Property.LSCGOpacity = new Array(this.OpacityLayerSliders.length).fill(opac);
                        }
                        this.DrawOpacityLayerSliders();
                    } else {
                        if (Array.isArray(this.OpacityItem.Property.LSCGOpacity)) {
                            this.OpacityItem.Property.LSCGOpacity = Math.max(...this.OpacityItem.Property.LSCGOpacity);
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
                if (!!CA && isCloth(CA) && !!Property && this.Enabled) {
                    let layerName = (params['L'] as string ?? "").trim().slice(1);
                    let layerIx = CA.Asset.Layer.findIndex(l => l.Name == layerName);
                    let originalLayerOpacity = CA.Asset.Layer[layerIx]?.Opacity ?? CA.Asset.Opacity ?? 1;
                    let overrideOpacity = Array.isArray(Property?.LSCGOpacity) ? Property?.LSCGOpacity[layerIx] : Property?.LSCGOpacity;
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
            C.AppearanceLayers?.forEach((Layer) => {
                const A = Layer.Asset;
                if (isCloth(A)) {
                    A.DynamicBeforeDraw = true;
                }
            });
            let ret = next(args);
            return ret;
        }, ModuleCategory.Opacity);

        hookFunction("CharacterAppearanceSortLayers", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            if (!C.MemberNumber)
                return next(args);

            let xray = getModule<StateModule>("StateModule")?.XRayState;
            let xrayActive = xray?.Active && xray?.CanViewXRay(C);
            C.DrawAppearance?.forEach(item => {
                let hasOpacitySettings = !!item.Property?.LSCGOpacity;
                if (hasOpacitySettings || xrayActive) {
                    item.Asset = Object.assign({}, item.Asset);
                    item?.Asset?.Layer?.forEach(layer => {
                        layer.Alpha = [];
                    });
                    item.Asset.Hide = [];
                    item.Asset.HideItem = [];
                    item.Asset.HideItemAttribute = [];
                } else {
                    let defaultAsset = AssetMap.get(`${item?.Asset?.Group?.Name}/${item.Asset.Name}`);
                    if (!!defaultAsset) {
                        item?.Asset?.Layer?.forEach((layer, ix, arr) => {
                            if (defaultAsset!.Alpha)
                                layer.Alpha = defaultAsset!.Alpha;
                        });
                    }
                }

                if (item.Asset.Name == "Penis") {
                    let transpPants = !!InventoryGet(C, "ClothLower")?.Property?.LSCGOpacity;
                    let transpUnderwear = !!InventoryGet(C, "Panties")?.Property?.LSCGOpacity;
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

    DrawOpacityLayerSliders() {
        ElementPosition(this.OpacityMainSlider.LabelId, -999, -999, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId, -999, -999, 300, 20);

        this.OpacityLayerSliders.forEach((layerSlider, ix, arr) => {
            let xMod = Math.floor(ix / 8);
            let yMod = ix % 8;
            ElementPosition(layerSlider.LabelId, 200 + (xMod * 350), 200 + (yMod * 100), 300, 20);
            ElementPosition(layerSlider.ElementId, 200 + (xMod * 350), 260 + (yMod * 100), 300, 20);
            ElementValue(layerSlider.ElementId, "" + ((<number[]>this.OpacityItem?.Property?.LSCGOpacity)[ix] ?? 1));
        });
    }

    DrawMainOpacitySlider() {
        this.OpacityLayerSliders.forEach((layerSlider, ix, arr) => {
            let xMod = Math.floor(ix / 5);
            ElementPosition(layerSlider.LabelId, -999, -999, 300, 20);
            ElementPosition(layerSlider.ElementId, -999, -999, 300, 20);
        });

        let opacityValue = Array.isArray(this.OpacityItem?.Property?.LSCGOpacity) ? 1 : (this.OpacityItem?.Property?.LSCGOpacity ?? 1);

        ElementPosition(this.OpacityMainSlider.LabelId, 200, 200, 300, 20);
        ElementPosition(this.OpacityMainSlider.ElementId, 200, 260, 300, 20);
        ElementValue(this.OpacityMainSlider.ElementId, "" + opacityValue);
    }

    CreateOpacityLabel(labelId: string, sliderId: string, overrideText?: string | null | undefined) {
        if (document.getElementById(labelId) == null) {
            const label = document.createElement("label");
            label.setAttribute("id", labelId);
            label.setAttribute("for", sliderId);
            label.style.pointerEvents = "none";
            label.style.color = "#FFF";
            label.innerText = overrideText ?? "Opacity";
            document.body.appendChild(label);
            return label;
        } else
            return document.getElementById(labelId) as HTMLLabelElement;
    }

    OpacityChange(slider: OpacitySlider) {
        if (!this.OpacityItem)
            return;

        let value = parseFloat(ElementValue(slider.ElementId));
        let C = Player;
        if (!this.OpacityItem.Property)
            this.OpacityItem.Property = {};
        if (slider.ElementId == this.OpacityMainSlider.ElementId) {
            if (value < 1)
                this.OpacityItem.Property.LSCGOpacity = value;
            else delete this.OpacityItem.Property.LSCGOpacity;
        } else {
            if (!Array.isArray(this.OpacityItem.Property.LSCGOpacity))
                this.OpacityItem.Property.LSCGOpacity = [];
            let ix = this.OpacityLayerSliders.findIndex(s => s.ElementId == slider.ElementId);
            this.OpacityItem.Property.LSCGOpacity[ix] = value;
        }
        slider.Value = value;
        this.UpdatePreview();
    }

    UpdatePreview = CommonLimitFunction(() => {
        if (!!this.OpacityCharacter)
            CharacterLoadCanvas(this.OpacityCharacter);
    });
}