import { GuiSubscreen, HelpInfo } from "./settingBase";
import { DomSettingsHost } from "./domSettingsHost";
import { KitContext, Notice, Tabs } from "Dom/kit";
import { buildSpeechTabs } from "./speech-analysis-pages";
import { SpeechAnalysisSettingsModel } from "./Models/speech-analysis";

export class GuiSpeechAnalysis extends GuiSubscreen {
    private _host = new DomSettingsHost("lscg-speech-settings", () => this.build());

    get name(): string {
        return "Speech Analysis";
    }

    get icon(): string {
        return "Icons/Chat.png";
    }

    get settings(): SpeechAnalysisSettingsModel {
        return super.settings as SpeechAnalysisSettingsModel;
    }

    get help(): HelpInfo {
        return { label: "Open LSCG Wiki on GitHub", link: "https://github.com/littlesera/LSCG/wiki" };
    }

    private build(): Node {
        if (this.settings.locked)
            return Notice("** Speech Analysis settings are locked remotely **");
        return Tabs(buildSpeechTabs(new KitContext(), this.settings, { remote: false }));
    }

    Load(): void {
        this._host.mount();
    }

    Exit(): void {
        this._host.unmount();
        super.Exit();
    }

    Unload(): void {
        this._host.unmount();
    }
}
