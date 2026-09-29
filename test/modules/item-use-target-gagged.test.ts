// The "TargetIsGagged" custom prerequisite (item-use.ts, the "TakeGag" activity): whether
// the acted character is wearing a recognized gag/neck-gag the acting character can take.
// Covers the specific `!item && !ValidationCanRemoveItem(...)` bug -- that check sits inside
// a block already guarded by `!!item`, so it could never actually run; ValidationCanRemoveItem
// blocking removal must now correctly veto the prerequisite.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemUseModule } from "Modules/item-use";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld } from "../harness/world";
import { makeCharacter, makeGroup, makeAsset, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";

describe("TargetIsGagged custom prerequisite (TakeGag activity)", () => {
	let activities: ActivityModule;
	let itemUse: ItemUseModule;

	beforeAll(() => {
		[, , activities, itemUse] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule());
		itemUse.run();
	});

	function prereq() {
		const found = activities.CustomPrerequisiteFuncs.get("TargetIsGagged" as never);
		if (!found) throw new Error("TargetIsGagged was not registered -- has item-use.ts's run() changed?");
		return found;
	}

	beforeEach(() => {
		resetWorld();
	});

	function gagWearer(): FixtureCharacter {
		const mouthGroup = makeGroup({ Name: "ItemMouth" });
		const mouthAsset = makeAsset(mouthGroup, { Name: "BallGag" }); // real GagTargets MouthItemName
		const acted = makeCharacter({});
		wear(acted, makeItem(mouthAsset));
		(acted as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
		return acted;
	}

	it("is true for a recognized, unlocked gag with an empty-handed acting character", () => {
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(true);
	});

	it("is false when the acting character is restrained", () => {
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2, flags: { restrained: true } });
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(false);
	});

	it("is false when the acting character is already holding an item", () => {
		const acted = gagWearer();
		const handGroup = makeGroup({ Name: "ItemHandheld" });
		const handAsset = makeAsset(handGroup, { Name: "Wand" });
		const acting = makeCharacter({ MemberNumber: 2 });
		wear(acting, makeItem(handAsset));
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(false);
	});

	it("is false when the gag is locked", () => {
		const mouthGroup = makeGroup({ Name: "ItemMouth" });
		const mouthAsset = makeAsset(mouthGroup, { Name: "BallGag" });
		const acted = makeCharacter({});
		wear(acted, makeItem(mouthAsset, { Property: { Effect: ["Lock"] } }));
		(acted as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(false);
	});

	it("is false when ValidationCanRemoveItem blocks removal", () => {
		vi.mocked(globalThis.ValidationCanRemoveItem).mockReturnValueOnce(false);
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(false);
	});

	it("is true when ValidationCanRemoveItem allows removal (explicit true, not just the default stub)", () => {
		vi.mocked(globalThis.ValidationCanRemoveItem).mockReturnValueOnce(true);
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, {} as never)).toBe(true);
	});
});

describe("TargetIsGaggedWithNecklace custom prerequisite (GagToNecklace activity)", () => {
	let activities: ActivityModule;
	let itemUse: ItemUseModule;

	beforeAll(() => {
		[, , activities, itemUse] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule());
		itemUse.run();
	});

	function prereq() {
		const found = activities.CustomPrerequisiteFuncs.get("TargetIsGaggedWithNecklace" as never);
		if (!found) throw new Error("TargetIsGaggedWithNecklace was not registered -- has item-use.ts's run() changed?");
		return found;
	}

	beforeEach(() => {
		resetWorld();
	});

	function gagWearer(): FixtureCharacter {
		const mouthGroup = makeGroup({ Name: "ItemMouth" });
		const mouthAsset = makeAsset(mouthGroup, { Name: "BallGag" }); // real GagTargets: MouthItemName + NeckItemName
		const acted = makeCharacter({});
		wear(acted, makeItem(mouthAsset));
		(acted as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
		return acted;
	}

	it("is true for a recognized gag with the neck slot empty", () => {
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, makeGroup({ Name: "ItemMouth" }) as never)).toBe(true);
	});

	it("is false when the mouth group is blocked", () => {
		vi.mocked(globalThis.InventoryGroupIsBlocked).mockReturnValueOnce(true);
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, makeGroup({ Name: "ItemMouth" }) as never)).toBe(false);
	});

	it("is false when the gag is locked", () => {
		const mouthGroup = makeGroup({ Name: "ItemMouth" });
		const mouthAsset = makeAsset(mouthGroup, { Name: "BallGag" });
		const acted = makeCharacter({});
		wear(acted, makeItem(mouthAsset, { Property: { Effect: ["Lock"] } }));
		(acted as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, makeGroup({ Name: "ItemMouth" }) as never)).toBe(false);
	});

	it("is false when ValidationCanRemoveItem blocks removal", () => {
		vi.mocked(globalThis.ValidationCanRemoveItem).mockReturnValueOnce(false);
		const acted = gagWearer();
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, makeGroup({ Name: "ItemMouth" }) as never)).toBe(false);
	});

	it("is false when the neck slot is already occupied", () => {
		const acted = gagWearer();
		const necklaceGroup = makeGroup({ Name: "Necklace" });
		const necklaceAsset = makeAsset(necklaceGroup, { Name: "SomethingElse" });
		wear(acted, makeItem(necklaceAsset));
		const acting = makeCharacter({ MemberNumber: 2 });
		expect(prereq()(acting as never, acted as never, makeGroup({ Name: "ItemMouth" }) as never)).toBe(false);
	});
});
