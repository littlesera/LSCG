// HornyState, HypnoState, and BuffedState: arousal-driven buffs (positive and negative
// skill modifiers) and arousal timer hooks.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { replace_template, ICONS, hookFunction } from "utils";
import { boot, resetWorld, player } from "../harness/world";
import { sent } from "../harness/room";

// boot() runs once for the whole file, shared by all describe blocks below -- see the
// same note in states-restrictions-simple.test.ts for why a second boot() per describe
// would stack duplicate hooks on the shared globals.
let states: StateModule;
let hypno: HypnoModule;

beforeAll(() => {
	[, hypno, states] = boot(new CoreModule(), new HypnoModule(), new StateModule());
	vi.useFakeTimers();
});

describe("HornyState", () => {
	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	it("Icon() returns the fixed 'Lover' icon", () => {
		expect(states.HornyState.Icon(player() as unknown as OtherCharacter)).toBe("Icons/Lover.png");
	});

	it("Label() returns the fixed 'Aroused' label", () => {
		expect(states.HornyState.Label(player() as unknown as OtherCharacter)).toBe("Aroused");
	});

	it("does not set any restrictions (all false)", () => {
		expect(states.HornyState.Restrictions.Move).toBe("false");
		expect(states.HornyState.Restrictions.Walk).toBe("false");
		expect(states.HornyState.Restrictions.Stand).toBe("false");
		expect(states.HornyState.Restrictions.Speech).toBe("false");
	});

	it("Tick() increments Player.ArousalSettings.Progress by 1 when Active", () => {
		states.HornyState.Activate(1, undefined, false);
		player().ArousalSettings = { Progress: 10 } as any;
		states.HornyState.Tick(Date.now());
		expect(player().ArousalSettings!.Progress).toBe(11);
	});

	it("Tick() does not increment Progress when not Active", () => {
		player().ArousalSettings = { Progress: 10 } as any;
		states.HornyState.Tick(Date.now());
		expect(player().ArousalSettings!.Progress).toBe(10);
	});

	it("Tick() does not crash when ArousalSettings is undefined", () => {
		states.HornyState.Activate(1, undefined, false);
		player().ArousalSettings = undefined as any;
		expect(() => states.HornyState.Tick(Date.now())).not.toThrow();
	});

	it("ActivitySetArousalTimer hook doubles Progress and caps at 99 when Active", () => {
		states.HornyState.Activate(1, undefined, false);
		// Install a test hook to capture what the HornyState hook produces
		// Priority 1 runs after HornyState's priority 2
		let capturedProgress = 0;
		hookFunction('ActivitySetArousalTimer' as const, 1, (args, next) => {
			capturedProgress = args[3];
			return next(args);
		}, null);
		(globalThis.ActivitySetArousalTimer as any)(undefined, "SomeActivity", "SomeZone", 40);
		expect(capturedProgress).toBe(80); // 40 * 2
	});

	it("ActivitySetArousalTimer hook caps at 99 when doubling would exceed it", () => {
		states.HornyState.Activate(1, undefined, false);
		let capturedProgress = 0;
		hookFunction('ActivitySetArousalTimer' as const, 1, (args, next) => {
			capturedProgress = args[3];
			return next(args);
		}, null);
		(globalThis.ActivitySetArousalTimer as any)(undefined, "SomeActivity", "SomeZone", 60);
		expect(capturedProgress).toBe(99); // 60 * 2 = 120, capped at 99
	});

	it("ActivitySetArousalTimer hook passes Progress through unchanged when not Active", () => {
		// HornyState starts inactive
		states.HornyState.Recover(false);
		let capturedProgress = 0;
		hookFunction('ActivitySetArousalTimer' as const, 1, (args, next) => {
			capturedProgress = args[3];
			return next(args);
		}, null);
		(globalThis.ActivitySetArousalTimer as any)(undefined, "SomeActivity", "SomeZone", 40);
		expect(capturedProgress).toBe(40); // Unchanged
	});
});

