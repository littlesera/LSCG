import { getCurrentSubscreen, GUI } from "./settingUtils";

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