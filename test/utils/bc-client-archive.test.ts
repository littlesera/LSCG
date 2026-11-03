// The BC client archive helpers: CI unpacks the client files from this repo's release instead of downloading from gitgud.io.
import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ALL_FILES } from "../../scripts/bc-client.mjs";
import { archiveName, archiveUrl, DEFAULT_ARCHIVE_BASE, missingFiles } from "../../scripts/bc-client-archive.mjs";

describe("bc-client-archive", () => {
	const pin = { repo: "x", commit: "dde078f5f60d5431172c01f1d295334e2c7ef0f4", gameVersion: "R133" };
	const dirs: string[] = [];
	afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

	it("names the archive by BC version and short commit", () => {
		expect(archiveName(pin)).toBe("bc-client-R133-dde078f.tar.gz");
	});

	it("finds it on the repo's bc-client release, or on another base, with or without a trailing slash", () => {
		expect(archiveUrl(pin, DEFAULT_ARCHIVE_BASE)).toBe("https://github.com/littlesera/LSCG/releases/download/bc-client/bc-client-R133-dde078f.tar.gz");
		expect(archiveUrl(pin, "http://localhost:8765/")).toBe("http://localhost:8765/bc-client-R133-dde078f.tar.gz");
	});

	it("reports which client files a folder is missing, and none for a complete one", () => {
		const dir = mkdtempSync(join(tmpdir(), "bc-archive-test-"));
		dirs.push(dir);
		expect(missingFiles(join(dir, "nope"))).toHaveLength(ALL_FILES.length);
		for (const rel of ALL_FILES.slice(1)) {
			const dest = join(dir, ...rel.split("/"));
			mkdirSync(dirname(dest), { recursive: true });
			writeFileSync(dest, "x");
		}
		expect(missingFiles(dir)).toEqual([ALL_FILES[0]]);
		const first = join(dir, ...ALL_FILES[0].split("/"));
		mkdirSync(dirname(first), { recursive: true });
		writeFileSync(first, "x");
		expect(missingFiles(dir)).toEqual([]);
	});
});
