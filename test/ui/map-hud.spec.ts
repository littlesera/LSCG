// The map statistics overlay in the real client: toggled through lscgPerf.hud() and the dev shortcut, and drawn where it should
// be. Opt-in with the other map specs (MAP_PERF=1, npm run perf:map -- --spec test/ui/map-hud.spec.ts); it saves pictures of
// each mode to test/.out/ to look at.
import { mkdirSync } from "node:fs";
import { expect, test } from "./fixtures";
import { enterMapRoom } from "./map-room";

test.skip(!process.env.MAP_PERF, "set MAP_PERF=1 to run the map overlay scenario");

test("map statistics overlay: modes, shortcut, and what it shows", async ({ bc }) => {
    test.setTimeout(120_000);
    await enterMapRoom(bc, { range: 4, lighting: true, freezeLights: false });
    mkdirSync("test/.out", { recursive: true });
    await bc.run(() => { localStorage.setItem("LSCG_DEV", "1"); });
    const shot = (name: string) => bc.page.locator("#MainCanvas").screenshot({ path: `test/.out/map-hud-${name}.png` });

    expect(await bc.run(() => (window as any).lscgPerf.hud("off"))).toBe("off");
    await bc.page.waitForTimeout(500);
    await shot("off");

    expect(await bc.run(() => (window as any).lscgPerf.hud("stats"))).toBe("stats");
    await bc.page.waitForTimeout(2500);
    await shot("stats");

    expect(await bc.run(() => (window as any).lscgPerf.hud("debug"))).toBe("debug");
    await bc.page.waitForTimeout(2500);
    await shot("debug");

    // The dev shortcut steps on from debug to off, then to stats
    await bc.page.keyboard.press("Alt+Shift+KeyL");
    expect(await bc.run(() => (window as any).LSCG.getModule("MapModule").StatsMode)).toBe("off");
    await bc.page.keyboard.press("Alt+Shift+KeyL");
    expect(await bc.run(() => (window as any).LSCG.getModule("MapModule").StatsMode)).toBe("stats");
    expect(await bc.run(() => localStorage.getItem("LSCG_MAP_STATS"))).toBe("stats");
    await bc.run(() => { (window as any).lscgPerf.hud("off"); localStorage.removeItem("LSCG_DEV"); });
});
