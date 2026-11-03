/**
 * Persistent screen effects: a wavey distortion for the suggestible (an SVG filter on the game canvas, so the DOM settings screens above
 * it stay crisp) and a slowly turning spiral for hypnosis (painted onto the canvas itself, over the room). Each effect is set to an
 * intensity from 0 to 1, and removed at 0; calling again with a new intensity updates it.
 */
import { SPIRAL_TURN_SECONDS } from "../constants/game-balance";

const WAVE_FILTER_ID = "lscg-wave-filter";
const WAVE_MAX_SCALE = 28;
/** Strong enough at full effect that the lines read clearly, while still tinting the room rather than covering it. */
const SPIRAL_MAX_OPACITY = 0.65;
export const HYPNO_SPIRAL_COLOR = "#A020F0";

function canvasEl(): HTMLCanvasElement | undefined {
    return typeof MainCanvas !== "undefined" ? MainCanvas?.canvas : undefined;
}

function reducedMotion(): boolean {
    try {
        return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
}

function clamp01(n: number): number {
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

// ---- Wave ----

let waveSvg: SVGSVGElement | undefined;
let waveCanvas: HTMLCanvasElement | undefined;
let waveFilterBefore = "";

function ensureWaveFilter(): SVGSVGElement {
    if (waveSvg?.isConnected)
        return waveSvg;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, { position: "absolute", pointerEvents: "none" });
    const filter = document.createElementNS(ns, "filter");
    filter.setAttribute("id", WAVE_FILTER_ID);
    filter.setAttribute("x", "-5%");
    filter.setAttribute("y", "-5%");
    filter.setAttribute("width", "110%");
    filter.setAttribute("height", "110%");
    const turbulence = document.createElementNS(ns, "feTurbulence");
    turbulence.setAttribute("type", "fractalNoise");
    turbulence.setAttribute("baseFrequency", "0.008 0.012");
    turbulence.setAttribute("numOctaves", "1");
    turbulence.setAttribute("seed", "3");
    turbulence.setAttribute("result", "noise");
    if (!reducedMotion()) {
        // Slowly drift the noise so the picture sways rather than sitting still, warped.
        const drift = document.createElementNS(ns, "animate");
        drift.setAttribute("attributeName", "baseFrequency");
        drift.setAttribute("dur", "16s");
        drift.setAttribute("values", "0.008 0.012;0.013 0.007;0.008 0.012");
        drift.setAttribute("repeatCount", "indefinite");
        turbulence.append(drift);
    }
    const displace = document.createElementNS(ns, "feDisplacementMap");
    displace.setAttribute("in", "SourceGraphic");
    displace.setAttribute("in2", "noise");
    displace.setAttribute("scale", "0");
    displace.setAttribute("xChannelSelector", "R");
    displace.setAttribute("yChannelSelector", "G");
    filter.append(turbulence, displace);
    svg.append(filter);
    document.body.append(svg);
    waveSvg = svg;
    return svg;
}

/** Warps the game canvas like a drunken sway. 0 removes it. */
export function setWaveEffect(intensity: number): void {
    const level = clamp01(intensity);
    const canvas = canvasEl();
    if (level <= 0 || !canvas) {
        clearWaveEffect();
        return;
    }
    // A different canvas than last time (the game was reloaded): put the old one back before taking over the new one.
    if (waveCanvas !== canvas) {
        clearWaveEffect();
        waveCanvas = canvas;
        waveFilterBefore = canvas.style.filter;
    }
    const svg = ensureWaveFilter();
    svg.querySelector("feDisplacementMap")?.setAttribute("scale", String(Math.round(level * WAVE_MAX_SCALE * 10) / 10));
    // Keep whatever filter the page had, and add ours.
    canvas.style.filter = `${waveFilterBefore} url(#${WAVE_FILTER_ID})`.trim();
}

export function clearWaveEffect(): void {
    if (waveCanvas) {
        waveCanvas.style.filter = waveFilterBefore;
        waveCanvas = undefined;
        waveFilterBefore = "";
    }
    waveSvg?.remove();
    waveSvg = undefined;
}

// ---- Spiral ----
// Painted straight onto BC's canvas from its own draw loop (see drawSpiralOverlay), clipped to the room view, so it always sits exactly
// over the room, scales and moves with it, and never touches the DOM or the chat log beside it.

/** How fast the spiral fades in and out, as fractions of full strength per second. */
const SPIRAL_FADE_PER_SECOND = 0.5;
/** How soft the spiral's edges are, in pixels of its artwork (which is drawn at about screen size). */
const SPIRAL_EDGE_BLUR = 2;
/** The spiral's artwork is drawn once at this size, then only rotated and scaled. */
const SPIRAL_SPRITE_SIZE = 1400;

const spiralState = { target: 0, alpha: 0, color: HYPNO_SPIRAL_COLOR, lastDraw: 0, angle: 0, turnSeconds: SPIRAL_TURN_SECONDS.DEFAULT as number };
let spiralSprite: HTMLCanvasElement | undefined;
let spriteColor = "";
let spriteSoft = false;

/** The strength the spiral is heading for, 0 to 1 (0 once it is cleared). For tests and to know whether anything is drawn. */
export function spiralTarget(): number {
    return spiralState.target;
}

/** How strong the spiral is right now, 0 to 1: it eases toward the target. */
export function spiralAlpha(): number {
    return spiralState.alpha;
}

/** The classic hypnosis spiral, filled once onto an offscreen canvas: a logarithmic spiral, so each turn is a fixed multiple wider than
 *  the one inside it. The bands and the gaps between them are equal (in that ratio) and grow outward, and the winding gets so tight toward
 *  the middle that it collapses to a point with no visible curl, like a hypnotist's cartoon pinwheel. Null where canvas drawing isn't
 *  available. */
function buildSpiralSprite(color: string, soft: boolean): HTMLCanvasElement | undefined {
    const sprite = document.createElement("canvas");
    sprite.width = SPIRAL_SPRITE_SIZE;
    sprite.height = SPIRAL_SPRITE_SIZE;
    const ctx = sprite.getContext("2d");
    if (!ctx)
        return undefined;
    const centre = SPIRAL_SPRITE_SIZE / 2;
    // Each full turn is this many times wider than the last.
    const growthPerTurn = 1.9;
    const k = Math.log(growthPerTurn) / (Math.PI * 2);
    // Wind inward until the arm is under half a pixel wide: it vanishes into the middle.
    const innermost = 0.4;
    const maxAngle = Math.log(centre / innermost) / k;
    const steps = Math.ceil(maxAngle / 0.02);
    // The band is half a turn's growth wide, the gap the other half.
    const bandRatio = Math.exp(Math.PI * k);
    const radiusAt = (angle: number) => centre * Math.exp(-k * (maxAngle - angle));
    const inner: [number, number][] = [];
    const outer: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * maxAngle;
        const r = radiusAt(angle);
        inner.push([centre + r * Math.cos(angle), centre + r * Math.sin(angle)]);
        outer.push([centre + r * bandRatio * Math.cos(angle), centre + r * bandRatio * Math.sin(angle)]);
    }
    ctx.fillStyle = color;
    // Soft edges, blurred into the artwork once rather than on every frame, and only where the player's BC preferences allow blur.
    // (Browsers without canvas filters keep crisp edges.)
    if (soft && "filter" in ctx)
        ctx.filter = `blur(${SPIRAL_EDGE_BLUR}px)`;
    ctx.beginPath();
    outer.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    for (let i = inner.length - 1; i >= 0; i--)
        ctx.lineTo(inner[i][0], inner[i][1]);
    ctx.closePath();
    ctx.fill();
    return sprite;
}

