/** Id-keyed registry with change notification. Duplicate ids throw rather than being silently ignored. */
export class Registry<T extends { id: string }> {
    private _items = new Map<string, T>();
    private _listeners: (() => void)[] = [];

    constructor(readonly kind: string) {}

    register(item: T): () => void {
        if (this._items.has(item.id))
            throw new Error(`LSCG: ${this.kind} "${item.id}" is already registered.`);
        this._items.set(item.id, item);
        this.notify();
        return () => this.unregister(item.id);
    }

    unregister(id: string): boolean {
        const removed = this._items.delete(id);
        if (removed) this.notify();
        return removed;
    }

    get(id: string): T | undefined {
        return this._items.get(id);
    }

    has(id: string): boolean {
        return this._items.has(id);
    }

    all(): T[] {
        return [...this._items.values()];
    }

    /** Subscribe to registrations/removals. Returns an unsubscribe function. */
    onChange(listener: () => void): () => void {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    }

    private notify(): void {
        for (const listener of [...this._listeners]) {
            try {
                listener();
            } catch (e) {
                console.error(`LSCG: ${this.kind} registry listener failed`, e);
            }
        }
    }
}
