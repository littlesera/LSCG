import { BaseModule } from "base";
import { MiscSettingsModel } from "Settings/Models/base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { getRandomInt, hookFunction, OnAction, OnActivity, removeAllHooksByModule, SendAction, setOrIgnoreBlush } from "../utils";

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
            let target = data.Dictionary?.find((d: any) => d.Tag == "TargetCharacter");
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
            if (!data.Dictionary || !data.Dictionary[2] || !data.Dictionary[3] || !this.settings.chloroformEnabled)
                return;

            var target = data.Dictionary[2]?.MemberNumber;
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
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed)
                return false;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.IsDeaf', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed)
                return true;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.IsBlind', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed)
                return true;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed)
                return false;
            return next(args);
        }, ModuleCategory.Misc);

        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed) {
                ChatRoomSendLocal("Character access blocked while immersively chloroformed.", 5000);
                return;
            }
            return next(args);
        }, ModuleCategory.Misc)
    }

    chroloBlockStrings = [
        "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
        "%NAME% takes another deep breath through %POSSESSIVE% gag...",
        "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
        "%NAME% moans softly and relaxes..."
    ];
    chloroEventInterval: number = 0;
    eyesInterval: number = 0;
    passoutTimer: number = 0;
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
        SendAction("%NAME% eyes go wide as the sweet smell of ether fills %POSSESSIVE% nostrils.");
        if (!!sender && sender.MemberNumber != Player.MemberNumber)
            ChatRoomSendLocal(CharacterNickname(sender) + " has forced chloroform over your mouth, you will passout if it is not removed soon!", 30000);
        CharacterSetFacialExpression(Player, "Eyes", "Scared");
        this.passoutTimer = setTimeout(() => this.StartPassout_1(), 20000);
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
        this.FallDownIfPoissible();
        this.isChloroformed = true;
        clearTimeout(this.passoutTimer);
        //this.eyesInterval = setInterval(() => this.SetSleepExpression(), 1000);
    }

    RemoveChloroform() {
        if (this.isChloroformed) {
            SendAction("%NAME% continues to sleep peacefully as the cloth is removed...");
            setTimeout(() => this.RemoveChloroform_1(), 10000);
        }
        else {
            SendAction("%NAME% gulps in fresh air as the cloth is removed...");
            CharacterSetFacialExpression(Player, "Eyes", null);
            clearTimeout(this.passoutTimer);
        }
    }

    RemoveChloroform_1() {
        SendAction("%NAME% starts to stir with a gentle moan...");
        setTimeout(() => this.RemoveChloroform_2(), 5000);
    }

    RemoveChloroform_2() {
        SendAction("%NAME%'s eyes flutter and start to open sleepily...");
        this._removeChloroform();
    }

    _removeChloroform() {
        this.isChloroformed = false;
        clearInterval(this.eyesInterval);
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        CharacterSetFacialExpression(Player, "Emoticon", null);
        setOrIgnoreBlush("Medium");
    }

    SetSleepExpression() {
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
    }

    FallDownIfPoissible() {
        var isStanding = Player.Pose != null && 
            (Player.Pose.length == 0 ||
            Player.Pose.includes("BaseLower") || 
            Player.Pose.includes("LegsOpen") ||
            Player.Pose.includes("LegsClosed") ||
            Player.Pose.includes("Spread"));
        if (Player.CanKneel() && isStanding)
            CharacterSetActivePose(Player, "Kneel");
    }
}
