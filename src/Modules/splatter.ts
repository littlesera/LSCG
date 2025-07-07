import { BaseModule } from "base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GetTargetCharacter, ICONS, OnActivity, getCharacter, getRandomInt, hookFunction, removeAllHooksByModule } from "../utils";
import { SplatterSettingsModel } from "Settings/Models/base";
import { Activities } from "modules";
import { ActivityBundle } from "./activities";
import { GuiSplatter } from "Settings/splatter";

export type SplatterLocation = "mouth" | "inMouth" | "forehead" | "chest" | "tummy" | "crotch" | "ass" | "nipples" | "all";
export interface SplatterPacket {
    location: SplatterLocation;
    itemGroup: AssetItemGroup;
    currentTier: number;
    maxTier: number;
}

type RecordObject = { [key: string]: number; };

const bcSplats: RecordObject = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0,
    g: 0,
    h: 0,
    i: 0,
    j: 0,
    k: 0,
    l: 0,
    m: 0,
    n: 0,
    o: 0,
    p: 0,
    q: 0,
    r: 0
};

const locations: { [key: string]: string[]; } = {
    forehead: ['a', 'b', 'c'],    // 'forehead' covers flags a, b, c
    mouth: ['d', 'e', 'f', 'o'],       // 'mouth' covers flags d, e, f ['o' is in]
    chest: ['g', 'h', 'i', 'j'],       // 'mouth' covers flags d, e, f
    tummy: ['k', 'l', 'm', 'n'],       // 'mouth' covers flags d, e, f
    crotch: ['p'],
    ass: ['q'],
    nipples: ['r']
};

const PossibleSplatterGroups: LSCGAssetGroupBodyName[] = [
    "BodyMarkings",
    "FaceMarkings",
    "Mask"
];

export class SplatterMapping {
    C: Character;

    constructor(character: Character) {
        this.C = character;
    }

    getSplatItems(): Array<Item | null> {
        return PossibleSplatterGroups.map(grp => InventoryGet(this.C, grp as AssetGroupBodyName)).filter(m => !!m && m.Asset.Name == "Splatters");
    }

    getOpenSplatSlot(): AssetGroupBodyName | undefined {
        return PossibleSplatterGroups.find(grp => !InventoryGet(this.C, grp as AssetGroupBodyName)) as AssetGroupBodyName;
    }

    getMergedProperty(): RecordObject {
        let items = this.getSplatItems().map(item => item?.Property?.TypeRecord);
        let blank = Object.assign({}, bcSplats);
        Object.keys(blank).forEach(key => {
            blank[key as keyof typeof blank] = items.some(item => item?.[key]) ? 1 : 0;
        });
        return blank;
    }

    getCurrentSplatTier(loc: SplatterLocation): number {
        let record = this.getMergedProperty();
        let group = locations[loc];
        return group.map(key => record[key]).reduce((sum, x) => sum + x, 0);
    }

    incrementSplat(loc: SplatterLocation, colorOverride: ItemColor | null = "Default", opacityOverride: number | null = 70): void {
        if (!(loc in locations)) {
            console.warn(`Location '${loc}' not found.`);
            return;
        }

        let record = this.getMergedProperty();
        let group = locations[loc];
        let flagToFlip: string | undefined = undefined;

        for (let i = 0; i < group.length; i++) {
            const flag = group[i];
            if (record[flag] <= 0) {
                flagToFlip = flag;
                break;
            }
        }

        this.splatAtFlag(flagToFlip, colorOverride, opacityOverride);
    }

    decrementSplat(loc: SplatterLocation) {
        if (this.getCurrentSplatTier(loc) <= 0)
            return;

        let record = this.getMergedProperty();
        let group = locations[loc];
        let flagToFlip: string | undefined = undefined;

        for (let i = group.length - 1; i >= 0; i--) {
            const flag = group[i];
            if (record[flag] > 0) {
                flagToFlip = flag;
                break;
            }
        }

        this.getSplatItems().forEach(targetItem => {
            if (!!flagToFlip && !!targetItem && !!targetItem.Property && !!targetItem.Property.TypeRecord) {
                targetItem.Property.TypeRecord[flagToFlip] = 0;
            }
        });
    }

    cleanSplatLocation(loc: SplatterLocation) {
        let flags = locations[loc];
        if (loc == "all") {
            flags = Object.keys(bcSplats);
        }
        let items = this.getSplatItems();
        items.forEach(item => {
            flags.forEach(key => {
                if (!!item && !!item.Property && !!item.Property.TypeRecord) {
                    item.Property.TypeRecord[key] = 0;
                }
            });
        })
    }

