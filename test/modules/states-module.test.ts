// StateModule's cross-cutting hooks: Player.CanTalk/CanWalk/CanInteract/
// CanChangeClothesOn/GetBlindLevel/GetDeafLevel/InventoryGroupIsBlockedForCharacter/
// ChatRoomCanAttemptStand/ChatRoomCanAttemptKneel/CharacterCanKneel/
// PoseCanChangeUnaided restriction gating over "true"|"whenImmersive" x
// immersive on/off, the outgoing speech-block, TimerProcess-driven Tick, and the
// /wake and /sleep commands.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { boot, resetWorld } from "../harness/world";
import { sent } from "../harness/room";

describe("StateModule", () => {
	let states: StateModule;

	beforeAll(() => {
		// LeashingModule: SleepState.Activate() releases any grabs the sleeper is holding.
		[, , states] = boot(new CoreModule(), new LeashingModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	describe("restriction gating (\"true\" always blocks; \"whenImmersive\" only blocks when immersive is on)", () => {
		it("BlindState (Sight=\"true\") blocks GetBlindLevel regardless of immersive", () => {
			expect(globalThis.Player.GetBlindLevel()).toBe(0);
			states.BlindState.Activate(1);
			expect(globalThis.Player.GetBlindLevel()).toBeGreaterThan(0);
			states.settings.immersive = true;
			expect(globalThis.Player.GetBlindLevel()).toBeGreaterThan(0);
		});

		it("DeafState (Hearing=\"true\") blocks GetDeafLevel regardless of immersive", () => {
			expect(globalThis.Player.GetDeafLevel()).toBe(0);
			states.DeafState.Activate(1);
			expect(globalThis.Player.GetDeafLevel()).toBe(4);
		});

		it("FrozenState (Move/Stand/Kneel/Wardrobe/Walk/Speech=\"true\") blocks all of those", () => {
			states.FrozenState.Activate(1);
			expect(globalThis.Player.CanWalk()).toBe(false);
			expect(globalThis.Player.CanChangeClothesOn(globalThis.Player)).toBe(false);
			expect(globalThis.Player.CanInteract()).toBe(false);
			expect(globalThis.Player.CanTalk()).toBe(false);
			expect(globalThis.ChatRoomCanAttemptStand()).toBe(false);
			expect(globalThis.ChatRoomCanAttemptKneel()).toBe(false);
			expect(globalThis.CharacterCanKneel(globalThis.Player)).toBe(false);
			expect(globalThis.InventoryGroupIsBlockedForCharacter(globalThis.Player, "ItemArms")).toBe(true);
			expect(globalThis.PoseCanChangeUnaided(globalThis.Player, "Kneel")).toBe(false);
		});

		it("SleepState's Walk restriction is \"whenImmersive\": only blocks CanWalk once immersive is on", () => {
			states.SleepState.Activate(1, undefined, false);
			expect(globalThis.Player.CanWalk()).toBe(true);
			states.settings.immersive = true;
			expect(globalThis.Player.CanWalk()).toBe(false);
		});

		it("SleepState's Move restriction is \"true\": blocks CanInteract even without immersive", () => {
			states.SleepState.Activate(1, undefined, false);
			expect(globalThis.Player.CanInteract()).toBe(false);
		});

		it("with nothing active, nothing is restricted", () => {
			expect(globalThis.Player.CanTalk()).toBe(true);
			expect(globalThis.Player.CanWalk()).toBe(true);
			expect(globalThis.Player.CanInteract()).toBe(true);
			expect(globalThis.Player.CanChangeClothesOn(globalThis.Player)).toBe(true);
			expect(globalThis.Player.GetBlindLevel()).toBe(0);
			expect(globalThis.Player.GetDeafLevel()).toBe(0);
		});

		it("disabling the module (Enabled false) lifts every restriction", () => {
			states.FrozenState.Activate(1);
			globalThis.Player.LSCG.GlobalModule = { enabled: false } as never;
			expect(globalThis.Player.CanWalk()).toBe(true);
		});
	});

	describe("outgoing speech block", () => {
		it("blocks a plain chat line and swallows the packet when a Speech-restricted state is active", () => {
			states.GaggedState.Activate(1);
			globalThis.ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello there" });
			expect(sent.chats()).toEqual([]);
			expect(sent.actions()).toHaveLength(1);
		});

		it("does not block an OOC line (leading paren)", () => {
			states.GaggedState.Activate(1);
			globalThis.ServerSend("ChatRoomChat", { Type: "Chat", Content: "(ooc note" });
			expect(sent.raw()).toContainEqual(["ChatRoomChat", { Type: "Chat", Content: "(ooc note" }]);
		});

		it("does not block chat when nothing restricts Speech", () => {
			globalThis.ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello there" });
			expect(sent.chats()).toEqual(["hello there"]);
		});
	});

	describe("1s tick via TimerProcess", () => {
		it("ticks every active state roughly once per second, recovering an expired one", () => {
			states.DeniedState.Activate(1, 500);
			vi.advanceTimersByTime(600);
			globalThis.TimerProcess();
			expect(states.DeniedState.Active).toBe(false);
		});

		it("does not tick again inside the same 1s window", () => {
			states.DeniedState.Activate(1, 100);
			globalThis.TimerProcess();
			vi.advanceTimersByTime(150);
			// A second state activated after the first tick, with its own short
			// duration, should NOT be swept by a tick that hasn't come due yet.
			states.GaggedState.Activate(1, 50);
			globalThis.TimerProcess();
			expect(states.GaggedState.Active).toBe(true);
		});
	});

	describe("safeword", () => {
		it("recovers every active state at once", () => {
			states.DeniedState.Activate(1);
			states.GaggedState.Activate(1);
			states.safeword();
			expect(states.DeniedState.Active).toBe(false);
			expect(states.GaggedState.Active).toBe(false);
		});
	});

	describe("/wake and /sleep commands", () => {
		function runCommand(tag: string, args = "") {
			states.commands.find(c => c.Tag === tag)!.Action!(args, "", args ? [args] : []);
		}

		it("/sleep activates SleepState for the given number of minutes (default 10)", () => {
			runCommand("sleep");
			expect(states.SleepState.Active).toBe(true);
			expect(states.settings.states.find(s => s.type === "asleep")?.duration).toBe(10 * 60 * 1000);
		});

		it("/sleep [minutes] uses the given duration", () => {
			runCommand("sleep", "5");
			expect(states.settings.states.find(s => s.type === "asleep")?.duration).toBe(5 * 60 * 1000);
		});

		it("/sleep does nothing if already asleep", () => {
			runCommand("sleep", "5");
			runCommand("sleep", "20");
			expect(states.settings.states.find(s => s.type === "asleep")?.duration).toBe(5 * 60 * 1000);
		});

		it("/wake recovers an active, non-immersive sleep", () => {
			runCommand("sleep");
			runCommand("wake");
			expect(states.SleepState.Active).toBe(false);
		});

		it("/wake while immersive, with no duration set yet, sets a random 2-10 minute timer instead of waking immediately", () => {
			states.settings.immersive = true;
			states.SleepState.Activate(1, undefined, false);
			runCommand("wake");
			expect(states.SleepState.Active).toBe(true);
			const duration = states.settings.states.find(s => s.type === "asleep")?.duration ?? 0;
			expect(duration).toBeGreaterThanOrEqual(2 * 60 * 1000);
			expect(duration).toBeLessThanOrEqual(10 * 60 * 1000);
		});

		it("/wake while immersive, once a timer is already set, changes nothing further", () => {
			states.settings.immersive = true;
			runCommand("sleep", "5");
			runCommand("wake");
			expect(states.SleepState.Active).toBe(true);
			expect(states.settings.states.find(s => s.type === "asleep")?.duration).toBe(5 * 60 * 1000);
		});
	});
});
