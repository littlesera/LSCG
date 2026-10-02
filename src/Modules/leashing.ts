import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetActivityName, GetTargetCharacter, ICONS, IsIncapacitated, LSCG_SendLocal, OnAction, OnActivity, SendAction, callOriginal, getCharacter, isAllowedMember, getRandomInt, hookFunction, mouseTooltip, removeAllHooksByModule, replace_template, sendLSCGCommand, sendLSCGCommandBeep, setOrIgnoreBlush } from "../utils";
import { MiscModule } from "./misc";
import { Pairing } from "./States/PairedBaseState";
import { ItemUseModule } from "./item-use";
import { CollarModel } from "Settings/Models/collar";
import { CollarModule } from "./collar";
import { CommandListener, CoreModule } from "./core";
import { emit, emitBefore } from "api/events";

export type GrabType = "hand"  | "ear" | "tongue" | "arm" | "neck" | "mouth" | "horn" | "mouth-with-foot" | "chomp" | "eyes" | "compulsion" | "tail" | "hair" | "nose" | "nipples" | "collar" | "leash"

export interface LeashDefinition {
    Type: GrabType;
    LabelTarget: string;
    LabelSource?: string;
    Reverse?: boolean; // Victim will drag initiator
    Bidirectional?: boolean; // Will drag if any member leaves
    Ephemeral?: boolean; // Will not drag, but prevents leaving
    Icon?: string;
    Gags?: boolean;
    Blinds?: boolean;
    Action?: string;
    OnAdd?: (pairing: Leashing) => void;
    OnRemove?: (pairing: Leashing) => void;
}

export const LeashDefinitions = new Map<GrabType, LeashDefinition>([
    ["arm", {Type: "arm", Action: "roughly pulls", LabelTarget: "Arm grabbed by %OPP_NAME%", LabelSource: "Grabbing %OPP_NAME_POSSESSIVE% arm"}],
    ["hair", {Type: "hair", Action: "drags", LabelTarget: "Hair pulled by %OPP_NAME%", LabelSource: "Pulling %OPP_NAME_POSSESSIVE% hair"}],
    ["nose", {Type: "nose", Action: "pulls", LabelTarget: "Nose pulled by %OPP_NAME%", LabelSource: "Pulling %OPP_NAME_POSSESSIVE% nose"}],
    ["nipples", {Type: "nipples", Action: "yanks", LabelTarget: "Nipples pulled by %OPP_NAME%", LabelSource: "Pulling %OPP_NAME_POSSESSIVE% nipples"}],
    ["chomp", {Type: "chomp", LabelTarget: "Chomped on by %OPP_NAME%", LabelSource: "Chomping on %OPP_NAME%", Icon: "Assets/Female3DCG/Mouth/Angry/Icon.png", Reverse: true, Gags: true,
        OnAdd: (pairing) => {
            if (pairing.IsSource) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Angry")};
        },
        OnRemove: (pairing) => {
            if (pairing.IsSource) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)['temp'] ?? null);
        }
    }],
    ["ear", {Type: "ear", LabelTarget: "Ear pinched by %OPP_NAME%", LabelSource: "Pinching %OPP_NAME_POSSESSIVE% ear", Icon: ICONS.EAR}],
    ["hand", {Type: "hand", LabelTarget: "Holding %OPP_NAME_POSSESSIVE% hand", Icon: ICONS.HOLD_HANDS, Bidirectional: true}],
    ["horn", {Type: "horn", LabelTarget: "Horn grabbed by %OPP_NAME%", LabelSource: "Grabbing %OPP_NAME_POSSESSIVE% horn"}],
    ["tail", {Type: "tail", LabelTarget: "Tail held by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% tail"}],
    ["mouth", {Type: "mouth", LabelTarget: "Mouth clamped by %OPP_NAME%", LabelSource: "Clamping over %OPP_NAME_POSSESSIVE% mouth", Icon: ICONS.MUTE, Gags: true}],
    ["eyes", {Type: "eyes", LabelTarget: "Eyes covered by %OPP_NAME%", LabelSource: "Covering %OPP_NAME_POSSESSIVE% eyes", Icon: "Icons/Private.png", Blinds: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Eyes ?? null); CharacterSetFacialExpression(Player, "Eyes", "Closed")};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) CharacterSetFacialExpression(Player, "Eyes", (<any>pairing)['temp'] ?? null);
        }}],
    ["mouth-with-foot", {Type: "mouth-with-foot", LabelTarget: "Mouth filled with %OPP_NAME_POSSESSIVE% foot", LabelSource: "Filling %OPP_NAME_POSSESSIVE% mouth with foot", Icon: "Icons/Management.png", Ephemeral: true, Gags: true}],
    ["neck", {Type: "neck", LabelTarget: "Choked by %OPP_NAME%", LabelSource: "Choking %OPP_NAME%", Icon: ICONS.NECK,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) getModule<CollarModule>("CollarModule")?.HandChoke(getCharacter(pairing.PairedMember))
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) getModule<CollarModule>("CollarModule")?.ReleaseHandChoke(getCharacter(pairing.PairedMember), true)
        }}],
    ["collar", {Type: "collar", Action: "drags", LabelTarget: "Collar grabbed by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% collar", Icon: ICONS.COLLAR}],
    ["leash", {Type: "leash", LabelTarget: "Leashed to %OPP_NAME%", Icon: ICONS.LEASH, Bidirectional: true,
        OnAdd: (pairing) => getModule<LeashingModule>("LeashingModule")?.OnLeashClasped(pairing),
        OnRemove: (pairing) => getModule<LeashingModule>("LeashingModule")?.OnLeashUnclasped(pairing),
    }],
    ["tongue", {Type: "tongue", LabelTarget: "Tongue held by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% tongue", Icon: ICONS.TONGUE, Gags: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) {(<any>pairing)['temp'] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Ahegao")};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)['temp'] ?? null);
        }
    }],
    ["compulsion", {Type: "compulsion", LabelTarget: "Compelled to follow %OPP_NAME%", LabelSource: "Followed by %OPP_NAME%", Icon: ICONS.PENDANT}]
]);

