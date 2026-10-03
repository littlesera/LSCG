// Behavior (not just "doesn't throw", which activity-registry.bc.test.ts already covers
// generically) of a representative sample of ActivityModule's real CustomPrerequisiteFuncs,
// against real BC Character/Asset/AssetGroup objects. These lean on real
// InventoryPrerequisiteMessage/InventoryGet/HasEffect/CanInteract semantics that only exist
// once real BC data and logic are loaded -- this project's reason for a "bc" tier at all.
//
// Registration runs at plain module top level (mirroring activity-registry.bc.test.ts):
// nothing here needs describe.each() before beforeAll runs, but it keeps this file
// consistent with that established convention and lets AddActivity's real registration
// (which happens during ActivityModule's construction) complete before any test body runs.
import { describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { CollarModule } from "Modules/collar";
import { HypnoModule } from "Modules/hypno";
import { LeashingModule } from "Modules/leashing";
import { SplatterModule } from "Modules/splatter";
import { StateModule } from "Modules/states";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

registerModule(new CoreModule()).init();
registerModule(new ConsentModule());
registerModule(new CollarModule());
registerModule(new HypnoModule());
registerModule(new LeashingModule());
registerModule(new SplatterModule());
registerModule(new StateModule());
const activities = registerModule(new ActivityModule());
activities.init();
activities.load();

function findGroup(name: string): AssetGroup {
	const found = (g.AssetGroup as AssetGroup[]).find(a => a.Name === name);
	if (!found) throw new Error(`Expected real BC AssetGroup "${name}" to exist`);
	return found;
}

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

function wear(C: Character, groupName: string, assetName: string): void {
	const asset = findAsset(groupName, assetName);
	(C as never as { Appearance: { Asset: Asset; Property: object }[] }).Appearance.push({ Asset: asset, Property: {} });
	C.Effect = g.CharacterGetEffects(C);
}

function prereq(name: string) {
	const found = activities.CustomPrerequisiteFuncs.get(name as never);
	if (!found) throw new Error(`Expected a registered "${name}" custom prerequisite -- has activities.ts renamed it?`);
	return found;
}

describe("activity CustomPrerequisiteFuncs behavior (real BC data)", () => {
	describe("CanCustomNibble (Nibble activity)", () => {
		const func = () => prereq("CanCustomNibble");

		it("ItemButt requires TailStraps worn", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemButt"))).toBe(false);
			wear(acted, "TailStraps", "TailStrap");
			expect(func()(acted, acted, findGroup("ItemButt"))).toBe(true);
		});

		it("ItemHood requires Wings worn", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemHood"))).toBe(false);
			wear(acted, "Wings", "Wing1");
			expect(func()(acted, acted, findGroup("ItemHood"))).toBe(true);
		});

		it("ItemHead requires a Halo HairAccessory1/3", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemHead"))).toBe(false);
			wear(acted, "HairAccessory1", "Halo");
			expect(func()(acted, acted, findGroup("ItemHead"))).toBe(true);
		});

		it("ItemVulva requires crotch access and a non-chaste vulva", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemVulva"))).toBe(true); // naked by default
			wear(acted, "Panties", "Panties1"); // blocks AccessCrotch
			expect(func()(acted, acted, findGroup("ItemVulva"))).toBe(false);
		});

		it("ItemBoots requires NakedFeet (no boots/socks/shoes)", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemBoots"))).toBe(true);
			wear(acted, "Socks", "Socks0");
			expect(func()(acted, acted, findGroup("ItemBoots"))).toBe(false);
		});

		it("ItemHands requires NakedHands (no gloves/hand item)", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemHands"))).toBe(true);
			wear(acted, "Gloves", "Gloves1");
			expect(func()(acted, acted, findGroup("ItemHands"))).toBe(false);
		});

		it("any other group defaults to allowed", () => {
			const acted = makeCharacter(2);
			expect(func()(acted, acted, findGroup("ItemNeck"))).toBe(true);
		});
	});

	describe("HasCrotchRope (Tug activity)", () => {
		it("requires the real CrotchRope effect", () => {
			const func = prereq("HasCrotchRope");
			const acted = makeCharacter(2);
			expect(func(acted, acted, findGroup("ItemPelvis"))).toBe(false);
			acted.Effect = ["CrotchRope"] as never;
			expect(func(acted, acted, findGroup("ItemPelvis"))).toBe(true);
		});
	});

	describe("CanHighFive (HighFive activity)", () => {
		it("requires CanInteract and excludes MergedFingers", () => {
			const func = prereq("CanHighFive");
			const acted = makeCharacter(2);
			expect(func(acted, acted, findGroup("ItemHands"))).toBe(true);
			acted.Effect = ["MergedFingers"] as never;
			expect(func(acted, acted, findGroup("ItemHands"))).toBe(false);
		});
	});
});
