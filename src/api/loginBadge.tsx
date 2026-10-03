import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { hookFunction } from "utils";
import { apiVersion, extensions } from "api";
import { isExtensionDisabled, knownExtensions, setExtensionEnabled } from "./extensions";
import bcModSDKRef from "bondage-club-mod-sdk";
import badgeStyles from "./loginBadge.scss?inline";

// Directly under the Login button of the 2000x1000 canvas, the width of the New Character button below it (the
// corners hold other mods' lists). Clicking it opens the mod list in a modal.
const BADGE_SHAPE: RectTuple = [800, 592, 400, 56];

/** Notes shown under an extension after the player toggles it, until the page reloads. */
const notes = new Map<string, string>();
/** Whether the mod list is open, so a rebuild (an extension turning on or off) reopens it. */
let listOpen = false;

function toggle(id: string, enabled: boolean): void {
    setExtensionEnabled(id, enabled);
    // Toggling takes effect now where it can, but anything the extension did outside LSCG needs a reload to settle.
    notes.set(id, "Reload the page to apply this change.");
    badgeHost.remount();
}

/** How long the login screen is up before the badge first appears. */
const FIRST_SHOW_DELAY_MS = 500;

const LSCG_WIKI = "https://github.com/littlesera/LSCG/wiki";

/** Whether LSCG's own entry (with its extensions) is expanded, kept across rebuilds of the flyout. */
let lscgExpanded = false;

function buildExtensions(): HTMLElement {
    const exts = [...knownExtensions.values()];
    return (
        <div class="lscg-badge-extensions">
            {exts.length === 0
                ? <small>No extensions registered.</small>
                : <ul>
                    {exts.map(({ info }) => {
                        const ext = extensions.get(info.id);
                        const enabled = !isExtensionDisabled(info.id);
                        const note = notes.get(info.id);
                        return <li class={enabled ? "" : "lscg-badge-off"}>
                            <label class="lscg-badge-toggle" title={enabled ? "Turn this extension off" : "Turn this extension on"}>
                                {ElementCheckbox.Create(null, function() { toggle(info.id, this.checked); }, { checked: enabled }, { checkbox: { attributes: { "aria-label": `${info.name} enabled` } } })}
                                <span class="lscg-badge-clip" title={info.name}><b>{info.name}</b> <small>{info.version ? `v${info.version}` : ""}</small></span>
                            </label>
                            <small>{info.id}</small>
                            {ext && ext.errorCount > 0
                                ? <div class="lscg-badge-error">{`${ext.errorCount} error(s), see console`}</div>
                                : null}
                            {note
                                ? <div class="lscg-badge-note">
                                    {note} <button type="button" class="lscg-badge-reload" onClick={() => location.reload()}>Reload now</button>
                                </div>
                                : null}
                        </li>;
                    })}
                </ul>}
        </div>
    ) as HTMLElement;
}

/** Every other mod registered with ModSDK. They can only be listed: ModSDK has no way to turn one off. */
function modsInfo() {
    try {
        return bcModSDKRef.getModsInfo();
    } catch {
        return [];
    }
}

function otherMods() {
    return modsInfo().filter(m => m.name !== "LSCG");
}

const modsSignature = () => JSON.stringify(otherMods());

/** LSCG's own entry (with its extensions) followed by the other mods, in the order they registered. */
function buildModList(): HTMLElement {
    const lscgRepository = modsInfo().find(m => m.name === "LSCG")?.repository;
    const hasEnabledExtensions = [...knownExtensions.keys()].some(id => !isExtensionDisabled(id));
    const lscg = (
        <details class="lscg-badge-mod" open={lscgExpanded} onToggle={() => { lscgExpanded = lscg.open; }}>
            <summary>
                {hasEnabledExtensions ? <span class="lscg-badge-star" title="Extensions enabled" role="img" aria-label="Extensions enabled">★</span> : null}
                <b>LSCG</b> <small>{`v${apiVersion}`}</small>
                <a href={LSCG_WIKI} target="_blank" rel="noopener noreferrer">wiki</a>
                {lscgRepository ? <a href={lscgRepository} target="_blank" rel="noopener noreferrer">repository</a> : null}
            </summary>
            {buildExtensions()}
        </details>
    ) as HTMLDetailsElement;
    const list = (
        <ul class="lscg-badge-mods">
            <li>{lscg}</li>
            {otherMods().map(m => <li class="lscg-badge-mod">
                <b class="lscg-badge-clip" title={m.fullName || m.name}>{m.fullName || m.name}</b>
                {m.version ? <small class="lscg-badge-clip lscg-badge-version" title={`v${m.version}`}>{`v${m.version}`}</small> : null}
                {m.repository ? <a href={m.repository} title={m.repository} target="_blank" rel="noopener noreferrer">repository</a> : null}
            </li>)}
        </ul>
    ) as HTMLElement;
    list.dataset.signature = modsSignature();
    return list;
}

