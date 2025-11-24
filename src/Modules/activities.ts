import { BaseModule } from "base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, hookFunction, ICONS, getCharacter, OnAction, callOriginal, LSCG_SendLocal, GetTargetCharacter, GetActivityName, GetMetadata, GetActivityEntryFromContent, IsActivityAllowed, sendLSCGCommand, replace_template, escapeHtml, sendLSCGMessage } from "../utils";
import { Core, getModule } from "modules";
import { ItemUseModule } from "./item-use";
import { CollarModule } from "./collar";
import { ActivitySettingsModel } from "Settings/Models/activities";
import { GuiActivities } from "Settings/activities";
import { LeashingModule } from "./leashing";
import { HypnoModule } from "./hypno";
import { StateMigrator } from "./Migrators/StateMigrator";
import { StateModule } from "./states";
import { SplatterMapping, SplatterModule } from "./splatter";
import { CommandListener } from "./core";

export interface ActivityTarget {
    Name: LSCGAssetGroupItemName;
    SelfAllowed?: boolean | false;
    SelfOnly?: boolean | false;
    TargetLabel?: string | undefined;
    TargetSelfLabel?: string | undefined;
    TargetAction: string;
    TargetSelfAction?: string | undefined;
}

export interface CustomPrerequisite {
    Name: LSCGActivityPrerequisite;
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
    Activity: LSCGActivity;
    Targets?: ActivityTarget[];
}

