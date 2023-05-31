import { getModule } from "modules";
import { hypnoActivated, HypnoModule } from "Modules/hypno";
import { MiscModule } from "Modules/misc";
import { GuiSubscreen } from "./settingBase";
import { GUI } from "./settingUtils";

export class MainMenu extends GuiSubscreen {
	subscreens: GuiSubscreen[] = [];

	get name(): string {
		return "MainMenu";
	}

	get enabled(): boolean {
		return false;
	}

	get hidden(): boolean {
		return true;
	}

	get immersiveBlock(): boolean {
		var hypnoBlock = Player.LSCG.HypnoModule?.immersive && hypnoActivated();
		var chloroformBlock = Player.LSCG.MiscModule?.immersiveChloroform &&  getModule<MiscModule>("MiscModule")?.isChloroformed;
		return (hypnoBlock || chloroformBlock);
	}

	onChange(source: number) {
		if (source === this.character.MemberNumber) {
			this.Load();
		}
	}

	Load(): void {
		// As that Load call was made automatically by BC (though PreferenceSubscreenList) we're not setup fully yet.
		// Set and bail out, as we're gonna get called again.
		if (!GUI.instance?.currentSubscreen) {
			this.setSubscreen(this);
			return;
		}

		super.Load();
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		DrawText("- Little Sera's Club Games -", GuiSubscreen.START_X, GuiSubscreen.START_Y, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
		
		if (!this.immersiveBlock) {
			MainCanvas.textAlign = "center";
			let i = 0;
			for (const screen of this.subscreens) {
				const PX = Math.floor(i / 6);
				const PY = i % 6;

				const isDisabled = !screen.enabled;

				// Skip disabled screens for the time being
				if (screen.name == "MainMenu" || screen.hidden) continue;

				DrawButton(150 + 430 * PX, 190 + 120 * PY, 400, 90, "", isDisabled ? "#ddd" : "White", screen.icon,
					isDisabled ? "Setting is deactivated" : "", isDisabled);
				DrawTextFit(screen.name, 380 + 430 * PX, 235 + 120 * PY, 310, "Black");

				i++;
			}
		} else {
			DrawText("Settings disabled while incapacitated and immersive", 150, 190, "Black", "Gray");
		}

		MainCanvas.textAlign = prev;

        // Changelog button..
		// MainCanvas.textAlign = "center";
        // DrawButton(1450, 810, 400, 90, "", "White", "", "Open changelog on GitHub");
        // DrawText(`View changelog`, 1450 + 350 / 2, 855, "Black", "");
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		// Changelog
		// if (MouseIn(1450, 810, 400, 90)) {
		// 	window.open(`https://github.com/littlesera/sera/CHANGELOG.md`, "_blank");
		// }

		if (!this.immersiveBlock) {
			let i = 0
			for (const screen of this.subscreens) {
				const PX = Math.floor(i / 6);
				const PY = i % 6;

				const isDisabled = !screen.enabled;
				if (isDisabled) continue;

				if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 400, 90)) {
					this.setSubscreen(screen);
					return;
				}
				i++;
			}
		}
	}

	Exit(): void {
		this.setSubscreen(null);
	}
}