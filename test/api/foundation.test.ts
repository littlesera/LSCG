// Extension API foundation: registry, extension handles, load queue, readiness.
import { describe, expect, it, vi } from "vitest";
import { Registry } from "api/registry";
import { registerExtension, safeInvoke } from "api/extensions";
import { announceReady, apiCapabilities, apiVersion, exposeIsReady, extensions, installLoadQueue, lscg, onReady } from "api";
import type { LSCGGlobal } from "api/types";

describe("Registry", () => {
    it("registers, notifies, and rejects duplicates", () => {
        const reg = new Registry<{ id: string }>("thing");
        const changed = vi.fn();
        reg.onChange(changed);
        const remove = reg.register({ id: "a" });
        expect(reg.has("a")).toBe(true);
        expect(() => reg.register({ id: "a" })).toThrow(/already registered/);
        remove();
        expect(reg.has("a")).toBe(false);
        expect(changed).toHaveBeenCalledTimes(2);
    });

    it("isolates a throwing change listener", () => {
        const reg = new Registry<{ id: string }>("thing");
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        const ok = vi.fn();
        reg.onChange(() => { throw new Error("boom"); });
        reg.onChange(ok);
        reg.register({ id: "x" });
        expect(ok).toHaveBeenCalled();
        err.mockRestore();
    });
});

describe("extension handles", () => {
    it("exposes the version without the leading v and the core capability", () => {
        expect(apiVersion).toBe(LSCG_VERSION.replace(/^v/, ""));
        expect(apiCapabilities.has("core")).toBe(true);
    });

    it("validates ids and rejects duplicates until disposed", () => {
        expect(() => registerExtension({ id: "Bad.Id", name: "x", version: "1" })).toThrow(/invalid extension id/);
        const handle = registerExtension({ id: "dup-test", name: "Dup", version: "1.0.0" });
        expect(() => registerExtension({ id: "dup-test", name: "Dup", version: "1.0.0" })).toThrow(/already registered/);
        handle.dispose();
        expect(handle.disposed).toBe(true);
        expect(extensions.has("dup-test")).toBe(false);
        registerExtension({ id: "dup-test", name: "Dup", version: "1.0.1" }).dispose();
    });

    it("namespaces ids and runs tracked disposers in reverse order", () => {
        const handle = registerExtension({ id: "scope-test", name: "Scope", version: "1" });
        expect(handle.scopedId("thing")).toBe("scope-test.thing");
        expect(() => handle.scopedId("a.b")).toThrow();
        const order: number[] = [];
        handle.track(() => order.push(1));
        handle.track(() => order.push(2));
        handle.dispose();
        expect(order).toEqual([2, 1]);
        expect(() => handle.track(() => {})).toThrow(/disposed/);
    });

    it("safeInvoke contains errors and counts them against the extension", () => {
        const handle = registerExtension({ id: "err-test", name: "Err", version: "1" });
        const err = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(safeInvoke(handle, () => { throw new Error("boom"); })).toBeUndefined();
        expect(safeInvoke(handle, () => 42)).toBe(42);
        expect(handle.errorCount).toBe(1);
        err.mockRestore();
        handle.dispose();
    });
});

describe("load queue", () => {
    it("drains callbacks queued before load and runs later pushes immediately", () => {
        const early = vi.fn();
        window.LSCG_OnLoad = [early];
        installLoadQueue();
        expect(early).toHaveBeenCalledWith(lscg);

        const late = vi.fn();
        (window.LSCG_OnLoad ??= []).push(late);
        expect(late).toHaveBeenCalledWith(lscg);
    });
});

// Readiness is one-way for the module, so these run in order: before, then after announceReady().
describe("readiness", () => {
    it("defers onReady callbacks until ready, then runs them and fires lscg:ready", () => {
        const target: Partial<LSCGGlobal> = {};
        exposeIsReady(target);
        expect(target.isReady).toBe(false);
        expect(lscg.isReady).toBe(false);

        const global = vi.fn();
        const handle = registerExtension({ id: "ready-test", name: "Ready", version: "1" });
        const perExt = vi.fn();
        const disposedExt = vi.fn();
        onReady(global);
        handle.onReady(perExt);
        const gone = registerExtension({ id: "ready-gone", name: "Gone", version: "1" });
        gone.onReady(disposedExt);
        gone.dispose();
        const event = vi.fn();
        window.addEventListener("lscg:ready", event);

        expect(global).not.toHaveBeenCalled();
        announceReady();

        expect(global).toHaveBeenCalledOnce();
        expect(perExt).toHaveBeenCalledOnce();
        expect(disposedExt).not.toHaveBeenCalled();
        expect(event).toHaveBeenCalledOnce();
        expect(target.isReady).toBe(true);

        const after = vi.fn();
        handle.onReady(after);
        expect(after).toHaveBeenCalledOnce();
        handle.dispose();
    });
});
