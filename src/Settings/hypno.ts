import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { ICONS } from "utils";
import { HypnoSettingsModel } from "./Models/hypno";
import { GuiSubscreen, Setting } from "./settingBase";

export class GuiHypno extends GuiSubscreen {

	get name(): string {
		return "Hypnosis";
	}

	get icon(): string {
		return ICONS.HYPNO;
	}

	get settings(): HypnoSettingsModel {
		return super.settings as HypnoSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		if (this.settings.locked) {
			return [[
				<Setting>{
					type: "label",
					label: "** Hypnosis Settings Locked **",
					description: "Hypnosis Settings Locked Remotely"
				}]];
		} else {
			return [
				[
					<Setting>{
						type: "checkbox",
						label: "Enabled:",
						description: "Enabled the Hypnosis Features.",
						setting: () => this.settings.enabled ?? false,
						setSetting: (val) => this.settings.enabled = val
					},<Setting>{
						type: "checkbox",
						label: "Immersive Hypnosis:",
						description: "Makes the hypnotized experience more restrictive. LSCG settings will be unavailable while hypnotized and triggers are hidden.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.immersive ?? false,
						setSetting: (val) => this.settings.immersive = val
					},<Setting>{
						type: "text",
						id: "hypno_overrideWords",
						label: "Override Trigger Words:",
						description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.overrideWords ?? "",
						setSetting: (val) => this.settings.overrideWords = val
					},<Setting>{
						type: "text",
						id: "hypno_overrideAwakeners",
						label: "Override Awaken Words:",
						description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.awakeners ?? "",
						setSetting: (val) => this.settings.awakeners = val
					},<Setting>{
						type: "text",
						id: "hypno_overrideMembers",
						label: "Override Allowed Member IDs:",
						description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.overrideMemberIds ?? "",
						setSetting: (val) => this.settings.overrideMemberIds = val
					},<Setting>{
						type: "number",
						id: "hypno_triggerTime",
						label: "Hypnosis Length (min.):",
						description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
						disabled: !this.settings.enabled,
						setting: () => (this.settings.triggerTime ?? 5),
						setSetting: (val) => this.settings.triggerTime = val
					},<Setting>{
						type: "number",
						id: "hypno_cooldownTime",
						label: "Cooldown (sec.):",
						description: "Cooldown time (in seconds) before you can be hypnotized again.",
						disabled: !this.settings.enabled,
						setting: () => (this.settings.cooldownTime ?? 0),
						setSetting: (val) => this.settings.cooldownTime = val
					},<Setting>{
						type: "checkbox",
						label: "Enable Cycle:",
						description: "If checked, only one trigger will be active at a time and will cycle after use.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.enableCycle ?? false,
						setSetting: (val) => this.settings.enableCycle = val
					},<Setting>{
						type: "number",
						id: "hypno_cycleTime",
						label: "Trigger Cycle Time (min.):",
						description: "Number of minutes after activation to wait before cycling to a new trigger.",
						disabled: !this.settings.enabled,
						setting: () => (this.settings.cycleTime ?? 30),
						setSetting: (val) => this.settings.cycleTime = val
					}
				], [
					<Setting>{
						type: "checkbox",
						label: "Allow Remote Access:",
						description: "If checked, allowed users can modify these settings.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.remoteAccess ?? false,
						setSetting: (val) => this.settings.remoteAccess = val
					},<Setting>{
						type: "checkbox",
						label: "Remote Access Requires Trance:",
						description: "If checked, remote access is only possible while actively hypnotized.",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.remoteAccessRequiredTrance ?? true,
						setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
					},<Setting>{
						type: "checkbox",
						label: "Remote Access Limited to Hypnotizer:",
						description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.limitRemoteAccessToHypnotizer ?? true,
						setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
					},<Setting>{
						type: "checkbox",
						label: "Allow Remote Override Member Modification:",
						description: "If checked, any remote users can change your Override Member Id list (otherwise, only owner can).",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.allowRemoteModificationOfMemberOverride ?? false,
						setSetting: (val) => this.settings.allowRemoteModificationOfMemberOverride = val
					},<Setting>{
						type: "checkbox",
						label: "Lockable:",
						description: "If checked, allowed users can lock you out of these settings.",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.allowLocked ?? false,
						setSetting: (val) => this.settings.allowLocked = val
					},<Setting>{
						type: "checkbox",
						label: "Build arousal while hypnotized:",
						description: "If checked being hypnotized will increase arousal.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.enableArousal ?? false,
						setSetting: (val) => this.settings.enableArousal = val
					}
				]
			]
		}
	}

	Exit(): void {
		super.Exit();
		getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
	}
}