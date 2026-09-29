// OutfitCollection: pure data-transform logic (inheritance expansion with cycle protection,
// base64/LZString round-tripping, key management) -- none of it touches real BC Character/Asset
// data (ItemBundle here is plain {Group, Name, Color, Property, Craft} data), so it's tested on
// the fake "unit" tier like any other pure-logic module, not the "bc" tier.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OutfitCollection, Outfit } from "Settings/OutfitCollection/outfitCollection";
import { OutfitSaveResult } from "Settings/OutfitCollection/IOutfitCollection";
import { resetWorld } from "../harness/world";

function bundle(...groups: string[]): ItemBundle[] {
	return groups.map(g => ({ Group: g, Name: `${g}Item` } as ItemBundle));
}

function namedBundle(group: string, name: string): ItemBundle[] {
	return [{ Group: group, Name: name } as ItemBundle];
}

describe("OutfitCollection", () => {
	let outfits: OutfitCollection;

	beforeEach(() => {
		// SetOutfitCode's space-check reads MaxBytes -> strategy -> Player.LSCG.OutfitCollectionModule.strategy
		// unconditionally, even when save=false never actually persists anything.
		resetWorld({ LSCG: { OutfitCollectionModule: { strategy: 0 } } });
		outfits = new OutfitCollection();
	});

	describe("SetOutfitCode / GetOutfit / GetOutfitKeys", () => {
		it("stores a new outfit under a lowercased key", () => {
			const result = outfits.SetOutfitCode("MyOutfit", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			expect(result).toBe(OutfitSaveResult.SUCCESS);
			expect(outfits.GetOutfit("myoutfit")).toBeTruthy();
			expect(outfits.GetOutfitKeys()).toEqual(["myoutfit"]);
		});

		it("preserves the original display key (case) even though the map key is lowercased", () => {
			outfits.SetOutfitCode("MyOutfit", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			expect(outfits.GetOutfit("myoutfit").key).toBe("MyOutfit");
			expect(outfits.GetOutfitNames()).toEqual(["MyOutfit"]);
		});

		it("updating an existing outfit's code keeps its prior inherit list when none is given", () => {
			outfits.SetOutfitCode("A", outfits.EncodeBundle(bundle("ItemMouth")), ["b"], false);
			outfits.SetOutfitCode("A", outfits.EncodeBundle(bundle("ItemNeck")), undefined, false);
			expect(outfits.GetOutfit("a").inherit).toEqual(["b"]);
		});
	});

	describe("ConvertToBundle / EncodeBundle round-trip", () => {
		it("round-trips a bundle through LZString compression", () => {
			const original = bundle("ItemMouth", "ItemNeck");
			const encoded = outfits.EncodeBundle(original);
			expect(outfits.ConvertToBundle(encoded)).toEqual(original);
		});

		it("returns an empty array for garbage/undecodable input", () => {
			expect(outfits.ConvertToBundle("not-valid-lzstring-base64")).toEqual([]);
		});
	});

	describe("ExpandOutfit (inheritance)", () => {
		it("an outfit with no inherit list expands to just its own bundle", () => {
			const own = bundle("ItemMouth");
			const outfit: Outfit = { key: "a", code: outfits.EncodeBundle(own), inherit: [] };
			expect(outfits.ExpandOutfit(outfit)).toEqual(own);
		});

		it("concatenates an inherited outfit's bundle after its own", () => {
			outfits.SetOutfitCode("base", outfits.EncodeBundle(bundle("ItemNeck")), [], false);
			const outfit: Outfit = { key: "a", code: outfits.EncodeBundle(bundle("ItemMouth")), inherit: ["base"] };
			const result = outfits.ExpandOutfit(outfit);
			expect(result.map(i => i.Group)).toEqual(["ItemMouth", "ItemNeck"]);
		});

		it("de-duplicates by Group, first occurrence wins", () => {
			// The inherited base's ItemMouth uses a different Name than the own bundle's, so the
			// two are distinguishable in the result -- proving which one actually won, not just
			// that a single ItemMouth entry (from either source) survived.
			outfits.SetOutfitCode("base", outfits.EncodeBundle(namedBundle("ItemMouth", "InheritedGag").concat(bundle("ItemNeck"))), [], false);
			const own = namedBundle("ItemMouth", "OwnGag");
			const outfit: Outfit = { key: "a", code: outfits.EncodeBundle(own), inherit: ["base"] };
			const result = outfits.ExpandOutfit(outfit);
			expect(result.map(i => i.Group)).toEqual(["ItemMouth", "ItemNeck"]);
			expect(result[0].Name).toBe("OwnGag");
		});

		it("an inherit reference to a nonexistent outfit key contributes nothing", () => {
			const outfit: Outfit = { key: "a", code: outfits.EncodeBundle(bundle("ItemMouth")), inherit: ["doesnotexist"] };
			expect(outfits.ExpandOutfit(outfit).map(i => i.Group)).toEqual(["ItemMouth"]);
		});

		it("is protected against inheritance cycles (a inherits b, b inherits a)", () => {
			outfits.SetOutfitCode("a", outfits.EncodeBundle(bundle("ItemMouth")), ["b"], false);
			outfits.SetOutfitCode("b", outfits.EncodeBundle(bundle("ItemNeck")), ["a"], false);
			// GetOutfitBundle drives ExpandOutfit through the real outfits map (unlike the
			// direct-Outfit-object tests above), so the cycle actually has to be walked.
			expect(() => outfits.GetOutfitBundle("a")).not.toThrow();
			const result = outfits.GetOutfitBundle("a");
			expect(result.map(i => i.Group).sort()).toEqual(["ItemMouth", "ItemNeck"]);
		});

		it("multi-level inheritance chains resolve transitively", () => {
			outfits.SetOutfitCode("grandparent", outfits.EncodeBundle(bundle("ItemFeet")), [], false);
			outfits.SetOutfitCode("parent", outfits.EncodeBundle(bundle("ItemNeck")), ["grandparent"], false);
			const outfit: Outfit = { key: "child", code: outfits.EncodeBundle(bundle("ItemMouth")), inherit: ["parent"] };
			const result = outfits.ExpandOutfit(outfit);
			expect(result.map(i => i.Group)).toEqual(["ItemMouth", "ItemNeck", "ItemFeet"]);
		});
	});

	describe("RemoveOutfit / RenameOutfit", () => {
		it("removes an outfit by key", () => {
			outfits.SetOutfitCode("gone", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			outfits.RemoveOutfit("gone", false);
			expect(outfits.GetOutfit("gone")).toBeUndefined();
		});

		it("renames an outfit, moving it to the new lowercased key", () => {
			outfits.SetOutfitCode("old", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			outfits.RenameOutfit("old", "New", false);
			expect(outfits.GetOutfit("old")).toBeUndefined();
			expect(outfits.GetOutfit("new").key).toBe("New");
		});

		it("renaming a nonexistent outfit is a no-op", () => {
			expect(() => outfits.RenameOutfit("doesnotexist", "New", false)).not.toThrow();
			expect(outfits.GetOutfitKeys()).toEqual([]);
		});

		it("honors save=true by persisting (SaveOutfits actually runs)", () => {
			outfits.SetOutfitCode("old", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			const saveSpy = vi.spyOn(outfits, "SaveOutfits");
			outfits.RenameOutfit("old", "New", true);
			expect(saveSpy).toHaveBeenCalled();
		});

		it("honors save=false by not persisting", () => {
			outfits.SetOutfitCode("old", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			const saveSpy = vi.spyOn(outfits, "SaveOutfits");
			outfits.RenameOutfit("old", "New", false);
			expect(saveSpy).not.toHaveBeenCalled();
		});
	});

	describe("Clear", () => {
		it("empties all stored outfits", () => {
			outfits.SetOutfitCode("a", outfits.EncodeBundle(bundle("ItemMouth")), [], false);
			outfits.Clear(false);
			expect(outfits.GetOutfitKeys()).toEqual([]);
		});
	});
});
