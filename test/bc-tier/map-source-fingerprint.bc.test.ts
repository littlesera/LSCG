// Tripwire for the BC map code LSCG's performance work depends on or replaces.
//
// Each function below is read from the pinned BC client's source, stripped of comments and whitespace, and hashed. When
// BC changes one, this test fails, which makes the weekly bc-bump workflow (it runs `test:bc` against BC master) file an
// issue instead of moving the pin. The fix is human: read the upstream diff, check whether LSCG's hook, patch, or
// replacement for that function still matches, then refresh the hashes with
//
//   UPDATE_MAP_FINGERPRINTS=1 npm run test:bc -- map-source-fingerprint
//
// Nothing here evaluates BC's map code (see FINGERPRINT_FILES in scripts/bc-client.mjs); it only compares text.
import { describe, expect, inject, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractSource, normalizeSource } from "./map-source";

/** The code being watched, and where it lives. `kind: "method"` is a class method (indented, no `function` keyword). */
const WATCHED: { name: string; file: string; kind: "function" | "method"; reason: string }[] = [
	{ name: "ChatRoomMapViewDrawGrid", file: "Screens/Online/ChatRoom/ChatRoomMapView.js", kind: "function", reason: "wrapped by lighting; optional fast renderer replaces it" },
	{ name: "ChatRoomMapViewWallEffect", file: "Screens/Online/ChatRoom/ChatRoomMapView.js", kind: "function", reason: "wall overlay drawing" },
	{ name: "ChatRoomMapViewFindWallEffectTile", file: "Screens/Online/ChatRoom/ChatRoomMapView.js", kind: "function", reason: "replaced by the opt-in wall-effect table" },
	{ name: "ChatRoomMapViewFloorWallEffect", file: "Screens/Online/ChatRoom/ChatRoomMapView.js", kind: "function", reason: "floor wall overlay selection" },
	{ name: "updatePlayerPerception", file: "Scripts/Map.js", kind: "method", reason: "patched by the opt-in fast perception" },
	{ name: "DrawImageEx", file: "Scripts/Drawing.js", kind: "function", reason: "hot shared draw path; optional fast path wraps it" },
];

const FINGERPRINT_FILE = join(dirname(fileURLToPath(import.meta.url)), "map-source-fingerprints.json");
const bcDir = inject("bcClientDir");

function fingerprintsFromSource(): Record<string, string> {
	const out: Record<string, string> = {};
	for (const w of WATCHED) {
		const text = readFileSync(join(bcDir, ...w.file.split("/")), "utf-8");
		const source = extractSource(text, w.name, w.kind);
		if (!source) throw new Error(`${w.name} not found in ${w.file}. BC renamed or removed it; LSCG code that relies on it needs review.`);
		out[w.name] = createHash("sha256").update(normalizeSource(source)).digest("hex").slice(0, 16);
	}
	return out;
}

describe("BC map source fingerprints", () => {
	const actual = fingerprintsFromSource();

	it("matches the stored hashes for every watched function", () => {
		if (process.env.UPDATE_MAP_FINGERPRINTS) {
			writeFileSync(FINGERPRINT_FILE, JSON.stringify({ gameVersion: inject("bcGameVersion"), functions: actual }, null, "\t") + "\n");
			return;
		}
		const stored = JSON.parse(readFileSync(FINGERPRINT_FILE, "utf-8")) as { gameVersion: string; functions: Record<string, string> };
		const changed = WATCHED.filter(w => stored.functions[w.name] !== actual[w.name]);
		expect(
			changed.map(w => `${w.name} (${w.file}) changed upstream; used for: ${w.reason}`),
			`BC's map code changed since ${stored.gameVersion}. Read the upstream diff, confirm LSCG's hooks still match, then run: UPDATE_MAP_FINGERPRINTS=1 npm run test:bc -- map-source-fingerprint`,
		).toEqual([]);
	});

	it("watches every function once", () => {
		expect(new Set(WATCHED.map(w => w.name)).size).toBe(WATCHED.length);
		expect(Object.keys(actual).sort()).toEqual(WATCHED.map(w => w.name).sort());
	});
});
