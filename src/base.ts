import { BaseSettingsModel } from "Settings/Models/base";
import { SettingsModel } from "Settings/Models/settings";
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
		if (!Player.LSCG) {
			Player.LSCG = <SettingsModel>{};
			this.registerDefaultSettings();
		}
		else if (!(<any>Player.LSCG)[this.settingsStorage])
			this.registerDefaultSettings();
		return (<any>Player.LSCG)[this.settingsStorage];
	}

	get Enabled(): boolean {
		if (!Player.LSCG || !Player.LSCG.GlobalModule)
			return false;
		return Player.LSCG.GlobalModule.enabled && this.settings.enabled && 
			(ServerPlayerIsInChatRoom() || 
			(CurrentModule == "Room" && CurrentScreen == "Crafting"));
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

	safeword() {
		// Empty
	}
}