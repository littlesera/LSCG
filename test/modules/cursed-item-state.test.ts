// CursedItemState: how a worn curse spreads. Speeds, who may curse the player (the Allowed ladder and the one-minute
// repeat guard), outfit filtering, colour matching between bundles and worn items, and each tick: the key item gone,
// stripping (one at a time or all at once), growing (one item, or everything for "instant"), using itself up,
// inexhaustible curses, replacing the key item, quiet curses, and clearing/recovering.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import LZString from "lz-string";
import { CoreModule } from "Modules/core";
import { CursedItemModule } from "Modules/cursed-item";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { StateModule } from "Modules/states";
import { CursedItemState } from "Modules/States/CursedItemState";
import { StripLevel, type CursedItemWorn } from "Settings/Models/cursed-item";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset, makeItem, wear, type FixtureItem } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
const code = (bundles: object[]) => LZString.compressToBase64(JSON.stringify(bundles));

describe("CursedItemState", () => {
	let cursedItem: CursedItemModule;
	let states: StateModule;
	let state: CursedItemState;

	beforeAll(() => {
		[, cursedItem, , states] = boot(new CoreModule(), new CursedItemModule(), new OutfitCollectionModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		cursedItem.init();
		states.init();
		state = states.CursedItemState;
		state._settings = undefined;
		state._activeOutfitsCache = undefined;
		state._cursesAppliedRecently = [];
		Object.assign(cursedItem.settings, { enabled: true, Vulnerable: true, Allowed: "Public", SuppressEmote: false, AlwaysExhaust: false, BlockExistingGroups: false });
		g.Player.IsInFamilyOfMemberNumber = () => false;
		makeAsset(makeGroup({ Name: "Cloth", Category: "Appearance", Clothing: true }), { Name: "MaidOutfit" });
		makeAsset(makeGroup({ Name: "Shoes", Category: "Appearance", Clothing: true }), { Name: "Heels" });
		makeAsset(makeGroup({ Name: "Hat", Category: "Appearance", Clothing: true }), { Name: "MaidHat" });
		makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Cuffs" });
		makeAsset(makeGroup({ Name: "ItemNeck" }), { Name: "Collar" });
	});

	afterEach(() => {
		vi.clearAllTimers();
		restoreRandom();
	});

	function curse(overrides: Partial<CursedItemWorn> = {}): CursedItemWorn {
		return {
			Crafter: 2, ItemName: "Cursed Collar", CurseName: "Maid", Inexhaustable: false, SuppressEmote: false,
			Strip: StripLevel.NONE, InstaStrip: false, Speed: "medium", CustomSpeed: 0, lastTick: 1,
			OutfitCode: code([{ Group: "Cloth", Name: "MaidOutfit" }, { Group: "Shoes", Name: "Heels" }]),
			...overrides,
		} as CursedItemWorn;
	}

	const wearKey = () => wear(player(), makeItem(g.AssetGet("Female3DCG", "ItemNeck", "Collar"), { Craft: { Name: "Cursed Collar", MemberNumber: 2 } }));
	const wearAsset = (group: string, name: string, extra = {}) => wear(player(), makeItem(g.AssetGet("Female3DCG", group, name), extra));
	const worn = () => player().Appearance.map(i => i.Asset.Name).sort();
	const start = (c: CursedItemWorn) => { state.ActiveOutfits = [c]; state.config.active = true; };
	// The next moment this curse is due
	const tick = (c: CursedItemWorn) => state.TickCursedItem(c.lastTick + state.ItemInterval(c) + 1, c);

	describe("ItemInterval", () => {
		it("maps each speed, clamping a custom one to 1s..1h", () => {
			const at = (Speed: string, CustomSpeed = 0) => state.ItemInterval(curse({ Speed, CustomSpeed } as never));
			expect([at("slow"), at("medium"), at("fast"), at("instant"), at("other")]).toEqual([900_000, 60_000, 10_000, 0, 60_000]);
			expect([at("custom", 30), at("custom", 0), at("custom", 99_999)]).toEqual([30_000, 1000, 3_600_000]);
		});
	});

	describe("checkItemIsValid", () => {
		it("needs the module on and the player vulnerable", () => {
			cursedItem.settings.Vulnerable = false;
			expect(state.checkItemIsValid(curse())).toBe(false);
		});

		it("refuses the same curse from the same crafter again within a minute", () => {
			expect(state.checkItemIsValid(curse())).toBe(true);
			expect(state.checkItemIsValid(curse())).toBe(false);
			vi.advanceTimersByTime(60_000);
			expect(state.checkItemIsValid(curse())).toBe(true);
		});

		it("follows the Allowed ladder", () => {
			const check = (Allowed: string, setup: () => void = () => {}) => {
				state._cursesAppliedRecently = [];
				resetWorld({ MemberNumber: 1, LSCG: player().LSCG });
				g.Player.IsInFamilyOfMemberNumber = () => false;
				cursedItem.settings.Allowed = Allowed as never;
				setup();
				return state.checkItemIsValid(curse());
			};
			expect(check("Public")).toBe(true);
			expect(check("Public", () => { player().BlackList = [2]; })).toBe(false);
			expect(check("Friend")).toBe(false);
			expect(check("Friend", () => { player().FriendList = [2]; })).toBe(true);
			expect(check("Lover", () => { player().LoverMemberNumber = [2]; })).toBe(true);
			expect(check("Whitelist", () => { player().WhiteList = [2]; })).toBe(true);
			expect(check("Owner", () => { player().WhiteList = [2]; })).toBe(false);
			expect(check("Owner", () => { player().OwnerMemberNumber = 2; })).toBe(true);
			expect(check("Self")).toBe(false);
		});

		it("AddCursedItem activates the state with the curse, announcing it", () => {
			cursedItem.settings.BlockExistingGroups = true;
			g.InventoryGroupIsBlocked.mockImplementation((_C: unknown, group: string) => group === "ItemArms");
			state.AddCursedItem(curse());
			g.InventoryGroupIsBlocked.mockImplementation(() => false);
			expect(state.Active).toBe(true);
			expect(state.ActiveOutfits?.[0].BlockedGroups).toEqual(["ItemArms"]);
			expect(sent.actions()[0]).toContain("curse washes over");
			expect(state.AddCursedItem(curse())).toBeUndefined();
		});
	});

	describe("outfit filtering", () => {
		it("keeps only clothes and binds", () => {
			makeAsset(makeGroup({ Name: "BodyUpper", Category: "Appearance", AllowNone: false }), { Name: "Skin" });
			const cleaned = CursedItemState.CleanItemCode(code([{ Group: "Cloth", Name: "MaidOutfit" }, { Group: "ItemArms", Name: "Cuffs" }, { Group: "BodyUpper", Name: "Skin" }, { Group: "Nope", Name: "Nope" }]));
			expect((JSON.parse(LZString.decompressFromBase64(cleaned)!) as { Name: string }[]).map((b: { Name: string }) => b.Name)).toEqual(["MaidOutfit", "Cuffs"]);
			expect(CursedItemState.CleanItemCode("garbage")).toBe("garbage");
		});
	});

	describe("matching worn items to the outfit", () => {
		it("treats a single colour and a one-colour array as the same, and all-default as Default", () => {
			expect(state.getItemColorString({ Color: "#2A2A2A" } as never)).toBe(state.getItemColorString({ Color: ["#2A2A2A"] } as never));
			expect(state.getItemColorString({ Color: ["Default", ""] } as never)).toBe("Default");
			expect(state.getItemColorString({} as never)).toBe("Default");
		});

		it("a default kissmark matches the game's kissmark red", () => {
			expect(state.equateColor({ Name: "Kissmark" } as never, { Color: ["#B42340"] } as never)).toBe(true);
			expect(state.equateColor({ Name: "Other" } as never, { Color: ["#B42340"] } as never)).toBe(false);
		});

		it("a crafted bundle ignores colour; an uncrafted one must match it", () => {
			const item = wearAsset("Cloth", "MaidOutfit", {}) as FixtureItem & { Color?: string };
			item.Color = "#ff0000";
			expect(state.itemBundleMatch({ Group: "Cloth", Name: "MaidOutfit" } as never, item as never)).toBe(false);
			expect(state.itemBundleMatch({ Group: "Cloth", Name: "MaidOutfit", Color: "#ff0000" } as never, item as never)).toBe(true);
			(item as { Craft?: object }).Craft = { Name: "Dress" };
			expect(state.itemBundleMatch({ Group: "Cloth", Name: "MaidOutfit", Craft: { Name: "Dress" } } as never, item as never)).toBe(true);
		});
	});

	describe("itemIsAllowed", () => {
		it("refuses unknown, permission-blocked, room-disallowed and relationship-only assets", () => {
			expect(state.itemIsAllowed({ Group: "Cloth", Name: "MaidOutfit" } as never, 2)).toBe(true);
			expect(state.itemIsAllowed({ Group: "Cloth", Name: "Ghost" } as never, 2)).toBe(false);
			g.InventoryIsPermissionBlocked.mockReturnValueOnce(true);
			expect(state.itemIsAllowed({ Group: "Cloth", Name: "MaidOutfit" } as never, 2)).toBe(false);
			g.InventoryChatRoomAllow.mockReturnValueOnce(false);
			expect(state.itemIsAllowed({ Group: "Cloth", Name: "MaidOutfit" } as never, 2)).toBe(false);
			makeAsset(makeGroup({ Name: "ItemMouth" }), { Name: "OwnerGag", OwnerOnly: true });
			expect(state.itemIsAllowed({ Group: "ItemMouth", Name: "OwnerGag" } as never, 2)).toBe(false);
		});
	});

	describe("TickCursedItem", () => {
		it("ends the curse when its key item is gone", () => {
			const c = curse();
			start(c);
			expect(tick(c)).toBe(true);
			expect(state.ActiveOutfits).toEqual([]);
		});

		it("waits for the interval", () => {
			wearKey();
			const c = curse({ lastTick: Date.now() });
			start(c);
			expect(state.TickCursedItem(Date.now(), c)).toBe(false);
		});

		it("adds one outfit item per tick, announcing it", () => {
			wearKey();
			const c = curse();
			start(c);
			seedRandom([0]);
			tick(c);
			expect(worn()).toHaveLength(2);
			expect(sent.actions().at(-1)).toMatch(/spreads|grows|expands/);
			tick(c);
			expect(worn()).toEqual(["Collar", "Heels", "MaidOutfit"]);
		});

		it("then uses itself up, falling off", () => {
			wearKey();
			wearAsset("Cloth", "MaidOutfit");
			wearAsset("Shoes", "Heels");
			const c = curse();
			start(c);
			tick(c);
			expect(worn()).toEqual(["Heels", "MaidOutfit"]);
			expect(state.ActiveOutfits).toEqual([]);
			expect(sent.actions().at(-1)).toMatch(/falls off/);
		});

		it("an inexhaustible curse stays, unless the player exhausts every curse", () => {
			wearKey();
			wearAsset("Cloth", "MaidOutfit");
			wearAsset("Shoes", "Heels");
			const c = curse({ Inexhaustable: true });
			start(c);
			tick(c);
			expect(state.ActiveOutfits).toHaveLength(1);
			cursedItem.settings.AlwaysExhaust = true;
			tick(c);
			expect(state.ActiveOutfits).toEqual([]);
		});

		it("an instant curse puts everything on at once", () => {
			wearKey();
			const c = curse({ Speed: "instant" });
			start(c);
			tick(c);
			expect(worn()).toEqual(["Collar", "Heels", "MaidOutfit"]);
			expect(sent.actions().at(-1)).toMatch(/flash|rapidly|instantly/);
		});

		it("a quiet curse tells only the player", () => {
			wearKey();
			const c = curse({ SuppressEmote: true });
			start(c);
			tick(c);
			expect(sent.actions()).toEqual([]);
			expect(sent.local().at(-1)).toMatch(/Your \[Cursed Collar\]/);
			c.Speed = "instant";
			tick(c);
			expect(sent.local().at(-1)).toMatch(/[Yy]our Cursed Collar/);
		});

		it("strips clothes not in the outfit, one per tick, or all at once with InstaStrip", () => {
			wearKey();
			wearAsset("Hat", "MaidHat");
			wearAsset("Cloth", "MaidOutfit");
			wearAsset("Shoes", "Heels");
			const c = curse({ Strip: StripLevel.CLOTHES, OutfitCode: code([{ Group: "Cloth", Name: "MaidOutfit" }]) });
			start(c);
			tick(c);
			expect(worn()).toEqual(["Collar", "MaidOutfit"].concat(worn().includes("Heels") ? ["Heels"] : ["MaidHat"]).sort());
			expect(sent.local().at(-1)).toMatch(/removes|sizzles|vaporizing/);

			wearAsset("Hat", "MaidHat");
			wearAsset("Shoes", "Heels");
			c.InstaStrip = true;
			tick(c);
			// Everything stripped and nothing left to add: the curse is used up in the same tick
			expect(worn()).toEqual(["MaidOutfit"]);
			expect(sent.actions().some(a => /clothes/.test(a))).toBe(true);
		});

		it("replaces the key item last, with its own emote", () => {
			const key = wearKey();
			const c = curse({ OutfitCode: code([{ Group: "ItemNeck", Name: "Collar" }]) });
			key.Craft = { Name: "Cursed Collar", MemberNumber: 2 };
			start(c);
			tick(c);
			expect(sent.actions().at(-1)).toMatch(/replaced/);
		});

		it("leaves groups another active curse is using, and those blocked when it started, ending when that's all that's left", () => {
			wearKey();
			wearAsset("Shoes", "Heels", { Color: "#000000" });
			const other = curse({ CurseName: "Other", ItemName: "Other Item", OutfitCode: code([{ Group: "Shoes", Name: "Heels" }]) });
			const c = curse({ BlockedGroups: ["Cloth"] as never });
			state.ActiveOutfits = [c, other];
			state.config.active = true;
			expect(state.getAllOtherCursedBundles(c)).toEqual([{ Group: "Shoes", Name: "Heels" }]);
			tick(c);
			// Nothing it may still add: it's used up, and the other curse's heels stay
			expect(worn()).toEqual(["Heels"]);
			expect(state.ActiveOutfits?.map(o => o.CurseName)).toEqual(["Other"]);
		});
	});

	describe("Tick / clearing / Recover", () => {
		it("a tick with no curses left recovers", () => {
			state.config.active = true;
			state.ActiveOutfits = [];
			state.Tick(Date.now());
			expect(state.Active).toBe(false);
		});

		it("a tick runs every curse and syncs the appearance when one changed", () => {
			wearKey();
			start(curse());
			state.Tick(Date.now() + 10 * 60_000);
			expect(g.ChatRoomCharacterUpdate).toHaveBeenCalledWith(player());
		});

		it("clearing one curse removes its key item with an emote", () => {
			wearKey();
			start(curse());
			state.ClearActiveOutfit("Maid", true);
			expect(worn()).toEqual([]);
			expect(state.ActiveOutfits).toEqual([]);
			expect(sent.actions().at(-1)).toMatch(/falls off/);
		});

		it("Recover clears everything quietly, telling only the player", () => {
			wearKey();
			start(curse());
			state.Recover();
			expect(state.Active).toBe(false);
			expect(worn()).toEqual([]);
			expect(sent.local().at(-1)).toContain("sigh of relief");
		});

		it("unreadable saved curses reset to none", () => {
			state.config.extensions.outfits = "not base64";
			state._activeOutfitsCache = undefined;
			expect(state.ActiveOutfits).toEqual([]);
		});

		it("icon and label", () => {
			expect([state.Icon(player() as never), state.Label(player() as never)]).toEqual(["Icons/Dress.png", "Cursed"]);
		});
	});

	describe("sorting", () => {
		it("puts on the key item's slot last, binds after clothes", () => {
			const key = wearKey();
			seedRandom([0.5]);
			const pick = state.shuffleSortAndSelect([{ Group: "ItemNeck", Name: "Collar" }, { Group: "ItemArms", Name: "Cuffs" }, { Group: "Cloth", Name: "MaidOutfit" }] as never, key as never);
			expect(pick.Name).toBe("MaidOutfit");
		});

		it("strips outer clothes before underwear and cosplay", () => {
			makeAsset(makeGroup({ Name: "Bra", Category: "Appearance", Clothing: true, Underwear: true }), { Name: "Bra1" });
			seedRandom([0.5]);
			const items = [wearAsset("Bra", "Bra1"), wearAsset("Cloth", "MaidOutfit")];
			expect(state.sortStrippableAndSelect(items as never).Asset.Name).toBe("Bra1");
		});
	});
});
