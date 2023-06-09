import { BaseModule } from "base";
import { BrainwashMiniGame } from "MiniGames/Brainwash";
import { registerMiniGame } from "MiniGames/minigames";
import { SleepyMiniGame, SleepyMiniGameOptions } from "MiniGames/Sleepy";
import { getModule } from "modules";
import { GuiInjector } from "Settings/injector";
import { BaseSettingsModel } from "Settings/Models/base";
import { InjectorSettingsModel } from "Settings/Models/injector";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, isPhraseInString, settingsSave, hookFunction, ICONS, getCharacter, AUDIO, getPlayerVolume } from "../utils";
import { ActivityBundle, ActivityModule, CustomAction, CustomPrerequisite } from "./activities";
import { HypnoModule } from "./hypno";
import { MiscModule } from "./misc";
import { ItemUseModule } from "./item-use";

type DrugType = "sedative" | "mindcontrol" | "horny" | "antidote";

export interface DrugLevel {
    type: DrugType;
    level: number;
    max: number;
}

const locationObj = {
    "ItemNeck": 2, 
    "ItemBreast": 1.8, 
    "ItemArms": 1.2, 
    "ItemButt": 1.5, 
    "ItemVulvaPiercings": 2.2,
    "ItemLegs": 1, 
    "ItemFeet": .8
};

type GagDrinkAccess = "nothing" | "blocked" | "open";

export class InjectorModule extends BaseModule {
    
    sleepyGame: SleepyMiniGame = registerMiniGame(new SleepyMiniGame(this));
    brainWashGame: BrainwashMiniGame = registerMiniGame(new BrainwashMiniGame(this));

    hypnoModule: HypnoModule | undefined;
    activityModule: ActivityModule | undefined;
    miscModule: MiscModule | undefined;

    get defaultSettings() {
        return <InjectorSettingsModel>{
            enabled: false,
            immersive: false,
            enableSedative: false,
            enableMindControl: false,
            enableHorny: false,
            netgunIsChaotic: false,
            showDrugLevels: true,
            allowBoopRestore: true,
            sedativeLevel: 0,
            mindControlLevel: 0,
            hornyLevel: 0,

            sedativeKeywords: ["tranquilizer","sedative"],
            mindControlKeywords: ["mind control", "hypnotizing", "brainwashing"],
            hornyKeywords: ["horny", "aphrodisiac"],
            cureKeywords: ["antidote", "healing", "curing"],
            netgunKeywords: ["net gun", "netgun"],
            hornyTickTime: 5000,
            sedativeCooldown: 120000, // 2 minutes
            mindControlCooldown: 180000, // 3 minutes
            hornyCooldown: 300000, // 5 minutes
            drugLevelMultiplier: 100,
            sedativeMax: 4,
            mindControlMax: 4,
            hornyLevelMax: 4,
            heartbeat: true
        };
    }

    get settings(): InjectorSettingsModel {
        return super.settings as InjectorSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiInjector;
    }
    
    safeword(): void {
        this.DoCure();
    }

