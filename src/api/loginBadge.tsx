import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { hookFunction, ICONS } from "utils";
import { apiVersion, extensions } from "api";
import { isExtensionDisabled, knownExtensions, setExtensionEnabled } from "./extensions";
import badgeStyles from "./loginBadge.scss?inline";

// A small square in the bottom-right corner of the 2000x1000 canvas, with the logo above the version. The flyout
// opens upward and to the left.
const BADGE_SHAPE: RectTuple = [1916, 916, 66, 66];

/** Notes shown under an extension after the player toggles it, until the page reloads. */
const notes = new Map<string, string>();
/** Whether the flyout was opened by a click, so a rebuild (an extension turning on or off) keeps it open. */
let pinnedOpen = false;

function toggle(id: string, enabled: boolean): void {
    const wasLoaded = !!extensions.get(id);
    const loaded = setExtensionEnabled(id, enabled);
    if (!enabled)
        notes.set(id, wasLoaded ? "Turned off. Anything it did outside LSCG stays until you reload the page." : "Turned off.");
    else
        notes.set(id, loaded ? "Turned on." : "Reload the page to turn it on.");
    badgeHost.remount();
}

function buildFlyout(): HTMLElement {
    const exts = [...knownExtensions.values()];
    return (
        <div class="lscg-badge-flyout" role="dialog" aria-label="LSCG extensions">
            <h2>{`LSCG v${apiVersion} loaded`}</h2>
            {exts.length === 0
                ? <small>No extensions registered.</small>
                : <ul>
                    {exts.map(({ info }) => {
                        const ext = extensions.get(info.id);
                        const enabled = !isExtensionDisabled(info.id);
                        const note = notes.get(info.id);
                        return <li class={enabled ? "" : "lscg-badge-off"}>
                            <label class="lscg-badge-toggle" title={enabled ? "Turn this extension off" : "Turn this extension on"}>
                                <input type="checkbox" checked={enabled} aria-label={`${info.name} enabled`}
                                    onChange={e => toggle(info.id, (e.currentTarget as HTMLInputElement).checked)} />
                                <span><b>{info.name}</b> <small>{info.version ? `v${info.version}` : ""}</small></span>
                            </label>
                            <small>{info.id}</small>
                            {ext && ext.errorCount > 0
                                ? <div class="lscg-badge-error">{`${ext.errorCount} error(s), see console`}</div>
                                : null}
                            {note ? <div class="lscg-badge-note">{note}</div> : null}
                        </li>;
                    })}
                </ul>}
            {exts.length > 0 ? <small class="lscg-badge-hint">Unticked extensions stay off on this browser until you tick them again.</small> : null}
        </div>
    ) as HTMLElement;
}

function buildBadge(): Node[] {
    const exts = extensions.all();
    const hasErrors = exts.some(e => e.errorCount > 0);
    // It pulses while there are extensions (in amber if one has thrown), and sits still when LSCG is on its own.
    const classes = ["lscg-badge", exts.length > 0 ? "lscg-badge-pulse" : "", hasErrors ? "lscg-badge-warn" : ""].filter(c => !!c).join(" ");
    let flyout = buildFlyout();
    // Note: a "//" comment inside the markup below would be rendered as text, so comments stay out here.
    const anchor = (
        <div class={pinnedOpen ? "lscg-badge-anchor lscg-badge-open" : "lscg-badge-anchor"} onMouseEnter={() => {
            // Error counts change without a registry notification; refresh on open.
            const fresh = buildFlyout();
            flyout.replaceWith(fresh);
            flyout = fresh;
        }}>
            <button type="button" class={classes} aria-label={`LSCG v${apiVersion} loaded`}
                title={`LSCG v${apiVersion} loaded. Hover or click for registered extensions.`}
                onClick={() => { pinnedOpen = anchor.classList.toggle("lscg-badge-open"); }}>
                <img src={ICONS.BOUND_GIRL} alt="" draggable="false" />
                <span class="lscg-badge-version">{`v${apiVersion}`}</span>
            </button>
            {flyout}
        </div>
    ) as HTMLElement;
    const style = document.createElement("style");
    style.textContent = badgeStyles;
    return [style, anchor];
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
    hookFunction("LoginRun", 0, (args, next) => {
        const ret = next(args);
        showLoginBadge();
        return ret;
    });
    hookFunction("LoginUnload", 0, (args, next) => {
        badgeHost.unmount();
        return next(args);
    });
    // Extensions registering or leaving change the pulse and the flyout's list.
    extensions.onChange(() => badgeHost.remount());
}

export function removeLoginBadge(): void {
    badgeHost.unmount();
}
