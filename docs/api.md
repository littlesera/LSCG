# LSCG Extension API

LSCG exposes a typed API that other mods can use to extend it. It is delivered in steps. Check
`LSCG.capabilities` for the features available in the version a player has installed.

| Capability | Provides |
|---|---|
| `core` | `getModApi`, `onReady`, `version`, `isReady`, the load queue |
| `events` | `api.events.on` / `once` / `before` |
| `spells.effects` | `api.spells.registerEffect` / `unregisterEffect` / `listEffects` |
| `activities` | `api.activities.register` / `unregister` / `registerPrerequisite` |
| `drugs` | `api.drugs.register` / `unregister` |
| `network` | `api.network.on` / `send` |
| `storage` | `api.storage.get` / `set` / `getPublic` / `setPublic` |
| `settings` | `api.settings.registerScreen` / `unregisterScreen` |

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

## Custom activities

```js
api.activities.registerPrerequisite({
    name: "not-gagged",                    // referenced below by this short name
    check: ({ acting }) => !acting.IsGagged(),
});

api.activities.register({
    name: "headpat",                       // BC sees "LSCG_<your id>.headpat"
    prerequisites: ["UseArms", "not-gagged"],
    targets: [{
        group: "ItemHead",
        label: "Pat head",
        action: "SourceCharacter gently pats TargetCharacter's head.",
    }],
    image: "Assets/Female3DCG/Activity/Slap.png",
    onSend: ({ target }) => { /* the actor's client; return false to stop it being sent */ },
    onReceive: ({ sender }) => { /* the target's client */ },
});
```

The activity then appears in BC's activity menu on the groups it targets, and in LSCG's per-activity
trigger settings, just like LSCG's own.

- **Targets.** Each target is one BC item group (`ItemArms`, `ItemMouth`, …). `selfAllowed` also offers it
  on yourself, with its own `selfLabel` and `selfAction`. `selfOnly` offers it only on yourself and implies
  `selfAllowed`. A group that isn't a real BC item group logs a warning, because the activity could never
  be offered there.
- **Chat text.** `action` uses BC's usual substitutions (`SourceCharacter`, `TargetCharacter`, and so on).
  Players who don't have your extension still see it: the text travels with the message.
- **Prerequisites.** List BC's own (`UseArms`, `UseMouth`, …), or the short name of one you registered. A
  prerequisite that throws counts as not met, so the activity isn't offered.
- **Callbacks.** `onSend` runs on the actor's client; returning `false` stops the activity being sent. An
  error in it never stops the activity. `onReceive` runs on the target's client.
- **Cleanup.** `dispose()` removes the activities, their menu text and their prerequisites.
- Extensions can't change BC's or LSCG's own activities; `register` only adds new ones.

## Custom drugs

```js
api.drugs.register({
    name: "giggle",                         // id becomes "<your id>.giggle"
    label: "Giggle Juice",
    description: "Makes the drinker giddy.",
    keywords: ["giggle juice", "giggly"],   // in a crafted item's name or description
    color: "#ff9ff3",                       // bar colour
    max: 10,
    decayPerMinute: 1,
    onDose(ctx) {
        ctx.addLevel(ctx.multiplier);
        ctx.sendAction("%NAME% giggles uncontrollably.");
    },
    onTick(ctx) {
        if (ctx.level > 6) ctx.states.get("blind")?.activate(undefined, 10000);
    },
    onWearOff(ctx) {
        ctx.sendAction("%NAME% stops giggling.");
    },
});
```

A crafted Medical Injector, Latex Respirator, Filled Glass or Mug whose name or description contains one of
the keywords is a dose of the drug. The crafting screen offers it as a checkbox next to LSCG's own.

- **Opt-in.** Like LSCG's own drugs, each extension drug does nothing to a player until they enable it in
  their Drug Enhancements settings, which lists it with its source and keywords.
- **Doses.** `onDose` runs for each drink, injection or breath of gas. `ctx.multiplier` is the strength on
  LSCG's own scale: a drink is 2, an injection 1 to 2.2 by where it goes in (`ctx.location`), and each breath
  a small fraction. `ctx.sender` is who dosed them.
- **Levels.** The drug keeps a level from 0 to `max` for you. `addLevel` and `setLevel` keep it in range and
  return the new value. It falls by `decayPerMinute` each minute and is saved with the player's settings.
  Other players see it as a bar beside the character, in your colour, even without your extension. Up to
  12 extension bars are shown for one player (the fullest, if there are more), after LSCG's own three; they
  wrap into a second row after eight.
