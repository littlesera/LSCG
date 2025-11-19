import { BaseModule } from "base";
import { MiscSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, GetItemNameAndDescriptionConcat, GetMetadata, getRandomInt, GetTargetCharacter, hookFunction, isPhraseInString, LSCG_SendLocal, OnAction, OnActivity, removeAllHooksByModule, SendAction, settingsSave, ICONS } from "../utils";
import { CureKeywords, getModule, HornyKeywords, MindControlKeywords, NetgunKeywords, SedativeKeywords } from "modules";
import { StateModule } from "./states";
import { SleepState } from "./States/SleepState";
import { LeashingModule } from "./leashing";
import { chaoticKeywords, evolvingKeywords, quickKeywords, slowKeywords } from "./chaotic-item";
import { ElectricKeywords, SelfTighteningKeywords, SubduingKeywords, TamperProofKeywords } from "./item-use";
import { CursedItemModule, CursedKeywords } from "./cursed-item";
import { AllowedNetGuns } from "./injector";

// interface used to define all Elements used in LSCG Effect menu in the Crafting screen.
interface ScreenElem {
    type: "checkbox" | "select"
    id_label: string,
    id_button: string,
    label: string,
    description: string,
    keywords: string[],
    condition: () => boolean
}

export class MiscModule extends BaseModule {
    get settings(): MiscSettingsModel {
        return super.settings as MiscSettingsModel;
	}

    get sleepState(): SleepState {
        return getModule<StateModule>("StateModule")?.SleepState;
    }

    // Disabled as it's managed via General
    // get settingsScreen(): Subscreen | null {
    //     return GuiMisc;
    // }

    get defaultSettings() {
        return <MiscSettingsModel>{
            enabled: true,
            chloroformEnabled: false,
            //immersiveChloroform: false,
            chloroformedAt: 0,
            chloroformPotencyTime: 60 * 60 * 1000, // 1 hour cooloff
            infiniteChloroformPotency: false,
            handChokeEnabled: false,
            gagChokeEnabled: false,
            chokeChainEnabled: false
        };
    }

    safeword(): void {
        this._removeChloroform();
    }

    load(): void {
        // Kneel on lap sit
        OnActivity(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            let target = GetTargetCharacter(data);
            if (!!target && 
                sender?.MemberNumber == Player.MemberNumber && 
                data.Content == "ChatOther-ItemLegs-Sit" &&
                PoseCanChangeUnaided(Player, "Kneel")) {
                PoseSetActive(Player, "Kneel", true);
                ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
            }

            if (target == Player.MemberNumber && !!sender) {
                switch (data.Content) {
                    case "ChatOther-ItemMouth-HandGag":
                    case "ChatSelf-ItemMouth-HandGag":
                        let senderItem = InventoryGet(sender, "ItemHandheld");
                        if (isPhraseInString(GetItemNameAndDescriptionConcat(senderItem) ?? "", "chloroform")) {
                            this.AddChloroform();
                        }
                        break;
                    case "ChatOther-ItemMouth-ReleaseMouth":
                    case "ChatSelf-ItemMouth-ReleaseMouth":
                        if (this.HandCloroMemberNumber == sender.MemberNumber)
                            this.RemoveChloroform();
                        break;
                    default:
                        break;
                }
            }
        });

        // Blur while edged
        hookFunction("Player.GetBlurLevel", 1, (args, next) => {
            if (!Player.GraphicsSettings?.AllowBlur)
                return next(args);
                
            if (Player.IsEdged() && Player.LSCG.GlobalModule.edgeBlur) {
                if ((Player.ArousalSettings?.Progress ?? 0) > 90)
                    return 6;
                else if ((Player.ArousalSettings?.Progress ?? 0) > 75)
                    return 4;
                else if ((Player.ArousalSettings?.Progress ?? 0) > 50)
                    return 1;
            }
            return next(args);
        }, ModuleCategory.Misc);

