import { h } from "tsx-dom";
import { Chip, CheckboxRow, Expando, Icon, KitContext, KitTab, NumberRow, RuleTable, SectionLabel } from "Dom/kit";
import { BUILT_IN_DRUGS } from "Modules/drugs/builtin";
import { extensionDrugs, type ExtensionDrug } from "api/drugs";
import { optionRows } from "./optionRows";
import { summarizeOptions } from "api/options";
import type { InjectorModule } from "Modules/injector";
import type { InjectorSettingsModel } from "./Models/injector";
import type { MiscSettingsModel } from "./Models/base";

const MAX_SIPS = 1000;
const MAX_DECAY_MINUTES = 240;

/** What a crafted item needs to say to be this drug, as chips so long keyword lists stay readable. */
function keywordChips(drug: ExtensionDrug): HTMLElement {
    return <div class="lscg-kit-chips">{drug.keywords.map(k => Chip(`"${k}"`, { tone: "muted" }))}</div> as HTMLElement;
}

/** A drug's name, marked the way the spell effects and suggestion instructions tables mark an extension's: the extension icon before the
 *  name and a chip naming the extension. */
export function drugNameCell(drug: ExtensionDrug): HTMLElement {
    return <div class="lscg-kit-chips">
        <span>{Icon("extension", "Added by an extension")}{drug.label}</span>
        {Chip(drug.source, { tone: "info", tooltip: "Added by an extension." })}
        {drug.description ? <small class="lscg-kit-desc">{drug.description}</small> : null}
    </div> as HTMLElement;
}

/** Extension drugs the player can opt in to, one row each. They only work on the player once enabled. */
function extensionDrugTable(ctx: KitContext, injector: InjectorModule | undefined): HTMLElement {
    return RuleTable(ctx, {
        fixed: true,
        rows: () => extensionDrugs.all(),
        columns: [
            { header: "Drug", kind: "custom", width: "35%", render: drug => drugNameCell(drug), get: () => "", set: () => {} },
            { header: "Activates for", kind: "custom", render: drug => keywordChips(drug), get: () => "", set: () => {} },
            {
                header: "Enabled", kind: "checkbox", width: "6em",
                tooltip: "Lets this drug affect you.",
                get: drug => injector?.ExtensionDrugEnabled(drug.id) ?? false,
                set: (drug, enabled) => injector?.SetExtensionDrugEnabled(drug.id, enabled),
            },
        ],
    });
}

/** The settings each extension drug declared, one closed section per drug under the table. */
function extensionDrugOptions(ctx: KitContext, injector: InjectorModule | undefined): HTMLElement[] {
    if (!injector)
        return [];
    return extensionDrugs.all().filter(drug => drug.options.length > 0).map(drug => {
        const current = () => injector.EditableExtensionOptions(drug.id);
        return Expando(ctx, {
            summary: () => `${drug.label} settings: ${summarizeOptions(drug.options, current())}`,
            content: optionRows(ctx, drug.options, current, patch => injector.SetExtensionOptions(drug.id, patch)),
        });
    });
}

