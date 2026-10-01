import { Outfits } from "modules";
import { StripLevel } from "./Models/cursed-item";
import { OutfitOption } from "./Models/magic";
import { h } from "tsx-dom";
import { buildTuneTab } from "./speech-tuning-pages";
import { ButtonRow, CheckboxRow, confirmDialog, openDialog, KitContext, KitTab, Notice, NumberRow, RuleTable, SectionLabel, SelectOption, SelectRow, TextRow } from "./Dom/kit";
import {
    SPEECH_DETECTIONS, SPEECH_DETECTION_DETECTOR, SPEECH_DETECTORS, SPEECH_EDITABLE_KEYS, SpeechDetectorId, SPEECH_MAX_COOLDOWN_MS, SPEECH_MAX_DURATION_MS, SPEECH_MAX_RULES, SPEECH_MAX_TEXT_LENGTH, SPEECH_NUMBER_RANGES as R,
    SPEECH_MAX_PHRASE_GROUPS, SPEECH_PHRASE_GROUP_NAME_MAX, SpeechPhraseGroup, defaultSpeechSettings, newPhraseGroupId,
    SpeechAnalysisSettingsModel, SPEECH_OUTFIT_KEY_MAX, SPEECH_OUTFIT_OPTIONS, SPEECH_REACTION_ACTIONS, SPEECH_REACTION_STATES, SPEECH_REMOTE_LEVELS, SPEECH_REMOVE_ONLY_STATES, SpeechSettingsView, SpeechDetection, SpeechReactionAction, SpeechReactionRule, SpeechRemoteLevel,
} from "./Models/speech-analysis";

const DETECTION_LABELS: Record<SpeechDetection, string> = {
    negative: "Negative tone",
    positive: "Positive affirmation",
    profanity: "Profanity",
    erudite: "Reading level too high",
    phrase: "Says a phrase from",
};

const ACTION_LABELS: Record<SpeechReactionAction, string> = {
    applyState: "Apply state",
    removeState: "Remove state",
    shock: "Shock (worn device)",
    outfit: "Apply outfit",
    orgasm: "Force orgasm",
};

const STATE_LABELS: Partial<Record<LSCGState, string>> = {
    hypnotized: "Trance (hypnotized)",
    redressed: "Outfit (restore clothes)",
};

export const REMOTE_LEVEL_LABELS: Record<SpeechRemoteLevel, string> = {
    Owner: "Owner only",
    Lovers: "Owner and lovers",
    Whitelist: "Whitelist, lovers and owner",
    Friends: "Friends and above",
    PublicExceptBlacklist: "Everyone except blacklist",
    Public: "Everyone",
};

const options = <T extends string>(values: readonly T[], labels: Record<T, string>): SelectOption[] =>
    values.map(v => ({ value: v, label: labels[v] }));

const detectorOn = (s: SpeechSettingsView, id: SpeechDetectorId) =>
    s.detectors?.[id] ?? SPEECH_DETECTORS.find(d => d.id === id)?.defaultEnabled ?? false;

const PHRASE_PREFIX = "phrase:";
const offSuffix = (s: SpeechSettingsView, d: SpeechDetection) => detectorOn(s, SPEECH_DETECTION_DETECTOR[d]) ? "" : " (detector off)";

/** "When" choices: fixed detections plus one entry per phrase group, encoded as "phrase:<groupId>". */
const detectionOptions = (s: SpeechSettingsView, r: SpeechReactionRule): SelectOption[] => {
    const fixed = SPEECH_DETECTIONS.filter(d => d !== "phrase").map(d => ({ value: d, label: DETECTION_LABELS[d] + offSuffix(s, d) }));
    const groups = (s.phraseGroups ?? []).map(g => ({ value: PHRASE_PREFIX + g.id, label: `Says: ${g.name || g.id}${offSuffix(s, "phrase")}` }));
    if (r.detection === "phrase" && r.phraseGroup && !s.phraseGroups?.some(g => g.id === r.phraseGroup))
        groups.push({ value: PHRASE_PREFIX + r.phraseGroup, label: "Says: (deleted group)" });
    return [...fixed, ...groups];
};

const getDetection = (r: SpeechReactionRule) => r.detection === "phrase" ? PHRASE_PREFIX + (r.phraseGroup ?? "") : r.detection;
const setDetection = (r: SpeechReactionRule, v: string) => {
    if (v.startsWith(PHRASE_PREFIX)) {
        r.detection = "phrase";
        r.phraseGroup = v.slice(PHRASE_PREFIX.length);
    } else {
        r.detection = v as SpeechDetection;
        delete r.phraseGroup;
    }
};

