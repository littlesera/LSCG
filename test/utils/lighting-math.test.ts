// lighting.math.ts: the pure geometry behind the map lighting engine -- obstacle to
// segment conversion, collinear segment merging, ray/segment intersection, and the
// visibility polygon cast from a viewpoint.
import { describe, expect, it } from "vitest";
import { generateSegments, getIntersection, getVisibilityPolygon, mergeSegments, optimizeSegments } from "Utilities/lighting.math";
import { makeRoomObstacles } from "../bench/lighting-rooms";
import type { Segment } from "Utilities/lighting.types";

const seg = (x1: number, y1: number, x2: number, y2: number): Segment => ({ p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } });

describe("generateSegments", () => {
	it("closes a polygon", () => {
		const segments = generateSegments([{ type: "polygon", points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }]);
		expect(segments).toEqual([seg(0, 0, 1, 0), seg(1, 0, 0, 1), seg(0, 1, 0, 0)]);
	});

	it("leaves a line open", () => {
		const segments = generateSegments([{ type: "line", points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 2 }] }]);
		expect(segments).toEqual([seg(0, 0, 1, 0), seg(1, 0, 2, 2)]);
	});

	it("turns a rectangle into four sides", () => {
		const segments = generateSegments([{ type: "rectangle", topLeft: { x: 0, y: 0 }, bottomRight: { x: 2, y: 1 } }]);
		expect(segments).toEqual([seg(0, 0, 2, 0), seg(2, 0, 2, 1), seg(2, 1, 0, 1), seg(0, 1, 0, 0)]);
	});

	it("approximates an oval with a closed ring, starting at the top", () => {
		const segments = generateSegments([{ type: "oval", center: { x: 10, y: 10 }, radiusX: 4, radiusY: 2, resolution: 4 }]);
		expect(segments).toHaveLength(4);
		expect(segments[0].p1.x).toBeCloseTo(10);
		expect(segments[0].p1.y).toBeCloseTo(8);
		expect(segments[3].p2).toBe(segments[0].p1);
		expect(generateSegments([{ type: "oval", center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 }])).toHaveLength(16);
	});
});

describe("optimizeSegments", () => {
	it("merges overlapping and touching collinear segments", () => {
		const merged = optimizeSegments([seg(0, 0, 2, 0), seg(1, 0, 3, 0), seg(3, 0, 5, 0)]);
		expect(merged).toEqual([seg(0, 0, 5, 0)]);
	});

	it("keeps parallel or disjoint segments apart", () => {
		const input = [seg(0, 0, 1, 0), seg(0, 1, 1, 1), seg(5, 0, 6, 0)];
		expect(optimizeSegments(input)).toEqual(input);
	});

	it("drops zero-length segments", () => {
		expect(optimizeSegments([seg(1, 1, 1, 1), seg(0, 0, 0, 2)])).toEqual([seg(0, 0, 0, 2)]);
	});
});

describe("getIntersection", () => {
	const out = { x: 0, y: 0, t1: 0 };

	it("finds where a ray hits a segment", () => {
		expect(getIntersection({ x: 0, y: 0 }, 1, 0, seg(5, -1, 5, 1), out)).toBe(true);
		expect(out).toEqual({ x: 5, y: 0, t1: 5 });
	});

	it("misses parallel segments, segments behind, and ones the ray passes beside", () => {
		expect(getIntersection({ x: 0, y: 0 }, 1, 0, seg(0, 1, 5, 1), out)).toBe(false);
		expect(getIntersection({ x: 0, y: 0 }, 1, 0, seg(-5, -1, -5, 1), out)).toBe(false);
		expect(getIntersection({ x: 0, y: 0 }, 1, 0, seg(5, 1, 5, 2), out)).toBe(false);
	});
});

describe("getVisibilityPolygon", () => {
	it("is the bounding square with nothing in the way", () => {
		const polygon = getVisibilityPolygon({ x: 0, y: 0, radius: 10 }, []);
		expect(polygon.length).toBeGreaterThan(0);
		for (const p of polygon) expect(Math.max(Math.abs(p.x), Math.abs(p.y))).toBeCloseTo(10);
	});

	it("is cut short by a wall, and ignores walls out of range", () => {
		const wall = seg(3, -20, 3, 20);
		const far = seg(50, -5, 50, 5);
		const polygon = getVisibilityPolygon({ x: 0, y: 0, radius: 10 }, [wall, far]);
		expect(Math.max(...polygon.map(p => p.x))).toBeCloseTo(3);
		expect(Math.min(...polygon.map(p => p.x))).toBeCloseTo(-10);
	});
});

