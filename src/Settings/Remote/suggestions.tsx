import { h } from "tsx-dom";
import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { InstructionDescription, LSCGHypnoInstruction, SUGGESTION_LIMIT } from "Settings/Models/hypno";
import { getActivities, ICONS, getActivityLabel, replace_template, sendLSCGCommandBeep, isCloth } from "utils";
import { RemoteHypnoBase } from "./hypno";
import { HypnoInstruction, HypnoModule, HypnoSuggestion } from "Modules/hypno";
import { getModule } from "modules";
import { CommandListener, CoreModule } from "Modules/core";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { ButtonRow, CheckboxRow, KitContext, Notice, openDialog, Panel, RuleTable, SectionLabel, SelectOption, SelectRow, TextRow, ZonePicker } from "Dom/kit";

export interface PoseSelection {
	upper: AssetPoseName | undefined | "";
	lower: AssetPoseName | undefined | "";
	full: AssetPoseName | undefined | "";
}

export interface ActivitySelection {
	name: ActivityName | "";
	group: string;
}

export interface ClothingSelection {
	all: boolean;
	random: boolean;
	groups: string[];
}

export interface ForgetSelection {
	all: boolean;
	instructions: LSCGHypnoInstruction[];
}

/** Instructions that take a free-text argument (a target, or a phrase). */
const TEXT_ARGUMENT_INSTRUCTIONS = [LSCGHypnoInstruction.activity, LSCGHypnoInstruction.follow, LSCGHypnoInstruction.say];
/** Instructions that can always target the speaker. */
const SPEAKER_ONLY_INSTRUCTIONS = [LSCGHypnoInstruction.activity, LSCGHypnoInstruction.follow];
/** Instructions that can target the subject themselves. */
const SELF_INSTRUCTIONS = [LSCGHypnoInstruction.activity];
/** Instructions with a list of choices (Configure…). */
const SELECTION_INSTRUCTIONS = [LSCGHypnoInstruction.activity, LSCGHypnoInstruction.strip, LSCGHypnoInstruction.pose, LSCGHypnoInstruction.forget];
/** Instructions a suggestion can only hold once. */
const UNREPEATABLE_INSTRUCTIONS = [LSCGHypnoInstruction.maid, LSCGHypnoInstruction.say, LSCGHypnoInstruction.denial, LSCGHypnoInstruction.insatiable];
/** Nothing can follow these. */
const TERMINATING_INSTRUCTIONS = [LSCGHypnoInstruction.maid];
const MAX_INSTRUCTIONS = 3;

function configLabels(instruction: LSCGHypnoInstruction): [string, string] {
	switch (instruction) {
		case LSCGHypnoInstruction.activity:
		case LSCGHypnoInstruction.follow:
			return ["Target", "Configure specific target member id number or name"];
		case LSCGHypnoInstruction.say:
			return ["Phrase", "Configure specific phrase"];
		default:
			return ["N/A", ""];
	}
}

const options = (values: string[], none?: string): SelectOption[] =>
	[...(none !== undefined ? [{ value: "", label: none }] : []), ...values.map(v => ({ value: v, label: v }))];

