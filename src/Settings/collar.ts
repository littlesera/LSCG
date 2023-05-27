import { ICONS } from "utils";
import { CollarModel, CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen } from "./settingBase";

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

	get settings(): CollarSettingsModel {
		return super.settings as CollarSettingsModel;
	}

	Load(): void {
		super.Load();
		ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers ?? (Player.Ownership?.MemberNumber+"" ?? ""), "255");
		ElementCreateInput("collar_tightTrigger", "text", this.settings.tightTrigger ?? "tight", "255");
		ElementCreateInput("collar_looseTrigger", "text", this.settings.looseTrigger ?? "loose", "255");
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Choking Collar -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled ?? false);

		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		ElementPosition("collar_allowedMembers", GuiSubscreen.START_X + 900, this.getYPos(2), 600);
		
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, this.getYPos(3), "Black", "Gray");
		MainCanvas.textAlign = "center";
		DrawButton(GuiSubscreen.START_X + 600, this.getYPos(3) - 32, 200, 64, "Update", "White", undefined, "Update Collar to Current", !this.settings.enabled);
		MainCanvas.textAlign = "left";

		// Tighten Trigger 			[string]
		DrawText("Tighten Trigger:", GuiSubscreen.START_X, this.getYPos(4), "Black", "Gray");
		ElementPosition("collar_tightTrigger", GuiSubscreen.START_X + 900, this.getYPos(4), 600);

		// Loosen Trigger 			[string]
		DrawText("Loosen Trigger:", GuiSubscreen.START_X, this.getYPos(5), "Black", "Gray");
		ElementPosition("collar_looseTrigger", GuiSubscreen.START_X + 900, this.getYPos(5), 600);

		MainCanvas.textAlign = prev;
	}

	Exit(): void {
		this.settings.allowedMembers = ElementValue("collar_allowedMembers") ?? (Player.Ownership?.MemberNumber+"" ?? "");
		this.settings.tightTrigger = ElementValue("collar_tightTrigger") ?? "tight";
		this.settings.looseTrigger = ElementValue("collar_looseTrigger") ?? "loose";
		ElementRemove("collar_allowedMembers");
		ElementRemove("collar_tightTrigger");
		ElementRemove("collar_looseTrigger");

		if (!this.settings.chokeLevel)
			this.settings.chokeLevel = 0;
		super.Exit();
	}

	Click() {
		super.Click();

		// Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.enabled = !this.settings.enabled;
			return;
		}

		// Update Collar Button
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(3) - 32, 200, 64)){
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