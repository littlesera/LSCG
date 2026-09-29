// RedressedState.ApplyAdditive/Recover: unlike a full Magic outfit (which stores and
// restores the whole appearance), an additive outfit (used by SpeechAnalysis's
// reaction rules) only remembers the slots it actually changed, so Recover() leaves
// anything else -- including items someone added *after* the outfit was applied --
// alone. Ported from the pre-Vitest standalone suite (test/speech-analysis/test.ts,
// now removed), constructing RedressedState directly against a minimal
// `{getStateSetting}` shim exactly as that suite did (RedressedState only ever reads
// `this.config` through that one method -- see BaseState.ts -- so it needs no other
// part of a real StateModule).
import { beforeEach, describe, expect, it } from "vitest";
import LZString from "lz-string";
import { RedressedState } from "Modules/States/RedressedState";
import { StripLevel } from "Settings/Models/cursed-item";
import { OutfitOption, type SpellDefinition } from "Settings/Models/magic";
import { resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, makeItem, wear, resetAssetRegistry, type FixtureAsset } from "../harness/fixtures";

describe("RedressedState.ApplyAdditive/Recover: outfit restores only the slots it changed", () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let config: any;
	let state: RedressedState;
	let assets: Record<string, FixtureAsset>;

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { MagicModule: { allowOutfitToChangeNeckItems: false } } });
		resetAssetRegistry();
		config = { type: "redressed", active: false, activationCount: 0, extensions: {} };
		state = new RedressedState({ getStateSetting: () => config } as never);

		const cloth = makeGroup({ Name: "Cloth", Category: "Appearance", AllowNone: true, Clothing: true });
		const mouth = makeGroup({ Name: "ItemMouth" });
		const hands = makeGroup({ Name: "ItemHands" });
		const arms = makeGroup({ Name: "ItemArms" });
		const feet = makeGroup({ Name: "ItemFeet" });
		assets = {
			Dress: makeAsset(cloth, { Name: "Dress" }),
			BallGag: makeAsset(mouth, { Name: "BallGag" }),
			ClothGag: makeAsset(mouth, { Name: "ClothGag" }),
			TapeGag: makeAsset(mouth, { Name: "TapeGag" }),
			HarnessGag: makeAsset(mouth, { Name: "HarnessGag" }),
			Mittens: makeAsset(hands, { Name: "Mittens" }),
			Rope: makeAsset(arms, { Name: "Rope" }),
			Chains: makeAsset(feet, { Name: "Chains" }),
		};
	});

	/** Wears the given assets directly onto Player.Appearance, bypassing RedressedState -- the outfit the character was wearing *before* any speech outfit touched them. */
	function wearStart(...names: (keyof typeof assets)[]): void {
		for (const name of names) wear(player(), makeItem(assets[name]));
	}

	function outfit(...names: (keyof typeof assets)[]): SpellDefinition {
		const items = names.map(name => ({ Group: assets[name].Group.Name, Name: assets[name].Name }));
		return {
			Name: "test",
			Outfit: { Key: "test", Option: OutfitOption.both, Code: LZString.compressToBase64(JSON.stringify(items)) },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;
	}

	function worn(): string {
		return player().Appearance.map(i => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort().join(",");
	}

	it("add-only: gag added, dress kept; release removes only the gag, keeping binds added afterward", () => {
		wearStart("Dress");
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.NONE);
		expect(worn()).toBe("Cloth:Dress,ItemMouth:BallGag");

		wear(player(), makeItem(assets.Rope));
		state.Recover(false);
		expect(worn()).toBe("Cloth:Dress,ItemArms:Rope");
	});

	it("replaced slot gets its original item back on release", () => {
		wearStart("ClothGag");
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.NONE);
		state.Recover(false);
		expect(worn()).toBe("ItemMouth:ClothGag");
	});

	it("a slot someone else changed since is left alone on release", () => {
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.NONE);
		wear(player(), makeItem(assets.TapeGag));
		state.Recover(false);
		expect(worn()).toBe("ItemMouth:TapeGag");
	});

	it("StripLevel.CLOTHES removes the dress, adds the gag, leaves binds untouched, and restores the dress on release", () => {
		wearStart("Dress");
		wear(player(), makeItem(assets.Chains));
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.CLOTHES);
		expect(worn()).toBe("ItemFeet:Chains,ItemMouth:BallGag");

		state.Recover(false);
		expect(worn()).toBe("Cloth:Dress,ItemFeet:Chains");
	});

	it("a second speech outfit stacks, and release restores to before the first", () => {
		wearStart("Dress");
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.NONE);
		state.ApplyAdditive(outfit("HarnessGag", "Mittens"), 1, undefined, StripLevel.NONE);
		expect(worn()).toBe("Cloth:Dress,ItemHands:Mittens,ItemMouth:HarnessGag");

		state.Recover(false);
		expect(worn()).toBe("Cloth:Dress");
		expect(state.SlotSnapshot).toBeUndefined();
	});

	it("an outfit that changes nothing remembers nothing", () => {
		wearStart("BallGag");
		state.ApplyAdditive(outfit("BallGag"), 1, undefined, StripLevel.NONE);
		expect(state.SlotSnapshot).toBeUndefined();
	});
});
