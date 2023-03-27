import { BaseSettingsModel } from "Settings/Models/base";

export abstract class BaseModule {

	get settings(): BaseSettingsModel {
		(<any>Player.LSCG)[this.constructor.name] = (<any>Player.LSCG)[this.constructor.name] || {};
		return (<any>Player.LSCG)[this.constructor.name];
	}

	get Enabled(): boolean {
		return (Player.LSCG.GlobalModule.enabled && this.settings.enabled);
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