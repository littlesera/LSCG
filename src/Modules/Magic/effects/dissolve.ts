import { LSCGSpellEffect } from "Settings/Models/magic";
import { StripLevel } from "Settings/Models/cursed-item";
import { RemoveItem, SendAction, matchesStripLevel } from "utils";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

export type DissolveLayers = "clothing" | "underwear" | "both";

export interface DissolveConfig {
    Layers: DissolveLayers;
}

export const DISSOLVE_LAYERS: { value: DissolveLayers; label: string; level: StripLevel; what: string }[] = [
    { value: "clothing", label: "Clothing", level: StripLevel.CLOTHES, what: "clothes" },
    { value: "underwear", label: "Underwear", level: StripLevel.UNDERWEAR, what: "underwear" },
    { value: "both", label: "Clothing and underwear", level: StripLevel.CLOTHES | StripLevel.UNDERWEAR, what: "clothes and underwear" },
];

export function sanitizeDissolveConfig(raw: unknown): DissolveConfig {
    const { Layers } = (raw && typeof raw === "object" ? raw : {}) as Partial<DissolveConfig>;
    return { Layers: DISSOLVE_LAYERS.find(l => l.value === Layers)?.value ?? "clothing" };
}

/** Takes the target's clothes (not cosplay, the body or any restraint) off, down to the layers chosen. Returns how many pieces went. */
export function dissolveClothing(layers: DissolveLayers, acting: number | undefined): { removed: number; what: string } {
    const choice = DISSOLVE_LAYERS.find(l => l.value === layers) ?? DISSOLVE_LAYERS[0];
    const pieces = Player.Appearance.filter(item => matchesStripLevel(item, choice.level));
    pieces.forEach(item => RemoveItem(item, acting, Player));
    const removed = pieces.filter(item => !Player.Appearance.includes(item)).length;
    if (removed > 0) {
        CharacterRefresh(Player, true, false);
        ChatRoomCharacterUpdate(Player);
    }
    return { removed, what: choice.what };
}

export const DISSOLVE_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.dissolve,
    label: LSCGSpellEffect.dissolve,
    description: "Dissolves the target's clothing, underwear or both. Cosplay, the body and restraints are left alone.",
    stackable: 2,
    onSave: "negate",
    config: {
        defaults: (): DissolveConfig => ({ Layers: "clothing" }),
        sanitize: sanitizeDissolveConfig,
        summary: (c: DissolveConfig) => `Dissolves: ${DISSOLVE_LAYERS.find(l => l.value === c.Layers)?.label ?? "Clothing"}`,
    },
    apply: ({ sender, config }) => {
        const { Layers } = (config as DissolveConfig | undefined) ?? sanitizeDissolveConfig(undefined);
        const { removed, what } = dissolveClothing(Layers, sender?.MemberNumber);
        if (removed > 0)
            SendAction(`%NAME%'s ${what} dissolve into glittering dust!`);
        else
            SendAction(`The spell washes over %NAME%, but finds no ${what} to dissolve.`);
    },
};
