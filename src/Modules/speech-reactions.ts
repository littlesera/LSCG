import { getModule } from "modules";
import { StateModule } from "./states";
import type { LSCGSpeechAnalysis, SpeechAnalysisModule } from "./speech-analysis";
import { SPEECH_REMOVE_ONLY_STATES, SpeechReactionRule } from "Settings/Models/speech-analysis";
import { OutfitOption, SpellDefinition } from "Settings/Models/magic";
import { StripLevel } from "Settings/Models/cursed-item";
import { GetConfiguredItemBundlesFromOutfitKey, SendAction, forceOrgasm } from "utils";
import { RedressedState } from "./States/RedressedState";

type EmoteText = string | (() => string);

/** Flavor emotes in the style of Magic's state effects, worded for effects set off by the wearer's own words. */
const APPLY_EMOTES: Partial<Record<LSCGState, EmoteText>> = {
    denied: () => (Player.ArousalSettings?.Progress ?? 0) > 50
        ? "%NAME% quivers as %POSSESSIVE% own words bring on an impending denial."
        : "%NAME% whimpers as %POSSESSIVE% own words bring on an impending denial.",
    gagged: () => Player.IsGagged()
        ? "%NAME%'s mumbling suddenly falls completely silent, %POSSESSIVE% words caught in %POSSESSIVE% throat."
        : "%NAME%'s mouth keeps moving, but after those words not a single sound escapes.",
    horny: () => getModule<StateModule>("StateModule")?.GaggedState.Active
        ? "A blush runs into %NAME%'s cheeks as %POSSESSIVE% words linger."
        : "A moan escapes %NAME%'s lips as %POSSESSIVE% own words stir something inside.",
    hypnotized: "%NAME%'s eyes glaze over as %POSSESSIVE% own words pull %INTENSIVE% down into a deep trance.",
    redressed: () => getModule<StateModule>("StateModule")?.GaggedState.Active
        ? "%NAME% trembles as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%, %POSSESSIVE% words still hanging in the air."
        : "%NAME% squeaks as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%, %POSSESSIVE% words still hanging in the air.",
    blind: "%NAME%'s eyes dart around, %POSSESSIVE% world plunged into darkness as the words leave %POSSESSIVE% lips.",
    deaf: "%NAME% frowns as the world goes silent around %INTENSIVE%.",
    frozen: "%NAME%'s eyes widen as %POSSESSIVE% muscles seize in place mid-sentence.",
    asleep: "%NAME%'s voice trails off as %POSSESSIVE% eyes close and %PRONOUN% slumps into sleep.",
};

const REMOVE_EMOTES: Partial<Record<LSCGState, EmoteText>> = {
    denied: "%NAME% sighs in relief as %POSSESSIVE% words lift the looming denial.",
    gagged: "%NAME%'s voice returns, %POSSESSIVE% words finding their way out again.",
    horny: "%NAME% takes a steadying breath as the heat inside %INTENSIVE% fades.",
    hypnotized: "%NAME% blinks and returns to %POSSESSIVE% senses.",
    redressed: "%NAME%'s clothing shimmers and returns to what %PRONOUN% was wearing before.",
    blind: "%NAME% blinks as the darkness lifts from %POSSESSIVE% eyes.",
    deaf: "%NAME% tilts %POSSESSIVE% head as sound comes rushing back.",
    frozen: "%NAME%'s muscles loosen as %PRONOUN% can move again.",
    asleep: "%NAME% stirs and slowly opens %POSSESSIVE% eyes.",
};

const ORGASM_EMOTE: EmoteText = () => getModule<StateModule>("StateModule")?.GaggedState.Active || Player.IsGagged()
    ? "%NAME%'s muffled words trail off into a helpless moan as %PRONOUN% is pushed over the edge."
    : "%NAME%'s words trail off into a helpless moan as %PRONOUN% is pushed over the edge.";

