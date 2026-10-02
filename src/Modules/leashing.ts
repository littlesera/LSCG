import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetActivityName, ICONS, LSCG_SendLocal, OnAction, SendAction, callOriginal, getCharacter, isAllowedMember, getRandomInt, hookFunction, mouseTooltip, removeAllHooksByModule, replace_template, sendLSCGCommand, sendLSCGCommandBeep } from "../utils";
import { Pairing } from "./States/PairedBaseState";
import { ItemUseModule } from "./item-use";
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
            if (pairing.IsSource) {(<any>pairing)["temp"] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Angry");};
        },
        OnRemove: (pairing) => {
            if (pairing.IsSource) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)["temp"] ?? null);
        },
    }],
    ["ear", {Type: "ear", LabelTarget: "Ear pinched by %OPP_NAME%", LabelSource: "Pinching %OPP_NAME_POSSESSIVE% ear", Icon: ICONS.EAR}],
    ["hand", {Type: "hand", LabelTarget: "Holding %OPP_NAME_POSSESSIVE% hand", Icon: ICONS.HOLD_HANDS, Bidirectional: true}],
    ["horn", {Type: "horn", LabelTarget: "Horn grabbed by %OPP_NAME%", LabelSource: "Grabbing %OPP_NAME_POSSESSIVE% horn"}],
    ["tail", {Type: "tail", LabelTarget: "Tail held by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% tail"}],
    ["mouth", {Type: "mouth", LabelTarget: "Mouth clamped by %OPP_NAME%", LabelSource: "Clamping over %OPP_NAME_POSSESSIVE% mouth", Icon: ICONS.MUTE, Gags: true}],
    ["eyes", {Type: "eyes", LabelTarget: "Eyes covered by %OPP_NAME%", LabelSource: "Covering %OPP_NAME_POSSESSIVE% eyes", Icon: "Icons/Private.png", Blinds: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) {(<any>pairing)["temp"] = (WardrobeGetExpression(Player)?.Eyes ?? null); CharacterSetFacialExpression(Player, "Eyes", "Closed");};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) CharacterSetFacialExpression(Player, "Eyes", (<any>pairing)["temp"] ?? null);
        }}],
    ["mouth-with-foot", {Type: "mouth-with-foot", LabelTarget: "Mouth filled with %OPP_NAME_POSSESSIVE% foot", LabelSource: "Filling %OPP_NAME_POSSESSIVE% mouth with foot", Icon: "Icons/Management.png", Ephemeral: true, Gags: true}],
    ["neck", {Type: "neck", LabelTarget: "Choked by %OPP_NAME%", LabelSource: "Choking %OPP_NAME%", Icon: ICONS.NECK,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) getModule<CollarModule>("CollarModule")?.HandChoke(getCharacter(pairing.PairedMember));
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) getModule<CollarModule>("CollarModule")?.ReleaseHandChoke(getCharacter(pairing.PairedMember), true);
        }}],
    ["collar", {Type: "collar", Action: "drags", LabelTarget: "Collar grabbed by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% collar", Icon: ICONS.COLLAR}],
    ["leash", {Type: "leash", LabelTarget: "Leashed to %OPP_NAME%", Icon: ICONS.LEASH, Bidirectional: true,
        OnAdd: () => getModule<LeashingModule>("LeashingModule")?.OnLeashClasped(),
        OnRemove: () => getModule<LeashingModule>("LeashingModule")?.QueueClaspChange(),
    }],
    ["tongue", {Type: "tongue", LabelTarget: "Tongue held by %OPP_NAME%", LabelSource: "Holding %OPP_NAME_POSSESSIVE% tongue", Icon: ICONS.TONGUE, Gags: true,
        OnAdd: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) {(<any>pairing)["temp"] = (WardrobeGetExpression(Player)?.Mouth ?? null); CharacterSetFacialExpression(Player, "Mouth", "Ahegao");};
        },
        OnRemove: (pairing) => {
            if (!pairing.IsSource || pairing.PairedMember == Player.MemberNumber) CharacterSetFacialExpression(Player, "Mouth", (<any>pairing)["temp"] ?? null);
        },
    }],
    ["compulsion", {Type: "compulsion", LabelTarget: "Compelled to follow %OPP_NAME%", LabelSource: "Followed by %OPP_NAME%", Icon: ICONS.PENDANT}],
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

