import { BaseModule } from "base";
import { MiscSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { addCustomEffect, GetMetadata, getRandomInt, GetTargetCharacter, hookFunction, LSCG_SendLocal, OnAction, OnActivity, removeAllHooksByModule, removeCustomEffect, SendAction, setOrIgnoreBlush, settingsSave } from "../utils";

export class MiscModule extends BaseModule {
    get settings(): MiscSettingsModel {
        return super.settings as MiscSettingsModel;
	}

    // Disabled as it's managed via General
    // get settingsScreen(): Subscreen | null {
    //     return GuiMisc;
    // }

    get defaultSettings() {
        return <MiscSettingsModel>{
            enabled: true,
            chloroformEnabled: false,
            immersiveChloroform: false,
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
                CharacterCanChangeToPose(Player, "Kneel")) {
                CharacterSetActivePose(Player, "Kneel");
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
                    this.AddChloroform(sender);
                }
                return;
            }
            var isChloroformAction = data.Dictionary[3]?.AssetName == "ChloroformCloth";
            if (isChloroformAction) {
                if (msg == "ActionUse" && this.NumberChloroform() == 1) {
                    this.AddChloroform(sender);
                }
                else if (msg == "ActionRemove" && !this.IsWearingChloroform()) {
                    this.RemoveChloroform();
                }
            }
        })

        // Set chloroform'd state on room join
        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            if (!this.settings.chloroformEnabled) {
                return;
            }
            
            this.isChloroformed = this.IsWearingChloroform();

            if (this.isChloroformed) {
                this.SetSleepExpression();
                this.ActivateChloroEvent();
                if (Player.CanKneel()) {
                    this.FallDownIfPossible();
                    addCustomEffect(Player, "ForceKneel");
                }   
            }
        }, ModuleCategory.Misc);

        // Block activity while choloform'd
        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.settings.chloroformEnabled)
                return next(args);
            
            if (this.isChloroformed && this.settings.immersiveChloroform) {
                var type = args[0];
                // Prevent speech while chloroformed
                if ((type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "(")) {
                    this.ActivateChloroEvent();
                    this.SetSleepExpression();
                    return null;
                // Prevent changing eye expression while chloroformed
                } else if (type == "ChatRoomCharacterExpressionUpdate" && (args[1]?.Group == "Eyes" || args[1]?.Group == "Eyes2")) {
                    this.SetSleepExpression();
                    return null;
                }
                return next(args);
            }
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.CanChangeOwnClothes', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
                return false;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.IsDeaf', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
                return true;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.IsBlind', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
                return true;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
                return false;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('ChatRoomCanAttemptStand', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
                return false;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed) {
                LSCG_SendLocal("Character access blocked while immersively chloroformed.", 5000);
                return;
            }
            return next(args);
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

    InitStates() {
        if (Player.CanKneel()) {
            this.FallDownIfPossible();
            addCustomEffect(Player, "ForceKneel");
        }   
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
            this.SetSleepExpression();
            this.chloroEventInterval = setInterval(() => {
                this.ChloroEvent();
            }, 60010)
        }
        this._isChloroformed = value;
    }

    get isChloroformed(): boolean {
        return this._isChloroformed;
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

    AddChloroform(sender: Character | null) {
        if (this.chloroformWearingOff) {
            SendAction("%NAME%'s muscles slump limply once more as another dose chloroform is reapplied.");
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
            if (!!sender && sender.MemberNumber != Player.MemberNumber)
                LSCG_SendLocal(CharacterNickname(sender) + " has forced chloroform over your mouth, you will passout if it is not removed soon!", 30000);
            CharacterSetFacialExpression(Player, "Eyes", "Scared");
            clearTimeout(this.awakenTimeout);
            this.passoutTimer = setTimeout(() => this.StartPassout_1(), 20000);
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
        SendAction("%NAME% slumps weakly as %PRONOUN% slips into unconciousness.");
        this.SetSleepExpression();
        if (Player.CanKneel()) {
            this.FallDownIfPossible();
            addCustomEffect(Player, "ForceKneel");
        }        
        this.isChloroformed = true;
        this.settings.chloroformedAt = CommonTime();
        clearTimeout(this.passoutTimer);
        settingsSave();
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
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        CharacterSetFacialExpression(Player, "Emoticon", null);
        setOrIgnoreBlush("Medium");
        removeCustomEffect(Player, "ForceKneel");
    }

    SetSleepExpression() {
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
    }

    FallDownIfPossible() {
        if (Player.CanKneel()) {
            CharacterSetActivePose(Player, "Kneel", true);
        }
    }
}
