import { BaseModule } from "base";
import { getModule } from "modules";
import { GuiHypno } from "Settings/hypno";
import { MainMenu } from "Settings/mainmenu";
import { RemoteMainMenu } from "Settings/Remote/mainmenu";
import { RemoteGuiSubscreen } from "Settings/Remote/remoteBase";
import { GuiSubscreen } from "Settings/settingBase";
import { GUI } from "Settings/settingUtils";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, hookFunction, ICONS, removeAllHooksByModule } from "../utils";
import { HypnoModule } from "./hypno";

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class RemoteUIModule extends BaseModule {   

    private _currentSubscreen: RemoteGuiSubscreen | null = null;

	get currentSubscreen(): RemoteGuiSubscreen | null {
		return this._currentSubscreen;
	}

	set currentSubscreen(subscreen: RemoteGuiSubscreen | null) {
		if (this._currentSubscreen) {
			this._currentSubscreen.Unload();
		}
		this._currentSubscreen = subscreen;
		if (this._currentSubscreen) {
			this._currentSubscreen.Load();
		}
	}

    getInformationSheetCharacter(): OtherCharacter | PlayerCharacter | null {
		const C = InformationSheetSelection;
		if (!C || typeof C.MemberNumber !== "number") return null;
		if (C.IsPlayer())
			return Player as PlayerCharacter;
		return getCharacter(C.MemberNumber) as OtherCharacter;
	}

    hasAccessToPlayer(C: OtherCharacter): boolean {
		return ServerChatRoomGetAllowItem(C, Player) && Player.LSCG?.GlobalModule.enabled;
	}

	playerHasAccessToCharacter(C: OtherCharacter): boolean {
		return !!C && !C.IsPlayer() && ServerChatRoomGetAllowItem(Player, C) && C.LSCG?.GlobalModule.enabled;
	}

    characterHasMod(C: OtherCharacter): boolean {
        return !!C.LSCG;
    }

    load(): void {
        hookFunction("InformationSheetRun", 10, (args, next) => {
			if (this._currentSubscreen) {
				MainCanvas.textAlign = "left";
				this._currentSubscreen.Run();
				MainCanvas.textAlign = "center";

				return;
			}

			next(args);
			const C = this.getInformationSheetCharacter();
            if (!!C && this.characterHasMod(C as OtherCharacter) && !C.IsPlayer()) {
                const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C as OtherCharacter);
                DrawButton(90, 60, 45, 45, "", playerHasAccessToCharacter ? "White" : "#ddd", "", playerHasAccessToCharacter ? "LSCG Remote Settings" : "Needs BC item permission", !playerHasAccessToCharacter);
                DrawImageResize(ICONS.REMOTE, 90, 60, 45, 45);
            }
		}, ModuleCategory.RemoteUI);

		hookFunction("InformationSheetClick", 10, (args, next) => {
			if (this._currentSubscreen) {
				return this._currentSubscreen.Click();
			}

			const C = this.getInformationSheetCharacter();
            const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C as OtherCharacter);
			if (MouseIn(90, 60, 45, 45) && playerHasAccessToCharacter) {
                this.currentSubscreen = new RemoteMainMenu(this, C as OtherCharacter);
			} else {
				return next(args);
			}
		}, ModuleCategory.RemoteUI);

		hookFunction("InformationSheetExit", 10, (args, next) => {
			if (this._currentSubscreen) {
				return this._currentSubscreen.Exit();
			}

			return next(args);
		}, ModuleCategory.RemoteUI);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Core);
    }
}