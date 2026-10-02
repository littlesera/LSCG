import { LSCGJson } from "./types";
import { extensions } from "./extensions";
import { isLSCGReady } from "./ready";
import { MAX_PUBLISHED_BYTES } from "./storage";
import { settingsSave } from "utils";

/** What goes out in the public sync: each loaded extension's public data, within the overall cap. */
export function publishedExtensionData(): Record<string, LSCGJson> {
    const out: Record<string, LSCGJson> = {};
    if (!isLSCGReady() || !Player?.LSCG?.Extensions || typeof Player.LSCG.Extensions !== "object")
        return out;
    let total = 0;
    for (const handle of extensions.all()) {
        const entry = Object.hasOwn(Player.LSCG.Extensions, handle.id) ? Player.LSCG.Extensions[handle.id] : undefined;
        const value = entry && typeof entry === "object" ? entry.public : undefined;
        if (value === undefined)
            continue;
        const size = JSON.stringify(value).length;
        if (total + size > MAX_PUBLISHED_BYTES)
            continue;
        total += size;
        out[handle.id] = value;
    }
    return out;
}

// An extension that registers after login, with public data already saved, starts publishing it.
extensions.onChange(() => {
    if (isLSCGReady() && Player?.LSCG?.Extensions && typeof Player.LSCG.Extensions === "object"
        && Object.values(Player.LSCG.Extensions).some(e => !!e && typeof e === "object" && e.public !== undefined))
        settingsSave(true);
});
