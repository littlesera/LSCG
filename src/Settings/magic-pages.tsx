import { h } from "tsx-dom";
import { getModule } from "modules";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { allEffectIds, effectDescription, effectLabel, getSpellEffect, isPairedEffect, spellHasPairedEffect } from "Modules/Magic/spellEffects";
import { Chip, CheckboxRow, KitContext, KitTab, NumberRow, openDialog, RuleTable, SectionLabel, SelectOption, SelectRow, TextRow } from "Dom/kit";
import { KNOWN_SPELLS_LIMIT, MagicPublicSettingsModel, MagicSettingsModel, OutfitOption, PolymorphConfig, SpellDefinition, SpellEffectId } from "./Models/magic";
import type { SpiritTextType } from "./magic";

export interface MagicPagesOptions {
    /** Viewing another player's settings through remote access. */
    remote: boolean;
    /** Effects to offer for blocking: everything this client knows locally, or what the remote target supports. */
    effects: SpellEffectId[];
}

const SPELL_NAME_MAX = 100;
const OUTFIT_KEY_MAX = 10000; // keys may be pasted outfit codes
const MAX_DURATION_MINUTES = 7 * 24 * 60;

const OUTFIT_OPTIONS: SelectOption[] = Object.values(OutfitOption).map(o => ({ value: o, label: o }));
const SPIRIT_TEXT_OPTIONS: SelectOption[] = (["None", "Glow", "Float"] as SpiritTextType[]).map(o => ({ value: o, label: o }));

/** Shows/hides `el` with `hidden()`, re-checked after every change. */
function hiddenWhen<T extends HTMLElement>(ctx: KitContext, el: T, hidden: () => boolean): T {
    ctx.watch(() => { el.hidden = hidden(); });
    return el;
}

function toggle<T>(list: T[], item: T, on: boolean): T[] {
    const without = list.filter(x => x !== item);
    return on ? [...without, item] : without;
}

function effectChip(id: SpellEffectId): HTMLElement {
    const def = getSpellEffect(id);
    return Chip(effectLabel(id), { tone: def ? "muted" : "warn", tooltip: effectDescription(id) });
}

function effectNameCell(id: SpellEffectId): HTMLElement {
    const def = getSpellEffect(id);
    return <div class="lscg-kit-chips">
        <span>{effectLabel(id)}</span>
        {!def ? Chip("not installed", { tone: "warn", tooltip: "Comes from an extension this client doesn't have." })
            : def.source ? Chip(def.source, { tone: "info", tooltip: "Added by an extension." }) : null}
    </div> as HTMLElement;
}

function blockedEffectsTable(ctx: KitContext, s: MagicPublicSettingsModel, opts: MagicPagesOptions): HTMLElement {
    // Keep blocks on effects that aren't listed (e.g. an uninstalled extension's) visible so they can be removed.
    const ids = () => [...opts.effects, ...(s.blockedSpellEffects ?? []).filter(id => opts.effects.indexOf(id) < 0)].map(id => ({ id }));
    return RuleTable(ctx, {
        fixed: true,
        rows: ids,
        columns: [
            { header: "Effect", kind: "custom", width: "30%", render: r => effectNameCell(r.id), get: () => "", set: () => {} },
            { header: "Description", kind: "custom", render: r => <small class="lscg-kit-desc">{effectDescription(r.id)}</small> as HTMLElement, get: () => "", set: () => {} },
            {
                header: "Block", kind: "checkbox", width: "4.5em",
                tooltip: opts.remote ? "Spells can't apply this effect to them." : "Spells can't apply this effect to you.",
                get: r => (s.blockedSpellEffects ?? []).includes(r.id),
                set: (r, v) => {
                    s.blockedSpellEffects = toggle(s.blockedSpellEffects ?? [], r.id, v);
                    if (!v) s.bypassForSelfEffects = toggle(s.bypassForSelfEffects ?? [], r.id, false);
                },
            },
            {
                header: "Allow self", kind: "checkbox", width: "6em",
                tooltip: opts.remote ? "Their own spells still apply this blocked effect." : "Your own spells still apply this blocked effect.",
                disabled: r => !(s.blockedSpellEffects ?? []).includes(r.id),
                get: r => (s.bypassForSelfEffects ?? []).includes(r.id),
                set: (r, v) => s.bypassForSelfEffects = toggle(s.bypassForSelfEffects ?? [], r.id, v),
            },
        ],
    });
}

