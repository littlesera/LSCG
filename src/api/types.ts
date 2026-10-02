// Public types for the LSCG extension API.
// Keep this file self-contained (no internal imports) so declarations can be emitted from it for extension authors.

/** Identifies an extension. `id` is used to namespace everything the extension registers ("<id>.<name>"). */
export interface LSCGExtensionInfo {
    /** Lowercase letters, digits, "_" and "-" only. */
    id: string;
    /** Human readable name, shown in the LSCG login badge. */
    name: string;
    version: string;
}

/** Per-extension handle returned by `LSCG.getModApi`. Members are added as API features ship; check `LSCG.capabilities`. */
export interface LSCGModApi {
    readonly id: string;
    readonly info: Readonly<LSCGExtensionInfo>;
    /** True once `dispose()` has been called; a disposed handle can no longer register anything. */
    readonly disposed: boolean;
    /** Runs `cb` once LSCG has fully initialized with the player's settings (immediately if it already has). */
    onReady(cb: () => void): void;
    /** Removes everything this extension registered and frees its id for re-registration. */
    dispose(): void;
    /** LSCG event hooks (capability "events"). */
    readonly events: LSCGEventsApi;
    /** Custom spell effects (capability "spells.effects"). */
    readonly spells: LSCGSpellsApi;
    /** Custom activities (capability "activities"). */
    readonly activities: LSCGActivitiesApi;
    /** Custom drugs (capability "drugs"). */
    readonly drugs: LSCGDrugsApi;
    /** Messages between players running your extension (capability "network"). */
    readonly network: LSCGNetworkApi;
    /** Data saved with the player's LSCG settings (capability "storage"). */
    readonly storage: LSCGStorageApi;
    /** Screens in LSCG's settings (capability "settings"). */
    readonly settings: LSCGSettingsApi;
}

// ---------------------------------------------------------------------------------------------------------------
// Settings screens
// ---------------------------------------------------------------------------------------------------------------

export interface LSCGKitRow {
    label: string;
    /** Smaller text under the label. */
    description?: string;
    /** Re-checked after every change. */
    disabled?(): boolean;
    /** Re-checked after every change. */
    hidden?(): boolean;
}

export interface LSCGKitOption {
    value: string;
    label: string;
}

/** The same building blocks LSCG's own settings screens use, so extension screens look and behave alike. Every
 *  `get`/`set`/`onClick` you pass runs inside your extension's error handling. Rows call `set` when the player
 *  changes them; save there (for example with `api.storage.set`). */
export interface LSCGKit {
    section(title: string, description?: string): HTMLElement;
    notice(text: string): HTMLElement;
    chip(label: string, options?: { tone?: "ok" | "warn" | "blocked" | "info" | "muted"; tooltip?: string }): HTMLElement;
    checkbox(row: LSCGKitRow & { get(): boolean; set(value: boolean): void }): HTMLElement;
    text(row: LSCGKitRow & { get(): string; set(value: string): void; placeholder?: string; maxLength?: number; multiline?: boolean }): HTMLElement;
    number(row: LSCGKitRow & { get(): number; set(value: number): void; min: number; max: number; step?: number }): HTMLElement;
    select(row: LSCGKitRow & { get(): string; set(value: string): void; options: LSCGKitOption[] }): HTMLElement;
    button(row: LSCGKitRow & { buttonLabel: string; onClick(): void; danger?: boolean }): HTMLElement;
    /** Asks for confirmation before running `onConfirm`. */
    confirm(title: string, message: string, confirmLabel: string, onConfirm: () => void): void;
}

export interface LSCGSettingsUi {
    readonly kit: LSCGKit;
    /** Re-reads every row's `get`, e.g. after you change data some other way. */
    refresh(): void;
}

