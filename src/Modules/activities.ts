import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, hookFunction, ICONS, getCharacter, sendLSCGMessage, OnAction } from "../utils";

export interface ActivityTarget {
    Name: AssetGroupItemName;
    SelfAllowed?: boolean | false;
    SelfOnly?: boolean | false;
    TargetLabel?: string | undefined;
    TargetSelfLabel?: string | undefined;
    TargetAction: string;
    TargetSelfAction?: string | undefined;
}

export interface CustomPrerequisite {
    Name: string;
    Func(acting: Character, acted: Character, group: AssetGroup): boolean;
}

export interface CustomReaction {
    Func(sender: Character | null): void;
}

export interface CustomAction {
    Func(target: Character | null, args: any[], next: (args: any[]) => any): any;
}

export interface ActivityBundleBase {
    Targets?: ActivityTarget[];
    CustomPrereqs?: CustomPrerequisite[];
    CustomReaction?: CustomReaction;
    CustomAction?: CustomAction;
    CustomImage?: string;
}

export interface ActivityPatch extends ActivityBundleBase {
    ActivityName: string;
}

export interface ActivityBundle extends ActivityBundleBase {
    Activity: Activity;
}

export type GrabType = "hand"  | "ear"

export class ActivityModule extends BaseModule {
    load(): void {
        hookFunction("ServerSend", 100, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity"){
                let data = args[1];
                let actName = data.Dictionary[3]?.ActivityName ?? "";
                let target = data.Dictionary?.find((d: any) => d.Tag == "TargetCharacter");
                var targetChar = getCharacter(target.MemberNumber);
                if (actName.indexOf("LSCG_") == 0) {
                    // Intercept custom activity send and just do a custom action instead..
                    let {metadata, substitutions} = ChatRoomMessageRunExtractors(data, Player)
                    let msg = ActivityDictionaryText(data.Content);
                    msg = CommonStringSubstitute(msg, substitutions ?? [])
                    data.Dictionary.push({
                        Tag: "MISSING ACTIVITY DESCRIPTION FOR KEYWORD " + data.Content,
                        Text: msg
                    });
                }
                var customAction = this.CustomActionCallbacks.get(actName);
                if (!customAction)
                    return next(args);
                else
                    return customAction(targetChar, args, next);
            }
            else {
                return next(args);
            }
        }, ModuleCategory.Activities);

        hookFunction("ActivityCheckPrerequisite", 100, (args, next) => {
            var prereqName = <string>args[0];
            if (this.CustomPrerequisiteFuncs.has(prereqName)) {
                var acting = args[1];
                var acted = args[2];
                var targetGrp = args[3];
                var customPrereqFunc = this.CustomPrerequisiteFuncs.get(prereqName);
                if (!customPrereqFunc)
                    return next(args);
                else {
                    return customPrereqFunc(acting, acted, targetGrp);
                }
            }
            else
                return next(args);
        }, ModuleCategory.Activities)

        OnActivity(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
            var dictionary = data?.Dictionary;
            if (!dictionary || !dictionary[3])
                return;
            let target = dictionary?.find((d: any) => d.Tag == "TargetCharacter");
            let activityName = dictionary[3]?.ActivityName;
            if (target.MemberNumber == Player.MemberNumber && this.CustomIncomingActivityReactions.has(activityName)) {
                var reactionFunc = this.CustomIncomingActivityReactions.get(activityName);
                if (!!reactionFunc)
                    reactionFunc(sender);
            }
        })

        hookFunction("DrawImageResize", 1, (args, next) => {
            var path = <string>args[0];
            if (!!path && path.indexOf("LSCG_") > -1) {
                var activityName = path.substring(path.indexOf("LSCG_"));
                activityName = activityName.substring(0, activityName.indexOf(".png"))
                if (this.CustomImages.has(activityName))
                    args[0] = this.CustomImages.get(activityName);
            }
            return next(args);
        }, ModuleCategory.Activities)

        this.InitTongueGrabHooks();
        this.InitHandHoldHooks();
        this.RegisterActivities();
    }

    RegisterActivities(): void{
        // Hug
        this.AddActivity({
            Activity: <Activity>{
                Name: "Hug",
                MaxProgress: 70,
                MaxProgressSelf: 70,
                Prerequisite: ["UseArms"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter wraps PronounPossessive arms around TargetCharacter in a big warm hug.",
                    TargetSelfAction: "SourceCharacter wraps TargetCharacter in a theraputic self-hug."
                }
            ],
            CustomImage: ICONS.HUG
        });

        // Tackle
        this.AddActivity({
            Activity: <Activity>{
                Name: "Tackle",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["UseArms"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter full body tackles TargetCharacter!"
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
        });

        // Flop
        this.AddActivity({
            Activity: <Activity>{
                Name: "Flop",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["UseLegs"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter flops on top of TargetCharacter!"
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Cuddle.png"
        });

        // KissEyes
        this.AddActivity({
            Activity: <Activity>{
                Name: "KissEyes",
                MaxProgress: 75,
                MaxProgressSelf: 50,
                Prerequisite: ["ZoneAccessible"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetLabel: "Kiss Eyes",
                    TargetAction: "SourceCharacter gently kisses over TargetCharacter's eyes."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // RubPussy
        this.AddActivity({
            Activity: <Activity>{
                Name: "RubPussy",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "HasVagina"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemPenis",
                    SelfAllowed: false,
                    TargetLabel: "Rub Pussy",
                    TargetAction: "SourceCharacter grinds their pussy against TargetCharacter's penis."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/MasturbateHand.png"
        });

        // RubPenis
        this.AddActivity({
            Activity: <Activity> {
                Name: "RubPenis",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "CanUsePenis", "HasPenis", "Needs-PenetrateItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis along TargetCharacter's face."
                }, <ActivityTarget>{
                    Name: "ItemMouth",
                    TargetLabel: "Slap With Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive penis against TargetCharacter's mouth."
                }, <ActivityTarget>{
                    Name: "ItemVulva",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis against TargetCharacter's pussy."
                }, <ActivityTarget>{
                    Name: "ItemBreast",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis in between TargetCharacter's breasts."
                }, <ActivityTarget>{
                    Name: "ItemLegs",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's thigh."
                }, <ActivityTarget>{
                    Name: "ItemFeet",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's calf."
                }, <ActivityTarget>{
                    Name: "ItemBoots",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's feet."
                }, <ActivityTarget>{
                    Name: "ItemButt",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis in between TargetCharacter's ass cheeks."
                }, <ActivityTarget>{
                    Name: "ItemNeck",
                    TargetLabel: "Slap With Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive penis down on TargetCharacter's neck."
                }, <ActivityTarget>{
                    Name: "ItemArms",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's arm."
                }, <ActivityTarget>{
                    Name: "ItemHands",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis in between TargetCharacter's fingers."
                }, <ActivityTarget>{
                    Name: "ItemPenis",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis against TargetCharacter's own penis."
                }
            ]
        });

        // NibbleTail
        this.AddActivity({
            Activity: {
                Name: "Nibble",
                MaxProgress: 90,
                MaxProgressSelf: 50,
                Prerequisite: ["HasTail"],
                Target: []
            },
            Targets: [{
                Name: "ItemButt",
                SelfAllowed: true,
                TargetLabel: "Nibble Tail",
                TargetAction: "SourceCharacter nibbles on TargetCharacter's tail.",
                TargetSelfAction: "SourceCharacter nibbles on PronounPossessive own tail."
            }],
            CustomPrereqs: [
                {
                    Name: "HasTail",
                    Func: (acting, acted, group) => !!InventoryGet(acted, "TailStraps")
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Nibble.png"
        });

        // FuckWithPussy
        this.AddActivity({
            Activity: <Activity>{
                Name: "FuckWithPussy",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "HasVagina"]
            },
            Targets: [
                {
                    Name: "ItemVulva",
                    SelfAllowed: false,
                    TargetLabel: "Grind with Pussy",
                    TargetAction: "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's."
                }, {
                    Name: "ItemPenis",
                    SelfAllowed: false,
                    TargetLabel: "Ride with Pussy",
                    TargetAction: "SourceCharacter fucks TargetCharacter's penis with PronounPossessive pussy, grinding up and down."
                },
                {
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetLabel: "Sit on Face",
                    TargetAction: "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's face."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "CanGrindWithPussy",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemVulva" && acted.HasPenis()) {
                            return !acting.IsVulvaFull();
                        }
                        else {
                            return acted.ActivePose?.indexOf("Kneel") > -1 || 
                                acted.ActivePose?.indexOf("KneelingSpread") > -1 ||
                                acted.ActivePose?.indexOf("Hogtied") > -1 ||
                                acted.ActivePose?.indexOf("KneelingSpread") > -1 ||
                                acted.ActivePose?.indexOf("Hogtied") > -1 ||
                                acted.ActivePose?.indexOf("AllFours") > -1;
                        }
                    }
                }
            ],
            CustomImage: ICONS.PUSSY
        });

        // FuckWithAss
        this.AddActivity({
            Activity: <Activity>{
                Name: "FuckWithAss",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "TargetHasPenis"]
            },
            Targets: [
                {
                    Name: "ItemVulva",
                    SelfAllowed: false,
                    TargetLabel: "Grind with Ass",
                    TargetAction: "SourceCharacter grinds PronounPossessive ass against TargetCharacter's vulva."
                },{
                    Name: "ItemPenis",
                    SelfAllowed: false,
                    TargetLabel: "Ride with Ass",
                    TargetAction: "SourceCharacter fucks TargetCharacter's penis with PronounPossessive ass."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "SourceAssEmpty",
                    Func: (acting, acted, group) => !acting.IsPlugged()
                }
            ],
            CustomImage: ICONS.ASS
        });

        // GrabTongue
        this.AddActivity({
            Activity: <Activity>{
                Name: "GrabTongue",
                MaxProgress: 75,
                MaxProgressSelf: 30,
                Prerequisite: ["ZoneAccessible", "UseHands", "TargetCanUseTongue"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: false,
                    TargetLabel: "Grab Tongue",
                    TargetAction: "SourceCharacter reaches in and grabs hold of TargetCharacter's tongue with PronounPossessive fingers."
                }
            ],
            CustomReaction: <CustomReaction>{
                Func: (sender) => {
                    this.customGagged = Date.now() + 45000;
                    CharacterSetFacialExpression(Player, "Mouth", "Ahegao");
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
        });

        // HoldHand
        this.AddActivity({
            Activity: <Activity>{
                Name: "HoldHand",
                MaxProgress: 75,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: false,
                    TargetLabel: "Hold Hands",
                    TargetAction: "SourceCharacter takes TargetCharacter's hand."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsHandUnleashed",
                    Func: (acting, acted, group) => {
                        return !this.isHandLeashed(acted);
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoGrab(target, "hand");
                    return next(args);
                }
            },
            CustomImage: ICONS.HOLD_HANDS
        });

        // ReleaseHand
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseHand",
                MaxProgress: 20,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: false,
                    TargetLabel: "Release Hand",
                    TargetAction: "SourceCharacter lets go of TargetCharacter's hand."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsHandLeashed",
                    Func: (acting, acted, group) => {
                        return this.isHandLeashed(acted);
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "hand");
                    return next(args);
                }
            },
            CustomImage: ICONS.HOLD_HANDS
        });

        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Pinch",
            CustomPrereqs: [
                {
                    Name: "TargetIsEarAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemEars")
                            return !this.isPlayerPinching(acted.MemberNumber ?? 0) && this.earPinchingMemberList.length < 2;
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = args[1]?.Dictionary[2]?.FocusGroupName;
                    if (!!target && !!location && location == "ItemEars")
                        this.DoGrab(target, "ear");
                    return next(args);
                }
            },
        });

        // ReleaseEar
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseEar",
                MaxProgress: 30,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemEars",
                    SelfAllowed: false,
                    TargetLabel: "Release Ear",
                    TargetAction: "SourceCharacter releases TargetCharacter's ear."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsEarPinched",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemEars")
                            return this.isPlayerPinching(acted.MemberNumber ?? 0);
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "ear");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
        });
    }

    customGagged: number = 0;

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Activities);
    }

    CustomPrerequisiteFuncs: Map<string, (acting: Character, acted: Character, group: AssetGroup) => boolean> = new Map<string, (acting: Character, acted: Character, group: AssetGroup) => boolean>();
    CustomIncomingActivityReactions: Map<string, (sender: Character | null) => void> = new Map<string, (sender: Character | null) => void>();
    CustomActionCallbacks: Map<string, (target: Character | null, args: any[], next: (args: any[]) => any) => any> = new Map<string, (sender: Character | null, args: any[], next: (args: any[]) => any) => any>();
    CustomImages: Map<string, string> = new Map<string, string>;

    AddCustomPrereq(prereq: CustomPrerequisite) {
        if (!this.CustomPrerequisiteFuncs.get(prereq.Name))
            this.CustomPrerequisiteFuncs.set(prereq.Name, prereq.Func)
    }

    RegisterCustomFuncs(bundle: ActivityBundleBase, activity: Activity) {
        bundle.CustomPrereqs?.forEach(prereq => {
            if (activity!.Prerequisite.indexOf(prereq.Name) == -1)
                activity!.Prerequisite.push(prereq.Name);
            this.AddCustomPrereq(prereq);
        })

        if (!!bundle.CustomReaction && !this.CustomIncomingActivityReactions.get(activity.Name)) {
            this.CustomIncomingActivityReactions.set(activity.Name, bundle.CustomReaction.Func)
        }

        if (!!bundle.CustomImage && !this.CustomImages.get(activity.Name)) {
            this.CustomImages.set(activity.Name, bundle.CustomImage);
        }

        if (!!bundle.CustomAction && !this.CustomActionCallbacks.get(activity.Name))
            this.CustomActionCallbacks.set(activity.Name, bundle.CustomAction.Func);
    }

    PatchActivity(bundle: ActivityPatch) {
        var existingActivity = ActivityFemale3DCG.find(a => a.Name == bundle.ActivityName);
        if (!existingActivity)
            return;

        this.RegisterCustomFuncs(bundle, existingActivity!);
    }

    AddActivity(bundle: ActivityBundle) {
        if (!bundle.Targets || bundle.Targets.length <= 0)
            return;

        let activity = bundle.Activity;
        activity.Target = activity.Target ?? [];
        activity.Prerequisite = activity.Prerequisite ?? [];
        activity.Name = "LSCG_" + activity.Name;

        this.RegisterCustomFuncs(bundle, bundle.Activity);

        ActivityDictionary?.push([
            "Activity"+activity.Name,
            bundle.Targets[0].TargetLabel ?? activity.Name.substring(5)
        ])

        bundle.Targets.forEach(tgt => {
            tgt.TargetLabel = tgt.TargetLabel ?? activity.Name.substring(5);

            if (tgt.SelfAllowed) {
                if (!activity.TargetSelf)
                    activity.TargetSelf = [];
                if ((<AssetGroupItemName[]>activity.TargetSelf).indexOf(tgt.Name) == -1) {
                    (<AssetGroupItemName[]>activity.TargetSelf).push(tgt.Name);
                }
            }

            if (!tgt.SelfOnly) {
                if (!activity.Target)
                    activity.Target = [];

                if (activity.Target.indexOf(tgt.Name) == -1) {
                    activity.Target.push(tgt.Name);
                }            
            }

            ActivityDictionary?.push([
                "Label-ChatOther-" + tgt.Name + "-" + activity.Name,
                tgt.TargetLabel
            ]);
            ActivityDictionary?.push([
                "ChatOther-" + tgt.Name + "-" + activity.Name,
                tgt.TargetAction
            ]);

            if (tgt.SelfAllowed) {
                ActivityDictionary?.push([
                    "Label-ChatSelf-" + tgt.Name + "-" + activity.Name,
                    tgt.TargetSelfLabel ?? tgt.TargetLabel
                ]);
                ActivityDictionary?.push([
                    "ChatSelf-" + tgt.Name + "-" + activity.Name,
                    tgt.TargetSelfAction ?? tgt.TargetAction
                ]);
            }
        });

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }

    InitTongueGrabHooks(): void {
        // Allow for similar "hand-gagging" when certain custom actions are done
        hookFunction("SpeechGetTotalGagLevel", 6, (args, next) => {
            let level = <number>next(args);
            if (this.customGagged > Date.now())
                level += 2;
            return level;
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomDrawCharacterOverlay", 1, (args, next) => {
            const ret = next(args);
            const [C, CharX, CharY, Zoom] = args;
            if (
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                ChatRoomHideIconState === 0 &&
                C.MemberNumber == Player.MemberNumber
            ) {
                if (this.customGagged > Date.now()) {
                    DrawCircle(CharX + 140 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White")
                    DrawImageResize(
                        ICONS.TONGUE,
                        CharX + 125 * Zoom,
                        CharY + 45 * Zoom,
                        30 * Zoom,
                        30 * Zoom
                    );
                }
            }
            return ret;
        }, ModuleCategory.Activities);

        let failedLinkActions = [
            "%NAME%'s whimpers, %POSSESSIVE% tongue held tightly.",
            "%NAME% strains, trying to pull %POSSESSIVE% tongue free.",
            "%NAME% starts to drool, %POSSESSIVE% tongue held fast."
        ];             

        hookFunction('ServerSend', 5, (args, next) => {
            let sendType = args[0];
            let data = args[1]; 
            if (sendType == "ChatRoomChat" && data?.Type == "Activity" && !!data?.Dictionary && !!data?.Dictionary[3]){
                var activityName = data?.Dictionary[3].ActivityName;
                if (activityName == "Lick" && this.customGagged > Date.now())
                    SendAction(failedLinkActions[getRandomInt(failedLinkActions.length)]);
                else
                    return next(args);
            } else {
                return next(args);
            }
        }, ModuleCategory.Activities);
    }

    InitHandHoldHooks(): void {
        hookFunction("ChatRoomLeave", 1, (args, next) => {
            if (this.earPinchingMemberList.length > 0) {
                var chars = this.earPinchingMemberList.map(id => getCharacter(id));
                if (chars.length == 1)
                    SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
                else
                    SendAction("%NAME% leads " + chars[0]?.Nickname ?? chars[0]?.Name + " and " + chars[1]?.Nickname ?? chars[1]?.Name + " out of the room by the ear.");
            }
            return next(args);
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomDrawCharacterOverlay", 1, (args, next) => {
            const ret = next(args) as any;
            const [C, CharX, CharY, Zoom] = args;
            if (
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                ChatRoomHideIconState === 0
            ) {
                if (this.isPlayerPinchedBy(C.MemberNumber) || this.isPlayerPinching(C.MemberNumber)) {
                    DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White")
                    DrawImageResize(
                        ICONS.EAR,
                        CharX + 405 * Zoom, CharY + 45 * Zoom, 30 * Zoom, 30 * Zoom
                    );
                }
                else if (this.isHandLeashed(C)) {
                    DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White")
                    DrawImageResize(
                        ICONS.HOLD_HANDS,
                        CharX + 400 * Zoom, CharY + 40 * Zoom, 40 * Zoom, 40 * Zoom
                    );
                }
            }
            return ret;
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
            let sourceMemberNumber = args[0];
            let C = args[1];
            let roomAllowsLeashing = (ChatRoomData && ChatRoomData.BlockCategory && ChatRoomData.BlockCategory.indexOf("Leashing") < 0) || !ChatRoomData;

            if (this.isPlayerHoldingHandsWith(sourceMemberNumber) && roomAllowsLeashing) {
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
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomPingLeashedPlayers", 1, (args, next) => {
            next(args);
            if (this.allCustomLedMembers && this.allCustomLedMembers.length > 0) {
                this.allCustomLedMembers.forEach(memberNumber => {
                    ServerSend("ChatRoomChat", { Content: "PingHoldLeash", Type: "Hidden", Target: memberNumber });
                    ServerSend("AccountBeep", { MemberNumber: memberNumber, BeepType: "Leash"});
                });
            }
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomDoPingLeashedPlayers", 1, (args, next) => {
            next(args);
            let SenderCharacter = args[0];
            if (this.handHoldingMemberList.indexOf(SenderCharacter.MemberNumber) == -1 || !ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
                this.DoRelease(SenderCharacter, "hand");
            }
            if (this.earPinchedByMember == SenderCharacter.MemberNumber || !ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
                this.DoRelease(SenderCharacter, "ear");
            }
        }, ModuleCategory.Activities)

        hookFunction("ServerAccountBeep", 1, (args, next) => {
            next(args);
            let data = args[0];
            if (data.BeepType == "Leash" && this.allCustomHeldBy.indexOf(data.MemberNumber) > -1 && data.ChatRoomName) {
                if (Player.OnlineSharedSettings && Player.OnlineSharedSettings.AllowPlayerLeashing != false && ( CurrentScreen != "ChatRoom" || !ChatRoomData || (CurrentScreen == "ChatRoom" && ChatRoomData.Name != data.ChatRoomName))) {
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
                        this.handHoldingMemberList = this.handHoldingMemberList.filter(num => num != data.MemberNumber!);
                        this.earPinchingMemberList = this.earPinchingMemberList.filter(num => num != data.MemberNumber!);
                    }
                }
            }
        }, ModuleCategory.Activities);

        OnAction(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
            if (data?.Content == "ServerDisconnect" && this.handHoldingMemberList.indexOf(sender?.MemberNumber ?? 0))
                this.removeHandHold(sender!);
        });
    }

    earPinchedByMember: number | null = null;
    earPinchingMemberList: number[] = [];
    handHoldingMemberList: number[] = [];

    get allCustomHeldBy(): number[] {
        return this.handHoldingMemberList.concat(this.earPinchedByMember!);
    }

    get allCustomLedMembers(): number[] {
        return this.handHoldingMemberList.concat(this.earPinchingMemberList);
    }

    isPlayerHoldingHandsWith(holdingMemberNumber: number) {
        return this.handHoldingMemberList.indexOf(holdingMemberNumber!) > -1;
    }
    
    isPlayerPinchedBy(member: number) {
        return this.earPinchedByMember == member;
    }

    isPlayerPinching(member: number) {
        return this.earPinchingMemberList.indexOf(member) > -1;
    }

    isHandLeashed(C: Character | null) {
        if (!C) {
            return this.handHoldingMemberList.length > 0;
        }
        return this.isPlayerHoldingHandsWith(C.MemberNumber!);
    }

    DoGrab(target: Character, type: GrabType) {
        // Only bother custom grabbing other LSCG users, vanilla won't follow.
        if (!(target as OtherCharacter).LSCG)
            return;

        sendLSCGMessage(<LSCGMessageModel>{
            type: "command",
            reply: false,
            settings: null,
            target: target.MemberNumber!,
            version: LSCG_VERSION,
            command: {
                name: "grab",
                args: [{
                    name: "type",
                    value: type
                }]
            }
        });
        
        switch (type) {
            case "hand":
                this.removeEarPinch(target);
                this.addHandHold(target);
                break;
            case "ear":
                this.removeHandHold(target);
                this.addEarPinch(target);
                break;
        }
    };

    DoRelease(target: Character, type: GrabType) {
        sendLSCGMessage(<LSCGMessageModel>{
            type: "command",
            reply: false,
            settings: null,
            target: target.MemberNumber!,
            version: LSCG_VERSION,
            command: {
                name: "release",
                args: [{
                    name: "type",
                    value: type
                }]
            }
        });
     
        switch (type) {
            case "hand":
                this.removeHandHold(target);
                break;
            case "ear":
                this.removeEarPinch(target);
                break;
        }
    }

    addHandHold(sender: Character) {
        this.handHoldingMemberList.push(sender.MemberNumber!);
        this.handHoldingMemberList = this.handHoldingMemberList.filter((num, ix, arr) => arr.indexOf(num) == ix);
    }

    removeHandHold(sender: Character) {
        this.handHoldingMemberList = this.handHoldingMemberList.filter(num => num != sender.MemberNumber!);
    }

    addEarPinch(sender: Character) {
        this.earPinchingMemberList.push(sender.MemberNumber!);
        this.earPinchingMemberList = this.earPinchingMemberList.filter((num, ix, arr) => arr.indexOf(num) == ix);
    }

    removeEarPinch(sender: Character) {
        this.earPinchingMemberList = this.earPinchingMemberList.filter(num => num != sender.MemberNumber!);
    }

    IncomingGrab(sender: Character, grabType: GrabType) {
        switch (grabType) {
            case "hand":
                this.addHandHold(sender);
                break;
            case "ear":
                this.earPinchedByMember = sender.MemberNumber!
                break;
        }
    }

    IncomingRelease(sender: OtherCharacter, grabType: GrabType) {
        switch (grabType) {
            case "hand":
                this.removeHandHold(sender);
                break;
            case "ear":
                this.earPinchedByMember = null;
                break;
        }
    }
}
