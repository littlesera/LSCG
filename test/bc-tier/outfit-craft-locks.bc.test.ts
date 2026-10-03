// A crafted item with a lock, carried through an outfit: worn on the editor's preview character with the craft (what the
// editor's Crafted tab does), bundled for the outfit code, then applied to another character with ApplyItem. Against real
// BC crafting, lock and bundling code.
import { beforeEach, describe, expect, it } from "vitest";
import { ApplyItem, BC_ItemsToItemBundles } from "utils";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function makeCharacter(memberNumber: number): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	return C;
}

function craftWithLock(lock: string): CraftingItem {
	return {
		Name: "Locked Gag", Description: "", Color: "#ff0000", Lock: lock, Item: "BallGag", Private: false, Property: "Normal",
		Effects: {}, Type: null, TypeRecord: null, ItemProperty: null, MemberName: "Tester", MemberNumber: 1, Partial: false,
	} as never as CraftingItem;
}

/** Wear the craft the way the editor does, then bundle it the way the outfit code does. */
function craftedBundle(lock: string): { worn: Item, bundle: ItemBundle } {
	const preview = makeCharacter(50);
	const worn = g.InventoryWear(preview, "BallGag", "ItemMouth", undefined, 0, g.Player.MemberNumber, craftWithLock(lock), false) as Item;
	return { worn, bundle: BC_ItemsToItemBundles([worn])[0] };
}

describe("a crafted item's lock through an outfit (real BC data)", () => {
	beforeEach(() => {
		g.LogQuery = () => false;
		g.LogQueryRemote = () => false;
		g.ChatRoomCharacter = [];
		g.Player.OnlineSettings = { DisableAnimations: true }; // read when unlocking refreshes the character
		// BC validates a craft against the wearer's inventory (it drops a lock the player doesn't own), so the crafter owns these
		g.Player.Inventory = [
			{ Group: "ItemMouth", Name: "BallGag" }, { Group: "ItemMisc", Name: "MetalPadlock" },
			{ Group: "ItemMisc", Name: "HighSecurityPadlock" }, { Group: "ItemMisc", Name: "OwnerPadlock" },
		];
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
			// Drawing and animation aren't loaded by this harness either; nothing here draws
			globalThis.AnimationPurge = globalThis.CharacterLoadCanvas = function () {};
			// Validation.js isn't loaded; this is what unlocking has to remove from an item's properties
			globalThis.ValidationDeleteLock = function (props) { delete props.LockedBy; delete props.LockMemberNumber; delete props.LockMemberName; delete props.LockMessage; };
			// Appearance.js isn't loaded by this harness; this is CharacterAppearanceSetItem minus swapping out a previous item
			globalThis.CharacterAppearanceSetItem = function (C, Group, ItemAsset, NewColor, DifficultyFactor) {
				if (!ItemAsset) return null;
				const NA = AppearanceItem.fromAsset(ItemAsset, { color: NewColor ?? undefined, difficulty: ItemAsset.Difficulty + (DifficultyFactor ?? 0) });
				ExtendedItemInit(C, NA, false, false);
				C.Appearance.push(NA);
				return NA;
			};
		`);
	});

	it("a craft's lock goes on the worn item and into the outfit bundle", () => {
		const { worn, bundle } = craftedBundle("MetalPadlock");
		expect(worn.Property?.LockedBy).toBe("MetalPadlock");
		expect(bundle.Property?.LockedBy).toBe("MetalPadlock");
		expect(bundle.Craft?.Name).toBe("Locked Gag");
		expect(bundle.Color).toBe("#ff0000");
	});

	it("applying the bundle to someone puts the lock on, with or without locksafe", () => {
		const { bundle } = craftedBundle("MetalPadlock");
		for (const locksafe of [true, false]) {
			const item = ApplyItem(bundle, g.Player.MemberNumber, true, locksafe, makeCharacter(60 + Number(locksafe)));
			expect(item?.Property?.LockedBy, `locksafe ${locksafe}`).toBe("MetalPadlock");
			expect(item?.Craft?.Name).toBe("Locked Gag");
		}
	});

	it("a high-security lock keeps its key list through the bundle and the apply", () => {
		const { bundle } = craftedBundle("HighSecurityPadlock");
		expect(bundle.Property?.LockedBy).toBe("HighSecurityPadlock");
		const item = ApplyItem(bundle, g.Player.MemberNumber, true, true, makeCharacter(65));
		expect(item?.Property?.LockedBy).toBe("HighSecurityPadlock");
		expect(item?.Property?.MemberNumberListKeys).toBe(bundle.Property?.MemberNumberListKeys);
	});

	it("an owner-only lock is dropped on apply when the applier does not own the wearer, and kept without locksafe", () => {
		const { bundle } = craftedBundle("OwnerPadlock");
		expect(bundle.Property?.LockedBy).toBe("OwnerPadlock");
		const safe = ApplyItem(bundle, g.Player.MemberNumber, true, true, makeCharacter(70));
		const unsafe = ApplyItem(bundle, g.Player.MemberNumber, true, false, makeCharacter(71));
		expect(safe?.Property?.LockedBy).toBeUndefined();
		expect(unsafe?.Property?.LockedBy).toBe("OwnerPadlock");
	});
});
