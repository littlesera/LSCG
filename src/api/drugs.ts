import { getModule } from "modules";
import type { InjectorModule } from "Modules/injector";
import { LSCGDoseOptions, LSCGDrugType, LSCGDrugContext, LSCGDrugThreshold, LSCGDrugDefinition, LSCGDrugDoseContext, LSCGDrugsApi } from "./types";
import { Registry } from "./registry";
import { ErrorOwner, safeInvoke } from "./safeInvoke";

/** A drug an extension registered, with its callbacks already wrapped so errors stay contained. */
export interface ExtensionDrug {
    /** "<extension id>.<name>" */
    id: string;
    /** Display name of the extension that registered it. */
    source: string;
    label: string;
    description: string;
    keywords: string[];
    color: string;
    max: number;
    tickMs: number;
    decayPerMinute: number;
    onDose(ctx: LSCGDrugDoseContext): void;
    onTick?(ctx: LSCGDrugContext): void;
    /** Sorted by `at`, with each `at` already turned into an absolute level. */
    thresholds: (LSCGDrugThreshold & { level: number })[];
    onFull?(ctx: LSCGDrugContext): void;
    onSpike?(ctx: LSCGDrugContext): void;
    spikeChance: number;
    onWearOff?(ctx: LSCGDrugContext): void;
}

/** Read by InjectorModule at the point of use, so drugs can be registered before or after it loads. */
export const extensionDrugs = new Registry<ExtensionDrug>("drug");

export const DEFAULT_DRUG_COLOR = "#5C9CFF";
/** Most extension bars shown (and published) for one player. With LSCG's own three they fill two rows of eight. */
export const MAX_EXTENSION_BARS = 12;
const DEFAULT_MAX = 10;
const DEFAULT_DECAY_PER_MINUTE = 1;
const DEFAULT_SPIKE_CHANCE = 0.1;
const DEFAULT_TICK_SECONDS = 6;
const MIN_TICK_SECONDS = 1;

/** Whether a drug type id belongs to an extension (they are namespaced; LSCG's own never contain a "."). */
export function isExtensionDrugId(type: string): boolean {
    return type.includes(".");
}

function requireText(owner: ErrorOwner, what: string, value: unknown): string {
    if (typeof value !== "string" || value.trim() === "")
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be a non-empty string.`);
    return value.trim();
}

function positive(owner: ErrorOwner, what: string, value: unknown, fallback: number, allowZero: boolean): number {
    if (value === undefined) return fallback;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || (!allowZero && value === 0))
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be a ${allowZero ? "non-negative" : "positive"} number.`);
    return value;
}

/** Builds the `drugs` member of an extension handle. */
export function createDrugsApi(owner: ErrorOwner & { readonly info: { name: string } }, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGDrugsApi {
    const mine = new Map<string, () => void>();

    return {
        register(def: LSCGDrugDefinition): () => void {
            if (!def || typeof def !== "object")
                throw new Error(`LSCG[ext:${owner.id}]: a drug definition is required.`);
            const id = scopedId(requireText(owner, "a drug's name", def.name));
            if (typeof def.onDose !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: drug "${def.name}" needs an onDose(ctx) function.`);
            if (!Array.isArray(def.keywords) || def.keywords.length === 0)
                throw new Error(`LSCG[ext:${owner.id}]: drug "${def.name}" needs at least one keyword.`);
            const keywords = def.keywords.map((k, i) => requireText(owner, `drug "${def.name}" keyword ${i + 1}`, k));

            const max = positive(owner, "max", def.max, DEFAULT_MAX, false);
            const thresholds = (def.thresholds ?? []).map((t, i) => {
                if (!t || typeof t.at !== "number" || !(t.at > 0) || t.at > 1)
                    throw new Error(`LSCG[ext:${owner.id}]: drug "${def.name}" threshold ${i + 1}: at must be above 0 and at most 1.`);
                const wrap = (fn?: (ctx: LSCGDrugContext) => void) => typeof fn === "function" ? (ctx: LSCGDrugContext) => { safeInvoke(owner, () => fn.call(t, ctx)); } : undefined;
                return { at: t.at, level: t.at * max, onReach: wrap(t.onReach), onDrop: wrap(t.onDrop) };
            }).sort((a, b) => a.level - b.level);

            const unregister = extensionDrugs.register({
                id,
                source: owner.info.name,
                label: requireText(owner, `drug "${def.name}" label`, def.label),
                description: typeof def.description === "string" ? def.description : "",
                keywords,
                color: typeof def.color === "string" && def.color.trim() !== "" ? def.color.trim() : DEFAULT_DRUG_COLOR,
                max,
                tickMs: Math.max(MIN_TICK_SECONDS, positive(owner, "tickSeconds", def.tickSeconds, DEFAULT_TICK_SECONDS, true)) * 1000,
                thresholds,
                decayPerMinute: positive(owner, "decayPerMinute", def.decayPerMinute, DEFAULT_DECAY_PER_MINUTE, true),
                onDose: ctx => { safeInvoke(owner, () => def.onDose(ctx)); },
                onTick: typeof def.onTick === "function" ? ctx => { safeInvoke(owner, () => def.onTick!(ctx)); } : undefined,
                onFull: typeof def.onFull === "function" ? ctx => { safeInvoke(owner, () => def.onFull!(ctx)); } : undefined,
                onSpike: typeof def.onSpike === "function" ? ctx => { safeInvoke(owner, () => def.onSpike!(ctx)); } : undefined,
                spikeChance: Math.min(1, positive(owner, "spikeChance", def.spikeChance, DEFAULT_SPIKE_CHANCE, true)),
                onWearOff: typeof def.onWearOff === "function" ? ctx => { safeInvoke(owner, () => def.onWearOff!(ctx)); } : undefined,
            });
            const remove = () => {
                if (mine.delete(def.name)) unregister();
            };
            mine.set(def.name, remove);
            track(remove);
            return remove;
        },

        dose(type: LSCGDrugType, options: LSCGDoseOptions = {}): boolean {
            if (typeof type !== "string" || type === "")
                throw new Error(`LSCG[ext:${owner.id}]: dose needs a drug type.`);
            const multiplier = positive(owner, "multiplier", options.multiplier, 1, true);
            const injector = getModule<InjectorModule>("InjectorModule");
            return !!injector?.DoseDrug(type, { ...options, multiplier });
        },

        getLevel(type: LSCGDrugType): number {
            return getModule<InjectorModule>("InjectorModule")?.GetDrugLevel(type) ?? 0;
        },

        unregister(name: string): boolean {
            const remove = mine.get(name);
            if (!remove) return false;
            remove();
            return true;
        },
    };
}
