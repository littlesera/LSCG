import { h } from "tsx-dom";
import { Chip, CheckboxRow, KitContext, KitTab, NumberRow, RuleTable, SectionLabel } from "Dom/kit";
import { extensionDrugs, type ExtensionDrug } from "api/drugs";
import type { InjectorModule } from "Modules/injector";
import type { InjectorSettingsModel } from "./Models/injector";
import type { MiscSettingsModel } from "./Models/base";

const MAX_SIPS = 1000;

/** What a crafted item needs to say to be this drug, as chips so long keyword lists stay readable. */
function keywordChips(drug: ExtensionDrug): HTMLElement {
    return <div class="lscg-kit-chips">{drug.keywords.map(k => Chip(`"${k}"`, { tone: "muted" }))}</div> as HTMLElement;
}

function drugNameCell(drug: ExtensionDrug): HTMLElement {
    return <div class="lscg-kit-chips">
        <b>{drug.label}</b>
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

/** The Drug Enhancements settings: general options, the drugs (LSCG's own and extensions'), and gases/chloroform. */
export function buildInjectorTabs(ctx: KitContext, s: InjectorSettingsModel, misc: MiscSettingsModel, injector: InjectorModule | undefined): KitTab[] {
    return [
        {
            label: "General",
            render: () => [
                CheckboxRow(ctx, {
                    label: "Enabled", description: "Enable Enhanced Drinks, Injectors and Net Gun.",
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
                    label: "Heartbeat sound", description: "An occasional heartbeat sound while under the influence of aphrodisiac.",
                    get: () => s.heartbeat ?? true, set: v => s.heartbeat = v,
                }),
                CheckboxRow(ctx, {
                    label: "Chaotic net gun", description: "Your net gun fires wildly and has a 50/50 chance to net a random character instead of your target.",
                    get: () => s.netgunIsChaotic ?? true, set: v => s.netgunIsChaotic = v,
                }),
            ],
        },
        {
            label: "Drugs",
            render: () => [
                SectionLabel("LSCG's drugs", "Each activates for any injector or drink with one of its keywords in its crafted name or description."),
                CheckboxRow(ctx, {
                    label: "Sedative", description: "Activates for \"sedative\" or \"tranquilizer\".",
                    get: () => s.enableSedative ?? false, set: v => s.enableSedative = v,
                }),
                CheckboxRow(ctx, {
                    label: "Brainwash drug", description: "Activates for \"mind control,\" \"hypnotizing,\" or \"brainwashing\".",
                    get: () => s.enableMindControl ?? false, set: v => s.enableMindControl = v,
                }),
                CheckboxRow(ctx, {
                    label: "Aphrodisiac", description: "Activates for \"horny\" or \"aphrodisiac\".",
                    get: () => s.enableHorny ?? false, set: v => s.enableHorny = v,
                }),
                SectionLabel("Extension drugs", "Drugs added by extensions. Each one only affects you once you enable it."),
                extensionDrugs.all().length > 0 ? extensionDrugTable(ctx, injector) : <p class="lscg-kit-notice">No installed extension adds a drug.</p> as HTMLElement,
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