    load(): void {
        // CommandCombine([
        //     {
        //         Tag: 'max-sedative',
        //         Description: ": max sedative",
        //         Action: () => { this.sedativeLevel = this.sedativeMax * this.drugLevelMultiplier; }
        //     }, {
        //         Tag: 'max-control',
        //         Description: ": max mind control",
        //         Action: () => { this.mindControlLevel = this.mindControlMax * this.drugLevelMultiplier; }
        //     }, {
        //         Tag: 'max-horny',
        //         Description: ": max horny",
        //         Action: () => { this.hornyLevel = this.hornyLevelMax * this.drugLevelMultiplier; }
        //     }, {
        //         Tag: 'cure-all',
        //         Description: ": cure all",
        //         Action: () => { this.InjectCure(Player, "ItemArms"); }
        //     }
        // ]);

        // Override these with defaults. Remove from here if opened to user configuration later.
        let d = this.defaultSettings;
        this.settings.sedativeKeywords = d.sedativeKeywords;
        this.settings.mindControlKeywords = d.mindControlKeywords;
        this.settings.hornyKeywords = d.hornyKeywords;
        this.settings.cureKeywords = d.cureKeywords;
        this.settings.netgunKeywords = d.netgunKeywords;
        this.settings.hornyTickTime = d.hornyTickTime;
        this.settings.sedativeCooldown = d.sedativeCooldown;
        this.settings.mindControlCooldown = d.mindControlCooldown;
        this.settings.hornyCooldown = d.hornyCooldown;
        this.settings.drugLevelMultiplier = d.drugLevelMultiplier;
        this.settings.sedativeMax = d.sedativeMax;
        this.settings.mindControlMax = d.mindControlMax;
        this.settings.hornyLevelMax = d.hornyLevelMax;

        OnActivity(10, ModuleCategory.Injector, (data, sender, msg, megadata) => {
            var activityName = data.Dictionary[3]?.ActivityName;
            var target = data.Dictionary.find((d: { Tag: string; }) => d.Tag == "TargetCharacter")?.MemberNumber;
            if (!this.Enabled)
                return;
            if (target == Player.MemberNumber && activityName == "Inject" && !!sender) {
                var location = <AssetGroupItemName>data.Dictionary[2]?.FocusGroupName;
                this.ProcessInjection(sender, location);
            }
            else if (target == Player.MemberNumber && activityName == "SipItem" && !!sender) {
                let gagType = this.GetGagDrinkAccess(Player);
                if (gagType == "nothing" && sender.MemberNumber != Player.MemberNumber && this.IsDrugAllowed(sender)) {
                    this.TryForceDrink(sender);
                } else {
                    this.ProcessDruggedDrink(sender);
                }
            } else if (target == Player.MemberNumber) {
                if (data.Content == "ChatOther-ItemNose-Pet" && this.settings.allowBoopRestore) {
                    if (this.asleep) this.Wake();
                    if (this.brainwashed) this.SnapBack();
                }
            }
        });

        hookFunction("DrawArousalMeter", 1, (args, next) => {
            if (!this.Enabled || !this.settings.showDrugLevels)
                return next(args);
            let [Char, CharX, CharY, Zoom] = args as [Character, number, number, number];
            var charSettings = (getCharacter(Char.MemberNumber!) as OtherCharacter)?.LSCG?.InjectorModule;
            if (!charSettings)
                return next(args);

            if (charSettings.sedativeLevel + charSettings.mindControlLevel + charSettings.hornyLevel > 0) {
                let bars: DrugLevel[] = [];
                if (charSettings.sedativeLevel > 0)
                    bars.push(<DrugLevel>{
                        type: "sedative",
                        level: charSettings.sedativeLevel,
                        max: charSettings.sedativeMax * charSettings.drugLevelMultiplier
                    });
                if (charSettings.mindControlLevel > 0)
                    bars.push(<DrugLevel>{
                        type: "mindcontrol",
                        level: charSettings.mindControlLevel,
                        max: charSettings.mindControlMax * charSettings.drugLevelMultiplier
                    });
                if (charSettings.hornyLevel > 0)
                    bars.push(<DrugLevel>{
                        type: "horny",
                        level: charSettings.hornyLevel,
                        max: charSettings.hornyLevelMax * charSettings.drugLevelMultiplier
                    });
                this.DrawBars(Char, CharX, CharY, Zoom, bars);
            }
            return next(args);
        }, ModuleCategory.Injector);

        this.InitializeRestrictiveHooks();

        (<any>window).LSCG_InjectEnd_Sedative = () => this.MiniGameEnd("sedative", MiniGameVictory);
        (<any>window).LSCG_InjectEnd_Brainwash = () => this.MiniGameEnd("mindcontrol", MiniGameVictory);

        this.sedativeCooldownInterval = setInterval(() => this.SedativeCooldown(), this.cooldownTickMs);
        this.mindControlCooldownInterval = setInterval(() => this.MindControlCooldown(), this.cooldownTickMs);
        this.hornyCooldownInterval = setInterval(() => this.HornyCooldown(), this.cooldownTickMs);
    }

