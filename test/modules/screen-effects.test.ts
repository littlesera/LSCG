// The screen effects layer (the suggestible's sway and the hypno spiral), and how the injector drives it.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { clearScreenEffects, setSpiralEffect, setWaveEffect, HYPNO_SPIRAL_COLOR } from "Dom/screenEffects";
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

	const spiral = () => document.getElementById("lscg-spiral-layer");
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
		it("is a click-through layer over the game in the hypno purple", () => {
			setSpiralEffect(1);
			const layer = spiral();
			expect(layer).not.toBeNull();
			expect(layer?.style.pointerEvents).toBe("none");
			expect(layer?.querySelector("path")?.getAttribute("stroke")).toBe(HYPNO_SPIRAL_COLOR);
		});

		it("is one layer however often it is set, and follows the intensity", () => {
			setSpiralEffect(0.5);
			setSpiralEffect(1);
			expect(document.querySelectorAll("#lscg-spiral-layer")).toHaveLength(1);
			expect(Number(spiral()?.style.opacity)).toBeGreaterThan(0);
		});

		it("changing colour replaces it", () => {
			setSpiralEffect(1);
			setSpiralEffect(1, "#00ff00");
			expect(document.querySelectorAll("#lscg-spiral-layer")).toHaveLength(1);
			expect(spiral()?.querySelector("path")?.getAttribute("stroke")).toBe("#00ff00");
		});

		it("zero removes it, and clearScreenEffects removes both", () => {
			setSpiralEffect(1);
			setSpiralEffect(0);
			expect(spiral()).toBeNull();
			setSpiralEffect(1);
			setWaveEffect(1);
			clearScreenEffects();
			expect(spiral()).toBeNull();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
			expect(canvas.style.filter).toBe("contrast(1)");
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

		it("a cure clears the effects", () => {
			injector.suggestibleLevel = injector.suggestibleMax * injector.drugLevelMultiplier;
			injector.Brainwash();
			injector.DoCure();
			expect(spiral()).toBeNull();
			expect(document.getElementById("lscg-wave-filter")).toBeNull();
		});
	});
});
