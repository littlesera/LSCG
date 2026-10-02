#!/usr/bin/env node
// Assembles the @lscg/types npm package in build/types-package/: the API typings that `npm run build:api-types`
// emits, plus packages/types/ (package.json, README, LICENSE), versioned to match LSCG. Publish with
// `npm publish ./build/types-package` (the Release workflow does this).
//
//   --prerelease <id>   version it as a prerelease, e.g. `--prerelease beta.12` gives 0.9.3-beta.12
//                       (the Dev workflow publishes these under npm's "beta" tag).
//
// package.json also gets `lscgTypesHash`, a hash of index.d.ts, so a workflow can skip publishing types that
// haven't changed since the last published version.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const OUT = "build/types-package";
const TYPES = "dist/api/types.d.ts";

if (!existsSync(TYPES)) {
    console.error(`pack-types: ${TYPES} is missing; run \`npm run build:api-types\` first.`);
    process.exit(1);
}

const flag = process.argv.indexOf("--prerelease");
const prerelease = flag >= 0 ? process.argv[flag + 1] : undefined;
if (flag >= 0 && !/^[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*$/.test(prerelease ?? "")) {
    console.error("pack-types: --prerelease needs an id such as beta.12");
    process.exit(1);
}
const base = JSON.parse(readFileSync("package.json", "utf8")).version.replace(/^v/, "");
const version = prerelease ? `${base}-${prerelease}` : base;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("packages/types", OUT, { recursive: true });
cpSync(TYPES, `${OUT}/index.d.ts`);

const pkg = JSON.parse(readFileSync(`${OUT}/package.json`, "utf8"));
pkg.version = version;
pkg.lscgTypesHash = createHash("sha256").update(readFileSync(TYPES)).digest("hex");
writeFileSync(`${OUT}/package.json`, JSON.stringify(pkg, null, 2) + "\n");
console.log(`pack-types: ${pkg.name}@${version} assembled in ${OUT}`);