export interface LSCGSettingsScreenDefinition {
    /** Name within your extension; no ".". */
    name: string;
    /** Shown in the picker beside your extension's name (default: `name`). */
    label?: string;
    /** Builds the screen's content, using `ui.kit`. Runs each time the player opens LSCG's Extensions settings. */
    build(ui: LSCGSettingsUi): HTMLElement | HTMLElement[];
}

export interface LSCGSettingsApi {
    /** Adds a screen to LSCG's "Extensions" settings page (which appears once any extension has one). Returns a
     *  function that removes it. */
    registerScreen(definition: LSCGSettingsScreenDefinition): () => void;
    /** Removes one of this extension's screens by name. */
    unregisterScreen(name: string): boolean;
}

// ---------------------------------------------------------------------------------------------------------------
// Network and storage
// ---------------------------------------------------------------------------------------------------------------

/** Anything JSON can hold. Network messages and stored data are limited to this. */
export type LSCGJson = null | boolean | number | string | LSCGJson[] | { [key: string]: LSCGJson };

export interface LSCGIncomingCommand {
    /** Member number of the player who sent it. Anyone with LSCG can send anything: treat the contents as untrusted. */
    readonly sender: number;
    /** What the sender included. A frozen copy with no prototype, so it can't be used to reach built-in objects. */
    readonly args: Readonly<Record<string, LSCGJson>>;
}

export interface LSCGCommandOptions {
    /** Who may send you this command. "itemPermission" (the default) accepts it only from players in the room whom
     *  the player gives item permission; "anyone" accepts it from any LSCG player, even from another room. */
    permission?: "itemPermission" | "anyone";
}

export interface LSCGSendOptions {
    /** Reach the target by beep, which works from another room. By default the target must be in the same room. */
    beep?: boolean;
}

export interface LSCGNetworkApi {
    /** Handles a command another player's copy of your extension sends with `send`. Returns an unsubscribe function. */
    on(name: string, handler: (command: LSCGIncomingCommand) => void, options?: LSCGCommandOptions): () => void;
    /** Sends a command to a player. `args` must be JSON and at most about 4 KB. Returns false if it couldn't be sent:
     *  the target isn't in the room (and `beep` isn't set), or is the player themselves. Throws on invalid input. */
    send(target: number, name: string, args?: Record<string, LSCGJson>, options?: LSCGSendOptions): boolean;
}

export interface LSCGStorageApi {
    /** What this extension saved for the player, or undefined. Returns a copy: change it, then call `set`. */
    get<T extends LSCGJson = LSCGJson>(): T | undefined;
    /** Saves data with the player's LSCG settings (so it is also in their exports). Up to about 32 KB of JSON.
     *  `undefined` clears it. Only available once LSCG is ready. */
    set(value: LSCGJson | undefined): void;
    /** Data shared with everyone in the room, from the player named or (by default) the player. Others' data comes
     *  from over the network, so validate it. */
    getPublic<T extends LSCGJson = LSCGJson>(memberNumber?: number): T | undefined;
    /** Shares data with everyone in the room, as part of LSCG's sync. Keep it small: up to about 1 KB of JSON.
     *  `undefined` stops sharing. Only shared while your extension is loaded. */
    setPublic(value: LSCGJson | undefined): void;
}

// ---------------------------------------------------------------------------------------------------------------
// Drugs
// ---------------------------------------------------------------------------------------------------------------

/** Passed to every callback of a custom drug. */
export interface LSCGDrugContext {
    /** This drug's namespaced id ("<extension id>.<name>"). */
    readonly drug: string;
    /** The player's current level of this drug, from 0 to `max`. Reflects `addLevel`/`setLevel` calls as they happen. */
    readonly level: number;
    /** The level that fills the drug's bar. */
    readonly max: number;
    /** Raises (or, if negative, lowers) the level, keeping it between 0 and `max`. Returns the new level. */
    addLevel(amount: number): number;
    /** Sets the level, keeping it between 0 and `max`. Returns the new level. */
    setLevel(level: number): number;
    /** Sends an emote about the player. Supports %NAME%, %POSSESSIVE%, and %OPP_NAME% (whoever dosed them, if known). */
    sendAction(text: string): void;
    /** Built-in states the drug may activate or recover, e.g. to put the player to sleep at a high level. */
    readonly states: LSCGBuiltInStatesApi;
}

