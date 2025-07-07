import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { GetDelimitedList, ICONS, getActivities, getActivityLabel, getZoneColor } from "utils";
import { GlobalSettingsModel } from "./Models/base";
import { GuiSubscreen, HelpInfo, Setting } from "./settingBase";
import { ActivityEntryModel, ActivitySettingsModel } from "./Models/activities";

export class GuiActivities extends GuiSubscreen {

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

	get structure(): Setting[] {
		return []
	}

	get currentActivityEntry(): ActivityEntryModel | undefined {
		let actName = getActivities()[this.activityIndex]?.Name;
		let groupName = Player.FocusGroup?.Name ?? "";
		let entry = this.getActivityEntry(actName, groupName);
		return entry;
	}

	getActivityEntry(actName: string, grpName: string): ActivityEntryModel | undefined {
		return this.settings.activities.find(a => a.name == actName && a.group == grpName);
	}

	activityIndex: number = 0;

	Load() {
		super.Load();
		ElementCreateInput("hypnoThreshold", "number", "", "80");
		ElementCreateInput("hypnoCount", "number", "", "80");
		ElementCreateInput("orgasmThreshold", "number", "", "80");
		ElementCreateInput("allowedMembers", "text", "", "80");

		ElementPosition("hypnoThreshold", -1000, -1000, 0, 0);
		ElementPosition("hypnoCount", -1000, -1000, 0, 0);
		ElementPosition("orgasmThreshold", -1000, -1000, 0, 0);
		ElementPosition("allowedMembers", -1000, -1000, 0, 0);

		CharacterAppearanceForceUpCharacter = Player.MemberNumber ?? -1;
	}

	Run() {
		let tmp = GuiSubscreen.START_X;
		let prev = MainCanvas.textAlign;
		GuiSubscreen.START_X = 550;
		super.Run();
		DrawCharacter(Player, 50, 50, 0.9, false);
		MainCanvas.textAlign = "left";

		// Draws all the available character zones
		for (let Group of AssetGroup) {
			if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length)
				DrawAssetGroupZone(Player, Group.Zone, 0.9, 50, 50, 1, "#808080FF", 3, getZoneColor(Group.Name, this.settings.activities.some(a => a.group == Group.Name)));
		}

		if (Player.FocusGroup != null) {
			let activity = getActivities()[this.activityIndex ?? 0];
			DrawAssetGroupZone(Player, Player.FocusGroup.Zone, 0.9, 50, 50, 1, "cyan");
			MainCanvas.textAlign = "center";
			DrawBackNextButton(550, this.getYPos(0), 600, 64, getActivityLabel(activity, Player.FocusGroup), "White", "", () => "", () => "");
			MainCanvas.textAlign = "left";
			if (!!activity) {
				let image = "Assets/" + Player.AssetFamily + "/Activity/" + activity.Name + ".png";
				if (activity.Name.indexOf("Item") > -1) {
					image = "Icons/Dress.png";
				}
				DrawImageResize(image, 1170, this.getYPos(0) - 28, 120, 120);
				DrawEmptyRect(1170, this.getYPos(0) - 28, 120, 120, "Black", 2);
				this.DrawActivityOptions();
			}
		} else {
			DrawText("Please Select a Zone", this.getXPos(0), this.getYPos(0), "Black", "White");
		}

