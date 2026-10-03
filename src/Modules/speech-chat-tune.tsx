import { h } from "tsx-dom";
import { settingsSave } from "utils";
import type { LSCGSpeechAnalysis, RecentSpeechLine, SpeechAnalysisModule } from "./speech-analysis";
import { markProfane, markSafe, setWordScore, suggestTuning, type TuningKind } from "./speech-tuning";
import type { SpeechAnalysisSettingsModel } from "../Settings/Models/speech-analysis";

const TONE_ICON = { negative: "✗", neutral: "–", positive: "✓" } as const;

/** Color-coded tone marker: ✗ negative (red), – neutral (grey), ✓ positive (green). */
export function toneBadge(tone: "negative" | "neutral" | "positive", withText = true): HTMLElement {
    return <span class={`lscg-tone lscg-tone-${tone}`} title={tone}>{TONE_ICON[tone]}{withText ? ` ${tone}` : ""}</span> as HTMLElement;
}

/** Reading level marker, icon first like the tone and profanity ones: ✗ when the line is over the wearer's limit, ✓ when under, nothing when it's too short to assess. */
export function levelBadge(a: LSCGSpeechAnalysis, limit: number): HTMLElement | null {
    if (!a.detectors.erudite || a.erudite.gradeLevel === 0) return null;
    const tone = a.erudite.detected ? "negative" : "positive";
    return <span class={`lscg-tone lscg-tone-${tone}`} title={`Reading grade ${a.erudite.gradeLevel.toFixed(1)}, limit ${limit}`}>{`${a.erudite.detected ? "✗" : "✓"} Aa ${a.erudite.gradeLevel.toFixed(1)}`}</span> as HTMLElement;
}

/** Small colored tag: an icon (struck through for "allowed" tags) and optional text. */
export function tag(kind: TuningKind, icon: string, text: string | null, tip: string, onClick: () => void, pressed?: boolean): HTMLElement {
    return <button type="button" class={`lscg-chat-tune-action lscg-tag-${kind}`} title={tip} aria-label={tip} aria-pressed={pressed === undefined ? undefined : String(pressed)} onClick={onClick}>
        <span class="lscg-tag-icon">{icon}</span>{text ? ` ${text}` : ""}
    </button> as HTMLElement;
}

export interface WordTunerState {
    selected?: string;
}

/** The line's words as chips. Picking one offers to score it negative/positive, ignore it, or mark it profane/safe,
 *  limited to the detectors that are switched on. Works on lines that read as neutral too. */
export function wordTuner(a: LSCGSpeechAnalysis, text: string, settings: SpeechAnalysisSettingsModel, state: WordTunerState, onApply: () => void, scope: "tone" | "profanity" | "all" = "all",
    /** Whether a word counts as profane right now (built-in list, wearer's additions and exceptions all included). */
    isProfane: (word: string) => boolean = word => a.profanity.words.some(w => word.includes(w.toLowerCase()))): HTMLElement {
    const words = [...new Set((text.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []))].slice(0, 30);
    const scores = new Map(a.trace.words.map(w => [w.word, w.score]));
    const root = <div class="lscg-wordtuner" /> as HTMLElement;
    const apply = (fn: () => void) => () => { fn(); onApply(); };

    for (const word of words) {
        const score = scores.get(word) ?? 0;
        const tone = scope === "profanity" ? (isProfane(word) ? "negative" : "neutral") : score < 0 ? "negative" : score > 0 ? "positive" : "neutral";
        root.append(<button type="button" class={`lscg-word lscg-tone-${tone}`} aria-pressed={String(state.selected === word)}
            title={scope === "profanity" ? `${word}: ${isProfane(word) ? "profane" : "not profane"}` : score ? `${word}: ${score > 0 ? "+" : ""}${score.toFixed(1)}` : `${word}: not scored`}
            onClick={() => { state.selected = state.selected === word ? undefined : word; onApply(); }}>{word}</button>);
    }

    const picked = state.selected && words.includes(state.selected) ? state.selected : undefined;
    if (picked) {
        const actions = <div class="lscg-wordtuner-actions"><span class="lscg-chat-tune-info">{picked}:</span></div> as HTMLElement;
        const add = (kind: TuningKind, icon: string, tip: string, fn: () => void) => actions.append(tag(kind, icon, null, tip, apply(fn)));
        if (a.detectors.tone && scope !== "profanity") {
            add("negative", "✗", `Count "${picked}" as negative (-3): lines about you that use it will read as negative.`, () => setWordScore(settings, picked, -3));
            add("positive", "✓", `Count "${picked}" as positive (+3): lines about you that use it will read as positive.`, () => setWordScore(settings, picked, 3));
            add("ignore", "⊘", `Ignore "${picked}" (score 0): it stops pushing any line negative or positive.`, () => setWordScore(settings, picked, 0));
        }
        if (a.detectors.profanity && scope !== "tone") {
            // Only the opposite of what it is now.
            if (isProfane(picked))
                add("safe", "⚠", `Never treat "${picked}" as profane: it is allowed in every line you say.`, () => markSafe(settings, picked));
            else
                add("profane", "⚠", `Treat "${picked}" as profane: any line containing it counts as profanity.`, () => markProfane(settings, picked));
        }
        root.append(actions);
    }
    return root;
}

