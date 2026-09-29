import type { RemoteAccessLevel } from "utils";
import { BaseSettingsModel } from "./base";
import { StripLevel } from "./cursed-item";
import { OutfitOption } from "./magic";

export const SPEECH_OUTFIT_OPTIONS: OutfitOption[] = [OutfitOption.both, OutfitOption.clothes_only, OutfitOption.binds_only];
const STRIP_ALL = StripLevel.CLOTHES | StripLevel.UNDERWEAR | StripLevel.COSPLAY;

/** A detector is one analysis metric that can be switched on or off independently. */
export type SpeechDetectorId = "tone" | "profanity" | "erudite" | "phrases";
/** A detection is an outcome a reaction rule can trigger on; each belongs to one detector. */
export type SpeechDetection = "negative" | "positive" | "profanity" | "erudite" | "phrase";
export type SpeechReactionAction = "applyState" | "removeState" | "shock" | "outfit" | "orgasm";
export type SpeechRemoteLevel = RemoteAccessLevel;

export interface SpeechDetectorInfo {
    id: SpeechDetectorId;
    label: string;
    description: string;
    defaultEnabled: boolean;
}

/** Registry of detectors. Adding a metric: add its id above, an entry here, and its detections to SPEECH_DETECTION_DETECTOR. */
export const SPEECH_DETECTORS: SpeechDetectorInfo[] = [
    { id: "tone", label: "Tone", description: "Negative self-talk and positive affirmations, including comparisons with others and how you respond to what others say about you.", defaultEnabled: true },
    { id: "profanity", label: "Profanity", description: "Swearing, including disguised spellings like f*ck or sh1t.", defaultEnabled: true },
    { id: "erudite", label: "Reading level", description: "Speaking above a set reading grade level.", defaultEnabled: false },
    { id: "phrases", label: "Phrase lists", description: "Your own groups of words and phrases, such as release phrases or banned words.", defaultEnabled: true },
];

export const SPEECH_DETECTION_DETECTOR: Record<SpeechDetection, SpeechDetectorId> = {
    negative: "tone",
    positive: "tone",
    profanity: "profanity",
    erudite: "erudite",
    phrase: "phrases",
};

export function defaultSpeechDetectors(): Record<SpeechDetectorId, boolean> {
    return Object.fromEntries(SPEECH_DETECTORS.map(d => [d.id, d.defaultEnabled])) as Record<SpeechDetectorId, boolean>;
}

export const SPEECH_DETECTIONS: SpeechDetection[] = ["negative", "positive", "profanity", "erudite", "phrase"];
export const SPEECH_REACTION_ACTIONS: SpeechReactionAction[] = ["applyState", "removeState", "shock", "outfit", "orgasm"];
export const SPEECH_REMOTE_LEVELS: SpeechRemoteLevel[] = ["Owner", "Lovers", "Whitelist", "Friends", "PublicExceptBlacklist", "Public"];
export const SPEECH_REACTION_STATES: LSCGState[] = ["denied", "gagged", "horny", "hypnotized", "blind", "deaf", "frozen", "asleep", "redressed"];
/** States that need extra data to apply (an outfit), so they can only be removed by a removeState rule. */
export const SPEECH_REMOVE_ONLY_STATES: LSCGState[] = ["redressed"];
export const SPEECH_OUTFIT_KEY_MAX = 70;
// Rules and phrase groups are private (never published to the room); saved settings are LZ-compressed,
// where a rule averages ~30-60 bytes, so these limits cost at most a few KB of the account's extension data.
export const SPEECH_MAX_RULES = 128;
export const SPEECH_MAX_PHRASE_GROUPS = 32;
export const SPEECH_PHRASE_GROUP_NAME_MAX = 40;
const PHRASE_GROUP_ID_RE = /^[a-z0-9-]{1,24}$/;

