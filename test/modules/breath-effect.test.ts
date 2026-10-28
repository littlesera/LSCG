// Screen pulses are DOM elements over the canvas (so they cover the DOM settings screens too), fading like BC's DrawFlashScreen.
// Switching on Magic pulses purple to sci-fi beeps; switching on breathplay pulses black to the collar's hydraulic tightening.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { pulseScreen } from "../../src/Dom/pulse";
import { GuiCollar, breathplayEnabledEffect } from "../../src/Settings/collar";
import { GuiMagic } from "../../src/Settings/magic";
import { boot, resetWorld } from "../harness/world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

const pulses = () => Array.from(document.querySelectorAll<HTMLElement>(".lscg-pulse"));

describe("screen pulses", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		g.AudioPlaySoundEffect = vi.fn();
		g.AudioPlayInstantSound = vi.fn();
		g.AudioShouldSilenceSound = vi.fn(() => false);
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.replaceChildren();
		delete g.MainCanvas.canvas;
	});

	describe("pulseScreen", () => {
		it("lays a coloured, click-through element over the page", () => {
			pulseScreen("#800080", 500, 1500);
			const [pulse] = pulses();
			expect(pulses()).toHaveLength(1);
			expect(pulse.style.background).toBe("rgb(128, 0, 128)");
			expect(pulse.style.pointerEvents).toBe("none");
			expect(pulse.style.position).toBe("fixed");
			expect(Number(pulse.style.zIndex)).toBeGreaterThan(1000);
		});

		it("covers the game canvas, where the DOM screens are, when there is one", () => {
			g.MainCanvas.canvas = { clientWidth: 1600, clientHeight: 800, offsetLeft: 100, offsetTop: 50 };
			pulseScreen("#000000", 500, 1500);
			expect(pulses()[0].style).toMatchObject({ left: "100px", top: "50px", width: "1600px", height: "800px" });
		});

		it("is gone when its time is up, even if the browser never reports the animation finishing", () => {
			pulseScreen("#000000", 500, 1500);
			vi.advanceTimersByTime(650);
			expect(pulses()).toHaveLength(1);
			vi.advanceTimersByTime(100);
			expect(pulses()).toHaveLength(0);
		});

		describe("with animations available", () => {
			let animate: ReturnType<typeof vi.fn>;
			let animation: { onfinish: null | (() => void) };

			beforeEach(() => {
				animation = { onfinish: null };
				animate = vi.fn(() => animation);
				HTMLElement.prototype.animate = animate as never;
			});

			afterEach(() => { delete (HTMLElement.prototype as { animate?: unknown }).animate; });

			it("fades out over the duration, like BC's own flash: full at first, nothing at the end, never brightening", () => {
				pulseScreen("#800080", 500, 1500);
				const [frames, timing] = animate.mock.calls[0] as [{ offset: number; opacity: number }[], KeyframeAnimationOptions];
				expect(timing.duration).toBe(500);
				expect(frames[0]).toMatchObject({ offset: 0, opacity: 1 });
				expect(frames.at(-1)).toMatchObject({ offset: 1, opacity: 0 });
				frames.slice(1).forEach((f, i) => expect(f.opacity).toBeLessThanOrEqual(frames[i].opacity));
				// BC: alpha = intensity * (1 - e^(-remaining/2500)) out of 255; at 250 ms left, 1500 gives about 0.56
				expect(frames.find(f => f.offset === 0.5)!.opacity).toBeCloseTo(0.56, 1);
			});

			it("a weaker flash is dimmer, and is removed as soon as the animation ends", () => {
				pulseScreen("#FFFFFF", 500, 100);
				const frames = (animate.mock.calls[0] as [{ opacity: number }[]])[0];
				expect(frames[0].opacity).toBeLessThan(0.1);
				expect(pulses()).toHaveLength(1);
				animation.onfinish?.();
				expect(pulses()).toHaveLength(0);
			});
		});
	});

	describe("breathplayEnabledEffect", () => {
		it("pulses black for as long as Magic's pulse, to the collar's tightening sound, and nothing else", () => {
			breathplayEnabledEffect();
			expect(pulses()).toHaveLength(1);
			expect(pulses()[0].style.background).toBe("rgb(0, 0, 0)");
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledOnce();
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledWith("HydraulicLock");
			vi.advanceTimersByTime(3000);
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledOnce(); // no heartbeat, no second sound
			expect(g.AudioPlayInstantSound).not.toHaveBeenCalled();
		});

		it("is gone after Magic's half second", () => {
			breathplayEnabledEffect();
			vi.advanceTimersByTime(750);
			expect(pulses()).toHaveLength(0);
		});

		it("stays silent when sound is silenced, but still pulses", () => {
			g.AudioShouldSilenceSound = vi.fn(() => true);
			breathplayEnabledEffect();
			expect(pulses()).toHaveLength(1);
			vi.advanceTimersByTime(3000);
			expect(g.AudioPlaySoundEffect).not.toHaveBeenCalled();
		});
	});

	describe("the settings screens", () => {
		let collar: CollarModule;
		let magic: MagicModule;

		beforeAll(() => {
			[, , , , collar, magic] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule(), new StateModule());
		});

		beforeEach(() => {
			resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true }, StateModule: { states: [] }, MiscModule: {} } as never });
			collar.init();
			magic.init();
			(Player as unknown as { GetDifficulty: () => number }).GetDifficulty = () => 0;
		});

		it("'Take a Deep Breath' enables breathplay and pulses black, once", () => {
			collar.settings.breathplayEnabled = false;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const root = (new GuiCollar(collar) as any).build() as HTMLElement;
			document.body.append(root);
			expect(pulses()).toHaveLength(0);
			(root.querySelector(".lscg-kit-promo footer button") as HTMLButtonElement).click();
			expect(collar.settings.breathplayEnabled).toBe(true);
			expect(pulses()).toHaveLength(1);
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledWith("HydraulicLock");
		});

		it("Magic's beeps stay silent when sound is silenced, but it still pulses", () => {
			magic.settings.enabled = false;
			g.AudioShouldSilenceSound = vi.fn(() => true);
			g.MouseIn = (x: number, y: number) => x === 800 && y === 740;
			g.PreferencePageCurrent = 1;
			g.CommonGetFontName = () => "Arial";
			g.MainCanvas.canvas = { clientWidth: 2000, clientHeight: 1000, offsetLeft: 0, offsetTop: 0 };
			new GuiMagic(magic).Click();
			vi.advanceTimersByTime(1000);
			expect(pulses()).toHaveLength(0); // done by now
			expect(g.AudioPlaySoundEffect).not.toHaveBeenCalled();
			delete g.PreferencePageCurrent;
			delete g.CommonGetFontName;
		});

		it("opening the screen with breathplay already on plays nothing", () => {
			collar.settings.breathplayEnabled = true;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			document.body.append((new GuiCollar(collar) as any).build());
			vi.advanceTimersByTime(3000);
			expect(pulses()).toHaveLength(0);
			expect(g.AudioPlaySoundEffect).not.toHaveBeenCalled();
		});

		it("signing for Magic pulses purple, over the DOM screen", () => {
			magic.settings.enabled = false;
			g.MouseIn = (x: number, y: number) => x === 800 && y === 740; // only the "Sign Here" button
			g.PreferencePageCurrent = 1;
			g.CommonGetFontName = () => "Arial";
			g.MainCanvas.canvas = { clientWidth: 2000, clientHeight: 1000, offsetLeft: 0, offsetTop: 0 }; // the DOM screen mounts over it
			new GuiMagic(magic).Click();
			expect(magic.settings.enabled).toBe(true);
			expect(pulses()).toHaveLength(1);
			expect(pulses()[0].style.background).toBe("rgb(128, 0, 128)");
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledWith("SciFiBeeps", 1);
			vi.advanceTimersByTime(1000);
			expect(g.AudioPlaySoundEffect).toHaveBeenCalledTimes(1);
			delete g.PreferencePageCurrent;
			delete g.CommonGetFontName;
		});
	});
});
