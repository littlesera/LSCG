// The Suggestible drug: it's dosed like the other built-ins (drinks, injections, gas, soaks), decays, is cured, and the higher it is the
// more likely a player is to feel an urge when someone asks them for something in chat. The urge is only a prompt.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { SUGGESTIBLE_URGE } from "../../src/constants";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, makeCharacter, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";
import { registerExtension, type ModApiHandle } from "api/extensions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("Suggestible drug", () => {
	let injector: InjectorModule;
	let states: StateModule;
	let hypno: HypnoModule;
	let alice: FixtureCharacter;
	let api: ModApiHandle;
	let apiIds = 0;

	beforeAll(() => {
		[, , , , injector, hypno, states] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new InjectorModule(), new HypnoModule(), new StateModule(), new ItemUseModule(), new CollarModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Name: "Sera", Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		hypno.init();
		injector.init();
		Object.assign(injector.settings, { enabled: true, enableSuggestible: true, enableSoakedItems: true, soakedAt: {} });
		injector.suggestibleLevel = 0;
		injector.lastUrgeAt.clear();
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		api = registerExtension({ id: `sug-${++apiIds}`, name: "Listener", version: "1" });
	});

	afterEach(() => {
		api.dispose();
		vi.clearAllTimers();
		restoreRandom();
	});

	const full = () => injector.suggestibleMax * injector.drugLevelMultiplier;
	const ask = (msg: string, who: FixtureCharacter = alice) => injector.SuggestibleUrge(msg, who as never);

	describe("ParseRequest", () => {
		const names = ["Sera"];
		it.each([
			["Sera, would you kindly dance", "dance"],
			["sera, would you please: bring me a drink", "bring me a drink"],
			["Sera would you kindly, kneel?", "kneel"],
			["SERA, WOULD YOU PLEASE KINDLY sit down!", "sit down"],
			["  Sera: would you please stand up.  ", "stand up"],
			// the ways people actually ask
			["Sera, would you please kneel for me", "kneel"],
			["sera please kneel", "kneel"],
			["Sera, please kneel for me", "kneel"],
			["kneel, sera", "kneel"],
			["kneel for me, Sera", "kneel"],
			["please kneel, sera", "kneel"],
			["Sera, I want you to kneel for me", "kneel"],
			["Sera, I need you to hold still", "hold still"],
			["Sera, I'd like you to come here", "come here"],
			["Sera, could you hand me that", "hand me that"],
			["Sera can you please sit", "sit"],
			["Sera, you will kneel", "kneel"],
			["Sera, would you kindly kneel for me please", "kneel"],
		])("reads %j as %j", (msg, phrase) => {
			expect(InjectorModule.ParseRequest(msg, names)).toBe(phrase);
		});

		it.each([
			"Sera, dance",
			"Bob, would you kindly dance",
			"please kneel, bob",
			"would you kindly dance",
			"Sera, would you kindly",
			"Sera, would you please:",
			"Sera, I want you",
			"Sera, would you like some tea?",
			"Sera, would you mind if I sat here",
			"Sera, can you be quiet",
			"hi, sera",
			"thanks, Sera!",
			"Sera, sorry",
			"Sera please",
			"",
		])("ignores %j", msg => {
			expect(InjectorModule.ParseRequest(msg, names)).toBeUndefined();
		});

		it("matches any of the player's names, and treats names as plain text", () => {
			expect(InjectorModule.ParseRequest("Lil Sera, would you kindly hush", ["Lil Sera", "Lil"])).toBe("hush");
			expect(InjectorModule.ParseRequest("Lil, would you kindly hush", ["Lil Sera", "Lil"])).toBe("hush");
			expect(InjectorModule.ParseRequest("anything, would you kindly hush", [".*"])).toBeUndefined();
			expect(InjectorModule.ParseRequest("Sera, would you kindly hush", [])).toBeUndefined();
		});
	});

	describe("dosing", () => {
		it("a boost raises the level, capped at the bar", () => {
			injector.AddSuggestible(1);
			expect(injector.suggestibleLevel).toBe(injector.drugLevelMultiplier);
			injector.AddSuggestible(1000);
			expect(injector.suggestibleLevel).toBe(full());
		});

		it("/lscg drug-boost suggestible", () => {
			injector.commands[0].Action!("suggestible", "", ["suggestible"]);
			expect(injector.suggestibleLevel).toBeGreaterThan(0);
			expect(sent.local().join()).toContain("Suggestible boosted");
		});

		it("a drink and an injection with the keyword dose it, only when opted in", () => {
			wear(alice, makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "GlassFilled" }), { Craft: { Name: "Suggestible Wine", Description: "", MemberNumber: 2 } }));
			injector.settings.enableSuggestible = false;
			injector.ProcessDruggedDrink(alice as never);
			expect(injector.suggestibleLevel).toBe(0);
			injector.settings.enableSuggestible = true;
			injector.ProcessDruggedDrink(alice as never);
			expect(injector.suggestibleLevel).toBeGreaterThan(0);
			const after = injector.suggestibleLevel;
			injector.InjectSuggestible(alice as never, "ItemArms" as never);
			expect(injector.suggestibleLevel).toBeGreaterThan(after);
		});

		it("DoseDrug (the public API path) knows it", () => {
			expect(injector.DoseDrug("suggestible", { multiplier: 1 })).toBe(true);
			expect(injector.GetDrugLevel("suggestible")).toBeGreaterThan(0);
			injector.settings.enableSuggestible = false;
			expect(injector.DoseDrug("suggestible", { multiplier: 1 })).toBe(false);
		});

		it("a gas device and a soaked item both carry it", () => {
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemMouth" }), { Name: "BallGag" }), { Craft: { Name: "Compliance-soaked Gag", Description: "", MemberNumber: 2 } }));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(injector.suggestibleLevel).toBeGreaterThan(0);
			const soaked = injector.suggestibleLevel;
			injector.ApplyBreathDoses(injector.GetDrugTypes({ Name: "Intoxicating Mist", Description: "", MemberNumber: 2 } as never), 2);
			expect(injector.suggestibleLevel).toBeGreaterThan(soaked);
		});

		it("decays, and an antidote or safeword clears it", () => {
			injector.suggestibleLevel = 100;
			injector.BuiltInCooldown("suggestible");
			expect(injector.suggestibleLevel).toBeLessThan(100);
			injector.DoCure();
			expect(injector.suggestibleLevel).toBe(0);
		});

		it("shows up as a green bar for other players", () => {
			injector.suggestibleLevel = 100;
			const bars = injector.EstimatedBars(player() as never);
			expect(bars.find(b => b.type === "suggestible")).toMatchObject({ level: 100 });
			expect(injector.DecayRatesPerSec().suggestible).toBeGreaterThan(0);
		});
	});

	describe("urges", () => {
		it("nothing below the minimum, however nicely asked", () => {
			injector.suggestibleLevel = full() * (SUGGESTIBLE_URGE.MIN_FRACTION - 0.05);
			expect(ask("Sera, would you kindly dance")).toBe(false);
			expect(sent.local()).toEqual([]);
		});

		it("a strong urge in the middle, when the roll allows", () => {
			injector.suggestibleLevel = full() * 0.6;
			seedRandom([0.1]);
			expect(ask("Sera, would you kindly dance")).toBe(true);
			expect(sent.local().at(-1)).toContain("You have a strong urge to \"dance\".");
		});

		describe("the bell", () => {
			beforeEach(() => { g.AudioPlaySoundEffect.mockClear(); g.AudioShouldSilenceSound.mockReturnValue(false); });
			afterEach(() => { g.AudioShouldSilenceSound.mockReturnValue(true); });

			it("rings the suggestion bell with the urge", () => {
				injector.suggestibleLevel = full();
				expect(ask("Sera, would you kindly dance")).toBe(true);
				expect(g.AudioPlaySoundEffect).toHaveBeenLastCalledWith("BellMedium");
			});

			it("stays quiet when sounds are silenced", () => {
				g.AudioShouldSilenceSound.mockReturnValue(true);
				injector.suggestibleLevel = full();
				expect(ask("Sera, would you kindly dance")).toBe(true);
				expect(g.AudioPlaySoundEffect).not.toHaveBeenCalled();
			});

			it("no bell when no urge is felt", () => {
				injector.suggestibleLevel = 0;
				expect(ask("Sera, would you kindly dance")).toBe(false);
				expect(g.AudioPlaySoundEffect).not.toHaveBeenCalled();
			});
		});

		it("swaps \"me\" for the speaker's name in what is shown, not in what extensions receive", () => {
			injector.suggestibleLevel = full();
			const seen: { phrase: string }[] = [];
			const off = api.events.on("drug.suggestionUrge", p => seen.push(p));
			expect(ask("Sera, would you kindly bring me a drink")).toBe(true);
			expect(sent.local().at(-1)).toContain('to \"bring Alice a drink\".');
			expect(seen[0].phrase).toBe("bring me a drink");
			off();
		});

		it("only swaps the whole word, every time, whatever the case", () => {
			injector.suggestibleLevel = full();
			expect(ask("Sera, I want you to tell ME something and give me more")).toBe(true);
			expect(sent.local().at(-1)).toContain('"tell Alice something and give Alice more"');
			injector.lastUrgeAt.clear();
			expect(ask("Sera, would you kindly remember the meme")).toBe(true);
			expect(sent.local().at(-1)).toContain('"remember the meme"');
		});

		describe("AboutSpeaker: what the speaker said about themselves, shown about them", () => {
			it.each([
				["HeHim", "bring me my phone, it's mine", "bring Locke his phone, it's his"],
				["SheHer", "bring me my phone, it's mine", "bring Locke her phone, it's hers"],
				["TheyThem", "bring me my phone, it's mine", "bring Locke their phone, it's theirs"],
				["HeHim", "tell me what I think of myself", "tell Locke what he think of himself"],
				["SheHer", "tell me what I think of myself", "tell Locke what she think of herself"],
				["TheyThem", "tell me what I think of myself", "tell Locke what they think of themself"],
				["HeHim", "wait until I'm ready, I'll come and I've seen I'd go", "wait until he's ready, he'll come and he's seen he'd go"],
				["SheHer", "wait until I'm ready, I'll come and I've seen I'd go", "wait until she's ready, she'll come and she's seen she'd go"],
				["TheyThem", "wait until I'm ready, I'll come and I've seen I'd go", "wait until they're ready, they'll come and they've seen they'd go"],
				["HeHim", "stay while I am here", "stay while he is here"],
				["TheyThem", "stay while I am here", "stay while they are here"],
				["SheHer", "wait until I’m ready", "wait until she's ready"],
			])("%s: %j", (pronouns, said, shown) => {
				expect(InjectorModule.AboutSpeaker(said, "Locke", pronouns)).toBe(shown);
			});

			it("leaves other words alone, whatever the case, and unknown pronouns read as they", () => {
				expect(InjectorModule.AboutSpeaker("remember the meme, my mine mighty mythic, Mia", "Locke", "SheHer")).toBe("remember the meme, her hers mighty mythic, Mia");
				expect(InjectorModule.AboutSpeaker("ME and MY and i and I", "Locke", "HeHim")).toBe("Locke and his and he and he");
				expect(InjectorModule.AboutSpeaker("my way", "Locke")).toBe("their way");
				expect(InjectorModule.AboutSpeaker("kneel", "Locke", "SheHer")).toBe("kneel");
			});

			it("never swaps what a swap just produced, even a name that is itself a swap word", () => {
				expect(InjectorModule.AboutSpeaker("hug me and I", "My", "SheHer")).toBe("hug My and she");
			});

			it("the urge line uses the speaker's own pronouns", () => {
				injector.suggestibleLevel = full();
				alice.flags.pronouns = "HeHim";
				expect(ask("Sera, would you kindly bring me my phone")).toBe(true);
				expect(sent.local().at(-1)).toContain('"bring Alice his phone"');
				injector.lastUrgeAt.clear();
				alice.flags.pronouns = "TheyThem";
				expect(ask("Sera, would you kindly say I am sorry")).toBe(true);
				expect(sent.local().at(-1)).toContain('"say they are sorry"');
				alice.flags.pronouns = "SheHer";
			});
		});

		it("a faint urge near the minimum, and not when the roll fails", () => {
			injector.suggestibleLevel = full() * 0.3;
			seedRandom([0.9]);
			expect(ask("Sera, would you kindly dance")).toBe(false);
			seedRandom([0.1]);
			expect(ask("Sera, would you kindly dance")).toBe(true);
			expect(sent.local().at(-1)).toContain("You feel a faint urge to \"dance\".");
		});

		it("always felt at the top of the bar", () => {
			injector.suggestibleLevel = full();
			seedRandom([0.99]);
			expect(ask("Sera, would you please: spin around")).toBe(true);
			expect(sent.local().at(-1)).toContain("An overwhelming urge washes over you to \"spin around\".");
		});

		it("the same speaker can't stir another urge straight away", () => {
			injector.suggestibleLevel = full();
			expect(ask("Sera, would you kindly dance")).toBe(true);
			expect(ask("Sera, would you kindly sing")).toBe(false);
			vi.setSystemTime(Date.now() + SUGGESTIBLE_URGE.SENDER_COOLDOWN_MS + 1);
			expect(ask("Sera, would you kindly sing")).toBe(true);
		});

		it("only for other people's requests, while enabled and opted in", () => {
			injector.suggestibleLevel = full();
			expect(injector.SuggestibleUrge("Sera, would you kindly dance", player() as never)).toBe(false);
			expect(injector.SuggestibleUrge("Sera, would you kindly dance", null)).toBe(false);
			injector.settings.enableSuggestible = false;
			expect(ask("Sera, would you kindly dance")).toBe(false);
			injector.settings.enableSuggestible = true;
			injector.settings.enabled = false;
			expect(ask("Sera, would you kindly dance")).toBe(false);
			expect(sent.local()).toEqual([]);
		});

		it("tells extensions", () => {
			injector.suggestibleLevel = full();
			const seen: unknown[] = [];
			const off = api.events.on("drug.suggestionUrge", p => seen.push(p));
			expect(ask("Sera, would you kindly dance")).toBe(true);
			expect(seen).toEqual([{ sender: 2, phrase: "dance", level: full(), max: full() }]);
			off();
		});
	});
});
