// MiscModule.unload(): the chloroform-event interval (started by the isChloroformed
// setter, not load() itself) must actually stop firing once the module unloads.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { MiscModule } from "Modules/misc";
import { boot } from "../harness/world";

describe("MiscModule", () => {
	beforeAll(() => {
		boot(new CoreModule());
		vi.useFakeTimers();
	});

	describe("unload", () => {
		it("clears the chloroform-event interval (started by isChloroformed=true) so it no longer fires after unload", () => {
			const fresh = new MiscModule();
			fresh.isChloroformed = true;
			const chloroEventSpy = vi.spyOn(fresh, "ChloroEvent");
			fresh.unload();
			vi.advanceTimersByTime(3 * 60_010); // 3x CHLOROFORM_TIMING.EVENT_INTERVAL
			expect(chloroEventSpy).not.toHaveBeenCalled();
		});
	});
});
