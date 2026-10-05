// describe()/trace output: why a line scored the way it did.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { boot, resetWorld } from "../harness/world";

describe("speech analysis trace", () => {
	let speech: SpeechAnalysisModule;

	beforeAll(() => {
		[, speech] = boot(new CoreModule(), new SpeechAnalysisModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		speech.settings.enabled = true;
		speech.settings.detectors = { tone: true, profanity: false, erudite: false, phrases: false };
	});

	it("reports boosted and negated words and the self-talk gate", () => {
		const a = speech.analyze("I am not very stupid");
		expect(a.trace.gate).toBe("framing");
		expect(a.trace.words).toEqual([{ word: "stupid", score: expect.any(Number) }]);
		expect(a.trace.words[0].score).toBeGreaterThan(0);
		expect(speech.describe(a)).toContain("scored words: stupid +");
		expect(speech.describe(a)).toContain("about the speaker: framing");
	});

	it("notes when a teasing marker silenced the score", () => {
		const a = speech.analyze("haha I'm so stupid :P");
		expect(a.trace.playful).toBe(true);
		expect(speech.describe(a)).toContain("teasing marker");
	});

	it("explains a line that isn't about the speaker", () => {
		const a = speech.analyze("this game sucks");
		expect(a.trace.gate).toBe("none");
	});
});
