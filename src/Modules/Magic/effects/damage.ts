import { DamageConfig, DamageSave, DamageType, DEFAULT_DAMAGE_TYPE, LSCGSpellEffect } from "Settings/Models/magic";
import { SendAction } from "utils";
import { DiceRoll, maxRoll, parseDiceRoll, rollDice } from "../dice";
import type { SpellTier } from "../taxonomy";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

/** The largest total a Damaging roll may produce for each tier. It roughly doubles per tier, so a bigger roll costs a higher tier and
 *  a cheap spell can't hide a huge one. Rolls above the last limit aren't allowed. */
export const DAMAGE_TIER_LIMITS: [SpellTier, number][] = [[1, 8], [2, 20], [3, 48], [4, 112], [5, 256]];
export const MAX_DAMAGE_ROLL = DAMAGE_TIER_LIMITS[DAMAGE_TIER_LIMITS.length - 1][1];

/** A damage roll that parses and fits within the top tier. */
export function damageRoll(text: string | undefined): DiceRoll | undefined {
    const roll = parseDiceRoll(text);
    return roll && maxRoll(roll) <= MAX_DAMAGE_ROLL ? roll : undefined;
}

/** The tier a Damaging copy's roll puts it in; no roll is the lowest. */
export function damageTier(config: { Roll?: string }): SpellTier {
    const roll = damageRoll(config.Roll);
    const max = roll ? maxRoll(roll) : 0;
    return (DAMAGE_TIER_LIMITS.find(([, limit]) => max <= limit) ?? DAMAGE_TIER_LIMITS[0])[0];
}

/** Damage settings with a known type, save behaviour and a roll that parses (an invalid roll becomes no roll). */
export function sanitizeDamageConfig(raw: unknown): DamageConfig {
    const { Type, Roll, Save } = (raw && typeof raw === "object" ? raw : {}) as Partial<DamageConfig>;
    return {
        Type: Object.values(DamageType).find(t => t === Type) ?? DEFAULT_DAMAGE_TYPE,
        Save: Object.values(DamageSave).find(s => s === Save) ?? DamageSave.half,
        Roll: typeof Roll === "string" ? damageRoll(Roll)?.text ?? "" : "",
    };
}

export const DAMAGE_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.damage,
    label: LSCGSpellEffect.damage,
    description: "Hurts the target with a chosen type of damage, with an optional dice roll.",
    stackable: 3,
    tier: damageTier,
    onSave: (c: DamageConfig) => c.Save === DamageSave.none ? "negate" : "half",
    config: {
        defaults: (): DamageConfig => ({ Type: DEFAULT_DAMAGE_TYPE, Save: DamageSave.half, Roll: "" }),
        sanitize: sanitizeDamageConfig,
        summary: (c: DamageConfig) => {
            if (c.Roll && !parseDiceRoll(c.Roll))
                return `Damage settings: ${c.Type} ${c.Roll} (not a valid roll, so no number is rolled)`;
            if (c.Roll && !damageRoll(c.Roll))
                return `Damage settings: ${c.Type} ${c.Roll} (too big, rolls can total at most ${MAX_DAMAGE_ROLL}; no number is rolled)`;
            return `Damage settings: ${c.Type}${c.Roll ? ` ${c.Roll}` : ""}`;
        },
        needsAttention: (c: DamageConfig) => !!c.Roll && !damageRoll(c.Roll),
    },
    // A save that negates the damage never gets here: the spell's save handling skips the effect. Only a halving save does.
    apply: ({ saved, config }) => {
        const damage = (config as DamageConfig | undefined) ?? sanitizeDamageConfig(undefined);
        const type = damage.Type.toLowerCase();
        const roll = damageRoll(damage.Roll);
        const halved = !!saved;
        if (!roll) {
            SendAction(halved ? `%NAME% is grazed by ${type} damage.` : `%NAME% takes ${type} damage.`);
            return;
        }
        const result = rollDice(roll);
        const total = halved ? Math.floor(result.total / 2) : result.total;
        SendAction(halved
            ? `%NAME% takes ${total} ${type} damage, halved from ${result.total}. (${result.breakdown})`
            : `%NAME% takes ${total} ${type} damage. (${result.breakdown})`);
    },
};
