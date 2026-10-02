// Extension networking and storage: sending and receiving namespaced commands (permissions, validation, hostile
// input), data saved with the player's settings, and the public data shared with the room.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { announceReady } from "api";
import { MAX_COMMAND_BYTES } from "api/network";
import { MAX_PRIVATE_BYTES, MAX_PUBLIC_BYTES, MAX_PUBLISHED_BYTES } from "api/storage";
import { publishedExtensionData } from "api/publish";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";
import { CompressLSCGSettings } from "utils";

const g = globalThis as any;

describe("extension ids", () => {
    it.each(["__proto__", "constructor", "prototype"])("%s is reserved, because it would be a hazard as a key", name => {
        expect(() => registerExtension({ id: name, name: "x", version: "1" })).toThrow(/invalid extension id/);
    });
});

describe("extension storage before LSCG is ready", () => {
    it("can't be used yet, with a message that says how to fix it", () => {
        const api = registerExtension({ id: "early-bird", name: "Early", version: "1" });
        expect(() => api.storage.get()).toThrow(/onReady/);
        expect(() => api.storage.set(1)).toThrow(/onReady/);
        expect(publishedExtensionData()).toEqual({});
        api.dispose();
    });
});

describe("extension networking and storage", () => {
    let core: CoreModule;
    let api: ModApiHandle;
    let ids = 0;

    beforeAll(() => {
        [core] = boot(new CoreModule());
        announceReady();
    });

    beforeEach(() => {
        resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
        g.ServerChatRoomGetAllowItem = vi.fn(() => true);
        api = registerExtension({ id: `net-${++ids}`, name: "Net Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    const wire = (name: string) => `${api.id}.${name}`;
    const stranger = (n = 111) => makeCharacter({ MemberNumber: n });
    const inRoom = (n = 111) => addToRoom(stranger(n));
    const command = (from: ReturnType<typeof stranger>, name: string, args: { name: string; value: unknown }[] = []) =>
        receive.command(from, wire(name) as never, args);

    describe("sending", () => {
        it("sends a namespaced command to someone in the room", () => {
            inRoom(111);
            expect(api.network.send(111, "ping", { n: 1, tags: ["a"] })).toBe(true);
            const [msg] = sent.hidden();
            expect(msg).toMatchObject({ type: "command", target: 111, command: { name: wire("ping"), args: [{ name: "n", value: 1 }, { name: "tags", value: ["a"] }] } });
        });

        it("returns false rather than sending when the target isn't in the room, unless it beeps", () => {
            expect(api.network.send(222, "ping")).toBe(false);
            expect(sent.hidden()).toHaveLength(0);
            expect(api.network.send(222, "ping", { x: 1 }, { beep: true })).toBe(true);
            expect(sent.beeps()[0]).toMatchObject({ target: 222, message: { command: { name: wire("ping"), args: [{ name: "x", value: 1 }] } } });
        });

        it("never sends to the player themselves", () => {
            expect(api.network.send(1, "ping", {}, { beep: true })).toBe(false);
            expect(sent.beeps()).toHaveLength(0);
        });

        it("rejects bad input", () => {
            const circular: Record<string, unknown> = {};
            circular.self = circular;
            expect(() => api.network.send(0, "ping")).toThrow(/member number/);
            expect(() => api.network.send(1.5, "ping")).toThrow(/member number/);
            expect(() => api.network.send(111, "a.b")).toThrow(/invalid name/);
            expect(() => api.network.send(111, "ping", [] as never)).toThrow(/object/);
            expect(() => api.network.send(111, "ping", circular as never)).toThrow(/JSON/);
            expect(() => api.network.send(111, "ping", { big: "x".repeat(MAX_COMMAND_BYTES) })).toThrow(/bytes/);
            expect(sent.hidden()).toHaveLength(0);
        });

        it("only passes plain JSON through (a function or undefined is dropped, like JSON.stringify)", () => {
            inRoom(111);
            api.network.send(111, "ping", { keep: 1, drop: undefined, fn: () => 1 } as never);
            expect(sent.hidden()[0].command!.args).toEqual([{ name: "keep", value: 1 }]);
        });
    });

    describe("receiving", () => {
        it("hands the handler the sender and the args as a frozen object", () => {
            const handler = vi.fn();
            api.network.on("ping", handler);
            command(inRoom(111), "ping", [{ name: "n", value: 5 }, { name: "list", value: [1, 2] }]);
            expect(handler).toHaveBeenCalledOnce();
            const cmd = handler.mock.calls[0][0];
            expect(cmd.sender).toBe(111);
            expect(cmd.args.n).toBe(5);
            expect(cmd.args.list).toEqual([1, 2]);
            expect(Object.isFrozen(cmd)).toBe(true);
            expect(Object.isFrozen(cmd.args)).toBe(true);
            expect(Object.getPrototypeOf(cmd.args)).toBeNull();
        });

        it("treats hostile argument names as plain data", () => {
            const handler = vi.fn();
            api.network.on("ping", handler);
            command(inRoom(111), "ping", [{ name: "__proto__", value: { polluted: true } }, { name: "constructor", value: 1 }]);
            const { args } = handler.mock.calls[0][0];
            expect(Object.keys(args)).toEqual(["__proto__", "constructor"]);
            expect(({} as any).polluted).toBeUndefined();
        });

        it("only delivers a command to the extension it is named for, and never a built-in one", () => {
            const mine = vi.fn();
            const other = registerExtension({ id: `other-${ids}`, name: "Other", version: "1" });
            const theirs = vi.fn();
            api.network.on("ping", mine);
            other.network.on("ping", theirs);
            command(inRoom(111), "ping");
            expect(mine).toHaveBeenCalledOnce();
            expect(theirs).not.toHaveBeenCalled();

            receive.command(inRoom(112), "debug", [{ name: "x", value: "y" }]);
            expect(mine).toHaveBeenCalledOnce();
            other.dispose();
        });

        it("by default only accepts commands from players the player gives item permission", () => {
            const handler = vi.fn();
            api.network.on("ping", handler);
            g.ServerChatRoomGetAllowItem = vi.fn(() => false);
            command(inRoom(111), "ping");
            expect(handler).not.toHaveBeenCalled();
            g.ServerChatRoomGetAllowItem = vi.fn(() => true);
            command(inRoom(112), "ping");
            expect(handler).toHaveBeenCalledOnce();
        });

        it("by default drops commands from players who aren't in the room (permission can't be checked)", () => {
            const handler = vi.fn();
            api.network.on("ping", handler);
            command(stranger(333), "ping");
            expect(handler).not.toHaveBeenCalled();
        });

        it('with permission "anyone" accepts both', () => {
            const handler = vi.fn();
            api.network.on("ping", handler, { permission: "anyone" });
            g.ServerChatRoomGetAllowItem = vi.fn(() => false);
            command(inRoom(111), "ping");
            command(stranger(333), "ping");
            expect(handler).toHaveBeenCalledTimes(2);
        });

        it("drops a command whose args are over the size limit, with a warning", () => {
            const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
            const handler = vi.fn();
            api.network.on("ping", handler);
            command(inRoom(111), "ping", [{ name: "big", value: "x".repeat(MAX_COMMAND_BYTES) }]);
            expect(handler).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledOnce();
            warn.mockRestore();
        });

        it("contains an error in one handler and still runs the others", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            const second = vi.fn();
            api.network.on("ping", () => { throw new Error("boom"); });
            api.network.on("ping", second);
            command(inRoom(111), "ping");
            expect(second).toHaveBeenCalledOnce();
            expect(api.errorCount).toBe(1);
            err.mockRestore();
        });

        it("stops delivering after unsubscribe or dispose", () => {
            const handler = vi.fn();
            const off = api.network.on("ping", handler);
            off();
            command(inRoom(111), "ping");
            expect(handler).not.toHaveBeenCalled();

            api.network.on("ping", handler);
            api.dispose();
            command(inRoom(112), "ping");
            expect(handler).not.toHaveBeenCalled();
        });

        it("rejects a handler that isn't a function", () => {
            expect(() => api.network.on("ping", "no" as never)).toThrow(/function/);
        });
    });

    describe("stored data", () => {
        it("round-trips JSON, returning a copy each time", () => {
            expect(api.storage.get()).toBeUndefined();
            api.storage.set({ n: 1, list: [1, 2] });
            const first = api.storage.get<{ n: number; list: number[] }>()!;
            first.list.push(3);
            expect(api.storage.get()).toEqual({ n: 1, list: [1, 2] });
        });

        it("is saved in the player's settings, so it is in exports, and cleared by undefined", () => {
            api.storage.set({ n: 1 });
            expect(player().LSCG.Extensions[api.id]).toEqual({ private: { n: 1 } });
            expect(CompressLSCGSettings().length).toBeGreaterThan(0);
            api.storage.set(undefined);
            expect(player().LSCG.Extensions[api.id]).toBeUndefined();
        });

        it("keeps each extension's data to itself", () => {
            const other = registerExtension({ id: `other-${ids}`, name: "Other", version: "1" });
            api.storage.set("mine");
            expect(other.storage.get()).toBeUndefined();
            other.storage.set("theirs");
            expect(api.storage.get()).toBe("mine");
            other.dispose();
        });

        it("refuses data that isn't JSON or is too big, leaving what was saved untouched", () => {
            api.storage.set("kept");
            const circular: Record<string, unknown> = {};
            circular.self = circular;
            expect(() => api.storage.set(circular as never)).toThrow(/JSON/);
            expect(() => api.storage.set(undefined as never)).not.toThrow();
            api.storage.set("kept");
            expect(() => api.storage.set("x".repeat(MAX_PRIVATE_BYTES))).toThrow(/limit/);
            expect(api.storage.get()).toBe("kept");
        });

        it.each([["a string", "oops"], ["an array", []], ["null", null], ["a number", 5]])("recovers from a settings file whose Extensions is %s", (_name, bad) => {
            player().LSCG.Extensions = bad;
            expect(api.storage.get()).toBeUndefined();
            expect(publishedExtensionData()).toEqual({});
            api.storage.set({ ok: true });
            expect(api.storage.get()).toEqual({ ok: true });
        });

        it("recovers from a settings file whose entry isn't an object", () => {
            player().LSCG.Extensions = { [api.id]: "oops" };
            expect(api.storage.get()).toBeUndefined();
            api.storage.set(1);
            expect(api.storage.get()).toBe(1);
        });

        it("ignores an inherited or hostile entry in a loaded settings file", () => {
            player().LSCG.Extensions = JSON.parse('{"__proto__": {"private": "polluted"}}');
            expect(api.storage.get()).toBeUndefined();
            expect(({} as any).private).toBeUndefined();
        });
    });

    describe("public data", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("goes out in the public sync, for loaded extensions only", () => {
            api.storage.setPublic({ version: 2 });
            expect(core.publicSettings.ExtensionData).toEqual({ [api.id]: { version: 2 } });
            expect(api.storage.getPublic()).toEqual({ version: 2 });

            api.dispose();
            expect(core.publicSettings.ExtensionData).toEqual({});
            expect(player().LSCG.Extensions[api.id]).toEqual({ public: { version: 2 } }); // still saved, just not shared
        });

        it("keeps private and public data apart", () => {
            api.storage.set("secret");
            api.storage.setPublic("shared");
            expect(core.publicSettings.ExtensionData![api.id]).toBe("shared");
            expect(JSON.stringify(core.publicSettings)).not.toContain("secret");
            api.storage.setPublic(undefined);
            expect(core.publicSettings.ExtensionData).toEqual({});
            expect(api.storage.get()).toBe("secret");
        });

        it("is limited in size, per extension and in total", () => {
            expect(() => api.storage.setPublic("x".repeat(MAX_PUBLIC_BYTES))).toThrow(/limit/);
            const crowd = Array.from({ length: 8 }, (_, i) => registerExtension({ id: `crowd-${ids}-${i}`, name: `C${i}`, version: "1" }));
            crowd.forEach(h => h.storage.setPublic("x".repeat(MAX_PUBLIC_BYTES - 10)));
            const published = Object.keys(publishedExtensionData());
            expect(published.length).toBe(Math.floor(MAX_PUBLISHED_BYTES / (MAX_PUBLIC_BYTES - 10 + 2)));
            crowd.forEach(h => h.dispose());
        });

        it("reads another player's data from their last sync, validating it", () => {
            const other = inRoom(111);
            expect(api.storage.getPublic(111)).toBeUndefined();
            receive.hidden(other, { IsLSCG: true, type: "sync", reply: false, target: null, version: "v1", settings: { ExtensionData: { [api.id]: { hello: "world" } } } } as never);
            expect(api.storage.getPublic<{ hello: string }>(111)).toEqual({ hello: "world" });
            expect(api.storage.getPublic(222)).toBeUndefined();
        });

        it("ignores another player's oversized or malformed data", () => {
            const other = inRoom(111);
            receive.hidden(other, { IsLSCG: true, type: "sync", reply: false, target: null, version: "v1", settings: { ExtensionData: { [api.id]: "x".repeat(MAX_PUBLIC_BYTES + 1) } } } as never);
            expect(api.storage.getPublic(111)).toBeUndefined();
            receive.hidden(other, { IsLSCG: true, type: "sync", reply: false, target: null, version: "v1", settings: { ExtensionData: "nope" } } as never);
            expect(api.storage.getPublic(111)).toBeUndefined();
        });

        it("starts publishing when an extension with saved public data registers after login", () => {
            const returning = `returning-${ids}`;
            player().LSCG.Extensions = { [returning]: { public: { v: 1 } } };
            expect(core.publicSettings.ExtensionData![returning]).toBeUndefined();
            const handle = registerExtension({ id: returning, name: "Returning", version: "1" });
            expect(core.publicSettings.ExtensionData![returning]).toEqual({ v: 1 });
            handle.dispose();
        });
    });
});
