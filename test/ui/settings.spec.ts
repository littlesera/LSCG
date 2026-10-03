import { expect, test } from "./fixtures";
import { sweepScreen } from "./sweep";

/** Every LSCG settings screen. A new screen fails the list test below until it's added here. */
const SCREENS = [
    "General", "Outfit Collection", "Triggered Hypnosis", "Breathplay", "Drug Enhancements", "Activities",
    "Magic™", "Splatters", "Cursed Items", "Map Enhancements", "Speech Analysis",
];

/** Inputs that legitimately don't write settings ("tab/label"), and labels whose change closes their own screen. */
const NOT_SAVED = new Set(["Tune/Line"]);
/** Changing these also rewrites other fields (a rule's "Do" picks different companion settings), so they don't go back. */
const NOT_RESTORABLE = new Set(["Reactions/Do (row 1)"]);
const SKIP: Record<string, string[]> = { "Magic™": ["Enabled"] };

test("every screen the mod registers is covered here", async ({ bc }) => {
    const names = await bc.run(() => (window as any).LSCG.getModule("GUI").subscreens
        .filter((s: any) => s.name !== "MainMenu" && !s.hidden).map((s: any) => s.name));
    expect(names).toEqual(SCREENS);
});

for (const screen of SCREENS.filter(s => s !== "Outfit Collection" && s !== "Activities")) {
    test(`${screen}: every input is wired to a saved setting`, async ({ bc }) => {
        const results = await bc.run(sweepScreen, { screen, skip: SKIP[screen] });
        const tested = results.filter(r => !r.skipped);
        expect(tested.length, "found inputs to test").toBeGreaterThan(0);

        const unwired = tested.filter(r => !r.changed && !NOT_SAVED.has(`${r.tab}/${r.label}`)).map(r => `${r.tab}/${r.label}`);
        expect(unwired, "inputs that changed no saved setting").toEqual([]);
        const stuck = tested.filter(r => r.changed && !r.restored && !NOT_RESTORABLE.has(`${r.tab}/${r.label}`)).map(r => `${r.tab}/${r.label}`);
        expect(stuck, "inputs whose change couldn't be undone").toEqual([]);
    });
}

test("leaving a screen leaves nothing behind", async ({ bc }) => {
    for (const screen of SCREENS) {
        const left = await bc.run(async (name: string) => {
            const w = window as any;
            await w.Playground.openSettings();
            await new Promise(r => setTimeout(r, 250));
            const before = w.Character.length;
            await w.Playground.openSettings(name);
            await new Promise(r => setTimeout(r, 350));
            // Outfit Collection builds a preview character when an outfit is opened.
            w.LSCG.getModule("GUI").currentSubscreen.Exit();
            await new Promise(r => setTimeout(r, 250));
            return {
                overlays: document.querySelectorAll("body > .lscg-overlay, body > .lscg-screen").length,
                characters: w.Character.length - before,
                photoMode: w.CommonPhotoMode,
            };
        }, screen);
        expect(left, screen).toEqual({ overlays: 0, characters: 0, photoMode: false });
    }
});

test("the exit button returns to the main menu", async ({ bc }) => {
    await bc.openSettings("Splatters");
    await bc.page.getByRole("button", { name: "Back" }).click();
    expect(await bc.run(() => (window as any).LSCG.getModule("GUI").currentSubscreen.name)).toBe("MainMenu");
});
