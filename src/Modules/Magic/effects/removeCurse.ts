import { LSCGSpellEffect } from "Settings/Models/magic";
import { getRandomInt, SendAction } from "utils";
import { getModule } from "modules";
import type { StateModule } from "Modules/states";
import { ACTIVE_EFFECTS_KEY } from "../activeEffects";
import { safeGetLSCGProp } from "../../../types/guards";
import { effectLabel, getSpellEffect, spellEffects, type SpellEffectContext, type SpellEffectDefinition } from "../spellEffects";
import type { MagicModule } from "Modules/magic";
import { domainOrder, SpellDomain } from "../taxonomy";

/** The answer that lets the spell pick for itself; also what a cast with no choice (a voice cast, a potion) gets. */
export const RANDOM_EFFECT = "random";

export interface RemoveCurseConfig {
    /** The one thing this spell lifts and nothing else: "state:<type>" for a state, or the id of an effect that leaves entries on the player
     *  (the conjured ropes); empty for any. */
    Only: string;
}

const STATE_PREFIX = "state:";

/** States whose own label depends on how they were cast (blessed or baned, enlarged or shrunk), named here for both. */
const STATE_LABELS: Partial<Record<string, string>> = { buffed: "Blessed / Baned", resized: "Resized" };

/** The domain each state belongs to, as the effects that cause it are grouped in the spell editor. */
const STATE_DOMAINS: Partial<Record<LSCGState, SpellDomain>> = {
    "hypnotized": SpellDomain.mind, "asleep": SpellDomain.mind,
    "blind": SpellDomain.senses, "deaf": SpellDomain.senses, "x-ray-vision": SpellDomain.senses, "astral-projection": SpellDomain.senses,
    "redressed": SpellDomain.form, "resized": SpellDomain.form, "polymorphed": SpellDomain.form,
    "frozen": SpellDomain.binding, "gagged": SpellDomain.binding, "cursed-item": SpellDomain.binding,
    "horny": SpellDomain.desire, "arousal-paired": SpellDomain.desire, "orgasm-siphoned": SpellDomain.desire, "denied": SpellDomain.desire,
    "buffed": SpellDomain.fortune,
    "protected": SpellDomain.warding,
};

/** Heading for whatever has no domain (an extension's effect, a state not mapped above), listed last. */
const OTHER_GROUP = "Other";

const groupOrder = (group: string) => group === OTHER_GROUP ? Number.MAX_SAFE_INTEGER : domainOrder(group as SpellDomain);

/** What a remove curse can be limited to: every state, and every effect that leaves entries on the player to lift, grouped by domain and
 *  alphabetical within each. */
export function limitableOptions(): { value: string; label: string; group: string }[] {
    const states = (getModule<StateModule>("StateModule")?.States ?? [])
        .filter(s => s.Type !== "spell-effects")
        .map(s => ({ value: `${STATE_PREFIX}${s.Type}`, label: STATE_LABELS[s.Type] ?? s.Label(Player as never), group: STATE_DOMAINS[s.Type] ?? OTHER_GROUP }));
    const effects = spellEffects.all().filter(d => !!d.onEnd).map(d => ({ value: d.id as string, label: d.label, group: d.domain ?? OTHER_GROUP }));
    return [...states, ...effects].sort((a, b) => groupOrder(a.group) - groupOrder(b.group) || a.label.localeCompare(b.label));
}

function onlyLabel(only: string): string {
    if (!only.startsWith(STATE_PREFIX))
        return effectLabel(only);
    return limitableOptions().find(o => o.value === only)?.label ?? only.slice(STATE_PREFIX.length);
}

function sanitizeConfig(raw: unknown): RemoveCurseConfig {
    const only = (raw as Partial<RemoveCurseConfig> | undefined)?.Only;
    const valid = typeof only === "string" && (/^state:[\w-]{1,40}$/.test(only) || !!getSpellEffect(only)?.onEnd);
    return { Only: valid ? only : "" };
}

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
export function removableOn(character: Character, only = ""): Removable[] {
    const stateModule = getModule<StateModule>("StateModule");
    const states = safeGetLSCGProp(character, "StateModule", "states") as { type: LSCGState; active?: boolean; extensions?: Record<string, unknown> }[] | undefined;
    return (states ?? []).filter(s => s.active).flatMap<Removable>(s => {
        if (s.type === "spell-effects") {
            const entries = s.extensions?.[ACTIVE_EFFECTS_KEY] as { id: string; effect: string }[] | undefined;
            return (Array.isArray(entries) ? entries : []).filter(e => !only || e.effect === only).map(e => ({ key: `entry:${e.id}`, label: effectLabel(e.effect) }));
        }
        if (only && only !== `${STATE_PREFIX}${s.type}`)
            return [];
        return [{ key: `state:${s.type}`, label: stateModule?.GetIconForState(s as never, character as OtherCharacter).Label ?? s.type }];
    });
}

/** The same, on this client's own player, with what it takes to lift each. */
function liftableHere(magic: MagicModule, only: string): LiftableHere[] {
    const stateModule = magic.stateModule;
    const states = stateModule.States
        .filter(s => s.Active && s.Type !== "spell-effects" && (!only || only === `${STATE_PREFIX}${s.Type}`))
        .map<LiftableHere>(s => ({ key: `state:${s.Type}`, label: s.Label(Player as never), lift: () => { s.RecoverFor("dispel", false); } }));
    const effects = stateModule.SpellEffectsState;
    const entries = effects.entries.filter(e => !only || e.effect === only).map<LiftableHere>(e => ({ key: `entry:${e.id}`, label: effectLabel(e.effect), lift: () => effects.End(e, "dispel") }));
    return [...states, ...entries];
}

function apply(ctx: SpellEffectContext): void {
    const only = sanitizeConfig(ctx.config).Only;
    const here = liftableHere(ctx.magic, only);
    if (here.length === 0) {
        SendAction(only ? `The spell searches %NAME% for ${onlyLabel(only).toLowerCase()}, but finds none.` : "The spell searches %NAME% for a curse to lift, but finds none.");
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
    description: "Lifts one magical effect from the target: the one the caster picks, or one at random. Can be set to lift only one particular effect.",
    beneficial: true,
    config: {
        defaults: () => ({ Only: "" }),
        sanitize: sanitizeConfig,
        summary: config => sanitizeConfig(config).Only
            ? `Remove Curse: lifts only ${onlyLabel(sanitizeConfig(config).Only).toLowerCase()}`
            : "Remove Curse: the caster picks one effect to lift, or it is picked at random",
        castPrompts: (config, target) => {
            const only = sanitizeConfig(config).Only;
            // Limited to one effect, so there is nothing for the caster to pick
            if (only)
                return [];
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
