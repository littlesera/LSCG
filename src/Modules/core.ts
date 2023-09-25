import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { BaseSettingsModel, GlobalSettingsModel } from "Settings/Models/base";
import { IPublicSettingsModel, PublicSettingsModel, SettingsModel } from "Settings/Models/settings";
import { ModuleCategory } from "Settings/setting_definitions";
import { removeAllHooksByModule, hookFunction, getCharacter, drawSvg, SVG_ICONS, sendLSCGMessage, settingsSave, LSCG_CHANGES, LSCG_SendLocal, mouseTooltip } from "../utils";
import { ActivityModule, GrabType } from "./activities";
import { HypnoModule } from "./hypno";
import { CollarModule } from "./collar";

//import * as semver from "semver";
import { lt } from "semver";
import { BaseMigrator } from "./Migrators/BaseMigrator";
import { StateMigrator } from "./Migrators/StateMigrator";
import { MagicModule } from "./magic";
import { StateModule } from "./states";

// Core Module that can handle basic functionality like server handshakes etc.
// Maybe can consolidate things like hypnosis/suffocation basic state handling too..
export class CoreModule extends BaseModule {   

    toggleSharedButton = {
        x: 1898,
        y: 120,
        width: 40,
        height: 40
    };

    get publicSettings(): IPublicSettingsModel {
        var settings = new PublicSettingsModel();
        for (const m of modules()) {
            var moduleSettings = m.settings ?? <BaseSettingsModel>{enabled:false};
            var moduleSettingStorage = m.settingsStorage ?? "";
            if (Object.hasOwn(settings, moduleSettingStorage)) {
                var publicModuleSetting = (<any>settings)[moduleSettingStorage];
                for (const k of Object.keys(moduleSettings)) {
                    if (Object.hasOwn(publicModuleSetting, k))
                        publicModuleSetting[k] = (<any>moduleSettings)[k];
                }
            }
            settings.enabled = Player.LSCG.GlobalModule.enabled;
        }
        return settings;
    }

    get settingsStorage(): string | null {
		return "GlobalModule";
	}

    get settings(): GlobalSettingsModel {
        return super.settings as GlobalSettingsModel;
	}

    get defaultSettings(): GlobalSettingsModel | null {
		return <GlobalSettingsModel>{
            enabled: false,
            blockSettingsWhileRestrained: false,
            edgeBlur: false,
            seeSharedCrafts: true,
            sharePublicCrafting: false,
            showCheckRolls: true
        };
	}

