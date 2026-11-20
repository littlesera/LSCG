import { BaseModule } from "base";
import { BrainwashMiniGame } from "MiniGames/Brainwash";
import { registerMiniGame } from "MiniGames/minigames";
import { SleepyMiniGame } from "MiniGames/Sleepy";
import { Consent, getModule } from "modules";
import { GuiInjector } from "Settings/injector";
import { InjectorSettingsModel } from "Settings/Models/injector";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { IsBlockedSender, OnActivity, SendAction, getRandomInt, removeAllHooksByModule, isPhraseInString, settingsSave, hookFunction, getCharacter, AUDIO, getPlayerVolume, OnAction, hookBCXCurse, GetTargetCharacter, GetActivityName, GetMetadata, GetActivityEntryFromContent, IsActivityAllowed, GetItemName, LSCG_SendLocal, replace_template } from "../utils";
import { ActivityModule, ActivityPatch } from "./activities";
import { HypnoModule } from "./hypno";
import { MiscModule } from "./misc";
import { ItemUseModule } from "./item-use";
import { StateModule } from "./states";
import type { MagicModule } from "./magic";
import { emit, emitBefore } from "api/events";
import type { LSCGDrugContext, LSCGDrugDoseContext, LSCGDrugMethod, LSCGOptions } from "api/types";
import { editableOptions, sanitizeOptions } from "api/options";
import { DEFAULT_DRUG_COLOR, MAX_EXTENSION_BARS, extensionDrugs, isExtensionDrugId, type ExtensionDrug } from "api/drugs";
import { builtInStates } from "api/builtInStates";
import { clearScreenEffects, drawSpiralOverlay, setSpiralEffect, setWaveEffect } from "Dom/screenEffects";
import { BUILT_IN_DRUGS, builtInDrug, isBuiltInDrugId, type BuiltInDrugId } from "./drugs/builtin";
import type { ExtensionDrugBar } from "Settings/Models/injector";
import {
    CHECK_INTERVALS,
    EFFECT_DURATIONS,
    CONTINUOUS_DELIVERY,
    SOAKED_ITEMS,
    DRUG_LEVELS,
    INJECTION_MULTIPLIERS,
    ACTIVITY_VALUES,
    DRUG_EFFECT_MULTIPLIERS,
    RANDOM_EVENT_ODDS,
    BREATH_STRENGTH_PERCENT,
    BREATH_DRUG_INCREASES,
    AROUSAL_LIMITS,
    DRUG_BAR_DIMENSIONS,
    SUGGESTIBLE_URGE,
    SUGGESTIBLE_VISUALS,
} from "../constants";

/** How often decayed (but otherwise unchanged) drug levels are saved. */
const DECAY_SAVE_INTERVAL_MS = 5 * 60 * 1000;
/** Most decay one tick can apply, a little over the 1-minute timer throttling of a hidden tab. */
const MAX_DECAY_STEP_MS = 2 * 60 * 1000;

type DrugType = BuiltInDrugId | "antidote";
/** A built-in drug, or an extension's namespaced "<extension id>.<name>". */
type AnyDrugType = DrugType | `${string}.${string}`;

export interface DrugLevel {
    type: string;
    level: number;
    max: number;
    /** Bar colour; built-in drugs pick theirs by type. */
    color?: string;
}

