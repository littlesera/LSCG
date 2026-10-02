import { ButtonRow, CheckboxRow, Chip, confirmDialog, KitContext, Notice, NumberRow, SectionLabel, SelectRow, TextRow } from "Dom/kit";
import { ErrorOwner, safeInvoke } from "api/safeInvoke";
import type { LSCGKit, LSCGKitOption, LSCGKitRow } from "api/types";

const MAX_TEXT = 5000;

function text(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

/** The kit handed to an extension's settings screen: LSCG's own row builders, bound to the screen's context, with
 *  every callback the extension supplies run inside its error handling and given a safe fallback if it fails. */
export function createExtensionKit(ctx: KitContext, owner: ErrorOwner, anchor: () => HTMLElement | undefined): LSCGKit {
    const safe = <T,>(fn: (() => T) | undefined, fallback: T): (() => T) =>
        () => {
            if (typeof fn !== "function") return fallback;
            const value = safeInvoke(owner, fn);
            return value === undefined ? fallback : value;
        };
    const run = <A extends unknown[]>(fn: ((...args: A) => void) | undefined) =>
        (...args: A) => { if (typeof fn === "function") safeInvoke(owner, () => fn(...args)); };
    const base = (row: LSCGKitRow) => ({
        label: text(row?.label),
        description: typeof row?.description === "string" ? row.description : undefined,
        disabled: row?.disabled ? safe(row.disabled, false) : undefined,
        hidden: row?.hidden ? safe(row.hidden, false) : undefined,
    });

    return {
        section: (title, description) => SectionLabel(text(title), typeof description === "string" ? description : undefined),
        notice: message => Notice(text(message)),
        chip: (label, options) => Chip(text(label), { tone: options?.tone, tooltip: typeof options?.tooltip === "string" ? options.tooltip : undefined }),
        checkbox: row => CheckboxRow(ctx, { ...base(row), get: safe(row.get, false), set: run(row.set) }),
        text: row => TextRow(ctx, {
            ...base(row),
            get: safe(row.get, ""),
            set: run(row.set),
            placeholder: typeof row.placeholder === "string" ? row.placeholder : undefined,
            maxLength: typeof row.maxLength === "number" ? Math.min(row.maxLength, MAX_TEXT) : undefined,
            multiline: !!row.multiline,
        }),
        number: row => {
            const min = Number.isFinite(row.min) ? row.min : 0;
            const max = Number.isFinite(row.max) ? Math.max(row.max, min) : min;
            return NumberRow(ctx, { ...base(row), min, max, step: Number.isFinite(row.step) ? row.step : undefined, get: safe(row.get, min), set: run(row.set) });
        },
        select: row => {
            const options: LSCGKitOption[] = (Array.isArray(row.options) ? row.options : [])
                .filter(o => !!o && typeof o.value === "string")
                .map(o => ({ value: o.value, label: text(o.label, o.value) }));
            return SelectRow(ctx, { ...base(row), options, get: safe(row.get, options[0]?.value ?? ""), set: run(row.set) });
        },
        button: row => ButtonRow(ctx, {
            label: text(row?.label),
            description: typeof row?.description === "string" ? row.description : undefined,
            buttonLabel: text(row?.buttonLabel, "OK"),
            danger: !!row?.danger,
            disabled: row?.disabled ? safe(row.disabled, false) : undefined,
            hidden: row?.hidden ? safe(row.hidden, false) : undefined,
            onClick: () => run(row.onClick)(),
        }),
        confirm: (title, message, confirmLabel, onConfirm) => {
            const where = anchor();
            if (where) confirmDialog(where, text(title), text(message), text(confirmLabel, "OK"), run(onConfirm));
        },
    };
}