describe("HypnoState", () => {
	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		states.init();
		hypno.settings.enableArousal = true;
		player().ArousalSettings = { Progress: 10 } as any;
		(globalThis.ActivitySetArousal as any).mockClear();
		// states.HypnoState is one shared instance across every test in this file (boot()
		// runs once in beforeAll) -- resetWorld() doesn't touch its own instance fields, so
		// a prior test's Tick() call would otherwise leave _hornyCheck pointing at that
		// test's "next due" timestamp and desync every test after it.
		states.HypnoState._hornyCheck = 0;
	});

	// ActivitySetArousal is a real, hooked BC function stubbed to a no-op vi.fn() on this
	// tier -- it never actually mutates Player.ArousalSettings.Progress here, so these
	// assert on the call itself (whether/how ArousalTick invoked it) rather than on Progress.

	it("Tick() runs ArousalTick immediately on the first call (next-due-time starts at 0)", () => {
		states.HypnoState.Activate(1, undefined, false);
		states.HypnoState.Tick(Date.now());
		expect(globalThis.ActivitySetArousal).toHaveBeenCalledTimes(1);
		expect(globalThis.ActivitySetArousal).toHaveBeenCalledWith(player(), 15);
	});

	it("Tick() does not run ArousalTick again before _hornyInterval has elapsed since the last run", () => {
		states.HypnoState.Activate(1, undefined, false);
		const start = Date.now();
		states.HypnoState.Tick(start);
		states.HypnoState.Tick(start + states.HypnoState._hornyInterval - 1000);
		expect(globalThis.ActivitySetArousal).toHaveBeenCalledTimes(1);
	});

	it("Tick() runs ArousalTick again once _hornyInterval has elapsed since the last run", () => {
		states.HypnoState.Activate(1, undefined, false);
		const start = Date.now();
		states.HypnoState.Tick(start);
		states.HypnoState.Tick(start + states.HypnoState._hornyInterval);
		expect(globalThis.ActivitySetArousal).toHaveBeenCalledTimes(2);
	});

	it("Tick() keeps running ArousalTick on each subsequent interval", () => {
		states.HypnoState.Activate(1, undefined, false);
		const start = Date.now();
		states.HypnoState.Tick(start);
		states.HypnoState.Tick(start + states.HypnoState._hornyInterval);
		states.HypnoState.Tick(start + states.HypnoState._hornyInterval * 2);
		expect(globalThis.ActivitySetArousal).toHaveBeenCalledTimes(3);
	});

	it("ArousalTick() does nothing when not Active", () => {
		states.HypnoState.Tick(Date.now());
		expect(globalThis.ActivitySetArousal).not.toHaveBeenCalled();
	});

	it("ArousalTick() does nothing when enableArousal is off", () => {
		hypno.settings.enableArousal = false;
		states.HypnoState.Activate(1, undefined, false);
		states.HypnoState.Tick(Date.now());
		expect(globalThis.ActivitySetArousal).not.toHaveBeenCalled();
	});
});

