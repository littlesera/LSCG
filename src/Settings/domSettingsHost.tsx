import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { GuiSubscreen } from "./settingBase";
import { IconButton } from "Dom/kit";

/** Area a settings screen's DOM covers: its title and exit button at the top, its content, and the help button. */
export const SETTINGS_SCREEN_SHAPE: RectTuple = [GuiSubscreen.START_X, 75, 1905 - GuiSubscreen.START_X, 835];

/** The title, exit and help buttons around a settings screen's content, in place of the canvas-drawn ones. */
function chrome(screen: GuiSubscreen, content: Node | Node[]): HTMLElement {
    const help = screen.help;
    const body = <div class="lscg-kit-screen-body" /> as HTMLElement;
    body.append(...(Array.isArray(content) ? content : [content]));
    return <div class="lscg-kit-screen">
        <h1 class="lscg-kit-screen-title">{`- LSCG ${screen.name} -`}</h1>
        {IconButton("./Icons/Exit.png", "Back", () => screen.Exit(), { class: "lscg-kit-screen-exit", tooltipPosition: "left" })}
        {body}
        {IconButton("./Icons/Introduction.png", help.label, () => window.open(help.link, "_blank"), { class: "lscg-kit-screen-help", tooltipPosition: "left" })}
    </div> as HTMLElement;
}

/** A DomOverlayHost preset for settings subscreens (local or remote), with the screen's title, exit and help buttons.
 *  While one is mounted, GuiSubscreen.Run/Click leave those to it (see GuiSubscreen.domChrome). */
export class DomSettingsHost extends DomOverlayHost {
    constructor(id: string, screen: GuiSubscreen, build: () => Node | Node[], shape: RectTuple = SETTINGS_SCREEN_SHAPE) {
        super(id, shape, () => chrome(screen, build()), { className: "lscg-screen lscg-kit" });
    }

    mount(): void {
        super.mount();
        GuiSubscreen.domChrome = true;
    }

    unmount(): void {
        const wasMounted = this.mounted;
        super.unmount();
        if (wasMounted) GuiSubscreen.domChrome = false;
    }
}