export interface LSCGDrugDoseContext extends LSCGDrugContext {
    readonly method: LSCGDrugMethod;
    /** How strong this dose is, on the scale LSCG's own drugs use: a drink is 2, an injection is 1 to 2.2 depending
     *  on where it goes in, and each breath of a gas is a small fraction. */
    readonly multiplier: number;
    /** Member number of whoever dosed the player. */
    readonly sender?: number;
    /** The item group an injection went into, e.g. "ItemNeck". */
    readonly location?: string;
}

/** A point on a drug's bar that triggers callbacks when the level crosses it. */
export interface LSCGDrugThreshold {
    /** Where on the bar, as a fraction of `max` (above 0, up to 1). 1 is a full bar. */
    at: number;
    /** Runs when the level rises to or past `at`, however it got there (a dose, `addLevel`, `setLevel`). */
    onReach?(ctx: LSCGDrugContext): void;
    /** Runs when the level falls back below `at`, by decay, an antidote, `addLevel` or `setLevel`. */
    onDrop?(ctx: LSCGDrugContext): void;
}

export interface LSCGDrugDefinition {
    /** Name within your extension; the drug id becomes "<extension id>.<name>". No ".". */
    name: string;
    /** Shown in LSCG's settings and the crafting screen. */
    label: string;
    /** One line for the settings and crafting screens. */
    description?: string;
    /** Phrases that make a crafted item this drug: if its name or description contains one, it's a dose. Case
     *  and punctuation don't matter. Items must be a Medical Injector, Latex Respirator, Filled Glass or Mug. */
    keywords: string[];
    /** Colour of the level bar drawn beside the character, any CSS colour string (default a soft blue). */
    color?: string;
    /** The level that fills the bar (default 10). */
    max?: number;
    /** How much the level falls each minute (default 1; 0 means it never wears off by itself). */
    decayPerMinute?: number;
    /** Runs on the player when they take a dose. Players have to opt in to each drug in LSCG's settings first. */
    onDose(ctx: LSCGDrugDoseContext): void;
    /** Seconds between ticks, at least 1 (default 6). Sets how often `onTick` and `onSpike` can run and how often
     *  the level decays; the decay per minute is still `decayPerMinute`. */
    tickSeconds?: number;
    /** Runs every tick (see `tickSeconds`) while the player's level is above 0. */
    onTick?(ctx: LSCGDrugContext): void;
    /** Stages along the bar, e.g. drowsy at 0.3, blurred at 0.6, asleep at 1. Each fires its `onReach` as the level
     *  rises past it and its `onDrop` as it falls back, in order when one change crosses several. Unlike `onFull`,
     *  a threshold at 1 fires on reaching max, not only on overflowing it. */
    thresholds?: LSCGDrugThreshold[];
    /** Runs every time a dose (`addLevel`) would push the level past `max`, so the bar overflows. The level is
     *  clamped to `max` first. Like the built-in sedative's "fall asleep", use it for the drug's big moment. */
    onFull?(ctx: LSCGDrugContext): void;
    /** Runs at random on a tick, with a chance that grows as the bar fills: `spikeChance` at a full bar, scaling
     *  down linearly to 0 at an empty one. Like the sedative's "nodding off" at lower levels. */
    onSpike?(ctx: LSCGDrugContext): void;
    /** Chance per tick (0 to 1) that `onSpike` runs at a full bar (default 0.1). */
    spikeChance?: number;
    /** Runs once when the level falls back to 0, however that happens. */
    onWearOff?(ctx: LSCGDrugContext): void;
}