    load(): void {
        hookFunction("ChatRoomSync", 1, (args, next) => {
            this.CheckVersionUpdate();
            this.SendPublicPacket(true);
            return next(args);
        }, ModuleCategory.Core);

        hookFunction("ChatRoomMessage", 1, (args, next) => {
            this.CheckForPublicPacket(args[0]);
            return next(args);
        }, ModuleCategory.Core);

        hookFunction("ServerAccountBeep", 10, (args, next) => {
            let data = args[0];
            // Intercept LSCG beeps directly
            if (data.BeepType == "LSCG") {
                let msg = data.Message as LSCGMessageModel;
                if (msg.type == "command")
                    this.Command(data.MemberNumber, msg)
            }
            else
                return next(args);
        })

        hookFunction("ChatRoomDrawCharacterOverlay", 1, (args, next) => {
            next(args);
            const [C, CharX, CharY, Zoom] = args as [Character, number, number, number];
            const Char = getCharacter(C.MemberNumber!) as OtherCharacter | PlayerCharacter;
            const ModUser = !!Char?.LSCG;
            const Friend = C.ID === 0 || (Player.FriendList ?? []).includes(C.MemberNumber!);
            const Ghosted = (Player.GhostList ?? []).includes(C.MemberNumber!);
            const isAdmin = (Array.isArray(ChatRoomData?.Admin) && ChatRoomData?.Admin.includes(C.MemberNumber!))
            if (ModUser && ChatRoomHideIconState === 0 && !Ghosted) {
                var version = C.IsPlayer() ? LSCG_VERSION : (C as OtherCharacter).LSCG?.Version;
                var starColor = isAdmin ? "#008080" : "#00AEAE";
                if (version != LSCG_VERSION)
                    starColor = "#ff4545";
                var xOffset = 0;
                if (!window.bcx)
                    xOffset = -10;
                drawSvg(MainCanvas, SVG_ICONS.STAR, CharX + (xOffset + 410) * Zoom, CharY + 8 * Zoom, 40 * Zoom, 40 * Zoom, 50, 0.8, 1, starColor);
                if (MouseIn(CharX + 405 * Zoom, CharY + 3 * Zoom, 50 * Zoom, 50 * Zoom)) {
                    mouseTooltip(version, CharX + 425 * Zoom, CharY + 50 * Zoom);
                }
            }
        }, ModuleCategory.Core);

        // Pull other public crafts from the room
        hookFunction("DialogInventoryBuild", 1, (args, next) => {
            next(args);
            if (this.settings.seeSharedCrafts) {
                let target = args[0];
                if (!target.FocusGroup)
                    return;
                ChatRoomCharacter.forEach(C => {
                    if (C.Crafting != null && !C.IsPlayer() && C.MemberNumber != target.MemberNumber && (C as OtherCharacter).LSCG && (C as OtherCharacter).LSCG.GlobalModule.sharePublicCrafting) {
                        let Crafting = CraftingDecompressServerData(C.Crafting);
                        for (let Craft of Crafting)
                            if ((Craft != null) && (Craft.Item != null))
                                if ((Craft.Private == null) || (Craft.Private == false)) {
                                    Craft.MemberName = CharacterNickname(C);
                                    Craft.MemberNumber = C.MemberNumber;
                                    const group = AssetGroupGet(target.AssetFamily, target.FocusGroup.Name);
                                    for (let A of group.Asset)
                                        if (CraftingAppliesToItem(Craft, A) && DialogCanUseCraftedItem(target, Craft))
                                            DialogInventoryAdd(target, { Asset: A, Craft: Craft }, false);
                                }
                    }
                });
                DialogInventorySort();
            }
        }, ModuleCategory.Core);

        hookFunction("DialogDrawItemMenu", 1, (args, next) => {
            this._drawShareToggleButton(this.toggleSharedButton.x, this.toggleSharedButton.y, this.toggleSharedButton.width, this.toggleSharedButton.height);
            next(args);
        }, ModuleCategory.Core);

        hookFunction("DialogClick", 1, (args, next) => {
            next(args);
            let C = CharacterGetCurrent();
            if (!C)
                return;
            if (MouseIn(this.toggleSharedButton.x, this.toggleSharedButton.y, this.toggleSharedButton.width, this.toggleSharedButton.height) &&
                DialogModeShowsInventory() && (DialogMenuMode === "permissions" || (Player.CanInteract() && !InventoryGroupIsBlocked(C, undefined, true)))) {
                this.settings.seeSharedCrafts = !this.settings.seeSharedCrafts;
                settingsSave();
                DialogInventoryBuild(C, true, false);
            }
        })
    }

    _drawShareToggleButton(X: number, Y: number, Width: number, Height: number) {
        DrawButton(X, Y, Width, Height, "", this.settings.seeSharedCrafts ? "White" : "Red", "", "Toggle Shared Crafts", false);
        DrawImageResize("Icons/Online.png", X + 2, Y + 2, Width - 4, Height - 4);
        DrawLineCorner(X + 2, Y + 2, X + Width - 2, Y + Height - 2, X + 2, Y + 2, 2, "Black");
    }

    run(): void {
        if (ServerPlayerIsInChatRoom()) {
            this.CheckVersionUpdate();
            this.SendPublicPacket(true);
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Core);
    }

    CheckVersionUpdate() {
        var previousVersion = Player.LSCG?.Version;
        if (!previousVersion || previousVersion != LSCG_VERSION) {
            this.ShowChangelog();
            if (!Player.LSCG) {
                Player.LSCG = <SettingsModel>{};
                this.registerDefaultSettings();
            }
            Player.LSCG.Version = LSCG_VERSION;
            settingsSave();
        }
        this.CheckForMigrations(previousVersion);
    }

    Migrators: BaseMigrator[] = [new StateMigrator()]

    CheckForMigrations(fromVersion: string) {
        if (fromVersion[0] == 'v')
            fromVersion = fromVersion.substring(1);

        this.Migrators.forEach(m => {
            if (lt(fromVersion, m.Version))
                m.Migrate(fromVersion);
        });

        settingsSave();
    }

