/** Anything extension code runs on behalf of; errors are counted against it. */
export interface ErrorOwner {
    readonly id: string;
    errorCount: number;
}

/** Runs extension code so a throwing extension can't break LSCG. Errors are logged and counted against the extension;
 *  they only propagate when the player has RethrowExceptions enabled (debugging). */
export function safeInvoke<T>(owner: ErrorOwner, fn: () => T): T | undefined {
    try {
        return fn();
    } catch (e) {
        owner.errorCount++;
        console.error(`LSCG[ext:${owner.id}] extension callback failed`, e);
        if ((globalThis as any).Player?.LSCG?.RethrowExceptions)
            throw e;
        return undefined;
    }
}
