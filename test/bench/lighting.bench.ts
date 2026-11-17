// Timings for the lighting math, at the default view and at the full-map zoom-out some mods allow.
//
// Run with `npm run bench` (its own config, vitest.bench.config.ts; Vitest 5 has no `bench()` API to use here). Not part
// of `npm test`: absolute times vary between machines, so compare runs on the same machine (see docs/perf-baseline.md).
// The only assertions are loose sanity checks, not performance thresholds.
//
// Results are printed as a table and written to test/.out/bench-lighting.json.
import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { generateSegments, getVisibilityPolygon, mergeSegments, optimizeSegments } from "Utilities/lighting.math";
import { lightingScenarios, makeLights, makeRoomObstacles } from "./lighting-rooms";

/** Mean milliseconds per call over `iterations` calls, after `warmup` untimed calls. */
function measure(fn: () => void, iterations: number, warmup = 1): number {
	for (let i = 0; i < warmup; i++) fn();
	const start = performance.now();
	for (let i = 0; i < iterations; i++) fn();
	return (performance.now() - start) / iterations;
}

type Row = { scenario: string; step: string; ms: number; detail?: string };

describe("lighting math timings", () => {
	const rows: Row[] = [];

	for (const { name, size, tile, lights } of lightingScenarios) {
		it(name, () => {
			const obstacles = makeRoomObstacles({ size, tile });
			const raw = generateSegments(obstacles);
			const merged = optimizeSegments(raw);
			const origins = makeLights(lights, size, tile);
			const viewpoint = { x: size * tile / 2, y: size * tile / 2, radius: size * tile / 2 };

			const generate = measure(() => { generateSegments(obstacles); }, 20);
			// The O(n^3) merge dominated every full compute before the sweep merge replaced it.
			const legacyMerge = measure(() => { optimizeSegments(raw); }, size > 30 ? 1 : 3);
			const fastMerge = measure(() => { mergeSegments(raw); }, 200);
			const lightPolys = measure(() => { for (const light of origins) getVisibilityPolygon(light, merged); }, 5);
			const vision = measure(() => { getVisibilityPolygon(viewpoint, merged); }, 5);

			rows.push(
				{ scenario: name, step: "generateSegments", ms: generate, detail: `${raw.length} raw segments` },
				{ scenario: name, step: "optimizeSegments (legacy)", ms: legacyMerge, detail: `${merged.length} merged segments` },
				{ scenario: name, step: "mergeSegments (current)", ms: fastMerge },
				{ scenario: name, step: `${lights} light polygons`, ms: lightPolys },
				{ scenario: name, step: "viewpoint polygon", ms: vision },
				{ scenario: name, step: "full compute (legacy)", ms: generate + legacyMerge + lightPolys + vision },
				{ scenario: name, step: "full compute (current)", ms: generate + fastMerge + lightPolys + vision },
			);
			expect(merged.length).toBeGreaterThan(0);
			expect(merged.length).toBeLessThanOrEqual(raw.length);
		});
	}

	it("reports", () => {
		const out = rows.map(r => `${r.scenario.padEnd(34)} ${r.step.padEnd(28)} ${r.ms.toFixed(3).padStart(9)} ms  ${r.detail ?? ""}`);
		console.log(`\n${out.join("\n")}\n`);
		mkdirSync("test/.out", { recursive: true });
		writeFileSync("test/.out/bench-lighting.json", JSON.stringify({ when: new Date().toISOString(), rows }, null, 2));
	});
});
