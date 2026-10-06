import { LSCGSpellEffect } from "Settings/Models/magic";
import { addCustomEffect, forceOrgasm, removeCustomEffect, sendLSCGCommandBeep, SendAction } from "utils";
import { getModule } from "modules";
import { Leashing, type LeashingModule } from "Modules/leashing";
import { dissolveClothing } from "./dissolve";
import { phraseIndex } from "../phrase";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

export type CommandWord = "kneel" | "follow" | "stay" | "strip" | "cum";

export interface CommandConfig {
    /** The word the spell commands: always, or when the caster isn't asked (or can't be, as with a voice or potion cast) and nothing in the words picks one. */
    Word: CommandWord;
    /** Ask the caster which of `Allowed` when casting. */
    Ask: boolean;
    Allowed: CommandWord[];
}

interface CommandDefinition {
    word: CommandWord;
    label: string;
    /** Lasts for the spell's duration and is undone afterwards; the others happen once. */
    timed: boolean;
    /** What a voice cast can say to ask for it, in the languages of the players. Whole words or phrases, any case. */
    aliases: string[];
}

export const COMMANDS: CommandDefinition[] = [
    { word: "kneel", label: "Kneel", timed: true, aliases: ["kneel", "get on your knees", "跪下", "跪", "knie", "knien", "kniet", "auf die knie", "arrodíllate", "arrodillate", "de rodillas"] },
    { word: "follow", label: "Follow", timed: true, aliases: ["follow", "follow me", "come with me", "跟我来", "跟着我", "跟上", "过来", "folge", "folge mir", "komm mit", "sígueme", "sigueme", "ven conmigo", "sígueme"] },
    { word: "stay", label: "Stay", timed: true, aliases: ["stay", "stay here", "don't move", "wait here", "别走", "站住", "留下", "待着", "bleib", "bleib hier", "quédate", "quedate", "quédate aquí", "no te muevas"] },
    { word: "strip", label: "Strip", timed: false, aliases: ["strip", "undress", "take it off", "脱掉", "脱光", "脱衣服", "ausziehen", "zieh dich aus", "desvístete", "desvistete", "desnúdate", "desnudate"] },
    { word: "cum", label: "Cum", timed: false, aliases: ["cum", "orgasm", "climax", "高潮", "去吧", "orgasmus", "komm für mich", "córrete", "correte", "orgasmo"] },
];

export const COMMAND_WORDS: CommandWord[] = COMMANDS.map(c => c.word);

const definitionOf = (word: CommandWord) => COMMANDS.find(c => c.word === word)!;

export function sanitizeCommandConfig(raw: unknown): CommandConfig {
    const { Word, Ask, Allowed } = (raw && typeof raw === "object" ? raw : {}) as Partial<CommandConfig>;
    const word = COMMAND_WORDS.find(w => w === Word) ?? "kneel";
    const chosen = Array.isArray(Allowed) ? COMMAND_WORDS.filter(w => Allowed.includes(w)) : [...COMMAND_WORDS];
    // The default word is always among the choices, so there is always something to ask
    const allowed = chosen.includes(word) ? chosen : COMMAND_WORDS.filter(w => w === word || chosen.includes(w));
    return { Word: word, Ask: Ask === true, Allowed: allowed };
}

/** The command a cast carries out: what the caster picked (if they were asked and it is one of the choices), otherwise the spell's own word. */
export function pickCommand(config: CommandConfig, asked?: string): CommandWord {
    const picked = config.Ask ? config.Allowed.find(w => w === asked) : undefined;
    return picked ?? config.Word;
}

/** The first of the allowed words a voice cast says, by any of its names. */
export function commandFromVoice(config: CommandConfig, text: string): CommandWord | undefined {
    let best: { word: CommandWord; at: number } | undefined;
    for (const word of config.Allowed) {
        for (const alias of definitionOf(word).aliases) {
            const at = phraseIndex(text, alias);
            if (at >= 0 && (!best || at < best.at))
                best = { word, at };
        }
    }
    return best?.word;
}

interface CommandData {
    word: CommandWord;
    /** For "follow", who is being followed. */
    leader?: number;
}

const leashing = () => getModule<LeashingModule>("LeashingModule");

function commandOf(entry: { data: unknown }): CommandData | undefined {
    const data = entry.data as CommandData | null;
    return data && COMMAND_WORDS.includes(data.word) ? data : undefined;
}

/** Whether a timed "stay" is holding the player in the room. */
export function stayHolds(entry: { data: unknown }): boolean {
    return commandOf(entry)?.word === "stay";
}

function startFollowing(leader: number): void {
    leashing().AddLeashing(new Leashing(leader, leader, false, "compulsion"));
    sendLSCGCommandBeep(leader, "add-leashing", [
        { name: "pairedMember", value: Player.MemberNumber },
        { name: "type", value: "compulsion" },
        { name: "isSource", value: true },
    ]);
}

