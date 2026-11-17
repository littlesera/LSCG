# Map and lighting performance plan

Status: proposal. Nothing here is implemented yet.
Basis: a read of BC R133 (`ChatRoomMapView.js`, `Map.js`, `MapData.js`, `Drawing.js`) and of LSCG's `Modules/map.ts` and
`Utilities/lighting.*`, plus Node benchmarks of the real `lighting.math.ts`.

**Evidence labels.** *Measured* means run in Node against LSCG's real code on a synthetic room. *Estimated* means derived from
reading the code and not profiled in a browser. Phase 0 exists to turn the estimates into measurements before anything
else changes.

---

## 1. Why this matters: the zoom-out case

A widely used mod lets players zoom out to see the whole map (up to 40x40 tiles). Almost every cost below scales with
visible tiles, lights or wall segments, and some scale worse than linearly. Plan and test for the 41x41 case, not only the
default 9x9 view.

| Finding | Default view | Zoomed out | Evidence |
|---|---|---|---|
| `optimizeSegments` (O(n^3) merge restarting after every merge) | 5-10 ms | **~196 ms** | measured |
| Full lighting compute per player step (worker) | ~6-11 ms | **~200 ms**, so lights lag the player; on the main-thread fallback the UI freezes | measured |
| `getVisibilityPolygon` per light | ~0.1 ms | ~0.05-0.08 ms | measured, not a bottleneck |
| Viewpoint (fog) polygon | 0.2-0.5 ms | 2.5-4.5 ms | measured |
| Vanilla `drawImage` calls per frame | ~250-350 | ~3,000-5,000 | estimated |
| `updatePlayerPerception` tile lookups per move | ~6k | ~100k+ | estimated |
| Per-light clip + gradient + fill per frame | few lights | every light in the room | estimated |

Structural causes:
1. LSCG computes all lighting geometry in **screen space relative to the player**, so every step invalidates every
   polygon (`ParseMapForObjects` bakes `ScreenX/ScreenY`).
2. `ParseMapForObjects` is re-run far more often than needed (every player flag update, mouse wheel, view activation, and
   every `CharacterLoadCanvas`). `debouncedParseMap` exists in `map.ts` but is never used.
3. Light objects are recreated on each parse, so `_animState` (including the random `seed`) is lost. Flicker and pulse
   phase probably jump on every step. Unconfirmed visually.
4. Vanilla BC redraws every tile image through `DrawImageEx` every frame, with no retained layer, no culling to the
   viewport window (it scans all 1600 tiles three times), and `AlphaMasks` paths that reallocate a canvas per use.

## 2. Principles

1. **Measure first.** No optimisation lands without a before/after number from the Phase 0 harness.
2. **Fix the worst thing at the lowest risk first.** The sweep merge is about 30 lines, measured at 150-1700x, and
   produced identical output in the prototype.
3. **LSCG owns lighting, so change it directly. Vanilla BC is not ours, so touch it as little as possible.** Anything
   that replaces a BC function is opt-in, version-guarded, and falls back to the original.
4. **Vanilla improvements are opt-in; lighting improvements are built in.** Anything that replaces or patches BC behaviour
   gets its own setting, default off, so it can be enabled and tested in isolation. Lighting is LSCG's own code, so its
   improvements ship without a flag and are protected by parity tests that compare against the previous behaviour. A
   lighting change that depends on a vanilla improvement is gated by that improvement's toggle. The one lighting setting is
   light quality (full or half resolution), because it is a visible trade-off.
5. **Keep the old path reachable** until at least one full release cycle has passed without regressions.
6. **Fail safe at runtime.** A new code path that throws turns itself off for the session instead of breaking the map.

## 3. Phase 0: baseline and safety net (do first, no behaviour change)

