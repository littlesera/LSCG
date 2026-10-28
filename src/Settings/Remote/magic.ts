import { RemoteGuiSubscreen } from "./remoteBase";
import { HelpInfo } from "Settings/settingBase";
import { replace_template } from "utils";
import { MagicPublicSettingsModel, SpellEffectId } from "Settings/Models/magic";
import { legacyEffectIds } from "Modules/Magic/spellEffects";
import { DomSettingsHost } from "Settings/domSettingsHost";
import { KitContext, Tabs } from "Dom/kit";
import { buildMagicTabs } from "Settings/magic-pages";
import { canRemoteMagic, remoteAccessDenial } from "Modules/remoteAccess";

export class RemoteMagic extends RemoteGuiSubscreen {
	subscreens: RemoteGuiSubscreen[] = [];
	private _host = new DomSettingsHost("lscg-remote-magic-settings", this, () => this.build());

	get name(): string {
		return "Magic™";
	}

	get help(): HelpInfo {
		return {
			label: "Open Magic Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Magic",
		};
	}

	get disabledReason(): string {
		switch (remoteAccessDenial("MagicModule", this.Character, Player)) {
			case "module-off": return "Section is Disabled";
			case "level": return replace_template("You do not have access to %OPP_POSSESSIVE% mind...", this.Character);
			case "trance": return replace_template("%OPP_NAME% has too much willpower to let you in...", this.Character);
			case "hypnotizer": return replace_template("%OPP_NAME% seems suggestable, but not to you...", this.Character);
			case "remote-off": return replace_template("%OPP_NAME% does not allow remote access.", this.Character);
			default: return "Section is Unavailable";
		}
	}

	get enabled(): boolean {
		return canRemoteMagic(this.Character, Player);
	}

	get icon(): string {
		return "Icons/Magic.png";
	}

	get settings(): MagicPublicSettingsModel {
		return super.settings as MagicPublicSettingsModel;
	}

	/** The effects the target's client supports: the legacy built-ins, plus whatever it advertises. */
	get ActualEffects(): SpellEffectId[] {
		const known = (this.settings.knownEffects ?? []) as SpellEffectId[];
		return [...legacyEffectIds(), ...known.filter(id => legacyEffectIds().indexOf(id) < 0)];
	}

	private build(): Node {
		// Edits go straight into the target's public settings; the base class sends them back on Exit.
		return Tabs(buildMagicTabs(new KitContext(() => this.dirty = true), this.settings, { remote: true, effects: this.ActualEffects }));
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
