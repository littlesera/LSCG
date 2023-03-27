import { HypnoSettingsModel } from "./Models/hypno";
import { GuiSubscreen } from "./settingBase";

export class GuiHypno extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): HypnoSettingsModel {
		return Player.LSCG.HypnoModule ?? { enabled: false };
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Hypnosis -", GuiSubscreen.START_X, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, 190, "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, 190, 64, 64, "", this.settings.enabled ?? true);
		
		// Override Trigger Words 	[Word List]
		DrawText("Override Trigger Words:", GuiSubscreen.START_X, 190 + 120, "Black", "Gray");
		if (!this.settings.enabled) {
			ElementCreateInput("hypno_overrideWords", "text", this.settings.overrideWords ?? "", "255");
			ElementPosition("hypno_overrideWords", GuiSubscreen.START_X + 600, 190 + 120, 200);
		}

		// Override allowed members	[Member ID List]
		DrawText("Override Allowed Member IDs:", 225, 190 + 240, "Black", "Gray");
		if (!this.settings.enabled) {
			ElementCreateInput("hypno_overrideMembers", "text", this.settings.overrideMemberIds ?? "", "255");
			ElementPosition("hypno_overrideMembers", GuiSubscreen.START_X + 600, 190 + 240, 200);
		}

		// Enabled 					[true/false]
		DrawText("Enable Cycle:", GuiSubscreen.START_X, 190 + 360, "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, 190 + 360, 64, 64, "", (this.settings.enableCycle ?? true) || !this.settings.enabled);

		// Cycle Time				[Number of minutes (default 30)]
		DrawText("Trigger Cycle Time:", GuiSubscreen.START_X, 190 + 480, "Black", "Gray");
		if (!this.settings.enabled) {
			ElementCreateInput("hypno_cycleTime", "number", this.settings.cycleTime ?? "30", "100");
			ElementPosition("hypno_cycleTime", GuiSubscreen.START_X + 600, 190 + 480, 200);
		}

		MainCanvas.textAlign = prev;
	}

	Exit(): void {
		ElementRemove("hypno_overrideWords");
		ElementRemove("hypno_overrideMembers");
		ElementRemove("hypno_cycleTime");
		super.Exit();
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
	}
}