// SpeechReactionEngine: the wearer's own configured reaction rules (applyState /
// removeState / outfit / shock / orgasm), fired off SpeechAnalysisModule's analysis
// stream. Ported from the pre-Vitest standalone suite (test/speech-analysis/test.ts,
// now removed), which drove this against a hand-rolled FakeState/fake-StateModule --
// this version boots the *real* StateModule/HypnoModule/OutfitCollectionModule so the
// reactions exercise real state Activate/Recover and a real outfit-collection lookup.
// Assertions check observable effects (state.Active, Player.Appearance, sent emotes)
// rather than internal call logs, since those no longer exist on the real classes.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { defaultSpeechReactions, sanitizeRemoteSpeechSettings } from "Settings/Models/speech-analysis";
import { StripLevel } from "Settings/Models/cursed-item";
import { OutfitOption } from "Settings/Models/magic";
import { replace_template } from "utils";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem } from "../harness/fixtures";
import { sent } from "../harness/room";
import { driveSpeechAnalysis, type SpeechDriver } from "../harness/speech";

describe("SpeechReactionEngine", () => {
	let speech: SpeechAnalysisModule;
	let states: StateModule;
	let outfits: OutfitCollectionModule;
	let driver: SpeechDriver;

	beforeAll(() => {
		[, , states, outfits, speech] = boot(new CoreModule(), new HypnoModule(), new StateModule(), new OutfitCollectionModule(), new SpeechAnalysisModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1,
			Nickname: "Sera",
			LSCG: { GlobalModule: { enabled: true }, MagicModule: { allowOutfitToChangeNeckItems: false } },
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).PropertyShockPublishAction.mockClear();
		(globalThis as any).ActivityOrgasmPrepare.mockClear();
		// resetWorld() replaces Player.LSCG wholesale; re-register each module's settings
		// storage on it before touching Player.LSCG.<Module> directly (as OutfitCollection's
		// `strategy` getter and SetOutfitCode() do) rather than through a module's own
		// `.settings` getter, which would lazily create it itself.
		states.init();
		outfits.init();

		const cloth = makeGroup({ Name: "Cloth", Category: "Appearance", AllowNone: true, Clothing: true });
		const mouth = makeGroup({ Name: "ItemMouth" });
		makeAsset(cloth, { Name: "MaidOutfit1" });
		makeAsset(mouth, { Name: "BallGag" });
		outfits.data.SetOutfitCode("maid", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit1" }]), undefined, false);
		outfits.data.SetOutfitCode("maid-with-gag", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit1" }, { Group: "ItemMouth", Name: "BallGag" }]), undefined, false);

		driver = driveSpeechAnalysis(speech);
		speech.settings.enabled = true;
		speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
		driver.reset();
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	function worn(): string {
		return player().Appearance.map(i => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort().join(",");
	}

	it("every default reaction rule starts off", () => {
		expect(defaultSpeechReactions().every(r => !r.enabled)).toBe(true);
	});

	it("with fresh (default, all-off) settings, no reactions fire", () => {
		driver.say("I'm so worthless");
		driver.say("fuck");
		expect(sent.actions()).toEqual([]);
	});

	describe("applyState / removeState", () => {
		beforeEach(() => {
			speech.settings.reactions = [
				{ enabled: true, detection: "negative", action: "applyState", state: "denied", cooldownMs: 10_000 },
				{ enabled: true, detection: "positive", action: "removeState", state: "denied", cooldownMs: 10_000 },
				{ enabled: true, detection: "profanity", action: "applyState", state: "gagged", durationMs: 60_000, cooldownMs: 10_000 },
			];
		});

		it("negative tone applies the denied state, by the player, with its apply emote", () => {
			driver.say("I'm so worthless");
			expect(states.DeniedState.Active).toBe(true);
			expect(states.settings.states.find(s => s.type === "denied")?.activatedBy).toBe(1);
			expect(sent.actions()[0]).toBe(emote("%NAME% whimpers as %POSSESSIVE% own words bring on an impending denial."));
		});

		it("positive tone removes an active denied state without the generic 'wears off' emote", () => {
			driver.say("I'm so worthless");
			vi.advanceTimersByTime(20_000);
			driver.say("I am amazing");
			expect(states.DeniedState.Active).toBe(false);
			expect(sent.actions().at(-1)).toBe(emote("%NAME% sighs in relief as %POSSESSIVE% words lift the looming denial."));
		});

		it("profanity applies the gagged state for the configured duration", () => {
			driver.say("fuck");
			expect(states.GaggedState.Active).toBe(true);
			expect(states.settings.states.find(s => s.type === "gagged")?.duration).toBe(60_000);
			expect(sent.actions().at(-1)).toBe(emote("%NAME%'s mouth keeps moving, but after those words not a single sound escapes."));
		});

		describe("a repeat fire while a timed state is still running", () => {
			const denied = () => states.settings.states.find(s => s.type === "denied")!;
			const timedRule = (durationMs?: number) => [{ enabled: true, detection: "negative" as const, action: "applyState" as const, state: "denied" as const, durationMs, cooldownMs: 0 }];

			beforeEach(() => {
				speech.settings.reactions = timedRule(60_000);
			});

			it("restarts the timer instead of letting the first one run out", () => {
				driver.say("I'm so worthless");
				const first = denied().activatedAt;
				vi.advanceTimersByTime(40_000);
				const actionsBefore = sent.actions().length;
				driver.say("I'm so worthless");
				expect(denied().activatedAt).toBeGreaterThan(first);
				expect(denied().duration).toBe(60_000);
				expect(sent.actions().length).toBe(actionsBefore);
				vi.advanceTimersByTime(40_000);
				states.DeniedState.Tick(Date.now());
				expect(states.DeniedState.Active).toBe(true);
				vi.advanceTimersByTime(30_000);
				states.DeniedState.Tick(Date.now());
				expect(states.DeniedState.Active).toBe(false);
			});

			it("tells only the wearer, locally, that the effect was renewed", () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const local = (globalThis as any).ChatRoomSendLocal as ReturnType<typeof vi.fn>;
				driver.say("I'm so worthless");
				local.mockClear();
				const actionsBefore = sent.actions().length;
				vi.advanceTimersByTime(40_000);
				driver.say("I'm so worthless");
				expect(local).toHaveBeenCalledTimes(1);
				expect(local.mock.calls[0][0]).toContain("Your words renew the denied state: it now lasts 1 min from now.");
				expect(sent.actions().length).toBe(actionsBefore);
				// a fire that changes nothing says nothing
				local.mockClear();
				speech.settings.reactions = timedRule(10_000);
				driver.say("I'm so worthless");
				expect(local).not.toHaveBeenCalled();
			});

			it("never shortens a longer remaining time", () => {
				speech.settings.reactions = timedRule(120_000);
				driver.say("I'm so worthless");
				const before = { at: denied().activatedAt, duration: denied().duration };
				vi.advanceTimersByTime(10_000);
				speech.settings.reactions = timedRule(30_000);
				driver.say("I'm so worthless");
				expect({ at: denied().activatedAt, duration: denied().duration }).toEqual(before);
			});

			it("leaves a state the engine didn't apply, and one that was re-applied since, alone", () => {
				states.DeniedState.Activate(2, 60_000);
				const external = denied().activatedAt;
				vi.advanceTimersByTime(30_000);
				driver.say("I'm so worthless");
				expect(denied().activatedAt).toBe(external);
				expect(denied().activatedBy).toBe(2);

				states.DeniedState.Recover(false);
				driver.say("I'm so worthless");
				vi.advanceTimersByTime(30_000);
				states.DeniedState.Activate(2, 60_000);
				const reapplied = denied().activatedAt;
				vi.advanceTimersByTime(30_000);
				driver.say("I'm so worthless");
				expect(denied().activatedAt).toBe(reapplied);
				expect(denied().activatedBy).toBe(2);
			});

			it("doesn't turn an open-ended state into a timed one, or extend with an open-ended rule", () => {
				states.DeniedState.Activate(1, undefined);
				driver.say("I'm so worthless");
				expect(denied().duration).toBeFalsy();
				states.DeniedState.Recover(false);
				speech.settings.reactions = timedRule(undefined);
				driver.say("I'm so worthless");
				vi.advanceTimersByTime(1000);
				const at = denied().activatedAt;
				driver.say("I'm so worthless");
				expect(denied().activatedAt).toBe(at);
			});
		});

		it("a rule blocked by its own cooldown does not re-fire", () => {
			driver.say("I'm so worthless");
			expect(states.DeniedState.Active).toBe(true);
			states.DeniedState.Recover(false);
			vi.advanceTimersByTime(1000);
			driver.say("I'm so worthless");
			expect(states.DeniedState.Active).toBe(false);
		});

		it("re-fires once the cooldown has elapsed", () => {
			driver.say("I'm so worthless");
			states.DeniedState.Recover(false);
			vi.advanceTimersByTime(10_000);
			driver.say("I'm so worthless");
			expect(states.DeniedState.Active).toBe(true);
		});
	});

	describe("trance and outfit reactions", () => {
		beforeEach(() => {
			speech.settings.reactions = [
				{ enabled: true, detection: "negative", action: "applyState", state: "hypnotized", durationMs: 120_000, cooldownMs: 0 },
				{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", durationMs: 300_000, cooldownMs: 0 },
				{ enabled: true, detection: "positive", action: "removeState", state: "redressed", cooldownMs: 0 },
			];
		});

		it("negative tone applies hypnotized with the configured duration and its trance emote", () => {
			driver.say("I'm so worthless");
			expect(states.HypnoState.Active).toBe(true);
			expect(states.settings.states.find(s => s.type === "hypnotized")?.duration).toBe(120_000);
			expect(sent.actions()[0]).toBe(emote("%NAME%'s eyes glaze over as %POSSESSIVE% own words pull %INTENSIVE% down into a deep trance."));
		});

		it("profanity applies the configured outfit through the redressed state", () => {
			driver.say("fuck");
			expect(states.RedressedState.Active).toBe(true);
			expect(worn()).toBe("Cloth:MaidOutfit1");
			expect(sent.actions().at(-1)).toContain("clothing shimmers and morphs");
		});

		it("the same outfit again while it's running only restarts the timer, with a local notice and no public emote", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const local = (globalThis as any).ChatRoomSendLocal as ReturnType<typeof vi.fn>;
			const cfg = () => states.settings.states.find(s => s.type === "redressed")!;
			driver.say("fuck");
			const first = cfg().activatedAt;
			const actionsBefore = sent.actions().length;
			local.mockClear();
			vi.advanceTimersByTime(100_000);
			driver.say("fuck");
			expect(cfg().activatedAt).toBeGreaterThan(first);
			expect(cfg().duration).toBe(300_000);
			expect(worn()).toBe("Cloth:MaidOutfit1");
			expect(sent.actions().length).toBe(actionsBefore);
			expect(local).toHaveBeenCalledTimes(1);
			expect(local.mock.calls[0][0]).toContain("Your words renew the redressed state");
		});

		it("a different outfit while one is running is a full switch with the public emote", () => {
			driver.say("fuck");
			const actionsBefore = sent.actions().length;
			speech.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid-with-gag", outfitOption: OutfitOption.clothes_only, durationMs: 300_000, cooldownMs: 0 }];
			vi.advanceTimersByTime(1000);
			driver.say("fuck");
			expect(sent.actions().length).toBe(actionsBefore + 1);
			expect(sent.actions().at(-1)).toContain("clothing shimmers and morphs");
		});

		it("an outfit someone else applied isn't treated as ours to renew", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const local = (globalThis as any).ChatRoomSendLocal as ReturnType<typeof vi.fn>;
			states.RedressedState.Activate(2, 300_000);
			const external = states.settings.states.find(s => s.type === "redressed")!.activatedAt;
			local.mockClear();
			vi.advanceTimersByTime(10_000);
			driver.say("fuck");
			expect(local).not.toHaveBeenCalled();
			expect(states.settings.states.find(s => s.type === "redressed")!.activatedBy).toBe(1);
			expect(states.settings.states.find(s => s.type === "redressed")!.activatedAt).toBeGreaterThan(external);
		});

		it("positive tone removes the redressed state, restoring what was worn before", () => {
			driver.say("fuck");
			expect(worn()).toBe("Cloth:MaidOutfit1");
			driver.say("I am amazing");
			expect(states.RedressedState.Active).toBe(false);
			expect(worn()).toBe("");
			expect(sent.actions().at(-1)).toBe(emote("%NAME%'s clothing shimmers and returns to what %PRONOUN% was wearing before."));
		});

		it("outfitOption filters which items the outfit applies (Clothes Only skips a bind)", () => {
			speech.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid-with-gag", outfitOption: OutfitOption.clothes_only, cooldownMs: 0 }];
			driver.say("fuck");
			expect(worn()).toBe("Cloth:MaidOutfit1");
		});

		it("outfitStrip strips clothing before applying the outfit", () => {
			const dress = makeAsset(makeGroup({ Name: "Dress", Category: "Appearance", AllowNone: true, Clothing: true }), { Name: "Dress" });
			wear(player(), makeItem(dress));
			speech.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitStrip: StripLevel.CLOTHES, cooldownMs: 0 }];
			driver.say("fuck");
			expect(worn()).toBe("Cloth:MaidOutfit1");
		});

		it("an unknown outfit key does nothing", () => {
			speech.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "missing", cooldownMs: 0 }];
			driver.say("fuck");
			expect(worn()).toBe("");
			expect(sent.actions()).toEqual([]);
		});

		it("applyState on a remove-only state (redressed) is ignored", () => {
			speech.settings.reactions = [{ enabled: true, detection: "negative", action: "applyState", state: "redressed", cooldownMs: 0 }];
			driver.say("I'm so worthless");
			expect(states.RedressedState.Active).toBe(false);
		});
	});

	it("the player's own line is sent before any reaction's emote", () => {
		speech.settings.reactions = [{ enabled: true, detection: "negative", action: "applyState", state: "denied", cooldownMs: 0 }];
		driver.say("I'm so worthless");
		const raw = sent.raw();
		const chatIx = raw.findIndex(([type, data]) => type === "ChatRoomChat" && data?.Type === "Chat");
		const actionIx = raw.findIndex(([type, data]) => type === "ChatRoomChat" && data?.Type === "Action");
		expect(chatIx).toBeGreaterThanOrEqual(0);
		expect(actionIx).toBeGreaterThan(chatIx);
	});

	describe("force orgasm", () => {
		beforeEach(() => {
			speech.settings.reactions = [{ enabled: true, detection: "positive", action: "orgasm", cooldownMs: 30_000 }];
		});

		it("positive tone forces an orgasm, with its emote sent first", () => {
			driver.say("I am amazing");
			expect(player().ArousalSettings.Progress).toBe(100);
			expect((globalThis as unknown as { ActivityOrgasmPrepare: { mock: { calls: unknown[] } } }).ActivityOrgasmPrepare.mock.calls).toHaveLength(1);
			expect(sent.actions()[0]).toBe(emote("%NAME%'s words trail off into a helpless moan as %PRONOUN% is pushed over the edge."));
		});

		it("respects its own cooldown", () => {
			driver.say("I am amazing");
			driver.say("I am wonderful");
			expect((globalThis as unknown as { ActivityOrgasmPrepare: { mock: { calls: unknown[] } } }).ActivityOrgasmPrepare.mock.calls).toHaveLength(1);
		});
	});

	describe("remote rule sanitization (outfit/orgasm shape)", () => {
		it("keeps valid outfit option/strip, drops them when invalid, ignores them on a non-outfit rule", () => {
			const rules = sanitizeRemoteSpeechSettings({
				reactions: [
					{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitOption: "Restraints Only", outfitStrip: 7, cooldownMs: 0 },
					{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitOption: "Everything!", outfitStrip: 99, cooldownMs: 0 },
					{ enabled: true, detection: "profanity", action: "shock", outfitOption: "Restraints Only", outfitStrip: 1, cooldownMs: 0 },
				],
			}).reactions!;
			expect(rules.map(r => `${r.outfitOption ?? "-"}:${r.outfitStrip ?? "-"}`)).toEqual(["Restraints Only:7", "-:-", "-:-"]);
		});

		it("accepts an orgasm rule and drops stray fields not valid for it", () => {
			const cleaned = sanitizeRemoteSpeechSettings({ reactions: [{ enabled: true, detection: "profanity", action: "orgasm", cooldownMs: 0, state: "denied", outfitKey: "x" }] });
			expect(cleaned.reactions?.[0]).toEqual({ enabled: true, detection: "profanity", action: "orgasm", cooldownMs: 0 });
		});
	});

	describe("phrase lists drive reactions", () => {
		beforeEach(() => {
			speech.settings.phraseGroups = [
				{ id: "release", name: "Release phrases", phrases: `"may I have my clothes back", please mistress` },
				{ id: "banned", name: "Banned words", phrases: "pizza, darn" },
			];
			speech.settings.reactions = [
				{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", cooldownMs: 0 },
				{ enabled: true, detection: "phrase", phraseGroup: "release", action: "removeState", state: "redressed", cooldownMs: 0 },
				{ enabled: true, detection: "phrase", phraseGroup: "banned", action: "shock", cooldownMs: 0 },
			];
		});

		it("profanity puts the maid outfit on, and a release phrase takes it back off", () => {
			driver.say("fuck this");
			expect(states.RedressedState.Active).toBe(true);
			driver.say("may I have my clothes back please?");
			expect(states.RedressedState.Active).toBe(false);
		});

		it("a banned word shocks a worn shock device", () => {
			const shockUnit = makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "CollarShockUnit" });
			wear(player(), { Asset: shockUnit, Property: { ShockLevel: 1 } });
			driver.say("I love pizza");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const calls = (globalThis as any).PropertyShockPublishAction.mock.calls;
			expect(calls).toHaveLength(1);
			expect(calls[0][1].Asset.Name).toBe("CollarShockUnit");
		});

		it("a banned word with no shock device worn does nothing", () => {
			driver.say("darn");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((globalThis as any).PropertyShockPublishAction.mock.calls).toHaveLength(0);
		});
	});
});