/** Whether inline tuning may show at all: the module is on, settings aren't locked, and something can be tuned. */
export function canTuneInline(speech: SpeechAnalysisModule): boolean {
    const s = speech.settings;
    return !!s.chatTuneButtons && !!s.enabled && !s.locked && (["tone", "profanity", "erudite"] as const).some(d => speech.isDetectorEnabled(d));
}

const isTransparent = (color: string): boolean => {
    if (!color || color === "transparent") return true;
    const alpha = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/.exec(color);
    return !!alpha && parseFloat(alpha[1]) === 0;
};

/** The background actually showing behind an element: its own, or the nearest ancestor's that isn't transparent. */
export function effectiveBackground(el: HTMLElement | null): string | null {
    for (let node = el; node; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (!isTransparent(color)) return color;
    }
    return null;
}

const formatMs = (ms: number): string => ms < 0.1 ? "<0.1 ms" : `${ms.toFixed(1)} ms`;

/** Adds a small, hover-revealed button to one of the wearer's own chat lines; it opens an inline panel showing how
 *  the line read and the settings changes that would alter that. Nothing is changed until a suggestion is clicked. */
export function attachChatTune(message: HTMLElement, speech: SpeechAnalysisModule, line: RecentSpeechLine): void {
    if (message.querySelector(".lscg-chat-tune")) return;
    let panel: HTMLElement | null = null;
    const tweaking = { tone: false, profanity: false };
    const tunerState = { tone: {} as WordTunerState, profanity: {} as WordTunerState };

    const close = () => {
        panel?.remove();
        panel = null;
        toggle.setAttribute("aria-expanded", "false");
    };

    const render = () => {
        if (!panel) return;
        panel.replaceChildren();
        // Settings may have been switched or locked since the line was spoken.
        if (!canTuneInline(speech)) { close(); return; }
        const a = speech.analyze(line.text);
        const suggestions = suggestTuning(a, speech.settings);
        const changed = () => { settingsSave(); render(); };

        /** One labeled row per detector, so every tag sits under the detector it tunes. */
        const row = (detector: "tone" | "profanity" | "erudite", label: string, info: (Node | string | null)[], scope?: "tone" | "profanity") => {
            const infoEl = <span class="lscg-chat-tune-info" /> as HTMLElement;
            infoEl.append(...info.filter((x): x is Node | string => x !== null));
            const el = <div class={`lscg-chat-tune-row lscg-chat-tune-row-${detector}`}>
                <span class="lscg-chat-tune-label">{label}</span>
                {infoEl}
            </div> as HTMLElement;
            for (const suggestion of suggestions.filter(x => x.detector === detector))
                el.append(tag(suggestion.kind, suggestion.icon, suggestion.short, suggestion.tip, () => { suggestion.apply(speech.settings); changed(); }));
            if (scope)
                el.append(tag("ignore", "✎", null, scope === "tone"
                    ? "Pick individual words from this line to count as negative or positive, or to ignore."
                    : "Pick individual words from this line to treat as profane or never as profane.", () => { tweaking[scope] = !tweaking[scope]; render(); }, tweaking[scope]));
            if (scope && tweaking[scope]) el.append(wordTuner(a, line.text, speech.settings, tunerState[scope], changed, scope, w => speech.analyze(w).profanity.detected));
            panel!.append(el);
        };

        if (a.detectors.tone) {
            const words = a.trace.words.map(w => `${w.word} ${w.score > 0 ? "+" : ""}${w.score.toFixed(1)}`).join(", ");
            row("tone", "Tone", [toneBadge(a.tone, false), words ? ` ${words}` : null], "tone");
        }
        if (a.detectors.profanity)
            row("profanity", "Profanity", [<span class={`lscg-tone lscg-tone-${a.profanity.detected ? "negative" : "positive"}`}>{a.profanity.detected ? `⚠ ${a.profanity.words.join(", ")}` : "✓ clean"}</span> as HTMLElement], "profanity");
        if (a.detectors.erudite)
            row("erudite", "Reading", [levelBadge(a, speech.settings.eruditeGrade) ?? "too short to assess"]);

        // For debugging: what this line cost when it was spoken (not the re-analysis done to draw this panel).
        const timing = <span class="lscg-chat-tune-info" title="Time spent analyzing this line, and then running the reaction rules, when it was spoken">
            ⏱ {formatMs(line.analysisMs)} analysis · {formatMs(line.reactionMs)} reactions
        </span> as HTMLElement;
        panel.append(<div class="lscg-chat-tune-row lscg-chat-tune-row-time"><span class="lscg-chat-tune-label">Time</span>{timing}</div>);

    };

    const toggle = <button type="button" class="lscg-chat-tune" title="LSCG speech analysis: see how this line read, and tune it" aria-label="Tune how this line read" aria-expanded="false" onClick={() => {
        if (panel) { close(); return; }
        panel = <div class="lscg-chat-tune-panel" /> as HTMLElement;
        message.append(panel);
        toggle.setAttribute("aria-expanded", "true");
        render();
    }}>≈</button> as HTMLButtonElement;
    message.append(toggle);

    // BC reveals its own reply control (an absolutely positioned box at the message's right) on hover. Find it by
    // class or, failing that, as the right-most other control, and sit just left of it so the two never overlap. Only the
    // horizontal position is taken from it; vertically the button stays centered in its own message, because the
    // reply control can be taller than the line and start above it.
    // It may be created or shown a moment after the hover starts, so measure again shortly after.
    const place = () => {
        if (getComputedStyle(message).position === "static") message.style.position = "relative";
        // Opaque, in the colors of the row it sits on, so it stays readable over the text it may overlap.
        const background = effectiveBackground(message);
        if (background) toggle.style.backgroundColor = background;
        const messageBox = message.getBoundingClientRect();
        // Only controls in the right half count: a whisper has its own small reply icon at the start of the text,
        // and measuring from that would put the button at the far left. With nothing on the right, keep the stylesheet position.
        const candidates = Array.from(message.querySelectorAll<HTMLElement>('[class*="reply" i], button, a, [role="button"]'))
            .filter(el => el !== toggle && !panel?.contains(el) && !el.classList.contains("lscg-chat-tune"))
            .filter(el => {
                const box = el.getBoundingClientRect();
                return box.width > 0 && box.left > messageBox.left + messageBox.width / 2;
            });
        const byName = candidates.find(el => /reply/i.test(el.className));
        const reply = byName ?? candidates.sort((x, y) => y.getBoundingClientRect().right - x.getBoundingClientRect().right)[0];
        const replyBox = reply?.getBoundingClientRect();
        if (!replyBox) return;
        toggle.style.right = `${Math.max(0, messageBox.right - replyBox.left) + 4}px`;
    };
    message.addEventListener("mouseenter", () => { place(); setTimeout(place, 60); });
}
