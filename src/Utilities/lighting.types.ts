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
    id: string;
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

export interface Segment {
    p1: Point;
    p2: Point;
}

export type JobType = "COMPUTE" | "UPDATE_LIGHTS";

export interface PendingJob {
    type: JobType;
    lights: Light[];         // Used for full COMPUTE
    movingLights?: Light[];  // Used for UPDATE_LIGHTS
    obstacles?: OpaqueObstacle[];
    viewpoint?: Viewpoint;
}