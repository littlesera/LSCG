import { BaseModule } from "base";
import { GuiSubscreen } from "./settingBase";
import { GUI } from "./settingUtils";

export const SETTING_FUNC_PREFIX: string = "PreferenceSubscreen";
export const SETTING_NAME_PREFIX: string = "LSCG";
export const SETTING_FUNC_NAMES: string[] = [
    "Load",
    "Unload",
    "Run",
    "Click",
    "Exit"
];

export enum ModuleCategory {
	Core = -1,
	Global = 0,
	Collar = 1,
	Hypno = 2,
	Boops = 3,
	Lipstick = 4,
    Activities = 5,
	Injector = 6,
	ItemUse = 7,
	RemoteUI = 98,
	Misc = 99,
	Commands = 100
}

export type Subscreen = (new (module: BaseModule) => GuiSubscreen);

export function getCurrentSubscreen(): GuiSubscreen | null {
	return GUI.instance && GUI.instance.currentSubscreen;
}

export function setSubscreen(subscreen: GuiSubscreen | string | null): GuiSubscreen | null {
	if (!GUI.instance) {
		throw new Error("Attempt to set subscreen before init");
	}
	GUI.instance.currentSubscreen = subscreen;
	return GUI.instance.currentSubscreen;
}
