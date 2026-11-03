/**
 * Persistent screen effects drawn over the game canvas: a wavey distortion for the suggestible, and a slowly turning spiral for hypnosis.
 * Like pulseScreen they live in the DOM beside the canvas, so they never take clicks and leave the DOM settings screens (which sit
 * above) crisp. Each effect is set to an intensity from 0 to 1, and removed at 0; calling again with a new intensity updates it.
 */

const WAVE_FILTER_ID = "lscg-wave-filter";
const WAVE_MAX_SCALE = 28;
const SPIRAL_ID = "lscg-spiral-layer";
const SPIRAL_MAX_OPACITY = 0.55;
/** Seconds for one slow turn of the spiral. */
const SPIRAL_TURN_SECONDS = 60;
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

let spiral: HTMLDivElement | undefined;
let spiralAnimation: Animation | undefined;
let spiralColor = "";
let resizeListener: (() => void) | undefined;

/** An Archimedean spiral as an SVG path, centred in a 1000 x 1000 box. */
function spiralPath(turns = 7, steps = 420): string {
    const points: string[] = [];
    const maxRadius = 700;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * turns * Math.PI * 2;
        const r = t * maxRadius;
        points.push(`${i === 0 ? "M" : "L"}${(500 + r * Math.cos(angle)).toFixed(1)} ${(500 + r * Math.sin(angle)).toFixed(1)}`);
    }
    return points.join(" ");
}

function placeSpiral(el: HTMLElement): void {
    const canvas = canvasEl();
    if (canvas?.clientWidth)
        Object.assign(el.style, { left: `${canvas.offsetLeft}px`, top: `${canvas.offsetTop}px`, width: `${canvas.clientWidth}px`, height: `${canvas.clientHeight}px`, inset: "" });
    else
        Object.assign(el.style, { inset: "0", width: "", height: "" });
}

function buildSpiral(color: string): HTMLDivElement {
    const ns = "http://www.w3.org/2000/svg";
    const layer = document.createElement("div");
    layer.id = SPIRAL_ID;
    layer.className = "lscg-spiral";
    Object.assign(layer.style, { position: "fixed", pointerEvents: "none", zIndex: "9998", overflow: "hidden", opacity: "0", transition: "opacity 2s ease" });
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, { width: "100%", height: "100%", display: "block" });
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", spiralPath());
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "26");
    path.setAttribute("stroke-linecap", "round");
    svg.append(path);
    layer.append(svg);
    placeSpiral(layer);
    // Spin the artwork inside the fixed layer, so the layer's box stays put.
    if (!reducedMotion() && typeof svg.animate === "function")
        spiralAnimation = svg.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: SPIRAL_TURN_SECONDS * 1000, iterations: Infinity, easing: "linear" });
    return layer;
}

/** A slowly turning spiral over the game, in the hypno purple unless told otherwise. 0 fades it out and removes it. */
export function setSpiralEffect(intensity: number, color: string = HYPNO_SPIRAL_COLOR): void {
    const level = clamp01(intensity);
    if (level <= 0) {
        clearSpiralEffect();
        return;
    }
    if (spiral && spiralColor !== color) {
        clearSpiralEffect();
    }
    if (!spiral?.isConnected) {
        spiral = buildSpiral(color);
        spiralColor = color;
        document.body.append(spiral);
        resizeListener = () => spiral && placeSpiral(spiral);
        window.addEventListener("resize", resizeListener);
        // Start transparent and fade in on the next frame.
        requestAnimationFrame?.(() => { if (spiral) spiral.style.opacity = String(level * SPIRAL_MAX_OPACITY); });
    }
    spiral.style.opacity = String(level * SPIRAL_MAX_OPACITY);
}

export function clearSpiralEffect(): void {
    spiralAnimation?.cancel();
    spiralAnimation = undefined;
    if (resizeListener) {
        window.removeEventListener("resize", resizeListener);
        resizeListener = undefined;
    }
    spiral?.remove();
    spiral = undefined;
    spiralColor = "";
}

/** Removes every effect (for unload and the safeword). */
export function clearScreenEffects(): void {
    clearWaveEffect();
    clearSpiralEffect();
}
