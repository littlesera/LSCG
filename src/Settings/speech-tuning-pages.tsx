import { h } from "tsx-dom";
import { getModule } from "modules";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { suggestTuning, TuningDetector } from "Modules/speech-tuning";
import { levelBadge, tag, toneBadge, wordTuner, WordTunerState } from "Modules/speech-chat-tune";
import { CheckboxRow, KitContext, KitTab, SectionLabel, TextRow } from "Dom/kit";
import { SpeechAnalysisSettingsModel } from "./Models/speech-analysis";

const speechModule = () => getModule<SpeechAnalysisModule>("SpeechAnalysisModule");

/** Lets anyone see how a line reads, why, and what settings change would alter that. Nothing here is saved or
 *  sent anywhere: lines are analyzed locally and the suggestions only edit the wearer's own settings when clicked. */
function tuneSection(ctx: KitContext, s: SpeechAnalysisSettingsModel): HTMLElement[] {
    let line = "";
    const toneState: WordTunerState = {};
    const profanityState: WordTunerState = {};
    const results = <div class="lscg-kit-tune-results" /> as HTMLElement;
    const recent = <div class="lscg-kit-chatlog scroll-box" /> as HTMLElement;

    const pick = (text: string) => { line = text; toneState.selected = undefined; profanityState.selected = undefined; ctx.refresh(); };

    const group = (title: string, accent: "tone" | "profanity" | "level", enabled: boolean): HTMLElement =>
        <section class={`lscg-kit-group lscg-kit-group-${accent}${enabled ? "" : " lscg-kit-group-off"}`}>
            <h3>{title}{enabled ? "" : " (detector off)"}</h3>
        </section> as HTMLElement;

    const renderResults = () => {
        results.replaceChildren();
        const text = line.trim();
        if (!text) {
            results.append(<span class="lscg-kit-detail">Type a line, or pick one of your recent lines.</span>);
            return;
        }
        const a = speechModule()?.analyze(text);
        if (!a) return;
        const tags = (detector: TuningDetector) => {
            const row = <div class="lscg-kit-results" /> as HTMLElement;
            for (const suggestion of suggestTuning(a, s).filter(x => x.detector === detector))
                row.append(tag(suggestion.kind, suggestion.icon, suggestion.short, suggestion.tip, () => { suggestion.apply(s); ctx.changed(); }));
            return row;
        };

        const tone = group("Tone", "tone", a.detectors.tone);
        if (a.detectors.tone) {
            const words = a.trace.words.map(w => `${w.word} ${w.score > 0 ? "+" : ""}${w.score.toFixed(1)}`).join(", ") || "no scored words";
            const about = a.trace.gate === "none" ? "not about you" : `about you (${a.trace.gate})`;
            const fromContext = a.context.negative || a.context.positive ? " · from how you answered" : "";
            tone.append(
                <div>{toneBadge(a.tone)} <span class="lscg-kit-detail">{words} · {about}{fromContext}</span></div>,
                tags("tone"),
                wordTuner(a, text, s, toneState, () => ctx.changed(), "tone"),
            );
        }

        const profanity = group("Profanity", "profanity", a.detectors.profanity);
        if (a.detectors.profanity)
            profanity.append(
                <div><span class={`lscg-tone lscg-tone-${a.profanity.detected ? "negative" : "positive"}`}>{a.profanity.detected ? `⚠ ${a.profanity.words.join(", ")}` : "✓ clean"}</span></div>,
                tags("profanity"),
                wordTuner(a, text, s, profanityState, () => ctx.changed(), "profanity", w => speechModule()?.analyze(w).profanity.detected ?? false),
            );

        const level = group("Reading level", "level", a.detectors.erudite);
        if (a.detectors.erudite) {
            const badge = levelBadge(a, s.eruditeGrade);
            level.append(
                <div>{badge ?? <span class="lscg-kit-detail">Too short to assess (under 5 words)</span>} <span class="lscg-kit-detail">limit {s.eruditeGrade}</span></div>,
                tags("erudite"),
            );
        }
        results.append(tone, profanity, level);
    };

    const renderRecent = () => {
        recent.replaceChildren();
        const lines = [...(speechModule()?.recentLines ?? [])].reverse();
        if (!lines.length) {
            recent.append(<span class="lscg-kit-detail">Lines you speak while speech analysis is on show up here until you reload.</span>);
            return;
        }
        for (const l of lines)
            recent.append(<button type="button" class="lscg-kit-chatline" title="Try this line" onClick={() => pick(l.text)}>{toneBadge(l.tone, false)} {l.text}</button>);
    };

    return [
        SectionLabel("Try a line", "See how a line reads and why. Pick any word to score it or flag it as profane. Hover a tag to see what it changes; nothing changes until you click one."),
        TextRow(ctx, { label: "Line", placeholder: "I'm so stupid", get: () => line, set: v => { line = v; toneState.selected = undefined; profanityState.selected = undefined; } }),
        <div class="lscg-kit-tune-grid">
            <div>
                <div class="lscg-kit-detail">Your recent lines (in memory only, cleared on reload). Click one to try it.</div>
                {(() => { ctx.watch(renderRecent); return recent; })()}
            </div>
            {(() => { ctx.watch(renderResults); return results; })()}
        </div> as HTMLElement,
    ];
}

export function buildTuneTab(ctx: KitContext, s: SpeechAnalysisSettingsModel): KitTab {
    return {
        label: "Tune",
        render: () => [
            CheckboxRow(ctx, {
                label: "Show tune buttons in chat",
                description: "Adds a small ≈ button beside your own chat lines (on hover) that shows how the line read and offers quick fixes. Saved with your account.",
                get: () => !!s.chatTuneButtons,
                set: v => s.chatTuneButtons = v,
            }),
            ...tuneSection(ctx, s),
        ],
    };
}