/** The spell editor dialog: casting options, effects (no slot limit), and outfit/polymorph configuration. */
function openSpellDialog(anchor: HTMLElement, ctx: KitContext, spell: SpellDefinition) {
    openDialog(anchor, ctx, spell.Name || "Spell", dctx => {
        const has = (id: SpellEffectId) => spell.Effects.includes(id);
        const hasConfig = (kind: "outfit" | "polymorph") => spell.Effects.some(e => getSpellEffect(e)?.configurable === kind);
        const polymorph = (): PolymorphConfig => spell.Polymorph ??= { Code: "", Key: "" } as PolymorphConfig;
        // Every known effect, plus any the spell has from an extension that's no longer installed.
        const ids = [...allEffectIds(), ...spell.Effects.filter(e => !getSpellEffect(e))];
        return [
            CheckboxRow(dctx, {
                label: "Allow voice casting",
                description: "Cast by typing the spell's name, or its casting phrase, followed by the target's name.",
                get: () => !!spell.AllowVoiceCast, set: v => spell.AllowVoiceCast = v,
            }),
            TextRow(dctx, {
                label: "Casting phrase", placeholder: spell.Name, maxLength: SPELL_NAME_MAX,
                description: "Optional phrase to use instead of the spell's name when voice casting.",
                get: () => spell.CastingPhrase ?? "", set: v => spell.CastingPhrase = v.trim(),
                disabled: () => !spell.AllowVoiceCast,
            }),
            CheckboxRow(dctx, {
                label: "Allow potion",
                description: "Can be brewed into crafted bottles, glasses or mugs named after the spell. Not possible for spells with a paired effect.",
                get: () => !spellHasPairedEffect(spell) && !!spell.AllowPotion, set: v => spell.AllowPotion = v,
                disabled: () => spellHasPairedEffect(spell),
            }),
            SectionLabel("Effects", "Everything the spell does to its target, applied in this order."),
            ...ids.map(id => CheckboxRow(dctx, {
                label: effectLabel(id),
                description: effectDescription(id),
                get: () => has(id),
                set: v => {
                    spell.Effects = toggle(spell.Effects, id, v);
                    if (v && isPairedEffect(id)) spell.AllowPotion = false;
                },
            })),
            hiddenWhen(dctx, SectionLabel("Outfit", "Which outfit the Outfit effect puts on the target."), () => !hasConfig("outfit")),
            TextRow(dctx, {
                label: "Outfit", maxLength: OUTFIT_KEY_MAX, placeholder: "Outfit name",
                description: "An outfit name from your LSCG outfits or MBS wheel, a wardrobe slot number, or a pasted outfit code.",
                get: () => spell.Outfit?.Key ?? "",
                set: v => spell.Outfit = { Code: "", Option: spell.Outfit?.Option ?? OutfitOption.both, ...spell.Outfit, Key: v.trim() },
                hidden: () => !hasConfig("outfit"),
            }),
            SelectRow(dctx, {
                label: "Parts to put on", options: OUTFIT_OPTIONS,
                get: () => spell.Outfit?.Option ?? OutfitOption.both,
                set: v => spell.Outfit = { Code: "", Key: "", ...spell.Outfit, Option: v as OutfitOption },
                hidden: () => !hasConfig("outfit"),
            }),
            hiddenWhen(dctx, SectionLabel("Polymorph", "Which body the Polymorph effect gives the target."), () => !hasConfig("polymorph")),
            TextRow(dctx, {
                label: "Outfit", maxLength: OUTFIT_KEY_MAX, placeholder: "Outfit name",
                description: "An outfit name from your LSCG outfits or MBS wheel, a wardrobe slot number, or a pasted outfit code.",
                get: () => spell.Polymorph?.Key ?? "", set: v => polymorph().Key = v.trim(),
                hidden: () => !hasConfig("polymorph"),
            }),
            CheckboxRow(dctx, {
                label: "Cosplay", description: "Applies cosplay items from the outfit.",
                get: () => !!spell.Polymorph?.IncludeCosplay, set: v => polymorph().IncludeCosplay = v,
                hidden: () => !hasConfig("polymorph"),
            }),
            CheckboxRow(dctx, {
                label: "Whole body", description: "Changes the whole body: hair, skin, jewelry, makeup and genitals.",
                get: () => !!spell.Polymorph?.IncludeAllBody,
                set: v => {
                    const p = polymorph();
                    p.IncludeAllBody = p.IncludeHair = p.IncludeSkin = p.IncludeGenitals = v;
                },
                hidden: () => !hasConfig("polymorph"),
            }),
            ...([["IncludeHair", "Hair"], ["IncludeSkin", "Skin, jewelry and makeup"], ["IncludeGenitals", "Genitals"]] as const).map(([key, label]) => CheckboxRow(dctx, {
                label,
                get: () => !!spell.Polymorph?.[key], set: v => polymorph()[key] = v,
                disabled: () => !!spell.Polymorph?.IncludeAllBody,
                hidden: () => !hasConfig("polymorph"),
            })),
        ];
    });
}

