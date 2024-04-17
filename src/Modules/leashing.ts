import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetActivityName, GetTargetCharacter, ICONS, IsIncapacitated, LSCG_SendLocal, OnAction, OnActivity, SendAction, callOriginal, getCharacter, getRandomInt, hookFunction, mouseTooltip, removeAllHooksByModule, replace_template, sendLSCGCommand, sendLSCGCommandBeep, setOrIgnoreBlush } from "../utils";
import { MiscModule } from "./misc";
import { Pairing } from "./States/PairedBaseState";
import { ItemUseModule } from "./item-use";
import { CollarModel } from "Settings/Models/collar";
import { CollarModule } from "./collar";
import { CommandListener, CoreModule } from "./core";

export type GrabType = "hand"  | "ear" | "tongue" | "arm" | "neck" | "mouth" | "horn" | "mouth-with-foot" | "chomp" | "eyes" | "compulsion"

export interface LeashDefinition {
    Type: GrabType;
    LabelTarget: string;
    LabelSource: string;
    Reverse: boolean; // Victim will drag initiator
    Bidirectional: boolean; // Will drag if any member leaves
    Ephemeral: boolean; // Will not drag, but prevents leaving
    Icon: string;
    Gags: boolean;
    Blinds: boolean;
    OnAdd: (pairing: Leashing) => void;
    OnRemove: (pairing: Leashing) => void;
}

export const LeashDefinitions: Map<GrabType, LeashDefinition> = new Map<GrabType, LeashDefinition>([
    ["arm", <LeashDefinition>{Type: "arm", LabelTarget: "Arm grabbed by %OPP_NAME%", LabelSource: "Grabbing %OPP_NAME%'s arm"}],
    ["chomp", <LeashDefinition>{Type: "chomp", LabelTarget: "Chomped on by %OPP_NAME%", LabelSource: "Chomping on %OPP_NAME%", Icon: "Assets/Female3DCG/Mouth/Angry/Icon.png", Reverse: true, Gags: true,
        OnAdd: (pairing) => {
            if (pairing.IsSource) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Angry")};
        },
        OnRemove: (pairing) => {
            if (pairing.IsSource) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)['temp'] ?? null);
        }
    }],
    ["ear", <LeashDefinition>{Type: "ear", LabelTarget: "Ear pinched by %OPP_NAME%", LabelSource: "Pinching %OPP_NAME%'s ear", Icon: ICONS.EAR}],
    ["hand", <LeashDefinition>{Type: "hand", LabelTarget: "Holding %OPP_NAME%'s hand", Icon: ICONS.HOLD_HANDS, Bidirectional: true}],
    ["horn", <LeashDefinition>{Type: "horn", LabelTarget: "Horn grabbed by %OPP_NAME%", LabelSource: "Grabbing %OPP_NAME%'s horn"}],
    ["mouth", <LeashDefinition>{Type: "mouth", LabelTarget: "Mouth clamped by %OPP_NAME%", LabelSource: "Clamping over %OPP_NAME%'s mouth", Icon: ICONS.MUTE, Gags: true}],
    ["eyes", <LeashDefinition>{Type: "eyes", LabelTarget: "Eyes covered by %OPP_NAME%", LabelSource: "Covering %OPP_NAME%'s eyes", Icon: "Icons/Private.png", Blinds: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Eyes ?? null); CharacterSetFacialExpression(Player, "Eyes", "Closed")};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource) CharacterSetFacialExpression(Player, "Eyes", (<any>pairing)['temp'] ?? null);
        }}],
    ["mouth-with-foot", <LeashDefinition>{Type: "mouth-with-foot", LabelTarget: "Mouth filled with %OPP_NAME%'s foot", LabelSource: "Filling %OPP_NAME%'s mouth with foot", Icon: "Icons/Management.png", Ephemeral: true, Gags: true}],
    ["neck", <LeashDefinition>{Type: "neck", LabelTarget: "Choked by %OPP_NAME%", LabelSource: "Choking %OPP_NAME%", Icon: ICONS.NECK,
        OnAdd: (pairing) => {
            if (!pairing.IsSource) getModule<CollarModule>("CollarModule")?.HandChoke(getCharacter(pairing.PairedMember))
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource) getModule<CollarModule>("CollarModule")?.ReleaseHandChoke(getCharacter(pairing.PairedMember), true)
        }}],
    ["tongue", <LeashDefinition>{Type: "tongue", LabelTarget: "Tongue held by %OPP_NAME%", LabelSource: "Holding %OPP_NAME%'s tongue", Icon: ICONS.TONGUE, Gags: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Ahegao")};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)['temp'] ?? null);
        }
    }],
    ["compulsion", <LeashDefinition>{Type: "compulsion", LabelTarget: "Compelled to follow %OPP_NAME%", LabelSource: "Followed by %OPP_NAME%", Icon: ICONS.PENDANT}]
]);

