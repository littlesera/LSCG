import { LSCGExtensionInfo, LSCGGlobal, LSCGLoadCallback, LSCGModApi } from "./types";
import { ExtensionDisabledError, extensions, registerExtension, runRegistering } from "./extensions";
import { isLSCGReady, markReady, whenReady } from "./ready";
import { emit } from "./events";

export type { LSCGExtensionInfo, LSCGGlobal, LSCGModApi } from "./types";

/** LSCG version without the leading "v". */
export const apiVersion: string = LSCG_VERSION.replace(/^v/, "");

const _capabilities = new Set<string>(["core", "events", "spells.effects", "activities", "drugs", "network", "storage", "settings"]);
export const apiCapabilities: ReadonlySet<string> = _capabilities;

/** Internal: advertise an API feature once its implementation is wired up. */
export function addCapability(name: string): void {
    _capabilities.add(name);
}

function onReady(cb: () => void): void {
    whenReady(() => {
        try {
            cb();
        } catch (e) {
            console.error("LSCG: onReady callback failed", e);
        }
    });
}

function getModApi(info: LSCGExtensionInfo): LSCGModApi {
    return registerExtension(info);
}

/** The object handed to load-queue callbacks and the `lscg:ready` event; mirrors `window.LSCG`'s API members. */
export const lscg: LSCGGlobal = {
    version: apiVersion,
    capabilities: apiCapabilities,
    get isReady() {
        return isLSCGReady();
    },
    onReady,
    getModApi,
};

export { onReady, getModApi };

/** Adds the live `isReady` getter to `window.LSCG` (the IIFE exports object), which a plain export can't provide. */
export function exposeIsReady(target: object | undefined): void {
    if (!target || Object.prototype.hasOwnProperty.call(target, "isReady")) return;
    Object.defineProperty(target, "isReady", { enumerable: true, get: isLSCGReady });
}

function runLoadCallback(cb: LSCGLoadCallback): void {
    if (typeof cb !== "function") return;
    // Remembered so an extension turned back on from the login screen can load without a page reload.
    runRegistering(() => runLoadCallback(cb), () => {
        try {
            cb(lscg);
        } catch (e) {
            if (e instanceof ExtensionDisabledError)
                console.info(e.message);
            else
                console.error("LSCG: LSCG_OnLoad callback failed", e);
        }
    });
}

/** Runs callbacks queued on `window.LSCG_OnLoad` by extensions that loaded first, then replaces the queue
 *  so later pushes run immediately. Must run during script load, before init. */
export function installLoadQueue(): void {
    const queued = window.LSCG_OnLoad;
    window.LSCG_OnLoad = {
        push(...callbacks: LSCGLoadCallback[]): number {
            callbacks.forEach(runLoadCallback);
            return 0;
        },
    };
    if (Array.isArray(queued))
        (queued as LSCGLoadCallback[]).forEach(runLoadCallback);
}

/** Called once at the end of LSCG's init: runs onReady callbacks and fires the `lscg:ready` window event. */
export function announceReady(): void {
    markReady();
    emit("ready", {});
    window.dispatchEvent(new CustomEvent("lscg:ready", { detail: lscg }));
}

export function registeredExtensions() {
    return extensions.all();
}

export { extensions };
