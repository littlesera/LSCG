# LSCG tests

Two Vitest projects:
- `npm test` (or `npm run test:watch` / `npm run coverage`) — the **unit**
  project: fast, hand-built fake BC, no network.
- `npm run test:bc` — the **bc** project: real BC client scripts loaded into
  jsdom for real Asset/Character data (see "The bc project" below). First run
  downloads and caches them (`npm run fetch-bc` to do that ahead of time).
- `npm run test:all` runs both.

## Layout

- `test/setup/globals.ts` — Vitest `setupFiles` entry for the `unit` project. Runs
  once per test file, *before* that file's own imports resolve. Installs the fake
  BC (`harness/bc-lite.ts`) and a baseline `Player`.
- `test/harness/` — the fake-BC harness:
  - `bc-lite.ts` — real, minimal implementations of the BC globals LSCG reads
    directly (`InventoryGet`, `CharacterNickname`, ...), plus `vi.fn()` stubs for
    every BC function any LSCG module hooks with `hookFunction`. LSCG modules are
    booted with the **real** `bondage-club-mod-sdk`, not a mocked one, so hook
    priorities and `next()` chains behave exactly as they do in the real mod.
    `installHookTargetStubs()`/`installNetworkCapture()` (a subset of
    `installBcLite()`) are reused by the `bc` project too.
  - `fixtures.ts` — builders for characters, asset groups/assets, and items.
  - `world.ts` — `boot(...modules)` (register + init/load/run, once per file) and
    `resetWorld()` (reset per-test data without re-registering hooks).
  - `room.ts` — `sent.*` (decodes what reached the fake `ServerSend`/
    `ChatRoomSendLocal`) and `receive.*` (feeds a message through the real, hooked
    `ChatRoomMessage`/`ServerAccountBeep` globals).
  - `time.ts` — fake timers, `timerProcess()`, and `seedRandom()`.
  - `bc-loader.ts` — the `bc` project's real-BC-into-jsdom loader; see below.
  - `node-shims.d.ts` — minimal ambient types for the few Node builtins the
    harness uses, instead of `@types/node` (see tsconfig.test.json's comment).
- `test/integration/consent.test.ts` — the harness's own smoke test: a full
  offer → accept → complete round trip through `ConsentModule`, including a real
  DOM button click. Good example of the **capture-and-replay** pattern used for
  any two-player flow (see the file's comments).
- `test/bc-tier/*.bc.test.ts` — tests using the real-BC tier (filename must end
  `.bc.test.ts`).

## The `bc` project

Real BC client scripts (fetched by `scripts/bc-client.mjs`, pinned in
`test/bc-client.json`) are evaluated into the test file's own jsdom realm via
`test/harness/bc-loader.ts`'s `loadRealBc()`, giving real `Asset`/`AssetGroup`
data and real `Character` methods (`IsMouthBlocked`, `IsRestrained`, `CanTalk`,
...) instead of hand-built fixtures. Only the files needed to run
`AssetLoadAll()` plus `Character.js`/`Inventory.js`/`Activity.js`/`Speech.js`/
`ChatRoom.js` are loaded — not the whole client (no canvas/GUI code). See
`bc-loader.ts`'s comments for the mechanics (why `vm.runInContext` against
`jsdom.getInternalVMContext()` instead of `window.eval()`, and why loaded
values need an explicit sync step onto Node's own `globalThis`).

- `npm run fetch-bc` downloads and caches the pinned commit into
  `.cache/bc-<version>-<sha>/` (gitignored); `npm run test:bc` does this
  automatically via its `globalSetup` if the cache is missing.
- `BC_CLIENT_DIR=<path> npm run test:bc` uses an existing local checkout instead.
- `BC_CLIENT=latest npm run test:bc` resolves BondageClub's `master` HEAD
  instead of the pin (used by `.github/workflows/bc-bump.yml` to catch breakage
  before bumping the pin).
- Bumping the pin: update `test/bc-client.json` (commit + gameVersion) and
  `bc-stubs` in the same change; `.github/workflows/bc-bump.yml` does this
  automatically on a weekly schedule (or on demand).

## Two pitfalls

1. **`Player` is one stable object for the whole test file, mutated in place.**
   `resetWorld()` does not reassign `globalThis.Player` — `hookFunction` (e.g.
   `Player.CanWalk`) installs the SDK's router directly onto whatever object
   `Player` *is* at boot time, so replacing it would orphan those hooks. This means
   a bare reference like `const sender = resetWorld(...)` will reflect whatever the
   *next* `resetWorld()` call writes. Take `snapshotCharacter(sender)` before
   switching "who we are" for a later phase for two-player scenario tests.
2. **`boot()` registers modules once per file (`beforeAll`), not once per test.**
   Re-booting fresh module instances every test would stack duplicate hooks onto
   the same BC globals without ever removing the old ones. A module with its own
   ephemeral cross-test state (e.g. `ConsentModule.sentOffers`) should be reset
   explicitly in `beforeEach` — see `consent.test.ts`.

## What's not here yet

Milestones 1 (fake-BC harness + pure-logic tests + one full integration smoke
test) and 2 (the real-BC tier's loader + auto-fetch + CI + the bc-bump
workflow) are done. Still open: the outgoing activity registry, incoming
effect modules, the state machine, and worn-item/restraint conditional tests
using the real-BC tier — see the project's test-suite plan for the rest.
