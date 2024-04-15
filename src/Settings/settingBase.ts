import { ICONS, settingsSave } from "utils";
import { BaseSettingsModel } from "./Models/base";
import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX, SETTING_NAME_PREFIX, setSubscreen } from "./setting_definitions";
import { BaseModule } from "base";
import { drawTooltip, GUI } from "./settingUtils";

export interface Setting {
	type: "checkbox" | "text" | "number" | "label" | "dropdown";
	id: string;
	disabled: boolean;
	hidden: boolean;
	label: string;
	description: string;
	options: string[];
	overrideWidth: number;
	setting(): any;
	setSetting(val: any): void;
}

export abstract class GuiSubscreen {
    static START_X: number = 180;
    static START_Y: number = 205;
    static X_MOD: number = 950;
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

	get disabledReason(): string {
		return "Setting is unavailable."
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

	get multipageStructure(): Setting[][] {
		return [[]];
	}

	get structure(): Setting[] {
		return this.multipageStructure[Math.min(PreferencePageCurrent-1, this.multipageStructure.length-1)];
	}

	get character(): Character {
		// Because we're initialized by that instance, it must already exist
		return GUI.instance?.currentCharacter as Character;
	}

    getYPos(ix: number) {
        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * (ix % 9));
    }

	getXPos(ix: number) {
		return GuiSubscreen.START_X + (GuiSubscreen.X_MOD * Math.floor(ix / 9));
	}

