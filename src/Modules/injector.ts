import { BaseModule } from "base";
import { BrainwashMiniGame } from "MiniGames/Brainwash";
import { registerMiniGame } from "MiniGames/minigames";
import { SleepyMiniGame, SleepyMiniGameOptions } from "MiniGames/Sleepy";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { InjectorSettingsModel } from "Settings/Models/injector";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, isPhraseInString, settingsSave, hookFunction, ICONS } from "../utils";
import { ActivityBundle, ActivityModule, CustomAction, CustomPrerequisite } from "./activities";
import { HypnoModule } from "./hypno";
import { MiscModule } from "./misc";

export class InjectorModule extends BaseModule {
    
    sleepyGame: SleepyMiniGame = registerMiniGame(new SleepyMiniGame(this));
    brainWashGame: BrainwashMiniGame = registerMiniGame(new BrainwashMiniGame(this));

    hypnoModule: HypnoModule | undefined;
    activityModule: ActivityModule | undefined;

    get defaultSettings() {
        return <InjectorSettingsModel>{
            enabled: false,
            sedativeKeywords: ["tranquilizer","sedative"],
            mindControlKeywords: ["mind control", "hypnotizing"],
            hornyKeywords: ["horny", "aphrodisiac"],
            cureKeywords: ["antidote", "healing", "curing"],
            netgunKeywords: ["net gun", "netgun"],
            netgunIsChaotic: false,
            tickLength: 5000,
            sedativeCooldown: 120000, // 2 minutes
            mindControlCooldown: 120000, // 2 minutes
            hornyCooldown: 300000 // 5 minutes
        };
    }

    get settings(): InjectorSettingsModel {
		if (!this.settingsStorage) return {} as InjectorSettingsModel;
		return (<any>Player.LSCG)[this.settingsStorage];
	}

    load(): void {
        var d = this.defaultSettings;
        this.settings.sedativeKeywords = d.sedativeKeywords;
        this.settings.mindControlKeywords = d.mindControlKeywords;
        this.settings.hornyKeywords = d.hornyKeywords;
        this.settings.cureKeywords = d.cureKeywords;
        this.settings.netgunKeywords = d.netgunKeywords;
        this.settings.tickLength = d.tickLength;
        this.settings.sedativeCooldown = d.sedativeCooldown;
        settingsSave();

        OnActivity(10, ModuleCategory.Injector, (data, sender, msg, megadata) => {
            var activityName = data.Dictionary[3]?.ActivityName;
            var target = data.Dictionary.find((d: { Tag: string; }) => d.Tag == "TargetCharacter")?.MemberNumber;
            if (target == Player.MemberNumber && activityName == "Inject" && !!sender) {
                var location = <AssetGroupItemName>data.Dictionary[2]?.FocusGroupName;
                this.ProcessInjection(sender, location);
            } else if (target == Player.MemberNumber) {
                if (data.Content == "ChatOther-ItemNose-Pet") {
                    if (this.asleep) this.Wake();
                    if (this.brainwashed) this.SnapBack();
                }
            }
        });

        this.InitializeRestrictiveHooks();

        (<any>window).LSCG_InjectEnd_Sedative = () => this.MiniGameEnd("sedative", MiniGameVictory);
        (<any>window).LSCG_InjectEnd_Brainwash = () => this.MiniGameEnd("mindcontrol", MiniGameVictory);

        this.sedativeCooldownInterval = setInterval(() => this.SedativeCooldown(), this.settings.sedativeCooldown);
        this.mindControlCooldownInterval = setInterval(() => this.MindControlCooldown(), this.settings.mindControlCooldown);
        this.hornyCooldownInterval = setInterval(() => this.HornyCooldown(), this.settings.hornyCooldown);
    }

