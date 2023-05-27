import { MiscSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiMisc extends GuiSubscreen {

	get name(): string {
		return "Miscellaneous";
	}

	get icon(): string {
		return "Icons/General.png";
	}

	get settings(): MiscSettingsModel {
		return super.settings as MiscSettingsModel;
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Miscellaneous -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");

		// Chloroform Enabled	[true/false]
		DrawText("Chloroform Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.chloroformEnabled ?? false);

		// Hand Choke Enabled	[true/false]
		DrawText("Hand Choking Enabled:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64, "", this.settings.handChokeEnabled ?? false);

		// Gag Choke Enabled	[true/false]
		DrawText("Gag Suffocation Enabled:", GuiSubscreen.START_X, this.getYPos(3), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(3) - 32, 64, 64, "", this.settings.gagChokeEnabled ?? false);

		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		// Chloroform Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.chloroformEnabled = !this.settings.chloroformEnabled;
		}

		// Hand Choke Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64)){
			this.settings.handChokeEnabled = !this.settings.handChokeEnabled;
		}

		// Gag Choke Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(3) - 32, 64, 64)){
			this.settings.gagChokeEnabled = !this.settings.gagChokeEnabled;
		}
	}
}