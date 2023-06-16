import { getModule } from "modules";
import { MiscModule } from "Modules/misc";
import { GuiSubscreen } from "./settingBase";
import { GUI } from "./settingUtils";
import { LSCG_CHANGES } from "utils";

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
		var hypnoBlock = Player.LSCG.HypnoModule?.immersive && Player.LSCG.HypnoModule?.hypnotized;
		var chloroformBlock = Player.LSCG.MiscModule?.immersiveChloroform && getModule<MiscModule>("MiscModule")?.isChloroformed;
		var drugBlock = Player.LSCG.InjectorModule?.immersive && (Player.LSCG.InjectorModule?.asleep || Player.LSCG.InjectorModule?.brainwashed)
		return (hypnoBlock || chloroformBlock || drugBlock);
	}

	constructor(module: GUI) {
		super(module);

		this.subscreens = module.subscreens;
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
		DrawText(`- Little Sera's Club Games ${LSCG_VERSION} -`, GuiSubscreen.START_X, GuiSubscreen.START_Y, "Black", "Gray");
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

				DrawButton(150 + 430 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", "", isDisabled ? "Setting is deactivated" : "", isDisabled);
				DrawImageResize(screen.icon, 150 + 430 * PX + 10, 190 + 120 * PY + 10, 70, 70);
				MainCanvas.textAlign = "left";
				DrawTextFit(screen.name, 250 + 430 * PX, 235 + 120 * PY, 340, "Black");
				MainCanvas.textAlign = "center";

				i++;
			}
		} else {
			DrawText("Settings disabled while incapacitated and immersive", 150, 190, "Black", "Gray");
		}

		MainCanvas.textAlign = "left";
		DrawButton(1500, 720, 400, 80, "", "White", "", "Open LSCG Latest Release on Github.", false);
		DrawImageResize("Icons/Changelog.png", 1510, 730, 60, 60);
        DrawTextFit("Latest Changes", 1580, 760, 320, "Black");

		DrawButton(1500, 820, 400, 80, "", "White", "", "Open LSCG Wiki on GitHub.", false);
		DrawImageResize("Icons/Introduction.png", 1510, 830, 60, 60);
        DrawTextFit("Open Help", 1580, 860, 320, "Black");

		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		if (!this.immersiveBlock) {
			let i = 0
			for (const screen of this.subscreens) {
				const PX = Math.floor(i / 6);
				const PY = i % 6;

				const isDisabled = !screen.enabled;
				if (isDisabled) continue;

				if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 450, 90)) {
					this.setSubscreen(screen);
					return;
				}
				i++;
			}
		}

		if (MouseIn(1500, 720, 400, 80))
            window.open(LSCG_CHANGES, '_blank');

		if (MouseIn(1500, 820, 400, 80))
            window.open('https://github.com/littlesera/LSCG/wiki', '_blank');
	}

	Exit(): void {
		this.setSubscreen(null);
	}
}