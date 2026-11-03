// Packs and unpacks the pinned Bondage College client files (the ones scripts/bc-client.mjs downloads for the "bc" test project).
//
// Why: gitgud.io sits behind a Cloudflare challenge that only a real browser passes, so CI can't download the client from
// it. Instead the files are packed once (`npm run bc:pack`), uploaded as an asset on this repo's "bc-client" release, and CI
// unpacks them (`npm run bc:fetch`) into .cache/ where scripts/bc-client.mjs finds them already present and never calls gitgud.
//
//   node scripts/bc-client-archive.mjs pack    packs .cache/bc-<version>-<sha7>/ into .cache/<archive name>
//   node scripts/bc-client-archive.mjs fetch   downloads that archive from BC_CLIENT_ARCHIVE_BASE and unpacks it into .cache/
//
// `fetch` never fails the job: if the archive is missing it says so and leaves the download from gitgud as the fallback.
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { ALL_FILES, cacheDirFor, readPinnedConfig } from "./bc-client.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CACHE_ROOT = join(ROOT, ".cache");

/** Where the archives live unless told otherwise: the "bc-client" release of this repository. */
export const DEFAULT_ARCHIVE_BASE = "https://github.com/littlesera/LSCG/releases/download/bc-client";

/** The archive's file name for a pin, e.g. "bc-client-R133-dde078f.tar.gz". */
export function archiveName(pin = readPinnedConfig()) {
	return `bc-client-${pin.gameVersion}-${pin.commit.slice(0, 7)}.tar.gz`;
}

export function archiveUrl(pin = readPinnedConfig(), base = process.env.BC_CLIENT_ARCHIVE_BASE || DEFAULT_ARCHIVE_BASE) {
	return `${base.replace(/\/+$/, "")}/${archiveName(pin)}`;
}

/** The client files a directory is missing (all of them, for a directory that isn't there). */
export function missingFiles(dir) {
	return ALL_FILES.filter(relPath => !existsSync(join(dir, ...relPath.split("/"))));
}

export function pack(pin = readPinnedConfig()) {
	const dir = cacheDirFor(pin.gameVersion, pin.commit);
	const missing = missingFiles(dir);
	if (missing.length > 0)
		throw new Error(`${dir} is missing ${missing.length} client file(s) (first: ${missing[0]}). Run \`npm run fetch-bc\` in a browser-reachable setup first, or copy a complete .cache/bc-* folder here.`);
	const out = join(CACHE_ROOT, archiveName(pin));
	rmSync(out, { force: true });
	// Relative names from inside the cache folder: GNU tar reads "E:\..." (a Windows drive) as a remote host.
	execFileSync("tar", ["-czf", archiveName(pin), dir.slice(CACHE_ROOT.length + 1)], { cwd: CACHE_ROOT, stdio: "inherit" });
	return out;
}

export async function fetchArchive(pin = readPinnedConfig()) {
	const dir = cacheDirFor(pin.gameVersion, pin.commit);
	if (missingFiles(dir).length === 0) {
		console.log(`bc-client-archive: ${dir} is already complete.`);
		return true;
	}
	const url = archiveUrl(pin);
	let res;
	try {
		res = await fetch(url, { redirect: "follow" });
	} catch (err) {
		console.warn(`bc-client-archive: could not reach ${url}: ${err.message}`);
		return false;
	}
	if (!res.ok) {
		console.warn(`bc-client-archive: ${url} answered HTTP ${res.status}; leaving the download from gitgud as the fallback.`);
		return false;
	}
	mkdirSync(CACHE_ROOT, { recursive: true });
	const file = join(CACHE_ROOT, archiveName(pin));
	try {
		writeFileSync(file, Buffer.from(await res.arrayBuffer()));
		execFileSync("tar", ["-xzf", archiveName(pin)], { cwd: CACHE_ROOT, stdio: "inherit" });
	} finally {
		rmSync(file, { force: true });
	}
	const missing = missingFiles(dir);
	if (missing.length > 0) {
		console.warn(`bc-client-archive: the archive left ${missing.length} file(s) missing (first: ${missing[0]}).`);
		return false;
	}
	console.log(`bc-client-archive: unpacked ${archiveName(pin)} into ${dir}.`);
	return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const command = process.argv[2];
	if (command === "pack") {
		const out = pack();
		const pin = readPinnedConfig();
		console.log(`\nPacked ${out}\nUpload it to the "bc-client" release (create the release once, then add or replace the asset):\n\n  gh release create bc-client --title "BC client files" --notes "Pinned BC client files for CI (see scripts/bc-client-archive.mjs)" --prerelease  # first time only\n  gh release upload bc-client "${out}" --clobber\n\nThen CI downloads ${archiveUrl(pin)}`);
	} else if (command === "fetch") {
		await fetchArchive();
	} else {
		console.error("Usage: node scripts/bc-client-archive.mjs <pack|fetch>");
		process.exit(2);
	}
}
