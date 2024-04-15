import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { BaseSettingsModel, GlobalSettingsModel } from "Settings/Models/base";
import { IPublicSettingsModel, PublicSettingsModel, SettingsModel } from "Settings/Models/settings";
import { ModuleCategory } from "Settings/setting_definitions";
import { removeAllHooksByModule, hookFunction, getCharacter, drawSvg, SVG_ICONS, sendLSCGMessage, settingsSave, LSCG_CHANGES, LSCG_SendLocal, mouseTooltip } from "../utils";
import { HypnoModule } from "./hypno";
import { CollarModule } from "./collar";

//import * as semver from "semver";
import { lt } from "semver";
import { BaseMigrator } from "./Migrators/BaseMigrator";
import { StateMigrator } from "./Migrators/StateMigrator";
import { MagicModule } from "./magic";
import { StateModule } from "./states";
import { drawTooltip } from "Settings/settingUtils";
import { GrabType, LeashingModule } from "./leashing";


/**
 * A record mapping all crafting-valid asset names to a list of matching elligble assets.
 * Elligble assets are defined as crafting-valid assets with either a matching {@link Asset.Name} or {@link Asset.CraftGroup}.
 * @version R103
 */
declare let CraftingAssets: undefined | Record<string, Asset[]>;

// Core Module that can handle basic functionality like server handshakes etc.
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
            if (data.BeepType == "Leash" && !!data.Message && data.Message.IsLSCG === true) {
                let msg = data.Message as LSCGMessageModel;
                if (msg.type == "command")
                    this.Command(data.MemberNumber, msg);
            }
            else
                return next(args);
        }, ModuleCategory.Core);

        hookFunction("ChatRoomCharacterViewDrawOverlay", 1, (args, next) => {
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
                drawSvg(MainCanvas, SVG_ICONS.STAR, CharX + 400 * Zoom, CharY + 8 * Zoom, 40 * Zoom, 40 * Zoom, 50, 0.8, 1, starColor);
                if (MouseIn(CharX + 405 * Zoom, CharY + 3 * Zoom, 50 * Zoom, 50 * Zoom)) {
                    mouseTooltip(version, CharX + 425 * Zoom, CharY + 50 * Zoom);
                }
            }
        }, ModuleCategory.Core);

        // Pull other public crafts from the room
        hookFunction("DialogInventoryBuild", 1, (args, next) => {
            next(args);
            if (this.settings.seeSharedCrafts && DialogMenuMode !== "permissions") {
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

                                    // TODO: Remove the `else` branch once R103 is live
                                    if (typeof CraftingAssets !== "undefined") { // R103
                                        const canUseCraftedItem = DialogCanUseCraftedItem as (C: Character, Craft: CraftingItem, asset: Asset) => boolean;
                                        for (const Asset of (CraftingAssets[Craft.Item] ?? [])) {
                                            if (Asset.Group.Name === target.FocusGroup.Name && canUseCraftedItem(C, Craft, Asset)) {
                                                DialogInventoryAdd(C, { Asset, Craft }, false);
                                            }
                                        }
                                    } else { // R102
                                        const group = AssetGroupGet(target.AssetFamily, target.FocusGroup.Name);
                                        for (let A of group.Asset)
                                            if (CraftingAppliesToItem(Craft, A) && DialogCanUseCraftedItem(target, Craft))
                                                DialogInventoryAdd(target, { Asset: A, Craft: Craft }, false);
                                    }
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

        hookFunction("DrawItemPreview", 1, (args, next) => {
				const ret = next(args);
				const [item, , x, y] = args;
				if (item) {
					const { Craft } = item;
					if (MouseIn(x, y, DialogInventoryGrid.itemWidth, DialogInventoryGrid.itemHeight) && Craft && Craft?.MemberNumber) {
						drawTooltip(1000, y - 140, 975, `Crafted By: ${Craft.MemberName} [${Craft.MemberNumber}]`, "left");
					}
				}
				return ret;
			}
		);

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
        });
    }

    _drawShareToggleButton(X: number, Y: number, Width: number, Height: number) {
        DrawButton(X, Y, Width, Height, "", this.settings.seeSharedCrafts ? "White" : "Red", "", "Toggle Shared Crafts", false);
        DrawImageResize("Icons/Online.png", X + 2, Y + 2, Width - 4, Height - 4);
        DrawLineCorner(X + 2, Y + 2, X + Width - 2, Y + Height - 2, X + 2, Y + 2, 2, "Black");
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Core);
    }

    CheckVersionUpdate() {
        var previousVersion = Player.LSCG?.Version;
        let saveRequired = false;
        if (!previousVersion || previousVersion != LSCG_VERSION) {
            this.ShowChangelog();
            if (!Player.LSCG) {
                Player.LSCG = <SettingsModel>{};
                this.registerDefaultSettings();
            }
            previousVersion = Player.LSCG.Version = LSCG_VERSION;
            saveRequired = true;
        }
        saveRequired = saveRequired || this.CheckForMigrations(previousVersion);
        if (saveRequired) settingsSave();
    }

    Migrators: BaseMigrator[] = [new StateMigrator()]

    CheckForMigrations(fromVersion: string): boolean {
        if (fromVersion[0] == 'v')
            fromVersion = fromVersion.substring(1);

        let saveRequired = false;
        this.Migrators.forEach(m => {
            if (lt(fromVersion, m.Version)) {
                saveRequired = saveRequired || m.Migrate(fromVersion);
            }
        });

        return saveRequired;
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

    CheckForPublicPacket(data: ServerChatRoomMessage) {
        if (!!data.Sender && data.Sender != Player.MemberNumber && data.Type == "Hidden" && data.Content == "LSCGMsg" && !!data.Dictionary && !!data.Dictionary[0]) {
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
        CharacterLoadCanvas(Sender);
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
                getModule<LeashingModule>("LeashingModule")?.IncomingGrab(Sender, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "release":
                getModule<LeashingModule>("LeashingModule")?.IncomingRelease(Sender, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "escape":
                getModule<LeashingModule>("LeashingModule")?.IncomingEscape(Sender, msg.target);
                break;
            case "remote":
                let prevCollarPurchase = Player.LSCG?.CollarModule?.collarPurchased;
                if (Player.LSCG.HypnoModule.enabled && Player.LSCG.HypnoModule.remoteAccess) {
                    Object.assign(Player.LSCG.HypnoModule, msg.settings?.HypnoModule);
                    getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
                }
                if ((!!Sender.MemberNumber && Player.IsOwnedByMemberNumber(Sender.MemberNumber)) || (Player.LSCG.CollarModule.enabled && Player.LSCG.CollarModule.remoteAccess))
                    Object.assign(Player.LSCG.CollarModule, msg.settings?.CollarModule);
                if (Player.LSCG.MagicModule.enabled && Player.LSCG.MagicModule.remoteAccess)
                    Object.assign(Player.LSCG.MagicModule, msg.settings?.MagicModule);
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
            case "get-spell":
                getModule<MagicModule>("MagicModule")?.HandleItemSpellRequest(senderNumber, msg);
                break;
            case "get-spell-response":
                getModule<MagicModule>("MagicModule")?.IncomingGetItemSpellResponse(senderNumber, msg);
                break;
        }
        this.CommandListeners.filter(com => com.command == msg.command!.name).forEach(command => command.func(senderNumber, msg));
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

    CommandListeners: CommandListener[] = [];
    RegisterCommandListener(listener: CommandListener) {
        if (this.CommandListeners.indexOf(listener) == -1)
            this.CommandListeners.push(listener);
    }

    RemoveCommandListenerById(id: string) {
        if (!!id)
            this.CommandListeners = this.CommandListeners.filter(c => c.id != id);
    }

    RemoveCommandListener(listener: CommandListener) {
        if (this.CommandListeners.indexOf(listener) > -1)
            this.CommandListeners.splice(this.CommandListeners.indexOf(listener), 1);
        if (!!listener.id)
            this.CommandListeners = this.CommandListeners.filter(c => c.id != listener.id);
    }
}

export interface CommandListener {
    id: string;
    command: LSCGCommandName;
    func: (sender: number, msg: LSCGMessageModel) => void;
}