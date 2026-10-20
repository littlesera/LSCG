// ItemUseModule's item-moving actions and lookups, called directly rather than through
// a full activity round trip: getItemsForActivityNeed()/SlapItems() (the
// CharacterItemsForActivity hook's logic), the gag/necklace/hand moves (ApplyGag,
// TakeGag and their color juggling), TieUp, GiveItem, steal/swap (with the roll stubbed),
// tamper protection, and the small exported helpers (IsActivityEnhanced, ActivityRoll).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityRoll, IsActivityEnhanced, ItemUseModule, type ActivityCheck } from "Modules/item-use";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { boot, resetWorld, player } from "../harness/world";
import { makeCharacter, makeGroup, makeAsset, makeItem, wear, type FixtureCharacter, type FixtureItem } from "../harness/fixtures";
import { seedRandom, restoreRandom } from "../harness/time";
import { sent } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asChar = (C: FixtureCharacter) => C as any;

/** Registers `name` in `group` and wears it on `C`. */
function put(C: FixtureCharacter, group: string, name: string, extra: Parameters<typeof makeItem>[1] = {}): FixtureItem {
	return wear(C, makeItem(makeAsset(makeGroup({ Name: group }), { Name: name }), extra));
}

function crafted(name: string, description = "") {
	return { Craft: { Name: name, Description: description, Effects: {} } };
}

