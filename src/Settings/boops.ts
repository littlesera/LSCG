import { BaseSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";

export class GuiBoops extends GuiSubscreen {

	get name(): string {
		return "Boops";
	}

	get icon(): string {
		return "Icons/Use.png";
	}

	get settings(): BaseSettingsModel {
        return super.settings as BaseSettingsModel;
    }

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		
		DrawText("- LSCG Boops -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");

		// Enabled	[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
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