/** A named list of words/phrases; a rule with detection "phrase" fires when any of them is spoken. */
export interface SpeechPhraseGroup {
    /** Stable id referenced by rules, so renaming a group keeps its rules attached. */
    id: string;
    name: string;
    /** Comma-delimited; quote phrases that contain commas. */
    phrases: string;
    /** Who last set the phrases. Unset or the wearer = the wearer's own group; anyone else = hidden from the wearer. */
    installedBy?: number;
    installedByName?: string;
    /** Transport only, never stored: the phrases were withheld from the recipient. */
    hidden?: boolean;
}

export function newPhraseGroupId(existing: SpeechPhraseGroup[]): string {
    let id: string;
    do id = `g-${Math.random().toString(36).slice(2, 8)}`; while (existing.some(g => g.id === id));
    return id;
}

export interface SpeechReactionRule {
    enabled: boolean;
    detection: SpeechDetection;
    /** Phrase group id, for the "phrase" detection. */
    phraseGroup?: string;
    action: SpeechReactionAction;
    state?: LSCGState;
    /** Outfit collection key, for the "outfit" action. */
    outfitKey?: string;
    /** Which parts of the outfit to put on (Magic's options); default both. */
    outfitOption?: OutfitOption;
    /** What to strip before putting the outfit on (cursed-item strip levels); default none, i.e. purely additive. */
    outfitStrip?: StripLevel;
    /** 0 or undefined = no expiry. */
    durationMs?: number;
    cooldownMs: number;
}

/** Published to the room: only what other players need to decide whether they may open remote settings. */
export interface SpeechAnalysisPublicSettingsModel extends BaseSettingsModel {
    remoteAccess: boolean;
    remoteLevel: SpeechRemoteLevel;
    /** On top of remoteLevel: remote access only works while the wearer is hypnotized. */
    remoteRequiresTrance: boolean;
    lockable: boolean;
    locked: boolean;
}

/** Private configuration; remote configurers fetch it on request (like hypno suggestions). */
export interface SpeechEditableSettings {
    negativeThreshold: number;
    positiveThreshold: number;
    incomingThreshold: number;
    contextWindowSeconds: number;
    detectors: Record<SpeechDetectorId, boolean>;
    eruditeGrade: number;
    affirmationPhrases: string;
    /** Comma-delimited `word:score` overrides for the sentiment lexicon. */
    lexiconExtras: string;
    /** Comma-delimited words/phrases to treat as profanity, on top of the built-in list. */
    profanityExtras: string;
    /** Comma-delimited words never treated as profanity, even if the built-in list flags them. */
    profanitySafe: string;
    phraseGroups: SpeechPhraseGroup[];
    reactions: SpeechReactionRule[];
}

export interface SpeechAnalysisSettingsModel extends SpeechAnalysisPublicSettingsModel, SpeechEditableSettings {
    debugLog: boolean;
}

/** What the settings pages edit: the full local model, or a remote target's public settings plus fetched config. */
export type SpeechSettingsView = SpeechAnalysisPublicSettingsModel & SpeechEditableSettings & { debugLog?: boolean };

export const SPEECH_EDITABLE_KEYS = [
    "negativeThreshold", "positiveThreshold", "incomingThreshold", "contextWindowSeconds", "detectors",
    "eruditeGrade", "affirmationPhrases", "lexiconExtras", "profanityExtras", "profanitySafe", "phraseGroups", "reactions",
] as const satisfies readonly (keyof SpeechEditableSettings)[];

export function defaultSpeechPhraseGroups(): SpeechPhraseGroup[] {
    return [
        { id: "banned", name: "Banned words", phrases: "" },
        { id: "release", name: "Release phrases", phrases: "" },
    ];
}

