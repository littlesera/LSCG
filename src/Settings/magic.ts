import { GuiSubscreen, Setting } from "./settingBase";
import { KNOWN_SPELLS_LIMIT, LSCGSpellEffect, MagicSettingsModel, OutfitConfig, OutfitOption, PolymorphConfig, PolymorphOption, SpellDefinition } from "./Models/magic";
import { PairedBaseState } from "Modules/States/PairedBaseState";
import { stringIsCompressedItemBundleArray } from "utils";
import { PolymorphedState } from "Modules/States/PolymorphedState";
import { RedressedState } from "Modules/States/RedressedState";
import { drawTooltip } from "./settingUtils";

export const pairedSpellEffects = [
	LSCGSpellEffect.orgasm_siphon,
	LSCGSpellEffect.paired_arousal
];

export class GuiMagic extends GuiSubscreen {

	get name(): string {
		return "Magic™";
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
		else if (this.settings.locked)
			return [[
				<Setting>{
					type: "label",
					label: "** Magic™ Settings Locked **",
					description: "Magic™ Settings Locked Remotely"
				} 
			]]
		else
			return [[
				<Setting>{
					type: "checkbox",
					label: "Enabled:",
					description: "Enabled the use and application of Magic™.",
					setting: () => this.settings.enabled ?? false,
					setSetting: (val) => this.settings.enabled = val
				}, <Setting>{
					type: "checkbox",
					label: "Enable Wild Magic:",
					description: "Cast a random spell from your spell list, with a chance of a truly random spell.",
					setting: () => this.settings.enableWildMagic ?? false,
					setSetting: (val) => {
						this.settings.enableWildMagic = val
						if (!val) {
							this.settings.forceWildMagic = false;
							this.settings.trueWildMagic = false;
						}
					}
				}, <Setting>{
					type: "checkbox",
					label: "Force Wild Magic",
					description: "Prevent the ability to choose the spell you are casting.",
					disabled: !this.settings.enableWildMagic,
					setting: () => this.settings.forceWildMagic ?? false,
					setSetting: (val) => this.settings.forceWildMagic = val
				}, <Setting>{
					type: "checkbox",
					label: "True Wild Magic",
					description: "Generate a truly random spell whenever casting.",
					disabled: !this.settings.enableWildMagic,
					setting: () => this.settings.trueWildMagic ?? false,
					setSetting: (val) => this.settings.trueWildMagic = val
				}, <Setting>{
					type: "checkbox",
					label: "Prevent X-Ray Vision",
					description: "Lead-line all your clothing.",
					setting: () => this.settings.blockXRay ?? true,
					setSetting: (val) => this.settings.blockXRay = val
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
						description: "Allows this spell to be brewed into a crafted potion bottles/glasses/mugs using its name.",
						disabled: this.SpellHasPairedEffect,
						setting: () => this.SpellHasPairedEffect ? false : this.Spell?.AllowPotion ?? false,
						setSetting: (val) => { 
							if (this.SpellHasPairedEffect && !!this.Spell) this.Spell.AllowPotion = false;
							else if (!!this.Spell) this.Spell.AllowPotion = val;
						},
						hidden: !this.Spell
					},<Setting>{
						type: "label",
						id: "effect1",
						label: "Effect #1:",
						description: "An effect the spell has.",
						options: this.Effects,
						hidden: !this.Spell,
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
						hidden: !this.Spell,
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
						hidden: !this.Spell,
						setting: () => this.Spell?.Effects.length > 2 ? (this.Spell?.Effects[2] ?? "None") : "None",
						setSetting: (val) => { if (!!this.Spell) this.Spell.Effects = this.Spell.Effects.concat(val).filter((eff, ix, arr) => arr.indexOf(eff) == ix) },
					},<Setting>{
						type: "label", // Blank Spot
						label: "",
						description: ""
					}
				], [
					<Setting>{
						type: "checkbox",
						label: "Allow Remote Access:",
						description: "If checked, allowed users can modify these settings.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.remoteAccess ?? false,
						setSetting: (val) => this.settings.remoteAccess = val
					},<Setting>{
						type: "checkbox",
						label: "Lockable:",
						description: "If checked, allowed users can lock you out of these settings.",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.lockable ?? false,
						setSetting: (val) => this.settings.lockable = val
					},<Setting>{
						type: "checkbox",
						label: "Remote Access Requires Trance:",
						description: "If checked, remote access is only possible while actively hypnotized.",
						disabled: !this.settings.enabled || !this.settings.remoteAccess,
						setting: () => this.settings.remoteAccessRequiredTrance ?? true,
						setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
					},<Setting>{
						type: "checkbox",
						label: "Remote Access Limited to Hypnotizer:",
						description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
						disabled: !this.settings.enabled || !this.settings.remoteAccess || !this.settings.remoteAccessRequiredTrance,
						setting: () => this.settings.limitRemoteAccessToHypnotizer ?? true,
						setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
					},<Setting>{
						type: "text",
						id: "magic_remoteMembers",
						label: "Remote Allowed Member IDs:",
						description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
						disabled: !this.settings.enabled,
						setting: () => this.settings.remoteMemberIds ?? "",
						setSetting: (val) => this.settings.remoteMemberIds = val
					}, <Setting>{
						type: "checkbox",
						label: "Never Defend:",
						description: "If checked, you will never defend against spells cast on you.",
						setting: () => this.settings.neverDefend ?? false,
						setSetting: (val) => this.settings.neverDefend = val
					}, <Setting>{
						type: "text",
						id: "magic_neverDefendMembers",
						label: "Defenseless Against Member IDs:",
						description: "Comma separated list of member IDs. If empty will use standard Item Permissions. You will never defend against their spells.",
						disabled: this.settings.neverDefend,
						setting: () => this.settings.noDefenseMemberIds ?? "",
						setSetting: (val) => this.settings.noDefenseMemberIds = val
					}, <Setting>{
						type: "checkbox",
						label: "Limited Spell Duration:",
						description: "If checked, you will eventually break free from a detrimental spell's effects, the time variable based on how poorly you fail an activity roll against the caster.",
						setting: () => this.settings.limitedDuration ?? false,
						setSetting: (val) => this.settings.limitedDuration = val
					}, <Setting>{
						type: "number",
						id: "magic_maxDuration",
						label: "Maximum Spell Duration:",
						description: "Maximum amount of time, in minutes, you will be affected by any specific spell effects. Set to 0 for no maximum.",
						disabled: !this.settings.limitedDuration,
						setting: () => this.settings.maxDuration ?? 0,
						setSetting: (val) => this.settings.maxDuration = val
					}, <Setting>{
						type: "checkbox",
						label: "Allow Outfit Spell to Change Neck Items:",
						description: "If checked, outfit spell effects can modify and replace your neck items.",
						setting: () => this.settings.allowOutfitToChangeNeckItems ?? false,
						setSetting: (val) => this.settings.allowOutfitToChangeNeckItems = val
					}, <Setting>{
						type: "checkbox",
						label: "Allow Polymorph Spell to Change Genitals:",
						description: "If checked, polymorph spell effects can modify your genitals.",
						setting: () => this.settings.allowChangeGenitals ?? true,
						setSetting: (val) => this.settings.allowChangeGenitals = val
					}, <Setting>{
						type: "checkbox",
						label: "Allow Polymorph Spell to Change Pronouns:",
						description: "If checked, polymorph spell effects can modify your pronouns.",
						setting: () => this.settings.allowChangePronouns ?? true,
						setSetting: (val) => this.settings.allowChangePronouns = val
					}, <Setting>{
						type: "checkbox",
						label: "Require Whitelist:",
						description: "If checked, only people on your whitelist can cast spells on you or teach you spells.",
						setting: () => this.settings.requireWhitelist ?? false,
						setSetting: (val) => this.settings.requireWhitelist = val
					}
				]];
	}

