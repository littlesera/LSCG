declare const LZString: import("lz-string").LZStringStatic;

interface PlayerCharacter extends Character {
    LSCG: import("Settings/Models/settings").SettingsModel;
}

interface OtherCharacter extends Character {
    LSCG: import("Settings/Models/settings").IPublicSettingsModel;
}

interface PlayerOnlineSettings {
	LSCG: import("Settings/Models/settings").SettingsModel | string;
}

interface PlayerExtensionSettings {
    LSCG: string;
}

interface LSCGMessageDictionaryEntry {
    message: LSCGMessageModel;
}

interface CommonGenerateGridParameters {
    x: number,
    y: number,
    width: number,
    height: number,
    itemWidth: number,
    itemHeight: number
}

type LSCGMessageModelType = "init" | "sync" | "command";

type LSCGCommandName = "debug" | "grab" | "release" | "remote" | "escape" | "collar-tighten" | "collar-loosen" | "collar-stats" | "photo" | "spell" | "spell-teach" | "pair" | "unpair" | "pairing-update" | "get-spell" | "get-spell-response";

type LSCGState = "none" | "hypnotized" | "asleep" | "horny" | "choking" | "held" | "blind" | "deaf" | "frozen" | "gagged" | "redressed" | "arousal-paired" | "orgasm-siphoned" | "leashed" | "resized" | "buffed" | "polymorphed" | "x-ray-vision";

type LSCGImmersiveOption = "true" | "false" | "whenImmersive";

interface LSCGMessageModel {
    IsLSCG: boolean;
    type: LSCGMessageModelType;
    version: string;
    settings: import("Settings/Models/settings").IPublicSettingsModel | null,
    target: number | null,
    reply: boolean,
    command?: {
        name: LSCGCommandName,
        args: {name: string, value: any}[]
    }
}