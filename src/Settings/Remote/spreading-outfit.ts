import { RemoteGuiSubscreen } from "./remoteBase";
import { Setting } from "Settings/settingBase";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { SpreadingOutfitPublicSettingsModel, SpreadingOutfitCodeConfig } from "Settings/Models/spreading-outfit";
import { GuiSpreadingOutfit } from "Settings/spreading-outfit";
import { RedressedState } from "Modules/States/RedressedState";

export class RemoteSpreadingOutfit extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Spreading Outfit";
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get settings(): SpreadingOutfitPublicSettingsModel {
		return super.settings as SpreadingOutfitPublicSettingsModel;
	}

	get disabledReason(): string {
		if (!this.settings.enabled)
			return "Section is Disabled";
		if (!this.checkRemoteAccessIsAllowed())
			return "You do not have the permission to access";
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		if (!this.settings.enabled) return false;

		return this.checkRemoteAccessIsAllowed();
	}

	get multipageStructure(): Setting[][] {
		return [[
			<Setting>{
				type: "label", // Start/Stop Spot
				label: "",
				description: "",
				//hidden: this.settings.Locked
			},<Setting>{
				type: "label", // Status Spot
				id: "spreading_status",
				label: this.getStatusString(),
				description: "",
				//hidden: this.settings.Locked
			}, <Setting>{
				type: "checkbox",
				label: "Locked:",
				description: "If checked, locks the user out of their own spreading outfit settings.",
				setting: () => this.settings.Locked ?? false,
				setSetting: (val) => {
					if (this.settings.Lockable) this.settings.Locked = val;
				},
				disabled: !this.settings.enabled || !this.settings.Lockable,
			},<Setting>{
				type: "number",
				id: "spreading_repeat_number",
				label: "Repeat Spreading:",
				description: "Number of spreading cycle repeat.",
				setting: () => (this.settings.RepeatNumber ?? 5),
				setSetting: (val) => {
					this.settings.RepeatNumber = Math.min(20, Math.max(0, val)) // 20 times max
				},
				disabled: !this.settings.enabled,
			},<Setting>{
				type: "number",
				id: "spreading_repeat_interval",
				label: "Repeat Interval (min):",
				description: "Interval between spreading cycles.",
				disabled: !this.settings.enabled,
				setting: () => (this.settings.RepeatInterval ?? 10),
				setSetting: (val) => {
					this.settings.RepeatInterval = Math.min(60 * 24, Math.max(5, val)) // 5min mini / 24h max
				},
			},<Setting>{
				type: "number",
				id: "spreading_item_interval",
				label: "Item Interval (sec):",
				description: "Interval between each item from the outfit is applied when the spreading starts.",
				disabled: !this.settings.enabled,
				setting: () => (this.settings.ItemInterval ?? 10),
				setSetting: (val) => {
					this.settings.ItemInterval = Math.min(60 * 5, Math.max(5, val)) // 5sec mini / 5min max
				},
			}, <Setting>{
				type: "checkbox",
				label: "Outfit1:",
				description: "Enable this outfit. (An Outfit will be randomly choosen among those enabled when the spreading start)",
				setting: () => this.settings.Outfit1.Enabled ?? false,
				setSetting: (val) => {
					this.settings.Outfit1.Enabled = (this.settings.Outfit1.Code != "" && val);
				},
				disabled: !this.settings.enabled || this.settings.Outfit1.Code == "",
			}, <Setting>{
				type: "checkbox",
				label: "Outfit2:",
				description: "Enable this outfit. (An Outfit will be randomly choosen among those enabled when the spreading start)",
				setting: () => this.settings.Outfit2.Enabled ?? false,
				setSetting: (val) => {
					this.settings.Outfit2.Enabled = (this.settings.Outfit2.Code != "" && val);
				},
				disabled: !this.settings.enabled || this.settings.Outfit2.Code == "",
			}, <Setting>{
				type: "checkbox",
				label: "Outfit3:",
				description: "Enable this outfit. (An Outfit will be randomly choosen among those enabled when the spreading start)",
				setting: () => this.settings.Outfit3.Enabled ?? false,
				setSetting: (val) => {
					this.settings.Outfit3.Enabled = (this.settings.Outfit3.Code != "" && val);
				},
				disabled: !this.settings.enabled || this.settings.Outfit3.Code == "",
			},<Setting>{
				type: "text",
				id: "spreading_start_spread_trigger",
				label: "Start spreading trigger word:",
				description: "Custom list of words and/or phrases, separated by a comma, that can start the spreading outfit process (only if already active).",
				disabled: !this.settings.enabled,
				setting: () => this.settings.StartSpreadingTriggerWords ?? "",
				setSetting: (val) => this.settings.StartSpreadingTriggerWords = val
			},<Setting>{
				type: "text",
				id: "spreading_activate_trigger",
				label: "Activate trigger word:",
				description: "Custom list of words and/or phrases, separated by a comma, that can activate the spreading outfit (including repeat options if set).",
				disabled: !this.settings.enabled,
				setting: () => this.settings.ActivateCurseTriggerWords ?? "",
				setSetting: (val) => this.settings.ActivateCurseTriggerWords = val
			}
		]]
	}

	checkRemoteAccessIsAllowed() {
		if (this.settings.AllowedRemote == "Self") {
			return false;
		}
		if (this.settings.AllowedRemote == "Public" && Player.MemberNumber) {
			// Public except blacklist
			return !this.Character.BlackList.includes(Player.MemberNumber);
		}
		if (this.settings.AllowedRemote != "Whitelist" && this.settings.AllowedRemote != "Lover" && this.settings.AllowedRemote != "Owner") {
			// Friend and below
			if (Player.FriendList && this.Character.MemberNumber && Player.FriendList.includes(this.Character.MemberNumber)) {
				return true;
			}
		}
		if (this.settings.AllowedRemote != "Lover" && this.settings.AllowedRemote != "Owner") {
			// Whitelisted and below
			if (Player.MemberNumber && this.Character.WhiteList.includes(Player.MemberNumber)) {
				return true;
			}
		}
		if (this.settings.AllowedRemote != "Owner" && this.Character.IsLoverOfPlayer()) {
			// Lover and below
			return true;
		}
		return this.Character.IsOwnedByPlayer();
	}

	updateDisabledButton() {
		this._startButtonDisabled = (!this.settings.enabled || this.settings.Active);
		this._stopButtonDisabled = (!this.settings.enabled || !this.settings.Active);
		this._configButtonDisabled = (!this.settings.enabled);
	}

	outfitFieldId: string = "magic_outfitPaste";
	Load(): void {
		// Load up module settings to ensure defaults..
		super.Load();
		ElementCreateInput(this.outfitFieldId, "text", "", -1);
	}

	getStatusString(): string {
		let status_label_str = "Status: ";
		if (this.settings.Active) {
			status_label_str += "Active";

			status_label_str += " - Repeat: " + this.settings.Internal.CurrentRepeatNumber;
			status_label_str += "/" + this.settings.RepeatNumber;

			if (this.settings.Internal.NextActivationTime > 0) {
				var timeToNextActivation = this.settings.Internal.NextActivationTime - CommonTime();
				var hours = Math.floor(timeToNextActivation / 3600000);
				var minutes = Math.floor((timeToNextActivation % 3600000) / 60000);
				var seconds = Math.floor(((timeToNextActivation % 360000) % 60000) / 1000);
				status_label_str += " - Next activation in " +  hours + "h " + minutes + "m " + seconds + "s";
			}
			else {
				status_label_str += " - Currently spreading";
			}
		}
		else {
			status_label_str += "Inactive";
		}

		return status_label_str;
	}

	_mainButtonWidth = 200;
	_mainButtonHeight = 64;
	_startButtonDisabled = (!this.settings.enabled || this.settings.Active);
	_stopButtonDisabled = (!this.settings.enabled || !this.settings.Active);
	_configButtonDisabled = (!this.settings.enabled);
	Run() {
		if (this._ConfigureOutfit > 0) {
			this.structure.forEach(setting => {
				if (setting.type == "text" || setting.type == "number" || setting.type == "dropdown")
					this.ElementHide(setting.id);
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
			DrawButton(1350, 500 - 32, 100, 64, "Confirm", "White");
			return;
		}

		super.Run();

		this.ElementHide(this.outfitFieldId);

		if (PreferencePageCurrent == 1) {
			MainCanvas.textAlign = "center";
			this.updateDisabledButton();
			// Draw Start button
			DrawButton(200, this.getYPos(0) - 32, this._mainButtonWidth, this._mainButtonHeight, "Start", (this._startButtonDisabled ? "Grey" : "White"), undefined, undefined, this._startButtonDisabled);

			// Draw Stop button
			DrawButton(300 + this._mainButtonWidth, this.getYPos(0) - 32, this._mainButtonWidth, this._mainButtonHeight, "Stop", (this._stopButtonDisabled ? "Grey" : "White"), undefined, undefined, this._stopButtonDisabled);

			// Draw Configure button
			DrawButton(1000, this.getYPos(6) - 32, this._mainButtonWidth, this._mainButtonHeight, "Configure", (this._configButtonDisabled ? "Grey" : "White"), undefined, undefined, this._configButtonDisabled);
			DrawButton(1000, this.getYPos(7) - 32, this._mainButtonWidth, this._mainButtonHeight, "Configure", (this._configButtonDisabled ? "Grey" : "White"), undefined, undefined, this._configButtonDisabled);
			DrawButton(1000, this.getYPos(8) - 32, this._mainButtonWidth, this._mainButtonHeight, "Configure", (this._configButtonDisabled ? "Grey" : "White"), undefined, undefined, this._configButtonDisabled);
		}
	}

	Click(): void {
		if (this._ConfigureOutfit > 0) {
			let coords = {x: 500, y: 400, w: 1000, h: 200};
			let buttonWidth = 150;
			if (!MouseIn(coords.x, coords.y, coords.w, coords.h)) this._ConfigureOutfit = 0;
			else if (MouseIn(1350, 500 - 32, 100, 64)) this.ConfirmOutfit();
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
		}

		if (PreferencePageCurrent == 1) {
			// Start button click
			if (!this._startButtonDisabled) {
				if (MouseIn(200, this.getYPos(0)-32, this._mainButtonWidth, this._mainButtonHeight)){
					this.settings.Active = true;
				}
			}
			// Stop button click
			if (!this._stopButtonDisabled) {
				if (MouseIn(300 + this._mainButtonWidth, this.getYPos(0)-32, this._mainButtonWidth, this._mainButtonHeight)){
					this.settings.Active = false;
				}
			}

			if (!this._configButtonDisabled) {
				// Outfit1 configure button click
				if (MouseIn(1000, this.getYPos(6)-32, this._mainButtonWidth, this._mainButtonHeight)){
					this.ConfigureOutfitEffect(1);
				}
				// Outfit2 configure button click
				if (MouseIn(1000, this.getYPos(7)-32, this._mainButtonWidth, this._mainButtonHeight)){
					this.ConfigureOutfitEffect(2);
				}
				// Outfit3 configure button click
				if (MouseIn(1000, this.getYPos(8)-32, this._mainButtonWidth, this._mainButtonHeight)){
					this.ConfigureOutfitEffect(3);
				}
			}
		}
	}

	Exit(): void {
		ElementRemove(this.outfitFieldId);
		super.Exit();
	}

	getOutfitObjFromNumber(outfitNumber: number): SpreadingOutfitCodeConfig | undefined {
		switch (outfitNumber) {
			case 1:
				return this.settings.Outfit1;
			case 2:
				return this.settings.Outfit2;
			case 3:
				return this.settings.Outfit3;
		}
		return undefined;
	}

	_ConfigureOutfit: number = 0;
	ConfigureOutfitEffect(outfitNumber: number) {
		let outfit = this.getOutfitObjFromNumber(outfitNumber);
		if (!outfit) outfit = {Code: "", Enabled: false};

		this.ElementSetValue(this.outfitFieldId, outfit.Code ?? "");
		this._ConfigureOutfit = outfitNumber;
	}
	ConfirmOutfit() {
		let outfit = this.getOutfitObjFromNumber(this._ConfigureOutfit);
		// reset LastUsedOutfitIndex on outfit change)
		if (this.settings.Internal.LastUsedOutfitIndex == this._ConfigureOutfit) this.settings.Internal.LastUsedOutfitIndex = -1;

		this._ConfigureOutfit = 0;
		if (!outfit) outfit = {Code: "", Enabled: false};
		let outfitCode = GuiSpreadingOutfit.ParseCode(ElementValue(this.outfitFieldId), code => RedressedState.CleanItemCode(code));
		outfit.Code = outfitCode;
		this.ElementSetValue(this.outfitFieldId, "");
	}

}