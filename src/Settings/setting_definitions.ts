export enum SettingCategory {
	Global = 0,
	Collar = 1,
	Hypno = 2,
	Boops = 3,
	Lipstick = 4//,
	//Misc = 99
}

export const SETTING_NAMES: Record<SettingCategory, string> = {
	[SettingCategory.Global]: "Global",
	[SettingCategory.Collar]: "Choke Collar",
	[SettingCategory.Hypno]: "Hypno",
	[SettingCategory.Boops]: "Boops",
	[SettingCategory.Lipstick]: "Lipstick"
};

export const SETTING_ICONS: Record<SettingCategory, string> = {
	[SettingCategory.Global]: "Icons/General.png",
	[SettingCategory.Collar]: "Icons/Restriction.png",
	[SettingCategory.Hypno]: "Icons/Visibility.png",
	[SettingCategory.Boops]: "Icons/Use.png",
	[SettingCategory.Lipstick]: "Icons/Arousal.png"
};