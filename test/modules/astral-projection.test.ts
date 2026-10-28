// AstralProjectionState beyond its restrictions: Activate (the ghost's appearance from a copy of the player or the
// spirit-form outfit, its pose, the expressions to restore, kneeling the body) and Recover, the ghost character (soul
// bindings carried over), expressions, the tint, soulbind detection, room sync, and the ghostly chat text effects.
// The BC character-copy and pose functions it calls are stubbed here; the canvas drawing isn't exercised.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { IsSoulBind } from "Modules/States/AstralProjectionState";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { rawStub } from "../harness/bc-lite";
import { sent } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asChar = (C: FixtureCharacter) => C as any;

describe("AstralProjectionState", () => {
	let states: StateModule;
	let outfits: OutfitCollectionModule;
	let copies: FixtureCharacter[];

	beforeAll(() => {
		[, states, outfits] = boot(new CoreModule(), new StateModule(), new OutfitCollectionModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true }, MagicModule: {} } });
		states.init();
		outfits.init();
		Object.assign(g.Player, { PoseMapping: { BodyUpper: "Yoked", BodyLower: "Kneel" }, ActivePoseMapping: {}, ActivePose: [] });
		copies = [];
		vi.stubGlobal("CharacterLoadSimple", (id: string) => {
			const C = Object.assign(makeCharacter({ MemberNumber: 900 + copies.length }), { CharacterID: id, PoseMapping: { BodyUpper: "Yoked", BodyLower: "Kneel" } });
			copies.push(C);
			return C;
		});
		vi.stubGlobal("CharacterAppearanceStringify", (C: FixtureCharacter) => C.Appearance);
		vi.stubGlobal("AppearanceItemParse", (items: unknown[]) => [...items]);
		vi.stubGlobal("CharacterReleaseTotal", (C: FixtureCharacter) => { C.Appearance = C.Appearance.filter(i => i.Asset.Group.Category !== "Item"); });
		vi.stubGlobal("PoseChangeStatus", { NEVER: 0, ALWAYS: 3 });
		vi.stubGlobal("PoseCanChangeUnaidedStatus", vi.fn(() => 3));
		vi.stubGlobal("ServerAppearanceBundle", (items: { Asset: { Name: string; Group: { Name: string } } }[]) => items.map(i => ({ Group: i.Asset.Group.Name, Name: i.Asset.Name })));
		vi.stubGlobal("ServerAppearanceLoadFromBundle", vi.fn());
		vi.stubGlobal("CharacterDelete", vi.fn());
		vi.stubGlobal("CharacterLoadCanvas", vi.fn());
		vi.stubGlobal("Character", []);
	});

	afterEach(() => vi.unstubAllGlobals());

	const astral = () => states.AstralProjectionState;
	const eyes = (expression?: string) => wear(player(), makeItem(makeAsset(makeGroup({ Name: "Eyes", Category: "Appearance" }), { Name: "Eyes1" }), { Property: { Expression: expression } }));

	describe("Activate / Recover", () => {
		it("keeps the ghost on a player's first ever projection", () => {
			// No astral-projection entry in the saved states yet: it's created the first time the state's config is read
			expect(player().LSCG.StateModule.states.some((s: { type: string }) => s.type === "astral-projection")).toBe(false);
			astral().Activate(2, undefined, false);
			expect(astral().GetGhostConfig(asChar(player()))?.p).toBeDefined();
		});

		it("saves a ghost from the player, kneels the body, and restores expressions on recover", () => {
			eyes("Angry");
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "Cloth", Category: "Appearance" }), { Name: "Dress" })));
			astral().Activate(2, undefined, false);

			expect(astral().Active).toBe(true);
			const ghost = astral().GetGhostConfig(asChar(player()));
			expect(ghost.p).toEqual({ BodyUpper: "BaseUpper", BodyLower: "BaseLower" });
			expect(ghost.a.map(b => b.Name)).toContain("Dress");
			expect(ghost.e).toBe("Angry");
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel");
			expect(g.CharacterDelete).toHaveBeenCalledWith(copies[0]);
			expect(sent.raw().some(([type]) => type === "ChatRoomCharacterPoseUpdate")).toBe(true);

			astral().SetSleepExpression(asChar(player()));
			expect(player().ActiveExpression.Eyes).toBe("Closed");
			astral().Recover(false);
			expect(astral().Active).toBe(false);
			expect(player().ActiveExpression.Eyes).toBe("Angry");
			expect(astral().config.extensions.ghost).toBeUndefined();
		});

		it("keeps the body's own pose for a ghost that can't take the base pose", () => {
			g.PoseCanChangeUnaidedStatus.mockReturnValue(0);
			astral().Activate(2, undefined, false);
			expect(astral().GetGhostConfig(asChar(player())).p).toEqual({ BodyUpper: "Yoked", BodyLower: "Kneel" });
		});

		it("uses the spirit-form outfit when one is set", () => {
			outfits.data.SetOutfitCode("spirit", outfits.data.EncodeBundle([{ Group: "Cloth", Name: "Robe" }]), undefined, false);
			player().LSCG.MagicModule.spiritFormOutfitKey = "spirit";
			astral().Activate(2, undefined, false);
			expect(astral().GetGhostConfig(asChar(player())).a).toEqual([{ Group: "Cloth", Name: "Robe" }]);
			expect(g.ServerAppearanceLoadFromBundle).toHaveBeenCalled();
		});
	});

	describe("the ghost character", () => {
		it("is the character itself while not projecting", () => {
			const C = makeCharacter({ LSCG: { StateModule: { states: [] } } });
			expect(astral().GetCachedChar(asChar(C), "Ghost-1")).toBe(C);
		});

		it("is a copy carrying the ghost's pose and expressions, and its soul bindings", () => {
			const C = makeCharacter({ MemberNumber: 5, LSCG: { StateModule: { states: [{ type: "astral-projection", active: true, extensions: {} }] } } });
			const soulRope = wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Rope" }), { Craft: { Name: "Soulbind Rope", Description: "" } }));
			wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemLegs" }), { Name: "Rope" }), { Craft: { Name: "Plain Rope", Description: "" } }));
			astral().SetGhostConfig(asChar(C), { a: [], p: { BodyUpper: "BaseUpper" }, e: undefined, m: undefined, ge: "Dazed" as never, gm: undefined });
			const ghost = astral().GetGhostCharacter(asChar(C)) as unknown as FixtureCharacter & { PoseMapping: object };
			expect(ghost).toBe(copies[0]);
			expect(ghost.PoseMapping).toEqual({ BodyUpper: "BaseUpper" });
			expect(ghost.ActiveExpression.Eyes).toBe("Dazed");
			expect(ghost.Appearance.map(i => i.Asset.Group.Name)).toEqual(["ItemArms"]);
			expect(IsSoulBind(soulRope as never)).toBe(true);
		});

		it("a cached ghost is reused, or rebuilt when forced", () => {
			const C = Object.assign(makeCharacter({ MemberNumber: 5, LSCG: { StateModule: { states: [{ type: "astral-projection", active: true, extensions: { ghost: { a: [], p: {} } } }] } } }), { CharacterID: "Ghost-5" });
			g.Character.push(C);
			expect(astral().GetCachedChar(asChar(C), "Ghost-5")).toBe(C);
			expect(astral().GetCachedChar(asChar(C), "Ghost-5", true)).toBeUndefined();
			expect(g.CharacterDelete).toHaveBeenCalledWith(C, false);
		});

		it("SetGhostConfig needs the character's state", () => {
			const C = makeCharacter({ LSCG: { StateModule: { states: [] } } });
			astral().SetGhostConfig(asChar(C), { a: [] } as never);
			astral().SetGhostConfig(asChar(makeCharacter()), { a: [] } as never);
			expect(astral().GetGhostConfig(asChar(C))).toBeUndefined();
		});

		it("the corporeal character sleeps", () => {
			eyes("Angry");
			expect(astral().GetCorporealCharacter(asChar(player()))).toBe(player());
			expect(player().Appearance[0].Property?.Expression).toBe("Closed");
		});
	});

	it("the tint defaults to teal", () => {
		expect(astral().GetProjectionTintColor(asChar(player()))).toBe("#00ced1");
		player().LSCG.MagicModule.projectionTintColor = "#ff00ff";
		expect(astral().GetProjectionTintColor(asChar(player()))).toBe("#ff00ff");
	});

	it("icon and label", () => {
		expect(astral().Icon(asChar(player()))).toBe("Icons/Cage.png");
		expect(astral().Label(asChar(player()))).toBe("Astral Projection");
	});

	it("RequestAnim redraws the queued characters once", () => {
		astral().CharactersToRequestAnim = [asChar(player())];
		astral().RequestAnim();
		expect(astral().CharactersToRequestAnim).toEqual([]);
	});

	it("IsSoulBindGag looks for a soulbound gag in any mouth slot", () => {
		const C = makeCharacter();
		expect(astral().IsSoulBindGag(asChar(C), undefined)).toBe(false);
		const gag = wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemMouth2" }), { Name: "Gag" }), { Craft: { Name: "Astral Gag", Description: "" } }));
		expect(astral().IsSoulBindGag(asChar(C), gag as never)).toBe(true);
	});

	it("RoomSync keeps a projecting body kneeling", () => {
		astral().Activate(2, undefined, false);
		g.Player.PoseMapping.BodyLower = "BaseLower";
		astral().RoomSync();
		expect(g.Player.PoseMapping.BodyLower).toBe("Kneel");
	});

	describe("chat text", () => {
		it("wraps text in ghostly spans, leaving OOC alone", () => {
			const ele = document.createElement("div");
			ele.textContent = "hello (ooc) there";
			astral()._wrapOOCContent(ele, "#00ced1");
			expect(Array.from(ele.childNodes).map(n => (n as HTMLElement).className ?? "text")).toEqual(["ghost-text", "text", "ghost-text"]);
			expect(ele.textContent).toBe("hello (ooc) there");
		});

		it("fades characters in one by one, then settles on the wrapped text", async () => {
			const ele = document.createElement("div");
			ele.textContent = "hi (x)";
			const done = astral()._splitSpanCharacters(ele, "#00ced1");
			const spans = Array.from(ele.querySelectorAll("span"));
			expect(spans.map(s => s.textContent)).toEqual(["h", "i", " ", "(x)"]);
			spans.forEach(s => s.dispatchEvent(new Event("animationend")));
			await done;
			expect(ele.querySelector(".ghost-text")?.textContent).toBe("hi ");
		});

		it("does nothing to an empty element", async () => {
			const ele = document.createElement("div");
			await astral()._splitSpanCharacters(ele, "#000");
			astral()._wrapOOCContent(ele, "#000");
			expect(ele.childNodes).toHaveLength(0);
		});
	});
});