export class Leashing implements Pairing {
    constructor(pairedMember: number, pairedBy: number, isSource: boolean, type: GrabType) {
        this.PairedMember = pairedMember;
        this.PairedBy = pairedBy;
        this.IsSource = isSource;
        this.Type = type;
    }
    PairedMember: number;
    PairedBy: number;
    IsSource: boolean;
    Type: GrabType;
}

export class LeashingModule extends BaseModule {
    Pairings: Leashing[] = [];

    get defaultSettings() {
        return <BaseSettingsModel>{
            enabled: true
        };
    }

    get RoomAllowsLeashing(): boolean {
        return (ChatRoomData && ChatRoomData.BlockCategory && ChatRoomData.BlockCategory.indexOf("Leashing") < 0) || !ChatRoomData;
    }

    get totalHands(): number {
        return 2;
    }

    get totalFeet(): number {
        return 2;
    }

    get LeashedByPairings(): Leashing[] {
        return this.Pairings.filter(p => this.CanDragPlayer(p));
    }

    get IsLeashed(): boolean {
        return this.LeashedByPairings.length > 0;
    }

    get LeashedByMemberNumbers(): number[] {
        return this.LeashedByPairings.map(p => p.PairedMember);
    }

    get Leashings(): Leashing[] {
        return this.Pairings.filter(p => this.PlayerCanDrag(p));
    }

    get IsLeashing(): boolean {
        return this.Leashings.length > 0;
    }

    get LeashingsMemberNumbers(): number[] {
        return this.Leashings.map(p => p.PairedMember);
    }

    get GaggingLeashings(): Leashing[] {
        return this.Pairings.filter(p => this.IsGagging(p));
    }

    get IsCustomGagged(): boolean {
        return this.GaggingLeashings.length > 0;
    }

    get BlindingLeashings(): Leashing[] {
        return this.Pairings.filter(p => this.IsBlinding(p));
    }

    get IsCustomBlinded(): boolean {
        return this.BlindingLeashings.length > 0;
    }

    usesHandsTypes: GrabType[] = [
        "hand",
        "arm",
        "horn",
        "ear",
        "mouth",
        "neck",
        "tongue"
    ]

    get usingHandsCount(): number {
        return this.Pairings.filter(p => {
            let definition = LeashDefinitions.get(p.Type);
            return this.usesHandsTypes.indexOf(p.Type) > -1 && (p.IsSource || definition?.Bidirectional);
        }).length;
    }

