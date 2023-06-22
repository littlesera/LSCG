import { ICONS } from "utils";
import { InjectorSettingsModel } from "./Models/injector";
import { GuiSubscreen, Setting } from "./settingBase";
import { BaseSettingsModel } from "./Models/base";
import { getModule } from "modules";
import { CommandModule } from "Modules/commands";

export class GuiReset extends GuiSubscreen {

	get name(): string {
		return "Reset all LSCG Data";
	}

	get icon(): string {
		return ICONS.BOUND_GIRL;
	}

	private allowedConfirmTime: number | null = 0;

	Load() {
		this.allowedConfirmTime = Date.now() + 10_000;
		super.Load();
	}

	Run() {
		MainCanvas.textAlign = "center";

		DrawText(`- Permanent reset of ALL LSCG data -`, 1000, 125, "Black");

		DrawText("- Warning -", 1000, 225, "Black", "Black");
		DrawText("If you confirm, all LSCG data (including settings, overrides, and current states) will be permanently reset!", 1000, 325, "Black");

		//DrawText("As part of the deletion process, the window will reload, logging you out of your account.", 1000, 500, "Gray");
		DrawText("You will be able to continue using LSCG, but all of your configuration will be reset to default!", 1000, 550, "Gray");

		DrawText("This action cannot be undone!", 1000, 625, "Red", "Black");

		if (this.allowedConfirmTime === null) {
			DrawText("Resetting...", 1000, 720, "Black");
			return;
		}

		const now = Date.now();
		if (now < this.allowedConfirmTime) {
			DrawButton(300, 720, 200, 80, `Confirm (${Math.floor((this.allowedConfirmTime - now) / 1000)})`, "#ddd", undefined, undefined, true);
		} else {
			DrawButton(300, 720, 200, 80, "Confirm", "White");
		}

		DrawButton(1520, 720, 200, 80, "Cancel", "White");
	}

	Click() {
		if (this.allowedConfirmTime === null) return;

		if (MouseIn(1520, 720, 200, 80)) return this.Exit();

		if (MouseIn(300, 720, 200, 80) && Date.now() >= this.allowedConfirmTime) return this.Confirm();
	}

	Confirm() {
		this.allowedConfirmTime = null;
		getModule<CommandModule>("CommandModule")?.EmergencyRelease();
		this.Exit();
	}
}