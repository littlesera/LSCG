import { h } from "tsx-dom";
import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { ICONS } from "utils";
import { HypnoSettingsModel, InstructionDescription, LSCGHypnoInstruction } from "./Models/hypno";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { DomSettingsHost } from "./domSettingsHost";
import { CheckboxRow, KitContext, Notice, NumberRow, RuleTable, SectionLabel, Tabs, TextRow } from "Dom/kit";

/** Upper bound for the hypnosis timing inputs; the old screen had none. */
export const HYPNO_TIME_MAX = 99999;
/** The numbered eye styles BC has ("Eyes1", "Eyes2", ...), read from its assets so new ones show up by themselves. */
const eyeTypes = () => {
    const types = (AssetGroupGet("Female3DCG", "Eyes")?.Asset ?? [])
        .map(a => /^Eyes(\d+)$/.exec(a.Name)?.[1]).filter((n): n is string => !!n).map(Number);
    return types.length ? types : [9];
};

export class GuiHypno extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-hypno-settings", this, () => this.build());

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
			label: "Open Hypnosis Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Hypnosis",
		};
	}

	get ActualInstructions(): LSCGHypnoInstruction[] {
		return Object.values(LSCGHypnoInstruction).filter(e => e != LSCGHypnoInstruction.none);
	}

	private build(): Node {
		const s = this.settings;
		if (s.locked)
			return Notice("** Hypnosis Settings Locked **");

		const ctx = new KitContext();
		const off = () => !s.enabled;
		const noRemote = () => !s.enabled || !s.remoteAccess;
		const cantRemoveSuggestions = () => (Player.LSCG?.StateModule?.immersive ?? false) || Player.GetDifficulty() >= 3;
		return Tabs([
			{
				label: "Triggers",
				render: () => [
					CheckboxRow(ctx, {
						label: "Enabled", description: "Enabled the Triggered Hypnosis Features.",
						get: () => s.enabled ?? false, set: v => s.enabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Random trigger", description: "If enabled, your trigger word will be selected from a list of random english words.",
						get: () => s.randomTrigger ?? false, set: v => s.randomTrigger = v,
					}),
					TextRow(ctx, {
						label: "Trigger words", description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
						get: () => s.overrideWords ?? "", set: v => s.overrideWords = v,
						disabled: () => !s.enabled || s.randomTrigger,
					}),
					TextRow(ctx, {
						label: "Awaken words", description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
						get: () => s.awakeners ?? "", set: v => s.awakeners = v, disabled: off,
					}),
					TextRow(ctx, {
						label: "Silence trigger words", description: "When spoken while hypnotized, will prevent speech. Separated by a comma.",
						get: () => s.silenceTriggers ?? "", set: v => s.silenceTriggers = v, disabled: off,
					}),
					TextRow(ctx, {
						label: "Allow speech trigger words", description: "When spoken while hypnotized, will allow speech. Separated by a comma.",
						get: () => s.speakTriggers ?? "", set: v => s.speakTriggers = v, disabled: off,
					}),
					TextRow(ctx, {
						label: "Whitelist member IDs", description: "Comma separated list of member IDs exclusive allowed to access your hypno settings and triggers. If empty will use standard Item Permissions.",
						get: () => s.overrideMemberIds ?? "", set: v => s.overrideMemberIds = v, disabled: off,
					}),
					NumberRow(ctx, {
						label: "Hypnosis length (min.)", description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.triggerTime ?? 5, set: v => s.triggerTime = v, disabled: off,
					}),
					NumberRow(ctx, {
						label: "Cooldown (sec.)", description: "Cooldown time (in seconds) before you can be hypnotized again.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.cooldownTime ?? 0, set: v => s.cooldownTime = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Enable cycle", description: "If checked, only one trigger will be active at a time and will cycle after use.",
						get: () => s.enableCycle ?? false, set: v => s.enableCycle = v, disabled: off,
					}),
					NumberRow(ctx, {
						label: "Trigger cycle time (min.)", description: "Number of minutes after activation to wait before cycling to a new trigger.",
						min: 0, max: HYPNO_TIME_MAX, get: () => s.cycleTime ?? 30, set: v => s.cycleTime = v, disabled: off,
					}),
				],
			},
			{
				label: "Trance & remote",
				render: () => [
					SectionLabel("Remote access"),
					CheckboxRow(ctx, {
						label: "Allow remote access", description: "If checked, allowed users can modify these settings.",
						get: () => s.remoteAccess ?? false, set: v => s.remoteAccess = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Remote access requires trance", description: "If checked, remote access is only possible while actively hypnotized.",
						get: () => s.remoteAccessRequiredTrance ?? true, set: v => s.remoteAccessRequiredTrance = v, disabled: noRemote,
					}),
					CheckboxRow(ctx, {
						label: "Remote access limited to hypnotizer", description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
						get: () => s.limitRemoteAccessToHypnotizer ?? true, set: v => s.limitRemoteAccessToHypnotizer = v, disabled: noRemote,
					}),
					CheckboxRow(ctx, {
						label: "Allow remote override member modification", description: "If checked, any remote users can change your Override Member Id list (otherwise, only owner can).",
						get: () => s.allowRemoteModificationOfMemberOverride ?? false, set: v => s.allowRemoteModificationOfMemberOverride = v, disabled: noRemote,
					}),
					CheckboxRow(ctx, {
						label: "Lockable", description: "If checked, allowed users can lock you out of these settings.",
						get: () => s.allowLocked ?? false, set: v => s.allowLocked = v, disabled: noRemote,
					}),
					SectionLabel("While hypnotized"),
					CheckboxRow(ctx, {
						label: "Build arousal while hypnotized", description: "If checked being hypnotized will increase arousal.",
						get: () => s.enableArousal ?? false, set: v => s.enableArousal = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Enable spirals", description: "If checked headsets and other spirals can cause trance.",
						get: () => s.enableSpirals ?? true, set: v => s.enableSpirals = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Enable wake-up on snaps", description: "If checked you exit the trance when you hear someone snapping.",
						get: () => s.enableSnapWakeup ?? true, set: v => s.enableSnapWakeup = v, disabled: off,
					}),
					TextRow(ctx, {
						label: "Hypnotized eye color", description: "Hex code of your eye color while hypnotized (default: #A2A2A2).",
						maxLength: 255, get: () => s.hypnoEyeColor ?? "#A2A2A2", set: v => s.hypnoEyeColor = v, disabled: off,
					}),
					NumberRow(ctx, {
						// Consider making bigger UI for eye picking here, similar to selecting from wardrobe.
						label: "Hypnotized eye type", description: "Eye type # to use while under hypnosis (default: 9).",
						min: Math.min(...eyeTypes()), max: Math.max(...eyeTypes()), get: () => s.hypnoEyeType ?? 9, disabled: off,
						set: v => {
							// default to style 9 if somehow we can't find a valid eye type here.
							s.hypnoEyeType = AssetGet("Female3DCG", "Eyes", "Eyes" + v) ? v : 9;
						},
					}),
				],
			},
			{
				label: "Suggestions",
				render: () => [
					CheckboxRow(ctx, {
						label: "Enable suggestion programming", description: "If checked, hypnotic suggestions may be induced within you while under trance.",
						get: () => s.allowSuggestions ?? false, set: v => s.allowSuggestions = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Programming limited to hypnotizer", description: "If checked, only your hypnotizer may induce hypnotic suggestions within you.",
						get: () => s.suggestionRequireHypnotizer ?? true, set: v => s.suggestionRequireHypnotizer = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Limit suggestion removal", description: "If checked, only your owner or whoever added the suggestion can change/remove it.",
						get: () => s.limitSuggestionMod ?? true, set: v => s.limitSuggestionMod = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Allow suggestion removal", description: "If checked, you can remove suggestions installed in you with '/lscg remove-suggestion' if you are not immersive and not on extreme difficulty.",
						get: () => (s.allowSuggestionRemoval ?? false) && !cantRemoveSuggestions(), set: v => s.allowSuggestionRemoval = v,
						disabled: () => !s.enabled || cantRemoveSuggestions(),
					}),
					CheckboxRow(ctx, {
						label: "Always submit to suggestions", description: "If checked, you will always submit to suggestions.",
						get: () => s.alwaysSubmit ?? false, set: v => s.alwaysSubmit = v,
					}),
					TextRow(ctx, {
						label: "Always submit to member IDs", description: "Comma separated list of member IDs. If empty will use standard Item Permissions. You will always submit to their suggestions.",
						get: () => s.alwaysSubmitMemberIds ?? "", set: v => s.alwaysSubmitMemberIds = v, disabled: () => s.alwaysSubmit,
					}),
					SectionLabel("Blocked instructions", "Toggle which suggestion instructions you want to block on yourself."),
					RuleTable(ctx, {
						fixed: true,
						rows: () => this.ActualInstructions,
						columns: [
							{ header: "Instruction", kind: "custom", width: "25%", render: i => <span>{i}</span> as HTMLElement, get: () => "", set: () => {} },
							{ header: "Description", kind: "custom", render: i => <small class="lscg-kit-desc">{InstructionDescription(i)}</small> as HTMLElement, get: () => "", set: () => {} },
							{
								header: "Block", kind: "checkbox", width: "4.5em", tooltip: "Suggestions can't give you this instruction.",
								get: i => (s.blockedInstructions ?? []).includes(i),
								set: (i, v) => s.blockedInstructions = [...(s.blockedInstructions ?? []).filter(b => b != i), ...(v ? [i] : [])],
							},
						],
					}),
				],
			},
		]);
	}

	Load(): void {
		super.Load();
		this._host.mount();
	}

	Exit(): void {
		this._host.unmount();
		super.Exit();
		getModule<HypnoModule>("HypnoModule")?.initializeTriggerWord();
	}

	Unload(): void {
		this._host.unmount();
	}
}
