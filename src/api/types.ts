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
