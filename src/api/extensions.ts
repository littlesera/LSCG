import { LSCGExtensionInfo, LSCGModApi } from "./types";
import { Registry } from "./registry";
import { whenReady } from "./ready";

const EXTENSION_ID_PATTERN = /^[a-z0-9_-]+$/;

/** Runs extension code so a throwing extension can't break LSCG. Errors are logged and counted against the extension;
 *  they only propagate when the player has RethrowExceptions enabled (debugging). */
export function safeInvoke<T>(ext: ModApiHandle | string, fn: () => T): T | undefined {
    const handle = typeof ext === "string" ? extensions.get(ext) : ext;
    try {
        return fn();
    } catch (e) {
        if (handle) handle.errorCount++;
        console.error(`LSCG[ext:${handle?.id ?? ext}] extension callback failed`, e);
        if ((globalThis as any).Player?.LSCG?.RethrowExceptions)
            throw e;
        return undefined;
    }
}

export class ModApiHandle implements LSCGModApi {
    readonly id: string;
    readonly info: Readonly<LSCGExtensionInfo>;
    errorCount = 0;
    private _disposed = false;
    private _disposers: (() => void)[] = [];

    constructor(info: LSCGExtensionInfo) {
        this.id = info.id;
        this.info = Object.freeze({ id: info.id, name: String(info.name ?? info.id), version: String(info.version ?? "") });
    }

    get disposed(): boolean {
        return this._disposed;
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
