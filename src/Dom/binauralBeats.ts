// A binaural beat generator: one pure tone in each ear, a few hertz apart. Only the audio; when to play, and how loud, is up to the caller.
// Needs headphones to work as intended. Browsers keep an AudioContext suspended until the page has seen a user gesture, so
// starting resumes it, and a first click or key press later does too.
import { BINAURAL_BEATS } from "../constants/game-balance";

export interface BinauralStartOptions {
    /** Beat (Hz) to start at. */
    fromHz: number;
    /** Beat (Hz) to glide to and hold. Defaults to `fromHz`. */
    toHz?: number;
    /** Seconds the glide from `fromHz` to `toHz` takes. */
    glideSeconds?: number;
    /** Gain to fade up to (0 to 1). */
    gain: number;
    /** Seconds to fade in over. */
    fadeInSeconds?: number;
    carrierHz?: number;
}

export interface BinauralInfo {
    playing: boolean;
    /** The beat it is heading for (or holding), in Hz. 0 while silent. */
    beatHz: number;
    carrierHz: number;
    /** Gain it is heading for (or holding), 0 to 1. 0 while silent. */
    gain: number;
}

interface Session {
    context: AudioContext;
    left: OscillatorNode;
    right: OscillatorNode;
    master: GainNode;
    carrierHz: number;
    beatHz: number;
    gain: number;
}

let session: Session | undefined;
let gestureHooked = false;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const clampBeat = (hz: number) => clamp(hz, BINAURAL_BEATS.MIN_BEAT_HZ, BINAURAL_BEATS.MAX_BEAT_HZ);

function audioContextClass(): typeof AudioContext | undefined {
    const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    return g.AudioContext ?? g.webkitAudioContext;
}

/** Whether this browser can play it at all. */
export function binauralSupported(): boolean {
    return !!audioContextClass();
}

function resumeIfSuspended(context: AudioContext): void {
    if (context.state === "suspended")
        context.resume?.().catch(() => { /* needs a user gesture; the hook below retries on the next one */ });
}

function hookGesture(): void {
    if (gestureHooked || typeof window === "undefined") return;
    gestureHooked = true;
    const retry = () => {
        window.removeEventListener("pointerdown", retry, true);
        window.removeEventListener("keydown", retry, true);
        gestureHooked = false;
        if (session) resumeIfSuspended(session.context);
    };
    window.addEventListener("pointerdown", retry, true);
    window.addEventListener("keydown", retry, true);
}

/** Two tones centred on the carrier keep the perceived pitch steady while the beat changes. */
function setTones(s: Session, beatHz: number, atTime: number, glideSeconds: number): void {
    const left = s.carrierHz - beatHz / 2;
    const right = s.carrierHz + beatHz / 2;
    for (const [osc, hz] of [[s.left, left], [s.right, right]] as const) {
        const param = osc.frequency;
        param.cancelScheduledValues(atTime);
        param.setValueAtTime(param.value, atTime);
        if (glideSeconds > 0)
            param.linearRampToValueAtTime(hz, atTime + glideSeconds);
        else
            param.setValueAtTime(hz, atTime);
    }
}

/** Starts the beat, fading in. Does nothing if it is already playing (use the setters to change it). Returns false if it can't play. */
export function startBinaural(options: BinauralStartOptions): boolean {
    if (session) return true;
    const Context = audioContextClass();
    if (!Context) return false;
    let context: AudioContext;
    try {
        context = new Context();
    } catch {
        return false;
    }
    const carrierHz = options.carrierHz ?? BINAURAL_BEATS.CARRIER_HZ;
    const fromHz = clampBeat(options.fromHz);
    const toHz = clampBeat(options.toHz ?? fromHz);
    const gain = clamp(options.gain, 0, 1);

    const merger = context.createChannelMerger(2);
    const master = context.createGain();
    const left = context.createOscillator();
    const right = context.createOscillator();
    left.connect(merger, 0, 0);
    right.connect(merger, 0, 1);
    merger.connect(master);
    master.connect(context.destination);

    const s: Session = { context, left, right, master, carrierHz, beatHz: toHz, gain };
    const now = context.currentTime;
    left.frequency.setValueAtTime(carrierHz - fromHz / 2, now);
    right.frequency.setValueAtTime(carrierHz + fromHz / 2, now);
    const glide = Math.max(0, options.glideSeconds ?? 0);
    if (toHz !== fromHz) setTones(s, toHz, now, glide);

    const fade = Math.max(0, options.fadeInSeconds ?? BINAURAL_BEATS.FADE_IN_SECONDS);
    master.gain.setValueAtTime(0, now);
    if (fade > 0)
        master.gain.linearRampToValueAtTime(gain, now + fade);
    else
        master.gain.setValueAtTime(gain, now);

    left.start(now);
    right.start(now);
    session = s;
    resumeIfSuspended(context);
    hookGesture();
    return true;
}

/** Fades the beat out (over `fadeSeconds`, a minimum of a hundredth of a second to avoid a click), then frees the audio device. It counts as stopped straight away. */
export function stopBinaural(fadeSeconds: number = BINAURAL_BEATS.FADE_OUT_SECONDS): void {
    const s = session;
    if (!s) return;
    session = undefined;
    const { context, master, left, right } = s;
    const now = context.currentTime;
    const off = clamp(fadeSeconds, 0.01, BINAURAL_BEATS.MAX_FADE_SECONDS);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + off);
    try { left.stop(now + off + 0.01); right.stop(now + off + 0.01); } catch { /* already stopped */ }
    setTimeout(() => { context.close?.().catch(() => { /* already closed */ }); }, Math.ceil((off + 0.1) * 1000));
}

/** Moves the volume (0 to 1) to a new level without a click. */
export function setBinauralGain(gain: number, seconds: number = BINAURAL_BEATS.VOLUME_CHANGE_SECONDS): void {
    if (!session) return;
    const target = clamp(gain, 0, 1);
    const now = session.context.currentTime;
    const param = session.master.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(target, now + Math.max(0.01, seconds));
    session.gain = target;
}

/** Glides to a new beat (Hz), from wherever it is now. */
export function setBinauralBeat(hz: number, seconds: number = BINAURAL_BEATS.BEAT_CHANGE_SECONDS): void {
    if (!session) return;
    const beat = clampBeat(hz);
    setTones(session, beat, session.context.currentTime, Math.max(0, seconds));
    session.beatHz = beat;
}

export function binauralInfo(): BinauralInfo {
    return session
        ? { playing: true, beatHz: session.beatHz, carrierHz: session.carrierHz, gain: session.gain }
        : { playing: false, beatHz: 0, carrierHz: BINAURAL_BEATS.CARRIER_HZ, gain: 0 };
}
