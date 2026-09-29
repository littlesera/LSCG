// Time and randomness control. LSCG reads time via `CommonTime()` (bc-lite.ts backs
// it with `Date.now()`) and `new Date().getTime()` directly, and randomness via
// `Math.random()` (utils.ts's getRandomInt/getRandomEntry). Both respond to these.
import { vi } from "vitest";

export function useFakeTimers(): void {
	vi.useFakeTimers();
}

export function useRealTimers(): void {
	vi.useRealTimers();
}

/** Advances fake time and runs any timers (setTimeout/setInterval) that fall due. */
export function advance(ms: number): void {
	vi.advanceTimersByTime(ms);
}

/** Invokes the (possibly hooked) global TimerProcess, driving StateModule's tick,
 *  hypno's cooldowns, cursed-item scans, the collar's choke interval, and so on. */
export function timerProcess(): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).TimerProcess(Date.now());
}

/**
 * Makes Math.random() return `values` in order, repeating the last value once
 * exhausted (so a test only needs to specify as many rolls as it cares about).
 */
export function seedRandom(values: number[]): void {
	let i = 0;
	vi.spyOn(Math, "random").mockImplementation(() => values[Math.min(i++, values.length - 1)]);
}

export function restoreRandom(): void {
	vi.spyOn(Math, "random").mockRestore();
}
