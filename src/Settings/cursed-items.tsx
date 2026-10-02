import { h } from "tsx-dom";
import { getModule } from "modules";
import { ICONS } from "utils";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { CursedItemModel, CursedItemSettingsModel, SpreadSpeed, StripLevel } from "./Models/cursed-item";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { DomSettingsHost } from "./domSettingsHost";
import { CheckboxRow, KitContext, NumberRow, openDialog, RuleTable, SectionLabel, SelectOption, SelectRow, Tabs } from "Dom/kit";

export const CURSED_ITEM_LIMIT: number = 100;

const ALLOWED_OPTIONS: SelectOption[] = [
	{ value: "Public", label: "Everyone (except blacklisted)" },
	{ value: "Friend", label: "Friends and above" },
	{ value: "Whitelist", label: "Whitelisted and above" },
	{ value: "Lover", label: "Lovers and above" },
	{ value: "Owner", label: "Owners or Self" },
	{ value: "Self", label: "Self Only" },
];

const SPEED_LABELS: Record<SpreadSpeed, string> = {
	slow: "Slow (15 minutes per item)",
	medium: "Medium (1 minute per item)",
	fast: "Fast (10 seconds per item)",
	instant: "Instant",
	custom: "Custom (seconds)",
};
const SPEED_OPTIONS: SelectOption[] = (Object.keys(SPEED_LABELS) as SpreadSpeed[]).map(v => ({ value: v, label: SPEED_LABELS[v] }));

const { CLOTHES, UNDERWEAR, COSPLAY } = StripLevel;
const STRIP_OPTIONS: SelectOption[] = ([
	[StripLevel.NONE, "None"],
	[CLOTHES, "Clothing"],
	[UNDERWEAR, "Underwear"],
	[COSPLAY, "Cosplay"],
	[CLOTHES | UNDERWEAR, "Clothes + Underwear"],
	[CLOTHES | COSPLAY, "Clothes + Cosplay"],
	[UNDERWEAR | COSPLAY, "Underwear + Cosplay"],
	[CLOTHES | UNDERWEAR | COSPLAY, "Clothes + Underwear + Cosplay"],
] as [number, string][]).map(([value, label]) => ({ value: String(value), label }));

const speedOf = (item: CursedItemModel): SpreadSpeed => item.Speed || "medium";

