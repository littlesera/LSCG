// MiscModule's net gun: HasNetgun (asset + keyword match on the queried character's own handheld), its on/off switch
// (separate from the drug enhancements it used to be part of), and bringing its settings over from those once.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { MiscModule } from "Modules/misc";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";

describe("MiscModule net gun", () => {
	let misc: MiscModule;
	let handheldGroup: ReturnType<typeof makeGroup>;

	beforeAll(() => {
		[, misc] = boot(new CoreModule(), new MiscModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		misc.init();
		handheldGroup = makeGroup({ Name: "ItemHandheld" });
	});

	function someoneElse(): FixtureCharacter {
		return addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
	}

	describe("HasNetgun", () => {
		it("returns false for a null character", () => {
			expect(misc.HasNetgun(null)).toBe(false);
		});

		it("reflects the queried character's OWN handheld inventory, not Player's", () => {
			const other = someoneElse();
			wear(other, makeItem(makeAsset(handheldGroup, { Name: "MedicalInjector" }), { Craft: { Name: "Net Gun", Description: "a net gun" } }));
			expect(player().Appearance.find(i => i.Asset.Group.Name === "ItemHandheld")).toBeUndefined();
			expect(misc.HasNetgun(other as never)).toBe(true);
		});

		it("false when the character's handheld asset isn't in AllowedNetGuns", () => {
			const other = someoneElse();
			wear(other, makeItem(makeAsset(handheldGroup, { Name: "GlassFilled" }), { Craft: { Name: "Net Gun", Description: "a net gun" } }));
			expect(misc.HasNetgun(other as never)).toBe(false);
		});

		it("false when the character's crafted item text doesn't match a netgun keyword", () => {
			const other = someoneElse();
			wear(other, makeItem(makeAsset(handheldGroup, { Name: "MedicalInjector" }), { Craft: { Name: "Sedative Shot", Description: "" } }));
			expect(misc.HasNetgun(other as never)).toBe(false);
		});

		it("false when the character isn't holding anything crafted at all", () => {
			expect(misc.HasNetgun(someoneElse() as never)).toBe(false);
		});
	});

	describe("on/off", () => {
		it("starts off, and works on its own switch whatever the drug enhancements are set to", () => {
			expect(misc.netgunEnabled).toBe(false);
			misc.settings.netgunEnabled = true;
			player().LSCG.InjectorModule = { enabled: false } as never;
			expect(misc.netgunEnabled).toBe(true);
		});

		it("is off while LSCG itself is off", () => {
			misc.settings.netgunEnabled = true;
			player().LSCG.GlobalModule.enabled = false;
			expect(misc.netgunEnabled).toBe(false);
		});
	});

	describe("coming over from the drug enhancements", () => {
		function startWith(injector: object) {
			resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true }, InjectorModule: injector } as never });
			misc.init();
		}

		it("stays on, chaotic and with its stats, for someone who had drug enhancements on", () => {
			startWith({ enabled: true, netgunIsChaotic: true, netgunKeywords: ["net gun"], stats: { totalNettingsCount: 7, successfulNettingsCount: 3, curedCount: 2 } });
			expect(misc.settings.netgunEnabled).toBe(true);
			expect(misc.settings.netgunIsChaotic).toBe(true);
			expect(misc.settings.stats).toEqual({ totalNettingsCount: 7, successfulNettingsCount: 3 });
			// Moved, not copied: the drug settings keep only their own
			expect(player().LSCG.InjectorModule).toEqual({ enabled: true, stats: { curedCount: 2 } });
		});

		it("starts off for someone who didn't", () => {
			startWith({ enabled: false });
			expect(misc.settings.netgunEnabled).toBe(false);
			expect(misc.settings.stats).toEqual({ totalNettingsCount: 0, successfulNettingsCount: 0 });
		});

		it("only happens once", () => {
			startWith({ enabled: true });
			misc.settings.netgunEnabled = false;
			misc.init();
			expect(misc.settings.netgunEnabled).toBe(false);
		});
	});
});
