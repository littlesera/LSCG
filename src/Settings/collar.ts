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
		MainCanvas.textAlign = "center";
		DrawText("- LSCG Choking Collar -", 225, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", 225, 190 + 120, "Black", "Gray");
		DrawCheckbox(500, 190 + 120, 64, 64, "Enabled", this.settings.enabled ?? false);
		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", 225, 190 + 120, "Black", "Gray");
		ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers ?? "", "255");
		ElementPosition("collar_allowedMembers", 500, 190 + 240, 200);
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", 225, 190 + 360, "Black", "Gray");
		DrawButton(500, 190 + 360, 200, 64, "Update", "White");
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
	}
}