const locationObj = {
    "ItemNeck": INJECTION_MULTIPLIERS.NECK,
    "ItemBreast": INJECTION_MULTIPLIERS.BREAST,
    "ItemArms": INJECTION_MULTIPLIERS.ARMS,
    "ItemButt": INJECTION_MULTIPLIERS.BUTT,
    "ItemVulvaPiercings": INJECTION_MULTIPLIERS.VULVA_PIERCINGS,
    "ItemLegs": INJECTION_MULTIPLIERS.LEGS,
    "ItemFeet": INJECTION_MULTIPLIERS.FEET,
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
            enableSuggestible: false,
            showDrugLevels: true,
            sedativeLevel: 0,
            mindControlLevel: 0,
            hornyLevel: 0,
            suggestibleLevel: 0,

            sedativeKeywords: ["tranquilizer","sedative"],
            mindControlKeywords: ["mind control", "hypnotizing", "brainwashing"],
            hornyKeywords: ["horny", "aphrodisiac", "arousing"],
            suggestibleKeywords: ["suggestible", "suggestable", "intoxicating", "compliance"],
            cureKeywords: ["antidote", "healing", "curing", "cure"],
            hornyTickTime: CHECK_INTERVALS.HORNY_TICK,
            ...Object.fromEntries(BUILT_IN_DRUGS.map(drug => [drug.cooldownKey, drug.defaultCooldown])),
            drugLevelMultiplier: DRUG_LEVELS.MULTIPLIER,
            sedativeMax: DRUG_LEVELS.SEDATIVE_MAX,
            mindControlMax: DRUG_LEVELS.MIND_CONTROL_MAX,
            hornyLevelMax: DRUG_LEVELS.HORNY_MAX,
            suggestibleMax: DRUG_LEVELS.SUGGESTIBLE_MAX,
            heartbeat: true,

            enableContinuousDelivery: true,
            continuousDeliveryForever: false,
            continuousDeliveryActivatedAt: 0,
            continuousDeliveryTimeout: CONTINUOUS_DELIVERY.DEFAULT_TIMEOUT,

            enableDrugVisuals: true,
            enableSuggestibleWave: true,
            enableDrugEmotes: true,
            drugEmotesLocal: false,
            drugEmoteMinutes: CHECK_INTERVALS.BREATH_DRUG_EMOTE_MIN / 60_000,
            gasStrength: BREATH_STRENGTH_PERCENT.GAS_DEFAULT,
            soakedStrength: Math.round(SOAKED_ITEMS.DOSE_FACTOR * 100),
            enableSoakedItems: true,
            soakedPotencyTime: SOAKED_ITEMS.DEFAULT_POTENCY,
            infiniteSoakPotency: false,
            soakedAt: <Record<string, number>>{},

            //asleep: false,
            //brainwashed: false,
            stats: {},

            sipLimit: DRUG_LEVELS.DEFAULT_SIP_LIMIT,

            enabledExtensionDrugs: <string[]>[],
            extensionDrugLevels: <Record<string, number>>{},
        };
    }

    get settings(): InjectorSettingsModel {
        return super.settings as InjectorSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiInjector;
    }

    get commands(): ICommand[] {
        return [{
            Tag: "drug-boost",
            Description: "<sleepy|hypno|horny|suggestible> : Apply a one-drink boost of the specified drug type to yourself.",
            Action: (args, msg, parsed) => {
                if (!this.Enabled) {
                    LSCG_SendLocal("Injector module is not enabled.");
                    return;
                }
                switch (args?.trim().toLowerCase()) {
                    case "sleepy":
                        this.AddSedative(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER, false);
                        LSCG_SendLocal(`Sedative boosted. Level: ${this.sedativeLevel.toFixed(1)}`);
                        break;
                    case "hypno":
                        this.AddMindControl(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER, false);
                        LSCG_SendLocal(`Mind-control boosted. Level: ${this.mindControlLevel.toFixed(1)}`);
                        break;
                    case "horny":
                        this.AddHorny(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER, false);
                        LSCG_SendLocal(`Aphrodisiac boosted. Level: ${this.hornyLevel.toFixed(1)}`);
                        break;
                    case "suggestible":
                        this.AddSuggestible(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER);
                        LSCG_SendLocal(`Suggestible boosted. Level: ${this.suggestibleLevel.toFixed(1)}`);
                        break;
                    default:
                        LSCG_SendLocal("Usage: /lscg drug-boost &lt;sleepy|hypno|horny|suggestible&gt;");
                }
            },
        }, {
            Tag: "soaked-status",
            Description: ": Shows which soaked items LSCG sees on you, what they carry, and why they would or wouldn't be dosing you.",
            Action: () => {
                const s = this.settings;
                LSCG_SendLocal(`Injector module enabled: ${this.Enabled}; soaked items allowed: ${s.enableSoakedItems}; drug opt-ins: ${BUILT_IN_DRUGS.map(d => `${d.label} ${s[d.enableKey]}`).join(", ")}.`);
                for (const group of this.soakedSlots) {
                    const item = InventoryGet(Player, group);
                    if (!item) continue;
                    if (!item.Craft) {
                        LSCG_SendLocal(`${group}: ${item.Asset.Name} is not crafted, so it can't be soaked.`);
                        continue;
                    }
                    const types = this.GetSoakedDrugTypes(item.Craft);
                    const enabled = this.EnabledDrugTypes(types);
                    const potent = types.length > 0 ? this.IsSoakPotent(this.soakedKey(group, item)) : false;
                    LSCG_SendLocal(`${group}: "${item.Craft.Name}" -> soaked in [${types.join(", ") || "nothing recognised"}], enabled for you [${enabled.join(", ") || "none"}], potent: ${potent}.`);
                }
            },
        }];
    }

    safeword(): void {
        this.settings.continuousDeliveryActivatedAt = 0;
        this.settings.continuousDeliveryForever = false;
        this.settings.soakedAt = {};
        this.driedSoaks.clear();
        this.lastUrgeAt.clear();
        this.DoCure();
    }

    load(): void {
        // Override these with defaults. Remove from here if opened to user configuration later.
        const d = this.defaultSettings;
        for (const drug of BUILT_IN_DRUGS)
            this.settings[drug.keywordsKey] = d[drug.keywordsKey];
        this.settings.cureKeywords = d.cureKeywords;
        this.settings.hornyTickTime = d.hornyTickTime;
        // Decay rates follow the defaults unless the player set their own in the Drugs settings.
        this.ApplyDecayOverrides();
        this.settings.drugLevelMultiplier = d.drugLevelMultiplier;
        for (const drug of BUILT_IN_DRUGS)
            this.settings[drug.maxKey] = d[drug.maxKey];

        this.InitStates();

        OnActivity(10, ModuleCategory.Injector, (data, sender, msg, megadata) => {
            if (!this.Enabled)
                return;
            const meta = GetMetadata(data);
            const activityName = meta?.ActivityName;
            const target = meta?.TargetMemberNumber;
            if (target == Player.MemberNumber && activityName == "Inject" && !!sender) {
                const location = <AssetGroupItemName>meta?.GroupName;
                this.ProcessInjection(sender, location);
            }
            else if (target == Player.MemberNumber && (activityName == "SipItem" || activityName == "LSCG_FunnelPour") && !!sender) {
                // Offered sips are resolved by the "sip" consent flow instead
                if (data.Content == InjectorModule.SIP_OFFER_CONTENT)
                    return;
                const gagType = this.GetGagDrinkAccess(Player);
                const isFullPour = activityName == "LSCG_FunnelPour";
                if (gagType == "nothing" && sender.MemberNumber != Player.MemberNumber && this.IsDrugAllowed(sender)) {
                    this.TryForceDrink(sender, isFullPour);
                } else {
                    this.ProcessDruggedDrink(sender, isFullPour);
                }
            } else if (target == Player.MemberNumber) {
                const activityEntry = GetActivityEntryFromContent(data.Content);
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

            const deliverySlots = ["ItemHandheld"];
            const messagesToCheck = [
                "ActionUse",
                "ActionSwap",
            ];

            const target = GetTargetCharacter(data);
            const targetGroup = GetMetadata(data)?.GroupName;

            if (target == Player.MemberNumber &&
                sender?.IsPlayer() &&
                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
                messagesToCheck.some(x => msg.startsWith(x))) {
                const glass = InventoryGet(Player, "ItemHandheld");
                if (glass?.Asset.Name == "GlassFilled"){
                    if (!glass.Property) glass.Property = {};
                    if (!glass.Property.SipLimit) glass.Property.SipLimit = this.settings.sipLimit;
                }
            }
        });

        hookFunction("ServerSend", 100, (args, next) => {
            const data = args[1] as ServerChatRoomMessage;
            if (args[0] == "ChatRoomChat" && data?.Type == "Activity" && this.Enabled){
                const actName = GetActivityName(data) ?? "";
                if (actName == "SipItem" || actName == "LSCG_FunnelPour") {
                    const fullPour = actName == "LSCG_FunnelPour";
                    const target = getCharacter(GetTargetCharacter(data) ?? -1);
                    if (!fullPour && !!target && this.IsSipOffer(target)) {
                        // Send the offer after the activity so the emote lands first.
                        // The sip only counts once it's drunk or spilled, see the "sip" flow's onComplete.
                        const ret = next(args);
                        Consent().Offer("sip", target);
                        return ret;
                    }
                    this.ConsumeSip(fullPour);
                }
            }

            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("DrawArousalMeter", 1, (args, next) => {
            if (!this.Enabled || !this.settings.showDrugLevels)
                return next(args);
            const [Char, CharX, CharY, Zoom] = args as [Character, number, number, number];
            const charSettings = (getCharacter(Char.MemberNumber!) as OtherCharacter)?.LSCG?.InjectorModule;
            if (!charSettings)
                return next(args);

            {
                const bars = this.EstimatedBars(Char);
                if (bars.length > 0)
                    this.DrawBars(Char, CharX, CharY, Zoom, bars);
            }
            return next(args);
        }, ModuleCategory.Injector);

        // Add to bcx bc patch fix
        hookFunction("ServerPlayerIsInChatRoom", 0, (args, next) => {
			return next(args) || CurrentScreen === this.sleepyGame.name || CurrentScreen === this.brainWashGame.name;
		}, ModuleCategory.Injector);

        this.InitializeRestrictiveHooks();

        (<any>window).LSCG_InjectEnd_Sedative = () => this.MiniGameEnd("sedative", MiniGameVictory);
        (<any>window).LSCG_InjectEnd_Brainwash = () => this.MiniGameEnd("mindcontrol", MiniGameVictory);

        this.decaySaveInterval = setInterval(() => this.SaveDecayedLevels(), DECAY_SAVE_INTERVAL_MS);
        window.addEventListener("beforeunload", this.saveOnUnload);
        this.cooldownIntervals = BUILT_IN_DRUGS.map(drug => setInterval(() => this.BuiltInCooldown(drug.id, Date.now()), this.cooldownTickMs));
        // Polled every second so a drug can tick faster than the default (see ExtensionDrugTick).
        this.extensionDrugInterval = setInterval(() => this.ExtensionDrugTick(Date.now()), 1000);
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

        if (this.activityModule) {
            // Pour drink into funnel
            this.activityModule?.AddActivity({
                Activity: {
                    Name: "FunnelPour",
                    MaxProgress: ACTIVITY_VALUES.FUNNEL_POUR_MAX_PROGRESS,
                    MaxProgressSelf: ACTIVITY_VALUES.FUNNEL_POUR_MAX_PROGRESS,
                    Prerequisite: ["UseHands", "Needs-PourableItem"],
                },
                Targets: [
                    {
                        Name: "ItemMouth",
                        TargetLabel: "Pour into Funnel",
                        SelfAllowed: true,
                        TargetAction: "SourceCharacter pours PronounPossessive ActivityAsset into TargetCharacter's funnel.",
                        TargetSelfAction: "SourceCharacter pours PronounPossessive ActivityAsset into PronounPossessive own funnel.",
                    },
                ],
                CustomPrereqs: [
                    {
                        Name: "CanPourIntoFunnel",
                        Func: (acting, acted, group) => {
                            const funnelGag = [
                                InventoryGet(acted, "ItemMouth"),
                                InventoryGet(acted, "ItemMouth2"),
                                InventoryGet(acted, "ItemMouth3"),
                            ].find(g => g?.Asset.Name == "FunnelGag");
                            return !!funnelGag && (funnelGag.Property?.TypeRecord ?? {})["typed"] == 1;
                        },
                    },
                ],
            });

            // Sip offered to someone else reads as an offer rather than a done deal.
            // The swapped key keeps the "ChatOther-<group>-<activity>" shape so GetActivityEntryFromContent still resolves it,
            // and is unknown to vanilla clients so they fall back to the text LSCG attaches in the ServerSend hook.
            this.activityModule.RegisterActivityText(InjectorModule.SIP_OFFER_CONTENT, "SourceCharacter holds PronounPossessive ActivityAsset up to TargetCharacter's lips.");
            this.activityModule.PatchActivity(<ActivityPatch>{
                ActivityName: "SipItem",
                CustomPreparse: {
                    Func: (args) => {
                        const data = args[1] as ServerChatRoomMessage;
                        if (data.Content != InjectorModule.SIP_CONTENT)
                            return;
                        const target = getCharacter(GetTargetCharacter(data) ?? -1);
                        if (this.IsSipOffer(target))
                            data.Content = InjectorModule.SIP_OFFER_CONTENT;
                    },
                },
            });
        }

        Consent().RegisterFlow({
            id: "sip",
            enabled: () => this.Enabled,
            prompt: (sender) => ({
                text: `${CharacterNickname(sender)} holds ${this.HeldDrinkName(sender)} up to your lips.`,
                accept: "Drink",
                refuse: "Refuse",
            }),
            onAccepted: (sender) => {
                SendAction(`%NAME% takes a sip of %OPP_NAME%'s ${this.HeldDrinkName(sender)}.`, sender);
                this.ApplyOfferedSip(sender);
            },
            onRefused: (sender, _, answer, timedOut) => {
                if (answer == "refused" && !timedOut)
                    SendAction(`%NAME% turns %POSSESSIVE% head away from %OPP_NAME%'s ${this.HeldDrinkName(sender)}.`, sender);
            },
            onForced: (sender) => this.TryForceDrink(sender, false, () => this.ApplyOfferedSip(sender)),
            forcePrompt: (target, answer) => ({
                text: answer == "unable"
                    ? `${CharacterNickname(target)} can't respond. Make them drink?`
                    : `${CharacterNickname(target)} refuses your ${this.HeldDrinkName(Player)}. Force it?`,
                force: "Force it",
                backOff: "Back off",
            }),
            onBackOff: () => SendAction(`%NAME% lowers %POSSESSIVE% ${this.HeldDrinkName(Player)}.`),
            // Drunk or spilled in a failed force, the sip is used up. Declining leaves the drink untouched.
            onComplete: (_, outcome) => {
                if (outcome != "declined")
                    this.ConsumeSip(false);
            },
        });
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Injector);
        clearScreenEffects();
        this.cooldownIntervals.forEach(i => clearInterval(i));
        this.cooldownIntervals = [];
        clearInterval(this.extensionDrugInterval);
        clearInterval(this.decaySaveInterval);
        window.removeEventListener("beforeunload", this.saveOnUnload);
    }

    decaySaveInterval: number = 0;
    /** Decay that changed levels in memory but hasn't been saved yet. */
    private decayUnsaved = false;
    private saveOnUnload = () => this.SaveDecayedLevels();

    /** Levels only decay while the player is online, so the decayed level has to reach the server eventually:
     *  every few minutes, and (best effort) when the page closes. Not published, since other clients estimate decay. */
    SaveDecayedLevels() {
        if (!this.decayUnsaved)
            return;
        this.decayUnsaved = false;
        settingsSave(false);
    }

    /** Built-in decay: minutes for one dose to wear off, or undefined for LSCG's default. */
    GetDecayOverride(type: BuiltInDrugId): number | undefined {
        return this.settings.decayMinutes?.[type];
    }

    SetDecayOverride(type: BuiltInDrugId, minutes: number | undefined) {
        const overrides = { ...(this.settings.decayMinutes ?? {}) };
        if (minutes && minutes > 0)
            overrides[type] = minutes;
        else
            delete overrides[type];
        this.settings.decayMinutes = overrides;
        this.ApplyDecayOverrides();
        settingsSave(true); // others animate our bars from the published rate
    }

    private ApplyDecayOverrides() {
        const d = this.defaultSettings;
        for (const drug of BUILT_IN_DRUGS) {
            const minutes = this.GetDecayOverride(drug.id);
            this.settings[drug.cooldownKey] = minutes && minutes > 0 ? minutes * 60_000 : d[drug.cooldownKey];
        }
    }

    _bcxHooked: boolean = false;

    InitializeRestrictiveHooks() {
        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hornyLevel > 0 || this.SuggestibleTint() > 0) return true;
            return next(args);
        }, ModuleCategory.Injector);

        // Like the blur, tints only happen when the player's own BC preferences allow them (AllowTints above): there is no LSCG setting for it.
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            const tints: { r: number; g: number; b: number; a: number }[] = [];
            if (this.hornyLevel > 0) tints.push({r: 254, g: 44, b: 84, a: (this.hornyLevel/(this.hornyLevelMax*this.drugLevelMultiplier*DRUG_EFFECT_MULTIPLIERS.HORNY_TINT_DIVISOR))});
            const green = this.SuggestibleTint();
            if (green > 0) tints.push({r: 76, g: 217, b: 100, a: green});
            return tints.length > 0 ? tints : next(args);
        }, ModuleCategory.Injector);

        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled || !Player.GraphicsSettings!.AllowBlur)
                return next(args);
            const hornyBlur = this.hornyLevel > 0 ? Math.max(0, (this.hornyLevel / this.drugLevelMultiplier) - 1) : 0;
            // The suggestible's blur breathes slowly in and out, to go with their swaying screen.
            const sway = this.settings.enableDrugVisuals !== false ? this.SuggestibleFraction() * SUGGESTIBLE_VISUALS.BLUR * (0.6 + 0.4 * Math.sin(Date.now() / 2500)) : 0;
            if (hornyBlur > 0 || sway > 0) return Math.max(hornyBlur, sway);
            return next(args);
        }, ModuleCategory.Injector);

        // The hypno spiral is painted on the canvas over the room once per frame, after everything else in the room is drawn. (Not from the
        // per-character overlay hook, which runs once per character and would stack and re-time it.)
        hookFunction("ChatRoomRun", 4, (args, next) => {
            const ret = next(args);
            if (this.Enabled)
                drawSpiralOverlay();
            return ret;
        }, ModuleCategory.Injector);

        // After the chat line is shown (not before, as OnChat would), so the urge reads as a reaction to what was said.
        hookFunction("ChatRoomMessage", 2, (args, next) => {
            const result = next(args);
            const data = args[0];
            if (!IsBlockedSender(data.Sender) && (data.Type == "Chat" || data.Type == "Whisper"))
                this.SuggestibleUrge(data.Content, getCharacter(data.Sender));
            return result;
        }, ModuleCategory.Injector);

        OnAction(1, ModuleCategory.Injector, (data, sender, msg, metadata) => {
            const deliverySlots = ["ItemMouth", "ItemMouth2", "ItemMouth3"];
            const messagesToCheck = [
                "ActionUse",
                "ActionSwap",
                "ActionRemove",
            ];

            const target = GetTargetCharacter(data);
            const targetGroup = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "FocusAssetGroup")?.AssetGroupName;

            if (target == Player.MemberNumber &&
                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
                messagesToCheck.some(x => msg.startsWith(x))) {
                const _ = this.IsWearingRespirator;
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
        });

        let lastBreathEvent = 0;
        let lastSoakedEvent = 0;
        let lastVisualsUpdate = 0;
        const breathInterval = CHECK_INTERVALS.BREATH_DRUG_EVENT;
        hookFunction("TimerProcess", 1, (args, next) => {
            const now = CommonTime();
            if (!this.Enabled)
                clearScreenEffects();
            if (!ActivityAllowed() || !this.Enabled)
                return next(args);

            // Heardbeat every hornyTickTime
            if (this.hornyLevel > 0 && this.hornyLastBumped + this.settings.hornyTickTime < now) {
                this.hornyLastBumped = now;
                if (getRandomInt(this.hornyLevelMax) <= Math.floor(this.hornyLevel/this.drugLevelMultiplier)) {
                    if (this.settings.heartbeat && !AudioShouldSilenceSound(true)) AudioPlayInstantSound(AUDIO.HEARTBEAT, getPlayerVolume(0));
                    DrawFlashScreen("#FF647F", EFFECT_DURATIONS.FLASH_SCREEN, this.hornyLevel);
                }
                let newProgress = (Player.ArousalSettings?.Progress ?? 0) + (this.hornyLevel/this.drugLevelMultiplier) * DRUG_EFFECT_MULTIPLIERS.HORNY_AROUSAL_FACTOR;
                newProgress = Math.min(AROUSAL_LIMITS.MAX_PROGRESS, newProgress);
                ActivitySetArousal(Player, newProgress);
            }

            // Check every minute for breath drug event
            if (this.settings.enableContinuousDelivery && lastBreathEvent + breathInterval < now) {
                this.hookBCX(); // Temp location...
                lastBreathEvent = now;
                this.BreathInDrugEvent();
                this.CheckForHypnoHelmet();
            }

            if (lastVisualsUpdate + breathInterval < now) {
                lastVisualsUpdate = now;
                this.UpdateScreenEffects();
            }

            // Soaked gags and masks breathe in on the same beat, whether or not a respirator is worn
            if (this.settings.enableSoakedItems && lastSoakedEvent + breathInterval < now) {
                lastSoakedEvent = now;
                this.SoakedDrugEvent();
            }

            return next(args);
        }, ModuleCategory.Injector);

        hookFunction("ActivitySetArousalTimer", 1, (args, next) => {
            const Progress = args[3];

            const hornyMod = 1 + this.hornyLevel/DRUG_EFFECT_MULTIPLIERS.HORNY_ACTIVITY_FACTOR;
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

    get asleep(): boolean { return this.stateModule.SleepState.Active; };
    //set asleep(val: boolean) { if (this.settings.asleep != val){ this.settings.asleep = val; settingsSave(true);}}
    get brainwashed(): boolean { return this.stateModule.HypnoState.Active; };
    // set brainwashed(val: boolean) { if (this.settings.brainwashed != val) {this.settings.brainwashed = val; settingsSave(true);}}

    /** A built-in drug's current level, on its internal scale. */
    GetBuiltInLevel(id: BuiltInDrugId): number { return this.settings[builtInDrug(id)!.levelKey]; }

    /** Sets a built-in drug's level, saving and announcing the change. */
    SetBuiltInLevel(id: BuiltInDrugId, val: number) {
        const def = builtInDrug(id)!;
        const previous = this.settings[def.levelKey];
        if (previous != val) {
            this.settings[def.levelKey] = val;
            this.LevelChanged(id, previous, val, this.settings[def.maxKey] * this.drugLevelMultiplier);
        }
    }

    get sedativeLevel(): number {return this.GetBuiltInLevel("sedative");};
    set sedativeLevel(val: number) {this.SetBuiltInLevel("sedative", val);}
    get mindControlLevel(): number {return this.GetBuiltInLevel("mindcontrol");};
    set mindControlLevel(val: number) {this.SetBuiltInLevel("mindcontrol", val);}
    get hornyLevel(): number {return this.GetBuiltInLevel("horny");};
    set hornyLevel(val: number) {this.SetBuiltInLevel("horny", val);}
    get suggestibleLevel(): number {return this.GetBuiltInLevel("suggestible");};
    set suggestibleLevel(val: number) {this.SetBuiltInLevel("suggestible", val);}

    /** True while a cooldown tick is lowering a built-in level, so the change can be saved lazily. */
    private decaying = false;

    /** Saves and announces a built-in drug's new level. Decay isn't published (other clients animate the bar from the
     *  published decay rate) and is saved only now and then (SaveDecayedLevels). Doses, antidotes and wear-off are
     *  explicit events and save right away. */
    private LevelChanged(type: string, previous: number, level: number, max: number) {
        if (this.decaying && level > 0)
            this.decayUnsaved = true;
        else
            settingsSave(true);
        emit("drug.levelChanged", { type, previous, level, max });
        this.UpdateScreenEffects();
    }

    /** How strong the faint green tint of the suggestible is (the tint's alpha): it grows with the bar, and is off with the drug visuals. */
    SuggestibleTint(): number {
        return this.Enabled && this.settings.enableDrugVisuals !== false ? this.SuggestibleFraction() * SUGGESTIBLE_VISUALS.TINT : 0;
    }

    /** How full the suggestible bar is, 0 to 1. */
    SuggestibleFraction(): number {
        const max = this.suggestibleMax * this.drugLevelMultiplier;
        return max > 0 ? Math.min(1, Math.max(0, this.suggestibleLevel / max)) : 0;
    }

    /** Brings the screen effects in line with the drugs and hypnosis: a sway that grows with the suggestible bar, and a turning
     *  spiral while hypnotized (or a little, while brainwashing builds). */
    UpdateScreenEffects() {
        const visuals = this.Enabled && this.settings.enableDrugVisuals !== false;
        // The sway is a kind of blur, so it follows BC's blur preference exactly as the blur itself does.
        const blurAllowed = !!Player?.GraphicsSettings?.AllowBlur;
        setWaveEffect(visuals && blurAllowed && this.settings.enableSuggestibleWave !== false ? this.SuggestibleFraction() * SUGGESTIBLE_VISUALS.WAVE : 0);

        const mindMax = this.mindControlMax * this.drugLevelMultiplier;
        const building = mindMax > 0 ? Math.min(1, this.mindControlLevel / mindMax) * SUGGESTIBLE_VISUALS.SPIRAL_BUILDING : 0;
        const hypnoSettings = (Player?.LSCG as { HypnoModule?: { enableSpiralOverlay?: boolean; spiralTurnSeconds?: number } } | undefined)?.HypnoModule;
        const spiralOn = visuals && hypnoSettings?.enableSpiralOverlay !== false;
        setSpiralEffect(spiralOn ? Math.max(this.brainwashed ? SUGGESTIBLE_VISUALS.SPIRAL_HYPNOTIZED : 0, building) : 0, undefined, hypnoSettings?.spiralTurnSeconds);
    }

    /** When each drug (built-in key or extension id) last decayed. */
    private decayAt = new Map<string, number>();

    /** Milliseconds of decay owed to `key` since it last decayed, by the clock so a throttled background tab still
     *  decays. Capped, so a computer waking from sleep doesn't count the time it was asleep: drugs only wear off
     *  while the player is online. */
    private DecayElapsedMs(key: string, now = Date.now()): number {
        const last = this.decayAt.get(key) ?? now;
        this.decayAt.set(key, now);
        return Math.min(MAX_DECAY_STEP_MS, Math.max(0, now - last));
    }

    /** Each built-in drug's decay in level units per second, as published for other clients to animate. */
    DecayRatesPerSec() {
        const perSec = (cooldownMs: number) => cooldownMs > 0 ? this.drugLevelMultiplier * 1000 / cooldownMs : 0;
        return Object.fromEntries(BUILT_IN_DRUGS.map(drug => [drug.id, perSec(this.settings[drug.cooldownKey])])) as Record<BuiltInDrugId, number>;
    }

    /** Every drug bar above zero for `C` (LSCG's own, then extensions'), as best this client can tell. Your own are exact. Someone else's
     *  are what they last broadcast, decayed forward at the rates they broadcast since it arrived; doses and decay since their next
     *  broadcast aren't known until it comes. Empty for a player with no LSCG, or one who isn't carrying any. */
    EstimatedBars(C: Character): DrugLevel[] {
        const published = ((C.IsPlayer() ? Player : getCharacter(C.MemberNumber!)) as OtherCharacter | null)?.LSCG?.InjectorModule;
        if (!published)
            return [];
        const bars: DrugLevel[] = [];
        const rates = published.drugDecay;
        const at = published.receivedAt; // only set for other players: our own levels are live
        const estimate = (level: number, rate?: number) => InjectorModule.EstimateLevel(level, rate, at);
        for (const drug of BUILT_IN_DRUGS) {
            // Another client may not publish a drug this one knows (an older version), so its level reads as missing.
            const level = estimate(published[drug.levelKey] ?? 0, rates?.[drug.id]);
            if (level > 0)
                bars.push({ type: drug.id, level, max: (published[drug.maxKey] ?? 0) * published.drugLevelMultiplier });
        }
        for (const bar of this.ExtensionBarsFor(C, published.drugLevels)) {
            const level = InjectorModule.EstimateLevel(bar.level, bar.decayPerSec, at);
            if (level > 0)
                bars.push({ type: bar.id, level, max: bar.max, color: bar.color });
        }
        return bars;
    }

    /** A level published by another client, decayed forward from when its packet arrived. */
    static EstimateLevel(level: number, perSec: number | undefined, receivedAt: number | undefined, now = Date.now()): number {
        if (!(level > 0) || !receivedAt || !(typeof perSec === "number" && perSec > 0) || !Number.isFinite(perSec))
            return level;
        return Math.max(0, level - perSec * Math.max(0, now - receivedAt) / 1000);
    }

    private Decay(change: () => void) {
        this.decaying = true;
        try { change(); } finally { this.decaying = false; }
    }

    get drugLevelMultiplier(): number {return this.settings.drugLevelMultiplier;};
    set drugLevelMultiplier(val: number) {if (this.settings.drugLevelMultiplier != val) {this.settings.drugLevelMultiplier = val; settingsSave(true);}}

    get sedativeMax(): number {return this.settings.sedativeMax;};
    set sedativeMax(val: number) {if (this.settings.sedativeMax != val) {this.settings.sedativeMax = val; settingsSave(true);}}
    get mindControlMax(): number {return this.settings.mindControlMax;};
    set mindControlMax(val: number) {if (this.settings.mindControlMax != val) {this.settings.mindControlMax = val; settingsSave(true);}}
    get hornyLevelMax(): number {return this.settings.hornyLevelMax;};
    set hornyLevelMax(val: number) {if (this.settings.hornyLevelMax != val) {this.settings.hornyLevelMax = val; settingsSave(true);}}
    get suggestibleMax(): number {return this.settings.suggestibleMax;};
    set suggestibleMax(val: number) {if (this.settings.suggestibleMax != val) {this.settings.suggestibleMax = val; settingsSave(true);}}

    _targetSedativeLevel: number = 0;
    get targetSedativeLevel(): number {return Math.max(this.sedativeLevel, this._targetSedativeLevel);};
    _targetMindControlLevel: number = 0;
    get targetMindControlLevel(): number {return Math.max(this.mindControlLevel, this._targetMindControlLevel);};
    _targetHornyLevel: number = 0;
    get targetHornyLevel(): number {return Math.max(this.hornyLevel, this._targetHornyLevel);};

    cooldownIntervals: number[] = [];
    extensionDrugInterval: number = 0;
    hornyLastBumped: number = 0;
    cooldownTickMs: number = CHECK_INTERVALS.COOLDOWN_TICK;

    InjectionLocationTable: Map<string, number> = new Map<string, number>(Object.entries(locationObj));

    /** Every drug type with the keywords that name it: the built-in ones, then each extension's. Gases and soaked items both read this,
     *  so an extension drug works in both without further wiring. */
    DrugKeywordTable(): { type: AnyDrugType; keywords: string[]; soakKeywords: string[] }[] {
        return [
            ...BUILT_IN_DRUGS.map(drug => {
                const keywords = this.settings[drug.keywordsKey] ?? [];
                return { type: drug.id as AnyDrugType, keywords, soakKeywords: [...new Set([...drug.soakKeywords, ...keywords])] };
            }),
            { type: "antidote", keywords: this.settings.cureKeywords ?? [], soakKeywords: [] },
            ...extensionDrugs.all().map(drug => ({ type: drug.id as AnyDrugType, keywords: drug.keywords, soakKeywords: [...new Set([...drug.soakKeywords, ...drug.keywords])] })),
        ];
    }

    /** The drug types an item's crafted name and description name. With `suffixes`, it's the soak keywords that count, each followed by
     *  one of them ("sedative" + "-soaked", "intoxicant" + "-laced"); a space in place of the hyphen is fine. */
    ResolveDrugTypes(item: CraftingPartialItem, suffixes: readonly string[] = []): AnyDrugType[] {
        const name = item.Name;
        const description = CraftingDescription.Decode(item.Description);
        const totalString = name + " | " + description;
        const soaked = suffixes.length > 0;
        return this.DrugKeywordTable()
            .filter(entry => soaked
                ? entry.soakKeywords.some(ph => suffixes.some(suffix => isPhraseInString(totalString, ph + suffix, true) || isPhraseInString(totalString, ph + suffix.replace("-", " "), true)))
                : entry.keywords.some(ph => isPhraseInString(totalString, ph, true)))
            .map(entry => entry.type);
    }

    GetDrugTypes(item: CraftingPartialItem): AnyDrugType[] {
        return this.ResolveDrugTypes(item);
    }

    /** The drug types a mouth/face item is soaked or laced with ("sedative-soaked", "intoxicant-laced", an extension drug's keyword + "-soaked", ...).
     *  Antidote is not soakable. */
    GetSoakedDrugTypes(item: CraftingPartialItem): AnyDrugType[] {
        return this.ResolveDrugTypes(item, SOAKED_ITEMS.KEYWORD_SUFFIXES).filter(t => t !== "antidote");
    }

    IsDrugAllowed(sender: Character): boolean {
        const asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return false;
        const types = this.GetDrugTypes(asset.Craft!);
        return types.some(t => t === "antidote" || this.IsDrugTypeEnabled(t));
    }

    /** Drug types this player has enabled (antidote is always allowed). */
    EnabledDrugTypes(types: AnyDrugType[]): AnyDrugType[] {
        return types.filter(t => t === "antidote" || this.IsDrugTypeEnabled(t));
    }

    /** Whether the player has opted in to a built-in or extension drug type. */
    IsDrugTypeEnabled(type: string): boolean {
        if (isExtensionDrugId(type))
            return this.ExtensionDrugEnabled(type);
        const def = builtInDrug(type);
        return !!def && !!this.settings[def.enableKey];
    }

    /** Runs the "drug.beforeApply" hook. Returns the types still to apply and how strong the dose is (1 unless softened): extensions may only
     *  remove types and lower the strength. */
    HookDrugApply(types: AnyDrugType[], method: LSCGDrugMethod, sender?: Character | null, location?: string): { types: AnyDrugType[]; strength: number } {
        if (types.length === 0)
            return { types, strength: 1 };
        const hook = emitBefore("drug.beforeApply", { types: [...types], strength: 1, method, sender: sender?.MemberNumber, location });
        if (hook.cancelled)
            return { types: [], strength: 1 };
        const asked = hook.payload.strength;
        const strength = typeof asked === "number" && Number.isFinite(asked) ? Math.min(1, Math.max(0, asked)) : 1;
        return { types: types.filter(t => hook.payload.types.includes(t)), strength };
    }

    ProcessDruggedDrink(sender: Character, fullPour: boolean = false) {
        const asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;
        //var multiplier = ((<any>asset.Property)?.SipLimit ?? 1) - ((<any>asset.Property)?.SipCount ?? 0)
        const { types, strength } = this.HookDrugApply(this.EnabledDrugTypes(this.GetDrugTypes(asset.Craft!)), "drink", sender);
        if (types.indexOf("sedative") > -1)
            this.DrinkSedative(sender, fullPour, strength);
        if (types.indexOf("mindcontrol") > -1)
            this.DrinkMindControl(sender, fullPour, strength);
        if (types.indexOf("horny") > -1)
            this.DrinkHorny(sender, fullPour, strength);
        if (types.indexOf("suggestible") > -1)
            this.DrinkSuggestible(sender, fullPour, strength);
        if (types.indexOf("antidote") > -1)
            this.DrinkCure(sender);
        for (const id of types.filter(isExtensionDrugId))
            this.ApplyExtensionDrug(id, "drink", { multiplier: DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER * strength, sender });
        if (types.length > 0)
            emit("drug.applied", { types, method: "drink", sender: sender.MemberNumber });
    }

    ProcessInjection(sender: Character, location: AssetGroupItemName) {
        const asset = InventoryGet(sender, "ItemHandheld");
        if (!asset?.Craft)
            return;

        const allTypes = this.GetDrugTypes(asset.Craft!);
        const { types, strength } = this.HookDrugApply(this.EnabledDrugTypes(allTypes), "inject", sender, location);
        // A vetoed injection is still a needle: only stay silent if nothing was in it.
        if (!AudioShouldSilenceSound(true) && allTypes.length > 0)
            AudioPlayInstantSound(AUDIO.INJECTION, getPlayerVolume(0));

        if (types.indexOf("sedative") > -1)
            this.InjectSedative(sender, location, strength);
        if (types.indexOf("mindcontrol") > -1)
            this.InjectMindControl(sender, location, strength);
        if (types.indexOf("horny") > -1)
            this.InjectHorny(sender, location, strength);
        if (types.indexOf("suggestible") > -1)
            this.InjectSuggestible(sender, location, strength);
        if (types.indexOf("antidote") > -1)
            this.InjectCure(sender, location);
        for (const id of types.filter(isExtensionDrugId))
            this.ApplyExtensionDrug(id, "inject", { multiplier: (this.InjectionLocationTable.get(location) ?? 1) * strength, sender, location });
        if (types.length > 0)
            emit("drug.applied", { types, method: "inject", sender: sender.MemberNumber, location });
    }

    sedativeInjectStr = [
        "%NAME% sighs as a cool relaxing calm glides through %POSSESSIVE% body, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscles relax as %OPP_NAME%'s sedative courses through %POSSESSIVE% body",
        "%NAME% fights to stay conscious against the relentless weight of %OPP_NAME%'s drug.",
        "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug.",
    ];

    sedativeDrinkStr = [
        "%NAME% gulps and swallows %OPP_NAME%'s drink, a cool relaxing feeling starting to spread through %POSSESSIVE% body.",
        "%NAME% sighs as a cool relaxing calm glides down %POSSESSIVE% throat, fighting to keep %POSSESSIVE% eyes open.",
        "%NAME%'s muscles relax as %OPP_NAME%'s sedative pours down %POSSESSIVE% throat and starts to take effect.",
        "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug.",
    ];

    AddSedative(multiplier: number, minigame: boolean = true) {
        const additive = this.drugLevelMultiplier * multiplier;
        const newLevel = Math.min(this.sedativeLevel + additive, this.sedativeMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetSedativeLevel = newLevel;
        // else
        this.sedativeLevel = newLevel;

        if (!this.asleep && minigame) {
            DialogLeave();
            MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * DRUG_EFFECT_MULTIPLIERS.MINIGAME_DIFFICULTY_MULTIPLIER), "LSCG_InjectEnd_Sedative");
        }

        CurrentModule = "Online";
    }

    DrinkSedative(sender: Character, fullPour: boolean = false, strength: number = 1) {
        this.AddSedative(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER * strength);
        SendAction(this.sedativeDrinkStr[getRandomInt(this.sedativeDrinkStr.length)], sender);
    }

    InjectSedative(sender: Character, location: AssetGroupItemName, strength: number = 1) {
        this.AddSedative((this.InjectionLocationTable.get(location) ?? 1) * strength);
        SendAction(this.sedativeInjectStr[getRandomInt(this.sedativeInjectStr.length)], sender);
        DrawFlashScreen("#5C5CFF", EFFECT_DURATIONS.FLASH_SCREEN, this.sedativeLevel * DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER);
    }

    brainwashInjectStr = [
        "%NAME% whimpers and struggles to keep control of %POSSESSIVE% mind.",
        "%NAME% gasps weakly as %OPP_NAME%'s drug slowly erases %POSSESSIVE% free will.",
        "%NAME%'s eyes struggle to focus as %OPP_NAME%'s drug makes %POSSESSIVE% more suggestible.",
    ];

    brainwashDrinkStr = [
        "%NAME% starts to drift dreamily as they swallow %OPP_NAME%'s drink.",
        "%NAME% gasps weakly and starts to lose focus as %OPP_NAME%'s drug warms %POSSESSIVE% comfortably.",
        "%NAME%'s eyes flutter and defocus as %OPP_NAME%'s drink slides warmly down %POSSESSIVE% throat.",
    ];

    /** Whoever last pushed the player toward brainwashing: a drinker or injector, or the crafter of the item doing it. It is who
     *  counts as their hypnotizer when it takes hold, since the dose that tips it over may not be the only one. */
    private mindControlSource?: number;

    /** `source`: who is responsible for this dose, if anyone is (see mindControlSource). */
    AddMindControl(multiplier: number, minigame: boolean = true, source?: number) {
        if (source !== undefined && source >= 0)
            this.mindControlSource = source;
        const additive = this.drugLevelMultiplier * multiplier;
        const newLevel = Math.min(this.mindControlLevel + additive, this.mindControlMax * this.drugLevelMultiplier);
        // if (gradual)
        //     this._targetMindControlLevel = newLevel;
        // else
        this.mindControlLevel = newLevel;

        if (!this.brainwashed && minigame)
            MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * DRUG_EFFECT_MULTIPLIERS.MINIGAME_DIFFICULTY_MULTIPLIER), "LSCG_InjectEnd_Brainwash");

        CurrentModule = "Online";
    }

    DrinkMindControl(sender: Character, fullPour: boolean = false, strength: number = 1) {
        this.AddMindControl(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER * strength, true, sender.MemberNumber);
        SendAction(this.brainwashDrinkStr[getRandomInt(this.brainwashDrinkStr.length)], sender);
    }

    InjectMindControl(sender: Character, location: AssetGroupItemName, strength: number = 1) {
        this.AddMindControl((this.InjectionLocationTable.get(location) ?? 1) * strength, true, sender.MemberNumber);
        SendAction(this.brainwashInjectStr[getRandomInt(this.brainwashInjectStr.length)], sender);
        DrawFlashScreen("#A020F0", EFFECT_DURATIONS.FLASH_SCREEN, this.mindControlLevel * DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER);
    }

    hornyInjectStr = [
        "%NAME% moans uncontrollably as %OPP_NAME%'s drug takes effect.",
        "%NAME%'s eyes roll back as a wave of pleasure washes over %POSSESSIVE% body.",
        "%NAME% quivers as %POSSESSIVE% body is flooded with %OPP_NAME%'s aphrodisiac.",
    ];

    hornyDrinkStr = [
        "%NAME% lets out a long low moan as %OPP_NAME%'s drink burns pleasurably down %POSSESSIVE% throat.",
        "%NAME%'s eyes roll back as a wave of pleasure emanates from %POSSESSIVE% belly.",
        "%NAME% gulps and quivers as %POSSESSIVE% body is slowly flooded with %OPP_NAME%'s aphrodisiac.",
    ];

    AddHorny(multiplier: number, forceCum: boolean = true, flash: boolean = false) {
        const additive = this.drugLevelMultiplier * multiplier;
        const newLevelActual = this.hornyLevel + additive;

        this.hornyLevel = Math.min(newLevelActual, this.hornyLevelMax * this.drugLevelMultiplier);
        if (newLevelActual >= this.hornyLevelMax * this.drugLevelMultiplier && forceCum) {
            ActivityOrgasmPrepare(Player);
            this.settings.stats.forcedOrgasmCount++;
            settingsSave();
        }

        if ((<any>Player).BCT?.splitOrgasmArousal?.arousalProgress) {
            (<any>Player).BCT.splitOrgasmArousal.arousalProgress = AROUSAL_LIMITS.BCT_SPLIT_ORGASM;
        }
    }

    DrinkHorny(sender: Character, fullPour: boolean = false, strength: number = 1) {
        this.AddHorny(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER * strength);
        SendAction(this.hornyDrinkStr[getRandomInt(this.hornyDrinkStr.length)], sender);
    }

    InjectHorny(sender: Character, location: AssetGroupItemName, strength: number = 1) {
        this.AddHorny((this.InjectionLocationTable.get(location) ?? 1) * strength);
        SendAction(this.hornyInjectStr[getRandomInt(this.hornyInjectStr.length)], sender);
        DrawFlashScreen("#FF647F", EFFECT_DURATIONS.FLASH_SCREEN, this.hornyLevel * DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER);
    }

    suggestibleInjectStr = [
        "%NAME% sways, a warm, pliant haze sinking through %POSSESSIVE% thoughts.",
        "%NAME%'s eyes go soft as %OPP_NAME%'s drug makes every little thing sound like a very good idea.",
        "%NAME% giggles dreamily, %POSSESSIVE% resistance melting away.",
    ];

    suggestibleDrinkStr = [
        "%NAME% blinks slowly, %POSSESSIVE% thoughts going pleasantly fuzzy.",
        "%NAME% sighs and sways as %OPP_NAME%'s drink warms %POSSESSIVE% head and loosens %POSSESSIVE% will.",
        "%NAME% smiles vaguely, suddenly very eager to please.",
    ];

    /** The phrase someone asked `names` to do, or undefined if the message isn't a request to one of them. Recognises, with the name first
     *  (a comma or colon after it is fine) or last: "would/could/can/will you [please|kindly] X", "please X", "I want/need/'d like you to X",
     *  "you will X", and "X, <name>". Case and ending punctuation don't matter, and "please" and a trailing "for me" are dropped. */
    static ParseRequest(msg: string, names: string[]): string | undefined {
        const escaped = names.map(n => n.trim()).filter(n => n !== "").map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        if (escaped.length === 0 || !msg)
            return undefined;
        const name = `(?:${escaped.join("|")})`;
        const sep = String.raw`\s*[,:]?\s*`;
        // Request openers that follow the name: "would you please", "please", "I want you to"...
        const polite = String.raw`(?:(?:please|kindly)${sep})`;
        const opener = String.raw`(?:(?:would|could|can|will) you(?! (?:like|mind|ever|rather|be|have|know|say|tell me|do you))\s+${polite}*|${polite}+|i(?:'d| would)? (?:want|need|would like|'d like|like) you to\s+${polite}*|you (?:will|must|shall|are going to)\s+${polite}*)`;

        const text = msg.trim();
        const lead = new RegExp(String.raw`^${name}${sep}${opener}(.+)$`, "i").exec(text);
        // "kneel, sera" / "kneel for me sera": the name closes the line.
        const trail = new RegExp(String.raw`^(.+?)${sep}${name}\s*[?.!]*$`, "i").exec(text);
        const leadTrailing = new RegExp(String.raw`^${polite}*(.+?)${sep}${name}\s*[?.!]*$`, "i").exec(text);
        const raw = lead?.[1] ?? leadTrailing?.[1] ?? trail?.[1];
        if (raw === undefined)
            return undefined;

        const phrase = raw
            .replace(/[?.!\s]+$/, "")
            .replace(/\s+for me(?:\s+(?:please|kindly))?$/i, "")
            .replace(/\s+(?:please|kindly)$/i, "")
            .replace(/^(?:please|kindly)\b[\s,:]*/i, "")
            .trim();
        // Something to actually do: punctuation alone ("would you please:") is a request that hasn't been finished, and a greeting or thanks isn't one.
        if (!phrase || !/\w/.test(phrase) || InjectorModule.IsNotARequest(phrase))
            return undefined;
        return phrase;
    }

    /** Short messages that are just a greeting, thanks or a one-word answer: calling someone by name with one isn't asking them to do anything. */
    static IsNotARequest(phrase: string): boolean {
        return /^(?:hi|hey|hello|heya|yo|hiya|thanks|thank you|thx|ty|sorry|bye|goodbye|good (?:morning|night|evening|day)|welcome|welcome back|yes|no|ok|okay|lol|haha|lmao|sure|please|kindly|sup|wb|brb|gn|gm)[\s?.!]*$/i.test(phrase.trim());
    }

    /** Turns something a speaker said about themselves into the same thing about them, for the player to read: "me" becomes their name,
     *  and "I", "my", "mine" and "myself" become their pronouns ("he", "his", "his", "himself" / "she", "her", "hers", "herself" /
     *  "they", "their", "theirs", "themself"). Whole words only, in any case. Verbs aren't re-conjugated beyond the contractions
     *  ("I'm" is "he's"), so "I like" reads "he like". */
    static AboutSpeaker(phrase: string, name: string, pronouns?: string): string {
        const he = pronouns === "HeHim";
        const she = pronouns === "SheHer";
        const subject = he ? "he" : she ? "she" : "they";
        const possessive = he ? "his" : she ? "her" : "their";
        const independent = he ? "his" : she ? "hers" : "theirs";
        const reflexive = he ? "himself" : she ? "herself" : "themself";
        const plural = !he && !she;
        const swaps: Record<string, string> = {
            myself: reflexive,
            mine: independent,
            my: possessive,
            me: name,
            "i am": plural ? "they are" : `${subject} is`,
            "i'm": plural ? "they're" : `${subject}'s`,
            "i've": plural ? "they've" : `${subject}'s`,
            "i'll": `${subject}'ll`,
            "i'd": `${subject}'d`,
            i: subject,
        };
        // One pass over whole words only, so what one swap produces (a name like "Meg") is never swapped again.
        const words = /\b(myself|mine|my|me|I am|I['’](?:m|ve|ll|d)|I)\b/gi;
        return phrase.replace(words, match => swaps[match.toLowerCase().replace("’", "'")] ?? match);
    }

    /** The names a request can open with: nickname, name, and the first word of each. */
    get RequestNames(): string[] {
        const names = [CharacterNickname(Player), Player.Name].filter(n => !!n);
        return [...new Set(names.flatMap(n => [n, n.split(/\s+/)[0]]))];
    }

    /** When each speaker last stirred an urge, so one speaker can't spam the player with them. */
    lastUrgeAt = new Map<number, number>();

    /** If the player is suggestible enough, tells them they feel an urge to do what another player just asked. Only a prompt: the
     *  player decides what to do. Returns whether an urge was felt. */
    SuggestibleUrge(msg: string, sender: Character | null): boolean {
        if (!this.Enabled || !this.settings.enableSuggestible || !sender || sender.IsPlayer())
            return false;
        const phrase = InjectorModule.ParseRequest(msg, this.RequestNames);
        if (!phrase)
            return false;
        const max = this.suggestibleMax * this.drugLevelMultiplier;
        const fraction = max > 0 ? this.suggestibleLevel / max : 0;
        if (fraction < SUGGESTIBLE_URGE.MIN_FRACTION)
            return false;
        const now = Date.now();
        if (now - (this.lastUrgeAt.get(sender.MemberNumber!) ?? 0) < SUGGESTIBLE_URGE.SENDER_COOLDOWN_MS)
            return false;
        // Always felt at the top of the bar; otherwise as likely as the bar is full.
        if (fraction < SUGGESTIBLE_URGE.OVERWHELMING_FRACTION && getRandomInt(100) >= fraction * 100)
            return false;
        const { types, strength } = this.HookDrugApply(this.EnabledDrugTypes(["suggestible"]), "breath", sender);
        if (!types.includes("suggestible") || strength <= 0)
            return false;
        this.lastUrgeAt.set(sender.MemberNumber!, now);
        const wording = fraction >= SUGGESTIBLE_URGE.OVERWHELMING_FRACTION ? "An overwhelming urge washes over you to"
            : fraction >= SUGGESTIBLE_URGE.STRONG_FRACTION ? "You have a strong urge to"
            : "You feel a faint urge to";
        // The same little bell a suggestion rings.
        if (!AudioShouldSilenceSound(true))
            AudioPlaySoundEffect("BellMedium");
        // "bring me my phone" was said by the speaker, so show it about them: "bring Locke his phone".
        const shown = InjectorModule.AboutSpeaker(phrase, CharacterNickname(sender), sender.GetPronouns?.());
        LSCG_SendLocal(`${wording} "${shown}".`);
        emit("drug.suggestionUrge", { sender: sender.MemberNumber!, phrase, level: this.suggestibleLevel, max });
        return true;
    }

    /** Suggestible: the higher the bar, the more agreeable the player becomes (see SuggestibleUrge). */
    AddSuggestible(multiplier: number) {
        const additive = this.drugLevelMultiplier * multiplier;
        this.suggestibleLevel = Math.min(this.suggestibleLevel + additive, this.suggestibleMax * this.drugLevelMultiplier);
    }

    DrinkSuggestible(sender: Character, fullPour: boolean = false, strength: number = 1) {
        this.AddSuggestible(DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER * strength);
        SendAction(this.suggestibleDrinkStr[getRandomInt(this.suggestibleDrinkStr.length)], sender);
    }

    InjectSuggestible(sender: Character, location: AssetGroupItemName, strength: number = 1) {
        this.AddSuggestible((this.InjectionLocationTable.get(location) ?? 1) * strength);
        SendAction(this.suggestibleInjectStr[getRandomInt(this.suggestibleInjectStr.length)], sender);
        DrawFlashScreen("#4CD964", EFFECT_DURATIONS.FLASH_SCREEN, this.suggestibleLevel * DRUG_EFFECT_MULTIPLIERS.DRINK_MULTIPLIER);
    }

    cureInjectStr = [
        "%NAME% moans thankfully as %OPP_NAME_POSSESSIVE% medicine heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME_POSSESSIVE% cure washes warmly over %POSSESSIVE%.",
        "%OPP_NAME_POSSESSIVE% drug rushes warmly through %NAME%'s body, curing what ails %POSSESSIVE%.",
    ];

    cureDrinkStr = [
        "%NAME% gulps thankfully as %OPP_NAME_POSSESSIVE% medicine slowly heals %POSSESSIVE%.",
        "%NAME%'s body glows slightly as %OPP_NAME_POSSESSIVE% cure glides warmly through %POSSESSIVE%.",
        "%OPP_NAME_POSSESSIVE_DIRECT% antidote slowly washes through %NAME_POSSESSIVE% body, curing what ails %POSSESSIVE%.",
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
        for (const drug of BUILT_IN_DRUGS)
            this.settings[drug.levelKey] = 0;
        // An antidote (and a safeword) clears extension drugs too.
        for (const id of Object.keys(this.settings.extensionDrugLevels ?? {}))
            this.SetExtensionLevel(id, 0);
        if (this.asleep) this.Wake();
        if (this.brainwashed) this.SnapBack();
        this.UpdateScreenEffects();
        this.settings.stats.curedCount++;
        settingsSave(true);
    }

    // Cooldown funcs fire every cooldownTickMs and decay by the wall-clock time since their last run. Called without
    // `now` (tests, forced ticks) they decay by exactly one tick.
    BuiltInCooldown(id: BuiltInDrugId, now?: number) {
        const def = builtInDrug(id)!;
        const elapsed = now === undefined ? this.cooldownTickMs : this.DecayElapsedMs(id, now);
        if (this.GetBuiltInLevel(id) <= 0)
            return;
        const subtractive = this.drugLevelMultiplier * elapsed / this.settings[def.cooldownKey];
        this.Decay(() => { this.SetBuiltInLevel(id, Math.max(0, this.GetBuiltInLevel(id) - subtractive)); });
        if (this.GetBuiltInLevel(id) <= 0)
            this.OnBuiltInDepleted(id);
    }

    /** What running out of a drug does beyond the bar emptying. */
    private OnBuiltInDepleted(id: BuiltInDrugId) {
        if (id === "sedative" && this.asleep)
            this.Wake();
        else if (id === "mindcontrol" && this.brainwashed)
            this.SnapBack();
    }

    SedativeCooldown(now?: number) { this.BuiltInCooldown("sedative", now); }
    MindControlCooldown(now?: number) { this.BuiltInCooldown("mindcontrol", now); }
    HornyCooldown(now?: number) { this.BuiltInCooldown("horny", now); }

    MiniGameEnd(type: "sedative" | "mindcontrol", success: boolean) {
        CommonSetScreen("Online", "ChatRoom");
        if (!success) {
            switch (type) {
                case "sedative":
                    this.Sleep(true, (getRandomInt(20) + 10) * 60 * 1000); // Sleep for 10-30 minutes
                    break;
                case "mindcontrol":
                    CharacterSetFacialExpression(Player, "Eyes", null);
                    this.Brainwash();
                    break;
            }
        }
    }

    Sleep(doEmote: boolean = true, duration?: number) {
        this.stateModule.SleepState.Activate(undefined, duration, doEmote);
        this.settings.stats.sedatedCount++;
    }

    Wake() {
        this.stateModule.SleepState.Recover(true);
    }

    Brainwash() {
        SendAction("%NAME%'s body goes limp as %POSSESSIVE% mind empties and %PRONOUN% awaits a command.");
        const by = this.mindControlSource;
        this.mindControlSource = undefined;
        this.stateModule.HypnoState.Activate(by);
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
        "%NAME% moans softly and relaxes...",
    ];

    ActivateSleepEvent() {
        SendAction(this.sleepBlockStrings[getRandomInt(this.sleepBlockStrings.length)]);
    }

    // ---- Extension drugs ----

    ExtensionDrugEnabled(id: string): boolean {
        return (this.settings.enabledExtensionDrugs ?? []).includes(id);
    }

    SetExtensionDrugEnabled(id: string, enabled: boolean) {
        const list = (this.settings.enabledExtensionDrugs ?? []).filter(x => x !== id);
        this.settings.enabledExtensionDrugs = enabled ? [...list, id] : list;
        settingsSave(true);
    }

    /** The player's values for a drug's declared options: each one checked against its field, missing or invalid ones at their default. */
    GetExtensionOptions(id: string): LSCGOptions {
        const drug = extensionDrugs.get(id);
        return sanitizeOptions(drug?.options ?? [], this.settings.extensionDrugOptions?.[id]);
    }

    /** What the options editor shows: stored values with defaults filled in, otherwise untouched so half-typed input survives. */
    EditableExtensionOptions(id: string): LSCGOptions {
        return editableOptions(extensionDrugs.get(id)?.options ?? [], this.settings.extensionDrugOptions?.[id]);
    }

    SetExtensionOptions(id: string, patch: LSCGOptions) {
        const all = this.settings.extensionDrugOptions ??= {};
        all[id] = { ...this.EditableExtensionOptions(id), ...patch };
        settingsSave(true);
    }

    GetExtensionLevel(id: string): number {
        const level = this.settings.extensionDrugLevels?.[id];
        return typeof level === "number" && Number.isFinite(level) ? level : 0;
    }

    /** Sets a drug's level (kept between 0 and its max), saving and syncing it. Falling to 0 runs onWearOff. */
    SetExtensionLevel(id: string, level: number, decaying = false): number {
        const drug = extensionDrugs.get(id);
        if (!drug)
            return 0;
        const next = Number.isFinite(level) ? Math.max(0, Math.min(drug.max, level)) : 0;
        const levels = this.settings.extensionDrugLevels ??= {};
        const previous = this.GetExtensionLevel(id);
        if (next === previous)
            return next;
        if (next <= 0)
            delete levels[id];
        else
            levels[id] = next;
        if (decaying && next > 0)
            this.decayUnsaved = true;
        else
            settingsSave(true);
        emit("drug.levelChanged", { type: id, previous, level: next, max: drug.max });
        // Stage callbacks, in bar order: rising crosses lowest first, falling highest first.
        if (drug.thresholds.length > 0) {
            const ctx = this.ExtensionContext(drug);
            if (next > previous)
                drug.thresholds.filter(t => previous < t.level && next >= t.level).forEach(t => t.onReach?.(ctx));
            else
                drug.thresholds.filter(t => next < t.level && previous >= t.level).reverse().forEach(t => t.onDrop?.(ctx));
        }
        if (previous > 0 && next <= 0)
            drug.onWearOff?.(this.ExtensionContext(drug));
        return next;
    }

    private inOnFull = new Set<string>();

    /** What an extension drug's callbacks receive. `level` is live, so it reflects addLevel/setLevel as they happen. */
    ExtensionContext(drug: ExtensionDrug, sender?: Character | null): LSCGDrugContext {
        // The `level` getter needs the module, not the context.
        const mod = this;
        return {
            drug: drug.id,
            get level() { return mod.GetExtensionLevel(drug.id); },
            max: drug.max,
            get options() { return mod.GetExtensionOptions(drug.id); },
            addLevel: (amount: number) => {
                const wanted = mod.GetExtensionLevel(drug.id) + (Number.isFinite(amount) ? amount : 0);
                const next = mod.SetExtensionLevel(drug.id, wanted);
                // A dose that overflows the bar always fires onFull; the guard stops onFull's own addLevel looping.
                if (wanted > drug.max && amount > 0 && drug.onFull && !mod.inOnFull.has(drug.id)) {
                    mod.inOnFull.add(drug.id);
                    try { drug.onFull(mod.ExtensionContext(drug, sender)); } finally { mod.inOnFull.delete(drug.id); }
                }
                return next;
            },
            setLevel: (level: number) => mod.SetExtensionLevel(drug.id, level),
            sendAction: (text: string) => SendAction(String(text), sender ?? null),
            states: builtInStates(mod.stateModule, sender?.MemberNumber ?? undefined),
        };
    }

    ApplyExtensionDrug(id: string, method: LSCGDrugMethod, dose: { multiplier: number; sender?: Character | null; location?: string }) {
        const drug = extensionDrugs.get(id);
        if (!drug) // the extension went away after the item was checked
            return;
        const ctx = Object.assign(this.ExtensionContext(drug, dose.sender), {
            method,
            multiplier: dose.multiplier,
            sender: dose.sender?.MemberNumber ?? undefined,
            location: dose.location,
        }) as LSCGDrugDoseContext;
        drug.onDose(ctx);
    }

    private extensionNextTick = new Map<string, number>();

    /** Wears each extension drug off at its own rate, and runs onTick for those still active. A drug ticks every
     *  `tickMs`; pass `now` to tick only the drugs that are due, or omit it to tick every drug once. */
    ExtensionDrugTick(now?: number) {
        for (const drug of extensionDrugs.all()) {
            const level = this.GetExtensionLevel(drug.id);
            if (level <= 0) {
                this.extensionNextTick.delete(drug.id);
                this.decayAt.delete(drug.id);
                continue;
            }
            if (now !== undefined) {
                if (now < (this.extensionNextTick.get(drug.id) ?? 0))
                    continue;
                this.extensionNextTick.set(drug.id, now + drug.tickMs);
            }
            // Forced ticks (no `now`) are one tick's worth.
            const elapsed = now === undefined ? drug.tickMs : this.DecayElapsedMs(drug.id, now);
            const remaining = this.SetExtensionLevel(drug.id, level - drug.decayPerMinute * (elapsed / 60000), true);
            if (remaining > 0 && this.Enabled && this.ExtensionDrugEnabled(drug.id)) {
                drug.onTick?.(this.ExtensionContext(drug));
                if (drug.onSpike && Math.random() < drug.spikeChance * (remaining / drug.max))
                    drug.onSpike(this.ExtensionContext(drug));
            }
        }
    }

    /** Current level of any drug type: built-ins on their internal scale, extensions 0 to their max. */
    GetDrugLevel(type: string): number {
        if (isBuiltInDrugId(type))
            return this.GetBuiltInLevel(type);
        return isExtensionDrugId(type) ? this.GetExtensionLevel(type) : 0;
    }

    /** Doses the player as an item would (opt-in check, "drug.beforeApply", "drug.applied") without the flavour text. */
    DoseDrug(type: string, opts: { method?: LSCGDrugMethod; multiplier: number; sender?: number; location?: string; minigame?: boolean }): boolean {
        const known = isExtensionDrugId(type) ? extensionDrugs.get(type) !== undefined : (isBuiltInDrugId(type) || type === "antidote");
        if (!known || !this.Enabled) // like an item dose: nothing happens while Drug Enhancements is off
            return false;
        const method = opts.method ?? "drink";
        const sender = getCharacter(opts.sender);
        const { types: [applied], strength } = this.HookDrugApply(this.EnabledDrugTypes([type as AnyDrugType]), method, sender, opts.location);
        if (!applied)
            return false;
        const minigame = opts.minigame ?? true;
        const multiplier = opts.multiplier * strength;
        switch (applied) {
            case "sedative": this.AddSedative(multiplier, minigame); break;
            case "mindcontrol": this.AddMindControl(multiplier, minigame, opts.sender); break;
            case "horny": this.AddHorny(multiplier, false); break;
            case "suggestible": this.AddSuggestible(multiplier); break;
            case "antidote": this.DoCure(); break;
            default: this.ApplyExtensionDrug(applied, method, { multiplier, sender, location: opts.location });
        }
        emit("drug.applied", { types: [applied], method, sender: opts.sender, location: opts.location });
        return true;
    }

    /** This player's extension drug bars as published to the room: only drugs with a level, from drugs we have. */
    PublicExtensionBars(): ExtensionDrugBar[] {
        return InjectorModule.FullestBars(extensionDrugs.all()
            .map(d => ({ id: d.id, level: this.GetExtensionLevel(d.id), max: d.max, color: d.color, decayPerSec: d.decayPerMinute / 60 }))
            .filter(b => b.level > 0));
    }

    /** At most MAX_EXTENSION_BARS, keeping the ones closest to full when there are more (ties keep their order). */
    static FullestBars(bars: ExtensionDrugBar[]): ExtensionDrugBar[] {
        if (bars.length <= MAX_EXTENSION_BARS)
            return bars;
        return bars
            .map((bar, index) => ({ bar, index, fill: bar.level / bar.max }))
            .sort((a, b) => b.fill - a.fill || a.index - b.index)
            .slice(0, MAX_EXTENSION_BARS)
            .sort((a, b) => a.index - b.index)
            .map(x => x.bar);
    }

    /** The extension bars to draw for `C`: our own from the registry, someone else's from what they published
     *  (which we sanity-check, since it came over the network). */
    ExtensionBarsFor(C: Character, published: ExtensionDrugBar[] | undefined): ExtensionDrugBar[] {
        if (C.IsPlayer())
            return this.PublicExtensionBars();
        if (!Array.isArray(published))
            return [];
        return InjectorModule.FullestBars(published
            .filter(b => !!b && typeof b.id === "string" && Number.isFinite(b.level) && b.level > 0 && Number.isFinite(b.max) && b.max > 0)
            .map(b => ({ id: b.id, level: b.level, max: b.max, decayPerSec: typeof b.decayPerSec === "number" && Number.isFinite(b.decayPerSec) && b.decayPerSec > 0 ? b.decayPerSec : undefined, color: typeof b.color === "string" && /^[#\w(),.%\s-]{1,40}$/.test(b.color) ? b.color : DEFAULT_DRUG_COLOR })));
    }

    /**
     * Draws Drug Level Bars
     * @param C Character for which to draw
     * @param X
     * @param Y
     * @param Zoom
     */
    DrawBars(C: Character, X: number, Y: number, Zoom: number, bars: DrugLevel[]) {
        const perRow = DRUG_BAR_DIMENSIONS.BARS_PER_ROW;
        bars?.slice(0, perRow * DRUG_BAR_DIMENSIONS.MAX_ROWS).forEach((bar, ix, arr) => {
            // Past a full row, wrap to a new one above the first rather than running out past the character.
            const row = Math.floor(ix / perRow);
            const col = ix % perRow;
            const barX = X + (DRUG_BAR_DIMENSIONS.X_OFFSET * Zoom) + (DRUG_BAR_DIMENSIONS.BAR_SPACING * col * Zoom);
            const barY = Y + (DRUG_BAR_DIMENSIONS.Y_OFFSET * Zoom) - (DRUG_BAR_DIMENSIONS.ROW_SPACING * row * Zoom);
            const barZoom = Zoom * DRUG_BAR_DIMENSIONS.BAR_ZOOM;
            const barProgress = Math.max(0, Math.min(100, bar.level / bar.max)) * 100;
            const color = builtInDrug(bar.type)?.color ?? bar.color ?? "#5C5CFF";
            DrawRect(barX, barY, (DRUG_BAR_DIMENSIONS.BAR_WIDTH * barZoom), (Math.round(DRUG_BAR_DIMENSIONS.BAR_HEIGHT * barZoom)), "Black");
            DrawRect(barX, barY + (Math.round((100 - barProgress) * DRUG_EFFECT_MULTIPLIERS.HORNY_AROUSAL_FACTOR * barZoom)), (DRUG_BAR_DIMENSIONS.BAR_WIDTH * barZoom), (Math.round(barProgress * DRUG_EFFECT_MULTIPLIERS.HORNY_AROUSAL_FACTOR * barZoom)), color);
            DrawEmptyRect(barX, barY, (DRUG_BAR_DIMENSIONS.BAR_WIDTH * barZoom), (Math.round(DRUG_BAR_DIMENSIONS.BAR_HEIGHT * barZoom)), color);
        });
    }

    ProcessGradualLevels() {
        if (this._targetHornyLevel > 0){
            if (this.targetHornyLevel > this.hornyLevel) {
                const newHorny = Math.max(this.targetHornyLevel, this.hornyLevel + this.drugLevelMultiplier / DRUG_EFFECT_MULTIPLIERS.GRADUAL_LEVEL_DIVISOR);
                if (newHorny > this.hornyLevelMax * this.drugLevelMultiplier && Player.ArousalSettings?.Progress! > RANDOM_EVENT_ODDS.CHAOTIC_NET_HIT_CHANCE) {
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
                this.mindControlLevel = Math.max(this.targetMindControlLevel, this.mindControlLevel + this.drugLevelMultiplier / DRUG_EFFECT_MULTIPLIERS.GRADUAL_LEVEL_DIVISOR);
                if (this.mindControlLevel == this.targetMindControlLevel) {
                    if (!this.brainwashed)
                        MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * DRUG_EFFECT_MULTIPLIERS.MINIGAME_DIFFICULTY_MULTIPLIER), "LSCG_InjectEnd_Brainwash");

                    CurrentModule = "Online";
                }
            }
            else
                this._targetMindControlLevel = 0;
        }

        if (this._targetSedativeLevel > 0){
            if (this.targetSedativeLevel > this.sedativeLevel) {
                this.sedativeLevel = Math.max(this.targetSedativeLevel, this.sedativeLevel + this.drugLevelMultiplier / DRUG_EFFECT_MULTIPLIERS.GRADUAL_LEVEL_DIVISOR);
                if (this.sedativeLevel == this.targetSedativeLevel) {
                    if (!this.asleep)
                        MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * DRUG_EFFECT_MULTIPLIERS.MINIGAME_DIFFICULTY_MULTIPLIER), "LSCG_InjectEnd_Sedative");

                    CurrentModule = "Online";
                }
            }
            else
                this._targetSedativeLevel = 0;
        }
    }

    HoldingDruggedDrink(C: Character): boolean {
        const item = InventoryGet(C, "ItemHandheld");
        if (!item || (item.Asset.Name != "GlassFilled" && item.Asset.Name != "Mug") || !item.Craft)
            return false;
        const drugTypes = this.GetDrugTypes(item.Craft!);
        return drugTypes.length > 0;
    }

    static readonly SIP_CONTENT = "ChatOther-ItemMouth-SipItem";
    static readonly SIP_OFFER_CONTENT = "LSCG_Offer-ChatOther-ItemMouth-SipItem";

    /** A sip is an offer when the target gets a say: another LSCG user whose mouth isn't held open. */
    IsSipOffer(target: Character | null | undefined): boolean {
        if (!this.Enabled || !target || target.IsPlayer())
            return false;
        if (!(target as unknown as OtherCharacter).LSCG?.InjectorModule?.enabled)
            return false;
        return this.GetGagDrinkAccess(target) == "nothing";
    }

    HeldDrinkName(C: Character): string {
        const item = InventoryGet(C, "ItemHandheld");
        return item ? GetItemName(item) : "drink";
    }

    /** Applies everything in an offered drink the target has already agreed to (or been forced) to take. */
    ApplyOfferedSip(sender: Character) {
        this.ProcessDruggedDrink(sender);
        const magic = getModule<MagicModule>("MagicModule");
        if (magic?.Enabled)
            magic.HandleQuaff(sender, true);
    }

    ConsumeSip(fullPour: boolean) {
        const glass = InventoryGet(Player, "ItemHandheld");
        if (glass?.Asset.Name != "GlassFilled")
            return;
        if (!fullPour) {
            if (!glass.Property) glass.Property = {};
            if (!glass.Property.SipLimit) glass.Property.SipLimit = this.settings.sipLimit;
            if (!glass.Property.SipCount) glass.Property.SipCount = 1;
            else glass.Property.SipCount++;
        }
        if (fullPour || glass.Property!.SipLimit! > 0 && glass.Property!.SipCount! >= glass.Property!.SipLimit!) {
            SendAction("%NAME%'s uses up the last drop of %POSSESSIVE% drink.");
            const craft = glass.Craft;
            InventoryRemove(Player, "ItemHandheld", false);
            InventoryWear(Player, "GlassEmpty", "ItemHandheld", glass.Color, glass.Difficulty, Player.MemberNumber, craft, false);
            ChatRoomCharacterUpdate(Player);
        }
    }

    GetGagDrinkAccess(C: Character): GagDrinkAccess {
        const mouthItems = [
            InventoryGet(C, "ItemMouth"),
            InventoryGet(C, "ItemMouth2"),
            InventoryGet(C, "ItemMouth3"),
        ].filter(g => !!g);
        const gagOverrideAllowChecks = [
            ["FunnelGag", 1],
            ["RingGag"],
        ];

        const overrideGag = mouthItems.find(gag => gagOverrideAllowChecks.map(o => o[0]).indexOf(gag?.Asset.Name!) > -1);
        if (overrideGag) {
            const check = gagOverrideAllowChecks.find(x => x[0] == overrideGag?.Asset.Name);
            if (!!check && (check.length == 1 || check[1] == (overrideGag.Property?.TypeRecord ?? {})["typed"]))
                return "open";
        }

        const blocked = C.IsMouthBlocked();
        const isOpen = C.IsMouthOpen();
        if (blocked)
            return "blocked";
        else if (!blocked && isOpen)
            return "open";
        else
            return "nothing";
    }

    /** Rolls to resist a forced drink, calling apply on a successful force. Returns whether the force succeeded. */
    TryForceDrink(sender: Character, fullPour: boolean = false, apply: () => void = () => this.ProcessDruggedDrink(sender, fullPour)): boolean {
        const itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            apply();
            return true;
        }
        const itemName = itemUseModule.getItemName(InventoryGet(sender, "ItemHandheld")!);
        const check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
            SendAction(`${CharacterNickname(sender)} ${check.AttackerRoll.TotalStr}manages to get %OPP_POSSESSIVE% ${itemName} past ${CharacterNickname(Player)}'s ${check.DefenderRoll.TotalStr}lips, forcing %INTENSIVE% to swallow.`, sender);
            setTimeout(apply, EFFECT_DURATIONS.ACTION_DELAY);
            return true;
        } else {
            SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully defends against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}attempt to force %INTENSIVE% to drink %OPP_POSSESSIVE% ${itemName}, spilling drink all over.`, sender);
            return false;
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
                    settingsSave();
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
                    settingsSave();
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
                const hasHose = item.Property.TypeRecord["f"] == 2 || item.Property.TypeRecord["f"] == 3;
                const isDrugged = this.GetDrugTypes(item.Craft).length > 0;
                return hasHose && isDrugged;
            },
            IsActive: (item: Item) => {
                return item?.Property?.TypeRecord?.["g"] == 1;
            },
            ExhaustItem: (item: Item) => {
                if (item?.Property?.TypeRecord)
                    item.Property.TypeRecord["g"] = 0;
            },
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
            },
        },
    ];

    // IsInContinuousDelivery
    get IsWearingRespirator(): boolean {
        const item = this.WornRespirator;
        const isWearing = item != null;
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
        const hasGas = this._respiratorHasGas;
        if (!hasGas && this.IsWearingRespirator && this.IsRespiratorOn) {
            const item = this.WornRespirator;
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
            const item = device.AllowedGroups.map(grp => InventoryGet(Player, grp)).filter(item => !!item && device.IsValid(item))[0] ?? null;
            return !item ? null : {
                Definition: device,
                Item: item,
            };
        }).filter(device => !!device && !!device.Item)[0] ?? null;
    }

    get IsRespiratorOn(): boolean {
        const item = this.WornRespirator;
        if (item)
            return item.Definition.IsActive(item.Item);
        else
            return false;
    }

    get IsContinuousDeliveryActive(): boolean {
        return this.Enabled && this.IsWearingRespirator && this.RespiratorHasGas && this.IsRespiratorOn;
    }

    headsetMindControlEventStr: string[] = [
        "%NAME% groans helplessly as %POSSESSIVE% headset manipulates %POSSESSIVE% mind.",
        "%NAME% struggles to keep %POSSESSIVE% focus through the overwhelming influence of %POSSESSIVE% headset.",
        "%NAME% whimpers as %POSSESSIVE% headset erases %POSSESSIVE% own mind relentlessly.",
    ];

    hypnoItems: {name: string, active: (item: Item) => boolean }[] = [
        {name: "InteractiveVRHeadset", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["b"] == 5 },
        {name: "TechnoHelmet1", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["v"] == 5 },
        {name: "HypnoticVisor", active: item => !!item?.Property?.TypeRecord && item?.Property?.TypeRecord["p"] != 0 },
    ];

    CheckForHypnoHelmet() {
        // Use new spirals setting for hypno headsets
        if (!Player.LSCG.HypnoModule.enableSpirals)
            return;
        const hypnoItem = Player.Appearance.find(item => this.hypnoItems.some(hypnoItem => hypnoItem.name == item.Asset.Name && hypnoItem.active(item)));

        if (hypnoItem) {
            // An item has no sender: whoever crafted it is who hypnotizes the wearer.
            const crafter = hypnoItem.Craft?.MemberNumber;
            const randomLevelIncrease = (getRandomInt(4) + 2) / (1 / BREATH_DRUG_INCREASES.MIN_INCREASE); // .2 to .5
            if (getRandomInt(RANDOM_EVENT_ODDS.HYPNO_HEADSET_BIG_JUMP) == 0) { // Odds are big jump once every 10 seconds
                if (!this.brainwashed) SendAction(this.headsetMindControlEventStr[getRandomInt(this.headsetMindControlEventStr.length)]);
                this.AddMindControl(randomLevelIncrease + BREATH_DRUG_INCREASES.BIG_JUMP_BASE, getRandomInt(RANDOM_EVENT_ODDS.HYPNO_HEADSET_MINIGAME_CHANCE) != 0, crafter); // 2/3 chance to start incap minigame
            } else this.AddMindControl(randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR, false, crafter);
        }
    }

    breathSedativeEventStr: string[] = [
        "%NAME%'s muscles relax limply as %PRONOUN% takes a deep breath.",
        "%NAME%'s eyes flutter weakly as %PRONOUN% inhales.",
        "%NAME% struggles to keep %POSSESSIVE% drooping eyes open as %POSSESSIVE% device continues to emit its sedative gas.",
    ];

    breathMindControlEventStr: string[] = [
        "%NAME% groans helplessly as %POSSESSIVE% device sends another dose into %POSSESSIVE% lungs.",
        "%NAME% struggles to keep %POSSESSIVE% focus through the suggestible haze caused by %POSSESSIVE% device.",
        "%NAME% whimpers as %POSSESSIVE% device's drug pushes %POSSESSIVE% further out of %POSSESSIVE% own mind.",
    ];

    breathAphrodesiacEventStr: string[] = [
        "%NAME%'s spine tingles as %PRONOUN% takes a deep breath of drug.",
        "%NAME% lets out a muffled moan as %PRONOUN% inhales.",
        "%NAME%'s sensitive areas burn hot as %PRONOUN% breathes of drug.",
    ];

    /** Whether a soakable slot is in the mouth (tasted and swallowed) rather than over the nose or face (breathed through damp cloth). */
    isMouthSoakSlot(group: string): boolean {
        return group.startsWith("ItemMouth");
    }

    /** Big-jump emotes for soaked items: short, one beat each. In the mouth a soak is tasted and swallowed; over the nose or face the
     *  damp cloth is breathed through. */
    soakedEmotes(item: string, group: string): { sedative: string[]; mindcontrol: string[]; horny: string[]; suggestible: string[] } {
        if (!this.isMouthSoakSlot(group)) {
            return {
                sedative: [
                    "%NAME% breathes damply, %POSSESSIVE% eyelids drooping...",
                    "%NAME%'s eyes flutter as the cloying dampness fills %POSSESSIVE% head.",
                    `%NAME% sags weakly behind %POSSESSIVE% ${item}.`,
                ],
                mindcontrol: [
                    "%NAME% breathes shakily, %POSSESSIVE% eyes glazing over...",
                    "%NAME% whimpers, the damp scent dissolving %POSSESSIVE% thoughts.",
                    `%NAME% goes limp behind %POSSESSIVE% ${item}, %POSSESSIVE% will slipping.`,
                ],
                horny: [
                    "%NAME% shivers, flushing warm.",
                    "%NAME% moans softly as the sweet scent clings to %POSSESSIVE% breath.",
                    `%NAME% squirms, breathing deep behind %POSSESSIVE% ${item}.`,
                ],
                suggestible: [
                    "%NAME% sways, the damp scent softening %POSSESSIVE% thoughts.",
                    "%NAME% giggles faintly, eyes unfocused.",
                    `%NAME% sighs behind %POSSESSIVE% ${item}, suddenly eager to please...`,
                ],
            };
        }
        return {
            sedative: [
                "%NAME% swallows, %POSSESSIVE% eyelids drooping...",
                "%NAME%'s eyes flutter as the bitter taste spreads across %POSSESSIVE% tongue.",
                `%NAME% sags weakly around %POSSESSIVE% ${item}, drool slipping free.`,
            ],
            mindcontrol: [
                "%NAME% swallows, %POSSESSIVE% eyes glazing over...",
                "%NAME% whimpers, the taste dissolving %POSSESSIVE% thoughts.",
                `%NAME% gulps reflexively around %POSSESSIVE% ${item}, %POSSESSIVE% will slipping.`,
            ],
            horny: [
                "%NAME% shivers and swallows, flushing warm.",
                "%NAME% moans softly as the sweet taste floods %POSSESSIVE% tongue.",
                `%NAME% squirms, sucking helplessly at %POSSESSIVE% ${item}.`,
            ],
            suggestible: [
                "%NAME% swallows, thoughts going pleasantly fuzzy.",
                "%NAME% giggles faintly around %POSSESSIVE% " + item + ", eyes unfocused.",
                "%NAME% sighs, the taste making everything sound like a good idea...",
            ],
        };
    }

    breathSuggestibleEventStr: string[] = [
        "%NAME% sways, a pleasant haze settling over %POSSESSIVE% thoughts.",
        "%NAME% giggles faintly, eyes unfocused.",
        "%NAME% sighs, suddenly eager to be told what to do...",
    ];

    breathAntidoteEventStr: string[] = [
        "%NAME% sighs with relief as %PRONOUN% takes a deep gulp of healing mist.",
        "%NAME% feels a tingle across %POSSESSIVE% skin as %POSSESSIVE% device heals %INTENSIVE%.",
        "%NAME% lets out a quiet moan as %POSSESSIVE% device releases a healing mist into %POSSESSIVE% lungs.",
    ];

    BreathInDrugEvent() {
        if (this.IsContinuousDeliveryActive) {
            const mask = this.WornRespirator;
            if (!mask)
                return;
            this.ApplyBreathDoses(this.GetDrugTypes(mask.Item.Craft!), mask.Item.Craft?.MemberNumber, undefined, this.GasStrength);
        }
    }

    /** Slots a "<drug>-soaked" item can sit in: anything in or over the mouth or nose. */
    soakedSlots: AssetGroupName[] = ["ItemMouth", "ItemMouth2", "ItemMouth3", "ItemNose", "ItemHood", "ItemHead"];

    soakedKey(group: string, item: Item): string {
        return `${group}:${item.Asset.Name}:${item.Craft?.MemberNumber ?? 0}:${item.Craft?.Name ?? ""}`;
    }

    /** Crafted items worn in a soakable slot that name a drug they are soaked in. */
    get WornSoakedItems(): { Key: string; Item: Item; Group: string; Types: AnyDrugType[] }[] {
        const worn: { Key: string; Item: Item; Group: string; Types: AnyDrugType[] }[] = [];
        for (const group of this.soakedSlots) {
            const item = InventoryGet(Player, group);
            if (!item?.Craft)
                continue;
            const types = this.GetSoakedDrugTypes(item.Craft);
            if (types.length > 0)
                worn.push({ Key: this.soakedKey(group, item), Item: item, Group: group, Types: types });
        }
        return worn;
    }

    /** Whether a soaked item (by key) is still wet: it starts the moment it is first seen worn and dries after the potency time. */
    IsSoakPotent(key: string, now: number = CommonTime()): boolean {
        const stamps = this.settings.soakedAt ??= {};
        if (stamps[key] === undefined) {
            stamps[key] = now;
            settingsSave();
        }
        return !!this.settings.infiniteSoakPotency || stamps[key] + (this.settings.soakedPotencyTime ?? SOAKED_ITEMS.DEFAULT_POTENCY) > now;
    }

    /** Soaked items that dried out, so the "dried" message is said once per item. */
    private driedSoaks: Set<string> = new Set();

    /** Doses the wearer from every potent soaked item, one small breath at a time like a gas mask. Also forgets items no longer worn. */
    SoakedDrugEvent() {
        const stamps = this.settings.soakedAt ??= {};
        const worn = this.WornSoakedItems;
        const wornKeys = new Set(worn.map(w => w.Key));
        let pruned = false;
        for (const key of Object.keys(stamps)) {
            if (!wornKeys.has(key)) {
                delete stamps[key];
                this.driedSoaks.delete(key);
                pruned = true;
            }
        }
        if (pruned)
            settingsSave();

        if (!this.settings.enableSoakedItems)
            return;
        const now = CommonTime();
        for (const soaked of worn) {
            const justPutOn = stamps[soaked.Key] === undefined;
            if (!this.IsSoakPotent(soaked.Key, now)) {
                if (!this.driedSoaks.has(soaked.Key)) {
                    this.driedSoaks.add(soaked.Key);
                    this.DrugEmote(`The drug soaking %NAME%'s ${GetItemName(soaked.Item)} has finally dried out.`, false);
                }
                continue;
            }
            const itemName = GetItemName(soaked.Item);
            if (justPutOn && !this.asleep && !this.brainwashed && this.EnabledDrugTypes(soaked.Types).length > 0) {
                this.DrugEmote(this.isMouthSoakSlot(soaked.Group)
                    ? `%NAME%'s eyes widen at the wet, bitter-sweet taste of %POSSESSIVE% ${itemName}.`
                    : `%NAME%'s eyes widen as the damp, cloying scent of %POSSESSIVE% ${itemName} fills %POSSESSIVE% head.`, false);
                CharacterSetFacialExpression(Player, "Eyes", "Surprised", 4);
            }
            this.ApplyBreathDoses(soaked.Types, soaked.Item.Craft?.MemberNumber, this.soakedEmotes(itemName, soaked.Group), this.SoakedStrength);
        }
    }

    /** The player's gas strength as a multiplier (1 = standard). */
    get GasStrength() { return (this.settings.gasStrength ?? BREATH_STRENGTH_PERCENT.GAS_DEFAULT) / 100; }
    /** The player's soak strength as a multiplier of a standard gas dose. */
    get SoakedStrength() { return (this.settings.soakedStrength ?? SOAKED_ITEMS.DOSE_FACTOR * 100) / 100; }

    private lastBreathEmote = -Infinity;
    /** Least time (ms) between breathed-drug emotes, from the player's setting. 0 means no limit. */
    get DrugEmoteGap() {
        const minutes = this.settings.drugEmoteMinutes ?? CHECK_INTERVALS.BREATH_DRUG_EMOTE_MIN / 60_000;
        return Math.max(0, minutes) * 60_000;
    }

    /** A drug flavor emote, if the player has them on. Said to the room, or only shown to the player when they chose local.
     *  `rateLimited` emotes also wait out the gap since the last one: the dosing is steady, the chatter should not be. */
    DrugEmote(line: string, rateLimited = true) {
        if (this.settings.enableDrugEmotes === false)
            return;
        if (rateLimited) {
            const now = CommonTime();
            if (this.lastBreathEmote + this.DrugEmoteGap > now)
                return;
            this.lastBreathEmote = now;
        }
        if (this.settings.drugEmotesLocal)
            LSCG_SendLocal(replace_template(line));
        else
            SendAction(line);
    }
    BreathEmote(line: string) { this.DrugEmote(line); }

    /** One breath of drug: shared by respirators and soaked items. Applies the player's opt-ins, the extension hook, and every built-in
     *  and extension drug the types name. `crafterMemberNumber` is who is responsible for the dose. `emotes` replaces the gas wording. */
    ApplyBreathDoses(drugTypes: AnyDrugType[], crafterMemberNumber?: number, emotes?: { sedative?: string[]; mindcontrol?: string[]; horny?: string[]; suggestible?: string[] }, doseFactor: number = 1) {
        const pick = (lines: string[] | undefined, fallback: string[]) => { const l = lines ?? fallback; return l[getRandomInt(l.length)]; };
        if (drugTypes.length === 0)
            return;
        {
            const hooked = this.HookDrugApply(this.EnabledDrugTypes(drugTypes), "breath");
            const types = hooked.types;
            const strength = hooked.strength * doseFactor; // an extension may soften the dose, and a soak is gentler than a gas to begin with
            const randomLevelIncrease = (getRandomInt(4) + 2) / (1 / BREATH_DRUG_INCREASES.MIN_INCREASE) * strength; // .2 to .5, softened by an extension

            if (types.indexOf("sedative") > -1 && this.settings.enableSedative) {
                if (getRandomInt(RANDOM_EVENT_ODDS.BREATH_SEDATIVE_BIG_JUMP) == 0) { // Odds are big jump once every 60 seconds
                    if (!this.asleep) this.BreathEmote(pick(emotes?.sedative, this.breathSedativeEventStr));
                    this.AddSedative(randomLevelIncrease + BREATH_DRUG_INCREASES.BIG_JUMP_BASE * strength, getRandomInt(RANDOM_EVENT_ODDS.BREATH_MINIGAME_CHANCE) != 0); // 2/3 chance to start incap minigame
                } else this.AddSedative(randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR, false);
            }
            if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl) {
                if (getRandomInt(RANDOM_EVENT_ODDS.BREATH_MIND_CONTROL_BIG_JUMP) == 0) { // Odds are big jump once every 60 seconds
                    if (!this.brainwashed) this.BreathEmote(pick(emotes?.mindcontrol, this.breathMindControlEventStr));
                    this.AddMindControl(randomLevelIncrease + BREATH_DRUG_INCREASES.BIG_JUMP_BASE * strength, getRandomInt(RANDOM_EVENT_ODDS.BREATH_MINIGAME_CHANCE) != 0, crafterMemberNumber); // 2/3 chance to start incap minigame
                } else this.AddMindControl(randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR, false, crafterMemberNumber);
            }
            if (types.indexOf("horny") > -1 && this.settings.enableHorny) {
                if (getRandomInt(RANDOM_EVENT_ODDS.BREATH_HORNY_BIG_JUMP) == 0) { // Odds are big jump once every 90 seconds
                    this.BreathEmote(pick(emotes?.horny, this.breathAphrodesiacEventStr));
                    this.AddHorny(randomLevelIncrease + BREATH_DRUG_INCREASES.BIG_JUMP_BASE * strength, getRandomInt(RANDOM_EVENT_ODDS.HORNY_FORCE_CUM_CHANCE) == 0); // 1/3 chance to push user over the edge (if allowed...)
                } else this.AddHorny(randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR, false);
            }
            if (types.indexOf("suggestible") > -1 && this.settings.enableSuggestible) {
                if (getRandomInt(RANDOM_EVENT_ODDS.BREATH_SUGGESTIBLE_BIG_JUMP) == 0) {
                    this.BreathEmote(pick(emotes?.suggestible, this.breathSuggestibleEventStr));
                    this.AddSuggestible(randomLevelIncrease + BREATH_DRUG_INCREASES.BIG_JUMP_BASE * strength);
                } else this.AddSuggestible(randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR);
            }
            if (types.indexOf("antidote") > -1 && getRandomInt(RANDOM_EVENT_ODDS.BREATH_ANTIDOTE_HEAL) == 0) { // Odds are heal once every 4 minutes
                this.DrugEmote(this.breathAntidoteEventStr[getRandomInt(this.breathAntidoteEventStr.length)]);
                this.DoCure();
            }
            // Each breath is a small dose, like the built-in drugs' small ticks.
            for (const id of types.filter(isExtensionDrugId))
                this.ApplyExtensionDrug(id, "breath", { multiplier: randomLevelIncrease / BREATH_DRUG_INCREASES.SMALL_TICK_DIVISOR });
            if (types.length > 0)
                emit("drug.applied", { types, method: "breath" });
        }
    }

    // New Inhaled Drug Mechanism...
    // - On init, scan appearance for valid and active items, construct existing ledger from this list
    // - Every second/tick, check appearance for worn items that match an inhalation item definition
    // - For each possible item, check its configuration against the definition to see if it's active
    // - For each valid and active item, compare against ledger.
    //   - If active item is not in ledger, fire 'add' emote and include in ledger.
    //   - If ledger item is not in active list, fire 'remove' emote and delete from ledger.
    // - Additionally every tick, iterate through ledger and...
    //   - Apply drug ticks based on their configured drug types
    //   - Construct 'breath' emote base on one or more of the active items

}

