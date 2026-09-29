// RedressedState/PolymorphedState's static allowed-asset filters and DoChange gating, against
// real BC AssetGroup data -- these delegate straight to the real is* classifiers already
// verified in classifiers.bc.test.ts, applied to real BC assets via the real AssetGet. This is
// a step up from the fake-tier RedressedState coverage in redressed-state-additive.test.ts,
// which only needs fixture group flags for its own (routing/snapshot) concerns, not real
// per-asset classification.
import { beforeEach, describe, expect, it } from "vitest";
import { RedressedState } from "Modules/States/RedressedState";
import { PolymorphedState } from "Modules/States/PolymorphedState";
import { OutfitOption } from "Settings/Models/magic";
import type { SpellDefinition } from "Settings/Models/magic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function spell(overrides: Partial<SpellDefinition> = {}): SpellDefinition {
	return { Name: "Test", Creator: 1, Effects: [], AllowPotion: false, AllowVoiceCast: false, ...overrides } as SpellDefinition;
}

describe("RedressedState/PolymorphedState allowed-asset filters (real BC data)", () => {
	beforeEach(() => {
		g.Player.LSCG = { MagicModule: { allowOutfitToChangeNeckItems: false, allowChangeGenitals: true, allowChangePronouns: true } };
	});

	describe("RedressedState.AssetIsAllowed / ItemIsAllowed", () => {
		it("a real clothing asset is allowed", () => {
			expect(RedressedState.AssetIsAllowed(findAsset("Cloth", "CollegeOutfit1"))).toBe(true);
		});

		it("a real bind-eligible asset is allowed", () => {
			expect(RedressedState.AssetIsAllowed(findAsset("ItemArms", "LeatherArmbinder"))).toBe(true);
		});

		it("a real body-slot asset (neither cloth nor bind) is not allowed", () => {
			expect(RedressedState.AssetIsAllowed(findAsset("BodyUpper", "Normal"))).toBe(false);
		});

		it("ItemIsAllowed resolves the item by real Group/Name through AssetGet", () => {
			expect(RedressedState.ItemIsAllowed({ Group: "Cloth", Name: "CollegeOutfit1" } as ItemBundle)).toBe(true);
			expect(RedressedState.ItemIsAllowed({ Group: "Cloth", Name: "__does_not_exist__" } as ItemBundle)).toBe(false);
		});
	});

	describe("RedressedState.DoChange", () => {
		let state: RedressedState;
		beforeEach(() => { state = new RedressedState(undefined as never); });

		it("with no spell, falls back to AssetIsAllowed", () => {
			expect(state.DoChange(findAsset("Cloth", "CollegeOutfit1"), null)).toBe(true);
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), null)).toBe(false);
		});

		it("clothes_only allows a real cloth asset but not a real bind asset", () => {
			const s = spell({ Outfit: { Option: OutfitOption.clothes_only, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("Cloth", "CollegeOutfit1"), s)).toBe(true);
			expect(state.DoChange(findAsset("ItemArms", "LeatherArmbinder"), s)).toBe(false);
		});

		it("binds_only allows a real bind asset but not a real cloth asset", () => {
			const s = spell({ Outfit: { Option: OutfitOption.binds_only, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("ItemArms", "LeatherArmbinder"), s)).toBe(true);
			expect(state.DoChange(findAsset("Cloth", "CollegeOutfit1"), s)).toBe(false);
		});

		it("binds_only excludes ItemNeck-family groups unless allowOutfitToChangeNeckItems is set", () => {
			const s = spell({ Outfit: { Option: OutfitOption.binds_only, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("ItemNeck", "LeatherCollar"), s)).toBe(false);
			g.Player.LSCG.MagicModule.allowOutfitToChangeNeckItems = true;
			expect(state.DoChange(findAsset("ItemNeck", "LeatherCollar"), s)).toBe(true);
		});

		it("both allows either a real cloth or a real bind asset", () => {
			const s = spell({ Outfit: { Option: OutfitOption.both, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("Cloth", "CollegeOutfit1"), s)).toBe(true);
			expect(state.DoChange(findAsset("ItemArms", "LeatherArmbinder"), s)).toBe(true);
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), s)).toBe(false);
		});

		it("returns false for a null asset regardless of spell", () => {
			expect(state.DoChange(null, spell())).toBe(false);
		});
	});

	describe("PolymorphedState.AssetIsAllowed / ItemIsAllowed", () => {
		it("a real body-slot asset is allowed", () => {
			expect(PolymorphedState.AssetIsAllowed(findAsset("BodyUpper", "Normal"))).toBe(true);
		});

		it("a real hair asset is allowed", () => {
			expect(PolymorphedState.AssetIsAllowed(findAsset("HairFront", findFirstAssetName("HairFront")))).toBe(true);
		});

		it("a real genitals asset is allowed", () => {
			expect(PolymorphedState.AssetIsAllowed(findAsset("Pussy", findFirstAssetName("Pussy")))).toBe(true);
		});

		it("a real cloth (non-body) asset is not allowed", () => {
			expect(PolymorphedState.AssetIsAllowed(findAsset("Cloth", "CollegeOutfit1"))).toBe(false);
		});
	});

	describe("PolymorphedState.DoChange", () => {
		let state: PolymorphedState;
		beforeEach(() => { state = new PolymorphedState(undefined as never); });

		it("with no spell, falls back to AssetIsAllowed", () => {
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), null)).toBe(true);
			expect(state.DoChange(findAsset("Cloth", "CollegeOutfit1"), null)).toBe(false);
		});

		it("returns false with a spell that has no Polymorph config", () => {
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), spell())).toBe(false);
		});

		it("IncludeAllBody gates real body-slot assets", () => {
			const disallowed = spell({ Polymorph: { IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: false, IncludeAllBody: false, Code: "", Key: "" } as never });
			const allowed = spell({ Polymorph: { IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: false, IncludeAllBody: true, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), disallowed)).toBe(false);
			expect(state.DoChange(findAsset("BodyUpper", "Normal"), allowed)).toBe(true);
		});

		it("a real genitals asset is blocked when allowChangeGenitals is false, even with IncludeGenitals set", () => {
			g.Player.LSCG.MagicModule.allowChangeGenitals = false;
			const s = spell({ Polymorph: { IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: true, IncludeAllBody: false, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("Pussy", findFirstAssetName("Pussy")), s)).toBe(false);
		});

		it("a real genitals asset is allowed when allowChangeGenitals is true and IncludeGenitals is set", () => {
			const s = spell({ Polymorph: { IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: true, IncludeAllBody: false, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("Pussy", findFirstAssetName("Pussy")), s)).toBe(true);
		});

		it("a real Pronouns asset is blocked when allowChangePronouns is false", () => {
			g.Player.LSCG.MagicModule.allowChangePronouns = false;
			const s = spell({ Polymorph: { IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: false, IncludeAllBody: true, Code: "", Key: "" } as never });
			expect(state.DoChange(findAsset("Pronouns", findFirstAssetName("Pronouns")), s)).toBe(false);
		});
	});
});

function findFirstAssetName(groupName: string): string {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === groupName);
	if (!found) throw new Error(`Expected at least one real BC Asset in group "${groupName}"`);
	return found.Name;
}
