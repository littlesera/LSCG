# Writing LSCG extensions

An LSCG extension is a small script that adds to Little Sera's Club Games (LSCG) without changing LSCG itself. With
the extension API you can:

- **React** to what happens to a player: spells, hypnosis, drugs, grabs, activities and states.
- **Intercept** some of those before they happen: veto an incoming spell, a grab or a drug, or soften it.
- **Add content** that sits next to LSCG's own: spell effects, activities and drugs.
- **Talk** to other players running your extension, **store** data with the player's settings, and add your own
  **settings screens**.

Players keep control. Everything you add follows their LSCG settings: blocks, opt-ins and permissions. They can
also turn your extension off from the login screen.

**Contents:** [Quick start](#quick-start) · [Loading your extension](#loading-your-extension) ·
[The basics](#the-basics) · [Events](#events) · [Spell effects](#spell-effects) · [Activities](#activities) ·
[Drugs](#drugs) · [Built-in states](#built-in-states) · [Messages between players](#messages-between-players) ·
[Storing data](#storing-data) · [Settings screens](#settings-screens) · [Reference](#reference)

---

## Quick start

Paste this into the browser console on the Bondage Club tab after logging in. (Chrome and Edge may ask you to type
`allow pasting` first.)

```js
(window.LSCG_OnLoad = window.LSCG_OnLoad || []).push(LSCG => {
    const api = LSCG.getModApi({ id: "hello", name: "Hello LSCG", version: "1.0.0" });

    api.events.on("spell.received", ({ spell, sender }) => {
        console.log(`${sender} hit me with ${spell.name}!`);
    });
});
```

Get hit by a spell and the console says so. That's a whole extension. Everything else in this guide adds to the
same pattern:

1. **Push a callback onto `window.LSCG_OnLoad`.** It runs once LSCG is loaded, whichever script loaded first.
2. **Call `LSCG.getModApi(...)` first** to register and get your handle, `api`.
3. **Use `api`** to listen, intercept, and add things.

For a fuller example covering every feature, see [`examples/sample-extension.js`](../examples/sample-extension.js).

---

## Loading your extension

An extension is plain JavaScript, so anything that runs a script on the BC page can load it:

| How | Good for |
|---|---|
| Paste it into the console | Trying things out. It lasts until the page reloads. |
| A `<script>` tag, from the console or a bookmarklet | Loading a hosted file, e.g. from GitHub Pages |
| A userscript manager such as Tampermonkey | Loading it every time, automatically |
| A BC mod manager that loads scripts by URL | Sharing it with other players |

**Load order doesn't matter.** If your script runs first, your callback waits in the `LSCG_OnLoad` queue until LSCG
loads. If LSCG is already there, `push` runs your callback immediately. Extensions that load before login also appear
in the LSCG badge on the login screen.

### Players can turn your extension off

The LSCG badge on the login screen lists every extension, each with a checkbox. If a player unticks yours:

- **On later page loads, `getModApi` throws** for your id, which stops the rest of your callback. This is why you
  call `getModApi` first: anything your callback does before that line still runs.
- **If you're already loaded**, LSCG disposes your handle straight away, which removes everything you registered
  through the API. Anything you did outside the API stays until the page reloads.
- **Ticking it again re-runs your `LSCG_OnLoad` callback**, so make that callback safe to run twice. An extension
  that called `window.LSCG.getModApi` directly, without the queue, needs a page reload instead.

The choice is saved per browser, because the login screen comes before the player's own settings.

---

## The basics

### Your handle

`LSCG.getModApi({ id, name, version })` registers your extension and returns its handle.

- **`id`** may only contain lowercase letters, digits, `_` and `-`. Registering an id that's already registered
  throws.
- **`name`** and **`version`** are shown to players, in the login badge and in settings.
- **Everything you register is namespaced** as `"<your id>.<name>"`. A spell effect named `bark` in extension
  `pets` becomes `pets.bark`, so it never clashes with other extensions.
- **`api.dispose()`** removes everything you registered and frees your id.

### Waiting for the player's settings

`getModApi` works as soon as LSCG loads, which may be before login. Some things need the player's settings, though,
such as storage. Put those in `api.onReady`:

```js
api.onReady(() => {
    // LSCG has loaded the player's settings. Runs immediately if it already has.
});
```

### Errors

Every callback you hand LSCG runs inside a safety net. If it throws, LSCG logs the error as `LSCG[ext:<your id>]`,
counts it against your extension, and carries on. The login badge flags extensions that have thrown. To debug,
turn on LSCG's *RethrowExceptions* setting (`Player.LSCG.RethrowExceptions = true` in the console) to have errors
rethrown instead.

### Checking what's available

Players may run an older LSCG than you wrote for. Check `LSCG.capabilities` before using a feature:

```js
if (LSCG.capabilities.has("drugs")) {
    api.drugs.register({ /* ... */ });
}
```

Check capabilities rather than `LSCG.version`, because LSCG's version also changes for things unrelated to the
API. The [capability list](#capabilities) is in the reference.

---

## Events

Events tell you what LSCG is doing to the player. Most are **observe-only**: you hear about them but can't change
them.

```js
const off = api.events.on("state.activated", ({ type, activatedBy, duration }) => {
    if (type === "asleep") console.log(`Put to sleep by ${activatedBy}`);
});

off(); // stop listening (dispose() also removes all of your listeners)
```

`api.events.once(...)` hears only the next occurrence.

A few events also have a **before** phase. A before-handler runs before the action happens, and can cancel it or
change some of its details:

```js
api.events.before("spell.beforeReceive", ctx => {
    if (ctx.payload.spell.name.includes("veto"))
        ctx.cancel("warded off");                                  // the spell fizzles, with this reason
    ctx.payload.effects = ctx.payload.effects.filter(e => e !== "Petrifying");   // or just drop an effect
});
```

**How events behave:**

- Observe-only payloads are frozen snapshots. Changing one does nothing.
- Before-handlers may only change the fields listed as mutable in the [before-events table](#before-events). LSCG
  checks what you hand back: it ignores effects or drug types you add, and falls back to its own duration if
  yours isn't a non-negative number. A duration of `undefined` means no expiry.
- Handlers with a higher `priority` run first: `api.events.on(name, handler, { priority: 10 })`. The default is 0,
  and ties run in the order they were registered. The first before-handler to cancel stops the rest.
- Characters are identified by member number. Durations are in milliseconds.

The full lists are in the reference: [observe-only events](#observe-only-events) and
[before-events](#before-events).

---

## Spell effects

Add your own effect to LSCG's Magic™. Players can put it in their spells next to LSCG's own effects, and block or
allow it like any other.

```js
api.spells.registerEffect({
    name: "bark",                       // the id becomes "<your id>.bark"
    label: "Barking",
    description: "Makes the target bark like a dog.",
    apply(ctx) {
        ctx.sendAction("%NAME% lets out a startled \"Woof!\"");
    },
});
```

**`apply`** runs on the client of the player the spell hit, after their save roll and after their blocks have
been applied. Its `ctx` has:

| Field | |
|---|---|
| `effect` | Your effect's id |
| `spell` | `{ name, effects, creator? }` |
| `sender` | The caster's member number |
| `duration` | How long the effect should last, in ms. `0` or `undefined` means no expiry. |
| `sendAction(text)` | Sends an emote. `%NAME%`, `%POSSESSIVE%` and `%OPP_NAME%` (the caster) are filled in. |
| `states` | LSCG's [built-in states](#built-in-states), to make the effect last |

**Making it last.** Extensions can't add their own states yet. To give an effect a duration, switch one of LSCG's
built-in states for `ctx.duration`:

```js
apply(ctx) {
    ctx.states.get("gagged")?.activate(ctx.sender, ctx.duration);
}
```

**Options:**

| Option | Effect |
|---|---|
| `beneficial` | A spell made only of beneficial effects gets no save roll and no duration. |
| `forcesDuration` | Always expires, even for players who allow unlimited-duration spells. |
| `allowRandom` | Wild magic may pick it. |
| `defaultBlocked` | Blocked the first time a player sees it, until they unblock it. |

**Players without your extension.** Every client tells the room which effects it can apply. When a spell holds
effects the target doesn't have, the caster's spell menu lists them as "(unsupported)". A spell whose effects are
all unsupported can't be cast at that target. If one arrives anyway, those effects fizzle with a message and the
rest of the spell still applies.

**If your extension is uninstalled,** spells that use your effects keep them, shown as "(unavailable)".

In LSCG's menus, effects from extensions are marked with a star icon, and the spell editor lists them under
"From extensions". `api.spells.listEffects()` lists every effect this client knows, built-in or not.

---

## Activities

Add an activity to BC's activity menu. It also appears in LSCG's per-activity trigger settings, just like LSCG's
own.

```js
api.activities.registerPrerequisite({
    name: "not-gagged",                      // use it below by this short name
    check: ({ acting }) => !acting.IsGagged(),
});

api.activities.register({
    name: "headpat",                         // BC sees "LSCG_<your id>.headpat"
    prerequisites: ["UseArms", "not-gagged"],
    targets: [{
        group: "ItemHead",
        label: "Pat head",
        action: "SourceCharacter gently pats TargetCharacter's head.",
    }],
    image: "Assets/Female3DCG/Activity/Slap.png",
    onSend: ({ target }) => { /* runs for the player doing it; return false to cancel */ },
    onReceive: ({ sender }) => { /* runs for the player it's done to */ },
});
```

- **Targets.** Each target is one BC item group (`ItemArms`, `ItemMouth`, …), with its menu `label` and chat
  `action`. Add `selfAllowed: true` to offer it on yourself too (with an optional `selfLabel` and `selfAction`),
  or `selfOnly: true` to offer it only on yourself. A group that isn't a real BC item group logs a warning,
  because the activity could never be offered there.
- **Chat text** uses BC's substitutions (`SourceCharacter`, `TargetCharacter`, `PronounPossessive`, …). Players
  without your extension still see it, because the text travels with the message.
- **Prerequisites** can be BC's own (`UseArms`, `UseMouth`, …) or the short name of one you registered. A
  prerequisite that throws counts as not met, so the activity isn't offered.
- **Arousal.** `maxProgress` and `maxProgressSelf` set how far a full activity takes the target (default 70).
- **Callbacks.** `onSend` runs on the actor's client, and returning `false` stops the activity being sent. If it
  throws, the activity still goes ahead. `onReceive` runs on the target's client.
- **`dispose()`** removes your activities, their menu text and your prerequisites.

You can only add activities. BC's and LSCG's own can't be changed.

---

## Drugs

Add a drug that works like LSCG's own sedative, brainwashing drug and aphrodisiac. A crafted Medical Injector,
Latex Respirator, Filled Glass or Mug whose name or description contains one of your keywords is a dose of it, and
the crafting screen offers it as a checkbox.

**Players must opt in.** A drug does nothing to a player until they enable it in their Drug Enhancements
settings, which lists it with your extension's name and keywords.

```js
api.drugs.register({
    name: "giggle",                         // the id becomes "<your id>.giggle"
    label: "Giggle Juice",
    description: "Makes the drinker giddy.",
    keywords: ["giggle juice", "giggly"],   // case and punctuation don't matter
    color: "#ff9ff3",                       // the level bar's colour
    onDose(ctx) {
        ctx.addLevel(ctx.multiplier);
        ctx.sendAction("%NAME% giggles uncontrollably.");
    },
    onWearOff(ctx) {
        ctx.sendAction("%NAME% stops giggling.");
    },
});
```

### Levels

Each drug has a level from 0 to `max`, which LSCG keeps and saves for you.

- **Raise or lower it** with `ctx.addLevel(amount)` or `ctx.setLevel(level)`. Both keep it between 0 and `max`
  and return the new level. `ctx.level` is always current.
- **It wears off** by `decayPerMinute` (default 1; `0` never wears off on its own), but only while the player is
  online. It pauses while they're logged out.
- **Everyone sees it** as a bar beside the character, in your colour, even players without your extension. A
  player shows up to 12 extension bars (the fullest, if there are more) after LSCG's own three.

### Callbacks

Every callback gets a `ctx` with `drug`, `level`, `max`, `addLevel`, `setLevel`, `sendAction` and
[`states`](#built-in-states).

| Callback | When it runs |
|---|---|
| `onDose(ctx)` | **Required.** For each drink, injection or breath of gas. |
| `onTick(ctx)` | Every `tickSeconds` (default 6, minimum 1) while the level is above 0. |
| `thresholds` | Stages along the bar. See below. |
| `onFull(ctx)` | Every time a dose overflows the bar. See below. |
| `onSpike(ctx)` | At random on a tick, more often the fuller the bar. See below. |
| `onWearOff(ctx)` | Once, when the level gets back to 0 by any route, including an antidote or a safeword. |

**`onDose`** also gets:

- `method`: `"drink"`, `"inject"` or `"breath"`.
- `multiplier`: the dose's strength on LSCG's own scale. A drink is 2, an injection 0.8 to 2.2 depending on where
  it goes in, and a breath of gas 0.1 to 0.25.
- `sender`: who dosed the player.
- `location`: for an injection, the item group it went into.

### Building up: thresholds, overflow and spikes

Most drugs build in stages: a little drowsy, then very drowsy, then asleep. You have three tools for this.

```js
api.drugs.register({
    // ...name, label, keywords, onDose as above...
    thresholds: [
        { at: 0.3, onReach: ctx => ctx.sendAction("%NAME% giggles a little."),
                   onDrop: ctx => ctx.sendAction("%NAME% calms down.") },
        { at: 1,   onReach: ctx => ctx.sendAction("%NAME% is completely giddy.") },
    ],
    onFull(ctx) {
        ctx.sendAction("%NAME% collapses into helpless giggles.");
        ctx.states.get("frozen")?.activate(undefined, 8000);
    },
    spikeChance: 0.1,
    onSpike(ctx) {
        ctx.sendAction("%NAME% snorts with sudden laughter.");
    },
});
```

- **`thresholds`** are points along the bar, as fractions of `max` (above 0, up to 1). `onReach` runs when the
  level rises to or past a threshold, and `onDrop` when it falls back below. They run whatever moved the level:
  a dose, decay, an antidote, `addLevel` or `setLevel`. If one change crosses several thresholds, they run in bar
  order: lowest first going up, highest first going down.
- **`onFull`** runs every time a dose pushes the level past `max` (through `addLevel`), after the level is capped
  at `max`. It's the drug's big moment, like the sedative putting the player to sleep. Calling `addLevel` inside
  `onFull` won't trigger it again. Note the difference: a threshold at `1` runs once on *reaching* a full bar,
  while `onFull` runs on every dose that *overflows* it.
- **`onSpike`** runs at random on a tick. The chance is `spikeChance` (default 0.1) at a full bar, scaling down
  in a straight line to nothing at an empty one. It's good for occasional symptoms, like the sedative's nodding
  off.

### Dosing from code

`api.drugs.dose(type, options)` gives the player a dose without an item, for example from your own activity or
event. `type` is one of LSCG's drugs (`"sedative"`, `"mindcontrol"`, `"horny"` or `"antidote"`) or any
extension drug's id, yours or another extension's.

```js
api.drugs.dose("sedative", { multiplier: 0.5, minigame: false });   // a gentle build-up, no struggle minigame
```

- It goes through the same checks as an item dose. The player must have Drug Enhancements and that drug enabled
  (an antidote is always allowed). A `drug.beforeApply` handler can veto it, and `drug.applied` fires afterwards.
- It sends no chat text, so send your own.
- Options: `method` (default `"drink"`), `multiplier` (default 1), `sender`, `location`, and `minigame`. For the
  sedative and brainwashing drug, `minigame` (default `true`) starts the struggle minigame, as an item does. An
  antidote clears every drug and ignores `multiplier`.
- It returns `false` if nothing was applied.

`api.drugs.getLevel(type)` reads any drug's current level. LSCG's own drugs use an internal scale. To work with them,
listen to `drug.levelChanged`, which gives the level and the max on the same scale:

```js
api.events.on("drug.levelChanged", ({ type, previous, level, max }) => {
    if (type === "sedative" && previous / max < 0.5 && level / max >= 0.5)
        console.log("Half-way to asleep");
});
```

You can only add drugs. LSCG's own can't be changed, but you can react to them, dose them, and veto them.

---

## Built-in states

Spell effects and drugs can switch LSCG's own states on and off through `ctx.states`. The states are `asleep`,
`hypnotized`, `horny`, `denied`, `blind`, `deaf`, `frozen`, `gagged` and `x-ray-vision`.

```js
const gag = ctx.states.get("gagged");
gag?.activate(ctx.sender, 60_000);   // who did it (member number; defaults to the caster, or whoever dosed them),
                                     // and how long in ms (0 or omitted: no expiry)
gag?.active;                         // true while it's on
gag?.recover();                      // end it early
```

`get` returns `undefined` for a state this LSCG doesn't have, so keep the `?.`.

---

## Messages between players

Send messages to other players who are running your extension.

```js
// Receive: handle a command from another player's copy of your extension.
api.network.on("wave", ({ sender, args }) => {
    if (typeof args.text !== "string") return;   // always check: anyone with LSCG can send you anything
    console.log(`${sender} waves: ${args.text.slice(0, 100)}`);
});

// Send: to someone in the room. Returns false if they aren't there.
api.network.send(targetMemberNumber, "wave", { text: "hello!" });
```

- **Only your extension receives your commands.** They're named `<your id>.<name>` when sent.
- **Treat what you receive as untrusted.** `sender` is reliable, but `args` is whatever the sender chose. It
  arrives frozen and with no prototype, so a key like `__proto__` is just data.
- **Who can send to you.** By default a command is only accepted from players in the room whom the player gives
  item permission. Pass `{ permission: "anyone" }` to `on` to accept it from any LSCG player, in any room.
  With `"anyone"`, item permission, blacklists and room are all bypassed, so your handler is the only gate: validate
  every field, and never act on the sender's behalf of the player (move them, restrain them, change their settings)
  without the player's own confirmation.
- **Reaching other rooms.** `send` needs the target in the same room. Pass `{ beep: true }` to send by beep,
  which reaches them anywhere.
- **Limits.** `args` must be JSON and at most about 4 KB, both ways. `send` throws on invalid input, and returns
  `false` if the target isn't reachable or is the player themselves.

---

## Storing data

Save data with the player's LSCG settings, or share a little with the room.

```js
api.onReady(() => {                                    // storage needs the player's settings
    const saved = api.storage.get() ?? { launches: 0 };
    saved.launches++;
    api.storage.set(saved);

    api.storage.setPublic({ version: "1.2" });                  // everyone in the room can read this
    const theirs = api.storage.getPublic(otherMemberNumber);    // what another player shared, if anything
});
```

| | Private: `get` / `set` | Public: `getPublic` / `setPublic` |
|---|---|---|
| Who sees it | Only your extension, on this player | Your extension on every client in the room |
| Size | About 32 KB of JSON | About 1 KB, and about 4 KB across all extensions |
| Kept | With the player's LSCG settings, so also in their exports | Only while your extension is loaded |

- `get` returns a copy, so change it and then call `set`. `set(undefined)` clears it.
- Storage throws until the player's settings are loaded, so use it from `api.onReady`.
- Data from other players came over the network, so check it before using it. Oversized data reads as
  `undefined`.

---

## Settings screens

Give your extension a screen in LSCG's settings.

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

Screens appear on an **Extensions** page in LSCG's settings, which shows up once any extension has a screen. A
picker at its top chooses the extension.

- **Building blocks.** The `kit` is the same set LSCG's own screens use, so yours look and behave alike: `section`,
  `notice`, `chip`, `checkbox`, `text`, `number`, `select`, `button`, and `confirm` for a yes/no dialog.
- **Saving.** Rows call your `set` when the player changes them, so save there. Each row's `disabled` and
  `hidden` are re-checked after every change. Call `ui.refresh()` (the `build` argument) to re-read every `get`
  after you change data some other way.
- `build` runs each time the page opens. Screens added or removed while it's open show up straight away.
- Your callbacks run inside your extension's safety net. A screen that fails to build shows a short message
  instead.

---

## Reference

### `window.LSCG`

| Member | |
|---|---|
| `version` | LSCG's version without the leading `v`, e.g. `"0.9.3"` |
| `capabilities` | A `ReadonlySet<string>` of the API features this LSCG has |
| `isReady` | `true` once LSCG has loaded the player's settings |
| `onReady(cb)` | Runs `cb` when ready, or immediately if it already is |
| `getModApi(info)` | Registers your extension and returns its handle |

A `lscg:ready` event is also dispatched on `window` when LSCG becomes ready, with the same object as its
`detail`.

`window.LSCG` also holds a few internals from before the API existed, such as `getModule`, `sendLSCGBeep`,
`DrugKeywords` and `Outfits`. They aren't part of the API and may change without notice.

### Capabilities

| Capability | Provides |
|---|---|
| `core` | `getModApi`, `onReady`, `version`, `isReady`, the `LSCG_OnLoad` queue |
| `events` | `api.events.on` / `once` / `before` |
| `spells.effects` | `api.spells.registerEffect` / `unregisterEffect` / `listEffects` |
| `activities` | `api.activities.register` / `unregister` / `registerPrerequisite` |
| `drugs` | `api.drugs.register` / `unregister` / `dose` / `getLevel` |
| `network` | `api.network.on` / `send` |
| `storage` | `api.storage.get` / `set` / `getPublic` / `setPublic` |
| `settings` | `api.settings.registerScreen` / `unregisterScreen` |

### Observe-only events

| Event | Payload |
|---|---|
| `ready` | `{}`: LSCG finished loading the player's settings. |
| `state.activated` | `{ type, activatedBy?, duration? }`: a state such as `"asleep"`, `"hypnotized"` or `"blind"` began. |
| `state.recovered` | `{ type, reason }`: a state ended. `reason` is `"expired"`, `"safeword"`, `"dispel"` or `"manual"`. |
| `spell.cast` | `{ spell, target, paired? }`: the player cast a spell. |
| `spell.resisted` | `{ spell, sender, bounced }`: the player saved against a spell. `bounced` means a barrier sent it back. |
| `spell.received` | `{ spell, sender?, effects, duration? }`: a spell took hold. `effects` are the ones being applied. |
| `spell.effectApplied` | `{ effect, spell, sender?, duration? }`: one effect was applied. |
| `hypno.triggered` | `{ by?, byWord }`: the player was hypnotized by a trigger. `byWord` is false for other routes. |
| `hypno.awakened` | `{ method, by? }`: brought out of hypnosis. `method` is `"word"`, `"boop"`, `"snap"`, `"timeout"` or `"other"`. |
| `activity.sent` | `{ name, group?, target?, isLSCG }`: the player did an activity. |
| `activity.received` | `{ name, group?, source?, isLSCG }`: an activity was done to the player, including by themselves. |
| `grab.added` / `grab.removed` | `{ type, pairedMember, isSource }`: a grab or leash started or ended. `isSource` means the player holds it. |
| `drug.levelChanged` | `{ type, previous, level, max }`: any drug's level changed, including slow decay. `level / max` is how full the bar is. |
| `drug.applied` | `{ types, method, sender?, location? }`: a dose took effect. `method` is `"drink"`, `"inject"` or `"breath"`. |
| `collar.choke` | `{ level, previousLevel }`: the collar's choke level changed. |
| `collar.passout` | `{ reason, by? }`: the player started passing out. `reason` is `"collar"`, `"hand"`, `"plugs"` or `"chain"`. |
| `command.received` | `{ sender, name }`: an LSCG player-to-player command for the player was handled. |
| `settings.saved` | `{ published }`: LSCG saved the player's settings. `published` means they were also sent to the room. |
| `safeword` | `{ kind }`: the player used BC's safeword (`"revert"` or `"release"`). LSCG has cleared its effects. |

A `spell` is `{ name, effects, creator? }`.

### Before-events

| Event | You may change | If you cancel |
|---|---|---|
| `spell.beforeReceive` | `duration`, and remove entries from `effects` | The spell fizzles, with your reason in the emote |
| `spell.beforeEffect` | `duration` | That one effect fails to take hold |
| `grab.beforeIncoming` | Nothing | The grab is refused, and released on the grabber's side too |
| `drug.beforeApply` | Remove entries from `types` | Nothing is applied |

These can't be intercepted: LSCG's settings saves, safewords, `/lscg` commands, and player-to-player commands.

### Limits

| | Limit |
|---|---|
| Extension id | Lowercase letters, digits, `_` and `-` |
| Network command `args` | JSON, about 4 KB |
| Private storage | About 32 KB of JSON |
| Public storage | About 1 KB each, about 4 KB across all extensions |
| Drug bars shown per player | 12 extension bars, after LSCG's own three |
| Drug `tickSeconds` | At least 1 (default 6) |

### Types

TypeScript types for everything here, with a comment on each member, are published to npm as
[`@lscg/types`](https://www.npmjs.com/package/@lscg/types). Its version matches the LSCG release it describes.

```sh
npm install --save-dev @lscg/types
```

```ts
import type { LSCGGlobal } from "@lscg/types";
```

The main types are `LSCGGlobal` (`window.LSCG`) and `LSCGModApi` (your handle). Installing the package also types
`window.LSCG`, `window.LSCG_OnLoad` and the `lscg:ready` event. In a plain JavaScript file, a JSDoc comment gives
you the same editor completion:

```js
/** @param {import("@lscg/types").LSCGGlobal} LSCG */
function setup(LSCG) { /* ... */ }
```

The types come from [`src/api/types.ts`](../src/api/types.ts). `npm run pack:types` assembles the package locally
in `build/types-package/`.

### Examples

- [`examples/sample-extension.js`](../examples/sample-extension.js) uses every feature. Paste it into the console
  or load it with a script tag, as its header explains.
- [`examples/lscgLoader-local.user.js`](../examples/lscgLoader-local.user.js) is for working on LSCG itself. It
  loads your local build and the example together.
