import { HypnoSettingsModel } from "./Models/hypno";
import { SettingsModel } from "./Models/settings";
import { GuiSubscreen } from "./settingBase";

export class GuiHypno extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): HypnoSettingsModel {
		if (Player.LSCG === undefined) {
			Player.LSCG = <SettingsModel>{};
		}
		if (Player.LSCG.HypnoModule === undefined) {
			Player.LSCG.HypnoModule = <HypnoSettingsModel>{ 
				enabled: false,
				activatedAt: 0,
				cycleTime: "30",
				enableCycle: true,
				overrideMemberIds: "",
				overrideWords: ""
			};
		}
		return Player.LSCG.HypnoModule;
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Hypnosis -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled);
		
		// Override Trigger Words 	[Word List]
		DrawText("Override Trigger Words:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		if (this.settings.enabled) {
			ElementCreateInput("hypno_overrideWords", "text", this.settings.overrideWords, "255");
			ElementPosition("hypno_overrideWords", GuiSubscreen.START_X + 900, this.getYPos(2), 600);
		}

		// Override allowed members	[Member ID List]
		DrawText("Override Allowed Member IDs:", 225, this.getYPos(3), "Black", "Gray");
		if (this.settings.enabled) {
			ElementCreateInput("hypno_overrideMembers", "text", this.settings.overrideMemberIds, "255");
			ElementPosition("hypno_overrideMembers", GuiSubscreen.START_X + 900, this.getYPos(3), 600);
		}

		// Enabled 					[true/false]
		DrawText("Enable Cycle:", GuiSubscreen.START_X, this.getYPos(4), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(4) - 32, 64, 64, "", (this.settings.enableCycle ?? true) || !this.settings.enabled);

		// Cycle Time				[Number of minutes (default 30)]
		DrawText("Trigger Cycle Time:", GuiSubscreen.START_X, this.getYPos(5), "Black", "Gray");
		if (this.settings.enabled) {
			ElementCreateInput("hypno_cycleTime", "number", this.settings.cycleTime, "100");
			ElementPosition("hypno_cycleTime", GuiSubscreen.START_X + 700, this.getYPos(5), 200);
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

		// Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.enabled = !this.settings.enabled;
		}

		//Enable Cycme Checkbox
	}
}