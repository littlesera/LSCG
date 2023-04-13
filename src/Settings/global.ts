import { GlobalSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiGlobal extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): GlobalSettingsModel {
        Player.LSCG.GlobalModule = Player.LSCG.GlobalModule ?? { enabled: true, edgeBlur: false };
        return Player.LSCG.GlobalModule
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Global -", 225, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled	[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled ?? true);

		// Blur While Edged	[true/false]
		DrawText("Blur while edged:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64, "", this.settings.edgeBlur ?? true);

		MainCanvas.textAlign = prev;
	}

	Click() {
		super.Click();

		// Edge Blur Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.edgeBlur = !this.settings.edgeBlur;
		}
	}
}