/** Where a dose comes from. Built-in drug types are "sedative", "mindcontrol", "horny" and "antidote"; an
 *  extension's drug is its namespaced id ("<extension id>.<name>"), yours or another extension's. */
export type LSCGDrugType = "sedative" | "mindcontrol" | "horny" | "antidote" | (string & {});

export interface LSCGDoseOptions {
    /** How the dose is delivered, as far as `drug.beforeApply` listeners and `onDose` are concerned (default "drink"). */
    method?: LSCGDrugMethod;
    /** Strength on LSCG's own scale (default 1; see `LSCGDrugDoseContext.multiplier`). */
    multiplier?: number;
    /** Member number to credit as whoever dosed the player. */
    sender?: number;
    /** The item group an injection went into, e.g. "ItemNeck". */
    location?: string;
    /** Built-in sedative and mind control only: start their incapacitation minigame if the player isn't already
     *  under, as an item dose does (default true). Pass false for a gentle build-up. */
    minigame?: boolean;
}

export interface LSCGDrugsApi {
    /** Registers a drug. Returns a function that unregisters it. */
    register(definition: LSCGDrugDefinition): () => void;
    /** Unregisters one of this extension's drugs by name. */
    unregister(name: string): boolean;
    /** Gives the player a dose of a drug, as if they'd drunk or been injected with it, minus any flavour text (send
     *  your own with a `sendAction`-style emote). It respects the player's opt-in to that drug and
     *  `drug.beforeApply` vetoes, and emits `drug.applied`. Returns false if nothing was applied (not enabled,
     *  vetoed, unknown drug, or LSCG not ready). An "antidote" clears every drug and ignores `multiplier`. */
    dose(type: LSCGDrugType, options?: LSCGDoseOptions): boolean;
    /** The player's current level of a drug, from 0 to its max (0 for an unknown drug). Built-in levels are on LSCG's
     *  internal scale, multiplied by the player's drug level multiplier. */
    getLevel(type: LSCGDrugType): number;
}

// ---------------------------------------------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------------------------------------------

/** A BC character, as handed to extension callbacks. Cast to BC's own `Character` for anything beyond this. */
export interface LSCGCharacterRef {
    readonly MemberNumber?: number;
    IsPlayer(): boolean;
}

export interface LSCGActivityTarget {
    /** The BC item group the activity is performed on, e.g. "ItemArms" or "ItemMouth". */
    group: string;
    /** Can also be done to yourself on this group (shown in your own menu). */
    selfAllowed?: boolean;
    /** Only yourself, not other players, on this group. Implies `selfAllowed`. */
    selfOnly?: boolean;
    /** Menu label (defaults to the activity's name). */
    label?: string;
    /** Menu label when done to yourself (defaults to `label`). */
    selfLabel?: string;
    /** The chat line. BC substitutions work: SourceCharacter, TargetCharacter, PronounPossessive, etc. */
    action: string;
    /** The chat line when done to yourself (defaults to `action`). */
    selfAction?: string;
}

export interface LSCGActivitySendContext {
    /** Member number of who the activity is aimed at. */
    readonly target?: number;
    /** The group it was performed on. */
    readonly group?: string;
}

export interface LSCGActivityReceiveContext {
    /** Member number of who did it to the player. */
    readonly sender?: number;
}

export interface LSCGActivityDefinition {
    /** Name within your extension; BC sees "LSCG_<extension id>.<name>". No ".". */
    name: string;
    /** Arousal a full activity gives the target (default 70). */
    maxProgress?: number;
    /** Arousal a full activity gives when done to yourself (default 70). */
    maxProgressSelf?: number;
    /** What the actor needs, e.g. "UseArms", "UseMouth" (BC's own), or the short name of a prerequisite you registered. */
    prerequisites?: string[];
    /** Where it can be done. At least one. */
    targets: LSCGActivityTarget[];
    /** Icon shown in the activity menu: a BC asset path such as "Assets/Female3DCG/Activity/Slap.png". */
    image?: string;
    /** Runs on the actor's client as the activity is sent. Return `false` to stop it being sent. */
    onSend?(ctx: LSCGActivitySendContext): boolean | void;
    /** Runs on the target's client when someone does the activity to them. */
    onReceive?(ctx: LSCGActivityReceiveContext): void;
}

