import { h } from "tsx-dom";

/** Shared state for one mounted settings view: re-evaluates bound values/disabled/hidden after any change,
 *  since DOM settings don't get the canvas's per-frame redraw. */
export class KitContext {
    private _watchers: (() => void)[] = [];

    constructor(private onChange?: () => void) {}

    /** Run `fn` now and again after every change. */
    watch(fn: () => void): void {
        this._watchers.push(fn);
        fn();
    }

    changed(): void {
        this.onChange?.();
        this.refresh();
    }

    refresh(): void {
        this._watchers.forEach(fn => fn());
    }
}

export interface RowProps<T> {
    label: string;
    description?: string;
    get: () => T;
    set: (value: T) => void;
    disabled?: () => boolean;
    hidden?: () => boolean;
}

export interface SelectOption {
    value: string;
    label: string;
}

let _uid = 0;
const uid = (prefix: string) => `lscg-kit-${prefix}-${++_uid}`;

function row(ctx: KitContext, props: Pick<RowProps<unknown>, "label" | "description" | "hidden">, controlId: string, control: HTMLElement): HTMLElement {
    const el = (
        <div class="lscg-kit-row">
            <label class="lscg-kit-label" for={controlId}>{props.label}</label>
            <div class="lscg-kit-control">{control}</div>
            {props.description ? <small class="lscg-kit-desc">{props.description}</small> : null}
        </div>
    ) as HTMLElement;
    if (props.hidden) ctx.watch(() => { el.hidden = props.hidden!(); });
    return el;
}

function bindDisabled(ctx: KitContext, el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement, disabled?: () => boolean) {
    if (disabled) ctx.watch(() => { el.disabled = disabled(); });
}

export function CheckboxRow(ctx: KitContext, props: RowProps<boolean>): HTMLElement {
    const id = uid("cb");
    const input = <input type="checkbox" id={id} onChange={() => { props.set(input.checked); ctx.changed(); }} /> as HTMLInputElement;
    ctx.watch(() => { input.checked = !!props.get(); });
    bindDisabled(ctx, input, props.disabled);
    return row(ctx, props, id, input);
}

export function TextRow(ctx: KitContext, props: RowProps<string> & { placeholder?: string; maxLength?: number; multiline?: boolean }): HTMLElement {
    const id = uid("txt");
    const commit = () => { props.set(input.value); ctx.changed(); };
    const input = (props.multiline
        ? <textarea id={id} rows={3} placeholder={props.placeholder ?? ""} maxLength={props.maxLength ?? 1000} onChange={commit} />
        : <input type="text" id={id} placeholder={props.placeholder ?? ""} maxLength={props.maxLength ?? 1000} onChange={commit} />
    ) as HTMLInputElement | HTMLTextAreaElement;
    ctx.watch(() => { if (document.activeElement !== input) input.value = props.get() ?? ""; });
    bindDisabled(ctx, input, props.disabled);
    return row(ctx, props, id, input);
}

export function NumberRow(ctx: KitContext, props: RowProps<number> & { min: number; max: number; step?: number }): HTMLElement {
    const id = uid("num");
    const input = <input type="number" id={id} min={props.min} max={props.max} step={props.step ?? 1} onChange={() => {
        const n = Number(input.value);
        if (input.value === "" || !Number.isFinite(n) || n < props.min || n > props.max) {
            input.value = String(props.get());
            return;
        }
        props.set(n);
        ctx.changed();
    }} /> as HTMLInputElement;
    ctx.watch(() => { if (document.activeElement !== input) input.value = String(props.get() ?? ""); });
    bindDisabled(ctx, input, props.disabled);
    return row(ctx, props, id, input);
}

function createSelect(options: SelectOption[], id: string, onChange: (value: string) => void): HTMLSelectElement {
    const select = <select id={id} onChange={() => onChange(select.value)}>
        {options.map(o => <option value={o.value}>{o.label}</option>)}
    </select> as HTMLSelectElement;
    return select;
}

export function SelectRow(ctx: KitContext, props: RowProps<string> & { options: SelectOption[] }): HTMLElement {
    const id = uid("sel");
    const select = createSelect(props.options, id, v => { props.set(v); ctx.changed(); });
    ctx.watch(() => { select.value = props.get(); });
    bindDisabled(ctx, select, props.disabled);
    return row(ctx, props, id, select);
}

