import { ErrorOwner } from "./safeInvoke";
import type { LSCGOptionField, LSCGOptionValue, LSCGOptions } from "./types";

/** An option field after validation: every default is a legal value for its type, so sanitizing can always fall back to it. */
export interface OptionField {
    key: string;
    type: LSCGOptionField["type"];
    label: string;
    description?: string;
    default: LSCGOptionValue;
    min?: number;
    max?: number;
    step?: number;
    maxLength?: number;
    multiline?: boolean;
    choices?: { value: string; label: string }[];
}

export const MAX_OPTION_FIELDS = 12;
const MAX_OPTION_TEXT = 200;
const MAX_OPTION_CHOICES = 24;
const MAX_STORED_TEXT = 1000;

function fail(owner: ErrorOwner, what: string): never {
    throw new Error(`LSCG[ext:${owner.id}]: ${what}`);
}

/** Checks the `options` an extension declared on an effect or drug and fills in defaults. Throws on a malformed declaration
 *  so the mistake shows up at registration, not as a broken editor later. */
export function validateOptionFields(owner: ErrorOwner, where: string, raw: unknown): OptionField[] {
    if (raw === undefined) return [];
    if (!Array.isArray(raw)) fail(owner, `${where}: options must be an array.`);
    if (raw.length > MAX_OPTION_FIELDS) fail(owner, `${where}: at most ${MAX_OPTION_FIELDS} options.`);
    const seen = new Set<string>();
    return (raw as LSCGOptionField[]).map((f, i): OptionField => {
        const at = `${where}: option ${i + 1}`;
        if (!f || typeof f !== "object") fail(owner, `${at} must be an object.`);
        if (typeof f.key !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(f.key) || f.key === "__proto__")
            fail(owner, `${at}: key must be a plain identifier.`);
        if (seen.has(f.key)) fail(owner, `${at}: key "${f.key}" is used twice.`);
        seen.add(f.key);
        const base = {
            key: f.key,
            label: typeof f.label === "string" && f.label.trim() !== "" ? f.label.trim().slice(0, MAX_OPTION_TEXT) : f.key,
            description: typeof f.description === "string" ? f.description.slice(0, MAX_OPTION_TEXT) : undefined,
        };
        switch (f.type) {
            case "toggle":
                return { ...base, type: "toggle", default: f.default === true };
            case "number": {
                const min = Number.isFinite(f.min) ? f.min! : 0;
                const max = Number.isFinite(f.max) ? Math.max(f.max!, min) : min + 10;
                const def = Number.isFinite(f.default) ? Math.min(max, Math.max(min, f.default!)) : min;
                return { ...base, type: "number", min, max, step: Number.isFinite(f.step) && f.step! > 0 ? f.step : undefined, default: def };
            }
            case "select": {
                const choices = (Array.isArray(f.choices) ? f.choices : [])
                    .filter(c => !!c && typeof c.value === "string")
                    .slice(0, MAX_OPTION_CHOICES)
                    .map(c => ({ value: c.value, label: typeof c.label === "string" ? c.label : c.value }));
                if (choices.length === 0) fail(owner, `${at}: a select needs at least one choice.`);
                const def = choices.some(c => c.value === f.default) ? f.default! : choices[0].value;
                return { ...base, type: "select", choices, default: def };
            }
            case "text": {
                const maxLength = Number.isFinite(f.maxLength) ? Math.min(f.maxLength!, MAX_STORED_TEXT) : MAX_OPTION_TEXT;
                const def = typeof f.default === "string" ? f.default.slice(0, maxLength) : "";
                return { ...base, type: "text", maxLength, multiline: !!f.multiline, default: def };
            }
            default:
                return fail(owner, `${at}: type must be "toggle", "number", "select" or "text".`);
        }
    });
}

export function optionDefaults(fields: OptionField[]): LSCGOptions {
    return Object.fromEntries(fields.map(f => [f.key, f.default]));
}

/** One value, forced to be legal for its field: anything wrong falls back to the field's default. */
function sanitizeValue(f: OptionField, value: unknown): LSCGOptionValue {
    switch (f.type) {
        case "toggle": return typeof value === "boolean" ? value : f.default;
        case "number": return typeof value === "number" && Number.isFinite(value) ? Math.min(f.max!, Math.max(f.min!, value)) : f.default;
        case "select": return typeof value === "string" && f.choices!.some(c => c.value === value) ? value : f.default;
        case "text": return typeof value === "string" ? value.slice(0, f.maxLength) : f.default;
    }
}

/** Strict: only the declared keys, each a legal value. For everything that comes from another player, and before it reaches the extension. */
export function sanitizeOptions(fields: OptionField[], raw: unknown): LSCGOptions {
    const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
    return Object.fromEntries(fields.map(f => [f.key, sanitizeValue(f, Object.prototype.hasOwnProperty.call(source, f.key) ? source[f.key] : undefined)]));
}

/** Stored options with defaults filled in but values otherwise untouched, so half-typed input stays visible in an editor. */
export function editableOptions(fields: OptionField[], stored: unknown): LSCGOptions {
    return { ...optionDefaults(fields), ...(stored && typeof stored === "object" && !Array.isArray(stored) ? stored as LSCGOptions : {}) };
}

function show(f: OptionField, value: LSCGOptionValue): string {
    switch (f.type) {
        case "toggle": return value ? "on" : "off";
        case "select": return f.choices!.find(c => c.value === value)?.label ?? String(value);
        default: return String(value);
    }
}

/** "Label: value, Label: value" for the line shown while an options section is closed. */
export function summarizeOptions(fields: OptionField[], options: LSCGOptions): string {
    return fields.map(f => `${f.label}: ${show(f, sanitizeValue(f, options[f.key]))}`).join(", ");
}
