export interface Point {
    x: number;
    y: number;
}

export interface Viewpoint extends Point {
    radius: number; 
}

// [Red (0-255), Green (0-255), Blue (0-255), Alpha/Intensity (0.0-1.0)]
export type Color = [number, number, number, number];

export interface Light extends Point {
    radius: number;
    color: Color; 
    
    animType?: "none" | "pulse" | "flicker" | "hover" | "glitch" | "flashlight";
    animSpeed?: number;

    // Flashlight properties (in radians)
    angle?: number; // The direction the light is pointing
    fov?: number;   // How wide the beam is (defaults to 45 degrees)
    
    _animState?: {
        baseX: number; baseY: number; baseRadius: number;
        baseR: number; baseG: number; baseB: number; baseIntensity: number;
        seed: number; 
    };
}

export interface PolygonObstacle {
    type: "polygon";
    points: Point[];
}

export interface LineObstacle {
    type: "line";
    points: Point[]; // Generates segments between points, but does not close the loop
}

export interface RectangleObstacle {
    type: "rectangle";
    topLeft: Point;
    bottomRight: Point;
}

export interface OvalObstacle {
    type: "oval";
    center: Point;
    radiusX: number;
    radiusY: number;
    resolution?: number; // How many flat segments make up the curve
}

export type OpaqueObstacle = PolygonObstacle | LineObstacle | RectangleObstacle | OvalObstacle;

export interface RenderOptions {
    mainCtx: CanvasRenderingContext2D;
    width: number;
    height: number;
    lights: Light[];
    viewpoint?: Viewpoint;
    ambientColor?: string;
    focus?: Point;  // For aiming flashlights
}

interface Segment {
    p1: Point;
    p2: Point;
}

export class LightingEngine {
    public debug: boolean = false;
    private segments: Segment[] = [];

    // Offscreen canvases for layering
    private lightCanvas: HTMLCanvasElement;
    private lightCtx: CanvasRenderingContext2D;
    private visionCanvas: HTMLCanvasElement;
    private visionCtx: CanvasRenderingContext2D;