// mergeSegments is the replacement for optimizeSegments on the hot path; the legacy function stays as the reference.
describe("mergeSegments", () => {
	/** Orientation-free, order-free form, so two merges can be compared however each one directs its segments. */
	const canonical = (segments: Segment[]) => segments
		.map(({ p1, p2 }) => {
			const [a, b] = (p1.x < p2.x || (p1.x === p2.x && p1.y <= p2.y)) ? [p1, p2] : [p2, p1];
			return [a.x, a.y, b.x, b.y].map(n => Math.round(n * 1000) / 1000).join(",");
		})
		.sort();

	it("merges overlapping and touching collinear segments, like optimizeSegments", () => {
		expect(mergeSegments([seg(0, 0, 2, 0), seg(1, 0, 3, 0), seg(3, 0, 5, 0)])).toEqual([seg(0, 0, 5, 0)]);
		expect(mergeSegments([seg(0, 0, 0, 2), seg(0, 2, 0, 5)])).toEqual([seg(0, 0, 0, 5)]);
	});

	it("keeps gaps and parallel lines apart", () => {
		expect(canonical(mergeSegments([seg(0, 0, 1, 0), seg(2, 0, 3, 0), seg(0, 5, 3, 5)])))
			.toEqual(canonical([seg(0, 0, 1, 0), seg(2, 0, 3, 0), seg(0, 5, 3, 5)]));
	});

	it("does not merge a horizontal and a vertical segment that meet", () => {
		expect(mergeSegments([seg(0, 0, 2, 0), seg(2, 0, 2, 3)])).toHaveLength(2);
	});

	it("treats coordinates within the tolerance as the same line, despite float error", () => {
		const y = 111.11111111111111;
		const merged = mergeSegments([seg(0, y, 111.1111111111, y + 1e-12), seg(111.1111111111, y - 1e-12, 222.2222222222, y)]);
		expect(merged).toHaveLength(1);
		expect(merged[0].p1.x).toBeCloseTo(0);
		expect(merged[0].p2.x).toBeCloseTo(222.2222222222);
	});

	it("drops zero-length segments", () => {
		expect(mergeSegments([seg(1, 1, 1, 1), seg(0, 0, 4, 0)])).toEqual([seg(0, 0, 4, 0)]);
	});

	it("passes diagonals through the legacy merge, and still merges collinear diagonals", () => {
		const merged = mergeSegments([seg(0, 0, 2, 2), seg(1, 1, 4, 4), seg(0, 5, 1, 6)]);
		expect(canonical(merged)).toEqual(canonical(optimizeSegments([seg(0, 0, 2, 2), seg(1, 1, 4, 4), seg(0, 5, 1, 6)])));
		expect(merged).toHaveLength(2);
	});

	it("gives the same segments as optimizeSegments on rooms of walls", () => {
		for (const [size, tile, seed, density] of [[9, 111, 1, 0.02], [21, 111, 7, 0.08], [21, 33.3333333333, 3, 0.05], [41, 24, 11, 0.03]] as const) {
			const raw = generateSegments(makeRoomObstacles({ size, tile, seed, density }));
			expect(canonical(mergeSegments(raw)), `${size}x${size} seed ${seed}`).toEqual(canonical(optimizeSegments(raw)));
		}
	});

	it("gives the same segments as optimizeSegments with oval pillars in the room", () => {
		for (const seed of [2, 5, 9]) {
			const raw = generateSegments(makeRoomObstacles({ size: 21, tile: 111, seed, pillars: 12 }));
			expect(canonical(mergeSegments(raw)), `seed ${seed}`).toEqual(canonical(optimizeSegments(raw)));
		}
	});

	it("produces the same visibility polygon as optimizeSegments", () => {
		const raw = generateSegments(makeRoomObstacles({ size: 21, tile: 111, seed: 4, pillars: 6 }));
		const origin = { x: 10 * 111 + 55, y: 10 * 111 + 55, radius: 5 * 111 };
		const a = getVisibilityPolygon(origin, mergeSegments(raw));
		const b = getVisibilityPolygon(origin, optimizeSegments(raw));
		expect(a.length).toBe(b.length);
		a.forEach((pt, i) => { expect(pt.x).toBeCloseTo(b[i].x, 6); expect(pt.y).toBeCloseTo(b[i].y, 6); });
	});

	it("is much faster than optimizeSegments on a full map", () => {
		const raw = generateSegments(makeRoomObstacles({ size: 41, tile: 24 }));
		const time = (fn: () => void) => { const t = performance.now(); fn(); return performance.now() - t; };
		const legacy = time(() => optimizeSegments(raw));
		const fast = time(() => mergeSegments(raw));
		// Measured at roughly 200 ms versus 0.1 ms; the bound is loose so a slow CI machine cannot trip it.
		expect(fast * 20).toBeLessThan(legacy);
	});
});
