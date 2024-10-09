import { BaseModule } from "base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, hookFunction, ICONS, getCharacter, OnAction, callOriginal, LSCG_SendLocal, GetTargetCharacter, GetActivityName, GetMetadata, GetActivityEntryFromContent, IsActivityAllowed, sendLSCGCommand, replace_template } from "../utils";
import { getModule } from "modules";
import { ItemUseModule } from "./item-use";
import { CollarModule } from "./collar";
import { ActivitySettingsModel } from "Settings/Models/activities";
import { GuiActivities } from "Settings/activities";
import { LeashingModule } from "./leashing";
import { HypnoModule } from "./hypno";
import { StateMigrator } from "./Migrators/StateMigrator";
import { StateModule } from "./states";

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
                    sleep: false,
                    hypnoRequiredRepeats: 2,
                    hypnoThreshold: 50,
                    orgasm: false,
                    orgasmThreshold: 75,
                }
            ],
            stats: {}
        };
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
            if (!this.Enabled)
                return;
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
                    else {
                        if (!!Player.ArousalSettings) Player.ArousalSettings.Progress = 100;
                        ActivityOrgasmPrepare(Player);
                    }
                }
                if (activityEntry?.sleep && !getModule<StateModule>("StateModule")?.SleepState.Active) {
                    getModule<HypnoModule>("HypnoModule")?.DelayedTrigger(activityEntry, sender?.MemberNumber, true);
                }
            }
        })

        hookFunction("DrawImageResize", 1, (args, next) => {
            try {
                var path = <string>args[0];
                if (!!path && (typeof path === "string") && path.indexOf("LSCG_") > -1) {
                    var activityName = path.substring(path.indexOf("LSCG_"));
                    activityName = activityName.substring(0, activityName.indexOf(".png"))
                    if (this.CustomImages.has(activityName))
                        args[0] = this.CustomImages.get(activityName);
                }
            } catch (error) {
                console.debug(error);
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
                    TargetAction: "SourceCharacter baps TargetCharacter."
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
                },<ActivityTarget>{
                    Name: "ItemPelvis",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles snugly into TargetCharacter."
                },<ActivityTarget>{
                    Name: "ItemLegs",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles against TargetCharacter's thigh."
                },<ActivityTarget>{
                    Name: "ItemFeet",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles along TargetCharacter's leg."
                },<ActivityTarget>{
                    Name: "ItemBoots",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter nuzzles under TargetCharacter's feet."
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
                    TargetAction: "SourceCharacter flops on top of TargetCharacter."
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
                    TargetAction: "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's penis."
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
            RemovedPrerequisites: ["ZoneNaked", "ZoneAccessible"],
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
                    Name: "CustomNibbleAccessible",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemButt")
                            return true;
                        else
                            return ActivityGetAllMirrorGroups(acted.AssetFamily, group.Name).some((g) => g.IsItem() ? !InventoryGroupIsBlocked(acted, g.Name, true) : true)
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
                    Func: (acting, acted, group) => InventoryPrerequisiteMessage(acting, "AccessButt") === "" && 
                        !(acting.IsPlugged() || acting.IsButtChaste() &&
                        !InventoryGroupIsBlocked(acting, "ItemButt", true))
                }
            ],
            CustomImage: ICONS.ASS
        });

        // Suck
        this.AddActivity({
            Activity: <Activity>{
                Name: "Suck",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "UseTongue", "Needs-FellatioItem"]
            },
            Targets: [
                {
                    Name: "ItemVulva",
                    SelfAllowed: false,
                    TargetLabel: "Suck",
                    TargetAction: "SourceCharacter wraps PronounPossessive lips around TargetCharacter's ActivityAsset and sucks."
                }, {
                    Name: "ItemPenis",
                    SelfAllowed: false,
                    TargetLabel: "Suck",
                    TargetAction: "SourceCharacter wraps PronounPossessive lips around TargetCharacter's ActivityAsset and sucks."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // Throat
        this.AddActivity({
            Activity: <Activity>{
                Name: "Throat",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "UseTongue", "Needs-FellatioItem"]
            },
            Targets: [
                {
                    Name: "ItemVulva",
                    SelfAllowed: false,
                    TargetLabel: "Deepthroat",
                    TargetAction: "SourceCharacter takes TargetCharacter's ActivityAsset deep down PronounPossessive throat."
                }, {
                    Name: "ItemPenis",
                    SelfAllowed: false,
                    TargetLabel: "Deepthroat",
                    TargetAction: "SourceCharacter takes TargetCharacter's ActivityAsset deep down PronounPossessive throat."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // Suck-Handheld
        this.AddActivity({
            Activity: <Activity>{
                Name: "SuckHandheld",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "UseTongue", "Needs-FellatioItem"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: true,
                    TargetLabel: "Suck",
                    TargetAction: "SourceCharacter wraps PronounPossessive lips around TargetCharacter's ActivityAsset and sucks.",
                    TargetSelfAction: "SourceCharacter wraps PronounPossessive lips around PronounPossessive own ActivityAsset and sucks."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // Throat-Handheld
        this.AddActivity({
            Activity: <Activity>{
                Name: "ThroatHandheld",
                MaxProgress: 100,
                MaxProgressSelf: 100,
                Prerequisite: ["ZoneAccessible", "UseTongue", "Needs-FellatioItem"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: true,
                    TargetLabel: "Deepthroat",
                    TargetAction: "SourceCharacter takes TargetCharacter's ActivityAsset deep down PronounPossessive throat.",
                    TargetSelfAction: "SourceCharacter takes PronounPossessive own ActivityAsset deep down PronounPossessive throat."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // Eat
        this.AddActivity({
            Activity: <Activity>{
                Name: "Eat",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["ZoneAccessible", "UseMouth", "Needs-EdibleItem"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    SelfOnly: true,
                    TargetLabel: "Eat",
                    TargetAction: "SourceCharacter takes a big bite out of TargetCharacter's ActivityAsset.",
                    TargetSelfAction: "SourceCharacter takes a big bite out of PronounPossessive ActivityAsset."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Bite.png"
        });

        // Chew Item
        this.AddActivity({
            Activity: <Activity>{
                Name: "Chew",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["ZoneAccessible", "Needs-ChewableItem"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    SelfOnly: true,
                    TargetLabel: "Chew On",
                    TargetAction: "SourceCharacter chews on TargetCharacter's ActivityAsset.",
                    TargetSelfAction: "SourceCharacter chews on PronounPossessive ActivityAsset."
                }
            ],
            CustomImage: "Assets/Female3DCG/Activity/Bite.png"
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
                        return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "tongue");
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoGrab(target, "tongue");
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
                        return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "tongue");
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoRelease(target, "tongue");
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
                        return !this.isHandLeashed(acted) && InventoryGet(acted, "ItemHands") == null && this.leashingModule.usingHandsCount < 2;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoGrab(target, "hand");
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
                        this.leashingModule.DoRelease(target, "hand");
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
                            return zoneAccessible && !this.isPlayerPinching(acted.MemberNumber ?? 0) && this.leashingModule.usingHandsCount < 2;
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
                        this.leashingModule.DoGrab(target, "ear");
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
                        this.leashingModule.DoRelease(target, "ear");
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
                            return !this.isPlayerGrabbing(acted.MemberNumber ?? 0);
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemArms")
                        this.leashingModule.DoGrab(target, "arm");
                    return next(args);
                }
            },
        });

        // Grab Tail
        this.AddActivity({
            Activity: <Activity>{
                Name: "Grab",
                MaxProgress: 30,
                Prerequisite: [""]
            },
            Targets: [
                {
                    Name: "ItemHood",
                    SelfAllowed: false,
                    TargetLabel: "Grab Horn",
                    TargetAction: "SourceCharacter grabs TargetCharacter's horn."
                },{
                    Name: "ItemButt",
                    SelfAllowed: false,
                    TargetLabel: "Grab Tail",
                    TargetAction: "SourceCharacter grabs TargetCharacter's tail."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetHornAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemHood")
                            return (InventoryGet(acted, "HairAccessory2")?.Asset.Name ?? "").toLocaleLowerCase().indexOf("horn") > -1 && !this.leashingModule.ContainsLeashing(acted.MemberNumber ?? -1, "horn");
                        return true;
                    }
                },{
                    Name: "TargetTailAvailable",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemButt")
                            return (InventoryGet(acted, "TailStraps")?.Asset.Name ?? "").toLocaleLowerCase().indexOf("tail") > -1 && !this.leashingModule.ContainsLeashing(acted.MemberNumber ?? -1, "tail");
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemHood")
                        this.leashingModule.DoGrab(target, "horn");
                    else if (!!target && !!location && location == "ItemButt")
                        this.leashingModule.DoGrab(target, "tail");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
        });

        // Release Arm/Horn/Tail
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
                },{
                    Name: "ItemButt",
                    SelfAllowed: false,
                    TargetLabel: "Release Tail",
                    TargetAction: "SourceCharacter releases TargetCharacter's tail."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsGrabbed",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemArms")
                            return this.isPlayerGrabbing(acted.MemberNumber ?? 0);
                        else if (group.Name == "ItemHood")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "horn");
                        else if (group.Name == "ItemButt")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "tail");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && location == "ItemArms")
                        this.leashingModule.DoRelease(target, "arm");
                    else if (!!target && location == "ItemHood")
                        this.leashingModule.DoRelease(target, "horn");
                    else if (!!target && location == "ItemButt")
                        this.leashingModule.DoRelease(target, "tail");
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
                        this.leashingModule.DoGrab(target, "neck");
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
                    SelfAllowed: true,
                    TargetLabel: "Release Neck",
                    TargetAction: "SourceCharacter releases TargetCharacter's neck.",
                    TargetSelfAction: "SourceCharacter releases PronounPossessive own neck."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsNeckChoked",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemNeck")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "neck");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoRelease(target, "neck");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Choke.png"
        });

        // Patch HandGag
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "HandGag",
            AddedTargets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: true,
                    TargetLabel: "Clamp Hand over Eyes",
                    TargetAction: "SourceCharacter clamps her hand over TargetCharacter's eyes.",
                    TargetSelfAction: "SourceCharacter clamps her hand over PronounPossessive own eyes."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetNotAlreadyHandGagged",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemMouth")
                            return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "mouth");
                        else if (group.Name == "ItemHead")
                            return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "eyes");
                        return true;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemMouth")
                        this.leashingModule.DoGrab(target, "mouth");
                    if (!!target && !!location && location == "ItemHead")
                        this.leashingModule.DoGrab(target, "eyes");
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
                    SelfAllowed: true,
                    TargetLabel: "Release Mouth",
                    TargetAction: "SourceCharacter releases TargetCharacter's mouth.",
                    TargetSelfAction: "SourceCharacter releases PronounPossessive own mouth."
                }, {
                    Name: "ItemHead",
                    SelfAllowed: true,
                    TargetLabel: "Release Eyes",
                    TargetAction: "SourceCharacter removes their hand from TargetCharacter's eyes.",
                    TargetSelfAction: "SourceCharacter pulls their hand away from PronounPossessive eyes."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsHandGagged",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemMouth")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "mouth");
                        if (group.Name == "ItemHead")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "eyes");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!location && location == "ItemMouth")
                        this.leashingModule.DoRelease(target, "mouth");
                    if (!!target && !!location && location == "ItemHead")
                        this.leashingModule.DoRelease(target, "eyes");
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
                        return InventoryPrerequisiteMessage(acting, "NakedFeet") === "" && !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "mouth-with-foot");
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoGrab(target, "mouth-with-foot");
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
                        return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "mouth-with-foot");
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoRelease(target, "mouth-with-foot");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/MassageFeet.png"
        });

        // Tug Crotch Rope
        this.AddActivity({
            Activity: <Activity>{
                Name: "Tug",
                MaxProgress: 99,
                MaxProgressSelf: 99,
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
            CustomImage: "Assets/Female3DCG/ItemPelvis/HempRope_Normal_typed1.png"
        });

        // Flick
        this.AddActivity({
            Activity: <Activity>{
                Name: "Flick",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["UseHands", "ZoneAccessible"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemEars",
                    TargetLabel: "Flick Ear",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's ear.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own ear."
                }, <ActivityTarget>{
                    Name: "ItemNose",
                    TargetLabel: "Flick Nose",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's nose.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own nose."
                }, <ActivityTarget>{
                    Name: "ItemNipples",
                    TargetLabel: "Flick Nipple",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's nipple.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own nipple."
                }, <ActivityTarget>{
                    Name: "ItemButt",
                    TargetLabel: "Flick Butt",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's butt.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own butt."
                }, <ActivityTarget>{
                    Name: "ItemBoots",
                    TargetLabel: "Flick Foot",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks the bottom of TargetCharacter's feet.",
                    TargetSelfAction: "SourceCharacter flicks the bottom of PronounPossessive feet."
                }, <ActivityTarget>{
                    Name: "ItemHead",
                    TargetLabel: "Flick Forehead",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's forehead.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own forehead."
                }, <ActivityTarget>{
                    Name: "ItemNeck",
                    TargetLabel: "Flick Neck",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's neck.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own neck."
                }, <ActivityTarget>{
                    Name: "ItemLegs",
                    TargetLabel: "Flick Thigh",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's thigh.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own thigh."
                }, <ActivityTarget>{
                    Name: "ItemFeet",
                    TargetLabel: "Flick Leg",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's leg.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own leg."
                }, <ActivityTarget>{
                    Name: "ItemVulvaPiercings",
                    TargetLabel: "Flick Clitoris",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's clitoris.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own clitoris."
                }, <ActivityTarget>{
                    Name: "ItemGlans",
                    TargetLabel: "Flick Balls",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's balls.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own balls."
                }, <ActivityTarget>{
                    Name: "ItemVulva",
                    TargetLabel: "Flick Pussy",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's pussy.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own pussy."
                }, <ActivityTarget>{
                    Name: "ItemPenis",
                    TargetLabel: "Flick Penis",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter flicks TargetCharacter's penis.",
                    TargetSelfAction: "SourceCharacter flicks PronounPossessive own penis."
                }
            ],
            CustomPrereqs: [{
                Name: "CanCustomFlick",
                Func: (acting, acted, group) => {
                    if (group.Name === "ItemBoots")
                        return InventoryPrerequisiteMessage(acted, "NakedFeet") === "";
                    else if (group.Name === "ItemVulvaPiercings")
                        return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
                    else if (group.Name === "ItemVulva")
                            return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
                    else
                        return true;
                }
            }],
            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
        });

        // Chomp
        this.AddActivity({
            Activity: <Activity>{
                Name: "Chomp",
                MaxProgress: 60,
                MaxProgressSelf: 60,
                Prerequisite: ["ZoneAccessible", "UseMouth"]
            },
            Targets: [
                {
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetLabel: "Chomp on Arm",
                    TargetAction: "SourceCharacter chomps down on TargetCharacter's arm and doesn't let go."
                }, {
                    Name: "ItemFeet",
                    SelfAllowed: false,
                    TargetLabel: "Chomp on Leg",
                    TargetAction: "SourceCharacter chomps down on TargetCharacter's leg and doesn't let go."
                }, {
                    Name: "ItemButt",
                    SelfAllowed: false,
                    TargetLabel: "Chomp on Butt",
                    TargetAction: "SourceCharacter chomps down on TargetCharacter's butt and doesn't let go."
                }, {
                    Name: "ItemNeck",
                    SelfAllowed: false,
                    TargetLabel: "Chomp on Neck",
                    TargetAction: "SourceCharacter chomps down on TargetCharacter's neck and doesn't let go."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "CanChomp",
                    Func: (acting, acted, group) => {
                        return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "chomp");
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target) {
                        this.leashingModule.DoGrab(target, "chomp");
                    }
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Bite.png"
        });

        // ReleaseChomp
        this.AddActivity({
            Activity: <Activity>{
                Name: "ReleaseChomp",
                MaxProgress: 20,
                MaxProgressSelf: 20
            },
            Targets: [
                {
                    Name: "ItemArms",
                    SelfAllowed: false,
                    TargetLabel: "Release Chomp",
                    TargetAction: "SourceCharacter releases PronounPossessive chomp on TargetCharacter."
                }, {
                    Name: "ItemFeet",
                    SelfAllowed: false,
                    TargetLabel: "Release Chomp",
                    TargetAction: "SourceCharacter releases PronounPossessive chomp on TargetCharacter."
                }, {
                    Name: "ItemButt",
                    SelfAllowed: false,
                    TargetLabel: "Release Chomp",
                    TargetAction: "SourceCharacter releases PronounPossessive chomp on TargetCharacter."
                }, {
                    Name: "ItemNeck",
                    SelfAllowed: false,
                    TargetLabel: "Release Chomp",
                    TargetAction: "SourceCharacter releases PronounPossessive chomp on TargetCharacter."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "IsChomping",
                    Func: (acting, acted, group) => {
                        return getModule<LeashingModule>("LeashingModule")?.Pairings.find(p => p.IsSource && p.Type == "chomp")?.PairedMember == acted.MemberNumber;
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target) {
                        this.leashingModule.DoRelease(target, "chomp");
                    }
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        // Erect Penis Detection...
        this.PatchActivitiesForErectionCheck();
    }

    get customGagged(): boolean {
        return this.leashingModule.IsCustomGagged
    };
    prevMouth: ExpressionName | null = null;

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Activities);
    }

    get leashingModule(): LeashingModule {
        return getModule<LeashingModule>("LeashingModule");
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
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Bite",
            CustomPrereqs: [
                <CustomPrerequisite>{
                    Name: "CheckTongueGrabbing",
                    Func: (acting, acted, group) => {
                        if (this.customGagged && group?.Name == "ItemHands")
                            return this.leashingModule.IsLeashedByType(acted.MemberNumber!, "tongue") || this.leashingModule.IsLeashedByType(acted.MemberNumber!, "mouth");
                        else return true;
                    }
                }
            ]
        });
    }

    isCustomLeashedBy(sourceMember: number) {
        return this.leashingModule.IsLeashedBy(sourceMember);
    }

    isPlayerHoldingHandsWith(holdingMemberNumber: number) {
        return this.leashingModule.ContainsLeashing(holdingMemberNumber, "hand");
    }
    
    isPlayerPinchedBy(member: number) {
        return this.leashingModule.IsLeashedByType(member, "ear");
    }

    isPlayerPinching(member: number) {
        return this.leashingModule.ContainsLeashing(member, "ear");
    }

    isPlayerGrabbing(member: number) {
        return this.leashingModule.ContainsLeashing(member, "arm");
    }

    isHandLeashed(C: Character | null) {
        return getModule<LeashingModule>("LeashingModule")?.Pairings.some(p => p.Type == "hand" && (!C || p.PairedMember == C.MemberNumber));
    }

    PatchActivitiesForErectionCheck() {
        new Map(
            [
                ["Sit", ["ItemLegs"]],
                ["RestHead", ["ItemLegs"]],
                ["Rub", ["ItemTorso"]],
                ["Caress", ["ItemVulva", "ItemVulvaPiercings"]],
                ["Kiss", ["ItemVulva", "ItemVulvaPiercings"]],
                ["Slap", ["ItemVulva", "ItemVulvaPiercings"]],
                ["Scratch", ["ItemVulva", "ItemVulvaPiercings"]],
                ["Kick", ["ItemVulva", "ItemVulvaPiercings"]],
            ]
        ).forEach((locations, activityName, map) => {
            this.PatchActivity(<ActivityPatch>{
                ActivityName: activityName,
                CustomAction: <CustomAction>{
                    Func: (target, args, next) => this.CheckForErectionCustomAction(target, args, next, locations ?? ["ItemPenis"])
                },
            });
        });
    }

    CheckForErectionCustomAction(target: Character | null, args: any[], next: (args: any[]) => any, allowedLocations: string[]): any {
        if (Player.LSCG.GlobalModule.erectionDetection) {
            var location = GetMetadata(args[1])?.GroupName;
            if (!!target && !!location && allowedLocations.some(loc => loc == location))
                this.CheckForErection(target);
        }
        return next(args);
    }

    CheckForErection(target: Character) {
        let isChastity = target.IsVulvaChaste();
        let isClothed = InventoryPrerequisiteMessage(target, "AccessCrotch") === "RemoveClothesForItem";
        if (target.HasPenis() && 
        isClothed &&
        (WardrobeGetExpression(target)?.Pussy ?? "") == "Hard") {
            if (!isChastity) {
                LSCG_SendLocal(`You can feel ${CharacterNickname(target)}'s erect penis through their clothes.`);
            } else {
                LSCG_SendLocal(`You can feel something hard under ${CharacterNickname(target)}'s clothes.`);
            }
        }
    }
}
