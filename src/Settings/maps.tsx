import { getModule } from "modules";
import { BoopsModule } from "Modules/boops";
import { LipstickModule } from "Modules/lipstick";
import { MiscModule } from "Modules/misc";
import { ICONS } from "utils";
import { MapSettingsModel } from "./Models/base";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { DomSettingsHost } from "./domSettingsHost";
import { CheckboxRow, KitContext, Panel } from "Dom/kit";
import { OpacityModule } from "Modules/opacity";
import { LeashingModule } from "Modules/leashing";
import { ChaoticItemModule } from "Modules/chaotic-item";
import { SplatterModule } from "Modules/splatter";
import { MapModule } from "Modules/map";

export class GuiMaps extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-map-settings", this, () => this.build());

	get name(): string {
		return "Map Enhancements";
	}

	get icon(): string {
		return ICONS.LIGHTBULB;
	}

	get settings(): MapSettingsModel {
        return super.settings as MapSettingsModel;
    }

	get help(): HelpInfo {
		return {
			label: "Open Enhanced Lighting Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Enhanced-Lighting",
		};
	}

	private build(): Node {
		const s = this.settings;
		const ctx = new KitContext();
		return Panel([
			CheckboxRow(ctx, {
				label: "Enhance map lighting", description: "If checked, map lighting will become more dynamic based on light sources [EXPERIMENTAL].",
				get: () => s.enhancedLighting ?? true, set: v => s.enhancedLighting = v,
			}),
			CheckboxRow(ctx, {
				label: "Disable lighting animation", description: "If checked, lighting animations will be disabled (Enable if maps running slow).",
				get: () => s.disableLightAnimation ?? false, set: v => s.disableLightAnimation = v,
				disabled: () => !s.enhancedLighting,
			}),
			CheckboxRow(ctx, {
				label: "Use room's ambient darkness", description: "If checked, will use the room customization filter as ambient darkness (Recommended).",
				get: () => s.useRoomCustomization ?? true, set: v => s.useRoomCustomization = v,
				disabled: () => !s.enhancedLighting,
			}),
			CheckboxRow(ctx, {
				label: "Use alternate blinding effect", description: "If checked, you will use an alternate blinding effect while in maps.",
				get: () => s.useEnhancedBlinding ?? true, set: v => s.useEnhancedBlinding = v,
			}),
			CheckboxRow(ctx, {
				label: "Hide vanilla fog squares", description: "If checked, the vanilla fog squares will be hidden leaving just the enhanced vision lines.",
				get: () => s.hideVanillaFog ?? false, set: v => s.hideVanillaFog = v,
			}),
			CheckboxRow(ctx, {
				label: "Hide dark lights", description: "If checked, lights that emit 'darkness' will not be used.",
				get: () => s.hideDarkLights ?? false, set: v => s.hideDarkLights = v,
			}),
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