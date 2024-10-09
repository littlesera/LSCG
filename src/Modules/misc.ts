import { BaseModule } from "base";
import { MiscSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetMetadata, getRandomInt, GetTargetCharacter, hookFunction, LSCG_SendLocal, OnAction, OnActivity, removeAllHooksByModule, SendAction, settingsSave } from "../utils";
import { getModule } from "modules";
import { StateModule } from "./states";
import { SleepState } from "./States/SleepState";

export class MiscModule extends BaseModule {
    get settings(): MiscSettingsModel {
        return super.settings as MiscSettingsModel;
	}

    get sleepState(): SleepState {
        return getModule<StateModule>("StateModule")?.SleepState;
    }

    get defaultSettings() {
        return <MiscSettingsModel>{
            enabled: true,
            chloroformEnabled: false,
            //immersiveChloroform: false,
            chloroformedAt: 0,
            chloroformPotencyTime: 60 * 60 * 1000, // 1 hour cooloff
            infiniteChloroformPotency: false,
            handChokeEnabled: false,
            gagChokeEnabled: false
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
        let chloroInterval = 2000; // breath event every 4s
        hookFunction('TimerProcess', 1, (args, next) => {
            let now = CommonTime();
            if (!ActivityAllowed() || !this.Enabled)
                return next(args);

            // Check every minute for breath drug event
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

    CheckForChloro() {
        if (!this.settings.chloroformEnabled)
            return;
        var mouthItems = [InventoryGet(Player, "ItemMouth"),
                            InventoryGet(Player, "ItemMouth2"),
                            InventoryGet(Player, "ItemMouth3")];
        if (mouthItems.some(item => item?.Asset.Name == "ChloroformCloth") && (!this.isChloroformed && !this.passoutTimer)) {
            this.AddChloroform();
        } else if (!mouthItems.some(item => item?.Asset.Name == "ChloroformCloth") && (this.isChloroformed || !!this.passoutTimer) && !this.awakenTimeout) {
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

    // SetSleepExpression() {
    //     CharacterSetFacialExpression(Player, "Eyes", "Closed");
    //     CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
    // }

    // FallDownIfPossible() {
    //     if (Player.CanKneel()) {
    //         CharacterSetActivePose(Player, "Kneel", true);
    //     }
    // }
}
