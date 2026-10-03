// BoopsModule: booping the player's nose (Pet or LSCG_ItemBoop on ItemNose)
// escalates through three reaction tiers as boops accumulate, then shuts down
// entirely for 30s once it maxes out. boops decays by 1 every 5s while unbooped.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BoopsModule } from "Modules/boops";
import { replace_template } from "utils";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";
import { seedRandom, restoreRandom } from "../harness/time";

describe("BoopsModule", () => {
	let boops: BoopsModule;

	beforeAll(() => {
		[boops] = boot(new BoopsModule());
	});

	beforeEach(() => {
		resetWorld({ LSCG: { GlobalModule: { enabled: true }, BoopsModule: { enabled: true } } });
		boops.boops = 0;
		boops.boopShutdown = false;
		seedRandom([0]); // always pick the first reaction line
	});

	function boop(booper = addToRoom(makeCharacter({ MemberNumber: 222 }))) {
		receive.activity(booper, "ItemNose", "Pet", globalThis.Player as never);
		return booper;
	}

	it("ignores an unrecognized activity on the same group", () => {
		const booper = addToRoom(makeCharacter({ MemberNumber: 222 }));
		receive.activity(booper, "ItemNose", "Sniff", globalThis.Player as never);
		expect(sent.actions()).toEqual([]);
		expect(boops.boops).toBe(0);
	});

	it("ignores a boop while incapacitated", () => {
		resetWorld({
			LSCG: {
				GlobalModule: { enabled: true },
				BoopsModule: { enabled: true },
				StateModule: { states: [{ type: "hypnotized", active: true }] },
			},
		});
		boop();
		expect(sent.actions()).toEqual([]);
		expect(boops.boops).toBe(0);
	});

	it("1st-2nd boops: a normal reaction, sent as an unaddressed action", () => {
		boop();
		expect(boops.boops).toBe(1);
		// SendAction() runs the line through replace_template() before it goes
		// out, so the sent text won't literally contain "%NAME%" etc. -- compute
		// the same substitution here rather than comparing against the raw template.
		expect(sent.actions()).toEqual([replace_template(boops.normalBoopReactions[0])]);
	});

	it("3rd-4th boops: a protest reaction, addressed at the booper", () => {
		boop();
		boop();
		const booper = boop();
		expect(boops.boops).toBe(3);
		expect(sent.actions().at(-1)).toBe(replace_template(boops.protestBoopReactions[0], booper as never));
	});

	it("3rd-4th boops while restrained: the bound-specific protest line, unaddressed", () => {
		player().flags.restrained = true; // mutate in place -- see fixtures.ts's own note on why
		boops.boops = 2;
		boop();
		expect(sent.actions().at(-1)).toBe(replace_template(boops.boundBoopReactions[0]));
	});

	it("5th+ boop: the big protest reaction, then shuts down further reactions", () => {
		boops.boops = 4;
		boop();
		expect(boops.boops).toBe(5);
		expect(sent.actions().at(-1)).toBe(replace_template(boops.bigProtestBoopReactions[0]));
		expect(boops.boopShutdown).toBe(true);

		const countBefore = sent.actions().length;
		boop();
		expect(sent.actions().length).toBe(countBefore); // shut down: no further reaction
	});

	it("boopShutdown clears after 30s, allowing reactions again", () => {
		vi.useFakeTimers();
		try {
			boops.boops = 4;
			boop();
			expect(boops.boopShutdown).toBe(true);

			vi.advanceTimersByTime(30_000);
			expect(boops.boopShutdown).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	// Must stay the last test in this file: it loads a *second* BoopsModule
	// instance to get its setInterval registered under fake timers (the shared
	// `boops` from boot() in beforeAll already registered its interval against
	// the real timer system, before any test's vi.useFakeTimers() existed, so
	// faking time afterwards wouldn't drive it). unload()ing that second
	// instance would remove *all* Boops-tagged hooks including the shared
	// instance's, not just its own, so it's deliberately left registered.
	it("boops decays by 1 every 5s via the interval started in load()", () => {
		vi.useFakeTimers();
		try {
			const fresh = new BoopsModule();
			fresh.boops = 3;
			fresh.load();

			vi.advanceTimersByTime(5000);
			expect(fresh.boops).toBe(2);
			vi.advanceTimersByTime(5000);
			expect(fresh.boops).toBe(1);
			vi.advanceTimersByTime(5000 * 5); // never goes below 0
			expect(fresh.boops).toBe(0);
		} finally {
			vi.useRealTimers();
		}
	});

	afterAll(() => {
		restoreRandom();
	});
});
