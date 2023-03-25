import { bcModSDK, hookFunction } from "utils";
import { BaseModule } from "../base";

export function initSettings() {
	PreferenceSubscreenList.push("LSCGSettings");
	bcModSDK.hookFunction("TextGet", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[0] == "HomepageLSCGSettings") return "Club Games Settings";
		return next(args);
	});
	bcModSDK.hookFunction("DrawButton", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[6] == "Icons/LSCGSettings.png") args[6] = "Icons/Asylum.png";
		return next(args);
	});
	bcModSDK.hookFunction("PreferenceClick", 2, (args, next) => {
		console.info(args);
		return next(args);
	});
}

export function getCurrentSubscreen(): GuiSubscreen | null {
	return GUI.instance && GUI.instance.currentSubscreen;
}

export function setSubscreen(subscreen: GuiSubscreen | null): void {
	if (!GUI.instance) {
		throw new Error("Attempt to set subscreen before init");
	}
	GUI.instance.currentSubscreen = subscreen;
}

export class GUI extends BaseModule {
	static instance: GUI | null = null;

	private _currentSubscreen: GuiSubscreen | null = null;

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
		//ChatroomSM.UpdateStatus();
	}

	constructor() {
		super();
		if (GUI.instance) {
			throw new Error("Duplicate initialization");
		}
		GUI.instance = this;
	}
}

export abstract class GuiSubscreen {
	get active(): boolean {
		return getCurrentSubscreen() === this;
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
		setSubscreen(null);
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}
}