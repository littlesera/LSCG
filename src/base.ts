import { BaseSettingsModel } from "Settings/Models/base";
import { settingsSave } from "utils";

export abstract class BaseModule {

	get settings(): BaseSettingsModel {
		(<any>Player.LSCG)[this.constructor.name] = (<any>Player.LSCG)[this.constructor.name] || {};
		return (<any>Player.LSCG)[this.constructor.name];
	}

	get checkEnabled(): boolean {
		return this.settings.enabled;
	}

	init() {
		// Empty
	}

	load() {
		// Empty
	}

	run() {
		// Empty
	}

	unload() {
		// Empty
	}

	reload() {
		// Empty
	}
}