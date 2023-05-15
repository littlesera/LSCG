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
            handChokeEnabled: false,
            gagChokeEnabled: false
        };
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

        // Set chloroform'd state on room join
        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            if (!this.settings.chloroformEnabled) {
                return;
            }
            
            this.isChloroformed = this.IsWearingChloroform();

            if (this.isChloroformed) {
                this.SetSleepExpression();
                SendAction(this.chroloBlockStrings[getRandomInt(this.chroloBlockStrings.length)]);
            }
        }, ModuleCategory.Misc);

        // Block activity while choloform'd
        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.settings.chloroformEnabled)
                return next(args);
            
            if (this.isChloroformed) {
                var type = args[0];
                // Prevent speech while chloroformed
                if ((type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "(")) {
                    SendAction(this.chroloBlockStrings[getRandomInt(this.chroloBlockStrings.length)]);
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
    }

    chroloBlockStrings = [
        "%NAME%'s eyes move dreamily under her closed eyelids...",
        "%NAME% takes another deep breath through her gag...",
        "%NAME%'s muscles twitch weakly in their sleep...",
        "%NAME% moans softly and relaxes..."
    ];
    eyesInterval: number = 0;
    passoutTimer: number = 0;
    isChloroformed: boolean = false;

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
        SendAction("%NAME% eyes go wide as the sweet smell of ether fills %POSSESSIVE% nostrils.");
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
        this.isChloroformed = false;
        clearInterval(this.eyesInterval);
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        setOrIgnoreBlush("Medium");
    }

    SetSleepExpression() {
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
    }
}
