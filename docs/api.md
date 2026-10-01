# LSCG Extension API

LSCG exposes a typed API that other mods can use to extend it. It is delivered in steps. Check
`LSCG.capabilities` for the features available in the version a player has installed.

| Capability | Provides |
|---|---|
| `core` | `getModApi`, `onReady`, `version`, `isReady`, the load queue |
| `events` | `api.events.on` / `once` / `before` |
| `spells.effects` | `api.spells.registerEffect` / `unregisterEffect` / `listEffects` |

Typings: `npm run build:api-types` emits `dist/api/types.d.ts`. It is also run as part of `npm run build`.

## Getting a handle

Each extension registers once and gets its own handle. This follows the same pattern as BCX's
`bcx.getModApi(...)`.

```js
(window.LSCG_OnLoad = window.LSCG_OnLoad || []).push(LSCG => {
    const api = LSCG.getModApi({ id: "my-mod", name: "My Mod", version: "1.0.0" });

    api.onReady(() => {
        // LSCG has fully initialized with the player's settings.
    });
});
```

- `LSCG_OnLoad` works regardless of load order:
  - If LSCG hasn't loaded yet, queued callbacks run as soon as it does. That is before login, so your
    extension shows up in the login-screen badge.
  - If LSCG has already loaded, `push` runs the callback immediately.
- `id` may only contain lowercase letters, digits, `_` and `-`. Registering an id that is already
  registered throws.
- Everything an extension registers is namespaced as `"<id>.<name>"`.
- `api.dispose()` removes everything the extension registered and frees its id.
- Errors thrown from your callbacks are caught and logged as `LSCG[ext:<id>]`. They are counted in the
  login badge and never break LSCG. Players who enable LSCG's *RethrowExceptions* debug setting get the
  exceptions rethrown instead.

## `window.LSCG`

| Member | Description |
|---|---|
| `version` | LSCG version without the leading `v`, e.g. `"0.9.2"` |
| `capabilities` | `ReadonlySet<string>` for feature detection |
| `isReady` | `true` once LSCG has initialized with the player's settings |
| `onReady(cb)` | Runs `cb` when ready, or immediately if LSCG is already ready |
| `getModApi(info)` | Registers an extension and returns its handle |

A `lscg:ready` event is also dispatched on `window` when LSCG becomes ready. Its `detail` is the API
object.

There is one version number, and it is LSCG's own. LSCG raises its minor version for unrelated features
too, so check `capabilities` for what your extension needs rather than comparing versions.

### Deprecated

`window.LSCG` also contains internals that were exported before the API existed: `getModule`,
`sendLSCGBeep`, `DrugKeywords`, `Outfits` and others. They still work, but they are not part of the
supported API and may change without notice.

## Events

```js
const off = api.events.on("state.activated", ({ type, activatedBy, duration }) => { /* ... */ });
off(); // unsubscribe (dispose() also removes all of an extension's listeners)

api.events.before("spell.beforeReceive", ctx => {
    if (ctx.payload.spell.name.includes("veto")) ctx.cancel("warded");
    ctx.payload.effects = ctx.payload.effects.filter(e => e !== "Petrifying");
});
```

- `on` and `once` **observe only**. The payload is a frozen snapshot, and nothing a listener does
  changes LSCG's behaviour.
- `before` handlers run before the action and may cancel it or change the fields listed as mutable
  below. They are offered for a few actions only.
- Handlers with a higher `priority` run first (default 0). Ties run in registration order. Among
  before-handlers, the first cancel stops the rest.
- Member numbers identify characters. Durations are in milliseconds.

### Observe-only events

