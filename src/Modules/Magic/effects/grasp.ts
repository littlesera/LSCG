import { LSCGSpellEffect } from "Settings/Models/magic";
import { getCharacter, SendAction, settingsSave } from "utils";
import { getModule } from "modules";
import type { CollarModule } from "Modules/collar";
import type { LeashingModule } from "Modules/leashing";
import type { SpellEffectsState } from "Modules/States/SpellEffectsState";
import type { StateModule } from "Modules/states";
import { ConjureOption, ConjurePiece, ConjureSet, placePiece, unconjure } from "../conjure";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

export type GraspLocation = "neck" | "arms" | "legs" | "ass" | "breast";

export interface GraspConfig {
    Locations: GraspLocation[];
    /** The hand on the neck squeezes harder over time, until the target passes out, then takes hold again once they recover. */
    Tightens?: boolean;
}

/** Echo's Ghost Hand ("鬼手"), a spectral-hands restraint it adds to many slots. Worn when it is installed; a spell that finds no such asset
 *  works with its own effects instead. */
export const GHOST_HAND = "鬼手";

interface GraspDefinition {
    location: GraspLocation;
    label: string;
    /** The Ghost Hand pieces that stand for this grasp when Echo is installed, and the rung to put them at. */
    ghost: ConjureOption[];
    ghostRung?: number;
    /** What the hand does when it has no item to do it with. */
    restricts?: "Move" | "Walk";
    /** Squeezes now and then, sending a shiver of arousal. */
    teases?: boolean;
    /** The line when it takes hold. */
    grab: string;
    /** The line each time it squeezes, for the ones that do. */
    squeeze?: string;
}

export const GRASPS: GraspDefinition[] = [
    { location: "neck", label: "Neck", ghost: [{ group: "ItemNeckRestraints", asset: GHOST_HAND }], grab: "A spectral hand closes around %NAME%'s throat." },
    { location: "arms", label: "Arms", ghost: [{ group: "ItemArms", asset: GHOST_HAND, ladder: ["P1", "P2", "P3", "P4"] }], ghostRung: 2, restricts: "Move", grab: "Spectral hands seize %NAME%'s arms and pin them." },
    { location: "legs", label: "Legs", ghost: [{ group: "ItemLegs", asset: GHOST_HAND }, { group: "ItemFeet", asset: GHOST_HAND }], restricts: "Walk", grab: "Spectral hands clamp around %NAME%'s legs, holding them still." },
    { location: "ass", label: "Ass", ghost: [], teases: true, grab: "A spectral hand takes a firm grip of %NAME%'s ass.", squeeze: "%NAME% shivers as the spectral hand squeezes and kneads %POSSESSIVE% ass." },
    { location: "breast", label: "Breasts", ghost: [{ group: "ItemBreast", asset: GHOST_HAND }], teases: true, grab: "Spectral hands cup and squeeze %NAME%'s breasts.", squeeze: "%NAME% gasps as the spectral hands knead and squeeze %POSSESSIVE% breasts." },
];

export const GRASP_LOCATIONS: GraspLocation[] = GRASPS.map(g => g.location);

const graspOf = (location: GraspLocation) => GRASPS.find(g => g.location === location)!;

/** Only used to take pieces off again and to say so. */
const GRASP_SET: ConjureSet = {
    noun: "hands",
    options: [],
    messages: { bind: "", nothing: "", end: "" },
};

/** How often a teasing hand squeezes, and by how much it raises arousal. */
export const SQUEEZE_INTERVAL = 60_000;
export const SQUEEZE_AROUSAL = 5;

export function sanitizeGraspConfig(raw: unknown): GraspConfig {
    const { Locations, Tightens } = (raw && typeof raw === "object" ? raw : {}) as Partial<GraspConfig>;
    const chosen = Array.isArray(Locations) ? GRASP_LOCATIONS.filter(l => Locations.includes(l)) : [];
    const config: GraspConfig = { Locations: chosen.length > 0 ? chosen : ["arms"] };
    if (Tightens === true && config.Locations.includes("neck"))
        config.Tightens = true;
    return config;
}

interface GraspHold {
    location: GraspLocation;
    /** Held by Echo's Ghost Hand rather than by the spell's own effects. */
    ghost: boolean;
    /** When it last squeezed. */
    squeezed?: number;
    /** How many times the hand on the neck has squeezed harder, by a Tighten spell or by itself. */
    tightened?: number;
    /** The hand on the neck squeezes harder by itself, every SQUEEZE_INTERVAL. */
    tightens?: boolean;
}

