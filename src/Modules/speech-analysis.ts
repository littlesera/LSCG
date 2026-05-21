import { BaseModule } from "base";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { hookFunction, removeAllHooksByModule } from "../utils";
import Sentiment from "sentiment";
import nlp from "compromise";
import leoProfanity from "leo-profanity";

export interface LSCGSpeechAnalysis {
    raw: string;
    /** Raw compromise document — consumers can run additional NLP queries without re-parsing. */
    doc: ReturnType<typeof nlp>;
    profanity:         { detected: boolean; words: string[] };
    negativeSelf:      { detected: boolean; score: number; comparative: number };
    erudite:           { detected: boolean; gradeLevel: number };
    /** Detected via incoming context: player agreed with a negative directed at them, or
     *  disagreed with praise directed at them. Only fires when _incomingWindow is non-empty or a direct reply target exists. */
    contextualNegative: {
        detected: boolean;
        agreedWithNegative: boolean;
        disagreedWithPraise: boolean;
        /** How the context was sourced: "reply" = direct reply-to pairing, "window" = rolling incoming buffer. */
        via: "reply" | "window" | null;
    };
}

export type LSCGSpeechAnalysisCallback = (analysis: LSCGSpeechAnalysis) => void;

// Thresholds — tuned as constants; expose as settings later if needed.
const NEGATIVE_SELF_THRESHOLD = 0.0;  // comparative score below this = negative
const ERUDITE_ENABLED = false;
const ERUDITE_GRADE_THRESHOLD = 10;    // Flesch-Kincaid grade level; ≥ threshold = too complex
const WINDOW_SIZE = 5;                 // rolling message window size for split-message detection

const FIRST_PERSON = ["i", "me", "my", "myself", "mine"];
// Regex fallback catches contractions ("I'm", "I've") that compromise's pronoun tagger may miss
const FIRST_PERSON_RE = /\b(i'm|i've|i'll|i'd|i|me|my|myself|mine)\b/i;

// Incoming context thresholds — only act on clearly-valenced messages to reduce noise
const INCOMING_NEGATIVE_THRESHOLD = -0.2;
const INCOMING_POSITIVE_THRESHOLD =  0.2;

// Second-person address signals that the incoming message is directed at the player
const ABOUT_PLAYER_RE = /\b(you|your|you're|you've|you'll|you'd|you\s+are)\b/i;

