# LSCG tests

Run with `npm test` (or `npm run test:watch` / `npm run coverage`).

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
  - `fixtures.ts` — builders for characters, asset groups/assets, and items.
  - `world.ts` — `boot(...modules)` (register + init/load/run, once per file) and
    `resetWorld()` (reset per-test data without re-registering hooks).
  - `room.ts` — `sent.*` (decodes what reached the fake `ServerSend`/
    `ChatRoomSendLocal`) and `receive.*` (feeds a message through the real, hooked
    `ChatRoomMessage`/`ServerAccountBeep` globals).
  - `time.ts` — fake timers, `timerProcess()`, and `seedRandom()`.
- `test/integration/consent.test.ts` — the harness's own smoke test: a full
  offer → accept → complete round trip through `ConsentModule`, including a real
  DOM button click. Good example of the **capture-and-replay** pattern used for
  any two-player flow (see the file's comments).

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

This is milestone 1 (harness + pure-logic tests + one full integration smoke test)
of a larger plan — see the project's test-suite plan for the remaining milestones
(outgoing activity registry, incoming effect modules, the state machine, and the
real-BC-client tier for worn-item/restraint conditionals).