export function ButtonRow(ctx: KitContext, props: {
    label: string; description?: string; buttonLabel: string; onClick: (button: HTMLButtonElement) => void;
    disabled?: () => boolean; hidden?: () => boolean; danger?: boolean;
}): HTMLElement {
    const id = uid("btn");
    const button = (
        <button type="button" id={id} class={props.danger ? "lscg-button lscg-kit-danger" : "lscg-button"} onClick={() => props.onClick(button)}>
            {props.buttonLabel}
        </button>
    ) as HTMLButtonElement;
    bindDisabled(ctx, button, props.disabled);
    return row(ctx, props, id, button);
}

export function SectionLabel(text: string, description?: string): HTMLElement {
    return (
        <div class="lscg-kit-section">
            <h2>{text}</h2>
            {description ? <p class="lscg-kit-desc">{description}</p> : null}
        </div>
    ) as HTMLElement;
}

export function Notice(text: string): HTMLElement {
    return <p class="lscg-kit-notice">{text}</p> as HTMLElement;
}

export type ChipTone = "ok" | "warn" | "blocked" | "info" | "muted";

/** A small rounded tag, e.g. an effect's status or where it comes from. */
export function Chip(label: string, opts: { tone?: ChipTone; tooltip?: string } = {}): HTMLElement {
    return <span class={`lscg-kit-chip lscg-kit-chip-${opts.tone ?? "muted"}`} title={opts.tooltip ?? ""}>{label}</span> as HTMLElement;
}

/** Opens a modal dialog whose rows edit data through their own context; every change is forwarded to `parent`
 *  (so the owning screen marks itself dirty and re-renders summaries). Closed with Done or Escape. */
export function openDialog(anchor: HTMLElement, parent: KitContext, title: string, body: (ctx: KitContext) => HTMLElement[]): void {
    // Stay inside the kit root so its scoped styles apply; showModal still renders it above everything.
    const root = anchor.closest(".lscg-kit") ?? document.body;
    const ctx = new KitContext(() => parent.changed());
    const dialog = (
        <dialog class="lscg-kit-dialog" aria-label={title}>
            <h2>{title}</h2>
            <div class="lscg-kit-dialog-body">{body(ctx)}</div>
            <div class="lscg-kit-dialog-actions">
                <button class="lscg-button" onClick={() => dialog.close()}>Done</button>
            </div>
        </dialog>
    ) as HTMLDialogElement;
    dialog.addEventListener("close", () => dialog.remove());
    root.appendChild(dialog);
    dialog.showModal();
}

/** A yes/no confirmation dialog. `onConfirm` only runs if the confirm button is picked; Cancel or Escape does nothing. */
export function confirmDialog(anchor: HTMLElement, title: string, message: string, confirmLabel: string, onConfirm: () => void): void {
    const root = anchor.closest(".lscg-kit") ?? document.body;
    const dialog = (
        <dialog class="lscg-kit-dialog" aria-label={title}>
            <h2>{title}</h2>
            <p class="lscg-kit-desc">{message}</p>
            <div class="lscg-kit-dialog-actions">
                <button class="lscg-button" onClick={() => dialog.close()}>Cancel</button>
                <button class="lscg-button lscg-kit-danger" onClick={() => { dialog.close(); onConfirm(); }}>{confirmLabel}</button>
            </div>
        </dialog>
    ) as HTMLDialogElement;
    dialog.addEventListener("close", () => dialog.remove());
    root.appendChild(dialog);
    dialog.showModal();
}

export interface KitTab {
    label: string;
    render: () => HTMLElement[];
    hidden?: boolean;
}

/** Tab bar + scrollable body. All tabs render once and are toggled, so bound watchers stay valid. */
export function Tabs(tabs: KitTab[]): HTMLElement {
    const visible = tabs.filter(t => !t.hidden);
    const panels = visible.map(t => <div class="lscg-kit-panel" role="tabpanel">{t.render()}</div> as HTMLElement);
    const buttons = visible.map((t, i) => <button class="lscg-button lscg-kit-tab" role="tab" onClick={() => select(i)}>{t.label}</button> as HTMLButtonElement);
    const select = (index: number) => {
        panels.forEach((p, i) => { p.hidden = i !== index; });
        buttons.forEach((b, i) => b.setAttribute("aria-selected", String(i === index)));
    };
    select(0);
    return (
        <div class="lscg-kit-tabs">
            <div class="lscg-kit-tabbar" role="tablist">{buttons}</div>
            <div class="lscg-kit-body scroll-box">{panels}</div>
        </div>
    ) as HTMLElement;
}

