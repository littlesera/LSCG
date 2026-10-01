import { onCanvasResize } from "utils";
import kitStyles from "./kit.scss?inline";

export interface DomOverlayOptions {
    /** Extra classes for the root element, on top of `lscg-overlay`. */
    className?: string;
    /** Inject the kit stylesheet into the root (default true). */
    injectKitStyles?: boolean;
}

/** Mounts a DOM overlay over a rectangle in 2000x1000 canvas coordinates and keeps it aligned on resize.
 *  Composition-based so any screen or menu can own one. `shape` may be a function for anchored layouts;
 *  it is re-evaluated on every resize. */
export class DomOverlayHost {
    private _unhookResize: (() => void) | undefined;
    private _root: HTMLElement | undefined;

    constructor(
        readonly id: string,
        readonly shape: RectTuple | (() => RectTuple),
        private build: () => Node | Node[],
        private options: DomOverlayOptions = {}
    ) {}

    get root(): HTMLElement | undefined {
        return this._root;
    }

    get mounted(): boolean {
        return !!this._root;
    }

    mount(): void {
        this.unmount();
        const children = this.build();
        const root = document.createElement("div");
        root.id = this.id;
        root.className = ["lscg-overlay", this.options.className].filter(c => !!c).join(" ");
        if (this.options.injectKitStyles ?? true) {
            const style = document.createElement("style");
            style.textContent = kitStyles;
            root.append(style);
        }
        root.append(...(Array.isArray(children) ? children : [children]));
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
        const [x, y, w, h] = typeof this.shape === "function" ? this.shape() : this.shape;
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
