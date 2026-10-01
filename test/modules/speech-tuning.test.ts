// Tuning suggestions, the Tune tab, and the inline chat tune button.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { addToList, setWordScore, suggestTuning } from "Modules/speech-tuning";
import { KitContext } from "../../src/Settings/Dom/kit";
import { SPEECH_EDITABLE_KEYS, sanitizeRemoteSpeechSettings } from "Settings/Models/speech-analysis";
import { buildSpeechTabs } from "../../src/Settings/speech-analysis-pages";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";
import { driveSpeechAnalysis, type SpeechDriver } from "../harness/speech";

describe("speech tuning", () => {
	let speech: SpeechAnalysisModule;

	beforeAll(() => {
		// BC's own display function returns the message element the module decorates.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).ChatRoomMessageDisplay = () => document.createElement("div");
		[, speech] = boot(new CoreModule(), new SpeechAnalysisModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		speech.settings.enabled = true;
		speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: false };
		speech.settings.negativeThreshold = -0.1;
		speech.settings.positiveThreshold = 0.3;
		speech.settings.lexiconExtras = "";
		speech.settings.profanitySafe = "";
		localStorage.clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("suggestions", () => {
		it("offers a threshold that would make a negative line neutral, and applying it works", () => {
			const a = speech.analyze("I'm so stupid");
			expect(a.tone).toBe("negative");
			const suggestion = suggestTuning(a, speech.settings).find(s => s.label.includes("negative threshold"));
			expect(suggestion).toBeDefined();
			suggestion!.apply(speech.settings);
			expect(speech.analyze("I'm so stupid").tone).toBe("neutral");
		});

		it("offers to ignore a word, which silences it", () => {
			const a = speech.analyze("I'm so stupid");
			suggestTuning(a, speech.settings).find(s => s.label === 'Ignore the word "stupid" (score 0)')!.apply(speech.settings);
			expect(speech.settings.lexiconExtras).toContain("stupid:0");
			expect(speech.analyze("I'm so stupid").tone).toBe("neutral");
		});

		it("offers to score the strongest word on a neutral line, never a threshold", () => {
			const a = speech.analyze("this game sucks");
			const labels = suggestTuning(a, speech.settings).map(s => s.label);
			expect(labels.some(l => l.includes("threshold"))).toBe(false);
			expect(labels).toContain('Count "sucks" as negative (-3)');
		});

		it("offers to mark a flagged word as never profane", () => {
			const a = speech.analyze("what the fuck");
			const suggestion = suggestTuning(a, speech.settings).find(s => s.label.startsWith("Never treat"));
			expect(suggestion).toBeDefined();
			expect(suggestion).toMatchObject({ kind: "safe", short: "fuck" });
			expect(suggestion!.tip).toContain("allowed in every line");
			suggestion!.apply(speech.settings);
			expect(speech.settings.profanitySafe?.toLowerCase()).toContain("fuck");
		});

		it("setWordScore replaces an existing entry and addToList doesn't duplicate", () => {
			speech.settings.lexiconExtras = "bratty:0, perfect:4";
			setWordScore(speech.settings, "Perfect", 1);
			expect(speech.settings.lexiconExtras).toBe("bratty:0, perfect:1");
			addToList(speech.settings, "profanitySafe", "damn");
			addToList(speech.settings, "profanitySafe", "DAMN");
			expect(speech.settings.profanitySafe).toBe("damn");
		});
	});

	describe("tune tab", () => {
		const tab = (remote: boolean) => buildSpeechTabs(new KitContext(), speech.settings, { remote }).find(t => t.label === "Tune");
		const render = () => {
			const root = document.createElement("div");
			root.append(...tab(false)!.render());
			return root;
		};

		it("is a top-level tab for the wearer, not in remote view", () => {
			expect(tab(false)).toBeDefined();
			expect(tab(true)).toBeUndefined();
		});

		it("shows how a typed line reads and offers suggestions", () => {
			const root = render();
			const input = root.querySelector("input[type=text]") as HTMLInputElement;
			input.value = "I'm so stupid";
			input.dispatchEvent(new Event("change"));
			expect(root.querySelector(".lscg-tone-negative")).not.toBeNull();
			const suggestion = Array.from(root.querySelectorAll("button.lscg-chat-tune-action")).find(b => (b as HTMLButtonElement).title.startsWith("Ignore the word"));
			expect(suggestion).toBeDefined();
			(suggestion as HTMLButtonElement).click();
			expect(root.querySelector(".lscg-tone-neutral")).not.toBeNull();
		});

		it("gives each detector its own group with its own tags", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: true, phrases: false };
			const root = render();
			const input = root.querySelector("input[type=text]") as HTMLInputElement;
			input.value = "what the fuck, I'm so stupid and incredibly disappointing";
			input.dispatchEvent(new Event("change"));
			const groups = Array.from(root.querySelectorAll(".lscg-kit-group"));
			expect(groups.map(g => g.querySelector("h3")!.textContent)).toEqual(["Tone", "Profanity", "Reading level"]);
			const tone = groups[0], profanity = groups[1];
			const titles = (g: Element) => Array.from(g.querySelectorAll("button.lscg-chat-tune-action")).map(b => (b as HTMLButtonElement).title);
			expect(titles(tone).some(t => t.startsWith("Ignore the word"))).toBe(true);
			expect(titles(tone).some(t => t.startsWith("Never treat"))).toBe(false);
			expect(titles(profanity).some(t => t.startsWith("Never treat"))).toBe(true);
			expect(titles(profanity).some(t => t.startsWith("Ignore the word"))).toBe(false);
		});

		it("the profanity group's picker offers only the opposite of the word's current state", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: false };
			const root = render();
			const input = root.querySelector("input[type=text]") as HTMLInputElement;
			input.value = "what the fuck, I'm so stupid";
			input.dispatchEvent(new Event("change"));
			const group = () => root.querySelector(".lscg-kit-group-profanity")!;
			const actions = () => Array.from(group().querySelectorAll(".lscg-wordtuner-actions button")).map(b => (b as HTMLButtonElement).title);
			const pick = (word: string) => (Array.from(group().querySelectorAll(".lscg-word")).find(e => e.textContent === word) as HTMLButtonElement).click();
			pick("fuck");
			expect(actions().map(t => t.split(" ")[0])).toEqual(["Never"]);
			pick("stupid");
			expect(actions().map(t => t.split(" ")[0])).toEqual(["Treat"]);
		});

		it("marks a group whose detector is off", () => {
			speech.settings.detectors = { tone: true, profanity: false, erudite: false, phrases: false };
			const root = render();
			const input = root.querySelector("input[type=text]") as HTMLInputElement;
			input.value = "I'm so stupid";
			input.dispatchEvent(new Event("change"));
			const off = Array.from(root.querySelectorAll(".lscg-kit-group-off h3")).map(h => h.textContent);
			expect(off).toEqual(["Profanity (detector off)", "Reading level (detector off)"]);
		});

		it("puts the recent lines beside the analysis so the list doesn't move", () => {
			const root = render();
			const grid = root.querySelector(".lscg-kit-tune-grid")!;
			expect(grid.querySelector(".lscg-kit-chatlog")).not.toBeNull();
			expect(grid.querySelector(".lscg-kit-tune-results")).not.toBeNull();
		});

		it("shows recent lines as a scrollable chat-style list", () => {
			vi.useFakeTimers();
			try {
				addToRoom(player());
				const driver = driveSpeechAnalysis(speech);
				driver.reset();
				driver.say("I'm so stupid");
				driver.say("hello there");
				const root = render();
				const log = root.querySelector(".lscg-kit-chatlog");
				expect(log).not.toBeNull();
				expect(log!.querySelectorAll(".lscg-kit-chatline")).toHaveLength(2);
			} finally {
				vi.useRealTimers();
			}
		});

		it("the chat-button switch is saved in the account's speech settings, off by default", () => {
			const checkbox = render().querySelector("input[type=checkbox]") as HTMLInputElement;
			expect(checkbox.checked).toBe(false);
			expect(speech.settings.chatTuneButtons).toBeFalsy();
			checkbox.checked = true;
			checkbox.dispatchEvent(new Event("change"));
			expect(speech.settings.chatTuneButtons).toBe(true);
			expect(localStorage.length).toBe(0);
		});

		it("the chat-button switch isn't something a remote configurer can change", () => {
			expect(SPEECH_EDITABLE_KEYS as readonly string[]).not.toContain("chatTuneButtons");
			expect(sanitizeRemoteSpeechSettings({ chatTuneButtons: true })).not.toHaveProperty("chatTuneButtons");
		});
	});

	describe("chat tune button", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;
		let driver: SpeechDriver;

		const display = (msgId: string) => g.ChatRoomMessageDisplay({ Type: "Chat", Content: "x" }, "x", player(), { MsgId: msgId }) as HTMLElement | undefined;

		beforeEach(() => {
			vi.useFakeTimers();
			addToRoom(player());
			driver = driveSpeechAnalysis(speech);
			driver.reset();
			speech.settings.chatTuneButtons = true;
		});

		afterEach(() => {
			vi.useRealTimers();
			speech.settings.chatTuneButtons = false;
		});

		it("adds a button to an analyzed line only while the switch is on", () => {
			const { msgId } = driver.say("I'm so stupid");
			expect(display(msgId)?.querySelector(".lscg-chat-tune")).not.toBeNull();
			speech.settings.chatTuneButtons = false;
			expect(display(msgId)?.querySelector(".lscg-chat-tune")).toBeNull();
		});

		it("adds nothing to lines that weren't analyzed (other people's, emotes)", () => {
			driver.say("I'm so stupid");
			expect(display("someone-else")?.querySelector(".lscg-chat-tune")).toBeNull();
		});

		it("opens a panel with the verdict, applies a suggestion, and closes again", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const panel = message.querySelector(".lscg-chat-tune-panel")!;
			expect(panel.querySelector(".lscg-tone-negative")).not.toBeNull();
			const ignore = Array.from(panel.querySelectorAll("button")).find(b => b.title.includes("Ignore the word"))!;
			ignore.click();
			expect(speech.settings.lexiconExtras).toContain("stupid:0");
			expect(message.querySelector(".lscg-chat-tune-panel .lscg-tone-neutral")).not.toBeNull();
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			expect(message.querySelector(".lscg-chat-tune-panel")).toBeNull();
		});

		it("shows nothing at all while the settings are locked", () => {
			speech.settings.locked = true;
			try {
				const { msgId } = driver.say("I'm so stupid");
				expect(display(msgId)?.querySelector(".lscg-chat-tune")).toBeNull();
			} finally {
				speech.settings.locked = false;
			}
		});

		it("shows nothing while speech analysis or every detector is off", () => {
			const { msgId } = driver.say("I'm so stupid");
			speech.settings.enabled = false;
			expect(display(msgId)?.querySelector(".lscg-chat-tune")).toBeNull();
			speech.settings.enabled = true;
			speech.settings.detectors = { tone: false, profanity: false, erudite: false, phrases: true };
			expect(display(msgId)?.querySelector(".lscg-chat-tune")).toBeNull();
			speech.settings.detectors = { tone: true, profanity: false, erudite: false, phrases: false };
			expect(display(msgId)?.querySelector(".lscg-chat-tune")).not.toBeNull();
		});

		it("closes an open panel if the settings get locked meanwhile", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			expect(message.querySelector(".lscg-chat-tune-panel")).not.toBeNull();
			speech.settings.locked = true;
			try {
				(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
				(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
				expect(message.querySelector(".lscg-chat-tune-panel")).toBeNull();
			} finally {
				speech.settings.locked = false;
			}
		});

		it("only offers controls for detectors that are on", () => {
			speech.settings.detectors = { tone: true, profanity: false, erudite: false, phrases: false };
			const { msgId } = driver.say("what the fuck, I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const titles = () => Array.from(message.querySelectorAll(".lscg-chat-tune-panel button")).map(b => (b as HTMLButtonElement).title);
			expect(titles().some(t => t.startsWith("Ignore the word"))).toBe(true);
			expect(titles().some(t => t.startsWith("Never treat") || t.startsWith("Treat"))).toBe(false);
			expect(message.textContent).not.toContain("⚠");

			speech.settings.detectors = { tone: false, profanity: true, erudite: false, phrases: false };
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			expect(titles().some(t => t.startsWith("Ignore the word"))).toBe(false);
			expect(titles().some(t => t.startsWith("Never treat") || t.startsWith("Treat"))).toBe(true);
		});

		it("lets you pick words of a neutral line to score or flag", () => {
			const { msgId } = driver.say("ugh im worthles");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const click = (selector: string, title?: string) => {
				const el = Array.from(message.querySelectorAll(selector)).find(e => !title || (e as HTMLButtonElement).title.startsWith(title)) as HTMLButtonElement;
				expect(el, `${selector} ${title ?? ""}`).toBeDefined();
				el.click();
			};
			click(".lscg-chat-tune-row-tone button[title^='Pick individual words']");
			const word = Array.from(message.querySelectorAll(".lscg-chat-tune-row-tone .lscg-word")).find(e => e.textContent === "worthles") as HTMLButtonElement;
			word.click();
			click(".lscg-wordtuner-actions button", 'Count "worthles" as negative (-3)');
			expect(speech.settings.lexiconExtras).toContain("worthles:-3");
			expect(message.querySelector(".lscg-chat-tune-row-tone [title^='Treat']")).toBeNull();
			click(".lscg-chat-tune-row-profanity button[title^='Pick individual words']");

			(Array.from(message.querySelectorAll(".lscg-chat-tune-row-profanity .lscg-word")).find(e => e.textContent === "ugh") as HTMLButtonElement).click();
			click(".lscg-wordtuner-actions button", 'Treat "ugh" as profane');
			expect(speech.settings.profanityExtras).toContain("ugh");
		});

		it("offers a reading-level tweak when that detector is on", () => {
			speech.settings.detectors = { tone: false, profanity: false, erudite: true, phrases: false };
			speech.settings.eruditeGrade = 10;
			const a = speech.analyze("That explanation was surprisingly comprehensive and thoughtful");
			const raise = suggestTuning(a, speech.settings).find(s => s.label.includes("raise the maximum reading grade"));
			expect(raise).toBeDefined();
			raise!.apply(speech.settings);
			expect(speech.analyze(a.raw).erudite.detected).toBe(false);

			const easy = speech.analyze("the dog ran to the park and played all day");
			const lower = suggestTuning(easy, speech.settings).find(s => s.label.includes("lower the maximum reading grade"));
			expect(lower).toBeDefined();
			lower!.apply(speech.settings);
			expect(speech.analyze(easy.raw).erudite.detected).toBe(true);
		});

		it("never offers tone or profanity tweaks for a detector that's off", () => {
			speech.settings.detectors = { tone: false, profanity: false, erudite: false, phrases: false };
			expect(suggestTuning(speech.analyze("I'm so stupid, what the fuck"), speech.settings)).toEqual([]);
		});

		it("tags carry their kind for color, and the never-profane tag is just the word", () => {
			const { msgId } = driver.say("what the fuck, I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const tags = Array.from(message.querySelectorAll(".lscg-chat-tune-panel button.lscg-chat-tune-action")) as HTMLButtonElement[];
			const safe = tags.find(t => t.classList.contains("lscg-tag-safe"))!;
			expect(safe.textContent?.trim()).toBe("⚠ fuck");
			expect(safe.title).toContain("allowed in every line");
			expect(safe.querySelector(".lscg-tag-icon")).not.toBeNull();
			expect(tags.some(t => t.classList.contains("lscg-tag-ignore") && t.title.startsWith("Ignore the word"))).toBe(true);
			expect(tags.every(t => t.title.length > 12)).toBe(true);
		});

		it("lines the tune button up beside BC's reply control when the message is hovered", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			const reply = document.createElement("div");
			reply.className = "chat-room-message-reply-button";
			message.append(reply);
			message.getBoundingClientRect = () => ({ left: 0, right: 500, top: 100, bottom: 140, width: 500, height: 40, x: 0, y: 100, toJSON() { return {}; } });
			reply.getBoundingClientRect = () => ({ left: 440, right: 490, top: 102, bottom: 138, width: 50, height: 36, x: 440, y: 102, toJSON() { return {}; } });
			message.dispatchEvent(new Event("mouseenter"));
			const toggle = message.querySelector(".lscg-chat-tune") as HTMLButtonElement;
			expect(toggle.style.right).toBe("64px");
			// the reply control's top edge must never move the button up out of its own line
			expect(toggle.style.top).toBe("");
			expect(message.style.position).toBe("relative");
		});

		it("fills the button with the row's own background so it stays readable over the text", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			message.style.backgroundColor = "rgb(215, 246, 233)";
			document.body.append(message);
			try {
				message.dispatchEvent(new Event("mouseenter"));
				const toggle = message.querySelector(".lscg-chat-tune") as HTMLButtonElement;
				expect(toggle.style.backgroundColor).toBe("rgb(215, 246, 233)");
			} finally {
				message.remove();
			}
		});

		it("uses the nearest ancestor's background when the row itself is transparent", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			const log = document.createElement("div");
			log.style.backgroundColor = "rgb(20, 20, 20)";
			log.append(message);
			document.body.append(log);
			try {
				message.dispatchEvent(new Event("mouseenter"));
				expect((message.querySelector(".lscg-chat-tune") as HTMLButtonElement).style.backgroundColor).toBe("rgb(20, 20, 20)");
			} finally {
				log.remove();
			}
		});

		it("finds BC's reply control even when it has no 'reply' class, and sits left of it", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			const control = document.createElement("button");
			message.append(control);
			message.getBoundingClientRect = () => ({ left: 0, right: 500, top: 100, bottom: 140, width: 500, height: 40, x: 0, y: 100, toJSON() { return {}; } });
			control.getBoundingClientRect = () => ({ left: 400, right: 450, top: 104, bottom: 136, width: 50, height: 32, x: 400, y: 104, toJSON() { return {}; } });
			message.dispatchEvent(new Event("mouseenter"));
			expect((message.querySelector(".lscg-chat-tune") as HTMLButtonElement).style.right).toBe("104px");
		});

		it("marks the button as open while its flyout is showing, and back when closed", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			const toggle = message.querySelector(".lscg-chat-tune") as HTMLButtonElement;
			expect(toggle.getAttribute("aria-expanded")).toBe("false");
			toggle.click();
			expect(toggle.getAttribute("aria-expanded")).toBe("true");
			toggle.click();
			expect(toggle.getAttribute("aria-expanded")).toBe("false");
		});

		it("resets the open marker when the flyout is closed because settings got locked", () => {
			const { msgId } = driver.say("I'm so stupid");
			const message = display(msgId)!;
			const toggle = message.querySelector(".lscg-chat-tune") as HTMLButtonElement;
			toggle.click();
			speech.settings.locked = true;
			try {
				// any re-render (here, a click on a tag) notices the lock and closes the flyout
				(message.querySelector(".lscg-chat-tune-panel button") as HTMLButtonElement).click();
				expect(message.querySelector(".lscg-chat-tune-panel")).toBeNull();
				expect(toggle.getAttribute("aria-expanded")).toBe("false");
			} finally {
				speech.settings.locked = false;
			}
		});

		it("puts the verdict icon first in every row, so the sides are consistent", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: true, phrases: false };
			speech.settings.eruditeGrade = 10;
			const { msgId } = driver.say("the dog ran to the park and played all day");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const verdicts = Array.from(message.querySelectorAll(".lscg-chat-tune-row .lscg-chat-tune-info .lscg-tone")).map(e => e.textContent!.trim());
			expect(verdicts.length).toBe(3);
			for (const v of verdicts) expect(v).toMatch(/^[✓✗–]/);
			expect(verdicts[2]).toMatch(/^✓ Aa /);
		});

		it("offers only the opposite profanity action for the picked word", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: false };
			const { msgId } = driver.say("what the fuck, I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			(message.querySelector(".lscg-chat-tune-row-profanity button[title^='Pick individual words']") as HTMLButtonElement).click();
			const pickWord = (word: string) => (Array.from(message.querySelectorAll(".lscg-chat-tune-row-profanity .lscg-word")).find(e => e.textContent === word) as HTMLButtonElement).click();
			const actions = () => Array.from(message.querySelectorAll(".lscg-chat-tune-row-profanity .lscg-wordtuner-actions button")).map(b => (b as HTMLButtonElement).title);

			pickWord("fuck");
			expect(actions()).toHaveLength(1);
			expect(actions()[0]).toMatch(/^Never treat "fuck"/);

			pickWord("stupid");
			expect(actions()).toHaveLength(1);
			expect(actions()[0]).toMatch(/^Treat "stupid"/);

			// once allowed, the word is no longer profane, so the opposite is now "treat as profane"
			pickWord("fuck");
			(message.querySelector(".lscg-wordtuner-actions button") as HTMLButtonElement).click();
			expect(speech.settings.profanitySafe).toContain("fuck");
			expect(actions()).toHaveLength(1);
			expect(actions()[0]).toMatch(/^Treat "fuck"/);
		});

		it("groups every control under the detector it tunes", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: true, phrases: false };
			const { msgId } = driver.say("what the fuck, I'm so stupid and incredibly disappointing");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			const rows = Array.from(message.querySelectorAll(".lscg-chat-tune-row"));
			expect(rows.map(r => r.querySelector(".lscg-chat-tune-label")!.textContent)).toEqual(["Tone", "Profanity", "Reading"]);
			const titles = (r: Element) => Array.from(r.querySelectorAll("button")).map(b => (b as HTMLButtonElement).title);
			expect(titles(rows[0]).some(t => t.startsWith("Ignore the word"))).toBe(true);
			expect(titles(rows[0]).some(t => t.startsWith("Never treat"))).toBe(false);
			expect(titles(rows[1]).some(t => t.startsWith("Never treat"))).toBe(true);
			expect(titles(rows[1]).some(t => t.startsWith("Ignore the word"))).toBe(false);
			expect(titles(rows[2]).some(t => t.includes("reading grade"))).toBe(true);
			expect(rows[2].querySelector("button[title^='Pick individual words']")).toBeNull();
		});

		it("omits a detector's row entirely when it's off", () => {
			speech.settings.detectors = { tone: true, profanity: false, erudite: false, phrases: false };
			const { msgId } = driver.say("what the fuck, I'm so stupid");
			const message = display(msgId)!;
			(message.querySelector(".lscg-chat-tune") as HTMLButtonElement).click();
			expect(Array.from(message.querySelectorAll(".lscg-chat-tune-label")).map(l => l.textContent)).toEqual(["Tone"]);
		});

	});
});
