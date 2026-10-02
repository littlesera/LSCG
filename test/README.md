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

## The playground (real browser)

Neither project above draws anything: jsdom has no canvas or layout. For UI work, `npm run playground` serves a
local, offline Bondage Club at the same pinned commit (http://localhost:10003/) with LSCG's `dist/bundle.js` loaded,
for a real browser — by hand, or driven by [agent-browser](https://github.com/vercel-labs/agent-browser).

- `scripts/bc-playground.mjs` fetches BC client files from gitgud on first use and caches them in
  `.cache/bc-full-<sha>/` (the first page load is slow; later ones are local).
- `test/playground/fake-server.js` replaces socket.io, so nothing reaches the real BC server. Everything the client
  sends is recorded on `Playground.sent`; `Playground.receive(event, data)` delivers a server event.
- `test/playground/harness.js` adds page helpers: `Playground.login()`, `openSettings("Breathplay")`,
  `addCharacter({ pose: ["Kneel"], lscg: {...} })` (another LSCG player in the room), `openProfile(C)`, and
  `toPage(x, y)` (BC canvas coordinates to page pixels, for real mouse clicks on canvas-drawn UI).
- `npm run ui:shots` (playground running) screenshots every LSCG settings screen, every tab, to `test/.out/ui/`.
- `npm run test:ui` runs the Playwright suite in `test/ui/` (`*.spec.ts`, so vitest never picks them up) against the
  playground, which Playwright starts itself. Run `npm run build` first: it tests the built `dist/bundle.js`.
  - `settings.spec.ts` opens every settings screen and tab and changes every enabled input once, failing for any
    input that doesn't change a saved setting (`sweep.ts`), and checks that leaving a screen leaves no overlays,
    preview characters or photo mode behind. A new screen fails the "every screen is covered" test until it's
    added to its list.
  - `flows.spec.ts` covers specific behaviour: the zone picker, outfit renames, the spell menu, remote settings.
  - A failure keeps a screenshot and a trace in `test/.out/ui-results/`; `npx playwright show-trace <trace.zip>`
    replays it.
  - `.github/workflows/ui.yml` runs it on PRs, **non-blocking** (`continue-on-error`) until it has proven reliable.
  - LSCG errors in the browser console fail a test, but BC's own noise (missing optional files, rejected
    appearance bundles) is ignored; see `IGNORED` in `test/ui/fixtures.ts`.

```sh
npm run build && npm run playground          # in one terminal
agent-browser open http://localhost:10003/
agent-browser eval "(async () => { await Playground.login(); return Playground.openSettings('Activities'); })()"
agent-browser screenshot shot.png
```

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
