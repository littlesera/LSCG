// BaseState's generic mechanics (Activate/Recover/Tick/Safeword/extensions/config
// persistence), exercised through DeniedState -- the one concrete state with no
// Activate/Recover override of its own, so what's tested here is purely BaseState's
// behavior, not a subclass's.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { boot, resetWorld } from "../harness/world";
import { sent } from "../harness/room";

describe("BaseState (via DeniedState)", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1 });
		states.init();
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	it("is inactive with a zero activationCount before ever being activated", () => {
		expect(states.DeniedState.Active).toBe(false);
		expect(states.settings.states.find(s => s.type === "denied")?.active).toBe(false);
		expect(states.settings.states.find(s => s.type === "denied")?.activationCount).toBe(0);
	});

	it("Activate() records active, activatedBy, activatedAt, duration, and bumps activationCount", () => {
		states.DeniedState.Activate(42, 5000, false);
		const config = states.settings.states.find(s => s.type === "denied")!;
		expect(config.active).toBe(true);
		expect(config.activatedBy).toBe(42);
		expect(config.duration).toBe(5000);
		expect(config.activationCount).toBe(1);
		expect(config.activatedAt).toBe(Date.now());
	});

	it("activatedBy defaults to -1 when no member number is given", () => {
		states.DeniedState.Activate(undefined, 5000);
		expect(states.settings.states.find(s => s.type === "denied")?.activatedBy).toBe(-1);
	});

	it("activationCount keeps incrementing across repeated activations", () => {
		states.DeniedState.Activate(1);
		states.DeniedState.Recover(false);
		states.DeniedState.Activate(1);
		expect(states.settings.states.find(s => s.type === "denied")?.activationCount).toBe(2);
	});

	it("Recover() clears active and records recoveredAt", () => {
		states.DeniedState.Activate(1);
		states.DeniedState.Recover(false);
		const config = states.settings.states.find(s => s.type === "denied")!;
		expect(config.active).toBe(false);
		expect(config.recoveredAt).toBe(Date.now());
	});

	it("Recover(true) sends the generic 'wears off' emote; Recover(false) sends nothing", () => {
		states.DeniedState.Activate(1);
		states.DeniedState.Recover(true);
		expect(sent.actions()).toEqual([emote("%NAME%'s denied state wears off.")]);
	});

	it("a duration of 0 (or undefined) never expires via Tick", () => {
		states.DeniedState.Activate(1, 0);
		vi.advanceTimersByTime(10_000_000);
		states.DeniedState.Tick(Date.now());
		expect(states.DeniedState.Active).toBe(true);
	});

	it("Tick() recovers (with the wears-off emote) once the duration has elapsed", () => {
		states.DeniedState.Activate(1, 5000);
		vi.advanceTimersByTime(5001);
		states.DeniedState.Tick(Date.now());
		expect(states.DeniedState.Active).toBe(false);
		expect(sent.actions()).toEqual([emote("%NAME%'s denied state wears off.")]);
	});

	it("Tick() before the duration has elapsed leaves the state active", () => {
		states.DeniedState.Activate(1, 5000);
		vi.advanceTimersByTime(2000);
		states.DeniedState.Tick(Date.now());
		expect(states.DeniedState.Active).toBe(true);
	});

	it("Safeword() recovers silently (no emote) even for an active state", () => {
		states.DeniedState.Activate(1);
		states.DeniedState.Safeword();
		expect(states.DeniedState.Active).toBe(false);
		expect(sent.actions()).toEqual([]);
	});

	it("extensions read/write persist on the same config object across accesses", () => {
		states.DeniedState.setConfigValue("note", "hello");
		expect(states.DeniedState.getConfigValue("note")).toBe("hello");
		expect(states.settings.states.find(s => s.type === "denied")?.extensions.note).toBe("hello");
	});

	it("setConfigValue(key, null) deletes the extension", () => {
		states.DeniedState.setConfigValue("note", "hello");
		states.DeniedState.setConfigValue("note", null);
		expect(states.DeniedState.getConfigValue("note")).toBeUndefined();
		expect(states.settings.states.find(s => s.type === "denied")?.extensions).not.toHaveProperty("note");
	});

	it("getStateSetting() returns the same config object on repeated calls for the same type", () => {
		const a = states.getStateSetting("denied");
		const b = states.getStateSetting("denied");
		expect(a).toBe(b);
	});

	it("getStateSetting() creates a fresh, inactive config on first access", () => {
		const config = states.getStateSetting("gagged");
		expect(config).toEqual({ type: "gagged", active: false, activationCount: 0, extensions: {} });
	});
});
