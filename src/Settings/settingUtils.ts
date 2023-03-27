import { BaseModule } from "../base";
import { MainMenu, MAIN_MENU_ITEMS } from "./all";
import { GuiSubscreen } from "./settingBase";

export function getCurrentSubscreen(): GuiSubscreen | null {
	return GUI.instance && GUI.instance.currentSubscreen;
}

export function setSubscreen(subscreen: GuiSubscreen | null): GuiSubscreen | null {
	if (!GUI.instance) {
		throw new Error("Attempt to set subscreen before init");
	}
	GUI.instance.currentSubscreen = subscreen;
	return subscreen;
}

export class GUI extends BaseModule {
	static instance: GUI | null = null;

	private _subscreens: GuiSubscreen[] | null = null;
	private _mainMenu: MainMenu;
	private _currentSubscreen: GuiSubscreen | null = null;

	get mainMenu(): MainMenu {
		return this._mainMenu;
	}

	get currentSubscreen(): GuiSubscreen | null {
		return this._currentSubscreen;
	}

	set currentSubscreen(subscreen: GuiSubscreen | null) {
		if (this._currentSubscreen) {
			this._currentSubscreen.Unload();
		}
		this._currentSubscreen = subscreen;
		if (this._currentSubscreen) {
			this._currentSubscreen.Load();
		}
	}

	constructor() {
		super();
		if (GUI.instance) {
			throw new Error("Duplicate initialization");
		}

		this._mainMenu = new MainMenu(Player);
		this._subscreens = [
			this._mainMenu
		];
		MAIN_MENU_ITEMS.forEach(item => {
			this._subscreens?.push(item.setting);
		});

		GUI.instance = this;
	}

	load(): void {
		
	}
}
