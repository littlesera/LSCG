// Runs corpus cases against a booted SpeechAnalysisModule and summarizes the results.
import { vi } from "vitest";
import type { SpeechAnalysisModule, LSCGSpeechAnalysis } from "Modules/speech-analysis";
import { defaultSpeechSettings, type SpeechAnalysisSettingsModel } from "Settings/Models/speech-analysis";
import { addToRoom, player, resetWorld } from "../../harness/world";
import { makeCharacter, type FixtureCharacter } from "../../harness/fixtures";
import type { SpeechDriver } from "../../harness/speech";
import { MEMBER_NUMBERS, type ConversationCase, type LineCase, type Tone } from "./types";

/** Defaults plus every detector on, then `overrides`; mutates the module's (stable) settings object in place. */
export function resetSpeechSettings(speech: SpeechAnalysisModule, overrides: Partial<SpeechAnalysisSettingsModel> = {}): void {
	Object.assign(speech.settings, defaultSpeechSettings(), {
		enabled: true,
		detectors: { tone: true, profanity: true, erudite: true, phrases: true },
	}, overrides);
}

export interface LineResult {
	tone: Tone;
	profanity: boolean;
	comparison: number;
	complex: boolean;
	grade: number;
	analysis: LSCGSpeechAnalysis;
}

export function runLine(speech: SpeechAnalysisModule, c: LineCase): LineResult {
	resetSpeechSettings(speech, c.settings);
	const a = speech.analyze(c.text);
	return { tone: a.tone, profanity: a.profanity.detected, comparison: a.comparison, complex: a.erudite.detected, grade: a.erudite.gradeLevel, analysis: a };
}

/** Human-readable differences between what a line was labeled as and what the module said; empty = pass. */
export function lineMismatches(c: LineCase, r: LineResult): string[] {
	const out: string[] = [];
	if (c.tone !== undefined && r.tone !== c.tone) out.push(`tone: expected ${c.tone}, got ${r.tone}`);
	if (c.profanity !== undefined && r.profanity !== c.profanity) out.push(`profanity: expected ${c.profanity}, got ${r.profanity}`);
	if (c.comparison !== undefined && Math.sign(r.comparison) !== c.comparison) out.push(`comparison: expected ${c.comparison}, got ${r.comparison}`);
	if (c.complex !== undefined && r.complex !== c.complex) out.push(`complex: expected ${c.complex}, got ${r.complex} (grade ${r.grade.toFixed(1)})`);
	return out;
}

/** Plays a conversation through the real hooked say()/hear() pipeline; returns one message per failed expectation. */
export function runConversation(speech: SpeechAnalysisModule, driver: SpeechDriver, c: ConversationCase): string[] {
	resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
	addToRoom(player());
	const people = new Map<string, FixtureCharacter>();
	for (const name of c.room ?? ["Alice", "Bob"])
		people.set(name, addToRoom(makeCharacter({ MemberNumber: MEMBER_NUMBERS[name], Nickname: name })));
	resetSpeechSettings(speech, c.settings);
	driver.reset();

	const ids: (string | undefined)[] = [];
	const failures: string[] = [];
	const who = (name: string) => {
		const p = people.get(name);
		if (!p) throw new Error(`conversation "${c.name}": ${name} isn't in the room`);
		return p;
	};

	c.turns.forEach((t, i) => {
		if ("wait" in t) {
			vi.advanceTimersByTime(t.wait * 1000);
		} else if ("hear" in t) {
			ids[i] = driver.hear(who(t.hear), t.text, { whisper: t.whisper, replyId: t.replyTo !== undefined ? ids[t.replyTo] : undefined, shown: t.shown });
		} else {
			const r = driver.say(t.say, {
				whisperTo: t.whisperTo ? who(t.whisperTo).MemberNumber : undefined,
				replyId: t.replyTo !== undefined ? ids[t.replyTo] : undefined,
				garbled: t.garbled,
			});
			ids[i] = r.msgId;
			if (t.expect?.tone !== undefined && (r.a?.tone ?? "none") !== t.expect.tone)
				failures.push(`turn ${i} ("${t.say}") tone: expected ${t.expect.tone}, got ${r.a?.tone ?? "none"}`);
			if (t.expect?.context !== undefined) {
				const ctx = r.a?.context.negative ? "negative" : r.a?.context.positive ? "positive" : "none";
				if (ctx !== t.expect.context) failures.push(`turn ${i} ("${t.say}") context: expected ${t.expect.context}, got ${ctx}`);
			}
		}
	});
	return failures;
}

const TONES: Tone[] = ["negative", "neutral", "positive"];

export interface ToneMetrics {
	n: number;
	accuracy: number;
	confusion: Record<Tone, Record<Tone, number>>;
	perClass: Record<Tone, { precision: number; recall: number; f1: number; support: number }>;
	macroF1: number;
}

export function toneMetrics(pairs: { expected: Tone; actual: Tone }[]): ToneMetrics {
	const confusion = Object.fromEntries(TONES.map(e => [e, Object.fromEntries(TONES.map(a => [a, 0]))])) as ToneMetrics["confusion"];
	for (const { expected, actual } of pairs) confusion[expected][actual]++;
	const ratio = (a: number, b: number) => (b === 0 ? 0 : a / b);
	const perClass = Object.fromEntries(TONES.map(t => {
		const tp = confusion[t][t];
		const predicted = TONES.reduce((s, e) => s + confusion[e][t], 0);
		const support = TONES.reduce((s, a) => s + confusion[t][a], 0);
		const precision = ratio(tp, predicted), recall = ratio(tp, support);
		return [t, { precision, recall, f1: ratio(2 * precision * recall, precision + recall), support }];
	})) as ToneMetrics["perClass"];
	const correct = TONES.reduce((s, t) => s + confusion[t][t], 0);
	return {
		n: pairs.length,
		accuracy: ratio(correct, pairs.length),
		confusion,
		perClass,
		macroF1: TONES.reduce((s, t) => s + perClass[t].f1, 0) / TONES.length,
	};
}