// >= R111
declare var DialogMenuMapping: { activities: ScreenFunctions & { ids: { grid: string } } };

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

        hookFunction("ElementButton.CreateForActivity", 0, (args, next) => {
            const activity: ItemActivity = args[1];
            if (activity.Activity.Name.includes("LSCG")) {
                args[4] ??= {};
                args[4].image = this.CustomImages.get(activity.Activity.Name);
                args[4].icons = [
                    ...(args[4].icons ?? []),
                    { name: "lscg", tooltipText: "LSCG activity", iconSrc: ICONS.BOUND_GIRL },
                ];
            }
            return next(args);
        });

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

        hookFunction("PreferenceGetActivityFactor", 0, (args, next) => {
            const [C, Type, Self] = args as [Character, ActivityName, boolean];
            const activity = AssetGetActivity(C.AssetFamily, Type);
            if (activity?.Name.startsWith("LSCG_")) {
                return 2;
            }
            return next(args);
        }, ModuleCategory.Activities);

        this.AddCommandListeners();
        this.InitTongueGrabHooks();
        this.RegisterActivities();
    }

    run(): void {
        this.collarModule = getModule<CollarModule>("CollarModule");
    }

    AddCommandListeners() {
        Core().RegisterCommandListener(<CommandListener>{
            id: "h5_ask_listener",
            command: "h5-ask",
            func: (sender: number, msg: LSCGMessageModel) => {
                let c = getCharacter(sender);
                if (!c)
                    return;
                
                let str = escapeHtml(`${CharacterNickname(c)} would like to high five you.`);
                let promptHtml = `<span>${str}</span><button style="background-color:green;border-radius:5px;margin:5px" id="h5-accept">Slap it!</button><button style="background-color:red;border-radius:5px;margin:5px" id="h5-deny">Ignore</button>`;
                if (!(Player.CanInteract() && !Player.Effect.includes("MergedFingers"))) {
                    promptHtml = `<span>${str}</span><button style="background-color:green;border-radius:5px;margin:5px" id="h5-apologize">Can't...</button><button style="background-color:red;border-radius:5px;margin:5px" id="h5-deny">Ignore</button>`;
                }
                LSCG_SendLocal(promptHtml, false, 10000);
                
                let timeout = setTimeout(() => {
                    if (!c)
                        return;
                    sendLSCGCommand(c, "h5-respond");
                    acceptEle?.remove();
                    denyEle?.remove();
                }, 12000);
                
                var acceptEle = document.getElementById("h5-accept");
                var denyEle = document.getElementById("h5-deny");
                var apologizeEle = document.getElementById("h5-apologize");

                if (!!acceptEle) {
                    acceptEle.addEventListener("click", (evt) => {
                        clearTimeout(timeout);
                        SendAction(`%NAME% raises %POSSESSIVE% hand and executes a perfect high five with %OPP_NAME%!`, c);
                        this.ExecuteHighFive(c);
                        acceptEle?.remove();
                        denyEle?.remove();
                        apologizeEle?.remove();
                    });
                }
                
                if (!!apologizeEle) {  
                    apologizeEle.addEventListener("click", (evt) => {
                        clearTimeout(timeout);
                        SendAction(`%NAME% shrugs towards %OPP_NAME% apologetically, unable to high five.`, c);
                        acceptEle?.remove();
                        denyEle?.remove();
                        apologizeEle?.remove();
                    });
                }

                if (!!denyEle) {
                    denyEle.addEventListener("click", (evt) => {
                        clearTimeout(timeout);
                        SendAction(`${CharacterNickname(Player)} ignores ${CharacterNickname(c!)}.`);
                        sendLSCGCommand(c!, "h5-respond");
                        acceptEle?.remove();
                        denyEle?.remove();
                        apologizeEle?.remove();
                    });
                }
            }
        });

        Core().RegisterCommandListener(<CommandListener>{
            id: "h5_resp_listener",
            command: "h5-respond",
            func: (sender: number, msg: LSCGMessageModel) => {
                let c = getCharacter(sender);
                if (!c)
                    return;
                
                let str = escapeHtml(`${CharacterNickname(c)} refuses to high five you. Grab them?`);
                LSCG_SendLocal(`<span>${str}</span><button style="background-color:orange;border-radius:5px;margin:5px" id="h5-grab">Grab!</button><button style="background-color:green;border-radius:5px;margin:5px" id="h5-nah">Nah</button>`, false, 10000);

                var grabEle = document.getElementById("h5-grab");
                if (!!grabEle) {
                    grabEle.addEventListener("click", (evt) => {
                        SendAction(`%NAME% grabs %OPP_NAME% by the wrist.`, c);
                        this.leashingModule.DoGrab(c, "arm");
                        grabEle?.remove();
                        leaveEle?.remove();
                    });
                }

                var leaveEle = document.getElementById("h5-nah");
                if (!!leaveEle) {
                    leaveEle.addEventListener("click", (evt) => {
                        grabEle?.remove();
                        leaveEle?.remove();
                    });
                }
            }
        });
        
        Core().RegisterCommandListener(<CommandListener>{
            id: "h5_exec_listener",
            command: "h5-execute",
            func: (sender: number, msg: LSCGMessageModel) => {
                let c = getCharacter(sender);
                if (!c)
                    return;
                
                let targetNum = msg?.command?.args?.find(a => a.name == "target")?.value ?? -1;

                if (!AudioShouldSilenceSound(c.IsPlayer() || targetNum == Player.MemberNumber))
                    AudioPlaySoundEffect("SpankSkin");
            }
        });
    }

    RegisterActivities(): void{
        // Bap
        this.AddActivity({
            Activity: {
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

        // Headbutt
        this.AddActivity({
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity:  {
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
            Activity: {
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
                }, {
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
            Activity: {
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

        // Eat
        this.AddActivity({
            Activity: {
                Name: "Eat",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["ZoneAccessible", "UseMouth", "TargetNeeds-EdibleItem"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: true,
                    TargetLabel: "Eat",
                    TargetAction: "SourceCharacter takes a big bite out of TargetCharacter's ActivityAsset.",
                    TargetSelfAction: "SourceCharacter takes a big bite out of PronounPossessive ActivityAsset."
                }
            ]
        });

        // Chew Item
        this.AddActivity({
            Activity: {
                Name: "Chew",
                MaxProgress: 50,
                MaxProgressSelf: 50,
                Prerequisite: ["ZoneAccessible", "TargetNeeds-ChewableItem"]
            },
            Targets: [
                {
                    Name: "ItemHands",
                    SelfAllowed: true,
                    TargetLabel: "Chew On",
                    TargetAction: "SourceCharacter chews on TargetCharacter's ActivityAsset.",
                    TargetSelfAction: "SourceCharacter chews on PronounPossessive ActivityAsset."
                },
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    SelfOnly: true,
                    TargetLabel: "Chew On",
                    TargetAction: "SourceCharacter chews on TargetCharacter's ActivityAsset.",
                    TargetSelfAction: "SourceCharacter chews on PronounPossessive ActivityAsset."
                }
            ]
        });

        // GrabTongue
        this.AddActivity({
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
                Name: "ReleaseEar",
                MaxProgress: 30,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemEars",
                    SelfAllowed: true,
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
            Activity: {
                Name: "Grab",
                MaxProgress: 30,
                Prerequisite: ["UseHands"],
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
                        if (group.Name == "ItemHood") {
                            let accSlots = [
                                InventoryGet(acted, "HairAccessory1"),
                                InventoryGet(acted, "HairAccessory2"),
                                InventoryGet(acted, "HairAccessory3")
                            ];
                            return accSlots.some(item => (item?.Asset.Name ?? "").toLocaleLowerCase().indexOf("horn") > -1) && !this.leashingModule.ContainsLeashing(acted.MemberNumber ?? -1, "horn");
                        }
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

        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Pull",
            CustomPrereqs: [
                {
                    Name: "TargetIsBeingPulled",
                    Func: (acting, acted, group) => {
                        if (group.Name == "ItemHead")
                            return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "hair");
                        else if (group.Name == "ItemNose")
                            return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "nose");
                        else if (group.Name == "ItemNipples")
                            return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "nipples");
                        return false;
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!target?.IsPlayer()) {
                        if (!!target && location == "ItemHead")
                            this.leashingModule.DoGrab(target, "hair");
                        else if (!!target && location == "ItemNose")
                            this.leashingModule.DoGrab(target, "nose");
                        else if (!!target && location == "ItemNipples")
                            this.leashingModule.DoGrab(target, "nipples");
                    }
                    return next(args);
                }
            }
        });

        // Release Arm/Horn/Tail
        this.AddActivity({
            Activity: {
                Name: "Release",
                MaxProgress: 30,
                Prerequisite: []
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
                },{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetLabel: "Release Hair",
                    TargetAction: "SourceCharacter lets go of TargetCharacter's hair."
                },{
                    Name: "ItemNose",
                    SelfAllowed: false,
                    TargetLabel: "Release Nose",
                    TargetAction: "SourceCharacter releases TargetCharacter's nose."
                },{
                    Name: "ItemNipples",
                    SelfAllowed: false,
                    TargetLabel: "Release Nipples",
                    TargetAction: "SourceCharacter releases TargetCharacter's nipples."
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
                        else if (group.Name == "ItemHead")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "hair");
                        else if (group.Name == "ItemNose")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "nose");
                        else if (group.Name == "ItemNipples")
                            return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "nipples");
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
                    else if (!!target && location == "ItemHead")
                        this.leashingModule.DoRelease(target, "hair");
                    else if (!!target && location == "ItemNose")
                        this.leashingModule.DoRelease(target, "nose");
                    else if (!!target && location == "ItemNipples")
                        this.leashingModule.DoRelease(target, "nipples");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Slap.png"
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
            Activity: {
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

        // Patch Collar Grab
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "CollarGrab",
            CustomPrereqs: [{
                Name: "TargetNotAlreadyCollarGrabbed",
                Func: (acting, acted, group) => {
                    return !this.leashingModule.ContainsLeashing(acted.MemberNumber!, "collar");
                }
            }],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    if (!!target && !!target.MemberNumber) {
                        this.leashingModule.DoGrab(target, "collar");
                        // Move next to player...?
                        const MoveTargetPos = ChatRoomCharacter.findIndex(c => c.MemberNumber === target.MemberNumber);
                        if (MoveTargetPos >= 0) {
                            const Pos = ChatRoomCharacter.findIndex(c => c.MemberNumber === Player.MemberNumber);
                            if (Pos < MoveTargetPos) {
                                for (let i = 0; i < (MoveTargetPos - Pos) - 1; i++) {
                                    ServerSend("ChatRoomAdmin", {
                                        MemberNumber: target.MemberNumber,
                                        Action: "MoveLeft",
                                        Publish: i === 0
                                    });
                                }
                            } else {
                                for (let i = 0; i < (Pos - MoveTargetPos) - 1; i++) {
                                    ServerSend("ChatRoomAdmin", {
                                        MemberNumber: target.MemberNumber,
                                        Action: "MoveRight",
                                        Publish: i === 0
                                    });
                                }
                            }
                        }
                    }
                    return next(args);
                }
            },
        });

        // ReleaseNeck
        this.AddActivity({
            Activity: {
                Name: "ReleaseCollar",
                MaxProgress: 30,
                Prerequisite: ["ZoneAccessible", "UseHands"]
            },
            Targets: [
                {
                    Name: "ItemNeck",
                    SelfAllowed: true,
                    TargetLabel: "Release Collar",
                    TargetAction: "SourceCharacter releases TargetCharacter's collar.",
                    TargetSelfAction: "SourceCharacter releases PronounPossessive own collar."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "TargetIsCollarGrabbed",
                    Func: (acting, acted, group) => {
                        return this.leashingModule.ContainsLeashing(acted.MemberNumber!, "collar");
                    }
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    if (!!target)
                        this.leashingModule.DoRelease(target, "collar");
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Slap.png"
        });

        // Patch HandGag
        this.PatchActivity(<ActivityPatch>{
            ActivityName: "HandGag",
            AddedTargets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: true,
                    TargetLabel: "Clamp Hand over Eyes",
                    TargetAction: "SourceCharacter clamps PronounPossessive hand over TargetCharacter's eyes.",
                    TargetSelfAction: "SourceCharacter clamps PronounPossessive hand over PronounPossessive own eyes."
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
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
            Activity: {
                Name: "ReleaseChomp",
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: [],
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

        // SwallowLoad
        this.AddActivity({
            Activity: {
                Name: "SwallowLoad",
                MaxProgress: 75,
                MaxProgressSelf: 30,
                Prerequisite: ["ZoneAccessible", "TargetCanUseTongue"]
            },
            Targets: [
                {
                    Name: "ItemMouth",
                    SelfAllowed: true,
                    SelfOnly: true,
                    TargetLabel: "Swallow",
                    TargetAction: "SourceCharacter gulps and swallows."
                }
            ],
            CustomPrereqs: [
                {
                    Name: "SourceCanSwallowSplatter",
                    Func: (acting, acted, group): boolean => {
                        if (acting.MemberNumber != acted.MemberNumber)
                            return false;
                        
                        return getModule<SplatterModule>("SplatterModule")?.IsSplatInMouth(acting);
                    }
                }
            ],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        getModule<SplatterModule>("SplatterModule")?.ClearSplatInMouth(Player);
                    return next(args);
                }
            },
            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
        });

        this.PatchActivity(<ActivityPatch>{
            ActivityName: "Lick",
            AddedTargets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetLabel: "Lick Forehead",
                    TargetAction: "SourceCharacter licks TargetCharacter's forehead."
                }
            ],
            CustomAction: <CustomAction>{
                Func: (target, args, next) => {
                    var location = GetMetadata(args[1])?.GroupName;
                    var splatter = getModule<SplatterModule>("SplatterModule");
                    if (!!splatter) {
                        switch (location) {
                            case "ItemMouth":
                                splatter.AddSplatInMouth(Player, target, "mouth");
                                break;
                            case "ItemHead":
                                splatter.AddSplatInMouth(Player, target, "forehead");
                                break;
                            case "ItemBreast":
                                splatter.AddSplatInMouth(Player, target, "chest");
                                break;
                            case "ItemNipples":
                            case "ItemNipplesPiercings":
                                splatter.AddSplatInMouth(Player, target, "nipples");
                                break;
                            case "ItemPelvis":
                                splatter.AddSplatInMouth(Player, target, "tummy");
                                break;
                            case "ItemVulva":
                            case "ItemVulvaPiercings":
                                splatter.AddSplatInMouth(Player, target, "crotch");
                                break;
                            case "ItemButt":
                                splatter.AddSplatInMouth(Player, target, "ass");
                                break;
                            default:
                                break;
                        }
                    }
                    return next(args);
                }
            },
        });

        // High Five!
		this.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "HighFive" as ActivityName,
				MaxProgress: 50,
				MaxProgressSelf: 50,
				Prerequisite: ["UseHands"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemHands",
					TargetLabel: "High Five!",
					TargetAction: "SourceCharacter holds PronounPossessive hand up towards TargetCharacter expectantly...",
                    TargetSelfAction: "SourceCharacter holds PronounPossessive hand in the air, slapping it with the other.",
					SelfAllowed: true
				}
			],
            CustomPrereqs: [
                {
                    Name: "CanHighFive",
                    Func: (acting, acted, group): boolean => {
                        return (acted.CanInteract() && !acted.Effect.includes("MergedFingers"))
                    }
                }
            ],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
                    if (target.IsPlayer()) {
                        this.ExecuteHighFive(null);
                        next(args);
                    }
                    else if (this.isPlayerGrabbing(target.MemberNumber ?? -1)) {
                        SendAction(`%NAME% holds %OPP_NAME_POSSESSIVE_DIRECT% arm up and slaps it in a forced high five!`, target);
                        this.ExecuteHighFive(target);
                    } else {
                        this.TryHighFive(target);
                        next(args);
                    }
				}
			},
			CustomImage: "Assets/Female3DCG/Activity/Spank.png"
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

    RegisterCustomFuncs(bundle: ActivityBundleBase, activity: LSCGActivity) {
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
        const activity = ActivityFemale3DCG.find(a => a.Name == patch.ActivityName) as LSCGActivity;
        if (!activity)
            return;

        if (!!patch.AddedTargets) {
            patch.AddedTargets.forEach(tgt => {
                this.AddTargetToActivity(activity, tgt);
            });
        }

        if (!!patch.RemovedTargets) {
            patch.RemovedTargets.forEach(tgt => {
                if (Array.isArray(activity.Target))
                    activity.Target = activity.Target.filter(t => t != tgt);
                if (Array.isArray(activity.TargetSelf))
                    activity.TargetSelf = activity.TargetSelf.filter(t => t != tgt);
            })
        }

        if (!!patch.RemovedPrerequisites) {
            patch.RemovedPrerequisites.forEach(prereq => {
                activity.Prerequisite = activity!.Prerequisite.filter(p => p != prereq);
            });
        }

        this.RegisterCustomFuncs(patch, activity!);

        this.PatchedActivities.push(patch.ActivityName);
    }

    AddTargetToActivity(activity: LSCGActivity, tgt: ActivityTarget) {
        tgt.TargetLabel = tgt.TargetLabel ?? activity.Name.substring(5);

        if (tgt.SelfAllowed) {
            if (!activity.TargetSelf)
                activity.TargetSelf = [];
            if (typeof activity.TargetSelf != "boolean" && (activity.TargetSelf).indexOf(tgt.Name) == -1) {
                activity.TargetSelf.push(tgt.Name);
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
        activity.Name = "LSCG_" + activity.Name as ActivityName;

        this.RegisterCustomFuncs(bundle, bundle.Activity);

        ActivityDictionary?.push([
            "Activity"+activity.Name,
            bundle.Targets[0].TargetLabel ?? activity.Name.substring(5)
        ])

        bundle.Targets.forEach(tgt => {
            this.AddTargetToActivity(activity, tgt);
        });

        ActivityFemale3DCG.push(activity as Activity);
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

    TryHighFive(target: Character) {
		sendLSCGCommand(target, "h5-ask");
	}

    ExecuteHighFive(target: Character | null) {
        if (!!target)
            sendLSCGMessage(<LSCGMessageModel>{
                reply: false,
                type: "broadcast",
                command: {
                    name: "h5-execute",
                    args: [
                        {
                            name: "target",
                            value: target.MemberNumber
                        }
                    ]
                }
            });
    }
}