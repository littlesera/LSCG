// Extension settings screens: registration, the Extensions page (picker, panels, live updates), and the kit handed
// to extensions, whose callbacks must run inside the extension's error handling.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { extensionScreens } from "api/settings";
import { apiCapabilities } from "api";
import { GuiExtensions } from "Settings/extensions";
import { boot, resetWorld } from "../harness/world";

describe("extension settings screens", () => {
    let core: CoreModule;
    let api: ModApiHandle;
    let page: GuiExtensions;
    let ids = 0;
    const g = globalThis as any;

    beforeAll(() => {
        // jsdom has no <dialog> modal support; the kit's confirmDialog only needs it attached and open.
        HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
        HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
        [core] = boot(new CoreModule());
    });

    beforeEach(() => {
        resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
        g.MainCanvas = Object.assign(g.MainCanvas ?? {}, { canvas: document.createElement("canvas") });
        g.CommonGetFontName = () => "arial";
        g.PreferencePageCurrent = 1;
        api = registerExtension({ id: `settings-${++ids}`, name: "Settings Pack", version: "1" });
        page = new GuiExtensions(core);
    });

    afterEach(() => {
        page.Unload();
        api.dispose();
        document.body.replaceChildren();
    });

    const root = () => document.getElementById("lscg-extension-settings");
    const panels = () => Array.from(root()!.querySelectorAll(".lscg-kit-panel")) as HTMLElement[];
    const visiblePanel = () => panels().find(p => !p.hidden)!;
    const rowByLabel = (scope: ParentNode, label: string) =>
        Array.from(scope.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === label) as HTMLElement;
    const change = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => el.dispatchEvent(new Event("change"));

    it("is advertised as a capability", () => {
        expect(apiCapabilities.has("settings")).toBe(true);
    });

    describe("registration", () => {
        it("registers under the extension's namespace, labelled by default with the name", () => {
            api.settings.registerScreen({ name: "main", build: () => document.createElement("div") });
            expect(extensionScreens.get(`${api.id}.main`)).toMatchObject({ source: "Settings Pack", label: "main" });
            api.settings.registerScreen({ name: "other", label: "Other things", build: () => document.createElement("div") });
            expect(extensionScreens.get(`${api.id}.other`)!.label).toBe("Other things");
        });

        it("rejects bad definitions and duplicates", () => {
            api.settings.registerScreen({ name: "main", build: () => document.createElement("div") });
            expect(() => api.settings.registerScreen({ name: "main", build: () => document.createElement("div") })).toThrow(/already registered/);
            expect(() => api.settings.registerScreen({ name: "a.b", build: () => document.createElement("div") })).toThrow(/invalid name/);
            expect(() => api.settings.registerScreen({ name: "x", build: "no" as never })).toThrow(/build/);
        });

        it("unregister and dispose remove it", () => {
            api.settings.registerScreen({ name: "main", build: () => document.createElement("div") });
            expect(api.settings.unregisterScreen("main")).toBe(true);
            expect(api.settings.unregisterScreen("main")).toBe(false);
            api.settings.registerScreen({ name: "main", build: () => document.createElement("div") });
            api.dispose();
            expect(extensionScreens.has(`${api.id}.main`)).toBe(false);
        });
    });

    describe("the Extensions page", () => {
        it("is hidden until some extension has a screen", () => {
            expect(page.hidden).toBe(extensionScreens.all().length === 0);
            api.settings.registerScreen({ name: "main", build: () => document.createElement("div") });
            expect(page.hidden).toBe(false);
            api.dispose();
            expect(page.hidden).toBe(extensionScreens.all().length === 0);
        });

        it("builds a picker and shows the first extension's screen", () => {
            api.settings.registerScreen({ name: "one", label: "First", build: ({ kit }) => kit.notice("hello from one") });
            api.settings.registerScreen({ name: "two", label: "Second", build: ({ kit }) => kit.notice("hello from two") });
            page.Load();
            const picker = root()!.querySelector("select") as HTMLSelectElement;
            expect(Array.from(picker.options).map(o => o.textContent)).toEqual(["Settings Pack: First", "Settings Pack: Second"]);
            expect(panels()).toHaveLength(2);
            expect(visiblePanel().textContent).toContain("hello from one");
        });

        it("the picker switches which screen shows, without rebuilding", () => {
            const builds = vi.fn();
            api.settings.registerScreen({ name: "one", build: ({ kit }) => { builds(); return kit.notice("one"); } });
            api.settings.registerScreen({ name: "two", build: ({ kit }) => kit.notice("two") });
            page.Load();
            const picker = root()!.querySelector("select") as HTMLSelectElement;
            picker.value = `${api.id}.two`;
            change(picker);
            expect(visiblePanel().textContent).toContain("two");
            expect(builds).toHaveBeenCalledOnce();
        });

        it("says so when no extension has settings", () => {
            api.dispose();
            if (extensionScreens.all().length > 0) return; // another test file's extensions can't leak here, but be safe
            page.Load();
            expect(root()!.textContent).toContain("No installed extension has settings");
        });

        it("picks up a screen registered while the page is open", () => {
            api.settings.registerScreen({ name: "one", build: ({ kit }) => kit.notice("one") });
            page.Load();
            expect(panels()).toHaveLength(1);
            api.settings.registerScreen({ name: "two", build: ({ kit }) => kit.notice("two") });
            expect(panels()).toHaveLength(2);
            api.settings.unregisterScreen("one");
            expect(panels()).toHaveLength(1);
        });

        it("keeps the chosen screen when it rebuilds, and falls back if that screen went away", () => {
            api.settings.registerScreen({ name: "one", build: ({ kit }) => kit.notice("one") });
            api.settings.registerScreen({ name: "two", build: ({ kit }) => kit.notice("two") });
            page.Load();
            const picker = root()!.querySelector("select") as HTMLSelectElement;
            picker.value = `${api.id}.two`;
            change(picker);
            api.settings.registerScreen({ name: "three", build: ({ kit }) => kit.notice("three") });
            expect(visiblePanel().textContent).toContain("two");
            api.settings.unregisterScreen("two");
            expect(visiblePanel().textContent).toContain("one");
        });

        it("stops watching for changes once it is closed", () => {
            api.settings.registerScreen({ name: "one", build: ({ kit }) => kit.notice("one") });
            page.Load();
            page.Unload();
            expect(root()).toBeNull();
            expect(() => api.settings.registerScreen({ name: "two", build: ({ kit }) => kit.notice("two") })).not.toThrow();
            expect(root()).toBeNull();
        });

        it("a screen that throws, or returns something that isn't an element, shows a message and counts as an error", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.settings.registerScreen({ name: "broken", build: () => { throw new Error("boom"); } });
            api.settings.registerScreen({ name: "wrong", build: () => "not an element" as never });
            page.Load();
            const [broken, wrong] = panels();
            expect(broken.textContent).toContain("couldn't be loaded");
            expect(wrong.textContent).toContain("couldn't be loaded");
            expect(api.errorCount).toBe(1);
            err.mockRestore();
        });

        it("accepts a list of elements", () => {
            api.settings.registerScreen({ name: "many", build: ({ kit }) => [kit.section("A"), kit.notice("b")] });
            page.Load();
            expect(visiblePanel().querySelectorAll("h2, p")).toHaveLength(2);
        });
    });

    describe("the kit", () => {
        it("checkbox, text, number and select read with get and write with set", () => {
            const state = { on: false, name: "x", count: 3, pick: "b" };
            api.settings.registerScreen({
                name: "rows",
                build: ({ kit }) => [
                    kit.checkbox({ label: "On", get: () => state.on, set: v => { state.on = v; } }),
                    kit.text({ label: "Name", get: () => state.name, set: v => { state.name = v; } }),
                    kit.number({ label: "Count", min: 0, max: 10, get: () => state.count, set: v => { state.count = v; } }),
                    kit.select({ label: "Pick", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], get: () => state.pick, set: v => { state.pick = v; } }),
                ],
            });
            page.Load();
            const panel = visiblePanel();
            expect((rowByLabel(panel, "Name").querySelector("input") as HTMLInputElement).value).toBe("x");
            expect((rowByLabel(panel, "Count").querySelector("input") as HTMLInputElement).value).toBe("3");
            expect((rowByLabel(panel, "Pick").querySelector("select") as HTMLSelectElement).value).toBe("b");

            const box = rowByLabel(panel, "On").querySelector("input") as HTMLInputElement;
            box.checked = true; change(box);
            const name = rowByLabel(panel, "Name").querySelector("input") as HTMLInputElement;
            name.value = "y"; change(name);
            const count = rowByLabel(panel, "Count").querySelector("input") as HTMLInputElement;
            count.value = "7"; change(count);
            const pick = rowByLabel(panel, "Pick").querySelector("select") as HTMLSelectElement;
            pick.value = "a"; change(pick);
            expect(state).toEqual({ on: true, name: "y", count: 7, pick: "a" });
        });

        it("a number outside its range is refused and put back", () => {
            let count = 3;
            api.settings.registerScreen({ name: "n", build: ({ kit }) => kit.number({ label: "Count", min: 0, max: 10, get: () => count, set: v => { count = v; } }) });
            page.Load();
            const input = rowByLabel(visiblePanel(), "Count").querySelector("input") as HTMLInputElement;
            input.value = "99"; change(input);
            expect(count).toBe(3);
            expect(input.value).toBe("3");
        });

        it("rows update each other: hidden and disabled are re-checked after any change", () => {
            let on = false;
            api.settings.registerScreen({
                name: "dep",
                build: ({ kit }) => [
                    kit.checkbox({ label: "Enable", get: () => on, set: v => { on = v; } }),
                    kit.text({ label: "Detail", get: () => "", set: () => {}, disabled: () => !on }),
                    kit.notice("secret"),
                    kit.button({ label: "Go", buttonLabel: "Go", onClick: () => {}, hidden: () => !on }),
                ],
            });
            page.Load();
            const panel = visiblePanel();
            const detail = () => rowByLabel(panel, "Detail").querySelector("input") as HTMLInputElement;
            const go = () => rowByLabel(panel, "Go");
            expect(detail().disabled).toBe(true);
            expect(go().hidden).toBe(true);
            const box = rowByLabel(panel, "Enable").querySelector("input") as HTMLInputElement;
            box.checked = true; change(box);
            expect(detail().disabled).toBe(false);
            expect(go().hidden).toBe(false);
        });

        it("a button runs its onClick, and confirm only runs its action when confirmed", () => {
            const clicked = vi.fn();
            const confirmed = vi.fn();
            api.settings.registerScreen({
                name: "btn",
                build: ({ kit }) => [
                    kit.button({ label: "Do", buttonLabel: "Do it", onClick: clicked }),
                    kit.button({ label: "Wipe", buttonLabel: "Wipe…", danger: true, onClick: () => kit.confirm("Wipe?", "Really?", "Wipe", confirmed) }),
                ],
            });
            page.Load();
            (rowByLabel(visiblePanel(), "Do").querySelector("button") as HTMLButtonElement).click();
            expect(clicked).toHaveBeenCalledOnce();

            (rowByLabel(visiblePanel(), "Wipe").querySelector("button") as HTMLButtonElement).click();
            const dialog = root()!.querySelector("dialog") as HTMLDialogElement;
            expect(dialog.textContent).toContain("Really?");
            const [cancel, confirm] = Array.from(dialog.querySelectorAll("button")) as HTMLButtonElement[];
            cancel.click();
            expect(confirmed).not.toHaveBeenCalled();
            (rowByLabel(visiblePanel(), "Wipe").querySelector("button") as HTMLButtonElement).click();
            (root()!.querySelector("dialog")!.querySelectorAll("button")[1] as HTMLButtonElement).click();
            expect(confirmed).toHaveBeenCalledOnce();
            void confirm;
        });

        it("callbacks that throw are contained and counted, with safe fallbacks", () => {
            const err = vi.spyOn(console, "error").mockImplementation(() => {});
            api.settings.registerScreen({
                name: "bad",
                build: ({ kit }) => [
                    kit.checkbox({ label: "On", get: () => { throw new Error("get"); }, set: () => { throw new Error("set"); } }),
                    kit.number({ label: "Count", min: 2, max: 9, get: () => { throw new Error("get"); }, set: () => {} }),
                    kit.select({ label: "Pick", options: [{ value: "a", label: "A" }], get: () => { throw new Error("get"); }, set: () => {} }),
                    kit.button({ label: "Go", buttonLabel: "Go", onClick: () => { throw new Error("click"); } }),
                ],
            });
            page.Load();
            const panel = visiblePanel();
            const box = rowByLabel(panel, "On").querySelector("input") as HTMLInputElement;
            expect(box.checked).toBe(false);
            expect((rowByLabel(panel, "Count").querySelector("input") as HTMLInputElement).value).toBe("2");
            expect((rowByLabel(panel, "Pick").querySelector("select") as HTMLSelectElement).value).toBe("a");
            box.checked = true; change(box);
            (rowByLabel(panel, "Go").querySelector("button") as HTMLButtonElement).click();
            expect(api.errorCount).toBeGreaterThanOrEqual(5);
            err.mockRestore();
        });

        it("tolerates sloppy input: missing labels, non-string text, bad ranges, bad options", () => {
            api.settings.registerScreen({
                name: "sloppy",
                build: ({ kit }) => [
                    kit.section(undefined as never),
                    kit.notice(123 as never),
                    kit.chip(undefined as never, { tone: "info" }),
                    kit.number({ label: "Odd", min: Number.NaN, max: 5, get: () => 1, set: () => {} }),
                    kit.select({ label: "S", options: [null, { value: 1, label: "x" }, { value: "ok", label: undefined }] as never, get: () => "ok", set: () => {} }),
                ],
            });
            expect(() => page.Load()).not.toThrow();
            const select = rowByLabel(visiblePanel(), "S").querySelector("select") as HTMLSelectElement;
            expect(Array.from(select.options).map(o => o.value)).toEqual(["ok"]);
        });

        it("chips carry their tone and tooltip", () => {
            api.settings.registerScreen({ name: "chips", build: ({ kit }) => kit.chip("Beta", { tone: "warn", tooltip: "Not final" }) });
            page.Load();
            const chip = visiblePanel().querySelector(".lscg-kit-chip") as HTMLElement;
            expect(chip.className).toContain("lscg-kit-chip-warn");
            expect(chip.title).toBe("Not final");
        });

        it("refresh() re-reads every row's get", () => {
            let name = "before";
            let refresh = () => {};
            api.settings.registerScreen({ name: "r", build: ui => { refresh = ui.refresh; return ui.kit.text({ label: "Name", get: () => name, set: v => { name = v; } }); } });
            page.Load();
            const input = () => rowByLabel(visiblePanel(), "Name").querySelector("input") as HTMLInputElement;
            expect(input().value).toBe("before");
            name = "after";
            refresh();
            expect(input().value).toBe("after");
        });
    });
});
