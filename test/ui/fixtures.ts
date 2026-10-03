import { expect, test as base, type Page } from "@playwright/test";

/** BC and the fake server log plenty that isn't ours (missing optional files, rejected appearance bundles,
 *  untranslated keys). Only an unhandled exception, or an error that names LSCG, fails a test. */
const IGNORED = [/translation key/i, /Invalid (modification|removal)/, /extended item properties/, /appearance update bundle/, /Failed to load resource/];

export interface Bc {
    page: Page;
    /** Opens an LSCG settings screen by its title (e.g. "General"); returns the title actually opened. */
    openSettings(name: string): Promise<string>;
    /** Runs `fn` in the page; the BC and Playground globals are on `window`. */
    run<T, A = void>(fn: (arg: A) => T | Promise<T>, arg?: A): Promise<T>;
    errors: string[];
}

export const test = base.extend<{ bc: Bc }>({
    bc: async ({ page }, use) => {
        const errors: string[] = [];
        page.on("pageerror", e => errors.push(`uncaught: ${e.message}`));
        page.on("console", m => {
            if (m.type() !== "error") return;
            const text = m.text();
            if (IGNORED.some(r => r.test(text)) || !/LSCG|lscg/.test(text)) return;
            errors.push(text);
        });

        // UI_CPU_THROTTLE=4 makes the browser 4x slower, to reproduce timing failures seen on slow CI runners.
        const throttle = Number(process.env.UI_CPU_THROTTLE ?? 1);
        if (throttle > 1) {
            const cdp = await page.context().newCDPSession(page);
            await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
        }

        await page.goto("/");
        await page.waitForFunction(() => (window as any).Playground && (window as any).CurrentScreen === "Login");
        await page.evaluate(async () => {
            const P = (window as any).Playground;
            await P.login();
            P.enableAll();
        });

        const bc: Bc = {
            page,
            errors,
            run: (fn, arg) => page.evaluate(fn as any, arg as any),
            openSettings: name => page.evaluate(async n => {
                const P = (window as any).Playground;
                await P.openSettings();
                await new Promise(r => setTimeout(r, 250));
                return P.openSettings(n);
            }, name),
        };
        await use(bc);
        expect(errors, "LSCG errors or uncaught exceptions while the test ran").toEqual([]);
    },
});

export { expect };