/** The room view in canvas units: BC's own rectangle when it says what it is, else the left half of the 2000 x 1000 canvas. */
function roomViewSize(): { width: number; height: number } {
    return {
        width: typeof ChatRoomCharacterViewWidth === "number" && ChatRoomCharacterViewWidth > 0 ? ChatRoomCharacterViewWidth : 1000,
        height: typeof ChatRoomCharacterViewHeight === "number" && ChatRoomCharacterViewHeight > 0 ? ChatRoomCharacterViewHeight : 1000,
    };
}

/**
 * Draws the spiral over the room. Call it from a BC draw hook after the room and characters are drawn (the injector does, from
 * ChatRoomRun). It eases toward the strength last set, turns slowly, and draws nothing once it has faded out.
 */
export function drawSpiralOverlay(now: number = Date.now()): void {
    const dt = spiralState.lastDraw ? Math.min(0.25, Math.max(0, (now - spiralState.lastDraw) / 1000)) : 0;
    spiralState.lastDraw = now;
    const step = SPIRAL_FADE_PER_SECOND * dt;
    if (spiralState.alpha < spiralState.target)
        spiralState.alpha = Math.min(spiralState.target, spiralState.alpha + step);
    else if (spiralState.alpha > spiralState.target)
        spiralState.alpha = Math.max(spiralState.target, spiralState.alpha - step);
    if (spiralState.alpha <= 0.001) {
        spiralState.alpha = 0;
        spiralState.lastDraw = spiralState.target > 0 ? now : 0;
        return;
    }
    if (typeof MainCanvas === "undefined" || !MainCanvas)
        return;
    // Redrawn if the colour changes, or the player turns BC's blur on or off.
    const soft = !!Player?.GraphicsSettings?.AllowBlur;
    if (!spiralSprite || spriteColor !== spiralState.color || spriteSoft !== soft) {
        spiralSprite = buildSpiralSprite(spiralState.color, soft);
        spriteColor = spiralState.color;
        spriteSoft = soft;
    }
    if (!spiralSprite)
        return;

    const { width, height } = roomViewSize();
    const size = Math.hypot(width, height); // the spiral's reach covers the room's corners
    // Turn by how long this frame took, so changing the speed doesn't make the spiral jump. (Not held still for prefers-reduced-motion:
    // the overlay is opt-in with its own on/off and speed settings, and a spiral that doesn't turn isn't what was asked for.)
    spiralState.angle = (spiralState.angle + dt / spiralState.turnSeconds * Math.PI * 2) % (Math.PI * 2);
    const turn = spiralState.angle;
    MainCanvas.save();
    try {
        MainCanvas.beginPath();
        MainCanvas.rect(0, 0, width, height);
        MainCanvas.clip();
        MainCanvas.globalAlpha = spiralState.alpha * SPIRAL_MAX_OPACITY;
        // Overlay deepens the room's own light and dark under the lines, so they read clearly without a flat painted-on look.
        MainCanvas.globalCompositeOperation = "overlay";
        MainCanvas.translate(width / 2, height / 2);
        MainCanvas.rotate(-turn); // counter-clockwise, so the arm appears to draw inward
        MainCanvas.drawImage(spiralSprite, -size / 2, -size / 2, size, size);
    } finally {
        MainCanvas.restore();
    }
}

/** A turning spiral over the room, in the hypno purple unless told otherwise, making one turn every `turnSeconds`. It fades in and
 *  out; 0 fades it out. */
export function setSpiralEffect(intensity: number, color: string = HYPNO_SPIRAL_COLOR, turnSeconds: number = SPIRAL_TURN_SECONDS.DEFAULT): void {
    spiralState.target = clamp01(intensity);
    spiralState.turnSeconds = Number.isFinite(turnSeconds) ? Math.min(SPIRAL_TURN_SECONDS.MAX, Math.max(SPIRAL_TURN_SECONDS.MIN, turnSeconds)) : SPIRAL_TURN_SECONDS.DEFAULT;
    if (spiralState.target > 0)
        spiralState.color = color;
}

/** Fades the spiral out and forgets it. */
export function clearSpiralEffect(): void {
    spiralState.target = 0;
}

/** Removes every effect (for unload and the safeword). The spiral is dropped at once rather than faded, since nothing will draw it again. */
export function clearScreenEffects(): void {
    clearWaveEffect();
    spiralState.target = 0;
    spiralState.alpha = 0;
    spiralState.lastDraw = 0;
    spiralState.angle = 0;
    spiralSprite = undefined;
    spriteColor = "";
    spriteSoft = false;
}
