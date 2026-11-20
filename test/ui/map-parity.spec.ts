// Pixel parity for map and lighting changes: renders fixed map states and saves the canvas, and compares against an earlier
// run when told where it is. Opt-in:
//
//   MAP_PARITY=ref npm run parity:map                 on the code to compare against (e.g. a checkout of an earlier commit)
//   MAP_PARITY=new MAP_PARITY_REFERENCE=<dir> npm run parity:map     on the changed code; <dir> is the first run's test/.out/parity/ref
//
// Light animation is switched off and nothing walks, so a state renders the same twice. Tolerances are generous enough for
// anti-aliasing and resampling differences and tight enough to catch a light or wall in the wrong place.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "./fixtures";
import { enterMapRoom, type MapRoomOptions } from "./map-room";

const LABEL = process.env.MAP_PARITY;
test.skip(!LABEL, "set MAP_PARITY=<label> (npm run parity:map) to run the map parity scenarios");

const REFERENCE = process.env.MAP_PARITY_REFERENCE;
/** MAP_PARITY_FAST=1 runs every scenario with the opt-in faster map drawing switched on. */
const FAST = !!process.env.MAP_PARITY_FAST;
const OUT = join("test", ".out", "parity", LABEL ?? "run");

/** Fraction of pixels that may differ visibly, and how much a channel must differ to count. */
const MAX_DIFFERENT_FRACTION = Number(process.env.MAP_PARITY_MAX_FRACTION ?? 0.01);
const CHANNEL_THRESHOLD = 24;

const scenarios: { name: string; opts: MapRoomOptions }[] = [
    { name: "vanilla-range4", opts: { range: 4, lighting: false } },
    { name: "lit-range4-open", opts: { range: 4, lighting: true, freezeLights: true, pos: { X: 20, Y: 20 } } },
    { name: "lit-range4-room", opts: { range: 4, lighting: true, freezeLights: true, pos: { X: 20, Y: 18 } } },
    { name: "lit-range4-by-door", opts: { range: 4, lighting: true, freezeLights: true, pos: { X: 12, Y: 18 } } },
    { name: "lit-range8", opts: { range: 8, lighting: true, freezeLights: true, pos: { X: 20, Y: 20 } } },
    { name: "lit-range12-edge", opts: { range: 12, lighting: true, freezeLights: true, pos: { X: 3, Y: 3 } } },
];

for (const { name, opts } of scenarios) {
    test(`map parity: ${name}`, async ({ bc }) => {
        test.setTimeout(120_000);
        console.log(`${name} placed:`, await enterMapRoom(bc, { ...opts, fastDraw: FAST }));
        // Let the lighting settle: polygons computed (worker), assets loaded, a few frames drawn
        await bc.page.waitForTimeout(2500);

        // The map area of the canvas, as PNG. (Not a page screenshot: toasts and chat are DOM and differ between runs.)
        const dataUrl = await bc.run(() => {
            const canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
            const out = document.createElement("canvas");
            out.width = 1000; out.height = 1000;
            out.getContext("2d")!.drawImage(canvas, 0, 0, 1000, 1000, 0, 0, 1000, 1000);
            return out.toDataURL("image/png");
        });
        mkdirSync(OUT, { recursive: true });
        writeFileSync(join(OUT, `${name}.png`), Buffer.from(dataUrl.split(",")[1], "base64"));

        if (!REFERENCE) return;
        const refPath = join(REFERENCE, `${name}.png`);
        expect(existsSync(refPath), `reference image ${refPath}`).toBe(true);
        const refUrl = "data:image/png;base64," + readFileSync(refPath).toString("base64");

        const diff = await bc.run(async ([a, b, threshold]) => {
            const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
            const pixels = async (src: string) => {
                const img = await load(src);
                const c = document.createElement("canvas");
                c.width = img.width; c.height = img.height;
                const ctx = c.getContext("2d")!;
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, c.width, c.height).data;
            };
            const [pa, pb] = await Promise.all([pixels(a), pixels(b)]);
            let different = 0, maxChannel = 0, sumAbs = 0;
            const total = pa.length / 4;
            for (let i = 0; i < pa.length; i += 4) {
                const d = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]));
                sumAbs += d;
                if (d > maxChannel) maxChannel = d;
                if (d > threshold) different++;
            }
            return { total, different, maxChannel, meanDiff: sumAbs / total };
        }, [dataUrl, refUrl, CHANNEL_THRESHOLD] as const);

        const fraction = diff.different / diff.total;
        console.log(`parity ${name}: ${(fraction * 100).toFixed(3)}% of pixels differ visibly, mean channel diff ${diff.meanDiff.toFixed(2)}, max ${diff.maxChannel}`);
        expect(fraction, `${name}: share of pixels that differ by more than ${CHANNEL_THRESHOLD}`).toBeLessThanOrEqual(MAX_DIFFERENT_FRACTION);
    });
}
