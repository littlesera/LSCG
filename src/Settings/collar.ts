import { CollarSettingsModel } from "./Models/collar";
import { SettingsModel } from "./Models/settings";
import { GuiSubscreen } from "./settingBase";

export class GuiCollar extends GuiSubscreen {
    readonly character : PlayerCharacter;

    constructor(character: PlayerCharacter) {
		super();
		this.character = character;
    }

	get settings(): CollarSettingsModel {
		if (Player.LSCG === undefined) {
			Player.LSCG = <SettingsModel>{};
		}
		if (Player.LSCG.CollarModule === undefined) {
			Player.LSCG.CollarModule = <CollarSettingsModel>{ 
				enabled: false,
				allowedMembers: Player.Ownership?.MemberNumber+"" ?? "",
				chokeLevel: 0
			};
		}
		return Player.LSCG.CollarModule;		
	}

	Load(): void {
		super.Load();
		ElementCreateInput("collar_allowedMembers", "text", this.settings.allowedMembers ?? (Player.Ownership?.MemberNumber+"" ?? ""), "255");
	}

    Run() {
		var prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "left";

		DrawText("- LSCG Choking Collar -", GuiSubscreen.START_X, this.getYPos(0), "Black", "Gray");
		DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "BCX main menu");

		// Enabled 					[true/false]
		DrawText("Enabled:", GuiSubscreen.START_X, this.getYPos(1), "Black", "Gray");
		DrawCheckbox(GuiSubscreen.START_X + 600, this.getYPos(1) - 32, 64, 64, "", this.settings.enabled);

		// Allowed Members 			[ID list]
		DrawText("Allowed Members IDs:", GuiSubscreen.START_X, this.getYPos(2), "Black", "Gray");
		ElementPosition("collar_allowedMembers", GuiSubscreen.START_X + 900, this.getYPos(2), 600);
		
		// Set/Update Collar	 	[Custom??]
		DrawText("Update Collar:", GuiSubscreen.START_X, this.getYPos(3), "Black", "Gray");
		MainCanvas.textAlign = "center";
		DrawButton(GuiSubscreen.START_X + 600, this.getYPos(3) - 32, 200, 64, "Update", "White", undefined, "Update Collar to Current", !this.settings.enabled);

		MainCanvas.textAlign = prev;
	}

	Exit(): void {
		this.settings.allowedMembers = ElementValue("collar_allowedMembers") ?? (Player.Ownership?.MemberNumber+"" ?? "");
		ElementRemove("collar_allowedMembers");
		super.Exit();
	}

	Click() {
		super.Click();

		// Update Collar Button
		if (MouseIn(GuiSubscreen.START_X + 600, 190 + 240, 200, 64)){
			// Do Update.....
			console.info("Update Collar");
		}
	}
}