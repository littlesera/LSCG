import { chromium, type FullConfig } from "@playwright/test";

/** Loads the playground once before any test, and visits the screens the tests use, so a cold cache (BC's files are
 *  fetched from gitgud on first use, and it rate-limits bursts) is paid for here, with generous timeouts, rather than
 *  inside whichever test happens to touch a file first. Best effort: a step that fails here just means the test that
 *  needs it will fetch instead. */
export default async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1600, height: 800 } });
    page.setDefaultTimeout(600_000);
    await page.goto(config.projects[0].use.baseURL ?? "http://localhost:10003", { timeout: 600_000 });
    await page.waitForFunction(() => (window as any).LSCG && (window as any).Playground && (window as any).CurrentScreen === "Login", null, { timeout: 600_000 });

    const steps: [string, () => Promise<unknown>][] = [
        ["log in", () => page.evaluate(async () => { const P = (window as any).Playground; await P.login(); P.enableAll(); })],
        // Every settings screen: the Preference screen's text, LSCG's icons, and the Activities zone picker's character.
        ["settings screens", () => page.evaluate(async () => {
            const w = window as any;
            const names: string[] = w.LSCG.getModule("GUI").subscreens.filter((s: any) => s.name !== "MainMenu" && !s.hidden).map((s: any) => s.name);
            await w.Playground.openSettings();
            for (const name of names) {
                await w.Playground.openSettings(name);
                await new Promise(r => setTimeout(r, 500));
            }
        })],
        // The outfit editor's preview character, wearing an outfit.
        ["outfit editor", () => page.evaluate(async () => {
            const w = window as any;
            const data = w.LSCG.getModule("OutfitCollectionModule").data;
            data.SetOutfitCode("Warm", w.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "CollegeOutfit1" }])), [], false);
            await w.Playground.openSettings("Outfit Collection");
            w.LSCG.getModule("GUI").currentSubscreen.clickOutfit("Warm");
            await new Promise(r => setTimeout(r, 3000));
            w.LSCG.getModule("GUI").currentSubscreen.CancelOutfit();
            data.RemoveOutfit("Warm", false);
        })],
        // Another player's profile and dialog, and the spell menu over it.
        ["profile, room and spell menu", () => page.evaluate(async () => {
            const w = window as any;
            const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
            const target = w.Playground.addCharacter({ lscg: { MagicModule: { enabled: true } } });
            await w.Playground.openProfile(target);
            await wait(1500);
            await w.CommonSetScreen("Room", "MainHall");
            await wait(1500);
            w.CharacterSetCurrent(target);
            await wait(1500);
            w.LSCG.getModule("MagicModule").OpenSpellMenu(target);
            await wait(500);
        })],
    ];
    for (const [name, step] of steps) {
        try {
            await step();
            await page.waitForLoadState("networkidle");
        } catch (err) {
            console.warn(`UI test warm-up: "${name}" failed (${String(err).split("\n")[0]})`);
        }
    }
    await browser.close();
}
