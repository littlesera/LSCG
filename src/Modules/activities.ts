import { BaseModule } from "base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, hookFunction, ICONS, getCharacter, sendLSCGMessage, OnAction, callOriginal, LSCG_SendLocal, GetTargetCharacter, GetActivityName, GetMetadata, GetActivityEntryFromContent, IsActivityAllowed } from "../utils";
import { getModule } from "modules";
import { ItemUseModule } from "./item-use";
import { CollarModel } from "Settings/Models/collar";
import { CollarModule } from "./collar";
import { ActivitySettingsModel } from "Settings/Models/activities";
import { GuiActivities } from "Settings/activities";

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

export type GrabType = "hand"  | "ear" | "tongue" | "arm" | "neck" | "mouth" | "horn" | "mouth-with-foot"

export interface HandOccupant {
    Member: number,
    Type: GrabType
}

export interface OverlayGrabModel {
    Grab: HandOccupant,
    IsGrabber: boolean
}

export class ActivityModule extends BaseModule {
    get settings(): ActivitySettingsModel {
		return super.settings as ActivitySettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiActivities;
    }

    get defaultSettings() {
		return <ActivitySettingsModel>{
            enabled: true,
            activities: [
                {
                    name: "Pet",
                    group: "ItemNose",
                    awakener: true,
                    hypno: false,
                    hypnoRequiredRepeats: 2,
                    hypnoThreshold: 50,
                    orgasm: false,
                    orgasmThreshold: 75,
                }
            ],
            stats: {}
        };
    }
    
    safeword(): void {
        this.heldBy = [];
        this.hands = [];
    }

    collarModule: CollarModule = getModule<CollarModule>("CollarModule");

