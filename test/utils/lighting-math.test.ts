// lighting.math.ts: the pure geometry behind the map lighting engine -- obstacle to
// segment conversion, collinear segment merging, ray/segment intersection, and the
// visibility polygon cast from a viewpoint.
import { describe, expect, it } from "vitest";
import { generateSegments, getIntersection, getVisibilityPolygon, optimizeSegments } from "Utilities/lighting.math";
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
