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
		const storage = this.settingsStorage as keyof SettingsModel | null;
		if (!storage) return {} as BaseSettingsModel;
		if (!Player.LSCG) {
			Player.LSCG = <SettingsModel>{};
			this.registerDefaultSettings();
		}
		else if (!Player.LSCG[storage])
			this.registerDefaultSettings();
		return Player.LSCG[storage] as BaseSettingsModel;
	}

	get Enabled(): boolean {
		if (!Player.LSCG?.GlobalModule?.enabled)
			return false;
		const settings = this.settings;
		return (!settings ? true : settings.enabled) &&
			// ChatRoom first: this runs hundreds of times a frame, and the full check walks every registered screen
			(CurrentScreen === "ChatRoom" || ServerPlayerIsInChatRoom() ||
			(CurrentModule === "Room" && CurrentScreen === "Crafting") ||
			(CurrentModule === "Room" && CurrentScreen === "MainHall") ||
			(CurrentModule === "Character" && CurrentScreen === "Appearance"));
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

	get commands(): ICommand[] {
		// Empty
		return [];
	}
}