import { ICONS } from "utils";
import { GuiBoops } from "./boops";
import { GuiCollar } from "./collar";
import { GuiGlobal } from "./global";
import { GuiHypno } from "./hypno";
import { GuiLipstick } from "./lipstick";
import { GuiSubscreen } from "./settingBase";

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
	Global = 0,
	Collar = 1,
	Hypno = 2,
	Boops = 3,
	Lipstick = 4,
    Activities = 5,
	Misc = 99
}

export const SETTING_NAMES: Record<ModuleCategory, string> = {
    [ModuleCategory.Global]: "General",
    [ModuleCategory.Collar]: "Choke Collar",
    [ModuleCategory.Hypno]: "Hypnosis",
    [ModuleCategory.Boops]: "Boops",
    [ModuleCategory.Lipstick]: "Lipstick",
    [ModuleCategory.Activities]: "Activities",
    [ModuleCategory.Misc]: "Miscellaneous"
};

export const SETTING_ICONS: Record<ModuleCategory, string> = {
    [ModuleCategory.Global]: ICONS.BDSM,//"Icons/General.png",
    [ModuleCategory.Collar]: ICONS.COLLAR,// "Icons/Restriction.png",
    [ModuleCategory.Hypno]: ICONS.HYPNO,//"Icons/Visibility.png",
    [ModuleCategory.Boops]: "Icons/Use.png",
    [ModuleCategory.Lipstick]: "Icons/Arousal.png",
    [ModuleCategory.Activities]: "Icons/FriendList.png",
    [ModuleCategory.Misc]: "Icons/General.png"
};