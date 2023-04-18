import { BaseSettingsModel, MiscSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiMisc extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): MiscSettingsModel {
        Player.LSCG.MiscModule = Player.LSCG.MiscModule ?? { enabled: true, chloroformEnabled: false };
        return Player.LSCG.MiscModule
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Miscellaneous -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Chloroform Enabled	[true/false]
		DrawText("Chloroform Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.chloroformEnabled ?? false);

		// Hand Choke Enabled	[true/false]
		DrawText("Hand Choking Enabled:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64, "", this.settings.handChokeEnabled ?? false);

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
	}
}