import { GuiBoops } from "./boops";
import { GuiCollar } from "./collar";
import { GuiGlobal } from "./global";
import { GuiHypno } from "./hypno";
import { GuiLipstick } from "./lipstick";
import { GuiSubscreen, setSubscreen } from "./settingUtils";
import { ModuleCategory, SETTING_ICONS, SETTING_NAMES } from "./setting_definitions";

const MAIN_MENU_ITEMS: { module: ModuleCategory; onclick: (C: PlayerCharacter) => void; }[] = [
	{
		module: ModuleCategory.Global,
		onclick: (C) => {
			setSubscreen(new GuiGlobal(C));
		}
	},
	{
		module: ModuleCategory.Collar,
		onclick: (C) => {
			setSubscreen(new GuiCollar(C));
		}
	},
	{
		module: ModuleCategory.Hypno,
		onclick: (C) => {
			setSubscreen(new GuiHypno(C));
		}
	},
	{
		module: ModuleCategory.Boops,
		onclick: (C) => {
			setSubscreen(new GuiBoops(C));
		}
	},
	{
		module: ModuleCategory.Lipstick,
		onclick: (C) => {
			setSubscreen(new GuiLipstick(C));
		}
	}
];

export class MainMenu extends GuiSubscreen {
    readonly character : PlayerCharacter;

	constructor(C: PlayerCharacter) {
		super();
        this.character = C;
	}

	Load() {
		
	}

	onChange(source: number) {
		if (source === this.character.MemberNumber) {
			this.Load();
		}
	}

	Run() {
		DrawText("- Club Games -", 125, 125, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");

		for (let i = 0; i < MAIN_MENU_ITEMS.length; i++) {
			const e = MAIN_MENU_ITEMS[i];
			const PX = Math.floor(i / 6);
			const PY = i % 6;

			const isDisabled = e.module == ModuleCategory.Collar && this.character.MemberNumber != 74298 // DISABLE CHOKE COLLAR FOR NON-SERA PLAYERS...

			DrawButton(150 + 430 * PX, 190 + 120 * PY, 400, 90, "", isDisabled ? "#ddd" : "White", SETTING_ICONS[e.module],
				isDisabled ? "Setting is deactivated" : "", isDisabled);
			DrawTextFit(SETTING_NAMES[e.module], 250 + 430 * PX, 235 + 120 * PY, 310, "Black");
		}

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

		for (let i = 0; i < MAIN_MENU_ITEMS.length; i++) {
			const e = MAIN_MENU_ITEMS[i];
			const PX = Math.floor(i / 6);
			const PY = i % 6;
            const isDisabled = e.module == ModuleCategory.Collar && this.character.MemberNumber != 74298 // DISABLE CHOKE COLLAR FOR NON-SERA PLAYERS...
			if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 400, 90) && !isDisabled) {
				return e.onclick(this.character);
			}
		}
	}
}