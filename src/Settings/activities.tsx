import { h } from "tsx-dom";
import { GetDelimitedList, ICONS, getActivities, getActivityLabel } from "utils";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { ActivityEntryModel, ActivitySettingsModel } from "./Models/activities";
import { DomSettingsHost } from "./domSettingsHost";
import { ButtonRow, CheckboxRow, KitContext, Notice, NumberRow, Panel, SelectRow, TextRow, ZonePicker } from "Dom/kit";

export class GuiActivities extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-activity-settings", this, () => this.build());

	get name(): string {
		return "Activities";
	}

	get icon(): string {
		return ICONS.HOLD_HANDS;
	}

	get settings(): ActivitySettingsModel {
        return super.settings as ActivitySettingsModel;
    }

	get help(): HelpInfo {
		return {
			label: "Open Activity Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Custom-Activities",
		};
	}

	/** The picked zone and activity. */
	group: AssetGroup | undefined;
	activityName: string | undefined;

	get currentActivityEntry(): ActivityEntryModel | undefined {
		if (!this.group || !this.activityName) return undefined;
		return this.getActivityEntry(this.activityName, this.group.Name);
	}

	getActivityEntry(actName: string, grpName: string): ActivityEntryModel | undefined {
		return this.settings.activities.find(a => a.name == actName && a.group == grpName);
	}

	private build(): Node {
		const groups = AssetGroup.filter(g => g.IsItem() && !g.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", g.Name).length);
		const options = <div class="lscg-kit-panel" /> as HTMLElement;
		const showOptions = () => options.replaceChildren(...this.buildOptions());
		showOptions();
		return Panel([
			<div class="lscg-kit-zone-layout">
				{ZonePicker(new KitContext(), {
					character: Player, groups: () => groups,
					selected: () => this.group?.Name,
					highlighted: g => this.settings.activities.some(a => a.group == g.Name),
					onPick: g => {
						this.group = g;
						const names = getActivities(g, false).map(a => a.Name);
						if (!this.activityName || names.indexOf(this.activityName as ActivityName) < 0) this.activityName = undefined;
						showOptions();
					},
				})}
				{options}
			</div> as HTMLElement,
		]);
	}

	/** The picked zone's activities and what each does. Rebuilt when the zone changes. */
	private buildOptions(): HTMLElement[] {
		const group = this.group;
		if (!group)
			return [Notice("Please Select a Zone")];

		const ctx = new KitContext();
		const activities = getActivities(group, false);
		const activityOptions = activities.map(a => ({ value: a.Name, label: getActivityLabel(a, group, false) }))
			.sort((a, b) => a.label.localeCompare(b.label));
		this.activityName ??= activityOptions[0]?.value;
		const entry = () => this.currentActivityEntry;
		const edit = () => this.createEntryIfNeeded(entry());
		const icon = <img class="lscg-kit-activity-icon" alt="" /> as HTMLImageElement;
		ctx.watch(() => {
			const name = this.activityName;
			icon.hidden = !name;
			if (name)
				icon.src = name.indexOf("Item") > -1 ? "Icons/Dress.png" : `Assets/${Player.AssetFamily}/Activity/${name}.png`;
		});

		return [
			SelectRow(ctx, {
				label: "Activity", description: "Configure what this activity does when done to you on the selected zone.",
				options: activityOptions,
				get: () => this.activityName ?? "", set: v => this.activityName = v,
			}),
			icon,
			ButtonRow(ctx, {
				label: "Clear entry", description: "Remove this activity's configuration for this zone.", buttonLabel: "Clear", danger: true,
				hidden: () => !entry(), onClick: () => { this.ClearEntry(entry()!); ctx.changed(); },
			}),
			CheckboxRow(ctx, {
				label: "Can induce trance", description: "Using this activity on this location can trigger hypnosis.",
				get: () => entry()?.hypno ?? false, set: v => edit().hypno = v,
			}),
			CheckboxRow(ctx, {
				label: "Can induce sleep", description: "Using this activity on this location can put them to sleep.",
				get: () => entry()?.sleep ?? false, set: v => edit().sleep = v,
			}),
			NumberRow(ctx, {
				label: "Repeats required", description: "Number times within 5 minutes this activity must be done before hypnosis or sleep is triggered.",
				min: 0, max: 100, get: () => entry()?.hypnoRequiredRepeats ?? 2, set: v => edit().hypnoRequiredRepeats = v,
				disabled: () => !entry()?.hypno && !entry()?.sleep,
			}),
			NumberRow(ctx, {
				label: "Trance arousal threshold", description: "Arousal threshold required for this activity to trigger hypnosis. If both trance and sleep are checked, lower arousal triggers sleep.",
				min: 0, max: 100, get: () => entry()?.hypnoThreshold ?? 50, set: v => edit().hypnoThreshold = v,
				disabled: () => !entry()?.hypno,
			}),
			CheckboxRow(ctx, {
				label: "Can awaken", description: "Using this activity on this location will awaken you from trance or deep sleep.",
				get: () => entry()?.awakener ?? false, set: v => edit().awakener = v,
			}),
			CheckboxRow(ctx, {
				label: "Can cause orgasm", description: "Using this activity on this location can cause an orgasm.",
				get: () => entry()?.orgasm ?? false, set: v => edit().orgasm = v,
			}),
			NumberRow(ctx, {
				label: "Orgasm arousal threshold", description: "Arousal threshold required for this activity to cause an orgasm.",
				min: 0, max: 100, get: () => entry()?.orgasmThreshold ?? 75, set: v => edit().orgasmThreshold = v,
				disabled: () => !entry()?.orgasm,
			}),
			TextRow(ctx, {
				label: "Allowed member IDs", description: "Member IDs who can trance/sleep/awaken/orgasm with this activity. Leave empty to use BC item permissions",
				maxLength: 255, get: () => (entry()?.allowedMemberIds ?? []).join(","),
				set: v => edit().allowedMemberIds = GetDelimitedList(v, ",").filter(str => CommonIsNumeric(str)).map(str => +str),
				disabled: () => { const e = entry(); return !e?.hypno && !e?.orgasm && !e?.awakener && !e?.sleep; },
			}),
		];
	}

	Load() {
		super.Load();
		this._host.mount();
	}

	Exit() {
		this._host.unmount();
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}

	ClearEntry(entry: ActivityEntryModel) {
		this.settings.activities = this.settings.activities.filter(a => !(a.name == entry.name && a.group == entry.group));
	}

	newDefaultEntry(actName: string, grpName: string): ActivityEntryModel {
		return {
			name: actName,
			group: grpName,
			hypno: false,
			sleep: false,
			hypnoThreshold: 50,
			hypnoRequiredRepeats: 2,
			awakener: false,
			orgasm: false,
			orgasmThreshold: 75,
			allowedMemberIds: [],
		} as ActivityEntryModel;
	}

	createEntryIfNeeded(existing: ActivityEntryModel | undefined): ActivityEntryModel {
		if (!existing) {
			existing = this.newDefaultEntry(this.activityName ?? "", this.group?.Name ?? "");
			this.settings.activities.push(existing);
		}
		return existing;
	}
}