	outfitFieldId: string = "magic_outfitPaste";
	outfitDropId: string = "magic_outfitDrop";
	Load(): void {
		super.Load();
		ElementCreateInput(this.outfitFieldId, "text", "", -1);
		ElementCreateDropdown(this.outfitDropId, Object.values(OutfitOption), (evt) => this.OutfitConfigDropChanged(evt));
	}

	outfitEffects: LSCGSpellEffect[] = [
		LSCGSpellEffect.outfit,
		LSCGSpellEffect.polymorph
	]

	blinkLastTime = 0;
	blinkColor = "Pink";
    Run() {
		if (!this.settings.locked && this._ConfigureOutfit) {
			this.multipageStructure.forEach((s, ix, arr) => {
				s.forEach(setting => {
					if (setting.type == "text" || setting.type == "number" || setting.type == "dropdown")
						this.ElementHide(setting.id);
				})
			})
			DrawRect(0, 0, 2000, 1000, "rgba(0,0,0,.5)");
			let coords = {x: 500, y: 400, w: 1000, h: 200};
			let buttonWidth = 150;
			DrawRect(coords.x, coords.y, coords.w, coords.h, "White");
			DrawEmptyRect(coords.x, coords.y, coords.w, coords.h, "Black", 5);
			DrawEmptyRect(coords.x+5, coords.y+5, coords.w-10, coords.h-10, "Grey", 2);
			MainCanvas.textAlign = "left";
			DrawTextFit("Paste Outfit Code:", coords.x + 50, (coords.y + coords.h/2) - 50, coords.w - 100 - buttonWidth, "Black", "Grey");
			MainCanvas.textAlign = "center";
			ElementPosition(this.outfitFieldId, coords.x + (coords.w/2) - (buttonWidth/2), (coords.y + coords.h/2) + 20, coords.w - 100 - buttonWidth);
			ElementPositionFix(this.outfitDropId, 28, coords.x + 450, (coords.y + coords.h / 2) - 50 - 19, 340, 64);
			DrawEmptyRect(coords.x + 445, (coords.y + coords.h / 2) - 48 - 32, 350, 68, "Black", 3);
			DrawButton(1350, 500 - 32, 100, 64, "Confirm", "White");
			return;
		} else if (!this.settings.locked && this._ConfigurePolymorph) {
			this.multipageStructure.forEach((s, ix, arr) => {
				s.forEach(setting => {
					if (setting.type == "text" || setting.type == "number" || setting.type == "dropdown")
						this.ElementHide(setting.id);
				})
			})
			DrawRect(0, 0, 2000, 1000, "rgba(0,0,0,.5)");
			let coords = {x: 500, y: 200, w: 1000, h: 500};
			let buttonWidth = 150;
			
			// Dialog Box
			DrawRect(coords.x, coords.y, coords.w, coords.h, "White");
			DrawEmptyRect(coords.x, coords.y, coords.w, coords.h, "Black", 5);
			DrawEmptyRect(coords.x+5, coords.y+5, coords.w-10, coords.h-10, "Grey", 2);

			// Paste text field
			MainCanvas.textAlign = "left";
			DrawTextFit("Paste Outfit Code:", coords.x + 50, coords.y + 50, coords.w - 100 - buttonWidth, "Black", "Grey");
			ElementPosition(this.outfitFieldId, coords.x + (coords.w/2) - (buttonWidth/2), coords.y + 120, coords.w - 100 - buttonWidth);
			
			// Checkboxes
			this.DrawCheckboxAbsolute("Cosplay:", 
				"Polymorph applies cosplay items from the outfit code.", 
				this.Spell.Polymorph?.IncludeCosplay ?? false, {
					x: coords.x + 50,
					y: coords.y + 200,
					w: 200
				}, false, false);
			this.DrawCheckboxAbsolute("Whole Body:", 
				"Polymorph modifies the whole body.", 
				this.Spell.Polymorph?.IncludeAllBody ?? false, {
					x: coords.x + 50,
					y: coords.y + 300,
					w: 200
			}, false, false);
			this.DrawCheckboxAbsolute("Hair:", 
				"Polymorph applies cosplay items from the outfit code.", 
				this.Spell.Polymorph?.IncludeHair ?? false, {
					x: coords.x + 450,
					y: coords.y + 200,
					w: 200
			}, this.Spell.Polymorph?.IncludeAllBody, false);
			this.DrawCheckboxAbsolute("Skin/Jewelry/Makeup:", 
				"Polymorph changes the target's skin.", 
				this.Spell.Polymorph?.IncludeSkin ?? false, {
					x: coords.x + 450,
					y: coords.y + 300,
					w: 200
			}, this.Spell.Polymorph?.IncludeAllBody, false);
			this.DrawCheckboxAbsolute("Genitals:", 
				"Polymorph changes the target's genitals.", 
				this.Spell.Polymorph?.IncludeGenitals ?? false, {
					x: coords.x + 450,
					y: coords.y + 400,
					w: 200
			}, this.Spell.Polymorph?.IncludeAllBody, false);
			
			MainCanvas.textAlign = "center";

			// Confirm Button
			DrawButton(1320, coords.y + 50, buttonWidth, 64, "Confirm", "White");
			return;
		}

		super.Run();

		this.ElementHide(this.outfitFieldId);
		this.ElementHide(this.outfitDropId);

		var prev = MainCanvas.textAlign;
		if (!this.settings.enabled) {
			MainCanvas.textAlign = "center";
			if (this.blinkLastTime + 750 < CommonTime()) {
				this.blinkLastTime = CommonTime();
				this.blinkColor = this.blinkColor == "Pink" ? "Purple" : "Pink";
			}
			DrawText("Now available:", 1000, 200, "Black", "Black");
			DrawText("Magic™!", 1000, 250, this.blinkColor, "Black");

			DrawText("Want to wow and amaze your friends and lovers?", 1000, 350, "Black", "Gray");
			DrawText("Are you looking to impress and punish your enemies?", 1000, 400, "Black", "Gray");
			DrawText("With just a simple signature you too can experience the thrill of Magic™!", 1000, 450, "Black", "Gray");

			DrawText("- Reveal the ancient secrets of the arcane! -", 1000, 550, "Gray", "Black");
			DrawText("- Craft your own amazing potions! -", 1000, 600, "Gray", "Black");
			DrawText("- Share in your powers, or dont! -", 1000, 650, "Gray", "Black");				

			DrawButton(800, 740, 400, 80, "~Sign Here~", "White", undefined, "Apply signature to scroll");

			DrawTextFit("~ Any sufficiently advanced technology is indistinguishable from magic ~", 1000, 880, 600, "Black", "Purple");
			DrawTextFit("* Signatory agrees to Magic™ Installation (ᴘᴀᴛ. ᴘᴇɴᴅ.) required to experience spell effects *", 1000, 900, 600, "Gray", "Pink");
		} else if (!this.settings.locked) {
			if (PreferencePageCurrent == 1) {
				if (!this.settings.blockedSpellEffects)
					this.settings.blockedSpellEffects = [];
				let val = this.settings.blockedSpellEffects.indexOf(this.Effect) > -1;
				let blockedStr = val ? "Blocked" : "Allowed";
				DrawBackNextButton(780, this.getYPos(5)-32, 600, 64, this.Effect, "White", "", () => "", () => "");
				DrawCheckbox(780 + 600 + 64, this.getYPos(5) - 32, 64, 64, "Block", val);

				if (val) {
					if (!this.settings.bypassForSelfEffects)
						this.settings.bypassForSelfEffects = [];
					let bypassed = this.settings.bypassForSelfEffects.indexOf(this.Effect) > -1;
					let bypassedStr = bypassed ? "Allowed for Self" : "Blocked for Self";
					DrawCheckbox(780 + 800 + 64, this.getYPos(5) - 32, 64, 64, "Self Bypass", bypassed);
					if (MouseIn(780 + 800 + 64, this.getYPos(5) - 32, 64, 64))
						drawTooltip(MouseX, MouseY, 256, bypassedStr, "left");
				}

				if (MouseIn(780 + 600 + 64, this.getYPos(5) - 32, 64, 64))
					drawTooltip(MouseX, MouseY, 128, blockedStr, "left");

				MainCanvas.textAlign = "left";
				DrawTextFit(GuiMagic.SpellEffectDescription(this.Effect), 780, this.getYPos(6), 1000, "Black");
				MainCanvas.textAlign = "center";
			} else if (PreferencePageCurrent == 2) {
				if (this.settings.knownSpells.length > 0) {
					DrawBackNextButton(550, this.getYPos(0)-32, 600, 64, this.Spell.Name, "White", "", () => "Previous", () => "Next");
					DrawButton(1180 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Current
					DrawImageResize("Icons/Trash.png", 1180, this.getYPos(0) - 32, 64, 64);

					// Draw Effect Pickers
					DrawBackNextButton(780, this.getYPos(3) - 32, 600, 64, this.Spell.Effects.length > 0 ? this.Spell.Effects[0] : LSCGSpellEffect.none, "White", "", () => "", () => "");
					if (this.Spell.Effects.length == 1) {
						DrawButton(1410 - 4, this.getYPos(3) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
						DrawImageResize("Icons/Trash.png", 1410, this.getYPos(3) - 32, 64, 64);
					}
					if (this.outfitEffects.indexOf(this.Spell.Effects[0]) > -1) DrawButton(1500, this.getYPos(3) - 32, 200, 64, "Configure", "White");
					MainCanvas.textAlign = "left";
					DrawTextFit(GuiMagic.SpellEffectDescription(this.Spell.Effects[0]), 780, this.getYPos(4), 1000, "Black");
					MainCanvas.textAlign = "center";
					if (this.Spell.Effects.length > 0) {
						DrawBackNextButton(780, this.getYPos(5) - 32, 600, 64, this.Spell.Effects[1] ?? LSCGSpellEffect.none, "White", "", () => "", () => "");
						if (this.Spell.Effects.length == 2) {
							DrawButton(1410 - 4, this.getYPos(5) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
							DrawImageResize("Icons/Trash.png", 1410, this.getYPos(5) - 32, 64, 64);
						}
						if (this.outfitEffects.indexOf(this.Spell.Effects[1]) > -1) DrawButton(1500, this.getYPos(5) - 32, 200, 64, "Configure", "White");
						MainCanvas.textAlign = "left";
						DrawTextFit(GuiMagic.SpellEffectDescription(this.Spell.Effects[1]), 780, this.getYPos(6), 1000, "Black");
						MainCanvas.textAlign = "center";
					}
					if (this.Spell.Effects.length > 1) {
						DrawBackNextButton(780, this.getYPos(7) - 32, 600, 64, this.Spell.Effects[2] ?? LSCGSpellEffect.none, "White", "", () => "", () => "");
						if (this.Spell.Effects.length > 2) {
							DrawButton(1410 - 4, this.getYPos(7) - 32 - 4, 72, 72, "", "White", "", `Delete ${this.Spell.Name}`); // Delete Effect
							DrawImageResize("Icons/Trash.png", 1410, this.getYPos(7) - 32, 64, 64);
						}
						if (this.outfitEffects.indexOf(this.Spell.Effects[2]) > -1) DrawButton(1500, this.getYPos(7) - 32, 200, 64, "Configure", "White");
						MainCanvas.textAlign = "left";
						DrawTextFit(GuiMagic.SpellEffectDescription(this.Spell.Effects[2]), 780, this.getYPos(8), 1000, "Black");
						MainCanvas.textAlign = "center";
					}
				}
				else {
					DrawTextFit("No Spells Known...", 780, this.getYPos(0), 600, "Black");
				}
				DrawButton(1260 - 4, this.getYPos(0) - 32 - 4, 72, 72, "", "White", "", `Create new Spell`); // Add New Spell
				DrawImageResize("Icons/Plus.png", 1260, this.getYPos(0) - 32, 64, 64);
			}
		}
		MainCanvas.textAlign = prev;
	}

	Click(): void {
		if (!this.settings.locked && this._ConfigureOutfit) {
			let coords = {x: 500, y: 400, w: 1000, h: 200};
			let buttonWidth = 150;
			if (!MouseIn(coords.x, coords.y, coords.w, coords.h)) this._ConfigureOutfit = false;
			else if (MouseIn(1350, 500 - 32, 100, 64)) this.ConfirmOutfit();
			return;
		} else if (!this.settings.locked && this._ConfigurePolymorph) {
			let coords = {x: 500, y: 200, w: 1000, h: 500};
			let buttonWidth = 150;
			if (!MouseIn(coords.x, coords.y, coords.w, coords.h)){ this._ConfigurePolymorph = false; return; }
			if (MouseIn(1320, coords.y + 50, buttonWidth, 64)) return this.ConfirmPolymorph();
			if (!this.Spell.Polymorph)
				this.Spell.Polymorph = <PolymorphConfig>{};
			this.ClickCheckboxAbsolute({
				x: coords.x + 50,
				y: coords.y + 200,
				w: 200
			}, () => this.Spell.Polymorph!.IncludeCosplay = !this.Spell.Polymorph?.IncludeCosplay);
			this.ClickCheckboxAbsolute({
				x: coords.x + 50,
				y: coords.y + 300,
				w: 200
			}, () => {
				this.Spell.Polymorph!.IncludeAllBody = !this.Spell.Polymorph?.IncludeAllBody;
				this.Spell.Polymorph!.IncludeHair = this.Spell.Polymorph?.IncludeAllBody ?? false;
				this.Spell.Polymorph!.IncludeSkin = this.Spell.Polymorph?.IncludeAllBody ?? false;
				this.Spell.Polymorph!.IncludeGenitals = this.Spell.Polymorph?.IncludeAllBody ?? false;
			});
			this.ClickCheckboxAbsolute({
				x: coords.x + 450,
				y: coords.y + 200,
				w: 200
			}, () => this.Spell.Polymorph!.IncludeHair = !this.Spell.Polymorph?.IncludeHair);
			this.ClickCheckboxAbsolute({
				x: coords.x + 450,
				y: coords.y + 300,
				w: 200
			}, () => this.Spell.Polymorph!.IncludeSkin = !this.Spell.Polymorph?.IncludeSkin);
			this.ClickCheckboxAbsolute({
				x: coords.x + 450,
				y: coords.y + 400,
				w: 200
			}, () => this.Spell.Polymorph!.IncludeGenitals = !this.Spell.Polymorph?.IncludeGenitals);

			return;
		}

		super.Click();

		if (!this.settings.enabled) {
			if (MouseIn(800, 740, 400, 80)) {
				this.settings.enabled = true;
				this.Load();
				DrawFlashScreen("#800080", 500, 1500);
				if (!AudioShouldSilenceSound(true))
            		AudioPlaySoundEffect("SciFiBeeps", 1);
			}
		} else if (!this.settings.locked) {
			if (PreferencePageCurrent == 1) {
				if (MouseIn(780, this.getYPos(5)-32, 600, 64)) {
					this.EffectIndex = this.GetNewIndexFromNextPrevClick(1080, this.EffectIndex, this.ActualEffects.length);
				} else if (MouseIn(780 + 600 + 64, this.getYPos(5) - 32, 64, 64)) {
					if (this.settings.blockedSpellEffects.indexOf(this.Effect) > -1)
						this.settings.blockedSpellEffects = this.settings.blockedSpellEffects.filter(ef => ef != this.Effect);
					else this.settings.blockedSpellEffects.push(this.Effect);
				} else if (MouseIn(780 + 800 + 64, this.getYPos(5) - 32, 64, 64) && this.settings.blockedSpellEffects.indexOf(this.Effect) > -1) {
					if (this.settings.bypassForSelfEffects.indexOf(this.Effect) > -1)
						this.settings.bypassForSelfEffects = this.settings.bypassForSelfEffects.filter(ef => ef != this.Effect);
					else this.settings.bypassForSelfEffects.push(this.Effect);
				}
			} else if (PreferencePageCurrent == 2) {
				if (MouseIn(550, this.getYPos(0) - 32, 600, 64)) {
					this.saveSpell();
					this.SpellIndex = this.GetNewIndexFromNextPrevClick(850, this.SpellIndex, this.settings.knownSpells.length);
					this.loadSpell();
				}
				else if (MouseIn(1180, this.getYPos(0) - 32, 64, 64)) {
					// Remove Spell
					this.settings.knownSpells.splice(this.SpellIndex, 1);
					if (this.SpellIndex >= this.settings.knownSpells.length)
						this.SpellIndex = this.settings.knownSpells.length - 1;
					this.loadSpell();
				} else if (MouseIn(1260, this.getYPos(0) - 32, 64, 64) && this.settings.knownSpells.length < KNOWN_SPELLS_LIMIT) {
					if (!!this.Spell)
						this.saveSpell();
					this.settings.knownSpells.push(<SpellDefinition>{
						Name: `Spell No. ${this.settings.knownSpells.length+1}`,
						Creator: Player.MemberNumber,
						Effects: [],
						AllowPotion: false
					});
					this.SpellIndex = this.settings.knownSpells.length - 1;
					this.loadSpell();
				} 
				if (!!this.Spell) {
					if (MouseIn(780, this.getYPos(3) - 32, 600, 64)) {
						let effects = this.UniqueEffects(0);
						if (MouseX <= 1080) {
							if (this.Spell.Effects.length < 1) this.Spell.Effects = [effects[effects.length - 1]];
							else this.Spell.Effects[0] = effects[(effects.length + effects.indexOf(this.Spell.Effects[0]) - 1) % effects.length];
						}
						else {
							if (this.Spell.Effects.length < 1) this.Spell.Effects = [effects[0]];
							else this.Spell.Effects[0] = effects[(effects.indexOf(this.Spell.Effects[0]) + 1) % effects.length];
						}
					} else if (this.Spell.Effects.length < 2 && MouseIn(1410, this.getYPos(3) - 32, 64, 64)) {
						this.Spell.Effects.splice(0);
					} else if (this.outfitEffects.indexOf(this.Spell.Effects[0]) > -1 && MouseIn(1500, this.getYPos(3)-32, 200, 64)){
						this.Spell.Effects[0] == LSCGSpellEffect.outfit ? this.ConfigureOutfitEffect() : this.ConfigurePolymorphEffect();
					} else if (MouseIn(780, this.getYPos(5) - 32, 600, 64)) {
						let effects = this.UniqueEffects(1);
						if (MouseX <= 1080) {
							if (this.Spell.Effects.length < 2) this.Spell.Effects.push(effects[effects.length - 1]);
							else this.Spell.Effects[1] = effects[(effects.length + effects.indexOf(this.Spell.Effects[1]) - 1) % effects.length];
						}
						else {
							if (this.Spell.Effects.length < 2) this.Spell.Effects.push(effects[0]);
							else this.Spell.Effects[1] = effects[(effects.indexOf(this.Spell.Effects[1]) + 1) % effects.length];
						}
					} else if (this.Spell.Effects.length < 3 && MouseIn(1410, this.getYPos(5) - 32, 64, 64)) {
						this.Spell.Effects.splice(1)
					} else if (this.outfitEffects.indexOf(this.Spell.Effects[1]) > -1 && MouseIn(1500, this.getYPos(5)-32, 200, 64)){
						this.Spell.Effects[1] == LSCGSpellEffect.outfit ? this.ConfigureOutfitEffect() : this.ConfigurePolymorphEffect();
					}else if (MouseIn(780, this.getYPos(7) - 32, 600, 64)) {
						let effects = this.UniqueEffects(2);
						if (MouseX <= 1080) {
							if (this.Spell.Effects.length < 3) this.Spell.Effects.push(effects[effects.length - 1]);
							else this.Spell.Effects[2] = effects[(effects.length + effects.indexOf(this.Spell.Effects[2]) - 1) % effects.length];
						}
						else {
							if (this.Spell.Effects.length < 3) this.Spell.Effects.push(effects[0]);
							else this.Spell.Effects[2] = effects[(effects.indexOf(this.Spell.Effects[2]) + 1) % effects.length];
						}
					} else if (this.Spell.Effects.length < 4 && MouseIn(1410, this.getYPos(7) - 32, 64, 64)) {
						this.Spell.Effects.splice(2)
					} else if (this.outfitEffects.indexOf(this.Spell.Effects[2]) > -1 && MouseIn(1500, this.getYPos(7)-32, 200, 64)){
						this.Spell.Effects[2] == LSCGSpellEffect.outfit ? this.ConfigureOutfitEffect() : this.ConfigurePolymorphEffect();
					}
				}
			}
		}
	}

	Exit(): void {
		ElementRemove(this.outfitFieldId);
		ElementRemove(this.outfitDropId);
		this.CleanPotionSettings();
		super.Exit();
	}

	CleanPotionSettings() {
		this.settings.knownSpells.forEach(spell => {
			if (spell.Effects.some(e => pairedSpellEffects.indexOf(e) > -1) ?? false)
				spell.AllowPotion = false;
		});
	}

	saveSpell() {
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

	loadSpell() {
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

	SpellIndex: number = 0;
	get Spell(): SpellDefinition {
		if (this.SpellIndex < 0)
			this.SpellIndex = 0;
		if (this.SpellIndex >= this.settings.knownSpells.length)
			this.SpellIndex = this.settings.knownSpells.length - 1;
		return this.settings.knownSpells[this.SpellIndex]
	}

	get SpellHasPairedEffect(): boolean {
		return this.Spell?.Effects.some(e => pairedSpellEffects.indexOf(e) > -1) ?? false;
	}

	UniqueEffects(ix: number) {
		if (!this.Spell)
			return this.ActualEffects;
		let otherEffects = this.Spell.Effects.filter((v, i, arr) => i != ix);
		return this.ActualEffects.filter(eff => otherEffects.indexOf(eff) == -1);
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

	_ConfigureOutfit: boolean = false;
	ConfigureOutfitEffect() {
		this.ElementSetValue(this.outfitFieldId, this.Spell.Outfit?.Code ?? "");
		this.ElementSetValue(this.outfitDropId, this.Spell.Outfit?.Option ?? OutfitOption.clothes_only);
		this._ConfigureOutfit = true;
	}
	ConfirmOutfit() {
		this._ConfigureOutfit = false;
		if (!this.Spell.Outfit) this.Spell.Outfit = {Code: "", Option: OutfitOption.both};
		let outfitCode = this.ParseCode(ElementValue(this.outfitFieldId), code => RedressedState.CleanItemCode(code));
		this.Spell.Outfit.Code = outfitCode;
		this.ElementSetValue(this.outfitFieldId, "");
	}
	OutfitConfigDropChanged(evt: any) {
		if (!!this.Spell) {
			if (!this.Spell.Outfit)
				this.Spell.Outfit = <OutfitConfig>{
					Code: "",
					Option: OutfitOption.both
				}
			this.Spell.Outfit.Option = evt.target.value as OutfitOption;
		}
	}

	// Duplicate for polymorph.... annoying.
	_ConfigurePolymorph: boolean = false;
	ConfigurePolymorphEffect() {
		this.ElementSetValue(this.outfitFieldId, this.Spell.Polymorph?.Code ?? "");
		this._ConfigurePolymorph = true;
	}
	ConfirmPolymorph() {
		this._ConfigurePolymorph = false;
		if (!this.Spell.Polymorph) this.Spell.Polymorph = <PolymorphConfig>{};
		let polymorphCode = this.ParseCode(ElementValue(this.outfitFieldId), code => PolymorphedState.CleanItemCode(code));
		this.Spell.Polymorph.Code = polymorphCode;
		this.ElementSetValue(this.outfitFieldId, "");
	}

	static SpellEffectDescription(effect: LSCGSpellEffect): string {
		switch (effect) {
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
			case LSCGSpellEffect.denial:
				return "Denies the target any orgasms.";
			case LSCGSpellEffect.orgasm:
				return "Forced an orgasm upon the target.";
			case LSCGSpellEffect.hypnotizing:
				return "Hypnotizes the target.";
			case LSCGSpellEffect.slumber:
				return "Induces a deep slumber in the target.";
			case LSCGSpellEffect.enlarge:
				return "Enlarges the target to twice their size.";
			// case LSCGSpellEffect.reduce:
			// 	return "Shrinks the target to half their size."
			case LSCGSpellEffect.outfit:
				return "Magically change the target's clothing and equipment.";
			case LSCGSpellEffect.paired_arousal:
				return "Pair two targets, such that when one feels arousal the other also does.";
			case LSCGSpellEffect.orgasm_siphon:
				return "Redirect all of the target's orgasmic pleasure to another.";
			case LSCGSpellEffect.dispell:
				return "Dispells any existing effects on the target (including anything drug induced).";
			case LSCGSpellEffect.bless:
				return "Applies a +5 buff to all the target's skills for 15 minutes";
			case LSCGSpellEffect.bane:
				return "Applies a -5 debuff to all the target's skills for 15 minutes";
			case LSCGSpellEffect.polymorph:
				return "Polymorph the target's body and/or cosplay items";
			case LSCGSpellEffect.xRay:
				return "Grants the target X-Ray vision";
			case LSCGSpellEffect.barrier:
				return "Create a magic barrier that protect and reflect incoming spell";
			case LSCGSpellEffect.disarm:
				return "Disarm the target";
			case LSCGSpellEffect.none:
			default:
				return ""			;
		}
	}

	ParseCode(code: string, trimFunc: (str: string) => string): string {
		if (stringIsCompressedItemBundleArray(code))
			return trimFunc(code);
		else if (CommonIsNumeric(code) || code.length <= 70)
			return code;
		else
			return "";
	}
}