/** Example rules, all off: nothing reacts until the wearer (or a remote configurer) opts in. */
export function defaultSpeechReactions(): SpeechReactionRule[] {
    return [
        { enabled: false, detection: "negative",  action: "applyState",  state: "denied", cooldownMs: 10_000 },
        { enabled: false, detection: "positive",  action: "removeState", state: "denied", cooldownMs: 10_000 },
        { enabled: false, detection: "profanity", action: "applyState",  state: "gagged", durationMs: 60_000, cooldownMs: 10_000 },
        { enabled: false, detection: "negative",  action: "shock", cooldownMs: 10_000 },
        { enabled: false, detection: "profanity", action: "shock", cooldownMs: 10_000 },
        { enabled: false, detection: "erudite",   action: "applyState",  state: "gagged", durationMs: 60_000, cooldownMs: 10_000 },
        { enabled: false, detection: "phrase", phraseGroup: "release", action: "removeState", state: "redressed", cooldownMs: 0 },
        { enabled: false, detection: "phrase", phraseGroup: "banned",  action: "shock", cooldownMs: 5_000 },
    ];
}

export function defaultSpeechPublicSettings(): SpeechAnalysisPublicSettingsModel {
    return {
        enabled: true,
        remoteAccess: false,
        remoteLevel: "Owner",
        remoteRequiresTrance: true,
        lockable: false,
        locked: false,
    };
}

export function defaultSpeechSettings(): SpeechAnalysisSettingsModel {
    return {
        ...defaultSpeechPublicSettings(),
        negativeThreshold: 0,
        positiveThreshold: 0.3,
        incomingThreshold: 0.2,
        contextWindowSeconds: 60,
        detectors: defaultSpeechDetectors(),
        eruditeGrade: 10,
        affirmationPhrases: "",
        lexiconExtras: "",
        profanityExtras: "",
        profanitySafe: "",
        phraseGroups: defaultSpeechPhraseGroups(),
        reactions: defaultSpeechReactions(),
        debugLog: false,
    };
}

export const SPEECH_NUMBER_RANGES = {
    negativeThreshold: { min: -2, max: 1 },
    positiveThreshold: { min: 0, max: 2 },
    incomingThreshold: { min: 0, max: 2 },
    contextWindowSeconds: { min: 10, max: 600 },
    eruditeGrade: { min: 1, max: 20 },
} as const;
export const SPEECH_MAX_DURATION_MS = 86_400_000;
export const SPEECH_MAX_COOLDOWN_MS = 3_600_000;
export const SPEECH_MAX_TEXT_LENGTH = 1000;

function finiteInRange(value: unknown, min: number, max: number): number | undefined {
    return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
}

function sanitizeRule(input: any): SpeechReactionRule | null {
    if (!input || typeof input !== "object") return null;
    if (!SPEECH_DETECTIONS.includes(input.detection) || !SPEECH_REACTION_ACTIONS.includes(input.action)) return null;
    if (input.detection === "phrase" && !(typeof input.phraseGroup === "string" && PHRASE_GROUP_ID_RE.test(input.phraseGroup))) return null;
    const usesState = input.action === "applyState" || input.action === "removeState";
    if (usesState && !SPEECH_REACTION_STATES.includes(input.state)) return null;
    if (input.action === "applyState" && SPEECH_REMOVE_ONLY_STATES.includes(input.state)) return null;
    const outfitKey = typeof input.outfitKey === "string" ? input.outfitKey.trim() : "";
    if (input.action === "outfit" && (!outfitKey || outfitKey.length > SPEECH_OUTFIT_KEY_MAX)) return null;
    return {
        enabled: input.enabled === true,
        detection: input.detection,
        phraseGroup: input.detection === "phrase" ? input.phraseGroup : undefined,
        action: input.action,
        state: usesState ? input.state : undefined,
        outfitKey: input.action === "outfit" ? outfitKey : undefined,
        outfitOption: input.action === "outfit" && SPEECH_OUTFIT_OPTIONS.includes(input.outfitOption) ? input.outfitOption : undefined,
        outfitStrip: input.action === "outfit" && Number.isInteger(input.outfitStrip) && input.outfitStrip >= 0 && input.outfitStrip <= STRIP_ALL
            ? input.outfitStrip : undefined,
        durationMs: finiteInRange(input.durationMs, 0, SPEECH_MAX_DURATION_MS),
        cooldownMs: finiteInRange(input.cooldownMs, 0, SPEECH_MAX_COOLDOWN_MS) ?? 10_000,
    };
}