- **Callbacks.** `onTick` runs every few seconds while the level is above 0 (for players who enabled the
  drug). `onWearOff` runs once when it reaches 0, including when an antidote or a safeword clears it.
- **States.** `ctx.states.get(...)` can switch the same nine built-in states spell effects can.
- **Events.** Extension drugs appear in `drug.applied`, and `drug.beforeApply` can veto them like any other.
- Extensions can't change LSCG's own four drugs; `register` only adds new ones.

## Messages between players

```js
// Receive: handle commands other players' copies of your extension send.
api.network.on("wave", ({ sender, args }) => {
    if (typeof args.text !== "string") return;     // always validate: anyone with LSCG can send anything
    console.log(`${sender} waves: ${args.text.slice(0, 100)}`);
});

// Send: to someone in the room (returns false if they aren't).
api.network.send(targetMemberNumber, "wave", { text: "hello!" });
```

- Commands are named `<your id>.<name>` on the wire, so they only reach your extension.
- **Treat everything received as untrusted.** `sender` is reliable, but `args` is whatever the sender chose.
  It arrives as a frozen object with no prototype, so keys like `__proto__` are just data.
- **Permission.** By default a command is accepted only from players in the room whom the player gives item
  permission. Pass `{ permission: "anyone" }` to `on` to accept it from any LSCG player, including ones in
  another room. LSCG can't check item permission for a player who isn't in the room.
- **Reaching other rooms.** `send` needs the target in the room. Pass `{ beep: true }` to reach them from
  anywhere.
- **Limits.** `args` must be JSON and at most about 4 KB, both ways. `send` throws on invalid input and
  returns `false` if it couldn't be sent, such as when the target isn't there or is the player.
- An error in a handler is contained and counted against your extension.

## Storing data

```js
api.onReady(() => {                       // storage needs LSCG to have loaded the player's settings
    const saved = api.storage.get() ?? { launches: 0 };
    saved.launches++;
    api.storage.set(saved);               // saved with their LSCG settings, so it's in their exports too

    api.storage.setPublic({ version: "1.2" });          // shared with everyone in the room
    const theirs = api.storage.getPublic(otherMemberNumber);   // what they last shared, if anything
});
```

- **Private data** (`get`/`set`) is saved with the player's LSCG settings: up to about 32 KB of JSON, and
  included in LSCG exports and imports. `get` returns a copy, so change it and call `set`. `set(undefined)`
  clears it.
- **Public data** (`getPublic`/`setPublic`) goes out with LSCG's sync to everyone in the room: up to about
  1 KB, and about 4 KB across all extensions. It is only shared while your extension is loaded. Use it for
  things like advertising a version so other players' copies know what you support. Data from another
  player comes over the network, so validate it; oversized data reads as `undefined`.
- Storage throws until LSCG is ready, so use it from `onReady` (or later).
- Each extension only sees its own data.

## Settings screens

```js
api.settings.registerScreen({
    name: "main",
    label: "Greetings",
    build({ kit }) {
        return [
            kit.section("Greetings", "How this extension greets people."),
            kit.text({
                label: "Greeting",
                get: () => api.storage.get()?.greeting ?? "hello",
                set: value => api.storage.set({ ...api.storage.get(), greeting: value }),
            }),
            kit.button({ label: "Test", buttonLabel: "Say it", onClick: () => console.log("hi") }),
        ];
    },
});
```

Screens appear on one **Extensions** page in LSCG's settings. That page shows up once any extension has a
screen, and a picker at its top chooses which extension's screen to show. The kit (`kit.section`, `notice`,
`chip`, `checkbox`, `text`, `number`, `select`, `button`, `confirm`) is the same set LSCG's own screens use,
so they look and behave alike.

- Rows call `set` when the player changes them, so save there. Rows' `disabled` and `hidden` are re-checked
  after every change, and `ui.refresh()` re-reads every `get`.
- `build` runs each time the page opens. Screens that are added or removed while it is open appear straight
  away.
- Every callback you give the kit runs inside your extension's error handling, with a safe fallback value if
  it fails. A screen that fails to build shows a short message instead.

## Login badge

While the login screen is shown, a badge in the bottom-right corner confirms that LSCG has loaded.
Hovering over it or clicking it lists the registered extensions and flags any extension whose callbacks
have thrown. A toast confirms the load after login.

See [`examples/sample-extension.user.js`](../examples/sample-extension.user.js).
