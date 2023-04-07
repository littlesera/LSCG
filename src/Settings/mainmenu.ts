
import { GuiBoops, GuiCollar, GuiGlobal, GuiHypno, GuiLipstick } from "./all";
import { GuiSubscreen } from "./settingBase";
import { ModuleCategory, SETTING_ICONS, SETTING_NAMES } from "./setting_definitions";

export class MenuItem {
	module: ModuleCategory = ModuleCategory.Misc;
	private _setting: GuiSubscreen | null = null;
	get setting(): GuiSubscreen {
		return this._setting ?? this.settingCreate();
	};
	settingCreate: () => GuiSubscreen = () => new MainMenu(Player);
	constructor(m: ModuleCategory, s: () => GuiSubscreen) {
		this.module = m;
		this.settingCreate = s;
	}
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
	new MenuItem(ModuleCategory.Global, () => new GuiGlobal(Player)),
	new MenuItem(ModuleCategory.Collar, () => new GuiCollar(Player)),
	new MenuItem(ModuleCategory.Hypno, () => new GuiHypno(Player)),
	new MenuItem(ModuleCategory.Boops, () => new GuiBoops(Player)),
	new MenuItem(ModuleCategory.Lipstick, () => new GuiLipstick(Player))
];

export class MainMenu extends GuiSubscreen {
    readonly character : PlayerCharacter;

	constructor(C: PlayerCharacter) {
		super();
        this.character = C;
	}

	onChange(source: number) {
		if (source === this.character.MemberNumber) {
			this.Load();
		}
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";
		DrawText("- Little Sera's Club Games -", GuiSubscreen.START_X, GuiSubscreen.START_Y, "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
		MainCanvas.textAlign = "center";
		
		for (let i = 0; i < MAIN_MENU_ITEMS.length; i++) {
			const e = MAIN_MENU_ITEMS[i];
			const PX = Math.floor(i / 6);
			const PY = i % 6;

			const isDisabled = e.module == ModuleCategory.Collar && this.character.MemberNumber != 74298 // DISABLE CHOKE COLLAR FOR NON-SERA PLAYERS...

			DrawButton(150 + 430 * PX, 190 + 120 * PY, 400, 90, "", isDisabled ? "#ddd" : "White", SETTING_ICONS[e.module],
				isDisabled ? "Setting is deactivated" : "", isDisabled);
			DrawTextFit(SETTING_NAMES[e.module], 380 + 430 * PX, 235 + 120 * PY, 310, "Black");
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

		for (let i = 0; i < MAIN_MENU_ITEMS.length; i++) {
			const e = MAIN_MENU_ITEMS[i];
			const PX = Math.floor(i / 6);
			const PY = i % 6;
            const isDisabled = e.module == ModuleCategory.Collar && this.character.MemberNumber != 74298 // DISABLE CHOKE COLLAR FOR NON-SERA PLAYERS...
			if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 400, 90) && !isDisabled) {
				return CommonDynamicFunction("PreferenceSubscreenLSCG" + e.setting.constructor.name + "Load()");
			}
		}
	}

	Exit(): void {
		PreferenceMessage = "";
		PreferenceSubscreen = "";
	}
}