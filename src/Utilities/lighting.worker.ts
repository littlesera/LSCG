import { flattenPolygon, generateSegments, getVisibilityPolygon, mergeSegments } from "./lighting.math";
import { Point, Segment } from "./lighting.types";

// Persistent Worker State: only what later jobs need. Results are sent back as flat buffers and handed over (transferred), so
// the worker does not keep them.
let cachedSegments: Segment[] = [];

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;
    const lightPolygons: Record<string, Float32Array> = {};
    let visionPolygon: Float32Array | undefined;
    let full = false;

    if (type === "COMPUTE") {
        // FULL RECOMPUTE: Obstacles changed
        const { lights, obstacles, viewpoint, suppressOptimization } = payload;

        const rawSegments = generateSegments(obstacles || []);
        cachedSegments = suppressOptimization ? rawSegments : mergeSegments(rawSegments);
        full = true;

        if (lights) {
            for (const light of lights) {
                lightPolygons[light.id] = flattenPolygon(getVisibilityPolygon(light, cachedSegments));
            }
        }
        visionPolygon = flattenPolygon(viewpoint ? getVisibilityPolygon(viewpoint, cachedSegments) : []);
    }
    else if (type === "UPDATE_LIGHTS") {
        // PARTIAL RECOMPUTE: Only moving lights changed
        const { updates, viewpoint } = payload;

        if (updates) {
            for (const light of updates) {
                lightPolygons[light.id] = flattenPolygon(getVisibilityPolygon(light, cachedSegments));
            }
        }
        if (viewpoint !== undefined) {
            visionPolygon = flattenPolygon(viewpoint ? getVisibilityPolygon(viewpoint, cachedSegments) : []);
        }
    }
    else {
        return;
    }

    const transfer: ArrayBuffer[] = Object.values(lightPolygons).map(p => p.buffer as ArrayBuffer);
    if (visionPolygon) transfer.push(visionPolygon.buffer as ArrayBuffer);
    // The project's lib is DOM-only, so `self` is typed as a Window; in a worker it is the dedicated worker scope.
    (self as unknown as Worker).postMessage({
        type: "COMPUTE_DONE",
        // `full` replaces the engine's cache; otherwise these lights and (if present) the vision polygon are merged in.
        payload: { full, lightPolygons, visionPolygon, segments: payload.debug ? cachedSegments : undefined },
    }, transfer);
};
