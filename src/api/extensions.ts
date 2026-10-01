import { LSCGEventsApi, LSCGExtensionInfo, LSCGModApi, LSCGSpellsApi } from "./types";
import { Registry } from "./registry";
import { whenReady } from "./ready";
import { safeInvoke } from "./safeInvoke";
import { createEventsApi } from "./events";
import { createSpellsApi } from "./spells";

export { safeInvoke };

const EXTENSION_ID_PATTERN = /^[a-z0-9_-]+$/;

export class ModApiHandle implements LSCGModApi {
    readonly id: string;
    readonly info: Readonly<LSCGExtensionInfo>;
    errorCount = 0;
    private _disposed = false;
    private _disposers: (() => void)[] = [];
    private _events: LSCGEventsApi | undefined;
    private _spells: LSCGSpellsApi | undefined;

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

export function registerExtension(info: LSCGExtensionInfo): ModApiHandle {
    if (!info || typeof info.id !== "string" || !EXTENSION_ID_PATTERN.test(info.id))
        throw new Error(`LSCG: invalid extension id "${info?.id}" (use lowercase letters, digits, "_" and "-").`);
    const handle = new ModApiHandle(info);
    extensions.register(handle);
    console.info(`LSCG: extension registered: ${handle.info.name} (${handle.id}) ${handle.info.version}`);
    return handle;
}
