// Runs the labeled speech corpus. Must-pass cases fail the run on regression; `gap` cases are
// known limitations (they fail the run only once fixed, so they get graduated). Set
// SPEECH_REPORT=1 for per-category metrics and a confusion matrix.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { boot, resetWorld, addToRoom, player } from "../../harness/world";
import { driveSpeechAnalysis, type SpeechDriver } from "../../harness/speech";
import { ALL_LINES } from "./lines";
import { CONVERSATIONS as ALL_CONVERSATIONS } from "./conversations";
import { BASELINE_GAP_CONVERSATIONS } from "./baseline-gaps";
import { lineMismatches, runConversation, runLine, toneMetrics } from "./evaluate";
import { splitOf, type Tone } from "./types";

const CONVERSATIONS = ALL_CONVERSATIONS.map(c => (BASELINE_GAP_CONVERSATIONS.has(c.name) ? { ...c, gap: true } : c));

describe("speech corpus", () => {
	let speech: SpeechAnalysisModule;
	let driver: SpeechDriver;

	beforeAll(() => {
		[, speech] = boot(new CoreModule(), new SpeechAnalysisModule());
		vi.useFakeTimers();
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		addToRoom(player());
		driver = driveSpeechAnalysis(speech);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("lines", () => {
		const required = ALL_LINES.filter(l => !l.case.gap);
		it.each(required.map(l => [`[${l.category}] ${l.case.text}`, l] as const))("%s", (_name, l) => {
			expect(lineMismatches(l.case, runLine(speech, l.case))).toEqual([]);
		});

		describe("known gaps", () => {
			for (const l of ALL_LINES.filter(l => l.case.gap))
				it(`[${l.category}] ${l.case.text}`, () => {
					const mismatches = lineMismatches(l.case, runLine(speech, l.case));
					expect(mismatches.length, "now passes: remove `gap` from this case").toBeGreaterThan(0);
				});
		});
	});

	describe("conversations", () => {
		it.each(CONVERSATIONS.filter(c => !c.gap).map(c => [c.name, c] as const))("%s", (_name, c) => {
			expect(runConversation(speech, driver, c)).toEqual([]);
		});

		if (CONVERSATIONS.some(c => c.gap))
		describe("known gaps", () => {
			for (const c of CONVERSATIONS.filter(c => c.gap))
				it(c.name, () => {
					expect(runConversation(speech, driver, c).length, "now passes: remove `gap` from this conversation").toBeGreaterThan(0);
				});
		});
	});

	describe.skipIf(!(globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.SPEECH_REPORT)("report", () => {
		it("prints per-category and overall tone metrics", () => {
			const rows: string[] = [];
			const all: { expected: Tone; actual: Tone; split: string }[] = [];
			const cats = [...new Set(ALL_LINES.map(l => l.category))];
			for (const cat of cats) {
				const pairs = ALL_LINES.filter(l => l.category === cat && l.case.tone !== undefined).map(l => ({
					expected: l.case.tone as Tone,
					actual: runLine(speech, l.case).tone,
					split: splitOf(l.case.text),
				}));
				if (!pairs.length) continue;
				all.push(...pairs);
				const m = toneMetrics(pairs);
				rows.push(`${cat.padEnd(48)} n=${String(m.n).padStart(3)} acc=${m.accuracy.toFixed(2)} macroF1=${m.macroF1.toFixed(2)}`);
			}
			const out = [...rows];
			for (const split of ["train", "validation"]) {
				const m = toneMetrics(all.filter(p => p.split === split));
				out.push(`${("overall " + split).padEnd(48)} n=${String(m.n).padStart(3)} acc=${m.accuracy.toFixed(2)} macroF1=${m.macroF1.toFixed(2)}`);
			}
			const m = toneMetrics(all);
			out.push("", "confusion (rows expected, cols actual: negative/neutral/positive)");
			for (const e of ["negative", "neutral", "positive"] as Tone[])
				out.push(`  ${e.padEnd(9)} ${["negative", "neutral", "positive"].map(a => String(m.confusion[e][a as Tone]).padStart(4)).join("")}`);
			for (const t of ["negative", "positive"] as Tone[])
				out.push(`  ${t}: precision ${m.perClass[t].precision.toFixed(2)} recall ${m.perClass[t].recall.toFixed(2)} f1 ${m.perClass[t].f1.toFixed(2)}`);
			console.log("\n" + out.join("\n"));
		});
	});
});