| ID | Work | Notes |
|---|---|---|
| 0.1 | **Benchmark harness for the lighting math.** Port the Node benchmark used for this plan into `test/bench/` (vitest bench). Cover 21x21 and 41x41 rooms, 6/20/40 lights, doors, oval pillars. | The prototype lives in the scratchpad (`bench.ts`, `big.ts`, `m41.ts`). Regression guard compares ratios, not absolute ms, because CI machines vary. |
| 0.2 | **Real-browser baseline.** Add a Playwright scenario on the existing `bc-playground` (real BC client, offline) that loads a map room, walks N steps, and records per-frame time of `ChatRoomMapViewDrawGrid` and `LightingEngine.render`, long-task count, and JS heap, at perception range 4 and at full-map zoom. Save output as JSON. | Reuse `LightingEngine`'s existing `timings` and add a ring buffer exposed as `window.lscgPerf`. Turns every "estimated" row above into a measurement and decides which of the Phase 3 items are worth doing. |
| 0.3 | **Test rooms as fixtures.** Define 3-4 canonical map layouts (open field with lights, many small rooms with doors, one long wall, pillar field) in `test/harness/`, for unit, bench and Playwright to share. | Extends the `room()` helper in `map-lighting.test.ts`. |
| 0.4 | **Opt-in toggles for vanilla changes.** Add settings to `MapSettingsModel`, default off: wall-effect table, fast perception, fast map renderer (and the `DrawImageEx` fast path if built), plus a light-quality setting (full or half). No toggles for lighting work. | Each toggle is added with the feature it controls; toggle off calls the original BC function unchanged. |
| 0.5 | **BC source tripwire.** In the `bc` test project, store a hash of the source of the BC functions we depend on or replace (`ChatRoomMapViewDrawGrid`, `ChatRoomMapViewWallEffect`, `ChatRoomMapViewFindWallEffectTile`, `MapManager.Map.updatePlayerPerception`, `DrawImageEx`). The test fails when the hash changes. | The weekly `bc-bump` workflow already runs `test:bc` against BC master and files an issue instead of bumping when tests fail. A changed hash then forces a human to read the upstream diff before the pin moves. |

Exit criteria: baseline numbers recorded in `docs/perf-baseline.md`; flags exist and default to legacy behaviour; the
tripwire is green on the pinned BC.

## 4. Phase 1: lighting compute (low risk, highest value per effort)

These are pure LSCG changes with no BC coupling.

| ID | Change | Gain | Risk | Parity test |
|---|---|---|---|---|
| 1.1 | **Replace `optimizeSegments` with an axis-aligned sweep merge** (bucket by line, sort, merge touching intervals). Segments that are not axis-aligned (oval pillars) pass through the old optimiser. | 196 ms to 0.12 ms at 41x41; 5-10 ms to 0.03 ms at 21x21 (measured) | Low | Property test on random rooms: the sorted segment sets are equal to the old output. The prototype matched exactly on 65/65, 97/97 and 271/271. |
| 1.2 | **Gate `ParseMapForObjects`.** Use a map revision counter (bumped from `updateGlobalMapData`, `ChatRoomSyncRoomProperties`, `OnMapDataUpdated`), a light-signature hash for characters, and the existing debounce. Stop re-parsing on every `CharacterLoadCanvas`. | Calls drop by an estimated 10-50x | Medium: a missed invalidation shows stale lights | Test that each known trigger still refreshes (edit a wall, open a door, change a held item, join/leave). |
| 1.3 | **Remove the per-tile `lightSources.filter`.** Build an `objId -> sources[]` map once. | small | Low | Existing lighting tests. |
| 1.4 | **Stable light identity and animation state.** Keep `_animState` keyed by light `id` across parses, and prune stale ids. | Fixes the probable flicker phase pop | Low | Test that a light keeps its seed across two parses. |
| 1.5 | **Allocation cleanup.** Cache the `allLights` array, mutate `color` in place, cache gradient colour strings, and move worker results to a transferable `Float32Array` per light. | Less GC and main-thread clone time (estimated) | Low | Render-call recording test (the recording-context pattern already in `map-lighting.test.ts`). |
| 1.6 | **Cull compute by viewport plus radius**, not only by `lightingVisionMax`. | scales with light count | Low | Test that culled lights are not drawn and re-enter correctly. |
| 1.7 | **Main-thread fallback guard.** When the worker is unavailable, cap or time-slice compute so a 200 ms freeze cannot happen. | Prevents UI freezes | Low | Existing fallback tests. |

Exit criteria: 41x41 full compute under ~5 ms (measured), worker never backlogged during continuous walking, all
`map-lighting` tests green with the flags on and off.

## 5. Phase 2: world-space lighting and caching

