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
    fov?: number;   // How wide the beam is (defaults to 60 degrees)
    
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
    camera?: Point; // X/Y offset for panning the map
}

interface Segment {
    p1: Point;
    p2: Point;
}

export class LightingEngine {
    public debug: boolean = false;
    public suppressOptimization: boolean = false;
    public disableSpatialAnimations: boolean = false; // Toggle to save CPU by freezing physical light mutations
    
    private lastRenderTime: number = 0;
    private currentFps: number = 0;
    private timings = { anim: 0, compute: 0, render: 0 };
    
    private lastHzTime: number = 0;
    private counters = { anim: 0, compute: 0, render: 0 };
    private hz = { anim: 0, compute: 0, render: 0 };

    private segments: Segment[] = [];

    // Raycast Caches
    private lightMaskCache: Map<Light, Point[]> = new Map();
    private visionMaskCache: Point[] = [];

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
                    for (let i = 0; i < res; i++) {
                        const angle = (i / res) * Math.PI * 2;
                        pts.push({
                            x: obs.center.x + Math.cos(angle) * obs.radiusX,
                            y: obs.center.y + Math.sin(angle) * obs.radiusY
                        });
                    }
                    for (let i = 0; i < pts.length; i++) {
                        rawSegments.push({
                            p1: pts[i],
                            p2: pts[(i + 1) % pts.length]
                        });
                    }
                    break;
            }
        }

        if (!this.suppressOptimization) {
            this.segments = this.optimizeSegments(rawSegments);
            if (this.debug) console.info(`Optimized segments -- pre: ${rawSegments.length}, post: ${this.segments.length}`);
        } else {
            this.segments = rawSegments;
        }
    }

    /**
     * STEP 1: Process time-based animations and angles.
     * Call this in your game loop BEFORE compute() or render().
     */
    public updateAnimations(lights: Light[], focus?: Point) {
        const time = performance.now();
        for (const light of lights) {
            if (!light.animType || light.animType === "none") continue;

            if (!light._animState) {
                light._animState = {
                    baseX: light.x, baseY: light.y, baseRadius: light.radius,
                    baseR: light.color[0], baseG: light.color[1], baseB: light.color[2], baseIntensity: light.color[3],
                    seed: Math.random() * 2000
                };
            }

            const state = light._animState;
            const speed = light.animSpeed || 1;
            const t = (time * 0.001 * speed) + state.seed; 

            // Reset light base properties
            light.x = state.baseX;
            light.y = state.baseY;
            light.radius = state.baseRadius;
            
            // Sever memory reference to avoid exponential drift
            light.color = [state.baseR, state.baseG, state.baseB, state.baseIntensity];

            switch (light.animType) {
                case "flashlight":
                    if (!!focus) {
                        light.angle = Math.atan2(focus.y - light.y, focus.x - light.x);
                    }
                    break;

                case "pulse":
                    const pulse = Math.sin(t * 0.5); 
                    if (!this.disableSpatialAnimations) {
                        light.radius = state.baseRadius * (1 + pulse * 0.3);
                    }
                    light.color[3] = state.baseIntensity * (1 + pulse * 0.2);
                    break;

                case "flicker":
                    const noise = (Math.sin(t * 11) + Math.sin(t * 17) + Math.cos(t * 23)) / 3; 
                    if (!this.disableSpatialAnimations) {
                        light.radius = state.baseRadius * (1 + noise * 0.04);
                    }
                    light.color[3] = Math.max(0, state.baseIntensity * (1 + noise * 0.1));
                    break;

                case "hover":
                    if (!this.disableSpatialAnimations) {
                        const hoverRangeX = 12; 
                        const hoverRangeY = 6;  
                        light.x = state.baseX + Math.sin(t * 0.5) * hoverRangeX;
                        light.y = state.baseY + Math.sin(t * 1.0) * hoverRangeY; 
                    }
                    break;

                case "glitch": {
                    const isUnstable = Math.sin(t * 0.4) > 0.9; 
                    const steppedT = Math.floor(t * 10); 
                    const prng = (offset: number) => Math.abs((Math.sin(steppedT * offset + state.seed) * 43758.5453) % 1);
                    
                    const randPhysChance = prng(12.9898);
                    const randColChance  = prng(37.719);
                    const randVal1       = prng(78.233);
                    const randVal2       = prng(93.411);

                    const physicalGlitchChance = isUnstable ? 0.1 : 0.0005; 
                    const colorGlitchChance = isUnstable ? 0.2 : 0.001;

                    if (randPhysChance < physicalGlitchChance) {
                        light.color[3] = state.baseIntensity * (0.4 + randVal1 * 0.4);
                        if (!this.disableSpatialAnimations) {
                            light.x = state.baseX + (randVal1 * 4 - 2);
                            light.y = state.baseY + (randVal2 * 4 - 2);
                        }
                    }

                    if (randColChance < colorGlitchChance) {
                        if (randVal1 < 0.33) {
                            light.color[0] = state.baseB; 
                            light.color[2] = state.baseR;
                        } else if (randVal1 < 0.66) {
                            const channel = Math.floor(randVal2 * 3);
                            light.color[channel] = prng(11.111) > 0.5 ? 255 : 0; 
                        } else {
                            light.color[0] = Math.min(255, state.baseR + 100); 
                            light.color[1] = Math.min(255, state.baseG + 100); 
                            light.color[2] = Math.min(255, state.baseB + 100);
                        }
                    }
                    break;
                }
            }
        }

        const duration = performance.now() - time;
        this.timings.anim = (this.timings.anim * 0.9) + (duration * 0.1);
        this.counters.anim++;
    }

    /**
     * STEP 2: The Heavy Lifting
     * Added camera bounds so we NEVER compute raycasting for off-screen lights.
     */
    public compute(
        lights: Light[], 
        obstacles: OpaqueObstacle[],
        viewpoint?: Viewpoint
    ) {
        const start = performance.now();

        if (!!obstacles)
            this.setObstacles(obstacles);

        this.lightMaskCache.clear();
        
        for (const light of lights) {
            this.lightMaskCache.set(
                light, 
                this.getVisibilityPolygon({ x: light.x, y: light.y, radius: light.radius })
            );
        }

        if (viewpoint) {
            this.visionMaskCache = this.getVisibilityPolygon(viewpoint);
        } else {
            this.visionMaskCache = [];
        }

        const duration = performance.now() - start;
        this.timings.compute = (this.timings.compute * 0.9) + (duration * 0.1);
        this.counters.compute++;
    }

    /**
     * STEP 3: The Fast Painter
     * Call this every frame in your game loop.
     */
    public render(options: RenderOptions) {
        const renderStart = performance.now();
        const {
            mainCtx,
            width,
            height,
            lights,
            viewpoint,
            ambientColor = "rgb(60, 60, 60)",
            camera = { x: 0, y: 0 }
        } = options;

        this.syncCanvasSizes(width, height);

        // --- 1. RENDER LIGHTING LAYER ---
        this.lightCtx.globalCompositeOperation = "copy";
        this.lightCtx.fillStyle = ambientColor;
        this.lightCtx.fillRect(0, 0, width, height);

        this.lightCtx.save();
        this.lightCtx.translate(-camera.x, -camera.y);
        this.lightCtx.globalCompositeOperation = "lighter";
        
        for (const light of lights) {
            // Cull off-screen lights
            if (
                light.x + light.radius < camera.x ||
                light.x - light.radius > camera.x + width ||
                light.y + light.radius < camera.y ||
                light.y - light.radius > camera.y + height
            ) continue; 

            // Read from Raycast cache
            const cachedPolygon = this.lightMaskCache.get(light);
            if (!cachedPolygon || cachedPolygon.length === 0) continue;

            this.drawLight(this.lightCtx, light, cachedPolygon);
        }
        this.lightCtx.restore();

        // --- 2. RENDER VISION MASK LAYER ---
        if (!!viewpoint) {
            this.visionCtx.globalCompositeOperation = "source-over";
            this.visionCtx.fillStyle = "black";
            this.visionCtx.fillRect(0, 0, width, height);

            this.visionCtx.save();
            this.visionCtx.translate(-camera.x, -camera.y);

            const visionPolygon = this.visionMaskCache;
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
            this.visionCtx.restore();
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
            mainCtx.translate(-camera.x, -camera.y);
            mainCtx.lineWidth = 2;

            // Draw Segments
            for (let i = 0; i < this.segments.length; i++) {
                const seg = this.segments[i];
                mainCtx.strokeStyle = `hsl(${(i * 137.5) % 360}, 100%, 50%)`;
                
                mainCtx.beginPath();
                mainCtx.moveTo(seg.p1.x, seg.p1.y);
                mainCtx.lineTo(seg.p2.x, seg.p2.y);
                mainCtx.stroke();

                mainCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
                mainCtx.beginPath();
                mainCtx.arc(seg.p1.x, seg.p1.y, 3, 0, Math.PI * 2);
                mainCtx.arc(seg.p2.x, seg.p2.y, 3, 0, Math.PI * 2);
                mainCtx.fill();
            }

            // Draw Light Centers
            for (const light of lights) {
                mainCtx.fillStyle = `rgba(${light.color[0]}, ${light.color[1]}, ${light.color[2]}, 1)`;
                mainCtx.strokeStyle = "black";
                mainCtx.beginPath();
                mainCtx.arc(light.x, light.y, 5, 0, Math.PI * 2);
                mainCtx.fill();
                mainCtx.stroke();
            }
            mainCtx.restore(); // Restore camera offset so text stays on screen

            // Calculate Render Time (stop the clock before drawing the HUD)
            const renderDuration = performance.now() - renderStart;
            this.timings.render = (this.timings.render * 0.9) + (renderDuration * 0.1);
            this.counters.render++;

            // Calculate FPS
            const now = performance.now();
            const delta = now - this.lastRenderTime;
            if (delta > 0) {
                this.currentFps = (this.currentFps * 0.9) + ((1000 / delta) * 0.1);
            }
            this.lastRenderTime = now;

            // Lock in the calls-per-second (Hz) every 1000ms
            if (now - this.lastHzTime >= 1000) {
                this.hz.anim = this.counters.anim;
                this.hz.compute = this.counters.compute;
                this.hz.render = this.counters.render;
                this.counters = { anim: 0, compute: 0, render: 0 };
                this.lastHzTime = now;
            }

            // --- Draw Centered HUD ---
            const boxWidth = 240; // Widened for the new Hz text
            const boxHeight = 130; 
            const boxX = (width) - (boxWidth / 2); 
            const textX = boxX + 10;

            mainCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
            mainCtx.fillRect(boxX, 10, boxWidth, boxHeight);
            
            mainCtx.fillStyle = "#00ff00"; 
            mainCtx.font = "bold 14px monospace";
            mainCtx.textBaseline = "top";
            
            mainCtx.fillText(`FPS:     ${Math.round(this.currentFps)}`, textX, 20);
            mainCtx.fillText(`Segs:    ${this.segments.length}`, textX, 40);
            mainCtx.fillText(`Lights:  ${lights.length}`, textX, 60);
            
            mainCtx.fillStyle = this.timings.anim > 2 ? "#ff4444" : "#00ff00";
            mainCtx.fillText(`Anim:    ${this.timings.anim.toFixed(2)}ms (${this.hz.anim}Hz)`, textX, 85);
            
            mainCtx.fillStyle = this.timings.compute > 8 ? "#ff4444" : "#00ff00";
            mainCtx.fillText(`Compute: ${this.timings.compute.toFixed(2)}ms (${this.hz.compute}Hz)`, textX, 105);
            
            mainCtx.fillStyle = this.timings.render > 8 ? "#ff4444" : "#00ff00";
            mainCtx.fillText(`Render:  ${this.timings.render.toFixed(2)}ms (${this.hz.render}Hz)`, textX, 125);
        }
    }

    private drawLight(ctx: CanvasRenderingContext2D, light: Light, lightPolygon: Point[]) {
        ctx.save();
        
        // 1. Clip to the physical shadows
        ctx.beginPath();
        ctx.moveTo(lightPolygon[0].x, lightPolygon[0].y);
        for (let i = 1; i < lightPolygon.length; i++) {
            ctx.lineTo(lightPolygon[i].x, lightPolygon[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // 2. Clip to a directional cone (Flashlight)
        if (!!light.fov) {
            const angleDegrees = light.angle ?? 0
            const angleRadians = angleDegrees * (Math.PI / 180);
            const fovDegrees = light.fov ?? 60; 
            const fovRadians = fovDegrees * (Math.PI / 180); 
            
            ctx.beginPath();
            ctx.moveTo(light.x, light.y);
            ctx.arc(light.x, light.y, light.radius, angleRadians - fovRadians / 2, angleRadians + fovRadians / 2);
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

    private syncCanvasSizes(width: number, height: number) {
        if (this.lightCanvas.width !== width || this.lightCanvas.height !== height) {
            this.lightCanvas.width = width;
            this.lightCanvas.height = height;
            this.visionCanvas.width = width;
            this.visionCanvas.height = height;
        }
    }

    private optimizeSegments(segments: Segment[]): Segment[] {
        let merged = true;
        const result = [...segments];

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

    private getVisibilityPolygon(origin: { x: number, y: number, radius: number }): Point[] {
        const angles: Set<number> = new Set();
        const r = origin.radius;

        // 1. Define the Light's Bounding Box
        const minX = origin.x - r;
        const maxX = origin.x + r;
        const minY = origin.y - r;
        const maxY = origin.y + r;

        // 2. BROAD-PHASE CULLING (The CPU Saver)
        // Filter out any segments that are completely outside the light's reach
        const localSegments = this.segments.filter(seg => {
            // Fast AABB rejection: if both endpoints are strictly to one side of the box, reject it.
            if (seg.p1.x < minX && seg.p2.x < minX) return false; // Entirely to the left
            if (seg.p1.x > maxX && seg.p2.x > maxX) return false; // Entirely to the right
            if (seg.p1.y < minY && seg.p2.y < minY) return false; // Entirely above
            if (seg.p1.y > maxY && seg.p2.y > maxY) return false; // Entirely below
            
            return true; // The segment is close enough to matter!
        });

        // 3. Define the physical bounds of the light's radius
        const bounds: Segment[] = [
            { p1: { x: minX, y: minY }, p2: { x: maxX, y: minY } },
            { p1: { x: maxX, y: minY }, p2: { x: maxX, y: maxY } },
            { p1: { x: maxX, y: maxY }, p2: { x: minX, y: maxY } },
            { p1: { x: minX, y: maxY }, p2: { x: minX, y: minY } }
        ];

        // 4. Feed ONLY the local segments into the heavy math
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
        const r_px = origin.x, r_py = origin.y;
        const s_px = seg.p1.x, s_py = seg.p1.y;
        const s_dx = seg.p2.x - s_px, s_dy = seg.p2.y - s_py;

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
}