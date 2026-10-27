import { CheckboxRow, KitContext, NumberRow, SelectRow, TextRow } from "Dom/kit";
import type { OptionField } from "api/options";
import type { LSCGOptionValue, LSCGOptions } from "api/types";

/** The rows for options an extension declared on an effect or drug. `options` reads the stored values (defaults filled in);
 *  `update` merges one change into them. Values are checked again by the schema wherever they are used. */
export function optionRows(ctx: KitContext, fields: OptionField[], options: () => LSCGOptions, update: (patch: LSCGOptions) => void): HTMLElement[] {
    const set = (key: string, value: LSCGOptionValue) => update({ [key]: value });
    return fields.map(f => {
        const base = { label: f.label, description: f.description };
        switch (f.type) {
            case "toggle":
                return CheckboxRow(ctx, { ...base, get: () => options()[f.key] === true, set: v => set(f.key, v) });
            case "number":
                return NumberRow(ctx, {
                    ...base, min: f.min!, max: f.max!, step: f.step,
                    get: () => { const v = options()[f.key]; return typeof v === "number" ? v : f.default as number; },
                    set: v => set(f.key, v),
                });
            case "select":
                return SelectRow(ctx, {
                    ...base, options: f.choices!,
                    get: () => { const v = options()[f.key]; return typeof v === "string" ? v : f.default as string; },
                    set: v => set(f.key, v),
                });
            case "text":
                return TextRow(ctx, {
                    ...base, maxLength: f.maxLength, multiline: f.multiline,
                    get: () => { const v = options()[f.key]; return typeof v === "string" ? v : f.default as string; },
                    set: v => set(f.key, v),
                });
        }
    });
}