export class Leashing implements Pairing {
    constructor(pairedMember: number, pairedBy: number, isSource: boolean, type: GrabType, sharedLeash?: boolean) {
        this.PairedMember = pairedMember;
        this.PairedBy = pairedBy;
        this.IsSource = isSource;
        this.Type = type;
        this.SharedLeash = sharedLeash;
    }
    PairedMember: number;
    PairedBy: number;
    IsSource: boolean;
    Type: GrabType;
    // A leash clasped to a collar: both ends wear one leash, and whichever end lets go loses it
    SharedLeash?: boolean;
}

type LeashingRemovalReason =
    | "AccountError"
    | "AlreadyInRoom"
    | "CannotFindRoom"
    | "GhostList"
    | "InvalidRoomData"
    | "RoomBanned"
    | "RoomBlocked"
    | "RoomFull"
    | "RoomLocked"
    | "TempHidden"
    | "Timeout"
;

export interface LeashClasp {
    a: number;
    b: number;
}

export class LeashingModule extends BaseModule {
    Pairings: Leashing[] = [];
    // Leashes we clasped between two other people. Each end tells us when it comes undone
    ClaspedLeashes: LeashClasp[] = [];
    leashLookQueued = false;

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

    get EscapablePairings(): Leashing[] {
        return this.Pairings.filter(p => this.CanEscape(p));
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

    get Clasps(): Leashing[] {
        return this.Pairings.filter(p => p.Type === "leash");
    }

    usesHandsTypes: GrabType[] = [
        "hand",
        "arm",
        "horn",
        "tail",
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
        const shared = this.Clasps.some(p => p.SharedLeash);
        this.ClearAllLeashings();
        if (shared)
            this.DropSharedLeash();
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Leashed);
    }

