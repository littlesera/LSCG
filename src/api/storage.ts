import { LSCGJson, LSCGStorageApi } from "./types";
import { ErrorOwner } from "./safeInvoke";
import { isLSCGReady } from "./ready";
import { getCharacter, settingsSave } from "utils";

/** Private data per extension, as JSON characters. It lives in the player's saved settings, which have a server limit. */
export const MAX_PRIVATE_BYTES = 32 * 1024;
/** Public data per extension. It rides along in LSCG's sync to everyone in the room, so it is kept small. */
export const MAX_PUBLIC_BYTES = 1024;
/** Across all extensions, the most public data published at once. */
export const MAX_PUBLISHED_BYTES = 4 * 1024;

/** What is saved for one extension. */
export interface ExtensionStorageEntry {
    private?: LSCGJson;
    public?: LSCGJson;
}

function serialize(value: unknown, limit: number, what: string, owner: ErrorOwner): string {
    let text: string | undefined;
    try {
        text = JSON.stringify(value);
    } catch {
        text = undefined;
    }
    if (text === undefined)
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be JSON.`);
    if (text.length > limit)
        throw new Error(`LSCG[ext:${owner.id}]: ${what} is ${text.length} bytes, over the ${limit} byte limit.`);
    return text;
}

function store(): Record<string, ExtensionStorageEntry> {
    if (!isLSCGReady() || !Player?.LSCG)
        throw new Error("LSCG: extension storage isn't available until LSCG is ready (use onReady).");
    // This came from a saved (or imported) file, so don't trust its shape: anything that isn't an object is reset.
    const current: unknown = Player.LSCG.Extensions;
    if (!current || typeof current !== "object" || Array.isArray(current))
        Player.LSCG.Extensions = {};
    return Player.LSCG.Extensions!;
}

/** The saved entry for an extension, or undefined. Throws until LSCG is ready. */
export function entryOf(id: string): ExtensionStorageEntry | undefined {
    const all = store();
    const entry = Object.hasOwn(all, id) ? all[id] : undefined;
    return entry && typeof entry === "object" ? entry : undefined;
}

function readJson<T>(value: unknown): T | undefined {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as T;
}

/** Builds the `storage` member of an extension handle. */
export function createStorageApi(owner: ErrorOwner): LSCGStorageApi {
    const id = owner.id;

    const update = (field: "private" | "public", value: LSCGJson | undefined, limit: number, what: string) => {
        const all = store();
        if (value === undefined) {
            const entry = Object.hasOwn(all, id) ? all[id] : undefined;
            if (entry) {
                delete entry[field];
                if (entry.private === undefined && entry.public === undefined) delete all[id];
            }
        } else {
            const text = serialize(value, limit, what, owner);
            let entry = Object.hasOwn(all, id) ? all[id] : undefined;
            if (!entry || typeof entry !== "object" || Array.isArray(entry))
                entry = all[id] = {};
            entry[field] = JSON.parse(text) as LSCGJson;
        }
        // Public data is part of what other players see, so it publishes; private data only saves.
        settingsSave(field === "public");
    };

    return {
        get: <T extends LSCGJson>() => readJson<T>(entryOf(id)?.private),
        set: value => update("private", value, MAX_PRIVATE_BYTES, "stored data"),
        setPublic: value => update("public", value, MAX_PUBLIC_BYTES, "public data"),
        getPublic: <T extends LSCGJson>(memberNumber?: number) => {
            if (memberNumber === undefined || memberNumber === Player.MemberNumber)
                return readJson<T>(entryOf(id)?.public);
            const published = (getCharacter(memberNumber) as OtherCharacter | null)?.LSCG?.ExtensionData;
            if (!published || typeof published !== "object" || !Object.hasOwn(published, id))
                return undefined;
            // Came over the network: refuse anything oversized.
            const value = published[id];
            try {
                return JSON.stringify(value).length <= MAX_PUBLIC_BYTES ? readJson<T>(value) : undefined;
            } catch {
                return undefined;
            }
        },
    };
}
