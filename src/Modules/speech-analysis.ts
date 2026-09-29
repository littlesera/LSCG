import { BaseModule } from "base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GuiSpeechAnalysis } from "Settings/speech-analysis";
import { GetDelimitedList, LSCG_SendLocal, excludeParentheticalContent, getCharacter, hasRemotePermission, hookFunction, isPhraseInString, removeAllHooksByModule, sendLSCGCommand, settingsSave } from "../utils";
import { getModule } from "modules";
import type { CoreModule } from "./core";
import type { StateModule } from "./states";
import Sentiment from "sentiment";
import nlp from "compromise/two";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import {
    IncomingPhraseGroup, SPEECH_DETECTORS, SPEECH_EDITABLE_KEYS, SPEECH_MAX_PHRASE_GROUPS, SpeechAnalysisSettingsModel, SpeechDetectorId, SpeechPhraseGroup,
    defaultSpeechDetectors, defaultSpeechSettings, sanitizeRemoteSpeechSettings,
} from "Settings/Models/speech-analysis";
import { SpeechReactionEngine } from "./speech-reactions";

export type SpeechTone = "negative" | "positive" | "neutral";
export type SpeechContextReason = "agreed" | "disagreed" | "self-nominated";
export type SpeechContextVia = "reply" | "whisper" | "addressed" | "open-question";

export interface LSCGSpeechAnalysis {
    /** The player's intended (un-garbled) text. */
    raw: string;
    /** compromise document for `raw` — consumers can run further queries without re-parsing. */
    doc: ReturnType<typeof nlp>;
    /** Whisper target member number, if the line was a whisper. */
    target?: number;
    /** Which detectors ran; a disabled detector's fields always read as not detected. */
    detectors: Record<SpeechDetectorId, boolean>;
    tone: SpeechTone;
    /** Self-comparison: -1 = ranks themself below others, +1 = lifted above them, 0 = none (or only puts others down). */
    comparison: number;
    negativeSelf: { detected: boolean; score: number; comparative: number };
    positiveSelf: { detected: boolean; score: number; comparative: number; viaPhrase: boolean };
    /** Tone inferred from how the player responded to something said to/about them. */
    context: {
        negative: boolean;
        positive: boolean;
        reason: SpeechContextReason | null;
        via: SpeechContextVia | null;
        pairedSender?: number;
    };
    profanity: { detected: boolean; words: string[] };
    erudite: { detected: boolean; gradeLevel: number };
    /** Phrase groups (by id) with at least one phrase spoken, and which phrases matched. */
    phrases: { matched: string[]; hits: { group: string; phrase: string }[] };
}

export type LSCGSpeechAnalysisCallback = (analysis: LSCGSpeechAnalysis) => void;

interface IncomingEntry {
    msgId?: string;
    senderNum: number;
    at: number;
    comparative: number;
    isWhisper: boolean;
    seeksPerson: boolean;
    toPlayer: boolean;
    subjectIsPlayer: boolean;
    consumed: boolean;
}

interface OutgoingLine {
    text: string;
    at: number;
}

type ResponseKind = "selfNominate" | "agree" | "disagree";

// AFINN scores common roleplay vocabulary as negative; in this setting those words are not self-deprecation.
// Genuine self-deprecation terms are reinforced. User extras (settings.lexiconExtras) are applied on top.
const DOMAIN_LEXICON: Record<string, number> = {
    // "no" is a negator/answer word, not a sentiment; AFINN's -1 makes "no I'm not" read as self-deprecation.
    no: 0,
    slave: 0, slaves: 0, slut: 0, sluts: 0, slutty: 0, whore: 0,
    punish: 0, punished: 0, punishing: 0, punishment: 0,
    pain: 0, painful: 0, hurt: 0, hurts: 0, helpless: 0, cry: 0, cries: 0, crying: 0,
    trapped: 0, captive: 0, captured: 0, prisoner: 0, restrained: 0, restrict: 0, restricted: 0,
    gag: 0, gagged: 0, whip: 0, whipped: 0, spank: 0, spanked: 0, spanking: 0,
    tease: 0, teased: 0, teasing: 0, torture: 0, tortured: 0, desperate: 0, beg: 0, begging: 0,
    submissive: 0, obedient: 1, owned: 0, collared: 0,
    worthless: -3, pathetic: -3, useless: -3, stupid: -3, failure: -3, disappointment: -3,
    unlovable: -3, unworthy: -3, burden: -2, trash: -2, garbage: -2, hopeless: -3, loser: -3,
};

