import { RemoteGuiSubscreen } from "./remoteBase";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { CheckboxRow, KitContext, NumberRow, Tabs, TextRow } from "Dom/kit";
import { HYPNO_TIME_MAX } from "Settings/hypno";

/** Who may open the target's hypnosis screens; shared by the settings screen and Suggestions. */
export abstract class RemoteHypnoBase extends RemoteGuiSubscreen {
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

}

export class RemoteHypno extends RemoteHypnoBase {
	private _host = new DomSettingsHost("lscg-remote-hypno-settings", () => this.build());

	private build(): Node {
		const s = this.settings;
		const ctx = new KitContext(() => this.dirty = true);
		return Tabs([
			{
				label: "Triggers",
				render: () => [
					TextRow(ctx, {
						label: "Override trigger words", description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
						get: () => s.overrideWords ?? "", set: v => s.overrideWords = v,
					}),
					TextRow(ctx, {
						label: "Override awaken words", description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
						get: () => s.awakeners ?? "", set: v => s.awakeners = v, disabled: () => !s.enabled,
					}),
					TextRow(ctx, {
						label: "Allow speech trigger words", description: "When spoken while hypnotized, will allow speech. Separated by a comma.",
						get: () => s.speakTriggers ?? "", set: v => s.speakTriggers = v, disabled: () => !s.enabled,
					}),
					TextRow(ctx, {
						label: "Silence trigger words", description: "When spoken while hypnotized, will prevent speech. Separated by a comma.",
						get: () => s.silenceTriggers ?? "", set: v => s.silenceTriggers = v, disabled: () => !s.enabled,
					}),
					TextRow(ctx, {
						label: "Override allowed member IDs", description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
						get: () => s.overrideMemberIds ?? "", set: v => s.overrideMemberIds = v,
						disabled: () => !(s.allowRemoteModificationOfMemberOverride || this.Character.IsOwnedByPlayer()),
					}),
					NumberRow(ctx, {
						label: "Hypnosis length (min.)", description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.triggerTime ?? 5, set: v => s.triggerTime = v,
					}),
					NumberRow(ctx, {
						label: "Cooldown (sec.)", description: "Cooldown time (in seconds) before you can be hypnotized again.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.cooldownTime ?? 0, set: v => s.cooldownTime = v,
					}),
					CheckboxRow(ctx, {
						label: "Enable cycle", description: "If checked, only one trigger will be active at a time and will cycle after use.",
						get: () => s.enableCycle ?? false, set: v => s.enableCycle = v,
					}),
					NumberRow(ctx, {
						label: "Trigger cycle time (min.)", description: "Number of minutes after activation to wait before cycling to a new trigger.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.cycleTime ?? 30, set: v => s.cycleTime = v,
					}),
				],
			},
			{
				label: "Access & suggestions",
				render: () => [
					CheckboxRow(ctx, {
						label: "Remote access requires trance", description: "If checked, remote access is only possible while actively hypnotized.",
						get: () => s.remoteAccessRequiredTrance ?? true, set: v => s.remoteAccessRequiredTrance = v,
					}),
					CheckboxRow(ctx, {
						label: "Remote access limited to hypnotizer", description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
						get: () => s.limitRemoteAccessToHypnotizer ?? true, set: v => s.limitRemoteAccessToHypnotizer = v,
					}),
					CheckboxRow(ctx, {
						label: "Programming limited to hypnotizer", description: "If checked, only your hypnotizer may induce hypnotic suggestions within you.",
						get: () => s.suggestionRequireHypnotizer ?? true, set: v => s.suggestionRequireHypnotizer = v,
					}),
					CheckboxRow(ctx, {
						label: "Allow suggestion removal", description: "If checked, the user will be allowed to remove installed suggestions.",
						get: () => s.allowSuggestionRemoval ?? true, set: v => s.allowSuggestionRemoval = v,
					}),
					CheckboxRow(ctx, {
						label: "Always submit to suggestions", description: "If checked, you will always submit to suggestions.",
						get: () => s.alwaysSubmit ?? false, set: v => s.alwaysSubmit = v,
					}),
					TextRow(ctx, {
						label: "Always submit to member IDs", description: "Comma separated list of member IDs. If empty will use standard Item Permissions. You will always submit to their suggestions.",
						get: () => s.alwaysSubmitMemberIds ?? "", set: v => s.alwaysSubmitMemberIds = v, disabled: () => s.alwaysSubmit,
					}),
					CheckboxRow(ctx, {
						label: "Locked", description: "If checked, locks the user out of their own hypnosis settings.",
						get: () => s.locked ?? false, set: v => { if (s.allowLocked) s.locked = v; },
						disabled: () => !s.allowLocked,
					}),
				],
			},
		]);
	}

	Load(): void {
		super.Load();
		this._host.mount();
	}

	/** The base marks any canvas click as a change; here only real edits in the DOM (via KitContext) count. */
	Click(): void {
		const dirty = this.dirty;
		super.Click();
		this.dirty = dirty;
	}

	Exit(): void {
		this._host.unmount();
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}
}
