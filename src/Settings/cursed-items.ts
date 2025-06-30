import { getModule } from "modules";
import { ICONS } from "utils";
import { GuiSubscreen, Setting } from "./settingBase";
import { SpreadingOutfitModule } from "Modules/spreading-outfit";
import { RedressedState } from "Modules/States/RedressedState";
import { CursedItemModel, SpreadingOutfitSettingsModel } from "./Models/spreading-outfit";
import { stringIsCompressedItemBundleArray } from "utils";

export const CURSED_ITEM_LIMIT: number = 100;

export class GuiCursedItems extends GuiSubscreen {

	get name(): string {
		return "Cursed Items";
	}

	get icon(): string {
		return ICONS.LEASH;
	}

	get settings(): SpreadingOutfitSettingsModel {
        return super.settings as SpreadingOutfitSettingsModel;
    }

	get multipageStructure(): Setting[][] {
		return [
			[
				<Setting>{
					type: "checkbox",
					label: "Enable Cursed Items:",
					description: "Enable Cursed Items.",
					setting: () => this.settings.enabled ?? false,
					setSetting: (val) => this.settings.enabled = val
				},<Setting>{
					type: "checkbox",
					label: "Vulnerable:",
					description: "If checked, you are vulnerable to cursed items and susceptable to their effects when worn...",
					setting: () => this.settings.Vulnerable ?? false,
					setSetting: (val) => this.settings.Vulnerable = val,
					disabled: !this.settings.enabled
				},<Setting>{
					type: "label",
					label: "Allowed Crafter:",
					description: "Who's cursed items can can activate on you. (based on: Public < Friend < Whitelist < Lover < Owner)",
					disabled: !this.settings.enabled
				}
			], [
				<Setting>{
					type: "label",
					label: "Cursed Items",
					description: "Create a cursed item that can spread."
				},<Setting>{
					type: "text",
					label: "Cursed Item Name:",
					description: "Name of this Cursed Item.",
					id: "cursedItemName",
					setting: () => this.CursedItem?.Name ?? "",
					setSetting: (val) => { if (!!this.CursedItem) this.CursedItem.Name = val},
					hidden: !this.CursedItem,
					overrideWidth: 600
				},<Setting>{
					type: "checkbox",
					label: "Enabled:",
					description: "If checked, this cursed item is active and can spread.",
					setting: () => this.CursedItem?.Enabled ?? false,
					setSetting: (val) => !!this.CursedItem ? this.CursedItem.Enabled = val : false,
					hidden: !this.CursedItem
				},<Setting>{
					type: "text",
					id: "outfitKey",
					label: "Applied Outfit:",
					description: "Outfit name that will be applied by the cursed item.",
					hidden: !this.CursedItem,
					setting: () => this.CursedItem?.OutfitKey ?? "",
					setSetting: (val) => !!this.CursedItem ? this.CursedItem.OutfitKey = val : false,
					overrideWidth: 600
				},<Setting>{
					type: "checkbox",
					label: "Inexhaustable:",
					description: "If checked, this cursed item will continue to enforce its outfit until removed.",
					setting: () => this.CursedItem?.Inexhaustable ?? false,
					setSetting: (val) => !!this.CursedItem ? this.CursedItem.Inexhaustable = val : false,
					hidden: !this.CursedItem
				},<Setting>{
					type: "label",
					label: "Speed:",
					description: "Determines how fast the cursed item applies its outfit.",
					hidden: !this.CursedItem
				},<Setting>{
					type: "range",
					id: "cursedItem_customSpeed",
					label: "Custom Speed (seconds):",
					description: "Determines the speed (in seconds). Must be between 1 and 3600 (1 hour)",
					hidden: !this.CursedItem || this.CursedItem.Speed != 'custom',
					range: {
						init: this.CursedItem?.CustomSpeed,
						min: 1,
						max: 3600
					},
					overrideWidth: 800,
					setting: () => {
						if (!!this.CursedItem && !this.CursedItem.CustomSpeed){
							this.CursedItem.CustomSpeed = 300;
						} 
						return this.CursedItem?.CustomSpeed;
					},
					setSetting: (val) => !!this.CursedItem ? this.CursedItem.CustomSpeed = val : false
				}
			]
		]
	}

	get CursedItems(): CursedItemModel[] {
		return this.settings.CursedItems ?? [];
	}	
	CursedItemIndex: number = 0;
	get CursedItem(): CursedItemModel | undefined {
		if (!this.CursedItems)
			return undefined;
		if (this.CursedItemIndex < 0)
			this.CursedItemIndex = 0;
		if (this.CursedItemIndex >= this.CursedItems.length)
			this.CursedItemIndex = this.CursedItems.length - 1;
		return this.CursedItems[this.CursedItemIndex]
	}

	getAllowedToString(): string {
		switch (this.settings.Allowed) {
			case "Public":
				return "Everyone (except blacklisted)";
			case "Friend":
				return "Friends and above";
			case "Whitelist":
				return "Whitelisted and above";
			case "Lover":
				return "Lovers and above";
			case "Owner":
				return "Owners or Self";
			default:
				return "Self Only";
		}
	}

	clickAllow() {
		switch (this.settings.Allowed) {
			case "Public":
				this.settings.Allowed = "Friend";
				break;
			case "Friend":
				this.settings.Allowed = "Whitelist";
				break;
			case "Whitelist":
				this.settings.Allowed = "Lover";
				break;
			case "Lover":
				this.settings.Allowed = "Owner";
				break;
			case "Owner":
				this.settings.Allowed = "Self";
				break;
			default:
				this.settings.Allowed = "Public";
				break;
		}
	}