        // Set Chloroform'd state
        OnAction(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            if (!this.settings.chloroformEnabled)
                return;

            let meta = GetMetadata(data);
            var target = meta?.TargetMemberNumber;
            if (target != Player.MemberNumber)
                return;

            if (msg == "ActionSwap") {
                if (data.Dictionary[3]?.AssetName == "ChloroformCloth"  && !this.IsWearingChloroform()) {
                    this.RemoveChloroform();
                }
                else if (data.Dictionary[4]?.AssetName == "ChloroformCloth" && this.NumberChloroform() == 1) {
                    this.AddChloroform();
                }
                return;
            }
            var isChloroformAction = data.Dictionary[3]?.AssetName == "ChloroformCloth";
            if (isChloroformAction) {
                if (msg == "ActionUse" && this.NumberChloroform() == 1) {
                    this.AddChloroform();
                }
                else if (msg == "ActionRemove" && !this.IsWearingChloroform()) {
                    this.RemoveChloroform();
                }
            }
        })

        let lastChloroEvent = 0;
        let chloroInterval = 2000; // chloro check every 2s
        hookFunction('TimerProcess', 1, (args, next) => {
            let now = CommonTime();
            if (!ActivityAllowed() || !this.Enabled)
                return next(args);

            // Check every minute for chloro check
            if (this.settings.chloroformEnabled && lastChloroEvent + chloroInterval < now) {
                lastChloroEvent = now;
                this.CheckForChloro();
            }

            return next(args);
        }, ModuleCategory.Injector);

        // Set chloroform'd state on room join
        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            if (!this.settings.chloroformEnabled) {
                return;
            }
            
            this.isChloroformed = this.IsWearingChloroform();

            if (this.isChloroformed && !this.sleepState.Active) {
                this.sleepState.Activate();
                this.ActivateChloroEvent();
            }
        }, ModuleCategory.Misc);

        hookFunction("TimerProcess", 1, (args, next) => {
            let now = CommonTime();
            if (!this.settings.infiniteChloroformPotency && this.lastChecked + 10000 < now) {
                this.lastChecked = now;
                if (this.isChloroformed && this.settings.chloroformedAt + this.settings.chloroformPotencyTime < now && !this.chloroformWearingOff)
                    this.ChloroformWearOff();
            }
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction("CraftingModeSet", 1, ([NewMode], next) => {
            if (!Player || NewMode != "Name") {
                this.ToggleLscgEffectsScreen(true);
                next([NewMode]);
                return;
            }

            this.createCraftingLscgEffectsButton();

            next([NewMode]);
        }, ModuleCategory.Misc);

        hookFunction("CraftingResize", 1, (args, next) => {
            next(args);
            if (!Player)
                return;

            let main = document.getElementById(this.LscgEffectCraftingId.main);
            if (main) {
                this.setMenuPositionFixed();
            }
        }, ModuleCategory.Misc);

        hookFunction("CraftingEventListeners._ChangeDescription", 1, (args, next) => {
            next(args);
            if (!Player)
                return;

        this.nameOrDescChanged();
        }, ModuleCategory.Misc);
    }

    lastChecked: number = 0;

    chroloBlockStrings = [
        "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
        "%NAME% takes another deep breath through %POSSESSIVE% gag...",
        "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
        "%NAME% moans softly and relaxes..."
    ];
    chloroEventInterval: number = 0;
    eyesInterval: number = 0;
    passoutTimer: number = 0;
    awakenTimeout: number = 0;
    _isChloroformed: boolean = false;

    set isChloroformed(value: boolean) {
        clearInterval(this.chloroEventInterval)
        if (value) {
            this.chloroEventInterval = setInterval(() => {
                this.ChloroEvent();
            }, 60010)
        }
        this._isChloroformed = value;
    }

    get isChloroformed(): boolean {
        return this._isChloroformed;
    }

    get HandCloroMemberNumber(): number | undefined {
        let grab = getModule<LeashingModule>("LeashingModule").Pairings.find(l => l.Type == "mouth" && (!l.IsSource || l.PairedMember == Player.MemberNumber));
        if (!!grab) {
            let grabbedBy = getCharacter(grab.PairedMember);
            if (!!grabbedBy) {
                let grabberItem = InventoryGet(grabbedBy, "ItemHandheld");
                if (grabberItem?.Asset.Name == "Towel" && isPhraseInString(GetItemNameAndDescriptionConcat(grabberItem) ?? "", "chloroform")) {
                    return grabbedBy.MemberNumber;
                }
            }
        }
        return;
    }

    CheckForChloro() {
        if (!this.settings.chloroformEnabled)
            return;
        let mouthItems = [InventoryGet(Player, "ItemMouth"),
                            InventoryGet(Player, "ItemMouth2"),
                            InventoryGet(Player, "ItemMouth3")];

        let isHandChloroed = !!this.HandCloroMemberNumber;

        if (mouthItems.some(item => item?.Asset.Name == "ChloroformCloth") && (!this.isChloroformed && !this.passoutTimer)) {
            this.AddChloroform();
        } else if (!mouthItems.some(item => item?.Asset.Name == "ChloroformCloth") && (this.isChloroformed || !!this.passoutTimer) && !this.awakenTimeout && !isHandChloroed) {
            this.RemoveChloroform();
        }
    }

    ChloroEvent() {
        if (!this.isChloroformed)
            return;
        // only activate on average once every 10 minutes
        else if (getRandomInt(10) == 0)
            this.ActivateChloroEvent();
    }

    ActivateChloroEvent() {
        SendAction(this.chroloBlockStrings[getRandomInt(this.chroloBlockStrings.length)]);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Misc);
    }

    IsWearingChloroform() {
        return [
            InventoryGet(Player, "ItemMouth")?.Asset.Name,
            InventoryGet(Player, "ItemMouth2")?.Asset.Name,
            InventoryGet(Player, "ItemMouth3")?.Asset.Name
        ].some(item => item == "ChloroformCloth")
    }

    NumberChloroform() {
        return [
            InventoryGet(Player, "ItemMouth")?.Asset.Name,
            InventoryGet(Player, "ItemMouth2")?.Asset.Name,
            InventoryGet(Player, "ItemMouth3")?.Asset.Name
        ].filter(item => item == "ChloroformCloth").length;
    }

    AddChloroform() {
        if (this.chloroformWearingOff) {
            SendAction("%NAME%'s muscles slump limply once more as another dose of chloroform is applied.");
            this.chloroformWearingOff = false;
            this.isChloroformed = true;
            this.settings.chloroformedAt = CommonTime();
            clearTimeout(this.awakenTimeout);
            settingsSave();
        } else {
            if (!this.isChloroformed)
                SendAction("%NAME% eyes go wide as the sweet smell of ether fills %POSSESSIVE% nostrils.");
            else
                SendAction("%NAME% slumps back in %POSSESSIVE% sleep as another dose of ether assails %POSSESSIVE% senses.");
            LSCG_SendLocal("Chloroform has been forced over your mouth, you will pass out if it is not removed soon!");
            clearTimeout(this.awakenTimeout);
            this.passoutTimer = setTimeout(() => this.StartPassout_1(), 20000);
            CharacterSetFacialExpression(Player, "Eyes", "Scared");
        }
    }

    StartPassout_1() {
        SendAction("%NAME%, unable to continue holding %POSSESSIVE% breath, takes a desparate gasp through the chemical-soaked cloth.");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        clearTimeout(this.passoutTimer);
        this.passoutTimer = setTimeout(() => this.StartPassout_2(), 10000);
    }

    StartPassout_2() {
        SendAction("%NAME%'s body trembles as the chloroform sinks deep into %POSSESSIVE% mind.");
        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
        clearTimeout(this.passoutTimer);
        this.passoutTimer = setTimeout(() => this.Passout(), 5000);
    }

    Passout() {
        this.isChloroformed = true;
        this.settings.chloroformedAt = CommonTime();
        clearTimeout(this.passoutTimer);
        this.passoutTimer = 0;
        getModule<StateModule>("StateModule")?.SleepState.Activate(undefined, undefined, true);
    }

    chloroformWearingOff: boolean = false;
    ChloroformWearOff() {
        SendAction("%NAME% takes a deep, calm breath as %POSSESSIVE% chloroform starts to lose its potency...");
        clearTimeout(this.awakenTimeout);
        this.awakenTimeout = setTimeout(() => this.RemoveChloroform_1(), 45000);
        this.chloroformWearingOff = true;
    }

    RemoveChloroform() {
        if (this.isChloroformed) {
            SendAction("%NAME% continues to sleep peacefully as the cloth is removed...");
            clearTimeout(this.awakenTimeout);
            this.awakenTimeout = setTimeout(() => this.RemoveChloroform_1(), 20000);
            this.chloroformWearingOff = true;
        }
        else {
            SendAction("%NAME% gulps in fresh air as the cloth is removed...");
            CharacterSetFacialExpression(Player, "Eyes", null);
            clearTimeout(this.passoutTimer);
            clearTimeout(this.awakenTimeout);
            this.passoutTimer = 0;
            this.awakenTimeout = 0;
        }
    }

    RemoveChloroform_1() {
        SendAction("%NAME% starts to stir with a gentle moan...");
        clearTimeout(this.awakenTimeout);
        this.awakenTimeout = setTimeout(() => this.RemoveChloroform_2(), 10000);
    }

    RemoveChloroform_2() {
        SendAction("%NAME%'s eyes flutter and start to open sleepily...");
        this._removeChloroform();
    }

    _removeChloroform() {
        this.isChloroformed = false;
        this.chloroformWearingOff = false;
        clearInterval(this.eyesInterval);
        this.sleepState.Recover();
    }

    /*
     * *** Section for Crafting menu for LSCG Keywords ***
     */

    // HTML ID definition
    LscgEffectCraftingId = {
        // main screen
        main: "lscg-effect-main",
        toolTip: "lscg-effect-tooltip",

        // top bar
        topBar: "lscg-effect-top-bar",
        mainTitle: "lscg-effect-main-title",
        mainExit: "lscg-effect-main-exit",

        // menu toggle button
        menuLabel: "crafting-lscg-effects-menu-label",
        menuButton: "crafting-lscg-effects-menu-button",

        // chaotic/evolving group
        chaoticEvolvingGrid: "lscg-effect-chaotic-evolving-grid",
        chaoticLabel: "crafting-lscg-effects-chaotic-label",
        chaoticButton: "crafting-lscg-effects-chaotic-checkbox",
        evolvingLabel: "crafting-lscg-effects-evolving-label",
        evolvingButton: "crafting-lscg-effects-evolving-checkbox",
        quickLabel: "crafting-lscg-effects-quick-label",
        quickButton: "crafting-lscg-effects-quick-checkbox",
        slowLabel: "crafting-lscg-effects-slow-label",
        slowButton: "crafting-lscg-effects-slow-checkbox",

        // tamperproof group
        tamperproofGrid: "lscg-effect-tamperproof-grid",
        tamperproofLabel: "crafting-lscg-effects-tamperproof-label",
        tamperproofButton: "crafting-lscg-effects-tamperproof-checkbox",
        electricLabel: "crafting-lscg-effects-electric-label",
        electricButton: "crafting-lscg-effects-electric-checkbox",
        selfTighteningLabel: "crafting-lscg-effects-selfTightening-label",
        selfTighteningButton: "crafting-lscg-effects-selfTightening-checkbox",
        subduingLabel: "crafting-lscg-effects-subduing-label",
        subduingButton: "crafting-lscg-effects-subduing-checkbox",

        // misc group (Cursed, magic, netgun)
        miscGrid: "lscg-effect-misc-grid",
        cursedLabel: "crafting-lscg-effects-cursed-label",
        cursedButton: "crafting-lscg-effects-cursed-checkbox",
        //cursedSelectLabel: "crafting-lscg-effects-cursed-select-label",
        cursedSelect: "crafting-lscg-effects-cursed-select",
        magicLabel: "crafting-lscg-effects-magic-label",
        magicButton: "crafting-lscg-effects-magic-checkbox",
        netgunLabel: "crafting-lscg-effects-netgun-label",
        netgunButton: "crafting-lscg-effects-netgun-checkbox",

        // drug group
        drugGrid: "lscg-effect-drug-grid",
        sedativeLabel: "crafting-lscg-effects-sedative-label",
        sedativeButton: "crafting-lscg-effects-sedative-checkbox",
        mindcontrolLabel: "crafting-lscg-effects-mindcontrol-label",
        mindcontrolButton: "crafting-lscg-effects-mindcontrol-checkbox",
        hornyLabel: "crafting-lscg-effects-horny-label",
        hornyButton: "crafting-lscg-effects-horny-checkbox",
        cureLabel: "crafting-lscg-effects-cure-label",
        cureButton: "crafting-lscg-effects-cure-checkbox",
    }

    /*
     * Define all options of the screen into list/group (each group will have their own grid-area)
     * Order of the grid is defined in grid-template in ToggleLscgEffectsScreen
     */
    chaoticEvolvingOptionList: ScreenElem[] = [
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.chaoticLabel,
            id_button: this.LscgEffectCraftingId.chaoticButton,
            label: "Chaotic",
            description: "Change randomly the item's extended options, every 10min (Incompatible with Evolving)",
            keywords: chaoticKeywords,
            condition: (): boolean => {
                const evolv = document.getElementById(this.LscgEffectCraftingId.evolvingButton) as HTMLInputElement;
                if (evolv.checked) return false; // Incompatible with Evolving
                return true;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.evolvingLabel,
            id_button: this.LscgEffectCraftingId.evolvingButton,
            label: "Evolving",
            description: "Change progressively the item's extended options, until last option is reached, every 10min (Incompatible with Chaotic)",
            keywords: evolvingKeywords,
            condition: (): boolean => {
                const chaotic = document.getElementById(this.LscgEffectCraftingId.chaoticButton) as HTMLInputElement;
                if (chaotic.checked) return false; // Incompatible with Chaotic
                return true;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.slowLabel,
            id_button: this.LscgEffectCraftingId.slowButton,
            label: "Slow",
            description: "Increase the trigger time for Chaotic and Evoling to 30min (Only for Chaotic or Evolving, Incompatible with Quick)",
            keywords: slowKeywords,
            condition: (): boolean => {
                const chaotic = document.getElementById(this.LscgEffectCraftingId.chaoticButton) as HTMLInputElement;
                const evolv = document.getElementById(this.LscgEffectCraftingId.evolvingButton) as HTMLInputElement;
                if (!chaotic.checked && !evolv.checked) return false; // Need chaotic or evolving

                const quick = document.getElementById(this.LscgEffectCraftingId.quickButton) as HTMLInputElement;
                if (quick.checked) return false; // Incompatible with Quick
                return true;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.quickLabel,
            id_button: this.LscgEffectCraftingId.quickButton,
            label: "Quick",
            description: "Reduce the trigger time for Chaotic and Evoling to 3min  (Only for Chaotic or Evolving, Incompatible with Quick)",
            keywords: quickKeywords,
            condition: (): boolean => {
                const chaotic = document.getElementById(this.LscgEffectCraftingId.chaoticButton) as HTMLInputElement;
                const evolv = document.getElementById(this.LscgEffectCraftingId.evolvingButton) as HTMLInputElement;
                if (!chaotic.checked && !evolv.checked) return false; // Need chaotic or evolving

                const slow = document.getElementById(this.LscgEffectCraftingId.slowButton) as HTMLInputElement;
                if (slow.checked) return false; // Incompatible with Slow
                return true;
            }
        },
    ];

    tamperproofOptionList: ScreenElem[] = [
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.tamperproofLabel,
            id_button: this.LscgEffectCraftingId.tamperproofButton,
            label: "Tamperproof",
            description: "Activate custom behavior when tampering with the item (Need to be used with Electrifying / Self-Tightening / Subduing, Incompatible with hand item)",
            keywords: TamperProofKeywords,
            condition: (): boolean => {
                if (CraftingSelectedItem?.Asset?.Group.Name == "ItemHandheld") {
                    return false; // Incompatible with hand item
                }
                return true;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.electricLabel,
            id_button: this.LscgEffectCraftingId.electricButton,
            label: "Electrifying",
            description: "Electrifying the player when tampering with the item (Need to be used with Tamperproof)",
            keywords: ElectricKeywords,
            condition: (): boolean => {
                const tamperproof = document.getElementById(this.LscgEffectCraftingId.tamperproofButton) as HTMLInputElement;
                if (tamperproof.checked) return true; // Need Tamperproof
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.selfTighteningLabel,
            id_button: this.LscgEffectCraftingId.selfTighteningButton,
            label: "Self-Tightening",
            description: "Tighten the item when tampering with the item (Need to be used with Tamperproof)",
            keywords: SelfTighteningKeywords,
            condition: (): boolean => {
                const tamperproof = document.getElementById(this.LscgEffectCraftingId.tamperproofButton) as HTMLInputElement;
                if (tamperproof.checked) return true; // Need Tamperproof
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.subduingLabel,
            id_button: this.LscgEffectCraftingId.subduingButton,
            label: "Subduing",
            description: "Subdue the player with a sedating spray when tampering with the item (Need to be used with Tamperproof)",
            keywords: SubduingKeywords,
            condition: (): boolean => {
                const tamperproof = document.getElementById(this.LscgEffectCraftingId.tamperproofButton) as HTMLInputElement;
                if (tamperproof.checked) return true; // Need Tamperproof
                return false;
            }
        },
    ]

    // others that can't really be grouped together
    miscsOptionsList: ScreenElem[] = [
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.cursedLabel,
            id_button: this.LscgEffectCraftingId.cursedButton,
            label: "Cursed",
            description: "Curse the item (Need a selected curse in the dropdown above)",
            keywords: CursedKeywords,
            condition: (): boolean => {
                return true;
            }
        },
        {
            type: "select",
            id_label: this.LscgEffectCraftingId.cursedSelect,
            id_button: "",
            label: "",
            description: "Selection for the curse to apply",
            keywords: [],
            condition: (): boolean => {
                return (document.getElementById(this.LscgEffectCraftingId.cursedButton) as HTMLInputElement)?.checked;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.magicLabel,
            id_button: this.LscgEffectCraftingId.magicButton,
            label: "Magic",
            description: "Enchant the item with magic, allowing player to use LSCG Magic. (Need hand item)",
            keywords: ["enchanted", "magic", "wand"],
            condition: (): boolean => {
                if (CraftingSelectedItem?.Asset?.Group.Name == "ItemHandheld") {
                    return true; // Need hand item
                }
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.netgunLabel,
            id_button: this.LscgEffectCraftingId.netgunButton,
            label: "Net Gun",
            description: "Add a Shoot Netgun ability to the item (Need Medical Injector or Rainbow Wand or Baguette)",
            keywords: NetgunKeywords() ?? ["net gun", "netgun"],
            condition: (): boolean => {
                if (CraftingSelectedItem && CraftingSelectedItem.Asset && AllowedNetGuns.indexOf(CraftingSelectedItem.Asset.Name) != -1) {
                    return true; // Need hand item
                }
                return false;
            }
        }
    ]

    drugOptionsList: ScreenElem[] = [
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.sedativeLabel,
            id_button: this.LscgEffectCraftingId.sedativeButton,
            label: "Sedative",
            description: "Add Sedative effect to the item (Only for: Medical Injector, Latex Respirator, Filled Glass or Mug)",
            keywords: SedativeKeywords() ?? ["tranquilizer","sedative"],
            condition: (): boolean => {
                let allowedDrugItem: string[] = [
                    "MedicalInjector",
                    "LatexRespirator",
                    "GlassFilled",
                    "Mug"
                ];
                if (CraftingSelectedItem && CraftingSelectedItem.Asset && allowedDrugItem.indexOf(CraftingSelectedItem.Asset.Name) != -1) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.hornyLabel,
            id_button: this.LscgEffectCraftingId.hornyButton,
            label: "Aphrodisiac",
            description: "Add aphrodisiac effect to the item (Only for: Medical Injector, Latex Respirator, Filled Glass or Mug)",
            keywords: HornyKeywords() ?? ["aphrodisiac", "horny", "arousing"],
            condition: (): boolean => {
                let allowedDrugItem: string[] = [
                    "MedicalInjector",
                    "LatexRespirator",
                    "GlassFilled",
                    "Mug"
                ];
                if (CraftingSelectedItem && CraftingSelectedItem.Asset && allowedDrugItem.indexOf(CraftingSelectedItem.Asset.Name) != -1) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.mindcontrolLabel,
            id_button: this.LscgEffectCraftingId.mindcontrolButton,
            label: "Mind control",
            description: "Add mind control effect to the item (Only for: Medical Injector, Latex Respirator, Filled Glass or Mug)",
            keywords: MindControlKeywords() ?? ["mind control", "hypnotizing", "brainwashing"],
            condition: (): boolean => {
                let allowedDrugItem: string[] = [
                    "MedicalInjector",
                    "LatexRespirator",
                    "GlassFilled",
                    "Mug"
                ];
                if (CraftingSelectedItem && CraftingSelectedItem.Asset && allowedDrugItem.indexOf(CraftingSelectedItem.Asset.Name) != -1) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "checkbox",
            id_label: this.LscgEffectCraftingId.cureLabel,
            id_button: this.LscgEffectCraftingId.cureButton,
            label: "Antidote",
            description: "Add curing effect to the item (Only for: Medical Injector, Latex Respirator, Filled Glass or Mug)",
            keywords: CureKeywords() ?? ["antidote", "healing", "curing", "cure"],
            condition: (): boolean => {
                let allowedDrugItem: string[] = [
                    "MedicalInjector",
                    "LatexRespirator",
                    "GlassFilled",
                    "Mug"
                ];
                if (CraftingSelectedItem && CraftingSelectedItem.Asset && allowedDrugItem.indexOf(CraftingSelectedItem.Asset.Name) != -1) {
                    return true;
                }
                return false;
            }
        },
    ];

    // concat all elem from OptionsList above
    getAllOptionsElem(): ScreenElem[] {
        let allElemList = this.chaoticEvolvingOptionList;
        allElemList = allElemList.concat(this.tamperproofOptionList);
        allElemList = allElemList.concat(this.miscsOptionsList);
        allElemList = allElemList.concat(this.drugOptionsList);
        return allElemList;
    }

    /*
     * *** Section for Crafting menu for LSCG Keywords ***
     */

    createCraftingMenuButton(label_id: string, button_id: string): HTMLLabelElement {
		const label = document.createElement("label");
		label.setAttribute("id", label_id);
		label.classList = "crafting-label";
		label.style.cssText = `grid-template-columns: min-content auto`;

		let button = ElementButton.Create(button_id, MiscModule.LscgEffectMenuButtonListener);
		button.style.setProperty('height', 'calc(0.75 * var(--button-size))');
		button.style.setProperty('width', 'calc(0.75 * var(--button-size))');
		button.style.setProperty('background-image', 'url("' + ICONS.BOUND_GIRL + '")');
		label.appendChild(button);

		const span = document.createElement("span");
		span.append("LSCG Effects");
		label.appendChild(span);
		return label;
	}

	createCraftingLscgEffectsButton() {
        const id_lscg_effect_menu_label = "crafting-lscg-effects-menu-label";
        const id_lscg_effect_menu_button = "crafting-lscg-effects-menu-button";
		const nameSpanID: undefined | string = CraftingID.rightPanel;
		const nameSpan = nameSpanID ? document.getElementById(nameSpanID) : null;
		if (nameSpan) {
			if (!document.getElementById(id_lscg_effect_menu_label))
				nameSpan.appendChild(this.createCraftingMenuButton(id_lscg_effect_menu_label, id_lscg_effect_menu_button));
		}
	}

    // Click on menu button
    static LscgEffectMenuButtonListener(this: HTMLButtonElement, ev: MouseEvent | TouchEvent): any {
        getModule<MiscModule>("MiscModule").ToggleLscgEffectsScreen();
    }

    /*
     * *** Main Screen creation for setting LSCG Keywords on the crafting page ***
     */
    _LscgEffectsScreen: boolean = false;
    ToggleLscgEffectsScreen(force_off: boolean = false) {
        if (this._LscgEffectsScreen || force_off) {
            this._LscgEffectsScreen = false;

            let main = document.getElementById(this.LscgEffectCraftingId.main);
            main?.remove();
        }
        else {
            let root = document.getElementById(CraftingID.root);

            // Create main screen
            const parent = ElementCreate({
                tag: "div",
                attributes: { id: this.LscgEffectCraftingId.main, "screen-generated": CurrentScreen, "aria-busy": "true", hidden: false},
                //classList: ["button-styling"],
                children: [],
                style: {visibility: "visible"},
            });
            parent.style.setProperty('background-color', 'var(--lscg-background-color)');
            parent.style.setProperty('display', 'grid');
            parent.style.setProperty('grid-template', `
                "${this.LscgEffectCraftingId.topBar} ${this.LscgEffectCraftingId.topBar}" var(--button-size)
                "${this.LscgEffectCraftingId.chaoticEvolvingGrid} ${this.LscgEffectCraftingId.miscGrid}" auto
                "${this.LscgEffectCraftingId.tamperproofGrid} ${this.LscgEffectCraftingId.drugGrid}" auto
                "${this.LscgEffectCraftingId.toolTip} ${this.LscgEffectCraftingId.toolTip}" var(--button-size)
                / 3fr 3fr`);
            parent.style.setProperty('gap', 'calc(var(--button-size) / 15)');
            parent.style.setProperty('border', 'min(0.2vh, 0.1vw) solid black');
            parent.style.setProperty('box-shadow', '0 6px 10px black');
            parent.style.setProperty('padding', '0.5rem');

            // Create top bar with Title and exit button
            let exitButton = ElementButton.Create(this.LscgEffectCraftingId.mainExit, MiscModule.LscgEffectMenuButtonListener, { tooltip: TextGet("Exit") });
            exitButton.style.cssText = `
                width: var(--button-size);
	            height: var(--button-size);
                background-image: url("Icons/Exit.png");
            `;
            let menuBar = ElementMenu.Create("lscg-effect-menu-bar", [exitButton], { direction: "rtl" });
            menuBar.style.cssText = `
                display: grid;
                direction: rtl;
                grid-auto-flow: column;
                gap: calc(var(--button-size) / 6);
            `;

            ElementCreate({
                tag: "div",
                attributes: { id: this.LscgEffectCraftingId.topBar },
                parent,
                style: {
                    display: "grid",
                    "grid-template-columns": "auto min-content",
                    gap: "calc(var(--button-size) / 6)",
                    "grid-area": this.LscgEffectCraftingId.topBar
                },
                children: [
                    { tag: "h1", attributes: { id: this.LscgEffectCraftingId.mainTitle }, children: ["LSCG Effects"],
                      style: {
                        "user-select": "none",
                        "font-size": "min(5vh, 2.5vw)",
                        "line-height": "0",
                        "color": "var(--lscg-text-color)",
                        "justify-self": "center",
                        "align-self": "center",
                        //"padding-left": "calc((5 + (4 / 6)) * var(--button-size))"
                      }
                    },
                    menuBar
                ],
            });

            // chaotic/evolving grid
            this.createGenericGridArea(this.LscgEffectCraftingId.chaoticEvolvingGrid, parent, this.createHtmlElemList(this.chaoticEvolvingOptionList));

            // tamperproof grid
            this.createGenericGridArea(this.LscgEffectCraftingId.tamperproofGrid, parent, this.createHtmlElemList(this.tamperproofOptionList));

            // misc grid
            this.createGenericGridArea(this.LscgEffectCraftingId.miscGrid, parent, this.createHtmlElemList(this.miscsOptionsList));

            // drug grid
            this.createGenericGridArea(this.LscgEffectCraftingId.drugGrid, parent, this.createHtmlElemList(this.drugOptionsList));

            // tooltip (bottom grid)
            ElementCreate({
                tag: "div",
                parent,
                attributes: { id: this.LscgEffectCraftingId.toolTip },
                classList: ["button-tooltip"],
                style: {
                    "grid-area": this.LscgEffectCraftingId.toolTip,
                    "padding-right": "calc(var(--button-size) / 12)",
                    //"position": "fixed",
                    "overflow-wrap": "word-break",
                    "text-wrap": "unset",
                    "font-size": "min(5vh, 1.4vw)",
                }
            });

            root?.append(parent);
            this.setMenuPositionFixed();

            this._LscgEffectsScreen = true;

            // Check box that should be checked & color in red if conditions are not met
            this.nameOrDescChanged();
        }
    }

    // Set/re-Set the main menu position (needed if a resize happen)
    setMenuPositionFixed() {
        //ElementPositionFixed(this.LscgEffectCraftingId.main, 120, 100, 1050, 800);
        ElementPositionFixed(this.LscgEffectCraftingId.main, 150, 100, 1000, 800);
    }

    /*
     * *** Generic functions to create a grid and each element ***
     */

    createGenericGridArea(grid_id: string, parent: Node, children: HTMLOptions<keyof HTMLElementTagNameMap>[]) {
        ElementCreate({
            tag: "div",
            parent,
            attributes: { id: grid_id },
            //classList: ["scroll-box"],
            style: {
                "grid-area": grid_id,
                "padding-right": "calc(var(--button-size) / 12)",
                "border": "1px dotted var(--lscg-border-color)",
                "padding": "0.5rem"
            },
            children: children
        });
    }

    // Create element from the lists ScreenElem (the results are used as the children of createGenericGridArea())
    createHtmlElemList(elemList: ScreenElem[]): HTMLOptions<keyof HTMLElementTagNameMap>[] {
        let htmlList: HTMLOptions<keyof HTMLElementTagNameMap>[] = [];
        for (let elem of elemList) {
            let tag: keyof HTMLElementTagNameMap = "label";
            let child: (string | Node | HTMLOptions<keyof HTMLElementTagNameMap>)[] = [];

            // setup depending of type
            if (elem.type == "checkbox") {
                tag = "label";
                let checkbox = ElementCheckbox.Create(elem.id_button, MiscModule.LscgEffectCheckBoxListener);
                checkbox.style.cssText = `{
                    width: min(5dvh, 2.5dvw);
                    height: min(5dvh, 2.5dvw);
                }`;
                child.push(checkbox);
                child.push({ tag: "span", children: [elem.label], style: {"font-size": "min(5vh, 1.8vw)" } });
            }
            else if (elem.type == "select") {
                tag = "select";
                child = (this.getSelectOptionsForId(elem.id_label));
            }

            let htmlElem: HTMLOptions<keyof HTMLElementTagNameMap> = {
                        tag: tag,
                        attributes: { id: elem.id_label },
                        //classList: ["crafting-label"],
                        style: {
                            "grid-template-columns": "min-content auto",
                            "width": "calc(100% - 6px)",
                            "display": "grid",
                            "row-gap": "calc(var(--button-size) / 12)",
                            "column-gap": "calc(var(--button-size) / 6)",
                            "padding-left": "3px",
                            "padding-right": "3px",
                            "padding-top": "calc(var(--button-size) / 12)",
                            "padding-bottom": "calc(var(--button-size) / 12)",
                            "cursor": "pointer",
                            "color": "var(--lscg-text-color)",
                            "font": "inherit",
                            "align-items": "center",
                            "user-select": "none",
                        },
                        children: child,
                        eventListeners: {
                            mouseover: () => {
                                let tooltip = document.getElementById(this.LscgEffectCraftingId.toolTip);
                                if (tooltip) {
                                    tooltip.textContent = elem.description;
                                    tooltip.style.visibility = "visible";
                                }
                            },
                            mouseout: () => {
                                let tooltip = document.getElementById(this.LscgEffectCraftingId.toolTip);
                                if (tooltip) {
                                    tooltip.style.visibility = "hidden";
                                    tooltip.textContent = "";
                                }
                            },
                        }
                    };

            if (elem.type == "select" && htmlElem.eventListeners) {
                htmlElem.eventListeners.change = MiscModule.LscgEffectSelectChangeListener;
            }
            htmlList.push(htmlElem);
        }

        return htmlList;
    }

    /*
     * *** Functions to pass event ***
     */

    static LscgEffectCheckBoxListener(this: HTMLInputElement, ev: Event): any {
        getModule<MiscModule>("MiscModule").checkBoxClicked(this.id, this.checked);
    }

    static LscgEffectSelectChangeListener(this: any, ev: Event): any {
        const elem = this as HTMLSelectElement;
        if (elem) getModule<MiscModule>("MiscModule").eventSelectChanged(elem.id, elem.options[elem.selectedIndex].value);
    }

    eventSelectChanged(id: string, selected: string) {
        if (id == this.LscgEffectCraftingId.cursedSelect) {
            this.curseSelectChanged(id, selected);
        }
    }

    /*
     * *** curse Select functions ***
     */

    // Special value to be able to select nothing
    cursedSelectEmptyWord: string = "_none_";
    curseSelectChanged(id: string, selected: string) {
        let curseNameList = getModule<CursedItemModule>("CursedItemModule")?.settings.CursedItems.map(item => item.Name);
        if (!curseNameList || curseNameList.length <= 0) {
            console.warn("curseSelectChanged: no curse found.");
            return;
        }

        const nameInput = document.getElementById(CraftingID.nameInput) as HTMLInputElement;
		const descriptionInput = document.getElementById(CraftingID.descriptionInput) as HTMLInputElement;
		if (!nameInput || !descriptionInput) {
			console.warn("curseSelectChanged: cannot find element: name or description input");
			return;
		}

        // remove other
        for (let curseName of curseNameList) {
            if (curseName == selected) continue;

            nameInput.value = nameInput.value.replaceAll(curseName, "");
            descriptionInput.value = descriptionInput.value.replaceAll(curseName, "");
            // remove trailling space
            nameInput.value = nameInput.value.trim();
            descriptionInput.value = descriptionInput.value.trim();
        }
        // add selected
        if (!nameInput.value.includes(selected) && !descriptionInput.value.includes(selected) &&
                    selected != this.cursedSelectEmptyWord) {
            descriptionInput.value += " " + selected;
            descriptionInput.value = descriptionInput.value.trim();
        }
    }

    // Populate the curse Select
    getSelectCurseOptions(): HTMLOptions<keyof HTMLElementTagNameMap>[] {
        let optionList: HTMLOptions<keyof HTMLElementTagNameMap>[] = [];
        let curseNameList = getModule<CursedItemModule>("CursedItemModule")?.settings.CursedItems.map(item => item.Name);
        if (!curseNameList || curseNameList.length <= 0) {
            //console.log("getSelectCurseOptions: no curse found.");
            curseNameList = [];
        }
        // Special value to be able to select nothing
        curseNameList.reverse().push(this.cursedSelectEmptyWord);
        curseNameList = curseNameList.reverse();

        // Put the already applied curse first
        const nameInput = document.getElementById(CraftingID.nameInput) as HTMLInputElement;
		const descriptionInput = document.getElementById(CraftingID.descriptionInput) as HTMLInputElement;
        if (nameInput && descriptionInput) {
            for (let curse of curseNameList) {
                if (nameInput.value.includes(curse) || descriptionInput.value.includes(curse)) {
                    let idx = curseNameList.indexOf(curse);
                    if (idx != -1) {
                        curseNameList.splice(idx, 1);
                        curseNameList.unshift(curse);
                    }
                    break;
                }
            }
        }

        for (let curse of curseNameList) {
            let elem: HTMLOptions<keyof HTMLElementTagNameMap> = {
                tag: "option", children: [curse]
            }
            optionList.push(elem);
        }

        return optionList;
    }

    /*
     * *** checkbox Clicked functions ***
     */

    checkBoxClicked(id: string, checked: boolean) {
        let elem = this.getScreenElemFromId(id);
        if (!elem) {
            console.warn("checkBoxClicked: cannot find elem: ", id);
            return;
        }

        const nameInput = document.getElementById(CraftingID.nameInput) as HTMLInputElement;
		const descriptionInput = document.getElementById(CraftingID.descriptionInput) as HTMLInputElement;
		if (!nameInput || !descriptionInput) {
			console.warn("checkBoxClicked: cannot find element: name or description input");
			return;
		}

        if (checked) {
            // add the first keyword at the end
            if (elem.keywords.length <= 0) return;
            descriptionInput.value += " " + elem.keywords[0];
            descriptionInput.value = descriptionInput.value.trim();
        }
        else {
            // remove all keywords
            for (let word of elem.keywords) {
                nameInput.value = nameInput.value.replaceAll(word, "");
                descriptionInput.value = descriptionInput.value.replaceAll(word, "");
                // remove trailling space
                nameInput.value = nameInput.value.trim();
                descriptionInput.value = descriptionInput.value.trim();
            }
        }

        // Special for cursed: also add/remove Selected curse
        if (elem.id_label == this.LscgEffectCraftingId.cursedLabel) {
            let cursedSelect = document.getElementById(this.LscgEffectCraftingId.cursedSelect) as HTMLSelectElement;
            if (cursedSelect) {
                if (checked) {
                    // add selected
                    this.curseSelectChanged(this.LscgEffectCraftingId.cursedSelect, cursedSelect.options[cursedSelect.selectedIndex].value);
                }
                else {
                    // remove selected
                    this.curseSelectChanged(this.LscgEffectCraftingId.cursedSelect, this.cursedSelectEmptyWord);
                }
            }
        }

        this.checCheckBoxkCondition();
    }

    // Check the checkbow that should be checked based on the keywords present in name and description
    nameOrDescChanged() {
        if (!this._LscgEffectsScreen) return;

        let allElemList = this.getAllOptionsElem();

        // check checkBox if desc have keywords
        for (let elem of allElemList) {
            let changed = false;
            const elem_checkbox = document.getElementById(elem.id_button) as HTMLInputElement;
            for (let word of elem.keywords) {
                if (CraftingSelectedItem?.Description.includes(word)) {
                    // activate checkbox
                    if (elem_checkbox) {
                        elem_checkbox.checked = true;
                        changed = true;
                    } else {
                        console.warn("nameOrDescChanged: couldn't find ", elem.id_button);
                    }
                    break;
                }
            }
            if (changed) continue;

            // If we are here, we have no match
            if (elem_checkbox) {
                elem_checkbox.checked = false;
            }
        }

        // Always check condition after the checkbox has been update
        this.checCheckBoxkCondition();
    }

    // Color the label in red if condition are not met (condition are defined in each elem of ScreenElem lists)
    checCheckBoxkCondition() {
        let allElemList = this.getAllOptionsElem();

        for (let elem of allElemList) {
            const elem_label = document.getElementById(elem.id_label) as HTMLInputElement;
            const elem_button = document.getElementById(elem.id_button) as HTMLButtonElement
            if (elem.condition()) {
                if (!!elem_label) {
                    elem_label.style.setProperty('color', 'var(--lscg-text-color)');
                    elem_label.setAttribute("disabled", "true");
                    elem_label.disabled = false;
                }
                if (!!elem_button)
                    elem_button.disabled = false;
            }
            else {
                if (!!elem_label) {
                    elem_label.style.setProperty('color', 'red');
                    elem_label.disabled = true;
                }
                if (!!elem_button)
                    elem_button.disabled = true;
            }
        }
    }

    /*
     * *** Helper functions ***
     */

    getScreenElemFromId(id: string) {
        let allElemList = this.getAllOptionsElem();

        for (let elem of allElemList) {
            if (elem.id_button == id) {
                return elem;
            }
        }
        return undefined;
    }

    getSelectOptionsForId(id: string): HTMLOptions<keyof HTMLElementTagNameMap>[] {
        if (id == this.LscgEffectCraftingId.cursedSelect) {
            return this.getSelectCurseOptions();
        }
        return [];
    }
}
