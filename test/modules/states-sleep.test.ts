// SleepState: idempotent Activate (falling asleep twice does nothing the second time),
// its restriction set (Walk is the one "whenImmersive" restriction; everything else it
// sets is "true"), and its Activate/Recover/RoomSync side effects (expression, kneeling,
// releasing any grabs the sleeper was holding, the ForceKneel custom effect).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { boot, resetWorld, player } from "../harness/world";
import { rawStub } from "../harness/bc-lite";
import { sent } from "../harness/room";

describe("SleepState", () => {
	let states: StateModule;

	beforeAll(() => {
		[, , states] = boot(new CoreModule(), new LeashingModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	// AstralProjectionState.Init() also hooks these globals, which replaces globalThis[name]
	// with the SDK's router (a plain function, not a mock) -- rawStub() gets back the
	// original vi.fn() the router still calls through to. See bc-lite.ts's comment on it.
	function characterSetFacialExpression() {
		return rawStub("CharacterSetFacialExpression")!;
	}
	function poseSetActive() {
		return rawStub("PoseSetActive")!;
	}

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	it("declares Walk as \"whenImmersive\" and everything else it touches as \"true\"", () => {
		expect(states.SleepState.Restrictions.Walk).toBe("whenImmersive");
		expect(states.SleepState.Restrictions.Move).toBe("true");
		expect(states.SleepState.Restrictions.Wardrobe).toBe("true");
		expect(states.SleepState.Restrictions.Hearing).toBe("true");
		expect(states.SleepState.Restrictions.Sight).toBe("true");
		expect(states.SleepState.Restrictions.Speech).toBe("true");
		expect(states.SleepState.Restrictions.Stand).toBe("true");
		expect(states.SleepState.Restrictions.Emoticon).toBe("true");
	});

	it("Activate() sends the falling-asleep emote and becomes Active", () => {
		states.SleepState.Activate(1, undefined, true);
		expect(states.SleepState.Active).toBe(true);
		expect(sent.actions()).toEqual([emote("%NAME% slumps weakly as %PRONOUN% slips into unconciousness.")]);
	});

	it("Activate() is idempotent: calling it again while already asleep does nothing further", () => {
		states.SleepState.Activate(1, undefined, true);
		const ret = states.SleepState.Activate(1, undefined, true);
		expect(ret).toBeUndefined();
		expect(sent.actions()).toHaveLength(1);
	});

	it("Activate() kneels the player when they can kneel", () => {
		player().flags.canKneel = true;
		states.SleepState.Activate(1);
		expect(poseSetActive()).toHaveBeenCalledWith(player(), "Kneel", true);
	});

	it("Activate() does not force a kneel pose when the player can't kneel", () => {
		player().flags.canKneel = false;
		states.SleepState.Activate(1);
		expect(poseSetActive()).not.toHaveBeenCalled();
	});

	it("Activate() releases any grabs the sleeper was holding as the source", () => {
		const releaseSpy = vi.spyOn(states.SleepState, "ReleaseAllGrabs");
		states.SleepState.Activate(1);
		expect(releaseSpy).toHaveBeenCalled();
	});

	it("Activate() sets the sleeping facial expression (Eyes: Closed, Emoticon: Sleep)", () => {
		states.SleepState.Activate(1);
		const calls = characterSetFacialExpression().mock.calls;
		expect(calls).toContainEqual([player(), "Eyes", "Closed"]);
		expect(calls).toContainEqual([player(), "Emoticon", "Sleep"]);
	});

	it("Activate() with a duration sets timed expressions (duration in seconds)", () => {
		states.SleepState.Activate(1, 15_000);
		const calls = characterSetFacialExpression().mock.calls;
		expect(calls).toContainEqual([player(), "Eyes", "Closed", 15]);
		expect(calls).toContainEqual([player(), "Emoticon", "Sleep", 15]);
	});

	describe("Recover()", () => {
		it("does nothing when not currently asleep", () => {
			const ret = states.SleepState.Recover(true);
			expect(sent.actions()).toEqual([]);
			expect(ret).toBe(states.SleepState);
		});

		it("sends the waking emote, sets a dazed eye expression, and clears a Sleep emoticon", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(globalThis as any).WardrobeGetExpression.mockReturnValueOnce({ Emoticon: "Sleep" });
			states.SleepState.Activate(1, undefined, false);
			states.SleepState.Recover(true);
			expect(states.SleepState.Active).toBe(false);
			expect(sent.actions()).toEqual([emote("%NAME%'s eyelids flutter and start to open sleepily...")]);
			expect(characterSetFacialExpression()).toHaveBeenCalledWith(player(), "Eyes", "Dazed", 15);
			expect(characterSetFacialExpression()).toHaveBeenCalledWith(player(), "Emoticon", null);
		});
	});

	it("RoomSync() re-applies the sleep expression, kneel pose, and ForceKneel effect while active", () => {
		states.SleepState.Activate(1);
		poseSetActive().mockClear();
		states.SleepState.RoomSync();
		expect(poseSetActive()).toHaveBeenCalledWith(player(), "Kneel", true);
	});

	it("RoomSync() does nothing while not asleep", () => {
		states.SleepState.RoomSync();
		expect(poseSetActive()).not.toHaveBeenCalled();
	});

	it("SpeechBlock() sends one of the fixed sleep-talk lines", () => {
		states.SleepState.SpeechBlock();
		expect(states.SleepState.sleepBlockStrings.map(emote)).toContain(sent.actions()[0]);
	});
});
