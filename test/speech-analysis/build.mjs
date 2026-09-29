// Temporary standalone runner for the speech analysis cases until the repo-wide Vitest setup lands.
// Bundles test.ts with esbuild, swapping LSCG modules that need a live Bondage Club for the stubs in ./stubs.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const utils = path.join(here, "stubs/utils.ts");
const misc = path.join(here, "stubs/misc.ts");
const alias = {
    "../utils": utils, "utils": utils, "base": misc, "modules": misc,
    "Settings/setting_definitions": misc, "Settings/speech-analysis": misc,
    "./States/RedressedState": misc,
};

await build({
    entryPoints: [path.join(here, "test.ts")],
    bundle: true, platform: "node", format: "esm", outfile: path.join(here, ".out/test.mjs"),
    logLevel: "warning",
    tsconfig: path.join(root, "tsconfig.json"),
    plugins: [{ name: "stub-bc-modules", setup(b) { b.onResolve({ filter: /.*/ }, a => alias[a.path] ? { path: alias[a.path] } : undefined); } }],
});
