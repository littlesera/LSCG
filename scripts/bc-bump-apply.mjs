#!/usr/bin/env node
// Used by .github/workflows/bc-bump.yml after `BC_CLIENT=latest npm run test:bc`
// has passed: rewrites test/bc-client.json to the new commit/version.
// Usage: node scripts/bc-bump-apply.mjs <sha> <gameVersion>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [, , sha, gameVersion] = process.argv;
if (!sha || !gameVersion) {
	console.error("Usage: node scripts/bc-bump-apply.mjs <sha> <gameVersion>");
	process.exit(1);
}

const pinFile = join(dirname(dirname(fileURLToPath(import.meta.url))), "test", "bc-client.json");
const pin = JSON.parse(readFileSync(pinFile, "utf-8"));
pin.commit = sha;
pin.gameVersion = gameVersion;
writeFileSync(pinFile, JSON.stringify(pin, null, "\t") + "\n");
console.log(`bc-bump-apply: test/bc-client.json now pins ${sha} (${gameVersion})`);
