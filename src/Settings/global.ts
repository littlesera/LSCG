import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { ICONS } from "utils";
import { GlobalSettingsModel } from "./Models/base";
import { GuiSubscreen, Setting } from "./settingBase";
import { OpacityModule } from "Modules/opacity";
import { LeashingModule } from "Modules/leashing";
import { ChaoticItemModule } from "Modules/chaotic-item";
import { SplatterLocation, SplatterModule } from "Modules/splatter";

export class GuiGlobal extends GuiSubscreen {

	get name(): string {
		return "General";
	}

	get icon(): string {
		return ICONS.BDSM;
	}

	get settings(): GlobalSettingsModel {
        return super.settings as GlobalSettingsModel;
    }

	get multipageStructure(): Setting[][] {
		return [
			[
				<Setting>{
					type: "checkbox",
					label: "LSCG Scripts Enabled:",
					description: "Enable LSCG Features.",
					setting: () => this.settings.enabled ?? false,
					setSetting: (val) => this.settings.enabled = val
				},<Setting>{
					type: "checkbox",
					label: "Block Settings While Restrained:",
					description: "Prevents LSCG settings access while restrained.",
					setting: () => this.settings.blockSettingsWhileRestrained ?? false,
					setSetting: (val) => this.settings.blockSettingsWhileRestrained = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Immersive Conditions:",
					description: "Applies a more restrictive set of conditional states while incapacitated by LSCG.",
					setting: () => Player.LSCG.StateModule.immersive ?? false,
					setSetting: (val) => Player.LSCG.StateModule.immersive = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Blur While Edged:",
					description: "Apply extra blurring to the screen while edging.",
					setting: () => this.settings.edgeBlur ?? false,
					setSetting: (val) => this.settings.edgeBlur = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Enable Lipstick Marks:",
					description: "Apply kiss marks when lipstick-wearing people kiss you on the cheek/forehead/neck.",
					setting: () => Player.LSCG.LipstickModule.enabled ?? false,
					setSetting: (val) => Player.LSCG.LipstickModule.enabled = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Dry Lipstick:",
					description: "Never apply kissmarks when you are the kisser.",
					setting: () => Player.LSCG.LipstickModule.dry ?? false,
					setSetting: (val) => Player.LSCG.LipstickModule.dry = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Enable Boop Reactions:",
					description: "Auto-react when booped.",
					setting: () => Player.LSCG.BoopsModule.enabled ?? false,
					setSetting: (val) => Player.LSCG.BoopsModule.enabled = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Show Check Rolls:",
					description: "If enabled, will display the attacker/defender roll values for activity checks.",
					setting: () => this.settings.showCheckRolls ?? true,
					setSetting: (val) => this.settings.showCheckRolls = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Share Public Craftings:",
					description: "If enabled, other LSCG users in the room will be able to use your crafted items on other people.",
					setting: () => this.settings.sharePublicCrafting ?? false,
					setSetting: (val) => this.settings.sharePublicCrafting = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Hide Resizing Effects:",
					description: "If checked, you will not see any LSCG resizing effects. (eg. from magic)",
					setting: () => this.settings.hideResizing ?? false,
					setSetting: (val) => this.settings.hideResizing = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Hide all Opacity Overrides:",
					description: "If checked, will skip any opacity override effects. (includes x-ray vision)",
					setting: () => !(Player.LSCG.OpacityModule.enabled ?? true),
					setSetting: (val) => { Player.LSCG.OpacityModule.enabled = (val === false) },
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Prevent Remote Opacity Changes:",
					description: "If checked, other players will not be able to directly modify the opacity settings on your wardrobe items.",
					setting: () => Player.LSCG.OpacityModule.preventExternalMod ?? false,
					setSetting: (val) => Player.LSCG.OpacityModule.preventExternalMod = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Enable Clothed Erection Detection:",
					description: "If checked, you will get a private message if you can feel an erection during certain activities.",
					setting: () => this.settings.erectionDetection ?? false,
					setSetting: (val) => this.settings.erectionDetection = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Allow LSCG Leashing:",
					description: "Allow custom leashing from LSCG activities such as hand-holding, hypnosis, etc.",
					setting: () => Player.LSCG.LeashingModule.enabled ?? true,
					setSetting: (val) => Player.LSCG.LeashingModule.enabled = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Enable Tamperproof Items:",
					description: "Enable tamperproof features on crafted items you wear.",
					setting: () => this.settings.tamperproofEnabled ?? true,
					setSetting: (val) => this.settings.tamperproofEnabled = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "checkbox",
					label: "Enable Chaotic/Evolving Items:",
					description: "Enable chaotic/evolving features on crafted items you wear.",
					setting: () => Player.LSCG.ChaoticItemModule.enabled ?? true,
					setSetting: (val) => Player.LSCG.ChaoticItemModule.enabled = val,
					disabled: !this.settings.enabled
				}
			],
			[<Setting>{
				type: "checkbox",
				label: "Enable Splatters:",
				description: "Enable splatter integration.",
				setting: () => Player.LSCG.SplatterModule.enabled ?? true,
				setSetting: (val) => Player.LSCG.SplatterModule.enabled = val,
				disabled: !this.settings.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Give Splatters:",
				description: "Allow splattering on others.",
				setting: () => Player.LSCG.SplatterModule.giver ?? true,
				setSetting: (val) => Player.LSCG.SplatterModule.giver = val,
				disabled: !Player.LSCG.SplatterModule.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Receive Splatters:",
				description: "Allow others to splatter you.",
				setting: () => Player.LSCG.SplatterModule.taker ?? true,
				setSetting: (val) => Player.LSCG.SplatterModule.taker = val,
				disabled: !Player.LSCG.SplatterModule.enabled
			}, <Setting>{
				type: "checkbox",
				label: "Auto Splatter:",
				description: "If enabled, will prompt for splatter on orgasm.",
				setting: () => Player.LSCG.SplatterModule.autoSplat ?? true,
				setSetting: (val) => Player.LSCG.SplatterModule.autoSplat = val,
				disabled: !Player.LSCG.SplatterModule.enabled
			}, <Setting>{
				type: "text",
				label: "Splatter Color Override:",
				id: "splatter_color",
				description: "Override color for splatter application.",
				setting: () => Player.LSCG.SplatterModule.colorOverride ?? "",
				setSetting: (val) => Player.LSCG.SplatterModule.colorOverride = val,
				disabled: !Player.LSCG.SplatterModule.enabled
			}]
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
		super.Load();
	}
}