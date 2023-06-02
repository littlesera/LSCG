import { ICONS } from "utils";
import { HypnoSettingsModel } from "./Models/hypno";
import { InjectorSettingsModel } from "./Models/injector";
import { GuiSubscreen, Setting } from "./settingBase";

export class GuiInjector extends GuiSubscreen {

	get name(): string {
		return "Injector Enhancements";
	}

	get icon(): string {
		return ICONS.INJECTOR;
	}

	get settings(): InjectorSettingsModel {
		return super.settings as InjectorSettingsModel;
	}

	get structure(): Setting[] {
		return [
			<Setting>{
				type: "checkbox",
				label: "Enabled:",
				description: "Enable Enhanced Injections and Net Gun.",
				setting: () => this.settings.enabled ?? false,
				setSetting: (val) => this.settings.enabled = val
			},<Setting>{
				type: "checkbox",
				label: "Immersive:",
				description: "Block LSCG settings while drugged.",
				setting: () => this.settings.immersive ?? false,
				setSetting: (val) => this.settings.immersive = val
			},<Setting>{
				type: "checkbox",
				label: "Enable Sedative:",
				description: "Activates for any injector with \"sedative\" or \"tranquilizer\" in its crafted name or description.",
				setting: () => this.settings.enableSedative ?? false,
				setSetting: (val) => this.settings.enableSedative = val
			},<Setting>{
				type: "checkbox",
				label: "Enable Brainwash Drug:",
				description: "Activates for any injector with \"mind control,\" \"hypnotizing,\" or \"brainwashing\" in its crafted name ordescription.",
				setting: () => this.settings.enableMindControl ?? false,
				setSetting: (val) => this.settings.enableMindControl = val
			},<Setting>{
				type: "checkbox",
				label: "Enable Aphrodisiac:",
				description: "Activates for any injector with \"horny\" or \"aphrodisiac\" in its crafted name or description.",
				setting: () => this.settings.enableHorny ?? false,
				setSetting: (val) => this.settings.enableHorny = val
			},<Setting>{
				type: "checkbox",
				label: "Heartbeat Sound:",
				description: "If true, enables an occasional heartbeat sound while under the influence of aphrodisiac.",
				setting: () => this.settings.heartbeat ?? true,
				setSetting: (val) => this.settings.heartbeat = val
			},<Setting>{
				type: "checkbox",
				label: "Show Drug Levels:",
				description: "If true, will display bars showing the level of each drug type.",
				setting: () => this.settings.showDrugLevels ?? true,
				setSetting: (val) => this.settings.showDrugLevels = val
			},<Setting>{
				type: "checkbox",
				label: "Allow Boop Awake:",
				description: "If true, will awaken from drugged sleep or trance when booped.",
				setting: () => this.settings.allowBoopRestore ?? true,
				setSetting: (val) => this.settings.allowBoopRestore = val
			},<Setting>{
				type: "checkbox",
				label: "Chaotic Net Gun:",
				description: "If true, your net gun will fire wildly and have a 50/50 chance to net a random character instead of your target.",
				setting: () => this.settings.netgunIsChaotic ?? true,
				setSetting: (val) => this.settings.netgunIsChaotic = val
			}
		]
	}
}