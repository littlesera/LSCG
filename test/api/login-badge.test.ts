// The login-screen badge: a small cream square with the bound-girl logo and the version beneath it. It is there whenever
// LSCG is loaded, with a flyout of the version and extensions, and pulses when there are extensions.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { extensions, knownExtensions, registerExtension, setExtensionEnabled, type ModApiHandle } from "api/extensions";
import { installLoadQueue } from "api";
import { apiVersion } from "api";
import { ICONS } from "utils";
import { removeLoginBadge, showLoginBadge } from "api/loginBadge";

describe("login badge", () => {
    let handles: ModApiHandle[] = [];
    let ids = 0;
    const g = globalThis as any;
    const make = (name = "Ext", version = "1.0") => {
        const handle = registerExtension({ id: `badge-${++ids}`, name, version });
        handles.push(handle);
        return handle;
    };
    const root = () => document.getElementById("lscg-login-badge");
    const anchor = () => root()!.querySelector(".lscg-badge-anchor") as HTMLElement;
    const button = () => root()!.querySelector("button.lscg-badge") as HTMLButtonElement;
    const flyout = () => root()!.querySelector(".lscg-badge-flyout") as HTMLElement;

    beforeEach(() => {
        g.MainCanvas = Object.assign(g.MainCanvas ?? {}, { canvas: document.createElement("canvas") });
        g.CommonGetFontName = () => "arial";
        delete (window as any).LSCG_Loaded;
    });

    afterEach(() => {
        handles.forEach(h => h.dispose());
        localStorage.removeItem("LSCG_DisabledExtensions");
        knownExtensions.clear();
        handles = [];
        removeLoginBadge();
        document.body.replaceChildren();
        delete (window as any).LSCG_Loaded;
    });

    describe("the square", () => {
        it("is there for LSCG on its own, showing the bound-girl logo", () => {
            showLoginBadge();
            expect(root()).not.toBeNull();
            expect(button().querySelector("img")!.getAttribute("src")).toBe(ICONS.BOUND_GIRL);
        });

        it("shows the version under the logo", () => {
            showLoginBadge();
            const [first, second] = Array.from(button().children);
            expect(first.tagName).toBe("IMG");
            expect(second.className).toContain("lscg-badge-version");
            expect(second.textContent).toBe(`v${apiVersion}`);
            expect(button().textContent).toBe(`v${apiVersion}`);
            expect(button().getAttribute("aria-label")).toBe(`LSCG v${apiVersion} loaded`);
        });

        it("holds nothing else: no stray text that would push the logo out of its box", () => {
            // A comment written inside JSX is rendered as literal text; that once displaced the whole badge.
            make();
            showLoginBadge();
            expect(Array.from(anchor().childNodes).every(n => n.nodeType === Node.ELEMENT_NODE)).toBe(true);
            expect(Array.from(button().childNodes).every(n => n.nodeType === Node.ELEMENT_NODE)).toBe(true);
            expect(anchor().textContent).not.toContain("//");
            expect(button().textContent).toBe(`v${apiVersion}`);
        });

        it("is a square, inside the canvas, in the bottom right, with the version stacked under the logo", () => {
            const source = readFileSync("src/api/loginBadge.tsx", "utf-8");
            const [x, y, w, h] = /BADGE_SHAPE: RectTuple = \[(\d+), (\d+), (\d+), (\d+)\]/.exec(source)!.slice(1).map(Number);
            expect(w).toBe(h);
            expect(x + w).toBeLessThanOrEqual(2000);
            expect(y + h).toBeLessThanOrEqual(1000);
            expect(x).toBeGreaterThan(1500);
            expect(y).toBeGreaterThan(800);
            expect(readFileSync("src/api/loginBadge.scss", "utf-8")).toMatch(/\.lscg-badge \{[^}]*flex-direction:\s*column/);
        });
    });

    describe("the flyout", () => {
        it("names the version when LSCG is on its own", () => {
            showLoginBadge();
            expect(flyout().textContent).toContain(`LSCG v${apiVersion} loaded`);
            expect(flyout().textContent).toContain("No extensions registered.");
        });

        it("lists the extensions, with their versions", () => {
            make("Alpha Pack", "2.1");
            showLoginBadge();
            expect(flyout().textContent).toContain("Alpha Pack");
            expect(flyout().textContent).toContain("v2.1");
            expect(flyout().textContent).not.toContain("No extensions registered.");
        });

        it("flags an extension that has thrown", () => {
            make("Shaky").errorCount = 2;
            showLoginBadge();
            expect(flyout().textContent).toContain("2 error(s)");
        });

        it("is refreshed when opened, since errors don't announce themselves", () => {
            const handle = make("Shaky");
            showLoginBadge();
            expect(flyout().textContent).not.toContain("error(s)");
            handle.errorCount = 1;
            anchor().dispatchEvent(new Event("mouseenter"));
            expect(flyout().textContent).toContain("1 error(s)");
        });

        it("opens and closes when the badge is clicked, for devices without hover", () => {
            showLoginBadge();
            expect(anchor().classList.contains("lscg-badge-open")).toBe(false);
            button().click();
            expect(anchor().classList.contains("lscg-badge-open")).toBe(true);
            button().click();
            expect(anchor().classList.contains("lscg-badge-open")).toBe(false);
        });
    });

    describe("the pulse", () => {
        it("sits still when LSCG is on its own", () => {
            showLoginBadge();
            expect(button().className).not.toContain("lscg-badge-pulse");
        });

        it("pulses when there are extensions", () => {
            make();
            showLoginBadge();
            expect(button().className).toContain("lscg-badge-pulse");
            expect(button().className).not.toContain("lscg-badge-warn");
        });

        it("pulses amber once an extension has thrown", () => {
            make().errorCount = 1;
            showLoginBadge();
            expect(button().className).toContain("lscg-badge-warn");
        });
    });

    describe("showing and hiding", () => {
        it("isn't shown after login, once LSCG has finished loading", () => {
            (window as any).LSCG_Loaded = true;
            showLoginBadge();
            expect(root()).toBeNull();
        });

        it("showing it twice doesn't stack badges", () => {
            showLoginBadge();
            showLoginBadge();
            expect(document.querySelectorAll("#lscg-login-badge")).toHaveLength(1);
        });

        it("is removed by removeLoginBadge", () => {
            showLoginBadge();
            removeLoginBadge();
            expect(root()).toBeNull();
        });
    });

    describe("turning extensions off", () => {
        const checkbox = (id: string) => root()!.querySelector(`input[aria-label="${id} enabled"]`) as HTMLInputElement;
        const queue = (id: string) => {
            const loaded = { count: 0 };
            (window as any).LSCG_OnLoad.push((lscg: any) => {
                const api = lscg.getModApi({ id, name: id, version: "1" });
                handles.push(api);
                loaded.count++; // only reached when getModApi didn't refuse
            });
            return loaded;
        };
        beforeEach(() => installLoadQueue());

        it("unticking disposes it now, keeps it listed, and keeps it off next load", () => {
            const loaded = queue("offable");
            showLoginBadge();
            expect(checkbox("offable").checked).toBe(true);
            checkbox("offable").click();
            expect(extensions.get("offable")).toBeUndefined();
            expect(checkbox("offable").checked).toBe(false);
            expect(flyout().textContent).toContain("Turned off");

            // Next page load: the callback stops at getModApi, so none of the extension's own code runs.
            queue("offable");
            expect(loaded.count).toBe(1);
            expect(extensions.get("offable")).toBeUndefined();
        });

        it("ticking it again re-runs its load callback, without a reload", () => {
            const loaded = queue("onagain");
            setExtensionEnabled("onagain", false);
            showLoginBadge();
            checkbox("onagain").click();
            expect(extensions.get("onagain")).toBeDefined();
            expect(loaded.count).toBe(2);
            expect(flyout().textContent).toContain("Turned on");
        });

        it("asks for a reload when it registered without the load queue", () => {
            handles.push(registerExtension({ id: "direct", name: "direct", version: "1" }));
            setExtensionEnabled("direct", false);
            showLoginBadge();
            checkbox("direct").click();
            expect(extensions.get("direct")).toBeUndefined();
            expect(flyout().textContent).toContain("Reload the page");
        });

        it("forgets an extension that disposes itself", () => {
            make("Gone").dispose();
            showLoginBadge();
            expect(flyout().textContent).toContain("No extensions registered.");
        });
    });
});