export interface LSCGPrerequisiteDefinition {
    /** Name within your extension; list it in an activity's `prerequisites` by this short name. No ".". */
    name: string;
    /** Whether `acting` can do an activity to `acted` on `group`. If it throws, the activity isn't offered. */
    check(ctx: { acting: LSCGCharacterRef; acted: LSCGCharacterRef; group?: string }): boolean;
}

export interface LSCGActivitiesApi {
    /** Adds an activity to BC's activity menu. Returns a function that removes it. */
    register(definition: LSCGActivityDefinition): () => void;
    /** Removes one of this extension's activities by name. */
    unregister(name: string): boolean;
    /** Adds a prerequisite activities can require. Returns a function that removes it. */
    registerPrerequisite(definition: LSCGPrerequisiteDefinition): () => void;
}

// ---------------------------------------------------------------------------------------------------------------
// Spells
// ---------------------------------------------------------------------------------------------------------------

/** Built-in LSCG states an extension may drive (e.g. to give a custom spell effect a duration). */
export type LSCGBuiltInStateType = "asleep" | "hypnotized" | "horny" | "denied" | "blind" | "deaf" | "frozen" | "gagged" | "x-ray-vision";

export interface LSCGStateHandle {
    readonly type: LSCGBuiltInStateType;
    readonly active: boolean;
    /** Activates the state on the player. `durationMs` 0 or undefined means no expiry. */
    activate(activatedBy?: number, durationMs?: number): void;
    recover(): void;
}

export interface LSCGBuiltInStatesApi {
    get(type: LSCGBuiltInStateType): LSCGStateHandle | undefined;
}

/** What a custom spell effect's `apply` receives. Runs on the client of the player the spell hit. */
export interface LSCGSpellEffectContext {
    /** This effect's namespaced id ("<extension id>.<name>"). */
    readonly effect: string;
    readonly spell: LSCGSpellInfo;
    /** Member number of the caster, if known. */
    readonly sender?: number;
    /** Duration (ms) LSCG computed for this effect; 0 or undefined means no expiry. */
    readonly duration?: number;
    /** Sends an emote about the player. Supports BC/LSCG substitutions such as %NAME%, %POSSESSIVE%, %OPP_NAME% (the caster). */
    sendAction(text: string): void;
    /** Built-in states the effect may activate or recover. */
    readonly states: LSCGBuiltInStatesApi;
}

export interface LSCGSpellEffectDefinition {
    /** Name within your extension; the effect id becomes "<extension id>.<name>". No ".". */
    name: string;
    /** Shown in spell editors and menus. */
    label: string;
    /** One line, shown in the spell editor and block list. */
    description: string;
    /** Helpful effect: if every effect of a spell is beneficial, the target gets no save roll and no duration. */
    beneficial?: boolean;
    /** Always give this effect a duration, even when the target allows unlimited-duration spells. */
    forcesDuration?: boolean;
    /** May be picked by wild magic (default false). */
    allowRandom?: boolean;
    /** Block the effect by default the first time a player sees it (they can unblock it in LSCG's Magic™ settings). */
    defaultBlocked?: boolean;
    /** Applies the effect to the player. Errors are contained and counted against your extension. */
    apply(ctx: LSCGSpellEffectContext): void;
}

export interface LSCGSpellEffectInfo {
    id: string;
    label: string;
    description: string;
    builtIn: boolean;
}

