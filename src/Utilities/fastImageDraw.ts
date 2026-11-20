/**
 * A shortcut for the most common call BC makes while drawing the map: a plain image, resized, at an opacity, with nothing else
 * (no tint, mask, rotation, mirroring or blend mode). BC's `DrawImageEx` handles every option, and for that pays for them all on
 * every call: it reads and restores the canvas transform, builds a rotation matrix, and, when given a URL, looks the image up in
 * its cache, which allocates an Error and a promise each time. A full map draws well over a thousand such images a frame, so
 * that overhead is a large share of the frame once the map is zoomed out.
 *
 * This draws the same pixels with the one `drawImage` call they need. Anything else is left to BC (`draw` returns undefined).
 */

/** `draw`'s arguments are those of `DrawImageEx(Source, Canvas, X, Y, Options)`. */
export type DrawImageExArgs = readonly [source: unknown, canvas: unknown, x: unknown, y: unknown, options?: unknown];

interface CachedImage {
	bitmap: ImageBitmap;
	/** When BC's own cache was last asked for it. */
	touchedAt: number;
}

/**
 * How long a URL's image is used from here before BC's cache is asked for it again. BC's cache drops images it has not been asked
 * for in a while, so the occasional real lookup keeps the images the map is using from being dropped.
 */
const TOUCH_INTERVAL_MS = 2000;

export class FastImageDrawer {
	private images = new Map<string, CachedImage>();

	/**
	 * @param getImage BC's `DrawGetImage`: the loaded image for a URL, or undefined while it loads. Asking also keeps it cached.
	 * @param now clock, in milliseconds
	 */
	constructor(
		private readonly getImage: (url: string) => ImageBitmap | undefined,
		private readonly now: () => number = () => performance.now(),
	) {}

	/**
	 * Draws the image if the call is the simple case, and returns true (what `DrawImageEx` returns for a drawn image).
	 * Returns undefined, having drawn nothing, if it is not, or the image is not loaded yet; the caller then lets BC draw it.
	 */
	draw(args: DrawImageExArgs): boolean | undefined {
		const [source, canvas, x, y, options] = args;
		if (typeof x !== "number" || typeof y !== "number" || !options || typeof options !== "object") return undefined;
		if (!canvas || typeof (canvas as CanvasRenderingContext2D).drawImage !== "function") return undefined;

		// Only the options that matter for a plain resize; any other one that is set means BC's full path.
		let width: unknown, height: unknown, alpha: unknown;
		for (const key in options as Record<string, unknown>) {
			const value = (options as Record<string, unknown>)[key];
			switch (key) {
				case "Width": width = value; break;
				case "Height": height = value; break;
				case "Alpha": alpha = value; break;
				case "Rotation": if (value) return undefined; break; // an undefined or zero rotation is none
				default: if (value !== undefined) return undefined;
			}
		}
		if (typeof width !== "number" || typeof height !== "number") return undefined;
		if (alpha !== undefined && typeof alpha !== "number") return undefined;
		const opacity = alpha === undefined ? 1 : Math.max(0, Math.min(1, alpha));

		const bitmap = this.bitmapFor(source);
		if (!bitmap) return undefined;
		if (opacity === 0) return true; // BC returns before drawing anything at zero opacity

		const ctx = canvas as CanvasRenderingContext2D;
		// BC draws at the requested opacity in the normal blend mode whatever the canvas was left at, then puts both back.
		const previousAlpha = ctx.globalAlpha;
		const previousOperation = ctx.globalCompositeOperation;
		if (previousAlpha !== opacity) ctx.globalAlpha = opacity;
		if (previousOperation !== "source-over") ctx.globalCompositeOperation = "source-over";
		ctx.drawImage(bitmap, x, y, width, height);
		if (previousAlpha !== opacity) ctx.globalAlpha = previousAlpha;
		if (previousOperation !== "source-over") ctx.globalCompositeOperation = previousOperation;
		return true;
	}

	private bitmapFor(source: unknown): ImageBitmap | undefined {
		if (typeof source === "string") {
			const now = this.now();
			const cached = this.images.get(source);
			// A closed bitmap (BC's cache dropped the image) reports no size; ask BC again rather than draw it.
			if (cached && cached.bitmap.width > 0 && now - cached.touchedAt < TOUCH_INTERVAL_MS) return cached.bitmap;
			const bitmap = this.getImage(source); // also starts loading it, and counts as a use
			if (!bitmap || !(bitmap.width > 0)) {
				this.images.delete(source);
				return undefined;
			}
			this.images.set(source, { bitmap, touchedAt: now });
			return bitmap;
		}
		if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap && source.width > 0) return source;
		return undefined;
	}

	/** Forgets every remembered image, e.g. when BC's image cache is cleared. */
	clear(): void {
		this.images.clear();
	}
}
