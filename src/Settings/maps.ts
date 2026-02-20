import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { ICONS } from "utils";
import { GlobalSettingsModel, MapSettingsModel } from "./Models/base";
import { GuiSubscreen, Setting } from "./settingBase";
import { OpacityModule } from "Modules/opacity";
import { LeashingModule } from "Modules/leashing";
import { ChaoticItemModule } from "Modules/chaotic-item";
import { SplatterModule } from "Modules/splatter";
import { MapModule } from "Modules/map";

export class GuiMaps extends GuiSubscreen {

	get name(): string {
		return "Enhanced Map Lighting";
	}

	get icon(): string {
		return ICONS.LIGHTBULB;
	}

	get settings(): MapSettingsModel {
        return super.settings as MapSettingsModel;
    }

	get multipageStructure(): Setting[][] {
		return [
			[
				<Setting>{
					type: "checkbox",
					label: "Enhance Map Lighting:",
					description: "If checked, map lighting will become more dynamic based on light sources [EXPERIMENTAL].",
					setting: () => this.settings.enhancedLighting ?? true,
					setSetting: (val) => this.settings.enhancedLighting = val
				}, <Setting>{
					type: "checkbox",
					label: "Disable Lighting Animation:",
					description: "If checked, lighting animations will be disabled (Enable if maps running slow).",
					setting: () => this.settings.disableLightAnimation ?? false,
					setSetting: (val) => this.settings.disableLightAnimation = val,
					disabled: !this.settings.enhancedLighting
				}, <Setting>{
					type: "checkbox",
					label: "Use Room's Ambient Darkness:",
					description: "If checked, will use the room customization filter as ambient darkness (Recommended).",
					setting: () => this.settings.useRoomCustomization ?? true,
					setSetting: (val) => this.settings.useRoomCustomization = val,
					disabled: !this.settings.enhancedLighting
				}, <Setting>{
					type: "checkbox",
					label: "Use Alternate Blinding Effect:",
					description: "If checked, you will use an alternate blinding effect while in maps.",
					setting: () => this.settings.useEnhancedBlinding ?? true,
					setSetting: (val) => this.settings.useEnhancedBlinding = val
				}
			]
		]
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		getModule<MiscModule>("MiscModule")?.settings;
		getModule<LipstickModule>("LipstickModule")?.settings;
		getModule<LeashingModule>("LeashingModule")?.settings;
		getModule<BoopsModule>("BoopsModule")?.settings;
		getModule<OpacityModule>("OpacityModule")?.settings;
		getModule<ChaoticItemModule>("ChaoticItemModule")?.settings;
		getModule<SplatterModule>("SplatterModule")?.settings;
		getModule<MapModule>("MapModule")?.settings;
		super.Load();
	}
}