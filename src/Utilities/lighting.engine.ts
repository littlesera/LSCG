import { JobType, Light, OpaqueObstacle, PendingJob, Point, RenderOptions, Segment, Viewpoint } from "./lighting.types";
import { generateSegments, getVisibilityPolygon, optimizeSegments } from "./lighting.math";
import WorkerFactory from 'web-worker:./lighting.worker.ts';

export class LightingEngine {
    public debug: boolean = false;
    public suppressOptimization: boolean = false;
    public disableSpatialAnimations: boolean = false; 
    
    private lastRenderTime: number = 0;
    private currentFps: number = 0;
    private timings = { anim: 0, compute: 0, render: 0 };
    
    private lastHzTime: number = 0;
    private counters = { anim: 0, compute: 0, render: 0 };
    private hz = { anim: 0, compute: 0, render: 0 };

    private worker: Worker | null = null;
    private useFallback: boolean = false;
    private isWorkerBusy: boolean = false;
    private pendingJob: PendingJob | null = null;

    private lightIds = new WeakMap<Light, string>();

    // Raycast Caches (Now Dictionary-based using string IDs)
    private lightMaskCache: Record<string, Point[]> = {};
    private visionMaskCache: Point[] = [];

    private segments: Segment[] = [];

    private lightCanvas: HTMLCanvasElement;
    private lightCtx: CanvasRenderingContext2D;
    private visionCanvas: HTMLCanvasElement;
    private visionCtx: CanvasRenderingContext2D;

    constructor() {
        this.lightCanvas = document.createElement("canvas");
        this.lightCtx = this.lightCanvas.getContext("2d") as CanvasRenderingContext2D;
        
        this.visionCanvas = document.createElement("canvas");
        this.visionCtx = this.visionCanvas.getContext("2d") as CanvasRenderingContext2D;

        try {
            this.worker = new WorkerFactory();
            this.worker.onmessage = (e) => {
                if (e.data.type === "COMPUTE_DONE") {
                    this.lightMaskCache = e.data.payload.lightPolygons;
                    this.visionMaskCache = e.data.payload.visionPolygon;
                    this.segments = e.data.payload.segments; 
                    
                    if (this.pendingJob) {
                        const nextJob = this.pendingJob;
                        this.pendingJob = null; 
                        
                        // Pick the correct light array depending on the job type
                        const targetLights = nextJob.type === "COMPUTE" ? nextJob.lights : nextJob.movingLights!;
                        
                        this.sendToWorker(
                            nextJob.type, 
                            targetLights, 
                            nextJob.obstacles, 
                            nextJob.viewpoint
                        );
                    } else {
                        this.isWorkerBusy = false;
                    }
                }
            };
        } catch (error) {
            console.warn("LightingEngine: Web Worker blocked. Falling back to main thread.", error);
            this.useFallback = true;
        }
    }

    /**
     * Silently tags a Light with a unique string ID so the worker can track it
     */
    private getLightId(light: Light): string {
        let id = this.lightIds.get(light);
        if (!id) {
            id = light.id ?? `L_${Math.floor(light.x)}_${Math.floor(light.y)}_${Math.floor(light.radius)}_${light.color}`;
            this.lightIds.set(light, id);
        }
        return id;
    }

