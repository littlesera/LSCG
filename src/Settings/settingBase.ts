import { settingsSave } from "utils";
import { BaseSettingsModel } from "./Models/base";
import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX, SETTING_NAME_PREFIX, setSubscreen } from "./setting_definitions";
import { BaseModule } from "base";
import { GUI } from "./settingUtils";

export abstract class GuiSubscreen {
    static START_X: number = 225;
    static START_Y: number = 125;
    static Y_MOD: number = 100;
	readonly module: BaseModule;

	constructor(module: BaseModule) {
		this.module = module;

		// create each handler for a new preference subscreen
		SETTING_FUNC_NAMES.forEach(name => {
			const fName = SETTING_FUNC_PREFIX + SETTING_NAME_PREFIX + this.name + name;
			if (typeof (<any>this)[name] === "function" && typeof (<any>window)[fName] !== "function")
				(<any>window)[fName] = () => {
					(<any>this)[name]();
				};
		});
	}

	get name(): string {
		throw "Override name in your subscreen class";
	}

	get icon(): string {
		throw "Override icon in your subscreen class";
	}

	get label(): string {
		throw "Override icon in your subscreen class";
	}

	get enabled(): boolean {
		return true;
	}

	get message(): string {
		return PreferenceMessage;
	}

	set message(s: string) {
		PreferenceMessage = s;
	}

    get SubscreenName(): string {
        return SETTING_NAME_PREFIX + this.constructor.name;  
    }

	setSubscreen(screen: GuiSubscreen | string | null) {
		return setSubscreen(screen);
	}

    get settings(): BaseSettingsModel {
        Player.LSCG.GlobalModule = Player.LSCG.GlobalModule ?? { enabled: true };
        return Player.LSCG.GlobalModule
    }

	get character(): Character {
		// Because we're initialized by that instance, it must already exist
		return GUI.instance?.currentCharacter as Character;
	}

    getYPos(ix: number) {
        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * ix);
    }

	Load() {
        // Empty
	}

	Run() {
		// Empty
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
	}

	Exit() {
		setSubscreen("MainMenu");
		settingsSave();
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}
}