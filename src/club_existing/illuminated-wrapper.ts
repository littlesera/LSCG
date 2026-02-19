/**
 * TypeScript wrapper for illuminated.js
 * A 2D lights and shadows rendering engine for HTML5 applications
 * 
 * Usage: Use window.illuminated directly, or use the typed exports from this module
 */

// Import the JavaScript library - this will be bundled by Rollup
// Side-effect import ensures the IIFE in illuminated.js executes and sets window.illuminated
import "./illuminated.js";

// Type definitions for the illuminated.js library

export interface Vec2 {
  x: number;
  y: number;
  copy(): Vec2;
  dot(v: Vec2): number;
  sub(v: Vec2): Vec2;
  add(v: Vec2): Vec2;
  mul(n: number): Vec2;
  inv(): Vec2;
  dist2(v: Vec2): number;
  normalize(): Vec2;
  length2(): number;
  toString(): string;
  inBound(topleft: Vec2, bottomright: Vec2): boolean;
}

export interface Vec2Constructor {
  new(x?: number, y?: number): Vec2;
}

export interface Bounds {
  topleft: Vec2;
  bottomright: Vec2;
}

export interface LightOptions {
  position?: Vec2;
  distance?: number;
  diffuse?: number;
}

export interface Light {
  position: Vec2;
  distance: number;
  diffuse: number;
  render(ctx: CanvasRenderingContext2D): void;
  mask(ctx: CanvasRenderingContext2D): void;
  bounds(): Bounds;
  center(): Vec2;
  forEachSample(f: (position: Vec2) => void): void;
}

export interface LampOptions extends LightOptions {
  id?: number;
  color?: string;
  radius?: number;
  samples?: number;
  angle?: number;
  roughness?: number;
}

export interface Lamp extends Light {
  id: number;
  color: string;
  radius: number;
  samples: number;
  angle: number;
  roughness: number;
}

export interface LampConstructor {
  new(options?: LampOptions): Lamp;
}

export interface OpaqueObjectOptions {
  diffuse?: number;
}

export interface OpaqueObject {
  diffuse: number;
  cast(ctx: CanvasRenderingContext2D, origin: Vec2, bounds: Bounds): void;
  path(ctx: CanvasRenderingContext2D): void;
  bounds(): Bounds;
  contains(point: Vec2): boolean;
}

export interface DiscObjectOptions extends OpaqueObjectOptions {
  center?: Vec2;
  radius?: number;
}

export interface DiscObject extends OpaqueObject {
  center: Vec2;
  radius: number;
}

export interface DiscObjectConstructor {
  new(options?: DiscObjectOptions): DiscObject;
}

export interface PolygonObjectOptions extends OpaqueObjectOptions {
  points?: Vec2[];
}

export interface PolygonObject extends OpaqueObject {
  points: Vec2[];
}

export interface PolygonObjectConstructor {
  new(options?: PolygonObjectOptions): PolygonObject;
}

export interface RectangleObjectOptions extends OpaqueObjectOptions {
  topleft?: Vec2;
  bottomright?: Vec2;
}

export interface RectangleObject extends PolygonObject {
  topleft: Vec2;
  bottomright: Vec2;
  fill(ctx: CanvasRenderingContext2D): void;
  syncFromTopleftBottomright(): void;
}

export interface RectangleObjectConstructor {
  new(options?: RectangleObjectOptions): RectangleObject;
}

export interface LineObjectOptions extends OpaqueObjectOptions {
  a?: Vec2;
  b?: Vec2;
}

export interface LineObject extends PolygonObject {
  a: Vec2;
  b: Vec2;
  syncFromAB(): void;
}

export interface LineObjectConstructor {
  new(options?: LineObjectOptions): LineObject;
}

export interface LightingOptions {
  light?: Light;
  objects?: OpaqueObject[];
}

