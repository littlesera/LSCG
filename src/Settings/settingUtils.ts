import { BaseModule } from "../base";

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