const stateOptions = (r: SpeechReactionRule): SelectOption[] => SPEECH_REACTION_STATES
    .filter(s => r.action !== "applyState" || !SPEECH_REMOVE_ONLY_STATES.includes(s))
    .map(s => ({ value: s, label: STATE_LABELS[s] ?? s[0].toUpperCase() + s.slice(1) }));

/** The wearer's own outfit collection; keeps a saved key selectable even if that outfit was since deleted. */
const outfitOptions = (r: SpeechReactionRule): SelectOption[] => {
    const keys = Outfits()?.GetOutfitKeys() ?? [];
    if (r.outfitKey && !keys.includes(r.outfitKey.toLocaleLowerCase())) keys.unshift(r.outfitKey);
    return [{ value: "", label: keys.length ? "— choose outfit —" : "— no saved outfits —" }, ...keys.map(k => ({ value: k, label: k }))];
};

const usesState = (r: SpeechReactionRule) => r.action === "applyState" || r.action === "removeState";

const outfitPartOptions: SelectOption[] = SPEECH_OUTFIT_OPTIONS.map(o => ({ value: o, label: o }));

/** Same strip levels and wording as cursed items. */
const STRIP_LABELS: [StripLevel, string][] = [
    [StripLevel.NONE, "Nothing (add only)"],
    [StripLevel.CLOTHES, "Clothing"],
    [StripLevel.UNDERWEAR, "Underwear"],
    [StripLevel.COSPLAY, "Cosplay"],
    [StripLevel.CLOTHES | StripLevel.UNDERWEAR, "Clothes + Underwear"],
    [StripLevel.CLOTHES | StripLevel.COSPLAY, "Clothes + Cosplay"],
    [StripLevel.UNDERWEAR | StripLevel.COSPLAY, "Underwear + Cosplay"],
    [StripLevel.CLOTHES | StripLevel.UNDERWEAR | StripLevel.COSPLAY, "Clothes + Underwear + Cosplay"],
];
const stripOptions: SelectOption[] = STRIP_LABELS.map(([level, label]) => ({ value: String(level), label }));

export interface SpeechPagesOptions {
    /** Viewing another player's settings through remote access. */
    remote: boolean;
}

/** Remote view: the target withheld the phrases. Local view: set by someone else, so secret from the wearer. */
const phrasesHidden = (g: SpeechPhraseGroup, opts: SpeechPagesOptions) =>
    opts.remote ? !!g.hidden : g.installedBy !== undefined && g.installedBy !== Player.MemberNumber;

const hiddenLabel = (g: SpeechPhraseGroup) =>
    `hidden — set by ${g.installedByName ?? "someone"}${g.installedBy ? ` [${g.installedBy}]` : ""}`;

const stateLabel = (state?: LSCGState) => !state ? "—" : STATE_LABELS[state] ?? state[0].toUpperCase() + state.slice(1);
const stripLabel = (level?: StripLevel) => STRIP_LABELS.find(([l]) => l === (level ?? StripLevel.NONE))?.[1] ?? "Nothing (add only)";
const actionHasDetails = (r: SpeechReactionRule) => usesState(r) || r.action === "outfit";

/** One-line description of what a rule does beyond its action, shown in the Details column. */
function ruleSummary(r: SpeechReactionRule): { text: string; warning?: boolean } {
    switch (r.action) {
        case "applyState": return { text: stateLabel(r.state) };
        case "removeState": return { text: stateLabel(r.state) };
        case "outfit":
            if (!r.outfitKey) return { text: "⚠ No outfit chosen", warning: true };
            return { text: `${r.outfitKey} · ${(r.outfitOption ?? OutfitOption.both).toLowerCase()} · strip ${stripLabel(r.outfitStrip).toLowerCase()}` };
        case "shock": return { text: "First worn shock device" };
        case "orgasm": return { text: "—" };
    }
}

