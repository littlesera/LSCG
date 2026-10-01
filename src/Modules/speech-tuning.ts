import type { LSCGSpeechAnalysis } from "./speech-analysis";
import { SPEECH_NUMBER_RANGES, type SpeechAnalysisSettingsModel } from "../Settings/Models/speech-analysis";

export type TuningDetector = "tone" | "profanity" | "erudite";

export type TuningKind = "negative" | "positive" | "ignore" | "profane" | "safe" | "threshold" | "level";

export interface TuningSuggestion {
    /** Full description, used as the Tune tab button text and as a tooltip. */
    label: string;
    /** Compact glyph + text for the chat flyout. */
    icon: string;
    short: string;
    /** Which detector this tweak is for. */
    detector: TuningDetector;
    /** Colors the tag. */
    kind: TuningKind;
    /** Longer explanation of exactly what the change does, shown as a tooltip. */
    tip: string;
    apply: (settings: SpeechAnalysisSettingsModel) => void;
}

const THRESHOLD_STEP = 0.05;
const MAX_WORD_SUGGESTIONS = 3;

const splitList = (list: string | undefined): string[] => (list ?? "").split(",").map(s => s.trim()).filter(Boolean);

/** Sets `word:score` in the vocabulary overrides, replacing any existing entry for that word. */
export function setWordScore(settings: SpeechAnalysisSettingsModel, word: string, score: number): void {
    const key = word.toLowerCase();
    const entries = splitList(settings.lexiconExtras).filter(e => e.split(":")[0].trim().toLowerCase() !== key);
    entries.push(`${key}:${score}`);
    settings.lexiconExtras = entries.join(", ");
}

/** Adds `word` to a comma-separated list setting unless it's already there (ignoring case). */
export function addToList(settings: SpeechAnalysisSettingsModel, field: "profanitySafe" | "profanityExtras", word: string): void {
    const entries = splitList(settings[field]);
    if (!entries.some(e => e.toLowerCase() === word.toLowerCase())) entries.push(word);
    settings[field] = entries.join(", ");
}

const removeFromList = (settings: SpeechAnalysisSettingsModel, field: "profanitySafe" | "profanityExtras", word: string): void => {
    settings[field] = splitList(settings[field]).filter(e => e.toLowerCase() !== word.toLowerCase()).join(", ");
};

/** Count this word as profane (and stop it being on the "never profane" list). */
export function markProfane(settings: SpeechAnalysisSettingsModel, word: string): void {
    removeFromList(settings, "profanitySafe", word);
    addToList(settings, "profanityExtras", word);
}

/** Never treat this word as profane (and stop it being on the "also profane" list). */
export function markSafe(settings: SpeechAnalysisSettingsModel, word: string): void {
    removeFromList(settings, "profanityExtras", word);
    addToList(settings, "profanitySafe", word);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Concrete changes to the wearer's own settings that would change how this line reads. Always offered as a
 *  choice, never applied automatically; and the "less sensitive" direction is offered first. */
export function suggestTuning(a: LSCGSpeechAnalysis, settings: SpeechAnalysisSettingsModel): TuningSuggestion[] {
    const out: TuningSuggestion[] = [];
    const R = SPEECH_NUMBER_RANGES;

    if (a.detectors.tone) {
        const fromContext = a.context.negative || a.context.positive;
        if (a.tone === "negative" && !fromContext && a.comparison === 0) {
            const to = round2(Math.max(R.negativeThreshold.min, a.negativeSelf.comparative - THRESHOLD_STEP));
            if (to < settings.negativeThreshold)
                out.push({ label: `Make this neutral: lower the negative threshold to ${to}`, icon: "⚙", short: `${to}`, detector: "tone", kind: "threshold", tip: `Lower the negative threshold to ${to}. This line would read as neutral, and so would other lines with a similar strength of sentiment. Applies to everything you say.`, apply: s => { s.negativeThreshold = to; } });
        }
        if (a.tone === "positive" && !fromContext && a.comparison === 0 && !a.positiveSelf.viaPhrase) {
            const to = round2(Math.min(R.positiveThreshold.max, a.positiveSelf.comparative + THRESHOLD_STEP));
            if (to > settings.positiveThreshold)
                out.push({ label: `Make this neutral: raise the positive threshold to ${to}`, icon: "⚙", short: `${to}`, detector: "tone", kind: "threshold", tip: `Raise the positive threshold to ${to}. This line would read as neutral, and so would other lines with a similar strength of sentiment. Applies to everything you say.`, apply: s => { s.positiveThreshold = to; } });
        }

        const strongest = [...a.trace.words].sort((x, y) => Math.abs(y.score) - Math.abs(x.score)).slice(0, MAX_WORD_SUGGESTIONS);
        if (a.tone !== "neutral")
            for (const w of strongest)
                out.push({ label: `Ignore the word "${w.word}" (score 0)`, icon: "⊘", short: w.word, detector: "tone", kind: "ignore", tip: `Ignore the word "${w.word}" (score 0): it stops pushing any line negative or positive.`, apply: s => setWordScore(s, w.word, 0) });
        else if (strongest.length)
            for (const w of strongest.slice(0, 1)) {
                out.push({ label: `Count "${w.word}" as negative (-3)`, icon: "✗", short: w.word, detector: "tone", kind: "negative", tip: `Count "${w.word}" as negative (-3): lines about you that use it will read as negative.`, apply: s => setWordScore(s, w.word, -3) });
                out.push({ label: `Count "${w.word}" as positive (+3)`, icon: "✓", short: w.word, detector: "tone", kind: "positive", tip: `Count "${w.word}" as positive (+3): lines about you that use it will read as positive.`, apply: s => setWordScore(s, w.word, 3) });
            }
    }

    if (a.detectors.profanity && a.profanity.detected)
        for (const word of a.profanity.words)
            out.push({ label: `Never treat "${word}" as profane`, icon: "⚠", short: word, detector: "profanity", kind: "safe", tip: `Never treat "${word}" as profane: it is allowed in every line you say.`, apply: s => addToList(s, "profanitySafe", word) });

    if (a.detectors.erudite && a.erudite.gradeLevel > 0) {
        // Whole grades only; a line is too complex when its grade is at or above the limit.
        const grade = a.erudite.gradeLevel;
        if (a.erudite.detected) {
            const to = Math.floor(grade) + 1;
            // Beyond the highest allowed limit nothing would pass, so there's nothing useful to offer.
            if (to > settings.eruditeGrade && to <= R.eruditeGrade.max)
                out.push({ label: `Not too complex: raise the maximum reading grade to ${to}`, icon: "Aa", short: `${to}`, detector: "erudite", kind: "level", tip: `Raise the maximum reading grade to ${to}, so lines like this are no longer flagged as too complex. Applies to everything you say.`, apply: s => { s.eruditeGrade = to; } });
        } else {
            const to = Math.floor(grade);
            // Below the lowest allowed limit this line couldn't be flagged, so there's nothing useful to offer.
            if (to >= R.eruditeGrade.min && to < settings.eruditeGrade)
                out.push({ label: `Flag this as too complex: lower the maximum reading grade to ${to}`, icon: "Aa", short: `${to}`, detector: "erudite", kind: "level", tip: `Lower the maximum reading grade to ${to}, so lines this complex get flagged. Applies to everything you say.`, apply: s => { s.eruditeGrade = to; } });
        }
    }

    return out;
}
