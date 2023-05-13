import { BaseSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiLipstick extends GuiSubscreen {

	get name(): string {
		return "Lipstick";
	}

	get icon(): string {
		return "Icons/Arousal.png";
	}

	get settings(): BaseSettingsModel {
        Player.LSCG.LipstickModule = Player.LSCG.LipstickModule ?? { enabled: true };
        return Player.LSCG.LipstickModule
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Lipstick -", 225, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enable	[true/false]
		DrawText("Enable Lipstick Marks:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled ?? false);

		MainCanvas.textAlign = prev;
	}

	Click(): void {
		super.Click();

		// Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.enabled = !this.settings.enabled;
			return;
		}
	}
}