export interface RuleColumn<R> {
    header: string;
    kind: "checkbox" | "select" | "number" | "text" | "custom";
    /** Custom columns only: build the cell content (e.g. a summary plus an edit button). */
    render?: (row: R, readOnly: boolean) => HTMLElement;
    /** Text columns only. */
    maxLength?: number;
    placeholder?: string;
    get: (row: R) => any;
    set: (row: R, value: any) => void;
    options?: (row: R) => SelectOption[];
    /** Hidden cells render empty — e.g. "state" when the action doesn't use one. */
    hidden?: (row: R) => boolean;
    min?: number;
    max?: number;
    step?: number;
    /** CSS width for the column, e.g. "60%" or "5em". */
    width?: string;
    /** Longer explanation shown on hover over the header and the column's cells, so headers can stay short. */
    tooltip?: string;
    /** Per-row read-only cell, on top of the table-wide readOnly. */
    disabled?: (row: R) => boolean;
}

export interface RuleTableProps<R> {
    rows: () => R[];
    columns: RuleColumn<R>[];
    /** Fixed tables (e.g. one row per known thing) have no add/delete controls; `create`/`max` are then unused. */
    fixed?: boolean;
    create?: () => R;
    max?: number;
    readOnly?: () => boolean;
    addLabel?: string;
    deleteLabel?: string;
}

/** Editable list of records. Re-renders itself on any change; fine for the small row counts it's meant for. */
export function RuleTable<R>(ctx: KitContext, props: RuleTableProps<R>): HTMLElement {
    const container = <div class="lscg-kit-table-wrap" /> as HTMLElement;

    const cell = (r: R, col: RuleColumn<R>, readOnly: boolean): HTMLElement => {
        if (col.hidden?.(r)) return <td /> as HTMLElement;
        if (col.kind === "custom") return <td>{col.render?.(r, readOnly) ?? null}</td> as HTMLElement;
        let control: HTMLInputElement | HTMLSelectElement;
        if (col.kind === "checkbox") {
            control = <input type="checkbox" aria-label={col.header} onChange={() => { col.set(r, (control as HTMLInputElement).checked); ctx.changed(); }} /> as HTMLInputElement;
            (control as HTMLInputElement).checked = !!col.get(r);
        } else if (col.kind === "text") {
            control = <input type="text" aria-label={col.header} maxLength={col.maxLength ?? 255} placeholder={col.placeholder ?? ""} onChange={() => {
                col.set(r, (control as HTMLInputElement).value.trim());
                ctx.changed();
            }} /> as HTMLInputElement;
            control.value = String(col.get(r) ?? "");
        } else if (col.kind === "select") {
            control = createSelect(col.options?.(r) ?? [], uid("cell"), v => { col.set(r, v); ctx.changed(); });
            control.value = String(col.get(r) ?? "");
            control.setAttribute("aria-label", col.header);
        } else {
            control = <input type="number" aria-label={col.header} min={col.min ?? 0} max={col.max ?? 1e9} step={col.step ?? 1} onChange={() => {
                const n = Number(control.value);
                if (control.value === "" || !Number.isFinite(n) || n < (col.min ?? 0) || n > (col.max ?? 1e9)) {
                    control.value = String(col.get(r) ?? 0);
                    return;
                }
                col.set(r, n);
                ctx.changed();
            }} /> as HTMLInputElement;
            control.value = String(col.get(r) ?? 0);
        }
        control.disabled = readOnly || !!col.disabled?.(r);
        if (col.tooltip) control.title = col.tooltip;
        return <td>{control}</td> as HTMLElement;
    };

    const render = () => {
        const rows = props.rows();
        const readOnly = props.readOnly?.() ?? false;
        const max = props.max ?? Infinity;
        const add = <button class="lscg-button lscg-kit-add" disabled={readOnly || rows.length >= max} onClick={() => {
            if (!props.create) return;
            rows.push(props.create());
            ctx.changed();
        }}>{props.addLabel ?? "+ Add rule"}</button> as HTMLButtonElement;

        container.replaceChildren(
            <table class="lscg-kit-table">
                <thead><tr>{props.columns.map(c => (
                    <th style={c.width ? { width: c.width } : {}} title={c.tooltip ?? ""} class={c.tooltip ? "lscg-kit-has-tip" : ""}>{c.header}</th>
                ))}{props.fixed ? null : <th class="lscg-kit-delete-col" />}</tr></thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr>
                            {props.columns.map(c => cell(r, c, readOnly))}
                            {props.fixed ? null : <td>
                                <button class="lscg-button lscg-kit-delete" aria-label={props.deleteLabel ?? "Delete rule"} disabled={readOnly} onClick={() => {
                                    rows.splice(i, 1);
                                    ctx.changed();
                                }}>✕</button>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>,
            props.fixed ? <span /> : <div class="lscg-kit-table-footer">{add}<small class="lscg-kit-desc">{`${rows.length} / ${props.max}`}</small></div>,
        );
    };
    ctx.watch(render);
    return container;
}
