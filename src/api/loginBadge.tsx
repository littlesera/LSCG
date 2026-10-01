import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { hookFunction } from "utils";
import { apiVersion, extensions } from "api";
import badgeStyles from "./loginBadge.scss?inline";

// Bottom-right corner of the 2000x1000 canvas; the flyout opens upward/left from the badge.
const BADGE_SHAPE: RectTuple = [1500, 930, 490, 60];

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
    const label = exts.length > 0 ? `LSCG v${apiVersion} · ${exts.length} ext` : `LSCG v${apiVersion}`;
    let flyout = buildFlyout();
    const anchor = (
        <div class="lscg-badge-anchor" onMouseEnter={() => {
            // Error counts change without a registry notification; refresh on open.
            const fresh = buildFlyout();
            flyout.replaceWith(fresh);
            flyout = fresh;
        }}>
            <button type="button" class={hasErrors ? "lscg-badge lscg-badge-warn" : "lscg-badge"}
                title="LSCG is loaded. Hover or click for registered extensions."
                onClick={() => anchor.classList.toggle("lscg-badge-open")}>
                <span class="lscg-badge-dot" />
                {label}
            </button>
            {flyout}
        </div>
    ) as HTMLElement;
    const style = document.createElement("style");
    style.textContent = badgeStyles;
    return [style, anchor];
}

const badgeHost = new DomOverlayHost("lscg-login-badge", BADGE_SHAPE, buildBadge, { injectKitStyles: false });

/** Shows an "LSCG loaded" badge on the login screen with a flyout listing registered extensions. */
export function installLoginBadge(): void {
    hookFunction("LoginRun", 0, (args, next) => {
        const ret = next(args);
        if (!badgeHost.mounted && !window.LSCG_Loaded)
            badgeHost.mount();
        return ret;
    });
    hookFunction("LoginUnload", 0, (args, next) => {
        badgeHost.unmount();
        return next(args);
    });
    extensions.onChange(() => badgeHost.remount());
}

export function removeLoginBadge(): void {
    badgeHost.unmount();
}
