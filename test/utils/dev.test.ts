// utilities/dev.ts: telling a development build from a release.
import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevBuild } from "Utilities/dev";

describe("isDevBuild", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		try { localStorage.removeItem("LSCG_DEV"); } catch { /* none */ }
	});

	it("is false in a release build", () => {
		expect(isDevBuild()).toBe(false);
	});

	it("is true when the build defines LSCG_DEV", () => {
		vi.stubGlobal("LSCG_DEV", true);
		expect(isDevBuild()).toBe(true);
		vi.stubGlobal("LSCG_DEV", false);
		expect(isDevBuild()).toBe(false);
	});

	it("can be turned on for one browser with localStorage.LSCG_DEV", () => {
		localStorage.setItem("LSCG_DEV", "1");
		expect(isDevBuild()).toBe(true);
		localStorage.setItem("LSCG_DEV", "0");
		expect(isDevBuild()).toBe(false);
	});

	it("is false rather than throwing when storage is blocked", () => {
		vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); } });
		expect(isDevBuild()).toBe(false);
	});
});
