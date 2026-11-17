// Runs test/ui/map-perf.spec.ts (opt-in browser measurement of map and lighting frame times).
//   npm run build && npm run perf:map                 GPU canvas
//   npm run perf:map -- --software                    software-rasterised canvas (the low-end case)
// Extra arguments go to Playwright. Results: test/.out/map-perf-*.json; see docs/perf-baseline.md.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const software = args.includes("--software");
const env = { ...process.env, MAP_PERF: "1", ...(software ? { MAP_PERF_SOFTWARE: "1" } : {}) };
const pass = args.filter(a => a !== "--software");
const result = spawnSync("npx", ["playwright", "test", "test/ui/map-perf.spec.ts", "--workers=1", ...pass], { stdio: "inherit", env, shell: true });
process.exit(result.status ?? 1);