// Affirmative responses (agreement)
const AGREEMENT_RE = /\b(yeah|yes|yep|yup|true|right|exactly|indeed|definitely|of\s+course|i\s+know|i\s+suppose|i\s+guess|probably|fair\s+enough|correct|agreed|clearly|sadly|unfortunately|too\s+true|you'?re\s+right|you\s+are\s+right|can'?t\s+deny|can'?t\s+argue)\b/i;

// Negating/dismissive responses (disagreement)
const DISAGREEMENT_RE = /\b(no|nah|nope|not\s+really|hardly|i\s+doubt|doubtful|unlikely|far\s+from\s+it|not\s+at\s+all|i\s+don'?t\s+think\s+so|i\s+disagree|that'?s\s+not\s+true|you'?re\s+wrong|not\s+me|pssh|pff)\b/i;

const INCOMING_HANDLER_DESC = "LSCG Speech Analysis Incoming Context";

interface IncomingEntry {
    text: string;
    comparative: number;
    aboutPlayer: boolean;
}

const _sentimentAnalyzer = new Sentiment();

function _countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    return Math.max(1, word.replace(/e$/, "").match(/[aeiouy]{1,2}/g)?.length ?? 1);
}

function _fleschKincaidGrade(text: string): number {
    const sentences = Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;
    const syllables = words.reduce((n, w) => n + _countSyllables(w), 0);
    return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
}

export class SpeechAnalysisModule extends BaseModule {
    private _callbacks: Set<LSCGSpeechAnalysisCallback> = new Set();
    private _messageWindow: string[] = [];
    private _incomingWindow: IncomingEntry[] = [];

    get defaultSettings(): BaseSettingsModel {
        return { enabled: true };
    }

    init(): void {
        super.init();
        leoProfanity.loadDictionary();
    }

    load(): void {
        // Buffer incoming chat from other speakers, pre-classified for contextual detection.
        ChatRoomRegisterMessageHandler({
            Priority: 109,
            Description: INCOMING_HANDLER_DESC,
            Callback: (data: ServerChatRoomMessage, sender: Character, msg: string) => {
                if (this.Enabled && data.Type === "Chat" && sender.MemberNumber !== Player.MemberNumber) {
                    const result = _sentimentAnalyzer.analyze(msg);
                    const playerName = ((Player?.Nickname ?? Player?.Name) || "").toLowerCase();
                    const aboutPlayer = ABOUT_PLAYER_RE.test(msg)
                        || (playerName.length > 2 && msg.toLowerCase().includes(playerName));
                    this._incomingWindow.push({ text: msg, comparative: result.comparative, aboutPlayer });
                    if (this._incomingWindow.length > WINDOW_SIZE) this._incomingWindow.shift();
                }
                return false;
            },
        } as ChatRoomMessageHandler);

        hookFunction("ServerSend", 6, (args, next) => {
            const data = args[1] as ServerChatRoomMessage;
            if (
                this.Enabled &&
                args[0] === "ChatRoomChat" &&
                data?.Type === "Chat" &&
                !data?.Content?.startsWith("(")
            ) {
                this._messageWindow.push(data.Content);
                if (this._messageWindow.length > WINDOW_SIZE) this._messageWindow.shift();

                const replyId = (data as ServerChatRoomMessage & { ReplyId?: string }).ReplyId;
                const replyTarget = replyId ? (ChatRoomMessageGetReplyContent(replyId) ?? undefined) : undefined;
                const individual = this.analyze(data.Content, false, false, replyTarget);
                const effective = this._messageWindow.length > 1
                    ? this._mergeWithWindow(individual)
                    : individual;

                this._logAnalysis(effective);
                this._callbacks.forEach(cb => {
                    try { cb(effective); } catch (_) { /* don't let a bad callback break speech */ }
                });
                if (effective.negativeSelf.detected || effective.contextualNegative.detected) {
                    this._messageWindow = [];
                }
            }
            return next(args);
        }, ModuleCategory.SpeechAnalysis);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.SpeechAnalysis);
        const idx = ChatRoomMessageHandlers.findIndex(h => h.Description === INCOMING_HANDLER_DESC);
        if (idx !== -1) ChatRoomMessageHandlers.splice(idx, 1);
        this._callbacks.clear();
        this._messageWindow = [];
        this._incomingWindow = [];
    }

    /** Merges individual analysis with a rolling-window analysis, OR-ing detections.
     *  raw/doc stay from the individual message so callers know what was just said. */
    private _mergeWithWindow(individual: LSCGSpeechAnalysis): LSCGSpeechAnalysis {
        const combined = this.analyze(this._messageWindow.join(" "), false, true);
        return {
            raw: individual.raw,
            doc: individual.doc,
            profanity:          individual.profanity.detected          ? individual.profanity          : combined.profanity,
            negativeSelf:       individual.negativeSelf.detected       ? individual.negativeSelf       : combined.negativeSelf,
            erudite:            individual.erudite.detected            ? individual.erudite            : combined.erudite,
            contextualNegative: individual.contextualNegative,
        };
    }

    private _logAnalysis(a: LSCGSpeechAnalysis): void {
        console.group(`[LSCG Speech] "${a.raw}"`);
        console.log("profanity:          ", a.profanity.detected ? `DETECTED — ${a.profanity.words.join(", ")}` : "clean");
        console.log("negative self:      ", a.negativeSelf.detected ? `DETECTED — score ${a.negativeSelf.score}, comparative ${a.negativeSelf.comparative.toFixed(2)}` : `clear (comparative: ${a.negativeSelf.comparative.toFixed(2)})`);
        console.log("erudite:            ", a.erudite.detected ? `DETECTED — grade level ${a.erudite.gradeLevel.toFixed(1)}` : `clear (grade: ${a.erudite.gradeLevel.toFixed(1)})`);
        if (a.contextualNegative.detected) {
            const reason = a.contextualNegative.agreedWithNegative ? "agreed with negative" : "disagreed with praise";
            console.log("contextual neg:     ", `DETECTED — ${reason} (via ${a.contextualNegative.via})`);
        } else {
            console.log("contextual neg:     ", "clear");
        }
        console.groupEnd();
    }

    onAnalysis(cb: LSCGSpeechAnalysisCallback): void {
        this._callbacks.add(cb);
    }

    offAnalysis(cb: LSCGSpeechAnalysisCallback): void {
        this._callbacks.delete(cb);
    }

    analyze(text: string, skipPath4 = false, skipContextual = false, replyTarget?: string): LSCGSpeechAnalysis {
        const doc = nlp(text);
        return {
            raw: text,
            doc,
            profanity:          this._analyzeProfanity(text),
            negativeSelf:       this._analyzeNegativeSelf(text, doc, skipPath4),
            erudite:            this._analyzeErudite(text),
            contextualNegative: skipContextual ? { detected: false, agreedWithNegative: false, disagreedWithPraise: false, via: null } : this._analyzeContextual(text, replyTarget),
        };
    }

    private _analyzeProfanity(text: string): LSCGSpeechAnalysis["profanity"] {
        const normalized = text.replace(/[^a-zA-Z0-9\s]/g, " ");
        const detected = leoProfanity.check(normalized);
        return {
            detected,
            words: detected ? leoProfanity.badWordsUsed(normalized) : [],
        };
    }

    private _analyzeNegativeSelf(text: string, doc: ReturnType<typeof nlp>, skipPath4 = false): LSCGSpeechAnalysis["negativeSelf"] {
        const result = _sentimentAnalyzer.analyze(text);

        // Self-reference: compromise pronouns + regex fallback for contractions ("I'm", "I've")
        const pronouns = (doc.pronouns().out("array") as string[]).map(p => p.toLowerCase());
        const firstPerson = pronouns.some(p => FIRST_PERSON.includes(p)) || FIRST_PERSON_RE.test(text);
        const playerName = ((Player?.Nickname ?? Player?.Name) || "").toLowerCase();
        const thirdPerson = playerName.length > 2 && text.toLowerCase().includes(playerName);
        const selfRef = firstPerson || thirdPerson;

        if (!selfRef) return { detected: false, score: result.score, comparative: result.comparative };

        // Path 1: AFINN score is clearly negative (strict: 0.0 is neutral, not negative)
        const clearlyNegative = result.comparative < NEGATIVE_SELF_THRESHOLD;

        // Path 2: negation word before an adjective — AFINN misses these because it scores
        // "good" as +3 regardless of whether "not" precedes it. compromise expands
        // contractions internally so "I'm not good" matches as "i am not good".
        const negatedAdjective = doc.match("(not|no|never|barely|hardly) .? #Adjective").found;

        // Path 3: negative-pronoun subject directed at the speaker — AFINN can't score
        // "nobody" so "nobody likes me" reads as positive due to "likes".
        const negativeSubjectRef = doc.match("(nobody|no one|nothing|none) .* (me|myself)").found;

        // Path 4: self-referential question answered with a negative qualifier — order matters.
        // "will anyone love me? probably not" ✓  vs  "probably not. will anyone love me?" ✗
        // The qualifier must appear in the text AFTER the question mark.
        // standaloneNegative handles bare "no"/"nah" as the entire post-question answer (split
        // messages joined by the window become "am I good? no") without matching "no worries".
        const questionPos = text.indexOf("?");
        const selfQuestion = doc.questions().found;
        const negativeQualifierRe = /\b(probably|definitely|certainly|maybe|perhaps|likely)?\s*(not|never|nope)\b|\b(i doubt|doubtful|unlikely|of course not)\b/i;
        const afterQuestion = text.slice(questionPos + 1);
        const standaloneNegative = /^\s*(no|nah)[.!]?\s*$/i.test(afterQuestion);
        const rhetoricalNegative = !skipPath4
            && questionPos !== -1
            && selfQuestion
            && (negativeQualifierRe.test(afterQuestion) || standaloneNegative);

        return {
            detected: clearlyNegative || negatedAdjective || negativeSubjectRef || rhetoricalNegative,
            score: result.score,
            comparative: result.comparative,
        };
    }

    private _analyzeContextual(playerText: string, replyTarget?: string): LSCGSpeechAnalysis["contextualNegative"] {
        const none = { detected: false, agreedWithNegative: false, disagreedWithPraise: false, via: null } as const;

        const playerAgreeing    = AGREEMENT_RE.test(playerText);
        const playerDisagreeing = DISAGREEMENT_RE.test(playerText);
        if (!playerAgreeing && !playerDisagreeing) return none;

        let negativeContext = false;
        let positiveContext = false;
        let via: "reply" | "window";

        if (replyTarget) {
            // Direct reply — the player chose this message, so skip the "about player" check.
            const result = _sentimentAnalyzer.analyze(replyTarget);
            negativeContext = result.comparative < INCOMING_NEGATIVE_THRESHOLD;
            positiveContext = result.comparative > INCOMING_POSITIVE_THRESHOLD;
            via = "reply";
        } else {
            if (this._incomingWindow.length === 0) return none;
            const recentAboutPlayer = this._incomingWindow.filter(e => e.aboutPlayer);
            if (recentAboutPlayer.length === 0) return none;
            negativeContext = recentAboutPlayer.some(e => e.comparative < INCOMING_NEGATIVE_THRESHOLD);
            positiveContext = recentAboutPlayer.some(e => e.comparative > INCOMING_POSITIVE_THRESHOLD);
            via = "window";
        }

        const agreedWithNegative  = playerAgreeing    && negativeContext;
        const disagreedWithPraise = playerDisagreeing && positiveContext;

        return {
            detected: agreedWithNegative || disagreedWithPraise,
            agreedWithNegative,
            disagreedWithPraise,
            via: (agreedWithNegative || disagreedWithPraise) ? via : null,
        };
    }

    private _analyzeErudite(text: string): LSCGSpeechAnalysis["erudite"] {
        if (!ERUDITE_ENABLED) return { detected: false, gradeLevel: 0 };
        const gradeLevel = _fleschKincaidGrade(text);
        return { detected: gradeLevel >= ERUDITE_GRADE_THRESHOLD, gradeLevel };
    }
}
