import { BaseModule } from "base";
import { BrainwashMiniGame } from "MiniGames/Brainwash";
import { registerMiniGame } from "MiniGames/minigames";
import { SleepyMiniGame } from "MiniGames/Sleepy";
import { getModule } from "modules";
import { GuiInjector } from "Settings/injector";
import { InjectorSettingsModel } from "Settings/Models/injector";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, isPhraseInString, settingsSave, hookFunction, getCharacter, AUDIO, getPlayerVolume, OnAction, hookBCXCurse, GetTargetCharacter, GetActivityName, GetMetadata, GetActivityEntryFromContent, IsActivityAllowed, GetHandheldItemNameAndDescriptionConcat, GetItemName } from "../utils";
import { ActivityBundle, ActivityModule, ActivityTarget, CustomAction, CustomPrerequisite } from "./activities";
import { HypnoModule } from "./hypno";
import { MiscModule } from "./misc";
import { ItemUseModule } from "./item-use";
import { StateModule } from "./states";

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

interface ContinuousDevice {
    AssetName: string;
    AllowedGroups: AssetGroupName[],
    IsValid: (item: Item) => boolean;
    IsActive: (item: Item) => boolean;
    ExhaustItem: (item: Item) => void;
}

interface WornContinuousDevice {
    Definition: ContinuousDevice;
    Item: Item;
}

export class InjectorModule extends BaseModule {
    
    sleepyGame: SleepyMiniGame = registerMiniGame(new SleepyMiniGame(this));
    brainWashGame: BrainwashMiniGame = registerMiniGame(new BrainwashMiniGame(this));

    hypnoModule: HypnoModule | undefined;
    activityModule: ActivityModule | undefined;
    miscModule: MiscModule | undefined;

    get stateModule(): StateModule {
        return getModule<StateModule>("StateModule");
    }

    get defaultSettings() {
        return <InjectorSettingsModel>{
            enabled: false,
            //immersive: false,
            enableSedative: false,
            enableMindControl: false,
            enableHorny: false,
            netgunIsChaotic: false,
            showDrugLevels: true,
            sedativeLevel: 0,
            mindControlLevel: 0,
            hornyLevel: 0,

            sedativeKeywords: ["tranquilizer","sedative"],
            mindControlKeywords: ["mind control", "hypnotizing", "brainwashing"],
            hornyKeywords: ["horny", "aphrodisiac", "arousing"],
            cureKeywords: ["antidote", "healing", "curing", "cure"],
            netgunKeywords: ["net gun", "netgun"],
            hornyTickTime: 5000,
            sedativeCooldown: 180000, // 3 minutes
            mindControlCooldown: 240000, // 4 minutes
            hornyCooldown: 300000, // 5 minutes
            drugLevelMultiplier: 100,
            sedativeMax: 4,
            mindControlMax: 4,
            hornyLevelMax: 4,
            heartbeat: true,

            enableContinuousDelivery: true,
            continuousDeliveryForever: false,
            continuousDeliveryActivatedAt: 0,
            continuousDeliveryTimeout: 60 * 60 * 1000, // By default, stop delivering continuous drug after 2 hours

            //asleep: false,
            //brainwashed: false,
            stats: {},

            sipLimit: 0
        };
    }

    get settings(): InjectorSettingsModel {
        return super.settings as InjectorSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiInjector;
    }
    
    safeword(): void {
        this.settings.continuousDeliveryActivatedAt = 0;
        this.settings.continuousDeliveryForever = false;
        this.DoCure();
    }

    load(): void {
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

        this.InitStates();

        OnActivity(10, ModuleCategory.Injector, (data, sender, msg, megadata) => {
            if (!this.Enabled)
                return;
            let meta = GetMetadata(data);
            var activityName = meta?.ActivityName;
            var target = meta?.TargetMemberNumber;
            if (target == Player.MemberNumber && activityName == "Inject" && !!sender) {
                var location = <AssetGroupItemName>meta?.GroupName;
                this.ProcessInjection(sender, location);
            }
            else if (target == Player.MemberNumber && (activityName == "SipItem" || activityName == "LSCG_FunnelPour") && !!sender) {
                let gagType = this.GetGagDrinkAccess(Player);
                let isFullPour = activityName == "LSCG_FunnelPour";
                if (gagType == "nothing" && sender.MemberNumber != Player.MemberNumber && this.IsDrugAllowed(sender)) {
                    this.TryForceDrink(sender, isFullPour);
                } else {
                    this.ProcessDruggedDrink(sender, isFullPour);
                }
            } else if (target == Player.MemberNumber) {
                let activityEntry = GetActivityEntryFromContent(data.Content);
                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
                    return;
                if (activityEntry?.awakener && !sender?.IsPlayer()) {
                    if (this.asleep) this.Wake();
                    if (this.brainwashed) this.SnapBack();
                }
            }
        });

        OnAction(1, ModuleCategory.Injector, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;

            let deliverySlots = ["ItemHandheld"];
            let messagesToCheck = [
                "ActionUse",
                "ActionSwap"
            ];

            let target = GetTargetCharacter(data);
            let targetGroup = GetMetadata(data)?.GroupName;
            
            if (target == Player.MemberNumber &&
                sender?.IsPlayer() &&
                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
                messagesToCheck.some(x => msg.startsWith(x))) {
                let glass = InventoryGet(Player, "ItemHandheld");
                if (glass?.Asset.Name == "GlassFilled"){
                    if (!glass.Property) glass.Property = {};
                    if (!glass.Property.SipLimit) glass.Property.SipLimit = this.settings.sipLimit;
                }
            }
        });

