// Milestone-2 smoke test: proves the real-BC loader (test/harness/bc-loader.ts)
// works end to end -- real Asset/AssetGroup data, a real Character, and a real
// LSCG module booted against real (not faked) `ActivityCheckPrerequisite`/
// `ChatRoomMessageRunExtractors`/etc.
import { describe, expect, it } from "vitest";
import { registerModule, getModule } from "modules";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("real BC client load", () => {
	it("loads real Asset/AssetGroup data", () => {
		expect(g.Asset.length).toBeGreaterThan(1000);
		expect(g.AssetGroup.length).toBeGreaterThan(20);
		expect(g.GameVersion).toBe("R132");
	});

	it("wearing a real gag blocks the mouth via real Character/Asset logic", () => {
		const gag = g.Asset.find((a: { Group: { Name: string }; Effect?: string[] }) =>
			a.Group.Name === "ItemMouth" && a.Effect?.includes("BlockMouth"));
		expect(gag).toBeTruthy();

		expect(g.Player.IsMouthBlocked()).toBe(false);

		g.Player.Appearance.push({ Asset: gag, Property: {} });
		g.Player.Effect = g.CharacterGetEffects(g.Player);

		expect(g.Player.IsMouthBlocked()).toBe(true);
	});

	it("boots a real LSCG module (ActivityModule) against the real client without throwing", () => {
		// ActivityModule's constructor calls Consent().RegisterFlow(...) (the
		// high-five flow) and consent.load() calls Core().RegisterCommandListener(...),
		// so both must be registered (and Consent's own load() run) first.
		const core = registerModule(new CoreModule());
		core.init();
		const consent = registerModule(new ConsentModule());
		consent.load();
		const activities = registerModule(new ActivityModule());
		activities.init();
		expect(() => activities.load()).not.toThrow();
		activities.run();

		expect(getModule<ActivityModule>("ActivityModule")).toBe(activities);
		// AddActivity() (called during construction) should have registered LSCG's
		// custom activities into the *real* ActivityFemale3DCG array.
		const lscgActivities = (g.ActivityFemale3DCG as { Name: string }[]).filter(a => a.Name.startsWith("LSCG_"));
		expect(lscgActivities.length).toBeGreaterThan(0);
	});
});
