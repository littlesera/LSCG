import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { ICONS } from "utils";
import { HypnoSettingsModel } from "./Models/hypno";
import { GuiSubscreen, Setting } from "./settingBase";
import { StateConfig, StateSettingsModel } from "./Models/states";
import { StateModule } from "Modules/states";

export class GuiStates extends GuiSubscreen {

	get name(): string {
		return "Conditions";
	}

	get icon(): string {
		return "Icons/Preference.png";
	}

	get settings(): StateSettingsModel {
		return super.settings as StateSettingsModel;
	}

	get stateModule(): StateModule {
		return this.module as StateModule;
	}

	get multipageStructure(): Setting[][] {
		return [
			[
				<Setting>{
					type: "label",
					label: "General",
					description: "General settings for LSCG Conditions."
				}, <Setting>{
					type: "checkbox",
					label: "Immersive:",
					description: "If true, will apply more restrictions while incapacitated by LSCG.",
					setting: () => this.settings.immersive ?? false,
					setSetting: (val) => this.settings.immersive = val
				}
			], [
				<Setting>{
					type: "label",
					label: "Hypnotized",
					description: "Settings to control your hypnosis."
				}
			], [
				<Setting>{
					type: "label",
					label: "Sleep",
					description: "Settings to control your unconsciousness."
				}
			]
		]
	}

	Exit(): void {
		super.Exit();
		getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
	}
}