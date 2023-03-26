import { BaseModule } from "../base";

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

	load(): void {
		
	}
}

export abstract class GuiSubscreen {
	get active(): boolean {
		return getCurrentSubscreen() === this;
	}

	constructor() {
		(<any>window)["PreferenceSubscreenLSCG" + this.constructor.name + "Load"] = () => {
			this.Run();
		};
		(<any>window)["PreferenceSubscreenLSCG" + this.constructor.name + "Run"] = () => {
			this.Run();
		};
		(<any>window)["PreferenceSubscreenLSCG" + this.constructor.name + "Click"] = () => {
			this.Click();
		};
		(<any>window)["PreferenceSubscreenLSCG" + this.constructor.name + "Exit"] = () => {
			this.Exit();
		};
		(<any>window)["PreferenceSubscreenLSCG" + this.constructor.name + "Unload"] = () => {
			this.Unload();
		};
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
		PreferenceExit();
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}
}