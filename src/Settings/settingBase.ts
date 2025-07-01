import { ICONS, mouseTooltip, settingsSave } from "utils";
import { BaseSettingsModel } from "./Models/base";
import { SETTING_FUNC_NAMES, SETTING_FUNC_PREFIX, SETTING_NAME_PREFIX, setSubscreen } from "./setting_definitions";
import { BaseModule } from "base";
import { drawTooltip, GUI } from "./settingUtils";
import { clamp } from "lodash-es";

export interface Setting {
	type: "checkbox" | "text" | "number" | "label" | "dropdown" | "range";
	id: string;
	disabled: boolean;
	hidden: boolean;
	label: string;
	description: string;
	options: string[];
	overrideWidth: number;
	setting(): any;
	setSetting(val: any): void;
	range?: {
		init?: number;
		min?: number;
		max?: number;
		step?: number;
		thumb?: ThumbIcon;
		vertical?: boolean;
	}
}

export interface HelpInfo { 
	label: string, 
	link: string 
}

export abstract class GuiSubscreen {
    static START_X: number = 180;
    static START_Y: number = 205;
    static X_MOD: number = 950;
	static Y_MOD: number = 75;
	readonly module: BaseModule;

	constructor(module: BaseModule) {
		this.module = module;
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

	get help(): HelpInfo {
		return {
			label: 'Open LSCG Wiki on GitHub',
			link: 'https://github.com/littlesera/LSCG/wiki'
		}
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
					if (["text", "number", "range", "dropdown"].includes(setting.type)) {
						this.ElementHide(setting.id);
						if (setting.type == "range")
							this.ElementHide(setting.id + "_numeric");
					}
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
				case "range":
					let min = item.range?.min ?? 0;
					let max = item.range?.max ?? 100;
					let init = clamp(item.setting() ?? 0, min, max);
					let slider = ElementCreateRangeInput(item.id, init, min, max, Math.max(item.range?.step ?? 1, 1), item.range?.thumb, item.range?.vertical);
					let text = ElementCreateInput(item.id + "_numeric", "number", item.setting());
					slider.addEventListener("input", () => { 
						this.ElementSetValue(text.id, ElementValue(slider.id)); 
						item.setSetting(ElementValue(slider.id));
					});
					text.addEventListener("input", () => {
						this.ElementSetValue(slider.id, ElementValue(text.id)); 
						item.setSetting(ElementValue(slider.id));
					});
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
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "Main Menu");
		
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
				case "range":
				case "text":
				case "number":
				case "dropdown":
					this.ItemPosition(item, ix);
					break;
				case "label":
					if (!item.hidden) this.DrawLabel(item.label, item.description, ix, item.hidden, item.overrideWidth);
					break;
			}
		});
		
		DrawButton(1815, 820, 90, 90, "", "White", "Icons/Introduction.png", this.help.label);

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

		if (MouseIn(1500, 820, 400, 80))
            window.open(this.help.link, '_blank');
	}

	Exit() {
		this.multipageStructure.forEach(s => s.forEach(item => {
			switch (item.type) {
				case "range" :
					ElementRemove(item.id + "_numeric");
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

	ItemPosition(item: Setting, ix: number) {
		let yOffset = 0;
		if (item.type == "range") {
			yOffset = 15;
			let hide = item.disabled || item.hidden;
			ElementPosition(item.id + "_numeric", this.getXPos(ix) + 750 + (item.overrideWidth ?? 300) + 20, hide ? 9999 : this.getYPos(ix), 200);
		}
		this.ElementPosition(item.id, item.label, item.description, ix, item.disabled, item.hidden, item.overrideWidth, yOffset);
	}

	ElementPosition(elementId: string, label: string, description: string, order: number, disabled: boolean = false, hidden: boolean = false, overrideWidth: number | undefined = undefined, yOffset: number = 0) {
		var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64) && !hidden;
		if (!hidden)
			DrawTextFit(label, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
		let xPos = this.getXPos(order) + 750;
		if (!!overrideWidth)
			xPos += (overrideWidth - 300) / 2;
		ElementPosition(elementId, xPos, hidden ? 9999 : this.getYPos(order) + yOffset, overrideWidth ?? 300);
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