interface GraspData {
    holds: GraspHold[];
    pieces: ConjurePiece[];
}

const asData = (entry: { data: unknown }) => entry.data as GraspData | null;

const collar = () => getModule<CollarModule>("CollarModule");

function startChoke(sender: Character | null, tightened = 0): void {
    if (!sender)
        return;
    if (!Player.LSCG?.MiscModule?.handChokeEnabled) {
        SendAction("The spectral hand rests on %NAME%'s throat, but cannot squeeze.");
        return;
    }
    for (let i = 0; i <= tightened; i++)
        collar()?.HandChoke(sender, true);
}

/** Has a spectral hand on the player's neck squeeze one step harder, as the Tighten spell does to restraints.
 *  Returns whether it did. */
export function tightenGrasp(state: SpellEffectsState): boolean {
    const collarModule = collar();
    if (!collarModule || !Player.LSCG?.MiscModule?.handChokeEnabled || collarModule.handChokeModifier >= 4)
        return false;
    for (const entry of state.EntriesFor(LSCGSpellEffect.grasp)) {
        const neck = asData(entry)?.holds.find(h => h.location === "neck");
        const caster = getCharacter(entry.by);
        if (!neck || !caster)
            continue;
        neck.tightened = (neck.tightened ?? 0) + 1;
        collarModule.HandChoke(caster, true);
        return true;
    }
    return false;
}

/** Has a spectral hand on the player's neck ease its grip by one step, as the Loosen spell does to restraints. It never lets go
 *  entirely: that takes ending the spell. Returns whether it did. */
export function loosenGrasp(state: SpellEffectsState): boolean {
    const neck = state.EntriesFor(LSCGSpellEffect.grasp).map(e => asData(e)?.holds.find(h => h.location === "neck")).find(h => !!h);
    if (!neck || !collar()?.LoosenHandChoke())
        return false;
    neck.tightened = Math.max(0, (neck.tightened ?? 0) - 1);
    SendAction("%NAME% gulps down air as the spectral hand eases its grip on %POSSESSIVE% throat.");
    return true;
}

/** Choked out, the hand on the neck is gone for good: collar.ts has already said it lets go. The spell keeps any other holds. */
export function releaseNeckGrasp(): void {
    const state = getModule<StateModule>("StateModule")?.SpellEffectsState;
    if (!state)
        return;
    const neckGroups = new Set(graspOf("neck").ghost.map(o => o.group));
    for (const entry of state.EntriesFor(LSCGSpellEffect.grasp)) {
        const data = asData(entry);
        if (!data?.holds.some(h => h.location === "neck"))
            continue;
        if (data.holds.length === 1) {
            state.End(entry, "manual");
            continue;
        }
        unconjure({ ...entry, data: { pieces: data.pieces.filter(p => neckGroups.has(p.group)) } }, "manual", GRASP_SET);
        data.pieces = data.pieces.filter(p => !neckGroups.has(p.group));
        data.holds = data.holds.filter(h => h.location !== "neck");
        settingsSave(true);
    }
}

/** Lets the throat go, unless a player's own hand is still on it. */
function stopChoke(): void {
    const held = getModule<LeashingModule>("LeashingModule")?.Pairings.some(p => p.Type === "neck" && !p.IsSource);
    if (!held)
        collar()?.ReleaseHandChoke(null, false);
}

/** A neck hold that tightens by itself: one step harder every SQUEEZE_INTERVAL, until it chokes them out and is gone
 *  (releaseNeckGrasp). If something else made it let go, it takes hold again. */
function tightenOverTime(entry: { by: number }, hold: GraspHold, now: number): void {
    const collarModule = collar();
    if (!collarModule || !Player.LSCG?.MiscModule?.handChokeEnabled)
        return;
    // Not while they are passing out, whatever is choking them
    if (collarModule.isPassingOut) {
        hold.squeezed = now;
        return;
    }
    if (now - (hold.squeezed ?? 0) < SQUEEZE_INTERVAL)
        return;
    const caster = getCharacter(entry.by);
    if (!caster)
        return;
    hold.squeezed = now;
    if (collarModule.handChokeModifier === 0) {
        hold.tightened = 0;
        SendAction("The spectral hand closes around %NAME%'s throat once more.");
    } else
        hold.tightened = (hold.tightened ?? 0) + 1;
    collarModule.HandChoke(caster, true);
}

