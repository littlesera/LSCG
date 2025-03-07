import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetMetadata, GetTargetCharacter, ICONS, OnActivity, SendAction, capitalizeFirstLetter, getCharacter, getCharacterByNicknameOrMemberNumber, getRandomInt, hookFunction, removeAllHooksByModule, sendLSCGCommand } from "../utils";
import { SplatterSettingsModel } from "Settings/Models/base";
import { Activities, Core, getModule } from "modules";
import { CommandListener } from "./core";
import { ActivityBundle } from "./activities";

export type SplatterLocation = "mouth" | "forehead" | "chest" | "tummy" | "crotch" | "all";
export interface SplatterPacket {
    location: SplatterLocation;
    itemGroup: AssetItemGroup;
    currentTier: number;
    maxTier: number;
}

export class SplatterModule extends BaseModule {

    TOTAL_SPLAT_SLOTS: number = 1;
    START_X = 180;
    START_Y = 564;

    get defaultSettings() {
        return <SplatterSettingsModel>{
            enabled: false,
            giver: false,
            taker: false,
            autoSplat: true
        };
    }

    get settings(): SplatterSettingsModel {
        return super.settings as SplatterSettingsModel;
	}

    recentPartners: number[] = [];

    AutoSplatPrompt: boolean = false;
    AutoSplatTarget: number | null = null;
    AutoSplatCallback: () => any = () => {console.warn("No AutoSplat callback set...")};

    safeword(): void {
        this.CleanSplatter("all");
    }

    load(): void {
        OnActivity(100, ModuleCategory.Lipstick, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = GetTargetCharacter(data);
            let colorOverride = (<OtherCharacter>sender)?.LSCG.SplatterModule.colorOverride;
            if (!!target && 
                !!sender &&
                !(sender as OtherCharacter).LSCG?.LipstickModule?.dry &&
                target == Player.MemberNumber) {
                    switch (data.Content) {
                        case "ChatOther-ItemMouth-LSCG_Splat":
                        case "ChatSelf-ItemMouth-LSCG_Splat":
                            this.AddSplatter(sender, "mouth", colorOverride);
                            break;
                        case "ChatOther-ItemHead-LSCG_Splat":
                        case "ChatSelf-ItemHead-LSCG_Splat":
                            this.AddSplatter(sender, "forehead", colorOverride);
                            break;
                        case "ChatOther-ItemBreast-LSCG_Splat":
                        case "ChatSelf-ItemBreast-LSCG_Splat":    
                            this.AddSplatter(sender, "chest", colorOverride);
                            break;
                        case "ChatOther-ItemPelvis-LSCG_Splat":
                        case "ChatSelf-ItemPelvis-LSCG_Splat":
                            this.AddSplatter(sender, "tummy", colorOverride);
                            break;
                        case "ChatOther-ItemVulva-LSCG_Splat":
                        case "ChatSelf-ItemVulva-LSCG_Splat":
                            this.AddSplatter(sender, "crotch", colorOverride);
                            break;
                        default:
                            break;
                    }
        
                    var item = data.Dictionary?.find((d: any) => d.Tag == "ActivityAsset");
                    if (!!item && item.AssetName == "Towel") {
                        switch (data.Content) {
                            case "ChatOther-ItemMouth-RubItem" :
                            case "ChatSelf-ItemMouth-RubItem" :
                                this.CleanSplatter("mouth");
                                break;
                            case "ChatOther-ItemHood-RubItem" :
                            case "ChatSelf-ItemHood-RubItem" :
                                this.CleanSplatter("forehead");
                                break;
                            case "ChatOther-ItemBreast-RubItem":
                            case "ChatSelf-ItemBreast-RubItem":    
                                this.CleanSplatter("chest");
                                break;
                            case "ChatOther-ItemPelvis-RubItem":
                            case "ChatSelf-ItemPelvis-RubItem":
                                this.CleanSplatter("tummy");
                                break;
                            case "ChatOther-ItemVulva-RubItem":
                            case "ChatSelf-ItemVulva-RubItem":
                                this.CleanSplatter("crotch");
                                break;
                            default :
                                break;
                        }
                    }
            }
        });