function emote(text: EmoteText | undefined, fallback: string): void {
    SendAction(typeof text === "function" ? text() : text ?? fallback);
}

function detected(analysis: LSCGSpeechAnalysis, rule: SpeechReactionRule): boolean {
    switch (rule.detection) {
        case "negative": return analysis.tone === "negative";
        case "positive": return analysis.tone === "positive";
        case "profanity": return analysis.profanity.detected;
        case "erudite": return analysis.erudite.detected;
        case "phrase": return !!rule.phraseGroup && analysis.phrases.matched.includes(rule.phraseGroup);
    }
}

function findShockItem(): Item | undefined {
    return Player.Appearance.find(item => item.Property?.ShockLevel !== undefined || item.Property?.TriggerCount !== undefined);
}

/** Built-in consumer of the speech analysis stream: applies the wearer's reaction rules locally. */
export class SpeechReactionEngine {
    private _lastFired = new Map<SpeechReactionRule, number>();
    private _unsubscribe: () => void;

    constructor(private module: SpeechAnalysisModule) {
        this._unsubscribe = module.onAnalysis(a => this.handle(a));
    }

    dispose(): void {
        this._unsubscribe();
        this._lastFired.clear();
    }

    private handle(analysis: LSCGSpeechAnalysis): void {
        const now = Date.now();
        for (const rule of this.module.settings.reactions ?? []) {
            if (!rule.enabled || !detected(analysis, rule)) continue;
            if (now - (this._lastFired.get(rule) ?? 0) < (rule.cooldownMs ?? 0)) continue;
            if (this.apply(rule)) this._lastFired.set(rule, now);
        }
    }

    private apply(rule: SpeechReactionRule): boolean {
        if (rule.action === "shock") {
            const item = findShockItem();
            if (!item) return false;
            PropertyShockPublishAction(Player, item, true);
            return true;
        }

        if (rule.action === "orgasm") {
            emote(ORGASM_EMOTE, "%NAME% is pushed over the edge.");
            // Same path as Magic's orgasm spell; an active denied state still ruins it through its own hook.
            forceOrgasm();
            return true;
        }

        const states = getModule<StateModule>("StateModule");
        if (rule.action === "outfit") return this.applyOutfit(states, rule);

        const state = states?.States.find(s => s.Type === rule.state);
        if (!state) return false;
        if (rule.action === "applyState" && !state.Active && !SPEECH_REMOVE_ONLY_STATES.includes(state.Type)) {
            emote(APPLY_EMOTES[state.Type], `%NAME%'s words bring on the ${state.Type} state.`);
            state.Activate(Player.MemberNumber, rule.durationMs || undefined);
            return true;
        }
        if (rule.action === "removeState" && state.Active) {
            emote(REMOVE_EMOTES[state.Type], `%NAME%'s words lift the ${state.Type} state.`);
            state.Recover(false);
            return true;
        }
        return false;
    }

    /** Wears an outfit from the collection through the Redressed state, which stores the current outfit
     *  and restores it when the state is removed or expires. Only strips what the rule asks for (default nothing).
     *  Can switch outfits while already redressed. */
    private applyOutfit(states: StateModule | undefined, rule: SpeechReactionRule): boolean {
        if (!states || !rule.outfitKey) return false;
        const items = GetConfiguredItemBundlesFromOutfitKey(rule.outfitKey, item => RedressedState.ItemIsAllowed(item));
        if (!items || items.length === 0) return false;
        const spell = <SpellDefinition>{
            Name: rule.outfitKey,
            Outfit: { Key: rule.outfitKey, Code: LZString.compressToBase64(JSON.stringify(items)), Option: rule.outfitOption ?? OutfitOption.both },
        };
        emote(APPLY_EMOTES.redressed, "%NAME%'s clothing changes.");
        states.RedressedState.ApplyAdditive(spell, Player.MemberNumber, rule.durationMs || undefined, rule.outfitStrip ?? StripLevel.NONE);
        return true;
    }
}