    splatAtFlag(flagToFlip: string | undefined, colorOverride: ItemColor | null = "Default", opacityOverride: number | null = 70) {
        if (!!flagToFlip) {
            let items = this.getSplatItems();
            let targetItem;
            if (!items || items.length == 0) {
                let openSlot = this.getOpenSplatSlot();
                if (!openSlot)
                    return;
                targetItem = InventoryWear(this.C, "Splatters", openSlot, undefined, undefined, this.C.MemberNumber, undefined, true);
            } else {
                targetItem = items[0];
            }
            if (!!targetItem && !!targetItem.Property && !!targetItem.Property.TypeRecord) {
                targetItem.Property.TypeRecord[flagToFlip] = 1;
                let recKeys = Object.keys(targetItem.Property.TypeRecord);
                if (!targetItem.Color) {
                    targetItem.Color = recKeys.map(k => "Default");
                }
                if (Array.isArray(targetItem.Color)) {
                    targetItem.Color = targetItem.Color.map((col, ix, arr) => (ix == recKeys.indexOf(flagToFlip!)) ? (<string>colorOverride) : col);
                }
                if (!targetItem.Property.Opacity) {
                    targetItem.Property.Opacity = recKeys.map(k => 1);
                }
                if (Array.isArray(targetItem.Property.Opacity)) {
                    let calcOpacity = (opacityOverride ?? 70) / 100;
                    let scopedPpacity = Math.min(Math.max(calcOpacity, 0), 100);
                    targetItem.Property.Opacity = targetItem.Property.Opacity.map((op, ix, arr) => (ix == recKeys.indexOf(flagToFlip!)) ? scopedPpacity : op);
                }
            }
        }
    }

    findHighestFlagFromLocation(location: SplatterLocation): string | null | undefined {
        let record = this.getMergedProperty();
        let group = locations[location];
        let foundFlag: string | undefined;
        for (let i = group.length - 1; i >= 0; i--) {
            const flag = group[i];
            if (record[flag] > 0) {
                foundFlag = flag;
                break;
            }
        }
        return foundFlag;
    }

    findItemFromLocation(location: SplatterLocation): Item | null | undefined {
        let foundFlag = this.findHighestFlagFromLocation(location);
        if (!!foundFlag) {
            return this.getSplatItems().find(item => item?.Property?.TypeRecord?.[foundFlag!] == 1);
        }
        
        return;
    }

    getColorAtLocation(location: SplatterLocation): ItemColor | undefined {
        let foundFlag = this.findHighestFlagFromLocation(location);
        let item = this.findItemFromLocation(location);
        let allFlags = Object.keys(bcSplats);
        if (!!item) {
            if (Array.isArray(item.Color))
                return item.Color[allFlags.indexOf(foundFlag!)];
            else
                return item.Color
        }

        return;
    }

    getOpacityAtLocation(location: SplatterLocation): number | number[] | undefined {
        let foundFlag = this.findHighestFlagFromLocation(location);
        let item = this.findItemFromLocation(location);
        let allFlags = Object.keys(bcSplats);
        if (!!item) {
            if (Array.isArray(item.Property?.Opacity))
                return item.Property?.Opacity[allFlags.indexOf(foundFlag!)];
            else
                return item.Property?.Opacity;
        }
        
        return;
    }

    splatInMouth(colorOverride: ItemColor | null = "Default", opacityOverride: number | null = 70) {
        this.splatAtFlag('o', colorOverride, opacityOverride);
    }

    hasInMouth(): boolean {
        return (this.getMergedProperty()?.['o'] || 0) > 0;
    }

    cleanInMouth() {
        let items = this.getSplatItems();
        items.forEach(item => {
            if (!!item && !!item.Property && !!item.Property.TypeRecord) {
                item.Property.TypeRecord['o'] = 0;
            }
        });
    }
}

export class SplatterModule extends BaseModule {

    TOTAL_SPLAT_SLOTS: number = 1;
    START_X = 180;
    START_Y = 564;

    get settingsScreen(): Subscreen | null {
        return GuiSplatter;
    }

