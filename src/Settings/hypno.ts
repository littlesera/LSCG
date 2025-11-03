import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { ICONS } from "utils";
import { HypnoSettingsModel, InstructionDescription, LSCGHypnoInstruction } from "./Models/hypno";
import { GuiSubscreen, HelpInfo, Setting } from "./settingBase";
import { drawTooltip } from "./settingUtils";

export class GuiHypno extends GuiSubscreen {

	get name(): string {
		return "Triggered Hypnosis";
	}

	get icon(): string {
		return ICONS.HYPNO;
	}

	get settings(): HypnoSettingsModel {
		return super.settings as HypnoSettingsModel;
	}

	get help(): HelpInfo {
		return {
			label: 'Open Hypnosis Wiki on GitHub',
			link: 'https://github.com/littlesera/LSCG/wiki/Hypnosis'
		}
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
						description: "Enabled the Triggered Hypnosis Features.",
						setting: () => this.settings.enabled ?? false,
						setSetting: (val) => this.settings.enabled = val
					},<Setting>{
						type: "checkbox",
						label: "Random Trigger:",
						description: "If enabled, your trigger word will be selected from a list of random english words.",
						setting: () => this.settings.randomTrigger ?? false,
						setSetting: (val) => this.settings.randomTrigger = val
					},<Setting>{
						type: "text",
						id: "hypno_overrideWords",
						label: "Trigger Words:",
						description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
						disabled: !this.settings.enabled || this.settings.randomTrigger,
						overrideWidth: 800,
						setting: () => this.settings.overrideWords ?? "",
						setSetting: (val) => this.settings.overrideWords = val
					},<Setting>{
						type: "text",
						id: "hypno_overrideAwakeners",
						label: "Awaken Words:",
						description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
						disabled: !this.settings.enabled,
						overrideWidth: 800,
						setting: () => this.settings.awakeners ?? "",
						setSetting: (val) => this.settings.awakeners = val
					},<Setting>{
						type: "text",
						id: "hypno_silenceWords",
						label: "Silence Trigger Words:",
						description: "When spoken while hypnotized, will prevent speech. Separated by a comma.",
						disabled: !this.settings.enabled,
						overrideWidth: 800,
						setting: () => this.settings.silenceTriggers ?? "",
						setSetting: (val) => this.settings.silenceTriggers = val
					}, <Setting>{
						type: "text",
						id: "hypno_speakWords",
						label: "Allow Speech Trigger Words:",
						description: "When spoken while hypnotized, will allow speech. Separated by a comma.",
						disabled: !this.settings.enabled,
						overrideWidth: 800,
						setting: () => this.settings.speakTriggers ?? "",
						setSetting: (val) => this.settings.speakTriggers = val
					}, <Setting>{
						type: "text",
						id: "hypno_overrideMembers",
						label: "Whitelist Member IDs:",
						description: "Comma separated list of member IDs exclusive allowed to access your hypno settings and triggers. If empty will use standard Item Permissions.",
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
						setSetting: (val) => this.settings.cycleTime = val,
						overrideWidth: 150
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
					},<Setting>{
						type: "checkbox",
						label: "Enable Spirals:",
						description: "If checked headsets and other spirals can cause trance.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.enableSpirals ?? true,
						setSetting: (val) => this.settings.enableSpirals = val
					},<Setting>{
						type: "text",
						id: "hypno_eyeColor",
						label: "Hypnotized Eye Color:",
						description: "Hex code of your eye color while hypnotized (default: #A2A2A2).",
						disabled: !this.settings.enabled,
						setting: () => this.settings.hypnoEyeColor ?? "#A2A2A2",
						setSetting: (val) => this.settings.hypnoEyeColor = val
					},<Setting>{
						type: "number",
						id: "hypno_eyeType", // Consider making bigger UI for eye picking here, similar to selecting from wardrobe.
						label: "Hypnotized Eye Type:",
						description: "Eye type # to use while under hypnosis (default: 9).",
						disabled: !this.settings.enabled,
						setting: () => (this.settings.hypnoEyeType ?? 9),
						setSetting: (val) => {
							this.settings.hypnoEyeType = Math.min(14, Math.max(0, val)) // UPDATE THIS WHEN EYE STYLES CHANGE
							let test = AssetGet("Female3DCG", "Eyes", "Eyes" + val);
							if (!test) this.settings.hypnoEyeType = 9; // default to style 9 if somehow we can't find a valid eye type here.
						}
					},<Setting>{
						type: "checkbox",
						label: "Enable wake-up on snaps:",
						description: "If checked you exit the trance when you hear someone snapping.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.enableSnapWakeup ?? true,
						setSetting: (val) => this.settings.enableSnapWakeup = val
					}
				], [
					<Setting>{
						type: "checkbox",
						label: "Enable Suggestion Programming",
						description: "If checked, hypnotic suggestions may be induced within you while under trance.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.allowSuggestions ?? false,
						setSetting: (val) => this.settings.allowSuggestions = val
					}, <Setting>{
						type: "checkbox",
						label: "Programming Limited to Hypnotizer",
						description: "If checked, only your hypnotizer may induce hypnotic suggestions within you.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.suggestionRequireHypnotizer ?? true,
						setSetting: (val) => this.settings.suggestionRequireHypnotizer = val
					}, <Setting>{
						type: "checkbox",
						label: "Allow Suggestion Removal",
						description: "If checked, you can remove suggestions installed in you with '/lscg remove-suggestion' if you are not immersive and not on extreme difficulty.",
						disabled: !this.settings.enabled || (Player.LSCG?.StateModule?.immersive ?? false) || Player.GetDifficulty() >= 3,
						setting: () => (this.settings.allowSuggestionRemoval ?? false) && !((Player.LSCG?.StateModule?.immersive ?? false) || Player.GetDifficulty() >= 3),
						setSetting: (val) => this.settings.allowSuggestionRemoval = val
					}, <Setting>{
						type: "checkbox",
						label: "Always Submit to Suggestions:",
						description: "If checked, you will always submit to suggestions.",
						setting: () => this.settings.alwaysSubmit ?? false,
						setSetting: (val) => this.settings.alwaysSubmit = val
					}, <Setting>{
						type: "text",
						id: "suggestion_alwaysSubmitMembers",
						label: "Always Submit to Member IDs:",
						description: "Comma separated list of member IDs. If empty will use standard Item Permissions. You will always submit to their suggestions.",
						disabled: this.settings.alwaysSubmit,
						setting: () => this.settings.alwaysSubmitMemberIds ?? "",
						setSetting: (val) => this.settings.alwaysSubmitMemberIds = val
					}, <Setting>{
						type: "label", // Blank Spot
						label: "",
						description: "",
						hidden: this.settings.locked
					}, <Setting>{
						type: "label",
						label: "Blocked Instructions:",
						description: "Toggle which suggestion instructions you want to block on yourself.",
						hidden: this.settings.locked
					}, <Setting>{
						type: "label", // Blank Spot
						label: "",
						description: "",
						hidden: this.settings.locked
					}
				]
			]
		}
	}

	Run(): void {
		super.Run();

		if (!this.settings.locked && PreferencePageCurrent == 3) {
			if (!this.settings.blockedInstructions)
				this.settings.blockedInstructions = [];
			let val = this.settings.blockedInstructions.indexOf(this.Instruction) > -1;
			let blockedStr = val ? "Blocked" : "Allowed";
			DrawBackNextButton(780, this.getYPos(6)-32, 600, 64, this.Instruction, "White", "", () => "", () => "");
			DrawCheckbox(780 + 600 + 64, this.getYPos(6) - 32, 64, 64, "", val);
			if (MouseIn(780 + 600 + 64, this.getYPos(6) - 32, 64, 64))
				drawTooltip(MouseX, MouseY, 128, blockedStr, "left");

			MainCanvas.textAlign = "left";
			DrawTextFit(InstructionDescription(this.Instruction), 780, this.getYPos(7), 1000, "Black");
			MainCanvas.textAlign = "center";
		}
	}

	Click(): void {
		super.Click();

		if (!this.settings.locked && PreferencePageCurrent == 3) {
			if (MouseIn(780, this.getYPos(6)-32, 600, 64)) {
				this.InstructionIndex = this.GetNewIndexFromNextPrevClick(1080, this.InstructionIndex, this.ActualInstructions.length);
			} else if (MouseIn(780 + 600 + 64, this.getYPos(6) - 32, 64, 64)) {
				if (this.settings.blockedInstructions.indexOf(this.Instruction) > -1)
					this.settings.blockedInstructions = this.settings.blockedInstructions.filter(i => i != this.Instruction);
				else this.settings.blockedInstructions.push(this.Instruction);
			}
		}
	}

	InstructionIndex: number = 0;
	get Instruction(): LSCGHypnoInstruction {
		return this.ActualInstructions[this.InstructionIndex];
	}
	get ActualInstructions(): LSCGHypnoInstruction[] {
		return this.Instructions.filter(e => e != LSCGHypnoInstruction.none);
	}
	get Instructions(): LSCGHypnoInstruction[] {
		return Object.values(LSCGHypnoInstruction);
	}

	Exit(): void {
		super.Exit();
		getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
	}
}
