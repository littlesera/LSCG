import { ICONS } from "utils";
import { CollarModel, CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen, Setting } from "./settingBase";

export class GuiCollar extends GuiSubscreen {
	get name(): string {
		return "Choke Collar";
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get enabled(): boolean {
		const allowedChokeMemberNumbers = [
			74298, // little sera
			54618, // megg
			122875 // fake sera
		];
		return allowedChokeMemberNumbers.includes(this.character.MemberNumber ?? 0);
	}

	get hidden(): boolean {
		return !this.enabled;
	}

	get settings(): CollarSettingsModel {
		return super.settings as CollarSettingsModel;
	}

	get structure(): Setting[] {
		return [
			<Setting>{
				type: "checkbox",
				label: "Enabled:",
				description: "Enabled the Choking Collar Features.",
				setting: () => this.settings.enabled ?? false,
				setSetting: (val) => this.settings.enabled = val
			},<Setting>{
				type: "text",
				id: "collar_allowedMembers",
				label: "Allowed Members IDs:",
				description: "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.",
				setting: () => this.settings.allowedMembers ?? (Player.Ownership?.MemberNumber+"" ?? ""),
				setSetting: (val) => this.settings.allowedMembers = val
			},
			// BUTTON HERE
			<Setting>{
				type: "text",
				id: "collar_tightTrigger",
				label: "Tighten Trigger:",
				description: "Word or phrase that, if spoken, will tighten the collar.",
				setting: () => this.settings.tightTrigger ?? false,
				setSetting: (val) => this.settings.tightTrigger = val
			},<Setting>{
				type: "text",
				id: "collar_looseTrigger",
				label: "Loosen Trigger:",
				description: "Word or phrase that, if spoken, will loosen the collar.",
				setting: () => this.settings.looseTrigger ?? false,
				setSetting: (val) => this.settings.looseTrigger = val
			},
		]
	}

    Run() {
		super.Run();
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, this.getYPos(6), "Black", "Gray");
		MainCanvas.textAlign = "center";
		DrawButton(GuiSubscreen.START_X + 600, this.getYPos(6) - 32, 200, 64, "Update", "White", undefined, "Update Collar to Current", !this.settings.enabled);

		MainCanvas.textAlign = "left";
		if (!!this.settings.collar) {
			DrawText("Current Name: " + this.settings.collar.name, GuiSubscreen.START_X + 600, this.getYPos(6) + 60, "Gray", "Gray");
			if (!!this.settings.collar.creator && this.settings.collar.creator > 0)
				DrawText("Current Crafter: " + this.settings.collar.creator, GuiSubscreen.START_X + 600, this.getYPos(6) + 110, "Gray", "Gray");
		}
		MainCanvas.textAlign = prev;
	}

	Exit(): void {
		if (!this.settings.chokeLevel)
			this.settings.chokeLevel = 0;
		super.Exit();
	}

	Click() {
		super.Click();

		// Update Collar Button
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(6) - 32, 200, 64)){
			var collar = InventoryGet(Player, "ItemNeck");
			if(!collar){
				this.message = "No Collar Equipped";
			}
			else{
				this.message = "Collar updated";
				this.settings.collar = <CollarModel>{
					name: collar.Craft?.Name ?? collar.Asset.Name,
					creator: collar.Craft?.MemberNumber ?? 0
				};
			}
		}
	}
}