// Public types for the LSCG extension API.
// Keep this file self-contained (no internal imports) so declarations can be emitted from it for extension authors.

/** Identifies an extension. `id` is used to namespace everything the extension registers ("<id>.<name>"). */
export interface LSCGExtensionInfo {
    /** Lowercase letters, digits, "_" and "-" only. */
    id: string;
    /** Human readable name, shown in the LSCG login badge. */
    name: string;
    /** Your extension's own version string. */
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
    /** Saves the player's LSCG settings and syncs LSCG's public data (drug levels, states, your `storage.setPublic`
     *  data) to the room now. Saves are batched to about one per second. Only available once LSCG is ready. */
    sync(): void;
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
    /** Custom hypnosis suggestion instructions (capability "hypno.instructions"). */
    readonly hypno: LSCGHypnoApi;
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
// Options
// ---------------------------------------------------------------------------------------------------------------

/** A value an option holds. */
export type LSCGOptionValue = boolean | number | string;

/** The current values of an effect's or drug's options, by field key. Always complete and valid when your code receives them. */
export type LSCGOptions = Record<string, LSCGOptionValue>;

interface LSCGOptionFieldBase {
    /** Plain identifier (letters, digits, underscore); the name of the value in `ctx.options`. Unique within the declaration. */
    key: string;
    /** Shown beside the control. Defaults to `key`. */
    label?: string;
    /** Smaller text under the label. */
    description?: string;
}

export interface LSCGToggleOption extends LSCGOptionFieldBase {
    type: "toggle";
    /** Default false. */
    default?: boolean;
}

export interface LSCGNumberOption extends LSCGOptionFieldBase {
    type: "number";
    /** Default 0. */
    min?: number;
    /** Default `min` + 10. */
    max?: number;
    step?: number;
    /** Default `min`. */
    default?: number;
}

export interface LSCGSelectOption extends LSCGOptionFieldBase {
    type: "select";
    choices: LSCGKitOption[];
    /** Default the first choice. */
    default?: string;
}

export interface LSCGTextOption extends LSCGOptionFieldBase {
    type: "text";
    /** Default 200, at most 1000. */
    maxLength?: number;
    multiline?: boolean;
    default?: string;
}

/** One setting players can change. Declare a list as `options` on a spell effect or a drug and LSCG draws the controls,
 *  stores the values, validates them (also when they come from another player) and hands them to your callbacks as `ctx.options`. */
export type LSCGOptionField = LSCGToggleOption | LSCGNumberOption | LSCGSelectOption | LSCGTextOption;

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
    /** The player's current values for the drug's `options` (their defaults if it declares none). */
    readonly options: LSCGOptions;
}

