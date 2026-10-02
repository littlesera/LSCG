import { h } from "tsx-dom";
import { GetDelimitedList, ICONS, getActivities, getActivityLabel, getZoneColor } from "utils";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { ActivityEntryModel, ActivitySettingsModel } from "./Models/activities";
import { DomSettingsHost } from "./domSettingsHost";
import { ButtonRow, CheckboxRow, KitContext, Notice, NumberRow, Panel, SelectRow, TextRow } from "Dom/kit";

/** Left of this is the character, whose zones are picked on the canvas. */
const OPTIONS_X = 550;

export class GuiActivities extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-activity-settings", () => this.build(),
		[OPTIONS_X, GuiSubscreen.START_Y - 25, 1780 - OPTIONS_X, 740]);

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
			label: 'Open Activity Wiki on GitHub',
			link: 'https://github.com/littlesera/LSCG/wiki/Custom-Activities'
		}
	}

	get currentActivityEntry(): ActivityEntryModel | undefined {
		let actName = getActivities(undefined, false)[this.activityIndex]?.Name;
		let groupName = Player.FocusGroup?.Name ?? "";
		return this.getActivityEntry(actName, groupName);
	}

	getActivityEntry(actName: string, grpName: string): ActivityEntryModel | undefined {
		return this.settings.activities.find(a => a.name == actName && a.group == grpName);
	}

	activityIndex: number = 0;

	private build(): Node {
		const group = Player.FocusGroup;
		if (!group)
			return Panel([Notice("Please Select a Zone")]);

		const ctx = new KitContext();
		const activities = getActivities(undefined, false);
		const entry = () => this.currentActivityEntry;
		const edit = () => this.createEntryIfNeeded(entry());
		const icon = <img class="lscg-kit-activity-icon" alt="" /> as HTMLImageElement;
		ctx.watch(() => {
			const activity = activities[this.activityIndex];
			icon.hidden = !activity;
			if (activity)
				icon.src = activity.Name.indexOf("Item") > -1 ? "Icons/Dress.png" : `Assets/${Player.AssetFamily}/Activity/${activity.Name}.png`;
		});

		return Panel([
			SelectRow(ctx, {
				label: "Activity", description: "Configure what this activity does when done to you on the selected zone.",
				options: activities.map((a, i) => ({ value: String(i), label: getActivityLabel(a, group, false) })),
				get: () => String(this.activityIndex), set: v => this.activityIndex = +v,
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
		]);
	}

	Load() {
		super.Load();
		CharacterAppearanceForceUpCharacter = Player.MemberNumber ?? -1;
		this._host.mount();
	}

	Run() {
		let tmp = GuiSubscreen.START_X;
		GuiSubscreen.START_X = OPTIONS_X;
		super.Run();
		GuiSubscreen.START_X = tmp;
		DrawCharacter(Player, 50, 50, 0.9, false);

		// Draws all the available character zones
		for (let Group of AssetGroup) {
			if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length)
				DrawAssetGroupZone(Player, Group.Zone, 0.9, 50, 50, 1, "#808080FF", 3, getZoneColor(Group.Name, this.settings.activities.some(a => a.group == Group.Name)));
		}
		if (Player.FocusGroup != null)
			DrawAssetGroupZone(Player, Player.FocusGroup.Zone, 0.9, 50, 50, 1, "cyan");
	}

	Click() {
		super.Click();

		for (const Group of AssetGroup) {
			if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length) {
				const Zone = Group.Zone.find(z => DialogClickedInZone(Player, z, 0.9, 50, 50, 1));
				if (Zone) {
					Player.FocusGroup = Group;
					if (this.activityIndex >= getActivities(undefined, false).length)
						this.activityIndex = 0;
					this._host.remount();
				}
			}
		}
	}

	Exit() {
		this._host.unmount();
		CharacterAppearanceForceUpCharacter = -1;
		CharacterLoadCanvas(Player);
		Player.FocusGroup = null;
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
			allowedMemberIds: []
		} as ActivityEntryModel;
	}

	createEntryIfNeeded(existing: ActivityEntryModel | undefined): ActivityEntryModel {
		if (!existing) {
			existing = this.newDefaultEntry(getActivities(undefined, false)[this.activityIndex].Name, Player.FocusGroup?.Name ?? "");
			this.settings.activities.push(existing);
		}
		return existing;
	}
}
