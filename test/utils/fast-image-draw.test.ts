// utilities/fastImageDraw.ts: the shortcut for plain image draws while the map is drawing. What matters is that it draws exactly
// what BC's DrawImageEx would for the simple case, and hands everything else back.
import { afterEach, describe, expect, it, vi } from "vitest";
import { FastImageDrawer } from "Utilities/fastImageDraw";

const bitmap = (width = 64) => ({ width, height: width }) as unknown as ImageBitmap;

function canvas() {
	const calls: unknown[][] = [];
	const ctx = {
		globalAlpha: 1,
		globalCompositeOperation: "source-over",
		drawImage: vi.fn((...a: unknown[]) => { calls.push([ctx.globalAlpha, ctx.globalCompositeOperation, ...a]); }),
	};
	return { ctx: ctx as unknown as CanvasRenderingContext2D, raw: ctx, calls };
}

describe("FastImageDrawer", () => {
	afterEach(() => vi.unstubAllGlobals());

	const make = (images: Record<string, ImageBitmap | undefined> = {}, clock = { t: 0 }) => {
		const getImage = vi.fn((url: string) => images[url]);
		return { drawer: new FastImageDrawer(getImage, () => clock.t), getImage, clock };
	};

	describe("what it draws", () => {
		it("a plain resized image from a URL, the way DrawImageResize asks for it", () => {
			const img = bitmap();
			const { drawer } = make({ "a.png": img });
			const { ctx, raw } = canvas();
			expect(drawer.draw(["a.png", ctx, 10, 20, { Width: 30, Height: 40 }])).toBe(true);
			expect(raw.drawImage).toHaveBeenCalledOnce();
			expect(raw.drawImage).toHaveBeenCalledWith(img, 10, 20, 30, 40);
		});

		it("an undefined or zero rotation is no rotation, as BC's map code passes it", () => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx, raw } = canvas();
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Rotation: undefined }])).toBe(true);
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Rotation: 0 }])).toBe(true);
			expect(raw.drawImage).toHaveBeenCalledTimes(2);
		});

		it("an ImageBitmap that was passed in directly, as tiles are", () => {
			class FakeBitmap { width = 32; height = 32; }
			vi.stubGlobal("ImageBitmap", FakeBitmap);
			const img = new FakeBitmap() as unknown as ImageBitmap;
			const { drawer, getImage } = make();
			const { ctx, raw } = canvas();
			expect(drawer.draw([img, ctx, 1, 2, { Width: 3, Height: 4 }])).toBe(true);
			expect(raw.drawImage).toHaveBeenCalledWith(img, 1, 2, 3, 4);
			expect(getImage).not.toHaveBeenCalled();
		});

		it("at the requested opacity, and puts the canvas back as it was", () => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx, raw, calls } = canvas();
			raw.globalAlpha = 0.8;
			raw.globalCompositeOperation = "multiply";
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Alpha: 0.4 }]);
			// drawn in the normal blend mode at the asked-for opacity, as BC does whatever the canvas was left at...
			expect(calls[0].slice(0, 2)).toEqual([0.4, "source-over"]);
			// ...and then restored
			expect(raw.globalAlpha).toBe(0.8);
			expect(raw.globalCompositeOperation).toBe("multiply");
		});

		it("clamps opacity to 0 to 1, and draws nothing at zero, like BC", () => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx, raw, calls } = canvas();
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Alpha: 7 }]);
			expect(calls[0][0]).toBe(1);
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Alpha: 0 }])).toBe(true);
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, Alpha: -3 }])).toBe(true);
			expect(raw.drawImage).toHaveBeenCalledOnce();
		});
	});

	describe("what it leaves to BC", () => {
		const leaves = (options: Record<string, unknown>) => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx, raw } = canvas();
			const result = drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5, ...options }]);
			return { result, drawn: raw.drawImage.mock.calls.length };
		};

		it.each([
			["a tint", { HexColor: "#ff0000" }],
			["alpha masks", { AlphaMasks: [[0, 0, 1, 1]] }],
			["texture masks", { TextureAlphaMask: [] }],
			["a zoom", { Zoom: 2 }],
			["mirroring", { Mirror: true }],
			["inversion", { Invert: true }],
			["a blend mode", { BlendingMode: "multiply" }],
			["a source rectangle", { SourcePos: [0, 0, 1, 1] }],
			["full alpha tinting", { FullAlpha: true }],
			["a rotation", { Rotation: 45 }],
			["an opacity that is not a number", { Alpha: "half" }],
		])("%s", (_name, options) => {
			expect(leaves(options)).toEqual({ result: undefined, drawn: 0 });
		});

		it("an option BC adds later, which this does not know about", () => {
			expect(leaves({ SomethingNew: 1 })).toEqual({ result: undefined, drawn: 0 });
		});

		it("a call without a size", () => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx, raw } = canvas();
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5 }])).toBeUndefined();
			expect(drawer.draw(["a.png", ctx, 0, 0, {}])).toBeUndefined();
			expect(drawer.draw(["a.png", ctx, 0, 0, undefined])).toBeUndefined();
			expect(raw.drawImage).not.toHaveBeenCalled();
		});

		it("a position that is not a number, or a target that is not a canvas context", () => {
			const { drawer } = make({ "a.png": bitmap() });
			const { ctx } = canvas();
			expect(drawer.draw(["a.png", ctx, "0", 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(drawer.draw(["a.png", {}, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(drawer.draw(["a.png", null, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
		});

		it("an image that is not loaded yet, then draws it once it is", () => {
			const images: Record<string, ImageBitmap | undefined> = {};
			const { drawer } = make(images);
			const { ctx, raw } = canvas();
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(raw.drawImage).not.toHaveBeenCalled();
			images["a.png"] = bitmap();
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }])).toBe(true);
		});

		it("sources that are neither a URL nor an ImageBitmap", () => {
			const { drawer } = make();
			const { ctx, raw } = canvas();
			expect(drawer.draw([{ width: 5, height: 5 }, ctx, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(drawer.draw([null, ctx, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(raw.drawImage).not.toHaveBeenCalled();
		});
	});

	describe("remembering images", () => {
		it("asks BC for a URL's image once, not on every draw", () => {
			const { drawer, getImage } = make({ "a.png": bitmap() });
			const { ctx } = canvas();
			for (let i = 0; i < 50; i++) drawer.draw(["a.png", ctx, i, 0, { Width: 5, Height: 5 }]);
			expect(getImage).toHaveBeenCalledOnce();
		});

		it("asks again now and then, so BC's cache sees the image is still in use and does not drop it", () => {
			const { drawer, getImage, clock } = make({ "a.png": bitmap() });
			const { ctx } = canvas();
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			clock.t = 1900;
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			expect(getImage).toHaveBeenCalledOnce();
			clock.t = 2100;
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			expect(getImage).toHaveBeenCalledTimes(2);
		});

		it("never draws an image BC has closed, and asks BC for a fresh one", () => {
			const images: Record<string, ImageBitmap | undefined> = { "a.png": bitmap() };
			const { drawer, getImage } = make(images);
			const { ctx, raw } = canvas();
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			// BC's cache drops the image: a closed ImageBitmap reports no size
			(images["a.png"] as unknown as { width: number }).width = 0;
			const fresh = bitmap(16);
			images["a.png"] = fresh;
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }])).toBe(true);
			expect(getImage).toHaveBeenCalledTimes(2);
			expect(raw.drawImage).toHaveBeenLastCalledWith(fresh, 0, 0, 5, 5);
		});

		it("leaves it to BC when BC only has a closed image to give", () => {
			const { drawer } = make({ "a.png": bitmap(0) });
			const { ctx, raw } = canvas();
			expect(drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }])).toBeUndefined();
			expect(raw.drawImage).not.toHaveBeenCalled();
		});

		it("forgets everything on clear()", () => {
			const { drawer, getImage } = make({ "a.png": bitmap() });
			const { ctx } = canvas();
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			drawer.clear();
			drawer.draw(["a.png", ctx, 0, 0, { Width: 5, Height: 5 }]);
			expect(getImage).toHaveBeenCalledTimes(2);
		});
	});
});
