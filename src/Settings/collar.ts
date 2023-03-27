import { CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen } from "./settingBase";

export class GuiCollar extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): CollarSettingsModel {
		Player.LSCG.CollarModule = Player.LSCG.CollarModule  ?? { enabled: false };
		return Player.LSCG.CollarModule
	}

	Load(): void {
		this.settings.allowedMembers = this.settings.allowedMembers ?? "";
		super.Load();
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Choking Collar -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled ?? true);

		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		if (!this.settings.enabled) {
			ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers, "255");
			ElementPosition("collar_allowedMembers", GuiSubscreen.START_X + 1000, this.getYPos(2), 600);
		}
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, this.getYPos(3), "Black", "Gray");
		MainCanvas.textAlign = "center";
		DrawButton(GuiSubscreen.START_X + 600, this.getYPos(3), 200, 64, "Update", "White", undefined, "Update Collar to Current", !this.settings.enabled);

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