export interface LSCGSpellsApi {
    /** Registers a spell effect; players can then add it to their spells. Returns a function that unregisters it. */
    registerEffect(definition: LSCGSpellEffectDefinition): () => void;
    /** Unregisters one of this extension's effects by name. */
    unregisterEffect(name: string): boolean;
    /** All spell effects known to this client (built-in and from any extension). */
    listEffects(): LSCGSpellEffectInfo[];
}

// ---------------------------------------------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------------------------------------------

/** A snapshot of a spell as seen by event listeners. */
export interface LSCGSpellInfo {
    name: string;
    /** Effect ids, e.g. "Blinding". */
    effects: string[];
    /** Member number of the spell's creator. */
    creator?: number;
}

export type LSCGStateRecoverReason = "expired" | "safeword" | "dispel" | "manual";
export type LSCGDrugMethod = "drink" | "inject" | "breath";
export type LSCGHypnoAwakenMethod = "word" | "boop" | "snap" | "timeout" | "other";
export type LSCGPassoutReason = "collar" | "hand" | "plugs" | "chain";

/** Observe-only events. Payloads are frozen snapshots; listeners can't change what LSCG does. */
export interface LSCGEventMap {
    /** LSCG finished initializing with the player's settings. */
    "ready": {};
    /** One of the player's LSCG states (e.g. "asleep", "hypnotized", "blind") became active. */
    "state.activated": { type: string; activatedBy?: number; duration?: number };
    /** One of the player's LSCG states ended. */
    "state.recovered": { type: string; reason: LSCGStateRecoverReason };
    /** The player cast a spell. */
    "spell.cast": { spell: LSCGSpellInfo; target: number; paired?: number };
    /** The player saved against an incoming spell. `bounced` is true if a magic barrier sent it back to the caster. */
    "spell.resisted": { spell: LSCGSpellInfo; sender: number; bounced: boolean };
    /** A spell took hold on the player; `effects` are the ones that will be applied. */
    "spell.received": { spell: LSCGSpellInfo; sender?: number; effects: string[]; duration?: number };
    /** One effect of a spell was applied to the player. */
    "spell.effectApplied": { effect: string; spell: LSCGSpellInfo; sender?: number; duration?: number };
    /** The player was hypnotized by a trigger. `byWord` is false when triggered some other way (e.g. an activity). */
    "hypno.triggered": { by?: number; byWord: boolean };
    /** The player was brought out of a trigger hypnosis. */
    "hypno.awakened": { method: LSCGHypnoAwakenMethod; by?: number };
    /** The player sent an activity. `isLSCG` is true for LSCG's own (and LSCG-patched) activities. */
    "activity.sent": { name: string; group?: string; target?: number; isLSCG: boolean };
    /** An activity targeting the player was performed (including by the player on themselves). */
    "activity.received": { name: string; group?: string; source?: number; isLSCG: boolean };
    /** A grab/leash involving the player started. `isSource` is true when the player is the one holding. */
    "grab.added": { type: string; pairedMember: number; isSource: boolean };
    /** A grab/leash involving the player ended. */
    "grab.removed": { type: string; pairedMember: number; isSource: boolean };
    /** A drug took effect on the player. */
    /** A drug's level changed, including slow decay (built-in or extension). `level` and `max` are on the same scale
     *  as `LSCGDrugsApi.getLevel`; `level / max` is the fraction of the bar, e.g. to apply effects at thresholds. */
    "drug.levelChanged": { type: string; previous: number; level: number; max: number };
    "drug.applied": { types: string[]; method: LSCGDrugMethod; sender?: number; location?: string };
    /** The player's collar choke level changed. */
    "collar.choke": { level: number; previousLevel: number };
    /** The player started passing out. */
    "collar.passout": { reason: LSCGPassoutReason; by?: number };
    /** An LSCG player-to-player command addressed to the player was handled. */
    "command.received": { sender: number; name: string };
    /** The player's LSCG settings were saved. `published` is true if they were also synced to the room. */
    "settings.saved": { published: boolean };
    /** The player used BC's safeword (LSCG states and effects have been cleared). */
    "safeword": { kind: "revert" | "release" };
}

