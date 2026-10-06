import { CheckboxRow, KitContext, NumberRow, SelectOption, SelectRow, TextRow } from "Dom/kit";
import { MAX_ROLL_LENGTH } from "Modules/Magic/dice";
import { damageRoll, MAX_DAMAGE_ROLL } from "Modules/Magic/effects/damage";
import { DISSOLVE_LAYERS, DissolveConfig, DissolveLayers } from "Modules/Magic/effects/dissolve";
import { CONJURE_CRAFTABLE } from "Modules/Magic/effects/restraints";
import { COMMAND_WORDS, COMMANDS, CommandConfig, CommandWord, sanitizeCommandConfig } from "Modules/Magic/effects/command";
import { GRASPS, GraspConfig, GraspLocation, sanitizeGraspConfig } from "Modules/Magic/effects/grasp";
import { ConjureConfig, MAX_CONJURE_PIECES, sanitizeConjureConfig } from "Modules/Magic/conjure";
import { DamageConfig, DamageSave, DamageType, LSCGSpellEffect } from "./Models/magic";

/** The rows for an effect's own settings. `config` reads the stored settings (defaults filled in); `update` merges a change into them. */
export type EffectEditor<T = any> = (ctx: KitContext, config: () => T, update: (patch: Partial<T>) => void) => HTMLElement[];

const DAMAGE_TYPE_OPTIONS: SelectOption[] = Object.values(DamageType).map(t => ({ value: t, label: t }));
const DAMAGE_SAVE_OPTIONS: SelectOption[] = Object.values(DamageSave).map(t => ({ value: t, label: t }));

const damageEditor: EffectEditor<DamageConfig> = (ctx, config, update) => [
    SelectRow(ctx, {
        label: "Damage type", options: DAMAGE_TYPE_OPTIONS,
        description: "What kind of damage the spell does.",
        get: () => config().Type,
        set: v => update({ Type: v as DamageType }),
    }),
    SelectRow(ctx, {
        label: "On a successful save", options: DAMAGE_SAVE_OPTIONS,
        description: "The target rolls against the caster, even if they never resist other spells. A save halves the damage or avoids it entirely.",
        get: () => config().Save ?? DamageSave.half,
        set: v => update({ Save: v as DamageSave }),
    }),
    TextRow(ctx, {
        label: "Damage roll", placeholder: "e.g. 2d6 + 2", maxLength: MAX_ROLL_LENGTH,
        description: `Optional dice for how much damage, such as 2d6 + 2 or 1d8, totalling at most ${MAX_DAMAGE_ROLL}. Bigger rolls make the effect a higher tier. Rolled when the spell lands. Leave empty for damage with no number.`,
        get: () => config().Roll,
        set: v => update({ Roll: damageRoll(v)?.text ?? v.trim() }),
    }),
];

const DISSOLVE_LAYER_OPTIONS: SelectOption[] = DISSOLVE_LAYERS.map(l => ({ value: l.value, label: l.label }));

const dissolveEditor: EffectEditor<DissolveConfig> = (ctx, config, update) => [
    SelectRow(ctx, {
        label: "Dissolves", options: DISSOLVE_LAYER_OPTIONS,
        description: "Which of the target's layers the spell takes off. Cosplay, the body and restraints are never touched.",
        get: () => config().Layers,
        set: v => update({ Layers: v as DissolveLayers }),
    }),
];

const NO_CRAFT = "";

/** The player's crafted versions of the items an effect can wear. */
function craftsFor(effect: string): CraftingItem[] {
    const assets = CONJURE_CRAFTABLE[effect] ?? [];
    return (Player.Crafting ?? []).filter((c): c is CraftingItem => !!c && assets.includes(c.Item));
}

const craftKey = (c: { Item?: unknown; Name?: unknown }) => `${c.Item}|${c.Name}`;