    load(): void {
        hookFunction("ServerSend", 100, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity"){
                let data = args[1];
                let actName = GetActivityName(data) ?? "";
                var isPatched = this.CheckForPatchedActivity(actName, data.Content);
                if (actName.indexOf("LSCG_") == 0 || isPatched) {
                    let preParse = this.CustomPreparseCallbacks.get(actName);
                    if (!!preParse)
                        preParse(args);

                    let target = GetTargetCharacter(data);
                    var targetChar = getCharacter(target!);
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
                    try {
                        return customPrereqFunc(acting, acted, targetGrp);
                    }
                    catch (error) {
                        console.warn(`Custom Prereq ${prereqName} failed: ${error}`);
                    }
                }
            }
            else
                return next(args);
        }, ModuleCategory.Activities)

        OnActivity(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
            let target = GetTargetCharacter(data);
            let activityName = GetActivityName(data);
            if (target == Player.MemberNumber && !!activityName && this.CustomIncomingActivityReactions.has(activityName)) {
                var reactionFunc = this.CustomIncomingActivityReactions.get(activityName);
                if (!!reactionFunc)
                    reactionFunc(sender);
            } else if (target == Player.MemberNumber) {
                let activityEntry = GetActivityEntryFromContent(data.Content);
                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
                    return;
                if (activityEntry?.orgasm && (Player.ArousalSettings?.Progress ?? 0) >= activityEntry?.orgasmThreshold) {
                    if (Player.IsEdged()) {
                        SendAction("%NAME% moans and trembles in frustration as %PRONOUN% is held right at the edge...");
                        ActivitySetArousal(Player, 99);
                    }
                    else
                        ActivityOrgasmPrepare(Player);
                }
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

    run(): void {
        this.collarModule = getModule<CollarModule>("CollarModule");
    }

    RegisterActivities(): void{
        // Bap
        this.AddActivity({
            Activity: <Activity>{
                Name: "Bap",
                MaxProgress: 70,
                MaxProgressSelf: 70,
                Prerequisite: ["UseArms"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter baps TargetCharacter!"
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Slap.png"
        });

        // Bap
        this.AddActivity({
            Activity: <Activity>{
                Name: "Headbutt",
                MaxProgress: 70,
                MaxProgressSelf: 70,
                Prerequisite: ["CanHeadbutt"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter headbutts TargetCharacter."
                }
            ],
            CustomPrereqs: [{
                Name: "CanHeadbutt",
                Func: (acting, acted, group) => !acting.IsFixedHead()
            }],
            CustomImage: "Assets/Female3DCG/Activity/Nod.png"
        });

        // Nuzzle
        this.AddActivity({
            Activity: <Activity>{
                Name: "Nuzzle",
                MaxProgress: 70,
                MaxProgressSelf: 70,
                Prerequisite: ["ZoneAccessible"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles against the side of TargetCharacter's head."
                },<ActivityTarget>{
                    Name: "ItemNeck",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's neck."
                },<ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's arms."
                },<ActivityTarget>{
                    Name: "ItemHands",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles underneath TargetCharacter's hand."
                },<ActivityTarget>{
                    Name: "ItemBreast",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's breasts."
                },<ActivityTarget>{
                    Name: "ItemTorso",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles snugly into TargetCharacter."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

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
                    TargetSelfAction: "SourceCharacter wraps TargetCharacter in a therapeutic self-hug."
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
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's face."
                }, <ActivityTarget>{
                    Name: "ItemMouth",
                    TargetLabel: "Slap Mouth",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's mouth."
                }, <ActivityTarget>{
                    Name: "ItemVulva",
                    TargetLabel: "Slap against Pussy",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's pussy."
                }, <ActivityTarget>{
                    Name: "ItemBreast",
                    TargetLabel: "Slap Breast",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's breast."
                }, <ActivityTarget>{
                    Name: "ItemLegs",
                    TargetLabel: "Slap Thigh",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's thigh."
                }, <ActivityTarget>{
                    Name: "ItemFeet",
                    TargetLabel: "Slap Calf",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's calf."
                }, <ActivityTarget>{
                    Name: "ItemBoots",
                    TargetLabel: "Slap Feet",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's feet."
                }, <ActivityTarget>{
                    Name: "ItemButt",
                    TargetLabel: "Slap Butt",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's butt."
                }, <ActivityTarget>{
                    Name: "ItemNeck",
                    TargetLabel: "Slap Neck",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's neck."
                }, <ActivityTarget>{
                    Name: "ItemArms",
                    TargetLabel: "Slap Arms",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's arm."
                }, <ActivityTarget>{
                    Name: "ItemHands",
                    TargetLabel: "Slap Hand",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's hand."
                }, <ActivityTarget>{
                    Name: "ItemPenis",
                    TargetLabel: "Slap Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's penis."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/PenetrateSlow.png"
        });

        // NibbleTail
        this.PatchActivity({
            ActivityName: "Nibble",
            AddedTargets: [{
                Name: "ItemButt",
                SelfAllowed: true,
                TargetLabel: "Nibble Tail",
                TargetAction: "SourceCharacter nibbles on TargetCharacter's tail.",
                TargetSelfAction: "SourceCharacter nibbles on PronounPossessive own tail."
            },{
                Name: "ItemHead",
                SelfAllowed: false,
                TargetLabel: "Nibble Halo",
                TargetAction: "SourceCharacter nibbles on TargetCharacter's halo."
            },{
                Name: "ItemHood",
                SelfAllowed: true,
                TargetLabel: "Nibble Wing",
                TargetAction: "SourceCharacter nibbles on TargetCharacter's wing.",
                TargetSelfAction: "SourceCharacter nibbles on PronounPossessive own wing."
            }],
            RemovedPrerequisites: ["ZoneNaked"],
            AddedPrerequisites: ["CanCustomNibble"],
            CustomPrereqs: [{
                    Name: "CanCustomNibble",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemButt")
                            return !!InventoryGet(acted, "TailStraps");
                        else if (group.Name == "ItemHood")
                            return !!InventoryGet(acted, "Wings")
                        else if (group.Name == "ItemHead") 
                            return (InventoryGet(acted, "HairAccessory1")?.Asset.Name == "Halo" || InventoryGet(acted, "HairAccessory3")?.Asset.Name == "Halo")
                        else if (group.Name === "ItemVulva")
                            return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
                        else if (group.Name === "ItemVulvaPiercings")
                            return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
                        else if (group.Name === "ItemBoots")
                            return InventoryPrerequisiteMessage(acted, "NakedFeet") === "";
                        else if (group.Name === "ItemHands")
				            return InventoryPrerequisiteMessage(acted, "NakedHands") === "";
                        else
                            return true;
                    }
                }, {
                    Name: "HasWings",
                    Func: (acting, acted, group) => group.Name == "ItemHood" ? !!InventoryGet(acted, "Wings") : true
                }, {
                    Name: "HasHalo",
                    Func: (acting, acted, group) => group.Name == "ItemHead" ? (InventoryGet(acted, "HairAccessory1")?.Asset.Name == "Halo" || InventoryGet(acted, "HairAccessory3")?.Asset.Name == "Halo") : true
                }]
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
            RemovedPrerequisites: ["ZoneAccessible"],
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
                    Name: "TargetCanBePinched",
                    Func: (acting, acted, group) => {
                        let zoneAccessible = ActivityGetAllMirrorGroups(acted.AssetFamily, group.Name).some((g) => g.IsItem() ? !InventoryGroupIsBlocked(acted, g.Name, true) : true);
                        if (group.Name == "ItemEars")
                            return zoneAccessible && !this.isPlayerPinching(acted.MemberNumber ?? 0) && this.earPinchingMemberList.length < 2;
                        else if (group.Name == "ItemButt")
                            return true;
                        else
                            return zoneAccessible;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
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
            AddedTargets: [{
                Name: "ItemHood",
                SelfAllowed: false,
                TargetLabel: "Grab Horn",
                TargetAction: "SourceCharacter grabs TargetCharacter's horn."
            }],
            CustomPrereqs: [
                {
                    Name: "TargetIsArmAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemArms")
                            return !this.isPlayerGrabbing(acted.MemberNumber ?? 0);
                        return true;
                    }
                }, {
                    Name: "TargetHornAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemHood")
                            return (InventoryGet(acted, "HairAccessory2")?.Asset.Name ?? "").toLocaleLowerCase().indexOf("horn") > -1 && !this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "horn");
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemArms")
                        this.DoGrab(target, "arm");
                    else if (!!target && !!location && location == "ItemHood")
                        this.DoGrab(target, "horn");
                    return next(args);
                }
            },
        });

        // Release Arm
        this.AddActivity({
            Activity: <Activity>{
                Name: "Release",
                MaxProgress: 30,
                Prerequisite: [""]
            },
            Targets: [
                {
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetLabel: "Release Arm",
                    TargetAction: "SourceCharacter releases TargetCharacter's arm."
                },{
                    Name: "ItemHood",
                    SelfAllowed: false,
                    TargetLabel: "Release Horn",
                    TargetAction: "SourceCharacter releases TargetCharacter's horn."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsGrabbed",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemArms")
                            return this.isPlayerGrabbing(acted.MemberNumber ?? 0);
                        else if (group.Name == "ItemHood")
                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "horn");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && location == "ItemArms")
                        this.DoRelease(target, "arm");
                    else if (!!target && location == "ItemHood")
                        this.DoRelease(target, "horn");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
        });

        // PatchChoke Neck
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Choke",
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemNeck")
                        this.DoGrab(target, "neck");
                    return next(args);
                }
            },
        });

        // ReleaseNeck
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseNeck",
                MaxProgress: 30,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemNeck",
                    SelfAllowed: false,
                    TargetLabel: "Release Neck",
                    TargetAction: "SourceCharacter releases TargetCharacter's neck."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsNeckChoked",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemNeck")
                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "neck");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "neck");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Choke.png"
        });

        // Patch HandGag
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "HandGag",
            CustomPrereqs: [
                {
                    Name: "TargetNotAlreadyHandGagged",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemMouth")
                            return !this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "mouth");
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemMouth")
                        this.DoGrab(target, "mouth");
                    return next(args);
                }
            },
        });

        // ReleaseMouth
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseMouth",
                MaxProgress: 30,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: false,
                    TargetLabel: "Release Mouth",
                    TargetAction: "SourceCharacter releases TargetCharacter's mouth."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsHandGagged",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemMouth")
                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "mouth");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "mouth");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/HandGag.png"
        });

        // GrabTongueWithFoot
        this.AddActivity({
            Activity: <Activity>{
                Name: "GrabTongueWithFoot",
                MaxProgress: 75,
                MaxProgressSelf: 30,
                Prerequisite: ["ZoneAccessible", "UseFeet", "TargetCanUseTongue"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: false,
                    TargetLabel: "Stuff with Foot",
                    TargetAction: "SourceCharacter shoves PronounPossessive foot into TargetCharacter's mouth, playing with and grabbing their tongue with PronounPossessive toes."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetCanToeTongueGrab",
                    Func: (acting, acted, group) => {
                        return InventoryPrerequisiteMessage(acting, "NakedFeet") === "" && (!this.myFootInMouth || this.myFootInMouth < 0);
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoGrab(target, "mouth-with-foot");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/MassageFeet.png"
        });

        // ReleaseFootGrabbedTongue
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseFootGrabbedTongue",
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ZoneAccessible", "UseFeet"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: false,
                    TargetLabel: "Remove Foot",
                    TargetAction: "SourceCharacter removes PronounPossessive foot from TargetCharacter's mouth."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetTongueIsToeGrabbed",
                    Func: (acting, acted, group) => {
                        return this.myFootInMouth == acted.MemberNumber;
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.DoRelease(target, "mouth-with-foot");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/MassageFeet.png"
        });

        // Tug Crotch Rope
        this.AddActivity({
            Activity: <Activity>{
                Name: "Tug",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["UseHands", "ZoneAccessible", "ZoneNaked"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemPelvis",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter tugs on TargetCharacter's crotch rope.",
                    TargetSelfAction: "SourceCharacter tugs lewdly on PronounPossessive own crotch rope."
                }
            ],
            CustomPrereqs: [
                <CustomPrerequisite>{
                    Name: "HasCrotchRope",
                    Func: (acting, acted, group) => {
                        return acted.HasEffect("CrotchRope");
                    }
                }
            ],
            CustomImage: "Assets/Female3DCG/ItemPelvis/HempRope_NormalOverPanties.png"
        });
    }

    get customGagged(): boolean {
        return this.heldBy.some(h => h.Type == "tongue" || h.Type == "mouth") || this.footInMyMouth >= 0;
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

        if (!!patch.RemovedTargets) {
            patch.RemovedTargets.forEach(tgt => {
                activity!.Target = activity!.Target.filter(t => t != tgt);
                if (!!activity!.TargetSelf && Array.isArray(activity!.TargetSelf))
                    activity!.TargetSelf = activity!.TargetSelf!.filter(t => t != tgt);
            })
        }

        if (!!patch.RemovedPrerequisites) {
            patch.RemovedPrerequisites.forEach(prereq => {
                activity!.Prerequisite = activity!.Prerequisite.filter(p => p != prereq);
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
                    let gagIncrease = 2 * this.heldBy.filter(h => h.Type == "tongue" || h.Type == "mouth").length + ((this.footInMyMouth ?? -1) > -1 ? 3 : 0);
                    let currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
                    args[1].Content = SpeechGarbleByGagLevel(currentGagLevel + gagIncrease, args[1].Content);
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
                        if (this.customGagged && group?.Name == "ItemHands")
                            return this.tongueGrabbedByMember == acted.MemberNumber || this.heldBy.some(h => h.Type == "mouth" && h.Member == acted.MemberNumber);
                        else return true;
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
            if (sendType == "ChatRoomChat" && data?.Type == "Activity"){
                var activityName = GetActivityName(data);
                if (activityName == "Lick" && this.heldBy.some(h => h.Type == "tongue"))
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
            if (this.heldBy.filter(h => h.Type != "hand").length > 0)
                return false;
            return next(args);
        }, ModuleCategory.Activities);
        
        hookFunction("ChatRoomLeave", 1, (args, next) => {
            if (this.RoomAllowsLeashing) {
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
                } else if (this.customLeashedObjs.length > 0) {
                    if (this.customLeashedObjs.length == 1)
                        SendAction(`%NAME% leads %OPP_NAME% out of the room by the ${this.customLeashedObjs[0].Type}.`, getCharacter(this.customLeashedObjs[0].Member));
                    else
                        SendAction("%NAME% leads " + CharacterNickname(getCharacter(this.customLeashedObjs[0].Member)!) + " and " + CharacterNickname(getCharacter(this.customLeashedObjs[1].Member)!) + " out of the room.");
                }
            }

            if (this.myFootInMouth > -1) {
                let char = getCharacter(this.myFootInMouth);
                if (!!char)
                    this.DoRelease(char, "mouth-with-foot");
            }
            if (this.footInMyMouth > -1) {
                let char = getCharacter(this.footInMyMouth);
                if (!!char)
                    this.DoRelease(char, "mouth-with-foot");
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
                let isGrabbing = this.hands.filter(h => h.Member == C.MemberNumber);
                if (this.myFootInMouth > -1 && this.myFootInMouth == C.MemberNumber)
                    isGrabbing = isGrabbing.concat(<HandOccupant>{
                        Member: this.myFootInMouth,
                        Type: "mouth-with-foot"
                    });
                let grabbedBy = this.heldBy.filter(h => h.Member == C.MemberNumber);
                if (this.footInMyMouth > -1 && this.footInMyMouth == C.MemberNumber)
                    grabbedBy = grabbedBy.concat(<HandOccupant>{
                        Member: this.footInMyMouth,
                        Type: "mouth-with-foot"
                    });

                let grabList = isGrabbing.map(g => <OverlayGrabModel>{
                    Grab: g,
                    IsGrabber: true
                }).concat(grabbedBy.map(g => <OverlayGrabModel>{
                    Grab: g,
                    IsGrabber: false
                }));

                grabList.forEach((g, ix, arr) => {
                    let yOffset = ix * 40 * Zoom;
                    let icon = this.GetIconForGrabType(g.Grab.Type)
                    DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom + yOffset, 20 * Zoom, 1, "Black", g.IsGrabber ? "White" : "#90E4C1")
                    DrawImageResize(
                        icon,
                        CharX + 405 * Zoom, CharY + 45 * Zoom + yOffset, 30 * Zoom, 30 * Zoom
                    );
                });
            }
            return ret;
        }, ModuleCategory.Activities);

        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
            let sourceMemberNumber = args[0];
            let C = args[1];

            if (this.isCustomLeashedBy(sourceMemberNumber) && this.RoomAllowsLeashing) {
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
            if (!ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
                this.DoEscape(SenderCharacter);
            }
        }, ModuleCategory.Activities)

        hookFunction("ServerAccountBeep", 1, (args, next) => {
            next(args);
            let data = args[0];
            if (data.BeepType == "Leash" && this.customLeashedByMemberNumbers.indexOf(data.MemberNumber) > -1 && data.ChatRoomName) {
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
            this.customLeashedMemberNumbers.filter(id => currentRoomIds.indexOf(id) == -1).forEach(memberNumber => {
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

    get customLeashedObjs(): HandOccupant[] {
        return this.hands.concat(this.heldBy.filter(h => h.Type == "hand"));
    }

    get customLeashedMemberNumbers(): number[] {
        return this.customLeashedObjs.map(h => h.Member);
    }

    get customLeashedByMemberNumbers(): number[] {
        return this.heldBy.concat(this.hands.filter(h => h.Type == "hand")).map(h => h.Member);
    }

    get maxHands(): number {
        return 2;
    }

    myFootInMouth: number = -1;
    footInMyMouth: number = -1;

    addGrab(member: number, type: GrabType): HandOccupant | undefined {
        if (!member || member < 0)
            return;

        if (type == "mouth-with-foot") {
            if (!!this.myFootInMouth && this.myFootInMouth >= 0)
                return;
            this.myFootInMouth = member;
            return;
        }

        if (!!this.hands.find(h => h.Member == member && h.Type == type))
            return;

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
        else if (type == "mouth-with-foot")
            this.myFootInMouth = -1;
        else
            this.hands = this.hands.filter(h => !(h.Member == member && h.Type == type));
    }

    grabbedBy(member: number, type: GrabType): boolean {
        let sender = getCharacter(member);

        if (type == "mouth-with-foot") {    
            if (!!this.footInMyMouth && this.footInMyMouth >= 0 && !!sender)
                this.DoRelease(sender, type);
            this.footInMyMouth = member;
            return true;
        }

        if (type == "neck") {
            if (!!sender) this.collarModule.HandChoke(sender);
        }

        if (!member || member < 0 || !!this.heldBy.find(h => h.Member == member && h.Type == type))
            return false;
            
        this.heldBy.push(<HandOccupant>{
            Member: member,
            Type: type
        })

        if (type == "tongue") {
            this.prevMouth = WardrobeGetExpression(Player)?.Mouth ?? null;
            CharacterSetFacialExpression(Player, "Mouth", "Ahegao");
        }

        return true;
    }

    releasedBy(member: number, type: GrabType | undefined) {
        if (type == "mouth-with-foot" || !type) {
            if (member == this.footInMyMouth)
                this.footInMyMouth = -1;
            if (!!type)
                return;
        }
        else if (this.heldBy.filter(h => h.Member == member && h.Type == "tongue").length == 1 && (!type || type == "tongue")) {
            CharacterSetFacialExpression(Player, "Mouth", this.prevMouth);
            this.prevMouth = null;
        } else if (this.heldBy.filter(h => h.Member == member && h.Type == "neck").length == 1 && (!type || type == "neck")) {
            this.collarModule.ReleaseHandChoke(getCharacter(member), true);
        }

        if (!type)
            this.heldBy = this.heldBy.filter(h => h.Member != member);
        else
            this.heldBy = this.heldBy.filter(h => !(h.Member == member && h.Type == type));
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
        // Only bother custom grabbing other LSCG users, vanilla won't follow. Also don't do grab if room doesn't allow leashing
        if ((!this.RoomAllowsLeashing &&
            type != "mouth-with-foot") ||
            !(target as OtherCharacter).LSCG || 
            !target.MemberNumber || 
            target.MemberNumber == Player.MemberNumber)
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

    DoEscape(escapeFrom: Character) {
        if (!escapeFrom.MemberNumber)
            return;

        this.releasedBy(escapeFrom.MemberNumber, undefined);
        sendLSCGMessage(<LSCGMessageModel>{
            type: "command",
            reply: false,
            settings: null,
            target: escapeFrom.MemberNumber!,
            version: LSCG_VERSION,
            command: {
                name: "escape"
            }
        });
    }

    IncomingGrab(sender: Character, grabType: GrabType) {
        if (!!sender.MemberNumber) {
            let doNotify = this.grabbedBy(sender.MemberNumber, grabType);
            if (doNotify && grabType != "hand")
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
        if (type == "mouth-with-foot")
            LSCG_SendLocal(`${CharacterNickname(grabber)} has filled your mouth with their foot! <br>[You can try '/lscg escape' to try and escape]`);
        else
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
        let grabbingMembers = this.heldBy.filter(h => h.Type != "hand").map(h => h.Member);
        if (this.footInMyMouth >= 0)
            grabbingMembers = grabbingMembers.concat(this.footInMyMouth);
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

        SendAction(`${CharacterNickname(Player)} tries their best to escape from ${CharacterNickname(grabber)}'s grip...`);
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

    get RoomAllowsLeashing(): boolean {
        return (ChatRoomData && ChatRoomData.BlockCategory && ChatRoomData.BlockCategory.indexOf("Leashing") < 0) || !ChatRoomData;
    }

    IsCharacterGrabbedOrGrabbing(C: Character, type: GrabType) {
        if (!C.MemberNumber)
            return false;
        return this.hands.concat(this.heldBy).filter(h => h.Type == type).some(h => h.Member == C.MemberNumber);
    }

    GetIconForGrabType(type: GrabType) {
        switch (type) {
            case "mouth": return ICONS.MUTE;
            case "ear": return ICONS.EAR;
            case "hand": return ICONS.HOLD_HANDS;
            case "tongue": return ICONS.TONGUE;
            case "neck": return ICONS.NECK;
            case "mouth-with-foot": return "Icons/Management.png";
            case "horn":
            case "arm": 
            default: return "Icons/Battle.png";
        }
    }
}