export const GRASP_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.grasp,
    label: LSCGSpellEffect.grasp,
    description: "Seizes the target's neck, arms, legs, ass or breasts with spectral hands.",
    config: {
        defaults: (): GraspConfig => ({ Locations: ["arms"] }),
        sanitize: sanitizeGraspConfig,
        summary: (c: GraspConfig) => {
            const config = sanitizeGraspConfig(c);
            return `Grasps: ${config.Locations.map(l => graspOf(l).label.toLowerCase() + (l === "neck" && config.Tightens ? " (tightening)" : "")).join(", ")}`;
        },
    },
    apply: ctx => {
        const config = (ctx.config as GraspConfig | undefined) ?? sanitizeGraspConfig(undefined);
        const state = ctx.magic.stateModule.SpellEffectsState;
        const alreadyHeld = new Set(state.EntriesFor(ctx.effect).flatMap(e => asData(e)?.holds.map(h => h.location) ?? []));
        const holds: GraspHold[] = [];
        const pieces: ConjurePiece[] = [];
        // A hand already on the neck squeezes harder instead, as a Tighten spell makes it
        const squeezed = config.Locations.includes("neck") && alreadyHeld.has("neck") && tightenGrasp(state);

        for (const location of config.Locations.filter(l => !alreadyHeld.has(l))) {
            const grasp = graspOf(location);
            // With Echo installed the hand is an item; otherwise the spell's own effects hold the spot
            const ghostPieces = grasp.ghost
                .filter(option => !!AssetGet(Player.AssetFamily, option.group as AssetGroupName, option.asset))
                .map(option => placePiece(ctx, option, grasp.ghostRung ?? 0))
                .filter((p): p is ConjurePiece => !!p);
            pieces.push(...ghostPieces);
            const tightens = location === "neck" && !!config.Tightens;
            holds.push({ location, ghost: ghostPieces.length > 0, ...(grasp.teases || tightens ? { squeezed: Date.now() } : {}), ...(tightens ? { tightens } : {}) });
            SendAction(grasp.grab);
            if (location === "neck")
                startChoke(ctx.sender);
        }

        if (holds.length === 0) {
            if (!squeezed)
                SendAction("The spectral hands reach for %NAME%, but are already holding all they can.");
            return;
        }
        if (pieces.length > 0) {
            CharacterRefresh(Player, true, false);
            ChatRoomCharacterUpdate(Player);
        }
        state.Add(ctx, { holds, pieces } satisfies GraspData);
    },
    // What the hands do without an item to do it with
    restrictions: entry => {
        const restricted: Partial<Record<"Move" | "Walk", "true">> = {};
        for (const hold of asData(entry)?.holds ?? []) {
            const kind = hold.ghost ? undefined : graspOf(hold.location).restricts;
            if (kind) restricted[kind] = "true";
        }
        return restricted;
    },
    onTick: (entry, now) => {
        const data = asData(entry);
        if (!data)
            return;
        let squeezed = false;
        for (const hold of data.holds) {
            if (hold.tightens) {
                tightenOverTime(entry, hold, now);
                continue;
            }
            const grasp = graspOf(hold.location);
            if (!grasp.teases || !grasp.squeeze || now - (hold.squeezed ?? 0) < SQUEEZE_INTERVAL)
                continue;
            hold.squeezed = now;
            squeezed = true;
            SendAction(grasp.squeeze);
            ActivitySetArousal(Player, Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + SQUEEZE_AROUSAL));
        }
        if (squeezed)
            ChatRoomCharacterUpdate(Player); // arousal is shared
    },
    onEnd: (entry, reason) => {
        const data = asData(entry);
        if (!data)
            return;
        unconjure(entry, reason, GRASP_SET);
        if (data.holds.some(h => h.location === "neck"))
            stopChoke();
        if (reason !== "manual")
            SendAction("The spectral hands release %NAME%.");
    },
    onRoomSync: entry => {
        // Entering a room clears a hand choke (collar.ts does it on every room sync, after this), so put it back afterwards
        const neck = asData(entry)?.holds.find(h => h.location === "neck");
        if (neck)
            setTimeout(() => startChoke(getCharacter(entry.by) ?? null, neck.tightened), 500);
    },
};
