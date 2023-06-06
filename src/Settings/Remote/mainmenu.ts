import { getModule } from "modules";
import { hypnoActivated, HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { MiscModule } from "Modules/misc";
import { RemoteUIModule } from "Modules/remoteUI";
import { RemoteGuiSubscreen } from "./remoteBase";
import { GUI } from "../settingUtils";
import { GuiSubscreen } from "Settings/settingBase";
import { GuiHypno } from "Settings/hypno";
import { RemoteHypno } from "./hypno";

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
		this.subscreens = [new RemoteHypno(getModule<HypnoModule>("HypnoModule"), this.Character)];
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		DrawText("- Little Sera's Club Games -", GuiSubscreen.START_X, GuiSubscreen.START_Y, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
		
		MainCanvas.textAlign = "center";
		let i = 0;
		for (const screen of this.subscreens) {
			const PX = Math.floor(i / 6);
			const PY = i % 6;

			const isDisabled = !screen.enabled;

			// Skip disabled screens for the time being
			if (screen.name == "MainMenu" || screen.hidden) continue;

			DrawButton(150 + 430 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", screen.icon,
				isDisabled ? "Setting is deactivated" : "", isDisabled);
			MainCanvas.textAlign = "left";
			DrawTextFit(screen.name, 250 + 430 * PX, 235 + 120 * PY, 340, "Black");
			MainCanvas.textAlign = "center";

			i++;
		}
		
		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

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

	Exit(): void {
		(this.module as RemoteUIModule).currentSubscreen = null;
	}
}