export interface LSCGDrugDoseContext extends LSCGDrugContext {
    readonly method: LSCGDrugMethod;
    /** How strong this dose is, on the scale LSCG's own drugs use: a drink is 2, an injection is 0.8 to 2.2 depending
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
    /** Settings the player can change under Drug Enhancements, next to the drug's opt-in. Read them from `ctx.options`. */
    options?: LSCGOptionField[];
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

export interface LSCGDrugLevelInfo {
    /** "sedative", "mindcontrol", "horny", or an extension drug's id. */
    readonly type: string;
    readonly level: number;
    /** The level that fills the bar. */
    readonly max: number;
    /** True when worked out from another player's last broadcast rather than read from your own settings. */
    readonly estimated: boolean;
}

export interface LSCGDrugsApi {
    /** Registers a drug. Returns a function that unregisters it. */
    register(definition: LSCGDrugDefinition): () => void;
    /** Unregisters one of this extension's drugs by name. */
    unregister(name: string): boolean;
    /** Gives the player a dose of a drug, as if they'd drunk or been injected with it, minus any flavour text (send
     *  your own with a `sendAction`-style emote). It respects the player's opt-in to that drug and
     *  `drug.beforeApply` vetoes, and emits `drug.applied`. Returns false if nothing was applied (not enabled,
     *  vetoed, unknown drug, or Drug Enhancements turned off). An "antidote" clears every drug and ignores `multiplier`. */
    dose(type: LSCGDrugType, options?: LSCGDoseOptions): boolean;
    /** A player's current level of a drug, from 0 to its max (0 for an unknown drug, or someone without LSCG). Built-in levels are on LSCG's
     *  internal scale, multiplied by the player's drug level multiplier. With no `memberNumber` (or your own) it is exact. For someone
     *  else it is an estimate: what their client last broadcast, decayed forward at the rate it broadcast since it arrived. It misses
     *  anything that happened since their last broadcast. */
    getLevel(type: LSCGDrugType, memberNumber?: number): number;
    /** Every drug level above 0 for a player (yours with no `memberNumber`), built-in drugs first, then extensions'. `level / max` is
     *  how full the bar is. `estimated` is true for anyone but you, with the same caveats as `getLevel`. */
    getLevels(memberNumber?: number): LSCGDrugLevelInfo[];
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
    /** Icon shown in the activity menu: a BC asset path such as "Icons/Activity/Slap.png". */
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

/** What a custom suggestion instruction's `perform` receives. Runs on the client of the hypnotized player, when a suggestion holding the
 *  instruction fires and they don't resist it. */
export interface LSCGHypnoInstructionContext {
    /** This instruction's namespaced id ("<extension id>.<name>"). */
    readonly instruction: string;
    /** The name of the suggestion it belongs to. */
    readonly suggestion: string;
    /** The values chosen for this instruction when the suggestion was written, validated against your `options` (their defaults if you declare none). */
    readonly options: LSCGOptions;
    /** Member number of whoever spoke the trigger. */
    readonly sender?: number;
    /** Member number of whoever installed the suggestion. */
    readonly installedBy?: number;
    /** Sends an emote about the player. Supports %NAME%, %POSSESSIVE% and %OPP_NAME% (whoever spoke the trigger). */
    sendAction(text: string): void;
    /** Built-in states the instruction may activate or recover. */
    readonly states: LSCGBuiltInStatesApi;
}

export interface LSCGHypnoInstructionDefinition {
    /** Name within your extension; the instruction id becomes "<extension id>.<name>". No ".". */
    name: string;
    /** Shown in the suggestion editor and in the player's list of instructions they can block. */
    label: string;
    /** One line, shown in the editor and the block list. */
    description?: string;
    /** Settings whoever writes the suggestion can change, behind a "Configure..." button. Read them from `ctx.options`. */
    options?: LSCGOptionField[];
    /** A suggestion can hold it only once (default false). */
    unrepeatable?: boolean;
    /** Nothing can follow it in a suggestion (default false). */
    terminating?: boolean;
    /** Carries out the instruction on the player. Errors are contained and counted against your extension. Players can block any
     *  instruction on themselves, in which case this never runs. */
    perform(ctx: LSCGHypnoInstructionContext): void;
}

export interface LSCGHypnoApi {
    /** Registers an instruction that suggestions can hold, next to LSCG's own. Returns a function that unregisters it. */
    registerInstruction(definition: LSCGHypnoInstructionDefinition): () => void;
    /** Unregisters one of this extension's instructions by name. */
    unregisterInstruction(name: string): boolean;
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
    /** The values the caster set for this copy of the effect in their spell, validated against your `options` (their defaults if you declare none). */
    readonly options: LSCGOptions;
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
    /** Milliseconds this effect waits after the previous effect of the same spell before taking hold (default 2000, from 1000 to 30000; lower values are raised to 1000).
     *  Ignored when it is the first effect, which always applies immediately. */
    delay?: number;
    /** May be picked by wild magic (default false). */
    allowRandom?: boolean;
    /** Block the effect by default the first time a player sees it (they can unblock it in LSCG's Magic™ settings). */
    defaultBlocked?: boolean;
    /** Settings the spell's author can change in the spell editor, one set for each copy of the effect in a spell. They travel
     *  with the spell, so the target's client validates them again before `apply` sees them as `ctx.options`. */
    options?: LSCGOptionField[];
    /** Applies the effect to the player. Errors are contained and counted against your extension. */
    apply(ctx: LSCGSpellEffectContext): void;
}

export interface LSCGSpellEffectInfo {
    id: string;
    label: string;
    description: string;
    builtIn: boolean;
    /** Built-in effects only: our grouping ("Mind", "Senses", "Form", "Binding", "Desire", "Harm", "Fortune", "Warding"). */
    domain?: string;
    /** Built-in effects only: the classic school of magic ("Abjuration", "Enchantment" and so on). */
    school?: string;
    /** Built-in effects only: 1 (cantrip) to 5. For an effect whose power depends on its settings, its lowest. */
    tier?: number;
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
/** One instruction of a suggestion, as hypno events describe it. */
export interface LSCGHypnoInstructionInfo {
    /** The instruction's id: one of LSCG's own (e.g. "activity", "strip") or an extension's `"<id>.<name>"`. */
    readonly instruction: string;
    /** The suggestion's name. */
    readonly suggestion: string;
    /** The instruction's position in the suggestion, from 0. */
    readonly index: number;
    /** Member number of whoever spoke the trigger. */
    readonly sender: number;
    /** Member number of whoever installed the suggestion. */
    readonly installedBy: number;
}
export type LSCGHypnoAwakenMethod = "word" | "boop" | "snap" | "timeout" | "other";
export type LSCGPassoutReason = "collar" | "hand" | "plugs" | "chain";

/** Observe-only events. Payloads are frozen snapshots; listeners can't change what LSCG does. */
export interface LSCGEventMap {
    /** LSCG finished initializing with the player's settings. */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the event carries no data
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
    "spell.received": { spell: LSCGSpellInfo; sender?: number; effects: string[]; duration?: number;
        /** For each of `effects`, how long (ms) after the spell arrived it takes hold. The first is 0. */
        delays: number[] };
    /** A spell's remaining effects were cancelled before they took hold. `reason`: the target was dispelled, used safeword, or LSCG unloaded. */
    "spell.interrupted": { spell: LSCGSpellInfo; sender?: number; reason: "dispel" | "safeword" | "unload"; effects: string[] };
    /** One effect of a spell was applied to the player. */
    "spell.effectApplied": { effect: string; spell: LSCGSpellInfo; sender?: number; duration?: number };
    /** The player was hypnotized by a trigger. `byWord` is false when triggered some other way (e.g. an activity). */
    "hypno.triggered": { by?: number; byWord: boolean };
    /** The player was brought out of a trigger hypnosis. */
    "hypno.awakened": { method: LSCGHypnoAwakenMethod; by?: number };
    /** A suggestion's trigger was spoken and the player either resisted it or submitted (its instructions are about to run). */
    "hypno.suggestionResolved": { suggestion: string; sender: number; installedBy: number; resisted: boolean };
    /** One instruction of a suggestion ran, built-in or from an extension. It ran, which isn't the same as succeeding: an Activity
     *  whose target has left, for instance, still counts. Not fired for blocked or vetoed instructions. */
    "hypno.instructionPerformed": LSCGHypnoInstructionInfo;
    /** The player sent an activity. `isLSCG` is true for LSCG's own (and LSCG-patched) activities. */
    "activity.sent": { name: string; group?: string; target?: number; isLSCG: boolean };
    /** An activity targeting the player was performed (including by the player on themselves). */
    "activity.received": { name: string; group?: string; source?: number; isLSCG: boolean };
    /** A grab/leash involving the player started. `isSource` is true when the player is the one holding. */
    "grab.added": { type: string; pairedMember: number; isSource: boolean };
    /** A grab/leash involving the player ended. */
    "grab.removed": { type: string; pairedMember: number; isSource: boolean };
    /** A drug's level changed, including slow decay (built-in or extension). `level` and `max` are on the same scale
     *  as `LSCGDrugsApi.getLevel`; `level / max` is the fraction of the bar, e.g. to apply effects at thresholds. */
    "drug.levelChanged": { type: string; previous: number; level: number; max: number };
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
    "spell.beforeReceive": { readonly spell: LSCGSpellInfo; readonly sender?: number; effects: string[]; duration?: number; delay?: number };
    /** Before one effect of a spell is applied. Mutable: `duration`. Cancel: that effect fizzles. */
    "spell.beforeEffect": { readonly effect: string; readonly spell: LSCGSpellInfo; readonly sender?: number; duration?: number };
    /** Before another player's grab on the player takes hold. Cancel: the grab is refused and released on both sides. */
    "grab.beforeIncoming": { readonly type: string; readonly sender: number };
    /** Before a drug takes effect. Mutable: `types` may only have entries removed, and `strength` may only be lowered (0 to 1, default 1; it
     *  scales the dose, so a drink of 2 at strength 0.5 adds 1). Cancel: nothing is applied. */
    "drug.beforeApply": { types: string[]; strength?: number; readonly method: LSCGDrugMethod; readonly sender?: number; readonly location?: string };
    /** Before one instruction of a suggestion runs, after the player has submitted and not blocked it. Nothing is mutable. Cancel: that one
     *  instruction is skipped silently and the rest of the suggestion carries on. */
    "hypno.beforeInstruction": LSCGHypnoInstructionInfo;
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
    /** Registers an extension and returns its handle. Calling it again with an id that is already registered returns the same handle; it
     *  throws if the id is invalid, or the player turned the extension off. */
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
