# @lscg/types

TypeScript types for the [LSCG](https://github.com/littlesera/LSCG) extension API, for writing extensions to Little
Sera's Club Games. They contain no code, only type information for your editor and compiler.

```sh
npm install --save-dev @lscg/types
```

To try extension features that are still in testing, install the beta instead: `npm install --save-dev @lscg/types@beta`.

In TypeScript:

```ts
import type { LSCGGlobal } from "@lscg/types";

(window.LSCG_OnLoad = window.LSCG_OnLoad || []).push((LSCG: LSCGGlobal) => {
    const api = LSCG.getModApi({ id: "my-mod", name: "My Mod", version: "1.0.0" });
});
```

In plain JavaScript, a JSDoc comment gives you the same completion and checks:

```js
/** @param {import("@lscg/types").LSCGGlobal} LSCG */
function setup(LSCG) { /* ... */ }
```

Installing the types also types `window.LSCG`, `window.LSCG_OnLoad` and the `lscg:ready` event.

The version matches the LSCG release the types describe. Players may run an older LSCG, so check
`LSCG.capabilities` before using a feature.

See the [extension guide](https://github.com/littlesera/LSCG/blob/main/docs/api.md) for how to write an extension.

MIT licensed. LSCG itself is LGPL-3.0-or-later.
