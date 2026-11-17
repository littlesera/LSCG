# Map and lighting performance baseline

Measured with `npm run build && npm run perf:map` (test/ui/map-perf.spec.ts): a 40x40 map room in the BC playground (BC R133
client, LSCG built from this branch), the player walking one tile every 200 ms for 6 s, timings from `window.lscgPerf`.
Headless Chromium on the development machine. **This Chromium rasterises the canvas in software** (forcing it with
`--software` gives the same result), so these numbers are the low-end case. There is no GPU-accelerated measurement yet.
Heap growth is not recorded: `performance.memory` is not available in this browser.

Lighting compute runs in a worker; `lightingCompute` here is only the time to post the job, so compute cost is covered by
the Node benchmark below until worker round-trip timing is recorded.

## Browser, before any optimisation (commit 0.6)

| Scenario | fps | drawGrid mean / p95 | Light render mean / p95 | Long tasks |
|---|---|---|---|---|
| range 4, split 1000, vanilla | 60.0 | 1.73 / 2.50 ms | n/a | 0 |
| range 4, split 1000, lighting | 4.4 | 1.97 / 2.90 ms | **213.6 / 258.5 ms** | 28 (6.2 s) |
| range 20, split 1000, vanilla | 33.2 | **19.70 / 25.20 ms** | n/a | 0 |
| range 20, split 1000, lighting | 3.1 | 28.31 / 62.60 ms | **264.5 / 341.5 ms** | 20 (6.1 s) |
| range 20, split 2000, lighting | 3.1 | 24.40 / 41.60 ms | **275.7 / 343.6 ms** | 20 (6.2 s) |

What this changes in the plan:
- **Lighting rendering is the dominant cost on a software canvas**, about 210-275 ms per frame even at the default zoom,
  which is roughly 100x the vanilla map draw there. The render caches (sprite cache, cached vision canvas, half-resolution
  layers, lightmap) are therefore the highest-value lighting items, ahead of the segment-merge fix for frame rate. The merge
  fix still matters for lag at full-map zoom.
- Vanilla `drawGrid` at range 4 is cheap (about 1.7 ms) and confirms the estimate. At range 20 it is about 20 ms, roughly 11x,
  so the full-map zoom-out case is real but far smaller than the lighting cost.
- split 2000 did not add much over split 1000 at range 20 here (the view is already limited by tile count at that zoom).

## Node, lighting math only (`npm run bench`)

| Scenario | Full compute (legacy merge) | Of which `optimizeSegments` |
|---|---|---|
| 21x21, 6 lights | ~4.5 ms | ~3.6 ms |
| 41x41, 20 lights | ~204 ms | ~202 ms |
| 41x41, 40 lights | ~198 ms | ~195 ms |

## After step 1.1 (`mergeSegments` replaces `optimizeSegments`)

| Scenario | Full compute before | Full compute after | Merge step before / after |
|---|---|---|---|
| 21x21, 6 lights | ~4.6 ms | ~0.8 ms | ~3.8 ms / ~0.02 ms |
| 41x41, 20 lights | ~205 ms | ~3.0 ms | ~203 ms / ~0.08 ms |
| 41x41, 40 lights | ~202 ms | ~3.0 ms | ~199 ms / ~0.06 ms |

Segment output is identical to the legacy merge (property tests in `test/utils/lighting-math.test.ts`, including oval pillars).

Later phases add their after-numbers below.
