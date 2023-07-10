import { RemoteGuiSubscreen } from "./remoteBase";
import { Setting } from "Settings/settingBase";
import { HypnoPublicSettingsModel } from "Settings/Models/hypno";
import { GetDelimitedList, ICONS } from "utils";
import { CollarModel, CollarPublicSettingsModel } from "Settings/Models/collar";

export class RemoteCollar extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];

	get name(): string {
		return "Control Collar";
	}

	get allowedMemberIds(): number[] {
		let idList = GetDelimitedList(this.settings.allowedMembers).map(id => +id).filter(id => id > 0) ?? [];
		if (this.settings.limitToCrafted && this.settings.collar.creator >= 0)
			idList.push(this.settings.collar.creator);
		return idList;
	}

	get disabledReason(): string {
		if (!this.settings.collarPurchased && !this.Character.IsOwnedByPlayer())
			return "You must be the owner to purchase this module for them...";

		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.allowedMemberIds.length > 0)
			memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber!) > -1;

		if (!memberIdIsAllowed)
			return "You do not have access to their collar...";
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		if (!this.settings.collarPurchased)
			return this.Character.IsOwnedByPlayer();

		var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.allowedMemberIds.length > 0)
			memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber!) > -1;

		return this.settings.remoteAccess && 
				(this.Character.IsOwnedByPlayer() ||
					(this.settings.enabled && memberIdIsAllowed))
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get settings(): CollarPublicSettingsModel {
		return super.settings as CollarPublicSettingsModel;
	}

	get multipageStructure(): Setting[][] {
		return [!this.settings.collarPurchased ? [] : [
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
				label: "Locked:",
				description: "Locks the user out of these settings.",
				setting: () => this.settings.locked ?? false,
				setSetting: (val) => this.settings.locked = val,
				disabled: !this.settings.lockable
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
		]]
	}

	blinkLastTime = 0;
	blinkColor = "Red";
	Run(): void {
		super.Run();

		var prev = MainCanvas.textAlign;
		if (this.settings.collarPurchased) {
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
		} else {
			MainCanvas.textAlign = "center";
			if (this.blinkLastTime + 750 < CommonTime()) {
				this.blinkLastTime = CommonTime();
				this.blinkColor = this.blinkColor == "Gray" ? "Red" : "Gray";
			}
			DrawText("Now available:", 1000, 200, "Black", "Black");
			DrawText("Andrew's Collar Control Module!!", 1000, 250, this.blinkColor, "Black");

			DrawText("Does your sub need a more 'gripping' approach to training?", 1000, 350, "Black", "Gray");
			DrawText("Are you looking for some extra motivation for good behavior?", 1000, 400, "Black", "Gray");
			DrawText("Act now and secure your Control Module now for the owner-discounted price of $200!", 1000, 450, "Black", "Gray");

			DrawText("Attach this revolutionary new device to your sub's existing collar and it will", 1000, 550, "Gray", "Black");
			DrawText("enhance it with the ability to tighten and loosen on command!", 1000, 600, "Gray", "Black");
			DrawText("Quiet down those bratty moments and reward good behavior!", 1000, 650, "Gray", "Black");				

			DrawButton(800, 740, 400, 80, "Purchase - $200", this.CanAffordCollar() ? "White" : "Pink", undefined, this.CanAffordCollar() ? "Unlock Andrew's Collar Module" : "Cannot afford...", !this.CanAffordCollar());

			DrawTextFit("- Andrew co.® makes no guarantees as to the behavior of the wearer -", 1000, 900, 600, "Orange", "Gray");
		}
		MainCanvas.textAlign = prev; 
	}

	Click() {
		super.Click();

		if (this.settings.collarPurchased) {
			if (!this.settings.anyCollar) {
				// Update Collar Button
				let buttonPos = this.structure.length;
				if (MouseIn(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64)){
					var collar = InventoryGet(this.Character, "ItemNeck");
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

	CanAffordCollar() {
		return Player.Money >= 200;
	}

	PurchaseCollar() {
		if (!this.CanAffordCollar())
			return;
		Player.Money -= 200;
		this.settings.collarPurchased = true;
		this.settings.enabled = true;
		this.settings.remoteAccess = true;
		this.settings.allowedMembers = `${Player.MemberNumber}`;
		this.settings.tightTrigger = "tight";
		this.settings.looseTrigger = "loose";
		this.Load();
		ServerPlayerSync();
		this.settingsSave();
	}
}