let _ready = false;
let _pending: (() => void)[] = [];

export function isLSCGReady(): boolean {
    return _ready;
}

/** Runs `cb` once LSCG is ready, or immediately if it already is. Errors are the caller's to isolate. */
export function whenReady(cb: () => void): void {
    if (_ready) cb();
    else _pending.push(cb);
}

/** Called once at the end of LSCG's init. */
export function markReady(): void {
    if (_ready) return;
    _ready = true;
    const pending = _pending;
    _pending = [];
    pending.forEach(cb => cb());
}