        Activities().AddActivity(<ActivityBundle>{
            Activity: <Activity>{
                Name: "Splat",
                MaxProgress: 90,
                MaxProgressSelf: 90
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's mouth.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }, {
                    Name: "ItemHead",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's face.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }, {
                    Name: "ItemBreast",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's chest.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }, {
                    Name: "ItemPelvis",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's tummy.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }, {
                    Name: "ItemVulva",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's crotch.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }, {
                    Name: "ItemPenis",
                    SelfAllowed: true,
                    TargetLabel: "Spray",
                    TargetAction: "SourceCharacter sprays all over TargetCharacter's crotch.",
                    TargetSelfAction: "SourceCharacter sprays all over TargetCharacter."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "CanSquirt",
                    Func: (acting, acted, group) => {
                        let giverAllowed = this.canCumOnOther(acting);
                        let takerAllowed = this.canReceiveSplat(<OtherCharacter>acted);
                        return giverAllowed && takerAllowed;
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target) {
                        let location = GetMetadata(args[1])?.GroupName;
                        let dict = args[1]?.Dictionary;
                        if (!!Player.LSCG.SplatterModule.colorOverride) {
                            dict.push({
                                Tag: "ColorOverride",
                                ColorOverride: Player.LSCG.SplatterModule.colorOverride
                            })
                        }
                    }
                    return next(args);
                }
            },
            CustomImage: ICONS.SPLAT
        });

        hookFunction("ActivityOrgasmStart", 1, (args, next) => {
            let C = args[0];
            if (C.IsPlayer() &&
                CurrentScreen == "ChatRoom" &&
                this.Enabled && 
                this.canCumOnOther(Player) && 
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
                        
                        if (!Player.IsRestrained() || Player.CanWalk()) { // If bound, remove control of where to cum
                            let areas = this.getTargetSelectAreas();
                            if (areas.length <= 0) this.ResetPrompt();
                            areas.forEach(pair => {
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
            <RectTuple>[x + ((ix%4) * 250), y + (Math.floor(ix / 4) * 65), w, h],
            c
        ]);
    }

    getLocationSelectAreas(): [RectTuple, SplatterLocation][] {
        let targets: SplatterLocation[] = [
            "mouth",
            "forehead",
            "chest",
            "tummy",
            "crotch"
        ];
        let x = 0;
        let y = -40;
        let w = 240;
        let h = 60;
        return targets.map((l, ix, arr) => [
            <RectTuple>[x + ((ix%3) * 250), y + (Math.floor(ix / 3) * 65), w, h],
            l
        ]);
    }

    getLocationLabel(loc: SplatterLocation, target: Character | null) {
        let isMale = target?.GetPronouns() == "HeHim";
        switch(loc) {
            case "mouth": return "Mouth";
            case "forehead": return "Face";
            case "chest": return isMale ? "Chest" : "Breasts";
            case "tummy": return "Stomach";
            case "crotch": return target?.HasPenis() ? "Cock" : "Pussy";
            default: return "Nowhere";
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Splatter);
    }
    
    canCumOnOther(acting: Character) {
        let naked = (InventoryPrerequisiteMessage(acting, "AccessCrotch") === "") && !acting.IsVulvaChaste() && !acting.IsEnclose();
        let arousalAllowed = (acting.ArousalSettings?.Progress ?? 0) > 90 && !acting.IsEdged();
        let giverAllowed = (<OtherCharacter>acting).LSCG.SplatterModule.enabled && (<OtherCharacter>acting).LSCG.SplatterModule.giver;
        return naked && arousalAllowed && giverAllowed;
    }

    canReceiveSplat(target: OtherCharacter) {
        return (target.LSCG?.GlobalModule?.enabled || target.LSCG?.enabled) && target.LSCG?.SplatterModule?.enabled && target.LSCG?.SplatterModule?.taker;
    }

    getSplats(C?: Character): Array<Item | null> {
        C = C ?? Player;
        return [InventoryGet(C, "splatterlocation???")].filter(m => !!m && m.Asset.Name == "splatter???");
    }    
    
    splatSlotsOccupied() {
        return this.getSplats().length == this.TOTAL_SPLAT_SLOTS;
    }
    
    FindSplatterTargets(): Character[] {
        let partners = this.recentPartners.map(p => getCharacter(p)).filter(c => !!c) as Character[];
        let mySpot = ChatRoomCharacter.findIndex(c => c.MemberNumber == Player.MemberNumber);
        let nearby = [ChatRoomCharacter[mySpot-1], ChatRoomCharacter[mySpot+1]].filter(c => !!c);
        return partners.concat(nearby).filter(c => !!c && this.canReceiveSplat(<OtherCharacter>c));
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
        if (this.canReceiveSplat(target)) {
            let targetGroupName: AssetGroupItemName = "ItemMouth";
            switch (location) {
                case "mouth": targetGroupName = "ItemMouth"; break;
                case "forehead": targetGroupName = "ItemHead"; break;
                case "chest": targetGroupName = "ItemBreast"; break;
                case "tummy": targetGroupName = "ItemPelvis"; break;
                case "crotch": targetGroupName = "ItemVulva"; break;
                case "all": targetGroupName = ""; break;
            }
            let group = ActivityGetGroupOrMirror(target.AssetFamily, targetGroupName);
            let tmp = target.FocusGroup; // haaack
            target.FocusGroup = group;
            let activity = ActivityAllowedForGroup(target, targetGroupName).find(a => a.Activity.Name == "LSCG_Splat");
            target.FocusGroup = tmp;
            if (group != null && activity != null) {
                ActivityRun(Player, target, group, activity, true);
            }
        }
    }

    CleanSplatter(location: SplatterLocation) {
        console.info(`Cleaning splatter from ${location}`);
        var splats = [InventoryGet(Player, "splatterlocation???")].filter(m => !!m && m.Asset.Name == "splatter???");
        if (!splats || splats.length <= 0)
            return;

        splats.forEach(splat => {
            switch (location) {
                case "mouth" :
                case "forehead" :
                case "chest" :
                case "tummy" :
                case "crotch":
                case "all" :
                default :
                    break;
            }    
        })        

        ChatRoomCharacterUpdate(Player);
    }

    AddSplatter(sender: Character, location: SplatterLocation, colorOverride: ItemColor | null) {
        console.info(`Adding splatter to ${location}`);
        var splats = this.getSplats();
        // Adjust marks
        switch (location) {
            case "mouth" :
            case "forehead" :
            case "chest" :
            case "tummy" :
            case "crotch" :
            case "all" :
            default :
                break;
        }
    
        ChatRoomCharacterUpdate(Player);
    }
}