export class LeashingModule extends BaseModule {
    Pairings: Leashing[] = [];
    claspChangeQueued = false;

    get defaultSettings() {
        return <BaseSettingsModel>{
            enabled: true,
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
        "tongue",
    ];

    get usingHandsCount(): number {
        return this.Pairings.filter(p => {
            const definition = LeashDefinitions.get(p.Type);
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
                    const chars = earPinchingMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
                    else
                        SendAction("%NAME% leads " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their ears.");
                } else if (armGrabbingMemberList.length > 0) {
                    const chars = armGrabbingMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% roughly pulls %OPP_NAME% out of the room by the arm.", chars[0]);
                    else
                        SendAction("%NAME% roughly pulls " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their arms.");
                } else if (tongueGrabbedMemberList.length > 0) {
                    const chars = tongueGrabbedMemberList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% tugs %OPP_NAME% out of the room by the tongue.", chars[0]);
                    else
                        SendAction("%NAME% tugs " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their tongues.");
                } else if (chompedBy.length > 0) {
                    const chars = chompedBy.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%NAME% drags %OPP_NAME% out of the room with a wince.", chars[0]);
                    else {
                        let nameStr = "everyone chomping down";
                        try {
                            nameStr = CommonArrayJoinPretty(chars.map(c => CharacterNickname(c as Character)));
                        } catch { /* keep the fallback name */ }
                        SendAction(`%NAME% drags ${nameStr} out of the room with a wince.`);
                    }
                } else if (compellingList.length > 0) {
                    const chars = compellingList.map(id => getCharacter(id)).filter(c => !!c);
                    if (chars.length == 1)
                        SendAction("%OPP_NAME_POSSESSIVE% eyes lock on to %NAME% and %PRONOUN% follows %INTENSIVE% out of the room obediently.", chars[0]);
                    else {
                        let nameStr = "";
                        try {
                            nameStr = CommonArrayJoinPretty(chars.map(c => CharacterNickname(c as Character)));
                        } catch { /* keep the fallback name */ }
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

        // No leaving while anyone we're clasped to, however far along, can't come along, same as the vanilla leash
        hookFunction("ChatRoomCanLeave", 1, (args, next) => {
            if (this.HeldInPlace(Player))
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
                else
                    this.RefreshLeashLook();
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
                        const targetIsGrabbed = !p.IsSource;
                        const yOffset = ix * 40 * Zoom;
                        const icon = this.GetIconForGrabType(p.Type);
                        DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom + yOffset, 20 * Zoom, 1, "Black", targetIsGrabbed ? "White" : "#90E4C1");
                        DrawImageResize(
                            icon,
                            CharX + 405 * Zoom, CharY + 45 * Zoom + yOffset, 30 * Zoom, 30 * Zoom,
                        );
                        if (MouseIn(CharX + 400 * Zoom, CharY + 40 * Zoom + yOffset, 40 * Zoom, 40 * Zoom)) {
                            const def = LeashDefinitions.get(p.Type);
                            tooltip = replace_template((p.IsSource ? def?.LabelSource ?? def?.LabelTarget : def?.LabelTarget ?? def?.LabelSource) ?? "", getCharacter(p.PairedMember), p.PairedMember + "");
                            if (this.IsLocked(p))
                                tooltip = `${tooltip} (locked)`;
                        }
                    });
                if (tooltip)
                    mouseTooltip(tooltip);
            }
            // Everyone else's clasps, from their room settings
            const claspedTo = typeof CharX === "number" && ChatRoomHideIconState === 0 && !C.IsPlayer() ? this.ClaspPartners(C) : [];
            if (
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                claspedTo.length > 0
            ) {
                DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White");
                DrawImageResize(ICONS.LEASH, CharX + 405 * Zoom, CharY + 45 * Zoom, 30 * Zoom, 30 * Zoom);
                if (MouseIn(CharX + 400 * Zoom, CharY + 40 * Zoom, 40 * Zoom, 40 * Zoom)) {
                    const names = claspedTo.map(n => getCharacter(n)).filter(P => P !== null).map(P => CharacterNickname(P));
                    const label = (LeashDefinitions.get("leash")?.LabelTarget ?? "").replace("%OPP_NAME%", CommonArrayJoinPretty(names));
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
                this.Pairings
                    .forEach((p, ix, arr) => {                    
                        const targetIsGrabbed = !p.IsSource;
                        const yOffset = ix * 40 * Zoom;
                        
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
        });

        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
            const sourceMemberNumber = args[0];
            const C = args[1];

            // Someone stuck in a clasped group holds everyone in it in place, like being tethered: nothing but the
            // clasps themselves still leash them
            if (this.Enabled && !this.ClaspPartners(C).includes(sourceMemberNumber) && this.HeldInPlace(C))
                return false;

            if (this.Enabled && this.IsLeashedBy(sourceMemberNumber) && this.RoomAllowsLeashing) {
                // Have to not be tethered, and need a leash
                let isTrapped = false;
                let neckLock = null;
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
            const SenderCharacter = args[0];
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
            // With leashing turned off the game won't pull us, so the grab breaks instead of stretching across rooms. Same
            // when someone in our clasped group is stuck: whoever got out anyway (kicked, say) lets go of us instead
            if (isOurLeasher && (Player.OnlineSharedSettings?.AllowPlayerLeashing === false || this.HeldInPlace(Player))) {
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
            const from = ChatRoomData?.Name;
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
                // Joined, or never left (the game ignored it, say for our leashing being off)
                if (ChatRoomData?.Name === followingTo || (from !== undefined && ChatRoomData?.Name === from))
                    followingTo = null;
            }
        }, ModuleCategory.Leashed);
        
        // Not this.Enabled: that's off in the lobby, where a follow that has already left the room fails to join
        hookFunction("ChatRoomBreakLeash", 1, (args, next) => {
            followingTo = null;
            if (Player.OnlineSharedSettings.AllowPlayerLeashing && beepSourceNumber !== -1) {
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
                // Vanilla's map leash doesn't check if we're stuck in place, so a clasp checks for itself
                const stuck = this.CantBePulled(Player);
                let totalLeashedBy = this.LeashedByPairings.filter(p => p.Type !== "leash" || !stuck).map(p => p.PairedMember);
                let leashedByMovedAway = totalLeashedBy.filter(leashedByNum => {
                    let C = getCharacter(leashedByNum);
                    if (!C) return false;
                    if ((Player.MapData == null) || (Player.MapData.Pos.X == null) || (Player.MapData.Pos.Y == null)) return false;
			        if ((C.MapData?.Pos == null) || (C.MapData.Pos.X == null) || (C.MapData.Pos.Y == null)) return false;
                    const Distance = Math.max(Math.abs(Player.MapData.Pos.X - C.MapData.Pos.X), Math.abs(Player.MapData.Pos.Y - C.MapData.Pos.Y));
			        if (Distance <= 2) return false;
                    return leashedByNum;
                });
                const [x, y] = [Player.MapData?.Pos.X, Player.MapData?.Pos.Y];
                const moved = () => Player.MapData?.Pos.X !== x || Player.MapData?.Pos.Y !== y;
                next(args);
                // One pull a frame: each pull puts us next to that leasher, so a second one straight after would undo it.
                // One that can't reach us (say there's a wall in the way) leaves it to the next. Anyone still out of
                // reach gets their turn next frame
                const temp = ChatRoomLeashPlayer;
                for (const num of leashedByMovedAway) {
                    if (moved())
                        break;
                    ChatRoomLeashPlayer = num;
                    next(args);
                }
                ChatRoomLeashPlayer = temp;
            } else
                return next(args);
        }, ModuleCategory.Leashed);

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
                const num = sender?.MemberNumber;
                if (num) {
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
                    const gagIncrease = 2 * this.GaggingLeashings.length;
                    const currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
                    data.Content = SpeechGarbleByGagLevel(currentGagLevel + gagIncrease, data.Content);
                    data.Content = SpeechStutter(Player, data.Content);
                    data.Content = SpeechBabyTalk(Player, data.Content);
                }
            }
            next(args);
        }, ModuleCategory.Leashed);

        hookFunction("Player.GetBlindLevel", 1, (args, next) => {
            if (this.IsCustomBlinded)
                return Player.GameplaySettings?.SensDepChatLog == "SensDepLight" ? 2 : 3;
            return next(args);
        }, ModuleCategory.Leashed);

        const failedLinkActions = [
            "%NAME%'s whimpers, %POSSESSIVE% tongue held tightly.",
            "%NAME% strains, trying to pull %POSSESSIVE% tongue free.",
            "%NAME% starts to drool, %POSSESSIVE% tongue held fast.",
        ];             

        hookFunction("ServerSend", 5, (args, next) => {
            const msg = args[0];
            if (msg == "ChatRoomChat" && (args[1] as ServerChatRoomMessage)?.Type == "Activity"){
                const data = args[1] as ServerChatRoomMessage; 
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
            func: (sender, msg) => this.HandleLeashingRequest(sender, msg),
        });

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "leashing-removal-listener",
            command: "remove-leashing",
            func: (sender, msg) => this.HandleLeashRemovalRequest(sender, msg),
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
        const exists = this.Pairings.find(p => p.PairedMember == pairing.PairedMember && p.Type == pairing.Type && p.IsSource == pairing.IsSource);
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
        return this.Pairings.some(p => this.CanDragPlayer(p) && p.Type == type && p.PairedMember == target);
    }

    ContainsLeashing(target: number, type: GrabType) {
        return this.Pairings.some(p => this.PlayerCanDrag(p, true) && p.Type == type && p.PairedMember == target);
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
        // Vanilla keeps leashes on its list when their wearer slips off to another room, so only count who's here
        const held = ChatRoomLeashList.map(n => getCharacter(n)).filter(C => C !== null);
        if (held.length !== 1)
            return null;
        const C = held[0];
        return C.MemberNumber !== except.MemberNumber && this.CanLetGoOfLeash(C) ? C : null;
    }

    // Both ends keep their half of a clasp in LSCG, so both need its leashing on. Older versions don't send their
    // clasps, and don't know them: they'd take one as a grab that freezes them and can't be let go of
    CanClaspWith(C: Character) {
        if (C.IsPlayer())
            return this.Enabled;
        const lscg = (C as OtherCharacter).LSCG;
        return !!lscg?.GlobalModule?.enabled && !!lscg?.LeashingModule?.enabled && Array.isArray(lscg.LeashingModule.clasps);
    }

    // Clasp to B's leash if they wear one we could hold, or put the end of A's leash on B's collar if their leash slot is free
    CanClaspTo(A: Character, B: Character) {
        if (B.OnlineSharedSettings?.AllowPlayerLeashing === false || !this.CanClaspWith(A) || !this.CanClaspWith(B))
            return false;
        // Vanilla's check, as being held in place by a clasp is no reason not to clasp onto them
        if (InventoryGet(B, "ItemNeckRestraints") !== null)
            return this.NeckLeash(B) !== null && callOriginal("ChatRoomCanBeLeashedBy", [Player.MemberNumber ?? -1, B]);
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
        this.SendClasp(a, b, shared);
        return shared;
    }

    // Our end of a clasp to other, made by by. Refusing it tells the other end to let go, as if we had. With no leash
    // on our end (say the end of a shared one was refused), there's nothing to clasp
    AcceptClasp(other: number, by: number, shared?: boolean) {
        const was = this.Clasps.find(p => p.PairedMember === other);
        const fromSomeoneElse = by !== Player.MemberNumber;
        // Someone may have seen our leashing as on from settings we've since changed
        const refused = !this.Enabled || this.NeckLeash(Player) === null || (fromSomeoneElse && !this.CanBeChangedBy(by, other));
        const vetoed = !refused && fromSomeoneElse && emitBefore("grab.beforeIncoming", { type: "leash", sender: by }).cancelled;
        if (refused || vetoed) {
            // A clasp we already had stays, at both ends
            if (was !== undefined)
                return;
            if (vetoed)
                SendAction("%NAME% slips out of the clasp.");
            this.NotifyUnleashings([new Leashing(other, by, false, "leash")]);
            return;
        }
        // Clasping the same two again doesn't make it any less shared
        this.AddLeashing(new Leashing(other, by, false, "leash", shared || was?.SharedLeash));
    }

    // Our end of a clasp: whoever held our leash the vanilla way loses it, like when someone else picks it up
    OnLeashClasped() {
        if (ChatRoomLeashPlayer !== null) {
            ServerSend("ChatRoomChat", { Content: "RemoveLeash", Type: "Hidden", Target: ChatRoomLeashPlayer });
            ChatRoomLeashPlayer = null;
        }
        this.QueueClaspChange();
    }

    // Once for however many changed together, after the pairings have: our leash's look, and our clasps in our room
    // settings
    QueueClaspChange() {
        if (this.claspChangeQueued)
            return;
        this.claspChangeQueued = true;
        setTimeout(() => {
            this.claspChangeQueued = false;
            this.RefreshLeashLook();
            getModule<CoreModule>("CoreModule")?.SendPublicPacket(false, "sync");
        });
    }

    // The leash vanilla shows as held or not, by whoever holds it or, standing in for them, whoever we're clasped to.
    // Only redone when it's wrong, as each time sends our whole appearance
    RefreshLeashLook() {
        const leash = Player.Appearance.find(item => item.Asset.AllowEffect?.includes("IsLeashed") && InventoryItemHasEffect(item, "Leash", true));
        const holder = ChatRoomLeashPlayer ?? this.Clasps[0]?.PairedMember;
        const held = holder !== undefined && !!ChatRoomCanBeLeashedBy(holder, Player);
        if (leash !== undefined && InventoryItemHasEffect(leash, "IsLeashed", true) !== held)
            CharacterRefreshLeash(Player);
    }

    // Who C is clasped to. Ours we know, anyone else's comes from their room settings and only counts when the
    // other end lists them back, so nobody can claim to be clasped to us
    ClaspPartners(C: Character): number[] {
        if (C.IsPlayer())
            return this.Clasps.map(p => p.PairedMember);
        const listed = (D: Character | null) => (D as OtherCharacter | null)?.LSCG?.LeashingModule?.clasps ?? [];
        return listed(C).filter(n => n === Player.MemberNumber
            ? this.Clasps.some(p => p.PairedMember === C.MemberNumber)
            : listed(getCharacter(n)).includes(C.MemberNumber ?? -1));
    }

    // Anyone stuck in C's clasped group, however far along, holds everyone in it in place
    HeldInPlace(C: Character) {
        const group = [C];
        for (let i = 0; i < group.length; i++)
            for (const n of this.ClaspPartners(group[i])) {
                const D = getCharacter(n);
                if (D !== null && !group.includes(D))
                    group.push(D);
            }
        return group.length > 1 && group.some(D => this.CantBePulled(D));
    }

    // Who member is clasped to, that we could unclasp at member's end. Not while that end's locked
    ClaspsOn(member: number): number[] {
        const C = getCharacter(member);
        return C === null || this.LeashLocked(C) ? [] : this.ClaspPartners(C);
    }

    // A clasp that can't pull breaks at both ends, and both leashes stay where they are
    BreakClasps(member?: number) {
        this.NotifyUnleashings(this.Clasps.filter(p => member === undefined || p.PairedMember === member));
        if (member === undefined)
            this.RemoveAllLeashingsOfType("leash");
        else
            this.RemoveLeashings(member, false, "leash");
    }

    // Unclasps at one end, which only that end has to let us do. It lets go there, and of a shared leash with it, and
    // tells the other end, who keeps their side of the leash, attached to nobody
    UnclaspLeash(at: number, other: number) {
        if (at === Player.MemberNumber) {
            this.UnclaspFrom(other);
            return;
        }
        const C = getCharacter(at);
        if (C !== null)
            sendLSCGCommand(C, "remove-leashing", [
                { name: "pairedMember", value: other },
                { name: "type", value: "leash" },
            ]);
        // Our own side, when it's us they're unclasped from
        if (other === Player.MemberNumber)
            this.RemoveLeashings(at, false, "leash");
    }

    // Lets go of our end of a clasp, and of a shared leash with it. The other end hears it from us
    UnclaspFrom(other: number) {
        const shared = this.Clasps.some(p => p.PairedMember === other && p.SharedLeash);
        this.BreakClasps(other);
        if (shared)
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

    SendClasp(a: number, b: number, shared: boolean) {
        for (const [end, other] of [[a, b], [b, a]]) {
            if (end === Player.MemberNumber) {
                this.AcceptClasp(other, end, shared);
                continue;
            }
            const C = getCharacter(end);
            if (C !== null)
                sendLSCGCommand(C, "add-leashing", [
                    { name: "pairedMember", value: other },
                    { name: "type", value: "leash" },
                    { name: "isSource", value: false },
                    { name: "shared", value: shared },
                ]);
        }
    }

    // *** HELPERS ***

    // Can't walk, or is shut in somewhere ChatRoomCanBeLeashedBy won't pull them from. Vanilla's leash still drags
    // someone frozen in place, like in floor shackles, but a clasp keeps everyone with them instead. By effect rather
    // than CanWalk, which for us also counts LSCG's own grabs
    CantBePulled(C: Character | null) {
        return C !== null && (["Freeze", "Tethered", "Mounted", "Enclose", "OneWayEnclose"] as EffectName[]).some(e => C.HasEffect(e));
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
        const def = LeashDefinitions.get(leashing.Type);
        if ((!allowEphemeral && def?.Ephemeral))
            return false;
        return (!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional;
    }

    PlayerCanDrag(leashing: Leashing, allowEphemeral: boolean = false) {
        const def = LeashDefinitions.get(leashing.Type);
        if ((!allowEphemeral && def?.Ephemeral))
            return false;
        return (leashing.IsSource && !def?.Reverse) || (!leashing.IsSource && def?.Reverse) || def?.Bidirectional;
    }

    IsGagging(leashing: Leashing) {
        const def = LeashDefinitions.get(leashing.Type);
        return def?.Gags && 
        ((!leashing.IsSource && !def?.Reverse) || (leashing.IsSource && def?.Reverse) || def?.Bidirectional || leashing.PairedMember == Player.MemberNumber);
    }

    IsBlinding(leashing: Leashing) {
        const def = LeashDefinitions.get(leashing.Type);
        
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
        const args = msg.command?.args;
        if (!args || msg.command?.name != "add-leashing")
            return;
        let pairedMember = args.find(a => a.name == "pairedMember")?.value as number;
        let type = args.find(a => a.name == "type")?.value as GrabType;
        let isSource = args.find(a => a.name == "isSource")?.value as boolean;
        if (type === "leash") {
            this.AcceptClasp(pairedMember, sender, args.find(a => a.name === "shared")?.value as boolean | undefined);
            return;
        }
        if (!this.CanBeChangedBy(sender, pairedMember))
            return;
        this.AddLeashing(new Leashing(pairedMember, sender, isSource, type));
    }

    HandleLeashRemovalRequest(sender: number, msg: LSCGMessageModel) {
        const args = msg.command?.args;
        if (!args || msg.command?.name != "remove-leashing")
            return;
        const pairedMember = args.find(a => a.name == "pairedMember")?.value as number;
        const type = args.find(a => a.name == "type")?.value as GrabType;
        const isSource = args.find(a => a.name == "isSource")?.value as boolean;
        if (!this.CanBeChangedBy(sender, pairedMember))
            return;
        if (type === "leash")
            this.UnclaspFrom(pairedMember);
        else
            this.RemoveLeashings(pairedMember, isSource, type);
    }

    // Anyone can change a grab with themselves; one between us and someone else needs item permission on us
    CanBeChangedBy(sender: number, pairedMember: number) {
        return sender === pairedMember || isAllowedMember(getCharacter(sender) ?? undefined);
    }

    DoGrab(target: Character, type: GrabType) {
        if (!target.MemberNumber || 
            //target.IsPlayer() || 
            !this.CanAddLeashingType(type))
            return;

        this.AddLeashing(new Leashing(
            target.MemberNumber,
            target.MemberNumber,
            true,
            type,
        ));

        if (!target.IsPlayer()) 
            sendLSCGCommandBeep(target.MemberNumber, "grab", [{
                name: "type",
                value: type,
            }]);
    };

    DoRelease(target: Character, type: GrabType) {
        if (!target.MemberNumber)
            return;

        if (!target.IsPlayer()) 
            sendLSCGCommand(target, "release", [{
                name: "type",
                value: type,
            }]);
     
        this.RemoveLeashings(target.MemberNumber, true, type);
        if (LeashDefinitions.get(type)?.Bidirectional) {
            this.RemoveLeashings(target.MemberNumber, false, type);
        }
    }

    DoEscape(escapeFrom: Character) {
        if (!escapeFrom.MemberNumber)
            return;

        // Not a clasp: it can be locked, and slipping it is only our end's to do (see TryEscape)
        this.Pairings = this.Pairings.filter(p => {
            if (p.PairedMember === escapeFrom.MemberNumber && !p.IsSource && p.Type !== "leash") return this.RemoveCallback(p);
            else return true;
        });
        sendLSCGCommand(escapeFrom, "escape");
    }

    IncomingGrab(sender: Character | null, grabType: GrabType) {
        if (!!sender && !!sender.MemberNumber) {
            if (emitBefore("grab.beforeIncoming", { type: grabType, sender: sender.MemberNumber }).cancelled) {
                // Refused: tell the grabber to drop their side, as if we had released.
                SendAction("%NAME% slips out of %OPP_NAME%'s grab.", sender);
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
        LSCG_SendLocal("[You can use '/lscg escape' to try and break free]");
    }

    escapeAttempted: number = 0;
    escapeCooldown: number = 120000;
    TryEscape() {
        if (this.escapeAttempted > 0) {
            if (CommonTime() < (this.escapeAttempted + this.escapeCooldown)) {
                LSCG_SendLocal("You are too tired from your last escape attempt!");
                return;
            } else {
                this.escapeAttempted = 0;
            }
        }
        // A clasp is slipped on its own, so slipping someone's hand doesn't also slip a locked clasp with them
        const pairing = this.EscapablePairings.find(p => getCharacter(p.PairedMember) !== null);
        if (pairing === undefined && this.Pairings.some(p => this.IsLocked(p))) {
            LSCG_SendLocal("Your leash is locked, you can't slip free!");
            return;
        }
        if (pairing === undefined) {
            LSCG_SendLocal(`You are not grabbed by anyone! (Try refreshing if you're stuck)`);
            return;
        }
        var grabber = getCharacter(pairing.PairedMember);

        SendAction(`${CharacterNickname(Player)} tries %POSSESSIVE% best to escape from %OPP_NAME_POSSESSIVE% grip...`, grabber);
        setTimeout(() => {
            if (!grabber || !grabber?.MemberNumber)
                return;
            const check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(Player, grabber);
            if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}successfully breaks free from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                // Slipping a clasp lets go of our end of it
                if (pairing.Type === "leash")
                    this.UnclaspFrom(grabber.MemberNumber);
                else
                    this.DoEscape(grabber);
            } else {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}squirms and wriggles but fails to escape from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.escapeAttempted = CommonTime();
            }
        }, 4000);
    }
}