function spellsTable(ctx: KitContext, s: MagicSettingsModel): HTMLElement {
    return RuleTable(ctx, {
        rows: () => s.knownSpells ??= [],
        max: KNOWN_SPELLS_LIMIT,
        addLabel: "+ New spell",
        deleteLabel: "Forget spell",
        create: (): SpellDefinition => ({
            Name: `Spell No. ${(s.knownSpells?.length ?? 0) + 1}`,
            Creator: Player.MemberNumber ?? -1,
            Effects: [],
            AllowPotion: false,
            AllowVoiceCast: false,
        }),
        columns: [
            { header: "Name", kind: "text", width: "25%", maxLength: SPELL_NAME_MAX, get: sp => sp.Name, set: (sp, v) => sp.Name = v || sp.Name },
            {
                header: "Effects", kind: "custom",
                render: (sp, readOnly) => {
                    const edit = <button class="lscg-button lscg-kit-edit" disabled={readOnly} onClick={() => openSpellDialog(edit, ctx, sp)}>Edit…</button> as HTMLButtonElement;
                    return <div class="lscg-kit-details">
                        <div class="lscg-kit-chips lscg-kit-summary">
                            {sp.Effects.length > 0 ? sp.Effects.map(effectChip) : <small class="lscg-kit-desc">No effects yet</small>}
                        </div>
                        {edit}
                    </div> as HTMLElement;
                },
                get: () => "", set: () => {},
            },
            {
                header: "Voice", kind: "checkbox", width: "4.5em", tooltip: "Can be cast by typing its name (or casting phrase) and a target.",
                get: sp => !!sp.AllowVoiceCast, set: (sp, v) => sp.AllowVoiceCast = v,
            },
            {
                header: "Potion", kind: "checkbox", width: "4.5em", tooltip: "Can be brewed into a crafted drink named after it. Not possible with a paired effect.",
                get: sp => !spellHasPairedEffect(sp) && !!sp.AllowPotion, set: (sp, v) => sp.AllowPotion = v,
                disabled: sp => spellHasPairedEffect(sp),
            },
        ],
    });
}

