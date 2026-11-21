import { BaseModule } from "base";
import { RemoteMainMenu } from "Settings/Remote/mainmenu";
import { RemoteGuiSubscreen } from "Settings/Remote/remoteBase";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, hookFunction, ICONS, removeAllHooksByModule } from "../utils";
import { IconButton } from "Dom/kit";

/** BC R134 builds the profile as page elements; this is the element that holds them, and the id of the menu inside it. */
const SHEET_SCREEN_ID = "information-sheet-screen";
const SHEET_MENU_ID = `${SHEET_SCREEN_ID}-menu`;
const REMOTE_BUTTON_ID = "lscg-remote-sheet-button";

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
		// On R134 the profile is page elements drawn over the canvas, so the remote screens (drawn on the canvas) would be
		// underneath it: hide it while a remote screen is open.
		const sheet = document.getElementById(SHEET_SCREEN_ID);
		if (sheet) sheet.style.display = subscreen ? "none" : "";
		if (this._currentSubscreen) {
			this._currentSubscreen.Load();
		}
	}

	/** Whether BC draws the profile as page elements (R134 and later) rather than on the canvas. */
	private get sheetIsDom(): boolean {
		return !!document.getElementById(SHEET_SCREEN_ID);
	}

	/** R134's profile menu is page elements, so the remote button goes in it as a real button; the canvas one would be under the sheet. */
	private addSheetMenuButton(): void {
		const menu = document.getElementById(SHEET_MENU_ID);
		document.getElementById(REMOTE_BUTTON_ID)?.remove();
		const C = this.getInformationSheetCharacter();
		if (!menu || !C || C.IsPlayer() || !this.characterHasMod(C as OtherCharacter)) return;
		const hasAccess = this.playerHasAccessToCharacter(C as OtherCharacter);
		const button = IconButton(ICONS.REMOTE,
			hasAccess ? (this.playerIsRestrained ? "Cannot access while restrained" : "LSCG Remote Settings") : "Needs BC item permission",
			() => {
				if (this.playerHasAccessToCharacter(C as OtherCharacter) && !this.playerIsRestrained)
					this.currentSubscreen = new RemoteMainMenu(this, C as OtherCharacter);
			},
			{ id: REMOTE_BUTTON_ID, tooltipPosition: "left" });
		button.setAttribute("role", "menuitem");
		button.disabled = !hasAccess || this.playerIsRestrained;
		menu.appendChild(button);
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

	get playerIsRestrained(): boolean {
		return Player.IsRestrained();
	}

    characterHasMod(C: OtherCharacter): boolean {
        return !!C.LSCG;
    }

    load(): void {
        hookFunction("InformationSheetLoad", 10, async (args, next) => {
			const ret = next(args);
			await ret;
			this.addSheetMenuButton();
			return ret;
		}, ModuleCategory.RemoteUI);

        hookFunction("InformationSheetRun", 11, (args, next) => {
			if ((<any>window).bcx?.inBcxSubscreen())
				return next(args);

			if (this._currentSubscreen) {
				(<any>window).LSCG_REMOTE_WINDOW_OPEN = true;
				MainCanvas.textAlign = "left";
				this._currentSubscreen.Run();
				MainCanvas.textAlign = "center";

				return;
			}

			(<any>window).LSCG_REMOTE_WINDOW_OPEN = false;
			next(args);
			const C = this.getInformationSheetCharacter();
            if (!this.sheetIsDom && !!C && this.characterHasMod(C as OtherCharacter) && !C.IsPlayer()) {
                const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C as OtherCharacter);
                DrawButton(90, 60, 60, 60, "", (playerHasAccessToCharacter && !this.playerIsRestrained) ? "White" : "#ddd", "", playerHasAccessToCharacter ? (this.playerIsRestrained ? "Cannot access while restrained" : "LSCG Remote Settings") : "Needs BC item permission", !playerHasAccessToCharacter || this.playerIsRestrained);
                DrawImageResize(ICONS.REMOTE, 95, 65, 50, 50);
            }
		}, ModuleCategory.RemoteUI);

		hookFunction("InformationSheetClick", 10, (args, next) => {
			if (this._currentSubscreen) {
				return this._currentSubscreen.Click();
			}

			const C = this.getInformationSheetCharacter();
            const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C as OtherCharacter);
			if (MouseIn(90, 60, 60, 60) && playerHasAccessToCharacter && !this.playerIsRestrained) {
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
        removeAllHooksByModule(ModuleCategory.RemoteUI);
    }
}