Reverse the coordinate model: geometry and lights are absolute, and the camera is the only thing that follows the player.

| ID | Change | Notes |
|---|---|---|
| 2.1 | **Tile-unit world space.** Segments, light positions and radii are expressed in tiles (1 unit = 1 tile). `render` applies a camera transform (translate and scale by `TileUnit`). Zoom becomes a render-time scale. | Light radii are already in tiles; character-light offsets are `TileUnit` multiples and convert directly. |
| 2.2 | **One camera source of truth** in `MapModule`: world position of the view centre plus scale, derived exactly as vanilla does (`Player.MapData.Pos`, perception range). | Prevents lights drifting from tiles if smooth scrolling is added later. |
| 2.3 | **Static/dynamic segment split.** Walls are static. Doors depend on player side and occupancy (`GetDoorObstacles`, `DootAtPositionIsOpen`), so they are dynamic. On a change, recompute only lights whose bounding box touches the changed segments. | The worker's `UPDATE_LIGHTS` path already has this shape. |
| 2.4 | **Per-step work is the viewpoint polygon only**, optionally cached per player tile in an LRU. | 200 ms to a few ms at 41x41 (derived from the measurements). |
| 2.5 | **Render caches.** (a) Cache the vision canvas and redraw only when the polygon changes. (b) Pre-render each light's gradient-intersect-polygon into a low-resolution sprite and blit per frame, using `globalAlpha` for flicker. (c) Optionally bake non-flickering lights into one static lightmap (valid because `lighten` is commutative). (d) Run light and vision layers at half resolution behind a quality setting. | Estimated 3-10x less per-frame light work. Half resolution softens shadow edges; make it a setting and compare screenshots. |

Risks and mitigations:
- **Stale geometry** is the main risk. Every cache is keyed by a version counter, and a debug command (`/lscg map-cache clear`)
  plus the kill switch exist.
- **Visual drift.** Lighting parity is checked as an image comparison with tolerance against the legacy renderer on the
  Phase 0 fixtures, at zoom 4 and full-map.
- Keep the legacy screen-space path until Phase 2 has shipped as default-off for one release.

Exit criteria: translation-invariance test passes (moving the player changes no light polygons except the viewpoint);
per-frame lighting render time at 41x41 and 40 lights meets the Phase 0 target; no visible change in parity images beyond
tolerance.

## 6. Phase 3: vanilla map rendering (opt-in, guarded)

This phase is the only one that touches BC behaviour, so it comes last and ships default-off.

| ID | Change | Replaces BC code? | Notes |
|---|---|---|---|
| 3.1 | **Wall-effect lookup table** instead of the 22-branch chain. | Yes, but a pure helper | Differential test across all 32 neighbour combinations against the original. |
| 3.2 | **Windowed, bitmask `updatePlayerPerception`** (iterate only the `(2R+1)^2` window; precomputed blocker masks). | Method patch on the prototype | **Differential test against the real BC implementation** on thousands of random maps, requiring identical masks. Add `Map.js` and `MapData.js` to the `bc` project loader. Keep the exact corner-ray semantics; do not substitute shadowcasting unless parity is explicitly waived. |
| 3.3 | **Fast `DrawGrid`**: window the loops, bake ground (tiles, wall overlays, flat objects) into world-space chunks from the "display" arrays so walking re-bakes nothing, keep tall/dynamic objects and characters in a y-sorted pass, fog as a 1-px-per-tile texture, alpha-mask fix via source-rect, level of detail for zoom-out. | Yes, full replacement of one function | Runs at the lowest hook priority, so other mods' wrappers still run. Falls back to `next()` in edit mode, with super powers, or when the guard fails. |
| 3.4 | **Narrow `DrawImageEx` fast path** (no rotation, zoom, mask or tint). | Wraps a hot shared function | Only worth it if Phase 0 shows it matters after 3.3. Many mods hook this function, so skip it unless needed. |
| 3.5 | **Smooth camera and character tweening** (optional). | n/a | A feel improvement, not a speed one. Needs 2.2. |

Guards for 3.3 (mandatory):
- **Version allowlist.** Enable only when BC's version is in the tested list from `test/bc-client.json` **and** a capability probe
  passes (`MapManager.Map.getTileId`, `MapDataTiles`, `DrawGetImage`, `MapGetAssetUrl`, and so on). Otherwise fall back silently
  with one console notice.
