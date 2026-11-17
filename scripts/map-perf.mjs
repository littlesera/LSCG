// Runs test/ui/map-perf.spec.ts (opt-in browser measurement of map and lighting frame times), or another spec with --spec.
//   npm run parity:map runs test/ui/map-parity.spec.ts (see that file for MAP_PARITY).
//   npm run build && npm run perf:map                 GPU canvas
//   npm run perf:map -- --software                    software-rasterised canvas (the low-end case)
// Extra arguments go to Playwright. Results: test/.out/map-perf-*.json; see docs/perf-baseline.md.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const software = args.includes("--software");
const env = { ...process.env, MAP_PERF: "1", ...(software ? { MAP_PERF_SOFTWARE: "1" } : {}) };
const specIndex = args.indexOf("--spec");
const spec = specIndex >= 0 ? args[specIndex + 1] : "test/ui/map-perf.spec.ts";
const pass = args.filter((a, i) => a !== "--software" && a !== "--spec" && i !== specIndex + 1);
const result = spawnSync("npx", ["playwright", "test", spec, "--workers=1", ...pass], { stdio: "inherit", env, shell: true });
process.exit(result.status ?? 1);
