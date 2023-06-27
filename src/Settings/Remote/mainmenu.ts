import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { RemoteUIModule } from "Modules/remoteUI";
import { RemoteGuiSubscreen } from "./remoteBase";
import { GuiSubscreen } from "Settings/settingBase";
import { RemoteHypno } from "./hypno";
import { LSCG_CHANGES } from "utils";
import { RemoteCollar } from "./collar";
import { CollarModule } from "Modules/collar";

export class RemoteMainMenu extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "MainMenu";
	}

	get enabled(): boolean {
		return false;
	}

	get hidden(): boolean {
		return true;
	}

	constructor(module: RemoteUIModule, C: OtherCharacter) {
		super(module, C);
	}

	onChange(source: number) {
		if (source === this.character.MemberNumber) {
			this.Load();
		}
	}

	Load(): void {
		this.subscreens = [
			new RemoteHypno(getModule<HypnoModule>("HypnoModule"), this.Character),
			new RemoteCollar(getModule<CollarModule>("CollarModule"), this.Character)
		];
	}

	get character(): Character {
		// Because we're initialized by that instance, it must already exist
		return this.Character as Character;
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		DrawText(`- Little Sera's Club Games ${(this.Character as OtherCharacter).LSCG?.Version ?? "?.?.?"} -`, GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
		
		MainCanvas.textAlign = "center";
		let i = 0;
		for (const screen of this.subscreens) {
			const PX = Math.floor(i / 6);
			const PY = i % 6;

			const isDisabled = !screen.enabled;
			const reason = screen.disabledReason;

			// Skip disabled screens for the time being
			if (screen.name == "MainMenu" || screen.hidden) continue;

			DrawButton(150 + 430 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", "",
				isDisabled ? reason : "", isDisabled);
			DrawImageResize(screen.icon, 150 + 430 * PX + 10, 190 + 120 * PY + 10, 70, 70);
			MainCanvas.textAlign = "left";
			DrawTextFit(screen.name, 250 + 430 * PX, 235 + 120 * PY, 340, "Black");
			MainCanvas.textAlign = "center";

			i++;
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

		let i = 0
		for (const screen of this.subscreens) {
			const PX = Math.floor(i / 6);
			const PY = i % 6;
			
			if (screen.name == "MainMenu" || screen.hidden) continue;

			if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 450, 90) && screen.enabled) {
				this.setSubscreen(screen);
				return;
			}
			i++;
		}

		if (MouseIn(1500, 720, 400, 80))
            window.open(LSCG_CHANGES, '_blank');

		if (MouseIn(1500, 820, 400, 80))
            window.open('https://github.com/littlesera/LSCG/wiki', '_blank');
	}

	Exit(): void {
		(this.module as RemoteUIModule).currentSubscreen = null;
	}
}