	getNarrowYPos(row: number) {
		return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * row);
    }

	getNarrowXPos(col: number) {
		return GuiSubscreen.START_X + (600 * col);
	}

	HideElements() {
		this.multipageStructure.forEach((s, ix, arr) => {
			if (ix != (PreferencePageCurrent-1)) {
				s.forEach(setting => {
					if (setting.type == "text" || setting.type == "number" || setting.type == "dropdown")
						this.ElementHide(setting.id);
				})
			}
		})
	}

	Load() {
		this.multipageStructure.forEach(s => s.forEach(item => {
			switch (item.type) {
				case "text":
					ElementCreateInput(item.id, "text", item.setting(), "255");
					break;
				case "number":
					ElementCreateInput(item.id, "number", item.setting(), "255");
					break;	
				case "dropdown":
					ElementCreateDropdown(item.id, item.options, () => item.setSetting(ElementValue(item.id)));
					this.ElementSetValue(item.id, item.setting());
					break;
			}
		}));
	}

	Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG " + this.name + " -", GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");
		if (this.multipageStructure.length > 1) {
			MainCanvas.textAlign = "center";
			PreferencePageChangeDraw(1595, 75, this.multipageStructure.length);
			MainCanvas.textAlign = "left";
		}

		this.HideElements();

		this.structure.forEach((item, ix, arr) => {
			switch(item.type) {
				case "checkbox":
					this.DrawCheckbox(item.label, item.description, item.setting(), ix, item.disabled, item.hidden);
					break;
				case "text":
				case "number":
				case "dropdown":
					this.ElementPosition(item.id, item.label, item.description, ix, item.disabled, item.hidden, item.overrideWidth);
					break;
				case "label":
					if (!item.hidden) this.DrawLabel(item.label, item.description, ix, item.hidden, item.overrideWidth);
					break;
			}
		});
		
		MainCanvas.textAlign = prev;
	}

	Click() {
		if (MouseIn(1815, 75, 90, 90)) return this.Exit();
		if (this.multipageStructure.length > 1)
			PreferencePageChangeClick(1595, 75, this.multipageStructure.length);

		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "checkbox":
					if (MouseIn(this.getXPos(ix) + 600, this.getYPos(ix) - 32, 64, 64) && !item.disabled){
						item.setSetting(!item.setting());
					}
					break;
			}
		});
	}

	Exit() {
		this.multipageStructure.forEach(s => s.forEach(item => {
			switch (item.type) {
				case "number":
					if (!CommonIsNumeric(ElementValue(item.id))) {
						ElementRemove(item.id);
						break;
					}
				case "text":
				case "dropdown":
					item.setSetting(ElementValue(item.id));
					ElementRemove(item.id);
					break;
			}
		}));

		setSubscreen("MainMenu");
		settingsSave(true);
	}

	Unload() {
		// Empty
	}

	onChange(source: number) {
		// Empty
	}

	Tooltip(text: string) {
		if (!!text)
			drawTooltip(300,
				850,
				1400,
				text,
				"left");
	}

	DrawCheckboxNarrow(label: string, description: string, value: boolean, row: number, column: number, disabled: boolean = false, hidden: boolean = false) {
		let x = this.getNarrowXPos(column);
		let y = this.getNarrowYPos(row);
		let width = 400;
		var isHovering = MouseIn(x, y - 32, width, 64) && !hidden;
		DrawTextFit(label, x, y, width, isHovering ? "Red" : "Black", "Gray");
		DrawCheckbox(x + width, y - 32, 64, 64, "", value ?? false, disabled);
		if (isHovering) this.Tooltip(description);
	}

	DrawCheckbox(label: string, description: string, value: boolean, order: number, disabled: boolean = false, hidden: boolean = false) {
		var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64) && !hidden;
		if (!hidden) {
			DrawCheckbox(this.getXPos(order) + 600, this.getYPos(order) - 32, 64, 64, "", value ?? false, disabled);
			DrawTextFit(label, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
		}
		if (isHovering) this.Tooltip(description);
	}

	DrawCheckboxAbsolute(label: string, description: string, value: boolean, coords: {x: number, y: number, w?: number}, disabled: boolean = false, hidden: boolean = false) {
		let x = coords.x;
		let y = coords.y;
		let width = coords.w ?? 400;
		var isHovering = MouseIn(x, y - 32, width + 64, 64) && !hidden;
		DrawTextFit(label, x, y, width, isHovering ? "Red" : "Black", "Gray");
		DrawCheckbox(x + width, y - 32, 64, 64, "", value ?? false, disabled);
		if (isHovering) this.Tooltip(description);
	}
	ClickCheckboxAbsolute(coords: {x: number, y: number, w?: number}, action: () => void) {
		let x = coords.x;
		let y = coords.y;
		let width = coords.w ?? 400;
		if (MouseIn(x + width, y - 32, 64, 64))
			action();
	}

	ElementHide(elementId: string) {
		ElementPosition(elementId, -999, -999, 1, 1);
	}

	ElementPosition(elementId: string, label: string, description: string, order: number, disabled: boolean = false, hidden: boolean = false, overrideWidth: number | undefined = undefined) {
		var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64) && !hidden;
		if (!hidden)
			DrawTextFit(label, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
		let xPos = this.getXPos(order) + 750;
		if (!!overrideWidth)
			xPos += (overrideWidth - 300) / 2;
		ElementPosition(elementId, xPos, hidden ? 9999 : this.getYPos(order), overrideWidth ?? 300);
		if (disabled)
			ElementSetAttribute(elementId, "disabled", "true");
		else{
			document.getElementById(elementId)?.removeAttribute("disabled");
		}
		if (isHovering) this.Tooltip(description);
	}

	ElementSetValue(elementId: string, value: any) {
		let element = document.getElementById(elementId) as HTMLInputElement;
		if (!!element && value != null)
			element.value = value;
		if (element.localName == "div") { // Top of dropdown
			let displayDiv = (element as Element).childNodes[1];
			if (!!displayDiv)
				displayDiv.textContent = value;
		}
	}

	DrawLabel(name: string, description: string, order: number, hidden: boolean = false, overrideWidth: number | undefined = undefined) {
		var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64) && !hidden;
		DrawTextFit(name, this.getXPos(order), this.getYPos(order), overrideWidth ?? 600, isHovering ? "Red" : "Black", "Gray");
		if (isHovering) this.Tooltip(description);
	}

	GetNewIndexFromNextPrevClick(midpoint: number, currentIndex: number, listLength: number): number {
		if (MouseX <= midpoint) 
			return (listLength + currentIndex - 1) % listLength;
		else 
			return (currentIndex + 1) % listLength;
	}
}