describe("BuffedState", () => {
	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		// Clear all SkillSetModifier call history for each test
		(globalThis.SkillSetModifier as any).mockClear();
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	describe("Icon() and Label()", () => {
		it("Icon() returns UP icon when not negative (Blessed)", () => {
			states.BuffedState.Bless(1, false);
			expect(states.BuffedState.Icon(player() as unknown as OtherCharacter)).toBe(ICONS.UP);
		});

		it("Icon() returns DOWN icon when negative (Baned)", () => {
			states.BuffedState.Bane(1, false);
			expect(states.BuffedState.Icon(player() as unknown as OtherCharacter)).toBe(ICONS.DOWN);
		});

		it("Label() returns 'Blessed' when not negative", () => {
			states.BuffedState.Bless(1, false);
			expect(states.BuffedState.Label(player() as unknown as OtherCharacter)).toBe("Blessed");
		});

		it("Label() returns 'Baned' when negative", () => {
			states.BuffedState.Bane(1, false);
			expect(states.BuffedState.Label(player() as unknown as OtherCharacter)).toBe("Baned");
		});
	});

	describe("Bless()", () => {
		it("Bless() activates the state with negative=false", () => {
			states.BuffedState.Bless(1, false);
			expect(states.BuffedState.Active).toBe(true);
			expect(states.BuffedState.negative).toBe(false);
		});

		it("Bless() calls SkillSetModifier 7 times with modifier +5 for each skill", () => {
			states.BuffedState.Bless(1, false, 900000);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
			// Check that all calls have modifier +5
			for (let i = 0; i < 7; i++) {
				const call = (globalThis.SkillSetModifier as any).mock.calls[i];
				expect(call[2]).toBe(5); // modifier is args[2]
				expect(call[3]).toBe(900000); // duration is args[3]
				expect(call[4]).toBe(true); // last arg is true
			}
		});

		it("Bless() sends emote when emote=true", () => {
			states.BuffedState.Bless(1, true);
			expect(sent.actions()).toEqual([emote("%NAME% feels as though %POSSESSIVE% abilities are enhanced.")]);
		});

		it("Bless() does not send emote when emote=false", () => {
			states.BuffedState.Bless(1, false);
			expect(sent.actions()).toEqual([]);
		});

		it("Bless() uses default duration when none specified", () => {
			states.BuffedState.Bless(1, false);
			const config = states.settings.states.find(s => s.type === "buffed")!;
			expect(config.duration).toBe(900000); // BuffedState.BUFF_DURATION
		});

		it("Bless() uses specified duration when given", () => {
			states.BuffedState.Bless(1, false, 500000);
			const config = states.settings.states.find(s => s.type === "buffed")!;
			expect(config.duration).toBe(500000);
		});

		it("Bless() on already-blessed state re-activates (does not toggle off)", () => {
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bless(1, false, 100000);
			expect(states.BuffedState.Active).toBe(true);
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bless(1, false, 200000);
			// Should still be active and re-apply skills
			expect(states.BuffedState.Active).toBe(true);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
		});

		it("Bless() when Baned instead calls Recover to toggle off", () => {
			states.BuffedState.Bane(1, false);
			expect(states.BuffedState.Active).toBe(true);
			expect(states.BuffedState.negative).toBe(true);
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bless(1, false);
			// Should have recovered (toggle off)
			expect(states.BuffedState.Active).toBe(false);
			// Recover() is called which calls SkillSetModifier 7 times with modifier 0
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
		});
	});

	describe("Bane()", () => {
		it("Bane() activates the state with negative=true", () => {
			states.BuffedState.Bane(1, false);
			expect(states.BuffedState.Active).toBe(true);
			expect(states.BuffedState.negative).toBe(true);
		});

		it("Bane() calls SkillSetModifier 7 times with modifier -5 for each skill", () => {
			states.BuffedState.Bane(1, false, 900000);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
			// Check that all calls have modifier -5
			for (let i = 0; i < 7; i++) {
				const call = (globalThis.SkillSetModifier as any).mock.calls[i];
				expect(call[2]).toBe(-5); // modifier is args[2]
				expect(call[3]).toBe(900000); // duration is args[3]
				expect(call[4]).toBe(true); // last arg is true
			}
		});

		it("Bane() sends emote when emote=true", () => {
			states.BuffedState.Bane(1, true);
			expect(sent.actions()).toEqual([emote("%NAME% feels as though %POSSESSIVE% abilities are diminished.")]);
		});

		it("Bane() does not send emote when emote=false", () => {
			states.BuffedState.Bane(1, false);
			expect(sent.actions()).toEqual([]);
		});

		it("Bane() on already-baned state re-activates (does not toggle off)", () => {
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bane(1, false, 100000);
			expect(states.BuffedState.Active).toBe(true);
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bane(1, false, 200000);
			// Should still be active and re-apply skills
			expect(states.BuffedState.Active).toBe(true);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
		});

		it("Bane() when Blessed instead calls Recover to toggle off", () => {
			states.BuffedState.Bless(1, false);
			expect(states.BuffedState.Active).toBe(true);
			expect(states.BuffedState.negative).toBe(false);
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Bane(1, false);
			// Should have recovered (toggle off)
			expect(states.BuffedState.Active).toBe(false);
			// Recover() is called which calls SkillSetModifier 7 times with modifier 0
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
		});
	});

	describe("Recover()", () => {
		it("Recover() when Active calls SkillSetModifier 7 times with modifier 0 and duration 0", () => {
			states.BuffedState.Bless(1, false);
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Recover(false);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(7);
			// Check that all calls have modifier 0 and duration 0
			for (let i = 0; i < 7; i++) {
				const call = (globalThis.SkillSetModifier as any).mock.calls[i];
				expect(call[2]).toBe(0); // modifier is args[2]
				expect(call[3]).toBe(0); // duration is args[3]
				expect(call[4]).toBe(true); // last arg is true
			}
		});

		it("Recover() sends emote when emote=true and state was Active", () => {
			states.BuffedState.Bless(1, false);
			states.BuffedState.Recover(true);
			expect(sent.actions()).toEqual([emote("%NAME%'s abilities return to normal.")]);
		});

		it("Recover() does not send emote when emote=false", () => {
			states.BuffedState.Bless(1, false);
			states.BuffedState.Recover(false);
			expect(sent.actions()).toEqual([]);
		});

		it("Recover() when NOT Active does not call SkillSetModifier", () => {
			// BuffedState starts inactive
			(globalThis.SkillSetModifier as any).mockClear();
			states.BuffedState.Recover(false);
			expect((globalThis.SkillSetModifier as any).mock.calls.length).toBe(0);
		});

		it("Recover() deactivates the state", () => {
			states.BuffedState.Bless(1, false);
			expect(states.BuffedState.Active).toBe(true);
			states.BuffedState.Recover(false);
			expect(states.BuffedState.Active).toBe(false);
		});
	});
});
