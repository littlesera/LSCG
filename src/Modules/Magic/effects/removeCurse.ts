import { LSCGSpellEffect } from "Settings/Models/magic";
import { getRandomInt, SendAction } from "utils";
import { getModule } from "modules";
import type { StateModule } from "Modules/states";
import { ACTIVE_EFFECTS_KEY } from "../activeEffects";
import { safeGetLSCGProp } from "../../../types/guards";
import { effectLabel, type SpellEffectContext, type SpellEffectDefinition } from "../spellEffects";
import type { MagicModule } from "Modules/magic";

/** The answer that lets the spell pick for itself; also what a cast with no choice (a voice cast, a potion) gets. */
export const RANDOM_EFFECT = "random";

export interface Removable {
    /** "state:<type>" for a state, "entry:<id>" for one thing a spell put on the player. */
    key: string;
    label: string;
}

interface LiftableHere extends Removable {
    lift(): void;
}

/** What is on `character` that the spell could lift, as the caster can see it: from the settings the character has published, which is also how the
 *  player's own settings look to themselves. States are listed once each, and what spells put on them (webs, hands, commands) one by one. */
export function removableOn(character: Character): Removable[] {
    const stateModule = getModule<StateModule>("StateModule");
    const states = safeGetLSCGProp(character, "StateModule", "states") as { type: LSCGState; active?: boolean; extensions?: Record<string, unknown> }[] | undefined;
    return (states ?? []).filter(s => s.active).flatMap<Removable>(s => {
        if (s.type === "spell-effects") {
            const entries = s.extensions?.[ACTIVE_EFFECTS_KEY] as { id: string; effect: string }[] | undefined;
            return (Array.isArray(entries) ? entries : []).map(e => ({ key: `entry:${e.id}`, label: effectLabel(e.effect) }));
        }
        return [{ key: `state:${s.type}`, label: stateModule?.GetIconForState(s as never, character as OtherCharacter).Label ?? s.type }];
    });
}

/** The same, on this client's own player, with what it takes to lift each. */
function liftableHere(magic: MagicModule): LiftableHere[] {
    const stateModule = magic.stateModule;
    const states = stateModule.States
        .filter(s => s.Active && s.Type !== "spell-effects")
        .map<LiftableHere>(s => ({ key: `state:${s.Type}`, label: s.Label(Player as never), lift: () => { s.RecoverFor("dispel", false); } }));
    const effects = stateModule.SpellEffectsState;
    const entries = effects.entries.map<LiftableHere>(e => ({ key: `entry:${e.id}`, label: effectLabel(e.effect), lift: () => effects.End(e, "dispel") }));
    return [...states, ...entries];
}

function apply(ctx: SpellEffectContext): void {
    const here = liftableHere(ctx.magic);
    if (here.length === 0) {
        SendAction("The spell searches %NAME% for a curse to lift, but finds none.");
        return;
    }
    // The caster's choice came from what they could see; what is really there decides, and anything else is left to chance
    const chosen = here.find(r => r.key === ctx.castArgs?.target) ?? here[getRandomInt(here.length)];
    chosen.lift();
    SendAction(`The spell breaks the ${chosen.label.toLowerCase()} effect on %NAME%.`);
}

export const REMOVE_CURSE_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.removeCurse,
    label: LSCGSpellEffect.removeCurse,
    description: "Lifts one magical effect from the target: the one the caster picks, or one at random.",
    beneficial: true,
    config: {
        defaults: () => ({}),
        sanitize: () => ({}),
        summary: () => "Remove Curse: the caster picks one effect to lift, or it is picked at random",
        castPrompts: (_config, target) => {
            const choices = target ? removableOn(target) : [];
            // Looking at a target who has nothing on them, there is nothing to choose
            if (target && choices.length === 0)
                return [];
            return [{
                key: "target", label: "Effect to lift", open: true, default: RANDOM_EFFECT,
                options: [{ value: RANDOM_EFFECT, label: "- Random -" }, ...choices.map(c => ({ value: c.key, label: c.label }))],
            }];
        },
    },
    apply,
};
