/**
 * Cheap rolling timing samples for the map and lighting code, readable from the console or a browser test as
 * `window.lscgPerf`. Recording is a couple of array writes per frame, so it is always on and needs no setting.
 */
export class PerfSeries {
	private samples: Float64Array;
	private next = 0;
	private filled = 0;

	constructor(capacity = 240) {
		this.samples = new Float64Array(capacity);
	}

	record(ms: number): void {
		this.samples[this.next] = ms;
		this.next = (this.next + 1) % this.samples.length;
		if (this.filled < this.samples.length) this.filled++;
	}

	clear(): void {
		this.next = 0;
		this.filled = 0;
	}

	/** Summary of the recorded samples; all zero when empty. */
	stats(): { count: number; mean: number; p95: number; max: number } {
		if (this.filled === 0) return { count: 0, mean: 0, p95: 0, max: 0 };
		const sorted = Array.from(this.samples.subarray(0, this.filled)).sort((a, b) => a - b);
		const sum = sorted.reduce((a, b) => a + b, 0);
		return {
			count: this.filled,
			mean: sum / this.filled,
			p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))],
			max: sorted[sorted.length - 1],
		};
	}
}

export type PerfSeriesName = "drawGrid" | "lightingRender" | "lightingAnim" | "lightingCompute" | "lightingLatency";

const series: Record<PerfSeriesName, PerfSeries> = {
	drawGrid: new PerfSeries(),
	lightingRender: new PerfSeries(),
	lightingAnim: new PerfSeries(),
	lightingCompute: new PerfSeries(),
	// Worker round trip: from posting a compute job to its result arriving. The worker's own time is not on the main thread.
	lightingLatency: new PerfSeries(),
};

export function recordPerf(name: PerfSeriesName, ms: number): void {
	series[name].record(ms);
}

export function perfSnapshot(): Record<PerfSeriesName, ReturnType<PerfSeries["stats"]>> {
	return {
		drawGrid: series.drawGrid.stats(),
		lightingRender: series.lightingRender.stats(),
		lightingAnim: series.lightingAnim.stats(),
		lightingCompute: series.lightingCompute.stats(),
		lightingLatency: series.lightingLatency.stats(),
	};
}

export function resetPerf(): void {
	for (const s of Object.values(series)) s.clear();
}

/** Installs `window.lscgPerf = { snapshot, reset }`. */
export function exposePerf(target: { lscgPerf?: unknown } = window as unknown as { lscgPerf?: unknown }): void {
	target.lscgPerf = { snapshot: perfSnapshot, reset: resetPerf };
}
