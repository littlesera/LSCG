#!/usr/bin/env node
// Used by .github/workflows/bc-bump.yml: resolves BondageClub's `master` HEAD
// and decides whether test/bc-client.json's pin is worth bumping to it.
// Writes `should_bump`, `sha`, `game_version` to $GITHUB_OUTPUT when run in CI
// (falls back to plain stdout otherwise), and always prints a one-line summary.
import { appendFileSync } from "node:fs";
import { readPinnedConfig, resolveLatestSha } from "./bc-client.mjs";

const pin = readPinnedConfig();
const sha = resolveLatestSha(pin.repo);

const base = pin.repo.replace(/\.git$/, "");
const res = await fetch(`${base}/-/raw/${sha}/BondageClub/Scripts/Game.js`);
if (!res.ok) throw new Error(`Failed to fetch Game.js at ${sha}: HTTP ${res.status}`);
const gameVersion = (await res.text()).match(/GameVersion\s*=\s*"([^"]+)"/)?.[1];
if (!gameVersion) throw new Error(`Could not find GameVersion in Game.js at ${sha}`);

const isBeta = /Beta/i.test(gameVersion);
const unchanged = sha === pin.commit || gameVersion === pin.gameVersion;
const shouldBump = !isBeta && !unchanged;

const reason = isBeta ? "master is on a beta version" : unchanged ? "no change since the current pin" : "ready to bump";
console.log(`bc-bump-check: master=${sha.slice(0, 7)} GameVersion=${gameVersion} (pinned: ${pin.commit.slice(0, 7)}/${pin.gameVersion}) -- ${reason}`);

const out = process.env.GITHUB_OUTPUT;
if (out) {
	appendFileSync(out, `should_bump=${shouldBump}\nsha=${sha}\ngame_version=${gameVersion}\n`);
}
