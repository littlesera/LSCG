import { GuiSubscreen } from "./settingBase";

export class GuiLipstick extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings() {
        return Player.LSCG.LipstickModule  ?? { enabled: false };
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Lipstick -", 225, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enable	[true/false]
		DrawCheckbox(225, 190 + 120 * 1, 64, 64, "Enabled", this.settings.enabled ?? false);

		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
	}
}