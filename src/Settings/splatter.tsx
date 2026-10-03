import { ICONS } from "utils";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { SplatterSettingsModel } from "./Models/base";
import { SplatterModule } from "Modules/splatter";
import { DomSettingsHost } from "./domSettingsHost";
import { CheckboxRow, KitContext, NumberRow, Panel, SectionLabel, TextRow } from "Dom/kit";

// Stored as typed (strings), as the old screen did.
const memberList = (val: string) => val.split(",").map(x => x.trim()).filter(x => !!x) as any[];

export class GuiSplatter extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-splatter-settings", this, () => this.build());

	get name(): string {
		return "Splatters";
	}

	get icon(): string {
		return ICONS.SPLAT;
	}

	get settings(): SplatterSettingsModel {
		return super.settings as SplatterSettingsModel;
	}

	get splatterModule(): SplatterModule {
		return this.module as SplatterModule;
	}

	get help(): HelpInfo {
		return {
			label: "Open Splatter Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Splatters",
		};
	}

	private build(): Node {
		const s = this.settings;
		const ctx = new KitContext();
		const off = () => !s.enabled;
		return Panel([
			CheckboxRow(ctx, {
				label: "Enable splatters", description: "Enable splatter integration.",
				get: () => s.enabled ?? false, set: v => s.enabled = v,
				disabled: () => !Player.LSCG.GlobalModule.enabled,
			}),
			CheckboxRow(ctx, {
				label: "Give splatters", description: "Allow splattering on others.",
				get: () => s.giver ?? true, set: v => s.giver = v, disabled: off,
			}),
			CheckboxRow(ctx, {
				label: "Receive splatters", description: "Allow others to splatter you.",
				get: () => s.taker ?? true, set: v => s.taker = v, disabled: off,
			}),
			CheckboxRow(ctx, {
				label: "Auto splatter", description: "If enabled, will prompt for splatter on orgasm.",
				get: () => s.autoSplat ?? true, set: v => s.autoSplat = v,
				disabled: () => !s.enabled || !s.giver,
			}),
			NumberRow(ctx, {
				label: "Minimum required arousal", description: "Minimum arousal required to do give splatter.",
				min: 0, max: 99, get: () => s.minArousal ?? 90, set: v => s.minArousal = v, disabled: off,
			}),
			SectionLabel("Who can splatter you"),
			CheckboxRow(ctx, {
				label: "Uncontrollable when bound", description: "If enabled, the user will only be able to control where splatter is applied if unrestrained.",
				get: () => s.uncontrollableWhenBound ?? true, set: v => s.uncontrollableWhenBound = v, disabled: off,
			}),
			CheckboxRow(ctx, {
				label: "Lovers only", description: "If enabled, only your lovers and whitelist will be able to apply splatters to you.",
				get: () => s.requireLover ?? true, set: v => s.requireLover = v, disabled: off,
			}),
			TextRow(ctx, {
				label: "Splatter whitelist", description: "Set member numbers who are explicitly allowed to splatter on you. Comma separated list of member IDs.",
				maxLength: 255, get: () => s.whitelist?.join(", ") ?? "", set: v => s.whitelist = memberList(v), disabled: off,
			}),
			TextRow(ctx, {
				label: "Splatter blacklist", description: "Set member numbers who are explicitly blocked from splattering on you. Comma separated list of member IDs.",
				maxLength: 255, get: () => s.blacklist?.join(", ") ?? "", set: v => s.blacklist = memberList(v), disabled: off,
			}),
			SectionLabel("Appearance"),
			TextRow(ctx, {
				label: "Splatter color override", description: "Override color [hex code] for splatter application. Can comma separate possible values (eg: #FFF, #F0F0F0).",
				maxLength: 255, get: () => s.colorOverride ?? "", set: v => s.colorOverride = v as BCColor, disabled: off,
			}),
			TextRow(ctx, {
				label: "Splatter opacity % override", description: "Override opacity for splatter application. Can comma separate possible values and provide range (eg: 20, 60-70).",
				maxLength: 255, get: () => s.opacityOverride ?? "", set: v => s.opacityOverride = v, disabled: off,
			}),
		]);
	}

	Load(): void {
		super.Load();
		this._host.mount();
	}

	Exit(): void {
		this._host.unmount();
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}
}
