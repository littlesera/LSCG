import { BaseModule } from "../base";
import { GuiSubscreen } from "./settingBase";
import { GuiGlobal } from "./global";
import { MainMenu } from "./mainmenu";
import { SETTING_NAME_PREFIX, Subscreen } from "./setting_definitions";
import { modules } from "modules";
import { GlobalSettingsModel } from "./Models/base";

export class GUI extends BaseModule {
	static instance: GUI | null = null;

	private _subscreens: GuiSubscreen[];
	private _mainMenu: MainMenu;
	private _currentSubscreen: GuiSubscreen | null = null;

	get mainMenu(): MainMenu {
		return this._mainMenu;
	}

	get currentSubscreen(): GuiSubscreen | null {
		return this._currentSubscreen;
	}

	set currentSubscreen(subscreen: GuiSubscreen | string | null) {
		if (this._currentSubscreen) {
			this._currentSubscreen.Unload();
		}
		if (typeof subscreen === "string") {
			const scr = this._subscreens?.find(s => s.name === subscreen);
			if (!scr) throw `Failed to find screen name ${subscreen}`;
			this._currentSubscreen = scr;
		} else {
			this._currentSubscreen = subscreen;
		}

		// Reset that first, in case it gets set in the screen's Load callback
		PreferenceMessage = "";

		let subscreenName = "";
		if (this._currentSubscreen) {
			subscreenName = SETTING_NAME_PREFIX + this._currentSubscreen?.name;
			this._currentSubscreen.Load();
		}

		// Get BC to render the new screen
		PreferenceSubscreen = subscreenName;
	}

	get currentCharacter(): Character {
		return Player;
	}

	get settingsScreen(): Subscreen | null {
		return GuiGlobal;
	}

	get settings(): GlobalSettingsModel {
		return super.settings as GlobalSettingsModel;
	}

	get settingsStorage(): string | null {
		return "GlobalModule";
	}

	constructor() {
		super();
		if (GUI.instance) {
			throw new Error("Duplicate initialization");
		}

		this._mainMenu = new MainMenu(this);
		this._subscreens = [
			this._mainMenu
		];

		GUI.instance = this;
	}

	get defaultSettings(): GlobalSettingsModel {
		return {
			enabled: true,
			edgeBlur: false
		};
    }

	load(): void {
		// At that point all other modules have been initialized, build the list of their screens
		for (const module of modules) {
			if (!module.settingsScreen) continue;

			this._subscreens.push(new module.settingsScreen(module));
		}

		this._mainMenu.subscreens = this._subscreens;
	}
}