    constructor() {
        this.lightCanvas = document.createElement("canvas");
        this.lightCtx = this.lightCanvas.getContext("2d") as CanvasRenderingContext2D;
        
        this.visionCanvas = document.createElement("canvas");
        this.visionCtx = this.visionCanvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public setObstacles(obstacles: OpaqueObstacle[]) {
        const rawSegments: Segment[] = [];
        
        for (const obs of obstacles) {
            switch (obs.type) {
                case "polygon":
                    for (let i = 0; i < obs.points.length; i++) {
                        rawSegments.push({
                            p1: obs.points[i],
                            p2: obs.points[(i + 1) % obs.points.length]
                        });
                    }
                    break;

                case "line":
                    for (let i = 0; i < obs.points.length - 1; i++) {
                        rawSegments.push({
                            p1: obs.points[i],
                            p2: obs.points[i + 1]
                        });
                    }
                    break;

                case "rectangle":
                    const tl = obs.topLeft;
                    const br = obs.bottomRight;
                    const tr = { x: br.x, y: tl.y };
                    const bl = { x: tl.x, y: br.y };
                    
                    rawSegments.push({ p1: tl, p2: tr });
                    rawSegments.push({ p1: tr, p2: br });
                    rawSegments.push({ p1: br, p2: bl });
                    rawSegments.push({ p1: bl, p2: tl });
                    break;
                
                case "oval":
                    const res = obs.resolution ?? 16;
                    const pts: Point[] = [];
                    // Generate points around the ellipse
                    for (let i = 0; i < res; i++) {
                        const angle = (i / res) * Math.PI * 2;
                        pts.push({
                            x: obs.center.x + Math.cos(angle) * obs.radiusX,
                            y: obs.center.y + Math.sin(angle) * obs.radiusY
                        });
                    }
                    // Connect the points
                    for (let i = 0; i < pts.length; i++) {
                        rawSegments.push({
                            p1: pts[i],
                            p2: pts[(i + 1) % pts.length]
                        });
                    }
                    break;
            }
        }

        // Run the optimization sweep before saving to the engine
        this.segments = this.optimizeSegments(rawSegments);
        console.info(`Optimized segments -- pre: ${rawSegments.length}, post: ${this.segments.length}`);
    }

    private syncCanvasSizes(width: number, height: number) {
        if (this.lightCanvas.width !== width || this.lightCanvas.height !== height) {
            this.lightCanvas.width = width;
            this.lightCanvas.height = height;
            this.visionCanvas.width = width;
            this.visionCanvas.height = height;
        }
    }

    public render(
        options: RenderOptions 
    ) {
        const {
            mainCtx,
            width,
            height,
            lights,
            viewpoint,
            ambientColor = "rgb(40, 40, 40)",
            focus
        } = options;

        this.syncCanvasSizes(width, height);

        // --- 1. RENDER LIGHTING LAYER ---
        this.lightCtx.globalCompositeOperation = "source-over";
        this.lightCtx.fillStyle = ambientColor;
        this.lightCtx.fillRect(0, 0, width, height);

        // Process physics and color shifts before drawing
        this.applyAnimations(lights, performance.now(), focus);

        // Draw Point Lights
        this.lightCtx.globalCompositeOperation = "lighter";
        for (const light of lights) {
            this.drawLight(this.lightCtx, light);
        }

        // --- 2. RENDER VISION MASK LAYER ---
        if (!!viewpoint) {
            this.visionCtx.globalCompositeOperation = "source-over";
            this.visionCtx.fillStyle = "black";
            this.visionCtx.fillRect(0, 0, width, height);

            const visionPolygon = this.getVisibilityPolygon(viewpoint);
            if (visionPolygon.length > 0) {
                this.visionCtx.globalCompositeOperation = "destination-out";
                this.visionCtx.beginPath();
                this.visionCtx.moveTo(visionPolygon[0].x, visionPolygon[0].y);
                for (let i = 1; i < visionPolygon.length; i++) {
                    this.visionCtx.lineTo(visionPolygon[i].x, visionPolygon[i].y);
                }
                this.visionCtx.closePath();
                this.visionCtx.fillStyle = "white"; 
                this.visionCtx.fill();
            }
        }

        // --- 3. COMPOSITE ONTO MAIN CANVAS ---
        mainCtx.save();

        mainCtx.globalCompositeOperation = "multiply";
        mainCtx.drawImage(this.lightCanvas, 0, 0);

        if (!!viewpoint) {
            mainCtx.globalCompositeOperation = "source-over";
            mainCtx.globalAlpha = 0.5; 
            mainCtx.drawImage(this.visionCanvas, 0, 0);
        }

        mainCtx.restore();

        // --- 4. DEBUG OVERLAY ---
        if (this.debug) {
            mainCtx.save();
            
            mainCtx.lineWidth = 2;

            for (let i = 0; i < this.segments.length; i++) {
                const seg = this.segments[i];
                
                // Use the golden angle (137.5 degrees) to generate highly contrasting colors 
                // for sequential segments, making unmerged lines blatantly obvious.
                mainCtx.strokeStyle = `hsl(${(i * 137.5) % 360}, 100%, 50%)`;
                
                mainCtx.beginPath();
                mainCtx.moveTo(seg.p1.x, seg.p1.y);
                mainCtx.lineTo(seg.p2.x, seg.p2.y);
                mainCtx.stroke();

                // Draw small white dots at the actual vertices to spot gap/overlap issues
                mainCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
                mainCtx.beginPath();
                mainCtx.arc(seg.p1.x, seg.p1.y, 3, 0, Math.PI * 2);
                mainCtx.arc(seg.p2.x, seg.p2.y, 3, 0, Math.PI * 2);
                mainCtx.fill();
            }
            
            mainCtx.restore();
        }
    }

    private drawLight(ctx: CanvasRenderingContext2D, light: Light) {
        const lightPolygon = this.getVisibilityPolygon({ 
            x: light.x, y: light.y, radius: light.radius 
        });

        if (lightPolygon.length === 0) return;

        ctx.save();
        
        // 1. Clip to the physical shadows (Raycaster)
        ctx.beginPath();
        ctx.moveTo(lightPolygon[0].x, lightPolygon[0].y);
        for (let i = 1; i < lightPolygon.length; i++) {
            ctx.lineTo(lightPolygon[i].x, lightPolygon[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // 2. Clip to a directional cone (Flashlight)
        if (light.animType === "flashlight") {
            const angle = light.angle ?? 0;
            const fovDegrees = light.fov ?? 60; 
            const fovRadians = fovDegrees * (Math.PI / 180); // Convert degrees to radians for canvas
            
            ctx.beginPath();
            ctx.moveTo(light.x, light.y);
            ctx.arc(light.x, light.y, light.radius, angle - fovRadians / 2, angle + fovRadians / 2);
            ctx.closePath();
            ctx.clip();
        }

        // 3. Draw the soft radial gradient
        const gradient = ctx.createRadialGradient(
            light.x, light.y, 0,
            light.x, light.y, light.radius
        );

        const [r, g, b, intensity] = light.color;
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${intensity * 0.6})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${intensity * 0.2})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
            light.x - light.radius,
            light.y - light.radius,
            light.radius * 2,
            light.radius * 2
        );

        ctx.restore();
    }

    private getVisibilityPolygon(origin: { x: number, y: number, radius: number }): Point[] {
        const angles: Set<number> = new Set();
        const r = origin.radius;

        const bounds: Segment[] = [
            { p1: { x: origin.x - r, y: origin.y - r }, p2: { x: origin.x + r, y: origin.y - r } },
            { p1: { x: origin.x + r, y: origin.y - r }, p2: { x: origin.x + r, y: origin.y + r } },
            { p1: { x: origin.x + r, y: origin.y + r }, p2: { x: origin.x - r, y: origin.y + r } },
            { p1: { x: origin.x - r, y: origin.y + r }, p2: { x: origin.x - r, y: origin.y - r } }
        ];

        const allSegments = [...this.segments, ...bounds];

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
                const intersect = this.getIntersection(origin, dx, dy, seg);
                if (intersect && intersect.t1 < minT1) {
                    minT1 = intersect.t1;
                    closestIntersect = { x: intersect.x, y: intersect.y };
                }
            }

            if (closestIntersect) {
                polygon.push(closestIntersect);
            }
        }

