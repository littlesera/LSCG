import { ICONS, settingsSave } from "utils";
import { CollarModel, CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen, Setting } from "./settingBase";
import { getModule } from "modules";
import { MiscModule } from "Modules/misc";

export class GuiCollar extends GuiSubscreen {
	get name(): string {
		return "Breathplay";
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get settings(): CollarSettingsModel {
		return super.settings as CollarSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		return [
			[
				<Setting>{
					type: "checkbox",
					label: "Enable Hand Choking:",
					description: "Enables breathplay using \"Choke Neck\" activity. If done repeatedly will cause blackout.",
					setting: () => Player.LSCG.MiscModule.handChokeEnabled ?? false,
					setSetting: (val) => Player.LSCG.MiscModule.handChokeEnabled = val
				},<Setting>{
					type: "checkbox",
					label: "Enable Gag Suffocation:",
					description: "Enabled breathplay using nose plugs and sufficient gags.",
					setting: () => Player.LSCG.MiscModule.gagChokeEnabled ?? false,
					setSetting: (val) => Player.LSCG.MiscModule.gagChokeEnabled = val
				}
			], !this.settings.collarPurchased ? [] :
				this.settings.locked ? [
					<Setting>{
						type: "label",
						label: "** Collar Settings Locked **",
						description: "Collar Settings Locked Remotely"
					}] : [
				<Setting>{
					type: "checkbox",
					label: "Enabled:",
					description: "Enabled the Choking Collar Features.",
					setting: () => this.settings.enabled ?? false,
					setSetting: (val) => this.settings.enabled = val
				},<Setting>{
					type: "checkbox",
					label: "Allow Remote Access:",
					description: "Enables Remote Access to Collar Settings.",
					setting: () => this.settings.remoteAccess ?? false,
					setSetting: (val) => this.settings.remoteAccess = val
				},<Setting>{
					type: "checkbox",
					label: "Lockable:",
					description: "Allowes Remote Access Users to lock you out of these settings.",
					setting: () => this.settings.lockable ?? false,
					setSetting: (val) => this.settings.lockable = val
				},<Setting>{
					type: "checkbox",
					label: "Allow Self-Tightening:",
					description: "Allow the wearer to tighten their own collar.",
					setting: () => this.settings.allowSelfTightening ?? false,
					setSetting: (val) => this.settings.allowSelfTightening = val
				},<Setting>{
					type: "checkbox",
					label: "Allow Self-Loosening:",
					description: "Allow the wearer to loosen their own collar.",
					setting: () => this.settings.allowSelfLoosening ?? false,
					setSetting: (val) => this.settings.allowSelfLoosening = val
				},<Setting>{
					type: "text",
					id: "collar_allowedMembers",
					label: "Allowed Members IDs:",
					description: "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.",
					setting: () => this.settings.allowedMembers ?? (Player.Ownership?.MemberNumber+"" ?? ""),
					setSetting: (val) => this.settings.allowedMembers = val
				},<Setting>{
					type: "checkbox",
					label: "Limit to Crafted User:",
					description: "Limits collar activation to crafted user and allowed list. If no crafted user will use item permissions.",
					setting: () => this.settings.limitToCrafted ?? false,
					setSetting: (val) => this.settings.limitToCrafted = val
				},<Setting>{
					type: "text",
					id: "collar_tightTrigger",
					label: "Tighten Trigger:",
					description: "Word or phrase that, if spoken, will tighten the collar.",
					setting: () => this.settings.tightTrigger ?? false,
					setSetting: (val) => this.settings.tightTrigger = val
				},<Setting>{
					type: "text",
					id: "collar_looseTrigger",
					label: "Loosen Trigger:",
					description: "Word or phrase that, if spoken, will loosen the collar.",
					setting: () => this.settings.looseTrigger ?? false,
					setSetting: (val) => this.settings.looseTrigger = val
				},<Setting>{
					type: "checkbox",
					label: "Immersive:",
					description: "Prevents the wearer from viewing triggers via show-triggers.",
					setting: () => this.settings.immersive ?? false,
					setSetting: (val) => this.settings.immersive = val
				},<Setting>{
					type: "checkbox",
					label: "Any Collar:",
					description: "If enabled, any collar can trigger and activate.",
					setting: () => this.settings.anyCollar ?? false,
					setSetting: (val) => this.settings.anyCollar = val
				}
			]
		]
	}

	blinkLastTime = 0;
	blinkColor = "Red";
    Run() {
		super.Run();

		if (PreferencePageCurrent == 2) {
			var prev = MainCanvas.textAlign;
			if (this.settings.collarPurchased) {
				if (!this.settings.locked) {
					MainCanvas.textAlign = "left";
					// Set/Update Collar	 	[Custom??]
					let buttonPos = this.structure.length;
					let updateDisabled = !this.settings.enabled || this.settings.anyCollar;
					DrawText("Update Collar:", this.getXPos(buttonPos), this.getYPos(buttonPos), updateDisabled ? "Gray" : "Black", "Gray");
					MainCanvas.textAlign = "center";
					DrawButton(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64, "Update", updateDisabled ? "#CCCCCC" : "White", undefined, updateDisabled ? "" : "Update Collar to Current", updateDisabled);

					MainCanvas.textAlign = "left";
					if (!!this.settings.collar && !this.settings.anyCollar) {
						DrawText("Current Name: " + this.settings.collar.name, this.getXPos(buttonPos), this.getYPos(buttonPos) + 60, "Gray", "Gray");
						if (!!this.settings.collar.creator && this.settings.collar.creator > 0)
							DrawText("Current Crafter: " + this.settings.collar.creator, this.getXPos(buttonPos), this.getYPos(buttonPos) + 110, "Gray", "Gray");
					}
				}
			} else {
				MainCanvas.textAlign = "center";
				if (this.blinkLastTime + 750 < CommonTime()) {
					this.blinkLastTime = CommonTime();
					this.blinkColor = this.blinkColor == "Gray" ? "Red" : "Gray";
				}
				DrawText("Now available:", 1000, 200, "Black", "Black");
				DrawText("Andrew's Collar Control Module!!", 1000, 250, this.blinkColor, "Black");

				DrawText("Has your owner sent you shopping for a more controlling collar?", 1000, 350, "Black", "Gray");
				DrawText("Are you looking for some extra motivation for good behavior?", 1000, 400, "Black", "Gray");
				DrawText("Act now and secure your Control Module now for the low low price of $500!", 1000, 450, "Black", "Gray");

				DrawText("Attach this revolutionary new device to your existing collar and it will", 1000, 550, "Gray", "Black");
				DrawText("enhance it with the ability to tighten and loosen on command!", 1000, 600, "Gray", "Black");
				DrawText("Let your dom quiet down those bratty moments and reward good behavior!", 1000, 650, "Gray", "Black");				

				DrawButton(800, 740, 400, 80, "Purchase - $500", this.CanAffordCollar() ? "White" : "Pink", undefined, this.CanAffordCollar() ? "Unlock Andrew's Collar Module" : (!Player.Ownership ? "Cannot afford..." : "Too expensive? Ask your owner for help!"), !this.CanAffordCollar());

				DrawTextFit("- Andrew co.® makes no guarantees as to the behavior of the wearer -", 1000, 900, 600, "Orange", "Gray");
			}
			MainCanvas.textAlign = prev; 
		}
	}

	Exit(): void {
		if (!this.settings.chokeLevel)
			this.settings.chokeLevel = 0;
		super.Exit();
	}

	Click() {
		super.Click();

		if (PreferencePageCurrent == 2) {
			if (this.settings.collarPurchased) {
				if (!this.settings.locked && !this.settings.anyCollar) {
					// Update Collar Button
					let buttonPos = this.structure.length;
					if (MouseIn(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64)){
						var collar = InventoryGet(Player, "ItemNeck");
						if(!collar){
							this.message = "No Collar Equipped";
						}
						else{
							this.message = "Collar updated";
							this.settings.collar = <CollarModel>{
								name: collar.Craft?.Name ?? collar.Asset.Name,
								creator: collar.Craft?.MemberNumber ?? 0
							};
						}
					}
				}
			} else {
				if (MouseIn(800, 740, 400, 80) && this.CanAffordCollar()) {
					this.PurchaseCollar();
				}
			}
		}
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		getModule<MiscModule>("MiscModule")?.settings;
		super.Load();
	}

	CanAffordCollar() {
		return Player.Money >= 500;
	}

	PurchaseCollar() {
		if (!this.CanAffordCollar())
			return;
		Player.Money -= 500;
		this.settings.collarPurchased = true;
		this.Load();
		ServerPlayerSync();
		settingsSave();
	}
}