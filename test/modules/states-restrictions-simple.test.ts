// BlindState, DeafState, BarrierState, FrozenState: basic activation, icon/label,
// and restriction behavior specific to each state (no generic BaseState mechanics,
// which are covered by states-base.test.ts).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { ICONS, replace_template } from "utils";
import { boot, resetWorld, player } from "../harness/world";
import { sent } from "../harness/room";

// boot() runs once for the whole file, shared by every describe block below: hookFunction
// installs StateModule's hooks directly onto the current globals the moment it's called, so
// a separate `boot(new StateModule())` per describe would stack a fresh copy of every hook
// (Player.IsEnclose, etc.) on top of the last one still on the global.
let states: StateModule;

beforeAll(() => {
	[, states] = boot(new CoreModule(), new StateModule());
	vi.useFakeTimers();
});

describe("BlindState", () => {
	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	it("constructor sets Restrictions.Sight to 'true' and leaves others at default 'false'", () => {
		expect(states.BlindState.Restrictions.Sight).toBe("true");
		expect(states.BlindState.Restrictions.Move).toBe("false");
		expect(states.BlindState.Restrictions.Walk).toBe("false");
		expect(states.BlindState.Restrictions.Speech).toBe("false");
	});

	it("Icon() returns the fixed BlindHeavy icon path", () => {
		expect(states.BlindState.Icon(player() as unknown as OtherCharacter)).toBe("Icons/Previews/BlindHeavy.png");
	});

	it("Label() returns 'Blinded'", () => {
		expect(states.BlindState.Label(player() as unknown as OtherCharacter)).toBe("Blinded");
	});

	it("Activate() sets Active to true and stores the type 'blind' in config", () => {
		states.BlindState.Activate(1);
		expect(states.BlindState.Active).toBe(true);
		expect(states.settings.states.find(s => s.type === "blind")?.active).toBe(true);
	});

	it("Recover() sets Active to false", () => {
		states.BlindState.Activate(1);
		states.BlindState.Recover(false);
		expect(states.BlindState.Active).toBe(false);
	});
});

describe("DeafState", () => {
	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	it("constructor sets Restrictions.Hearing to 'true' and leaves others at default 'false'", () => {
		expect(states.DeafState.Restrictions.Hearing).toBe("true");
		expect(states.DeafState.Restrictions.Move).toBe("false");
		expect(states.DeafState.Restrictions.Walk).toBe("false");
		expect(states.DeafState.Restrictions.Speech).toBe("false");
	});

	it("Icon() returns the fixed DeafHeavy icon path", () => {
		expect(states.DeafState.Icon(player() as unknown as OtherCharacter)).toBe("Icons/Previews/DeafHeavy.png");
	});

	it("Label() returns 'Deafened'", () => {
		expect(states.DeafState.Label(player() as unknown as OtherCharacter)).toBe("Deafened");
	});

	it("Activate() sets Active to true and stores the type 'deaf' in config", () => {
		states.DeafState.Activate(1);
		expect(states.DeafState.Active).toBe(true);
		expect(states.settings.states.find(s => s.type === "deaf")?.active).toBe(true);
	});

	it("Recover() sets Active to false", () => {
		states.DeafState.Activate(1);
		states.DeafState.Recover(false);
		expect(states.DeafState.Active).toBe(false);
	});
});

