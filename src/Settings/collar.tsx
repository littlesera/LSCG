import { h } from "tsx-dom";
import { ICONS, settingsSave } from "utils";
import { CollarModel, CollarPublicSettingsModel, CollarSettingsModel } from "./Models/collar";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { getModule } from "modules";
import { MiscModule } from "Modules/misc";
import { DomSettingsHost } from "./domSettingsHost";
import { ButtonRow, CheckboxRow, KitContext, Notice, NumberRow, Tabs, TextRow } from "Dom/kit";

/** The collar settings both the wearer and remote users edit. `access` are the rows that differ between the two
 *  (remote access/lockable for the wearer, locked for a remote user); "Update" reads the collar `wearer` has on. */
export function collarRows(ctx: KitContext, s: CollarPublicSettingsModel, wearer: Character, access: HTMLElement[], setMessage: (msg: string) => void): HTMLElement[] {
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
				if (!collar) return setMessage("No Collar Equipped");
				setMessage("Collar updated");
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

/** Andrew co.'s sales pitch, shown until the control module is bought. */
export function collarPromo(lines: string[], price: number, canAfford: () => boolean, cannotAfford: string, purchase: () => void): HTMLElement {
	const button = <button class="lscg-button" onClick={() => { if (canAfford()) purchase(); }}>{`Purchase - $${price}`}</button> as HTMLButtonElement;
	button.disabled = !canAfford();
	button.title = canAfford() ? "Unlock Andrew's Collar Module" : cannotAfford;
	return <div class="lscg-kit-promo">
		<p><b>Now available:</b></p>
		<h2 class="lscg-kit-blink">Andrew's Collar Control Module!!</h2>
		{lines.map(l => <p>{l}</p>)}
		{button}
		<small class="lscg-kit-desc">- Andrew co.® makes no guarantees as to the behavior of the wearer -</small>
	</div> as HTMLElement;
}

export class GuiCollar extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-collar-settings", () => this.build());

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
		return Tabs([
			{
				label: "Breathplay",
				render: () => [
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
					const promo = collarPromo([
						"Has your owner sent you shopping for a more controlling collar?",
						"Are you looking for some extra motivation for good behavior?",
						"Act now and secure your Control Module now for the low low price of $500!",
						"Attach this revolutionary new device to your existing collar and it will",
						"enhance it with the ability to tighten and loosen on command!",
						"Let your dom quiet down those bratty moments and reward good behavior!",
					], 500, () => this.CanAffordCollar(), !Player.Ownership ? "Cannot afford..." : "Too expensive? Ask your owner for help!", () => {
						this.PurchaseCollar();
						ctx.changed();
					});
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
					], msg => this.message = msg)}</div> as HTMLElement;
					ctx.watch(() => {
						promo.hidden = !!s.collarPurchased;
						locked.hidden = !s.collarPurchased || !s.locked;
						rows.hidden = !s.collarPurchased || !!s.locked;
					});
					return [promo, locked, rows];
				},
			},
		]);
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

	CanAffordCollar() {
		return Player.Money >= 500;
	}

	PurchaseCollar() {
		if (!this.CanAffordCollar())
			return;
		Player.Money -= 500;
		this.settings.collarPurchased = true;
		ServerPlayerSync();
		settingsSave();
	}
}
