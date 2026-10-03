import { LSCGBeforeContext, LSCGBeforeEventMap, LSCGBeforeEventName, LSCGEventMap, LSCGEventName, LSCGEventsApi, LSCGListenerOptions } from "./types";
import { ErrorOwner, safeInvoke } from "./safeInvoke";

interface Listener {
    owner: ErrorOwner;
    handler: (arg: any) => void;
    priority: number;
    once: boolean;
}

export interface BeforeResult<P> {
    cancelled: boolean;
    reason?: string;
    payload: P;
}

const listeners = new Map<string, Listener[]>();
const beforeListeners = new Map<string, Listener[]>();

function add(map: Map<string, Listener[]>, name: string, listener: Listener): () => void {
    const list = map.get(name) ?? [];
    // Stable: a new listener goes after existing ones of the same priority.
    const index = list.findIndex(l => l.priority < listener.priority);
    if (index < 0) list.push(listener);
    else list.splice(index, 0, listener);
    map.set(name, list);
    return () => {
        const current = map.get(name);
        if (!current) return;
        const i = current.indexOf(listener);
        if (i >= 0) current.splice(i, 1);
    };
}

/** Frozen deep copy of plain objects and arrays, so observers can't reach back into LSCG's data. */
function snapshot<T>(value: T): T {
    if (Array.isArray(value))
        return Object.freeze(value.map(snapshot)) as T;
    if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
        const copy: any = {};
        for (const [key, v] of Object.entries(value)) copy[key] = snapshot(v);
        return Object.freeze(copy);
    }
    return value;
}

/** Internal: lets emit sites skip building a costly payload when nobody listens. */
export function hasListeners(name: LSCGEventName | LSCGBeforeEventName): boolean {
    return (listeners.get(name)?.length ?? 0) > 0 || (beforeListeners.get(name)?.length ?? 0) > 0;
}

/** Internal: notify observers. Cheap when nobody listens. */
export function emit<K extends LSCGEventName>(name: K, payload: LSCGEventMap[K]): void {
    const list = listeners.get(name);
    if (!list || list.length === 0) return;
    const frozen = snapshot(payload);
    for (const listener of [...list]) {
        if (listener.once) {
            const i = list.indexOf(listener);
            if (i >= 0) list.splice(i, 1);
        }
        safeInvoke(listener.owner, () => listener.handler(frozen));
    }
}

/** Internal: run before-handlers in priority order until one cancels. The caller applies only the fields it allows. */
export function emitBefore<K extends LSCGBeforeEventName>(name: K, payload: LSCGBeforeEventMap[K]): BeforeResult<LSCGBeforeEventMap[K]> {
    const result: BeforeResult<LSCGBeforeEventMap[K]> = { cancelled: false, payload };
    const list = beforeListeners.get(name);
    if (!list || list.length === 0) return result;
    const ctx: LSCGBeforeContext<LSCGBeforeEventMap[K]> = {
        payload,
        get cancelled() { return result.cancelled; },
        get reason() { return result.reason; },
        cancel(reason?: string) {
            result.cancelled = true;
            result.reason = reason;
        },
    };
    for (const listener of [...list]) {
        safeInvoke(listener.owner, () => listener.handler(ctx));
        if (result.cancelled) break;
    }
    return result;
}

/** Builds the `events` member of an extension handle. `track` registers cleanup for dispose(). */
export function createEventsApi(owner: ErrorOwner, track: (disposer: () => void) => void): LSCGEventsApi {
    const subscribe = (map: Map<string, Listener[]>, name: string, handler: (arg: any) => void, options: LSCGListenerOptions | undefined, once: boolean) => {
        if (typeof handler !== "function")
            throw new Error(`LSCG[ext:${owner.id}]: event handler for "${name}" must be a function.`);
        const remove = add(map, name, { owner, handler, priority: options?.priority ?? 0, once });
        track(remove);
        return remove;
    };
    return {
        on: (event, handler, options) => subscribe(listeners, event, handler, options, false),
        once: (event, handler, options) => subscribe(listeners, event, handler, options, true),
        before: (event, handler, options) => subscribe(beforeListeners, event, handler, options, false),
    };
}

/** Internal: snapshot of a spell for event payloads. */
export function spellInfo(spell: { Name: string; Effects: readonly string[]; Creator?: number }): { name: string; effects: string[]; creator?: number } {
    return { name: spell.Name, effects: [...(spell.Effects ?? [])], creator: spell.Creator };
}