        hookFunction("ServerSend", 100, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity" && this.Enabled){
                let data = args[1];
                let actName = GetActivityName(data) ?? "";
                if (actName == "SipItem" || actName == "LSCG_FunnelPour") {
                    let fullPour = actName == "LSCG_FunnelPour";
                    let glass = InventoryGet(Player, "ItemHandheld");
                    if (glass?.Asset.Name == "GlassFilled") {
                        if (!fullPour) {
                            if (!glass.Property) glass.Property = {};
                            if (!glass.Property.SipLimit) glass.Property.SipLimit = this.settings.sipLimit;
                            if (!glass.Property.SipCount) glass.Property.SipCount = 1;
                            else glass.Property.SipCount++;
                        }
                        if (fullPour || glass.Property!.SipLimit! > 0 && glass.Property!.SipCount! >= glass.Property!.SipLimit!) {
                            SendAction("%NAME%'s uses up the last drop of %POSSESSIVE% drink.");
                            var craft = glass.Craft;
                            InventoryRemove(Player, "ItemHandheld", false);
                            InventoryWear(Player, "GlassEmpty", "ItemHandheld", glass.Color, glass.Difficulty, Player.MemberNumber, craft, false);
                            ChatRoomCharacterUpdate(Player);
                        }
                    }
                }
            }
            
