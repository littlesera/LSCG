import { DamageConfig, DamageSave, DamageType, DEFAULT_DAMAGE_TYPE, LSCGSpellEffect } from "Settings/Models/magic";
import { SendAction } from "utils";
import { parseDiceRoll, rollDice } from "../dice";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

/** Damage settings with a known type, save behaviour and a roll that parses (an invalid roll becomes no roll). */
export function sanitizeDamageConfig(raw: unknown): DamageConfig {
    const { Type, Roll, Save } = (raw && typeof raw === "object" ? raw : {}) as Partial<DamageConfig>;
    return {
        Type: Object.values(DamageType).find(t => t === Type) ?? DEFAULT_DAMAGE_TYPE,
        Save: Object.values(DamageSave).find(s => s === Save) ?? DamageSave.half,
        Roll: typeof Roll === "string" ? parseDiceRoll(Roll)?.text ?? "" : "",
    };
}

export const DAMAGE_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.damage,
    label: LSCGSpellEffect.damage,
    description: "Hurts the target with a chosen type of damage, rolled from an optional dice expression. Only shown in chat for now.",
    stackable: 3,
    config: {
        defaults: (): DamageConfig => ({ Type: DEFAULT_DAMAGE_TYPE, Save: DamageSave.half, Roll: "" }),
        sanitize: sanitizeDamageConfig,
        summary: (c: DamageConfig) => `Damage settings: ${c.Type}${c.Roll ? ` ${c.Roll}${parseDiceRoll(c.Roll) ? "" : " (not a valid roll, so no number is rolled)"}` : ""}`,
        needsAttention: (c: DamageConfig) => !!c.Roll && !parseDiceRoll(c.Roll),
    },
    apply: ({ spell, senderName, saved, config }) => {
        const damage = (config as DamageConfig | undefined) ?? sanitizeDamageConfig(undefined);
        const type = damage.Type.toLowerCase();
        const roll = parseDiceRoll(damage.Roll);
        const halved = !!saved && damage.Save !== DamageSave.none;
        if (saved && !halved) {
            SendAction(`%NAME% saves against the ${type} damage of ${senderName}'s ${spell.Name} and takes none of it.`);
            return;
        }
        if (!roll) {
            SendAction(halved
                ? `%NAME% saves against ${senderName}'s ${spell.Name} and is only grazed by its ${type} damage.`
                : `%NAME% is struck by the ${type} damage of ${senderName}'s ${spell.Name}.`);
            return;
        }
        const result = rollDice(roll);
        const total = halved ? Math.floor(result.total / 2) : result.total;
        SendAction(halved
            ? `%NAME% saves against ${senderName}'s ${spell.Name} and takes only ${total} ${type} damage, half of ${result.total}. (${result.breakdown})`
            : `%NAME% takes ${total} ${type} damage from ${senderName}'s ${spell.Name}! (${result.breakdown})`);
    },
};