export function buildSpeechTabs(ctx: KitContext, s: SpeechSettingsView, opts: SpeechPagesOptions): KitTab[] {
    const local = s;

    /** Action-specific fields, edited in a dialog so the table only needs one column for them. */
    const openRuleDetails = (anchor: HTMLElement, r: SpeechReactionRule) =>
        openDialog(anchor, ctx, `${ACTION_LABELS[r.action]} — details`, dctx => {
            const rows: HTMLElement[] = [];
            if (usesState(r))
                rows.push(SelectRow(dctx, { label: "State", options: stateOptions(r), get: () => r.state ?? "denied", set: v => r.state = v as LSCGState }));
            if (r.action === "outfit") {
                rows.push(
                    opts.remote
                        ? TextRow(dctx, { label: "Outfit key", description: "A key from the wearer's own outfit collection.", maxLength: SPEECH_OUTFIT_KEY_MAX, get: () => r.outfitKey ?? "", set: v => r.outfitKey = v.trim() })
                        : SelectRow(dctx, { label: "Outfit", options: outfitOptions(r), get: () => r.outfitKey ?? "", set: v => r.outfitKey = v }),
                    SelectRow(dctx, { label: "Parts to put on", options: outfitPartOptions, get: () => r.outfitOption ?? OutfitOption.both, set: v => r.outfitOption = v as OutfitOption }),
                    SelectRow(dctx, {
                        label: "Strip first",
                        description: "Items from the outfit replace whatever is in the same slot; nothing else is removed unless chosen here. The previous outfit is restored when the effect ends.",
                        options: stripOptions, get: () => String(r.outfitStrip ?? StripLevel.NONE), set: v => r.outfitStrip = Number(v) as StripLevel,
                    }),
                );
            }
            return rows;
        });

    const detailsCell = (r: SpeechReactionRule, readOnly: boolean): HTMLElement => {
        const summary = ruleSummary(r);
        const cell = <div class="lscg-kit-details">
            <span class={summary.warning ? "lscg-kit-summary lscg-kit-warning" : "lscg-kit-summary"} title={summary.text}>{summary.text}</span>
        </div> as HTMLElement;
        if (actionHasDetails(r)) {
            const edit = <button class="lscg-button lscg-kit-edit" disabled={readOnly} onClick={() => openRuleDetails(edit, r)}>Edit…</button> as HTMLButtonElement;
            cell.append(edit);
        }
        return cell;
    };

    return [
        {
            label: "General",
            render: () => [
                ...(opts.remote ? [] : [
                    SectionLabel("Speech analysis"),
                    CheckboxRow(ctx, { label: "Enabled", description: "Master switch: analyze your own chat lines and run the reaction rules.", get: () => s.enabled, set: v => s.enabled = v }),
                    CheckboxRow(ctx, { label: "Debug log", description: "Print each line's analysis to the browser console.", get: () => !!local.debugLog, set: v => local.debugLog = v }),
                ]),
                SectionLabel("Detectors", "Each detector can be switched off on its own. Reaction rules for a disabled detector never fire."),
                ...SPEECH_DETECTORS.map(d => CheckboxRow(ctx, {
                    label: d.label,
                    description: d.description,
                    get: () => detectorOn(s, d.id),
                    set: v => s.detectors = { ...s.detectors, [d.id]: v },
                    disabled: () => !s.enabled,
                })),
                SectionLabel("Tone"),
                NumberRow(ctx, { label: "Negative threshold", description: "Sentiment score (per word) below which self-talk counts as negative.", ...R.negativeThreshold, step: 0.05, get: () => s.negativeThreshold, set: v => s.negativeThreshold = v, disabled: () => !detectorOn(s, "tone") }),
                NumberRow(ctx, { label: "Positive threshold", description: "Sentiment score (per word) above which self-talk counts as a positive affirmation.", ...R.positiveThreshold, step: 0.05, get: () => s.positiveThreshold, set: v => s.positiveThreshold = v, disabled: () => !detectorOn(s, "tone") }),
                NumberRow(ctx, { label: "Context sensitivity", description: "How clearly positive or negative someone else's message must be before a reply to it counts.", ...R.incomingThreshold, step: 0.05, get: () => s.incomingThreshold, set: v => s.incomingThreshold = v, disabled: () => !detectorOn(s, "tone") }),
                NumberRow(ctx, { label: "Context window (seconds)", description: "How long a message said to you can still be answered.", ...R.contextWindowSeconds, get: () => s.contextWindowSeconds, set: v => s.contextWindowSeconds = v, disabled: () => !detectorOn(s, "tone") }),
                SectionLabel("Reading level"),
                NumberRow(ctx, { label: "Maximum grade level", description: "Flesch-Kincaid grade. Lines of 5+ words at or above this count as too complex.", ...R.eruditeGrade, get: () => s.eruditeGrade, set: v => s.eruditeGrade = v, disabled: () => !detectorOn(s, "erudite") }),
                ...(opts.remote ? [] : [
                    SectionLabel("Reset"),
                    ButtonRow(ctx, {
                        label: "Tone thresholds & reading level",
                        description: "Puts the negative/positive thresholds, context settings, and reading-level grade back to default.",
                        buttonLabel: "Reset to default",
                        onClick: () => {
                            const d = defaultSpeechSettings();
                            s.negativeThreshold = d.negativeThreshold;
                            s.positiveThreshold = d.positiveThreshold;
                            s.incomingThreshold = d.incomingThreshold;
                            s.contextWindowSeconds = d.contextWindowSeconds;
                            s.eruditeGrade = d.eruditeGrade;
                            ctx.changed();
                        },
                    }),
                    ButtonRow(ctx, {
                        label: "Entire speech analysis config",
                        description: "Puts detectors, thresholds, vocabulary, phrase groups and reaction rules back to default. Doesn't change whether the module or remote access is enabled. This can't be undone.",
                        buttonLabel: "Reset everything…",
                        danger: true,
                        onClick: button => confirmDialog(button, "Reset speech analysis?",
                            "This clears your detectors, thresholds, vocabulary, phrase groups, and every reaction rule, and puts them all back to default. This can't be undone.",
                            "Reset everything",
                            () => {
                                const d = defaultSpeechSettings();
                                for (const key of SPEECH_EDITABLE_KEYS) (s as any)[key] = (d as any)[key];
                                local.debugLog = d.debugLog;
                                ctx.changed();
                            }),
                    }),
                ]),
            ],
        },
        {
            label: "Vocabulary",
            render: () => [
                SectionLabel("Affirmations", "Any of these phrases always counts as a positive affirmation. Comma separated; use quotes for phrases containing commas."),
                TextRow(ctx, { label: "Affirmation phrases", placeholder: "I am a good girl, I am worthy", multiline: true, maxLength: SPEECH_MAX_TEXT_LENGTH, get: () => s.affirmationPhrases, set: v => s.affirmationPhrases = v }),
                SectionLabel("Vocabulary overrides", "Adjust how words score, from -5 (very negative) to 5 (very positive). Format: word:score, e.g. bratty:0, failure:-3"),
                TextRow(ctx, { label: "Word scores", placeholder: "bratty:0, perfect:4", multiline: true, maxLength: SPEECH_MAX_TEXT_LENGTH, get: () => s.lexiconExtras, set: v => s.lexiconExtras = v }),
                SectionLabel("Profanity", "Adjust what counts as profanity. Comma separated, exact words or phrases, whole words only, ignoring case."),
                TextRow(ctx, { label: "Also profane", placeholder: "frick, heck", multiline: true, maxLength: SPEECH_MAX_TEXT_LENGTH, get: () => s.profanityExtras ?? "", set: v => s.profanityExtras = v, disabled: () => !detectorOn(s, "profanity") }),
                TextRow(ctx, { label: "Never profane", placeholder: "damn, hell", multiline: true, maxLength: SPEECH_MAX_TEXT_LENGTH, get: () => s.profanitySafe ?? "", set: v => s.profanitySafe = v, disabled: () => !detectorOn(s, "profanity") }),
            ],
        },
        ...(opts.remote ? [] : [buildTuneTab(ctx, s as SpeechAnalysisSettingsModel)]),
        {
            label: "Phrases",
            render: () => [
                SectionLabel("Phrase lists", "Groups of words or phrases to listen for, such as release phrases or banned words. Pick a group under Reactions ('Says: …') to decide what happens when one is spoken. Comma separated; quote phrases that contain commas. Matches whole words, ignoring case." + (opts.remote
                    ? " Phrases you set are hidden from the wearer. You only see phrases you set yourself, unless you are their owner or lover."
                    : " Phrases set by someone else through remote access are hidden from you.")),
                RuleTable<SpeechPhraseGroup>(ctx, {
                    rows: () => (s.phraseGroups ??= []),
                    max: SPEECH_MAX_PHRASE_GROUPS,
                    addLabel: "+ Add group",
                    deleteLabel: "Delete group",
                    create: () => ({
                        id: newPhraseGroupId(s.phraseGroups ?? []),
                        name: "New group",
                        phrases: "",
                        // A group a remote configurer creates is theirs; the wearer's client records this on save as well.
                        ...(opts.remote ? { installedBy: Player.MemberNumber, installedByName: CharacterNickname(Player) } : {}),
                    }),
                    columns: [
                        { header: "Group name", kind: "text", width: "30%", maxLength: SPEECH_PHRASE_GROUP_NAME_MAX, disabled: g => phrasesHidden(g, opts), get: g => g.name, set: (g, v) => g.name = v },
                        { header: "Phrases", kind: "text", maxLength: SPEECH_MAX_TEXT_LENGTH, placeholder: "", disabled: g => phrasesHidden(g, opts), get: g => phrasesHidden(g, opts) ? hiddenLabel(g) : g.phrases, set: (g, v) => g.phrases = v },
                    ],
                }),
            ],
        },
        {
            label: "Reactions",
            render: () => [
                SectionLabel("Reaction rules", "Each enabled rule runs when its detection fires. 'Remove state' rules only clear a state; they never apply anything."),
                RuleTable<SpeechReactionRule>(ctx, {
                    rows: () => s.reactions,
                    max: SPEECH_MAX_RULES,
                    create: () => ({ enabled: true, detection: "negative", action: "applyState", state: "denied", cooldownMs: 10_000 }),
                    columns: [
                        { header: "On", kind: "checkbox", width: "3.5em", get: r => r.enabled, set: (r, v) => r.enabled = v },
                        { header: "When", kind: "select", width: "24%", options: r => detectionOptions(s, r), get: getDetection, set: setDetection },
                        { header: "Do", kind: "select", width: "18%", options: () => options(SPEECH_REACTION_ACTIONS, ACTION_LABELS), get: r => r.action, set: (r, v: SpeechReactionAction) => {
                            r.action = v;
                            if (usesState(r) && (!r.state || (v === "applyState" && SPEECH_REMOVE_ONLY_STATES.includes(r.state)))) r.state = "denied";
                            if (v === "outfit") {
                                r.outfitKey ??= "";
                                r.outfitOption ??= OutfitOption.both;
                                r.outfitStrip ??= StripLevel.NONE;
                            }
                        } },
                        { header: "Details", kind: "custom", get: () => null, set: () => {}, render: (r, readOnly) => detailsCell(r, readOnly) },
                        { header: "Duration", kind: "number", width: "5.5em", min: 0, max: SPEECH_MAX_DURATION_MS / 1000,
                            tooltip: "How long the effect lasts, in seconds. 0 = until removed (by a rule, its own timer, or safeword).",
                            hidden: r => r.action !== "applyState" && r.action !== "outfit",
                            get: r => Math.round((r.durationMs ?? 0) / 1000), set: (r, v) => r.durationMs = v * 1000 },
                        { header: "Cooldown", kind: "number", width: "5.5em", min: 0, max: SPEECH_MAX_COOLDOWN_MS / 1000,
                            tooltip: "Seconds before this rule can fire again, so repeated lines don't stack the effect.",
                            get: r => Math.round((r.cooldownMs ?? 0) / 1000), set: (r, v) => r.cooldownMs = v * 1000 },
                    ],
                }),
            ],
        },
        opts.remote
            ? {
                label: "Remote",
                render: () => [
                    Notice(`Remote access: ${REMOTE_LEVEL_LABELS[s.remoteLevel] ?? s.remoteLevel}${s.remoteRequiresTrance ? ", while hypnotized" : ""}`),
                    CheckboxRow(ctx, { label: "Locked", description: "Prevent the wearer from changing these settings. Only available if they allowed lockout.", get: () => s.locked, set: v => s.locked = v, disabled: () => !s.lockable }),
                ],
            }
            : {
                label: "Remote",
                render: () => [
                    SectionLabel("Remote configuration", "Let other players change these settings through LSCG remote settings."),
                    CheckboxRow(ctx, { label: "Allow remote configuration", get: () => s.remoteAccess, set: v => s.remoteAccess = v }),
                    SelectRow(ctx, { label: "Who can configure", options: options(SPEECH_REMOTE_LEVELS, REMOTE_LEVEL_LABELS), get: () => s.remoteLevel, set: v => s.remoteLevel = v as SpeechRemoteLevel, disabled: () => !s.remoteAccess }),
                    CheckboxRow(ctx, { label: "Requires trance", description: "Remote configuration only works while you are hypnotized, in addition to the permission level above.", get: () => s.remoteRequiresTrance, set: v => s.remoteRequiresTrance = v, disabled: () => !s.remoteAccess }),
                    CheckboxRow(ctx, { label: "Allow lockout", description: "Remote configurers may lock you out of changing these settings. Safeword releases the lock.", get: () => s.lockable, set: v => s.lockable = v, disabled: () => !s.remoteAccess }),
                ],
            },
    ];
}