function stopFollowing(leader: number): void {
    leashing().RemoveLeashings(leader, false, "compulsion");
    sendLSCGCommandBeep(leader, "remove-leashing", [
        { name: "pairedMember", value: Player.MemberNumber },
        { name: "type", value: "compulsion" },
        { name: "isSource", value: true },
    ]);
}

export const COMMAND_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.command,
    label: LSCGSpellEffect.command,
    description: "Compels the target with a one-word command: kneel, follow the caster, stay in the room, strip, or cum.",
    onSave: "negate",
    config: {
        defaults: (): CommandConfig => ({ Word: "kneel", Ask: false, Allowed: [...COMMAND_WORDS] }),
        sanitize: sanitizeCommandConfig,
        summary: (c: CommandConfig) => {
            const clean = sanitizeCommandConfig(c);
            return clean.Ask
                ? `Command settings: the caster chooses from ${clean.Allowed.map(w => definitionOf(w).label.toLowerCase()).join(", ")} (${definitionOf(clean.Word).label.toLowerCase()} when they can't)`
                : `Command settings: ${definitionOf(clean.Word).label.toLowerCase()}`;
        },
        castPrompts: (c: CommandConfig) => {
            const clean = sanitizeCommandConfig(c);
            return clean.Ask ? [{ key: "word", label: "Command", default: clean.Word, options: clean.Allowed.map(w => ({ value: w, label: definitionOf(w).label })) }] : [];
        },
        fromVoice: (c: CommandConfig, text: string) => {
            const clean = sanitizeCommandConfig(c);
            const word = clean.Ask ? commandFromVoice(clean, text) : undefined;
            return word ? { word } : undefined;
        },
    },
    apply: ctx => {
        const config = (ctx.config as CommandConfig | undefined) ?? sanitizeCommandConfig(undefined);
        const word = pickCommand(config, ctx.castArgs?.word);
        const state = ctx.magic.stateModule.SpellEffectsState;
        // One lasting command at a time: a new one replaces the old, which is undone without announcing
        if (definitionOf(word).timed)
            state.EntriesFor(ctx.effect).forEach(entry => state.End(entry, "manual"));

        switch (word) {
            case "kneel":
                if (Player.CanKneel())
                    PoseSetActive(Player, "Kneel", true);
                addCustomEffect(Player, "ForceKneel");
                SendAction("%NAME% is compelled to kneel, sinking to the floor at the command.");
                state.Add(ctx, { word } satisfies CommandData);
                break;
            case "follow": {
                const leader = ctx.sender?.MemberNumber;
                if (!leader || ctx.sender?.IsPlayer()) {
                    SendAction("The command to follow finds no one for %NAME% to follow.");
                    return;
                }
                startFollowing(leader);
                SendAction("%NAME%'s eyes lock on %OPP_NAME%, compelled to follow wherever %OPP_PRONOUN% goes.", ctx.sender);
                state.Add(ctx, { word, leader } satisfies CommandData);
                break;
            }
            case "stay":
                SendAction("%NAME% finds %POSSESSIVE% feet rooted to the spot, unable to leave.");
                state.Add(ctx, { word } satisfies CommandData);
                break;
            case "strip": {
                const { removed } = dissolveClothing("both", ctx.sender?.MemberNumber);
                SendAction(removed > 0 ? "%NAME% obeys the command and strips off every stitch, unable to stop %POSSESSIVE% hands." : "%NAME% is commanded to strip, but has nothing left to take off.");
                break;
            }
            case "cum":
                SendAction("%NAME% gasps as the command forces %POSSESSIVE% release!");
                forceOrgasm();
                break;
        }
    },
    onEnd: (entry, reason, magic) => {
        const data = commandOf(entry);
        if (!data)
            return;
        const announce = reason !== "manual";
        switch (data.word) {
            case "kneel":
                // Sleep holds the player down the same way; don't let go of it
                if (!magic?.stateModule.SleepState.Active)
                    removeCustomEffect(Player, "ForceKneel");
                if (announce) SendAction("%NAME% is free to rise again.");
                break;
            case "follow":
                if (data.leader) stopFollowing(data.leader);
                if (announce) SendAction("%NAME% is no longer compelled to follow.");
                break;
            case "stay":
                if (announce) SendAction("%NAME% can leave again.");
                break;
        }
    },
    onRoomSync: (entry, magic) => {
        const data = commandOf(entry);
        if (data?.word === "kneel") {
            if (Player.CanKneel())
                PoseSetActive(Player, "Kneel", true);
            addCustomEffect(Player, "ForceKneel");
        } else if (data?.word === "follow" && data.leader && !leashing().Pairings.some(p => p.PairedMember === data.leader && p.Type === "compulsion")) {
            // Leashings aren't saved, so after a relog the compulsion has to be put back, if the leader is still here
            if (ChatRoomCharacter.some(c => c.MemberNumber === data.leader))
                startFollowing(data.leader);
        }
    },
    holdsInPlace: stayHolds,
};
