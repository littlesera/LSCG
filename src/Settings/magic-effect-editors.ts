import { KitContext, SelectOption, SelectRow, TextRow } from "Dom/kit";
import { MAX_ROLL_LENGTH } from "Modules/Magic/dice";
import { damageRoll, MAX_DAMAGE_ROLL } from "Modules/Magic/effects/damage";
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

/** Editors for effects that keep their settings in `SpellDefinition.Configs`, by effect id. */
export const EFFECT_EDITORS: Partial<Record<string, EffectEditor>> = {
    [LSCGSpellEffect.damage]: damageEditor,
};
