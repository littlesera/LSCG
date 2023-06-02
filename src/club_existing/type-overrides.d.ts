interface PlayerCharacter extends Character {
    LSCG: import("Settings/Models/settings").SettingsModel;
}

interface OtherCharacter extends Character {
    LSCG: import("Settings/Models/settings").IPublicSettingsModel;
}

interface PlayerOnlineSettings {
	LSCG: import("Settings/Models/settings").SettingsModel;
}

interface LSCGMessageDictionaryEntry {
    message: LSCGMessageModel;
}

type LSCGMessageModelType = "init" | "sync" | "command";

interface LSCGMessageModel {
    type: LSCGMessageModelType;
    version: string;
    settings: import("Settings/Models/settings").IPublicSettingsModel,
    target: number | null,
    reply: boolean
}