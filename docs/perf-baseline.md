# Map and lighting performance baseline

Measured with `npm run build && npm run perf:map` (test/ui/map-perf.spec.ts): a 40x40 map room in the BC playground (BC R133
client), the player walking one tile every 200 ms for 6 s, timings from `window.lscgPerf`. Headless Chromium on the development
machine. **This Chromium rasterises the canvas in software** (forcing it with `--software` gives the same result), so these
numbers are the low-end case. There is no GPU-accelerated measurement yet. Heap growth is not recorded: `performance.memory` is
not available in this browser.

The map has about 16 lampposts (static lights), a candelabra, a door, and wall runs. "Before" is the code at commit `3ee17ca4`
(before any lighting change), built in a separate worktree; "after" is this branch. Pixel parity between the two is checked
by `npm run parity:map` (see below).

## A correction to the first baseline

The first browser baseline (commit `3ee17ca4`) was measured with a flaw in the test room: the player's room entry used the wrong
id, so BC did not recognise it as the player and treated it as another character standing on the player's tile. BC's collision
handling then moved the player to a random neighbouring tile every frame, which also made every run different. Those numbers are
not valid and are replaced by the table below. The room now uses the account's `OnlineID`, and the helper fails if the player
does not stay where it was placed.

## Browser, before and after

| Scenario | Before: fps | Before: light render mean / p95 | After: fps | After: light render mean / p95 | Long tasks before / after |
|---|---|---|---|---|---|
| range 4, vanilla (no lighting) | 59.8 | n/a | 60.0 | n/a | 0 / 0 |
| range 4, lighting | 4.6 | 200.0 / 222.6 ms | **45.3** | **10.0 / 13.6 ms** | 30 (6.3 s) / 0 |
| range 20, vanilla | 32.6 | n/a | 29.5 | n/a | 0 / 10 (0.6 s) |
| range 20, lighting | 3.3 | 253.0 / 326.4 ms | **22.0** | **9.9 / 13.1 ms** | 20 (5.8 s) / 38 (2.1 s) |
| range 20, 2000 px wide, lighting | 3.5 | 235.2 / 266.5 ms | **22.0** | **9.8 / 13.8 ms** | 22 (5.9 s) / 36 (2.0 s) |

Vanilla map drawing (`drawGrid`) is about 1.8 ms at range 4 and about 20 ms at range 20, and is untouched by lighting work: at
range 20 it is now the larger share of the frame.

## What made the difference

BC puts a "Blank" static-lighting effect (colour `[0, 0, 0, 0]`) on every tile that has no other lighting. LSCG turned each into
a light, so a 40x40 map held up to **1600 invisible lights** (about 450 inside the lighting window at the default view), each given a
visibility polygon and a clip, gradient and fill pass every frame. Dropping lights that cannot change a pixel (opacity at or
below 0.01) removes that waste without changing the picture. Earlier benchmarks used a handful of lights and missed this entirely.

Smaller contributors, all in this branch: the cubic segment merge (about 200 ms per step at full-map size), recomputing every
polygon on each player step (geometry is now world-space and only the viewpoint moves), re-parsing the map on every character canvas
load, and per-frame allocation.

## Pixel parity with the original code

`npm run parity:map` renders fixed states and compares the canvas with an earlier run (see test/ui/map-parity.spec.ts). Current
branch against the original lighting code, six scenarios (vanilla, open field, beside walls, beside a door, zoom 8, map edge at
zoom 12): **0.000% to 0.002% of pixels differ visibly**, with a largest channel difference of 1 in four of them and under 110
in the other two (a handful of anti-aliased edge pixels).

## Node, lighting math only (`npm run bench`)

These use a handful of lights and so understate real maps, but isolate the algorithms.

| Scenario | Full compute (legacy merge) | Full compute (current merge) | `optimizeSegments` before / `mergeSegments` after |
|---|---|---|---|
| 21x21, 6 lights | ~4.6 ms | ~0.8 ms | ~3.8 ms / ~0.02 ms |
| 41x41, 20 lights | ~205 ms | ~3.0 ms | ~203 ms / ~0.08 ms |
| 41x41, 40 lights | ~202 ms | ~3.0 ms | ~199 ms / ~0.06 ms |

Segment output is identical to the legacy merge (property tests in `test/utils/lighting-math.test.ts`, including oval pillars).