/** The Drug Enhancements settings: general options, LSCG's own drugs, the drugs extensions add, and gases/chloroform. */
export function buildInjectorTabs(ctx: KitContext, s: InjectorSettingsModel, misc: MiscSettingsModel, injector: InjectorModule | undefined): KitTab[] {
    return [
        {
            label: "General",
            render: () => [
                CheckboxRow(ctx, {
                    label: "Enabled", description: "Enable Enhanced Drinks and Injectors.",
                    get: () => s.enabled ?? false, set: v => s.enabled = v,
                }),
                NumberRow(ctx, {
                    label: "Filled glass sip limit", description: "Number of sips before your filled glasses empty. (0 for no limit)",
                    min: 0, max: MAX_SIPS, get: () => s.sipLimit ?? 0, set: v => s.sipLimit = v, disabled: () => !s.enabled,
                }),
                CheckboxRow(ctx, {
                    label: "Show drug levels", description: "Displays bars showing the level of each drug type.",
                    get: () => s.showDrugLevels ?? true, set: v => s.showDrugLevels = v,
                }),
                CheckboxRow(ctx, {
                    label: "Drug visuals", description: "Master switch for the drugs' visual effects: the suggestible's sway, tint and blur, and the hypno spiral. (The spiral also has its own switch in Hypnosis settings.)",
                    get: () => s.enableDrugVisuals ?? true, set: v => s.enableDrugVisuals = v,
                }),
                CheckboxRow(ctx, {
                    label: "Swaying screen", description: "The warped, swaying screen while suggestible. Turn it off to keep just the green tint and blur. (Needs Drug visuals.)",
                    get: () => s.enableSuggestibleWave ?? true, set: v => s.enableSuggestibleWave = v, disabled: () => s.enableDrugVisuals === false,
                }),
                CheckboxRow(ctx, {
                    label: "Heartbeat sound", description: "An occasional heartbeat sound while under the influence of aphrodisiac.",
                    get: () => s.heartbeat ?? true, set: v => s.heartbeat = v,
                }),
            ],
        },
        {
            label: "Drugs",
            render: () => [
                SectionLabel("LSCG's drugs", "Each activates for any injector or drink with one of its keywords in its crafted name or description."),
                ...BUILT_IN_DRUGS.map(drug => CheckboxRow(ctx, {
                    label: drug.label, description: drug.activatesFor,
                    get: () => s[drug.enableKey] ?? false, set: v => s[drug.enableKey] = v,
                })),
                SectionLabel("How fast they wear off", "Minutes for one dose to wear off while you're online. Leave at 0 for LSCG's default."),
                ...BUILT_IN_DRUGS.map(drug => NumberRow(ctx, {
                    label: drug.label,
                    description: `Default: ${drug.defaultCooldown / 60_000} minutes per dose.`,
                    min: 0, max: MAX_DECAY_MINUTES, step: 0.5,
                    get: () => injector?.GetDecayOverride(drug.id) ?? 0,
                    set: v => injector?.SetDecayOverride(drug.id, v),
                    disabled: () => !injector,
                })),
            ],
        },
        {
            label: "Extension drugs",
            // Only there when an installed extension adds a drug.
            hidden: extensionDrugs.all().length === 0,
            render: () => [
                SectionLabel("Extension drugs", "Drugs added by extensions. Each one only affects you once you enable it."),
                extensionDrugTable(ctx, injector),
                ...extensionDrugOptions(ctx, injector),
            ],
        },
        {
            label: "Gases & chloroform",
            render: () => [
                SectionLabel("Gases", "Respirators can deliver a continuous supply of drugged gas."),
                CheckboxRow(ctx, {
                    label: "Allow continuous delivery", description: "Allows respirators to deliver a continuous supply of drugged gas.",
                    get: () => s.enableContinuousDelivery ?? true, set: v => s.enableContinuousDelivery = v,
                }),
                CheckboxRow(ctx, {
                    label: "Inexhaustible gases", description: "Any continuous delivery (e.g. a respirator) on you never runs out of gas.",
                    get: () => s.continuousDeliveryForever ?? false, set: v => s.continuousDeliveryForever = v,
                }),
                SectionLabel("Soaked items", "Crafted gags and masks with a drug word followed by \"-soaked\" or \"-laced\" (e.g. \"aphrodisiac-soaked\", \"intoxicant-laced\") dose you gradually while worn."),
                CheckboxRow(ctx, {
                    label: "Allow soaked items", description: "Allows crafted mouth, nose and face items soaked in a drug to dose you gradually.",
                    get: () => s.enableSoakedItems ?? true, set: v => s.enableSoakedItems = v,
                }),
                CheckboxRow(ctx, {
                    label: "Soaks never dry", description: "Soaked items on you stay potent for as long as they are worn; otherwise they dry out after an hour.",
                    get: () => s.infiniteSoakPotency ?? false, set: v => s.infiniteSoakPotency = v,
                }),
                SectionLabel("Chloroform"),
                CheckboxRow(ctx, {
                    label: "Enable chloroform", description: "Fall asleep if chloroformed.",
                    get: () => misc.chloroformEnabled ?? false, set: v => misc.chloroformEnabled = v,
                }),
                CheckboxRow(ctx, {
                    label: "Chloroform never fades", description: "One rag over your mouth lasts forever until removed; otherwise its potency fades after an hour.",
                    get: () => misc.infiniteChloroformPotency ?? false, set: v => misc.infiniteChloroformPotency = v,
                }),
            ],
        },
    ];
}
