import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX } from "./setting_definitions";

export abstract class GuiSubscreen {
	constructor() {
		SETTING_FUNC_NAMES.forEach(name => {
			if (typeof (<any>this)[name] === "function")
				(<any>window)[SETTING_FUNC_PREFIX + this.constructor.name + name] = () => {
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