function formatSeconds(total: number): string {
	return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m ${total % 60}s`;
}

/** The player's saved outfits; keeps a saved key selectable even if that outfit was since deleted. */
function outfitOptions(item: CursedItemModel): SelectOption[] {
	const names = (getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data.GetOutfitNames() ?? []).slice().sort();
	if (item.OutfitKey && !names.includes(item.OutfitKey)) names.unshift(item.OutfitKey);
	return [{ value: "", label: names.length ? "— choose outfit —" : "— no saved outfits —" }, ...names.map(n => ({ value: n, label: n }))];
}

function openCursedItemDialog(anchor: HTMLElement, ctx: KitContext, item: CursedItemModel) {
	openDialog(anchor, ctx, item.Name || "Cursed Item", dctx => {
		const off = () => !item.Enabled;
		const duration = <small class="lscg-kit-desc" /> as HTMLElement;
		dctx.watch(() => {
			duration.hidden = speedOf(item) !== "custom";
			duration.textContent = `Each item applies after ${formatSeconds(item.CustomSpeed || 300)}.`;
		});
		return [
			CheckboxRow(dctx, {
				label: "Enabled", description: "If checked, this cursed item is active and can spread.",
				get: () => item.Enabled ?? false, set: v => item.Enabled = v,
			}),
			SelectRow(dctx, {
				label: "Applied outfit", description: "Outfit name that will be applied by the cursed item.",
				options: outfitOptions(item), get: () => item.OutfitKey ?? "", set: v => item.OutfitKey = v, disabled: off,
			}),
			CheckboxRow(dctx, {
				label: "Inexhaustable", description: "If checked, this cursed item will continue to enforce its outfit until removed.",
				get: () => item.Inexhaustable ?? false, set: v => item.Inexhaustable = v, disabled: off,
			}),
			CheckboxRow(dctx, {
				label: "Suppress emote", description: "If checked, this item will not publically emote as it grows item by item. They will still inform locally.",
				get: () => item.SuppressEmote ?? false, set: v => item.SuppressEmote = v, disabled: off,
			}),
			SelectRow(dctx, {
				label: "Strip level", description: "Determines what type of non-outfit appearance items will also be removed.",
				options: STRIP_OPTIONS, get: () => String(item.Strip || StripLevel.NONE), set: v => item.Strip = Number(v), disabled: off,
			}),
			CheckboxRow(dctx, {
				label: "Insta-strip", description: "If true, the victim will be stripped instantly regardless of apply speed.",
				get: () => item.InstaStrip ?? false, set: v => item.InstaStrip = v, disabled: off,
			}),
			SelectRow(dctx, {
				label: "Apply speed", description: "Determines how fast the cursed item applies its outfit.",
				options: SPEED_OPTIONS, get: () => speedOf(item), disabled: off,
				set: v => {
					item.Speed = v as SpreadSpeed;
					if (item.Speed === "custom" && !item.CustomSpeed) item.CustomSpeed = 300;
				},
			}),
			NumberRow(dctx, {
				label: "Custom speed (seconds)", description: "Determines the speed (in seconds). Must be between 1 and 3600 (1 hour)",
				min: 1, max: 3600, slider: true, get: () => item.CustomSpeed || 300, set: v => item.CustomSpeed = v,
				disabled: off, hidden: () => speedOf(item) !== "custom",
			}),
			duration,
		];
	});
}

export class GuiCursedItems extends GuiSubscreen {
	private _host = new DomSettingsHost("lscg-cursed-item-settings", () => this.build());

	get name(): string {
		return "Cursed Items";
	}

	get icon(): string {
		return ICONS.LEASH;
	}

	get settings(): CursedItemSettingsModel {
        return super.settings as CursedItemSettingsModel;
    }

	get help(): HelpInfo {
		return {
			label: "Open Cursed Items Wiki on GitHub",
			link: "https://github.com/littlesera/LSCG/wiki/Cursed-Items",
		};
	}

	private build(): Node {
		const s = this.settings;
		const ctx = new KitContext();
		const off = () => !s.enabled;
		return Tabs([
			{
				label: "General",
				render: () => [
					CheckboxRow(ctx, {
						label: "Enable cursed items", description: "Enable Cursed Items.",
						get: () => s.enabled ?? false, set: v => s.enabled = v,
					}),
					CheckboxRow(ctx, {
						label: "Vulnerable", description: "If checked, you are vulnerable to cursed items and susceptable to their effects when worn...",
						get: () => s.Vulnerable ?? false, set: v => s.Vulnerable = v, disabled: off,
					}),
					SelectRow(ctx, {
						label: "Allowed crafter", description: "Who's cursed items can can activate on you. (based on: Public < Friend < Whitelist < Lover < Owner < Self)",
						options: ALLOWED_OPTIONS, get: () => s.Allowed ?? "Self", set: v => s.Allowed = v as CursedItemSettingsModel["Allowed"],
					}),
					CheckboxRow(ctx, {
						label: "Suppress emotes", description: "If true, no cursed items on you will publically emote as they grow item by item. They will still inform locally.",
						get: () => s.SuppressEmote ?? false, set: v => s.SuppressEmote = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Always exhaust", description: "If true, All cursed items on you will exhaust after applying their outfit regardless of item settings.",
						get: () => s.AlwaysExhaust ?? false, set: v => s.AlwaysExhaust = v, disabled: off,
					}),
					CheckboxRow(ctx, {
						label: "Prevent impossible curse items", description: "If true, a cursed set will not add items to groups that are blocked at the time of curse application (ie: a curse will not add a vibrator under locked chastity).",
						get: () => s.BlockExistingGroups ?? false, set: v => s.BlockExistingGroups = v, disabled: off,
					}),
				],
			},
			{
				label: "Cursed items",
				render: () => [
					SectionLabel("Cursed items", "Create a cursed item that can spread. Its name is the trigger phrase a crafted item needs. Use Edit… for its speed and stripping."),
					RuleTable(ctx, {
						rows: () => s.CursedItems ??= [],
						max: CURSED_ITEM_LIMIT,
						addLabel: "+ New cursed item",
						deleteLabel: "Delete cursed item",
						create: () => ({ Name: `Cursed Item No. ${(s.CursedItems?.length ?? 0) + 1}`, Enabled: true }) as CursedItemModel,
						columns: [
							{ header: "Name", kind: "text", width: "30%", maxLength: 255, tooltip: "Trigger phrase required.", get: it => it.Name, set: (it, v) => it.Name = v || it.Name },
							{ header: "Outfit", kind: "select", options: outfitOptions, get: it => it.OutfitKey ?? "", set: (it, v) => it.OutfitKey = v, disabled: it => !it.Enabled },
							{
								header: "Speed", kind: "custom", width: "25%",
								render: it => {
									const edit = <button class="lscg-button lscg-kit-edit" onClick={() => openCursedItemDialog(edit, ctx, it)}>Edit…</button> as HTMLButtonElement;
									const speed = speedOf(it) === "custom" ? formatSeconds(it.CustomSpeed || 300) : speedOf(it)[0].toUpperCase() + speedOf(it).slice(1);
									return <div class="lscg-kit-details"><small class="lscg-kit-desc lscg-kit-summary">{speed}</small>{edit}</div> as HTMLElement;
								},
								get: () => "", set: () => {},
							},
							{ header: "On", kind: "checkbox", width: "3.5em", tooltip: "If checked, this cursed item is active and can spread.", get: it => it.Enabled, set: (it, v) => it.Enabled = v },
						],
					}),
				],
			},
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
