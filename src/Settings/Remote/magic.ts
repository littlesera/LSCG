import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo, Setting } from "Settings/settingBase";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { StateConfig } from "Settings/Models/states";
import { LSCGSpellEffect, MagicPublicSettingsModel } from "Settings/Models/magic";
import { GuiMagic } from "Settings/magic";
import { drawTooltip } from "Settings/settingUtils";

export class RemoteMagic extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Magic™";
	}

	get overrideMemberIds(): number[] {
		return GetDelimitedList(this.settings.remoteMemberIds).map(id => +id).filter(id => id > 0) ?? [];
	}

	get help(): HelpInfo {
		return {
			label: 'Open Magic Wiki on GitHub',
			link: 'https://github.com/littlesera/LSCG/wiki/Magic'
		}
	}

	get disabledReason(): string {
		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		var isTrance = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
		var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber) || 
								!this.settings.limitRemoteAccessToHypnotizer;

		if (!this.settings.enabled)
			return "Section is Disabled";
		if (!memberIdIsAllowed)
			return replace_template("You do not have access to %OPP_POSSESSIVE% mind...", this.Character);
		if (!passTranceReq)
			return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
		if (!passHypnotizerReq)
			return replace_template("%OPP_NAME% seems suggestable, but not to you...", this.Character);
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.overrideMemberIds.length > 0)
			memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber!) > -1;

		var isTrance = this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.active ?? false;
		var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
		var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.Character.LSCG.StateModule.states.find(s => s.type == "hypnotized")?.activatedBy == Player.MemberNumber) || 
								!this.settings.limitRemoteAccessToHypnotizer;

		return this.settings.remoteAccess && 
				this.settings.enabled &&
				memberIdIsAllowed &&
				passTranceReq &&
				passHypnotizerReq
	}

	get icon(): string {
		return "Icons/Magic.png";
	}

	get settings(): MagicPublicSettingsModel {
		return super.settings as MagicPublicSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		return [[
			<Setting>{
				type: "checkbox",
				label: "Never Defend:",
				description: "If checked, the target will never defend against spells cast on them.",
				setting: () => this.settings.neverDefend ?? false,
				setSetting: (val) => this.settings.neverDefend = val
			}, <Setting>{
				type: "text",
				id: "magic_neverDefendMembers",
				label: "Defenseless Against Member IDs:",
				description: "Comma separated list of member IDs. If empty will use standard Item Permissions. The target will never defend against their spells.",
				disabled: this.settings.neverDefend,
				setting: () => this.settings.noDefenseMemberIds ?? "",
				setSetting: (val) => this.settings.noDefenseMemberIds = val
			}, <Setting>{
				type: "checkbox",
				label: "Limited Spell Duration:",
				description: "If checked, the target will eventually break free from a detrimental spell's effects, the time variable based on how poorly they fail an activity roll against the caster.",
				setting: () => this.settings.limitedDuration ?? false,
				setSetting: (val) => this.settings.limitedDuration = val
			}, <Setting>{
				type: "number",
				id: "magic_maxDuration",
				label: "Maximum Spell Duration:",
				description: "Maximum amount of time, in minutes, the target will be affected by any specific spell effects. Set to 0 for unlimited.",
				setting: () => this.settings.maxDuration ?? 0,
				setSetting: (val) => this.settings.maxDuration = val
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
				type: "label",
				label: "Blocked Effects:",
				description: "Toggle which spell effects you want to block on yourself."
			}, <Setting>{
				type: "label", // Blank Spot
				label: "",
				description: ""
			}, <Setting>{
				type: "checkbox",
				label: "Locked:",
				disabled: !this.settings.lockable,
				description: "If checked, locks the user out of their own hypnosis settings.",
				setting: () => this.settings.locked ?? false,
				setSetting: (val) => {
					if (this.settings.lockable) this.settings.locked = val;
				}
			}, <Setting>{
				type: "checkbox",
				label: "Remote Access Requires Trance:",
				description: "If checked, remote access is only possible while actively hypnotized.",
				setting: () => this.settings.remoteAccessRequiredTrance ?? true,
				setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
			}, <Setting>{
				type: "checkbox",
				label: "Remote Access Limited to Hypnotizer:",
				description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
				setting: () => this.settings.limitRemoteAccessToHypnotizer ?? true,
				setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
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
				label: "Prevent X-Ray Vision",
				description: "Lead-line all the target's clothing.",
				setting: () => this.settings.blockXRay ?? true,
				setSetting: (val) => this.settings.blockXRay = val
			}
		]]
	}

	Run(): void {
		super.Run();

		var prev = MainCanvas.textAlign;
		//MainCanvas.textAlign = "center";
		if (!this.settings.blockedSpellEffects)
			this.settings.blockedSpellEffects = [];
		let val = this.settings.blockedSpellEffects.indexOf(this.Effect) > -1;
		let blockedStr = val ? "Blocked" : "Allowed";
		DrawBackNextButton(780, this.getYPos(7)-32, 600, 64, this.Effect, "White", "", () => "", () => "");
		DrawCheckbox(780 + 600 + 64, this.getYPos(7) - 32, 64, 64, "Block", val);
		
		if (val) {
			if (!this.settings.bypassForSelfEffects)
				this.settings.bypassForSelfEffects = [];
			let bypassed = this.settings.bypassForSelfEffects.indexOf(this.Effect) > -1;
			let bypassedStr = bypassed ? "Allowed for Self" : "Blocked for Self";
			DrawCheckbox(780 + 800 + 64, this.getYPos(7) - 32, 64, 64, "Self Bypass", bypassed);
			if (MouseIn(780 + 800 + 64, this.getYPos(7) - 32, 64, 64))
				drawTooltip(MouseX, MouseY, 256, bypassedStr, "left");
		}

		if (MouseIn(780 + 600 + 64, this.getYPos(7) - 32, 64, 64))
			drawTooltip(MouseX, MouseY, 128, blockedStr, "left");
			
		MainCanvas.textAlign = "left";
		DrawTextFit(GuiMagic.SpellEffectDescription(this.Effect), 780, this.getYPos(8), 1000, "Black");
		MainCanvas.textAlign = prev;
	}

	Click(): void {
		super.Click();

		if (MouseIn(780, this.getYPos(7)-32, 600, 64)) {
			this.EffectIndex = this.GetNewIndexFromNextPrevClick(1080, this.EffectIndex, this.ActualEffects.length);
		} else if (MouseIn(780 + 600 + 64, this.getYPos(7) - 32, 64, 64)) {
			if (this.settings.blockedSpellEffects.indexOf(this.Effect) > -1)
				this.settings.blockedSpellEffects = this.settings.blockedSpellEffects.filter(ef => ef != this.Effect);
			else this.settings.blockedSpellEffects.push(this.Effect);
		} else if (MouseIn(780 + 800 + 64, this.getYPos(7) - 32, 64, 64) && this.settings.blockedSpellEffects.indexOf(this.Effect) > -1) {
			if (this.settings.bypassForSelfEffects.indexOf(this.Effect) > -1)
				this.settings.bypassForSelfEffects = this.settings.bypassForSelfEffects.filter(ef => ef != this.Effect);
			else this.settings.bypassForSelfEffects.push(this.Effect);
		}
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
}