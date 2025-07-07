import { getModule } from "modules";
import { MiscModule } from "Modules/misc";
import { GuiSubscreen } from "./settingBase";
import { GUI } from "./settingUtils";
import { ExportSettings, ImportSettings, LSCG_CHANGES, sleep } from "utils";
import { GuiReset } from "./reset";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";

export class MainMenu extends GuiSubscreen {
	subscreens: GuiSubscreen[] = [];
	resetSubscreen: GuiReset;

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
		let states = getModule<StateModule>("StateModule");
		let immersive = states.settings.immersive;
		let hypnoBlock = states.HypnoState.Active;
		let sleepBlock = states.SleepState.Active;
		return immersive && (hypnoBlock || sleepBlock);
	}

	get restrainedBlock(): boolean {
		return Player.IsRestrained() && Player.LSCG.GlobalModule.blockSettingsWhileRestrained;
	}

	constructor(module: GUI) {
		super(module);

		this.subscreens = module.subscreens;
		this.resetSubscreen = new GuiReset(getModule<CoreModule>("CoreModule"));
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
		DrawText(`- Little Sera's Club Games ${LSCG_VERSION} -`, GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
		
		if (!this.immersiveBlock && !this.restrainedBlock) {
			MainCanvas.textAlign = "center";
			let i = 0;
			for (const screen of this.subscreens) {
				const PX = Math.floor(i / 6);
				const PY = i % 6;

				const isDisabled = !screen.enabled;

				// Skip disabled screens for the time being
				if (screen.name == "MainMenu" || screen.hidden) continue;

				DrawButton(150 + 480 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", "", isDisabled ? "Setting is deactivated" : "", isDisabled);
				DrawImageResize(screen.icon, 150 + 480 * PX + 10, 190 + 120 * PY + 10, 70, 70);
				MainCanvas.textAlign = "left";
				DrawTextFit(screen.name, 250 + 480 * PX, 235 + 120 * PY, 340, "Black");
				MainCanvas.textAlign = "center";

				i++;
			}
		} else if (this.restrainedBlock) {
			DrawText("Settings disabled while restrained", 150, 190, "Black", "Gray");
		} else if (this.immersiveBlock) {
			DrawText("Settings disabled while incapacitated and immersive", 150, 190, "Black", "Gray");
		}

		MainCanvas.textAlign = "left";
		DrawButton(1500, 520, 400, 80, "", "#ffc9c9", "", "Emergency reset of LSCG");		
		DrawImageResize("Icons/ServiceBell.png", 1510, 530, 60, 60);
        DrawTextFit("Reset", 1580, 560, 320, "Black");

		DrawButton(1500, 620, 190, 80, "", "White", "", "Export LSCG Settings");		
		//DrawImageResize("Icons/Preference.png", 1510, 630, 60, 60);
        DrawTextFit("Export", 1540, 660, 190, "Black");
		DrawButton(1710, 620, 190, 80, "", "White", "", "Import LSCG Settings");		
		//DrawImageResize("Icons/Preference.png", 1510, 630, 60, 60);
        DrawTextFit("Import", 1750, 660, 190, "Black");

		DrawButton(1500, 720, 400, 80, "", "White", "", "Open LSCG Latest Release on Github.", false);
		DrawImageResize("Icons/Changelog.png", 1510, 730, 60, 60);
        DrawTextFit("Latest Changes", 1580, 760, 320, "Black");

		DrawButton(1500, 820, 400, 80, "", "White", "", this.help.label, false);
		DrawImageResize("Icons/Introduction.png", 1510, 830, 60, 60);
        DrawTextFit("Open Help", 1580, 860, 320, "Black");

		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		if (!this.immersiveBlock && !this.restrainedBlock) {
			let i = 0
			for (const screen of this.subscreens) {
				const PX = Math.floor(i / 6);
				const PY = i % 6;

				if (screen.name == "MainMenu" || screen.hidden) continue;

				if (MouseIn(150 + 480 * PX, 190 + 120 * PY, 450, 90) && screen.enabled) {
					this.setSubscreen(screen);
					return;
				}

				i++;
			}
		}

		if (MouseIn(1500, 520, 400, 80))
            this.setSubscreen(this.resetSubscreen);

		if (MouseIn(1500, 620, 190, 80)) {
			let compressed = ExportSettings();
			navigator.clipboard.writeText(compressed);
			alert(`LSCG settings copied to clipboard.`);
		}

		if (MouseIn(1710, 620, 190, 80)) {
			if (confirm("Importing settings will overwrite existing settings. \nAre you sure?")) {
				setTimeout(() => {
						let compressed = window.prompt("LSCG Export String:");
						if (!compressed)
							return;
						if (ImportSettings(compressed))
							alert(`LSCG settings Imported from clipboard.`);
						else
							alert(`Failed to import LSCG settings from clipboard.`);
				}, 500);
			}
		}

		if (MouseIn(1500, 720, 400, 80))
            window.open(LSCG_CHANGES, '_blank');

		if (MouseIn(1500, 820, 400, 80))
            window.open('https://github.com/littlesera/LSCG/wiki', '_blank');
	}

	Exit(): void {
		this.setSubscreen(null);
		ChatRoomCharacter.forEach(c => CharacterLoadCanvas(c));
    	PreferenceSubscreenExtensionsClear();
	}
}