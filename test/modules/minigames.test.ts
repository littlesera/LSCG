// The sleepy / brainwash / suggestion minigames as state machines: loading (timer and difficulty, the blur and tint
// hooks), the start delay, play (clicks keeping the bar up, the bar sinking, the resist roll walk-up), winning and
// losing, the end report, and finishing. BC's draw calls are stubbed; only what they're asked to show is checked.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { SleepyMiniGame } from "MiniGames/Sleepy";
import { BrainwashMiniGame } from "MiniGames/Brainwash";
import { SuggestionMiniGame } from "MiniGames/Suggestion";
import { HypnoSuggestion, SuggestionMiniGameOptions } from "Modules/hypno";
import { boot, resetWorld, player } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";
import { seedRandom, restoreRandom } from "../harness/time";
import { rawStub } from "../harness/bc-lite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("minigames", () => {
	let texts: string[];

	beforeAll(() => {
		boot(new CoreModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		vi.setSystemTime(1_000_000);
		texts = [];
		Object.assign(g, { MiniGameVictory: false, MiniGameEnded: false, MiniGameTimer: 0, MiniGameDifficulty: undefined, TimerRunInterval: 100 });
		vi.stubGlobal("DrawText", vi.fn((t: string) => texts.push(t)));
		for (const name of ["DrawRect", "DrawProgressBar", "DrawButton", "SkillProgress", "MiniGameEnd"]) vi.stubGlobal(name, vi.fn());
		vi.stubGlobal("SkillGetLevel", () => 0);
		Object.assign(g.Player, { GraphicsSettings: { AllowBlur: true }, ImmersionSettings: { AllowTints: true } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		restoreRandom();
	});

	const later = (ms: number) => vi.setSystemTime(Date.now() + ms);

	describe("SleepyMiniGame", () => {
		let game: SleepyMiniGame;
		beforeEach(() => { game = new SleepyMiniGame({} as never); });
		afterEach(() => game.Unload());

		it("loads with a base length when no difficulty is given, blurring and tinting the view", () => {
			game.Load();
			expect(game.SleepyChallenge).toBe(5);
			expect(g.MiniGameTimer).toBe(Date.now() + 6000);
			expect(game.IsStartDelay).toBe(true);
			expect(g.Player.GetBlurLevel()).toBe(5);
			expect(g.Player.HasTints()).toBe(true);
			expect(g.Player.GetTints()[0].a).toBeCloseTo(0.1);
			game.Run();
			expect(texts.at(-1)).toBe(game.startText);
		});

		it("a harder game lasts longer", () => {
			g.MiniGameDifficulty = 16;
			game.Load();
			expect(game.SleepyChallenge).toBe(16);
			expect(game.SleepyGameDuration).toBe(6000 + 2000);
		});

		it("the bar sinks unless clicked, and losing closes the eyes", () => {
			g.MiniGameDifficulty = 8; // what MiniGameStart passes in play
			game.Load();
			later(game.StartDelay);
			seedRandom([0.5]);
			while (!g.MiniGameEnded) { later(100); game.Run(); }
			expect(g.MiniGameVictory).toBe(false);
			expect(game.GameFailed).toBe(true);
			expect(rawStub("CharacterSetFacialExpression")).toHaveBeenCalledWith(player(), "Eyes", "Closed");
			game.Run();
			expect(texts.at(-1)).toBe(game.failText);
			later(6000);
			game.Run();
			expect(g.MiniGameEnd).toHaveBeenCalled();
		});

		it("clicking keeps the eyes open until the time runs out, which wins", () => {
			game.Load();
			later(game.StartDelay);
			seedRandom([0.5]);
			while (!g.MiniGameEnded) { later(100); game.Click(); game.Run(); }
			expect(g.MiniGameVictory).toBe(true);
			expect(g.SkillProgress).toHaveBeenCalledWith(player(), "Willpower", 5);
			game.Run();
			expect(texts.at(-1)).toBe(game.successText);
		});

		it("the eyes droop as the bar falls", () => {
			const eyes = (pos: number) => { game.SleepyPosition = pos; game.UpdateEyes(); return rawStub("CharacterSetFacialExpression")!.mock.calls.at(-1)?.[2]; };
			expect([eyes(10), eyes(60), eyes(200), eyes(300)]).toEqual(["Closed", "VeryLewd", "Lewd", "Dazed"]);
		});

		it("the brainwash game is the same game with its own words and tint", () => {
			const brainwash = new BrainwashMiniGame({} as never);
			expect(brainwash.hintText).toContain("focus");
			expect(brainwash.tintColor[0].r).toBe(148);
			expect(brainwash.name).toBe("LSCG_SleepyMiniGame");
		});
	});

	describe("SuggestionMiniGame", () => {
		let module: { MiniGameOptions?: SuggestionMiniGameOptions; GetSuggestionInfluence: ReturnType<typeof vi.fn>; GetResistRoll: ReturnType<typeof vi.fn> };
		let game: SuggestionMiniGame;

		beforeEach(() => {
			const sender = makeCharacter({ MemberNumber: 2, Nickname: "Alice" });
			module = {
				MiniGameOptions: new SuggestionMiniGameOptions(new HypnoSuggestion("Sit"), sender as never, "sit"),
				GetSuggestionInfluence: vi.fn(() => 40),
				GetResistRoll: vi.fn(() => 70),
			};
			game = new SuggestionMiniGame(module as never);
		});
		afterEach(() => game.Unload());

		it("ends at once, as a win, with nothing to resist", () => {
			module.MiniGameOptions = undefined;
			game.Load();
			expect([g.MiniGameEnded, g.MiniGameVictory]).toEqual([true, true]);
		});

		it("takes the influence as its difficulty, blurring and tinting by it", () => {
			game.Load();
			expect(g.MiniGameDifficulty).toBe(40);
			expect(g.Player.GetBlurLevel()).toBe(5);
			later(game.StartDelay);
			expect(g.Player.GetBlurLevel()).toBeCloseTo(12);
			expect(g.Player.GetTints()[0].a).toBeCloseTo(0.7);
			game.Run();
			expect(texts).toContain(module.MiniGameOptions!.hintText);
		});

		it("resisting walks the roll up and wins when it beats the influence", () => {
			game.Load();
			later(game.StartDelay);
			game.Run();
			g.MouseIn.mockImplementation((x: number) => x === 200);
			game.Click();
			g.MouseIn.mockReturnValue(false);
			expect(game.Resisting).toBe(true);
			later(600);
			game.Run();
			expect(texts.at(-1)).toMatch(/^\d+ > 40 \?$/);
			later(700);
			game.Run();
			expect([g.MiniGameEnded, g.MiniGameVictory]).toEqual([true, true]);
			game.Run();
			expect(texts.at(-1)).toBe(module.MiniGameOptions!.successText);
		});

		it("a low roll loses", () => {
			module.GetResistRoll.mockReturnValue(10);
			game.Load();
			later(game.StartDelay);
			game.Resist();
			later(1300);
			game.Run();
			expect(g.MiniGameVictory).toBe(false);
			game.Run();
			expect(texts.at(-1)).toBe(module.MiniGameOptions!.failText);
		});

		it("submitting gives in, with its own message", () => {
			game.Load();
			later(game.StartDelay);
			g.MouseIn.mockImplementation((x: number) => x === 550);
			game.Click();
			g.MouseIn.mockReturnValue(false);
			expect(game.Submitted).toBe(true);
			game.Run();
			expect(texts.at(-1)).toBe(module.MiniGameOptions!.submissionText);
		});

		it("running out of time loses, then finishes after the report", () => {
			game.Load();
			later(game.StartDelay + 10_000);
			game.Run();
			expect([g.MiniGameEnded, g.MiniGameVictory]).toEqual([true, false]);
			later(2500);
			game.Run();
			expect(g.MiniGameEnd).toHaveBeenCalled();
		});
	});
});
