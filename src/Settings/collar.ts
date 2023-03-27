import { CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen } from "./settingBase";

export class GuiCollar extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): CollarSettingsModel {
		return Player.LSCG.CollarModule  ?? { enabled: false };
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Choking Collar -", GuiSubscreen.START_X, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, 190, "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, 190, 64, 64, "", this.settings.enabled ?? false);
		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", GuiSubscreen.START_X, 190 + 120, "Black", "Gray");
		if (!this.settings.enabled) {
			ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers ?? "", "255");
			ElementPosition("collar_allowedMembers", GuiSubscreen.START_X + 600, 190 + 120, 200);
		}
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, 190 + 240, "Black", "Gray");
		DrawButton(GuiSubscreen.START_X + 600, 190 + 240, 200, 64, "Update", "White", undefined, "Update Collar to Current", !this.settings.enabled);

		MainCanvas.textAlign = prev;
	}

	Click() {
		super.Click();

		// Update Collar Button
		if (MouseIn(GuiSubscreen.START_X + 600, 190 + 240, 200, 64)){
			// Do Update.....
			console.info("Update Collar");
		}
	}
}