import { settingsSave } from "utils";
import { BaseSettingsModel } from "./Models/base";
import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX, SETTING_NAMES, SETTING_NAME_PREFIX } from "./setting_definitions";

export abstract class GuiSubscreen {
    static START_X: number = 225;
    static START_Y: number = 125;
    static Y_MOD: number = 120;

	constructor() {
		SETTING_FUNC_NAMES.forEach(name => {
			if (typeof (<any>this)[name] === "function")
				(<any>window)[SETTING_FUNC_PREFIX + SETTING_NAME_PREFIX + this.constructor.name + name] = () => {
					(<any>this)[name]();
				};
		});
	}

    get SubscreenName(): string {
        return SETTING_NAME_PREFIX + this.constructor.name;  
    } 

    get settings(): BaseSettingsModel {
        Player.LSCG.GlobalModule = Player.LSCG.GlobalModule ?? { enabled: true };
        return Player.LSCG.GlobalModule
    }

    getYPos(ix: number) {
        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * ix);
    }

	Load() {
        PreferenceSubscreen = this.SubscreenName;
        PreferenceMessage = this.SubscreenName;
	}

	Run() {
		// Empty
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		// Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, 190, 64, 64)){
			this.settings.enabled = !this.settings.enabled;
		}
	}

	Exit() {
		// Empty
		PreferenceMessage = "LSCG Main Menu";
		PreferenceSubscreen = "LSCGMainMenu";
        settingsSave();
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}
}