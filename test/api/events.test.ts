// Extension API event bus: ordering, once, cancellation, unsubscribe/dispose, error isolation, frozen payloads.
import { afterEach, describe, expect, it, vi } from "vitest";
import { emit, emitBefore, hasListeners } from "api/events";
import { registerExtension, type ModApiHandle } from "api/extensions";

let ids = 0;
const handles: ModApiHandle[] = [];
function ext(): ModApiHandle {
    const handle = registerExtension({ id: `events-test-${++ids}`, name: "Events Test", version: "1" });
    handles.push(handle);
    return handle;
}

afterEach(() => {
    handles.splice(0).forEach(h => h.dispose());
});

describe("events.on", () => {
    it("runs listeners by priority (higher first), then in registration order", () => {
        const api = ext();
        const order: string[] = [];
        api.events.on("collar.choke", () => order.push("default-1"));
        api.events.on("collar.choke", () => order.push("high"), { priority: 10 });
        api.events.on("collar.choke", () => order.push("default-2"));
        api.events.on("collar.choke", () => order.push("low"), { priority: -5 });
        emit("collar.choke", { level: 1, previousLevel: 0 });
        expect(order).toEqual(["high", "default-1", "default-2", "low"]);
    });

    it("once listeners run a single time", () => {
        const handler = vi.fn();
        ext().events.once("collar.choke", handler);
        emit("collar.choke", { level: 1, previousLevel: 0 });
        emit("collar.choke", { level: 2, previousLevel: 1 });
        expect(handler).toHaveBeenCalledOnce();
    });

    it("unsubscribe and dispose both remove listeners", () => {
        const api = ext();
        const a = vi.fn();
        const b = vi.fn();
        const off = api.events.on("collar.choke", a);
        api.events.on("collar.choke", b);
        off();
        emit("collar.choke", { level: 1, previousLevel: 0 });
        expect(a).not.toHaveBeenCalled();
        expect(b).toHaveBeenCalledOnce();

        api.dispose();
        expect(hasListeners("collar.choke")).toBe(false);
        emit("collar.choke", { level: 1, previousLevel: 0 });
        expect(b).toHaveBeenCalledOnce();
    });

    it("gives listeners a frozen deep copy of the payload", () => {
        const effects = ["Blinding"];
        let seen: any;
        ext().events.on("spell.received", p => { seen = p; });
        emit("spell.received", { spell: { name: "s", effects }, effects, duration: 5 });
        expect(Object.isFrozen(seen)).toBe(true);
        expect(Object.isFrozen(seen.spell)).toBe(true);
        expect(Object.isFrozen(seen.effects)).toBe(true);
        expect(() => seen.effects.push("Deafening")).toThrow();
        expect(effects).toEqual(["Blinding"]);
    });

    it("isolates a throwing listener and counts the error against its extension", () => {
        const bad = ext();
        const good = vi.fn();
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        bad.events.on("collar.choke", () => { throw new Error("boom"); }, { priority: 1 });
        ext().events.on("collar.choke", good);
        expect(() => emit("collar.choke", { level: 1, previousLevel: 0 })).not.toThrow();
        expect(good).toHaveBeenCalledOnce();
        expect(bad.errorCount).toBe(1);
        err.mockRestore();
    });

    it("rejects non-function handlers", () => {
        expect(() => ext().events.on("collar.choke", "nope" as never)).toThrow();
    });
});

describe("events.before", () => {
    it("returns the payload untouched when nobody listens", () => {
        const payload = { type: "arm", sender: 2 };
        const result = emitBefore("grab.beforeIncoming", payload);
        expect(result).toEqual({ cancelled: false, payload });
    });

    it("lets handlers mutate the payload, and stops at the first cancel", () => {
        const api = ext();
        const later = vi.fn();
        api.events.before("spell.beforeReceive", ctx => { ctx.payload.duration = 1000; }, { priority: 5 });
        api.events.before("spell.beforeReceive", ctx => ctx.cancel("nope"));
        api.events.before("spell.beforeReceive", later, { priority: -1 });
        const result = emitBefore("spell.beforeReceive", { spell: { name: "s", effects: [] }, effects: [], duration: 5 });
        expect(result.cancelled).toBe(true);
        expect(result.reason).toBe("nope");
        expect(result.payload.duration).toBe(1000);
        expect(later).not.toHaveBeenCalled();
    });

    it("a throwing before-handler doesn't cancel", () => {
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        ext().events.before("grab.beforeIncoming", () => { throw new Error("boom"); });
        expect(emitBefore("grab.beforeIncoming", { type: "arm", sender: 2 }).cancelled).toBe(false);
        err.mockRestore();
    });
});
