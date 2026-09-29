// SpeechAnalysisModule's detectors (tone/profanity/erudite/phrases), contextual
// awareness (who a line is really responding to), and detector toggles.
// Ported from the pre-Vitest standalone suite (test/speech-analysis/test.ts,
// now removed) onto the real harness -- same scenarios, real hookFunction-routed
// ServerSend/ChatRoomGenerateChatRoomChatMessage, real ChatRoomMessageHandler.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { driveSpeechAnalysis, tone, type SpeechDriver } from "../harness/speech";

describe("SpeechAnalysisModule detection", () => {
	let speech: SpeechAnalysisModule;
	let driver: SpeechDriver;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, speech] = boot(new CoreModule(), new SpeechAnalysisModule());
		// driveSpeechAnalysis()'s say()/hear() advance a fake clock so contextual
		// ordering (Date.now()-based) never ties; once per file, not per-test (see time.ts).
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		// Real BC's ChatRoomCharacter includes the player themself (activities.ts and splatter.ts
		// both look up Player's own position in it), so the module's `roomIsPrivate =
		// ChatRoomCharacter.length <= 2` check counts the player as one of the room's occupants.
		addToRoom(player());
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob" }));
		driver = driveSpeechAnalysis(speech);
		speech.settings.enabled = true;
		speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
		// The module carries its own cross-message context (_lastSpeaker, _outgoingWindow,
		// _incoming) on the instance, which otherwise leaks between tests since `speech` is
		// booted once for the whole file. unload()+load() (what the original standalone
		// suite's own reset() did before every check) clears it.
		driver.reset();
	});

	describe("standalone tone phrase table", () => {
		const table: [string, string][] = [
			["I'm so stupid", "negative"], ["I'm not very good", "negative"], ["nobody likes me", "negative"],
			["I am worthless", "negative"], ["will anyone ever love me? probably not", "negative"],
			["am I useless? yes", "negative"], ["I'm not bad at this", "positive"], ["everyone hates me", "negative"],
			["I feel like such a failure", "negative"], ["I am not stupid", "positive"],
			["I am amazing", "positive"], ["I'm proud of myself", "positive"], ["am I useless? no", "positive"],
			["I love being her slave", "neutral"], ["the pain feels nice", "neutral"], ["I hate this stupid game", "neutral"],
			["no worries", "neutral"], ["right, let's go", "neutral"], ["hello everyone", "neutral"],
			["nothing can stop me", "neutral"], ["I love pizza", "neutral"],
			// self-referential verb with no object: no fixed "I am/I feel" framing needed
			["I suck", "negative"], ["I suck at this", "negative"], ["I fail", "negative"], ["I failed", "negative"],
			// same shape, but the verb has an external object, so it's not self-deprecation
			["I failed the test", "neutral"], ["I ruined everything", "neutral"], ["I love cooking dinner", "neutral"],
			// "without X" negates X, so a negative X shouldn't read as self-deprecation ("repercussions" alone is negative)
			["Now I can sass Sylvin all I want without repercussions >.>", "neutral"],
			["I did that without any regrets", "neutral"], ["I can relax without any worries", "neutral"],
			["I feel amazing without any worries", "positive"], ["I survived without any help", "positive"],
			// a modal states ability/intent for an activity, not a self-judgment, regardless of the activity's own valence
			["I can't relax", "neutral"], ["I can't find my keys", "neutral"], ["I will go home", "neutral"],
			["I couldn't care less", "neutral"],
			// comparisons
			["other people are cuter than me", "negative"], ["everyone is better than me", "negative"],
			["you are all so much smarter than me", "negative"], ["she is more beautiful than me", "negative"],
			["I'm less pretty than her", "negative"], ["I'm dumber than a rock", "negative"],
			["no one is uglier than me", "negative"], ["I'm not as smart as them", "negative"],
			["I'm as dumb as a rock", "negative"], ["I'm the dumbest person here", "negative"],
			["I'm the least attractive one here", "negative"], ["I'm not better than anyone", "negative"],
			["I'm prettier than her", "positive"], ["nobody is better than me", "positive"],
			["I'm smarter than those idiots", "positive"], ["I'm as good as anyone", "positive"], ["I am the best", "positive"],
			["I am the prettiest in the room", "positive"], ["nobody is as pretty as me", "positive"], ["I'm cuter than all of you", "positive"],
			// putting others down is not an affirmation
			["she's uglier than me", "neutral"], ["she's less pretty than me", "neutral"], ["I'm less ugly than her", "neutral"],
			["she's not as pretty as me", "neutral"], ["you're all dumber than me", "neutral"], ["I'm not the ugliest", "neutral"],
			["I'm the least ugly one here", "neutral"],
			["I'd rather stay than go", "neutral"], ["I love you more than anything", "neutral"],
			["you are smarter than Bob", "neutral"], ["I'm older than her", "neutral"],
			["other than me, nobody came", "neutral"],
			// "I'm [not] ___ing" is a progressive-tense hedge/activity, not a self-worth claim, even
			// though "I'm" precedes it -- compromise tags every -ing word the same (Verb, Gerund)
			// whether it's an activity or a genuine evaluative adjective like "amazing"/"boring".
			["hope I'm not interrupting..!", "neutral"], ["I'm not relaxing right now", "neutral"],
			["I'm trying my best", "neutral"], ["I'm just kidding", "neutral"], ["I'm leaving now", "neutral"],
			// the closed set of -ing words that really are evaluative adjectives must still detect
			["I'm amazing", "positive"], ["I'm boring", "negative"], ["I'm so annoying", "negative"],
			// "I'm being X" is copula-progressive -- X (not "being") is the predicate, whatever its
			// own part of speech ("stupid" is a plain adjective, not a gerund like the cases above).
			["I'm being stupid", "negative"], ["I'm being ridiculous", "negative"], ["I am being silly", "negative"],
		];
		it.each(table)('"%s" -> %s', (text, expected) => {
			expect(tone(speech.analyze(text))).toBe(expected);
		});
	});

	it('configured affirmation phrase "I am a good girl" is detected as a positive-self phrase', () => {
		speech.settings.affirmationPhrases = "I am a good girl";
		expect(speech.analyze("I am a good girl").positiveSelf.viaPhrase).toBe(true);
	});

	describe("profanity", () => {
		it.each([
			["fuck", true], ["f*ck", true], ["fuuuuck this", true], ["sh1t", true],
			["classic assessment", false], ["hello", false],
		] as [string, boolean][])('"%s" -> detected=%s', (text, expected) => {
			expect(speech.analyze(text).profanity.detected).toBe(expected);
		});
	});

	describe("profanity overrides", () => {
		const words = (t: string) => speech.analyze(t).profanity.words.join(",") || "none";

		it("before overrides: 'frick' is clean", () => {
			expect(words("oh frick")).toBe("none");
		});

		it("an extra word is detected as typed", () => {
			speech.settings.profanityExtras = "frick, son of a gun";
			expect(words("oh frick")).toBe("frick");
		});

		it("an extra word does not catch disguised spellings (plain match only)", () => {
			speech.settings.profanityExtras = "frick, son of a gun";
			expect(words("oh fr1ck")).toBe("none");
		});

		it("an extra word only matches whole words ('frickin' isn't 'frick')", () => {
			speech.settings.profanityExtras = "frick, son of a gun";
			expect(words("frickin heck")).toBe("none");
		});

		it("an extra multi-word phrase matches", () => {
			speech.settings.profanityExtras = "frick, son of a gun";
			expect(words("you son of a gun")).toBe("son of a gun");
		});

		it("the built-in list still works alongside extras", () => {
			speech.settings.profanityExtras = "frick, son of a gun";
			expect(words("fuck this")).toBe("fuck");
		});

		it("a safe word removes the built-in match", () => {
			speech.settings.profanitySafe = "fuck";
			expect(words("fuck this")).toBe("none");
		});

		it("a safe word also clears disguised spellings of the same built-in word", () => {
			speech.settings.profanitySafe = "fuck";
			expect(words("f*ck this")).toBe("none");
		});

		it("other built-ins are still flagged when a different word is safe", () => {
			speech.settings.profanitySafe = "shit";
			expect(words("fuck")).toBe("fuck");
		});

		it("clearing overrides restores the defaults", () => {
			speech.settings.profanityExtras = "frick";
			speech.settings.profanitySafe = "fuck";
			speech.settings.profanityExtras = "";
			speech.settings.profanitySafe = "";
			expect(words("oh frick")).toBe("none");
			expect(words("fuck")).toBe("fuck");
		});
	});

	describe("contextual (3-person room)", () => {
		it('A "who is the worst?" -> "I am"', () => {
			driver.hear(alice, "who is the worst?");
			expect(tone(driver.say("I am").a)).toBe("negative");
		});

		it('A "who\'s a good girl?" -> "me!"', () => {
			driver.hear(alice, "who's a good girl?");
			expect(tone(driver.say("me!").a)).toBe("positive");
		});

		it('A "who is the worst?" -> "I am going to bed" (not a self-nomination)', () => {
			driver.hear(alice, "who is the worst?");
			expect(tone(driver.say("I am going to bed").a)).toBe("neutral");
		});

		it('A "Bob you\'re so dumb" (addressed to Bob) -> "yeah" is not about the player', () => {
			driver.hear(alice, "Bob you're so dumb");
			expect(tone(driver.say("yeah").a)).toBe("neutral");
		});

		it('A "you\'re so dumb" in a busy (3+ person) room with no link to the player -> "yeah" is neutral', () => {
			driver.hear(alice, "you're so dumb");
			expect(tone(driver.say("yeah").a)).toBe("neutral");
		});

		it('player spoke last, then A "Bob you\'re so dumb" -> "yeah" stays neutral', () => {
			driver.say("hey");
			driver.hear(alice, "Bob you're so dumb");
			expect(tone(driver.say("yeah").a)).toBe("neutral");
		});

		it('in a 2-person room, A "you\'re so dumb" -> "yeah" is about the player', () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const g = globalThis as any;
			const saved = g.ChatRoomCharacter;
			g.ChatRoomCharacter = saved.slice(0, 2);
			try {
				driver.hear(alice, "you're so dumb");
				expect(tone(driver.say("yeah").a)).toBe("negative");
			} finally {
				g.ChatRoomCharacter = saved;
			}
		});

		it('A whispers "Bob is so dumb" -> a whispered "yeah" reply is neutral (not about the player)', () => {
			driver.hear(alice, "Bob is so dumb", { whisper: true });
			expect(tone(driver.say("yeah", { whisperTo: 2 }).a)).toBe("neutral");
		});

		it('A whispers "you\'re so dumb" -> a whispered "yeah" reply is negative', () => {
			driver.hear(alice, "you're so dumb", { whisper: true });
			expect(tone(driver.say("yeah", { whisperTo: 2 }).a)).toBe("negative");
		});

		it('A "Sera is useless" -> "true"', () => {
			driver.hear(alice, "Sera is useless");
			expect(tone(driver.say("true").a)).toBe("negative");
		});

		it('A replies to the player\'s "hi all" with "you\'re pathetic" -> "I know"', () => {
			const { msgId } = driver.say("hi all");
			driver.hear(alice, "you're pathetic", { replyId: msgId });
			expect(tone(driver.say("I know").a)).toBe("negative");
		});

		it('turn-taking: player spoke, then A "you are so pathetic" -> "sadly"', () => {
			driver.say("hey Alice");
			driver.hear(alice, "you are so pathetic");
			expect(tone(driver.say("sadly").a)).toBe("negative");
		});

		it('A "you\'re wonderful Sera" -> "no" is a negative response to a compliment', () => {
			driver.hear(alice, "you're wonderful Sera");
			expect(tone(driver.say("no").a)).toBe("negative");
		});

		it('A "you\'re wonderful Sera" -> "thank you!" is neutral (not self-deprecating)', () => {
			driver.hear(alice, "you're wonderful Sera");
			expect(tone(driver.say("thank you!").a)).toBe("neutral");
		});

		it('A "Sera you\'re so stupid" -> "no I\'m not" is a positive self-defense', () => {
			driver.hear(alice, "Sera you're so stupid");
			expect(tone(driver.say("no I'm not").a)).toBe("positive");
		});

		it('a garbled whisper "you\'re dumb" (player only sees "mmph mmm") -> "yeah" is neutral', () => {
			driver.hear(alice, "you're dumb", { whisper: true, shown: "mmph mmm" });
			expect(tone(driver.say("yeah", { whisperTo: 2 }).a)).toBe("neutral");
		});

		it('player gagged, says "I\'m worthless" (sent garbled) -> still analyzed as negative from the pre-garble text', () => {
			expect(tone(driver.say("I'm worthless", { garbled: "mm mmmmmph" }).a)).toBe("negative");
		});

		it("the same question answered twice: only the first answer counts as the response", () => {
			driver.hear(alice, "who is the worst?");
			driver.say("I am");
			expect(tone(driver.say("me").a)).toBe("neutral");
		});

		it("answering after the context window expired is not treated as a response", () => {
			driver.hear(alice, "who is the worst?");
			vi.advanceTimersByTime(120_000);
			expect(tone(driver.say("I am").a)).toBe("neutral");
		});

		it("an unrelated line in between breaks the response link", () => {
			driver.hear(alice, "who is the worst?");
			driver.say("brb");
			expect(tone(driver.say("me").a)).toBe("neutral");
		});

		it('a split message "am I pretty?" + "no" is analyzed as the player\'s own line, negatively', () => {
			driver.say("am I pretty?");
			expect(tone(driver.say("no").a)).toBe("negative");
		});

		it("profanity does not repeat on the next clean line", () => {
			driver.say("fuck");
			expect(driver.say("hello there").a?.profanity.detected).toBe(false);
		});
	});

	describe("detector toggles", () => {
		it("profanity off -> not detected, and describe() reports it as off", () => {
			speech.settings.detectors = { ...speech.settings.detectors, profanity: false };
			expect(speech.analyze("fuck").profanity.detected).toBe(false);
			expect(speech.describe(speech.analyze("fuck"))).toContain("profanity: off");
		});

		it("tone off -> self-talk reads neutral and contextual answers are not detected", () => {
			speech.settings.detectors = { ...speech.settings.detectors, profanity: true, tone: false };
			expect(tone(speech.analyze("I'm so stupid"))).toBe("neutral");
			driver.hear(alice, "who is the worst?");
			expect(tone(driver.say("I am").a)).toBe("neutral");
		});

		it("reading level is off by default", () => {
			const complex = "Notwithstanding considerable epistemological uncertainty, institutional characterization remains fundamentally indeterminate";
			expect(speech.analyze(complex).erudite.detected).toBe(false);
		});

		it("reading level on -> detects eloquent text and passes simple text", () => {
			speech.settings.detectors = { ...speech.settings.detectors, erudite: true };
			const complex = "Notwithstanding considerable epistemological uncertainty, institutional characterization remains fundamentally indeterminate";
			expect(speech.analyze(complex).erudite.detected).toBe(true);
			expect(speech.analyze("I like to go to the park with my friends on the weekend").erudite.detected).toBe(false);
		});
	});

	describe("reading level: word-count floor", () => {
		beforeEach(() => {
			speech.settings.detectors = { ...speech.settings.detectors, erudite: true };
			speech.settings.eruditeGrade = 1; // isolate the floor: only the floor can suppress a detection this low
		});

		it.each(["Absolutely.", "Seriously?", "Ridiculous.", "Obviously.", "No, definitely not."])(
			'a common short interjection ("%s") never flags', (text) => {
				expect(speech.analyze(text).erudite.detected).toBe(false);
			});

		it("a 4-word line is still suppressed by the floor", () => {
			expect(speech.analyze("I am extremely disappointed.").erudite.detected).toBe(false);
		});

		it("a 5-word line is assessed", () => {
			expect(speech.analyze("That is absolutely unacceptable to me.").erudite.detected).toBe(true);
		});

		it("a 6-word eloquent line exceeds the default threshold", () => {
			speech.settings.eruditeGrade = 10;
			expect(speech.analyze("Honestly, I am extremely disappointed today.").erudite.detected).toBe(true);
		});

		it("a 6-word plain line stays under the default threshold", () => {
			speech.settings.eruditeGrade = 10;
			expect(speech.analyze("I really don't want to go.").erudite.detected).toBe(false);
		});

		it("describe() reports 'not enough words to assess' below the floor, not a grade number", () => {
			expect(speech.describe(speech.analyze("Absolutely."))).toContain("not enough words to assess");
		});
	});

	it("init() fills in missing detectors but keeps ones already saved", () => {
		speech.settings.detectors = { tone: true } as never;
		speech.init();
		expect(speech.settings.detectors).toEqual({ tone: true, profanity: false, erudite: false, phrases: false });
	});

	describe("phrase lists", () => {
		beforeEach(() => {
			speech.settings.phraseGroups = [
				{ id: "release", name: "Release phrases", phrases: `"may I have my clothes back", please mistress` },
				{ id: "banned", name: "Banned words", phrases: "pizza, darn" },
			];
		});

		const matched = (t: string) => speech.analyze(t).phrases.matched.join(",") || "none";

		it('"May I have my clothes back?" matches the release group', () => {
			expect(matched("May I have my clothes back?")).toBe("release");
		});

		it("phrase matching is case-insensitive", () => {
			expect(matched("Please Mistress, I'm sorry")).toBe("release");
		});

		it('"darn, I want pizza" matches the banned group, with two hits', () => {
			expect(matched("darn, I want pizza")).toBe("banned");
			expect(speech.analyze("darn, I want pizza").phrases.hits).toHaveLength(2);
		});

		it('"darnation" does not match "darn" -- whole words only', () => {
			expect(matched("darnation")).toBe("none");
		});

		it('"please mistress, no more pizza" matches both groups', () => {
			expect(matched("please mistress, no more pizza")).toBe("release,banned");
		});

		it("describe() shows phrase hits with the group's display name", () => {
			expect(speech.describe(speech.analyze("darn"))).toContain(`"darn" (Banned words)`);
		});

		it("the phrases detector, when off, matches nothing", () => {
			speech.settings.detectors = { ...speech.settings.detectors, phrases: false };
			expect(matched("pizza")).toBe("none");
		});

		it("an empty phrase group matches nothing", () => {
			speech.settings.phraseGroups = [{ id: "banned", name: "Banned", phrases: "" }];
			expect(matched("anything at all")).toBe("none");
		});
	});
});
