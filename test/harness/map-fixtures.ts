// Fixtures for map tests: a text-drawn room wired into the globals MapModule reads from BC.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

/** A room from rows of characters: "#" wall, "D" door, "L" lamppost, "." floor. The player stands at "P". */
export function room(rows: string[]) {
	const height = rows.length;
	const width = rows[0].length;
	const at = (x: number, y: number) => rows[y]?.[x] ?? " ";
	let px = 0, py = 0;
	rows.forEach((r, y) => { const x = r.indexOf("P"); if (x >= 0) { px = x; py = y; } });
	g.ChatRoomMapViewWidth = width;
	g.ChatRoomMapViewHeight = height;
	g.Player.MapData = { Pos: { X: px, Y: py } };
	g.ChatRoomData = { Admin: [], MapData: {} };
	g.ChatRoomMapViewIsWall = (x: number, y: number) => at(x, y) === "#";
	g.ChatRoomMapViewGetTileAtPos = (x: number, y: number) => (at(x, y) === "#" || at(x, y) === "D") ? { Type: "Wall" } : { Type: "Floor" };
	g.ChatRoomMapViewGetObjectAtPos = (x: number, y: number) => at(x, y) === "D" ? { Type: "WallPath", Style: "Wood" } : at(x, y) === "L" ? { ID: 2090 } : at(x, y) === "W" ? { Type: "WallPath", Style: "WoodOpen" } : null;
	g.ChatRoomMapViewGetCharacterAtPos = () => null;
	g.MapManager = { Map: { getTileId: () => 0, getEffects: (x: number, y: number) => at(x, y) === "S" ? [{ Type: "StaticLighting", Color: [10, 20, 30, 1] }] : [] } };
}

/** Canonical layouts shared by lighting tests, so tests, benchmarks and browser scenarios talk about the same rooms. */
export const mapLayouts = {
	/** Open floor with lights and no walls: lights are never occluded. */
	openField: [
		"..........",
		"...L......",
		"..........",
		".....P....",
		"..........",
		"......L...",
	],
	/** Small rooms joined by doors, one of them already open ("W"): doors depend on which side the player stands. */
	doorRooms: [
		"#####D#####",
		"#....P....#",
		"#....L....#",
		"####D##W###",
		"#.........#",
		"###########",
	],
	/** One long wall plus a field of single pillars: exercises segment merging and the single-column special case. */
	longWallPillars: [
		"###########",
		".#.#.#.#.#.",
		"...........",
		".#.#.#.#.#.",
		"....P......",
		"###########",
	],
} as const;
