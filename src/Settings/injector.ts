import { ICONS } from "utils";
import { InjectorSettingsModel } from "./Models/injector";
import { GuiSubscreen, Setting } from "./settingBase";
import { getModule } from "modules";
import { MiscModule } from "Modules/misc";

export class GuiInjector extends GuiSubscreen {

	get name(): string {
		return "Drug Enhancements";
	}

	get icon(): string {
		return ICONS.INJECTOR;
	}

	get settings(): InjectorSettingsModel {
		return super.settings as InjectorSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		return [
			// Page 1 (general checkboxes)
			[
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
					description: "Activates for any injector or drink with \"sedative\" or \"tranquilizer\" in its crafted name or description.",
					setting: () => this.settings.enableSedative ?? false,
					setSetting: (val) => this.settings.enableSedative = val
				},<Setting>{
					type: "checkbox",
					label: "Enable Brainwash Drug:",
					description: "Activates for any injector or drink with \"mind control,\" \"hypnotizing,\" or \"brainwashing\" in its crafted name ordescription.",
					setting: () => this.settings.enableMindControl ?? false,
					setSetting: (val) => this.settings.enableMindControl = val
				},<Setting>{
					type: "checkbox",
					label: "Enable Aphrodisiac:",
					description: "Activates for any injector or drink with \"horny\" or \"aphrodisiac\" in its crafted name or description.",
					setting: () => this.settings.enableHorny ?? false,
					setSetting: (val) => this.settings.enableHorny = val
				},<Setting>{
					type: "number",
					id: "drink_limit",
					label: "Filled Glass Sip Limit:",
					description: "Number of sips before your filled glasses empty. (0 for no limit)",
					disabled: !this.settings.enabled,
					setting: () => (this.settings.sipLimit ?? 0),
					setSetting: (val) => this.settings.sipLimit = val
				},<Setting>{
					type: "checkbox",
					label: "Allow Continuous Delivery:",
					description: "If true, will allow respirators to deliver a continuous supply of drugged gas.",
					setting: () => this.settings.enableContinuousDelivery ?? true,
					setSetting: (val) => this.settings.enableContinuousDelivery = val
				},<Setting>{
					type: "checkbox",
					label: "Inexhaustible Gases:",
					description: "If true, any continuous delivery (eg. respirator) on you will never run out of gas.",
					setting: () => this.settings.continuousDeliveryForever ?? false,
					setSetting: (val) => this.settings.continuousDeliveryForever = val
				},<Setting>{
					type: "checkbox",
					label: "Show Drug Levels:",
					description: "If true, will display bars showing the level of each drug type.",
					setting: () => this.settings.showDrugLevels ?? true,
					setSetting: (val) => this.settings.showDrugLevels = val
				},<Setting>{
					type: "checkbox",
					label: "Heartbeat Sound:",
					description: "If true, enables an occasional heartbeat sound while under the influence of aphrodisiac.",
					setting: () => this.settings.heartbeat ?? true,
					setSetting: (val) => this.settings.heartbeat = val
				},<Setting>{
					type: "checkbox",
					label: "Chaotic Net Gun:",
					description: "If true, your net gun will fire wildly and have a 50/50 chance to net a random character instead of your target.",
					setting: () => this.settings.netgunIsChaotic ?? true,
					setSetting: (val) => this.settings.netgunIsChaotic = val
				}
			],
			// Page 2 (chloro settings)
			[
				<Setting>{
					type: "checkbox",
					label: "Enable Chloroform:",
					description: "Fall asleep if chloroformed.",
					setting: () => Player.LSCG.MiscModule.chloroformEnabled ?? false,
					setSetting: (val) => Player.LSCG.MiscModule.chloroformEnabled = val
				},<Setting>{
					type: "checkbox",
					label: "Immersive Chloroform:",
					description: "Enforce chloroform with more restrictive measures. LSCG settings will be unavailable while asleep.",
					setting: () => Player.LSCG.MiscModule.immersiveChloroform ?? false,
					setSetting: (val) => Player.LSCG.MiscModule.immersiveChloroform = val
				},<Setting>{
					type: "checkbox",
					label: "Chloroform Never Fades:",
					description: "If enabled one rag over your mouth will last forever until removed, otherwise its potency will fade after an hour.",
					setting: () => Player.LSCG.MiscModule.infiniteChloroformPotency ?? false,
					setSetting: (val) => Player.LSCG.MiscModule.infiniteChloroformPotency = val
				}
			]
		]
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		getModule<MiscModule>("MiscModule")?.settings;
		super.Load();
	}
}