function buildFlyout(): HTMLDialogElement {
    const dialog = (
        <dialog class="lscg-badge-flyout" aria-label="Installed mods">
            <h2>Installed mods</h2>
            {buildModList()}
            <button type="button" class="lscg-badge-close" onClick={() => dialog.close()}>Close</button>
        </dialog>
    ) as HTMLDialogElement;
    dialog.addEventListener("close", () => { listOpen = false; });
    // BC's own key handling can swallow the browser's Escape-to-close, so close it here.
    dialog.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); dialog.close(); } });
    // A click on the backdrop (the dialog element itself, outside its content) closes it.
    dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
    return dialog;
}

function showModal(dialog: HTMLDialogElement): void {
    listOpen = true;
    if (!dialog.open) dialog.showModal();
}

/** LSCG plus every other mod registered with ModSDK. */
const badgeLabel = () => `Installed Mods (${otherMods().length + 1})`;

function buildBadge(): Node[] {
    const exts = extensions.all();
    const hasErrors = exts.some(e => e.errorCount > 0);
    // It pulses while there are extensions (in amber if one has thrown), and sits still when LSCG is on its own.
    const classes = ["lscg-badge", exts.length > 0 ? "lscg-badge-pulse" : "", hasErrors ? "lscg-badge-warn" : ""].filter(c => !!c).join(" ");
    let flyout = buildFlyout();
    const label = <span>{badgeLabel()}</span> as HTMLElement;
    // Note: a "//" comment inside the markup below would be rendered as text, so comments stay out here.
    const button = (
        <button type="button" class={classes} title="Show the installed mods" onClick={() => {
            // Error counts change without a registry notification; refresh on open.
            const fresh = buildFlyout();
            flyout.replaceWith(fresh);
            flyout = fresh;
            label.textContent = badgeLabel();
            showModal(fresh);
        }}>
            {label}
        </button>
    ) as HTMLElement;
    // ModSDK doesn't announce new mods, so poll; the timer ends itself once this badge has left the page.
    const poll = setInterval(() => {
        if (!button.isConnected) return void clearInterval(poll);
        label.textContent = badgeLabel();
        // An open list follows new mods too, rebuilding only the list so the dialog keeps its scroll position.
        const list = flyout.querySelector<HTMLElement>(".lscg-badge-mods");
        if (flyout.open && list && list.dataset.signature !== modsSignature())
            list.replaceWith(buildModList());
    }, 1000);
    // A rebuild while the list is open (an extension toggled) puts it back up once it is in the page.
    if (listOpen) queueMicrotask(() => { if (flyout.isConnected) showModal(flyout); });
    const style = document.createElement("style");
    style.textContent = badgeStyles;
    return [style, button, flyout];
}

const badgeHost = new DomOverlayHost("lscg-login-badge", BADGE_SHAPE, buildBadge, { injectKitStyles: false });

/** Shows the badge, unless LSCG has finished loading after login (it is for the login screen). */
export function showLoginBadge(): void {
    if (!badgeHost.mounted && !window.LSCG_Loaded)
        badgeHost.mount();
}

/** Puts a small LSCG badge on the login screen (the logo with the version beneath it): a flyout with the registered
 *  extensions, and a pulse when there are any. */
export function installLoginBadge(): void {
    // The badge waits a moment after the login screen appears, so most mods have registered by the time it counts them.
    let loginShownAt = 0;
    hookFunction("LoginRun", 0, (args, next) => {
        const ret = next(args);
        loginShownAt ||= Date.now();
        if (Date.now() - loginShownAt >= FIRST_SHOW_DELAY_MS)
            showLoginBadge();
        return ret;
    });
    hookFunction("LoginUnload", 0, (args, next) => {
        loginShownAt = 0;
        listOpen = false;
        badgeHost.unmount();
        return next(args);
    });
    // Extensions registering or leaving change the pulse and the flyout's list.
    extensions.onChange(() => badgeHost.remount());
}

export function removeLoginBadge(): void {
    listOpen = false;
    badgeHost.unmount();
}