		GuiSubscreen.START_X = tmp;
		MainCanvas.textAlign = prev;
	}

	Click() {
		let tmp = GuiSubscreen.START_X;
		GuiSubscreen.START_X = 550;
		super.Click();

		for (const Group of AssetGroup) {
			if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length) {
				const Zone = Group.Zone.find(z => DialogClickedInZone(Player, z, 0.9, 50, 50, 1));
				if (Zone) {
					this.SetActivityEntryVals(this.currentActivityEntry);
					Player.FocusGroup = Group;
					let activities = getActivities();
					if (this.activityIndex >= activities.length)
						this.activityIndex = 0;
					this.LoadActivityEntry(this.currentActivityEntry);
				}
			}
		}

		if (Player.FocusGroup != null) {
			let activities = getActivities();
			// Arousal activity control
			if (MouseIn(this.getXPos(0), this.getYPos(0), 600, 64)) {
				this.SetActivityEntryVals(this.currentActivityEntry);
				if (MouseX <= (this.getXPos(0) + 300)) this.activityIndex = (activities.length + this.activityIndex - 1) % activities.length;
				else this.activityIndex = (this.activityIndex + 1) % activities.length;
				this.LoadActivityEntry(this.currentActivityEntry);
			}
		}

		this.HandleActivityEntryClick();

		GuiSubscreen.START_X = tmp;
	}

	Exit() {
		this.SetActivityEntryVals(this.currentActivityEntry);
		ElementRemove("hypnoThreshold");
		ElementRemove("hypnoCount");
		ElementRemove("orgasmThreshold");
		ElementRemove("allowedMembers");

		CharacterAppearanceForceUpCharacter = -1;
		CharacterLoadCanvas(Player);
		Player.FocusGroup = null;
		super.Exit();
	}

	LoadActivityEntry(entry: ActivityEntryModel | undefined) {
		this.ElementSetValue("hypnoThreshold", (entry?.hypnoThreshold ?? 50));
		this.ElementSetValue("hypnoCount", (entry?.hypnoRequiredRepeats ?? 2));
		this.ElementSetValue("orgasmThreshold", (entry?.orgasmThreshold ?? 75));
		this.ElementSetValue("allowedMembers", (entry?.allowedMemberIds ?? []).join(","));
	}

	SetActivityEntryVals(entry: ActivityEntryModel | undefined) {
		if (!entry)
			return;

		let hypnoThreshold = ElementValue("hypnoThreshold");
		if (CommonIsNumeric(hypnoThreshold)) entry.hypnoThreshold = +hypnoThreshold;
		
		entry.allowedMemberIds = GetDelimitedList(ElementValue("allowedMembers"), ",").filter(str => CommonIsNumeric(str)).map(str => +str);

		let hypnoCount = ElementValue("hypnoCount");
		if (CommonIsNumeric(hypnoCount)) entry.hypnoRequiredRepeats = +hypnoCount;
		
		let orgasmThreshold = ElementValue("orgasmThreshold");
		if (CommonIsNumeric(orgasmThreshold)) entry.orgasmThreshold = +orgasmThreshold;
	}

	ClearEntry(entry: ActivityEntryModel) {
		this.settings.activities = this.settings.activities.filter(a => !(a.name == entry.name && a.group == entry.group));
	}

	newDefaultEntry(actName: string, grpName: string): ActivityEntryModel {
		return <ActivityEntryModel>{
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
		}
	}

	createEntryIfNeeded(existing: ActivityEntryModel | undefined): ActivityEntryModel {
		if (!existing) {
			existing = this.newDefaultEntry(getActivities()[this.activityIndex].Name, Player.FocusGroup?.Name ?? "");
			this.settings.activities.push(existing);
			this.LoadActivityEntry(this.currentActivityEntry);
		}
		return existing;
	}

	HandleActivityEntryClick() {
		let entry = this.currentActivityEntry;

		// Clear Entry
		if (!!entry && MouseIn(1310, this.getYPos(0), 64, 64)) {
			this.ClearEntry(entry);
		}

		// Hypno Checkbox
		if (MouseIn(this.getNarrowXPos(0) + 400, this.getNarrowYPos(2) - 32, 64, 64)){
			entry = this.createEntryIfNeeded(entry);
			entry.hypno = !entry.hypno;
		}

		// Sleep Checkbox
		if (MouseIn(this.getNarrowXPos(1) + 400, this.getNarrowYPos(2) - 32, 64, 64)){
			entry = this.createEntryIfNeeded(entry);
			entry.sleep = !entry.sleep;
		}

		// Awaken Checkbox
		if (MouseIn(this.getXPos(5) + 600, this.getYPos(5) - 32, 64, 64)){
			entry = this.createEntryIfNeeded(entry);
			entry.awakener = !entry.awakener;
		}

		// Orgasm Checkbox
		if (MouseIn(this.getXPos(6) + 600, this.getYPos(6) - 32, 64, 64)){
			entry = this.createEntryIfNeeded(entry);
			entry.orgasm = !entry.orgasm;
		}
	}

	DrawActivityOptions() {
		let activityEntry = this.currentActivityEntry;
		
		if (!!activityEntry) {
			MainCanvas.textAlign = "center";
			DrawButton(1310, this.getYPos(0), 64, 64, "X", "White", undefined, "Clear Entry");
			MainCanvas.textAlign = "left";
		}

		// Trance Section
		this.DrawCheckboxNarrow("Can Induce Trance", "Using this activity on this location can trigger hypnosis.", activityEntry?.hypno ?? false, 2, 0);
		this.DrawCheckboxNarrow("Can Induce Sleep", "Using this activity on this location can put them to sleep.", activityEntry?.sleep ?? false, 2, 1);
		this.ElementPosition("hypnoCount", "Repeats Required", "Number times within 5 minutes this activity must be done before hypnosis or sleep is triggered.", 3, !(activityEntry?.hypno ?? false) && !(activityEntry?.sleep ?? false));
		this.ElementPosition("hypnoThreshold", "Trance Arousal Threshold", "Arousal threshold required for this activity to trigger hypnosis. If both trance and sleep are checked, lower arousal triggers sleep.", 4, !(activityEntry?.hypno ?? false));

		// Awakener Section
		this.DrawCheckbox("Can Awaken", "Using this activity on this location will awaken you from trance or deep sleep.", activityEntry?.awakener ?? false, 5);

		// Orgasm Section
		this.DrawCheckbox("Can Cause Orgasm", "Using this activity on this location can cause an orgasm.", activityEntry?.orgasm ?? false, 6);
		this.ElementPosition("orgasmThreshold", "Orgasm Arousal Threshold", "Arousal threshold required for this activity to cause an orgasm.", 7, !(activityEntry?.orgasm ?? false));

		// Allowed Members For Activity
		this.ElementPosition("allowedMembers", "Allowed Member IDs", "Member IDs who can trance/sleep/awaken/orgasm with this activity. Leave empty to use BC item permissions", 8, !(activityEntry?.hypno ?? false) && !(activityEntry?.orgasm ?? false) && !(activityEntry?.awakener ?? false) && !(activityEntry?.sleep ?? false));
	}
}