    run(): void {
        this.hypnoModule = getModule<HypnoModule>("HypnoModule");
        this.activityModule = getModule<ActivityModule>("ActivityModule");

        if (!!this.activityModule) {
            this.activityModule.AddActivity({
                Activity: <Activity>{
                    Name: "NetGun",
                    MaxProgress: 50,
                    MaxProgressSelf: 50,
                    Prerequisite: ["UseHands"]
                },
                Targets: [
                    {
                        Name: "ItemArms",
                        SelfAllowed: true,
                        TargetLabel: "Shoot Netgun",
                        TargetAction: "SourceCharacter takes aim at TargetCharacter with their net gun.",
                        TargetSelfAction: "SourceCharacter turns their netgun on themselves!"
                    }
                ],
                CustomPrereqs: [
                    {
                        Name: "HasNetgun",
                        Func: (acting, acted, group) => {
                            return this.Enabled && this.HasNetgun(acting);
                        }
                    }, {
                        Name: "DevicesSlotIsFree",
                        Func: (acting, acted, group) => {
                            return !InventoryGet(acted, "ItemDevices");
                        }
                    }
                ],
                CustomAction: <CustomAction>{
                    Func: (target, args, next) => {
                        if (!!target) {
                            // if (target.MemberName != Player.MemberNumber) {
                            // 	SendAction("%NAME% takes aim at %OPP_NAME% with %POSSESSIVE% net gun.", target);
                            // 	setTimeout(() => this.ShootNetgun(target), 5000);
                            // } else {
                            // 	SendAction("%NAME% turns %POSSESSIVE% netgun on themselves!", target);
                            // 	this.ShootNetgun(target)
                            // }
                            setTimeout(() => this.ShootNetgun(target), 5000);
                            return next(args);
                        }
                        else return next(args);
                    }
                },
                CustomImage: "Assets/Female3DCG/ItemDevices/Preview/Net.png"
            });
        }

        this.activityModule.AddCustomPrereq(<CustomPrerequisite>{
            Name: "InjectorIsNotNetgun", 
            Func: (acting, acted, group) => !this.HasNetgun(acting)
        });
        var injectActivity = ActivityFemale3DCG.find(act => act.Name == "Inject");
        injectActivity?.Prerequisite.push("InjectorIsNotNetgun");
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Injector);
    }

    InitializeRestrictiveHooks() {
        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.Enabled)
                return next(args);
            
            var type = args[0];
            // Prevent speech while asleep
            if ((type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "(")) {
                if (this.asleep) {
                    this.ActivateSleepEvent();
                    return null;
                } else if (this.brainwashed) {
                    this.ActivateBrainwashEvent();
                    return null;
                }
            }
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('Player.CanChangeOwnClothes', 1, (args, next) => {
            if (this.Enabled && this.asleep)
                return false;
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('Player.IsDeaf', 1, (args, next) => {
            if (this.Enabled && this.asleep)
                return true;
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('Player.IsBlind', 1, (args, next) => {
            if (this.Enabled && this.asleep)
                return true;
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Enabled && (this.asleep || this.brainwashed))
                return false;
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
            if (this.Enabled && this.asleep) {
                ChatRoomSendLocal("Character access blocked while drugged asleep. Current level of sedative: " + this.sedativeLevel, 5000);
                return;
            }
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hornyLevel > 0 || this.brainwashed) return true;
            return next(args);
        }, ModuleCategory.Injector);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.brainwashed) return [{r: 148, g: 0, b: 211, a: 0.4}];
            else if (this.hornyLevel > 0) return [{r: 254, g: 44, b: 84, a: (this.hornyLevel/(this.hornyLevelMax*2))}];
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.brainwashed) return 3;
            else if (this.hornyLevel > 0) return this.hornyLevel - 1;
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('TimerProcess', 1, (args, next) => {
            if (ActivityAllowed() && this.hornyLevel > 0 && this.hornyLastBumped + 5000 < CurrentTime) {
                this.hornyLastBumped = CurrentTime;
                var progress = Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + this.hornyLevel * 4);
                ActivitySetArousal(Player, progress);
            }
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction('ActivitySetArousalTimer', 1, (args, next) => {
            let Activity = args[1];
            let Zone = args[2];
            let Progress = args[3];

            let hornyMod = 1 + this.hornyLevel/2;
            args[3] = Math.min(99, Progress * hornyMod);

            return next(args);
        }, ModuleCategory.Injector);
    }

    asleep: boolean = false;
    brainwashed: boolean = false;

    sleepTotalTicks = 12;
    sleepTimer: number = 0;
    hypnoTimer: number = 0;

    sedativeLevel: number = 0;
    mindControlLevel: number = 0;
    hornyLevel: number = 0;

    sedativeMax: number = 5;
    mindControlMax: number = 5;
    hornyLevelMax: number = 5;

    sedativeCooldownInterval: number = 0;
    mindControlCooldownInterval: number = 0;
    hornyCooldownInterval: number = 0;
    hornyLastBumped: number = 0;

    ProcessInjection(sender: Character, location: AssetGroupItemName) {
        var asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;
        
        var name = asset.Craft.Name;
        var description = asset.Craft.Description;
        var totalString = name + " | " + description;

        var isSedative = this.settings.sedativeKeywords.some(ph => isPhraseInString(totalString, ph));
        var isMindControl = this.settings.mindControlKeywords.some(ph => isPhraseInString(totalString, ph));
        var isHorny = this.settings.hornyKeywords.some(ph => isPhraseInString(totalString, ph));
        var isCure = this.settings.cureKeywords.some(ph => isPhraseInString(totalString, ph));

        if (isSedative)
            this.InjectSedative(sender, location);
        if (isMindControl)
            this.InjectMindControl(sender, location);
        if (isHorny)
            this.InjectHorny(sender, location);
        if (isCure)
            this.InjectCure(sender, location);
    }

    sedativeInjectStr = [
        "%NAME% sighs as a cool relaxing calm glides through %POSSESSIVE% body, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscle relax as %OPP_NAME%'s sedative courses through %POSSESSIVE% body",
        "%NAME% fights to stay conscious against the relentless weight of %OPP_NAME%'s drug."
    ];

    InjectSedative(sender: Character, location: AssetGroupItemName) {
        this.sedativeLevel = Math.min(this.sedativeLevel + 1, this.sedativeMax);
        SendAction(this.sedativeInjectStr[getRandomInt(this.sedativeInjectStr.length)], sender);
        console.info("Sedative Injected by " + sender.Nickname + " in the " + location + ". level: " + this.sedativeLevel);
        if (!this.asleep) {
            MiniGameStart(this.sleepyGame.name, (this.sedativeLevel * 8), "LSCG_InjectEnd_Sedative");
        }
        CurrentModule = "Online";
    }

    brainwashInjectStr = [
        "%NAME% whimpers and struggles to keep control of %POSSESSIVE% mind.",
        "%NAME% gasps weakly as %OPP_NAME%'s drug slowly erases %POSSESSIVE% free will.",
        "%NAME%'s eyes struggle to focus as %OPP_NAME%'s drug makes %POSSESSIVE% more suggestable"
    ];

    InjectMindControl(sender: Character, location: AssetGroupItemName) {
        this.mindControlLevel = Math.min(this.mindControlLevel + 1, this.mindControlMax);
        SendAction(this.brainwashInjectStr[getRandomInt(this.brainwashInjectStr.length)], sender);
        console.info("Mind Control Injected by " + sender.Nickname + " in the " + location + ". level: " + this.mindControlLevel);
        if (!this.brainwashed) {
            MiniGameStart(this.brainWashGame.name, (this.mindControlLevel * 8), "LSCG_InjectEnd_Brainwash");
        }
        CurrentModule = "Online";
    }

    hornyInjectStr = [
        "%NAME% moans uncontrollably as %OPP_NAME%'s drug takes effect.",
        "%NAME%'s eyes roll back as a wave of pleasure washes over %POSSESSIVE% body.",
        "%NAME% quivers as %POSSESSIVE% body is flooded with %OPP_NAME%'s aphrodisiac." 
    ];

    InjectHorny(sender: Character, location: AssetGroupItemName) {
        this.hornyLevel = Math.min(this.hornyLevel + 1, this.hornyLevelMax);
        SendAction(this.hornyInjectStr[getRandomInt(this.hornyInjectStr.length)], sender);
        console.info("Horny Injected by " + sender.Nickname + " in the " + location + ". level: " + this.hornyLevel);
        if (!!(<any>Player).BCT?.splitOrgasmArousal?.arousalProgress) {
            (<any>Player).BCT.splitOrgasmArousal.arousalProgress = 100;
        }
    }

    cureInjectStr = [
        "%NAME% moans thankfully as %OPP_NAME%'s medicine heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME%'s cure washes warmly over %POSSESSIVE%.",
        "%OPP_NAME%'s drug rushes warmly through %NAME%'s body, curing what ailes %POSSESSIVE%." 
    ];

    InjectCure(sender: Character, location: AssetGroupItemName) {
        this.sedativeLevel = 0;
        this.mindControlLevel = 0;
        this.hornyLevel = 0;
        SendAction(this.cureInjectStr[getRandomInt(this.cureInjectStr.length)], sender);
        if (this.asleep) this.Wake();
        if (this.brainwashed) this.SnapBack();
    }

    SedativeCooldown() {
        this.sedativeLevel = Math.max(0, this.sedativeLevel - 1);
        if (this.sedativeLevel <= 0 && this.asleep)
            this.Wake();
    }

    MindControlCooldown() {
        this.mindControlLevel = Math.max(0, this.mindControlLevel - 1);
        if (this.mindControlLevel <= 0 && this.brainwashed)
            this.SnapBack();
    }

    HornyCooldown() {
        this.hornyLevel = Math.max(0, this.hornyLevel - 1);
    }

    MiniGameEnd(type: "sedative" | "mindcontrol", success: boolean) {
        console.info("sedative minigame ended - " + success);
        CommonSetScreen("Online", "ChatRoom");
        if (!success) {
            switch (type) {
                case "sedative":
                    this.Sleep();
                    break;
                case "mindcontrol":
                    CharacterSetFacialExpression(Player, "Eyes", null);
                    this.Brainwash();
                    break;
            }
        }
    }

    Sleep() {
        this.sedativeLevel = this.sedativeMax;
        this.asleep = true;
        SendAction("%NAME% moans weakly as %PRONOUN% succumbs to unconciousness.");
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
    }

    Wake() {
        this.sedativeLevel = 0;
        if (this.asleep) {
            this.asleep = false;
            SendAction("%NAME%'s eyelids flutter and start to open sleepily...");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        }
    }

    Brainwash() {
        this.mindControlLevel = this.mindControlMax;
        this.brainwashed = true;
        if (!!this.hypnoModule)
            this.hypnoModule.SetEyes();
    }

    SnapBack() {
        this.mindControlLevel = 0;
        if (this.brainwashed) {
            this.brainwashed = false;
            SendAction("%NAME% gasps, snapping back into their senses confused and blushing.");
            setOrIgnoreBlush("Medium");
            if (!!this.hypnoModule)
                this.hypnoModule.ResetEyes();
        }
    }

    sleepBlockStrings = [
        "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
        "%NAME% exhales slowly, fully relaxed...",
        "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
        "%NAME% moans softly and relaxes..."
    ];

    ActivateSleepEvent() {
        SendAction(this.sleepBlockStrings[getRandomInt(this.sleepBlockStrings.length)]);
    }

    brainwashBlockStrings = [
        "%NAME% stares blankly, %POSSESSIVE% mind open and suggestable...",
        "%NAME%'s eyelids flutter gently, awaiting a command...",
        "%NAME% trembles with a quiet moan as %POSSESSIVE% yearns to obey...",
        "%NAME% groans softly as %PRONOUN% drops even further under the drug's command..."
    ];

    ActivateBrainwashEvent() {
        SendAction(this.brainwashBlockStrings[getRandomInt(this.brainwashBlockStrings.length)]);
    }

    HasNetgun(C: Character | null): boolean {
        if (!C)
            return false;

        var asset = InventoryGet(C, "ItemHandheld");
        if (!asset?.Craft)
            return false;
        
        var name = asset.Craft.Name;
        var description = asset.Craft.Description;
        var totalString = name + " " + description;

        var isNetgun = this.settings.netgunKeywords.some(ph => isPhraseInString(totalString, ph));
        return isNetgun;
    }

    ShootNetgun(target: Character) {
        if (!target)
            return;
        
        if (this.settings.netgunIsChaotic) {
            SendAction("%NAME% fires a net wildly!");
            setTimeout(() => this.ApplyNet(this.GetChaoticNetTarget(target)), 2000);
        } else if (target.MemberNumber == Player.MemberNumber) {
            SendAction("%NAME% fires at themselves point blank!", target);
            setTimeout(() => this.ApplyNet(target), 2000);
        }
        else {
            SendAction("%NAME% fires a net at %OPP_NAME%!", target);
            setTimeout(() => this.ApplyNet(target), 2000);
        }
    }

    GetChaoticNetTarget(intentedTarget: Character) {
        return ChatRoomCharacterDrawlist[getRandomInt(ChatRoomCharacterDrawlist.length)];
    }

    ApplyNet(target: Character) {
        var net = InventoryWear(target, "Net", "ItemDevices", "Default", 8, Player.MemberNumber, <CraftingItem>{
            MemberNumber: Player.MemberNumber,
            MemberName: Player.Nickname,
            Name: "Net Gun Net",
            Description: "A lightweight net designed to be shot from a handheld launcher."
        }, true);
        if (!!net && !!net.Property) {
            net.Difficulty = 8;
            net.Property.Difficulty = 8;
        }
        ChatRoomCharacterItemUpdate(target, "ItemDevices");
        SendAction("%NAME%'s net engulfs %OPP_NAME%.", target);
    }
}