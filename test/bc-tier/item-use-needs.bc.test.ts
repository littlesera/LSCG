// ItemUseModule.getItemsForActivityNeed (the CharacterItemsForActivity hook body,
// extracted for testability -- see item-use.ts) against real BC Character/Item/Asset
// objects. A representative sample of the need->items table, focused on the branches that
// actually depend on real BC semantics: C.FocusGroup-driven group resolution (GagTakeItem),
// real Item.Property reads (FellatioItem's AllowActivity), and real IsMouthBlocked/CanTalk
// gating (ChewableItem) -- as opposed to the many branches that are pure Asset.Name string
// matching a fake-tier fixture could equally exercise.
import { beforeEach, describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { CoreModule } from "Modules/core";
import { ItemUseModule } from "Modules/item-use";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function makeCharacter(memberNumber: number): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	return C;
}

function wear(C: Character, groupName: string, assetName: string, property: object = {}): Item {
	const asset = findAsset(groupName, assetName);
	const item = { Asset: asset, Property: property } as never as Item;
	(C as never as { Appearance: Item[] }).Appearance.push(item);
	return item;
}

describe("ItemUseModule.getItemsForActivityNeed (real BC data)", () => {
	let itemUse: ItemUseModule;

	beforeEach(() => {
		registerModule(new CoreModule());
		itemUse = registerModule(new ItemUseModule());
	});

	describe("GagTakeItem", () => {
		it("ItemMouth focus: a recognized gag on the mouth is returned", () => {
			const C = makeCharacter(2);
			const gag = wear(C, "ItemMouth", "BallGag");
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
			expect(itemUse.getItemsForActivityNeed(C, "GagTakeItem", [])).toEqual([gag]);
		});

		it("ItemMouth focus: an unrecognized mouth item is not returned", () => {
			const C = makeCharacter(2);
			wear(C, "ItemMouth", "ChloroformCloth");
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
			expect(itemUse.getItemsForActivityNeed(C, "GagTakeItem", [])).toEqual([]);
		});

		it("ItemNeck focus: resolves to the real Necklace group and returns a recognized neck gag item there", () => {
			const C = makeCharacter(2);
			const necklaceGag = wear(C, "Necklace", "NecklaceBallGag");
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemNeck" };
			expect(itemUse.getItemsForActivityNeed(C, "GagTakeItem", [])).toEqual([necklaceGag]);
		});

		it("ItemNeck focus: falls back to ClothAccessory when Necklace doesn't hold a recognized neck item", () => {
			const C = makeCharacter(2);
			// SatinScarf: a real ClothAccessory asset whose name matches a GagTargets NeckItemName --
			// the fallback only cares about the item's real Asset.Name, not which group it's worn in.
			const accessoryGag = wear(C, "ClothAccessory", "SatinScarf");
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemNeck" };
			expect(itemUse.getItemsForActivityNeed(C, "GagTakeItem", [])).toEqual([accessoryGag]);
		});
	});

	describe("RopeCoil", () => {
		it("a held item whose real asset name starts with RopeCoil is returned", () => {
			const C = makeCharacter(2);
			const rope = wear(C, "ItemHandheld", "RopeCoilShort");
			expect(itemUse.getItemsForActivityNeed(C, "RopeCoil", [])).toEqual([rope]);
		});

		it("a held item that doesn't start with RopeCoil is not returned", () => {
			const C = makeCharacter(2);
			wear(C, "ItemHandheld", "Ballgag");
			expect(itemUse.getItemsForActivityNeed(C, "RopeCoil", [])).toEqual([]);
		});
	});

	describe("PlushItem", () => {
		it("a real TeddyBear worn in ItemMisc is returned", () => {
			const C = makeCharacter(2);
			const teddy = wear(C, "ItemMisc", "TeddyBear");
			expect(itemUse.getItemsForActivityNeed(C, "PlushItem", [])).toEqual([teddy]);
		});

		it("both a worn TeddyBear and a squeezable-keyword handheld item are returned", () => {
			const C = makeCharacter(2);
			const teddy = wear(C, "ItemMisc", "TeddyBear");
			const hand = wear(C, "ItemHandheld", "Shark"); // ExplicitSqueezableItems
			const result = itemUse.getItemsForActivityNeed(C, "PlushItem", []);
			expect(result).toContain(teddy);
			expect(result).toContain(hand);
		});
	});

	describe("FellatioItem", () => {
		it("an item at the focus group with an AllowActivity PenetrateItem property is returned", () => {
			const C = makeCharacter(2);
			const item = wear(C, "ItemMouth", "BallGag", { AllowActivity: ["PenetrateItem"] });
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
			expect(itemUse.getItemsForActivityNeed(C, "FellatioItem", [])).toEqual([item]);
		});

		it("an item at the focus group without that property is not returned", () => {
			const C = makeCharacter(2);
			wear(C, "ItemMouth", "BallGag", {});
			(C as never as { FocusGroup: { Name: string } }).FocusGroup = { Name: "ItemMouth" };
			expect(itemUse.getItemsForActivityNeed(C, "FellatioItem", [])).toEqual([]);
		});
	});

	describe("ChewableItem", () => {
		it("a mouth item with a 'chewable' keyword in its craft description is returned, regardless of mouth-blocked state", () => {
			// ChewableItems (the fixed name list) is otherwise a plain string match a fake-tier
			// fixture could exercise just as well -- this covers the keyword-description fallback
			// via a real Item's Craft, which GetItemNameAndDescriptionConcat actually reads.
			const C = makeCharacter(2);
			const mouthItem = wear(C, "ItemMouth", "ChloroformCloth");
			(mouthItem as never as { Craft: { Name: string; Description: string } }).Craft = { Name: "Chewy", Description: "a chewable treat" };
			expect(itemUse.getItemsForActivityNeed(C, "ChewableItem", [])).toEqual([mouthItem]);
		});

		it("with no mouth item, an unblocked, talking character's held item is checked instead", () => {
			const C = makeCharacter(2);
			const hand = wear(C, "ItemHandheld", "Ballgag", {});
			(hand as never as { Craft: { Name: string; Description: string } }).Craft = { Name: "Chewy", Description: "a chewable treat" };
			expect(itemUse.getItemsForActivityNeed(C, "ChewableItem", [])).toEqual([hand]);
		});

		it("a mouth-blocked character's held item is never checked, even if it would otherwise qualify", () => {
			const C = makeCharacter(2);
			// ChloroformCloth: a real ItemMouth asset that blocks the mouth (BlockMouth effect)
			// but, unlike BallGag, isn't itself in the fixed ChewableItems name list -- so this
			// actually exercises the "mouth item present but not chewable, fall through to
			// !IsMouthBlocked() gate" path rather than short-circuiting on the mouth item itself.
			wear(C, "ItemMouth", "ChloroformCloth");
			C.Effect = g.CharacterGetEffects(C);
			const hand = wear(C, "ItemHandheld", "Ballgag", {});
			(hand as never as { Craft: { Name: string; Description: string } }).Craft = { Name: "Chewy", Description: "a chewable treat" };
			expect(itemUse.getItemsForActivityNeed(C, "ChewableItem", [])).toEqual([]);
		});
	});
});
