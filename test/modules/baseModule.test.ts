import { beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { resetWorld } from "../harness/world";

// BaseModule.registerDefaultSettings()/settings merge semantics, exercised through
// CoreModule (settingsStorage "GlobalModule") since BaseModule itself is abstract.
// This only calls init(), never load(), so it needs no hookFunction targets.
describe("BaseModule settings merge", () => {
	beforeEach(() => {
		resetWorld();
	});

	it("registers defaults into Player.LSCG[storage] on init()", () => {
		const core = new CoreModule();
		core.init();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((globalThis as any).Player.LSCG.GlobalModule).toEqual(core.defaultSettings);
	});

	it("existing stored values win over defaults (shallow merge)", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;
		g.Player.LSCG.GlobalModule = { enabled: true, seeSharedCrafts: false };

		const core = new CoreModule();
		core.init();

		expect(g.Player.LSCG.GlobalModule.enabled).toBe(true); // kept from existing
		expect(g.Player.LSCG.GlobalModule.seeSharedCrafts).toBe(false); // kept from existing
		expect(g.Player.LSCG.GlobalModule.blockSettingsWhileRestrained).toBe(false); // filled from defaults
	});

	it("the settings getter lazily creates Player.LSCG and defaults if missing entirely", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;
		delete g.Player.LSCG;
		const core = new CoreModule();

		expect(core.settings).toEqual(core.defaultSettings);
		expect(g.Player.LSCG).toBeDefined();
	});

	it("the settings getter lazily fills in just this module's slot if Player.LSCG exists but is empty", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;
		g.Player.LSCG = {};
		const core = new CoreModule();

		expect(core.settings).toEqual(core.defaultSettings);
	});

	it("Enabled tracks GlobalModule.enabled once in a chat room", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;
		const core = new CoreModule();
		core.init();

		g.Player.LSCG.GlobalModule.enabled = false;
		expect(core.Enabled).toBe(false);

		g.Player.LSCG.GlobalModule.enabled = true;
		expect(core.Enabled).toBe(true); // ServerPlayerIsInChatRoom() is stubbed true by default
	});
});