describe("BarrierState", () => {
	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	it("constructor sets no restrictions (all remain at default 'false')", () => {
		expect(states.BarrierState.Restrictions.Move).toBe("false");
		expect(states.BarrierState.Restrictions.Walk).toBe("false");
		expect(states.BarrierState.Restrictions.Speech).toBe("false");
		expect(states.BarrierState.Restrictions.Sight).toBe("false");
		expect(states.BarrierState.Restrictions.Hearing).toBe("false");
	});

	it("Icon() returns ICONS.UP", () => {
		expect(states.BarrierState.Icon(player() as unknown as OtherCharacter)).toBe(ICONS.UP);
	});

	it("Label() returns 'Protected'", () => {
		expect(states.BarrierState.Label(player() as unknown as OtherCharacter)).toBe("Protected");
	});

	it("Barrier(memberNumber, emote=true, duration) sends the barrier emote when emote is true", () => {
		states.BarrierState.Barrier(1, true, 1000);
		expect(sent.actions()).toEqual([emote("A magic barrier appear around %NAME%.")]);
	});

	it("Barrier(memberNumber, emote=false, duration) sends no emote when emote is false", () => {
		states.BarrierState.Barrier(1, false, 1000);
		expect(sent.actions()).toEqual([]);
	});

	it("Barrier(memberNumber, emote, duration) activates the state with the given duration", () => {
		states.BarrierState.Barrier(1, false, 5000);
		expect(states.BarrierState.Active).toBe(true);
		const config = states.settings.states.find(s => s.type === "protected");
		expect(config?.duration).toBe(5000);
	});

	it("Barrier(memberNumber, emote) uses the default BUFF_DURATION (900000ms) when no duration is passed", () => {
		states.BarrierState.Barrier(1, false);
		expect(states.BarrierState.Active).toBe(true);
		const config = states.settings.states.find(s => s.type === "protected");
		expect(config?.duration).toBe(900000);
	});

	it("Barrier with no emote parameter defaults to false (no emote sent)", () => {
		states.BarrierState.Barrier(1);
		expect(sent.actions()).toEqual([]);
		expect(states.BarrierState.Active).toBe(true);
	});
});

describe("FrozenState", () => {
	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	it("constructor sets all six restrictions (Move, Stand, Kneel, Wardrobe, Walk, Speech) to 'true'", () => {
		expect(states.FrozenState.Restrictions.Move).toBe("true");
		expect(states.FrozenState.Restrictions.Stand).toBe("true");
		expect(states.FrozenState.Restrictions.Kneel).toBe("true");
		expect(states.FrozenState.Restrictions.Wardrobe).toBe("true");
		expect(states.FrozenState.Restrictions.Walk).toBe("true");
		expect(states.FrozenState.Restrictions.Speech).toBe("true");
	});

	it("Icon() returns 'Icons/Kidnap.png'", () => {
		expect(states.FrozenState.Icon(player() as unknown as OtherCharacter)).toBe("Icons/Kidnap.png");
	});

	it("Label() returns 'Petrified'", () => {
		expect(states.FrozenState.Label(player() as unknown as OtherCharacter)).toBe("Petrified");
	});

	it("Activate() sets Active to true and stores the type 'frozen' in config", () => {
		states.FrozenState.Activate(1);
		expect(states.FrozenState.Active).toBe(true);
		expect(states.settings.states.find(s => s.type === "frozen")?.active).toBe(true);
	});

	it("Recover() sets Active to false", () => {
		states.FrozenState.Activate(1);
		states.FrozenState.Recover(false);
		expect(states.FrozenState.Active).toBe(false);
	});

	it("Init() hooks Player.IsEnclose to return true when FrozenState is Active", () => {
		player().flags.enclosed = false;
		expect(globalThis.Player.IsEnclose()).toBe(false);

		states.FrozenState.Activate(1);
		expect(globalThis.Player.IsEnclose()).toBe(true);
	});

	it("Init() hook falls through to the underlying flag value when FrozenState is not Active", () => {
		states.FrozenState.Activate(1);
		expect(globalThis.Player.IsEnclose()).toBe(true);

		states.FrozenState.Recover(false);
		player().flags.enclosed = false;
		expect(globalThis.Player.IsEnclose()).toBe(false);

		player().flags.enclosed = true;
		expect(globalThis.Player.IsEnclose()).toBe(true);
	});

	it("SpeechBlock() sends one of the three fixed speechBlockStr messages", () => {
		states.FrozenState.Activate(1);
		states.FrozenState.SpeechBlock();
		const actions = sent.actions();
		expect(actions).toHaveLength(1);
		// The sent action is template-replaced; check against the replaced versions
		const expectedMessages = states.FrozenState.speechBlockStr.map(s => emote(s));
		expect(expectedMessages).toContain(actions[0]);
	});

	it("SpeechBlock() sends one of the fixed lines on every call, not just the first", () => {
		states.FrozenState.Activate(1);
		const expectedMessages = states.FrozenState.speechBlockStr.map(s => emote(s));

		for (let i = 0; i < 3; i++) {
			sent.raw().length = 0;
			states.FrozenState.SpeechBlock();
			const actions = sent.actions();
			expect(actions).toHaveLength(1);
			expect(expectedMessages).toContain(actions[0]);
		}
	});
});
