// Shared types for the speech-analysis labeled corpus. Labels are the *intended* behaviour
// ("is the speaker putting themselves down / lifting themselves up?"), not a snapshot of
// what the code currently does -- cases the code gets wrong live in known-gaps.ts.
import type { SpeechAnalysisSettingsModel } from "Settings/Models/speech-analysis";

export type Tone = "negative" | "positive" | "neutral";

export interface LineCase {
	text: string;
	/** Expected overall tone of the line. */
	tone?: Tone;
	/** Expected profanity detection (with the built-in list plus any `settings` overrides). */
	profanity?: boolean;
	/** Expected self-comparison result: -1 below others, +1 lifted above, 0 none. */
	comparison?: -1 | 0 | 1;
	/** Expected reading-level result at the default grade cutoff: true = too complex. */
	complex?: boolean;
	/** Settings applied on top of the defaults (detectors all on) for just this line. */
	settings?: Partial<SpeechAnalysisSettingsModel>;
	/** Free-form labels for slicing reports, on top of the category. */
	tags?: string[];
	/** Why this line is interesting / why the label is what it is. */
	note?: string;
	/** Known limitation: the label is right but the module gets it wrong. Reported, not failing; fails the run once fixed so it gets graduated. */
	gap?: boolean;
}

export interface Category {
	name: string;
	/** Drafted by the assistant and not yet reviewed by the maintainer. Labels are ground truth: review before trusting. */
	draft: boolean;
	cases: LineCase[];
}

export type TurnExpect = {
	tone?: Tone;
	/** What the contextual pairing (how the line answers something said to/about the speaker) concluded. */
	context?: "negative" | "positive" | "none";
};

export type Turn =
	/** Someone else speaks; `replyTo` is the index of an earlier turn whose message this replies to. */
	| { hear: string; text: string; whisper?: boolean; replyTo?: number; shown?: string }
	/** The player speaks. `garbled` is what actually went out over the wire (e.g. through a gag). */
	| { say: string; whisperTo?: string; replyTo?: number; garbled?: string; expect?: TurnExpect }
	/** Seconds pass. */
	| { wait: number };

export interface ConversationCase {
	name: string;
	/** Names present besides the player (default Alice and Bob). Known: Alice, Bob, Carol. */
	room?: string[];
	turns: Turn[];
	settings?: Partial<SpeechAnalysisSettingsModel>;
	tags?: string[];
	draft?: boolean;
	/** Known limitation; see LineCase.gap. */
	gap?: boolean;
}

export const MEMBER_NUMBERS: Record<string, number> = { Alice: 2, Bob: 3, Carol: 4 };

export function category(name: string, cases: LineCase[], draft = true): Category {
	return { name, draft, cases };
}

const mk = (tone: Tone) => (...texts: string[]): LineCase[] => texts.map(text => ({ text, tone }));
/** Lines expected to read as negative / positive / neutral self-talk. */
export const neg = mk("negative");
export const pos = mk("positive");
export const neu = mk("neutral");

/** Deterministic ~25% held-out validation split by text, so tuning never sees the same lines it's scored on. */
export function splitOf(text: string): "train" | "validation" {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h % 4 === 0 ? "validation" : "train";
}