export interface Lighting {
  light: Light;
  objects: OpaqueObject[];
  cast(ctx: CanvasRenderingContext2D): void;
  compute(w: number, h: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  getCanvas(): HTMLCanvasElement;
}

export interface LightingConstructor {
  new(options?: LightingOptions): Lighting;
}

export interface DarkMaskOptions {
  lights?: Light[];
  color?: string;
}

export interface DarkMask {
  lights: Light[];
  color: string;
  compute(w: number, h: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  getCanvas(): HTMLCanvasElement;
}

export interface DarkMaskConstructor {
  new(options?: DarkMaskOptions): DarkMask;
}

export interface CanvasAndContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

export interface Illuminated {
  Vec2: Vec2Constructor;
  Light: any;
  Lamp: LampConstructor;
  OpaqueObject: any;
  DiscObject: DiscObjectConstructor;
  PolygonObject: PolygonObjectConstructor;
  RectangleObject: RectangleObjectConstructor;
  LineObject: LineObjectConstructor;
  Lighting: LightingConstructor;
  DarkMask: DarkMaskConstructor;
  
  // Utility functions
  createCanvasAnd2dContext(id: string, w: number, h: number): CanvasAndContext;
  path(ctx: CanvasRenderingContext2D, points: Vec2[], dontJoinLast?: boolean): void;
  getRGBA(color: string, alpha: number): string;
  extractColorAndAlpha(color: string): { color: string; alpha: number };
  extend(extending: any, ...sources: any[]): void;
  inherit(cls: any, base: any): void;
}

// Extend the global Window interface
declare global {
  interface Window {
    illuminated: Illuminated;
  }
}

// NOTE: The illuminated.js library creates a global window.illuminated object
// After the IIFE in illuminated.js executes, window.illuminated will be available

// Create wrapper constructors that lazily access the real constructors at runtime
// This ensures window.illuminated is accessed when the constructor is called, not during module initialization

export const Vec2 = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealVec2 = (window as any).illuminated?.Vec2;
    if (!RealVec2) throw new Error('illuminated.js not loaded');
    return new RealVec2(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.Vec2?.[prop];
  }
}) as Vec2Constructor;

export const Lamp = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealLamp = (window as any).illuminated?.Lamp;
    if (!RealLamp) throw new Error('illuminated.js not loaded');
    return new RealLamp(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.Lamp?.[prop];
  }
}) as LampConstructor;

export const DiscObject = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealDiscObject = (window as any).illuminated?.DiscObject;
    if (!RealDiscObject) throw new Error('illuminated.js not loaded');
    return new RealDiscObject(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.DiscObject?.[prop];
  }
}) as DiscObjectConstructor;

export const PolygonObject = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealPolygonObject = (window as any).illuminated?.PolygonObject;
    if (!RealPolygonObject) throw new Error('illuminated.js not loaded');
    return new RealPolygonObject(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.PolygonObject?.[prop];
  }
}) as PolygonObjectConstructor;

export const RectangleObject = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealRectangleObject = (window as any).illuminated?.RectangleObject;
    if (!RealRectangleObject) throw new Error('illuminated.js not loaded');
    return new RealRectangleObject(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.RectangleObject?.[prop];
  }
}) as RectangleObjectConstructor;

export const LineObject = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealLineObject = (window as any).illuminated?.LineObject;
    if (!RealLineObject) throw new Error('illuminated.js not loaded');
    return new RealLineObject(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.LineObject?.[prop];
  }
}) as LineObjectConstructor;

export const Lighting = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealLighting = (window as any).illuminated?.Lighting;
    if (!RealLighting) throw new Error('illuminated.js not loaded');
    return new RealLighting(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.Lighting?.[prop];
  }
}) as LightingConstructor;

export const DarkMask = new Proxy(class {} as any, {
  construct(_target, args) {
    const RealDarkMask = (window as any).illuminated?.DarkMask;
    if (!RealDarkMask) throw new Error('illuminated.js not loaded');
    return new RealDarkMask(...args);
  },
  get(_target, prop) {
    return (window as any).illuminated?.DarkMask?.[prop];
  }
}) as DarkMaskConstructor;

// Export the full namespace as a proxy too
export const illuminated = new Proxy({} as Illuminated, {
  get(_target, prop) {
    const lib = (window as any).illuminated;
    if (!lib) throw new Error('illuminated.js not loaded');
    return lib[prop];
  }
});
