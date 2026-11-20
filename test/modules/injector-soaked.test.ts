// "<drug>-soaked" mouth, nose and face items: which crafted items count, which drugs they carry (built-in and extension, the same
// resolver gases use), the potency timer, and the gradual dose each beat.
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
import { extensionDrugs } from "api/drugs";
import { SOAKED_ITEMS } from "../../src/constants/timing";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";

describe("InjectorModule soaked items", () => {
	let injector: InjectorModule;
	let states: StateModule;
	let hypno: HypnoModule;

	beforeAll(() => {
		[, , , , injector, hypno, states] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new InjectorModule(), new HypnoModule(), new StateModule(), new ItemUseModule(), new CollarModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		hypno.init();
		injector.init();
		Object.assign(injector.settings, { enabled: true, enableSedative: true, enableMindControl: true, enableHorny: true, enableSoakedItems: true, infiniteSoakPotency: false, soakedAt: {} });
		injector.sedativeLevel = 0;
		injector.mindControlLevel = 0;
		injector.hornyLevel = 0;
	});

	afterEach(() => {
		vi.clearAllTimers();
		restoreRandom();
	});

	const put = (group: string, name: string, craft?: object) =>
		wear(player(), makeItem(makeAsset(makeGroup({ Name: group }), { Name: name }), craft ? { Craft: craft } : {}));
	const soaked = (name: string, description = "") => ({ Name: name, Description: description, MemberNumber: 2 });

	describe("detection", () => {
		it("finds a drug keyword followed by -soaked in a crafted name or description", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			put("ItemNose", "NoseRing", soaked("Cloth", "Sedative-soaked and sticky"));
			const worn = injector.WornSoakedItems;
			expect(worn.map(w => w.Types)).toEqual([["horny"], ["sedative"]]);
		});

		it("laced works as well as soaked, with a space or a hyphen", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-laced Gag"));
			put("ItemNose", "NoseRing", soaked("Cloth", "sedative laced"));
			expect(injector.WornSoakedItems.map(w => w.Types)).toEqual([["horny"], ["sedative"]]);
		});

		it("soak keywords read better than the plain ones: intoxicant-laced, and the plain keywords still work", () => {
			put("ItemMouth", "BallGag", soaked("Intoxicant-laced Gag"));
			expect(injector.WornSoakedItems[0].Types).toEqual(["suggestible"]);
			put("ItemMouth", "BallGag", soaked("Intoxicating-soaked Gag"));
			expect(injector.WornSoakedItems[0].Types).toEqual(["suggestible"]);
			// "intoxicant" on its own is a soak word, not a gas keyword
			expect(injector.GetDrugTypes(soaked("Intoxicant Mist") as never)).toEqual([]);
			expect(injector.GetDrugTypes(soaked("Intoxicating Mist") as never)).toEqual(["suggestible"]);
		});

		it("an extension drug can name its own soak keywords", () => {
			const unregister = extensionDrugs.register({
				id: "test.giddy", source: "test", label: "Giddy", description: "", keywords: ["giddying"], soakKeywords: ["giddy tonic"], options: [], color: "#fff",
				max: 10, tickMs: 6000, decayPerMinute: 1, thresholds: [], spikeChance: 0, onDose: () => { /* no-op */ },
			});
			try {
				put("ItemMouth", "BallGag", soaked("Giddy tonic-laced Gag"));
				expect(injector.WornSoakedItems[0].Types).toEqual(["test.giddy"]);
				put("ItemMouth", "BallGag", soaked("Giddying-soaked Gag"));
				expect(injector.WornSoakedItems[0].Types).toEqual(["test.giddy"]);
				put("ItemMouth", "BallGag", soaked("Giddy tonic Gag"));
				expect(injector.WornSoakedItems).toEqual([]);
			} finally {
				unregister();
			}
		});

		it("also accepts 'soaked in' spelled with a space", () => {
			put("ItemMouth", "BallGag", soaked("Sedative soaked rag"));
			expect(injector.WornSoakedItems).toHaveLength(1);
		});

		it("ignores a plain drug keyword, uncrafted items, and unsoakable slots", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac Gag"));
			put("ItemMouth2", "BallGag");
			put("ItemArms", "Rope", soaked("Sedative-soaked Rope"));
			expect(injector.WornSoakedItems).toEqual([]);
		});

		it("never makes an antidote soaked", () => {
			put("ItemMouth", "BallGag", soaked("Antidote-soaked Gag"));
			expect(injector.WornSoakedItems).toEqual([]);
		});

		it("resolves extension drug keywords like gases do", () => {
			const unregister = extensionDrugs.register({
				id: "test.giggle", source: "test", label: "Giggle", description: "", keywords: ["giggle"], soakKeywords: [], options: [], color: "#fff",
				max: 10, tickMs: 6000, decayPerMinute: 1, thresholds: [], spikeChance: 0, onDose: () => { /* no-op */ },
			});
			try {
				put("ItemMouth", "BallGag", soaked("Giggle-soaked Gag"));
				expect(injector.WornSoakedItems[0].Types).toEqual(["test.giggle"]);
				// the same drug works on a gas device through the plain keyword
				expect(injector.GetDrugTypes(soaked("Giggle Gas") as never)).toEqual(["test.giggle"]);
				expect(injector.GetSoakedDrugTypes(soaked("Giggle Gas") as never)).toEqual([]);
			} finally {
				unregister();
			}
		});
	});

	describe("SoakedDrugEvent", () => {
		it("each beat adds a little of every drug the item is soaked in", () => {
			put("ItemMouth", "BallGag", soaked("Sedative Aphrodisiac-soaked Gag", "Aphrodisiac-soaked and sedative-soaked"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(injector.sedativeLevel).toBeGreaterThan(0);
			expect(injector.hornyLevel).toBeGreaterThan(0);
			expect(injector.mindControlLevel).toBe(0);
			expect(states.SleepState.Active).toBe(false);
		});

		it("says something when a soaked item is first put on, once, and uses soaked wording for big doses", () => {
			put("ItemMouth2", "PantyStuffing", soaked("Aphrodisiac-soaked panties"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(sent.actions()).toHaveLength(1);
			expect(sent.actions()[0]).toContain("bitter-sweet taste");
			injector.SoakedDrugEvent();
			expect(sent.actions()).toHaveLength(1);

			seedRandom([0]);
			injector.SoakedDrugEvent();
			const last = sent.actions().at(-1) ?? "";
			expect(last).not.toContain("device");
			expect(last).not.toContain("bitter-sweet taste");
			expect(last).not.toMatch(/breath/i);
		});

		it("words a nose or face soak as scent, not taste", () => {
			put("ItemHood", "Mask", soaked("Sedative-soaked cloth"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(sent.actions()[0]).toContain("scent");
			expect(sent.actions()[0]).not.toMatch(/taste|tongue/);
			const lines = injector.soakedEmotes("cloth", "ItemNose");
			expect(Object.values(lines).flat().join(" ")).not.toMatch(/taste|tongue|swallow|drool/);
		});

		it("stays quiet on first wear when the player has not opted in to the drug", () => {
			injector.settings.enableHorny = false;
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(sent.actions()).toEqual([]);
		});

		it("builds more gently than the same drug from a gas mask", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			const soakedDose = injector.hornyLevel;
			injector.hornyLevel = 0;
			seedRandom([0.5]);
			injector.ApplyBreathDoses(["horny"], 2);
			const gasDose = injector.hornyLevel;
			expect(soakedDose).toBeGreaterThan(0);
			expect(soakedDose / gasDose).toBeCloseTo(SOAKED_ITEMS.DOSE_FACTOR, 2);
		});

		it("scales with the player's soak strength setting", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.settings.soakedStrength = 30;
			injector.SoakedDrugEvent();
			const base = injector.hornyLevel;
			injector.hornyLevel = 0;
			injector.settings.soakedStrength = 60;
			injector.SoakedDrugEvent();
			expect(injector.hornyLevel / base).toBeCloseTo(2, 2);
		});

		it("respects the player's opt-in for the drug", () => {
			injector.settings.enableHorny = false;
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(injector.hornyLevel).toBe(0);
		});

		it("keeps flavor emotes rare and lets the player turn them off", () => {
			const lines = () => sent.actions().length;
			const emote = () => { injector.BreathEmote("%NAME% shivers."); };
			(injector as any).lastBreathEmote = -Infinity;
			const before = lines();
			emote();
			emote(); // inside the cooldown: silent
			expect(lines() - before).toBe(1);
			injector.settings.drugEmoteMinutes = 0; // no limit: every one gets through
			emote();
			emote();
			expect(lines() - before).toBe(3);
			injector.settings.drugEmotesLocal = true; // local: shown to the player only, not said to the room
			emote();
			expect(lines() - before).toBe(3);
			injector.settings.drugEmotesLocal = false;
			injector.settings.enableDrugEmotes = false;
			emote();
			expect(lines() - before).toBe(3);
			injector.settings.enableDrugEmotes = true;
			injector.settings.drugEmoteMinutes = 4;
		});

		it("does nothing when soaked items are turned off", () => {
			injector.settings.enableSoakedItems = false;
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(injector.hornyLevel).toBe(0);
		});
	});

	describe("potency", () => {
		it("starts when first worn and dries out after the potency time", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(Object.keys(injector.settings.soakedAt)).toHaveLength(1);
			const level = injector.hornyLevel;
			expect(level).toBeGreaterThan(0);

			const key = Object.keys(injector.settings.soakedAt)[0];
			injector.settings.soakedAt[key] = Date.now() - injector.settings.soakedPotencyTime - 1;
			injector.SoakedDrugEvent();
			expect(injector.hornyLevel).toBe(level);
			expect(sent.actions().at(-1)).toContain("dried out");
			// said once
			const count = sent.actions().length;
			injector.SoakedDrugEvent();
			expect(sent.actions()).toHaveLength(count);
		});

		it("never dries when set to infinite", () => {
			injector.settings.infiniteSoakPotency = true;
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			const key = Object.keys(injector.settings.soakedAt)[0];
			injector.settings.soakedAt[key] = 1;
			const before = injector.hornyLevel;
			injector.SoakedDrugEvent();
			expect(injector.hornyLevel).toBeGreaterThan(before);
		});

		it("forgets an item once it is taken off, so a new one starts wet", () => {
			put("ItemMouth", "BallGag", soaked("Aphrodisiac-soaked Gag"));
			seedRandom([0.5]);
			injector.SoakedDrugEvent();
			expect(Object.keys(injector.settings.soakedAt)).toHaveLength(1);
			player().Appearance = [];
			injector.SoakedDrugEvent();
			expect(injector.settings.soakedAt).toEqual({});
		});
	});
});
