// The is* asset-group classifiers (utils.ts) against real BC AssetGroup data: these all
// key off real group Category/Clothing/Underwear/BodyCosplay flags that only exist once
// real BC asset data is loaded, which is exactly why this file lives on the "bc" project
// tier rather than the fake "unit" one. Table-driven over a handful of real, stable group
// names rather than fixture groups.
import { describe, expect, it } from "vitest";
import {
	isAppearance, isBind, isBody, isCloth, isCosplay, isDrawingOverridable,
	isGenitals, isHair, isPronouns, isProtectedFromRemoval, isSkin, isUnderwear,
} from "utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function group(name: string): AssetGroup {
	const found = (g.AssetGroup as AssetGroup[]).find(x => x.Name === name);
	if (!found) throw new Error(`Expected real BC AssetGroup "${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

describe("is* asset-group classifiers (real BC data)", () => {
	describe("isCloth", () => {
		it("Cloth (Appearance, AllowNone, Clothing) is cloth", () => {
			expect(isCloth(group("Cloth"))).toBe(true);
		});

		it("ItemNeck (a bind slot) is not cloth", () => {
			expect(isCloth(group("ItemNeck"))).toBe(false);
		});

		it("BodyUpper (a body slot) is not cloth", () => {
			expect(isCloth(group("BodyUpper"))).toBe(false);
		});

		it("excludes underwear when includeUnderwear is false", () => {
			expect(isCloth(group("Bra"), false, true)).toBe(true);
			expect(isCloth(group("Bra"), false, false)).toBe(false);
		});

		it("excludes body-cosplay groups unless allowCosplay is true", () => {
			expect(isCloth(group("TailStraps"))).toBe(false);
			expect(isCloth(group("TailStraps"), true)).toBe(true);
		});
	});

	describe("isUnderwear", () => {
		it("Bra is underwear", () => {
			expect(isUnderwear(group("Bra"))).toBe(true);
		});

		it("Cloth (outerwear) is not underwear", () => {
			expect(isUnderwear(group("Cloth"))).toBe(false);
		});
	});

	describe("isCosplay", () => {
		it("TailStraps is a body-cosplay group", () => {
			expect(isCosplay(group("TailStraps"))).toBe(true);
		});

		it("Cloth (not cosplay) is false", () => {
			expect(isCosplay(group("Cloth"))).toBe(false);
		});

		it("BodyMarkings (a body-drawing group, but not itself a cosplay slot) is false", () => {
			expect(isCosplay(group("BodyMarkings"))).toBe(false);
		});
	});

	describe("isBody", () => {
		it("BodyUpper is a body group", () => {
			expect(isBody(group("BodyUpper"))).toBe(true);
		});

		it("Cloth (an Appearance/Clothing group) is not a body group", () => {
			expect(isBody(group("Cloth"))).toBe(false);
		});

		it("Pronouns is excluded even though it's non-clothing Appearance", () => {
			expect(isBody(group("Pronouns"))).toBe(false);
		});
	});

	describe("isBind", () => {
		it("ItemArms (an Item-category restraint slot) is bind-eligible", () => {
			expect(isBind(group("ItemArms"))).toBe(true);
		});

		it("Cloth (an Appearance group) is not bind-eligible", () => {
			expect(isBind(group("Cloth"))).toBe(false);
		});

		it("excludes ItemNeck/ItemNeckAccessories/ItemNeckRestraints by default", () => {
			expect(isBind(group("ItemNeck"))).toBe(false);
			expect(isBind(group("ItemNeckAccessories"))).toBe(false);
			expect(isBind(group("ItemNeckRestraints"))).toBe(false);
		});

		it("an explicit empty exclusion list allows neck groups through", () => {
			expect(isBind(group("ItemNeck"), [])).toBe(true);
		});
	});

	describe("isHair", () => {
		it("HairFront is a hair group", () => {
			expect(isHair(group("HairFront"))).toBe(true);
		});

		it("Eyebrows is a hair group", () => {
			expect(isHair(group("Eyebrows"))).toBe(true);
		});

		it("Cloth is not a hair group", () => {
			expect(isHair(group("Cloth"))).toBe(false);
		});
	});

	describe("isSkin", () => {
		it("BodyUpper (skin tone) is a skin group", () => {
			expect(isSkin(group("BodyUpper"))).toBe(true);
		});

		it("Cloth is not a skin group", () => {
			expect(isSkin(group("Cloth"))).toBe(false);
		});
	});

	describe("isPronouns", () => {
		it("Pronouns is the pronouns group", () => {
			expect(isPronouns(group("Pronouns"))).toBe(true);
		});

		it("Cloth is not the pronouns group", () => {
			expect(isPronouns(group("Cloth"))).toBe(false);
		});
	});

	describe("isGenitals", () => {
		it("Pussy is a genitals group", () => {
			expect(isGenitals(group("Pussy"))).toBe(true);
		});

		it("Cloth is not a genitals group", () => {
			expect(isGenitals(group("Cloth"))).toBe(false);
		});
	});

	describe("isAppearance", () => {
		it("Cloth (Appearance category) is true", () => {
			expect(isAppearance(group("Cloth"))).toBe(true);
		});

		it("ItemArms (Item category) is false", () => {
			expect(isAppearance(group("ItemArms"))).toBe(false);
		});
	});

	describe("isProtectedFromRemoval", () => {
		it("BodyStyle is protected from removal", () => {
			expect(isProtectedFromRemoval(group("BodyStyle"))).toBe(true);
		});

		it("Cloth is not protected from removal", () => {
			expect(isProtectedFromRemoval(group("Cloth"))).toBe(false);
		});
	});

	describe("isDrawingOverridable", () => {
		it("a bind group is drawing-overridable", () => {
			expect(isDrawingOverridable(group("ItemArms"))).toBe(true);
		});

		it("a cloth group (allowing cosplay/underwear) is drawing-overridable", () => {
			expect(isDrawingOverridable(group("Cloth"))).toBe(true);
		});

		it("a group with 'markings' in its name is drawing-overridable", () => {
			expect(isDrawingOverridable(group("BodyMarkings"))).toBe(true);
		});

		it("a plain body group (no markings, not bind/cloth) is not drawing-overridable", () => {
			expect(isDrawingOverridable(group("BodyUpper"))).toBe(false);
		});
	});
});
