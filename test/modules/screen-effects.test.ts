// The screen effects layer (the suggestible's sway and the hypno spiral), and how the injector drives it.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { clearScreenEffects, drawSpiralOverlay, setSpiralEffect, setWaveEffect, spiralAlpha, spiralTarget, HYPNO_SPIRAL_COLOR } from "Dom/screenEffects";
import { boot, resetWorld } from "../harness/world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("screen effects", () => {
	let canvas: HTMLCanvasElement;

	beforeEach(() => {
		canvas = document.createElement("canvas");
		canvas.style.filter = "contrast(1)";
		document.body.append(canvas);
		g.MainCanvas = { canvas };
	});

	afterEach(() => {
		clearScreenEffects();
		canvas.remove();
		delete g.MainCanvas;
	});

	const spiral = () => (spiralTarget() > 0 ? {} : null);
	const displacement = () => document.querySelector("feDisplacementMap");

	describe("wave", () => {
		it("filters the canvas, keeping the filter the page already had", () => {
			setWaveEffect(0.5);
			expect(canvas.style.filter).toContain("contrast(1)");
			expect(canvas.style.filter).toContain("url(#lscg-wave-filter)");
			expect(document.getElementById("lscg-wave-filter")).not.toBeNull();
		});

		it("distorts more as it grows, and updating doesn't stack filters", () => {
			setWaveEffect(0.25);
			const low = Number(displacement()?.getAttribute("scale"));
			setWaveEffect(1);
			const high = Number(displacement()?.getAttribute("scale"));
			expect(high).toBeGreaterThan(low);
			expect(canvas.style.filter.match(/lscg-wave-filter/g)).toHaveLength(1);
			expect(document.querySelectorAll("#lscg-wave-filter")).toHaveLength(1);
		});

		it("zero (or nonsense) puts everything back", () => {
			setWaveEffect(1);
			setWaveEffect(0);
			expect(canvas.style.filter).toBe("contrast(1)");
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
			setWaveEffect(Number.NaN);
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});

		it("does nothing without a canvas", () => {
			delete g.MainCanvas;
			setWaveEffect(1);
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});
	});

	describe("spiral", () => {
		let ctx: Record<string, ReturnType<typeof vi.fn>> & { canvas: HTMLCanvasElement; globalAlpha: number; globalCompositeOperation: string };
		let getContext: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			ctx = { canvas, save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), clip: vi.fn(), translate: vi.fn(), rotate: vi.fn(), drawImage: vi.fn(), globalAlpha: 1, globalCompositeOperation: "source-over" } as never;
			g.MainCanvas = ctx;
			g.ChatRoomCharacterViewWidth = 1000;
			g.ChatRoomCharacterViewHeight = 1000;
			// jsdom has no 2D context for the spiral's artwork; any drawing call on it is fine.
			getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(new Proxy({}, { get: () => () => undefined, set: () => true }) as never);
		});

		afterEach(() => {
			getContext.mockRestore();
			delete g.ChatRoomCharacterViewWidth;
			delete g.ChatRoomCharacterViewHeight;
		});

		/** The spiral's turn so far, from the last draw: it turns counter-clockwise, so canvas rotation goes negative. */
		const angle = () => -(ctx.rotate.mock.calls.at(-1)?.[0] as number);

		/** Draws a frame every 100ms from `from` to `to`, like BC's draw loop. */
		const frames = (from: number, to: number) => { for (let t = from; t <= to; t += 100) drawSpiralOverlay(t); };

		it("is painted on the canvas, clipped to the room view, faintly, tinting rather than covering", () => {
			setSpiralEffect(1);
			frames(1000, 5000); // by now it has faded in
			expect(ctx.rect).toHaveBeenLastCalledWith(0, 0, 1000, 1000);
			expect(ctx.clip).toHaveBeenCalled();
			expect(ctx.drawImage).toHaveBeenCalled();
			expect(ctx.globalCompositeOperation).toBe("overlay");
			expect(ctx.globalAlpha).toBeGreaterThan(0);
			expect(ctx.globalAlpha).toBeLessThanOrEqual(0.65);
			expect(ctx.save).toHaveBeenCalledTimes(ctx.restore.mock.calls.length);
		});

		it("winds tighter and tighter toward the middle until it is a point, and widens evenly outward", () => {
			const points: [number, number][] = [];
			getContext.mockReturnValue(new Proxy({}, {
				get: (_t, prop) => (prop === "moveTo" || prop === "lineTo" ? (x: number, y: number) => points.push([x, y]) : () => undefined),
				set: () => true,
			}) as never);
			setSpiralEffect(1);
			frames(1000, 1200);
			expect(points.length).toBeGreaterThan(100);
			const centre = 700;
			const radii = points.map(([x, y]) => Math.hypot(x - centre, y - centre));
			// the arm ends in a point at the middle (under a pixel across) ...
			expect(Math.min(...radii)).toBeLessThan(1);
			// ... and never spills past the artwork's reach by more than a band
			expect(Math.max(...radii)).toBeLessThan(centre * 1.5);
			// each turn is the same multiple wider than the one inside it
			const along = points.slice(0, points.length / 2); // the outer edge, from the middle out
			const r = (i: number) => Math.hypot(along[i][0] - centre, along[i][1] - centre);
			const perTurn = Math.round(along.length / (Math.log(700 / 0.4) / (Math.log(1.9) / (Math.PI * 2)) / (Math.PI * 2)));
			const ratioA = r(Math.floor(along.length * 0.5) + perTurn) / r(Math.floor(along.length * 0.5));
			const ratioB = r(Math.floor(along.length * 0.8) + perTurn) / r(Math.floor(along.length * 0.8));
			expect(ratioA).toBeCloseTo(1.9, 1);
			expect(ratioB).toBeCloseTo(1.9, 1);
		});

		it("has soft edges, blurred into its artwork", () => {
			const set: Record<string, unknown> = {};
			getContext.mockReturnValue(new Proxy(set, {
				get: (t, prop) => (prop in t ? t[prop as string] : () => undefined),
				set: (t, prop, value) => { t[prop as string] = value; return true; },
				has: () => true,
			}) as never);
			g.Player.GraphicsSettings = { AllowBlur: true };
			setSpiralEffect(1);
			frames(1000, 1200);
			expect(String(set.filter)).toMatch(/^blur\([1-9]\d*(\.\d+)?px\)$/);
		});

		it("keeps crisp edges when the player's BC preferences turn blur off, and follows the preference as it changes", () => {
			const set: Record<string, unknown> = {};
			getContext.mockReturnValue(new Proxy(set, {
				get: (t, prop) => (prop in t ? t[prop as string] : () => undefined),
				set: (t, prop, value) => { t[prop as string] = value; return true; },
				has: () => true,
			}) as never);
			g.Player.GraphicsSettings = { AllowBlur: false };
			setSpiralEffect(1);
			frames(1000, 1200);
			expect(set.filter).toBeUndefined();
			g.Player.GraphicsSettings.AllowBlur = true;
			frames(1300, 1400);
			expect(String(set.filter)).toMatch(/^blur\(/);
			delete set.filter;
			g.Player.GraphicsSettings.AllowBlur = false;
			frames(1500, 1600);
			expect(set.filter).toBeUndefined();
		});

		it("follows BC's room view, not the whole canvas", () => {
			g.ChatRoomCharacterViewWidth = 800;
			g.ChatRoomCharacterViewHeight = 600;
			setSpiralEffect(1);
			frames(1000, 5000);
			expect(ctx.rect).toHaveBeenLastCalledWith(0, 0, 800, 600);
			expect(ctx.translate).toHaveBeenLastCalledWith(400, 300);
		});

		it("turns by the configured time, and a faster setting turns further in the same time", () => {
			const turned = (seconds: number) => {
				clearScreenEffects();
				ctx.rotate.mockClear();
				setSpiralEffect(1, undefined, seconds);
				frames(1000, 3000);
				const start = angle();
				frames(3100, 3700); // 0.7s on, short enough that the angle doesn't wrap past a full turn
				return (angle()) - start;
			};
			const slow = turned(9);
			const fast = turned(3);
			expect(slow).toBeGreaterThan(0);
			expect(fast / slow).toBeCloseTo(3, 0);
			// a full turn takes the set time
			expect(turned(10)).toBeCloseTo(Math.PI * 2 * 0.7 / 10, 2);
		});

		it("clamps the turn time to the fastest allowed, ignoring nonsense", () => {
			setSpiralEffect(1, undefined, 0);
			frames(1000, 1500);
			const start = angle();
			frames(1600, 1700); // 0.2s on from the first reading: 0.4 of a turn at the fastest (0.5s) setting
			expect(angle() - start).toBeCloseTo(Math.PI * 2 * 0.4, 1);
			expect(() => setSpiralEffect(1, undefined, Number.NaN)).not.toThrow();
		});

		it("doesn't jump when the speed changes", () => {
			setSpiralEffect(1, undefined, 10);
			frames(1000, 3000);
			const before = angle();
			setSpiralEffect(1, undefined, 2);
			drawSpiralOverlay(3100);
			const after = angle();
			// one 100ms frame at the new 2s speed is about 0.31 rad; a jump would be far more
			expect(after - before).toBeLessThan(0.4);
		});

		it("eases in and out instead of popping", () => {
			setSpiralEffect(1);
			drawSpiralOverlay(1000);
			drawSpiralOverlay(1500);
			expect(spiralAlpha()).toBeGreaterThan(0);
			expect(spiralAlpha()).toBeLessThan(1);
			frames(1600, 6000);
			expect(spiralAlpha()).toBe(1);
			setSpiralEffect(0);
			frames(6100, 6500);
			expect(spiralAlpha()).toBeGreaterThan(0);
			frames(6600, 12000);
			expect(spiralAlpha()).toBe(0);
			ctx.drawImage.mockClear();
			drawSpiralOverlay(13000);
			expect(ctx.drawImage).not.toHaveBeenCalled();
		});

		it("draws nothing while off, and without a canvas", () => {
			drawSpiralOverlay(1000);
			expect(ctx.drawImage).not.toHaveBeenCalled();
			setSpiralEffect(1);
			delete g.MainCanvas;
			expect(() => { drawSpiralOverlay(1000); drawSpiralOverlay(5000); }).not.toThrow();
		});

		it("is in the hypno purple by default, and the target is clamped", () => {
			setSpiralEffect(5);
			expect(spiralTarget()).toBe(1);
			setSpiralEffect(Number.NaN);
			expect(spiralTarget()).toBe(0);
			expect(HYPNO_SPIRAL_COLOR).toBe("#A020F0");
		});

		it("clearScreenEffects drops the spiral at once, along with the wave", () => {
			setSpiralEffect(1);
			frames(1000, 5000);
			setWaveEffect(1);
			clearScreenEffects();
			expect(spiralTarget()).toBe(0);
			expect(spiralAlpha()).toBe(0);
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});
	});

	describe("driven by the injector", () => {
		let injector: InjectorModule;
		let states: StateModule;
		let hypno: HypnoModule;

		beforeAll(() => {
			[, , , , injector, hypno, states] = boot(
				new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
				new InjectorModule(), new HypnoModule(), new StateModule(),
			);
			vi.useFakeTimers();
		});

		beforeEach(() => {
			resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
			states.init();
			hypno.init();
			injector.init();
			Object.assign(injector.settings, { enabled: true, enableDrugVisuals: true });
			injector.suggestibleLevel = 0;
			injector.mindControlLevel = 0;
			g.Player.GraphicsSettings = { AllowBlur: true };
		});

		afterEach(() => {
			injector.suggestibleLevel = 0;
			injector.UpdateScreenEffects();
		});

		it("the suggestible bar sways the screen, more as it fills, and stops when it empties", () => {
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier / 4;
			const low = Number(displacement()?.getAttribute("scale"));
			expect(low).toBeGreaterThan(0);
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			expect(Number(displacement()?.getAttribute("scale"))).toBeGreaterThan(low);
			injector.suggestibleLevel = 0;
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});

		it("not when visuals are off, the module is off, or blur is not allowed", () => {
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			expect(document.getElementById("lscg-wave-filter")).not.toBeNull();
			injector.settings.enableDrugVisuals = false;
			injector.UpdateScreenEffects();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
			injector.settings.enableDrugVisuals = true;
			g.Player.GraphicsSettings.AllowBlur = false;
			injector.UpdateScreenEffects();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
			g.Player.GraphicsSettings.AllowBlur = true;
			injector.settings.enabled = false;
			injector.UpdateScreenEffects();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});

		it("the swaying screen has its own switch, leaving the tint and blur and the spiral alone", () => {
			g.Player.ImmersionSettings = { AllowTints: true };
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			injector.Brainwash();
			injector.UpdateScreenEffects();
			expect(document.getElementById("lscg-wave-filter")).not.toBeNull();
			injector.settings.enableSuggestibleWave = false;
			injector.UpdateScreenEffects();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
			expect(canvas.style.filter).toBe("contrast(1)");
			expect(g.Player.GetTints()[0]).toMatchObject({ g: 217 });
			expect(g.Player.GetBlurLevel()).toBeGreaterThan(0);
			expect(spiral()).not.toBeNull();
			injector.settings.enableSuggestibleWave = true;
			injector.SnapBack();
		});

		it("the spiral has its own switch too, leaving the wave alone", () => {
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			injector.Brainwash();
			g.Player.LSCG.HypnoModule.enableSpiralOverlay = false;
			injector.UpdateScreenEffects();
			expect(spiral()).toBeNull();
			expect(document.getElementById("lscg-wave-filter")).not.toBeNull();
			g.Player.LSCG.HypnoModule.enableSpiralOverlay = true;
			injector.SnapBack();
		});

		it("the spiral appears while hypnotized, and goes when they snap out", () => {
			injector.Brainwash();
			injector.UpdateScreenEffects();
			expect(spiral()).not.toBeNull();
			injector.SnapBack();
			injector.UpdateScreenEffects();
			expect(spiral()).toBeNull();
		});

		it("a building mind-control bar shows a fainter spiral, and the player can turn it off", () => {
			injector.mindControlLevel = injector.mindControlMax * injector.drugLevelMultiplier / 2;
			expect(spiral()).not.toBeNull();
			g.Player.LSCG.HypnoModule.enableSpiralOverlay = false;
			injector.UpdateScreenEffects();
			expect(spiral()).toBeNull();
		});

		it("the suggestible has a faint green tint and a blur, only where the player's BC preferences allow them", () => {
			g.Player.ImmersionSettings = { AllowTints: true };
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			expect(g.Player.HasTints()).toBe(true);
			const [tint] = g.Player.GetTints();
			expect(tint).toMatchObject({ r: 76, g: 217, b: 100 });
			expect(tint.a).toBeGreaterThan(0);
			expect(tint.a).toBeLessThanOrEqual(0.25);
			expect(g.Player.GetBlurLevel()).toBeGreaterThan(0);

			// more suggestible, more green
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier / 4;
			expect(g.Player.GetTints()[0].a).toBeLessThan(tint.a);

			// BC preferences have the last word
			g.Player.ImmersionSettings = { AllowTints: false };
			expect(g.Player.GetTints()).toEqual([]);
			g.Player.ImmersionSettings = { AllowTints: true };
			g.Player.GraphicsSettings.AllowBlur = false;
			expect(g.Player.GetBlurLevel()).toBe(0);

			// and so do the drug visuals
			g.Player.GraphicsSettings.AllowBlur = true;
			injector.settings.enableDrugVisuals = false;
			expect(g.Player.GetTints()).toEqual([]);
			expect(g.Player.GetBlurLevel()).toBe(0);
		});

		it("the horny red tint is unchanged, and mixes with the green", () => {
			g.Player.ImmersionSettings = { AllowTints: true };
			injector.hornyLevel = 100;
			expect(g.Player.GetTints()).toHaveLength(1);
			expect(g.Player.GetTints()[0]).toMatchObject({ r: 254, g: 44, b: 84 });
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			expect(g.Player.GetTints()).toHaveLength(2);
			injector.hornyLevel = 0;
		});

		it("a cure clears the effects", () => {
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			injector.Brainwash();
			injector.DoCure();
			expect(spiral()).toBeNull();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});
	});
});
