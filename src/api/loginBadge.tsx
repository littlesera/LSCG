import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { hookFunction, ICONS } from "utils";
import { apiVersion, extensions } from "api";
import badgeStyles from "./loginBadge.scss?inline";

// A small square in the bottom-right corner of the 2000x1000 canvas, with the logo above the version. The flyout
// opens upward and to the left.
const BADGE_SHAPE: RectTuple = [1916, 916, 66, 66];

function buildFlyout(): HTMLElement {
    const exts = extensions.all();
    return (
        <div class="lscg-badge-flyout" role="dialog" aria-label="LSCG extensions">
            <h2>{`LSCG v${apiVersion} loaded`}</h2>
            {exts.length === 0
                ? <small>No extensions registered.</small>
                : <ul>
                    {exts.map(ext => (
                        <li>
                            <div><b>{ext.info.name}</b> <small>{ext.info.version ? `v${ext.info.version}` : ""}</small></div>
                            <small>{ext.id}</small>
                            {ext.errorCount > 0
                                ? <div class="lscg-badge-error">{`${ext.errorCount} error(s), see console`}</div>
                                : null}
                        </li>
                    ))}
                </ul>}
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
        <div class="lscg-badge-anchor" onMouseEnter={() => {
            // Error counts change without a registry notification; refresh on open.
            const fresh = buildFlyout();
            flyout.replaceWith(fresh);
            flyout = fresh;
        }}>
            <button type="button" class={classes} aria-label={`LSCG v${apiVersion} loaded`}
                title={`LSCG v${apiVersion} loaded. Hover or click for registered extensions.`}
                onClick={() => anchor.classList.toggle("lscg-badge-open")}>
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