| Event | Payload |
|---|---|
| `ready` | `{}` |
| `state.activated` | `{ type, activatedBy?, duration? }`, e.g. `type: "asleep"`, `"hypnotized"`, `"blind"` |
| `state.recovered` | `{ type, reason: "expired" \| "safeword" \| "dispel" \| "manual" }` |
| `spell.cast` | `{ spell, target, paired? }`. The player cast a spell. |
| `spell.resisted` | `{ spell, sender, bounced }`. The player saved against a spell. |
| `spell.received` | `{ spell, sender?, effects, duration? }`. A spell took hold on the player. |
| `spell.effectApplied` | `{ effect, spell, sender?, duration? }` |
| `hypno.triggered` | `{ by?, byWord }` |
| `hypno.awakened` | `{ method: "word" \| "boop" \| "snap" \| "timeout" \| "other", by? }` |
| `activity.sent` | `{ name, group?, target?, isLSCG }` |
| `activity.received` | `{ name, group?, source?, isLSCG }`. Fires for activities that target the player. |
| `grab.added` / `grab.removed` | `{ type, pairedMember, isSource }` |
| `drug.applied` | `{ types, method: "drink" \| "inject" \| "breath", sender?, location? }` |
| `collar.choke` | `{ level, previousLevel }` |
| `collar.passout` | `{ reason: "collar" \| "hand" \| "plugs" \| "chain", by? }` |
| `command.received` | `{ sender, name }`. An LSCG player-to-player command addressed to the player was handled. |
| `settings.saved` | `{ published }` |
| `safeword` | `{ kind: "revert" \| "release" }` |

`spell` payloads are `{ name, effects, creator? }`.

### Before-events

| Event | Mutable | On cancel |
|---|---|---|
| `spell.beforeReceive` | `duration`; `effects` (removals only) | The spell fizzles, with your reason in the emote |
| `spell.beforeEffect` | `duration` | That effect fails to take hold |
| `grab.beforeIncoming` | — | The grab is refused and released on the grabber's side too |
| `drug.beforeApply` | `types` (removals only) | Nothing is applied |

LSCG validates what handlers return. Effects or drug types a handler adds are ignored. A duration
that isn't a non-negative number falls back to LSCG's own value, and `undefined` means no expiry.

LSCG settings saves, safeword handling, `/lscg` commands, and the handling of player-to-player
commands cannot be intercepted.

## Custom spell effects

```js
api.spells.registerEffect({
    name: "bark",                   // id becomes "<your id>.bark"
    label: "Barking",
    description: "Makes the target bark like a dog.",
    apply(ctx) {
        ctx.sendAction("%NAME% lets out a startled \"Woof!\"");
    },
});
```

Once registered, the effect appears in the Magic™ settings, alongside LSCG's own effects. Players
can add it to their spells and block it or allow it.

- **Where `apply` runs.** It runs on the client of the player the spell hit, after the save roll
  and after that player's blocks are applied. `ctx` contains:
  - `effect`: the effect's id
  - `spell`: `{ name, effects, creator? }`
  - `sender`: the caster's member number
  - `duration`: in ms. `0` or `undefined` means no expiry.
  - `sendAction(text)`: an emote. Substitutions such as `%NAME%`, `%POSSESSIVE%` and `%OPP_NAME%`
    (the caster) work.
  - `states`
- **Giving an effect a duration.** Extensions can't add persistent states yet. Use
  `ctx.states.get(type)` with one of `asleep`, `hypnotized`, `horny`, `denied`, `blind`, `deaf`,
  `frozen`, `gagged` or `x-ray-vision`, and pass `ctx.duration`. For example:
  `ctx.states.get("gagged")?.activate(ctx.sender, ctx.duration)`.
- **Flags:**
  - `beneficial`: a spell made only of beneficial effects gets no save roll and no duration.
  - `forcesDuration`: always expires, even for players who allow unlimited spells.
  - `allowRandom`: wild magic may pick it.
  - `defaultBlocked`: blocked the first time a player sees it, until they unblock it.
- **Players without your extension.** Every client advertises the effects it has beyond LSCG's
  original set. That covers extension effects and newer built-ins such as Tightening and Loosening. When a
  spell contains effects the target doesn't support, the caster's spell menu marks it as limited and
  lists them as "(unsupported)". A spell whose effects are all unsupported can't be cast at that
  target. If one arrives anyway, those effects fizzle with a message, and the rest of the spell still
  applies.
- **Uninstalling your extension.** Spells that use your effects keep them as "(unavailable)" entries.
  Nothing is persisted on the player's side.

## Login badge

While the login screen is shown, a badge in the bottom-right corner confirms that LSCG has loaded.
Hovering over it or clicking it lists the registered extensions and flags any extension whose callbacks
have thrown. A toast confirms the load after login.

See [`examples/sample-extension.user.js`](../examples/sample-extension.user.js).
