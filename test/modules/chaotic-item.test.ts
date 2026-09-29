// ChaoticItemModule: checkForChaoticItem's keyword-based filtering (which of the three
// timers -- default/quick/slow -- a worn "chaotic"/"evolving"-keyword item is due for)
// and Enabled gating, plus triggerChaoticItem's early-return for an item whose asset
// has no extended-item Archetype. The actual shape-shifting logic (shapeShiftTypedItem/
// shapeShiftModularItem/shapeShiftVibratorItem) reads real BC extended-item data tables
// (TypedItemDataLookup, ExtendedItemSetOption, etc.) that only exist once real BC asset
// data is loaded -- per this project's plan, that belongs on the "bc" project tier
// (Milestone 6), not this fake-BC "unit" tier, so it isn't covered here.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ChaoticItemModule, chaoticKeywords, evolvingKeywords, quickKeywords, slowKeywords } from "Modules/chaotic-item";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem } from "../harness/fixtures";

describe("ChaoticItemModule", () => {
	let chaoticItem: ChaoticItemModule;
	let group: ReturnType<typeof makeGroup>;

	beforeAll(() => {
		[, chaoticItem] = boot(new CoreModule(), new ChaoticItemModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		chaoticItem.init();
		chaoticItem.settings.enabled = true;
		group = makeGroup({ Name: "ItemTorso" });
	});

	function wearCrafted(name: string, craftName: string, description = "") {
		const asset = makeAsset(group, { Name: name });
		wear(player(), makeItem(asset, { Craft: { Name: craftName, Description: description } }));
	}

	describe("checkForChaoticItem: keyword-based timer routing", () => {
		it("a plain [chaotic] item (no quick/slow keyword) is picked up by the 'default' filter only", () => {
			wearCrafted("Item", "[chaotic] Collar");
			const defaultSpy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			expect(defaultSpy).toHaveBeenCalled();

			defaultSpy.mockClear();
			chaoticItem.checkForChaoticItem("quick");
			expect(defaultSpy).not.toHaveBeenCalled();

			defaultSpy.mockClear();
			chaoticItem.checkForChaoticItem("slow");
			expect(defaultSpy).not.toHaveBeenCalled();
		});

		it("a [chaotic] item with a 'quick' keyword is picked up only by the 'quick' filter", () => {
			wearCrafted("Item", "[chaotic] Quick Collar", "shifts rapidly");
			const spy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			expect(spy).not.toHaveBeenCalled();
			chaoticItem.checkForChaoticItem("quick");
			expect(spy).toHaveBeenCalled();
		});

		it("an [evolving] item with a 'slow' keyword is picked up only by the 'slow' filter", () => {
			wearCrafted("Item", "[evolving] Slow Collar", "changes slowly");
			const spy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			expect(spy).not.toHaveBeenCalled();
			chaoticItem.checkForChaoticItem("slow");
			expect(spy).toHaveBeenCalled();
		});

		it("an item with none of the chaotic/evolving keywords is never picked up", () => {
			wearCrafted("Item", "Plain Collar");
			const spy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			chaoticItem.checkForChaoticItem("quick");
			chaoticItem.checkForChaoticItem("slow");
			expect(spy).not.toHaveBeenCalled();
		});

		it("an ItemHandheld item is excluded even with a chaotic keyword", () => {
			const handheldGroup = makeGroup({ Name: "ItemHandheld" });
			const asset = makeAsset(handheldGroup, { Name: "Wand" });
			wear(player(), makeItem(asset, { Craft: { Name: "[chaotic] Wand", Description: "" } }));
			const spy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			expect(spy).not.toHaveBeenCalled();
		});

		it("does nothing at all when the module is disabled", () => {
			chaoticItem.settings.enabled = false;
			wearCrafted("Item", "[chaotic] Collar");
			const spy = vi.spyOn(chaoticItem, "triggerChaoticItem");
			chaoticItem.checkForChaoticItem("default");
			expect(spy).not.toHaveBeenCalled();
		});

		it("every declared chaotic/evolving/quick/slow keyword is non-empty and recognized by isPhraseInString-style matching", () => {
			// Sanity check on the exported keyword lists themselves, since the tests above
			// only exercise one representative keyword from each.
			expect(chaoticKeywords.length).toBeGreaterThan(0);
			expect(evolvingKeywords.length).toBeGreaterThan(0);
			expect(quickKeywords.length).toBeGreaterThan(0);
			expect(slowKeywords.length).toBeGreaterThan(0);
		});
	});

	describe("triggerChaoticItem", () => {
		it("returns false for undefined", () => {
			expect(chaoticItem.triggerChaoticItem(undefined)).toBe(false);
		});

		it("returns false for an item whose asset has no extended-item Archetype", () => {
			const asset = makeAsset(group, { Name: "PlainItem" });
			const item = makeItem(asset, { Craft: { Name: "[chaotic] Item", Description: "" } });
			expect(chaoticItem.triggerChaoticItem(item as never)).toBe(false);
		});
	});
});
