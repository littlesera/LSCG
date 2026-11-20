// Synthetic rooms for the lighting benchmarks and for the property tests that compare lighting math implementations.
// Deterministic (seeded) so a bench or a failing property case can be reproduced.
import type { OpaqueObstacle, Point } from "Utilities/lighting.types";

export function seededRandom(seed: number): () => number {
	let s = seed >>> 0;
	return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

export interface RoomOptions {
	/** Window size in tiles (the lighting window is square). 21 is the default view, 41 is a zoomed-out full map. */
	size: number;
	/** Pixels (or any unit) per tile. */
	tile: number;
	seed?: number;
	/** Chance that any floor tile becomes a loose wall block. */
	density?: number;
	/** Add isolated pillars as oval obstacles, like the single-column walls in MapModule. */
	pillars?: number;
}

/**
 * Builds obstacles the way MapModule.ParseMapForObjects does: for each wall tile, a top line when the tile is open
 * above or below, and left/right lines when open to the side below. The layout is a border, long wall runs with gaps
 * (rooms and corridors), and sparse random blocks.
 */
export function makeRoomObstacles({ size, tile, seed = 7, density = 0.03, pillars = 0 }: RoomOptions): OpaqueObstacle[] {
	const rnd = seededRandom(seed);
	const wall: boolean[][] = [];
	for (let y = 0; y < size; y++) {
		wall.push([]);
		for (let x = 0; x < size; x++) {
			const border = x === 0 || y === 0 || x === size - 1 || y === size - 1;
			wall[y].push(border
				|| (y % 7 === 0 && x % 7 !== 3 && rnd() < 0.9)
				|| (x % 7 === 0 && y % 7 !== 3 && rnd() < 0.9)
				|| rnd() < density);
		}
	}

	const isWall = (x: number, y: number) => x < 0 || y < 0 || x >= size || y >= size || wall[y][x];
	const obstacles: OpaqueObstacle[] = [];
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (!wall[y][x]) continue;
			const CW = isWall(x - 1, y), CE = isWall(x + 1, y);
			const SW = isWall(x - 1, y + 1), SC = isWall(x, y + 1), SE = isWall(x + 1, y + 1);
			const NC = isWall(x, y - 1);
			const sx = x * tile, sy = y * tile;
			const line = (a: Point, b: Point): OpaqueObstacle => ({ type: "line", points: [a, b] });
			if (!NC || !SC) obstacles.push(line({ x: sx, y: sy }, { x: sx + tile, y: sy }));
			if (SC && (!CW || !SW)) obstacles.push(line({ x: sx, y: sy }, { x: sx, y: sy + tile }));
			if (SC && (!CE || !SE)) obstacles.push(line({ x: sx + tile, y: sy }, { x: sx + tile, y: sy + tile }));
		}
	}

	for (let i = 0; i < pillars; i++) {
		const x = 1 + Math.floor(rnd() * (size - 2));
		const y = 1 + Math.floor(rnd() * (size - 2));
		obstacles.push({
			type: "oval",
			center: { x: x * tile + tile / 2, y: y * tile + tile / 2 },
			radiusX: tile * 0.4,
			radiusY: tile * 0.4,
			resolution: 3,
		});
	}
	return obstacles;
}

/** Light-like origins scattered over the room, with radii of 4 to 6 tiles. */
export function makeLights(count: number, size: number, tile: number, seed = 3): { x: number; y: number; radius: number }[] {
	const rnd = seededRandom(seed);
	return Array.from({ length: count }, () => ({
		x: rnd() * size * tile,
		y: rnd() * size * tile,
		radius: (4 + rnd() * 2) * tile,
	}));
}

/** The scenarios the benchmarks and regression guards cover. */
export const lightingScenarios = [
	{ name: "21x21 default view, 6 lights", size: 21, tile: 111, lights: 6 },
	{ name: "41x41 zoomed out, 20 lights", size: 41, tile: 24, lights: 20 },
	{ name: "41x41 zoomed out, 40 lights", size: 41, tile: 24, lights: 40 },
] as const;
