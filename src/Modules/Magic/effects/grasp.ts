import { LSCGSpellEffect } from "Settings/Models/magic";
import { getCharacter, SendAction } from "utils";
import { getModule } from "modules";
import type { CollarModule } from "Modules/collar";
import type { LeashingModule } from "Modules/leashing";
import { ConjureOption, ConjurePiece, ConjureSet, placePiece, unconjure } from "../conjure";
// Type-only: spellEffects.ts imports builtinEffects.ts, which imports this file.
import type { SpellEffectDefinition } from "../spellEffects";

export type GraspLocation = "neck" | "arms" | "legs" | "ass" | "breast";

export interface GraspConfig {
    Locations: GraspLocation[];
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
    { location: "neck", label: "Neck", ghost: [{ group: "ItemNeckRestraints", asset: GHOST_HAND }], grab: "A spectral hand closes around %NAME%'s throat!" },
    { location: "arms", label: "Arms", ghost: [{ group: "ItemArms", asset: GHOST_HAND, ladder: ["P1", "P2", "P3", "P4"] }], ghostRung: 2, restricts: "Move", grab: "Spectral hands seize %NAME%'s arms and pin them!" },
    { location: "legs", label: "Legs", ghost: [{ group: "ItemLegs", asset: GHOST_HAND }, { group: "ItemFeet", asset: GHOST_HAND }], restricts: "Walk", grab: "Spectral hands clamp around %NAME%'s legs, holding them still!" },
    { location: "ass", label: "Ass", ghost: [], teases: true, grab: "A spectral hand takes a firm grip of %NAME%'s ass!", squeeze: "%NAME% shivers as the spectral hand squeezes and kneads %POSSESSIVE% ass." },
    { location: "breast", label: "Breasts", ghost: [{ group: "ItemBreast", asset: GHOST_HAND }], teases: true, grab: "Spectral hands cup and squeeze %NAME%'s breasts!", squeeze: "%NAME% gasps as the spectral hands knead and squeeze %POSSESSIVE% breasts." },
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
    const { Locations } = (raw && typeof raw === "object" ? raw : {}) as Partial<GraspConfig>;
    const chosen = Array.isArray(Locations) ? GRASP_LOCATIONS.filter(l => Locations.includes(l)) : [];
    return { Locations: chosen.length > 0 ? chosen : ["arms"] };
}

interface GraspHold {
    location: GraspLocation;
    /** Held by Echo's Ghost Hand rather than by the spell's own effects. */
    ghost: boolean;
    /** When it last squeezed. */
    squeezed?: number;
}

interface GraspData {
    holds: GraspHold[];
    pieces: ConjurePiece[];
}

const asData = (entry: { data: unknown }) => entry.data as GraspData | null;

const collar = () => getModule<CollarModule>("CollarModule");

function startChoke(sender: Character | null): void {
    if (!sender)
        return;
    if (!Player.LSCG?.MiscModule?.handChokeEnabled) {
        SendAction("The spectral hand rests on %NAME%'s throat, but cannot squeeze.");
        return;
    }
    collar()?.HandChoke(sender);
}

/** Lets the throat go, unless a player's own hand is still on it. */
function stopChoke(): void {
    const held = getModule<LeashingModule>("LeashingModule")?.Pairings.some(p => p.Type === "neck" && !p.IsSource);
    if (!held)
        collar()?.ReleaseHandChoke(null, false);
}

export const GRASP_EFFECT: SpellEffectDefinition = {
    id: LSCGSpellEffect.grasp,
    label: LSCGSpellEffect.grasp,
    description: "Spectral hands seize the target's neck, arms, legs, ass or breasts.",
    config: {
        defaults: (): GraspConfig => ({ Locations: ["arms"] }),
        sanitize: sanitizeGraspConfig,
        summary: (c: GraspConfig) => `Grasps: ${sanitizeGraspConfig(c).Locations.map(l => graspOf(l).label.toLowerCase()).join(", ")}`,
    },
    apply: ctx => {
        const config = (ctx.config as GraspConfig | undefined) ?? sanitizeGraspConfig(undefined);
        const state = ctx.magic.stateModule.SpellEffectsState;
        const alreadyHeld = new Set(state.EntriesFor(ctx.effect).flatMap(e => asData(e)?.holds.map(h => h.location) ?? []));
        const holds: GraspHold[] = [];
        const pieces: ConjurePiece[] = [];

        for (const location of config.Locations.filter(l => !alreadyHeld.has(l))) {
            const grasp = graspOf(location);
            // With Echo installed the hand is an item; otherwise the spell's own effects hold the spot
            const ghostPieces = grasp.ghost
                .filter(option => !!AssetGet(Player.AssetFamily, option.group as AssetGroupName, option.asset))
                .map(option => placePiece(ctx, option, grasp.ghostRung ?? 0))
                .filter((p): p is ConjurePiece => !!p);
            pieces.push(...ghostPieces);
            holds.push({ location, ghost: ghostPieces.length > 0, ...(grasp.teases ? { squeezed: Date.now() } : {}) });
            SendAction(grasp.grab);
            if (location === "neck")
                startChoke(ctx.sender);
        }

        if (holds.length === 0) {
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
        if (asData(entry)?.holds.some(h => h.location === "neck"))
            setTimeout(() => startChoke(getCharacter(entry.by) ?? null), 500);
    },
};
