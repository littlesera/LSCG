/** Runs inside the page: changes every enabled input on an open LSCG settings screen, tab by tab, and reports whether
 *  the player's saved settings changed (putting each value back after). An input that changes nothing is an unwired
 *  binding. Inputs are re-found before every step, since tables rebuild themselves, and the screen is reopened if
 *  a change closed it. */
export interface SweepResult {
    tab: string;
    label: string;
    kind: string;
    changed?: boolean;
    restored?: boolean;
    skipped?: string;
}

export interface SweepOptions {
    screen: string;
    /** Labels to leave alone, e.g. an "Enabled" switch whose change closes the screen. */
    skip?: string[];
}

export async function sweepScreen({ screen, skip = [] }: SweepOptions): Promise<SweepResult[]> {
    const w = window as any;
    const wait = (ms = 60) => new Promise(r => setTimeout(r, ms));
    // Saved settings, ignoring empty containers and ""/null so an empty list appearing isn't counted as a change.
    // `false` still counts: switching a default-on checkbox off (missing -> false) is a change.
    const snap = () => {
        const f = (v: any): any => {
            if (Array.isArray(v)) return v.map(f);
            if (v && typeof v === "object")
                return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, f(x)])
                    .filter(([, x]) => !(x === null || x === "" || (Array.isArray(x) && !x.length) || (x && typeof x === "object" && !Object.keys(x as object).length))));
            return v;
        };
        return JSON.stringify(f(w.Player.LSCG)) + JSON.stringify(w.Player.ExtensionSettings ?? {});
    };
    const root = () => [...document.querySelectorAll("body > .lscg-overlay")].pop() as HTMLElement | undefined;
    const tabNames = () => [...(root()?.querySelectorAll(".lscg-kit-tab") ?? [])].map(t => t.textContent ?? "");
    const openTab = async (name: string | null) => {
        if (!root()) { await w.Playground.openSettings(screen); await wait(300); }
        if (!name) return;
        const tab = [...root()!.querySelectorAll<HTMLElement>(".lscg-kit-tab")].find(t => t.textContent === name);
        tab?.click();
        await wait();
    };
    const inputsIn = () => {
        const r = root();
        if (!r) return [];
        const panel = r.querySelector(".lscg-kit-tab") ? r.querySelector(".lscg-kit-panel:not([hidden])")! : r;
        return [...panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select, textarea")].filter(el => el.type !== "search" && el.type !== "range");
    };
    const labelOf = (el: HTMLElement) => el.closest(".lscg-kit-row")?.querySelector(".lscg-kit-label")?.textContent
        ?? (el.closest("td")
            ? `${el.closest("table")!.querySelectorAll("th")[(el.closest("td") as HTMLTableCellElement).cellIndex]?.textContent} (row ${(el.closest("tr") as HTMLTableRowElement).rowIndex})`
            : el.getAttribute("aria-label") ?? el.id);

    const out: SweepResult[] = [];
    await w.Playground.openSettings(screen);
    await wait(300);
    const tabs = tabNames();
    for (const tab of tabs.length ? tabs : [null]) {
        await openTab(tab);
        const count = inputsIn().length;
        for (let i = 0; i < count; i++) {
            await openTab(tab);
            const el = inputsIn()[i];
            if (!el) break;
            const label = labelOf(el);
            const base = { tab: tab ?? "(page)", label, kind: el.type || el.tagName.toLowerCase() };
            if (skip.includes(label)) { out.push({ ...base, skipped: "asked" }); continue; }
            if (el.disabled || el.offsetParent === null) { out.push({ ...base, skipped: el.disabled ? "disabled" : "hidden" }); continue; }

            const before = snap();
            let old: string | boolean;
            if (el instanceof HTMLInputElement && el.type === "checkbox") {
                old = el.checked;
                el.click();
            } else if (el instanceof HTMLSelectElement) {
                old = el.value;
                const other = [...el.options].find(o => o.value !== old && !o.disabled);
                if (!other) { out.push({ ...base, skipped: "one option" }); continue; }
                el.value = other.value;
                el.dispatchEvent(new Event("change"));
            } else if (el.type === "number") {
                old = el.value;
                const min = Number(el.min || 0), max = Number(el.max || 100);
                el.value = String(Number(old) === min ? Math.min(max, min + 1) : min);
                el.dispatchEvent(new Event("change"));
            } else {
                old = el.value;
                el.value = old + "x";
                el.dispatchEvent(new Event("change"));
            }
            await wait(40);
            const changed = snap() !== before;

            await openTab(tab);
            const again = inputsIn()[i];
            if (again instanceof HTMLInputElement && again.type === "checkbox") {
                if (again.checked !== old) again.click();
            } else if (again) {
                again.value = old as string;
                again.dispatchEvent(new Event("change"));
            }
            await wait(40);
            // Put back means the control shows what it did before (the saved JSON can differ, e.g. a default made explicit).
            const shown = inputsIn()[i];
            const restored = !shown || (shown instanceof HTMLInputElement && shown.type === "checkbox" ? shown.checked === old : shown.value === old);
            out.push({ ...base, changed, restored });
        }
    }
    return out;
}