export class RemoteSuggestions extends RemoteHypnoBase {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Suggestions";
	}

	get icon(): string {
		return ICONS.PENDANT;
	}

	get help(): HelpInfo {
		return {
			label: "Open Hypnotic Suggestion Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Hypnotic-Suggestions",
		};
	}

	get disabledReason(): string {
		let memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		const passTranceReq = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		const passHypnotizerReq = !this.settings.suggestionRequireHypnotizer || this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber;

		if (!memberIdIsAllowed)
			return replace_template("You do not have access to %OPP_POSSESSIVE% mind...", this.Character);
		if (!passTranceReq)
			return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
		if (!passHypnotizerReq)
			return replace_template("%OPP_NAME% seems suggestable, but not to you...", this.Character);
		if (!this.settings.allowSuggestions)
			return replace_template("%OPP_NAME% is resisting any hypnotic suggestions...", this.Character);
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		let memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		const passTranceReq = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		const passHypnotizerReq = !this.settings.suggestionRequireHypnotizer || this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber;

		return this.settings.enabled && 
				(this.Character.IsOwnedByPlayer() ||
					(this.settings.allowSuggestions &&
					memberIdIsAllowed &&
					passTranceReq &&
					passHypnotizerReq));
	}


	private _host = new DomSettingsHost("lscg-remote-suggestion-settings", () => this.build());

	RemovedSuggestions: HypnoSuggestion[] = [];
	Suggestions: HypnoSuggestion[] | undefined = undefined;

	Load(): void {
		this.Suggestions = undefined;
		this.RemovedSuggestions = [];
		if (this.Character.MemberNumber)
			sendLSCGCommandBeep(this.Character.MemberNumber, "get-suggestions", []);

		getModule<CoreModule>("CoreModule").RegisterCommandListener({
			id: "remote_suggestion",
			command: "get-suggestions-response",
			func: (sender: number, msg: LSCGMessageModel) => {
				if (sender == this.Character.MemberNumber)
					this.Suggestions = msg.command?.args.find(a => a.name == "suggestions")?.value as HypnoSuggestion[];
				super.Load();
				this._host.remount();
			},
		} as CommandListener);
		this._host.mount();
	}

	/** The base marks any canvas click as a change; suggestions are sent on their own, on Exit. */
	Click(): void {
		const dirty = this.dirty;
		super.Click();
		this.dirty = dirty;
	}

	Exit(): void {
		this._host.unmount();
		super.Exit();

		if (this.Character.MemberNumber)
			sendLSCGCommandBeep(this.Character.MemberNumber, "set-suggestions", [{
				name: "suggestions",
				value: this.Suggestions?.filter(s => !!s.trigger) ?? [],
			}, {
				name: "removed",
				value: this.RemovedSuggestions,
			}]);
		getModule<CoreModule>("CoreModule").RemoveCommandListenerById("remote_suggestion");
	}

	Unload(): void {
		this._host.unmount();
	}

	private build(): Node {
		const suggestions = this.Suggestions;
		if (!suggestions)
			return Panel([Notice("Loading...")]);

		const ctx = new KitContext();
		return Panel([
			SectionLabel("Induce suggestion", "Induce a new hypnotic suggestion into the subject. Suggestions without a trigger phrase are discarded when you leave."),
			RuleTable(ctx, {
				rows: () => suggestions,
				max: SUGGESTION_LIMIT,
				addLabel: "+ Induce new suggestion",
				deleteLabel: "Delete suggestion",
				create: () => new HypnoSuggestion(`Suggestion No. ${suggestions.length + 1}`),
				canDelete: sg => this.IsSuggestionOwner(sg),
				onDelete: sg => this.RemovedSuggestions.push(sg),
				columns: [
					{
						header: "Name", kind: "text", width: "20%", maxLength: 255, tooltip: "Name this hypnotic suggestion for future reference",
						get: sg => sg.name, set: (sg, v) => sg.name = v || sg.name, disabled: sg => !this.IsSuggestionOwner(sg),
					},
					{
						header: "Trigger phrase", kind: "text", width: "20%", maxLength: 255, placeholder: "Required", tooltip: "Trigger phrase for this suggestion.",
						get: sg => sg.trigger, set: (sg, v) => sg.trigger = v, disabled: sg => !this.IsSuggestionOwner(sg),
					},
					{
						header: "Instructions", kind: "custom",
						render: sg => {
							const edit = <button class="lscg-button lscg-kit-edit" onClick={() => this.openSuggestionDialog(edit, ctx, sg)}>Edit…</button> as HTMLButtonElement;
							const summary = (sg.instructions ?? []).map(i => i.type).join(" → ") || "No instructions yet";
							return <div class="lscg-kit-details">
								<small class="lscg-kit-desc lscg-kit-summary" title={`Installed by: ${sg.installedByName} [${sg.installedBy}]`}>{summary}</small>
								{edit}
							</div> as HTMLElement;
						},
						get: () => "", set: () => {},
					},
					{
						header: "Exclusive", kind: "checkbox", width: "6em", tooltip: "If checked, only the creator of this suggestion can view, edit, or trigger it.",
						get: sg => sg.exclusive ?? false, set: (sg, v) => sg.exclusive = v, disabled: sg => !this.IsSuggestionOwner(sg),
					},
				],
			}),
		]);
	}

	IsSuggestionOwner(suggestion: HypnoSuggestion): boolean {
		return this.settings.limitSuggestionMod || suggestion.installedBy == Player.MemberNumber || this.Character.IsOwnedByPlayer();
	}

	get ActualInstructions(): LSCGHypnoInstruction[] {
		return Object.values(LSCGHypnoInstruction).filter(e => e != LSCGHypnoInstruction.none && (this.settings.blockedInstructions ?? []).indexOf(e) == -1);
	}

	/** Instructions slot `ix` may hold: anything not blocked, minus unrepeatable ones used in another slot. */
	AvailableInstructions(suggestion: HypnoSuggestion, ix: number): LSCGHypnoInstruction[] {
		const taken = suggestion.instructions.map(i => i.type).filter((t, i) => i != ix && UNREPEATABLE_INSTRUCTIONS.indexOf(t) > -1);
		return this.ActualInstructions.filter(t => taken.indexOf(t) == -1);
	}

	PreviousInstructionIsTerminating(suggestion: HypnoSuggestion, ix: number): boolean {
		return ix > 0 && TERMINATING_INSTRUCTIONS.indexOf(suggestion.instructions[ix - 1]?.type ?? LSCGHypnoInstruction.none) > -1;
	}

	/** The suggestion's instructions, in order. A slot appears once the one before it is filled. */
	private openSuggestionDialog(anchor: HTMLElement, ctx: KitContext, sg: HypnoSuggestion) {
		sg.instructions ??= [];
		openDialog(anchor, ctx, sg.name || "Suggestion", dctx => {
			const container = <div class="lscg-kit-panel" /> as HTMLElement;
			dctx.watch(() => {
				const rows: HTMLElement[] = [<small class="lscg-kit-desc">{`Installed by: ${sg.installedByName} [${sg.installedBy}]`}</small> as HTMLElement];
				for (let ix = 0; ix < MAX_INSTRUCTIONS && ix <= sg.instructions.length && !this.PreviousInstructionIsTerminating(sg, ix); ix++)
					rows.push(...this.instructionRows(dctx, sg, ix));
				container.replaceChildren(...rows);
			});
			return [container];
		});
	}

	private instructionRows(dctx: KitContext, sg: HypnoSuggestion, ix: number): HTMLElement[] {
		// Rows are rebuilt on every change, so each gets its own context that just forwards changes up.
		const rctx = new KitContext(() => dctx.changed());
		const instruction = sg.instructions[ix] as HypnoInstruction | undefined;
		const type = instruction?.type;
		const available: string[] = this.AvailableInstructions(sg, ix);
		if (type && available.indexOf(type) < 0) available.unshift(type);
		// An empty slot can stay empty; the last of several can be removed. The first can't be once set.
		const removable = !instruction || (ix > 0 && ix == sg.instructions.length - 1);
		const rows: HTMLElement[] = [
			SectionLabel(`Instruction #${ix + 1}`),
			SelectRow(rctx, {
				label: "Instruction", description: type ? InstructionDescription(type) : "A suggested instruction.",
				options: options(available, removable ? "None" : undefined),
				get: () => type ?? "",
				set: v => {
					if (!v) sg.instructions.splice(ix, 1);
					else sg.instructions[ix] = new HypnoInstruction(v as LSCGHypnoInstruction);
				},
			}),
		];
		if (!instruction || !type) return rows;

		const self = () => instruction.arguments["self"] ?? false;
		if (TEXT_ARGUMENT_INSTRUCTIONS.indexOf(type) > -1)
			rows.push(TextRow(rctx, {
				label: configLabels(type)[0], description: configLabels(type)[1], maxLength: 1000,
				get: () => instruction.arguments["config"] ?? "", set: v => instruction.arguments["config"] = v, disabled: self,
			}));
		if (SPEAKER_ONLY_INSTRUCTIONS.indexOf(type) > -1)
			rows.push(CheckboxRow(rctx, {
				label: "Speaker only", description: "Subject will always target the speaker",
				get: () => instruction.arguments["speakerOnly"] ?? false, set: v => instruction.arguments["speakerOnly"] = v,
			}));
		if (SELF_INSTRUCTIONS.indexOf(type) > -1)
			rows.push(CheckboxRow(rctx, {
				label: "Self", description: "Subject will always target themselves",
				get: self, set: v => instruction.arguments["self"] = v,
			}));
		if (SELECTION_INSTRUCTIONS.indexOf(type) > -1)
			rows.push(ButtonRow(rctx, {
				label: "Configure", description: this.selectionSummary(instruction), buttonLabel: "Configure…",
				onClick: button => openDialog(button, dctx, `${type}: configure`, sctx => this.selectionRows(sctx, instruction)),
			}));
		return rows;
	}

	private selectionSummary(instruction: HypnoInstruction): string {
		const sel = instruction.arguments["selection"];
		if (!sel) return "Nothing chosen yet.";
		switch (instruction.type) {
			case LSCGHypnoInstruction.activity: return sel.name ? `${sel.name} on ${sel.group}` : "Nothing chosen yet.";
			case LSCGHypnoInstruction.pose: return [sel.full, sel.upper, sel.lower].filter(p => !!p).join(", ") || "No pose";
			case LSCGHypnoInstruction.strip: return sel.all ? "All slots" : sel.random ? "Random slot" : (sel.groups ?? []).join(", ") || "No slots";
			case LSCGHypnoInstruction.forget: return sel.all ? "All instructions" : (sel.instructions ?? []).join(", ") || "Nothing";
			default: return "";
		}
	}

	/** The choices for an instruction's "Configure…" dialog. Edits go straight into its selection. */
	private selectionRows(ctx: KitContext, instruction: HypnoInstruction): HTMLElement[] {
		const args = instruction.arguments;
		switch (instruction.type) {
			case LSCGHypnoInstruction.activity: {
				const sel: ActivitySelection = args["selection"] ??= { name: "", group: "" };
				const isSelf = () => args["self"] ?? false;
				const groups = AssetGroup.filter(g => g.IsItem() && !g.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", g.Name).length);
				const group = () => groups.find(g => g.Name == sel.group);
				const activities = () => group() ? getActivities(group(), isSelf()) : [];
				// The activity list depends on the zone, so it's rebuilt when the zone changes.
				const activityRow = <div /> as HTMLElement;
				let shownGroup: string | undefined;
				ctx.watch(() => {
					if (shownGroup === sel.group && activityRow.firstChild) return;
					shownGroup = sel.group;
					const g = group();
					activityRow.replaceChildren(g
						? SelectRow(ctx, {
							label: "Activity", description: "Select an activity for this instruction",
							options: activities().map(a => ({ value: a.Name, label: getActivityLabel(a, g, isSelf()) })),
							get: () => sel.name, set: v => sel.name = v as ActivityName,
						})
						: Notice("Please Select a Zone"));
				});
				const pickZone = (name: string) => {
					sel.group = name;
					const names = activities().map(a => a.Name);
					if (names.indexOf(sel.name as ActivityName) < 0) sel.name = names[0] ?? "";
				};
				return [
					ZonePicker(ctx, {
						character: this.Character, groups: () => groups,
						selected: () => sel.group, highlighted: g => g.Name == sel.group, onPick: g => pickZone(g.Name),
					}),
					SelectRow(ctx, {
						label: "Zone", description: "Click a zone on the character, or pick it here.",
						options: [{ value: "", label: "— choose zone —" }, ...groups.map(g => ({ value: g.Name, label: g.Description || g.Name }))],
						get: () => sel.group, set: pickZone,
					}),
					activityRow,
				];
			}
			case LSCGHypnoInstruction.pose: {
				const sel: PoseSelection = args["selection"] ??= { lower: "", upper: "", full: "" };
				const poses = (category: string) => PoseFemale3DCG.filter(p => p.Category == category).map(p => p.Name);
				return [
					SelectRow(ctx, {
						label: "Full pose", description: "Overrides the upper and lower pose.",
						options: options(poses("BodyFull"), "None"), get: () => sel.full ?? "",
						set: v => { sel.full = v as AssetPoseName; if (v) { sel.upper = ""; sel.lower = ""; } },
					}),
					SelectRow(ctx, {
						label: "Upper pose", options: options(poses("BodyUpper"), "None"),
						get: () => sel.upper ?? "", set: v => sel.upper = v as AssetPoseName, disabled: () => !!sel.full,
					}),
					SelectRow(ctx, {
						label: "Lower pose", options: options(poses("BodyLower"), "None"),
						get: () => sel.lower ?? "", set: v => sel.lower = v as AssetPoseName, disabled: () => !!sel.full,
					}),
				];
			}
			case LSCGHypnoInstruction.strip: {
				const sel: ClothingSelection = args["selection"] ??= { all: false, random: false, groups: [] };
				const slots = AssetGroup.filter(g => g.Family === this.Character.AssetFamily && g.Category === "Appearance" && g.AllowCustomize && isCloth(g, false)).map(g => g.Name);
				return [
					CheckboxRow(ctx, {
						label: "All slots", get: () => sel.all,
						set: v => { sel.all = v; if (v) sel.random = false; },
					}),
					CheckboxRow(ctx, {
						label: "Random", get: () => sel.random,
						set: v => { sel.random = v; if (v) sel.all = false; },
					}),
					SectionLabel("Select clothing slots"),
					...slots.map(slot => CheckboxRow(ctx, {
						label: slot, get: () => !sel.random && (sel.all || sel.groups.indexOf(slot) > -1),
						set: v => sel.groups = [...sel.groups.filter(g => g != slot), ...(v ? [slot] : [])],
						disabled: () => sel.all || sel.random,
					})),
				];
			}
			case LSCGHypnoInstruction.forget: {
				const sel: ForgetSelection = args["selection"] ??= { all: false, instructions: [] };
				return [
					CheckboxRow(ctx, { label: "All instructions", get: () => sel.all, set: v => sel.all = v }),
					SectionLabel("Select instructions to forget"),
					...HypnoModule.forgettableInstruction.map(i => CheckboxRow(ctx, {
						label: i, get: () => sel.all || sel.instructions.indexOf(i) > -1,
						set: v => sel.instructions = [...sel.instructions.filter(x => x != i), ...(v ? [i] : [])],
						disabled: () => sel.all,
					})),
				];
			}
			default:
				return [];
		}
	}
}
