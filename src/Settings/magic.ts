import { GuiSubscreen, Setting } from "./settingBase";
import { LSCGSpellEffect, MagicSettingsModel, SpellDefinition } from "./Models/magic";

export class GuiMagic extends GuiSubscreen {

	get name(): string {
		return "Magic & Potions";
	}

	get icon(): string {
		return "Icons/Magic.png";
	}

	get settings(): MagicSettingsModel {
		return super.settings as MagicSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		if (!this.settings.enabled)
			return [[]];
		else
			return [[
				<Setting>{
					type: "checkbox",
					label: "Enabled:",
					description: "Enabled the use and application of Magic(tm).",
					setting: () => this.settings.enabled ?? false,
					setSetting: (val) => this.settings.enabled = val
				}, <Setting>{
					type: "label",
					label: "Blocked Effects:",
					description: "Toggle which spell effects you want to block on yourself."
				}, <Setting>{
					type: "label", // Blank Spot
					label: "",
					description: ""
				}], [
					<Setting>{
						type: "label",
						label: "Spell Crafting",
						description: "Create your arcane sorceries and potions."
					},<Setting>{
						type: "text",
						label: "Spell Name:",
						description: "Name of your powerful spell",
						id: "spellName",
						setting: () => this.Spell?.Name ?? "",
						setSetting: (val) => { if (!!this.Spell) this.Spell.Name = val},
						hidden: !this.Spell
					},<Setting>{
						type: "checkbox",
						label: "Allow Potion:",
						description: "Allows this spell to be brewed into a crafted potion bottle using its name.",
						setting: () => this.Spell?.AllowPotion ?? false,
						setSetting: (val) => { if (!!this.Spell) this.Spell.AllowPotion = val},
						hidden: !this.Spell
					},<Setting>{
						type: "label",
						id: "effect1",
						label: "Effect #1:",
						description: "An effect the spell has.",
						options: this.Effects,
						setting: () => this.Spell?.Effects.length > 0 ? (this.Spell?.Effects[0] ?? "None") : "None",
						setSetting: (val) => { if (!!this.Spell) this.Spell.Effects = this.Spell.Effects.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
					},<Setting>{
						type: "label", // Blank Spot
						label: "",
						description: ""
					},<Setting>{
						type: "label",
						id: "effect2",
						label: "Effect #2:",
						description: "An effect the spell has.",
						options: this.Effects,
						setting: () => this.Spell?.Effects.length > 1 ? (this.Spell?.Effects[1] ?? "None") : "None",
						setSetting: (val) => { if (!!this.Spell) this.Spell.Effects = this.Spell.Effects.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
					},<Setting>{
						type: "label", // Blank Spot
						label: "",
						description: ""
					},<Setting>{
						type: "label",
						id: "effect3",
						label: "Effect #3:",
						description: "An effect the spell has.",
						options: this.Effects,
						setting: () => this.Spell?.Effects.length > 2 ? (this.Spell?.Effects[2] ?? "None") : "None",
						setSetting: (val) => { if (!!this.Spell) this.Spell.Effects = this.Spell.Effects.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
					},<Setting>{
						type: "label", // Blank Spot
						label: "",
						description: ""
					}
				]];
	}

	blinkLastTime = 0;
	blinkColor = "Pink";
    Run() {
		super.Run();

		DrawTextFit(`${MouseX}, ${MouseY}`, MouseX, MouseY, 200, "Black");

		var prev = MainCanvas.textAlign;
		if (!this.settings.enabled) {
			MainCanvas.textAlign = "center";
			if (this.blinkLastTime + 750 < CommonTime()) {
				this.blinkLastTime = CommonTime();
				this.blinkColor = this.blinkColor == "Pink" ? "Purple" : "Pink";
			}
			DrawText("Now available:", 1000, 200, "Black", "Black");
			DrawText("Magic (tm)!", 1000, 250, this.blinkColor, "Black");

			DrawText("Want to wow and amaze your friends and lovers?", 1000, 350, "Black", "Gray");
			DrawText("Are you looking to impress and punish your enemies?", 1000, 400, "Black", "Gray");
			DrawText("With just a simple signature you too can experience the thrill of Magic (tm)!", 1000, 450, "Black", "Gray");

			DrawText("- Reveal the ancient secrets of the arcane! -", 1000, 550, "Gray", "Black");
			DrawText("- Craft your own amazing potions! -", 1000, 600, "Gray", "Black");
			DrawText("- Share in your powers, or dont! -", 1000, 650, "Gray", "Black");				

			DrawButton(800, 740, 400, 80, "~Sign Here~", "White", undefined, "Apply signature to scroll");

			DrawTextFit("* Any sufficiently advanced technology is indistinguishable from magic *", 1000, 880, 600, "Gray", "Orange");
			DrawTextFit("* Signatory agrees to Magic(tm) 'installation' required to experience spell effects *", 1000, 900, 600, "Gray", "Orange");
		} else {
			if (PreferencePageCurrent == 1) {
				if (!this.settings.blockedSpellEffects)
				this.settings.blockedSpellEffects = [];
				let val = this.settings.blockedSpellEffects.indexOf(this.Effect) > -1;
				let blockedStr = val ? "Blocked" : "Allowed";
				DrawBackNextButton(780, this.getYPos(1)-32, 600, 64, this.Effect, "White", "", () => blockedStr, () => blockedStr);
				DrawCheckbox(780 + 600 + 64, this.getYPos(1) - 32, 64, 64, "", val);

				MainCanvas.textAlign = "left";
				DrawTextFit(this.SpellEffectDescription(this.Effect), 780, this.getYPos(2), 1000, "Black");
				MainCanvas.textAlign = "center";
			} else if (PreferencePageCurrent == 2) {
				if (this.settings.knownSpells.length > 0) {
					DrawBackNextButton(550, this.getYPos(0)-32, 600, 64, this.Spell.Name, "White", "", () => "Previous", () => "Next");
					DrawButton(1180 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Current
					DrawImageResize("Icons/Trash.png", 1180, this.getYPos(0) - 32, 64, 64);
				}
				DrawButton(1260 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Create new Spell`); // Add New Spell
				DrawImageResize("Icons/Plus.png", 1260, this.getYPos(0) - 32, 64, 64);

				// Draw Effect Pickers
				DrawBackNextButton(780, this.getYPos(3) - 32, 600, 64, this.Spell.Effects.length > 0 ? this.Spell.Effects[0] : LSCGSpellEffect.none, "White", "", () => "", () => "");
				if (this.Spell.Effects.length == 1) {
					DrawButton(1410 - 4, this.getYPos(3) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
					DrawImageResize("Icons/Trash.png", 1410, this.getYPos(3) - 32, 64, 64);
				}
				MainCanvas.textAlign = "left";
				DrawTextFit(this.SpellEffectDescription(this.Spell.Effects[0]), 780, this.getYPos(4), 1000, "Black");
				MainCanvas.textAlign = "center";
				if (this.Spell.Effects.length > 0) {
					DrawBackNextButton(780, this.getYPos(5) - 32, 600, 64, this.Spell.Effects[1] ?? LSCGSpellEffect.none, "White", "", () => "", () => "");
					if (this.Spell.Effects.length == 2) {
						DrawButton(1410 - 4, this.getYPos(5) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
						DrawImageResize("Icons/Trash.png", 1410, this.getYPos(5) - 32, 64, 64);
					}
					MainCanvas.textAlign = "left";
					DrawTextFit(this.SpellEffectDescription(this.Spell.Effects[1]), 780, this.getYPos(6), 1000, "Black");
					MainCanvas.textAlign = "center";
				}
				if (this.Spell.Effects.length > 1) {
					DrawBackNextButton(780, this.getYPos(7) - 32, 600, 64, this.Spell.Effects[2] ?? LSCGSpellEffect.none, "White", "", () => "", () => "");
					if (this.Spell.Effects.length > 2) {
						DrawButton(1410 - 4, this.getYPos(7) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
						DrawImageResize("Icons/Trash.png", 1410, this.getYPos(7) - 32, 64, 64);
					}
					MainCanvas.textAlign = "left";
					DrawTextFit(this.SpellEffectDescription(this.Spell.Effects[2]), 780, this.getYPos(8), 1000, "Black");
					MainCanvas.textAlign = "center";
				}
			}
		}
		MainCanvas.textAlign = prev;
	}

	Click(): void {
		super.Click();

		if (!this.settings.enabled) {
			if (MouseIn(800, 740, 400, 80)) {
				this.settings.enabled = true;
				DrawFlashScreen("Purple", 500, 1500);
			}
		} else {
			if (PreferencePageCurrent == 1) {
				if (MouseIn(550, this.getYPos(1)-32, 600, 64)) {
					if (MouseX <= 850) this.EffectIndex = (this.ActualEffects.length + this.EffectIndex - 1) % this.ActualEffects.length;
					else this.EffectIndex = (this.EffectIndex + 1) % this.ActualEffects.length;
				} else if (MouseIn(550 + 600 + 64, this.getYPos(1) - 32, 64, 64)) {
					if (this.settings.blockedSpellEffects.indexOf(this.Effect) > -1)
						this.settings.blockedSpellEffects = this.settings.blockedSpellEffects.filter(ef => ef != this.Effect);
					else this.settings.blockedSpellEffects.push(this.Effect);
				}
			} else if (PreferencePageCurrent == 2) {
				if (MouseIn(550, this.getYPos(0) - 32, 600, 64)) {
					// Save all current text field values
					this.structure.forEach((item, ix, arr) => {
						switch (item.type) {
							case "number":
							case "text":
							case "dropdown":
								item.setSetting(ElementValue(item.id));
								break;
						}
					});
					if (MouseX <= 850) this.SpellIndex = (this.settings.knownSpells.length + this.SpellIndex - 1) % this.settings.knownSpells.length;
					else this.SpellIndex = (this.SpellIndex + 1) % this.settings.knownSpells.length;
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
				else if (MouseIn(1180, this.getYPos(0) - 32, 64, 64)) {
					// Remove Spell
					this.settings.knownSpells.splice(this.SpellIndex, 1);
				} else if (MouseIn(1260, this.getYPos(0) - 32, 64, 64)) {
					this.settings.knownSpells.push(<SpellDefinition>{
						Name: "New Spell",
						Creator: Player.MemberNumber,
						Effects: [],
						AllowPotion: false
					})
				} else if (MouseIn(780, this.getYPos(3) - 32, 600, 64)) {
					if (MouseX <= 850) {
						if (this.Spell.Effects.length < 1) this.Spell.Effects = [this.ActualEffects[this.ActualEffects.length - 1]];
						else this.Spell.Effects[0] = this.ActualEffects[(this.ActualEffects.length + this.ActualEffects.indexOf(this.Spell.Effects[0]) - 1) % this.ActualEffects.length];
					}
					else {
						if (this.Spell.Effects.length < 1) this.Spell.Effects = [this.ActualEffects[0]];
						else this.Spell.Effects[0] = this.ActualEffects[(this.ActualEffects.indexOf(this.Spell.Effects[0]) + 1) % this.ActualEffects.length];
					}
				} else if (this.Spell.Effects.length < 2 && MouseIn(1410, this.getYPos(3) - 32, 64, 64)) {
					this.Spell.Effects.splice(0)
				} else if (MouseIn(780, this.getYPos(5) - 32, 600, 64)) {
					if (MouseX <= 850) {
						if (this.Spell.Effects.length < 2) this.Spell.Effects.push(this.ActualEffects[this.ActualEffects.length - 1]);
						else this.Spell.Effects[1] = this.ActualEffects[(this.ActualEffects.length + this.ActualEffects.indexOf(this.Spell.Effects[0]) - 1) % this.ActualEffects.length];
					}
					else {
						if (this.Spell.Effects.length < 2) this.Spell.Effects.push(this.ActualEffects[0]);
						else this.Spell.Effects[1] = this.ActualEffects[(this.ActualEffects.indexOf(this.Spell.Effects[0]) + 1) % this.ActualEffects.length];
					}
				} else if (this.Spell.Effects.length < 3 && MouseIn(1410, this.getYPos(5) - 32, 64, 64)) {
					this.Spell.Effects.splice(1)
				} else if (MouseIn(780, this.getYPos(7) - 32, 600, 64)) {
					if (MouseX <= 850) {
						if (this.Spell.Effects.length < 3) this.Spell.Effects.push(this.ActualEffects[this.ActualEffects.length - 1]);
						else this.Spell.Effects[2] = this.ActualEffects[(this.ActualEffects.length + this.ActualEffects.indexOf(this.Spell.Effects[0]) - 1) % this.ActualEffects.length];
					}
					else {
						if (this.Spell.Effects.length < 3) this.Spell.Effects.push(this.ActualEffects[0]);
						else this.Spell.Effects[2] = this.ActualEffects[(this.ActualEffects.indexOf(this.Spell.Effects[0]) + 1) % this.ActualEffects.length];
					}
				} else if (this.Spell.Effects.length < 4 && MouseIn(1410, this.getYPos(7) - 32, 64, 64)) {
					this.Spell.Effects.splice(2)
				} 
			}
		}
	}

	SpellIndex: number = 0;
	get Spell(): SpellDefinition {
		if (this.SpellIndex < 0)
			this.SpellIndex = 0;
		if (this.SpellIndex >= this.settings.knownSpells.length)
			this.SpellIndex = this.settings.knownSpells.length - 1;
		return this.settings.knownSpells[this.SpellIndex]
	}

	get Effect(): LSCGSpellEffect {
		return this.ActualEffects[this.EffectIndex];
	}
	get ActualEffects(): LSCGSpellEffect[] {
		return this.Effects.filter(e => e != LSCGSpellEffect.none);
	}
	get Effects(): LSCGSpellEffect[] {
		return Object.values(LSCGSpellEffect);
	}
	EffectIndex: number = 0;

	SpellEffectDescription(effect: LSCGSpellEffect): string {
		switch (effect) {
			case LSCGSpellEffect.none:
				return "";
			case LSCGSpellEffect.blindness:
				return "Prevents the target from seeing.";
			case LSCGSpellEffect.deafened:
				return "Prevents the target from hearing.";
			case LSCGSpellEffect.muted:
				return "Gags the target.";
			case LSCGSpellEffect.frozen:
				return "Petrifies the target.";
			case LSCGSpellEffect.horny:
				return "Arouses the target.";
			case LSCGSpellEffect.hypnotizing:
				return "Hypnotizes the target.";
			case LSCGSpellEffect.slumber:
				return "Induces a deep slumber in the target.";
			case LSCGSpellEffect.outfit:
				return "Magically change the target's clothing and equipment.";
			case LSCGSpellEffect.paired_arousal:
				return "Pair two targets, such that when one feels arousal the other also does.";
			case LSCGSpellEffect.orgasm_siphon:
				return "Redirect all of the target's orgasmic pleasure to another.";
			default:
				return "Some special effect..."			;
		}
	}
}