import { RemoteGuiSubscreen } from "./remoteBase";
import { Setting } from "Settings/settingBase";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { StateConfig } from "Settings/Models/states";

export class RemoteHypno extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Triggered Hypnosis";
	}

	get overrideMemberIds(): number[] {
		return GetDelimitedList(this.settings.overrideMemberIds).map(id => +id).filter(id => id > 0) ?? [];
	}

	get disabledReason(): string {
		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		var isTrance = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
		var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber) || 
								!this.settings.limitRemoteAccessToHypnotizer;

		if (!memberIdIsAllowed)
			return replace_template("You do not have access to %OPP_POSSESSIVE% mind...", this.Character);
		if (!passTranceReq)
			return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
		if (!passHypnotizerReq)
			return replace_template("%OPP_NAME% seems suggestable, but not to you...", this.Character);
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		var isTrance = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
		var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber) || 
								!this.settings.limitRemoteAccessToHypnotizer;

		return this.settings.remoteAccess && 
				(this.Character.IsOwnedByPlayer() ||
					(this.settings.enabled &&
					memberIdIsAllowed &&
					passTranceReq &&
					passHypnotizerReq))
	}

	get icon(): string {
		return ICONS.HYPNO;
	}

	get settings(): HypnoPublicSettingsModel {
		return super.settings as HypnoPublicSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		return [[
			<Setting>{
				type: "text",
				id: "hypno_overrideWords",
				label: "Override Trigger Words:",
				description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
				overrideWidth: 800,
				setting: () => this.settings.overrideWords ?? "",
				setSetting: (val) => this.settings.overrideWords = val
			},<Setting>{
				type: "text",
				id: "hypno_overrideAwakeners",
				label: "Override Awaken Words:",
				description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
				disabled: !this.settings.enabled,
				overrideWidth: 800,
				setting: () => this.settings.awakeners ?? "",
				setSetting: (val) => this.settings.awakeners = val
			},<Setting>{
				type: "text",
				id: "hypno_overrideMembers",
				label: "Override Allowed Member IDs:",
				description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
				disabled: !(this.settings.allowRemoteModificationOfMemberOverride || this.Character.IsOwnedByPlayer()),
				setting: () => this.settings.overrideMemberIds ?? "",
				setSetting: (val) => this.settings.overrideMemberIds = val
			},<Setting>{
				type: "number",
				id: "hypno_triggerTime",
				label: "Hypnosis Length (min.):",
				description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
				setting: () => (this.settings.triggerTime ?? 5),
				setSetting: (val) => this.settings.triggerTime = val
			},<Setting>{
				type: "number",
				id: "hypno_cooldownTime",
				label: "Cooldown (sec.):",
				description: "Cooldown time (in seconds) before you can be hypnotized again.",
				setting: () => (this.settings.cooldownTime ?? 0),
				setSetting: (val) => this.settings.cooldownTime = val
			},<Setting>{
				type: "checkbox",
				label: "Enable Cycle:",
				description: "If checked, only one trigger will be active at a time and will cycle after use.",
				setting: () => this.settings.enableCycle ?? false,
				setSetting: (val) => this.settings.enableCycle = val
			},<Setting>{
				type: "number",
				id: "hypno_cycleTime",
				label: "Trigger Cycle Time (min.):",
				description: "Number of minutes after activation to wait before cycling to a new trigger.",
				setting: () => (this.settings.cycleTime ?? 30),
				setSetting: (val) => this.settings.cycleTime = val
			},<Setting>{
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
				id: "hypno_silenceWords",
				label: "Silence Trigger Words:",
				description: "When spoken while hypnotized, will prevent speech. Separated by a comma.",
				disabled: !this.settings.enabled,
				overrideWidth: 800,
				setting: () => this.settings.silenceTriggers ?? "",
				setSetting: (val) => this.settings.silenceTriggers = val
			}
		], [	
			<Setting>{
				type: "checkbox",
				label: "Remote Access Requires Trance:",
				description: "If checked, remote access is only possible while actively hypnotized.",
				setting: () => this.settings.remoteAccessRequiredTrance ?? true,
				setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
			},<Setting>{
				type: "checkbox",
				label: "Remote Access Limited to Hypnotizer:",
				description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
				setting: () => this.settings.limitRemoteAccessToHypnotizer ?? true,
				setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
			},<Setting>{
				type: "checkbox",
				label: "Programming Limited to Hypnotizer:",
				description: "If checked, only your hypnotizer may induce hypnotic suggestions within you.",
				setting: () => this.settings.suggestionRequireHypnotizer ?? true,
				setSetting: (val) => this.settings.suggestionRequireHypnotizer = val
			},<Setting>{
				type: "checkbox",
				label: "Allow Suggestion Removal:",
				description: "If checked, the user will be allowed to remove installed suggestions.",
				setting: () => this.settings.allowSuggestionRemoval ?? true,
				setSetting: (val) => this.settings.allowSuggestionRemoval = val
			},<Setting>{
				type: "checkbox",
				label: "Always Submit to Suggestions:",
				description: "If checked, you will always submit to suggestions.",
				setting: () => this.settings.alwaysSubmit ?? false,
				setSetting: (val) => this.settings.alwaysSubmit = val
			},<Setting>{
				type: "text",
				id: "suggestion_alwaysSubmitMembers",
				label: "Always Submit to Member IDs:",
				description: "Comma separated list of member IDs. If empty will use standard Item Permissions. You will always submit to their suggestions.",
				disabled: this.settings.alwaysSubmit,
				setting: () => this.settings.alwaysSubmitMemberIds ?? "",
				setSetting: (val) => this.settings.alwaysSubmitMemberIds = val
			},<Setting>{
				type: "checkbox",
				label: "Locked:",
				disabled: !this.settings.allowLocked,
				description: "If checked, locks the user out of their own hypnosis settings.",
				setting: () => this.settings.locked ?? false,
				setSetting: (val) => {
					if (this.settings.allowLocked) this.settings.locked = val;
				}
			}
		]]
	}
}