// Leash lines and anchors: what a character wears decides where a line can be grabbed and where a clasp can go.
import { beforeEach, describe, expect, it } from "vitest";
import { Anchors, AnchorLabel, AnchorZones, LineSources, LineZones, ZoneOf, registerAnchorRule } from "Modules/leashing-anchors";
import { boot, player, resetWorld } from "../harness/world";
import { CoreModule } from "Modules/core";
import { LeashingModule } from "Modules/leashing";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";

function worn(C: FixtureCharacter, group: string, name: string, effects: string[] = []) {
	return wear(C, makeItem(makeAsset(makeGroup({ Name: group }), { Name: name }), { Property: { Effect: effects } }));
}

describe("leash anchors", () => {
	beforeEach(() => {
		boot(new CoreModule(), new LeashingModule());
		resetWorld({ MemberNumber: 1, Nickname: "PlayerA" });
	});

	it("puts the neck's three slots in one zone, and anything unclickable on the neck", () => {
		expect(ZoneOf("ItemNeckRestraints")).toBe("ItemNeck");
		expect(ZoneOf("ItemNeckAccessories")).toBe("ItemNeck");
		expect(ZoneOf("ItemPelvis")).toBe("ItemPelvis");
		expect(ZoneOf("ClothAccessory")).toBe("ItemNeck");
		expect(ZoneOf("ItemDevices")).toBe("ItemNeck");
	});

	it("takes a line from anything with the leash effect, in the zone it's worn", () => {
		const C = makeCharacter({ MemberNumber: 2 });
		worn(C, "ItemNeckRestraints", "CollarLeash", ["Leash"]);
		worn(C, "ItemVulvaPiercings", "ClitRing", ["Leash"]);
		worn(C, "ItemPelvis", "SomeBelt");
		expect(LineSources(C).map(i => i.Asset.Name)).toEqual(["CollarLeash", "ClitRing"]);
		expect(LineZones(C)).toEqual(["ItemNeck", "ItemVulvaPiercings"]);
		expect(LineSources(C, "ItemVulvaPiercings").map(i => i.Asset.Name)).toEqual(["ClitRing"]);
	});

	it("anchors a collar with no leash, and a clitoris ring that isn't set to leash", () => {
		const C = makeCharacter({ MemberNumber: 2 });
		worn(C, "ItemNeck", "LeatherCollar");
		worn(C, "ItemVulvaPiercings", "ClitRing");
		worn(C, "ItemPelvis", "SomeBelt");
		expect(Anchors(C).map(i => i.Asset.Name)).toEqual(["LeatherCollar", "ClitRing"]);
		expect(LineSources(C)).toEqual([]);
		expect(Anchors(C, "ItemNeck").map(i => i.Asset.Name)).toEqual(["LeatherCollar"]);
	});

	it("has every anchor a line source too", () => {
		const C = makeCharacter({ MemberNumber: 2 });
		worn(C, "ItemPelvis", "PelvisChainLeash", ["Leash"]);
		expect(Anchors(C, "ItemPelvis")).toHaveLength(1);
	});

	it("names an anchor for what it is", () => {
		const C = makeCharacter({ MemberNumber: 2 });
		worn(C, "ItemVulvaPiercings", "ClitRing");
		expect(AnchorLabel(C, "ItemVulvaPiercings")).toBe("clitring");
		expect(AnchorLabel(C, "ItemNose")).toBe("nose");
	});

	it("lets another mod add what takes a clasp, and the zone it's clicked in", () => {
		const C = makeCharacter({ MemberNumber: 2 });
		worn(C, "ItemBreast", "NippleRing");
		expect(Anchors(C)).toEqual([]);
		const undo = registerAnchorRule(item => item.Asset.Name === "NippleRing", "ItemBreast");
		expect(Anchors(C).map(i => i.Asset.Name)).toEqual(["NippleRing"]);
		expect(ZoneOf("ItemBreast")).toBe("ItemBreast");
		expect(AnchorZones).toContain("ItemBreast");
		undo();
		expect(Anchors(C)).toEqual([]);
		AnchorZones.splice(AnchorZones.indexOf("ItemBreast"), 1);
	});

	it("is a function of what's worn, so a character with nothing has none", () => {
		expect(Anchors(player())).toEqual([]);
		expect(LineZones(player())).toEqual([]);
	});
});
