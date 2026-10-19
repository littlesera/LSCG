import { h } from "tsx-dom";
import { ICONS } from "utils";
import { CollarModel, CollarPublicSettingsModel, CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { getModule } from "modules";
import { MiscModule } from "Modules/misc";
import { DomSettingsHost } from "./domSettingsHost";
import { ButtonRow, CheckboxRow, KitContext, Notice, NumberRow, Tabs, TextRow } from "Dom/kit";

/** The collar settings both the wearer and remote users edit. `access` are the rows that differ between the two
 *  (remote access/lockable for the wearer, locked for a remote user); "Update" reads the collar `wearer` has on. */
export function collarRows(ctx: KitContext, s: CollarPublicSettingsModel, wearer: Character, access: HTMLElement[]): HTMLElement[] {
	const current = <small class="lscg-kit-desc" /> as HTMLElement;
	ctx.watch(() => {
		current.hidden = !s.collar?.name || s.anyCollar;
		current.textContent = `Current name: ${s.collar?.name ?? ""}` + (s.collar?.creator > 0 ? ` · Current crafter: ${s.collar.creator}` : "");
	});
	return [
		CheckboxRow(ctx, {
			label: "Enabled", description: "Enabled the Choking Collar Features.",
			get: () => s.enabled ?? false, set: v => s.enabled = v,
		}),
		...access,
		CheckboxRow(ctx, {
			label: "Allow self-tightening", description: "Allow the wearer to tighten their own collar.",
			get: () => s.allowSelfTightening ?? false, set: v => s.allowSelfTightening = v,
		}),
		CheckboxRow(ctx, {
			label: "Allow self-loosening", description: "Allow the wearer to loosen their own collar.",
			get: () => s.allowSelfLoosening ?? false, set: v => s.allowSelfLoosening = v,
		}),
		TextRow(ctx, {
			label: "Allowed member IDs", description: "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.",
			maxLength: 255, get: () => s.allowedMembers ?? Player.Ownership?.MemberNumber.toString() ?? "", set: v => s.allowedMembers = v,
		}),
		CheckboxRow(ctx, {
			label: "Limit to crafted user", description: "Limits collar activation to crafted user and allowed list. If no crafted user will use item permissions.",
			get: () => s.limitToCrafted ?? false, set: v => s.limitToCrafted = v,
		}),
		TextRow(ctx, {
			label: "Tighten trigger", description: "Word or phrase that, if spoken, will tighten the collar.",
			maxLength: 255, get: () => s.tightTrigger ?? "", set: v => s.tightTrigger = v,
		}),
		TextRow(ctx, {
			label: "Loosen trigger", description: "Word or phrase that, if spoken, will loosen the collar.",
			maxLength: 255, get: () => s.looseTrigger ?? "", set: v => s.looseTrigger = v,
		}),
		CheckboxRow(ctx, {
			label: "Immersive", description: "Prevents the wearer from viewing triggers via show-triggers.",
			get: () => s.immersive ?? false, set: v => s.immersive = v,
		}),
		CheckboxRow(ctx, {
			label: "Enable buttons", description: "Allows activation of the collar features via buttons (activities & commands).",
			get: () => s.allowButtons ?? false, set: v => s.allowButtons = v,
		}),
		CheckboxRow(ctx, {
			label: "Any collar", description: "If enabled, any collar can trigger and activate.",
			get: () => s.anyCollar ?? false, set: v => s.anyCollar = v,
		}),
		ButtonRow(ctx, {
			label: "Update collar", description: "Use the collar currently worn as the control collar.", buttonLabel: "Update",
			disabled: () => !s.enabled || s.anyCollar,
			onClick: () => {
				const collar = InventoryGet(wearer, "ItemNeck");
				// BC doesn't show PreferenceMessage on extension pages, so this reports with a toast.
				if (!collar) return ToastManager.error(`No collar equipped${wearer.IsPlayer() ? "" : ` on ${CharacterNickname(wearer)}`}.`);
				ToastManager.success("Collar updated.");
				s.collar = {
					name: collar.Craft?.Name ?? collar.Asset.Name,
					creator: collar.Craft?.MemberNumber ?? 0,
				} as CollarModel;
				ctx.changed();
			},
		}),
		current,
	];
}

/** What breathplay covers, shown until it's enabled. */
function breathplayLanding(enable: () => void): HTMLElement {
	return <div class="lscg-kit-promo">
		<header>
			<h2 class="lscg-kit-promo-title">Breathplay Mechanics</h2>
		</header>
		<div>
			<ul class="lscg-kit-promo-list">
				<li>Hands around the throat...</li>
				<li>Thick gags and a plugged nose...</li>
				<li>A collar that hisses tight on command...</li>
			</ul>
			<small class="lscg-kit-promo-fine">Breathe in... breathe out... good. Now don't.</small>
		</div>
		<footer>
			<button class="lscg-button" onClick={enable}>~Take a Deep Breath~</button>
			<small class="lscg-kit-promo-warning">⚠ Real breathplay is extremely dangerous and can cause serious injury or death. ⚠</small>
			<small class="lscg-kit-promo-warning">⚠ This is for imaginative roleplay only, do not try at home. ⚠</small>
		</footer>
	</div> as HTMLElement;
}

export class GuiCollar extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-collar-settings", this, () => this.build());

	get name(): string {
		return "Breathplay";
	}

	get icon(): string {
		return ICONS.COLLAR;
	}

	get settings(): CollarSettingsModel {
		return super.settings as CollarSettingsModel;
	}

	get help(): HelpInfo {
		return {
			label: "Open Breathplay Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Breathplay",
		};
	}

	private build(): Node {
		const s = this.settings;
		const misc = Player.LSCG.MiscModule;
		const ctx = new KitContext();
		const landing = breathplayLanding(() => {
			s.breathplayEnabled = true;
			ctx.changed();
		});
		const tabs = Tabs([
			{
				label: "Breathplay",
				render: () => [
					CheckboxRow(ctx, {
						label: "Enabled", description: "Enables breathplay. Turning it off goes back to the introduction.",
						get: () => !!s.breathplayEnabled, set: v => s.breathplayEnabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Enable hand choking", description: "Enables breathplay using \"Choke Neck\" activity. If done repeatedly will cause blackout.",
						get: () => misc.handChokeEnabled ?? false, set: v => misc.handChokeEnabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Enable gag suffocation", description: "Enabled breathplay using nose plugs and sufficient gags.",
						get: () => misc.gagChokeEnabled ?? false, set: v => misc.gagChokeEnabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Enable chain choking", description: "Enabled breathplay using choke chain neck restraint.",
						get: () => misc.chokeChainEnabled ?? false, set: v => misc.chokeChainEnabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Sleep on passout", description: "Will force sleep on passout.",
						get: () => s.knockout ?? false, set: v => s.knockout = v,
					}),
					NumberRow(ctx, {
						label: "Sleep time (minutes)", description: "How long you will sleep after passout if enabled.",
						min: 1, max: 10, get: () => s.knockoutMinutes ?? 2, set: v => s.knockoutMinutes = v,
						disabled: () => !s.knockout,
					}),
				],
			},
			{
				label: "Control collar",
				render: () => {
					const locked = Notice("** Collar Settings Locked **");
					const rows = <div class="lscg-kit-panel">{collarRows(ctx, s, Player, [
						CheckboxRow(ctx, {
							label: "Allow remote access", description: "Enables Remote Access to Collar Settings.",
							get: () => s.remoteAccess ?? false, set: v => s.remoteAccess = v,
						}),
						CheckboxRow(ctx, {
							label: "Lockable", description: "Allowes Remote Access Users to lock you out of these settings.",
							get: () => s.lockable ?? false, set: v => s.lockable = v,
						}),
					])}</div> as HTMLElement;
					ctx.watch(() => {
						locked.hidden = !s.locked;
						rows.hidden = !!s.locked;
					});
					return [locked, rows];
				},
			},
		]);
		ctx.watch(() => {
			landing.hidden = !!s.breathplayEnabled;
			tabs.hidden = !s.breathplayEnabled;
		});
		return <div class="lscg-kit-fill">{landing}{tabs}</div>;
	}

	Load(): void {
		// Load up module settings to ensure defaults..
		void getModule<MiscModule>("MiscModule")?.settings;
		super.Load();
		this._host.mount();
	}

	Exit(): void {
		this._host.unmount();
		if (!this.settings.chokeLevel)
			this.settings.chokeLevel = 0;
		super.Exit();
	}

	Unload(): void {
		this._host.unmount();
	}
}
