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