describe("ItemUseModule actions", () => {
	let itemUse: ItemUseModule;
	let injector: InjectorModule;

	beforeAll(() => {
		// CollarModule/InjectorModule: PerformTamperProtection reaches both via getModule().
		[, , , itemUse, , injector] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(), new CollarModule(), new InjectorModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		itemUse.failedStealTime = 0;
		itemUse.lastTamperProtectionFired = 0;
	});

	afterEach(() => {
		restoreRandom();
		vi.clearAllTimers();
	});

	describe("IsActivityEnhanced", () => {
		function msg(group: string, activity: string) {
			return { Type: "Activity", Content: "", Sender: 2, Dictionary: [{ Tag: "ActivityName", text: activity }, { FocusGroupName: group }] } as never;
		}

		it("is true for an enhanced activity on the mouth", () => {
			expect(IsActivityEnhanced(msg("ItemMouth", "SipItem"))).toBe(true);
			expect(IsActivityEnhanced(msg("ItemMouth", "LSCG_Eat"))).toBe(true);
		});

		it("is false elsewhere, or for an ordinary activity", () => {
			expect(IsActivityEnhanced(msg("ItemHands", "SipItem"))).toBe(false);
			expect(IsActivityEnhanced(msg("ItemMouth", "Kiss"))).toBe(false);
		});
	});

	describe("ActivityRoll", () => {
		it("never totals below zero", () => {
			expect(new ActivityRoll(3, -10).Total).toBe(0);
			expect(new ActivityRoll(12, 4).Total).toBe(16);
		});

		it("only shows the roll when showCheckRolls is on", () => {
			expect(new ActivityRoll(12, 4).TotalStr).toBe("");
			player().LSCG.GlobalModule.showCheckRolls = true;
			expect(new ActivityRoll(12, 4).TotalStr).toBe("[12+4] ");
			expect(new ActivityRoll(12, -3).TotalStr).toBe("[12-3] ");
		});
	});

	describe("getItemsForActivityNeed", () => {
		const need = (C: FixtureCharacter, type: string) => itemUse.getItemsForActivityNeed(asChar(C), type as never, []);

		it("AnyItem: whatever is in hand", () => {
			const C = makeCharacter();
			expect(need(C, "AnyItem")).toEqual([]);
			const held = put(C, "ItemHandheld", "Spoon");
			expect(need(C, "AnyItem")).toEqual([held]);
		});

		it("GagTakeItem: a recognized gag in the focused mouth group", () => {
			const C = makeCharacter();
			asChar(C).FocusGroup = { Name: "ItemMouth" };
			const gag = put(C, "ItemMouth", "BallGag");
			expect(need(C, "GagTakeItem")).toEqual([gag]);
			put(C, "ItemMouth", "NotAGag");
			expect(need(C, "GagTakeItem")).toEqual([]);
		});

		it("GagTakeItem on the neck: a gag necklace, falling back to ClothAccessory", () => {
			const C = makeCharacter();
			asChar(C).FocusGroup = { Name: "ItemNeck" };
			const necklace = put(C, "Necklace", "NecklaceBallGag");
			expect(need(C, "GagTakeItem")).toEqual([necklace]);

			const D = makeCharacter();
			asChar(D).FocusGroup = { Name: "ItemNeck" };
			put(D, "Necklace", "PearlNecklace");
			const bandana = put(D, "ClothAccessory", "Bandana");
			expect(need(D, "GagTakeItem")).toEqual([bandana]);
		});

		it("GagGiveItem: only a hand item that becomes a gag", () => {
			const C = makeCharacter();
			const coil = put(C, "ItemHandheld", "RopeCoilLong");
			expect(need(C, "GagGiveItem")).toEqual([coil]);
			put(C, "ItemHandheld", "Spoon");
			expect(need(C, "GagGiveItem")).toEqual([]);
		});

		it("GagToNecklace: a recognized gag in the focused group", () => {
			const C = makeCharacter();
			asChar(C).FocusGroup = { Name: "ItemMouth" };
			const gag = put(C, "ItemMouth", "ClothGag");
			expect(need(C, "GagToNecklace")).toEqual([gag]);
		});

		it("NecklaceToGag: gag necklaces in either neck slot", () => {
			const C = makeCharacter();
			const necklace = put(C, "Necklace", "NecklaceRope");
			const scarf = put(C, "ClothAccessory", "SatinScarf");
			expect(need(C, "NecklaceToGag")).toEqual([necklace, scarf]);
		});

		it("RopeCoil: any RopeCoil* in hand", () => {
			const C = makeCharacter();
			const coil = put(C, "ItemHandheld", "RopeCoilShort");
			expect(need(C, "RopeCoil")).toEqual([coil]);
			put(C, "ItemHandheld", "Rope");
			expect(need(C, "RopeCoil")).toEqual([]);
		});

		it("PlushItem: a worn teddy bear and/or a squeezable held item", () => {
			const C = makeCharacter();
			const teddy = put(C, "ItemMisc", "TeddyBear");
			const shark = put(C, "ItemHandheld", "Shark");
			expect(need(C, "PlushItem")).toEqual([teddy, shark]);

			const D = makeCharacter();
			const plush = put(D, "ItemHandheld", "BunnyPlushie");
			expect(need(D, "PlushItem")).toEqual([plush]);
			const pet = put(D, "ItemHandheld", "PetBowl");
			expect(need(D, "PlushItem")).toEqual([pet]);
		});

		it("CameraItem: a camera or screen in hand, else one worn as an accessory", () => {
			const C = makeCharacter();
			const acc = put(C, "ClothAccessory", "Camera1");
			expect(need(C, "CameraItem")).toEqual([acc]);
			const phone = put(C, "ItemHandheld", "Smartphone");
			expect(need(C, "CameraItem")).toEqual([phone]);
		});

		it("MagicItem: a wand in hand", () => {
			const C = makeCharacter();
			const wand = put(C, "ItemHandheld", "RainbowWand");
			expect(need(C, "MagicItem")).toEqual([wand]);
		});

		it("SipItem: adds a potion bottle, without duplicating one BC already found", () => {
			const C = makeCharacter();
			const potion = put(C, "ItemHandheld", "PotionBottle");
			expect(need(C, "SipItem")).toEqual([potion]);
			expect(itemUse.getItemsForActivityNeed(asChar(C), "SipItem" as never, [potion as never])).toEqual([potion]);
		});

		it("PourableItem: a filled glass, mug or potion", () => {
			const C = makeCharacter();
			const mug = put(C, "ItemHandheld", "Mug");
			expect(need(C, "PourableItem")).toEqual([mug]);
		});

		it("FellatioItem / HeldPenetrateItem: an item that allows PenetrateItem", () => {
			const C = makeCharacter();
			asChar(C).FocusGroup = { Name: "ItemMouth" };
			const dildoGag = put(C, "ItemMouth", "DildoGag", { Property: { AllowActivity: ["PenetrateItem"] } });
			expect(need(C, "FellatioItem")).toEqual([dildoGag]);
			// Held only: the gag in the mouth doesn't count
			expect(need(C, "HeldPenetrateItem")).toEqual([]);
			const dildo = put(C, "ItemHandheld", "Dildo", { Property: { AllowActivity: ["PenetrateItem"] } });
			expect(need(C, "HeldPenetrateItem")).toEqual([dildo]);
		});

		it("EdibleItem: a baguette, or anything crafted as edible", () => {
			const C = makeCharacter();
			const bread = put(C, "ItemHandheld", "Baguette");
			expect(need(C, "EdibleItem")).toEqual([bread]);
			const cake = put(C, "ItemHandheld", "Cupcake", crafted("Cake", "an edible treat"));
			expect(need(C, "EdibleItem")).toEqual([cake]);
			put(C, "ItemHandheld", "Brick", crafted("Brick", "very hard"));
			expect(need(C, "EdibleItem")).toEqual([]);
		});

		it("ChewableItem: prefers the gag in the mouth", () => {
			const C = makeCharacter();
			const gag = put(C, "ItemMouth", "BoneGag");
			put(C, "ItemHandheld", "Ball");
			expect(need(C, "ChewableItem")).toEqual([gag]);

			const D = makeCharacter();
			const custom = put(D, "ItemMouth", "Thing", crafted("Toy", "a chewable toy"));
			expect(need(D, "ChewableItem")).toEqual([custom]);
		});

		it("ChewableItem: a held chewable only when the mouth is free", () => {
			const C = makeCharacter();
			const ball = put(C, "ItemHandheld", "Ball");
			expect(need(C, "ChewableItem")).toEqual([ball]);
			const toy = put(C, "ItemHandheld", "Toy", crafted("Toy", "chewable"));
			expect(need(C, "ChewableItem")).toEqual([toy]);
			C.flags.mouthBlocked = true;
			expect(need(C, "ChewableItem")).toEqual([]);
		});

		it("leaves results untouched for an unknown need", () => {
			const C = makeCharacter();
			put(C, "ItemHandheld", "Spoon");
			expect(need(C, "Nonsense")).toEqual([]);
		});
	});

	describe("SlapItems", () => {
		it("includes the penis only when it is reachable", () => {
			const C = makeCharacter({ flags: { hasPenis: true } });
			const penis = put(C, "Pussy", "Penis");
			expect(itemUse.SlapItems(asChar(C))).toEqual([penis]);
			C.flags.vulvaChaste = true;
			expect(itemUse.SlapItems(asChar(C))).toEqual([]);
		});

		it("includes worn penetrate items, but a held one only with free hands", () => {
			const C = makeCharacter();
			asChar(C).Effect = [];
			const strapon = put(C, "Panties", "StraponPanties", { Property: { AllowActivity: ["PenetrateItem"] } });
			const held = put(C, "ItemHandheld", "Dildo", { Property: { AllowActivity: ["PenetrateItem"] } });
			put(C, "Socks", "Socks");
			expect(itemUse.SlapItems(asChar(C))).toEqual([strapon, held]);
			C.flags.canInteract = false;
			expect(itemUse.SlapItems(asChar(C))).toEqual([strapon]);
			C.flags.canInteract = true;
			asChar(C).Effect = ["MergedFingers"];
			expect(itemUse.SlapItems(asChar(C))).toEqual([strapon]);
		});
	});

	describe("_handleWeirdColorStuff", () => {
		const ballGag = { MouthItemName: "BallGag" };
		const color = (c: unknown, target = ballGag) => (src: string, tgt: string) =>
			itemUse._handleWeirdColorStuff({ Color: c } as never, target as never, src, tgt);

		it("passes color through untouched for gags other than the ball gag", () => {
			expect(color(["#111", "#222"], { MouthItemName: "ClothGag" })("ItemMouth", "Necklace")).toEqual(["#111", "#222"]);
		});

		it("reverses ball gag colors moving between the mouth and the necklace", () => {
			expect(color(["#111", "#222"])("ItemMouth", "Necklace")).toEqual(["#222", "#111"]);
			expect(color(["#111", "#222"])("Necklace", "ItemMouth")).toEqual(["#222", "#111"]);
		});

		it("substitutes the necklace's real default colors", () => {
			expect(color(["Default", "Default"])("ItemMouth", "Necklace")).toEqual(["#828282", "#BC3030"]);
		});

		it("keeps only the ball color going from necklace to hand", () => {
			expect(color(["#111", "#222"])("Necklace", "ItemHandheld")).toEqual(["#222"]);
		});

		it("doubles a single hand color, and wraps a non-array color", () => {
			expect(color("#333")("ItemHandheld", "ItemMouth")).toEqual(["#333", "#333"]);
		});

		it("returns undefined for an uncolored item", () => {
			expect(color(undefined)("ItemMouth", "Necklace")).toBeUndefined();
		});
	});

	describe("ApplyGag / TakeGag", () => {
		const target = (name: string) => itemUse.GagTargets.find(t => t.MouthItemName === name)!;

		function register(...pairs: [string, string][]) {
			for (const [group, name] of pairs) makeAsset(makeGroup({ Name: group }), { Name: name });
		}

		it("moves a held ball gag into the target's mouth", () => {
			register(["ItemMouth", "BallGag"]);
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(source, "ItemHandheld", "Ballgag");

			itemUse.ApplyGag(asChar(victim), asChar(source), target("BallGag"), "ItemMouth");

			expect(source.Appearance).toEqual([]);
			expect(victim.Appearance.map(i => i.Asset.Name)).toEqual(["BallGag"]);
			expect(globalThis.ChatRoomCharacterUpdate).toHaveBeenCalledTimes(2);
		});

		it("does nothing when the source holds the wrong item", () => {
			register(["ItemMouth", "BallGag"]);
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(source, "ItemHandheld", "Spoon");
			itemUse.ApplyGag(asChar(victim), asChar(source), target("BallGag"), "ItemMouth");
			expect(victim.Appearance).toEqual([]);
			expect(source.Appearance).toHaveLength(1);
		});

		it("applies the preferred type and stamps the neck source when moving from the neck", () => {
			const scarf = itemUse.GagTargets.find(t => t.NeckItemName === "Bandana")!;
			register(["ItemMouth", scarf.MouthItemName]);
			const C = makeCharacter();
			put(C, "Necklace", "Bandana");
			itemUse.ApplyGag(asChar(C), asChar(C), { ...scarf, PreferredTypes: [{ Location: "ItemMouth", Type: 2 }] }, "ItemMouth", "Necklace");
			const gag = C.Appearance.find(i => i.Asset.Group.Name === "ItemMouth")!;
			expect(gag.Property?.TypeRecord).toEqual({ typed: 2 });
			expect(gag.Property?.LSCGNeckSource).toBe("Bandana");
		});

		it("leaves the hand item when the gag target says so", () => {
			const tape = itemUse.GagTargets.find(t => t.MouthItemName === "DuctTape")!;
			register(["ItemMouth", "DuctTape"]);
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(source, "ItemHandheld", "TapeRoll");
			itemUse.ApplyGag(asChar(victim), asChar(source), tape, "ItemMouth");
			expect(victim.Appearance.map(i => i.Asset.Name)).toEqual(["DuctTape"]);
			expect(source.Appearance.map(i => i.Asset.Name)).toEqual(tape.LeaveHandItem ? ["TapeRoll"] : []);
		});

		it("takes a gag back into the source's hand, stripping size effects", () => {
			register(["ItemHandheld", "Ballgag"]);
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(victim, "ItemMouth", "BallGag", { Craft: { Name: "Big", Effects: { Large: true, Small: true, Other: true } } });

			itemUse.TakeGag(asChar(victim), asChar(source), target("BallGag"), "ItemMouth");

			expect(victim.Appearance).toEqual([]);
			const held = source.Appearance[0] as FixtureItem & { Craft: { Effects: object } };
			expect(held.Asset.Name).toBe("Ballgag");
			expect(held.Craft.Effects).toEqual({ Other: true });
		});

		it("won't take a gag when the source's hand is full or removal isn't allowed", () => {
			register(["ItemHandheld", "Ballgag"]);
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(victim, "ItemMouth", "BallGag");
			put(source, "ItemHandheld", "Spoon");
			itemUse.TakeGag(asChar(victim), asChar(source), target("BallGag"), "ItemMouth");
			expect(victim.Appearance).toHaveLength(1);

			source.Appearance = [];
			vi.mocked(globalThis.ValidationCanRemoveItem).mockReturnValueOnce(false);
			itemUse.TakeGag(asChar(victim), asChar(source), target("BallGag"), "ItemMouth");
			expect(victim.Appearance).toHaveLength(1);
			expect(source.Appearance).toEqual([]);
		});

		it("restores the stamped neck item when a gag goes back to the neck", () => {
			const scarf = itemUse.GagTargets.find(t => t.NeckItemName === "Bandana")!;
			register(["Necklace", "Bandana"]);
			const C = makeCharacter();
			put(C, "ItemMouth", scarf.MouthItemName, { Property: { LSCGNeckSource: "Bandana" } });
			itemUse.TakeGag(asChar(C), asChar(C), { ...scarf, PreferredTypes: [{ Location: "Necklace", Type: 1 }] }, "ItemMouth", "Necklace");
			const neck = C.Appearance.find(i => i.Asset.Group.Name === "Necklace")!;
			expect(neck.Asset.Name).toBe("Bandana");
			expect(neck.Property?.TypeRecord).toEqual({ typed: 1 });
		});
	});

	describe("TieUp", () => {
		beforeEach(() => vi.stubGlobal("SkillGetWithRatio", vi.fn(() => 0)));

		it("ties with a held rope coil, setting the rope type", () => {
			makeAsset(makeGroup({ Name: "ItemTorso" }), { Name: "HempRopeHarness" });
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			put(source, "ItemHandheld", "RopeCoilLong");
			itemUse.TieUp(asChar(victim), asChar(source), { Location: "ItemTorso" as never, LocationLabel: "breasts", ItemName: "HempRopeHarness", Type: 3 });
			expect(victim.Appearance[0].Property?.TypeRecord).toEqual({ typed: 3 });
			expect(globalThis.ChatRoomCharacterUpdate).toHaveBeenCalledOnce();
		});

		it("does nothing without a rope coil", () => {
			const source = makeCharacter({ MemberNumber: 2 });
			const victim = makeCharacter({ MemberNumber: 3 });
			itemUse.TieUp(asChar(victim), asChar(source), { Location: "ItemTorso" as never, LocationLabel: "breasts", ItemName: "HempRopeHarness" });
			expect(victim.Appearance).toEqual([]);
		});
	});

	describe("GetHempRopeLocations", () => {
		it("adds hemp rope groups from the asset data to the fixed extra locations", () => {
			vi.stubGlobal("AssetFemale3DCG", [{ Group: "ItemLegs", Asset: [{ Name: "HempRope" }] }, { Group: "ItemFeet", Asset: [{ Name: "Chains" }] }]);
			const locations = itemUse.GetHempRopeLocations();
			expect(locations[0]).toEqual({ Location: "ItemLegs", LocationLabel: "legs", ItemName: "HempRope" });
			expect(locations.map(l => l.Location)).not.toContain("ItemFeet");
			expect(locations.map(l => l.ItemName)).toContain("ToeTie");
			vi.unstubAllGlobals();
		});
	});

	describe("give / steal / swap", () => {
		let victim: FixtureCharacter;
		const win: ActivityCheck = { AttackerRoll: new ActivityRoll(20, 0), DefenderRoll: new ActivityRoll(1, 0) };
		const lose: ActivityCheck = { AttackerRoll: new ActivityRoll(1, 0), DefenderRoll: new ActivityRoll(20, 0) };

		beforeEach(() => {
			victim = makeCharacter({ MemberNumber: 3, Nickname: "Alice" });
			makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "Spoon" });
			makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "Fork" });
		});

		it("getItemName prefers the crafted name", () => {
			expect(itemUse.getItemName({ Asset: { Description: "Spoon" } } as never)).toBe("spoon");
			expect(itemUse.getItemName({ Asset: { Description: "Spoon" }, Craft: { Name: "Ladle" } } as never)).toBe("Ladle");
		});

		it("GiveItem hands the held item over, keeping its properties", () => {
			put(player(), "ItemHandheld", "Spoon", { Property: { Shiny: true } });
			itemUse.GiveItem(asChar(victim), asChar(player()));
			expect(player().Appearance).toEqual([]);
			expect(victim.Appearance[0].Asset.Name).toBe("Spoon");
			expect(victim.Appearance[0].Property).toEqual({ Shiny: true });
			vi.runAllTimers();
			expect(globalThis.ChatRoomCharacterUpdate).toHaveBeenCalledTimes(2);
		});

		it("GiveItem does nothing empty-handed", () => {
			itemUse.GiveItem(asChar(victim), asChar(player()));
			expect(victim.Appearance).toEqual([]);
		});

		it("TrySteal announces the attempt and rolls after a delay", () => {
			const item = put(victim, "ItemHandheld", "Spoon");
			const roll = vi.spyOn(itemUse, "Steal_Roll").mockImplementation(() => {});
			itemUse.TrySteal(asChar(victim), asChar(player()), item as never);
			expect(sent.actions()[0]).toContain("trying to steal it");
			expect(roll).not.toHaveBeenCalled();
			vi.advanceTimersByTime(5000);
			expect(roll).toHaveBeenCalledOnce();
			roll.mockRestore();
		});

		it("Steal_Roll takes the item on a win", () => {
			const item = put(victim, "ItemHandheld", "Spoon");
			vi.spyOn(itemUse, "MakeActivityCheck").mockReturnValueOnce(win);
			itemUse.Steal_Roll(asChar(victim), asChar(player()), item as never);
			expect(victim.Appearance).toEqual([]);
			expect(player().Appearance[0].Asset.Name).toBe("Spoon");
			expect(sent.actions()[0]).toContain("manages to wrest");
			expect(itemUse.failedStealTime).toBe(0);
		});

		it("Steal_Roll fails and starts the cooldown on a loss", () => {
			const item = put(victim, "ItemHandheld", "Spoon");
			vi.spyOn(itemUse, "MakeActivityCheck").mockReturnValueOnce(lose);
			itemUse.Steal_Roll(asChar(victim), asChar(player()), item as never);
			expect(victim.Appearance).toHaveLength(1);
			expect(sent.actions()[0]).toContain("fails to steal");
			expect(itemUse.failedStealTime).toBeGreaterThan(0);
		});

		it("TrySwap offers the swap and asks the target", () => {
			const theirs = put(victim, "ItemHandheld", "Fork");
			itemUse.TrySwap(asChar(victim), theirs as never);
			expect(sent.actions()).toEqual([]);

			put(player(), "ItemHandheld", "Spoon");
			itemUse.TrySwap(asChar(victim), theirs as never);
			expect(sent.actions()[0]).toContain("offers to swap their spoon");
			expect(sent.hidden()[0].command?.name).toBe("swap-ask");
			expect(sent.hidden()[0].target).toBe(3);
		});

		it("SwapRoll exchanges items on a win", () => {
			const theirs = put(victim, "ItemHandheld", "Fork");
			put(player(), "ItemHandheld", "Spoon");
			vi.spyOn(itemUse, "MakeActivityCheck").mockReturnValueOnce(win);
			itemUse.SwapRoll(asChar(victim), theirs as never);
			expect(player().Appearance[0].Asset.Name).toBe("Fork");
			expect(victim.Appearance[0].Asset.Name).toBe("Spoon");
		});

		it("SwapRoll drops the player's item on a loss", () => {
			const theirs = put(victim, "ItemHandheld", "Fork");
			put(player(), "ItemHandheld", "Spoon");
			vi.spyOn(itemUse, "MakeActivityCheck").mockReturnValueOnce(lose);
			itemUse.SwapRoll(asChar(victim), theirs as never);
			expect(player().Appearance).toEqual([]);
			expect(victim.Appearance[0].Asset.Name).toBe("Fork");
			expect(itemUse.failedStealTime).toBeGreaterThan(0);
		});

		it("SwapRoll does nothing empty-handed", () => {
			const theirs = put(victim, "ItemHandheld", "Fork");
			const check = vi.spyOn(itemUse, "MakeActivityCheck");
			itemUse.SwapRoll(asChar(victim), theirs as never);
			expect(check).not.toHaveBeenCalled();
			check.mockRestore();
		});
	});

	describe("MakeActivityCheck / UnopposedActivityRoll", () => {
		it("rolls a d20 for each side with its own modifier", () => {
			const a = makeCharacter({ MemberNumber: 2, LSCG: { CollarModule: { chokeLevel: 0 } } });
			const b = makeCharacter({ MemberNumber: 3, LSCG: { CollarModule: { chokeLevel: 0 } }, flags: { restrained: true } });
			seedRandom([0.5, 0.95]);
			const check = itemUse.MakeActivityCheck(asChar(a), asChar(b));
			expect(check.AttackerRoll.Raw).toBe(11);
			expect(check.DefenderRoll.Raw).toBe(20);
			expect(check.DefenderRoll.Modifier).toBe(-4);

			seedRandom([0]);
			expect(itemUse.UnopposedActivityRoll(asChar(a)).Total).toBe(1);
		});
	});

	describe("PerformTamperProtection", () => {
		beforeEach(() => {
			vi.stubGlobal("CurrentTime", 100_000);
			player().LSCG.GlobalModule.tamperproofEnabled = true;
		});

		afterEach(() => vi.unstubAllGlobals());

		const tamperItem = (description: string, group = "ItemArms") => put(player(), group, "Cuffs", crafted("Cuffs", description));

		it("does nothing when disabled", () => {
			player().LSCG.GlobalModule.tamperproofEnabled = false;
			itemUse.PerformTamperProtection("minigame", tamperItem("tamperproof") as never);
			expect(sent.actions()).toEqual([]);
		});

		it("fires at most once every 5 seconds", () => {
			const item = tamperItem("tamperproof");
			itemUse.PerformTamperProtection("minigame", item as never);
			itemUse.PerformTamperProtection("minigame", item as never);
			expect(sent.actions()).toHaveLength(1);
			vi.stubGlobal("CurrentTime", 106_000);
			itemUse.PerformTamperProtection("minigame", item as never);
			expect(sent.actions()).toHaveLength(2);
		});

		it("picks a tamper-proof worn item when none is given, ignoring the hand", () => {
			put(player(), "ItemHandheld", "Wand", crafted("Wand", "tamper-proof"));
			itemUse.PerformTamperProtection("activity");
			expect(sent.actions()).toEqual([]);

			itemUse.lastTamperProtectionFired = 0;
			tamperItem("tamper-proof");
			itemUse.PerformTamperProtection("activity");
			expect(sent.actions()[0]).toContain("clicks menacingly");
		});

		it("shocks for an electric item, naming the meddler", () => {
			seedRandom([0]);
			const meddler = makeCharacter({ MemberNumber: 2, Nickname: "Alice" });
			itemUse.PerformTamperProtection("assist", tamperItem("electric, tamperproof") as never, asChar(meddler));
			expect(sent.actions()[0]).toContain("punishes Alice's meddling");
			expect(globalThis.AudioPlaySoundEffect).toHaveBeenCalledWith("Shocks", expect.any(Number));
			expect(globalThis.DrawFlashScreen).toHaveBeenCalled();
		});

		it("falls back to generic for an electric item when electricity is turned off", () => {
			player().LSCG.GlobalModule.tamperproofElectricityEnabled = false;
			itemUse.PerformTamperProtection("minigame", tamperItem("electric") as never);
			expect(sent.actions()[0]).toContain("clicks menacingly");
		});

		it("tightens a self-tightening item, raising its difficulty", () => {
			const item = tamperItem("self-tightening") as FixtureItem & { Difficulty?: number };
			itemUse.PerformTamperProtection("minigame", item as never);
			expect(sent.actions()[0]).toContain("tightens around");
			expect(item.Difficulty).toBe(5);
			expect(globalThis.AudioPlaySoundEffect).toHaveBeenCalledWith("ZipTie", 1);
			expect(globalThis.ChatRoomCharacterUpdate).toHaveBeenCalled();
		});

		it("sprays sedative for a subduing item, dosing only if sedatives are enabled", () => {
			const dose = vi.spyOn(injector, "AddSedative").mockImplementation(() => {});
			injector.settings.enableSedative = false;
			itemUse.PerformTamperProtection("minigame", tamperItem("sedating") as never);
			expect(sent.actions()[0]).toContain("sedating spray");
			expect(dose).not.toHaveBeenCalled();

			itemUse.lastTamperProtectionFired = 0;
			injector.settings.enabled = true;
			injector.settings.enableSedative = true;
			itemUse.PerformTamperProtection("minigame", tamperItem("sedating") as never);
			expect(dose).toHaveBeenCalledOnce();
			dose.mockRestore();
		});
	});

	describe("crafts", () => {
		it("DisplayCraft announces the craft and broadcasts it", () => {
			itemUse.DisplayCraft({ Name: "Lucky Charm", Description: "shiny" } as never);
			expect(sent.actions()[0]).toContain("Lucky Charm to the room: shiny");
			expect(sent.hidden()[0].command?.name).toBe("craft-share");
		});

		it("ShowCraftImage shows the item preview, with its lock, when the viewer owns the asset", () => {
			const C = makeCharacter();
			asChar(C).Inventory = [{ Asset: { Name: "Charm", DynamicGroupName: "ItemNeck" } }];
			itemUse.ShowCraftImage(asChar(C), { Item: "Charm", Lock: "" } as never);
			expect(sent.local()[0]).toContain("ItemNeck/Preview/Charm.png");
			expect(sent.local()[0]).not.toContain("ItemMisc");

			itemUse.ShowCraftImage(asChar(C), { Item: "Charm", Lock: "MetalPadlock" } as never);
			expect(sent.local()[1]).toContain("ItemMisc/Preview/MetalPadlock.png");
		});

		it("ShowCraftImage shows nothing for an asset the viewer doesn't own", () => {
			const C = makeCharacter();
			asChar(C).Inventory = [];
			itemUse.ShowCraftImage(asChar(C), { Item: "Charm" } as never);
			itemUse.ShowCraftImage(null, null);
			expect(sent.local()).toEqual([]);
		});
	});
});
