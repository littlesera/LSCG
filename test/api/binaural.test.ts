// Binaural beats during hypnosis: opt-in, fade in on trance, snap off on waking, and the controls extensions get through
// operations.hypno.binaural (always under the player's own volume setting).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { announceReady, apiCapabilities } from "api";
import { setScopeGranted } from "api/operations";
import { binauralInfo, stopBinaural } from "Dom/binauralBeats";
import { BINAURAL_BEATS } from "constants/game-balance";
import { boot, resetWorld } from "../harness/world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

class FakeParam {
	value = 0;
	calls: [string, number, number?][] = [];
	setValueAtTime(v: number, t: number) { this.value = v; this.calls.push(["set", v, t]); }
	linearRampToValueAtTime(v: number, t: number) { this.calls.push(["ramp", v, t]); this.value = v; }
	cancelScheduledValues(t: number) { this.calls.push(["cancel", t]); }
}
class FakeNode { connect = vi.fn(); }
class FakeOsc extends FakeNode { frequency = new FakeParam(); start = vi.fn(); stop = vi.fn(); }
class FakeGain extends FakeNode { gain = new FakeParam(); }
class FakeContext {
	static all: FakeContext[] = [];
	currentTime = 0;
	state = "running";
	destination = {};
	oscillators: FakeOsc[] = [];
	gains: FakeGain[] = [];
	close = vi.fn(() => Promise.resolve());
	resume = vi.fn(() => Promise.resolve());
	constructor() { FakeContext.all.push(this); }
	createChannelMerger() { return new FakeNode(); }
	createGain() { const n = new FakeGain(); this.gains.push(n); return n; }
	createOscillator() { const n = new FakeOsc(); this.oscillators.push(n); return n; }
}