    safeword(): void {
        this.ClearAllLeashings();
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Leashed);
    }

    load(): void {
        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Pairings.some(p => (this.CanDragPlayer(p) && p.Type != "hand")))
                return false;
            return next(args);
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomLeave", 1, (args, next) => {
            if (this.RoomAllowsLeashing) {
                let earPinchingMemberList = this.Pairings.filter(p => p.IsSource && p.Type == "ear").map(p => p.PairedMember);
                let armGrabbingMemberList = this.Pairings.filter(p => p.IsSource && p.Type == "arm").map(p => p.PairedMember);
                let tongueGrabbedMemberList = this.Pairings.filter(p => p.IsSource && p.Type == "tongue").map(p => p.PairedMember);
                let chompedBy = this.Pairings.filter(p => !p.IsSource && p.Type == "chomp").map(p => p.PairedMember);
                let compellingList = this.Pairings.filter(p => p.IsSource && p.Type == "compulsion").map(p => p.PairedMember)

                if (earPinchingMemberList.length > 0) {
                    var chars = earPinchingMemberList.map(id => getCharacter(id));
                    if (chars.length == 1)
                        SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
                    else
                        SendAction("%NAME% leads " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their ears.");
                } else if (armGrabbingMemberList.length > 0) {
                    var chars = armGrabbingMemberList.map(id => getCharacter(id));
                    if (chars.length == 1)
                        SendAction("%NAME% roughly pulls %OPP_NAME% out of the room by the arm.", chars[0]);
                    else
                        SendAction("%NAME% roughly pulls " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their arms.");
                } else if (tongueGrabbedMemberList.length > 0) {
                    var chars = tongueGrabbedMemberList.map(id => getCharacter(id));
                    if (chars.length == 1)
                        SendAction("%NAME% tugs %OPP_NAME% out of the room by the tongue.", chars[0]);
                    else
                        SendAction("%NAME% tugs " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their tongues.");
                } else if (chompedBy.length > 0) {
                    var chars = chompedBy.map(id => getCharacter(id));
                    if (chars.length == 1)
                        SendAction(`%NAME% drags %OPP_NAME% out of the room with a wince.`, chars[0]);
                    else {
                        let nameStr = "everyone chomping down";
                        try {
                            nameStr = chars.slice(0, chars.length - 2).map(c => CharacterNickname(c!)).join(", ") + ", and " + CharacterNickname(chars[chars.length - 1]!)
                        } catch {}
                        SendAction(`%NAME% drags ${nameStr} out of the room with a wince.`);
                    }
                } else if (compellingList.length > 0) {
                    var chars = compellingList.map(id => getCharacter(id));
                    if (chars.length == 1)
                        SendAction(`%OPP_NAME%'s eyes lock on to %NAME% and follows %INTENSIVE% out of the room obediently.`, chars[0]);
                    else {
                        let nameStr = "";
                        try {
                            nameStr = chars.slice(0, chars.length - 2).map(c => CharacterNickname(c!)).join(", ") + ", and " + CharacterNickname(chars[chars.length - 1]!)
                        } catch {}
                        SendAction(`${nameStr} follow %NAME% out of the room obediently.`);
                    }
                } else if (this.Leashings.length > 0) {
                    if (this.Leashings.length == 1)
                        SendAction(`%NAME% leads %OPP_NAME% out of the room by the ${this.Leashings[0].Type}.`, getCharacter(this.Leashings[0].PairedMember));
                    else
                        SendAction("%NAME% leads " + CharacterNickname(getCharacter(this.Leashings[0].PairedMember)!) + " and " + CharacterNickname(getCharacter(this.Leashings[1].PairedMember)!) + " out of the room.");
                }
            }

            this.RemoveAllLeashingsOfType("mouth-with-foot");

            return next(args);
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomCharacterViewDrawOverlay", 1, (args, next) => {
            const ret = next(args) as any;
            const [C, CharX, CharY, Zoom] = args;
            if (
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                ChatRoomHideIconState === 0 &&
                C.IsPlayer()
            ) {
                let tooltip = undefined;
                this.Pairings
                    .forEach((p, ix, arr) => {                    
                        let targetIsGrabbed = !p.IsSource;
                        let yOffset = ix * 40 * Zoom;
                        let icon = this.GetIconForGrabType(p.Type)
                        DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom + yOffset, 20 * Zoom, 1, "Black", targetIsGrabbed ? "White" : "#90E4C1")
                        DrawImageResize(
                            icon,
                            CharX + 405 * Zoom, CharY + 45 * Zoom + yOffset, 30 * Zoom, 30 * Zoom
                        );
                        if (MouseIn(CharX + 400 * Zoom, CharY + 40 * Zoom + yOffset, 40 * Zoom, 40 * Zoom)) {
                            let def = LeashDefinitions.get(p.Type);
                            tooltip = replace_template((p.IsSource ? def?.LabelSource ?? def?.LabelTarget : def?.LabelTarget ?? def?.LabelSource) ?? "", getCharacter(p.PairedMember), p.PairedMember + "");
                        }
                    });
                if (!!tooltip)
                    mouseTooltip(tooltip);
            }
            return ret;
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
            let sourceMemberNumber = args[0];
            let C = args[1];

            if (this.Enabled && this.IsLeashedBy(sourceMemberNumber) && this.RoomAllowsLeashing) {
                // Have to not be tethered, and need a leash
                var isTrapped = false;
                var neckLock = null;
                for (let A = 0; A < C.Appearance.length; A++)
                    if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Family == C.AssetFamily)) {
                        if (InventoryItemHasEffect(C.Appearance[A], "Leash", true) && C.Appearance[A].Asset.Group.Name == "ItemNeckRestraints") {
                            neckLock = InventoryGetLock(C.Appearance[A]);
                        } else if (InventoryItemHasEffect(C.Appearance[A], "Tethered", true) || InventoryItemHasEffect(C.Appearance[A], "Mounted", true) || InventoryItemHasEffect(C.Appearance[A], "Enclose", true) || InventoryItemHasEffect(C.Appearance[A], "OneWayEnclose", true)){
                            isTrapped = true;
                        }
                    }
        
                if (!isTrapped) {
                    if (sourceMemberNumber == 0 || !neckLock || (!neckLock.Asset.OwnerOnly && !neckLock.Asset.LoverOnly && !neckLock.Asset.FamilyOnly) ||
                        (neckLock.Asset.OwnerOnly && C.IsOwnedByMemberNumber(sourceMemberNumber)) ||
                        (neckLock.Asset.FamilyOnly && C.IsFamilyOfPlayer()) ||
                        (neckLock.Asset.LoverOnly && C.IsLoverOfMemberNumber(sourceMemberNumber))) {
                        return true;
                    }
                }
            }
            else    
                return next(args);
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomPingLeashedPlayers", 1, (args, next) => {
            next(args);
            if (this.Enabled) {
                this.Leashings.forEach(l => {
                    ServerSend("ChatRoomChat", { Content: "PingHoldLeash", Type: "Hidden", Target: l.PairedMember });
                    ServerSend("AccountBeep", { MemberNumber: l.PairedMember, BeepType: "Leash"});
                });
            }
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomDoPingLeashedPlayers", 1, (args, next) => {
            next(args);
            let SenderCharacter = args[0];
            if (!ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
                this.DoEscape(SenderCharacter);
            }
        }, ModuleCategory.Leashed);

        hookFunction("ServerAccountBeep", 1, (args, next) => {
            next(args);
            let data = args[0];
            if (this.Enabled && data.BeepType == "Leash" && this.LeashedByPairings.map(p => p.PairedMember).indexOf(data.MemberNumber) > -1 && data.ChatRoomName) {
                if (Player.OnlineSharedSettings && Player.OnlineSharedSettings.AllowPlayerLeashing != false && (CurrentScreen != "ChatRoom" || !ChatRoomData || (CurrentScreen == "ChatRoom" && ChatRoomData.Name != data.ChatRoomName))) {
                    if (ChatRoomCanBeLeashedBy(data.MemberNumber, Player) && ChatSelectGendersAllowed(data.ChatRoomSpace, Player.GetGenders())) {
                        ChatRoomJoinLeash = data.ChatRoomName;
    
                        DialogLeave();
                        ChatRoomClearAllElements();
                        if (CurrentScreen == "ChatRoom") {
                            ServerSend("ChatRoomLeave", "");
                            CommonSetScreen("Online", "ChatSearch");
                        }
                        else ChatRoomStart(data.ChatRoomSpace, "", null, null, "Introduction", BackgroundsTagList); //CommonSetScreen("Room", "ChatSearch")
                    } else {
                        // If the leading character is no longer allowed or goes somewhere blocked, remove them from our leading lists.
                        this.RemoveLeashingsWithMember(data.MemberNumber, false);
                    }
                }
            }
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomSync", 1, (args, next) => {
            var ret = next(args) as any;
            var currentRoomIds = ChatRoomCharacter.map(c => c.MemberNumber!);
            this.LeashingsMemberNumbers.filter(id => currentRoomIds.indexOf(id) == -1).forEach(memberNumber => {
                ServerSend("AccountBeep", { MemberNumber: memberNumber, BeepType: "Leash"});
            });
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomMapViewLeash", 1, (args, next) => {
            if (this.Enabled && this.IsLeashed) {
                let totalLeashedBy = this.LeashedByPairings.map(p => p.PairedMember);
                let leashedByMovedAway = totalLeashedBy.filter(leashedByNum => {
                    let C = getCharacter(leashedByNum);
                    if (!C) return false;
                    if ((Player.MapData == null) || (Player.MapData.Pos.X == null) || (Player.MapData.Pos.Y == null)) return false;
			        if ((C.MapData?.Pos == null) || (C.MapData.Pos.X == null) || (C.MapData.Pos.Y == null)) return false;
                    let Distance = Math.max(Math.abs(Player.MapData.Pos.X - C.MapData.Pos.X), Math.abs(Player.MapData.Pos.Y - C.MapData.Pos.Y));
			        if (Distance <= 2) return false;
                    return leashedByNum;
                });
                next(args);
                let temp = ChatRoomLeashPlayer;
                leashedByMovedAway.forEach(num => {
                    ChatRoomLeashPlayer = num;
                    next(args);
                });
                ChatRoomLeashPlayer = temp;
            } else
                return next(args);
        }, ModuleCategory.Leashed)

        OnAction(1, ModuleCategory.Leashed, (data, sender, msg, metadata) => {
            if (data?.Content == "ServerDisconnect") {
                let num = sender?.MemberNumber;
                if (!!num) {
                    this.RemoveAllLeashingsWithMember(num);
                }
            }
        });

        // Allow for similar "hand-gagging" when certain custom actions are done
        hookFunction("ServerSend", 1, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Chat"){
                if (this.IsCustomGagged) {
                    let gagIncrease = 2 * this.GaggingLeashings.length;
                    let currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
                    args[1].Content = SpeechGarbleByGagLevel(currentGagLevel + gagIncrease, args[1].Content);
                    args[1].Content = SpeechStutter(Player, args[1].Content);
                    args[1].Content = SpeechBabyTalk(Player, args[1].Content);
                }
            }
            next(args);
        }, ModuleCategory.Leashed);

        hookFunction('Player.GetBlindLevel', 1, (args, next) => {
            if (this.IsCustomBlinded)
                return Player.GameplaySettings?.SensDepChatLog == "SensDepLight" ? 2 : 3;
            return next(args);
        }, ModuleCategory.Leashed);

        let failedLinkActions = [
            "%NAME%'s whimpers, %POSSESSIVE% tongue held tightly.",
            "%NAME% strains, trying to pull %POSSESSIVE% tongue free.",
            "%NAME% starts to drool, %POSSESSIVE% tongue held fast."
        ];             

        hookFunction('ServerSend', 5, (args, next) => {
            let sendType = args[0];
            let data = args[1]; 
            if (sendType == "ChatRoomChat" && data?.Type == "Activity"){
                var activityName = GetActivityName(data);
                if (activityName == "Lick" && this.Pairings.some(p => !p.IsSource && p.Type == "tongue"))
                    SendAction(failedLinkActions[getRandomInt(failedLinkActions.length)]);
                else
                    return next(args);
            } else {
                return next(args);
            }
        }, ModuleCategory.Leashed);

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "leashing-listener",
            command: "add-leashing",
            func: (sender, msg) => this.HandleLeashingRequest(sender, msg)
        });

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "leashing-removal-listener",
            command: "remove-leashing",
            func: (sender, msg) => this.HandleLeashRemovalRequest(sender, msg)
        });
    }

    RoomSync(): void {}

    SpeechBlock(): void {}

    GetDefinition(type: GrabType) {
        return LeashDefinitions.get(type);
    }

    // **** CRUD ****

    CanAddLeashing(leashing: Leashing) {
        return this.CanAddLeashingType(leashing.Type);
    }

    CanAddLeashingType(type: GrabType) {
        if (this.usesHandsTypes.indexOf(type) > -1) {
            return this.usingHandsCount < this.totalHands;
        }
        switch (type) {
            case "chomp":
                return !this.Pairings.some(p => p.Type == "chomp");
            case "mouth-with-foot":
                return this.Pairings.filter(p => p.Type == "mouth-with-foot").length < 2;
            default:
                return true;
        }
    }

    AddLeashing(pairing: Leashing) {
        let exists = this.Pairings.find(p => p.PairedMember == pairing.PairedMember && p.Type == pairing.Type && p.IsSource == pairing.IsSource);
        if (!exists)
            this.Pairings.push(pairing);
        else // Update if existing pairing to member of matching type
            pairing = Object.assign(exists, pairing);
        let definition = LeashDefinitions.get(pairing.Type);
        if (!!definition?.OnAdd)
            definition.OnAdd(pairing);
    }

    RemoveAllLeashingsWithMember(pairedMember: number) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedMember == pairedMember) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveLeashingsWithMember(pairedMember: number, isSource: boolean) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedMember == pairedMember && p.IsSource == isSource) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveLeashings(pairedMember: number, isSource: boolean, type: GrabType) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedMember == pairedMember && p.Type == type && p.IsSource == isSource) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveLeashingsCreatedByMember(matchmaker: number) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedBy == matchmaker) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveAllLeashingsOfType(type: GrabType) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.Type == type) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveCallback(pairing: Leashing) {
        let definition = LeashDefinitions.get(pairing.Type);
        if (definition?.OnRemove)
            definition.OnRemove(pairing);
    }

    NotifyUnleashings(leashings: Leashing[]) {
        leashings.forEach(l => {
            sendLSCGCommandBeep(l.PairedMember, "release", [{
                name: "type",
                value: l.Type
            }])
        });
    }

    ClearAllLeashings() {
        this.NotifyUnleashings(this.Pairings);
        this.Pairings = [];
    }

    IsLeashedByType(target: number, type: GrabType) {
        return this.Pairings.some(p => this.CanDragPlayer(p) && p.Type == type && p.PairedMember == target)
    }

    ContainsLeashing(target: number, type: GrabType) {
        return this.Pairings.some(p => this.PlayerCanDrag(p) && p.Type == type && p.PairedMember == target)
    }

    // *** HELPERS ***

    IsBidirectionalType(type: GrabType) {
        return LeashDefinitions.get(type)?.Bidirectional ?? false;
    }

    CanDragPlayer(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return !def?.Ephemeral && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional)
    }

    PlayerCanDrag(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return !def?.Ephemeral && 
        ((leashing.IsSource && !def?.Reverse) || (!leashing.IsSource && def?.Reverse) || def?.Bidirectional)
    }

    IsGagging(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return def?.Gags && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional);
    }

    IsBlinding(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return def?.Blinds && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional);
    }

    IsLeashedBy(member: number) {
        return this.LeashedByMemberNumbers.indexOf(member) > -1;
    }

    GetIconForGrabType(type: GrabType) {
        return LeashDefinitions.get(type)?.Icon ?? "Icons/Battle.png";
    }

    // **** COMMS ****

    HandleLeashingRequest(sender: number, msg: LSCGMessageModel) {
        let args = msg.command?.args;
        if (!args || msg.command?.name != "add-leashing")
            return;
        let pairedMember = args.find(a => a.name == "pairedMember")?.value as number;
        let type = args.find(a => a.name == "type")?.value as GrabType;
        let isSource = args.find(a => a.name == "isSource")?.value as boolean;
        this.AddLeashing(new Leashing(pairedMember, sender, isSource, type));
    }

    HandleLeashRemovalRequest(sender: number, msg: LSCGMessageModel) {
        let args = msg.command?.args;
        if (!args || msg.command?.name != "remove-leashing")
            return;
        let pairedMember = args.find(a => a.name == "pairedMember")?.value as number;
        let type = args.find(a => a.name == "type")?.value as GrabType;
        let isSource = args.find(a => a.name == "isSource")?.value as boolean;
        this.RemoveLeashings(pairedMember, isSource, type);
    }

    DoGrab(target: Character, type: GrabType) {
        let definition = LeashDefinitions.get(type);
        if (!target.MemberNumber || 
            //target.IsPlayer() || 
            !this.CanAddLeashingType(type))
            return;

        this.AddLeashing(new Leashing(
            target.MemberNumber,
            target.MemberNumber,
            true,
            type
        ));

        if (!target.IsPlayer()) 
            sendLSCGCommandBeep(target.MemberNumber, "grab", [{
                name: "type",
                value: type
            }]);
    };

    DoRelease(target: Character, type: GrabType) {
        if (!target.MemberNumber)
            return;

        if (!target.IsPlayer()) 
            sendLSCGCommand(target, "release", [{
                name: "type",
                value: type
            }]);
     
        this.RemoveLeashings(target.MemberNumber, true, type);
    }

    DoEscape(escapeFrom: Character) {
        if (!escapeFrom.MemberNumber)
            return;

        this.RemoveLeashingsWithMember(escapeFrom.MemberNumber, false);
        sendLSCGCommand(escapeFrom, "escape");
    }

    IncomingGrab(sender: Character | null, grabType: GrabType) {
        if (!!sender && !!sender.MemberNumber) {
            this.AddLeashing(new Leashing(sender.MemberNumber,
                sender.MemberNumber,
                false, 
                grabType));
            if (grabType != "hand")
                this.NotifyAboutEscapeCommand(sender, grabType);
        }
    }

    IncomingRelease(sender: OtherCharacter | null, grabType: GrabType) {
        if (!!sender && !!sender.MemberNumber)
            this.RemoveLeashings(sender.MemberNumber, false, grabType);
    }

    IncomingEscape(sender: OtherCharacter | null, escapeFromMemberNumber: number) {
        if (!!sender && !!sender.MemberNumber && escapeFromMemberNumber == Player.MemberNumber) {
            this.RemoveLeashingsWithMember(sender.MemberNumber, true);
        }
    }

    NotifyAboutEscapeCommand(grabber: Character, type: GrabType) {
        if (type == "mouth-with-foot")
            LSCG_SendLocal(replace_template(`${CharacterNickname(grabber)} has filled your mouth with %OPP_POSSESSIVE% foot! <br>[You can use '/lscg escape' to try and escape]`, grabber));
        else if (type == "chomp")
            LSCG_SendLocal(`${CharacterNickname(grabber)} has chomped down hard on you! <br>[You can use '/lscg escape' to try and escape]`);
        else
            LSCG_SendLocal(`Your ${type} has been grabbed by ${CharacterNickname(grabber)}! <br>[You can use '/lscg escape' to try and break free]`);
    }

    escapeAttempted: number = 0;
    escapeCooldown: number = 120000;
    TryEscape() {
        if (this.escapeAttempted > 0) {
            if (CommonTime() < (this.escapeAttempted + this.escapeCooldown)) {
                LSCG_SendLocal(`You are too tired from your last escape attempt!`);
                return;
            } else {
                this.escapeAttempted = 0;
            }
        }
        let grabbingMembers = this.LeashedByMemberNumbers;
        let grabbingMemberNumber = grabbingMembers[0];
        if (grabbingMemberNumber < 0) {
            LSCG_SendLocal(`You are not grabbed by anyone!`);
            return;
        }

        var grabber = getCharacter(grabbingMemberNumber);
        if (!grabber) {
            LSCG_SendLocal(`Cannot locate grabber! [Try refreshing if they DC'd]`);
            return;
        }

        SendAction(`${CharacterNickname(Player)} tries %POSSESSIVE% best to escape from %OPP_NAME%'s grip...`, grabber);
        setTimeout(() => {
            if (!grabber || !grabber?.MemberNumber)
                return;
            let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(Player, grabber);
            if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}successfully breaks free from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.DoEscape(grabber);
            } else {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}squirms and wriggles but fails to escape from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.escapeAttempted = CommonTime();
            }
        }, 4000);
    }
}