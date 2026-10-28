import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { ICONS, replace_template } from "utils";
import { CollarPublicSettingsModel } from "Settings/Models/collar";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { CheckboxRow, KitContext, Panel } from "Dom/kit";
import { collarRows } from "Settings/collar";
import { canRemoteCollar, remoteAccessDenial } from "Modules/remoteAccess";

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

	get disabledReason(): string {
		switch (remoteAccessDenial("CollarModule", this.Character, Player)) {
			case "unavailable": return this.settings.breathplayEnabled === false ? replace_template("%OPP_NAME% has not enabled breathplay...", this.Character) : "Section is Unavailable";
			case "level": return replace_template("You do not have access to %OPP_POSSESSIVE% collar...", this.Character);
			case "trance": return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
			case "hypnotizer": return replace_template("%OPP_NAME% seems suggestable, but not to you...", this.Character);
			case "remote-off": return replace_template("%OPP_NAME% does not allow remote access.", this.Character);
			default: return "Section is Unavailable";
		}
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
