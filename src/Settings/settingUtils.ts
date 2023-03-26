import { BaseModule } from "../base";
import { MainMenu } from "./mainmenu";
import { MAIN_MENU_ITEMS, ModuleCategory } from "./setting_definitions";

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
	static SETTING_FUNC_PREFIX: string = "PreferenceSubscreenLSCG";
	static SETTING_FUNC_NAMES: string[] = [
		"Load",
		"Unload",
		"Run",
		"Click",
		"Exit"
	];

	private _subscreens: GuiSubscreen[] | null = null;
	private _mainMenu: MainMenu = new MainMenu(Player);
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

export abstract class GuiSubscreen {
	get active(): boolean {
		return getCurrentSubscreen() === this;
	}

	constructor() {
		GUI.SETTING_FUNC_NAMES.forEach(name => {
			if (typeof (<any>this)[name] === "function")
				(<any>window)[GUI.SETTING_FUNC_PREFIX + this.constructor.name + name] = () => {
					(<any>this)[name]();
				};
		});
	}

	Load() {
		// Empty
	}

	Run() {
		// Empty
	}

	Click() {
		// Empty
	}

	Exit() {
		// Empty
		PreferenceMessage = "LSCG Main Menu";
		PreferenceSubscreen = "LSCGMainMenu";
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}
}