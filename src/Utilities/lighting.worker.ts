import { generateSegments, getVisibilityPolygon, optimizeSegments } from "./lighting.math";
import { Point, Segment } from "./lighting.types";

// Persistent Worker State
let cachedSegments: Segment[] = [];
let cachedLightPolygons: Record<string, Point[]> = {};
let cachedVisionPolygon: Point[] = [];

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === "COMPUTE") {
        // FULL RECOMPUTE: Obstacles changed
        const { lights, obstacles, viewpoint, suppressOptimization } = payload;

        const rawSegments = generateSegments(obstacles || []);
        cachedSegments = suppressOptimization ? rawSegments : optimizeSegments(rawSegments);

        // Clear the old cache and rebuild it
        cachedLightPolygons = {};
        if (lights) {
            for (const light of lights) {
                cachedLightPolygons[light.id] = getVisibilityPolygon(light, cachedSegments);
            }
        }

        cachedVisionPolygon = viewpoint ? getVisibilityPolygon(viewpoint, cachedSegments) : [];

        sendDone();
    } 
    else if (type === "UPDATE_LIGHTS") {
        // PARTIAL RECOMPUTE: Only moving lights changed
        const { updates, viewpoint } = payload;

        if (updates) {
            for (const light of updates) {
                cachedLightPolygons[light.id] = getVisibilityPolygon(light, cachedSegments);
            }
        }

        if (viewpoint !== undefined) {
            cachedVisionPolygon = viewpoint ? getVisibilityPolygon(viewpoint, cachedSegments) : [];
        }

        sendDone();
    }
};

function sendDone() {
    self.postMessage({
        type: "COMPUTE_DONE",
        payload: { 
            lightPolygons: cachedLightPolygons, 
            visionPolygon: cachedVisionPolygon, 
            segments: cachedSegments 
        }
    });
}

