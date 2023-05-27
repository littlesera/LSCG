import { ICONS } from "utils";
import { HypnoSettingsModel } from "./Models/hypno";
import { GuiSubscreen } from "./settingBase";

export class GuiHypno extends GuiSubscreen {

	get name(): string {
		return "Hypnosis";
	}

	get icon(): string {
		return ICONS.HYPNO;
	}

	get settings(): HypnoSettingsModel {
		return super.settings as HypnoSettingsModel;
	}

	Load(): void {
		super.Load();
		ElementCreateInput("hypno_overrideWords", "text", this.settings.overrideWords ?? "", "255");
		ElementCreateInput("hypno_overrideMembers", "text", this.settings.overrideMemberIds ?? "", "255");
		ElementCreateInput("hypno_cycleTime", "number", "" + (this.settings.cycleTime ?? 30), "5");
		ElementCreateInput("hypno_triggerTime", "number", "" + (this.settings.triggerTime ?? 5), "5");
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Hypnosis -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled ?? false);
		
		// Immersive Hypnosis		[true/false]
		DrawText("Immersive Hypnosis:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64, "", Player.LSCG.HypnoModule.immersive ?? false);

		// Override Trigger Words 	[Word List]
		DrawText("Override Trigger Words:", GuiSubscreen.START_X, this.getYPos(3), "Black", "Gray");
		ElementPosition("hypno_overrideWords", GuiSubscreen.START_X + 900, this.getYPos(3), 600);

		// Override allowed members	[Member ID List]
		DrawText("Override Allowed Member IDs:", 225, this.getYPos(4), "Black", "Gray");
		ElementPosition("hypno_overrideMembers", GuiSubscreen.START_X + 900, this.getYPos(4), 600);

		// Enabled 					[true/false]
		DrawText("Enable Cycle:", GuiSubscreen.START_X, this.getYPos(5), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(5) - 32, 64, 64, "", (this.settings.enableCycle ?? false));

		// Cycle Time				[Number of minutes (default 30)]
		DrawText("Trigger Cycle Time (min.):", GuiSubscreen.START_X, this.getYPos(6), "Black", "Gray");
		ElementPosition("hypno_cycleTime", GuiSubscreen.START_X + 700, this.getYPos(6), 200);

		// Trigger Time				[Number of minutes (default 5)]
		DrawText("Hypnosis Length (min.):", GuiSubscreen.START_X, this.getYPos(7), "Black", "Gray");
		ElementPosition("hypno_triggerTime", GuiSubscreen.START_X + 700, this.getYPos(7), 200);

		// Arousal 					[true/false]
		DrawText("Build arousal while hypnotized:", GuiSubscreen.START_X, this.getYPos(8), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(8) - 32, 64, 64, "", (this.settings.enableArousal ?? false));

		// Limit To Whitelist	[true/false]
		DrawText("Limit all to Whitelist:", GuiSubscreen.START_X, this.getYPos(9), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(9) - 32, 64, 64, "", this.settings.whitelistLimit ?? false);

		MainCanvas.textAlign = prev;
	}

	Exit(): void {
		// && CommonIsNumeric(ElementValue("InputOrgasmDecayMultiplier"))){
		// 	Player.BCT.bctSettings.arousalProgressMultiplier = ElementValue("InputArousalProgressMultiplier");
		
		this.settings.overrideWords = ElementValue("hypno_overrideWords") ?? "";
		this.settings.overrideMemberIds = ElementValue("hypno_overrideMembers") ?? "";
		if (CommonIsNumeric(ElementValue("hypno_cycleTime")))
			this.settings.cycleTime = +(ElementValue("hypno_cycleTime") ?? "30");
		if (CommonIsNumeric(ElementValue("hypno_triggerTime")))
			this.settings.triggerTime = +(ElementValue("hypno_triggerTime") ?? "30");

		ElementRemove("hypno_overrideWords");
		ElementRemove("hypno_overrideMembers");
		ElementRemove("hypno_cycleTime");
		ElementRemove("hypno_triggerTime");
		super.Exit();
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		// Enabled Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64)){
			this.settings.enabled = !this.settings.enabled;
		}

		// Immersive Hypnosis Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(2) - 32, 64, 64)){
			Player.LSCG.HypnoModule.immersive = !Player.LSCG.HypnoModule.immersive;
		}

		//Enable Cycle Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(5) - 32, 64, 64)){
			this.settings.enableCycle = !this.settings.enableCycle;
		}

		//Arousal Checkbox
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(8) - 32, 64, 64)){
			this.settings.enableArousal = !this.settings.enableArousal;
		}

		// Limit All to Whitelist
		if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(9) - 32, 64, 64)){
			this.settings.whitelistLimit = !this.settings.whitelistLimit;
		}
	}
}