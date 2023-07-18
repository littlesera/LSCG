import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { GetDelimitedList, ICONS } from "utils";
import { GlobalSettingsModel } from "./Models/base";
import { GuiSubscreen, Setting } from "./settingBase";
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

	get structure(): Setting[] {
		return []
	}

	getZoneColor(groupName: string): string {
		let hasConfiguration = this.settings.activities.some(a => a.group == groupName);
		return hasConfiguration ? "#00FF0044" : "#80808044";
	}

	get currentActivityEntry(): ActivityEntryModel | undefined {
		let actName = this.Activities[this.activityIndex]?.Name;
		let groupName = Player.FocusGroup?.Name ?? "";
		let entry = this.getActivityEntry(actName, groupName);
		return entry;
	}

	getActivityEntry(actName: string, grpName: string): ActivityEntryModel | undefined {
		return this.settings.activities.find(a => a.name == actName && a.group == grpName);
	}

	activityIndex: number = 0;

	get Activities(): Activity[] {
		if (!Player.FocusGroup)
			return [];
		else
			return AssetActivitiesForGroup("Female3DCG", Player.FocusGroup.Name, "any").filter(a => this.ActivityHasDictionaryText(this.getActivityLabelTag(a, Player.FocusGroup!)));
	}

	ActivityHasDictionaryText(KeyWord: string) {
		if (!ActivityDictionary)
			ActivityDictionaryLoad();
		if (!ActivityDictionary)
			return;

		for (let D = 0; D < ActivityDictionary.length; D++)
			if (ActivityDictionary[D][0] == KeyWord)
				return true;
		return false;
	}

	getActivityLabelTag(activity: Activity, group: AssetGroup) {
		let groupName = group.Name;
		if (Player.HasPenis()) {
			if (groupName == "ItemVulva") groupName = "ItemPenis";
			if (groupName == "ItemVulvaPiercings") groupName = "ItemGlans";
		}
	
		return `Label-ChatOther-${groupName}-${activity.Name}`;
	}

	getActivityLabel(activity: Activity, group: AssetGroup) {
		if (!activity)
			return "ACTIVITY NOT FOUND";
		
		let tag = this.getActivityLabelTag(activity, group);

		return ActivityDictionaryText(tag);
	}

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
				DrawAssetGroupZone(Player, Group.Zone, 0.9, 50, 50, 1, "#808080FF", 3, this.getZoneColor(Group.Name));
		}

		if (Player.FocusGroup != null) {
			let activity = this.Activities[this.activityIndex ?? 0];
			DrawAssetGroupZone(Player, Player.FocusGroup.Zone, 0.9, 50, 50, 1, "cyan");
			MainCanvas.textAlign = "center";
			DrawBackNextButton(550, this.getYPos(0), 600, 64, this.getActivityLabel(activity, Player.FocusGroup), "White", "", () => "", () => "");
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
					let activities = this.Activities;
					if (this.activityIndex >= activities.length)
						this.activityIndex = 0;
					this.LoadActivityEntry(this.currentActivityEntry);
				}
			}
		}

		if (Player.FocusGroup != null) {
			let activities = this.Activities;
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

	ElementSetValue(elementId: string, value: any) {
		let element = document.getElementById(elementId) as HTMLInputElement;
		if (!!element && value != null)
			element.value = value;
	}

	newDefaultEntry(actName: string, grpName: string): ActivityEntryModel {
		return <ActivityEntryModel>{
			name: actName,
			group: grpName,
			hypno: false,
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
			existing = this.newDefaultEntry(this.Activities[this.activityIndex].Name, Player.FocusGroup?.Name ?? "");
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
		if (MouseIn(this.getXPos(2) + 600, this.getYPos(2) - 32, 64, 64)){
			entry = this.createEntryIfNeeded(entry);
			entry.hypno = !entry.hypno;
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
		this.DrawCheckbox("Can Induce Trance", "Using this activity on this location can trigger hypnosis.", activityEntry?.hypno ?? false, 2);
		this.ElementPosition("hypnoCount", "Repeats Required", "Number times within 5 minutes this activity must be done before hypnosis is triggered.", 3, !(activityEntry?.hypno ?? false));
		this.ElementPosition("hypnoThreshold", "Trance Arousal Threshold", "Arousal threshold required for this activity to trigger hypnosis.", 4, !(activityEntry?.hypno ?? false));

		// Awakener Section
		this.DrawCheckbox("Can Awaken", "Using this activity on this location will awaken you from trance or deep sleep.", activityEntry?.awakener ?? false, 5);

		// Orgasm Section
		this.DrawCheckbox("Can Cause Orgasm", "Using this activity on this location can cause an orgasm.", activityEntry?.orgasm ?? false, 6);
		this.ElementPosition("orgasmThreshold", "Orgasm Arousal Threshold", "Arousal threshold required for this activity to cause an orgasm.", 7, !(activityEntry?.orgasm ?? false));

		// Allowed Members For Activity
		this.ElementPosition("allowedMembers", "Allowed Member IDs", "Member IDs who can trance/awaken/orgasm with this activity. Leave empty to use BC item permissions", 8, !(activityEntry?.hypno ?? false) && !(activityEntry?.orgasm ?? false) && !(activityEntry?.awakener ?? false));
	}
}