    get defaultSettings() {
        return <SplatterSettingsModel>{
            enabled: false,
            giver: true,
            taker: true,
            autoSplat: true,
            uncontrollableWhenBound: true,
            whitelist: null,
            blacklist: null,
            requireLover: false,
            minArousal: 90
        };
    }

    get settings(): SplatterSettingsModel {
        return super.settings as SplatterSettingsModel;
    }

    recentPartners: number[] = [];

    AutoSplatPrompt: boolean = false;
    AutoSplatTarget: number | null = null;
    AutoSplatCallback: () => any = () => { console.warn("No AutoSplat callback set..."); };

    safeword(): void {
        this.CleanSplatter("all");
    }

    getColorOverride(colorOverride: string | null): string {
        if (!colorOverride)
            return "Default";
        let colorOverrideArr = colorOverride?.split(",").map(s => s.trim()).filter(color => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color));
        return (!!colorOverrideArr && colorOverrideArr?.length > 0) ? colorOverrideArr[getRandomInt(colorOverrideArr?.length)] : "Default";
    }

    getOpacityOverride(opacityOverride: string | null): number {
        if (!opacityOverride)
            return 70;
        try {
            let opRE = /^(\d+)-?(\d+)?$/;
            let opacityOptionArr = opacityOverride?.split(",").map(s => s.trim()).filter(op => opRE.test(op));
            let opSelect = opacityOptionArr[getRandomInt(opacityOptionArr.length)];
            if (opSelect.indexOf("-") >= 0) {
                let bounds = [parseInt(opSelect.match(opRE)?.[1] ?? "0"), parseInt(opSelect.match(opRE)?.[2] ?? "70")];
                let min = Math.max(Math.min(...bounds), 0);
                let max = Math.min(Math.max(...bounds), 100);
                return getRandomInt(max - min) + min;
            } else {
                return parseInt(opSelect ?? 70);
            }
        }
        catch {
            return 70;
        }
    }

    load(): void {
        OnActivity(1, ModuleCategory.Splatter, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = GetTargetCharacter(data);
            if (!!target &&
                !!sender &&
                target == Player.MemberNumber) {
                if (this.splatAllowed(sender, <OtherCharacter><Character>Player)) {
                    let colorOverride = this.getColorOverride((<OtherCharacter>sender)?.LSCG?.SplatterModule?.colorOverride);
                    let opacityOverride = this.getOpacityOverride((<OtherCharacter>sender)?.LSCG?.SplatterModule?.opacityOverride);

                        switch (data.Content) {
                            case "ChatOther-ItemMouth-LSCG_Splat":
                            case "ChatSelf-ItemMouth-LSCG_Splat":
                                this.AddSplatter(sender, "mouth", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemHead-LSCG_Splat":
                            case "ChatSelf-ItemHead-LSCG_Splat":
                                this.AddSplatter(sender, "forehead", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemBreast-LSCG_Splat":
                            case "ChatSelf-ItemBreast-LSCG_Splat":    
                                this.AddSplatter(sender, "chest", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemPelvis-LSCG_Splat":
                            case "ChatSelf-ItemPelvis-LSCG_Splat":
                                this.AddSplatter(sender, "tummy", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemVulva-LSCG_Splat":
                            case "ChatSelf-ItemVulva-LSCG_Splat":
                                this.AddSplatter(sender, "crotch", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemButt-LSCG_Splat":
                            case "ChatSelf-ItemButt-LSCG_Splat":
                                this.AddSplatter(sender, "ass", colorOverride, opacityOverride);
                                break;
                            case "ChatOther-ItemNipples-LSCG_Splat":
                            case "ChatSelf-ItemNipples-LSCG_Splat":
                                this.AddSplatter(sender, "nipples", colorOverride, opacityOverride);
                                break;
                            // Lick Activities
                            case "ChatOther-ItemMouth-Lick":
                            case "ChatSelf-ItemMouth-Lick":
                                this.CleanSingleSplatter("mouth");
                            case "ChatOther-ItemHead-Lick":
                            case "ChatSelf-ItemHead-Lick":
                                this.CleanSingleSplatter("forehead");
                                break;
                            case "ChatOther-ItemBreast-Lick":
                            case "ChatSelf-ItemBreast-Lick":
                                this.CleanSingleSplatter("chest");
                                break;
                            case "ChatOther-ItemNipples-Lick":
                            case "ChatSelf-ItemNipples-Lick":
                            case "ChatOther-ItemNipplesPiercings-Lick":
                            case "ChatSelf-ItemNipplesPiercings-Lick":
                                this.CleanSingleSplatter("nipples");
                                break;
                            case "ChatOther-ItemPelvis-Lick":
                            case "ChatSelf-ItemPelvis-Lick":
                                this.CleanSingleSplatter("tummy");
                                break;
                            case "ChatOther-ItemVulva-Lick":
                            case "ChatSelf-ItemVulva-Lick":
                            case "ChatOther-ItemVulvaPiercings-Lick":
                            case "ChatSelf-ItemVulvaPiercings-Lick":
                                this.CleanSingleSplatter("crotch");
                                break;
                            case "ChatOther-ItemButt-Lick":
                            case "ChatSelf-ItemButt-Lick":
                                this.CleanSingleSplatter("ass");
                                break;
                            default:
                                break;
                        }
                    }
        
                    var item = data.Dictionary?.find((d: any) => d.Tag == "ActivityAsset");
                    if (!!item && item.AssetName == "Towel") {
                        switch (data.Content) {
                            case "ChatOther-ItemMouth-RubItem":
                            case "ChatSelf-ItemMouth-RubItem":
                                this.CleanSplatter("mouth");
                                break;
                            case "ChatOther-ItemHood-RubItem":
                            case "ChatSelf-ItemHood-RubItem":
                                this.CleanSplatter("forehead");
                                break;
                            case "ChatOther-ItemBreast-RubItem":
                            case "ChatSelf-ItemBreast-RubItem":
                            case "ChatOther-ItemNipples-RubItem":
                            case "ChatSelf-ItemNipples-RubItem":
                            case "ChatOther-ItemNipplesPiercings-RubItem":
                            case "ChatSelf-ItemNipplesPiercings-RubItem":
                                this.CleanSplatter("chest");
                                this.CleanSplatter("nipples");
                                break;
                            case "ChatOther-ItemPelvis-RubItem":
                            case "ChatSelf-ItemPelvis-RubItem":
                                this.CleanSplatter("tummy");
                                break;
                            case "ChatOther-ItemVulva-RubItem":
                            case "ChatSelf-ItemVulva-RubItem":
                            case "ChatOther-ItemVulvaPiercings-RubItem":
                            case "ChatSelf-ItemVulvaPiercings-RubItem":
                                this.CleanSplatter("crotch");
                                break;
                            default :
                                break;
                        }
                    }
            }
        });

        Activities().AddActivity({
            Activity: {
                Name: "Splat",
                MaxProgress: 90,
                MaxProgressSelf: 90,
                Prerequisite: [],
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's mouth.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemHead",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's face.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemBreast",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's chest.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemPelvis",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's tummy.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemVulva",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats inside TargetCharacter's pussy.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemPenis",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's crotch.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemButt",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats inside TargetCharacter's ass.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }, {
                    Name: "ItemNipples",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: `SourceCharacter splats all over TargetCharacter's nipples.`,
                    TargetSelfAction: `SourceCharacter splats all over TargetCharacter.`
                }
            ],
            CustomPrereqs: [
                {
                    Name: "CanSquirt",
                    Func: (acting, acted, group) => {
                        let controllable = !this.settings.uncontrollableWhenBound || !acting.IsRestrained();
                        let giverAllowed = this.canGiveSplat(acting);
                        let takerAllowed = this.canReceiveSplat(<OtherCharacter>acted);
                        let permAllowed = this.splatAllowed(acting, <OtherCharacter>acted);
                        return controllable && giverAllowed && takerAllowed && permAllowed;
                    }
                }
            ],
            CustomImage: ICONS.SPLAT
        });

        hookFunction("ActivityOrgasmStart", 1, (args, next) => {
            let C = args[0];
            if (C.IsPlayer() &&
                CurrentScreen == "ChatRoom" &&
                this.Enabled &&
                this.canGiveSplat(Player) &&
                this.settings.autoSplat &&
                !ActivityOrgasmRuined) {
                this.PromptForSplat(() => next(args));
            } else {
                next(args);
            }
        }, ModuleCategory.Splatter);

        hookFunction("ChatRoomDrawArousalOverlay", 1, (args, next) => {
            if ((Player.ArousalSettings?.OrgasmTimer != null) && (typeof Player.ArousalSettings?.OrgasmTimer === "number") && !isNaN(Player.ArousalSettings?.OrgasmTimer) && (Player.ArousalSettings?.OrgasmTimer > 0)) {
                if (this.Enabled && this.AutoSplatPrompt && CurrentScreen == "ChatRoom") {
                    ActivityOrgasmProgressBar(50, 970);
                    DrawRect(0, 0, 1003, 1000, "#FFB0B0B0");
                    DrawRect(1003, 0, 993, 63, "#FFB0B0B0");
                    if (!this.AutoSplatTarget) {
                        DrawText(`Who do you want to ${Player.HasPenis() ? "cum" : "squirt"} on?`, 500, 400, "White", "Black");
                        DrawButton(this.START_X, 480, 240, 60, "Yourself", "White", undefined, undefined, false);
                        DrawButton(this.START_X + 250, 480, 240, 60, "Nobody", "White", undefined, undefined, false);
                        DrawButton(this.START_X + 500, 480, 240, 60, "Uncontrolled", "White", undefined, undefined, false);

                        if (!this.settings.uncontrollableWhenBound || !Player.IsRestrained()) { // If bound, remove control of where to cum if setting is true
                            this.getTargetSelectAreas().forEach(pair => {
                                let rect = pair[0];
                                let char = pair[1];
                                if (!rect || !char) return;
                                DrawButton(this.START_X + rect[0], this.START_Y + rect[1], rect[2], rect[3], CharacterNickname(char), "White", undefined, undefined, false);
                            });
                        }
                        return true;
                    } else {
                        let target = getCharacter(this.AutoSplatTarget);
                        if (!!target) {
                            let name = target.IsPlayer() ? "yourself" : CharacterNickname(target);
                            DrawText(`Where on ${name} do you want to cum?`, 500, 400, "White", "Black");
                            this.getLocationSelectAreas().forEach(pair => {
                                let rect = pair[0];
                                let location = pair[1];
                                if (!rect || !location) return;
                                DrawButton(this.START_X + rect[0], this.START_Y + rect[1], rect[2], rect[3], `${this.getLocationLabel(location, target)}`, "White", undefined, undefined, false);
                            });
                        }
                        return true;
                    }
                }
            } else if (this.AutoSplatPrompt) {
                this.ResetPrompt();
            }
            return next(args);
        }, ModuleCategory.Splatter);

        hookFunction("ChatRoomClick", 1, (args, next) => {
            if (this.AutoSplatPrompt) {
                if (!this.AutoSplatTarget) {
                    if (MouseIn(this.START_X, 480, 240, 60)) this.AutoSplatTarget = Player.MemberNumber ?? -1;
                    if (MouseIn(this.START_X + 250, 480, 240, 60)) this.ResetPrompt();
                    if (MouseIn(this.START_X + 500, 480, 240, 60)) this.RandomSplat();

                    if (!Player.IsRestrained() || Player.CanWalk()) { // If bound, remove control of where to cum
                        this.getTargetSelectAreas().forEach(pair => {
                            let rect = pair[0];
                            let char = pair[1];
                            if (!rect || !char) return;
                            if (MouseIn(this.START_X + rect[0], this.START_Y + rect[1], rect[2], rect[3])) this.AutoSplatTarget = char.MemberNumber ?? -1;
                        });
                    }
                } else {
                    let target = getCharacter(this.AutoSplatTarget);
                    if (!!target) {
                        this.getLocationSelectAreas().forEach(pair => {
                            let rect = pair[0];
                            let location = pair[1];
                            if (!rect || !location) return;
                            if (MouseIn(this.START_X + rect[0], this.START_Y + rect[1], rect[2], rect[3])) this.SendSplatter(<OtherCharacter>target, location);
                        });
                    }
                }
                return;
            }
            return next(args);
        }, ModuleCategory.Splatter);
    }

    getTargetSelectAreas(): [RectTuple, Character][] {
        let targets = this.FindSplatterTargets();
        let x = 0;
        let y = 0;
        let w = 240;
        let h = 60;
        return targets.map((c, ix, arr) => [
            <RectTuple>[x + ((ix % 4) * 250), y + (Math.floor(ix / 4) * 65), w, h],
            c
        ]);
    }

    getLocationSelectAreas(): [RectTuple, SplatterLocation][] {
        let targets: SplatterLocation[] = [
            "inMouth",
            "mouth",
            "forehead",
            "chest",
            "tummy",
            "crotch",
            "ass",
            "nipples"
        ];
        let x = 0;
        let y = -40;
        let w = 240;
        let h = 60;
        return targets.map((l, ix, arr) => [
            <RectTuple>[x + ((ix % 3) * 250), y + (Math.floor(ix / 3) * 65), w, h],
            l
        ]);
    }

    getLocationLabel(loc: SplatterLocation, target: Character | null) {
        let isMale = target?.GetPronouns() == "HeHim";
        switch (loc) {
            case "inMouth": return "In mouth";
            case "mouth": return "Mouth";
            case "forehead": return "Face";
            case "chest": return isMale ? "Chest" : "Breasts";
            case "tummy": return "Stomach";
            case "crotch": return target?.HasPenis() ? "Cock" : "Pussy";
            case "ass": return "Ass";
            case "nipples": return "Nipples";
            default: return "Nowhere";
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Splatter);
    }

    splatAllowed(acting: Character, acted: OtherCharacter) {
        if (acted.MemberNumber == acting.MemberNumber)
            return true;
        let whitelist = acted?.LSCG?.SplatterModule?.whitelist?.filter((x: any) => !!x && x !== '') ?? [];
        let blacklist = acted?.LSCG?.SplatterModule?.blacklist?.filter((x: any) => !!x && x !== '') ?? [];
        let whiteListAllowed = !!whitelist && whitelist.length > 0 && whitelist.indexOf(acting.MemberNumber ?? -1) >= 0;
        let blackListBlocked = !!blacklist && blacklist.length > 0 && blacklist.indexOf(acting.MemberNumber ?? -1) >= 0;
        let loverAllowed = !acted?.LSCG?.SplatterModule?.requireLover || acting.IsLoverOfCharacter(acted);
        return (loverAllowed || whiteListAllowed) && !blackListBlocked;
    }

    canGiveSplat(acting: Character) {
        let naked = (InventoryPrerequisiteMessage(acting, "AccessCrotch") === "") && !acting.IsVulvaChaste() && !acting.IsEnclose();
        let arousalAllowed = (acting.ArousalSettings?.Progress ?? 0) >= this.settings.minArousal && !acting.IsEdged();
        let giverAllowed = (<OtherCharacter>acting).LSCG.SplatterModule.enabled && (<OtherCharacter>acting).LSCG.SplatterModule.giver;
        return naked && arousalAllowed && giverAllowed;
    }

    canReceiveSplat(target: OtherCharacter) {
        return (target.LSCG?.GlobalModule?.enabled || target.LSCG?.enabled) && target.LSCG?.SplatterModule?.enabled && target.LSCG?.SplatterModule?.taker;
    }

    getSplats(C?: Character): Array<Item | null> {
        C = C ?? Player;
        return [InventoryGet(C, "BodyMarkings"),InventoryGet(C, "FaceMarkings" as AssetGroupBodyName)].filter(m => !!m && m.Asset.Name == "Splatter");
    }    
    
    splatSlotOccupied() {
        return this.getSplats().length == this.TOTAL_SPLAT_SLOTS;
    }

    FindSplatterTargets(): Character[] {
        let partners = this.recentPartners.map(p => getCharacter(p)).filter(c => !!c) as Character[];
        let mySpot = ChatRoomCharacter.findIndex(c => c.MemberNumber == Player.MemberNumber);
        let nearby = [ChatRoomCharacter[mySpot - 1], ChatRoomCharacter[mySpot + 1]].filter(c => !!c);
        return partners.concat(nearby).filter(c => !!c && this.canReceiveSplat(<OtherCharacter>c) && this.splatAllowed(Player, <OtherCharacter>c));
    }

    PromptForSplat(callback: () => any) {
        this.AutoSplatTarget = 0;
        this.AutoSplatPrompt = true;
        this.AutoSplatCallback = callback;
        if (!!Player.ArousalSettings) {
            Player.ArousalSettings.OrgasmTimer = CurrentTime + 20000;
            ActivityOrgasmGameTimer = Player.ArousalSettings.OrgasmTimer - CurrentTime;
            Player.ArousalSettings.OrgasmStage = 2;
        }

        if (Player.IsRestrained() && !Player.CanWalk()) { // If bound, remove control of where to cum
            this.RandomSplat();
        }
    }

    ResetPrompt() {
        this.AutoSplatTarget = 0;
        this.AutoSplatPrompt = false;
        this.AutoSplatCallback();
    }

    RandomSplat() {
        let targets = this.FindSplatterTargets();
        let locationArr: SplatterLocation[] = [
            "chest",
            "forehead",
            "tummy"
        ];
        let location = locationArr[getRandomInt(locationArr.length)];
        let roll = getRandomInt(100);
        if (roll > 50) {
            this.SendSplatter(<OtherCharacter><Character>Player, "tummy");
        } else if (targets.length > 0 && roll > 20) {
            let target = targets[getRandomInt(targets.length)];
            this.SendSplatter(<OtherCharacter>target, location);
        } else {
            this.ResetPrompt();
        }
    }

    SendSplatter(target: OtherCharacter, location: SplatterLocation) {
        this.ResetPrompt();
        if (this.canReceiveSplat(target) && this.splatAllowed(Player, target)) {
            let targetGroupName: AssetGroupItemName = "ItemMouth";
            switch (location) {
                case "mouth":
                case "inMouth": targetGroupName = "ItemMouth"; break;
                case "forehead": targetGroupName = "ItemHead"; break;
                case "chest": targetGroupName = "ItemBreast"; break;
                case "tummy": targetGroupName = "ItemPelvis"; break;
                case "crotch": targetGroupName = "ItemVulva"; break;
                case "ass": targetGroupName = "ItemButt"; break;
                case "nipples": targetGroupName = "ItemNipples"; break;
                case "all": (<string>targetGroupName) = ""; break;
            }
            let group = ActivityGetGroupOrMirror(target.AssetFamily, targetGroupName);
            let tmp = target.FocusGroup; // haaack
            target.FocusGroup = group;
            let activity = ActivityAllowedForGroup(target, targetGroupName).find(a => (a.Activity as LSCGActivity).Name == "LSCG_Splat");
            target.FocusGroup = tmp;
            if (group != null && activity != null) {
                ActivityRun(Player, target, group, activity, true);
            }
        }
    }

    CleanSplatter(location: SplatterLocation) {
        console.info(`Cleaning splatter from ${location}`);
        new SplatterMapping(Player).cleanSplatLocation(location);
        ChatRoomCharacterUpdate(Player);
    }

    CleanSingleSplatter(location: SplatterLocation) {
        new SplatterMapping(Player).decrementSplat(location);
        ChatRoomCharacterUpdate(Player);
    }

    AddSplatter(sender: Character, location: SplatterLocation, colorOverride: ItemColor | null, opacityOverride: number | null) {
        console.info(`Adding splatter to ${location}`);
        new SplatterMapping(Player).incrementSplat(location, colorOverride, opacityOverride);
        ChatRoomCharacterUpdate(Player);
    }

    IsSplatInMouth(C: Character) {
        return new SplatterMapping(C).hasInMouth();
    }

    ClearSplatInMouth(C: Character) {
        new SplatterMapping(C).cleanInMouth();
        ChatRoomCharacterUpdate(C);
    }

    AddSplatInMouth(C: Character, source: Character | undefined | null, sourceLocation: SplatterLocation | undefined | null) {
        if (this.HasSplatAt(source, sourceLocation)) {
            let colorOverride = this.getColorSource(source, sourceLocation) ?? this.getColorOverride((<OtherCharacter>source)?.LSCG?.SplatterModule?.colorOverride ?? null);
            let opacityOverride = this.getOpacitySource(source, sourceLocation) ?? this.getOpacityOverride((<OtherCharacter>source)?.LSCG?.SplatterModule?.opacityOverride ?? null);
            new SplatterMapping(C).splatInMouth(colorOverride, opacityOverride);
            ChatRoomCharacterUpdate(C);
        }
    }

    HasSplatAt(C: Character | undefined | null, location: SplatterLocation | undefined | null) {
        if (!C || !location)
            return false;
        return new SplatterMapping(C).getCurrentSplatTier(location) > 0;
    }

    private getColorSource(source: Character | undefined | null, sourceLocation: SplatterLocation | undefined | null): ItemColor | undefined {
        if (!source || !sourceLocation)
            return;

        return new SplatterMapping(source).getColorAtLocation(sourceLocation);
    }

    private getOpacitySource(source: Character | undefined | null, sourceLocation: SplatterLocation | undefined | null): number | undefined {
        if (!source || !sourceLocation)
            return;

        let opacity = new SplatterMapping(source).getOpacityAtLocation(sourceLocation);
        if (Array.isArray(opacity)) // Extract just the in mouth opacity
            return ((opacity[14] ?? 1) * 100);

        return (opacity ?? 1) * 100;
    }
}