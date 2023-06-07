import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { CollarPublicSettingsModel } from "Settings/Models/collar";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { InjectorPublicSettingsModel, InjectorSettingsModel } from "Settings/Models/injector";
import { IPublicSettingsModel, PublicSettingsModel } from "Settings/Models/settings";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, isPhraseInString, hookFunction, getCharacter, drawSvg, SVG_ICONS, patchFunction, sendLSCGMessage, settingsSave } from "../utils";
import { ActivityModule, GrabType } from "./activities";
import { HypnoModule } from "./hypno";

// Core Module that can handle basic functionality like server handshakes etc.
// Maybe can consolidate things like hypnosis/suffocation basic state handling too..
export class CoreModule extends BaseModule {   

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

    load(): void {
        hookFunction("ChatRoomSync", 1, (args, next) => {
            this.SendPublicPacket(true);
            return next(args);
        }, ModuleCategory.Core);

        hookFunction("ChatRoomMessage", 1, (args, next) => {
            this.CheckForPublicPacket(args[0]);
            return next(args);
        }, ModuleCategory.Core);

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
                drawSvg(MainCanvas, SVG_ICONS.STAR, CharX + 410 * Zoom, CharY + 8 * Zoom, 40 * Zoom, 40 * Zoom, 50, 0.8, 1, starColor);
                if (MouseIn(CharX + 405 * Zoom, CharY + 3 * Zoom, 50 * Zoom, 50 * Zoom)) {
                    var prevAlign = MainCanvas.textAlign;
                    var prevFont = MainCanvas.font;
                    var pad = 5;
                    var TextX = CharX + 390 * Zoom;
                    var TextY = CharY + 50 * Zoom;
                    MainCanvas.textAlign = "left";
                    MainCanvas.font = '16px Arial, sans-serif'
                    var size = MainCanvas.measureText(version);
                    DrawRect(TextX - size.actualBoundingBoxLeft - pad, TextY - size.actualBoundingBoxAscent - pad, size.actualBoundingBoxRight - size.actualBoundingBoxLeft + 2 * pad, size.actualBoundingBoxDescent + size.actualBoundingBoxAscent + 2 * pad, "#D7F6E9");
                    DrawText(version, TextX, TextY, "Black");
                    //MainCanvas.fillText(version, CharX + 420 * Zoom, CharY + 50*Zoom, 100*Zoom);
                    MainCanvas.textAlign = prevAlign;
                    MainCanvas.font = prevFont;
                }
            }
        }, ModuleCategory.Core);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Core);
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
                    this.Command(C, msg);
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

    Command(Sender: OtherCharacter | null, msg: LSCGMessageModel) {
        if (!msg.command || msg.target != Player.MemberNumber)
            return;
        switch (msg.command!.name) {
            case "grab":
                getModule<ActivityModule>("ActivityModule")?.IncomingGrab(Sender!, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "release":
                getModule<ActivityModule>("ActivityModule")?.IncomingRelease(Sender!, msg.command.args.find(a => a.name == "type")?.value as GrabType);
                break;
            case "remote":
                if (Player.LSCG?.HypnoModule.remoteAccess) {
                    Object.assign(Player.LSCG.HypnoModule, msg.settings?.HypnoModule);
                    getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
                    settingsSave(true);
                }
                break;
        }
    }
}