/** Events with a "before" phase. Handlers may cancel the action or change the fields documented as mutable. */
export interface LSCGBeforeEventMap {
    /** Before an incoming spell takes hold. Mutable: `duration`; `effects` may only have entries removed. Cancel: the spell fizzles. */
    "spell.beforeReceive": { readonly spell: LSCGSpellInfo; readonly sender?: number; effects: string[]; duration?: number };
    /** Before one effect of a spell is applied. Mutable: `duration`. Cancel: that effect fizzles. */
    "spell.beforeEffect": { readonly effect: string; readonly spell: LSCGSpellInfo; readonly sender?: number; duration?: number };
    /** Before another player's grab on the player takes hold. Cancel: the grab is refused and released on both sides. */
    "grab.beforeIncoming": { readonly type: string; readonly sender: number };
    /** Before a drug takes effect. Mutable: `types` may only have entries removed. Cancel: nothing is applied. */
    "drug.beforeApply": { types: string[]; readonly method: LSCGDrugMethod; readonly sender?: number; readonly location?: string };
}

export type LSCGEventName = keyof LSCGEventMap;
export type LSCGBeforeEventName = keyof LSCGBeforeEventMap;

export interface LSCGBeforeContext<P> {
    /** The pending action. Only fields documented as mutable for this event are honored. */
    readonly payload: P;
    readonly cancelled: boolean;
    readonly reason?: string;
    /** Stops the action. Remaining before-handlers are skipped. */
    cancel(reason?: string): void;
}

export interface LSCGListenerOptions {
    /** Higher runs first (default 0). Ties run in registration order. */
    priority?: number;
}

export interface LSCGEventsApi {
    /** Observe an event. Returns an unsubscribe function. */
    on<K extends LSCGEventName>(event: K, handler: (payload: Readonly<LSCGEventMap[K]>) => void, options?: LSCGListenerOptions): () => void;
    /** Observe the next occurrence of an event only. */
    once<K extends LSCGEventName>(event: K, handler: (payload: Readonly<LSCGEventMap[K]>) => void, options?: LSCGListenerOptions): () => void;
    /** Intercept an action before it happens. Returns an unsubscribe function. */
    before<K extends LSCGBeforeEventName>(event: K, handler: (ctx: LSCGBeforeContext<LSCGBeforeEventMap[K]>) => void, options?: LSCGListenerOptions): () => void;
}

/** The public surface on `window.LSCG`. */
export interface LSCGGlobal {
    /** LSCG version, without the leading "v" (e.g. "0.9.2"). */
    readonly version: string;
    /** Feature detection: names of the API features this build provides (e.g. "core", "events"). */
    readonly capabilities: ReadonlySet<string>;
    /** True after LSCG has fully initialized with the player's settings. */
    readonly isReady: boolean;
    /** Runs `cb` once LSCG is ready (immediately if it already is). */
    onReady(cb: () => void): void;
    /** Registers an extension and returns its handle. Throws if the id is invalid or already registered. */
    getModApi(info: LSCGExtensionInfo): LSCGModApi;
}

export type LSCGLoadCallback = (lscg: LSCGGlobal) => void;

/** Queue for extensions that may load before LSCG: `(window.LSCG_OnLoad ??= []).push(lscg => ...)`.
 *  Callbacks run as soon as LSCG's script loads (before login), or immediately if it already has. */
export interface LSCGLoadQueue {
    push(...callbacks: LSCGLoadCallback[]): number;
}

declare global {
    interface Window {
        /** Set once LSCG's script has finished loading. */
        LSCG?: LSCGGlobal;
        LSCG_OnLoad?: LSCGLoadCallback[] | LSCGLoadQueue;
    }
    interface WindowEventMap {
        /** Fired on `window` once LSCG is ready. */
        "lscg:ready": CustomEvent<LSCGGlobal>;
    }
}
