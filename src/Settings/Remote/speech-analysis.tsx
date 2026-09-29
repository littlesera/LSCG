import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { hasRemotePermission, replace_template, sendLSCGCommand } from "utils";
import { getModule } from "modules";
import type { CoreModule } from "Modules/core";
import { DomSettingsHost } from "Settings/Dom/host";
import { KitContext, Notice, Tabs } from "Settings/Dom/kit";
import { buildSpeechTabs } from "Settings/speech-analysis-pages";
import { SPEECH_SCREEN_SHAPE } from "Settings/speech-analysis";
import { SPEECH_EDITABLE_KEYS, SpeechAnalysisPublicSettingsModel, SpeechEditableSettings, SpeechSettingsView } from "Settings/Models/speech-analysis";

const RESPONSE_LISTENER_ID = "remote_speech_settings_response";
const RESPONSE_TIMEOUT_MS = 6000;

/** Rules and phrase groups are private, so they're fetched from the wearer on open (like hypno suggestions)
 *  rather than read from the room-wide public settings. */
export class RemoteSpeechAnalysis extends RemoteGuiSubscreen {
    private _view: SpeechSettingsView | null = null;
    private _status: "loading" | "ready" | "no-response" = "loading";
    private _timeout: number | undefined;
    private _host = new DomSettingsHost("lscg-remote-speech-settings", SPEECH_SCREEN_SHAPE, () => this.build());

    get name(): string {
        return "Speech Analysis";
    }

    get icon(): string {
        return "Icons/Chat.png";
    }

    get help(): HelpInfo {
        return { label: "Open LSCG Wiki on GitHub", link: "https://github.com/littlesera/LSCG/wiki" };
    }

    /** The target's published access settings. */
    get settings(): SpeechAnalysisPublicSettingsModel {
        return super.settings as SpeechAnalysisPublicSettingsModel;
    }

    get isTranced(): boolean {
        return this.Character.LSCG?.StateModule?.states?.find(s => s.type == "hypnotized")?.active ?? false;
    }

    get passesTrance(): boolean {
        return !this.settings.remoteRequiresTrance || this.isTranced;
    }

    get enabled(): boolean {
        const s = this.settings;
        return !!s.enabled && !!s.remoteAccess && hasRemotePermission(this.Character, s.remoteLevel, Player.MemberNumber!) && this.passesTrance;
    }

    get disabledReason(): string {
        const s = this.settings;
        if (!s.enabled) return "Section is Disabled";
        if (!s.remoteAccess) return replace_template("%OPP_NAME% does not allow remote configuration.", this.Character);
        if (!hasRemotePermission(this.Character, s.remoteLevel, Player.MemberNumber!))
            return replace_template("You do not have permission to configure %OPP_POSSESSIVE% speech.", this.Character);
        if (!this.passesTrance) return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
        return "Section is Unavailable";
    }

    private build(): Node {
        if (this._status === "loading") return Notice("Loading speech settings…");
        if (this._status === "no-response" || !this._view)
            return Notice(replace_template("%OPP_NAME% didn't respond. %OPP_PRONOUN% may not allow access right now.", this.Character));
        return Tabs(buildSpeechTabs(new KitContext(() => this.dirty = true), this._view, { remote: true }));
    }

    Load(): void {
        super.Load();
        this._view = null;
        this._status = "loading";
        getModule<CoreModule>("CoreModule").RegisterCommandListener({
            id: RESPONSE_LISTENER_ID,
            command: "speech-settings-response",
            func: (sender, msg) => {
                if (sender !== this.Character.MemberNumber || this._status === "ready") return;
                const config = msg.command?.args?.find(a => a.name === "settings")?.value as (SpeechEditableSettings & { locked?: boolean }) | undefined;
                if (!config || typeof config !== "object") return;
                this._view = { ...this.settings, ...config, locked: config.locked ?? this.settings.locked };
                this._status = "ready";
                window.clearTimeout(this._timeout);
                this._host.remount();
            },
        });
        this._timeout = window.setTimeout(() => {
            if (this._status !== "loading") return;
            this._status = "no-response";
            this._host.remount();
        }, RESPONSE_TIMEOUT_MS);
        sendLSCGCommand(this.Character, "speech-settings-get");
        this._host.mount();
    }

    /** The base marks any canvas click as a change; here only real edits in the DOM (via KitContext) count. */
    Click(): void {
        const dirty = this.dirty;
        super.Click();
        this.dirty = dirty;
    }

    Exit(): void {
        this._host.unmount();
        super.Exit();
        this.cleanup();
    }

    Unload(): void {
        this._host.unmount();
        this.cleanup();
    }

    private cleanup(): void {
        window.clearTimeout(this._timeout);
        getModule<CoreModule>("CoreModule")?.RemoveCommandListenerById(RESPONSE_LISTENER_ID);
    }

    settingsSave(): void {
        if (!this.Character || !this.dirty || !this._view) return;
        const v = this._view;
        const changes: Record<string, unknown> = Object.fromEntries(SPEECH_EDITABLE_KEYS.map(k => [k, v[k]]));
        // Withheld phrases go back without text so the wearer's client leaves them untouched.
        changes.phraseGroups = v.phraseGroups.map(g => g.hidden ? { id: g.id, name: g.name, hidden: true } : { id: g.id, name: g.name, phrases: g.phrases });
        changes.locked = v.locked;
        sendLSCGCommand(this.Character, "speech-settings-set", [{ name: "settings", value: changes }]);
    }
}
