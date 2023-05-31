import { ICONS, settingsSave } from "utils";
import { BaseSettingsModel } from "./Models/base";
import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX, SETTING_NAME_PREFIX, setSubscreen } from "./setting_definitions";
import { BaseModule } from "base";
import { drawTooltip, GUI } from "./settingUtils";

export interface Setting {
	type: string;
	id: string;
	label: string;
	description: string;
	setting(): any;
	setSetting(val: any): void;
}

export abstract class GuiSubscreen {
    static START_X: number = 220;
    static START_Y: number = 120;
    static Y_MOD: number = 75;
	readonly module: BaseModule;

	constructor(module: BaseModule) {
		this.module = module;

		// create each handler for a new preference subscreen
		SETTING_FUNC_NAMES.forEach(name => {
			const fName = SETTING_FUNC_PREFIX + SETTING_NAME_PREFIX + this.name + name;
			if (typeof (<any>this)[name] === "function" && typeof (<any>window)[fName] !== "function")
				(<any>window)[fName] = () => {
					(<any>this)[name]();
				};
		});
	}

	get name(): string {
		return "UNKNOWN";
	}

	get icon(): string {
		return ICONS.BOUND_GIRL;
	}

	get label(): string {
		return "UNDEFINED SETTING SCREEN"
	}

	get hidden(): boolean {
		return false;
	}

	get enabled(): boolean {
		return true;
	}

	get message(): string {
		return PreferenceMessage;
	}

	set message(s: string) {
		PreferenceMessage = s;
	}

    get SubscreenName(): string {
        return SETTING_NAME_PREFIX + this.constructor.name;  
    }

	setSubscreen(screen: GuiSubscreen | string | null) {
		return setSubscreen(screen);
	}

	get settings(): BaseSettingsModel {
		return this.module.settings as BaseSettingsModel;
	}

	get structure(): Setting[] {
		return [];
	}

	get character(): Character {
		// Because we're initialized by that instance, it must already exist
		return GUI.instance?.currentCharacter as Character;
	}

    getYPos(ix: number) {
        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * ix);
    }

	Load() {
        this.structure.forEach(item => {
			switch (item.type) {
				case "text":
					ElementCreateInput(item.id, "text", item.setting(), "255");
					break;
				case "number":
					ElementCreateInput(item.id, "number", item.setting(), "255");
					break;			
			}
		});
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG " + this.name + " -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");

		this.structure.forEach((item, ix, arr) => {
			switch(item.type) {
				case "checkbox":
					this.DrawCheckbox(item.label, item.description, item.setting(), ix + 1);
					break;
				case "text":
				case "number":
					this.ElementPosition(item.id, item.label, item.description, ix + 1);
					break;
			}
		});
		
		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();

		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "checkbox":
					if (MouseIn(GuiSubscreen.START_X + 600, this.getYPos(ix + 1) - 32, 64, 64)){
						item.setSetting(!item.setting());
					}
					break;
			}
		});
	}

	Exit() {
		this.structure.forEach(item => {
			switch (item.type) {
				case "number":
					if (!CommonIsNumeric(ElementValue(item.id))) {
						ElementRemove(item.id);
						break;
					}
				case "text":
					item.setSetting(ElementValue(item.id));
					ElementRemove(item.id);
					break;
			}
		});

		setSubscreen("MainMenu");
		settingsSave();
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}

	Tooltip(text: string) {
		drawTooltip(300,
			850,
			1400,
			text,
			"left");
	}

	DrawCheckbox(label: string, description: string, value: boolean, order: number) {
		var isHovering = MouseIn(GuiSubscreen.START_X, this.getYPos(order) - 32, 600, 64);
		DrawText(label, GuiSubscreen.START_X, this.getYPos(order), isHovering ? "Red" : "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(order) - 32, 64, 64, "", value ?? false);
		if (isHovering) this.Tooltip(description);
	}

	ElementPosition(elementId: string, label: string, description: string, order: number) {
		var isHovering = MouseIn(GuiSubscreen.START_X, this.getYPos(order) - 32, 600, 64);
		DrawText(label, GuiSubscreen.START_X, this.getYPos(order), isHovering ? "Red" : "Black", "Gray");
		ElementPosition(elementId, GuiSubscreen.START_X + 900, this.getYPos(order), 600);
		if (isHovering) this.Tooltip(description);
	}
}