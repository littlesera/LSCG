// utilities/perf.ts: the rolling timing samples exposed as window.lscgPerf.
import { beforeEach, describe, expect, it } from "vitest";
import { exposePerf, perfSnapshot, PerfSeries, recordPerf, resetPerf } from "Utilities/perf";

describe("PerfSeries", () => {
	it("is all zero when empty", () => {
		expect(new PerfSeries().stats()).toEqual({ count: 0, mean: 0, p95: 0, max: 0 });
	});

	it("summarises recorded samples", () => {
		const s = new PerfSeries();
		for (let i = 1; i <= 100; i++) s.record(i);
		const stats = s.stats();
		expect(stats.count).toBe(100);
		expect(stats.mean).toBeCloseTo(50.5);
		expect(stats.max).toBe(100);
		expect(stats.p95).toBeGreaterThanOrEqual(95);
	});

	it("keeps only the newest samples once full", () => {
		const s = new PerfSeries(4);
		for (let i = 1; i <= 10; i++) s.record(i);
		const stats = s.stats();
		expect(stats.count).toBe(4);
		expect(stats.max).toBe(10);
		expect(stats.mean).toBeCloseTo(8.5); // 7, 8, 9, 10
	});
});

describe("lscgPerf", () => {
	beforeEach(() => resetPerf());

	it("records into named series and snapshots them", () => {
		recordPerf("drawGrid", 2);
		recordPerf("drawGrid", 4);
		expect(perfSnapshot().drawGrid.mean).toBe(3);
		expect(perfSnapshot().lightingRender.count).toBe(0);
	});

	it("installs snapshot and reset on the target", () => {
		const target: { lscgPerf?: { snapshot: () => ReturnType<typeof perfSnapshot>; reset: () => void } } = {};
		exposePerf(target);
		recordPerf("lightingCompute", 5);
		expect(target.lscgPerf!.snapshot().lightingCompute.count).toBe(1);
		target.lscgPerf!.reset();
		expect(target.lscgPerf!.snapshot().lightingCompute.count).toBe(0);
	});
});