describe("binaural beats", () => {
	let hypno: HypnoModule;
	let states: StateModule;
	let api: ModApiHandle;
	let ids = 0;

	beforeAll(() => {
		[, hypno, states] = boot(new CoreModule(), new HypnoModule(), new StateModule());
		announceReady();
		vi.useFakeTimers();
	});

	beforeEach(() => {
		localStorage.clear();
		FakeContext.all = [];
		g.AudioContext = FakeContext;
		g.AudioShouldSilenceSound = vi.fn(() => false);
		g.AudioVolumeFromModifier = vi.fn(() => 1);
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		states.init();
		hypno.settings.enabled = true;
		hypno.settings.enableBinaural = true;
		hypno.settings.binauralVolume = 40;
		hypno.settings.binauralPreset = "theta";
		hypno.binauralMode = "auto";
		hypno.binauralLevel = 1;
		hypno.binauralBeatOverride = undefined;
		api = registerExtension({ id: `bin-${++ids}`, name: "Beats", version: "1" });
	});

	afterEach(() => {
		api.dispose();
		stopBinaural();
		vi.runOnlyPendingTimers();
		delete g.AudioContext;
	});

	const context = () => FakeContext.all[FakeContext.all.length - 1];
	const tones = () => context().oscillators.map(o => o.frequency.calls.find(c => c[0] === "set")![1]);
	const hypnotize = () => hypno.StartTriggerWord(false);
	const wake = () => hypno.TriggerRestoreTimeout();
	const allow = () => setScopeGranted(api.id, "hypno", true);

	it("is advertised as a capability", () => {
		expect(apiCapabilities.has("hypno.binaural")).toBe(true);
	});

	describe("following the trance", () => {
		it("is off by default, so nothing plays for a player who hasn't opted in", () => {
			expect(hypno.defaultSettings.enableBinaural).toBe(false);
			hypno.settings.enableBinaural = false;
			hypnotize();
			expect(binauralInfo().playing).toBe(false);
			expect(FakeContext.all).toHaveLength(0);
		});

		it("fades in when the trance starts, one tone per ear centred on the carrier", () => {
			hypnotize();
			expect(binauralInfo().playing).toBe(true);
			const [left, right] = tones();
			expect(right - left).toBeCloseTo(6);
			expect((left + right) / 2).toBeCloseTo(BINAURAL_BEATS.CARRIER_HZ);
			const gain = context().gains[0].gain;
			expect(gain.calls).toContainEqual(["set", 0, 0]);
			const ramp = gain.calls.find(c => c[0] === "ramp")!;
			expect(ramp[2]).toBe(BINAURAL_BEATS.FADE_IN_SECONDS);
			expect(ramp[1]).toBeCloseTo(0.4 * BINAURAL_BEATS.MAX_GAIN);
		});

		it("fades out over a second when the player wakes, then frees the audio device", () => {
			hypnotize();
			const ctx = context();
			wake();
			expect(binauralInfo().playing).toBe(false);
			const ramp = ctx.gains[0].gain.calls.filter(c => c[0] === "ramp").pop()!;
			expect(ramp[1]).toBe(0);
			expect(ramp[2]).toBe(BINAURAL_BEATS.FADE_OUT_SECONDS);
			vi.runOnlyPendingTimers();
			expect(ctx.close).toHaveBeenCalled();
		});

		it("starts again on the next trance with a fresh fade", () => {
			hypnotize(); wake();
			hypnotize();
			expect(FakeContext.all).toHaveLength(2);
			expect(binauralInfo().playing).toBe(true);
		});

		it("glides from alpha down to theta with the default pattern", () => {
			hypno.settings.binauralPreset = "glide";
			hypnotize();
			const [left, right] = tones();
			expect(right - left).toBeCloseTo(10);
			const ramps = context().oscillators[1].frequency.calls.filter(c => c[0] === "ramp");
			expect(ramps.pop()![1]).toBeCloseTo(BINAURAL_BEATS.CARRIER_HZ + 2.5);
		});

		it("stays silent when the player's sound is off, and when the module is off", () => {
			g.AudioShouldSilenceSound = vi.fn(() => true);
			hypnotize();
			expect(binauralInfo().playing).toBe(false);
			wake();
			g.AudioShouldSilenceSound = vi.fn(() => false);
			hypnotize();
			hypno.settings.enabled = false;
			hypno.syncBinaural();
			expect(binauralInfo().playing).toBe(false);
		});

		it("picks up a trance that was already on at load, on the next tick", () => {
			hypnotize();
			stopBinaural();
			expect(binauralInfo().playing).toBe(false);
			hypno.syncBinaural();
			expect(binauralInfo().playing).toBe(true);
		});

		it("follows the player's volume setting, and BC's own volume, while playing", () => {
			hypnotize();
			hypno.settings.binauralVolume = 80;
			hypno.syncBinaural();
			expect(binauralInfo().gain).toBeCloseTo(0.8 * BINAURAL_BEATS.MAX_GAIN);
			g.AudioVolumeFromModifier = vi.fn(() => 0.5);
			hypno.syncBinaural();
			expect(binauralInfo().gain).toBeCloseTo(0.4 * BINAURAL_BEATS.MAX_GAIN);
		});

		it("does nothing, quietly, in a browser with no Web Audio", () => {
			delete g.AudioContext;
			expect(() => hypnotize()).not.toThrow();
			expect(binauralInfo().playing).toBe(false);
		});
	});

	describe("for extensions", () => {
		it("needs the player to allow the hypnosis scope", () => {
			expect(() => api.operations.hypno.binaural.getState()).toThrow(/hasn't allowed the "hypno"/);
			expect(() => api.operations.hypno.binaural.play()).toThrow(/hasn't allowed/);
		});

		it("reads the state", () => {
			allow();
			expect(api.operations.hypno.binaural.getState()).toMatchObject({ enabled: true, playing: false, hypnotized: false, volume: 1, maxVolume: 0.4 });
			hypnotize();
			expect(api.operations.hypno.binaural.getState()).toMatchObject({ playing: true, hypnotized: true, beatHz: 6 });
		});

		it("can start a beat outside a trance, which still ends when a trance would", () => {
			allow();
			expect(api.operations.hypno.binaural.play()).toBe(true);
			expect(binauralInfo().playing).toBe(true);
			hypnotize();
			wake();
			expect(binauralInfo().playing).toBe(false);
		});

		it("can't make anything play for a player who hasn't opted in", () => {
			allow();
			hypno.settings.enableBinaural = false;
			expect(api.operations.hypno.binaural.play()).toBe(false);
			expect(binauralInfo().playing).toBe(false);
			expect(api.operations.hypno.binaural.getState().enabled).toBe(false);
		});

		it("stops the beat for the rest of the trance, and the next trance plays normally", () => {
			allow();
			hypnotize();
			expect(api.operations.hypno.binaural.stop()).toBe(true);
			expect(binauralInfo().playing).toBe(false);
			hypno.syncBinaural();
			expect(binauralInfo().playing).toBe(false);
			expect(api.operations.hypno.binaural.stop()).toBe(false);
			wake();
			hypnotize();
			expect(binauralInfo().playing).toBe(true);
		});

		it("fades in and out over the lengths it is asked for, once", () => {
			allow();
			expect(api.operations.hypno.binaural.play({ fadeSeconds: 30 })).toBe(true);
			const ctx = context();
			expect(ctx.gains[0].gain.calls.find(c => c[0] === "ramp")![2]).toBe(30);
			expect(api.operations.hypno.binaural.stop({ fadeSeconds: 5 })).toBe(true);
			expect(ctx.gains[0].gain.calls.filter(c => c[0] === "ramp").pop()![2]).toBe(5);
			api.operations.hypno.binaural.play();
			const next = context();
			expect(next.gains[0].gain.calls.find(c => c[0] === "ramp")![2]).toBe(BINAURAL_BEATS.FADE_IN_SECONDS);
			hypnotize();
			wake();
			expect(next.gains[0].gain.calls.filter(c => c[0] === "ramp").pop()![2]).toBe(BINAURAL_BEATS.FADE_OUT_SECONDS);
		});

		it("keeps fades within 0 to 60 seconds, and a zero fade click-free", () => {
			allow();
			api.operations.hypno.binaural.play({ fadeSeconds: 9999 });
			expect(context().gains[0].gain.calls.find(c => c[0] === "ramp")![2]).toBe(BINAURAL_BEATS.MAX_FADE_SECONDS);
			api.operations.hypno.binaural.stop({ fadeSeconds: 0 });
			expect(context().gains[0].gain.calls.filter(c => c[0] === "ramp").pop()![2]).toBeGreaterThan(0);
			expect(() => api.operations.hypno.binaural.play({ fadeSeconds: -1 })).toThrow(/fadeSeconds/);
			expect(() => api.operations.hypno.binaural.stop({ fadeSeconds: "slow" as never })).toThrow(/fadeSeconds/);
		});

		it("turns the volume down, and never above the player's own setting", () => {
			allow();
			hypnotize();
			api.operations.hypno.binaural.setVolume(0.5);
			expect(binauralInfo().gain).toBeCloseTo(0.2 * BINAURAL_BEATS.MAX_GAIN);
			api.operations.hypno.binaural.setVolume(5);
			expect(binauralInfo().gain).toBeCloseTo(0.4 * BINAURAL_BEATS.MAX_GAIN);
			api.operations.hypno.binaural.setVolume(-1);
			expect(binauralInfo().gain).toBe(0);
			expect(() => api.operations.hypno.binaural.setVolume("loud" as never)).toThrow(/number/);
		});

		it("glides to another beat, clamped to a sane range, and resets when the trance ends", () => {
			allow();
			hypnotize();
			api.operations.hypno.binaural.setBeat(4);
			expect(binauralInfo().beatHz).toBe(4);
			api.operations.hypno.binaural.setBeat(500);
			expect(binauralInfo().beatHz).toBe(BINAURAL_BEATS.MAX_BEAT_HZ);
			wake();
			hypnotize();
			expect(binauralInfo().beatHz).toBe(6);
			expect(api.operations.hypno.binaural.getState().volume).toBe(1);
		});

		it("hears about it starting and stopping", () => {
			const seen: unknown[] = [];
			api.events.on("hypno.binauralChanged", e => seen.push(e));
			hypnotize();
			wake();
			expect(seen).toEqual([
				{ playing: true, beatHz: 6, volume: 0.4 * BINAURAL_BEATS.MAX_GAIN },
				{ playing: false, beatHz: 0, volume: 0 },
			]);
		});
	});
});