    SendPublicPacket(replyRequested: boolean, type: LSCGMessageModelType = "init") {
        sendLSCGMessage(<LSCGMessageModel>{
            version: LSCG_VERSION,
            type: type,
            settings: this.publicSettings,
            target: null,
            reply: replyRequested
        });
    }

    CheckForPublicPacket(data: IChatRoomMessage) {
        if (data.Sender != Player.MemberNumber && data.Type == "Hidden" && data.Content == "LSCGMsg" && !!data.Dictionary && !!data.Dictionary[0]) {
            var C = getCharacter(data.Sender) as OtherCharacter;
            var msg = (<LSCGMessageDictionaryEntry>data.Dictionary[0]).message;
            switch (msg.type) {
                case "init":
                    this.Init(C, msg);
                    break;
                case "sync":
                    this.Sync(C, msg);
                    break;
                case "command":
                    this.Command(data.Sender, msg);
                    break;
            }
        }
    }

    Init(Sender: OtherCharacter | null, msg: LSCGMessageModel) {
        this.Sync(Sender, msg);
    }

    Sync(Sender: OtherCharacter | null, msg: LSCGMessageModel) {
        if (!Sender)
            return;
        Sender.LSCG = Object.assign(Sender.LSCG ?? {}, msg.settings ?? {});
        if (msg.reply) {
            this.SendPublicPacket(false, msg.type);
        }
    }

    Command(senderNumber: number, msg: LSCGMessageModel) {
        if (!msg.command || msg.target != Player.MemberNumber)
            return;
        let Sender = getCharacter(senderNumber) as OtherCharacter;
        switch (msg.command!.name) {
            case "debug":
                LSCG_SendLocal(msg.command.args[0].value as string, 10000);
                break;
            case "grab":
                getModule<ActivityModule>("ActivityModule")?.IncomingGrab(Sender, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "release":
                getModule<ActivityModule>("ActivityModule")?.IncomingRelease(Sender, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "escape":
                getModule<ActivityModule>("ActivityModule")?.IncomingEscape(Sender, msg.target);
                break;
            case "remote":
                let prevCollarPurchase = Player.LSCG?.CollarModule?.collarPurchased;
                Object.assign(Player.LSCG.HypnoModule, msg.settings?.HypnoModule);
                Object.assign(Player.LSCG.CollarModule, msg.settings?.CollarModule);
                Object.assign(Player.LSCG.MagicModule, msg.settings?.MagicModule);
                getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
                settingsSave(true);
                let currentCollarPurchase = Player.LSCG?.CollarModule?.collarPurchased;
                if (!prevCollarPurchase && currentCollarPurchase)
                    LSCG_SendLocal(`${!Sender ? "Someone" : CharacterNickname(Sender)} has purchased the Collar Module for you!`);
                else
                    LSCG_SendLocal(`${!Sender ? "Someone" : CharacterNickname(Sender)} has accessed your remote settings!`);
                break;
            case "collar-tighten":
                if (!!Sender) getModule<CollarModule>("CollarModule")?.TightenButtonPress(Sender);
                break;
            case "collar-loosen":
                if (!!Sender) getModule<CollarModule>("CollarModule")?.LoosenButtonPress(Sender);
                break;
            case "collar-stats":
                if (!!Sender) getModule<CollarModule>("CollarModule")?.StatsButtonPress(Sender);
                break;
            case "photo":
                DrawFlashScreen("#FFFFFF", 500, 1500);
                break;
            case "spell":
            case "pair":
                getModule<MagicModule>("MagicModule")?.IncomingSpellCommand(Sender, msg);
                break;
            case "spell-teach":
                getModule<MagicModule>("MagicModule")?.IncomingSpellTeachCommand(Sender, msg);
                break;
            case "unpair":
                getModule<StateModule>("StateModule")?.IncomingUnpair(senderNumber, msg);
                break;
            case "pairing-update":
                getModule<StateModule>("StateModule")?.PairingUpdate(senderNumber, msg);
                break;
        }
    }

    ShowChangelog(): void {
        const message = `New LSCG version: ${LSCG_VERSION}
See below for the latest changes:
${LSCG_CHANGES}`;
        ServerAccountBeep({
            MemberNumber: Player.MemberNumber,
            MemberName: "LSCG",
            ChatRoomName: "LSCG Update",
            Private: true,
            Message: message,
            ChatRoomSpace: "",
        });
        console.info(`LSCG Updated:${LSCG_CHANGES}`);
    }
}