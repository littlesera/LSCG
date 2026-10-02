import { ICONS } from "utils";
import { InjectorSettingsModel } from "./Models/injector";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { getModule } from "modules";
import { MiscModule } from "Modules/misc";
import type { InjectorModule } from "Modules/injector";
import { DomSettingsHost } from "./domSettingsHost";
import { KitContext, Tabs } from "Dom/kit";
import { buildInjectorTabs } from "./injector-pages";

export class GuiInjector extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-injector-settings", this, () => this.build());

	get name(): string {
		return "Drug Enhancements";
	}

	get icon(): string {
		return ICONS.INJECTOR;
	}

	get settings(): InjectorSettingsModel {
		return super.settings as InjectorSettingsModel;
	}

	get help(): HelpInfo {
		return {
			label: "Open Drug Enhancements Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Drug-Enhancements-and-Net-Gun",
		};
	}

	private build(): Node {
		const misc = getModule<MiscModule>("MiscModule")?.settings ?? Player.LSCG.MiscModule;
		return Tabs(buildInjectorTabs(new KitContext(), this.settings, misc, getModule<InjectorModule>("InjectorModule")));
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		void getModule<MiscModule>("MiscModule")?.settings;
		super.Load();
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
