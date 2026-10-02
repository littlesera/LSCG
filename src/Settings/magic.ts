import { GuiSubscreen, HelpInfo } from "./settingBase";
import { MagicSettingsModel } from "./Models/magic";
import { allEffectIds, spellHasPairedEffect } from "Modules/Magic/spellEffects";
import { DomSettingsHost } from "./domSettingsHost";
import { KitContext, Notice, Tabs } from "Dom/kit";
import { buildMagicTabs } from "./magic-pages";

export type SpiritTextType = "None" | "Glow" | "Float";

export class GuiMagic extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-magic-settings", () => this.build());

	get name(): string {
		return "Magic™";
	}

	get icon(): string {
		return "Icons/Magic.png";
	}

	get settings(): MagicSettingsModel {
		return super.settings as MagicSettingsModel;
	}

	get help(): HelpInfo {
		return {
			label: "Open Magic Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Magic",
		};
	}

	private build(): Node {
		if (this.settings.locked)
			return Notice("** Magic™ settings are locked remotely **");
		// Unticking "Enabled" goes back to the sign-up scroll, which is drawn on the canvas.
		const ctx = new KitContext(() => { if (!this.settings.enabled) this._host.unmount(); });
		return Tabs(buildMagicTabs(ctx, this.settings, { remote: false, effects: allEffectIds() }));
	}

	Load(): void {
		super.Load();
		if (this.settings.enabled)
			this._host.mount();
	}

	blinkLastTime = 0;
	blinkColor = "Pink";
	Run() {
		super.Run();
		if (this.settings.enabled)
			return;

		const prev = MainCanvas.textAlign;
		MainCanvas.textAlign = "center";
		if (this.blinkLastTime + 750 < CommonTime()) {
			this.blinkLastTime = CommonTime();
			this.blinkColor = this.blinkColor == "Pink" ? "Purple" : "Pink";
		}
		DrawText("Now available:", 1000, 200, "Black", "Black");
		DrawText("Magic™!", 1000, 250, this.blinkColor, "Black");

		DrawText("Want to wow and amaze your friends and lovers?", 1000, 350, "Black", "Gray");
		DrawText("Are you looking to impress and punish your enemies?", 1000, 400, "Black", "Gray");
		DrawText("With just a simple signature you too can experience the thrill of Magic™!", 1000, 450, "Black", "Gray");

		DrawText("- Reveal the ancient secrets of the arcane! -", 1000, 550, "Gray", "Black");
		DrawText("- Craft your own amazing potions! -", 1000, 600, "Gray", "Black");
		DrawText("- Share in your powers, or dont! -", 1000, 650, "Gray", "Black");

		DrawButton(800, 740, 400, 80, "~Sign Here~", "White", undefined, "Apply signature to scroll");

		DrawTextFit("~ Any sufficiently advanced technology is indistinguishable from magic ~", 1000, 880, 600, "Black", "Purple");
		DrawTextFit("* Signatory agrees to Magic™ Installation (ᴘᴀᴛ. ᴘᴇɴᴅ.) required to experience spell effects *", 1000, 900, 600, "Gray", "Pink");
		MainCanvas.textAlign = prev;
	}

	Click(): void {
		super.Click();
		if (!this.settings.enabled && MouseIn(800, 740, 400, 80)) {
			this.settings.enabled = true;
			this._host.mount();
			DrawFlashScreen("#800080", 500, 1500);
			if (!AudioShouldSilenceSound(true))
				AudioPlaySoundEffect("SciFiBeeps", 1);
		}
	}

	Exit(): void {
		this._host.unmount();
		this.CleanPotionSettings();
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}

	CleanPotionSettings() {
		this.settings.knownSpells.forEach(spell => {
			if (spellHasPairedEffect(spell))
				spell.AllowPotion = false;
		});
	}
}
