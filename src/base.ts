import { BaseSettingsModel } from "Settings/Models/base";
import { Subscreen } from "Settings/setting_definitions";

export abstract class BaseModule {
	get settingsScreen() : Subscreen | null {
		return null;
	};

	/** Allows changing the subkey for that module settings storage */
	get settingsStorage(): string | null {
		return this.constructor.name;
	}

	get settings(): BaseSettingsModel {
		if (!this.settingsStorage) return {} as BaseSettingsModel;
		return (<any>Player.LSCG)[this.settingsStorage];
	}

	get Enabled(): boolean {
		return (Player.LSCG.GlobalModule.enabled && this.settings.enabled && CurrentModule == "Online");
	}

	init() {
		this.registerDefaultSettings();
	}

	registerDefaultSettings(): void {
		const storage = this.settingsStorage;
		const defaults = this.defaultSettings;
		if (!storage || !defaults) return;

		(<any>Player.LSCG)[storage] = Object.assign(defaults, (<any>Player.LSCG)[storage] ?? {});
	}

	get defaultSettings(): BaseSettingsModel | null {
		return null;
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