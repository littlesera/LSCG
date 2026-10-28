// CollarModule's other breathplay paths: the /lscg collar command, gag + nose plug suffocation (CheckGagSuffocate,
// IsNosePlugged, ResetPlugs, ForceReleasePlugs), the choke chain (ChainChoke, CheckChainSuffocate), random choke
// events at each collar level, and the stats readout.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, makeCharacter, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("CollarModule breathplay", () => {
	let collar: CollarModule;
	let injector: InjectorModule;
	let states: StateModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , collar, injector, states] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new CollarModule(), new InjectorModule(), new StateModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera",
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: true, gagChokeEnabled: true, handChokeEnabled: true } },
		});
		injector.init();
		states.init();
		collar.init();
		collar.settings.enabled = true;
		collar.settings.breathplayEnabled = true;
		collar.settings.collar = {} as never;
		collar.handChokeModifier = 0;
		collar.chainChokeModifier = 0;
		collar.isPluggedUp = false;
		collar.isPassingOut = false;
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNeck" }), { Name: "PlainCollar" })));
	});

	afterEach(() => {
		vi.clearAllTimers();
		restoreRandom();
	});

	const lastAction = () => sent.actions().at(-1) ?? "";

	describe("/lscg collar", () => {
		const run = (...parsed: string[]) => collar.commands[0].Action!(parsed.join(" "), "", parsed);

		it("refuses without a configured collar", () => {
			player().Appearance = [];
			run("tight");
			expect(sent.local().at(-1)).toContain("not wearing a properly configured collar");
		});

		it("shows usage with no argument", () => {
			run();
			expect(sent.local().at(-1)).toContain("[tight/loose/stat]");
		});

		it("routes tight / loose / stat to the collar's buttons", () => {
			const tight = vi.spyOn(collar, "TightenButtonPress").mockImplementation(() => {});
			const loose = vi.spyOn(collar, "LoosenButtonPress").mockImplementation(() => {});
			const stat = vi.spyOn(collar, "StatsButtonPress").mockImplementation(() => {});
			run("tighten"); run("loose"); run("stats"); run("nonsense");
			expect([tight, loose, stat].map(s => s.mock.calls.length)).toEqual([1, 1, 1]);
			[tight, loose, stat].forEach(s => s.mockRestore());
		});
	});

	describe("nose plugs", () => {
		const nose = (name: string, extra = {}) => wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNose" }), { Name: name }), extra));

		it("knows which nose items block air", () => {
			expect(collar.IsNosePlugged).toBe(false);
			nose("NoseRing");
			expect(collar.IsNosePlugged).toBe(false);
			nose("NosePlugs");
			expect(collar.IsNosePlugged).toBe(true);
			nose("NoseClip", { Craft: { Name: "Clip", Description: "breathable" } });
			expect(collar.IsNosePlugged).toBe(false);
			nose("DuctTape", { Craft: { Name: "Tape", Description: "sticky" } });
			expect(collar.IsNosePlugged).toBe(true);
		});

		it("ForceReleasePlugs removes them", () => {
			nose("NosePlugs");
			collar.isPluggedUp = true;
			collar.ForceReleasePlugs();
			expect(collar.IsNosePlugged).toBe(false);
			expect(collar.isPluggedUp).toBe(false);
		});
	});

	describe("CheckGagSuffocate", () => {
		beforeEach(() => wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNose" }), { Name: "NosePlugs" }))));
		const gagLevel = (n: number) => g.SpeechGetTotalGagLevel.mockReturnValue(n);
		afterEach(() => g.SpeechGetTotalGagLevel.mockReturnValue(0));

		it("does nothing with gag choking off", () => {
			player().LSCG.MiscModule.gagChokeEnabled = false;
			gagLevel(10);
			collar.CheckGagSuffocate("", null);
			expect(collar.isPluggedUp).toBe(false);
		});

		it("a full gag with the nose plugged starts a passout", () => {
			gagLevel(8);
			collar.CheckGagSuffocate("", alice as never);
			expect(collar.isPluggedUp).toBe(true);
			expect(collar.isPassingOut).toBe(true);
			expect(collar.totalChokeLevel).toBe(4);
			expect(lastAction()).toContain("unable to get any air");
		});

		it("a pump or pony gag chokes a level earlier, and an inflating pump gag says so", () => {
			gagLevel(7);
			collar.CheckGagSuffocate("ItemMouthPonyGag", null);
			expect(collar.isPluggedUp).toBe(true);
			collar.isPluggedUp = false; collar.isPassingOut = false;
			collar.CheckGagSuffocate("PumpGagpumpsTo PumpInflate", null);
			expect(sent.actions().some(a => a.includes("gag inflates to completely fill"))).toBe(true);
		});

		it("easing the gag ends the passout, or just gasps when still mostly gagged", () => {
			gagLevel(8);
			collar.CheckGagSuffocate("", null);
			gagLevel(6);
			collar.CheckGagSuffocate("", null);
			expect(collar.isPluggedUp).toBe(false);
			expect(collar.isPassingOut).toBe(false);

			collar.isPluggedUp = true;
			collar.CheckGagSuffocate("", null);
			expect(lastAction()).toContain("splutters and gasps for air around");
		});
	});

	describe("ResetPlugs", () => {
		it("restores the expression from before the passout and stops it", () => {
			collar.isPassingOut = true;
			collar.ResetPlugs();
			expect(collar.isPassingOut).toBe(false);
			expect(sent.actions()).toHaveLength(1);
		});
	});

	describe("ChainChoke", () => {
		it("does nothing with the chain off, without someone choking, or past its limits", () => {
			player().LSCG.MiscModule.chokeChainEnabled = false;
			collar.ChainChoke(alice as never, 1);
			player().LSCG.MiscModule.chokeChainEnabled = true;
			collar.ChainChoke(null, 1);
			collar.ChainChoke(alice as never, -1);
			expect(collar.chainChokeModifier).toBe(0);
			expect(sent.actions()).toEqual([]);
		});

		it("tightens a level at a time, leashing the chain, up to a passout", () => {
			const chain = wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "ChokeChain" }), { Property: { Effect: [] } }));
			collar.ChainChoke(alice as never, 1);
			expect(lastAction()).toContain("eyes flutter");
			expect(chain.Property?.Effect).toContain("IsLeashed");
			collar.ChainChoke(alice as never, 1);
			expect(lastAction()).toContain("gasps for air");
			collar.ChainChoke(alice as never, 1);
			expect(lastAction()).toContain("face runs flush");
			collar.ChainChoke(alice as never, 1);
			expect(collar.isPassingOut).toBe(true);
			collar.ChainChoke(alice as never, 1);
			expect(collar.chainChokeModifier).toBe(4);
		});

		it("loosens a level at a time, unleashing the chain once free", () => {
			const chain = wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "ChokeChain" }), { Property: { Effect: ["IsLeashed"] } }));
			collar.chainChokeModifier = 4;
			const expected = ["releases", "struggles for air", "gulps in air", "takes a deep breath"];
			for (const text of expected) {
				collar.ChainChoke(alice as never, -1);
				expect(lastAction()).toContain(text);
			}
			expect(chain.Property?.Effect).not.toContain("IsLeashed");
		});

		it("CheckChainSuffocate fully loosens a chain that's been taken off", () => {
			collar.chainChokeModifier = 3;
			collar.CheckChainSuffocate("", alice as never);
			expect(collar.chainChokeModifier).toBe(0);
			collar.chainChokeModifier = 2;
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemNeckRestraints" }), { Name: "ChokeChain" })));
			collar.CheckChainSuffocate("", alice as never);
			expect(collar.chainChokeModifier).toBe(2);
		});
	});

	describe("choke events", () => {
		it("fire every time at level 3, and only sometimes lower", () => {
			collar.settings.chokeLevel = 3;
			collar.ChokeEvent();
			expect(sent.actions()).toHaveLength(1);

			collar.settings.chokeLevel = 2;
			seedRandom([0.5]);
			collar.ChokeEvent();
			expect(sent.actions()).toHaveLength(1);
			seedRandom([0, 0]);
			collar.ChokeEvent();
			expect(sent.actions()).toHaveLength(2);

			collar.settings.chokeLevel = 1;
			seedRandom([0, 0]);
			collar.ChokeEvent();
			expect(sent.actions()).toHaveLength(3);
		});

		it("never fire without the collar", () => {
			player().Appearance = [];
			collar.settings.chokeLevel = 3;
			collar.ChokeEvent();
			expect(sent.actions()).toEqual([]);
		});

		it("say nothing at level 0", () => {
			collar.settings.chokeLevel = 0;
			collar.ActivateChokeEvent();
			expect(sent.actions()).toEqual([]);
		});
	});

	it("IncreaseArousal adds 10, capped at 99", () => {
		player().ArousalSettings.Progress = 95;
		collar.IncreaseArousal();
		expect(g.ActivitySetArousal).toHaveBeenCalledWith(player(), 99);
	});

	describe("StatsButtonPress", () => {
		it("reads out the level, cycles, triggers and remote access", () => {
			Object.assign(collar.settings, { chokeLevel: 2, tightTrigger: "tighten", looseTrigger: "loosen", remoteAccess: false });
			collar.settings.stats.collarPassoutCount = 3;
			collar.StatsButtonPress(player() as never);
			vi.advanceTimersByTime(1500);
			expect(lastAction()).toMatch(/Current Level: 2[\s\S]*Corrective Cycles: 3[\s\S]*Remote Access: DISABLED/);
		});

		it("says remote access is limited with allowed members", () => {
			Object.assign(collar.settings, { remoteAccess: true, allowedMembers: "5" });
			collar.StatsButtonPress(player() as never);
			vi.advanceTimersByTime(1500);
			expect(lastAction()).toContain("Remote Access: LIMITED");
			collar.settings.allowedMembers = "";
			collar.StatsButtonPress(player() as never);
			vi.advanceTimersByTime(1500);
			expect(lastAction()).toContain("Remote Access: ENABLED");
		});
	});

	it("safeword resets every kind of choke", () => {
		collar.settings.chokeLevel = 3;
		collar.handChokeModifier = 2;
		collar.safeword();
		expect(collar.handChokeModifier).toBe(0);
		expect(collar.settings.chokeLevel).toBe(0);
	});
});
