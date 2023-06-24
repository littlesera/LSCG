import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, hookFunction, ICONS, getCharacter, sendLSCGMessage, OnAction, callOriginal, LSCG_SendLocal } from "../utils";
import { getModule } from "modules";
import { ItemUseModule } from "./item-use";

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

export interface CustomPreparse {
    Func(args: any[]): void;
}

export interface ActivityBundleBase {
    CustomPrereqs?: CustomPrerequisite[];
    CustomReaction?: CustomReaction;
    CustomAction?: CustomAction;
    CustomPreparse?: CustomPreparse;
    CustomImage?: string;
}

export interface ActivityPatch extends ActivityBundleBase {
    ActivityName: string;
    RemovedTargets?: string[];
    AddedTargets?: ActivityTarget[];
    RemovedPrerequisites?: string[];
    AddedPrerequisites?: string[];
}

export interface ActivityBundle extends ActivityBundleBase {
    Activity: Activity;
    Targets?: ActivityTarget[];
}

export type GrabType = "hand"  | "ear" | "tongue" | "arm"

export interface HandOccupant {
    Member: number,
    Type: GrabType
}

export class ActivityModule extends BaseModule {
    safeword(): void {
        this.heldBy = [];
        this.hands = [];
    }

    load(): void {
        hookFunction("ServerSend", 100, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity"){
                let data = args[1];
                let actName = data.Dictionary[3]?.ActivityName ?? "";
                var isPatched = this.CheckForPatchedActivity(actName, data.Content);
                if (actName.indexOf("LSCG_") == 0 || isPatched) {
                    let preParse = this.CustomPreparseCallbacks.get(actName);
                    if (!!preParse)
                        preParse(args);

                    let target = data.Dictionary?.find((d: any) => d.Tag == "TargetCharacter");
                    var targetChar = getCharacter(target.MemberNumber);
                    let {metadata, substitutions} = ChatRoomMessageRunExtractors(data, Player)
                    let msg = ActivityDictionaryText(data.Content);
                    msg = CommonStringSubstitute(msg, substitutions ?? [])
                    data.Dictionary.push({
                        Tag: "MISSING ACTIVITY DESCRIPTION FOR KEYWORD " + data.Content,
                        Text: msg
                    });

                    // If action name has a custom action, run it as part of the chain
                    var customAction = this.CustomActionCallbacks.get(actName);
                    if (!customAction)
                        return next(args);
                    else
                        return customAction(targetChar, args, next);
                }
                else
                    return next(args);
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
            if (target?.MemberNumber == Player.MemberNumber && this.CustomIncomingActivityReactions.has(activityName)) {
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

        hookFunction("CharacterItemsForActivity", 1, (args, next) => {
			let C = args[0];
			let itemType = args[1];
			let results = next(args);
			var focusGroup = C?.FocusGroup?.Name ?? undefined;

			if (itemType == "RubItem") {
				let item = InventoryGet(C, "Pussy");
                let canUsePenis = C.HasPenis() && InventoryPrerequisiteMessage(C, "AccessVulva") === "";
				if (canUsePenis) results.push(item);
			}

			return results;
		}, ModuleCategory.Activities);

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

        // SlapPenis
        this.AddActivity({
            Activity: <Activity> {
                Name: "SlapPenis",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "CanUsePenis", "HasPenis", "Needs-PenetrateItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    TargetLabel: "Slap Face",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's face."
                }, <ActivityTarget>{
                    Name: "ItemMouth",
                    TargetLabel: "Slap Mouth",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's mouth."
                }, <ActivityTarget>{
                    Name: "ItemVulva",
                    TargetLabel: "Slap against Pussy",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's pussy."
                }, <ActivityTarget>{
                    Name: "ItemBreast",
                    TargetLabel: "Slap Breast",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's breast."
                }, <ActivityTarget>{
                    Name: "ItemLegs",
                    TargetLabel: "Slap Thigh",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's thigh."
                }, <ActivityTarget>{
                    Name: "ItemFeet",
                    TargetLabel: "Slap Calf",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's calf."
                }, <ActivityTarget>{
                    Name: "ItemBoots",
                    TargetLabel: "Slap Feet",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's feet."
                }, <ActivityTarget>{
                    Name: "ItemButt",
                    TargetLabel: "Slap Butt",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's butt."
                }, <ActivityTarget>{
                    Name: "ItemNeck",
                    TargetLabel: "Slap Neck",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's neck."
                }, <ActivityTarget>{
                    Name: "ItemArms",
                    TargetLabel: "Slap Arms",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's arm."
                }, <ActivityTarget>{
                    Name: "ItemHands",
                    TargetLabel: "Slap Hand",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's hand."
                }, <ActivityTarget>{
                    Name: "ItemPenis",
                    TargetLabel: "Slap Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive UsedAsset against TargetCharacter's penis."
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
                            return acted.Pose?.indexOf("Kneel") > -1 || 
                                acted.Pose?.indexOf("KneelingSpread") > -1 ||
                                acted.Pose?.indexOf("Hogtied") > -1 ||
                                acted.Pose?.indexOf("KneelingSpread") > -1 ||
                                acted.Pose?.indexOf("Hogtied") > -1 ||
                                acted.Pose?.indexOf("AllFours") > -1;
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
            CustomPrereqs: [
                {
                    Name: "TargetTongueIsNotGrabbed",
                    Func: (acting, acted, group) => {
                        return this.tongueGrabbedMemberList.indexOf(acted.MemberNumber!) == -1;
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoGrab(target, "tongue");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
        });

        // ReleaseTongue
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseTongue",
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: false,
                    TargetLabel: "Release Tongue",
                    TargetAction: "SourceCharacter lets go of TargetCharacter's tongue."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetTongueIsGrabbed",
                    Func: (acting, acted, group) => {
                        return this.tongueGrabbedMemberList.indexOf(acted.MemberNumber!) > -1;
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "tongue");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
        });

        // HoldHand
        this.AddActivity({
            Activity: <Activity>{
                Name: "HoldHand",
                MaxProgress: 75,
                Prerequisite: ["ZoneAccessible", "TargetZoneAccessible", "UseHands"]
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
                        return !this.isHandLeashed(acted) && InventoryGet(acted, "ItemHands") == null && this.handHoldingMemberList.length < 2;
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

        // Patch Pinch
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Pinch",
            AddedTargets: [
                {
                    Name: "ItemButt",
                    SelfAllowed: true,
                    TargetLabel: "Pinch Butt",
                    TargetAction: "SourceCharacter pinches TargetCharacter's butt.",
                    TargetSelfAction: "SourceCharacter pinches PronounPossessive own butt."
                }, {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    TargetLabel: "Pinch Cheek",
                    TargetAction: "SourceCharacter pinches TargetCharacter's cheek.",
                    TargetSelfAction: "SourceCharacter pinches PronounPossessive own cheek."
                }
            ],
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

        // Patch Grab Arm
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Grope",
            CustomPrereqs: [
                {
                    Name: "TargetIsArmAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemArms")
                            return !this.isPlayerGrabbing(acted.MemberNumber ?? 0) && this.armGrabbingMemberList.length < 2;
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = args[1]?.Dictionary[2]?.FocusGroupName;
                    if (!!target && !!location && location == "ItemArms")
                        this.DoGrab(target, "arm");
                    return next(args);
                }
            },
        });

        // Release Arm
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseArm",
                MaxProgress: 30,
                Prerequisite: [""]
            },
            Targets: [
                {
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetLabel: "Release Arm",
                    TargetAction: "SourceCharacter releases TargetCharacter's arm."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsArmGrabbed",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemArms")
                            return this.isPlayerGrabbing(acted.MemberNumber ?? 0);
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "arm");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
        });
    }

    get customGagged(): boolean {
        return !!this.tongueGrabbedByMember && this.tongueGrabbedByMember >= 0;
    };
    prevMouth: ExpressionName | null = null;

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Activities);
    }

    CustomPrerequisiteFuncs: Map<string, (acting: Character, acted: Character, group: AssetGroup) => boolean> = new Map<string, (acting: Character, acted: Character, group: AssetGroup) => boolean>();
    CustomIncomingActivityReactions: Map<string, (sender: Character | null) => void> = new Map<string, (sender: Character | null) => void>();
    CustomActionCallbacks: Map<string, (target: Character | null, args: any[], next: (args: any[]) => any) => any> = new Map<string, (sender: Character | null, args: any[], next: (args: any[]) => any) => any>();
    CustomPreparseCallbacks: Map<string, (args: any[]) => void> = new Map<string, (args: any[]) => void>();
    CustomImages: Map<string, string> = new Map<string, string>;
    PatchedActivities: string[] = [];

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

        if (!!bundle.CustomReaction && !this.CustomIncomingActivityReactions.get(activity.Name))
            this.CustomIncomingActivityReactions.set(activity.Name, bundle.CustomReaction.Func)

        if (!!bundle.CustomImage && !this.CustomImages.get(activity.Name))
            this.CustomImages.set(activity.Name, bundle.CustomImage);

        if (!!bundle.CustomAction && !this.CustomActionCallbacks.get(activity.Name))
            this.CustomActionCallbacks.set(activity.Name, bundle.CustomAction.Func);

        if (!!bundle.CustomPreparse && !this.CustomPreparseCallbacks.get(activity.Name))
            this.CustomPreparseCallbacks.set(activity.Name, bundle.CustomPreparse.Func);
    }

    CheckForPatchedActivity(activityName: string, activityMsg: string): boolean {
        return this.PatchedActivities.indexOf(activityName) > -1 && !!ActivityDictionaryText(activityMsg);
    }

    PatchActivity(patch: ActivityPatch) {
        var activity = ActivityFemale3DCG.find(a => a.Name == patch.ActivityName);
        if (!activity)
            return;

        if (!!patch.AddedTargets) {
            patch.AddedTargets.forEach(tgt => {
                this.AddTargetToActivity(activity!, tgt);
            });
        }

        this.RegisterCustomFuncs(patch, activity!);

        this.PatchedActivities.push(patch.ActivityName);
    }

    AddTargetToActivity(activity: Activity, tgt: ActivityTarget) {
        tgt.TargetLabel = tgt.TargetLabel ?? activity.Name.substring(5);

        if (tgt.SelfAllowed) {
            if (!activity.TargetSelf)
                activity.TargetSelf = [];
            if (typeof activity.TargetSelf != "boolean" && (<AssetGroupItemName[]>activity.TargetSelf).indexOf(tgt.Name) == -1) {
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
            this.AddTargetToActivity(activity, tgt);
        });

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }

    InitTongueGrabHooks(): void {
        // Allow for similar "hand-gagging" when certain custom actions are done
        hookFunction("ServerSend", 1, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Chat"){
                if (this.customGagged) {
                    let currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
                    args[1].Content = SpeechGarbleByGagLevel(currentGagLevel + 2, args[1].Content);
                    args[1].Content = SpeechStutter(Player, args[1].Content);
                    args[1].Content = SpeechBabyTalk(Player, args[1].Content);
                }
            }
            next(args);
        })

        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Bite",
            CustomPrereqs: [
                <CustomPrerequisite>{
                    Name: "CheckTongueGrabbing",
                    Func: (acting, acted, group) => {
                        if (!this.customGagged)
                            return true;
                        else
                            return this.tongueGrabbedByMember == acted.MemberNumber && group?.Name == "ItemHands";
                    }
                }
            ]
        })

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
                if (activityName == "Lick" && this.customGagged)
                    SendAction(failedLinkActions[getRandomInt(failedLinkActions.length)]);
                else
                    return next(args);
            } else {
                return next(args);
            }
        }, ModuleCategory.Activities);
    }

    InitHandHoldHooks(): void {
        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (!!this.earPinchedByMember || !!this.armGrabbedByMember || !!this.tongueGrabbedByMember)
                return false;
            return next(args);
        }, ModuleCategory.Activities);
        
        hookFunction("ChatRoomLeave", 1, (args, next) => {
            if (this.earPinchingMemberList.length > 0) {
                var chars = this.earPinchingMemberList.map(id => getCharacter(id));
                if (chars.length == 1)
                    SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
                else
                    SendAction("%NAME% leads " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their ears.");
            } else if (this.armGrabbingMemberList.length > 0) {
                var chars = this.armGrabbingMemberList.map(id => getCharacter(id));
                if (chars.length == 1)
                    SendAction("%NAME% roughly pulls %OPP_NAME% out of the room by the arm.", chars[0]);
                else
                    SendAction("%NAME% roughly pulls " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their arms.");
            } else if (this.tongueGrabbedMemberList.length > 0) {
                var chars = this.tongueGrabbedMemberList.map(id => getCharacter(id));
                if (chars.length == 1)
                    SendAction("%NAME% tugs %OPP_NAME% out of the room by the tongue.", chars[0]);
                else
                    SendAction("%NAME% tugs " + CharacterNickname(chars[0]!) + " and " + CharacterNickname(chars[1]!) + " out of the room by their tongues.");
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
                        this.isPlayerPinching(C.MemberNumber) ? ICONS.EAR : ICONS.PINCH,
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
                // ROTATE CANVAS TO DRAW ICON IN HERE, if it works it works, if it doesn't -- HO BOY!
                else if (this.isPlayerGrabbedBy(C.MemberNumber) || this.isPlayerGrabbing(C.MemberNumber)) {
                    DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom, 20 * Zoom, 1, "Black", "White");
                    MainCanvas.translate(CharX + 420 * Zoom, CharY + 60 * Zoom);
                    MainCanvas.rotate(-Math.PI/2);
                    MainCanvas.translate(-(CharX + 420 * Zoom), -(CharY + 60 * Zoom));
                    DrawImageEx("Icons/Battle.png", CharX + 405 * Zoom, CharY + 45 * Zoom, { Width: 30 * Zoom, Height: 30 * Zoom, Invert: this.isPlayerGrabbing(C.MemberNumber) });
                    // DrawImageResize(
                    //     "Icons/Battle.png",
                    //     CharX + 405 * Zoom, CharY + 45 * Zoom, 30 * Zoom, 30 * Zoom
                    // );
                    MainCanvas.translate(CharX + 420 * Zoom, CharY + 60 * Zoom);
                    MainCanvas.rotate(Math.PI/2);
                    MainCanvas.translate(-(CharX + 420 * Zoom), -(CharY + 60 * Zoom));
                }
                else if (this.tongueGrabbedMemberList.indexOf(C.MemberNumber!) > -1 || (this.customGagged && C.IsPlayer())) {
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

        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
            let sourceMemberNumber = args[0];
            let C = args[1];
            let roomAllowsLeashing = (ChatRoomData && ChatRoomData.BlockCategory && ChatRoomData.BlockCategory.indexOf("Leashing") < 0) || !ChatRoomData;

            if (this.isCustomLeashedBy(sourceMemberNumber) && roomAllowsLeashing) {
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
            if (this.hands.length > 0) {
                this.hands.forEach(hand => {
                    ServerSend("ChatRoomChat", { Content: "PingHoldLeash", Type: "Hidden", Target: hand.Member });
                    ServerSend("AccountBeep", { MemberNumber: hand.Member, BeepType: "Leash"});
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
            if (this.armGrabbedByMember == SenderCharacter.MemberNumber || !ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
                this.DoRelease(SenderCharacter, "arm");
            }
        }, ModuleCategory.Activities)

        hookFunction("ServerAccountBeep", 1, (args, next) => {
            next(args);
            let data = args[0];
            if (data.BeepType == "Leash" && this.heldBy.map(h => h.Member).indexOf(data.MemberNumber) > -1 && data.ChatRoomName) {
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
                        this.releaseGrab(data.MemberNumber, undefined);
                    }
                }
            }
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomSync", 1, (args, next) => {
            var ret = next(args) as any;
            var currentRoomIds = ChatRoomCharacter.map(c => c.MemberNumber!);
            this.hands.map(h => h.Member).filter(id => currentRoomIds.indexOf(id) == -1).forEach(memberNumber => {
                ServerSend("AccountBeep", { MemberNumber: memberNumber, BeepType: "Leash"});
            });
        }, ModuleCategory.Activities);

        OnAction(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
            if (data?.Content == "ServerDisconnect") {
                let num = sender?.MemberNumber;
                if (!!num) {
                    this.releaseGrab(num, undefined)
                    this.releasedBy(num, undefined);
                }
            }
        });
    }

    hands: HandOccupant[] = [];
    heldBy: HandOccupant[] = [];

    get maxHands(): number {
        return 2;
    }

    addGrab(member: number, type: GrabType): HandOccupant | undefined {
        if (!member || member < 0 || !!this.hands.find(h => h.Member == member && h.Type == type))
            return undefined;

        let removed: HandOccupant | undefined;
        if (this.hands.length + 1 > this.maxHands)
            removed = this.hands.shift();
        this.hands.push(<HandOccupant>{
            Member: member,
            Type: type
        });

        if (!!removed) {
            var char = getCharacter(removed.Member);
            if (!!char) {
                this.DoRelease(char, removed.Type);
            }
        }

        return removed;
    }

    releaseGrab(member: number, type: GrabType | undefined) {
        if (!type)
            this.hands = this.hands.filter(h => h.Member != member);
        else
            this.hands = this.hands.filter(h => !(h.Member == member && h.Type == type));
    }

    grabbedBy(member: number, type: GrabType) {
        if (!member || member < 0 || !!this.hands.find(h => h.Member == member && h.Type == type))
            return;
            
        this.heldBy.push(<HandOccupant>{
            Member: member,
            Type: type
        })

        if (type == "tongue") {
            this.prevMouth = WardrobeGetExpression(Player)?.Mouth ?? null;
            CharacterSetFacialExpression(Player, "Mouth", "Ahegao");
        }
    }

    releasedBy(member: number, type: GrabType | undefined) {
        if (!type)
            this.heldBy = this.heldBy.filter(h => h.Member != member);
        else
            this.heldBy = this.heldBy.filter(h => !(h.Member == member && h.Type == type));
        
        if (!type || type == "tongue") {
            CharacterSetFacialExpression(Player, "Mouth", this.prevMouth);
            this.prevMouth = null;
        }
    }

    get handHoldingMemberList(): number[] { return this.hands.filter(x => x.Type == "hand").map(h => h.Member) };

    get earPinchedByMember(): number | undefined { return this.heldBy.find(x => x.Type == "ear")?.Member};
    get earPinchingMemberList(): number[] { return this.hands.filter(x => x.Type == "ear").map(h => h.Member) };
    
    get armGrabbedByMember(): number | undefined  { return this.heldBy.find(x => x.Type == "arm")?.Member};
    get armGrabbingMemberList(): number[] { return this.hands.filter(x => x.Type == "arm").map(h => h.Member) };
    
    get tongueGrabbedByMember(): number | undefined { return this.heldBy.find(x => x.Type == "tongue")?.Member};
    get tongueGrabbedMemberList(): number[] { return this.hands.filter(x => x.Type == "tongue").map(h => h.Member) };
    

    isCustomLeashedBy(sourceMember: number) {
        return !!this.heldBy.find(h => h.Member == sourceMember);
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

    isPlayerGrabbedBy(member: number) {
        return this.armGrabbedByMember == member;
    }

    isPlayerGrabbing(member: number) {
        return this.armGrabbingMemberList.indexOf(member) > -1;
    }

    isHandLeashed(C: Character | null) {
        if (!C) {
            return this.handHoldingMemberList.length > 0;
        }
        return this.isPlayerHoldingHandsWith(C.MemberNumber!);
    }

    DoGrab(target: Character, type: GrabType) {
        // Only bother custom grabbing other LSCG users, vanilla won't follow.
        if (!(target as OtherCharacter).LSCG || !target.MemberNumber || target.MemberNumber == Player.MemberNumber)
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

        this.addGrab(target.MemberNumber, type);
    };

    DoRelease(target: Character, type: GrabType) {
        if (!target.MemberNumber)
            return;

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
     
        this.releaseGrab(target.MemberNumber, type);
    }

    IncomingGrab(sender: Character, grabType: GrabType) {
        if (!!sender.MemberNumber) {
            this.grabbedBy(sender.MemberNumber, grabType);
            this.NotifyAboutEscapeCommand(sender, grabType);
        }
    }

    IncomingRelease(sender: OtherCharacter, grabType: GrabType) {
        if (!!sender.MemberNumber)
            this.releasedBy(sender.MemberNumber, grabType);
    }

    IncomingEscape(sender: OtherCharacter, escapeFromMemberNumber: number) {
        if (escapeFromMemberNumber == Player.MemberNumber && !!sender.MemberNumber) {
            this.releaseGrab(sender.MemberNumber, undefined);
        }
    }

    NotifyAboutEscape(escapee: Character) {
        LSCG_SendLocal(`${CharacterNickname(escapee)} has escaped from your grasp!`);
    }

    NotifyAboutEscapeCommand(grabber: Character, type: GrabType) {
        LSCG_SendLocal(`Your ${type} has been grabbed by ${CharacterNickname(grabber)}! <br>[You can try '/lscg escape' to try and break free]`);
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
        let grabbingMemberNumber = this.earPinchedByMember ?? this.armGrabbedByMember ?? this.tongueGrabbedByMember ?? -1;
        if (grabbingMemberNumber < 0) {
            LSCG_SendLocal(`You are not grabbed by anyone!`);
            return;
        }

        var grabber = getCharacter(grabbingMemberNumber);
        if (!grabber) {
            LSCG_SendLocal(`Cannot locate grabber! [Try refreshing if they DC'd]`);
            return;
        }

        SendAction(`${CharacterNickname(Player)} tries their best to escape from ${CharacterNickname(grabber)}'s grip...`);
        setTimeout(() => {
            if (!grabber || !grabber?.MemberNumber)
                return;
            let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(Player, grabber);
            if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}successfully breaks free from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.releasedBy(grabber.MemberNumber, undefined);
                sendLSCGMessage(<LSCGMessageModel>{
                    type: "command",
                    reply: false,
                    settings: null,
                    target: grabber.MemberNumber!,
                    version: LSCG_VERSION,
                    command: {
                        name: "escape"
                    }
                });
            } else {
                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}squirms and wriggles but fails to escape from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
                this.escapeAttempted = CommonTime();
            }
        }, 4000);
    }
}