- **Runtime circuit breaker.** Wrap the fast renderer in try/catch. After 3 exceptions in a short window, disable it for the
  session and fall back to `next()`.
- **Pixel-diff parity.** In Playwright, screenshot the map region from both renderers on the Phase 0 fixtures and compare
  within tolerance. Include tall objects, water with a character, fog memory, animated tiles, doors, and edit mode.
- **Source tripwire** (0.5) so a BC change to `DrawGrid` blocks the pin bump until reviewed.

Exit criteria: parity images pass; zoomed-out frame time and draw-call count meet the Phase 0 targets; opt-in beta runs
for a full release with no regressions.

## 7. Not planned (revisit only if measurements justify)

- **WebGL/WebGPU instanced renderer.** Chunk caching already removes about 90% of the cost for far less complexity, and
  characters live on the 2D canvas.
- **Idle-frame skipping.** `DrawProcess` is global and shared with chat and other screens, so a mod cannot gate it safely.
- **Replacing the visibility algorithm** with a different method (shadow-map, ray-count). The measured raycast cost is
  already low once the merge is fixed.

## 8. Protection against future breaks

| Risk | Protection |
|---|---|
| BC changes `DrawGrid` or the map API (R132 to R133 already changed the map data model) | Source-hash tripwire (0.5) and version allowlist; the weekly `bc-bump` job runs `test:bc` and opens an issue instead of a PR when it fails. |
| New code throws at runtime | Per-feature try/catch and a circuit breaker back to the original function. |
| Stale cache after a rare event | Version counters on every cache and a debug clear on the existing `window.lighting` handle; lighting steps land as separate revertible commits. |
| Perf regressions creep back | Ratio-based benchmark guard in CI (0.1), and the Playwright perf scenario (0.2) run on demand and nightly. |
| Another mod changes the map or hooks the same functions | Fast renderer sits at lowest priority, still calls `DrawImageResize` / `DrawCharacter` / `DrawStatus` for dynamic content, and is tested with the zoom mod's settings (range 4, 10, 20, max). |
| Hidden behaviour change | Differential tests against real BC code (3.1, 3.2) and pixel-diff parity (2.5, 3.3). |
| Memory growth from caches | Size caps with LRU, rebuild on canvas resize or context loss, and a heap check in the Playwright scenario. |

## 9. Rollout

1. Phase 0 lands on its own. Nothing user-visible changes.
2. Phase 1 (lighting compute) ships built in once tests pass. It is pure compute with measured identical output.
3. Phase 2 (world-space lighting and caches) ships built in after soaking on the dev channel (`dev.yml`); land each step as its
   own revertible commit.
4. Phase 3 (vanilla) ships only as opt-in toggles, default off. A toggle becomes default only after a clean release cycle.
5. Vanilla code paths are never removed; they are the fallback behind each toggle.

## 10. Targets (to be confirmed by Phase 0 numbers)

| Metric | Today (est.) | Target |
|---|---|---|
| Lighting compute per step, 41x41 | ~200 ms (measured) | under 5 ms |
| Lighting compute per step, 21x21 | ~6-11 ms (measured) | under 1 ms |
| Map frame time p95, range 4 | 2-5 ms (est.) | under 1 ms |
| Map frame time p95, full-map zoom | not yet known | under 4 ms |
| Draw calls per frame, full-map zoom | ~3,000-5,000 (est.) | under 100 |
| Main-thread long tasks while walking | not yet known | none over 50 ms |

## 11. Open questions

1. What perception range and sight range does the zoom-out mod set, and does it also raise `ChatRoomMapViewPerceptionRangeMax`?
2. Which browsers and hardware must be supported? A software-rasterised canvas changes which render items matter most.
3. Is a slightly softer shadow edge at half resolution acceptable, or must lighting look identical to today?
4. Should LSCG own the camera (2.2) now, or only after smooth scrolling is wanted?
5. Is an upstream BC pull request for the vanilla fixes (wall LUT, windowed perception, draw-call reduction) something you'd want, as an alternative to maintaining a replacement renderer in LSCG?
