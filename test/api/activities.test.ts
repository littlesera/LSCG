// Extension activities: registration into BC's activity list (names, targets, menu text), the outgoing and incoming
// callbacks, custom prerequisites, validation, error containment, and clean removal on dispose.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { apiCapabilities } from "api";
import type { LSCGActivityDefinition } from "api/types";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

describe("extension activities", () => {
    let activities: ActivityModule;
    let api: ModApiHandle;
    let cache: Record<string, string>;
    let ids = 0;
    const g = globalThis as any;

    beforeAll(() => {
        [, , activities] = boot(new CoreModule(), new ConsentModule(), new ActivityModule());
    });

    beforeEach(() => {
        resetWorld();
        cache = {};
        g.ActivityDictionaryLoad = vi.fn(() => ({ cache }));
        api = registerExtension({ id: `acts-${++ids}`, name: "Activity Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
    });

    const wire = (name: string) => `LSCG_${api.id}.${name}`;
    const find = (name: string) => g.ActivityFemale3DCG.find((a: any) => a.Name === wire(name));
    const pat = (): LSCGActivityDefinition => ({
        name: "pat",
        targets: [{ group: "ItemHead", label: "Pat head", action: "SourceCharacter pats TargetCharacter." }],
    });

    function sendActivity(name: string, target: ReturnType<typeof makeCharacter>, group = "ItemHead") {
        g.ServerSend("ChatRoomChat", {
            Type: "Activity",
            Content: `ChatOther-${group}-${name}`,
            Dictionary: [
                { Tag: "ActivityName", text: name },
                { Tag: "DestinationCharacter", MemberNumber: target.MemberNumber },
                { FocusGroupName: group },
            ],
        });
    }

    it("is advertised as a capability", () => {
        expect(apiCapabilities.has("activities")).toBe(true);
    });

    describe("registration", () => {
        it("adds the activity to BC under a namespaced LSCG_ name, with defaults", () => {
            api.activities.register(pat());
            expect(find("pat")).toMatchObject({ Name: wire("pat"), MaxProgress: 70, MaxProgressSelf: 70, Prerequisite: ["ZoneAccessible"], Target: ["ItemHead"] });
            expect(g.ActivityFemale3DCGOrdering).toContain(wire("pat"));
            expect(g.ActivityDictionary).toContainEqual([`Activity${wire("pat")}`, "Pat head"]);
        });

        it("writes the menu label and chat line for each target", () => {
            api.activities.register(pat());
            expect(cache[`Label-ChatOther-ItemHead-${wire("pat")}`]).toBe("Pat head");
            expect(cache[`ChatOther-ItemHead-${wire("pat")}`]).toBe("SourceCharacter pats TargetCharacter.");
        });

        it("labels default to the activity's name", () => {
            api.activities.register({ name: "pat", targets: [{ group: "ItemHead", action: "x" }] });
            expect(cache[`Label-ChatOther-ItemHead-${wire("pat")}`]).toBe("pat");
        });

        it("supports self-only and self-allowed targets, with their own text", () => {
            api.activities.register({
                name: "stretch", maxProgress: 10, maxProgressSelf: 20, image: "Assets/x.png",
                targets: [
                    { group: "ItemArms", selfOnly: true, action: "other", selfAction: "SourceCharacter stretches." },
                    { group: "ItemHead", selfAllowed: true, action: "pat", selfLabel: "Pat own head", selfAction: "SourceCharacter pats own head." },
                ],
            });
            const a = find("stretch");
            expect(a).toMatchObject({ MaxProgress: 10, MaxProgressSelf: 20 });
            expect(a.Target).toEqual(["ItemHead"]);
            expect(a.TargetSelf).toEqual(["ItemArms", "ItemHead"]);
            expect(cache[`ChatSelf-ItemArms-${wire("stretch")}`]).toBe("SourceCharacter stretches.");
            expect(cache[`Label-ChatSelf-ItemHead-${wire("stretch")}`]).toBe("Pat own head");
            expect(activities.CustomImages.get(wire("stretch"))).toBe("Assets/x.png");
        });

        it("leaves BC's and LSCG's own activities alone", () => {
            const before = g.ActivityFemale3DCG.length;
            api.activities.register(pat());
            expect(g.ActivityFemale3DCG.length).toBe(before + 1);
            api.dispose();
            expect(g.ActivityFemale3DCG.length).toBe(before);
        });

        it("warns about a target group that isn't a real BC item group", () => {
            g.AssetGroup = [{ Name: "ItemHead", Category: "Item" }];
            const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
            api.activities.register({ name: "typo", targets: [{ group: "ItemHeadd", action: "x" }, { group: "ItemHead", action: "x" }] });
            expect(warn).toHaveBeenCalledOnce();
            expect(warn.mock.calls[0][0]).toContain('"ItemHeadd"');
            warn.mockRestore();
            g.AssetGroup = [];
        });

        it("applies activities registered while the module wasn't listening, when it syncs (as it does on load)", () => {
            activities.StopListeningForExtensions();
            try {
                api.activities.register(pat());
                expect(find("pat")).toBeUndefined();
                activities.SyncExtensionActivities();
                expect(find("pat")).toBeDefined();
            } finally {
                activities.ListenForExtensions();
            }
        });
    });

    describe("validation", () => {
        it("rejects duplicates, bad names, missing targets, and bad progress", () => {
            api.activities.register(pat());
            expect(() => api.activities.register(pat())).toThrow(/already registered/);
            expect(() => api.activities.register({ ...pat(), name: "a.b" })).toThrow(/invalid name/);
            expect(() => api.activities.register({ ...pat(), name: "" })).toThrow(/non-empty/);
            expect(() => api.activities.register({ name: "none", targets: [] })).toThrow(/at least one target/);
            expect(() => api.activities.register({ name: "g", targets: [{ group: "", action: "x" }] })).toThrow(/group/);
            expect(() => api.activities.register({ name: "t", targets: [{ group: "ItemHead", action: " " }] })).toThrow(/action/);
            expect(() => api.activities.register({ ...pat(), name: "p", maxProgress: -1 })).toThrow(/maxProgress/);
            expect(() => api.activities.registerPrerequisite({ name: "x", check: "no" as never })).toThrow(/check/);
        });

        it("registers nothing when validation fails", () => {
            const before = g.ActivityFemale3DCG.length;
            expect(() => api.activities.register({ name: "none", targets: [] })).toThrow();
            expect(g.ActivityFemale3DCG.length).toBe(before);
        });
    });

    describe("outgoing (the actor's client)", () => {
        it("onSend gets the target and group, and the activity still goes out", () => {
            const onSend = vi.fn();
            api.activities.register({ ...pat(), onSend });
            const target = addToRoom(makeCharacter({ MemberNumber: 4242 }));
            sendActivity(wire("pat"), target);
            expect(onSend).toHaveBeenCalledWith({ target: 4242, group: "ItemHead" });
            expect(sent.raw()).toHaveLength(1);
        });

        it("returning false from onSend stops the activity being sent", () => {
            api.activities.register({ ...pat(), onSend: () => false });
            sendActivity(wire("pat"), addToRoom(makeCharacter()));
            expect(sent.raw()).toHaveLength(0);
        });

        it("an error in onSend is contained, and the activity still goes out", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.activities.register({ ...pat(), onSend: () => { throw new Error("boom"); } });
            sendActivity(wire("pat"), addToRoom(makeCharacter()));
            expect(api.errorCount).toBe(1);
            expect(sent.raw()).toHaveLength(1);
            err.mockRestore();
        });

        it("adds the activity's chat text for players without the extension", () => {
            api.activities.register(pat());
            sendActivity(wire("pat"), addToRoom(makeCharacter()));
            const [, data] = sent.raw()[0];
            expect((data.Dictionary as any[]).some(d => typeof d.Tag === "string" && d.Tag.includes("ActivityDictionary.csv"))).toBe(true);
        });
    });

    describe("incoming (the target's client)", () => {
        it("onReceive gets who did it", () => {
            const onReceive = vi.fn();
            api.activities.register({ ...pat(), onReceive });
            const sender = makeCharacter({ MemberNumber: 99 });
            activities.CustomIncomingActivityReactions.get(wire("pat"))!(sender as never);
            expect(onReceive).toHaveBeenCalledWith({ sender: 99 });
        });

        it("an error in onReceive is contained", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.activities.register({ ...pat(), onReceive: () => { throw new Error("boom"); } });
            expect(() => activities.CustomIncomingActivityReactions.get(wire("pat"))!(null)).not.toThrow();
            expect(api.errorCount).toBe(1);
            err.mockRestore();
        });
    });

    describe("prerequisites", () => {
        const check = (name: string, acting: unknown, acted: unknown, group?: { Name: string }) =>
            g.ActivityCheckPrerequisite(`${api.id}.${name}`, acting, acted, group);

        it("an activity can require one of the extension's own prerequisites by its short name", () => {
            api.activities.registerPrerequisite({ name: "friendly", check: () => true });
            api.activities.register({ ...pat(), prerequisites: ["UseArms", "friendly"] });
            expect(find("pat").Prerequisite).toEqual(["UseArms", `${api.id}.friendly`, "ZoneAccessible"]);
        });

        it("is evaluated with who is acting, who is acted on, and the group", () => {
            const fn = vi.fn(() => true);
            api.activities.registerPrerequisite({ name: "friendly", check: fn });
            const acting = makeCharacter({ MemberNumber: 1 });
            const acted = makeCharacter({ MemberNumber: 2 });
            expect(check("friendly", acting, acted, { Name: "ItemHead" })).toBe(true);
            expect(fn).toHaveBeenCalledWith({ acting, acted, group: "ItemHead" });
        });

        it("false means not met, and so does an error", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.activities.registerPrerequisite({ name: "never", check: () => false });
            api.activities.registerPrerequisite({ name: "broken", check: () => { throw new Error("boom"); } });
            expect(check("never", {}, {})).toBe(false);
            expect(check("broken", {}, {})).toBe(false);
            expect(api.errorCount).toBe(1);
            err.mockRestore();
        });

        it("is removed when unregistered", () => {
            const off = api.activities.registerPrerequisite({ name: "friendly", check: () => true });
            expect(activities.CustomPrerequisiteFuncs.has(`${api.id}.friendly`)).toBe(true);
            off();
            expect(activities.CustomPrerequisiteFuncs.has(`${api.id}.friendly`)).toBe(false);
        });
    });

    describe("removal", () => {
        const register = () => api.activities.register({
            name: "full", image: "Assets/x.png", onSend: () => {}, onReceive: () => {},
            targets: [{ group: "ItemHead", selfAllowed: true, action: "a", selfAction: "b" }],
        });

        it("unregister takes the activity out of BC entirely", () => {
            register();
            const n = wire("full");
            expect(api.activities.unregister("full")).toBe(true);
            expect(api.activities.unregister("full")).toBe(false);
            expect(find("full")).toBeUndefined();
            expect(g.ActivityFemale3DCGOrdering).not.toContain(n);
            expect(g.ActivityDictionary.some((e: string[]) => e[0] === `Activity${n}`)).toBe(false);
            expect(Object.keys(cache).filter(k => k.endsWith(n))).toEqual([]);
            expect(activities.CustomImages.has(n)).toBe(false);
            expect(activities.CustomActionCallbacks.has(n)).toBe(false);
            expect(activities.CustomIncomingActivityReactions.has(n)).toBe(false);
        });

        it("dispose removes everything the extension added, including prerequisites", () => {
            api.activities.registerPrerequisite({ name: "friendly", check: () => true });
            register();
            api.dispose();
            expect(find("full")).toBeUndefined();
            expect(activities.CustomPrerequisiteFuncs.has(`${api.id}.friendly`)).toBe(false);
        });

        it("a removed activity's callbacks don't linger and block a re-registration", () => {
            const first = vi.fn();
            const second = vi.fn();
            const off = api.activities.register({ ...pat(), onSend: first });
            off();
            api.activities.register({ ...pat(), onSend: second });
            sendActivity(wire("pat"), addToRoom(makeCharacter()));
            expect(first).not.toHaveBeenCalled();
            expect(second).toHaveBeenCalledOnce();
        });
    });
});