const FIRST_PERSON_RE = /\b(i'm|i've|i'll|i'd|im|i|me|my|myself|mine)\b/i;
// Self-evaluative framing — a positive affirmation must be *about* the player, not just contain "I".
// "I can"/"I will" are deliberately excluded: a modal just states ability/intent for whatever follows
// ("I can't relax", "I will go home") and isn't itself a claim about the speaker's character.
const SELF_EVAL_RE = /\b(i\s+am|i'm|im|i\s+feel|i\s+deserve|i\s+look|i\s+did|i\s+(?:love|like|accept)\s+myself|proud\s+of\s+myself|i'?ve\s+been)\b/i;
// "I'm [not] [adverb] ___ing": matches both a real self-evaluation ("I'm boring", "I'm not amazing")
// and a progressive-tense hedge/activity that only looks like one ("I'm not interrupting", "I'm just
// trying my best"). compromise tags every -ing word identically (Verb, Gerund) whether it's a genuine
// participial adjective or an ongoing action, so the two can't be told apart by part-of-speech alone —
// EVALUATIVE_GERUND_ADJECTIVES below is the (small, AFINN-scored) allowlist of the ones that actually are.
const SELF_EVAL_GERUND_RE = /\bi(?:'m|\s+am)\s+(?:not\s+)?(?:\w+\s+)?([a-z]+ing)\b/i;
const EVALUATIVE_GERUND_ADJECTIVES = new Set([
    "amazing", "interesting", "boring", "exciting", "stunning", "charming", "fascinating",
    "annoying", "disappointing", "embarrassing", "confusing", "frustrating",
]);
// Others' feelings toward the player — self-referential even without "I am" framing.
const DIRECTED_AT_ME_RE = /\b(hates?|despises?|dislikes?|can'?t\s+stand|disgusted\s+(?:by|with))\s+(me|myself)\b/i;
const SECOND_PERSON_RE = /\b(you|your|you're|youre|you've|you'll|you'd|yours|yourself|ur|u)\b/i;
// Discourse fillers that contain "you" without making the listener the subject.
const SECOND_PERSON_FILLER_RE = /\b(you\s+know|y'?know|do\s+you\s+think|don'?t\s+you\s+think|you\s+think|you\s+see|thank\s+you|see\s+you|if\s+you\s+ask\s+me)\b/gi;
const SEEKS_PERSON_RE = /\b(who|who's|whos|whose|which\s+one|anyone|anybody|somebody|someone|any\s+volunteers)\b/i;
const QUESTION_START_RE = /^\s*(who|whose|which|what|is|are|am|do|does|did|can|could|will|would|should|isn't|aren't)\b/i;

const SELF_NOMINATE_RE = /^(i\s+am|i'm|im|me|i\s+do|i\s+will|i\s+would|guilty|that'?s\s+me|that'?d\s+be\s+me|that\s+would\s+be\s+me|it'?s\s+me|it\s+is\s+me|(?:definitely|probably|obviously|clearly|sadly|maybe|prolly)\s+me)(\s+(?:too|lol|haha|then))?$/i;
const AGREE_RE = /^(yes|yeah|yea|yep|yup|ya|true|so\s+true|too\s+true|that'?s\s+right|exactly|indeed|definitely|of\s+course|i\s+know|i\s+guess|i\s+suppose|probably|fair\s+enough|correct|agreed|sadly|unfortunately|you'?re\s+right|you\s+are\s+right|can'?t\s+deny|can'?t\s+argue|guilty|mhm|uh\s+huh)\b/i;
const DISAGREE_RE = /^(no|nah|nope|not\s+really|hardly|i\s+doubt|doubtful|unlikely|far\s+from\s+it|not\s+at\s+all|i\s+don'?t\s+think\s+so|i\s+disagree|that'?s\s+not\s+true|not\s+true|you'?re\s+wrong|am\s+not|i'?m\s+not|pssh|pff)\b/i;
const DISAGREE_EXCLUSION_RE = /^no\s+(worries|idea|problem|clue|thanks|thank\s+you|need|way)\b/i;

const ANSWER_AFFIRM_RE = /^\s*(yes|yeah|yep|yup|of\s+course|definitely|absolutely|certainly|probably)\b(?!\s+not)/i;
const ANSWER_NEGATE_RE = /^\s*((?:probably|definitely|certainly|maybe|perhaps|likely)?\s*(?:not|never|nope)|no|nah|i\s+doubt\s+it|doubtful|unlikely|of\s+course\s+not)\b/i;

// Comparisons: "other people are cuter than me", "I'm not as smart as them", "I'm the dumbest one here".
const COMPARATIVE_THAN_RE = /^(.*?)\b(?:(more|less)\s+)?([a-z']+)\s+than\b(.*)$/;
const AS_AS_RE = /^(.*?)\b(?:as|so)\s+([a-z']+)\s+as\b(.*)$/;
const SUPERLATIVE_RE = /\b(?:the|my)\s+(?:(most|least)\s+)?([a-z']+)\b/;
const NOT_COMPARATIVES = new Set(["rather", "other", "else", "different", "more", "less", "sooner", "later"]);
const IRREGULAR_POLARITY: Record<string, number> = { better: 1, best: 1, worse: -1, worst: -1 };
const SELF_OBJECT_RE = /\b(me|myself|mine|i|i'm|im)\b/;
const NEGATOR_RE = /\bnot\b|\bnever\b|n't\b/;
const OTHER_NEGATOR_RE = /\b(nobody|no one|noone|none|nothing)\b/;
// sentiment's own negation list only covers not/never/n't-style words, not "without": "without repercussions"
// otherwise scores negative purely from "repercussions", though the phrase means there are none.
const WITHOUT_RE = /\bwithout\s+((?:[a-z][a-z'-]*\s+){0,2}[a-z][a-z'-]*)/gi;

const MAX_INCOMING = 20;
const OUTGOING_WINDOW = 5;
const OUTGOING_WINDOW_MS = 30_000;
const MAX_OWN_MSG_IDS = 30;
const RESPONSE_MAX_WORDS = 8;
// Flesch-Kincaid assumes one sentence's worth of averaging; on a 1-4 word chat line, a single ordinary interjection
// ("Absolutely.", "Seriously?", "Ridiculous.") drags the score to 20-100+ purely from its syllable count, with no
// real sentence complexity behind it. That washes out once there are enough words to average over: from 5 words up,
// scores track intuitive complexity reasonably well, and a real short eloquent line can already exceed the default
// grade threshold (~10) at 6 words. Below this floor we report "not enough text" rather than trust the number.
const MIN_WORDS_FOR_ERUDITE = 5;
const INCOMING_HANDLER_DESC = "LSCG Speech Analysis Incoming Context";
const REMOTE_SET_LISTENER_ID = "speech_settings_set";
const REMOTE_GET_LISTENER_ID = "speech_settings_get";

const _sentimentAnalyzer = new Sentiment();
const _profanityMatcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

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

function _playerNames(): string[] {
    const names = [Player?.Nickname, Player?.Name].filter((n): n is string => !!n && n.length > 2);
    return [...new Set(names.map(n => n.toLowerCase()))];
}

function _mentionsPlayer(text: string): boolean {
    return _playerNames().some(n => isPhraseInString(text, n, true));
}

function _mentionsOtherCharacter(text: string, senderNum: number): boolean {
    return (ChatRoomCharacter ?? []).some(c => !c.IsPlayer() && c.MemberNumber !== senderNum
        && [c.Nickname, c.Name].some(n => !!n && n.length > 2 && isPhraseInString(text, n, true)));
}

function _isQuestion(text: string): boolean {
    return text.includes("?") || QUESTION_START_RE.test(text);
}

/** SELF_EVAL_RE, with one correction: an "I'm [not] ___ing" match only counts as self-evaluative when
 *  the -ing word is a genuine evaluative adjective (EVALUATIVE_GERUND_ADJECTIVES) — otherwise it's a
 *  progressive-tense hedge or activity ("I'm not interrupting", "I'm just trying my best") that isn't a
 *  claim about the speaker at all, and would otherwise read as one purely because "I'm" precedes it.
 *  SELF_EVAL_RE's other framings ("I feel…", "proud of myself…") are unaffected and still checked as-is. */
function _isSelfEvaluative(text: string): boolean {
    const gerund = SELF_EVAL_GERUND_RE.exec(text);
    const gerundIsEvaluative = !gerund || EVALUATIVE_GERUND_ADJECTIVES.has(gerund[1].toLowerCase());
    const withoutGerundMatch = gerund ? text.slice(0, gerund.index) + text.slice(gerund.index + gerund[0].length) : text;
    return (gerundIsEvaluative && SELF_EVAL_RE.test(text)) || SELF_EVAL_RE.test(withoutGerundMatch);
}

function _hasSecondPersonSubject(text: string): boolean {
    return SECOND_PERSON_RE.test(text.replace(SECOND_PERSON_FILLER_RE, " "));
}

export class SpeechAnalysisModule extends BaseModule {
    private _callbacks: Set<LSCGSpeechAnalysisCallback> = new Set();
    private _outgoingWindow: OutgoingLine[] = [];
    private _incoming: IncomingEntry[] = [];
    private _ownMsgIds: string[] = [];
    private _lastSpeaker: number | undefined;
    private _lastPlayerLineAt = 0;
    private _pendingRaw: { type: string; text: string; at: number } | null = null;
    private _lexiconCache: { key: string; extras: Record<string, number> } | null = null;
    private _reactions: SpeechReactionEngine | null = null;

    get settingsScreen(): Subscreen | null {
        return GuiSpeechAnalysis;
    }

    get settings(): SpeechAnalysisSettingsModel {
        return super.settings as SpeechAnalysisSettingsModel;
    }

    get defaultSettings(): SpeechAnalysisSettingsModel {
        return defaultSpeechSettings();
    }

    init(): void {
        super.init();
        // Default registration merges shallowly; merge detectors too so ones added later default correctly for existing users.
        this.settings.detectors = { ...defaultSpeechDetectors(), ...this.settings.detectors };
    }

    isDetectorEnabled(id: SpeechDetectorId): boolean {
        return this.settings.detectors?.[id] ?? SPEECH_DETECTORS.find(d => d.id === id)?.defaultEnabled ?? false;
    }

    load(): void {
        ChatRoomRegisterMessageHandler({
            Priority: 109,
            Description: INCOMING_HANDLER_DESC,
            Callback: (data: ServerChatRoomMessage, sender: Character, msg: string, metadata?: IChatRoomMessageMetadata) => {
                if (this.Enabled && sender && !sender.IsPlayer() && (data.Type === "Chat" || data.Type === "Whisper"))
                    this._recordIncoming(data, sender, msg, metadata);
                if (this.Enabled && (data.Type === "Chat" || data.Type === "Whisper") && data.Sender !== undefined)
                    this._lastSpeaker = data.Sender;
                return false;
            },
        } as ChatRoomMessageHandler);

        // Capture the text before sender-side speech transforms (gag garble etc.) are applied.
        hookFunction("ChatRoomGenerateChatRoomChatMessage", 1, (args, next) => {
            const [type, msg] = args as [string, string];
            if (type === "Chat" || type === "Whisper")
                this._pendingRaw = { type, text: msg, at: Date.now() };
            return next(args);
        }, ModuleCategory.SpeechAnalysis);

        // Priority below StateModule's speech block (5) so blocked lines are never analyzed.
        // Analysis (and so any reaction's emotes/actions) runs after the line is sent, so reactions follow it in the chat log.
        hookFunction("ServerSend", 4, (args, next) => {
            const data = args[1] as ServerChatRoomMessage;
            const result = next(args);
            if (this.Enabled && args[0] === "ChatRoomChat" && (data?.Type === "Chat" || data?.Type === "Whisper"))
                this._handleOutgoing(data);
            return result;
        }, ModuleCategory.SpeechAnalysis);

        this._reactions = new SpeechReactionEngine(this);

        const core = getModule<CoreModule>("CoreModule");
        core.RegisterCommandListener({ id: REMOTE_SET_LISTENER_ID, command: "speech-settings-set", func: (sender, msg) => this._handleRemoteSet(sender, msg) });
        core.RegisterCommandListener({ id: REMOTE_GET_LISTENER_ID, command: "speech-settings-get", func: sender => this._handleRemoteGet(sender) });
    }

    unload(): void {
        getModule<CoreModule>("CoreModule")?.RemoveCommandListenerById(REMOTE_SET_LISTENER_ID);
        getModule<CoreModule>("CoreModule")?.RemoveCommandListenerById(REMOTE_GET_LISTENER_ID);
        removeAllHooksByModule(ModuleCategory.SpeechAnalysis);
        const idx = ChatRoomMessageHandlers.findIndex(h => h.Description === INCOMING_HANDLER_DESC);
        if (idx !== -1) ChatRoomMessageHandlers.splice(idx, 1);
        this._reactions?.dispose();
        this._reactions = null;
        this._callbacks.clear();
        this._outgoingWindow = [];
        this._incoming = [];
        this._ownMsgIds = [];
        this._lastSpeaker = undefined;
        this._lastPlayerLineAt = 0;
    }

    safeword(): void {
        this.settings.locked = false;
    }

    get commands(): ICommand[] {
        return [<ICommand>{
            Tag: "speech",
            Description: "<text>: show how LSCG speech analysis reads a line (nothing is sent)",
            Action: (args: string) => {
                const text = (args ?? "").trim();
                if (!text) return LSCG_SendLocal("Usage: /lscg speech <text>");
                LSCG_SendLocal(this.describe(this.analyze(text)));
            },
        }];
    }

    /** Subscribe to the analysis of every chat line the player sends. Returns an unsubscribe function. */
    onAnalysis(cb: LSCGSpeechAnalysisCallback): () => void {
        this._callbacks.add(cb);
        return () => this.offAnalysis(cb);
    }

    offAnalysis(cb: LSCGSpeechAnalysisCallback): void {
        this._callbacks.delete(cb);
    }

    /** Analyze arbitrary text as if the player said it. Contextual pairing only runs for real outgoing lines. */
    analyze(text: string): LSCGSpeechAnalysis {
        return this._analyze(text, null);
    }

    describe(a: LSCGSpeechAnalysis): string {
        const ctx = a.context.negative || a.context.positive
            ? `${a.context.negative ? "negative" : "positive"} (${a.context.reason} via ${a.context.via})`
            : "none";
        const lines = [`"${a.raw}"`];
        if (a.detectors.tone) lines.push(
            `tone: ${a.tone}`,
            `negative self: ${a.negativeSelf.detected} (comparative ${a.negativeSelf.comparative.toFixed(2)})`,
            `positive self: ${a.positiveSelf.detected}${a.positiveSelf.viaPhrase ? " (affirmation phrase)" : ""}`,
            `comparison: ${a.comparison < 0 ? "below others" : a.comparison > 0 ? "above others" : "none"}`,
            `context: ${ctx}`,
        );
        else lines.push("tone: off");
        lines.push(`profanity: ${!a.detectors.profanity ? "off" : a.profanity.detected ? a.profanity.words.join(", ") : "none"}`);
        lines.push(`reading level: ${!a.detectors.erudite ? "off" : a.raw.split(/\s+/).length < MIN_WORDS_FOR_ERUDITE ? "not enough words to assess" : `${a.erudite.gradeLevel.toFixed(1)}${a.erudite.detected ? " (too high)" : ""}`}`);
        // Remotely-set phrases stay secret from the wearer: don't reveal that a hidden group matched, let alone which phrase.
        const visible = a.phrases.hits.filter(h => !this.isGroupHiddenFromWearer(h.group));
        const groupName = (id: string) => this.settings.phraseGroups?.find(g => g.id === id)?.name ?? id;
        lines.push(`phrases: ${!a.detectors.phrases ? "off" : visible.length ? visible.map(h => `"${h.phrase}" (${groupName(h.group)})`).join(", ") : "none"}`);
        return lines.join("\n");
    }

    isGroupHiddenFromWearer(groupId: string): boolean {
        const g = this.settings.phraseGroups?.find(x => x.id === groupId);
        return !!g && g.installedBy !== undefined && g.installedBy !== Player.MemberNumber;
    }

    // ---------- remote configuration ----------

    /** Access check shared by fetch and save. The sender's UI checks are advisory; this is authoritative. */
    private _canRemoteConfigure(sender: number): boolean {
        const s = this.settings;
        if (!this.Enabled || !s.remoteAccess || sender === Player.MemberNumber || !hasRemotePermission(Player, s.remoteLevel, sender))
            return false;
        return !s.remoteRequiresTrance || !!getModule<StateModule>("StateModule")?.HypnoState.Active;
    }

    /** Like hypno suggestions: owner and lovers see every group's phrases; anyone else only those they set themselves. */
    private _canSeePhrases(sender: number, group: SpeechPhraseGroup): boolean {
        return group.installedBy === sender || Player.IsOwnedByMemberNumber(sender) || Player.IsLoverOfMemberNumber(sender);
    }

    private _handleRemoteGet(sender: number): void {
        if (!this._canRemoteConfigure(sender)) return;
        const s = this.settings;
        const config: Record<string, unknown> = Object.fromEntries(SPEECH_EDITABLE_KEYS.map(k => [k, s[k]]));
        config.phraseGroups = (s.phraseGroups ?? []).map(g => this._canSeePhrases(sender, g)
            ? { ...g }
            : { id: g.id, name: g.name, phrases: "", installedBy: g.installedBy, installedByName: g.installedByName, hidden: true });
        config.locked = s.locked;
        const target = getCharacter(sender);
        if (target) sendLSCGCommand(target, "speech-settings-response", [{ name: "settings", value: config }]);
    }

    private _handleRemoteSet(sender: number, msg: LSCGMessageModel): void {
        if (!this._canRemoteConfigure(sender)) return;
        const s = this.settings;
        const { phraseGroups, ...changes } = sanitizeRemoteSpeechSettings(msg.command?.args?.find(a => a.name === "settings")?.value);
        if (!s.lockable) delete changes.locked;
        if (changes.detectors) changes.detectors = { ...s.detectors, ...changes.detectors };
        Object.assign(s, changes);
        if (phraseGroups) s.phraseGroups = this._mergeRemotePhraseGroups(sender, phraseGroups);

        settingsSave(true);
        const senderChar = getCharacter(sender);
        LSCG_SendLocal(`${senderChar ? CharacterNickname(senderChar) : sender} changed your speech analysis settings.`);
    }

    /** Groups the sender can't see are kept exactly as they are; groups whose phrases the sender sets become theirs
     *  (and so hidden from the wearer). A group missing from the incoming list is only deleted if the sender could see it. */
    private _mergeRemotePhraseGroups(sender: number, incoming: IncomingPhraseGroup[]): SpeechPhraseGroup[] {
        const current = this.settings.phraseGroups ?? [];
        const senderChar = getCharacter(sender);
        const senderName = senderChar ? CharacterNickname(senderChar) : String(sender);
        const merged: SpeechPhraseGroup[] = [];
        for (const inc of incoming) {
            const existing = current.find(g => g.id === inc.id);
            if (existing && !this._canSeePhrases(sender, existing)) {
                merged.push(existing);
            } else if (existing) {
                const phrasesChanged = inc.phrases !== undefined && inc.phrases !== existing.phrases;
                merged.push({
                    ...existing,
                    name: inc.name,
                    phrases: inc.phrases ?? existing.phrases,
                    ...(phrasesChanged ? { installedBy: sender, installedByName: senderName } : {}),
                });
            } else {
                merged.push({ id: inc.id, name: inc.name, phrases: inc.phrases ?? "", installedBy: sender, installedByName: senderName });
            }
        }
        for (const g of current)
            if (!merged.some(m => m.id === g.id) && !this._canSeePhrases(sender, g)) merged.push(g);
        return merged.slice(0, SPEECH_MAX_PHRASE_GROUPS);
    }

    // ---------- incoming context ----------

    private _recordIncoming(data: ServerChatRoomMessage, sender: Character, msg: string, metadata?: IChatRoomMessageMetadata): void {
        // The player couldn't understand a garbled line, so it can't be something they're responding to.
        if (metadata?.OriginalMsg !== undefined && metadata.OriginalMsg !== msg) return;
        const text = excludeParentheticalContent(msg ?? "").trim();
        if (!text) return;

        const now = Date.now();
        const senderNum = sender.MemberNumber!;
        const isWhisper = data.Type === "Whisper";
        const mentionsPlayer = _mentionsPlayer(text);
        // "Bob, you're so dumb" addresses Bob — "you" only means the player when no one else is named.
        const secondPerson = _hasSecondPersonSubject(text) && (mentionsPlayer || !_mentionsOtherCharacter(text, senderNum));
        const seeksPerson = _isQuestion(text) && SEEKS_PERSON_RE.test(text) && !secondPerson;
        const repliesToPlayer = !!metadata?.ReplyId && this._ownMsgIds.includes(metadata.ReplyId);

        const roomIsPrivate = (ChatRoomCharacter?.length ?? 0) <= 2;
        const ongoingExchange = this._incoming.some(e => e.senderNum === senderNum && e.toPlayer && !this._expired(e, now));
        const playerSpokeLast = this._lastSpeaker === Player.MemberNumber;
        const toPlayer = isWhisper || repliesToPlayer || mentionsPlayer
            || (secondPerson && (roomIsPrivate || ongoingExchange || playerSpokeLast));

        this._incoming.push({
            msgId: metadata?.MsgId,
            senderNum,
            at: now,
            comparative: this._sentiment(text).comparative,
            isWhisper,
            seeksPerson,
            toPlayer,
            subjectIsPlayer: mentionsPlayer || secondPerson,
            consumed: false,
        });
        this._pruneIncoming(now);
    }

    private _expired(e: { at: number }, now: number): boolean {
        return now - e.at > this.settings.contextWindowSeconds * 1000;
    }

    private _pruneIncoming(now: number): void {
        this._incoming = this._incoming.filter(e => !this._expired(e, now)).slice(-MAX_INCOMING);
    }

    // ---------- outgoing ----------

    private _handleOutgoing(data: ServerChatRoomMessage): void {
        const now = Date.now();
        const pending = this._pendingRaw;
        this._pendingRaw = null;
        const raw = pending && pending.type === data.Type && now - pending.at < 2000 ? pending.text : data.Content;
        if (!raw || raw.trim().startsWith("(")) return;
        const text = excludeParentheticalContent(raw).trim();
        if (!text) return;

        const dict = (data.Dictionary ?? []) as ChatMessageDictionaryEntry[];
        const msgId = dict.find(IsMsgIdDictionaryEntry)?.MsgId;
        const replyId = dict.find(IsReplyIdDictionaryEntry)?.ReplyId;
        if (msgId) {
            this._ownMsgIds.push(msgId);
            if (this._ownMsgIds.length > MAX_OWN_MSG_IDS) this._ownMsgIds.shift();
        }

        const target = data.Type === "Whisper" ? data.Target : undefined;
        const individual = this._analyze(text, { replyId, target, sinceAt: this._lastPlayerLineAt });
        this._lastPlayerLineAt = now;
        this._lastSpeaker = Player.MemberNumber;

        this._outgoingWindow = this._outgoingWindow.filter(l => now - l.at < OUTGOING_WINDOW_MS);
        this._outgoingWindow.push({ text, at: now });
        if (this._outgoingWindow.length > OUTGOING_WINDOW) this._outgoingWindow.shift();

        const effective = this._outgoingWindow.length > 1 && individual.tone === "neutral"
            ? this._mergeWithWindow(individual)
            : individual;

        if (effective.tone !== "neutral") this._outgoingWindow = [];
        if (this.settings.debugLog) console.log(`[LSCG Speech]\n${this.describe(effective)}`);
        this._callbacks.forEach(cb => {
            try { cb(effective); } catch (e) { console.error("LSCG: speech analysis callback failed", e); }
        });
    }

    /** Catches self-talk split across messages ("am I pretty?" … "no"). Only tone is merged —
     *  profanity/reading level stay per-line so one bad line doesn't re-trigger on every later one. */
    private _mergeWithWindow(individual: LSCGSpeechAnalysis): LSCGSpeechAnalysis {
        const combined = this._analyze(this._outgoingWindow.map(l => l.text).join(" "), null);
        if (combined.tone === "neutral") return individual;
        return {
            ...individual,
            negativeSelf: combined.negativeSelf,
            positiveSelf: combined.positiveSelf,
            comparison: combined.comparison,
            tone: combined.tone,
        };
    }

    // ---------- analysis ----------

    private _analyze(text: string, outgoing: { replyId?: string; target?: number; sinceAt: number } | null): LSCGSpeechAnalysis {
        const doc = nlp(text);
        const detectors = Object.fromEntries(SPEECH_DETECTORS.map(d => [d.id, this.isDetectorEnabled(d.id)])) as Record<SpeechDetectorId, boolean>;

        const off = { detected: false, score: 0, comparative: 0 };
        const comparison = detectors.tone ? this._comparison(text) : null;
        const negativeSelf = detectors.tone ? this._analyzeNegativeSelf(text, doc, comparison) : off;
        const positiveSelf = detectors.tone ? this._analyzePositiveSelf(text, doc, negativeSelf.detected, comparison) : { ...off, viaPhrase: false };
        const context = detectors.tone && outgoing
            ? this._analyzeContext(text, outgoing.replyId, outgoing.target, outgoing.sinceAt)
            : { negative: false, positive: false, reason: null, via: null };

        const negative = negativeSelf.detected || context.negative;
        const positive = positiveSelf.detected || context.positive;
        return {
            raw: text,
            doc,
            target: outgoing?.target,
            detectors,
            tone: negative ? "negative" : positive ? "positive" : "neutral",
            comparison: comparison ?? 0,
            negativeSelf,
            positiveSelf,
            context,
            profanity: detectors.profanity ? this._analyzeProfanity(text) : { detected: false, words: [] },
            erudite: detectors.erudite ? this._analyzeErudite(text) : { detected: false, gradeLevel: 0 },
            phrases: detectors.phrases ? this._analyzePhrases(text) : { matched: [], hits: [] },
        };
    }

    private _lexicon(): Record<string, number> {
        const key = this.settings.lexiconExtras ?? "";
        if (this._lexiconCache?.key !== key) {
            const extras = { ...DOMAIN_LEXICON };
            for (const entry of GetDelimitedList(key)) {
                const [word, score] = entry.split(":").map(s => s.trim());
                const n = Number(score);
                if (word && Number.isFinite(n)) extras[word] = Math.max(-5, Math.min(5, n));
            }
            this._lexiconCache = { key, extras };
        }
        return this._lexiconCache.extras;
    }

    private _sentiment(text: string) {
        const result = _sentimentAnalyzer.analyze(text, { extras: this._lexicon() });
        let offset = 0;
        for (const m of text.matchAll(WITHOUT_RE)) {
            const span = _sentimentAnalyzer.analyze(m[1], { extras: this._lexicon() });
            // "without repercussions" means the opposite of what "repercussions" alone scores; a positive span
            // ("without help") is a genuine lack of something good, so it's left as the library scored it.
            if (span.score < 0) offset -= span.score;
        }
        if (offset === 0) return result;
        const score = result.score + offset;
        return { ...result, score, comparative: score / Math.max(1, result.tokens.length) };
    }

    /** Built-in list (with its usual leetspeak/repeat handling) plus exact words/phrases the wearer added,
     *  minus exact words/phrases the wearer removed. Extras and safe words are plain text, not run through
     *  the disguised-spelling handling — "Also profane"/"Never profane" only need to match as typed. */
    private _analyzeProfanity(text: string): LSCGSpeechAnalysis["profanity"] {
        const safe = GetDelimitedList(this.settings.profanitySafe ?? "");
        const builtIn = _profanityMatcher.getAllMatches(text, true)
            .map(m => englishDataset.getPayloadWithPhraseMetadata(m).phraseMetadata?.originalWord ?? text.slice(m.startIndex, m.endIndex + 1))
            .filter(word => !safe.some(s => s.toLowerCase() === word.toLowerCase()));
        const extras = GetDelimitedList(this.settings.profanityExtras ?? "").filter(word => isPhraseInString(text, word, true));
        const words = [...new Set([...builtIn, ...extras])];
        return words.length ? { detected: true, words } : { detected: false, words: [] };
    }

    /** +1 when a self-question is answered in its favour, -1 when answered against the player, 0 otherwise.
     *  "will anyone love me? probably not" → -1, "am I useless? no" → +1. Order matters: the answer must follow the "?". */
    private _rhetoricalAnswer(text: string): number {
        const q = text.indexOf("?");
        if (q === -1) return 0;
        const question = text.slice(0, q);
        const answer = text.slice(q + 1);
        if (!FIRST_PERSON_RE.test(question) || !answer.trim()) return 0;
        const questionPolarity = Math.sign(this._sentiment(question).score);
        const answerPolarity = ANSWER_NEGATE_RE.test(answer) ? -1 : ANSWER_AFFIRM_RE.test(answer) ? 1 : 0;
        return questionPolarity * answerPolarity;
    }

    /** Sign of an adjective's sentiment, reducing comparative/superlative forms to their base (cuter → cute, prettiest → pretty). */
    private _adjectivePolarity(word: string, superlative = false): number {
        if (IRREGULAR_POLARITY[word]) return IRREGULAR_POLARITY[word];
        const candidates = superlative
            ? [word.replace(/iest$/, "y"), word.slice(0, -2), word.slice(0, -3), word.slice(0, -4)]
            : [word, word.replace(/ier$/, "y"), word.slice(0, -1), word.slice(0, -2), word.slice(0, -3)];
        for (const c of candidates) {
            if (c.length < 2) continue;
            const score = this._sentiment(c).score;
            if (score !== 0) return Math.sign(score);
        }
        return 0;
    }

    /** -1 when the player ranks themself below others, +1 when lifted above them, 0 for a comparison that counts as
     *  neither, null when there's no self-comparison. Raw sentiment gets these backwards: "other people are cuter
     *  than me" scores positive because of "cute", so any comparison decides the tone on its own. */
    private _comparison(text: string): number | null {
        const names = _playerNames();
        const refsSelf = (s: string, asObject: boolean) =>
            (asObject ? SELF_OBJECT_RE : FIRST_PERSON_RE).test(s) || names.some(n => isPhraseInString(s, n, true));
        const negated = (s: string) => NEGATOR_RE.test(s) || OTHER_NEGATOR_RE.test(s);

        // A comparison in the player's favour only counts as positive when it lifts the player with a positive
        // quality ("I'm prettier than her", "nobody is prettier than me"). Winning by putting others down
        // ("she's uglier than me", "I'm less ugly than her") is neutral, not an affirmation.
        const favourable = (score: number, quality: number, liftsSpeaker: boolean) =>
            score > 0 && !(quality > 0 && liftsSpeaker) ? 0 : score;

        for (const sentence of text.toLowerCase().split(/[.!?;]+/)) {
            const than = COMPARATIVE_THAN_RE.exec(sentence);
            if (than) {
                const [, left, moreLess, word, right] = than;
                if (!NOT_COMPARATIVES.has(word) && (moreLess || /er$/.test(word) || word in IRREGULAR_POLARITY)) {
                    const quality = this._adjectivePolarity(word);
                    const p = quality * (moreLess === "less" ? -1 : 1);
                    const selfLeft = refsSelf(left, false), selfRight = refsSelf(right, true);
                    // "I'm cuter than her" → +p; "she's cuter than me" → -p; "nobody is cuter than me" flips back.
                    let score = selfLeft && !selfRight ? p : selfRight && !selfLeft ? -p : 0;
                    if (negated(left)) score = -score;
                    const liftsSpeaker = moreLess !== "less" && (selfLeft || OTHER_NEGATOR_RE.test(left));
                    if (quality && (selfLeft !== selfRight)) return favourable(score, quality, liftsSpeaker);
                }
            }

            const asAs = AS_AS_RE.exec(sentence);
            if (asAs) {
                const [, left, word, right] = asAs;
                const quality = this._adjectivePolarity(word);
                const selfLeft = refsSelf(left, false), selfRight = refsSelf(right, true);
                // "I'm (not) as smart as them" is about the player; "she's as pretty as me" only counts when negated.
                const score = selfLeft && !selfRight ? (negated(left) ? -quality : quality)
                    : selfRight && !selfLeft && negated(left) ? quality : 0;
                // "nobody is as pretty as me" lifts the player; "she's not as pretty as me" puts her down.
                const liftsSpeaker = selfLeft || OTHER_NEGATOR_RE.test(left);
                if (score) return favourable(score, quality, liftsSpeaker);
            }

            const sup = SUPERLATIVE_RE.exec(sentence);
            if (sup) {
                const [match, mostLeast, word] = sup;
                const isSuperlative = !!mostLeast || word in IRREGULAR_POLARITY || (word.length > 4 && word.endsWith("est"));
                const prefix = sentence.slice(0, sup.index);
                if (isSuperlative && _isSelfEvaluative(prefix) && !prefix.includes(" than ") && !!match) {
                    const quality = mostLeast ? this._adjectivePolarity(word) : this._adjectivePolarity(word, true);
                    let p = mostLeast === "least" ? -quality : quality;
                    if (NEGATOR_RE.test(prefix)) p = -p;
                    // "I'm the least ugly" / "I'm not the ugliest" aren't affirmations.
                    if (p) return favourable(p, quality, mostLeast !== "least");
                }
            }
        }
        return null;
    }

    private _selfReferenced(text: string): boolean {
        return FIRST_PERSON_RE.test(text) || _mentionsPlayer(text);
    }

    /** "I" as the subject of a verb (or verb chain) with no external object ("I suck", "I failed", "I suck at this")
     *  — as opposed to "I love pizza" or "I love being her slave", where the verb chain evaluates something other
     *  than the speaker. SELF_EVAL_RE only covers a fixed list of framings ("I am…", "I feel…"); this generalizes
     *  to any plain self-referential verb.
     *  Modal-governed verbs ("I can't relax", "I couldn't find my keys") are excluded even with no object: a modal
     *  states ability/permission/intent for an activity, not a judgment about the speaker — there are plenty of
     *  reasons to not be able to relax that have nothing to do with self-worth.
     *  A copula (the "'m"/"am" in "I'm …") is itself tagged #Verb, so "i #Verb" alone matches "I'm" even when the
     *  real content verb is a gerund further on ("I'm not interrupting") — that's SELF_EVAL_RE/_isSelfEvaluative's
     *  domain, not this one's, so a copula-only match here doesn't count as a self-referential verb. */
    private _selfVerbNoObject(doc: ReturnType<typeof nlp>): boolean {
        if (doc.match("i #Modal").found) return false;
        const verbTags: string[][] = doc.match("i #Verb").json().flatMap((t: any) => t.terms.filter((x: any) => x.tags.includes("Verb")).map((x: any) => x.tags));
        const hasNonCopulaVerb = verbTags.some(tags => !tags.includes("Copula"));
        return hasNonCopulaVerb && !doc.match("i #Verb+ (#Determiner|#Noun|#ProperNoun)").found;
    }

    /** Negated *positive* adjective ("not very good"). A negated negative ("not bad") is not self-deprecation. */
    private _negatedPositiveAdjective(doc: ReturnType<typeof nlp>): boolean {
        const adjectives = doc.match("(not|never|barely|hardly) .? [#Adjective]", 0).out("array") as string[];
        return adjectives.some(adj => this._sentiment(adj).score > 0);
    }

    private _analyzeNegativeSelf(text: string, doc: ReturnType<typeof nlp>, comparison: number | null): LSCGSpeechAnalysis["negativeSelf"] {
        const result = this._sentiment(text);
        const base = { score: result.score, comparative: result.comparative };
        if (!this._selfReferenced(text)) return { detected: false, ...base };

        // An answered self-question decides the tone on its own: "am I useless? no" is not self-deprecation,
        // even though "useless" dominates the raw score.
        const rhetorical = this._rhetoricalAnswer(text);
        if (rhetorical !== 0) return { detected: rhetorical < 0, ...base };
        // Likewise a self-comparison: "I'm smarter than those idiots" is not negative despite "idiots".
        if (comparison !== null) return { detected: comparison < 0, ...base };

        // Raw sentiment only counts when the line evaluates the player ("I am…", "…hates me"),
        // not whenever "I"/"me" appears ("I hate this game", "nothing can stop me").
        const selfEvaluative = _isSelfEvaluative(text) || DIRECTED_AT_ME_RE.test(text) || _mentionsPlayer(text) || this._selfVerbNoObject(doc);
        const clearlyNegative = selfEvaluative && result.comparative < this.settings.negativeThreshold;
        const negatedPositive = this._negatedPositiveAdjective(doc);
        // AFINN can't score "nobody"; "nobody likes me" otherwise reads as positive.
        const nobodyToMe = doc.match("(nobody|no one|noone) .* (me|myself)").found;

        return { detected: clearlyNegative || negatedPositive || nobodyToMe, ...base };
    }

    private _analyzePositiveSelf(text: string, doc: ReturnType<typeof nlp>, negativeDetected: boolean, comparison: number | null): LSCGSpeechAnalysis["positiveSelf"] {
        const result = this._sentiment(text);
        const base = { score: result.score, comparative: result.comparative };
        const viaPhrase = GetDelimitedList(this.settings.affirmationPhrases ?? "").some(p => isPhraseInString(text, p, true));
        if (viaPhrase) return { detected: true, viaPhrase, ...base };
        if (negativeDetected) return { detected: false, viaPhrase, ...base };

        const rhetorical = this._rhetoricalAnswer(text);
        if (rhetorical !== 0) return { detected: rhetorical > 0, viaPhrase, ...base };
        if (comparison !== null) return { detected: comparison > 0, viaPhrase, ...base };

        const selfEvaluative = _isSelfEvaluative(text) || _mentionsPlayer(text) || this._selfVerbNoObject(doc);
        const detected = selfEvaluative
            && result.comparative > this.settings.positiveThreshold
            && !this._negatedPositiveAdjective(doc);
        return { detected, viaPhrase, ...base };
    }

    private _classifyResponse(text: string): ResponseKind | null {
        const lead = text.toLowerCase().split(/[,.!?;]/)[0].trim().replace(/\s+/g, " ");
        if (!lead || lead.split(" ").length > RESPONSE_MAX_WORDS) return null;
        if (SELF_NOMINATE_RE.test(lead) || _playerNames().includes(lead)) return "selfNominate";
        if (DISAGREE_EXCLUSION_RE.test(lead)) return null;
        if (AGREE_RE.test(lead)) return "agree";
        if (DISAGREE_RE.test(lead)) return "disagree";
        return null;
    }

    private _analyzeContext(text: string, replyId: string | undefined, target: number | undefined, sinceAt: number): LSCGSpeechAnalysis["context"] {
        const none: LSCGSpeechAnalysis["context"] = { negative: false, positive: false, reason: null, via: null };
        const response = this._classifyResponse(text);
        if (!response) return none;

        const now = Date.now();
        this._pruneIncoming(now);
        const eligible = (e: IncomingEntry) => !e.consumed && (response === "selfNominate"
            ? e.seeksPerson
            : e.toPlayer && e.subjectIsPlayer);

        let candidate: IncomingEntry | undefined;
        let via: SpeechContextVia;
        if (replyId) {
            // An explicit reply to something not aimed at the player is not a response about the player.
            candidate = this._incoming.find(e => e.msgId === replyId && eligible(e));
            via = "reply";
        } else if (target !== undefined) {
            candidate = this._incoming.filter(e => e.senderNum === target && eligible(e)).pop();
            via = "whisper";
        } else {
            // Only lines the player hasn't spoken past — "yeah" after an unrelated line isn't answering the older message.
            candidate = this._incoming.filter(e => e.at > sinceAt && !e.isWhisper && eligible(e)).pop();
            via = candidate?.seeksPerson ? "open-question" : "addressed";
        }
        if (!candidate) return none;

        const threshold = this.settings.incomingThreshold;
        const negativeContext = candidate.comparative < -threshold;
        const positiveContext = candidate.comparative > threshold;
        if (!negativeContext && !positiveContext) return none;
        candidate.consumed = true;

        const affirming = response === "selfNominate" || response === "agree";
        const negative = affirming ? negativeContext : positiveContext;
        return {
            negative,
            positive: !negative,
            reason: response === "selfNominate" ? "self-nominated" : response === "agree" ? "agreed" : "disagreed",
            via: candidate.seeksPerson && via !== "reply" && via !== "whisper" ? "open-question" : via,
            pairedSender: candidate.senderNum,
        };
    }

    private _analyzePhrases(text: string): LSCGSpeechAnalysis["phrases"] {
        const hits: LSCGSpeechAnalysis["phrases"]["hits"] = [];
        for (const group of this.settings.phraseGroups ?? []) {
            for (const phrase of GetDelimitedList(group.phrases ?? "")) {
                if (isPhraseInString(text, phrase, true)) hits.push({ group: group.id, phrase });
            }
        }
        return { matched: [...new Set(hits.map(h => h.group))], hits };
    }

    private _analyzeErudite(text: string): LSCGSpeechAnalysis["erudite"] {
        if (text.split(/\s+/).length < MIN_WORDS_FOR_ERUDITE) return { detected: false, gradeLevel: 0 };
        const gradeLevel = _fleschKincaidGrade(text);
        return { detected: gradeLevel >= this.settings.eruditeGrade, gradeLevel };
    }
}
