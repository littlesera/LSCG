import { RemoteGuiSubscreen } from "./remoteBase";
import { Setting } from "Settings/settingBase";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { GetDelimitedList, ICONS } from "utils";
import { StateConfig } from "Settings/Models/states";
import { LSCGSpellEffect, MagicPublicSettingsModel } from "Settings/Models/magic";

export class RemoteMagic extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Magic™";
	}

	get overrideMemberIds(): number[] {
		return GetDelimitedList(this.settings.remoteMemberIds).map(id => +id).filter(id => id > 0) ?? [];
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
			return "You do not have access to their mind...";
		if (!passTranceReq)
			return "They have too much willpower to let you in...";
		if (!passHypnotizerReq)
			return "They seem suggestable, but not to you...";
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
			}
		]]
	}

	Run(): void {
		super.Run();

		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "center";
		if (!this.settings.blockedSpellEffects)
			this.settings.blockedSpellEffects = [];
		let val = this.settings.blockedSpellEffects.indexOf(this.Effect) > -1;
		let blockedStr = val ? "Blocked" : "Allowed";
		DrawBackNextButton(780, this.getYPos(6)-32, 600, 64, this.Effect, "White", "", () => blockedStr, () => blockedStr);
		DrawCheckbox(780 + 600 + 64, this.getYPos(6) - 32, 64, 64, "", val);

		MainCanvas.textAlign = "left";
		DrawTextFit(this.SpellEffectDescription(this.Effect), 780, this.getYPos(7), 1000, "Black");
		MainCanvas.textAlign = prev;
	}

	Click(): void {
		super.Click();

		if (MouseIn(780, this.getYPos(6)-32, 600, 64)) {
			this.EffectIndex = this.GetNewIndexFromNextPrevClick(1080, this.EffectIndex, this.ActualEffects.length);
		} else if (MouseIn(550 + 600 + 64, this.getYPos(6) - 32, 64, 64)) {
			if (this.settings.blockedSpellEffects.indexOf(this.Effect) > -1)
				this.settings.blockedSpellEffects = this.settings.blockedSpellEffects.filter(ef => ef != this.Effect);
			else this.settings.blockedSpellEffects.push(this.Effect);
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

	SpellEffectDescription(effect: LSCGSpellEffect): string {
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
			case LSCGSpellEffect.dispell:
				return "Dispells any existing effects on the target (including anything drug induced).";
			case LSCGSpellEffect.none:
			default:
				return ""			;
		}
	}
}