    public updateAnimations(lights: Light[], focus?: Point) {
        // ... (Your exact same updateAnimations logic remains untouched here) ...
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

            light.x = state.baseX;
            light.y = state.baseY;
            light.radius = state.baseRadius;
            light.color = [state.baseR, state.baseG, state.baseB, state.baseIntensity];

            switch (light.animType) {
                case "flashlight":
                    if (!!focus) {
                        light.angle = Math.atan2(focus.y - light.y, focus.x - light.x) * (180 / Math.PI);
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
                    const noise = (Math.sin(t * 4) + Math.sin(t * 5) + Math.cos(t * 7)) / 3; 
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
                    
                    const randColChance  = prng(37.719);
                    const randVal1       = prng(78.233);
                    const randVal2       = prng(93.411);

                    const colorGlitchChance = isUnstable ? 0.2 : 0.001;

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

    private sendToWorker(
        type: JobType, 
        lights: Light[], 
        obstacles?: OpaqueObstacle[], 
        viewpoint?: Viewpoint
    ) {
        const start = performance.now();
        let payload: any = { viewpoint, suppressOptimization: this.suppressOptimization };

        if (type === "COMPUTE") {
            payload.obstacles = obstacles;
            // Send full array with IDs
            payload.lights = lights.map(l => ({ 
                id: this.getLightId(l), x: l.x, y: l.y, radius: l.radius 
            }));
        } else if (type === "UPDATE_LIGHTS") {
            // Send just the updates with IDs
            payload.updates = lights.map(l => ({
                id: this.getLightId(l), x: l.x, y: l.y, radius: l.radius 
            }));
        }

        this.worker!.postMessage({ type, payload });

        const duration = performance.now() - start;
        this.timings.compute = (this.timings.compute * 0.9) + (duration * 0.1);
    }

    public compute(lights: Light[], obstacles: OpaqueObstacle[], viewpoint?: Viewpoint) {
        if (this.useFallback) {
            const start = performance.now();
            
            const raw = generateSegments(obstacles);
            this.segments = this.suppressOptimization ? raw : optimizeSegments(raw);

            // Rebuild cache as dictionary
            this.lightMaskCache = {};
            for (const light of lights) {
                this.lightMaskCache[this.getLightId(light)] = getVisibilityPolygon(light, this.segments);
            }
            this.visionMaskCache = viewpoint ? getVisibilityPolygon(viewpoint, this.segments) : [];

            const duration = performance.now() - start;
            this.timings.compute = (this.timings.compute * 0.9) + (duration * 0.1);
            return;
        }
        
        if (!this.worker) return;

        if (this.isWorkerBusy) {
            this.pendingJob = { type: "COMPUTE", lights, obstacles, viewpoint };
            return;
        }

        this.isWorkerBusy = true;
        this.sendToWorker("COMPUTE", lights, obstacles, viewpoint);
    }

    public updateLights(movingLights: Light[], viewpoint?: Viewpoint) {
        if (this.useFallback) {
            for (const light of movingLights) {
                this.lightMaskCache[this.getLightId(light)] = getVisibilityPolygon(light, this.segments);
            }
            if (viewpoint !== undefined) {
                this.visionMaskCache = viewpoint ? getVisibilityPolygon(viewpoint, this.segments) : [];
            }
            return;
        }

        if (!this.worker) return;

        if (this.isWorkerBusy) {
            if (this.pendingJob?.type === "COMPUTE") {
                this.pendingJob.viewpoint = viewpoint;
            } else if (this.pendingJob?.type === "UPDATE_LIGHTS") {
                // Merge new moving lights using a Set to avoid duplicates
                const merged = new Set(this.pendingJob.movingLights);
                for (const l of movingLights) merged.add(l);
                this.pendingJob.movingLights = Array.from(merged);
                this.pendingJob.viewpoint = viewpoint;
            } else {
                this.pendingJob = { 
                    type: "UPDATE_LIGHTS", lights: [], movingLights: [...movingLights], viewpoint 
                };
            }
            return;
        }

        this.isWorkerBusy = true;
        this.sendToWorker("UPDATE_LIGHTS", movingLights, undefined, viewpoint);
    }

    public render(options: RenderOptions) {
        const renderStart = performance.now();
        const {
            mainCtx, width, height, lights, viewpoint,
            ambientColor = "rgb(60, 60, 60)",
            camera = { x: 0, y: 0 }
        } = options;

        this.syncCanvasSizes(width, height);

        // --- 1. RENDER LIGHTING LAYER ---
        this.lightCtx.globalCompositeOperation = "copy";
        this.lightCtx.fillStyle = ambientColor;
        this.lightCtx.fillRect(0, 0, width, height);

        let normalLights: Light[] = [];
        let darkLights: Light[] = [];

        for (const light of lights) {
            const [r, g, b, a] = light.color;
            if (a > 0.01 && (r > 0 || g > 0 || b > 0))
                normalLights.push(light);
            else
                darkLights.push(light);
        }

        this.drawLights(this.lightCtx, darkLights, "darken", options);
        this.drawLights(this.lightCtx, normalLights, "lighten", options);

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

            for (const light of lights) {
                mainCtx.fillStyle = `rgba(${light.color[0]}, ${light.color[1]}, ${light.color[2]}, 1)`;
                mainCtx.strokeStyle = "black";
                mainCtx.beginPath();
                mainCtx.arc(light.x, light.y, 5, 0, Math.PI * 2);
                mainCtx.fill();
                mainCtx.stroke();
            }
            mainCtx.restore(); 

            const renderDuration = performance.now() - renderStart;
            this.timings.render = (this.timings.render * 0.9) + (renderDuration * 0.1);
            this.counters.render++;

            const now = performance.now();
            const delta = now - this.lastRenderTime;
            if (delta > 0) {
                this.currentFps = (this.currentFps * 0.9) + ((1000 / delta) * 0.1);
            }
            this.lastRenderTime = now;

            if (now - this.lastHzTime >= 1000) {
                this.hz.anim = this.counters.anim;
                this.hz.compute = this.counters.compute;
                this.hz.render = this.counters.render;
                this.counters = { anim: 0, compute: 0, render: 0 };
                this.lastHzTime = now;
            }

            const boxWidth = 240; 
            const boxHeight = 130; 
            const boxX = (width) - (boxWidth / 2); 
            const textX = boxX + 10;

            mainCtx.save();
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
            mainCtx.restore();
        }
    }

    private drawLights(ctx: CanvasRenderingContext2D, lights: Light[], composition: GlobalCompositeOperation, options: RenderOptions) {
        const camera = options.camera ?? {x: 0, y: 0};
        const width = options.width;
        const height = options.height;

        this.lightCtx.save();
        this.lightCtx.translate(-camera.x, -camera.y);
        this.lightCtx.globalCompositeOperation = composition;

        for (const light of lights) {
            if (
                light.x + light.radius < camera.x ||
                light.x - light.radius > camera.x + width ||
                light.y + light.radius < camera.y ||
                light.y - light.radius > camera.y + height
            ) continue; 

            // Look up by dictionary ID instead of array index
            const cachedPolygon = this.lightMaskCache[this.getLightId(light)];
            if (!cachedPolygon || cachedPolygon.length === 0) {
                continue;
            }

            this.drawLight(this.lightCtx, light, cachedPolygon);
        }
        this.lightCtx.restore();
    }

    private drawLight(ctx: CanvasRenderingContext2D, light: Light, lightPolygon: Point[]) {
        // ... (Your exact same drawLight logic remains untouched here) ...
        ctx.save();
        
        ctx.beginPath();
        ctx.moveTo(lightPolygon[0].x, lightPolygon[0].y);
        for (let i = 1; i < lightPolygon.length; i++) {
            ctx.lineTo(lightPolygon[i].x, lightPolygon[i].y);
        }
        ctx.closePath();
        ctx.clip();

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
}