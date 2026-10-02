import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { GetDelimitedList, ICONS, replace_template } from "utils";
import { CollarPublicSettingsModel } from "Settings/Models/collar";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { CheckboxRow, KitContext, Panel } from "Dom/kit";
import { collarPromo, collarRows } from "Settings/collar";

export class RemoteCollar extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];
	private _host = new DomSettingsHost("lscg-remote-collar-settings", () => this.build());

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
		if (!this.settings.collarPurchased && !this.Character.IsOwnedByPlayer())
			return replace_template("You must be the owner to purchase this module for %OPP_NAME%...", this.Character);

		let memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.allowedMemberIds.length > 0)
			memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber!) > -1;

		if (!memberIdIsAllowed)
			return replace_template("You do not have access to %OPP_POSSESSIVE% collar...", this.Character);
		else
			return "Section is Unavailable";
	}

	get enabled(): boolean {
		if (!this.settings.collarPurchased)
			return this.Character.IsOwnedByPlayer();

		let memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
		if (this.allowedMemberIds.length > 0)
			memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber!) > -1;

		return this.settings.remoteAccess && 
				(this.Character.IsOwnedByPlayer() ||
					(this.settings.enabled && memberIdIsAllowed));
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
		const promo = collarPromo([
			"Does your sub need a more 'gripping' approach to training?",
			"Are you looking for some extra motivation for good behavior?",
			"Act now and secure your Control Module now for the owner-discounted price of $200!",
			"Attach this revolutionary new device to your sub's existing collar and it will",
			"enhance it with the ability to 'tighten' and 'loosen' on command!",
			"Quiet down those bratty moments and reward good behavior!",
		], 200, () => this.CanAffordCollar(), "Cannot afford...", () => {
			this.PurchaseCollar();
			ctx.changed();
		});
		const rows = Panel(collarRows(ctx, s, this.Character, [
			CheckboxRow(ctx, {
				label: "Locked", description: "Locks the user out of these settings.",
				get: () => s.locked ?? false, set: v => s.locked = v,
				disabled: () => !s.lockable,
			}),
		], msg => this.message = msg));
		ctx.watch(() => {
			promo.hidden = !!s.collarPurchased;
			rows.hidden = !s.collarPurchased;
		});
		return [promo, rows];
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
		this.settings.tightTrigger = "tighten";
		this.settings.looseTrigger = "loosen";
		this.dirty = true;
		this.settingsSave();
		ServerPlayerSync();
	}
}