        return polygon;
    }

    private getIntersection(
        origin: Point, dx: number, dy: number, seg: Segment
    ): { x: number; y: number; t1: number } | null {
        const r_px = origin.x;
        const r_py = origin.y;
        const s_px = seg.p1.x;
        const s_py = seg.p1.y;
        const s_dx = seg.p2.x - seg.p1.x;
        const s_dy = seg.p2.y - seg.p1.y;

        const T2 = dx * s_dy - dy * s_dx;
        if (T2 === 0) return null; 

        const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
        const t1 = T1 / T2;
        const t2 = ((s_px - r_px) * dy - (s_py - r_py) * dx) / T2;

        if (t1 > 0 && t2 >= 0 && t2 <= 1) {
            return {
                x: r_px + dx * t1,
                y: r_py + dy * t1,
                t1: t1
            };
        }
        return null;
    }

    private applyAnimations(lights: Light[], time: number, focus?: Point) {
        for (const light of lights) {
            if (!light.animType || light.animType === "none") continue;

            // 1. Initialize base state on the first frame it's rendered
            if (!light._animState) {
                light._animState = {
                    baseX: light.x,
                    baseY: light.y,
                    baseRadius: light.radius,
                    baseR: light.color[0],
                    baseG: light.color[1],
                    baseB: light.color[2],
                    baseIntensity: light.color[3],
                    seed: Math.random() * 2000
                };
            }

            const state = light._animState;
            const speed = light.animSpeed || 1;
            
            const t = (time * 0.001 * speed) + state.seed; 

            // 2. Reset the light to its original state before modifying
            light.x = state.baseX;
            light.y = state.baseY;
            light.radius = state.baseRadius;
            light.color[0] = state.baseR;
            light.color[1] = state.baseG;
            light.color[2] = state.baseB;
            light.color[3] = state.baseIntensity;

            // 3. Apply the specific animation math
            switch (light.animType) {
                case "flashlight":
                    if (!!focus) {
                        light.angle = Math.atan2(focus.y - light.y, focus.x - light.x);
                    }
                    break;
                case "pulse":
                    const pulse = Math.sin(t * 0.5); 
                    light.radius = state.baseRadius * (1 + pulse * 0.3);
                    light.color[3] = state.baseIntensity * (1 + pulse * 0.2);
                    break;

                case "flicker":
                    const noise = (Math.sin(t * 11) + Math.sin(t * 17) + Math.cos(t * 23)) / 3; 
                    light.color[3] = Math.max(0, state.baseIntensity * (1 + noise * 0.1));
                    light.radius = state.baseRadius * (1 + noise * 0.04);
                    break;

                case "hover":
                    const hoverRangeX = 12; 
                    const hoverRangeY = 6;  
                    light.x = state.baseX + Math.sin(t * 0.5) * hoverRangeX;
                    light.y = state.baseY + Math.sin(t * 1.0) * hoverRangeY; 
                    break;

                case "glitch": {
                    const isUnstable = Math.sin(t * 0.4) > 0.9; 
                    
                    // 1. Time Stepping: Drop to 10 so when a glitch DOES happen, 
                    // it holds for ~100ms (6 frames), feeling like a lazy visual tear
                    const steppedT = Math.floor(t * 10); 

                    // 2. PRNG
                    const prng = (offset: number) => Math.abs((Math.sin(steppedT * offset + state.seed) * 43758.5453) % 1);
                    
                    const randPhysChance = prng(12.9898);
                    const randColChance  = prng(37.719);
                    const randVal1       = prng(78.233);
                    const randVal2       = prng(93.411);

                    // 3. Lowered probabilities for a subtler effect
                    const physicalGlitchChance = isUnstable ? 0.1 : 0.0005; 
                    const colorGlitchChance = isUnstable ? 0.2 : 0.001;

                    // 4. Physical Glitch (Flicker and Jitter)
                    if (randPhysChance < physicalGlitchChance) {
                        // Softer intensity drop (drops to 40-80% instead of 0-30%)
                        light.color[3] = state.baseIntensity * (0.4 + randVal1 * 0.4);
                        // Tighter spatial jitter (drifts +/- 2px instead of +/- 5px)
                        light.x = state.baseX + (randVal1 * 4 - 2);
                        light.y = state.baseY + (randVal2 * 4 - 2);
                    }

                    // 5. Color/Hue Glitch (Happens independently)
                    if (randColChance < colorGlitchChance) {
                        if (randVal1 < 0.33) {
                            // Digital Artifact
                            light.color[0] = state.baseB; 
                            light.color[2] = state.baseR;
                        } else if (randVal1 < 0.66) {
                            // Overdrive
                            const channel = Math.floor(randVal2 * 3);
                            light.color[channel] = prng(11.111) > 0.5 ? 255 : 0; 
                        } else {
                            // Subtler flash: softly boost all colors toward white instead of pure 255 snap
                            light.color[0] = Math.min(255, state.baseR + 100); 
                            light.color[1] = Math.min(255, state.baseG + 100); 
                            light.color[2] = Math.min(255, state.baseB + 100);
                        }
                    }
                    break;
                }
            }
        }
    }

    /**
     * Collapses connected, parallel line segments into single long segments.
     * Dramatically reduces raycasting math for tile-based maps.
     */
    private optimizeSegments(segments: Segment[]): Segment[] {
        let merged = true;
        const result = [...segments];

        while (merged) {
            merged = false;
            for (let i = 0; i < result.length; i++) {
                for (let j = i + 1; j < result.length; j++) {
                    const s1 = result[i];
                    const s2 = result[j];

                    // Helper to check if two points overlap (with a tiny float tolerance)
                    const match = (pA: Point, pB: Point) => Math.abs(pA.x - pB.x) < 0.01 && Math.abs(pA.y - pB.y) < 0.01;

                    let shared: Point | null = null;
                    let end1: Point | null = null;
                    let end2: Point | null = null;

                    // Identify if and how the two segments connect
                    if (match(s1.p2, s2.p1)) { shared = s1.p2; end1 = s1.p1; end2 = s2.p2; }
                    else if (match(s1.p1, s2.p2)) { shared = s1.p1; end1 = s1.p2; end2 = s2.p1; }
                    else if (match(s1.p2, s2.p2)) { shared = s1.p2; end1 = s1.p1; end2 = s2.p1; }
                    else if (match(s1.p1, s2.p1)) { shared = s1.p1; end1 = s1.p2; end2 = s2.p2; }

                    if (shared && end1 && end2) {
                        // Calculate the vectors of the two segments
                        const v1x = shared.x - end1.x;
                        const v1y = shared.y - end1.y;
                        const v2x = end2.x - shared.x;
                        const v2y = end2.y - shared.y;
                        
                        // Cross product determines if they are parallel/collinear
                        const crossProduct = Math.abs(v1x * v2y - v1y * v2x);
                        
                        if (crossProduct < 0.01) {
                            // They form a straight line! Merge them into one segment.
                            result[i] = { p1: end1, p2: end2 };
                            result.splice(j, 1);
                            merged = true;
                            break; // Break inner loop to restart with new geometry
                        }
                    }
                }
                if (merged) break; // Break outer loop to restart while sweep
            }
        }
        return result;
    }
}