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
    /** Options with the same group, next to each other, are listed under that heading. */
    group?: string;
    /** Drawn before the label where the browser supports rich dropdowns (customizable select, Chromium 135+). */
    icon?: KitIcon;
}

/** Small vector icons, drawn in the current text colour (see .lscg-kit-icon in kit.scss). */
export type KitIcon = "extension";

/** A plain text character for each icon, the same shape, for where only text can go: a dropdown's options in
 *  browsers without customizable selects. Not an emoji: it's drawn by the text font, in the text colour. */
const ICON_GLYPHS: Record<KitIcon, string> = { extension: "\u2726" }; // ✦ black four pointed star

/** Whether this browser can draw elements (our icons) inside a dropdown's options. */
const richSelects = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("appearance", "base-select");

export function Icon(icon: KitIcon, title?: string): HTMLElement {
    return <span class={`lscg-kit-icon lscg-kit-icon-${icon}`} role={title ? "img" : undefined}
        aria-label={title} aria-hidden={title ? undefined : "true"} title={title ?? ""} /> as HTMLElement;
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
    const input = ElementCheckbox.Create(id, () => { props.set(input.checked); ctx.changed(); });
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

/** A number box; with `slider`, also a slider beside it for the same value. */
export function NumberRow(ctx: KitContext, props: RowProps<number> & { min: number; max: number; step?: number; slider?: boolean }): HTMLElement {
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
    if (!props.slider)
        return row(ctx, props, id, input);

    // Dragging updates the number box live; the value is committed when the slider is let go.
    const slider = <input type="range" aria-label={props.label} min={props.min} max={props.max} step={props.step ?? 1}
        onInput={() => { input.value = slider.value; }}
        onChange={() => { props.set(Number(slider.value)); ctx.changed(); }} /> as HTMLInputElement;
    ctx.watch(() => { slider.value = String(props.get() ?? props.min); });
    bindDisabled(ctx, slider, props.disabled);
    return row(ctx, props, id, <div class="lscg-kit-slider">{slider}{input}</div> as HTMLElement);
}

/** Runs of consecutive options that share a group (undefined for ungrouped). */
function groupOptions(options: SelectOption[]): [string | undefined, SelectOption[]][] {
    const runs: [string | undefined, SelectOption[]][] = [];
    for (const o of options) {
        const last = runs[runs.length - 1];
        if (last && last[0] === o.group) last[1].push(o);
        else runs.push([o.group, [o]]);
    }
    return runs;
}

function createSelect(options: SelectOption[], id: string, onChange: (value: string) => void): HTMLSelectElement {
    // BC's dropdown for plain lists; icons and groups (optgroup) need the hand-built select below.
    if (!options.some(o => o.icon || o.group))
        return ElementDropdown.Create(id, options.map(o => ({ tag: "option" as const, attributes: { value: o.value }, children: [o.label] })), function () { onChange(this.value); });
    const rich = richSelects && options.some(o => !!o.icon);
    const select = <select id={id} class={rich ? "lscg-kit-select-rich" : ""} onChange={() => onChange(select.value)}>
        {groupOptions(options).map(([group, opts]) => {
            const items = opts.map(o => <option value={o.value}>
                {o.icon ? (richSelects ? Icon(o.icon) : `${ICON_GLYPHS[o.icon]} `) : null}{o.label}
            </option>);
            return group ? <optgroup label={group}>{items}</optgroup> : items;
        })}
    </select> as HTMLSelectElement;
    // A customizable select shows the chosen option's content, icon included, through <selectedcontent>.
    if (rich) {
        const button = document.createElement("button");
        button.appendChild(document.createElement("selectedcontent"));
        select.prepend(button);
    }
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
    const button: HTMLButtonElement = ElementButton.Create(id, () => props.onClick(button),
        { label: props.buttonLabel, labelPosition: "center" },
        { button: { classList: props.danger ? ["lscg-button", "lscg-kit-danger"] : ["lscg-button"] } });
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

/** The viewing player's state that BC applies to every other character it draws: blindness, tints (e.g. hypnosis's
 *  purple) and blur, from BC itself or from LSCG's hooks on these methods. */
const VIEWER_EFFECTS = {
    IsBlind: () => false,
    GetBlindLevel: () => 0,
    HasTints: () => false,
    GetTints: () => [],
    GetBlurLevel: () => 0,
} as const;

/** Runs `draw` as if the player had no blindness, tints or blur, so a preview isn't drawn through their eyes. The
 *  player's own methods (and any mod hooks on them) are put back exactly as they were. */
export function drawUnaffected<T>(draw: () => T): T {
    const saved = (Object.keys(VIEWER_EFFECTS) as (keyof typeof VIEWER_EFFECTS)[])
        .map(key => [key, Object.getOwnPropertyDescriptor(Player, key)] as const);
    const photo = CommonPhotoMode;
    Object.assign(Player, VIEWER_EFFECTS);
    CommonPhotoMode = true; // no blink or darkening either
    try {
        return draw();
    } finally {
        for (const [key, descriptor] of saved) {
            if (descriptor) Object.defineProperty(Player, key, descriptor);
            else delete (Player as any)[key];
        }
        CommonPhotoMode = photo;
    }
}

export interface ZonePickerProps {
    /** Whose body and worn items to show. Drawn standing, whatever their pose. */
    character: Character;
    /** The zones that can be picked, e.g. body groups that have activities. */
    groups: () => AssetGroup[];
    /** The picked group's name, outlined. */
    selected: () => string | undefined;
    /** Zones drawn filled green, e.g. ones that already have a setting. */
    highlighted?: (group: AssetGroup) => boolean;
    onPick: (group: AssetGroup) => void;
}

/** A character with clickable body zones, as in BC's own dialogs. BC draws it: MainCanvas is pointed at this canvas
 *  while drawing, and clicks are tested with DialogClickedInZone, so zones line up exactly. Redraws every frame while
 *  on the page, so the character shows once its images load. */
export function ZonePicker(ctx: KitContext, props: ZonePickerProps): HTMLCanvasElement {
    // Drawn on a standing copy (same worn items, base poses), so kneeling etc. doesn't hide zones; deleted when done.
    const C = CharacterLoadSimple(uid("zones"));
    C.Appearance = AppearanceItemParse(CharacterAppearanceStringify(props.character));
    PoseSetActive(C, "BaseUpper", true);
    PoseSetActive(C, "BaseLower", true);
    CharacterRefresh(C, false, false);

    // Some zones sit above the character's top edge, so shift everything down until every outline fits.
    const PAD = 6;
    const zoneTops = AssetGroup.flatMap(g => (g.Zone ?? []).map(z => DialogGetCharacterZone(C, z, 0, 0, 1, 1)[1]));
    const TOP = PAD - Math.min(0, ...zoneTops);
    const canvas = <canvas class="lscg-kit-zones" width={500 + PAD * 2} height={1000 + TOP + PAD} role="img" aria-label="Body zones" onClick={(e: MouseEvent) => {
        const r = canvas.getBoundingClientRect();
        const [mouseX, mouseY] = [MouseX, MouseY];
        MouseX = (e.clientX - r.left) * canvas.width / r.width;
        MouseY = (e.clientY - r.top) * canvas.height / r.height;
        try {
            const group = props.groups().find(g => g.Zone?.some(z => DialogClickedInZone(C, z, 1, PAD, TOP, 1)));
            if (group) {
                props.onPick(group);
                ctx.changed();
            }
        } finally {
            [MouseX, MouseY] = [mouseX, mouseY];
        }
    }} /> as HTMLCanvasElement;
    const draw = canvas.getContext("2d")!;

    const render = () => drawUnaffected(() => {
        const main = MainCanvas;
        MainCanvas = draw;
        try {
            draw.clearRect(0, 0, canvas.width, canvas.height);
            DrawCharacter(C, PAD, TOP, 1, false, draw);
            for (const g of props.groups())
                if (g.Zone) DrawAssetGroupZone(C, g.Zone, 1, PAD, TOP, 1, "#808080FF", 3, props.highlighted?.(g) ? "#00FF0044" : "#80808044");
            const picked = props.groups().find(g => g.Name === props.selected());
            if (picked?.Zone) DrawAssetGroupZone(C, picked.Zone, 1, PAD, TOP, 1, "cyan");
        } finally {
            MainCanvas = main;
        }
    });
    // ponytail: per-frame redraw; stops once removed from the page (or if never added within ~5s).
    let attached = false, waited = 0;
    const frame = () => {
        if (canvas.isConnected) {
            attached = true;
            render();
        } else if (attached || ++waited > 300) {
            CharacterDelete(C, false);
            return;
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return canvas;
}

/** A single scrolling page of rows, for screens too short to need tabs. */
export function Panel(children: HTMLElement[]): HTMLElement {
    return <div class="lscg-kit-body scroll-box"><div class="lscg-kit-panel">{children}</div></div> as HTMLElement;
}

export function Notice(text: string): HTMLElement {
    const note = ElementText.CreateNote(text);
    note.classList.add("lscg-kit-notice");
    return note;
}

/** A text box that reports every keystroke (unlike TextRow, which commits on blur), for live filtering. */
export function SearchBox(onInput: (text: string) => void, opts: { placeholder?: string; value?: string; label?: string } = {}): HTMLInputElement {
    const input = <input type="search" class="lscg-kit-search" aria-label={opts.label ?? "Search"} placeholder={opts.placeholder ?? "Search…"} maxLength={100}
        onInput={() => onInput(input.value)} /> as HTMLInputElement;
    input.value = opts.value ?? "";
    return input;
}

export interface CardGridProps<T> {
    items: () => T[];
    render: (item: T) => HTMLElement;
    /** Shown instead of the grid when `items()` is empty. */
    empty?: string;
}

/** A scrolling grid of cards. Re-renders itself on every `ctx.refresh()`, so a filter (e.g. a search box) just
 *  calls refresh after updating what `items()` returns. */
export function CardGrid<T>(ctx: KitContext, props: CardGridProps<T>): HTMLElement {
    const grid = <div class="lscg-kit-cardgrid scroll-box" /> as HTMLElement;
    ctx.watch(() => {
        const items = props.items();
        grid.replaceChildren(...(items.length > 0
            ? items.map(props.render)
            : [<p class="lscg-kit-notice">{props.empty ?? "Nothing to show."}</p> as HTMLElement]));
    });
    return grid;
}

export type ChipTone = "ok" | "warn" | "blocked" | "info" | "muted";

/** A collapsible section with its own tinted background, for settings that belong to the row above it. The summary
 *  line is re-read after every change (via `ctx`), so it can describe the current settings while the section is
 *  closed. `onToggle` reports when the player opens or closes it. */
export function Expando(ctx: KitContext, props: { summary: () => string; content: HTMLElement[]; open?: boolean; onToggle?: (open: boolean) => void }): HTMLDetailsElement {
    const label = <span /> as HTMLElement;
    const details = (
        <details class="lscg-kit-expando" open={!!props.open} onToggle={() => props.onToggle?.(details.open)}>
            <summary class="lscg-kit-expando-summary">{label}</summary>
            <div class="lscg-kit-expando-body">{props.content}</div>
        </details>
    ) as HTMLDetailsElement;
    ctx.watch(() => { label.textContent = props.summary(); });
    return details;
}

/** A small rounded tag, e.g. an effect's status or where it comes from. */
export function Chip(label: string, opts: { tone?: ChipTone; tooltip?: string; icon?: KitIcon } = {}): HTMLElement {
    return <span class={`lscg-kit-chip lscg-kit-chip-${opts.tone ?? "muted"}`} title={opts.tooltip ?? ""}>
        {opts.icon ? Icon(opts.icon) : null}{label}
    </span> as HTMLElement;
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
    /** Per-row delete permission, on top of the table-wide readOnly. */
    canDelete?: (row: R) => boolean;
    /** Called after a row is removed. */
    onDelete?: (row: R) => void;
}

/** Editable list of records. Re-renders itself on any change; fine for the small row counts it's meant for. */
export function RuleTable<R>(ctx: KitContext, props: RuleTableProps<R>): HTMLElement {
    const container = <div class="lscg-kit-table-wrap" /> as HTMLElement;

    const cell = (r: R, col: RuleColumn<R>, readOnly: boolean): HTMLElement => {
        if (col.hidden?.(r)) return <td /> as HTMLElement;
        if (col.kind === "custom") return <td>{col.render?.(r, readOnly) ?? null}</td> as HTMLElement;
        let control: HTMLInputElement | HTMLSelectElement;
        if (col.kind === "checkbox") {
            control = ElementCheckbox.Create(null, () => { col.set(r, (control as HTMLInputElement).checked); ctx.changed(); }, { checked: !!col.get(r) });
            control.setAttribute("aria-label", col.header);
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
                                <button class="lscg-button lscg-kit-delete" aria-label={props.deleteLabel ?? "Delete rule"} disabled={readOnly || props.canDelete?.(r) === false} onClick={() => {
                                    rows.splice(i, 1);
                                    props.onDelete?.(r);
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
