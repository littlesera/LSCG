const PULSE_STEPS = 10;

/** How strong BC's own screen flash is with `remaining` ms left: its alpha out of 255, as a 0 to 1 opacity. */
function flashOpacity(intensity: number, remaining: number): number {
    return Math.max(0, Math.min(1, intensity * (1 - Math.exp(-remaining / 2500)) / 255));
}

/**
 * A screen pulse that fades out like BC's DrawFlashScreen (same colour, duration and intensity), but as a DOM element laid over the
 * game canvas, so it covers the DOM settings screens and their inputs too, which a canvas flash is drawn underneath.
 * It never takes clicks.
 */
export function pulseScreen(color: string, duration: number, intensity: number): void {
    const pulse = document.createElement("div");
    pulse.className = "lscg-pulse";
    // Over the canvas like the DOM screens are; the whole window if there is no canvas to measure.
    const canvas = typeof MainCanvas !== "undefined" ? MainCanvas?.canvas : undefined;
    Object.assign(pulse.style, {
        position: "fixed",
        pointerEvents: "none",
        zIndex: "9999",
        background: color,
        opacity: "0",
        ...(canvas?.clientWidth
            ? { left: `${canvas.offsetLeft}px`, top: `${canvas.offsetTop}px`, width: `${canvas.clientWidth}px`, height: `${canvas.clientHeight}px` }
            : { inset: "0" }),
    });
    document.body.append(pulse);

    const remove = () => pulse.remove();
    if (typeof pulse.animate === "function") {
        const frames = Array.from({ length: PULSE_STEPS + 1 }, (_, i) => ({
            offset: i / PULSE_STEPS,
            opacity: flashOpacity(intensity, duration * (1 - i / PULSE_STEPS)),
        }));
        pulse.animate(frames, { duration, easing: "linear", fill: "forwards" }).onfinish = remove;
    } else {
        pulse.style.opacity = String(flashOpacity(intensity, duration));
    }
    // Whatever happens to the animation, it doesn't outstay its welcome.
    setTimeout(remove, duration + 200);
}
