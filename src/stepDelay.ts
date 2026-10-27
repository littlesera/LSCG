/** The shortest and longest one step of a sequence (a spell's next effect, a suggestion's next instruction) may wait for the one before it,
 *  whoever asks: the person who wrote it, an extension, a listener. */
export const MIN_STEP_DELAY = 1000;
export const MAX_STEP_DELAY = 30_000;

/** A delay from anywhere: a finite, non-negative number of ms, raised to the minimum or cut to the maximum; anything else is undefined. */
export function cleanDelay(delay: unknown): number | undefined {
    return typeof delay === "number" && Number.isFinite(delay) && delay >= 0 ? Math.min(Math.max(Math.round(delay), MIN_STEP_DELAY), MAX_STEP_DELAY) : undefined;
}
