import { DomOverlayHost } from "Dom/host";
import { GuiSubscreen } from "./settingBase";

/** Content area shared by DOM-based settings screens, below the subscreen title bar. */
export const SETTINGS_SCREEN_SHAPE: RectTuple = [GuiSubscreen.START_X, GuiSubscreen.START_Y - 25, 1780 - GuiSubscreen.START_X, 740];

/** A DomOverlayHost preset for settings subscreens (local or remote). */
export class DomSettingsHost extends DomOverlayHost {
    constructor(id: string, build: () => Node | Node[], shape: RectTuple = SETTINGS_SCREEN_SHAPE) {
        super(id, shape, build, { className: "lscg-screen lscg-kit" });
    }
}
