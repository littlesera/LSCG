import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { CollarPublicSettingsModel } from "Settings/Models/collar";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { CheckboxRow, KitContext, Panel } from "Dom/kit";
import { collarRows } from "Settings/collar";
import { canRemoteCollar } from "Modules/remoteAccess";

export class RemoteCollar extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];
	private _host = new DomSettingsHost("lscg-remote-collar-settings", this, () => this.build());

	get name(): string {
		return "Control Collar";
	}

	get help(): HelpInfo {
		return {
			label: "Open Breathplay Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Breathplay",
		};
	}

	get allowedMemberIds(): number[] {
		const idList = GetDelimitedList(this.settings.allowedMembers).map(id => +id).filter(id => id > 0) ?? [];
		if (this.settings.limitToCrafted && this.settings.collar.creator >= 0)
			idList.push(this.settings.collar.creator);
		return idList;
	}

	get disabledReason(): string {
		if (this.settings.breathplayEnabled === false)
			return replace_template("%OPP_NAME% has not enabled breathplay...", this.Character);

		let memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.allowedMemberIds.length > 0)
			memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber!) > -1;

		if (!memberIdIsAllowed)
			return replace_template("You do not have access to %OPP_POSSESSIVE% collar...", this.Character);
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		return canRemoteCollar(this.Character, Player);
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get settings(): CollarPublicSettingsModel {
		return super.settings as CollarPublicSettingsModel;
	}

	private build(): Node[] {
		const s = this.settings;
		const ctx = new KitContext(() => this.dirty = true);
		return [Panel(collarRows(ctx, s, this.Character, [
			CheckboxRow(ctx, {
				label: "Locked", description: "Locks the user out of these settings.",
				get: () => s.locked ?? false, set: v => s.locked = v,
				disabled: () => !s.lockable,
			}),
		]))];
	}

	Load(): void {
		super.Load();
		this._host.mount();
	}

	/** The base marks any canvas click as a change; here only real edits in the DOM (via KitContext) count. */
	Click(): void {
		const dirty = this.dirty;
		super.Click();
		this.dirty = dirty;
	}

	Exit(): void {
		this._host.unmount();
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}
}