/** A remotely-sent group. `phrases` is undefined when the sender couldn't see them (left unchanged by the receiver). */
export interface IncomingPhraseGroup {
    id: string;
    name: string;
    phrases?: string;
}

function sanitizePhraseGroups(input: unknown[]): IncomingPhraseGroup[] {
    const out: IncomingPhraseGroup[] = [];
    for (const g of input.slice(0, SPEECH_MAX_PHRASE_GROUPS) as any[]) {
        if (!g || typeof g !== "object" || typeof g.id !== "string" || !PHRASE_GROUP_ID_RE.test(g.id)) continue;
        if (out.some(o => o.id === g.id)) continue;
        out.push({
            id: g.id,
            name: typeof g.name === "string" ? g.name.slice(0, SPEECH_PHRASE_GROUP_NAME_MAX) : g.id,
            phrases: typeof g.phrases === "string" && !g.hidden ? g.phrases.slice(0, SPEECH_MAX_TEXT_LENGTH) : undefined,
        });
    }
    return out;
}

export type SanitizedRemoteSpeechSettings = Partial<Omit<SpeechEditableSettings, "phraseGroups">> & {
    locked?: boolean;
    phraseGroups?: IncomingPhraseGroup[];
};

/** Validates remotely-sent settings. Only editable keys with well-formed values survive; everything else is dropped.
 *  Never includes enabled, remoteAccess, remoteLevel, remoteRequiresTrance or lockable — those stay the wearer's choice. */
export function sanitizeRemoteSpeechSettings(input: any): SanitizedRemoteSpeechSettings {
    const out: SanitizedRemoteSpeechSettings = {};
    if (!input || typeof input !== "object") return out;
    for (const [key, range] of Object.entries(SPEECH_NUMBER_RANGES) as [keyof typeof SPEECH_NUMBER_RANGES, { min: number; max: number }][]) {
        const n = finiteInRange(input[key], range.min, range.max);
        if (n !== undefined) out[key] = n;
    }
    if (input.detectors && typeof input.detectors === "object") {
        const detectors: Partial<Record<SpeechDetectorId, boolean>> = {};
        for (const { id } of SPEECH_DETECTORS)
            if (typeof input.detectors[id] === "boolean") detectors[id] = input.detectors[id];
        if (Object.keys(detectors).length > 0) out.detectors = detectors as Record<SpeechDetectorId, boolean>;
    }
    if (typeof input.locked === "boolean") out.locked = input.locked;
    if (typeof input.affirmationPhrases === "string") out.affirmationPhrases = input.affirmationPhrases.slice(0, SPEECH_MAX_TEXT_LENGTH);
    if (typeof input.lexiconExtras === "string") out.lexiconExtras = input.lexiconExtras.slice(0, SPEECH_MAX_TEXT_LENGTH);
    if (typeof input.profanityExtras === "string") out.profanityExtras = input.profanityExtras.slice(0, SPEECH_MAX_TEXT_LENGTH);
    if (typeof input.profanitySafe === "string") out.profanitySafe = input.profanitySafe.slice(0, SPEECH_MAX_TEXT_LENGTH);
    if (Array.isArray(input.phraseGroups)) out.phraseGroups = sanitizePhraseGroups(input.phraseGroups);
    if (Array.isArray(input.reactions))
        out.reactions = input.reactions.slice(0, SPEECH_MAX_RULES).map(sanitizeRule).filter((r: SpeechReactionRule | null): r is SpeechReactionRule => !!r);
    return out;
}
