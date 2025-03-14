import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { ICONS } from "utils";
import { HypnoSettingsModel } from "./Models/hypno";
import { GuiSubscreen, Setting } from "./settingBase";
import { StateConfig, StateSettingsModel } from "./Models/states";
import { StateModule } from "Modules/states";
import { SplatterSettingsModel } from "./Models/base";
import { SplatterModule } from "Modules/splatter";

export class GuiSplatter extends GuiSubscreen {

	get name(): string {
		return "Splatters";
	}

	get icon(): string {
		return ICONS.SPLAT;
	}

	get settings(): SplatterSettingsModel {
		return super.settings as SplatterSettingsModel;
	}

	get splatterModule(): SplatterModule {
		return this.module as SplatterModule;
	}

	get multipageStructure(): Setting[][] {
		return [[
			<Setting>{
				type: "checkbox",
				label: "Enable Splatters:",
				description: "Enable splatter integration.",
				setting: () => this.settings.enabled ?? false,
				setSetting: (val) => this.settings.enabled = val,
				disabled: !Player.LSCG.GlobalModule.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Give Splatters:",
				description: "Allow splattering on others.",
				setting: () => this.settings.giver ?? true,
				setSetting: (val) => this.settings.giver = val,
				disabled: !this.settings.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Receive Splatters:",
				description: "Allow others to splatter you.",
				setting: () => this.settings.taker ?? true,
				setSetting: (val) => this.settings.taker = val,
				disabled: !this.settings.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Auto Splatter:",
				description: "If enabled, will prompt for splatter on orgasm.",
				setting: () => this.settings.autoSplat ?? true,
				setSetting: (val) => this.settings.autoSplat = val,
				disabled: !this.settings.enabled || !this.settings.giver
			}, <Setting>{
				type: "checkbox",
				label: "Uncontrollable when Bound:",
				description: "If enabled, the user will only be able to control where splatter is applied if unrestrained.",
				setting: () => this.settings.uncontrollableWhenBound ?? true,
				setSetting: (val) => this.settings.uncontrollableWhenBound = val,
				disabled: !this.settings.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Lovers Only:",
				description: "If enabled, only your lovers and whitelist will be able to apply splatters to you.",
				setting: () => this.settings.requireLover ?? true,
				setSetting: (val) => this.settings.requireLover = val,
				disabled: !this.settings.enabled
			}, <Setting>{
				type: "text",
				id: "splat_whitelist",
				label: "Splatter Whitelist:",
				description: "Set member numbers who are explicitly allowed to splatter on you. Comma separated list of member IDs.",
				disabled: !this.settings.enabled,
				setting: () => this.settings.whitelist?.join(", ") ?? "",
				setSetting: (val) => this.settings.whitelist = val.split(",").map((x: any) => x.trim())
			}, <Setting>{
				type: "text",
				id: "splat_blacklist",
				label: "Splatter Blacklist:",
				description: "Set member numbers who are explicitly blocked from splattering on you. Comma separated list of member IDs.",
				disabled: !this.settings.enabled,
				setting: () => this.settings.blacklist?.join(", ") ?? "",
				setSetting: (val) => this.settings.blacklist = val.split(",").map((x: any) => x.trim())
			}, <Setting>{
				type: "text",
				label: "Splatter Color Override:",
				id: "splatter_color",
				description: "Override color for splatter application.",
				setting: () => this.settings.colorOverride ?? "",
				setSetting: (val) => this.settings.colorOverride = val,
				disabled: !this.settings.enabled
			}
		]]
	}
}