	getSpeedString(): string {
		if (!!this.CursedItem && !this.CursedItem.Speed) this.CursedItem.Speed = "medium";
		switch (this.CursedItem?.Speed) {
			case "slow":
				return "Slow";
			case "medium":
				return "Medium";
			case "fast":
				return "Fast";
			case "instant":
				return "Instant";
			case "custom":
			default:
				return "Custom (seconds)";
		}
	}

	#padNumber(input: number): string {
		return `${(input < 10) ? " " : ""}${input}`;
	}

	getSpeedLabel(): string {
		if (!this.CursedItem) return "";

		switch (this.CursedItem.Speed) {
			case "slow": return "0h 15m  0s";
			case "medium": return "0h  1m  0s";
			case "fast": return "0h  0m 10s";
			case "instant": return "";
			case "custom": 
				if (!this.CursedItem.CustomSpeed) return "";
				let seconds = this.CursedItem.CustomSpeed % 60;
				let minutes = Math.floor((this.CursedItem.CustomSpeed % (60 * 60)) / 60);
				let hours = Math.floor(this.CursedItem.CustomSpeed / (60 * 60));
				return `${hours}h ${this.#padNumber(minutes)}m ${this.#padNumber(seconds)}s`;
		}
	}

	clickSpeed() {
		if (!this.CursedItem) return;
		switch (this.CursedItem.Speed) {
			case "slow":
				this.CursedItem.Speed = "medium";
				break;
			case "medium":
				this.CursedItem.Speed = "fast";
				break;
			case "fast":
				this.CursedItem.Speed = "instant";
				break;
			case "instant":
				this.CursedItem.Speed = "custom";
				break;
			case "custom":
				this.CursedItem.Speed = "slow";
				break;
			default:
				this.CursedItem.Speed = "slow";
				break;
		}
	}

	Run() {
		super.Run();

		MainCanvas.textAlign = "center";
		if (PreferencePageCurrent == 1) {
			// Allowed remote button
			let allowButtonLabel = this.getAllowedToString();
			DrawButton(780, this.getYPos(2) - 32, 400, 64, allowButtonLabel, "White");
		}
		else if (PreferencePageCurrent == 2) {
			MainCanvas.textAlign = "center";

				if (!!this.CursedItem && !ElementValue("cursedItemName")) {
					DrawText("*", 1400, this.getYPos(1)+10, "Red", "Black");
					if (MouseHovering(1410-32, this.getYPos(1)-16, 64, 64))
						this.Tooltip("Trigger phrase required");
				}

				if (this.CursedItems.length > 0 && !!this.CursedItem) {
					DrawBackNextButton(550, this.getYPos(0)-32, 600, 64, this.CursedItem.Name, "White", "", () => "Previous", () => "Next");
					DrawButton(1180 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.CursedItem.Name}`); // Delete Current Button
					DrawImageResize("Icons/Trash.png", 1180, this.getYPos(0) - 32, 64, 64);
				}
				else {
					DrawTextFit("No Cursed Items Yet...", 780, this.getYPos(0), 600, "#CBC3E3", "Black");
				}

				DrawButton(1340 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Create New Cursed Item`); // Add New Suggestion
				DrawImageResize("Icons/Plus.png", 1340, this.getYPos(0) - 32, 64, 64);

			if (!!this.CursedItem) {
				DrawButton(780, this.getYPos(5) - 32, 400, 64, this.getSpeedString(), "White");
				MainCanvas.textAlign = "left";
				DrawTextFit(this.getSpeedLabel(), 1200, this.getYPos(5), 400, "Black", "White");
				MainCanvas.textAlign = "center";
			}
		}
	}

	Click(): void {
		super.Click();

		if (PreferencePageCurrent == 1) {
			// Allowed remote button
			if (MouseIn(780, this.getYPos(2)-32, 400, 64)){
				this.clickAllow();
			}
		}
		else if (PreferencePageCurrent == 2) {
			if (MouseIn(550, this.getYPos(0) - 32, 600, 64)) {
				// Change Suggestion
				this.saveItem();
				this.CursedItemIndex = this.GetNewIndexFromNextPrevClick(850, this.CursedItemIndex, this.CursedItems.length);
				this.loadItem();
			}
			else if (MouseIn(1180, this.getYPos(0) - 32, 64, 64) && this.CursedItems.length > 0) {
				// Remove Suggestion
				let removed = this.CursedItems.splice(this.CursedItemIndex, 1);
				if (this.CursedItemIndex >= this.CursedItems.length)
					this.CursedItemIndex = this.CursedItems.length - 1;
				this.loadItem();
			} else if (MouseIn(1340, this.getYPos(0) - 32, 64, 64) && this.CursedItems.length < CURSED_ITEM_LIMIT) {
				// New Suggestion
				if (!!this.CursedItem)
					this.saveItem();
				this.CursedItems.push(<CursedItemModel>{Name: `Cursed Item No. ${this.CursedItems.length+1}`});
				this.CursedItemIndex = this.CursedItems.length - 1;
				this.loadItem();
			}

			if (MouseIn(780, this.getYPos(5)-32, 400, 64)){
				this.clickSpeed();
			}
		}
	}

	saveItem() {
		// Save all current text field values
		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "number":
				case "text":
				case "dropdown":
					if (!!ElementValue(item.id))
						item.setSetting(ElementValue(item.id));
					break;
			}
		});
	}

	loadItem() {
		// Load new text element values
		this.structure.forEach((item, ix, arr) => {
			switch (item.type) {
				case "number":
				case "text":
				case "dropdown":
					this.ElementSetValue(item.id, item.setting());
					break;
			}
		});
	}
}