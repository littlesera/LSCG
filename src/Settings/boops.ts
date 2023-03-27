import { BaseSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiBoops extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): BaseSettingsModel {
		return Player.LSCG.BoopsModule ?? { enabled: false };
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Boops -", 225, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled	[true/false]
		DrawCheckbox(225, 190, 64, 64, "Enabled", this.settings.enabled ?? false);

		MainCanvas.textAlign = prev;
	}
}