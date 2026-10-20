// CursedItemModule's incoming request/response flow: CheckForCursedItems scanning worn
// crafted items for curse keywords, HandleCursedItemRequest replying with a filtered
// outfit code for an enabled configured curse, and HandleCursedItemResponse handing the
// response off to CursedItemState.AddCursedItem -- including a security-relevant fix: the
// response handler must use the verified packet sender for permission checks, not the
// sender-controlled `item.Crafter` field the response payload carries.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import LZString from "lz-string";
import { CoreModule } from "Modules/core";
import { CursedItemModule } from "Modules/cursed-item";
import { MiscModule } from "Modules/misc";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { StateModule } from "Modules/states";
import { StripLevel } from "Settings/Models/cursed-item";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem } from "../harness/fixtures";
import { receive, sent } from "../harness/room";

describe("CursedItemModule", () => {
	let cursedItem: CursedItemModule;
	let outfits: OutfitCollectionModule;
	let states: StateModule;

	beforeAll(() => {
		[, cursedItem, outfits, states] = boot(new CoreModule(), new CursedItemModule(), new OutfitCollectionModule(), new StateModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, OwnerMemberNumber: 99, LSCG: { GlobalModule: { enabled: true } } });
		cursedItem.init();
		outfits.init();
		states.init();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(player() as any).ExtensionSettings = {};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(states.CursedItemState as any)._settings = undefined;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(states.CursedItemState as any)._cursesAppliedRecently = [];
		cursedItem.settings.enabled = true;
	});

	function craftedItem(overrides: Partial<{ name: string; description: string; crafter: number }> = {}) {
		const group = makeGroup({ Name: "Cloth", Category: "Appearance", AllowNone: true, Clothing: true });
		const asset = makeAsset(group, { Name: "MaidOutfit1" });
		return makeItem(asset, { Craft: { Name: overrides.name ?? "Cursed Dress", Description: overrides.description ?? "", MemberNumber: overrides.crafter ?? 2 } });
	}

	describe("HandleCursedItemRequest", () => {
		it("replies with an outfit code when a matching, enabled curse is configured", () => {
			cursedItem.settings.CursedItems = [{ Name: "Cursed Dress", Enabled: true, OutfitKey: "maid", Speed: "medium", CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: [], Strip: StripLevel.NONE, InstaStrip: false }];
			outfits.data.SetOutfitCode("maid", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit1" }]), undefined, false);

			const requester = { MemberNumber: 5 };
			receive.command(requester as never, "cursed-item-request", [{ name: "item", value: { Group: "Cloth", Name: "MaidOutfit1", Craft: { Name: "Cursed Dress" } } }]);

			const beep = sent.beeps().find(b => b.target === 5);
			expect(beep?.message.command?.name).toBe("cursed-item-response");
			const responseItem = beep?.message.command?.args.find(a => a.name === "item")?.value as { CurseName: string; Crafter: number };
			expect(responseItem.CurseName).toBe("Cursed Dress");
			expect(responseItem.Crafter).toBe(1);
		});

		it("does not reply when the matching curse is disabled", () => {
			cursedItem.settings.CursedItems = [{ Name: "Cursed Dress", Enabled: false, OutfitKey: "maid", Speed: "medium", CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: [], Strip: StripLevel.NONE, InstaStrip: false }];
			receive.command({ MemberNumber: 5 } as never, "cursed-item-request", [{ name: "item", value: { Group: "Cloth", Name: "MaidOutfit1", Craft: { Name: "Cursed Dress" } } }]);
			expect(sent.beeps()).toEqual([]);
		});

		it("does not reply when no configured curse matches the requested item's name", () => {
			cursedItem.settings.CursedItems = [{ Name: "Something Else", Enabled: true, OutfitKey: "maid", Speed: "medium", CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: [], Strip: StripLevel.NONE, InstaStrip: false }];
			receive.command({ MemberNumber: 5 } as never, "cursed-item-request", [{ name: "item", value: { Group: "Cloth", Name: "MaidOutfit1", Craft: { Name: "Cursed Dress" } } }]);
			expect(sent.beeps()).toEqual([]);
		});

		it("picks the longest matching curse name, so a shorter one contained in it doesn't take the craft", () => {
			const curse = (Name: string, OutfitKey: string) => ({ Name, Enabled: true, OutfitKey, Speed: "medium" as const, CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: [], Strip: StripLevel.NONE, InstaStrip: false });
			cursedItem.settings.CursedItems = [curse("Maid", "maid"), curse("Maid Uniform", "uniform")];
			outfits.data.SetOutfitCode("maid", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit1" }]), undefined, false);
			outfits.data.SetOutfitCode("uniform", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit2" }]), undefined, false);

			receive.command({ MemberNumber: 5 } as never, "cursed-item-request", [{ name: "item", value: { Group: "Cloth", Name: "Dress", Craft: { Name: "Dress", Description: "cursed Maid Uniform" } } }]);

			const responseItem = sent.beeps()[0]?.message.command?.args.find(a => a.name === "item")?.value as { CurseName: string };
			expect(responseItem.CurseName).toBe("Maid Uniform");
		});

		it("filters the outfit code down to only the item types the curse config allows", () => {
			const cloth = makeGroup({ Name: "Cloth", Category: "Appearance", AllowNone: true, Clothing: true });
			makeAsset(cloth, { Name: "MaidOutfit1" });
			const mouth = makeGroup({ Name: "ItemMouth" });
			makeAsset(mouth, { Name: "BallGag" });
			outfits.data.SetOutfitCode("maid-with-gag", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "MaidOutfit1" }, { Group: "ItemMouth", Name: "BallGag" }]), undefined, false);
			cursedItem.settings.CursedItems = [{ Name: "Cursed Dress", Enabled: true, OutfitKey: "maid-with-gag", Speed: "medium", CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: ["cloth"], Strip: StripLevel.NONE, InstaStrip: false }];

			receive.command({ MemberNumber: 5 } as never, "cursed-item-request", [{ name: "item", value: { Group: "Cloth", Name: "MaidOutfit1", Craft: { Name: "Cursed Dress" } } }]);

			const beep = sent.beeps().find(b => b.target === 5);
			const responseItem = beep?.message.command?.args.find(a => a.name === "item")?.value as { OutfitCode: string };
			const decoded = JSON.parse(LZString.decompressFromBase64(responseItem.OutfitCode) ?? "[]");
			expect(decoded).toEqual([{ Group: "Cloth", Name: "MaidOutfit1" }]);
		});
	});

	describe("HandleCursedItemResponse", () => {
		beforeEach(() => {
			cursedItem.settings.Vulnerable = true;
		});

		function respond(sender: number, overrides: Partial<{ Crafter: number; CurseName: string; Allowed: string }> = {}) {
			cursedItem.settings.Allowed = (overrides.Allowed ?? "Public") as never;
			receive.command({ MemberNumber: sender } as never, "cursed-item-response", [{
				name: "item",
				value: {
					ItemName: "Cursed Dress", CurseName: overrides.CurseName ?? "test-curse", Crafter: overrides.Crafter ?? sender,
					OutfitCode: LZString.compressToBase64(JSON.stringify([])), Speed: "medium", CustomSpeed: 0,
					Inexhaustable: false, SuppressEmote: true, Strip: StripLevel.NONE, InstaStrip: false, lastTick: 0, BlockedGroups: [],
				},
			}]);
		}

		it("activates the spreading state for a legitimate sender", () => {
			respond(5, { Allowed: "Public" });
			expect(states.CursedItemState.Active).toBe(true);
		});

		it("gates on the Allowed permission level using the item's own claimed Crafter (current behavior)", () => {
			respond(5, { Crafter: 5, Allowed: "Owner" });
			expect(states.CursedItemState.Active).toBe(false);
		});

		it("SECURITY: a stranger cannot bypass the Owner-only permission level by forging item.Crafter as the owner's member number", () => {
			// sender 5 is a stranger (not Player's owner, 99), but the response payload
			// they control claims Crafter: 99 (the real owner) -- the fix must key every
			// permission check off the verified packet sender, not this claimed field.
			respond(5, { Crafter: 99, Allowed: "Owner" });
			expect(states.CursedItemState.Active).toBe(false);
		});

		it("the actual owner (verified sender) is still accepted at the Owner permission level", () => {
			respond(99, { Allowed: "Owner" });
			expect(states.CursedItemState.Active).toBe(true);
		});

		it("does nothing when the cursed-item module is disabled", () => {
			cursedItem.settings.enabled = false;
			respond(5);
			expect(states.CursedItemState.Active).toBe(false);
		});
	});

	describe("CheckForCursedItems", () => {
		it("requests the outfit code from the crafter of a newly-worn curse-keyword item", () => {
			wear(player(), craftedItem({ name: "Cursed Dress", crafter: 7 }));
			cursedItem.CheckForCursedItems();
			const beep = sent.beeps().find(b => b.target === 7);
			expect(beep?.message.command?.name).toBe("cursed-item-request");
		});

		it("does not re-request an item that's already part of an active outfit from the same crafter", () => {
			wear(player(), craftedItem({ name: "Cursed Dress", crafter: 7 }));
			cursedItem.settings.Vulnerable = true;
			states.CursedItemState.AddCursedItem({
				ItemName: "Cursed Dress", CurseName: "test", Crafter: 7, OutfitCode: LZString.compressToBase64("[]"),
				Speed: "medium", CustomSpeed: 0, Inexhaustable: false, SuppressEmote: true, Strip: StripLevel.NONE,
				InstaStrip: false, lastTick: 0, BlockedGroups: [],
			});
			cursedItem.CheckForCursedItems();
			expect(sent.beeps().filter(b => b.target === 7)).toEqual([]);
		});

		it("ignores worn items with no curse keyword in their crafted name/description", () => {
			const group = makeGroup({ Name: "Cloth", Category: "Appearance", AllowNone: true, Clothing: true });
			const asset = makeAsset(group, { Name: "MaidOutfit1" });
			wear(player(), makeItem(asset, { Craft: { Name: "Plain Dress", Description: "", MemberNumber: 7 } }));
			cursedItem.CheckForCursedItems();
			expect(sent.beeps()).toEqual([]);
		});

		it("does nothing when the module is disabled", () => {
			cursedItem.settings.enabled = false;
			wear(player(), craftedItem({ crafter: 7 }));
			cursedItem.CheckForCursedItems();
			expect(sent.beeps()).toEqual([]);
		});
	});

	// The crafting screen's LSCG effects menu: picking a curse writes its name into the craft's description, removing the others
	describe("crafting menu curse select", () => {
		let name: HTMLInputElement;
		let description: HTMLInputElement;
		const misc = new MiscModule();

		beforeEach(() => {
			vi.stubGlobal("CraftingID", { nameInput: "craft-name", descriptionInput: "craft-description" });
			document.body.innerHTML = `<input id="craft-name"><input id="craft-description">`;
			name = document.getElementById("craft-name") as HTMLInputElement;
			description = document.getElementById("craft-description") as HTMLInputElement;
			const curse = (Name: string) => ({ Name, Enabled: true, OutfitKey: "", Speed: "medium" as const, CustomSpeed: 0, Inexhaustable: false, SuppressEmote: false, Filter: [], Strip: StripLevel.NONE, InstaStrip: false });
			cursedItem.settings.CursedItems = [curse("Maid"), curse("Maid Uniform"), curse("Pony")];
		});

		afterEach(() => vi.unstubAllGlobals());

		it("swaps one curse name for another", () => {
			name.value = "Dress";
			description.value = "cursed Pony";
			misc.curseSelectChanged("", "Maid");
			expect(description.value).toBe("cursed Maid");
			expect(name.value).toBe("Dress");
		});

		it("keeps a selected name intact when a shorter curse name is part of it", () => {
			description.value = "cursed";
			misc.curseSelectChanged("", "Maid Uniform");
			expect(description.value).toBe("cursed Maid Uniform");
			misc.curseSelectChanged("", "Maid Uniform");
			expect(description.value).toBe("cursed Maid Uniform");
		});

		it("removes a longer name whole when switching to a shorter one", () => {
			description.value = "cursed Maid Uniform";
			misc.curseSelectChanged("", "Maid");
			expect(description.value).toBe("cursed Maid");
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const options = () => misc.getSelectCurseOptions().map((o: any) => ({ value: o.attributes.value, label: o.children[0] }));

		it("lists each curse with the outfit it applies, its value being the bare name", () => {
			cursedItem.settings.CursedItems[0].OutfitKey = "maid outfit";
			cursedItem.settings.CursedItems[2].Enabled = false;
			expect(options()).toEqual([
				{ value: misc.cursedSelectEmptyWord, label: "No curse" },
				{ value: "Maid", label: "Maid (maid outfit)" },
				{ value: "Maid Uniform", label: "Maid Uniform (no outfit set)" },
				{ value: "Pony", label: "Pony (no outfit set) [disabled]" },
			]);
		});

		it("puts the curse already on the craft first", () => {
			description.value = "cursed Pony";
			expect(options()[0].value).toBe("Pony");
		});

		it("explains where curses come from when there are none", () => {
			cursedItem.settings.CursedItems = [];
			expect(options()).toEqual([{ value: misc.cursedSelectEmptyWord, label: "No curses yet: add one under LSCG > Cursed Items" }]);
		});

		it("the empty choice removes every curse name", () => {
			description.value = "cursed Maid Uniform";
			misc.curseSelectChanged("", misc.cursedSelectEmptyWord);
			expect(description.value).toBe("cursed");
		});
	});
});