            return next(args);
        }, ModuleCategory.Injector);

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
                    bars.push({
                        type: "sedative",
                        level: charSettings.sedativeLevel,
                        max: charSettings.sedativeMax * charSettings.drugLevelMultiplier
                    });
                if (charSettings.mindControlLevel > 0)
                    bars.push({
                        type: "mindcontrol",
                        level: charSettings.mindControlLevel,
                        max: charSettings.mindControlMax * charSettings.drugLevelMultiplier
                    });
                if (charSettings.hornyLevel > 0)
                    bars.push({
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

    hookBCX() {
        if (!this._bcxHooked) {
            this._bcxHooked = hookBCXCurse((evt) => {
                if (evt.group.startsWith("ItemMouth") && this.Enabled && this.settings.enableContinuousDelivery)
                    this.CheckRespiratorCurseUpdate();
            });
        }
    }

    run(): void {
        this.hypnoModule = getModule<HypnoModule>("HypnoModule");
        this.activityModule = getModule<ActivityModule>("ActivityModule");
        this.miscModule = getModule<MiscModule>("MiscModule");

        if (!!this.activityModule) {
            // Netgun
            this.activityModule.AddActivity({
                Activity: {
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
                        TargetAction: "SourceCharacter takes aim at TargetCharacter with PronounPossessive net gun.",
                        TargetSelfAction: "SourceCharacter turns PronounPossessive net gun on PronounSelf."
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
                CustomAction: {
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

            // Pour drink into funnel
            this.activityModule?.AddActivity({
                Activity: {
                    Name: "FunnelPour",
                    MaxProgress: 90,
                    MaxProgressSelf: 90,
                    Prerequisite: ["UseHands", "Needs-PourableItem"]
                },
                Targets: [
                    {
                        Name: "ItemMouth",
                        TargetLabel: "Pour into Funnel",
                        SelfAllowed: true,
                        TargetAction: "SourceCharacter pours PronounPossessive ActivityAsset into TargetCharacter's funnel.",
                        TargetSelfAction: "SourceCharacter pours PronounPossessive ActivityAsset into PronounPossessive own funnel."
                    }
                ],
                CustomPrereqs: [
                    {
                        Name: "CanPourIntoFunnel",
                        Func: (acting, acted, group) => {
                            let funnelGag = [
                                InventoryGet(acted, "ItemMouth"),
                                InventoryGet(acted, "ItemMouth2"),
                                InventoryGet(acted, "ItemMouth3")
                            ].find(g => g?.Asset.Name == "FunnelGag");
                            return !!funnelGag && (funnelGag.Property?.TypeRecord ?? {})["typed"] == 1;
                        }
                    }
                ]
            });
        }        

        this.activityModule.AddCustomPrereq({
            Name: "InjectorIsNotNetgun", 
            Func: (acting, acted, group) => !this.HasNetgun(acting)
        });
        const injectActivity = ActivityFemale3DCG.find(act => act.Name == "Inject") as LSCGActivity;
        injectActivity?.Prerequisite.push("InjectorIsNotNetgun");
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Injector);
    }

    _bcxHooked: boolean = false;

    InitializeRestrictiveHooks() {
        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hornyLevel > 0) return true;
            return next(args);
        }, ModuleCategory.Injector);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hornyLevel > 0) return [{r: 254, g: 44, b: 84, a: (this.hornyLevel/(this.hornyLevelMax*this.drugLevelMultiplier*4))}];
            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled || !Player.GraphicsSettings!.AllowBlur)
                return next(args);
            if (this.hornyLevel > 0) return Math.max(0, (this.hornyLevel / this.drugLevelMultiplier) - 1);
            return next(args);
        }, ModuleCategory.Injector);

        OnAction(1, ModuleCategory.Injector, (data, sender, msg, metadata) => {
            let deliverySlots = ["ItemMouth", "ItemMouth2", "ItemMouth3"];
            let messagesToCheck = [
                "ActionUse",
                "ActionSwap",
                "ActionRemove"
            ];

            let target = GetTargetCharacter(data);
            let targetGroup = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "FocusAssetGroup")?.AssetGroupName;
            
            if (target == Player.MemberNumber &&
                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
                messagesToCheck.some(x => msg.startsWith(x))) {
                let _ = this.IsWearingRespirator;
            } else if (target == Player.MemberNumber && msg.indexOf("LatexRespiratorSetGlow") > -1 && !!sender) {
                this.CheckForContinuousToggle(sender);
            } else if (target == Player.MemberNumber && msg.indexOf("CryoCapsuleSet") > -1 && !!sender) {
                this.CheckForContinuousToggle_CryoPod(sender); // TODO -- Eventually move these toggles into generic types too
            }
        });

        // Check for respirator curses
        this._bcxHooked = hookBCXCurse((evt) => {
            if (evt.group.startsWith("ItemMouth") && this.Enabled && this.settings.enableContinuousDelivery)
                this.CheckRespiratorCurseUpdate();
        })

        let lastBreathEvent = 0;
        let breathInterval = 2000; // breath event every 4s
        hookFunction('TimerProcess', 1, (args, next) => {
            let now = CommonTime();
            if (!ActivityAllowed() || !this.Enabled)
                return next(args);

            // Heardbeat every hornyTickTime
            if (this.hornyLevel > 0 && this.hornyLastBumped + this.settings.hornyTickTime < now) {
                this.hornyLastBumped = now;
                if (getRandomInt(this.hornyLevelMax) <= Math.floor(this.hornyLevel/this.drugLevelMultiplier)) {
                    if (this.settings.heartbeat && !AudioShouldSilenceSound(true)) AudioPlayInstantSound(AUDIO.HEARTBEAT, getPlayerVolume(0));
                    DrawFlashScreen("#FF647F", 1000, this.hornyLevel);
                }
                var newProgress = (Player.ArousalSettings?.Progress ?? 0) + (this.hornyLevel/this.drugLevelMultiplier) * 4;
                newProgress = Math.min(99, newProgress);
                ActivitySetArousal(Player, newProgress);
            }

            // Check every minute for breath drug event
            if (this.settings.enableContinuousDelivery && lastBreathEvent + breathInterval < now) {
                this.hookBCX(); // Temp location...
                lastBreathEvent = now;
                this.BreathInDrugEvent();
                this.CheckForHypnoHelmet();
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

        // hookFunction('ChatRoomSync', 1, (args, next) => {
        //     if (this.asleep)
        //         setTimeout(() => this.miscModule?.SetSleepExpression());
        //     return next(args);
        // })
    }

    sleepTotalTicks = 12;
    sleepTimer: number = 0;
    hypnoTimer: number = 0;

    get asleep(): boolean { return this.stateModule.SleepState.Active };
    //set asleep(val: boolean) { if (this.settings.asleep != val){ this.settings.asleep = val; settingsSave(true);}}
    get brainwashed(): boolean { return this.stateModule.HypnoState.Active };
    // set brainwashed(val: boolean) { if (this.settings.brainwashed != val) {this.settings.brainwashed = val; settingsSave(true);}}

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
    cooldownTickMs: number = 6000; // tick cooldown every 6 seconds

    InjectionLocationTable: Map<string, number> = new Map<string, number>(Object.entries(locationObj))

    GetDrugTypes(item: CraftingItem): DrugType[] {
        var name = item.Name;
        var description = typeof CraftingDescription === "undefined" ? item.Description : CraftingDescription.Decode(item.Description); // R109
        var totalString = name + " | " + description;

        var types: DrugType[] = [];

        if (this.settings.sedativeKeywords?.some(ph => isPhraseInString(totalString, ph, true)))
            types.push("sedative");
        if (this.settings.mindControlKeywords?.some(ph => isPhraseInString(totalString, ph, true)))
            types.push("mindcontrol");
        if (this.settings.hornyKeywords?.some(ph => isPhraseInString(totalString, ph, true)))
            types.push("horny");
        if (this.settings.cureKeywords?.some(ph => isPhraseInString(totalString, ph, true)))
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

    ProcessDruggedDrink(sender: Character, fullPour: boolean = false) {
        var asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;
        //var multiplier = ((<any>asset.Property)?.SipLimit ?? 1) - ((<any>asset.Property)?.SipCount ?? 0)
        let types = this.GetDrugTypes(asset.Craft!);
        if (types.indexOf("sedative") > -1 && this.settings.enableSedative)
            this.DrinkSedative(sender, fullPour);
        if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl)
            this.DrinkMindControl(sender, fullPour);
        if (types.indexOf("horny") > -1 && this.settings.enableHorny)
            this.DrinkHorny(sender, fullPour);
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
        "%NAME% sighs as a cool relaxing calm glides through %POSSESSIVE% body, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscles relax as %OPP_NAME%'s sedative courses through %POSSESSIVE% body",
        "%NAME% fights to stay conscious against the relentless weight of %OPP_NAME%'s drug.",
        "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug."
    ];

    sedativeDrinkStr = [
        "%NAME% gulps and swallows %OPP_NAME%'s drink, a cool relaxing feeling starting to spread through %POSSESSIVE% body.",
        "%NAME% sighs as a cool relaxing calm glides down %POSSESSIVE% throat, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscles relax as %OPP_NAME%'s sedative pours down %POSSESSIVE% throat and starts to take effect.",
        "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug."
    ];

    AddSedative(multiplier: number, minigame: boolean = true) {
        var additive = this.drugLevelMultiplier * multiplier;
        var newLevel = Math.min(this.sedativeLevel + additive, this.sedativeMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetSedativeLevel = newLevel;
        // else
        this.sedativeLevel = newLevel;

        if (!this.asleep && minigame) {
            DialogLeave();
            MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
        }

        CurrentModule = "Online";
    }

    DrinkSedative(sender: Character, fullPour: boolean = false) {
        this.AddSedative(2);
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
        "%NAME%'s eyes struggle to focus as %OPP_NAME%'s drug makes %POSSESSIVE% more suggestible."
    ];

    brainwashDrinkStr = [
        "%NAME% starts to drift dreamily as they swallow %OPP_NAME%'s drink.",
        "%NAME% gasps weakly and starts to lose focus as %OPP_NAME%'s drug warms %POSSESSIVE% comfortably.",
        "%NAME%'s eyes flutter and defocus as %OPP_NAME%'s drink slides warmly down %POSSESSIVE% throat."
    ];

    AddMindControl(multiplier: number, minigame: boolean = true) {
        var additive = this.drugLevelMultiplier * multiplier
        var newLevel = Math.min(this.mindControlLevel + additive, this.mindControlMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetMindControlLevel = newLevel;
        // else
        this.mindControlLevel = newLevel;

        if (!this.brainwashed && minigame)
            MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
                
        CurrentModule = "Online";
    }

    DrinkMindControl(sender: Character, fullPour: boolean = false) {
        this.AddMindControl(2);
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
        "%NAME% lets out a long low moan as %OPP_NAME%'s drink burns pleasurably down %POSSESSIVE% throat.",
        "%NAME%'s eyes roll back as a wave of pleasure emanates from %POSSESSIVE% belly.",
        "%NAME% gulps and quivers as %POSSESSIVE% body is slowly flooded with %OPP_NAME%'s aphrodisiac." 
    ];

    AddHorny(multiplier: number, forceCum: boolean = true, flash: boolean = false) {
        var additive = this.drugLevelMultiplier * multiplier
        let newLevelActual = this.hornyLevel + additive;
        
        this.hornyLevel = Math.min(newLevelActual, this.hornyLevelMax * this.drugLevelMultiplier);
        if (newLevelActual >= this.hornyLevelMax * this.drugLevelMultiplier && forceCum) {
            ActivityOrgasmPrepare(Player);
            this.settings.stats.forcedOrgasmCount++;
            settingsSave();
        }

        if (!!(<any>Player).BCT?.splitOrgasmArousal?.arousalProgress) {
            (<any>Player).BCT.splitOrgasmArousal.arousalProgress = 100;
        }
    }

    DrinkHorny(sender: Character, fullPour: boolean = false) {
        this.AddHorny(2);
        SendAction(this.hornyDrinkStr[getRandomInt(this.hornyDrinkStr.length)], sender);
    }

    InjectHorny(sender: Character, location: AssetGroupItemName) {
        this.AddHorny(this.InjectionLocationTable.get(location) ?? 1);
        SendAction(this.hornyInjectStr[getRandomInt(this.hornyInjectStr.length)], sender);
        DrawFlashScreen("#FF647F", 1000, this.hornyLevel * 2);
    }

    cureInjectStr = [
        "%NAME% moans thankfully as %OPP_NAME_POSSESSIVE% medicine heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME_POSSESSIVE% cure washes warmly over %POSSESSIVE%.",
        "%OPP_NAME_POSSESSIVE% drug rushes warmly through %NAME%'s body, curing what ails %POSSESSIVE%." 
    ];

    cureDrinkStr = [
        "%NAME% gulps thankfully as %OPP_NAME_POSSESSIVE% medicine slowly heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME_POSSESSIVE% cure glides warmly through %POSSESSIVE%.",
        "%OPP_NAME_POSSESSIVE_DIRECT% antidote slowly washes through %NAME_POSSESSIVE% body, curing what ails %POSSESSIVE%." 
    ];

    DrinkCure(sender: Character) {
        SendAction(this.cureDrinkStr[getRandomInt(this.cureDrinkStr.length)], sender);
        this.DoCure();
    }

    InjectCure(sender: Character, location: AssetGroupItemName) {
        SendAction(this.cureInjectStr[getRandomInt(this.cureInjectStr.length)], sender);
        this.DoCure();
    }

    DoCure() {
        this.settings.sedativeLevel = 0;
        this.settings.mindControlLevel = 0;
        this.settings.hornyLevel = 0;
        if (this.asleep) this.Wake();
        if (this.brainwashed) this.SnapBack();
        this.settings.stats.curedCount++;
        settingsSave(true);
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

    Sleep(doEmote: boolean = true) {
        this.stateModule.SleepState.Activate(undefined, undefined, doEmote);
        this.settings.stats.sedatedCount++;
    }

    Wake() {
        this.stateModule.SleepState.Recover(true);
    }

    Brainwash() {
        SendAction("%NAME%'s body goes limp as %POSSESSIVE% mind empties and %PRONOUN% awaits a command.");
        this.stateModule.HypnoState.Activate();
        this.settings.stats.brainwashedCount++;
        settingsSave();
    }

    SnapBack() {
        if (this.brainwashed) {
            SendAction("%NAME% gasps, snapping back into %POSSESSIVE% senses confused and blushing.");
            this.stateModule.HypnoState.Recover();
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

    HasNetgun(C: Character | null): boolean {
        if (!C)
            return false;

        let allowedNetGuns = [
            "MedicalInjector",
            "RainbowWand",
            "Baguette"
        ]
        var item = InventoryGet(Player, "ItemHandheld");
        if (!item || !item.Asset || allowedNetGuns.indexOf(item.Asset.Name) == -1)
            return false;

        var totalString = GetHandheldItemNameAndDescriptionConcat();
        if (!totalString)
            return false;

        var isNetgun = this.settings.netgunKeywords?.some(ph => isPhraseInString(totalString ?? "", ph, true));
        return isNetgun;
    }

    ShootNetgun(target: Character) {
        if (!target)
            return;
        
        if (this.settings.netgunIsChaotic) {
            SendAction("%NAME% fires a net wildly.");
            setTimeout(() => this.ResolveNetting(target, true), 2000);
        } else if (target.MemberNumber == Player.MemberNumber) {
            SendAction("%NAME% fires at themselves point blank.", target);
            setTimeout(() => this.ResolveNetting(target), 2000);
        }
        else {
            SendAction("%NAME% fires a net at %OPP_NAME%.", target);
            setTimeout(() => this.ResolveNetting(target), 2000);
        }
    }

    ResolveNetting(intendedTarget: Character, chaotic: boolean = false) {
        this.settings.stats.totalNettingsCount++;
        let actualTarget = intendedTarget
        if (chaotic)
            actualTarget = this.GetChaoticNetTarget(intendedTarget);
        if (actualTarget.MemberNumber == intendedTarget.MemberNumber)
            this.settings.stats.successfulNettingsCount++;
        this.ApplyNet(actualTarget);
        settingsSave();
    }

    GetChaoticNetTarget(intendedTarget: Character) {
        // 50/50 chance to hit intended target..
        let val = getRandomInt(100);
        if (val > 50)
            return intendedTarget;
        var filteredList = ChatRoomCharacterDrawlist.filter(c => !InventoryGet(c, "ItemDevices"));
        if (filteredList.length <= 0)
            return intendedTarget; // Also hit the intended target if they're the _only_ one who has no devices already equipped

        return filteredList[getRandomInt(filteredList.length)];
    }

    GetCraftedNet(): CraftingItem | undefined {
        let netgun = InventoryGet(Player, "ItemHandheld");
        let netgunCraft = netgun?.Craft;
        var netgunStr = GetHandheldItemNameAndDescriptionConcat() ?? "";
        if (!netgunCraft || !netgunStr)
            return;

        let craftedNets: CraftingItem[] = Player.Crafting?.filter(x => !!x && x.Item == "Net").map(x => <CraftingItem>x) ?? [];

        let craftingMember = netgunCraft.MemberNumber;
        if (!!craftingMember && craftingMember >= 0 && craftingMember != Player.MemberNumber) {
            let craftingChar = getCharacter(craftingMember);
            if (!!craftingChar) {
                craftedNets = craftedNets?.concat(<CraftingItem[]>CraftingDecompressServerData(craftingChar.Crafting?.filter(x => x?.Item == "Net") ?? ""));
            }
        }
        
        let craftedNet = craftedNets?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(netgunStr, x.Name));
        return craftedNet;
    }

    ApplyNet(target: Character) {
        let isDefaultNet = false;
        let craftedNet = this.GetCraftedNet();

        if (!craftedNet) {
            isDefaultNet = true;
            craftedNet = <CraftingItem>{
                MemberNumber: Player.MemberNumber,
                MemberName: CharacterNickname(Player),
                Name: "Net Gun Net",
                Description: "A lightweight net designed to be shot from a handheld launcher.",
                Color: "Default"            
            };
        }
        var net = InventoryWear(target, "Net", "ItemDevices", craftedNet.Color, isDefaultNet ? 0 : craftedNet.DifficultyFactor, Player.MemberNumber, craftedNet, false);
        InventoryCraft(Player, target, "ItemDevices", craftedNet, true);
        if (!!net && !!net.Property && isDefaultNet) {
            net.Difficulty = 8;
            net.Property.Difficulty = 8;
        }
        ChatRoomCharacterUpdate(target);
        SendAction(`%NAME%'s ${isDefaultNet ? "net" : craftedNet.Name} engulfs %OPP_NAME%.`, target);
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
                    if (!this.brainwashed)
                        MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
                    
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
                    if (!this.asleep)
                        MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
                    
                    CurrentModule = "Online";
                }
            }
            else
                this._targetSedativeLevel = 0;
        }
    }

    HoldingDruggedDrink(C: Character): boolean {
        var item = InventoryGet(C, "ItemHandheld");
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
            ["FunnelGag", 1],
            ["RingGag"]
        ];

        var overrideGag = mouthItems.find(gag => gagOverrideAllowChecks.map(o => o[0]).indexOf(gag?.Asset.Name!) > -1);
        if (!!overrideGag) {
            let check = gagOverrideAllowChecks.find(x => x[0] == overrideGag?.Asset.Name);
            if (!!check && (check.length == 1 || check[1] == (overrideGag.Property?.TypeRecord ?? {})["typed"]))
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

    TryForceDrink(sender: Character, fullPour: boolean = false) {
        let itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            return this.ProcessDruggedDrink(sender);
        }
        var itemName = itemUseModule.getItemName(InventoryGet(sender, "ItemHandheld")!);
        let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
            SendAction(`${CharacterNickname(sender)} ${check.AttackerRoll.TotalStr}manages to get %OPP_POSSESSIVE% ${itemName} past ${CharacterNickname(Player)}'s ${check.DefenderRoll.TotalStr}lips, forcing %INTENSIVE% to swallow.`, sender);
            setTimeout(() => this.ProcessDruggedDrink(sender, fullPour), 5000);
        } else {
            SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully defends against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}attempt to force %INTENSIVE% to drink %OPP_POSSESSIVE% ${itemName}, spilling drink all over.`, sender);
        }
    }

    InitStates() {
        this._wasWearingRespirator = this.WornRespirator != null;
    }

    CheckRespiratorCurseUpdate() {
        if (this.IsWearingRespirator && this.IsRespiratorOn && !this._respiratorHasGas) {
            SendAction("%NAME%'s mask whirs and shudders as it reloads its own supply and continues emitting.");
            this.settings.continuousDeliveryActivatedAt = CommonTime();
            settingsSave();
        } else if (this.IsWearingRespirator && !this.IsRespiratorOn) {
            SendAction("%NAME%'s mask hums menacingly as it holds its supply in reserve.");
        } else if (this.IsWearingRespirator && this.IsRespiratorOn && this._respiratorHasGas) {
            SendAction("%NAME%'s mask clicks and turns itself back on.");
        }
    }

    CheckForContinuousToggle(sender: Character) {
        if (this.IsWearingRespirator) {
            if (this.IsRespiratorOn) {
                if (!this._respiratorHasGas) {
                    SendAction("%OPP_NAME% reloads %NAME%'s mask and turns it back on, pumping gas back into %POSSESSIVE% lungs.", sender);
                    this.settings.continuousDeliveryActivatedAt = CommonTime();
                    settingsSave()
                } else if (sender.IsPlayer())
                    SendAction("%NAME% switches on %POSSESSIVE% own mask, filling %POSSESSIVE% lungs.", sender);
                else
                    SendAction("%OPP_NAME% switches on %NAME%'s mask, filling %POSSESSIVE% lungs.", sender);
            } else {
                if (sender.IsPlayer())
                    SendAction("%NAME% switches off %POSSESSIVE% own mask, halting the flow of gas.", sender);
                else
                    SendAction("%OPP_NAME% switches off %NAME%'s mask, halting the flow of gas.", sender);
            }
        }
    }

    CheckForContinuousToggle_CryoPod(sender: Character) {
        if (this.IsWearingRespirator) {
            if (this.IsRespiratorOn) {
                if (!this._respiratorHasGas) {
                    SendAction("%OPP_NAME% reloads %NAME%'s device and turns it back on, filling quickly with gas.", sender);
                    this.settings.continuousDeliveryActivatedAt = CommonTime();
                    settingsSave()
                } else if (sender.IsPlayer())
                    SendAction("%NAME% closes %POSSESSIVE% device, filling with gas.", sender);
                else
                    SendAction("%OPP_NAME% closes %NAME%'s device, filling with gas.", sender);
            } else {
                if (sender.IsPlayer())
                    SendAction("%NAME% opens %POSSESSIVE% device, its enclosed gas escaping swiftly.", sender);
                else
                    SendAction("%OPP_NAME% opens %NAME%'s device, its enclosed gas escaping swiftly.", sender);
            }
        }
    }

    _wasWearingRespirator: boolean = false;

    continuousGasDevices: ContinuousDevice[] = [
        {
            AssetName: "LatexRespirator",
            AllowedGroups: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
            IsValid: (item: Item) => {
                if (!item.Property || !item.Property.TypeRecord || !item.Craft) return false;
                let hasHose = item.Property.TypeRecord["f"] == 2 || item.Property.TypeRecord["f"] == 3;
                let isDrugged = this.GetDrugTypes(item.Craft).length > 0;
                return hasHose && isDrugged;
            },
            IsActive: (item: Item) => {
                return item?.Property?.TypeRecord?.["g"] == 1;
            },
            ExhaustItem: (item: Item) => {
                if (item?.Property?.TypeRecord)
                    item.Property.TypeRecord["g"] = 0;
            }
        }, {
            AssetName: "CryoCapsule",
            AllowedGroups: ["ItemDevices"],
            IsValid: (item: Item) => {
                if (!item.Property || !item.Property.TypeRecord || !item.Craft) return false;
                return this.GetDrugTypes(item.Craft).length > 0;
            },
            IsActive: (item: Item) => {
                return item?.Property?.TypeRecord?.["typed"] == 1;
            },
            ExhaustItem: (item: Item) => {
                if (item?.Property?.TypeRecord)
                    item.Property.TypeRecord["typed"] = 0;
            }
        }
    ]

    // IsInContinuousDelivery
    get IsWearingRespirator(): boolean {
        let item = this.WornRespirator;
        let isWearing = item != null;
        if (!this._wasWearingRespirator && isWearing) {
            if (!this.asleep && !this.brainwashed && this.IsRespiratorOn) {
                SendAction(`%NAME%'s eyes widen as %POSSESSIVE% ${GetItemName(item!.Item)} activates, slowly filling %POSSESSIVE% lungs with its drug.`);
                CharacterSetFacialExpression(Player, "Eyes", "Surprised", 4);
            }
            this.settings.continuousDeliveryActivatedAt = CommonTime();
            settingsSave();
        } else if (this._wasWearingRespirator && !isWearing) {
            SendAction("%NAME% takes a deep breath of cool, clean air as %POSSESSIVE% device is removed.");
        }
        this._wasWearingRespirator = isWearing;
        return isWearing;
    }

    // _continuousDeviceHasGas
    get _respiratorHasGas(): boolean {
        return this.settings.continuousDeliveryForever || 
            this.settings.continuousDeliveryActivatedAt + this.settings.continuousDeliveryTimeout > CommonTime();
    }

    // ContinuousDeviceHasGas
    get RespiratorHasGas(): boolean {
        let hasGas = this._respiratorHasGas;
        if (!hasGas && this.IsWearingRespirator && this.IsRespiratorOn) {
            let item = this.WornRespirator;
            if (!!item && !!item.Item) {
                SendAction(`%NAME%'s ${GetItemName(item.Item)} hisses quietly as it runs out of its supply of gas.`);
                item.Definition.ExhaustItem(item.Item);
                CharacterRefresh(Player, true);
            }
        }
        return hasGas;
    }

    // ActiveContinuousDevice
    get WornRespirator(): WornContinuousDevice | null {
        return this.continuousGasDevices.map(device => {
            let item = device.AllowedGroups.map(grp => InventoryGet(Player, grp)).filter(item => !!item && device.IsValid(item))[0] ?? null
            return !item ? null : {
                Definition: device,
                Item: item
            }
        }).filter(device => !!device && !!device.Item)[0] ?? null;

        //return [InventoryGet(Player, "ItemMouth"), InventoryGet(Player, "ItemMouth2"), InventoryGet(Player, "ItemMouth3")].filter(item => this.IsValidRespirator(item))[0] ?? null;
    }

    get IsRespiratorOn(): boolean {
        let item = this.WornRespirator;
        if (!!item)
            return item.Definition.IsActive(item.Item);
        else
            return false;
    }

    get IsContinuousDeliveryActive(): boolean {
        return this.Enabled && this.IsWearingRespirator && this.RespiratorHasGas && this.IsRespiratorOn;
    }

    // IsValidRespirator(item: Item | null): boolean {
    //     // False if not a crafted respirator
    //     if (!this.settings.enableContinuousDelivery ||
    //         !item || 
    //         !item.Craft || 
    //         item.Asset.Name != "LatexRespirator" || 
    //         !item.Property || 
    //         !item.Property.TypeRecord)
    //         return false;

    //     //Type: "f2g1s0m0l0"
    //     let hasHose = item.Property.TypeRecord["f"] == 2 || item.Property.TypeRecord["f"] == 3;
    //     let isDrugged = this.GetDrugTypes(item.Craft).length > 0
        
    //     return hasHose && isDrugged;
    // }

    headsetMindControlEventStr: string[] = [
        "%NAME% groans helplessly as %POSSESSIVE% headset manipulates %POSSESSIVE% mind.",
        "%NAME% struggles to keep %POSSESSIVE% focus through the overwhelming influence of %POSSESSIVE% headset.",
        "%NAME% whimpers as %POSSESSIVE% headset erases %POSSESSIVE% own mind relentlessly."
    ];

    hypnoItems: {name: string, active: (item: Item) => boolean }[] = [
        {name: "InteractiveVRHeadset", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["b"] == 5 },
        {name: "TechnoHelmet1", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["v"] == 5 },
        {name: "HypnoticVisor", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["p"] != 0 }
    ]

    CheckForHypnoHelmet() {
        if (!this.settings.enableMindControl)
            return;
        let isWearingHypnoItem = Player.Appearance.some(item => this.hypnoItems.some(hypnoItem => hypnoItem.name == item.Asset.Name && hypnoItem.active(item)))

        if (isWearingHypnoItem) {
            let randomLevelIncrease = (getRandomInt(4) + 2) / 10; // .2 to .5
            if (getRandomInt(50) == 0) { // Odds are big jump once every 10 seconds
                if (!this.brainwashed) SendAction(this.headsetMindControlEventStr[getRandomInt(this.headsetMindControlEventStr.length)]);
                this.AddMindControl(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
            } else this.AddMindControl(randomLevelIncrease / 4, false);
        }
    }

    breathSedativeEventStr: string[] = [
        "%NAME%'s muscles relax limply as %PRONOUN% takes a deep breath of.",
        "%NAME%'s eyes flutter weakly as %PRONOUN% inhales.",
        "%NAME% struggles to keep %POSSESSIVE% drooping eyes open as %POSSESSIVE% device continues to emit its sedative gas."
    ];

    breathMindControlEventStr: string[] = [
        "%NAME% groans helplessly as %POSSESSIVE% device sends another dose into %POSSESSIVE% lungs.",
        "%NAME% struggles to keep %POSSESSIVE% focus through the suggestible haze caused by %POSSESSIVE% device.",
        "%NAME% whimpers as %POSSESSIVE% device's drug pushes %POSSESSIVE% further out of %POSSESSIVE% own mind."
    ];

    breathAphrodesiacEventStr: string[] = [
        "%NAME%'s spine tingles as %PRONOUN% takes a deep breath of drug.",
        "%NAME% lets out a muffled moan as %PRONOUN% inhales.",
        "%NAME%'s sensitive areas burn hot as %PRONOUN% breathes of drug."
    ];

    breathAntidoteEventStr: string[] = [
        "%NAME% sighs with relief as %PRONOUN% takes a deep gulp of healing mist.",
        "%NAME% feels a tingle across %POSSESSIVE% skin as %POSSESSIVE% device heals %INTENSIVE%.",
        "%NAME% lets out a quiet moan as %POSSESSIVE% device releases a healing mist into %INTENSIVE% lungs."
    ];

    BreathInDrugEvent() {
        if (this.IsContinuousDeliveryActive) {
            let mask = this.WornRespirator;
            if (!mask)
                return;
            let types = this.GetDrugTypes(mask.Item.Craft!);
            let randomLevelIncrease = (getRandomInt(4) + 2) / 10; // .2 to .5

            if (types.indexOf("sedative") > -1 && this.settings.enableSedative) {
                if (getRandomInt(30) == 0) { // Odds are big jump once every 60 seconds
                    if (!this.asleep) SendAction(this.breathSedativeEventStr[getRandomInt(this.breathSedativeEventStr.length)]);
                    this.AddSedative(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
                } else this.AddSedative(randomLevelIncrease / 4, false);
            } 
            if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl) {
                if (getRandomInt(30) == 0) { // Odds are big jump once every 60 seconds
                    if (!this.brainwashed) SendAction(this.breathMindControlEventStr[getRandomInt(this.breathMindControlEventStr.length)]);
                    this.AddMindControl(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
                } else this.AddMindControl(randomLevelIncrease / 4, false);
            } 
            if (types.indexOf("horny") > -1 && this.settings.enableHorny) {
                if (getRandomInt(45) == 0) { // Odds are big jump once every 90 seconds
                    SendAction(this.breathAphrodesiacEventStr[getRandomInt(this.breathAphrodesiacEventStr.length)]);
                    this.AddHorny(randomLevelIncrease + 1, getRandomInt(3) == 0); // 1/3 chance to push user over the edge (if allowed...)
                } else this.AddHorny(randomLevelIncrease / 4, false);
            }
            if (types.indexOf("antidote") > -1 && getRandomInt(120) == 0) { // Odds are heal once every 4 minutes
                SendAction(this.breathAntidoteEventStr[getRandomInt(this.breathAntidoteEventStr.length)]);
                this.DoCure();
            }
        }
    }
}

