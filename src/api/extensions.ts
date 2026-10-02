import { LSCGActivitiesApi, LSCGDrugsApi, LSCGEventsApi, LSCGExtensionInfo, LSCGModApi, LSCGNetworkApi, LSCGSettingsApi, LSCGSpellsApi, LSCGStorageApi } from "./types";
import { Registry } from "./registry";
import { whenReady } from "./ready";
import { safeInvoke } from "./safeInvoke";
import { createEventsApi } from "./events";
import { createSpellsApi } from "./spells";
import { createActivitiesApi } from "./activities";
import { createDrugsApi } from "./drugs";
import { createNetworkApi } from "./network";
import { createStorageApi } from "./storage";
import { createSettingsApi } from "./settings";

export { safeInvoke };

const EXTENSION_ID_PATTERN = /^[a-z0-9_-]+$/;
/** Names that mean something special on every JavaScript object; never usable as an id. */
const RESERVED_IDS = new Set(["__proto__", "constructor", "prototype"]);

export class ModApiHandle implements LSCGModApi {
    readonly id: string;
    readonly info: Readonly<LSCGExtensionInfo>;
    errorCount = 0;
    private _disposed = false;
    private _disposers: (() => void)[] = [];
    private _events: LSCGEventsApi | undefined;
    private _spells: LSCGSpellsApi | undefined;
    private _activities: LSCGActivitiesApi | undefined;
    private _drugs: LSCGDrugsApi | undefined;
    private _network: LSCGNetworkApi | undefined;
    private _storage: LSCGStorageApi | undefined;
    private _settings: LSCGSettingsApi | undefined;

    constructor(info: LSCGExtensionInfo) {
        this.id = info.id;
        this.info = Object.freeze({ id: info.id, name: String(info.name ?? info.id), version: String(info.version ?? "") });
    }

    get disposed(): boolean {
        return this._disposed;
    }

    get events(): LSCGEventsApi {
        return this._events ??= createEventsApi(this, disposer => this.track(disposer));
    }

    get spells(): LSCGSpellsApi {
        return this._spells ??= createSpellsApi(this, name => this.scopedId(name), disposer => this.track(disposer));
    }

    get activities(): LSCGActivitiesApi {
        return this._activities ??= createActivitiesApi(this, name => this.scopedId(name), disposer => this.track(disposer));
    }

    get drugs(): LSCGDrugsApi {
        return this._drugs ??= createDrugsApi(this, name => this.scopedId(name), disposer => this.track(disposer));
    }

    get network(): LSCGNetworkApi {
        return this._network ??= createNetworkApi(this, name => this.scopedId(name), disposer => this.track(disposer));
    }

    get storage(): LSCGStorageApi {
        return this._storage ??= createStorageApi(this);
    }

    get settings(): LSCGSettingsApi {
        return this._settings ??= createSettingsApi(this, name => this.scopedId(name), disposer => this.track(disposer));
    }

    onReady(cb: () => void): void {
        this.assertActive();
        whenReady(() => {
            if (!this._disposed) safeInvoke(this, cb);
        });
    }

    dispose(): void {
        if (this._disposed) return;
        this._disposed = true;
        const disposers = this._disposers.reverse();
        this._disposers = [];
        disposers.forEach(d => {
            try {
                d();
            } catch (e) {
                console.error(`LSCG[ext:${this.id}] dispose step failed`, e);
            }
        });
        extensions.unregister(this.id);
        // An extension that disposes itself is gone; one the player turned off stays listed so it can be turned back on.
        if (!isExtensionDisabled(this.id))
            knownExtensions.delete(this.id);
    }

    /** Internal: namespaced id for something this extension registers. */
    scopedId(name: string): `${string}.${string}` {
        if (!name || name.includes("."))
            throw new Error(`LSCG[ext:${this.id}]: invalid name "${name}" (must be non-empty and contain no ".")`);
        return `${this.id}.${name}`;
    }

    /** Internal: remember a cleanup step to run on dispose(). */
    track(disposer: () => void): void {
        this.assertActive();
        this._disposers.push(disposer);
    }

    private assertActive(): void {
        if (this._disposed)
            throw new Error(`LSCG[ext:${this.id}]: this extension handle has been disposed.`);
    }
}

export const extensions = new Registry<ModApiHandle>("extension");

// ---------------------------------------------------------------------------------------------------------------
// Turning extensions off from the login screen
// ---------------------------------------------------------------------------------------------------------------

/** Kept in localStorage: the login screen comes before the player's settings exist. Applies to everyone on this browser. */
const DISABLED_KEY = "LSCG_DisabledExtensions";

/** Thrown by getModApi for an extension the player turned off, so the rest of its load callback doesn't run. */
export class ExtensionDisabledError extends Error {
    constructor(readonly extensionId: string) {
        super(`LSCG: extension "${extensionId}" is turned off on the login screen; not loading it.`);
    }
}

export interface KnownExtension {
    info: Readonly<LSCGExtensionInfo>;
    /** Runs the extension's LSCG_OnLoad callback again, to turn it back on without a reload. Missing if it registered
     *  some other way. */
    reload?: () => void;
}

/** Every extension that asked to register this page load, turned off or not, in the order they first asked. */
export const knownExtensions = new Map<string, KnownExtension>();

let currentReload: (() => void) | undefined;

/** Runs `fn` (an extension's load callback) so that an extension registering during it can be re-run by `reload`. */
export function runRegistering(reload: () => void, fn: () => void): void {
    const previous = currentReload;
    currentReload = reload;
    try { fn(); } finally { currentReload = previous; }
}

export function disabledExtensionIds(): string[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(DISABLED_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
        return [];
    }
}

export function isExtensionDisabled(id: string): boolean {
    return disabledExtensionIds().includes(id);
}

/** Turns an extension off (disposing it now) or back on (re-running its load callback if possible). Returns false
 *  if it is turned on but couldn't be loaded yet, so the page needs a reload. */
export function setExtensionEnabled(id: string, enabled: boolean): boolean {
    const others = disabledExtensionIds().filter(x => x !== id);
    try {
        localStorage.setItem(DISABLED_KEY, JSON.stringify(enabled ? others : [...others, id]));
    } catch (e) {
        console.warn("LSCG: couldn't save which extensions are turned off", e);
    }
    if (!enabled) {
        extensions.get(id)?.dispose();
        return true;
    }
    if (!extensions.get(id))
        knownExtensions.get(id)?.reload?.();
    return !!extensions.get(id);
}

export function registerExtension(info: LSCGExtensionInfo): ModApiHandle {
    if (!info || typeof info.id !== "string" || !EXTENSION_ID_PATTERN.test(info.id) || RESERVED_IDS.has(info.id))
        throw new Error(`LSCG: invalid extension id "${info?.id}" (use lowercase letters, digits, "_" and "-").`);
    const handle = new ModApiHandle(info);
    knownExtensions.set(info.id, { info: handle.info, reload: currentReload ?? knownExtensions.get(info.id)?.reload });
    if (isExtensionDisabled(info.id))
        throw new ExtensionDisabledError(info.id);
    extensions.register(handle);
    console.info(`LSCG: extension registered: ${handle.info.name} (${handle.id}) ${handle.info.version}`);
    return handle;
}
