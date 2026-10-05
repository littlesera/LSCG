// The login-screen badge: a small "Installed Mods (n)" label. It is there whenever LSCG is loaded, with a flyout listing
// the installed mods (LSCG's own entry holds its extensions), and pulses when there are extensions.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { extensions, knownExtensions, registerExtension, setExtensionEnabled, type ModApiHandle } from "api/extensions";
import { installLoadQueue } from "api";
import { apiVersion } from "api";
import { ICONS } from "utils";
import bcModSDKRef from "bondage-club-mod-sdk";
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
    const button = () => root()!.querySelector("button.lscg-badge") as HTMLButtonElement;
    const otherCount = () => bcModSDKRef.getModsInfo().filter(m => m.name !== "LSCG").length;
    const flyout = () => root()!.querySelector(".lscg-badge-flyout") as HTMLDialogElement;

    beforeEach(() => {
        // jsdom has no modal dialogs.
        const proto = HTMLDialogElement.prototype as any;
        proto.showModal = function () { this.setAttribute("open", ""); };
        proto.close = function () { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
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

    describe("the badge", () => {
        it("is there for LSCG on its own, counting LSCG as one installed mod", () => {
            showLoginBadge();
            expect(root()).not.toBeNull();
            expect(button().textContent).toBe(`Installed Mods (${1 + otherCount()})`);
        });

        it("counts the other mods registered with ModSDK too", () => {
            const before = otherCount();
            const other = bcModSDKRef.registerMod({ name: "Counted", fullName: "Counted Mod", version: "1" });
            try {
                showLoginBadge();
                expect(button().textContent).toBe(`Installed Mods (${before + 2})`);
            } finally {
                other.unload();
            }
        });

        it("updates its count as mods register, without being opened", () => {
            vi.useFakeTimers();
            try {
                showLoginBadge();
                const before = button().textContent;
                const other = bcModSDKRef.registerMod({ name: "Late", fullName: "Late Mod", version: "1" });
                try {
                    vi.advanceTimersByTime(1100);
                    expect(button().textContent).not.toBe(before);
                    expect(button().textContent).toBe(`Installed Mods (${otherCount() + 1})`);
                } finally {
                    other.unload();
                }
            } finally {
                vi.useRealTimers();
            }
        });

        it("holds nothing else: no stray text that would push the label out of its box", () => {
            // A comment written inside JSX is rendered as literal text; that once displaced the whole badge.
            make();
            showLoginBadge();
            expect(Array.from(root()!.childNodes).every(n => n.nodeType === Node.ELEMENT_NODE)).toBe(true);
            expect(root()!.textContent).not.toContain("//");
            expect(button().textContent).toMatch(/^Installed Mods \(\d+\)$/);
        });

        it("is inside the canvas, centred under the Login button (the corners hold other mods' lists)", () => {
            const source = readFileSync("src/api/loginBadge.tsx", "utf-8");
            const [x, y, w, h] = /BADGE_SHAPE: RectTuple = \[(\d+), (\d+), (\d+), (\d+)\]/.exec(source)!.slice(1).map(Number);
            expect(x + w).toBeLessThanOrEqual(2000);
            expect(y + h).toBeLessThanOrEqual(1000);
            expect(x + w / 2).toBe(1000);
            expect(y).toBeGreaterThan(500);
            expect(y + h).toBeLessThan(690);
        });

        it("starts with LSCG's extension list collapsed", () => {
            make();
            showLoginBadge();
            expect(root()!.querySelector<HTMLDetailsElement>("details.lscg-badge-mod")!.open).toBe(false);
        });
    });

    describe("the flyout", () => {
        it("names the version when LSCG is on its own", () => {
            showLoginBadge();
            expect(flyout().textContent).toContain(`LSCG v${apiVersion}`);
            expect(flyout().textContent).toContain("No extensions registered.");
        });

        it("clips another mod's long name to one line, keeping the full name in a tooltip", () => {
            const long = "Enormous ".repeat(40).trim();
            const other = bcModSDKRef.registerMod({ name: "Big", fullName: long, version: "1" });
            try {
                showLoginBadge();
                const name = Array.from(flyout().querySelectorAll<HTMLElement>("li.lscg-badge-mod .lscg-badge-clip")).find(e => e.textContent === long)!;
                expect(name.title).toBe(long);
                expect(readFileSync("src/api/loginBadge.scss", "utf-8")).toMatch(/\.lscg-badge-clip \{[^}]*text-overflow:\s*ellipsis/);
                expect(readFileSync("src/api/loginBadge.scss", "utf-8")).toMatch(/\.lscg-badge-flyout \{[^}]*max-width:\s*min\(/);
            } finally {
                other.unload();
            }
        });

        it("adds a mod that registers while the list is open, without reopening it", () => {
            vi.useFakeTimers();
            try {
                showLoginBadge();
                button().click();
                const dialog = flyout();
                expect(dialog.textContent).not.toContain("Registered Late");
                const other = bcModSDKRef.registerMod({ name: "Late", fullName: "Registered Late", version: "1" });
                try {
                    vi.advanceTimersByTime(1100);
                    expect(flyout()).toBe(dialog);
                    expect(dialog.open).toBe(true);
                    expect(dialog.textContent).toContain("Registered Late");
                } finally {
                    other.unload();
                }
            } finally {
                vi.useRealTimers();
            }
        });

        it("marks LSCG with a star while any of its extensions is enabled", () => {
            const star = () => flyout().querySelector("details.lscg-badge-mod > summary .lscg-badge-star");
            make("Starry");
            showLoginBadge();
            expect(star()).not.toBeNull();
            const id = [...knownExtensions.keys()][0];
            setExtensionEnabled(id, false);
            button().click();
            expect(star()).toBeNull();
        });

        it("has no star when LSCG has no extensions", () => {
            showLoginBadge();
            expect(flyout().querySelector(".lscg-badge-star")).toBeNull();
        });

        it("links LSCG's own wiki and repository", () => {
            showLoginBadge();
            const links = Array.from(flyout().querySelectorAll<HTMLAnchorElement>("details.lscg-badge-mod > summary a")).map(a => a.href);
            expect(links).toContain("https://github.com/littlesera/LSCG/wiki");
            expect(links).toContain("https://github.com/littlesera/LSCG");
        });

        it("lists the other mods registered with ModSDK, read-only, with their repositories", () => {
            const other = bcModSDKRef.registerMod({ name: "OtherMod", fullName: "The Other Mod", version: "3.2", repository: "https://example.com/other" });
            try {
                showLoginBadge();
                expect(flyout().textContent).toContain("The Other Mod");
                expect(flyout().textContent).toContain("v3.2");
                expect(flyout().querySelector<HTMLAnchorElement>("a[href='https://example.com/other']")).not.toBeNull();
                // LSCG is the one entry with extension toggles; it is not listed a second time.
                expect(flyout().querySelectorAll("li.lscg-badge-mod").length).toBeGreaterThanOrEqual(1);
                expect(flyout().textContent!.match(/Little Sera/g) ?? []).toHaveLength(0);
            } finally {
                other.unload();
            }
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
            button().click();
            expect(flyout().textContent).toContain("1 error(s)");
        });

        it("opens as a modal when the badge is clicked, and closes with its Close button", () => {
            showLoginBadge();
            expect(flyout().open).toBe(false);
            button().click();
            expect(flyout().open).toBe(true);
            flyout().querySelector<HTMLButtonElement>(".lscg-badge-close")!.click();
            expect(flyout().open).toBe(false);
        });

        it("stays open when an extension is turned off, which rebuilds the badge", async () => {
            make("Stays");
            showLoginBadge();
            button().click();
            root()!.querySelector<HTMLInputElement>("input[aria-label='Stays enabled']")!.click();
            await Promise.resolve();
            expect(flyout().open).toBe(true);
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
            expect(flyout().textContent).toContain("Reload the page to apply this change.");

            // Next page load: the callback stops at getModApi, so none of the extension's own code runs.
            queue("offable");
            expect(loaded.count).toBe(1);
            expect(extensions.get("offable")).toBeUndefined();
        });

        it("ticking it again re-runs its load callback now, and still notes that a reload settles it", () => {
            const loaded = queue("onagain");
            setExtensionEnabled("onagain", false);
            showLoginBadge();
            checkbox("onagain").click();
            expect(extensions.get("onagain")).toBeDefined();
            expect(loaded.count).toBe(2);
            expect(flyout().textContent).toContain("Reload the page to apply this change.");
        });

        it("offers a button with the reload note that reloads the page", () => {
            const reload = vi.fn();
            vi.stubGlobal("location", { ...window.location, reload });
            try {
                queue("reloadable");
                showLoginBadge();
                expect(root()!.querySelector(".lscg-badge-reload")).toBeNull();
                checkbox("reloadable").click();
                root()!.querySelector<HTMLButtonElement>(".lscg-badge-reload")!.click();
                expect(reload).toHaveBeenCalledOnce();
            } finally {
                vi.unstubAllGlobals();
            }
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