    load(): void {
        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Pairings.some(p => (this.CanDragPlayer(p) && !this.IsBidirectionalType(p.Type))))
                return false;
            return next(args);
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomLeave", 1, (args, next) => {
            if (this.RoomAllowsLeashing) {
                // Only name whoever's still here: someone pulling us out by the hand has already left
                const here = (p: Leashing) => getCharacter(p.PairedMember) !== null;
                const earPinchingMemberList = this.Pairings.filter(p => here(p) && p.IsSource && p.Type === "ear").map(p => p.PairedMember);
                const armGrabbingMemberList = this.Pairings.filter(p => here(p) && p.IsSource && p.Type === "arm").map(p => p.PairedMember);
                const tongueGrabbedMemberList = this.Pairings.filter(p => here(p) && p.IsSource && p.Type === "tongue").map(p => p.PairedMember);
                const chompedBy = this.Pairings.filter(p => here(p) && !p.IsSource && p.Type === "chomp").map(p => p.PairedMember);
                const compellingList = this.Pairings.filter(p => here(p) && p.IsSource && p.Type === "compulsion").map(p => p.PairedMember);
                const leading = this.Leashings.filter(here);

                if (earPinchingMemberList.length > 0) {
                    var chars = earPinchingMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
                    else
                        SendAction("%NAME% leads " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their ears.");
                } else if (armGrabbingMemberList.length > 0) {
                    var chars = armGrabbingMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% roughly pulls %OPP_NAME% out of the room by the arm.", chars[0]);
                    else
                        SendAction("%NAME% roughly pulls " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their arms.");
                } else if (tongueGrabbedMemberList.length > 0) {
                    var chars = tongueGrabbedMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% tugs %OPP_NAME% out of the room by the tongue.", chars[0]);
                    else
                        SendAction("%NAME% tugs " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their tongues.");
                } else if (chompedBy.length > 0) {
                    var chars = chompedBy.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction(`%NAME% drags %OPP_NAME% out of the room with a wince.`, chars[0]);
                    else {
                        let nameStr = "everyone chomping down";
                        try {
                            nameStr = CommonArrayJoinPretty(chars.map(c => CharacterNickname(c as Character)));
                        } catch {}
                        SendAction(`%NAME% drags ${nameStr} out of the room with a wince.`);
                    }
                } else if (compellingList.length > 0) {
                    var chars = compellingList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction(`%OPP_NAME_POSSESSIVE% eyes lock on to %NAME% and %PRONOUN% follows %INTENSIVE% out of the room obediently.`, chars[0]);
                    else {
                        let nameStr = "";
                        try {
                            nameStr = CommonArrayJoinPretty(chars.map(c => CharacterNickname(c as Character)));
                        } catch {}
                        SendAction(`${nameStr} follow %NAME% out of the room obediently.`);
                    }
                } else if (leading.length > 0) {
                    const definition = this.GetDefinition(leading[0]?.Type);
                    if (leading.length === 1)
                        SendAction(`%NAME% ${definition?.Action ?? "leads"} %OPP_NAME% out of the room by the ${leading[0].Type}.`, getCharacter(leading[0].PairedMember));
                    else
                        SendAction(`%NAME% ${definition?.Action ?? "leads"} ${CharacterNickname(getCharacter(leading[0].PairedMember) as Character)} and ${CharacterNickname(getCharacter(leading[1].PairedMember) as Character)} out of the room.`);
                }
            }

            this.RemoveAllLeashingsOfType("mouth-with-foot");

            return next(args);
        }, ModuleCategory.Leashed);

        // No leaving while clasped to someone who can't come along, same as the vanilla leash
        hookFunction("ChatRoomCanLeave", 1, (args, next) => {
            if (this.Clasps.some(p => this.CantBePulled(getCharacter(p.PairedMember))))
                return false;
            return next(args);
        }, ModuleCategory.Leashed);

        // Taking our leash off unclasps it, like vanilla drops its own leash. A leash swapped in while clasped should
        // still look held
        hookFunction("CharacterRefresh", 1, (args, next) => {
            const ret = next(args);
            if (args[0]?.IsPlayer() && this.Clasps.length > 0) {
                if (this.NeckLeash(Player) === null)
                    this.BreakClasps();
                else if (Player.Appearance.some(item => item.Asset.AllowEffect?.includes("IsLeashed") && !InventoryItemHasEffect(item, "IsLeashed", true)))
                    CharacterRefreshLeash(Player);
            }
            return ret;
        }, ModuleCategory.Leashed);

        // Vanilla only shows a leash as held for its own holder, so stand whoever we're clasped to in for that
        hookFunction("CharacterRefreshLeash", 1, (args, next) => {
            const claspedTo = this.Clasps[0]?.PairedMember;
            if (!args[0]?.IsPlayer() || ChatRoomLeashPlayer !== null || claspedTo === undefined)
                return next(args);
            ChatRoomLeashPlayer = claspedTo;
            try {
                return next(args);
            } finally {
                ChatRoomLeashPlayer = null;
            }
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomCharacterViewDrawOverlay", 1, (args, next) => {
            const ret = next(args);
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
                            if (this.IsLocked(p))
                                tooltip = `${tooltip} (locked)`;
                        }
                    });
                if (!!tooltip)
                    mouseTooltip(tooltip);
            }
            // Show our clasp on the other end too, and clasps we made on both of their ends
            const claspedTo = typeof CharX === "number" && ChatRoomHideIconState === 0 && !C.IsPlayer() ? this.ClaspPartnerOf(C) : null;
            if (
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                claspedTo !== null
            ) {
                DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White");
                DrawImageResize(ICONS.LEASH, CharX + 405 * Zoom, CharY + 45 * Zoom, 30 * Zoom, 30 * Zoom);
                if (MouseIn(CharX + 400 * Zoom, CharY + 40 * Zoom, 40 * Zoom, 40 * Zoom)) {
                    const label = replace_template(LeashDefinitions.get("leash")?.LabelTarget ?? "", claspedTo);
                    mouseTooltip(this.LeashLocked(C) ? `${label} (locked)` : label);
                }
            }
            return ret;
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomCharacterViewClickCharacter", 1, (args, next) => {
            const [C, CharX, CharY, Zoom, ClickX, ClickY] = args;
            let iconClicked = false;
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
                        
                        if (targetIsGrabbed && MouseIn(CharX + 400 * Zoom, CharY + 40 * Zoom + yOffset, 40 * Zoom, 40 * Zoom)) {
                            iconClicked = true;
                            if (confirm("Would you like to try and escape?")) {
                                this.TryEscape();
                            }
                        }
                    });
            } 
            if (!iconClicked)
                return next(args);
        })

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
                    // An owner, lover or family padlock on our leash doesn't stop the player it's clasped to from pulling us
                    if (this.IsLeashedByType(sourceMemberNumber, "leash"))
                        return true;
                    if (sourceMemberNumber == 0 || !neckLock || (!neckLock.Asset.OwnerOnly && !neckLock.Asset.LoverOnly && !neckLock.Asset.FamilyOnly) ||
                        (neckLock.Asset.OwnerOnly && C.IsOwnedByMemberNumber(sourceMemberNumber)) ||
                        (neckLock.Asset.FamilyOnly && C.IsFamilyOfPlayer()) ||
                        (neckLock.Asset.LoverOnly && C.IsLoverOfMemberNumber(sourceMemberNumber))) {
                        return true;
                    }
                }
            }   
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
            if (!ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber!, Player)) {
                this.DoEscape(SenderCharacter);
            }
        }, ModuleCategory.Leashed);

        // We need to track that across ServerHandleLeashBeep/ChatRoomBreakLeash
        let beepSourceNumber = -1;
        let beepRoomName = "";
        // The room a leash is taking us to, until its sync arrives. BC only checks the room it has already synced
        let followingTo: string | null = null;

        hookFunction("ServerHandleLeashBeep", 1, async (args, next) => {
            const [data] = args;
            // Another beep for the room we're following into, or have joined but not synced yet, pulls us back out and strands us in the lobby
            if (followingTo !== null && data.ChatRoomName === followingTo)
                return;
            // BC only follows ChatRoomLeashPlayer's beeps, and only checks it before its first await,
            // so stand our leasher in for that and put theirs straight back
            const vanillaLeashPlayer = ChatRoomLeashPlayer;
            const isOurLeasher = vanillaLeashPlayer !== data.MemberNumber && this.LeashedByMemberNumbers.indexOf(data.MemberNumber) > -1;
            // With leashing turned off the game won't pull us, so the grab breaks instead of stretching across rooms
            if (isOurLeasher && Player.OnlineSharedSettings?.AllowPlayerLeashing === false) {
                this.BreakLeashingsWith(data.MemberNumber);
                return;
            }
            // We can only follow one person. Someone else heading to the same room is fine, anywhere else their grab breaks
            if (isOurLeasher && beepSourceNumber !== -1 && beepSourceNumber !== data.MemberNumber) {
                if (data.ChatRoomName !== beepRoomName)
                    this.BreakLeashingsWith(data.MemberNumber);
                return;
            }
            if (isOurLeasher)
                ChatRoomLeashPlayer = data.MemberNumber;
            if (isOurLeasher || vanillaLeashPlayer === data.MemberNumber)
                followingTo = data.ChatRoomName;
            beepSourceNumber = data.MemberNumber;
            beepRoomName = data.ChatRoomName;
            try {
                let res: Promise<void>;
                try {
                    res = next(args);
                } finally {
                    if (isOurLeasher)
                        ChatRoomLeashPlayer = vanillaLeashPlayer;
                }
                return await res;
            } finally {
                beepSourceNumber = -1;
                if (ChatRoomData?.Name === followingTo)
                    followingTo = null;
            }
        }, ModuleCategory.Leashed);
        
        hookFunction("ChatRoomBreakLeash", 1, (args, next) => {
            followingTo = null;
            if (this.Enabled && Player.OnlineSharedSettings.AllowPlayerLeashing && beepSourceNumber !== -1) {
                this.BreakLeashingsWith(beepSourceNumber);
            }
            return next(args);
        }, ModuleCategory.Leashed);

        hookFunction("ChatRoomSync", 1, (args, next) => {
            if (args[0]?.Name === followingTo)
                followingTo = null;
            return next(args);
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
                const [x, y] = [Player.MapData?.Pos.X, Player.MapData?.Pos.Y];
                next(args);
                // One pull a frame: each pull puts us next to that leasher, so a second one straight after would undo it.
                // Anyone still out of reach gets their turn next frame
                if (Player.MapData?.Pos.X !== x || Player.MapData?.Pos.Y !== y || leashedByMovedAway.length === 0)
                    return;
                const temp = ChatRoomLeashPlayer;
                ChatRoomLeashPlayer = leashedByMovedAway[0];
                next(args);
                ChatRoomLeashPlayer = temp;
            } else
                return next(args);
        }, ModuleCategory.Leashed)

        // The game's safewords let go of us too
        for (const safeword of ["ChatRoomSafewordRelease", "ChatRoomSafewordRevert"] as const)
            hookFunction(safeword, 1, (args, next) => {
                this.ClearAllLeashings();
                return next(args);
            }, ModuleCategory.Leashed);

        // Everyone drops their grabs with us when they see us disconnect, so drop ours too, or they come back stuck to nobody
        hookFunction("ServerDisconnect", 1, (args, next) => {
            this.DropAllLeashings();
            return next(args);
        }, ModuleCategory.Leashed);

        OnAction(1, ModuleCategory.Leashed, (data, sender, msg, metadata) => {
            if (data?.Content == "ServerDisconnect") {
                let num = sender?.MemberNumber;
                if (!!num) {
                    this.RemoveLeashings(num);
                }
            }
        });

        // Allow for similar "hand-gagging" when certain custom actions are done
        hookFunction("ServerSend", 1, (args, next) => {
            const msg = args[0];
            if (msg == "ChatRoomChat" && (args[1] as ServerChatRoomMessage)?.Type == "Chat"){
                const data = args[1] as ServerChatRoomMessage;
                if (this.IsCustomGagged) {
                    let gagIncrease = 2 * this.GaggingLeashings.length;
                    let currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
                    data.Content = SpeechGarbleByGagLevel(currentGagLevel + gagIncrease, data.Content);
                    data.Content = SpeechStutter(Player, data.Content);
                    data.Content = SpeechBabyTalk(Player, data.Content);
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
            let msg = args[0];
            if (msg == "ChatRoomChat" && (args[1] as ServerChatRoomMessage)?.Type == "Activity"){
                let data = args[1] as ServerChatRoomMessage; 
                const activityName = GetActivityName(data);
                if (activityName == "Lick" && this.Pairings.some(p => !p.IsSource && p.Type == "tongue")) {
                    SendAction(failedLinkActions[getRandomInt(failedLinkActions.length)]);
                    return;
                }
            }
            return next(args);
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

    ReportLeashIssue(msg: LeashingRemovalReason) {
        const str = TextGetInScope(ScreenFileGetTranslation("Online", "ChatSearch", "ChatSearch"), msg);
        if (str.startsWith(TEXT_NOT_FOUND_PREFIX)) {
            console.error(`Unknown leash break reason: ${msg}`);
            return;
        }
        ToastManager.error(str);
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
        const definition = LeashDefinitions.get(pairing.Type);
        definition?.OnAdd?.(pairing);
        if (!exists)
            emit("grab.added", { type: pairing.Type, pairedMember: pairing.PairedMember, isSource: pairing.IsSource });
    }

    ReleaseAllLeashingsAsSource() {
        this.Pairings = this.Pairings.filter(p => {
            if (p.IsSource) return this.RemoveCallback(p);
            else return true;
        });
    }

    RemoveLeashings(pairedMember: number, isSource?: boolean, type?: GrabType) {
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedMember === pairedMember
                && (type === undefined || p.Type === type)
                && (isSource === undefined || p.IsSource === isSource)) {
                    this.RemoveCallback(p);
                    return false;
                }
            return true;
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

    // Every removal path goes through here. Returns nothing, so filter callers drop the pairing.
    RemoveCallback(pairing: Leashing) {
        LeashDefinitions.get(pairing.Type)?.OnRemove?.(pairing);
        emit("grab.removed", { type: pairing.Type, pairedMember: pairing.PairedMember, isSource: pairing.IsSource });
    }

    NotifyUnleashings(leashings: Leashing[]) {
        leashings.forEach(l => {
            sendLSCGCommandBeep(l.PairedMember, "release", [
                { name: "type", value: l.Type },
                { name: "isSource", value: l.IsSource },
            ]);
        });
    }

    ClearAllLeashings() {
        this.NotifyUnleashings(this.Pairings);
        this.DropAllLeashings();
    }

    DropAllLeashings() {
        for (const p of this.Pairings)
            this.RemoveCallback(p);
        this.Pairings = [];
    }

    // A grab that couldn't pull us ends at both sides
    BreakLeashingsWith(member: number) {
        const broken = this.Pairings.filter(p => p.PairedMember === member && (!p.IsSource || this.CanDragPlayer(p)));
        this.NotifyUnleashings(broken);
        for (const p of broken)
            this.RemoveLeashings(p.PairedMember, p.IsSource, p.Type);
    }

    IsLeashedByType(target: number, type: GrabType) {
        return this.Pairings.some(p => this.CanDragPlayer(p) && p.Type == type && p.PairedMember == target)
    }

    ContainsLeashing(target: number, type: GrabType) {
        return this.Pairings.some(p => this.PlayerCanDrag(p, true) && p.Type == type && p.PairedMember == target)
    }

    // Same checks as vanilla's Hold Leash dialog option, but only for a leash on the collar, since this one's on the neck
    CanHoldLeash(C: Character) {
        return C.MemberNumber !== undefined && ServerChatRoomGetAllowItem(Player, C) && Player.CanInteract() &&
            !!C.OnlineSharedSettings && C.OnlineSharedSettings.AllowPlayerLeashing !== false &&
            !ChatRoomLeashList.includes(C.MemberNumber) && ChatRoomCanBeLeashed(C) && this.NeckLeash(C) !== null;
    }

    // Same checks as vanilla's Let Go Of Leash dialog option, again only for a leash on the collar. Like vanilla, it
    // forgets a leash that can't be held any more
    CanLetGoOfLeash(C: Character) {
        if (C.MemberNumber === undefined || !ServerChatRoomGetAllowItem(Player, C) || !Player.CanInteract() ||
            !C.OnlineSharedSettings || C.OnlineSharedSettings.AllowPlayerLeashing === false || !ChatRoomLeashList.includes(C.MemberNumber))
            return false;
        if (ChatRoomCanBeLeashed(C))
            return this.NeckLeash(C) !== null;
        ChatRoomLeashList = ChatRoomLeashList.filter(n => n !== C.MemberNumber);
        return false;
    }

    // The game's own leash, minus leaving the dialog (the activity menu closes itself)
    HoldLeash(C: Character) {
        if (C.MemberNumber === undefined)
            return;
        const Dictionary = new DictionaryBuilder().sourceCharacter(Player).targetCharacter(C).build();
        ServerSend("ChatRoomChat", { Content: "HoldLeash", Type: "Action", Dictionary });
        ServerSend("ChatRoomChat", { Content: "HoldLeash", Type: "Hidden", Target: C.MemberNumber });
        if (!ChatRoomLeashList.includes(C.MemberNumber))
            ChatRoomLeashList.push(C.MemberNumber);
    }

    LetGoOfLeash(C: Character, announce: boolean = true) {
        if (C.MemberNumber === undefined)
            return;
        if (announce) {
            const Dictionary = new DictionaryBuilder().sourceCharacter(Player).targetCharacter(C).build();
            ServerSend("ChatRoomChat", { Content: "StopHoldLeash", Type: "Action", Dictionary });
        }
        ServerSend("ChatRoomChat", { Content: "StopHoldLeash", Type: "Hidden", Target: C.MemberNumber });
        ChatRoomLeashList = ChatRoomLeashList.filter(n => n !== C.MemberNumber);
    }

    // The leash Clasp Leash would use. Only while we hold just the one, so it's never a guess which, and could still
    // let go of it the vanilla way
    HeldLeash(except: Character): Character | null {
        if (ChatRoomLeashList.length !== 1)
            return null;
        const C = getCharacter(ChatRoomLeashList[0]);
        return C !== null && C.MemberNumber !== except.MemberNumber && this.CanLetGoOfLeash(C) ? C : null;
    }

    // Both ends keep their half of a clasp in LSCG, so both need its leashing on
    CanClaspWith(C: Character) {
        if (C.IsPlayer())
            return this.Enabled;
        const lscg = (C as OtherCharacter).LSCG;
        return !!lscg?.GlobalModule?.enabled && !!lscg?.LeashingModule?.enabled;
    }

    // Clasp to B's leash if they wear one we could hold, or put the end of A's leash on B's collar if their leash slot is free
    CanClaspTo(A: Character, B: Character) {
        if (B.OnlineSharedSettings?.AllowPlayerLeashing === false || !this.CanClaspWith(A) || !this.CanClaspWith(B))
            return false;
        if (InventoryGet(B, "ItemNeckRestraints") !== null)
            return this.NeckLeash(B) !== null && ChatRoomCanBeLeashed(B);
        const leash = this.NeckLeash(A);
        return leash !== null && ServerChatRoomGetAllowItem(Player, B) &&
            InventoryAllow(B, leash.Asset, leash.Asset.Prerequisite, false) && !InventoryBlockedOrLimited(B, { Asset: leash.Asset } as Item);
    }

    // Puts a copy of A's leash on B's collar the vanilla way, so B's client, BCX and co. get their usual say
    GiveLeashEnd(A: Character, B: Character) {
        const leash = this.NeckLeash(A);
        if (leash === null)
            return;
        // Crafted names are at most 30 characters, and § and ¶ separate crafts when they're bundled
        const name = `End of ${CharacterNickname(A).replace(/[\xA7\xB6]/g, "").slice(0, 15)}'s leash`;
        const craft: CraftingPartialItem = { Name: name, Description: "", Effects: {}, Private: false };
        // Our bc-stubs only type a full craft here, but BC takes a partial one
        InventoryWear(B, leash.Asset.Name, "ItemNeckRestraints", leash.Color, null, null, craft as CraftingItem);
        if (B.IsPlayer())
            ChatRoomCharacterUpdate(Player);
        else
            ChatRoomCharacterItemUpdate(B, "ItemNeckRestraints");
    }

    // Clasps the leash we're holding (A's) to B. True when B's leash slot was empty, so B got the end of A's leash
    ClaspLeash(A: Character, B: Character): boolean {
        const [a, b] = [A.MemberNumber ?? -1, B.MemberNumber ?? -1];
        // Sent before the clasp, so B already wears it when the clasp arrives
        const shared = InventoryGet(B, "ItemNeckRestraints") === null;
        if (shared)
            this.GiveLeashEnd(A, B);
        this.LetGoOfLeash(A, false);
        this.SendClasp(a, b, "add-leashing", shared);
        if (!A.IsPlayer() && !B.IsPlayer()) {
            this.ForgetClasp(a, b);
            this.ClaspedLeashes.push({ a, b });
        }
        return shared;
    }

    // Our end of a clasp: whoever held our leash the vanilla way loses it, like when someone else picks it up.
    // With no leash on our end (say the end of a shared one was refused), there's nothing to clasp
    OnLeashClasped(pairing: Leashing) {
        if (this.NeckLeash(Player) === null) {
            this.BreakClasps(pairing.PairedMember);
            return;
        }
        if (ChatRoomLeashPlayer !== null) {
            ServerSend("ChatRoomChat", { Content: "RemoveLeash", Type: "Hidden", Target: ChatRoomLeashPlayer });
            ChatRoomLeashPlayer = null;
        }
        CharacterRefreshLeash(Player);
    }

    // Our end of a clasp came undone: tell whoever clasped it, and stop our leash looking held once the pairing's gone
    OnLeashUnclasped(pairing: Leashing) {
        const claspedBy = getCharacter(pairing.PairedBy);
        if (claspedBy !== null && !claspedBy.IsPlayer() && pairing.PairedBy !== pairing.PairedMember)
            sendLSCGCommand(claspedBy, "remove-leashing", [
                { name: "pairedMember", value: pairing.PairedMember },
                { name: "type", value: "leash" },
                { name: "ended", value: true },
            ]);
        // Once for however many came undone together
        if (!this.leashLookQueued) {
            this.leashLookQueued = true;
            setTimeout(() => {
                this.leashLookQueued = false;
                CharacterRefreshLeash(Player);
            });
        }
    }

    // Clasps on member that we're part of or made. None while member's end is locked
    ClaspsOn(member: number): LeashClasp[] {
        if (this.LeashLocked(getCharacter(member)))
            return [];
        const me = Player.MemberNumber ?? -1;
        return [...this.Clasps.map(p => ({ a: me, b: p.PairedMember })), ...this.ClaspedLeashes].filter(t => t.a === member || t.b === member);
    }

    // Who C is clasped to, if we're the other end or made the clasp
    ClaspPartnerOf(C: Character): Character | null {
        if (this.Clasps.some(p => p.PairedMember === C.MemberNumber))
            return Player;
        const made = this.ClaspedLeashes.find(t => t.a === C.MemberNumber || t.b === C.MemberNumber);
        return made ? getCharacter(made.a === C.MemberNumber ? made.b : made.a) : null;
    }

    ForgetClasp(a: number, b: number) {
        this.ClaspedLeashes = this.ClaspedLeashes.filter(t => !((t.a === a && t.b === b) || (t.a === b && t.b === a)));
    }

    // A clasp that can't pull breaks at both ends, and both leashes stay where they are
    BreakClasps(member?: number) {
        this.NotifyUnleashings(this.Clasps.filter(p => member === undefined || p.PairedMember === member));
        if (member === undefined)
            this.RemoveAllLeashingsOfType("leash");
        else
            this.RemoveLeashings(member, false, "leash");
    }

    // Unclasps at one end, which lets go of a shared leash there
    UnclaspLeash(clasp: LeashClasp, at: number) {
        this.SendClasp(clasp.a, clasp.b, "remove-leashing", undefined, at);
        this.ForgetClasp(clasp.a, clasp.b);
    }

    UnclaspFrom(other: number, at?: number) {
        const shared = this.Clasps.some(p => p.PairedMember === other && p.SharedLeash);
        this.RemoveLeashings(other, false, "leash");
        if (shared && at === Player.MemberNumber)
            this.DropSharedLeash();
    }

    // A shared leash goes with the end that let go of it, unless it's padlocked there. Only one in the leash slot: a
    // pelvis leash or a pony gag's reins stay on
    DropSharedLeash() {
        const leash = this.NeckLeash(Player);
        if (leash !== null && InventoryGetLock(leash) === null) {
            InventoryRemove(Player, "ItemNeckRestraints");
            ChatRoomCharacterUpdate(Player);
        }
    }

    SendClasp(a: number, b: number, command: "add-leashing" | "remove-leashing", shared?: boolean, at?: number) {
        for (const [end, other] of [[a, b], [b, a]]) {
            if (end === Player.MemberNumber) {
                if (command === "add-leashing")
                    this.AddLeashing(new Leashing(other, end, false, "leash", shared));
                else
                    this.UnclaspFrom(other, at);
                continue;
            }
            const C = getCharacter(end);
            if (C === null)
                continue;
            const args = [
                { name: "pairedMember", value: other },
                { name: "type", value: "leash" },
                { name: "isSource", value: false },
            ];
            if (shared !== undefined)
                args.push({ name: "shared", value: shared });
            if (at !== undefined)
                args.push({ name: "at", value: at });
            sendLSCGCommand(C, command, args);
        }
    }

    // *** HELPERS ***

    // Can't walk (which covers tethered and mounted), or is shut in somewhere ChatRoomCanBeLeashedBy won't pull them from
    CantBePulled(C: Character | null) {
        return C !== null && (!C.CanWalk() || C.HasEffect("Enclose") || C.HasEffect("OneWayEnclose"));
    }

    NeckLeash(C: Character) {
        const item = InventoryGet(C, "ItemNeckRestraints");
        return item !== null && InventoryItemHasEffect(item, "Leash", true) ? item : null;
    }

    LeashLocked(C: Character | null) {
        const leash = C === null ? null : this.NeckLeash(C);
        return leash !== null && InventoryGetLock(leash) !== null;
    }

    // Each end of a clasp is only locked by its own padlock
    IsLocked(leashing: Leashing) {
        return leashing.Type === "leash" && this.LeashLocked(Player);
    }

    IsBidirectionalType(type: GrabType) {
        return LeashDefinitions.get(type)?.Bidirectional ?? false;
    }

    CanEscape(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return !leashing.IsSource && !this.IsLocked(leashing);
    }

    CanDragPlayer(leashing: Leashing, allowEphemeral: boolean = false) {
        let def = LeashDefinitions.get(leashing.Type);
        if ((!allowEphemeral && def?.Ephemeral))
            return false;
        return (!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional
    }

    PlayerCanDrag(leashing: Leashing, allowEphemeral: boolean = false) {
        let def = LeashDefinitions.get(leashing.Type);
        if ((!allowEphemeral && def?.Ephemeral))
            return false;
        return (leashing.IsSource && !def?.Reverse) || (!leashing.IsSource && def?.Reverse) || def?.Bidirectional
    }

    IsGagging(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        return def?.Gags && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional || leashing.PairedMember == Player.MemberNumber);
    }

    IsBlinding(leashing: Leashing) {
        let def = LeashDefinitions.get(leashing.Type);
        
        return def?.Blinds && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional || leashing.PairedMember == Player.MemberNumber);
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
        const shared = args.find(a => a.name === "shared")?.value as boolean | undefined;
        // Someone may have seen our leashing as on from settings we've since changed
        if (!this.CanBeChangedBy(sender, pairedMember) || (type === "leash" && !this.Enabled))
            return;
        if (type === "leash" && emitBefore("grab.beforeIncoming", { type, sender }).cancelled) {
            // Refused: tell the other end to drop theirs, as if we had let go
            SendAction("%NAME% slips out of the clasp.");
            sendLSCGCommandBeep(pairedMember, "release", [
                { name: "type", value: type },
                { name: "isSource", value: false },
            ]);
            return;
        }
        this.AddLeashing(new Leashing(pairedMember, sender, isSource, type, shared));
    }

    HandleLeashRemovalRequest(sender: number, msg: LSCGMessageModel) {
        let args = msg.command?.args;
        if (!args || msg.command?.name != "remove-leashing")
            return;
        let pairedMember = args.find(a => a.name == "pairedMember")?.value as number;
        let type = args.find(a => a.name == "type")?.value as GrabType;
        let isSource = args.find(a => a.name == "isSource")?.value as boolean;
        // A clasp we made between sender and pairedMember came undone, which is only ours to forget
        if (type === "leash" && args.find(a => a.name === "ended")?.value === true) {
            this.ForgetClasp(sender, pairedMember);
            return;
        }
        if (!this.CanBeChangedBy(sender, pairedMember))
            return;
        if (type === "leash")
            this.UnclaspFrom(pairedMember, args.find(a => a.name === "at")?.value as number | undefined);
        else
            this.RemoveLeashings(pairedMember, isSource, type);
    }

    // Anyone can change a grab with themselves; one between us and someone else needs item permission on us
    CanBeChangedBy(sender: number, pairedMember: number) {
        return sender === pairedMember || isAllowedMember(getCharacter(sender) ?? undefined);
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
        if (LeashDefinitions.get(type)?.Bidirectional) {
            this.RemoveLeashings(target.MemberNumber, false, type);
        }
    }

    DoEscape(escapeFrom: Character) {
        if (!escapeFrom.MemberNumber)
            return;

        this.RemoveLeashings(escapeFrom.MemberNumber, false);
        sendLSCGCommand(escapeFrom, "escape");
    }

    IncomingGrab(sender: Character | null, grabType: GrabType) {
        if (!!sender && !!sender.MemberNumber) {
            if (emitBefore("grab.beforeIncoming", { type: grabType, sender: sender.MemberNumber }).cancelled) {
                // Refused: tell the grabber to drop their side, as if we had released.
                SendAction(`%NAME% slips out of %OPP_NAME%'s grab.`, sender);
                sendLSCGCommandBeep(sender.MemberNumber, "release", [
                    { name: "type", value: grabType },
                    { name: "isSource", value: false },
                ]);
                return;
            }
            this.AddLeashing(new Leashing(sender.MemberNumber,
                sender.MemberNumber,
                false, 
                grabType));
            if (grabType != "hand")
                this.NotifyAboutEscapeCommand(sender, grabType);
        }
    }

    // By member number, as a release often comes from another room, where getCharacter finds nobody.
    // Usually the grabber lets go, but a safeword sends it from the one grabbed
    IncomingRelease(sender: number, grabType: GrabType, senderIsSource?: boolean) {
        this.RemoveLeashings(sender, senderIsSource === false, grabType);
        if (LeashDefinitions.get(grabType)?.Bidirectional)
            this.RemoveLeashings(sender, senderIsSource !== false, grabType);
    }

    IncomingEscape(sender: OtherCharacter | null, escapeFromMemberNumber: number) {
        if (!!sender && !!sender.MemberNumber && escapeFromMemberNumber === Player.MemberNumber) {
            this.RemoveLeashings(sender.MemberNumber, true);
            // Both ends of a clasped leash are non-source
            this.RemoveLeashings(sender.MemberNumber, false, "leash");
        }
    }

    NotifyAboutEscapeCommand(grabber: Character, type: GrabType) {
        if (type == "mouth-with-foot") {
            LSCG_SendLocal(replace_template(`${CharacterNickname(grabber)} has filled your mouth with %OPP_POSSESSIVE% foot!`, grabber));
        }
        else if (type == "chomp") {
            LSCG_SendLocal(`${CharacterNickname(grabber)} has chomped down hard on you!`);
        }
        else {
            LSCG_SendLocal(`Your ${type} has been grabbed by ${CharacterNickname(grabber)}!`);
        }
        LSCG_SendLocal(`[You can use '/lscg escape' to try and break free]`);
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
        let grabbingMembers = this.EscapablePairings.map(p => p.PairedMember);
        
        let grabbers = grabbingMembers.map(m => getCharacter(m)).filter(g => !!g);
        if (grabbers.length <= 0 && this.Pairings.some(p => this.IsLocked(p))) {
            LSCG_SendLocal("Your leash is locked, you can't slip free!");
            return;
        }
        if (grabbers.length <= 0) {
            LSCG_SendLocal(`You are not grabbed by anyone! (Try refreshing if you're stuck)`);
            return;
        }
        var grabber = grabbers[0];

        SendAction(`${CharacterNickname(Player)} tries %POSSESSIVE% best to escape from %OPP_NAME_POSSESSIVE% grip...`, grabber);
        setTimeout(() => {
            if (!grabber || !grabber?.MemberNumber)
                return;
            let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(Player, grabber);
            if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}successfully breaks free from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                // Slipping a clasp lets go of our end of it
                this.UnclaspFrom(grabber.MemberNumber, Player.MemberNumber);
                this.DoEscape(grabber);
            } else {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}squirms and wriggles but fails to escape from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.escapeAttempted = CommonTime();
            }
        }, 4000);
    }
}