// Screenshots every LSCG settings screen in the BC playground, to test/.out/ui/<screen>.png, for a quick visual check.
// Needs the playground running (`npm run playground`) and agent-browser installed (`npm i -g agent-browser`).
//   npm run build && npm run ui:shots [-- "Screen name" ...]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "test", ".out", "ui");
const URL = `http://localhost:${process.env.PORT ?? 10003}/`;

const browser = (...args) => execFileSync("agent-browser", args, { encoding: "utf-8", maxBuffer: 1 << 26 }).trim();
/** Runs `js` (an expression, may await) in the page and returns its JSON-decoded result. */
const evaluate = js => {
    const out = execFileSync("agent-browser", ["eval", "--stdin"], { input: `(async () => JSON.stringify(${js}))()`, encoding: "utf-8" }).trim();
    return JSON.parse(JSON.parse(out));
};

mkdirSync(OUT, { recursive: true });
browser("set", "viewport", "1600", "800");
browser("open", URL);
browser("wait", "--load", "networkidle", "--timeout", "240000");
evaluate("await Playground.login()");
// The first open races BC's own Preference screen load; open once to settle it.
evaluate("await Playground.openSettings()");

const wanted = process.argv.slice(2);
const screens = wanted.length ? wanted
    : evaluate("LSCG.getModule('GUI').subscreens.filter(s => s.name !== 'MainMenu' && !s.hidden).map(s => s.name)");

for (const name of screens) {
    const opened = evaluate(`await Playground.openSettings(${JSON.stringify(name)})`);
    if (opened !== name) {
        console.error(`could not open "${name}" (got "${opened}")`);
        process.exitCode = 1;
        continue;
    }
    evaluate("await new Promise(r => setTimeout(r, 400))"); // images and fonts
    const file = join(OUT, `${name.replace(/[^\w-]+/g, "_")}.png`);
    browser("screenshot", file);
    console.log(file);
}