/** Settings of an effect that conjures restraints: how many pieces, and optionally one of the player's crafted items to use. */
const conjureEditor = (effect: string): EffectEditor<ConjureConfig> => (ctx, config, update) => [
    NumberRow(ctx, {
        label: "Fewest pieces", min: 1, max: MAX_CONJURE_PIECES,
        description: "Each casting puts on at least this many pieces, on different slots.",
        get: () => config().Min,
        set: v => update({ Min: v, Max: Math.max(config().Max, v) }),
    }),
    NumberRow(ctx, {
        label: "Most pieces", min: 1, max: MAX_CONJURE_PIECES,
        description: "...and at most this many. How many is rolled each casting.",
        get: () => config().Max,
        set: v => update({ Max: v, Min: Math.min(config().Min, v) }),
    }),
    SelectRow(ctx, {
        label: "Crafted item",
        description: "Use one of your own crafted items instead of the plain one, for the slot it fits. Locks are never part of it.",
        options: [{ value: NO_CRAFT, label: "— the plain item —" }, ...craftsFor(effect).map(c => ({ value: craftKey(c), label: c.Name || c.Item }))],
        get: () => config().Craft ? craftKey(config().Craft as { Item?: unknown; Name?: unknown }) : NO_CRAFT,
        set: v => {
            const craft = craftsFor(effect).find(c => craftKey(c) === v);
            update({ Craft: craft ? sanitizeConjureConfig({ Craft: craft }).Craft : undefined });
        },
    }),
];

const COMMAND_OPTIONS: SelectOption[] = COMMANDS.map(c => ({ value: c.word, label: c.label }));

const commandEditor: EffectEditor<CommandConfig> = (ctx, config, update) => [
    SelectRow(ctx, {
        label: "Command", options: COMMAND_OPTIONS,
        description: "The word the spell commands. When the caster is asked, this is the one used if they can't be: a voice cast that doesn't say one, a potion, wild magic.",
        get: () => config().Word,
        set: v => update(sanitizeCommandConfig({ ...config(), Word: v })),
    }),
    CheckboxRow(ctx, {
        label: "Ask the caster",
        description: "Cast from the menu, the caster picks the word from the choices below. A voice cast can name it after the target (\"spell Alice kneel\").",
        get: () => config().Ask, set: v => update({ Ask: v }),
    }),
    ...COMMAND_WORDS.map(word => CheckboxRow(ctx, {
        label: `Choose: ${COMMANDS.find(c => c.word === word)!.label}`,
        get: () => config().Allowed.includes(word),
        set: v => update(sanitizeCommandConfig({ ...config(), Allowed: v ? [...config().Allowed, word] : config().Allowed.filter((w: CommandWord) => w !== word) })),
        disabled: () => !config().Ask || (config().Word === word),
    })),
];

const graspEditor: EffectEditor<GraspConfig> = (ctx, config, update) => GRASPS.map(grasp => CheckboxRow(ctx, {
    label: grasp.label,
    description: grasp.location === "neck" ? "A choke. It does nothing unless the target has allowed hand chokes in their settings." : grasp.teases ? "Squeezes now and then, raising arousal a little." : grasp.restricts === "Move" ? "Pins the arms." : grasp.restricts === "Walk" ? "Holds the legs still." : undefined,
    get: () => config().Locations.includes(grasp.location),
    set: v => update(sanitizeGraspConfig({ Locations: v ? [...config().Locations, grasp.location] : config().Locations.filter((l: GraspLocation) => l !== grasp.location) })),
}));

/** Editors for effects that keep their settings in `SpellDefinition.Configs`, by effect id. */
export const EFFECT_EDITORS: Partial<Record<string, EffectEditor>> = {
    [LSCGSpellEffect.damage]: damageEditor,
    [LSCGSpellEffect.dissolve]: dissolveEditor,
    [LSCGSpellEffect.web]: conjureEditor(LSCGSpellEffect.web),
    [LSCGSpellEffect.slime]: conjureEditor(LSCGSpellEffect.slime),
    [LSCGSpellEffect.ropes]: conjureEditor(LSCGSpellEffect.ropes),
    [LSCGSpellEffect.command]: commandEditor,
    [LSCGSpellEffect.grasp]: graspEditor,
};
