// Real-browser map and lighting timings: a 40x40 map room in the playground, the player walking, frame timings read back
// from window.lscgPerf. Opt-in (it is a measurement, not a pass/fail check, and slow):
//
//   npm run build && npm run perf:map            (GPU canvas)
//   MAP_PERF_SOFTWARE=1 npm run perf:map         (software-rasterised canvas, the low-end case)
//
// Writes test/.out/map-perf-<variant>.json and prints a summary; docs/perf-baseline.md records the numbers.
import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "./fixtures";

test.skip(!process.env.MAP_PERF, "set MAP_PERF=1 (npm run perf:map) to run the map performance scenario");

const SOFTWARE = !!process.env.MAP_PERF_SOFTWARE;
const WALK_MS = Number(process.env.MAP_PERF_WALK_MS ?? 6000);

interface Variant {
    name: string;
    range: number;
    /** Map width in px (R134 and later; ignored on clients without the split). */
    split: number;
    lighting: boolean;
}

const variants: Variant[] = [
    { name: "range4-split1000-vanilla", range: 4, split: 1000, lighting: false },
    { name: "range4-split1000-lighting", range: 4, split: 1000, lighting: true },
    { name: "range20-split1000-vanilla", range: 20, split: 1000, lighting: false },
    { name: "range20-split1000-lighting", range: 20, split: 1000, lighting: true },
    { name: "range20-split2000-lighting", range: 20, split: 2000, lighting: true },
];

for (const v of variants) {
    test(`map perf: ${v.name}${SOFTWARE ? " (software canvas)" : ""}`, async ({ bc }, testInfo) => {
        testInfo.setTimeout(180_000);
        const result = await bc.run(async (variant) => {
            const w = window as any;
            const W = 40, H = 40;
            const floor = String.fromCharCode(100), wall = String.fromCharCode(1000), blank = String.fromCharCode(100), lamp = String.fromCharCode(2090);
            let tiles = "", objects = "";
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
                const run = (y % 8 === 0 && x % 8 !== 4) || (x % 8 === 0 && y % 8 !== 4);
                tiles += (border || run) ? wall : floor;
                objects += (!border && !run && x % 5 === 2 && y % 5 === 2) ? lamp : blank;
            }
            w.ChatRoomMapViewPerceptionRange = variant.range;
            w.ChatRoomMapViewPerceptionRangeMax = Math.max(variant.range, 7);
            w.LSCG.getModule("MapModule").settings.enhancedLighting = variant.lighting;

            w.Playground.receive("ChatRoomSync", {
                SourceMemberNumber: w.Player.MemberNumber, Name: "Map perf room", Description: "", Admin: [w.Player.MemberNumber], Whitelist: [], Ban: [],
                Background: "MainHall", Limit: 10, Game: "", Visibility: ["All"], Access: ["All"], BlockCategory: [], Language: "EN", Space: "",
                MapData: { Type: "Always", Tiles: tiles, Objects: objects },
                Character: [{
                    ID: `playground-${w.Player.MemberNumber}`, Name: w.Player.Name, MemberNumber: w.Player.MemberNumber,
                    Appearance: w.ServerAppearanceBundle(w.Player.Appearance), ActivePose: [], ItemPermission: 1, WhiteList: [], BlackList: [],
                }],
            });
            await w.Playground.until(() => w.CurrentScreen === "ChatRoom" && !!w.ChatRoomData?.MapData && w.ChatRoomMapViewIsActive?.(), 30000);
            if (typeof w.ChatRoomMapViewSetSplitPosition === "function") w.ChatRoomMapViewSetSplitPosition(variant.split);
            w.Player.MapData = { Pos: { X: 20, Y: 20 }, PrivateState: {} };
            await new Promise(r => setTimeout(r, 1500)); // let assets load and lighting parse

            let longTasks = 0, longTaskMs = 0;
            const observer = new PerformanceObserver(list => { for (const e of list.getEntries()) { longTasks++; longTaskMs += e.duration; } });
            try { observer.observe({ entryTypes: ["longtask"] }); } catch { /* not supported */ }

            w.lscgPerf.reset();
            const heapBefore = (performance as any).memory?.usedJSHeapSize ?? 0;
            let frames = 0;
            const countFrame = () => { frames++; raf = requestAnimationFrame(countFrame); };
            let raf = requestAnimationFrame(countFrame);

            // Walk back and forth along row 20 (an open corridor), one tile every 200 ms like the base walking speed.
            const start = performance.now();
            let dir = 1;
            while (performance.now() - start < variant.walkMs) {
                const pos = w.Player.MapData.Pos;
                if (pos.X + dir < 2 || pos.X + dir > 37) dir = -dir;
                pos.X += dir;
                w.ChatRoomMapViewUpdatePlayerFlag?.();
                w.MapManager?.Map?.updatePlayerPerception?.();
                await new Promise(r => setTimeout(r, 200));
            }
            cancelAnimationFrame(raf);
            observer.disconnect();
            const seconds = (performance.now() - start) / 1000;
            return {
                variant,
                fps: frames / seconds,
                longTasks, longTaskMs,
                heapGrowthMB: ((performance as any).memory?.usedJSHeapSize - heapBefore) / 1048576 || 0,
                perf: w.lscgPerf.snapshot(),
                software: variant.software,
            };
        }, { ...v, walkMs: WALK_MS, software: SOFTWARE });

        mkdirSync("test/.out", { recursive: true });
        writeFileSync(`test/.out/map-perf-${v.name}${SOFTWARE ? "-software" : ""}.json`, JSON.stringify(result, null, 2));
        const p = result.perf;
        console.log(`${v.name}${SOFTWARE ? " [software]" : ""}: ${result.fps.toFixed(1)} fps | drawGrid mean ${p.drawGrid.mean.toFixed(2)} p95 ${p.drawGrid.p95.toFixed(2)} ms | ` +
            `light render mean ${p.lightingRender.mean.toFixed(2)} p95 ${p.lightingRender.p95.toFixed(2)} ms | worker round trip mean ${p.lightingLatency.mean.toFixed(1)} max ${p.lightingLatency.max.toFixed(1)} ms | long tasks ${result.longTasks} (${result.longTaskMs.toFixed(0)} ms)`);
        expect(result.perf.drawGrid.count, "map was drawn while walking").toBeGreaterThan(0);
    });
}
