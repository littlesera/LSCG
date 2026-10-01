# LSCG Extension API

LSCG exposes a typed API that other mods can use to extend it. It is delivered in steps. Check
`LSCG.capabilities` for the features available in the version a player has installed.

| Capability | Provides |
|---|---|
| `core` | `getModApi`, `onReady`, `version`, `isReady`, the load queue |

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

## Login badge

While the login screen is shown, a badge in the bottom-right corner confirms that LSCG has loaded.
Hovering over it or clicking it lists the registered extensions and flags any extension whose callbacks
have thrown. A toast confirms the load after login.

See [`examples/sample-extension.user.js`](../examples/sample-extension.user.js).
