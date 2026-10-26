// MiscModule's chloroform state machine (wearing the cloth -> two warning stages -> passing
// out into SleepState; removing it -> two waking stages -> recovery; wearing off over time;
// re-dosing while wearing off) and net gun firing (self / other / chaotic shots, the
// chaotic target pick, crafted vs default nets, and the netting stats).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { MiscModule } from "Modules/misc";
import { CHLOROFORM_TIMING } from "constants/timing";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { seedRandom, restoreRandom, timerProcess } from "../harness/time";
import { sent } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("MiscModule", () => {
	let misc: MiscModule;
	let states: StateModule;

	beforeAll(() => {
		// LeashingModule: HandCloroMemberNumber reads its Pairings. StateModule: passing out is SleepState.
		[, , states, misc] = boot(new CoreModule(), new LeashingModule(), new StateModule(), new MiscModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		misc.init();
		misc.isChloroformed = false;
		misc.chloroformWearingOff = false;
		misc.passoutTimer = 0;
		misc.awakenTimeout = 0;
		misc.settings.chloroformEnabled = true;
		vi.stubGlobal("InventoryCraft", vi.fn());
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.unstubAllGlobals();
		restoreRandom();
	});

	describe("chloroform", () => {
		const mouth = (n = "ItemMouth") => makeGroup({ Name: n });
		const wearCloth = (group = "ItemMouth") => wear(player(), makeItem(makeAsset(mouth(group), { Name: "ChloroformCloth" })));
		const lastAction = () => sent.actions().at(-1) ?? "";

		it("counts the cloths being worn", () => {
			expect(misc.IsWearingChloroform()).toBe(false);
			wearCloth("ItemMouth");
			wearCloth("ItemMouth3");
			expect(misc.IsWearingChloroform()).toBe(true);
			expect(misc.NumberChloroform()).toBe(2);
		});

		it("does nothing while disabled", () => {
			misc.settings.chloroformEnabled = false;
			wearCloth();
			misc.CheckForChloro();
			expect(sent.actions()).toEqual([]);
		});

		it("passes out in stages after the cloth goes on", () => {
			wearCloth();
			misc.CheckForChloro();
			expect(lastAction()).toContain("eyes go wide");
			expect(sent.local().at(-1)).toContain("you will pass out");

			vi.advanceTimersByTime(CHLOROFORM_TIMING.PASSOUT_STAGE_1);
			expect(lastAction()).toContain("takes a desparate gasp");
			vi.advanceTimersByTime(CHLOROFORM_TIMING.PASSOUT_STAGE_2);
			expect(lastAction()).toContain("body trembles");
			vi.advanceTimersByTime(CHLOROFORM_TIMING.PASSOUT_FINAL);

			expect(misc.isChloroformed).toBe(true);
			expect(misc.passoutTimer).toBe(0);
			expect(misc.settings.chloroformedAt).toBeGreaterThan(0);
			expect(states.SleepState.Active).toBe(true);
		});

		it("doesn't restart while already on its way", () => {
			wearCloth();
			misc.CheckForChloro();
			misc.CheckForChloro();
			expect(sent.actions()).toHaveLength(1);
		});

		it("removing the cloth before passing out just lets them breathe", () => {
			wearCloth();
			misc.CheckForChloro();
			player().Appearance = [];
			misc.CheckForChloro();
			expect(lastAction()).toContain("gulps in fresh air");
			expect(misc.passoutTimer).toBe(0);
			vi.advanceTimersByTime(60_000);
			expect(states.SleepState.Active).toBe(false);
		});

		it("removing the cloth after passing out wakes them in stages", () => {
			wearCloth();
			misc.CheckForChloro();
			vi.advanceTimersByTime(CHLOROFORM_TIMING.PASSOUT_STAGE_1 + CHLOROFORM_TIMING.PASSOUT_STAGE_2 + CHLOROFORM_TIMING.PASSOUT_FINAL);
			player().Appearance = [];

			misc.CheckForChloro();
			expect(lastAction()).toContain("continues to sleep peacefully");
			expect(misc.chloroformWearingOff).toBe(true);
			vi.advanceTimersByTime(CHLOROFORM_TIMING.REMOVAL_STAGE_1_REMOVED);
			expect(lastAction()).toContain("starts to stir");
			vi.advanceTimersByTime(CHLOROFORM_TIMING.REMOVAL_STAGE_2);
			expect(lastAction()).toContain("eyes flutter");

			expect(misc.isChloroformed).toBe(false);
			expect(misc.chloroformWearingOff).toBe(false);
			expect(states.SleepState.Active).toBe(false);
		});

		it("wears off once its potency runs out, and a new dose puts them back under", () => {
			// Still wearing it: the same tick also checks for the cloth, and would wake them if it were gone
			wearCloth();
			misc.isChloroformed = true;
			misc.settings.chloroformedAt = Date.now() - CHLOROFORM_TIMING.POTENCY_TIME - 1;
			misc.lastChecked = 0;
			timerProcess();
			expect(lastAction()).toContain("starts to lose its potency");
			expect(misc.chloroformWearingOff).toBe(true);

			misc.AddChloroform();
			expect(lastAction()).toContain("slump limply once more");
			expect(misc.chloroformWearingOff).toBe(false);
			expect(misc.isChloroformed).toBe(true);
		});

		it("never wears off with infinite potency", () => {
			misc.settings.infiniteChloroformPotency = true;
			misc.isChloroformed = true;
			misc.settings.chloroformedAt = 0;
			misc.lastChecked = 0;
			timerProcess();
			expect(sent.actions()).toEqual([]);
		});

		it("a second dose while asleep has its own message", () => {
			misc.isChloroformed = true;
			misc.AddChloroform();
			expect(lastAction()).toContain("another dose of ether");
		});

		it("random events only fire while chloroformed, about 1 in 10", () => {
			misc.ChloroEvent();
			expect(sent.actions()).toEqual([]);
			misc.isChloroformed = true;
			seedRandom([0.5]);
			misc.ChloroEvent();
			expect(sent.actions()).toEqual([]);
			seedRandom([0, 0]);
			misc.ChloroEvent();
			expect(sent.actions()).toHaveLength(1);
		});

		it("syncs the chloroformed state on room join", () => {
			wearCloth();
			g.ChatRoomSync({});
			expect(misc.isChloroformed).toBe(true);
			expect(states.SleepState.Active).toBe(true);
		});
	});

	describe("net gun", () => {
		let target: FixtureCharacter;
		const lastAction = () => sent.actions().at(-1) ?? "";

		beforeEach(() => {
			target = addToRoom(makeCharacter({ MemberNumber: 5, Nickname: "Alice" }));
			makeAsset(makeGroup({ Name: "ItemDevices" }), { Name: "Net" });
			vi.stubGlobal("ChatRoomCharacterDrawlist", [player(), target]);
		});

		it("fires at someone else, then nets them with a default net", () => {
			misc.ShootNetgun(target as never);
			expect(lastAction()).toContain("fires a net at Alice");
			vi.advanceTimersByTime(2000);
			const net = target.Appearance.find(i => i.Asset.Name === "Net") as { Difficulty?: number; Craft?: { Name: string } };
			expect(net.Craft?.Name).toBe("Net Gun Net");
			expect(net.Difficulty).toBe(8);
			expect(lastAction()).toContain("net engulfs Alice");
			expect(misc.settings.stats).toMatchObject({ totalNettingsCount: 1, successfulNettingsCount: 1 });
		});

		it("fires point blank at oneself", () => {
			misc.ShootNetgun(player() as never);
			expect(lastAction()).toContain("point blank");
			vi.advanceTimersByTime(2000);
			expect(player().Appearance.some(i => i.Asset.Name === "Net")).toBe(true);
		});

		it("fires wildly when chaotic, and may hit someone else", () => {
			misc.settings.netgunIsChaotic = true;
			misc.ShootNetgun(target as never);
			expect(lastAction()).toContain("fires a net wildly");
			seedRandom([0, 0]); // a miss, then the first character without a device: the player
			vi.advanceTimersByTime(2000);
			expect(player().Appearance.some(i => i.Asset.Name === "Net")).toBe(true);
			expect(misc.settings.stats).toMatchObject({ totalNettingsCount: 1, successfulNettingsCount: 0 });
		});

		it("does nothing without a target", () => {
			misc.ShootNetgun(null as never);
			expect(sent.actions()).toEqual([]);
		});

		describe("GetChaoticNetTarget", () => {
			it("hits the intended target on a high roll", () => {
				seedRandom([0.9]);
				expect(misc.GetChaoticNetTarget(target as never)).toBe(target);
			});

			it("hits the intended target when everyone else is already in a device", () => {
				seedRandom([0]);
				g.ChatRoomCharacterDrawlist = [];
				expect(misc.GetChaoticNetTarget(target as never)).toBe(target);
			});

			it("picks among those without a device on a miss", () => {
				wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemDevices" }), { Name: "Cage" })));
				seedRandom([0, 0.99]);
				expect(misc.GetChaoticNetTarget(player() as never)).toBe(target);
			});
		});

		describe("crafted nets", () => {
			const holdNetgun = (name: string, memberNumber = 1) => wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "MedicalInjector" }),
				{ Craft: { Name: name, Description: "", MemberNumber: memberNumber } }));

			it("uses a net the player crafted whose name the net gun mentions", () => {
				holdNetgun("Net gun loaded with Sticky Web");
				g.Player.Crafting = [null, { Item: "Rope", Name: "Sticky Web" }, { Item: "Net", Name: "Sticky Web", DifficultyFactor: 3 }];
				expect(misc.GetCraftedNet()).toMatchObject({ Item: "Net", Name: "Sticky Web" });
				misc.ApplyNet(target as never);
				expect(lastAction()).toContain("Sticky Web engulfs Alice");
				expect(g.InventoryCraft).toHaveBeenCalledWith(player(), target, "ItemDevices", expect.objectContaining({ Name: "Sticky Web" }), true);
			});

			it("also looks at nets crafted by whoever made the net gun", () => {
				holdNetgun("Net gun of Spider Silk", 5);
				g.Player.Crafting = [];
				(target as unknown as { Crafting: unknown[] }).Crafting = [{ Item: "Net", Name: "Spider Silk" }];
				expect(misc.GetCraftedNet()?.Name).toBe("Spider Silk");
			});

			it("has no crafted net without a crafted net gun", () => {
				expect(misc.GetCraftedNet()).toBeUndefined();
			});
		});
	});
});
