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
		DrawText("Enabled:", GuiSubscreen.START_X, 190 + 120, "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 800, 190 + 120, 64, 64, "Enabled", this.settings.enabled ?? false);
		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", GuiSubscreen.START_X, 190 + 240, "Black", "Gray");
		ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers ?? "", "255");
		ElementPosition("collar_allowedMembers", GuiSubscreen.START_X + 800, 190 + 240, 200);
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, 190 + 360, "Black", "Gray");
		DrawButton(GuiSubscreen.START_X + 800, 190 + 360, 200, 64, "Update", "White");

		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
	}
}