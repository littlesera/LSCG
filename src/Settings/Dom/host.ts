import { onCanvasResize } from "utils";
import kitStyles from "./kit.scss?inline";

/** Mounts a DOM overlay over a 2000x1000 canvas rectangle and keeps it aligned on resize.
 *  Composition-based so any subscreen (local GuiSubscreen or RemoteGuiSubscreen) can own one. */
export class DomSettingsHost {
    private _unhookResize: (() => void) | undefined;
    private _root: HTMLElement | undefined;

    constructor(readonly id: string, readonly shape: RectTuple, private build: () => Node | Node[]) {}

    mount(): void {
        this.unmount();
        const children = this.build();
        const root = document.createElement("div");
        root.id = this.id;
        root.className = "lscg-screen lscg-kit";
        const style = document.createElement("style");
        style.textContent = kitStyles;
        root.append(style, ...(Array.isArray(children) ? children : [children]));
        document.body.appendChild(root);
        this._root = root;

        this._unhookResize = onCanvasResize(load => this.resize(load));
    }

    /** Rebuild the content in place (e.g. after the remote target's settings change shape). */
    remount(): void {
        if (this._root) this.mount();
    }

    resize(load: boolean): void {
        if (!this._root) return;
        const canvas = MainCanvas.canvas;
        const widthRatio = canvas.clientWidth / 2000;
        const heightRatio = canvas.clientHeight / 1000;
        const [x, y, w, h] = this.shape;
        Object.assign(this._root.style, {
            left: `${canvas.offsetLeft + x * widthRatio}px`,
            top: `${canvas.offsetTop + y * heightRatio}px`,
            width: `${w * widthRatio}px`,
            height: `${h * heightRatio}px`,
        });
        if (load) {
            this._root.style.fontFamily = CommonGetFontName();
            this._root.style.visibility = "visible";
        }
    }

    unmount(): void {
        document.activeElement?.dispatchEvent(new FocusEvent("blur"));
        this._unhookResize?.();
        this._unhookResize = undefined;
        this._root?.remove();
        this._root = undefined;
    }
}