    run(): void {
        this.hypnoModule = getModule<HypnoModule>("HypnoModule");
        this.activityModule = getModule<ActivityModule>("ActivityModule");
        this.miscModule = getModule<MiscModule>("MiscModule");

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
                ChatRoomSendLocal("Character access blocked while drugged asleep.", 5000);
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
            else if (this.hornyLevel > 0) return [{r: 254, g: 44, b: 84, a: (this.hornyLevel/(this.hornyLevelMax*this.drugLevelMultiplier*4))}];
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled || !Player.GraphicsSettings!.AllowBlur)
                return next(args);
            if (this.brainwashed) return 3;
            else if (this.hornyLevel > 0) return Math.max(0, (this.hornyLevel / this.drugLevelMultiplier) - 1);
            return next(args);
        }, ModuleCategory.Injector);

        let _lastTick: number = CommonTime();
        hookFunction('TimerProcess', 1, (args, next) => {
            let now = CommonTime();
            if (ActivityAllowed() && this.hornyLevel > 0 && this.hornyLastBumped + this.settings.hornyTickTime < now) {
                this.hornyLastBumped = now;
                var newProgress = (Player.ArousalSettings?.Progress ?? 0) + (this.hornyLevel/this.drugLevelMultiplier) * 4;
                newProgress = Math.min(99, newProgress);
                if (getRandomInt(this.hornyLevelMax) <= Math.floor(this.hornyLevel/this.drugLevelMultiplier)) {
                    if (this.settings.heartbeat && !AudioShouldSilenceSound(true)) AudioPlayInstantSound(AUDIO.HEARTBEAT, getPlayerVolume(0));
                    DrawFlashScreen("#FF647F", 1000, this.hornyLevel);
                }
                ActivitySetArousal(Player, newProgress);
            }
            // if (_lastTick + 400 < now) {
            //     _lastTick = now;
            //     this.ProcessGradualLevels();
            // }
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

        hookFunction('ChatRoomSync', 1, (args, next) => {
            if (this.brainwashed)
                setTimeout(() => this.hypnoModule?.EnforceEyes());
            else if (this.asleep)
                setTimeout(() => this.miscModule?.SetSleepExpression());
            return next(args);
        })
    }

    sleepTotalTicks = 12;
    sleepTimer: number = 0;
    hypnoTimer: number = 0;

    get asleep(): boolean { return this.settings.asleep };
    set asleep(val: boolean) { if (this.settings.asleep != val){ this.settings.asleep = val; settingsSave(true);}}
    get brainwashed(): boolean { return this.settings.brainwashed };
    set brainwashed(val: boolean) { if (this.settings.brainwashed != val) {this.settings.brainwashed = val; settingsSave(true);}}

    get sedativeLevel(): number {return this.settings.sedativeLevel};
    set sedativeLevel(val: number) {if (this.settings.sedativeLevel != val) {this.settings.sedativeLevel = val; settingsSave(true);}}
    get mindControlLevel(): number {return this.settings.mindControlLevel};
    set mindControlLevel(val: number) {if (this.settings.mindControlLevel != val) {this.settings.mindControlLevel = val; settingsSave(true);}}
    get hornyLevel(): number {return this.settings.hornyLevel};
    set hornyLevel(val: number) {if (this.settings.hornyLevel != val) {this.settings.hornyLevel = val; settingsSave(true);}}

    get drugLevelMultiplier(): number {return this.settings.drugLevelMultiplier};
    set drugLevelMultiplier(val: number) {if (this.settings.drugLevelMultiplier != val) {this.settings.drugLevelMultiplier = val; settingsSave(true);}}

    get sedativeMax(): number {return this.settings.sedativeMax};
    set sedativeMax(val: number) {if (this.settings.sedativeMax != val) {this.settings.sedativeMax = val; settingsSave(true);}}
    get mindControlMax(): number {return this.settings.mindControlMax};
    set mindControlMax(val: number) {if (this.settings.mindControlMax != val) {this.settings.mindControlMax = val; settingsSave(true);}}
    get hornyLevelMax(): number {return this.settings.hornyLevelMax};
    set hornyLevelMax(val: number) {if (this.settings.hornyLevelMax != val) {this.settings.hornyLevelMax = val; settingsSave(true);}}

    _targetSedativeLevel: number = 0;
    get targetSedativeLevel(): number {return Math.max(this.sedativeLevel, this._targetSedativeLevel)};
    _targetMindControlLevel: number = 0;
    get targetMindControlLevel(): number {return Math.max(this.mindControlLevel, this._targetMindControlLevel)};
    _targetHornyLevel: number = 0;
    get targetHornyLevel(): number {return Math.max(this.hornyLevel, this._targetHornyLevel)};

    sedativeCooldownInterval: number = 0;
    mindControlCooldownInterval: number = 0;
    hornyCooldownInterval: number = 0;
    hornyLastBumped: number = 0;
    cooldownTickMs: number = 5000;

    InjectionLocationTable: Map<string, number> = new Map<string, number>(Object.entries(locationObj))

    GetDrugTypes(item: CraftingItem): DrugType[] {
        var name = item.Name;
        var description = item.Description;
        var totalString = name + " | " + description;

        var types: DrugType[] = [];

        if (this.settings.sedativeKeywords?.some(ph => isPhraseInString(totalString, ph)))
            types.push("sedative");
        if (this.settings.mindControlKeywords?.some(ph => isPhraseInString(totalString, ph)))
            types.push("mindcontrol");
        if (this.settings.hornyKeywords?.some(ph => isPhraseInString(totalString, ph)))
            types.push("horny");
        if (this.settings.cureKeywords?.some(ph => isPhraseInString(totalString, ph)))
            types.push("antidote");

        return types;
    }

    IsDrugAllowed(sender: Character): boolean {
        var asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return false;
        let types = this.GetDrugTypes(asset.Craft!);
        if ((types.indexOf("sedative") > -1 && this.settings.enableSedative) ||
            (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl) ||
            (types.indexOf("horny") > -1 && this.settings.enableHorny) ||
            (types.indexOf("antidote") > -1))
            return true;
        
        return false;
    }

    ProcessDruggedDrink(sender: Character) {
        var asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;
        let types = this.GetDrugTypes(asset.Craft!);
        if (types.indexOf("sedative") > -1 && this.settings.enableSedative)
            this.DrinkSedative(sender);
        if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl)
            this.DrinkMindContrll(sender);
        if (types.indexOf("horny") > -1 && this.settings.enableHorny)
            this.DrinkHorny(sender);
        if (types.indexOf("antidote") > -1)
            this.DrinkCure(sender);
    }

    ProcessInjection(sender: Character, location: AssetGroupItemName) {
        var asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;

        let types = this.GetDrugTypes(asset.Craft!);
        
        if (!AudioShouldSilenceSound(true) && types.length > 0)
            AudioPlayInstantSound(AUDIO.INJECTION, getPlayerVolume(0));

        if (types.indexOf("sedative") > -1 && this.settings.enableSedative)
            this.InjectSedative(sender, location);
        if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl)
            this.InjectMindControl(sender, location);
        if (types.indexOf("horny") > -1 && this.settings.enableHorny)
            this.InjectHorny(sender, location);
        if (types.indexOf("antidote") > -1)
            this.InjectCure(sender, location);
    }

    sedativeInjectStr = [
        "%NAME% gulps and swallows %OPP_NAME%'s drink, a cool relaxing feeling starting to spread through %POSSESSIVE% body.",
        "%NAME%'s muscle relax as %OPP_NAME%'s sedative courses through %POSSESSIVE% body.",
        "%NAME% fights to stay conscious against the relentless weight of %OPP_NAME%'s drug."
    ];

    sedativeDrinkStr = [
        "%NAME% sighs as a cool relaxing calm glides down %POSSESSIVE% throat, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscle relax as %OPP_NAME%'s sedative pours down %POSSESSIVE% throat and starts to take effect.",
        "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug."
    ];

    AddSedative(multiplier: number, gradual: boolean = false) {
        var additive = this.drugLevelMultiplier * multiplier;
        var newLevel = Math.min(this.sedativeLevel + additive, this.sedativeMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetSedativeLevel = newLevel;
        // else
        this.sedativeLevel = newLevel;

        if (!this.asleep) {
            MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
        }
        CurrentModule = "Online";
    }

    DrinkSedative(sender: Character) {
        this.AddSedative(2, true);
        SendAction(this.sedativeDrinkStr[getRandomInt(this.sedativeDrinkStr.length)], sender);
    }

    InjectSedative(sender: Character, location: AssetGroupItemName) {
        this.AddSedative(this.InjectionLocationTable.get(location) ?? 1);
        SendAction(this.sedativeInjectStr[getRandomInt(this.sedativeInjectStr.length)], sender);
        DrawFlashScreen("#5C5CFF", 1000, this.sedativeLevel * 2);

        
    }

    brainwashInjectStr = [
        "%NAME% whimpers and struggles to keep control of %POSSESSIVE% mind.",
        "%NAME% gasps weakly as %OPP_NAME%'s drug slowly erases %POSSESSIVE% free will.",
        "%NAME%'s eyes struggle to focus as %OPP_NAME%'s drug makes %POSSESSIVE% more suggestable."
    ];

    brainwashDrinkStr = [
        "%NAME% starts to drift dreamily as they swallow %OPP_NAME%'s drink.",
        "%NAME% gasps weakly and starts to lose focus as %OPP_NAME%'s drug warms %POSSESSIVE% comfortably.",
        "%NAME%'s eyes flutter and unfocus as %OPP_NAME%'s drink slides warmly down %POSSESSIVE% throat."
    ];

    AddMindControl(multiplier: number, gradual: boolean = false) {
        var additive = this.drugLevelMultiplier * multiplier
        var newLevel = Math.min(this.mindControlLevel + additive, this.mindControlMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetMindControlLevel = newLevel;
        // else
        this.mindControlLevel = newLevel;

        if (!this.brainwashed) {
            MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
        }
        CurrentModule = "Online";
    }

    DrinkMindContrll(sender: Character) {
        this.AddMindControl(2, true);
        SendAction(this.brainwashDrinkStr[getRandomInt(this.brainwashDrinkStr.length)], sender);
    }

    InjectMindControl(sender: Character, location: AssetGroupItemName) {
        this.AddMindControl(this.InjectionLocationTable.get(location) ?? 1);
        SendAction(this.brainwashInjectStr[getRandomInt(this.brainwashInjectStr.length)], sender);
        DrawFlashScreen("#A020F0", 1000, this.mindControlLevel * 2);
    }

    hornyInjectStr = [
        "%NAME% moans uncontrollably as %OPP_NAME%'s drug takes effect.",
        "%NAME%'s eyes roll back as a wave of pleasure washes over %POSSESSIVE% body.",
        "%NAME% quivers as %POSSESSIVE% body is flooded with %OPP_NAME%'s aphrodisiac." 
    ];

    hornyDrinkStr = [
        "%NAME% lets out a long low moan as %OPP_NAME%'s drink burns pleasurably down their throat.",
        "%NAME%'s eyes roll back as a wave of pleasure eminates from %POSSESSIVE% belly.",
        "%NAME% gulps and quivers as %POSSESSIVE% body is slowly flooded with %OPP_NAME%'s aphrodisiac." 
    ];

    AddHorny(multiplier: number, gradual: boolean = false) {
        var additive = this.drugLevelMultiplier * multiplier
        let newLevelActual = this.hornyLevel + additive;
        // if (gradual)
        //     this._targetHornyLevel = newLevelActual;
        // else {
        this.hornyLevel = Math.min(newLevelActual, this.hornyLevelMax * this.drugLevelMultiplier);
        if (newLevelActual >= this.hornyLevelMax * this.drugLevelMultiplier) {
            ActivityOrgasmPrepare(Player);
            this.hornyLevel -= this.drugLevelMultiplier;
            }
        //}

        if (!!(<any>Player).BCT?.splitOrgasmArousal?.arousalProgress) {
            (<any>Player).BCT.splitOrgasmArousal.arousalProgress = 100;
        }
    }

    DrinkHorny(sender: Character) {
        this.AddHorny(2);
        SendAction(this.hornyDrinkStr[getRandomInt(this.hornyDrinkStr.length)], sender);
    }

    InjectHorny(sender: Character, location: AssetGroupItemName) {
        this.AddHorny(this.InjectionLocationTable.get(location) ?? 1);
        SendAction(this.hornyInjectStr[getRandomInt(this.hornyInjectStr.length)], sender);
        DrawFlashScreen("#FF647F", 1000, this.hornyLevel * 2);
    }

    cureInjectStr = [
        "%NAME% moans thankfully as %OPP_NAME%'s medicine heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME%'s cure washes warmly over %POSSESSIVE%.",
        "%OPP_NAME%'s drug rushes warmly through %NAME%'s body, curing what ailes %POSSESSIVE%." 
    ];

    cureDrinkStr = [
        "%NAME% gulps thankfully as %OPP_NAME%'s medicine slowly heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME%'s cure glides warmly through %POSSESSIVE%.",
        "%OPP_NAME%'s antidote slowly washes through %NAME%'s body, curing what ailes %POSSESSIVE%." 
    ];

    DrinkCure(sender: Character) {
        SendAction(this.cureDrinkStr[getRandomInt(this.cureDrinkStr.length)], sender);
        this.DoCure();
    }

    InjectCure(sender: Character, location: AssetGroupItemName) {
        SendAction(this.cureInjectStr[getRandomInt(this.cureInjectStr.length)], sender);
        this.DoCure();
    }

    DoCure(gradual: boolean = false) {
        this.sedativeLevel = 0;
        this.mindControlLevel = 0;
        this.hornyLevel = 0;
        if (this.asleep) this.Wake();
        if (this.brainwashed) this.SnapBack();
    }

    // Cooldown func fires every cooldownTickMs
    SedativeCooldown() {
        if (this.sedativeLevel <= 0)
            return;
        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
        let subtractive = this.drugLevelMultiplier / (this.settings.sedativeCooldown / this.cooldownTickMs)
        this.sedativeLevel = Math.max(0, this.sedativeLevel - subtractive);
        if (this.sedativeLevel <= 0 && this.asleep)
            this.Wake();
    }

    MindControlCooldown() {
        if (this.mindControlLevel <= 0)
            return;
        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
        let subtractive = this.drugLevelMultiplier / (this.settings.mindControlCooldown / this.cooldownTickMs)
        this.mindControlLevel = Math.max(0, this.mindControlLevel - subtractive);
        if (this.mindControlLevel <= 0 && this.brainwashed)
            this.SnapBack();
    }

    HornyCooldown() {
        if (this.hornyLevel <= 0)
            return;
        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
        let subtractive = this.drugLevelMultiplier / (this.settings.hornyCooldown / this.cooldownTickMs)
        this.hornyLevel = Math.max(0, this.hornyLevel - subtractive);
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
        this.asleep = true;
        SendAction("%NAME% moans weakly as %PRONOUN% succumbs to unconciousness.");
        this.miscModule?.SetSleepExpression();
        this.miscModule?.FallDownIfPoissible();
    }

    Wake() {
        if (this.asleep) {
            this.asleep = false;
            SendAction("%NAME%'s eyelids flutter and start to open sleepily...");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
            if (WardrobeGetExpression(Player)?.Emoticon == "Sleep")
                CharacterSetFacialExpression(Player, "Emoticon", null);
        }
    }

    Brainwash() {
        this.brainwashed = true;
        SendAction("%NAME%'s body goes limp as %POSSESSIVE% mind empties and %PRONOUN% awaits a command.");
        if (!!this.hypnoModule)
            this.hypnoModule.SetEyes();
    }

    SnapBack() {
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

        var isNetgun = this.settings.netgunKeywords?.some(ph => isPhraseInString(totalString, ph));
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

    GetChaoticNetTarget(intendedTarget: Character) {
        // 50/50 chance to hit intended target..
        if (getRandomInt(2) == 1)
            return intendedTarget;
        var filteredList = ChatRoomCharacterDrawlist.filter(c => !InventoryGet(c, "ItemDevices"));
        if (filteredList.length <= 0)
            return intendedTarget; // Also hit the intended target if they're the _only_ one who has no devices already equipped

        return filteredList[getRandomInt(filteredList.length)];
    }

    ApplyNet(target: Character) {
        var net = InventoryWear(target, "Net", "ItemDevices", "Default", 8, Player.MemberNumber, <CraftingItem>{
            MemberNumber: Player.MemberNumber,
            MemberName: CharacterNickname(Player),
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

    /**
     * Draws Drug Level Bars
     * @param C Character for which to draw
     * @param X 
     * @param Y 
     * @param Zoom 
     */
    DrawBars(C: Character, X: number, Y: number, Zoom: number, bars: DrugLevel[]) {
        bars?.forEach((bar, ix, arr) => {
            let barX = X + (380 * Zoom) + (15 * ix * Zoom);
            let barY = Y + (540 * Zoom);
            let barZoom = Zoom * .2
            let barProgress = Math.max(0, Math.min(100, bar.level / bar.max)) * 100;
            let color = "#5C5CFF";
            if (bar.type == "mindcontrol") color = "#A020F0";
            else if (bar.type == "horny") color = "#FF647F";
            DrawRect(barX, barY, (40 * barZoom), (Math.round(400 * barZoom)), "Black");
            DrawRect(barX, barY + (Math.round((100 - barProgress) * 4 * barZoom)), (40 * barZoom), (Math.round(barProgress * 4 * barZoom)), color);
            DrawEmptyRect(barX, barY, (40 * barZoom), (Math.round(400 * barZoom)), color);
        });
    }

    ProcessGradualLevels() {
        if (this._targetHornyLevel > 0){
            if (this.targetHornyLevel > this.hornyLevel) {
                let newHorny = Math.max(this.targetHornyLevel, this.hornyLevel + this.drugLevelMultiplier / 10);
                if (newHorny > this.hornyLevelMax * this.drugLevelMultiplier && Player.ArousalSettings?.Progress! > 50) {
                    ActivityOrgasmPrepare(Player);
                    this.hornyLevel -= this.drugLevelMultiplier;
                    this._targetHornyLevel = 0;
                }
                this.hornyLevel = newHorny;
            }
            else
                this._targetHornyLevel = 0;
        }

        if (this._targetMindControlLevel > 0){
            if (this.targetMindControlLevel > this.mindControlLevel) {
                this.mindControlLevel = Math.max(this.targetMindControlLevel, this.mindControlLevel + this.drugLevelMultiplier / 10);
                if (this.mindControlLevel == this.targetMindControlLevel) {
                    if (!this.brainwashed) {
                        MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
                    }
                    CurrentModule = "Online";
                }
            }
            else
                this._targetMindControlLevel = 0;
        }

        if (this._targetSedativeLevel > 0){
            if (this.targetSedativeLevel > this.sedativeLevel) {
                this.sedativeLevel = Math.max(this.targetSedativeLevel, this.sedativeLevel + this.drugLevelMultiplier / 10);
                if (this.sedativeLevel == this.targetSedativeLevel) {
                    if (!this.asleep) {
                        MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
                    }
                    CurrentModule = "Online";
                }
            }
            else
                this._targetSedativeLevel = 0;
        }
    }

    HoldingDruggedDrink(C: Character): boolean {
        var item = InventoryGet(C, "Handheld");
        if (!item || (item.Asset.Name != "GlassFilled" && item.Asset.Name != "Mug") || !item.Craft)
            return false;
        var drugTypes = this.GetDrugTypes(item.Craft!);
        return drugTypes.length > 0;
    }

    GetGagDrinkAccess(C: Character): GagDrinkAccess {
        var mouthItems = [
            InventoryGet(C, "ItemMouth"),
            InventoryGet(C, "ItemMouth2"),
            InventoryGet(C, "ItemMouth3"),
        ].filter(g => !!g);
        let gagOverrideAllowChecks = [
            ["FunnelGag", "Funnel"]
        ];

        var overrideGag = mouthItems.find(gag => gagOverrideAllowChecks.map(o => o[0]).indexOf(gag?.Asset.Name!) > -1);
        if (!!overrideGag) {
            let check = gagOverrideAllowChecks.find(x => x[0] == overrideGag?.Asset.Name);
            if (!!check && (check.length == 1 || check[1] == overrideGag.Property?.Type))
                return "open";
        }

        let blocked = C.IsMouthBlocked();
        let isOpen = C.IsMouthOpen();
        if (blocked)
            return "blocked";
        else if (!blocked && isOpen)
            return "open";
        else
            return "nothing";        
    }

    TryForceDrink(sender: Character) {
        let itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            return this.ProcessDruggedDrink(sender);
        }
        var itemName = itemUseModule.getItemName(InventoryGet(sender, "ItemHandheld")!);
        let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
            SendAction(`${CharacterNickname(sender)} ${check.AttackerRoll.TotalStr}manages to get their ${itemName} past ${CharacterNickname(Player)}'s ${check.DefenderRoll.TotalStr}lips, forcing %POSSESSIVE% to swallow.`);
            setTimeout(() => this.ProcessDruggedDrink(sender), 5000);
        } else {
            SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully defends against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}attempt to force %POSSESSIVE% to drink their ${itemName}.`);
        }
    }
}

