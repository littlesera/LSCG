import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { ICONS } from "utils";
import { GlobalSettingsModel } from "./Models/base";
import { GuiSubscreen } from "./settingBase";
import { DomSettingsHost } from "./domSettingsHost";
import { CheckboxRow, KitContext, Tabs } from "Dom/kit";
import { OpacityModule } from "Modules/opacity";
import { LeashingModule } from "Modules/leashing";
import { ChaoticItemModule } from "Modules/chaotic-item";
import { SplatterModule } from "Modules/splatter";
import { MapModule } from "Modules/map";

export class GuiGlobal extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-global-settings", () => this.build());

	get name(): string {
		return "General";
	}

	get icon(): string {
		return ICONS.BDSM;
	}

	get settings(): GlobalSettingsModel {
        return super.settings as GlobalSettingsModel;
    }

	private build(): Node {
		const s = this.settings;
		const L = Player.LSCG;
		const ctx = new KitContext();
		const off = () => !s.enabled;
		const row = (label: string, description: string, get: () => boolean, set: (v: boolean) => void) =>
			CheckboxRow(ctx, { label, description, get, set, disabled: off });
		return Tabs([
			{
				label: "General",
				render: () => [
					CheckboxRow(ctx, {
						label: "LSCG scripts enabled", description: "Enable LSCG Features.",
						get: () => s.enabled ?? false, set: v => s.enabled = v,
					}),
					row("Block settings while restrained", "Prevents LSCG settings access while restrained.",
						() => s.blockSettingsWhileRestrained ?? false, v => s.blockSettingsWhileRestrained = v),
					row("Immersive conditions", "Applies a more restrictive set of conditional states while incapacitated by LSCG.",
						() => L.StateModule.immersive ?? false, v => L.StateModule.immersive = v),
					row("Show check rolls", "If enabled, will display the attacker/defender roll values for activity checks.",
						() => s.showCheckRolls ?? true, v => s.showCheckRolls = v),
					row("Allow LSCG leashing", "Allow custom leashing from LSCG activities such as hand-holding, hypnosis, etc.",
						() => L.LeashingModule.enabled ?? true, v => L.LeashingModule.enabled = v),
					row("Enable clothed erection detection", "If checked, you will get a private message if you can feel an erection during certain activities.",
						() => s.erectionDetection ?? false, v => s.erectionDetection = v),
				],
			},
			{
				label: "Interactions",
				render: () => [
					row("Enable lipstick marks", "Apply kiss marks when lipstick-wearing people kiss you on the cheek/forehead/neck.",
						() => L.LipstickModule.enabled ?? false, v => L.LipstickModule.enabled = v),
					row("Dry lipstick", "Never apply kissmarks when you are the kisser.",
						() => L.LipstickModule.dry ?? false, v => L.LipstickModule.dry = v),
					row("Enable boop reactions", "Auto-react when booped.",
						() => L.BoopsModule.enabled ?? false, v => L.BoopsModule.enabled = v),
				],
			},
			{
				label: "Items",
				render: () => [
					row("Share public craftings", "If enabled, other LSCG users in the room will be able to use your crafted items on other people.",
						() => s.sharePublicCrafting ?? false, v => s.sharePublicCrafting = v),
					row("Enable tamperproof items", "Enable tamperproof features on crafted items you wear.",
						() => s.tamperproofEnabled ?? true, v => s.tamperproofEnabled = v),
					row("Enable chaotic/evolving items", "Enable chaotic/evolving features on crafted items you wear.",
						() => L.ChaoticItemModule.enabled ?? true, v => L.ChaoticItemModule.enabled = v),
					row("Block DOGS devious padlocks", "If checked, LSCG item applier (magic, cursed item, etc) will turn Devious Padlocks into regular Exclusive Padlocks on apply.",
						() => s.blockDOGS ?? false, v => s.blockDOGS = v),
				],
			},
			{
				label: "Display",
				render: () => [
					row("Blur while edged", "Apply extra blurring to the screen while edging.",
						() => s.edgeBlur ?? false, v => s.edgeBlur = v),
					row("Hide resizing effects", "If checked, you will not see any LSCG resizing effects. (eg. from magic)",
						() => s.hideResizing ?? false, v => s.hideResizing = v),
					row("Hide all opacity overrides", "If checked, will skip any opacity override effects. (includes x-ray vision)",
						() => !(L.OpacityModule.enabled ?? true), v => L.OpacityModule.enabled = (v === false)),
					row("Prevent remote opacity changes", "If checked, other players will not be able to directly modify the opacity settings on your wardrobe items.",
						() => L.OpacityModule.preventExternalMod ?? false, v => L.OpacityModule.preventExternalMod = v),
				],
			},
		]);
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		void getModule<MiscModule>("MiscModule")?.settings;
		void getModule<LipstickModule>("LipstickModule")?.settings;
		void getModule<LeashingModule>("LeashingModule")?.settings;
		void getModule<BoopsModule>("BoopsModule")?.settings;
		void getModule<OpacityModule>("OpacityModule")?.settings;
		void getModule<ChaoticItemModule>("ChaoticItemModule")?.settings;
		void getModule<SplatterModule>("SplatterModule")?.settings;
		void getModule<MapModule>("MapModule")?.settings;
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