export interface Point {
    x: number;
    y: number;
}

export interface Viewpoint extends Point {
    radius: number; 
}

export interface Light extends Point {
    radius: number;
    r: number; 
    g: number; 
    b: number; 
    intensity: number; 
}

export type Polygon = Point[];

interface Segment {
    p1: Point;
    p2: Point;
}

export class LightingEngine {
    private polygons: Polygon[] = [];
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

    public setObstacles(polygons: Polygon[]) {
        this.polygons = polygons;
        this.segments = [];
        
        for (const poly of polygons) {
            for (let i = 0; i < poly.length; i++) {
                this.segments.push({
                    p1: poly[i],
                    p2: poly[(i + 1) % poly.length]
                });
            }
        }
    }

    /**
     * Ensures offscreen canvases match the main canvas size.
     */
    private syncCanvasSizes(width: number, height: number) {
        if (this.lightCanvas.width !== width || this.lightCanvas.height !== height) {
            this.lightCanvas.width = width;
            this.lightCanvas.height = height;
            this.visionCanvas.width = width;
            this.visionCanvas.height = height;
        }
    }

    public render(
        mainCtx: CanvasRenderingContext2D,
        width: number,
        height: number,
        lights: Light[],
        viewpoint?: Viewpoint,
        ambientColor: string = "rgb(20, 20, 20)" // Use RGB without alpha for Multiply blending
    ) {
        this.syncCanvasSizes(width, height);

        // --- 1. RENDER LIGHTING LAYER ---
        // Clear and fill with ambient darkness
        this.lightCtx.globalCompositeOperation = "source-over";
        this.lightCtx.fillStyle = ambientColor;
        this.lightCtx.fillRect(0, 0, width, height);

        // Draw Point Lights
        this.lightCtx.globalCompositeOperation = "lighter";
        for (const light of lights) {
            this.drawLight(this.lightCtx, light);
        }

        // --- 2. RENDER VISION MASK LAYER ---
        // Fill entirely with black Fog of War
        if (!!viewpoint) {
            this.visionCtx.globalCompositeOperation = "source-over";
            this.visionCtx.fillStyle = "black";
            this.visionCtx.fillRect(0, 0, width, height);

            // Punch out the vision polygon
            const visionPolygon = this.getVisibilityPolygon(viewpoint);
            if (visionPolygon.length > 0) {
                this.visionCtx.globalCompositeOperation = "destination-out";
                this.visionCtx.beginPath();
                this.visionCtx.moveTo(visionPolygon[0].x, visionPolygon[0].y);
                for (let i = 1; i < visionPolygon.length; i++) {
                    this.visionCtx.lineTo(visionPolygon[i].x, visionPolygon[i].y);
                }
                this.visionCtx.closePath();
                this.visionCtx.fillStyle = "white"; // Color doesn't matter, just punches alpha to 0
                this.visionCtx.fill();
            }
        }

        // --- 3. COMPOSITE ONTO MAIN CANVAS ---
        mainCtx.save();

        // Multiply the light layer to tint/darken the game world
        mainCtx.globalCompositeOperation = "multiply";
        mainCtx.drawImage(this.lightCanvas, 0, 0);

        // Draw the pitch-black vision mask over everything to hide unseen areas
        if (!!viewpoint) {
            mainCtx.globalCompositeOperation = "source-over";
            mainCtx.globalAlpha = 0.5; // Adjust this for stronger/weaker fog effect
            mainCtx.drawImage(this.visionCanvas, 0, 0);
        }

        mainCtx.restore();
    }

    private drawLight(ctx: CanvasRenderingContext2D, light: Light) {
        const lightPolygon = this.getVisibilityPolygon({ 
            x: light.x, y: light.y, radius: light.radius 
        });

        if (lightPolygon.length === 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lightPolygon[0].x, lightPolygon[0].y);
        for (let i = 1; i < lightPolygon.length; i++) {
            ctx.lineTo(lightPolygon[i].x, lightPolygon[i].y);
        }
        ctx.closePath();
        ctx.clip();

        const gradient = ctx.createRadialGradient(
            light.x, light.y, 0,
            light.x, light.y, light.radius
        );

        const { r, g, b, intensity } = light;
        
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
}