export function buildMagicTabs(ctx: KitContext, s: MagicPublicSettingsModel, opts: MagicPagesOptions): KitTab[] {
    const local = s as MagicSettingsModel;
    const you = opts.remote ? "they" : "you";
    const your = opts.remote ? "their" : "your";

    const tabs: KitTab[] = [
        {
            label: "General",
            render: () => [
                ...(opts.remote ? [] : [
                    CheckboxRow(ctx, { label: "Enabled", description: "Use Magic™ and let spells affect you.", get: () => !!s.enabled, set: v => s.enabled = v }),
                ]),
                SectionLabel("Wild magic"),
                CheckboxRow(ctx, {
                    label: "Enable wild magic", description: "Cast a random spell from the spell list, with a chance of a truly random spell.",
                    get: () => !!s.enableWildMagic,
                    set: v => {
                        s.enableWildMagic = v;
                        if (!v) s.forceWildMagic = s.trueWildMagic = false;
                    },
                }),
                CheckboxRow(ctx, { label: "Force wild magic", description: "Prevents choosing which spell to cast.", get: () => !!s.forceWildMagic, set: v => s.forceWildMagic = v, disabled: () => !s.enableWildMagic }),
                CheckboxRow(ctx, { label: "True wild magic", description: "Always generates a truly random spell.", get: () => !!s.trueWildMagic, set: v => s.trueWildMagic = v, disabled: () => !s.enableWildMagic }),
                SectionLabel("Other"),
                CheckboxRow(ctx, { label: "Prevent X-ray vision", description: `Lead-lines all ${your} clothing.`, get: () => s.blockXRay ?? true, set: v => s.blockXRay = v }),
            ],
        },
        {
            label: "Effects",
            render: () => [
                SectionLabel("Blocked effects", `Blocked effects never apply to ${opts.remote ? "them" : "you"}. "Allow self" still lets ${your} own spells apply them.`),
                blockedEffectsTable(ctx, s, opts),
            ],
        },
    ];

    if (!opts.remote)
        tabs.push({
            label: "Spells",
            render: () => [
                SectionLabel("Known spells", "Create your arcane sorceries and potions. Use Edit… to choose a spell's effects."),
                spellsTable(ctx, local),
            ],
        });

    tabs.push({
        label: "Defense",
        render: () => [
            SectionLabel("Defense"),
            CheckboxRow(ctx, { label: "Never defend", description: `${opts.remote ? "They" : "You"} never roll to resist spells.`, get: () => !!s.neverDefend, set: v => s.neverDefend = v }),
            TextRow(ctx, {
                label: "Defenseless against", placeholder: "Member numbers, comma separated",
                description: `${opts.remote ? "They" : "You"} never resist spells from these members.`,
                get: () => s.noDefenseMemberIds ?? "", set: v => s.noDefenseMemberIds = v, disabled: () => !!s.neverDefend,
            }),
            CheckboxRow(ctx, {
                label: "Limited spell duration",
                description: `Harmful spell effects wear off eventually; the worse ${you} fail the roll against the caster, the longer they last.`,
                get: () => !!s.limitedDuration, set: v => s.limitedDuration = v,
            }),
            NumberRow(ctx, {
                label: "Maximum duration (minutes)", description: "Longest any spell effect lasts. 0 means no maximum.",
                min: 0, max: MAX_DURATION_MINUTES, get: () => s.maxDuration ?? 0, set: v => s.maxDuration = v, disabled: () => !s.limitedDuration,
            }),
            ...(opts.remote ? [] : [
                CheckboxRow(ctx, { label: "Require whitelist", description: "Only people on your whitelist can cast spells on you or teach you spells.", get: () => !!s.requireWhitelist, set: v => s.requireWhitelist = v }),
            ]),
            SectionLabel("Outfits and polymorph"),
            CheckboxRow(ctx, { label: "Outfits may change neck items", description: `Outfit effects can replace ${your} neck items.`, get: () => !!s.allowOutfitToChangeNeckItems, set: v => s.allowOutfitToChangeNeckItems = v }),
            CheckboxRow(ctx, { label: "Polymorph may change genitals", get: () => s.allowChangeGenitals ?? true, set: v => s.allowChangeGenitals = v }),
            ...(opts.remote ? [] : [
                CheckboxRow(ctx, { label: "Polymorph may change pronouns", get: () => local.allowChangePronouns ?? true, set: v => local.allowChangePronouns = v }),
            ]),
            SectionLabel("Remote access"),
            ...(opts.remote
                ? [
                    CheckboxRow(ctx, {
                        label: "Locked", description: "Locks them out of their own Magic™ settings. Only possible if they allow it.",
                        get: () => !!s.locked, set: v => { if (s.lockable) s.locked = v; }, disabled: () => !s.lockable,
                    }),
                ]
                : [
                    CheckboxRow(ctx, { label: "Allow remote access", description: "Allowed players can change these settings.", get: () => !!s.remoteAccess, set: v => s.remoteAccess = v }),
                    CheckboxRow(ctx, { label: "Lockable", description: "Allowed players can lock you out of these settings.", get: () => !!s.lockable, set: v => s.lockable = v, disabled: () => !s.remoteAccess }),
                    TextRow(ctx, {
                        label: "Allowed members", placeholder: "Member numbers, comma separated",
                        description: "If empty, normal item permissions decide.",
                        get: () => s.remoteMemberIds ?? "", set: v => s.remoteMemberIds = v, disabled: () => !s.remoteAccess,
                    }),
                ]),
            CheckboxRow(ctx, {
                label: "Requires trance", description: `Remote access only works while ${you} are hypnotized.`,
                get: () => s.remoteAccessRequiredTrance ?? true, set: v => s.remoteAccessRequiredTrance = v, disabled: () => !opts.remote && !s.remoteAccess,
            }),
            CheckboxRow(ctx, {
                label: "Only the hypnotizer", description: `Only whoever hypnotized ${opts.remote ? "them" : "you"} gets remote access.`,
                get: () => s.limitRemoteAccessToHypnotizer ?? true, set: v => s.limitRemoteAccessToHypnotizer = v,
                disabled: () => (!opts.remote && !s.remoteAccess) || !(s.remoteAccessRequiredTrance ?? true),
            }),
        ],
    });

    if (!opts.remote)
        tabs.push({
            label: "Astral projection",
            render: () => {
                const names = getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data?.GetOutfitNames()?.sort() ?? [];
                const outfitOptions = (): SelectOption[] => {
                    const list = [...names];
                    if (local.spiritFormOutfitKey && !list.includes(local.spiritFormOutfitKey)) list.unshift(local.spiritFormOutfitKey);
                    return [{ value: "", label: list.length ? "— none —" : "— no saved outfits —" }, ...list.map(n => ({ value: n, label: n }))];
                };
                return [
                    SectionLabel("Spirit form", "How you look and sound while projected."),
                    SelectRow(ctx, { label: "Spirit speech", options: SPIRIT_TEXT_OPTIONS, get: () => local.spiritTextFormat ?? "Float", set: v => local.spiritTextFormat = v as SpiritTextType }),
                    TextRow(ctx, {
                        label: "Spirit color", placeholder: "#00ced1", maxLength: 32, description: "Tint for your projection.",
                        get: () => local.projectionTintColor ?? "#00ced1", set: v => local.projectionTintColor = v.trim() || "#00ced1",
                    }),
                    SelectRow(ctx, {
                        label: "Spirit outfit", options: outfitOptions(),
                        description: "Outfit used for your spirit form. Best if it includes all body, cosplay and clothing.",
                        get: () => local.spiritFormOutfitKey ?? "", set: v => local.spiritFormOutfitKey = v,
                    }),
                    CheckboxRow(ctx, { label: "Hide corporeal form", description: "Your body vanishes while you're projected.", get: () => !!local.hideCorporeal, set: v => local.hideCorporeal = v }),
                    CheckboxRow(ctx, { label: "Disable soul bindings", description: "Soul-bound restraints can't bind your spirit form.", get: () => !!local.disableSoulBindings, set: v => local.disableSoulBindings = v }),
                ];
            },
        });

    return tabs;
}
