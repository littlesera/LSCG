// lighting-math.ts
import { OpaqueObstacle, Point, Segment } from "./lighting.types";

// Note: Ensure the intersectResult object is inside this file
const intersectResult = { x: 0, y: 0, t1: 0 };

// --- HEAVY MATH FUNCTIONS ---

export function generateSegments(obstacles: OpaqueObstacle[]): Segment[] {
    const rawSegments: Segment[] = [];
    for (const obs of obstacles) {
        switch (obs.type) {
            case "polygon":
                for (let i = 0; i < obs.points.length; i++) {
                    rawSegments.push({ p1: obs.points[i], p2: obs.points[(i + 1) % obs.points.length] });
                }
                break;
            case "line":
                for (let i = 0; i < obs.points.length - 1; i++) {
                    rawSegments.push({ p1: obs.points[i], p2: obs.points[i + 1] });
                }
                break;
            case "rectangle":
                const tl = obs.topLeft, br = obs.bottomRight;
                const tr = { x: br.x, y: tl.y }, bl = { x: tl.x, y: br.y };
                rawSegments.push({ p1: tl, p2: tr }, { p1: tr, p2: br }, { p1: br, p2: bl }, { p1: bl, p2: tl });
                break;
            case "oval":
                const res = obs.resolution ?? 16;
                const pts: Point[] = [];
                const rotationOffset = (3 * Math.PI) / 2; 
                for (let i = 0; i < res; i++) {
                    const angle = ((i / res) * Math.PI * 2) + rotationOffset;
                    pts.push({
                        x: obs.center.x + Math.cos(angle) * obs.radiusX,
                        y: obs.center.y + Math.sin(angle) * obs.radiusY
                    });
                }
                for (let i = 0; i < pts.length; i++) {
                    rawSegments.push({ p1: pts[i], p2: pts[(i + 1) % pts.length] });
                }
                break;
        }
    }
    return rawSegments;
}

export function optimizeSegments(rawSegments: Segment[]): Segment[] {
    let merged = true;
    const result = [...rawSegments];

    while (merged) {
        merged = false;
        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const s1 = result[i];
                const s2 = result[j];

                const v1x = s1.p2.x - s1.p1.x;
                const v1y = s1.p2.y - s1.p1.y;
                const len1 = Math.hypot(v1x, v1y);
                
                if (len1 < 0.01) continue; 

                const nx = v1y / len1; 
                const ny = -v1x / len1;

                const dist1 = Math.abs((s2.p1.x - s1.p1.x) * nx + (s2.p1.y - s1.p1.y) * ny);
                const dist2 = Math.abs((s2.p2.x - s1.p1.x) * nx + (s2.p2.y - s1.p1.y) * ny);

                if (dist1 < 0.01 && dist2 < 0.01) {
                    const dx = v1x / len1;
                    const dy = v1y / len1;
                    
                    const p1_proj = 0; 
                    const p2_proj = len1; 
                    const p3_proj = (s2.p1.x - s1.p1.x) * dx + (s2.p1.y - s1.p1.y) * dy;
                    const p4_proj = (s2.p2.x - s1.p1.x) * dx + (s2.p2.y - s1.p1.y) * dy;
                    
                    const min1 = Math.min(p1_proj, p2_proj);
                    const max1 = Math.max(p1_proj, p2_proj);
                    const min2 = Math.min(p3_proj, p4_proj);
                    const max2 = Math.max(p3_proj, p4_proj);
                    
                    if (max1 >= min2 - 0.01 && max2 >= min1 - 0.01) {
                        const points = [s1.p1, s1.p2, s2.p1, s2.p2];
                        const projs = [p1_proj, p2_proj, p3_proj, p4_proj];
                        
                        let minIdx = 0;
                        let maxIdx = 0;
                        for (let k = 1; k < 4; k++) {
                            if (projs[k] < projs[minIdx]) minIdx = k;
                            if (projs[k] > projs[maxIdx]) maxIdx = k;
                        }
                        
                        result[i] = { p1: points[minIdx], p2: points[maxIdx] };
                        result.splice(j, 1);
                        merged = true;
                        break; 
                    }
                }
            }
            if (merged) break; 
        }
    }
    return result.filter(s => Math.hypot(s.p1.x - s.p2.x, s.p1.y - s.p2.y) > 0.01);
}

export function getVisibilityPolygon(origin: { x: number, y: number, radius: number }, segments: Segment[]): Point[] {
    const angles: Set<number> = new Set();
    const r = origin.radius;

    const minX = origin.x - r;
    const maxX = origin.x + r;
    const minY = origin.y - r;
    const maxY = origin.y + r;

    const localSegments = segments.filter(seg => {
        if (seg.p1.x < minX && seg.p2.x < minX) return false;
        if (seg.p1.x > maxX && seg.p2.x > maxX) return false;
        if (seg.p1.y < minY && seg.p2.y < minY) return false;
        if (seg.p1.y > maxY && seg.p2.y > maxY) return false;
        return true; 
    });

    const bounds: Segment[] = [
        { p1: { x: minX, y: minY }, p2: { x: maxX, y: minY } },
        { p1: { x: maxX, y: minY }, p2: { x: maxX, y: maxY } },
        { p1: { x: maxX, y: maxY }, p2: { x: minX, y: maxY } },
        { p1: { x: minX, y: maxY }, p2: { x: minX, y: minY } }
    ];

    const allSegments = [...localSegments, ...bounds];

    for (const seg of allSegments) {
        for (const p of [seg.p1, seg.p2]) {
            const angle = Math.atan2(p.y - origin.y, p.x - origin.x);
            angles.add(angle - 0.00001);
            angles.add(angle);
            angles.add(angle + 0.00001);
        }
    }

    const sortedAngles = Array.from(angles).sort((a, b) => a - b);
    const polygon: Point[] = [];

    for (const angle of sortedAngles) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let closestIntersect: Point | null = null;
        let minT1 = Infinity;

        for (const seg of allSegments) {
            const hasIntersect = getIntersection(origin, dx, dy, seg, intersectResult);
            if (hasIntersect && intersectResult.t1 < minT1) {
                minT1 = intersectResult.t1;
                closestIntersect = { x: intersectResult.x, y: intersectResult.y };
            }
        }

        if (closestIntersect) {
            polygon.push(closestIntersect);
        }
    }

    return polygon;
}

export function getIntersection(
    origin: Point, dx: number, dy: number, seg: Segment, result: { x: number; y: number; t1: number }
): boolean {
    const r_px = origin.x, r_py = origin.y;
    const s_px = seg.p1.x, s_py = seg.p1.y;
    const s_dx = seg.p2.x - s_px, s_dy = seg.p2.y - s_py;

    const T2 = dx * s_dy - dy * s_dx;
    if (T2 === 0) return false; 

    const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
    const t1 = T1 / T2;
    const t2 = ((s_px - r_px) * dy - (s_py - r_py) * dx) / T2;

    if (t1 > 0 && t2 >= 0 && t2 <= 1) {
        result.x = r_px + dx * t1;
        result.y = r_py + dy * t1;
        result.t1 = t1;
        return true;
    }
    return false;
}