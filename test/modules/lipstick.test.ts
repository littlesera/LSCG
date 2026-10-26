// LipstickModule: a kiss from someone wearing lipstick leaves a mark of that colour (neck, cheek, forehead, or on a
// gag), stacking two on the neck and cheek, in one of two kissmark slots; a towel rubs marks off; dry lips and full
// slots leave none; safeword clears everything.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { LipstickModule } from "Modules/lipstick";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { receive } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("LipstickModule", () => {
	let lipstick: LipstickModule;
	let kisser: FixtureCharacter;

	beforeAll(() => {
		[, lipstick] = boot(new CoreModule(), new LipstickModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		lipstick.init();
		lipstick.settings.enabled = true;
		vi.stubGlobal("ItemColorIsDefault", (item: { Color?: unknown }) => !item.Color || item.Color === "Default");
		vi.stubGlobal("ServerParseColor", (_asset: unknown, color: unknown) => color);
		for (const grp of ["Mask", "ClothAccessory", "ItemMouth3"]) makeAsset(makeGroup({ Name: grp, Category: grp === "ItemMouth3" ? "Item" : "Appearance" }), { Name: "Kissmark" });
		kisser = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice", LSCG: { LipstickModule: { dry: false } } }));
		wearLips(kisser, ["#ff0000"]);
	});

	afterEach(() => vi.unstubAllGlobals());

	function wearLips(C: FixtureCharacter, color?: string[]) {
		const lips = wear(C, makeItem(makeAsset(makeGroup({ Name: "Mouth", Category: "Appearance" }), { Name: "Mouth1" })));
		(lips as { Color?: unknown }).Color = color;
	}
	const kiss = (group: string, name: string) => receive.activity(kisser, group, name, player());
	const mark = (slot = "Mask") => player().Appearance.find(i => i.Asset.Group.Name === slot && i.Asset.Name === "Kissmark") as { Color?: unknown; Property?: { TypeRecord?: Record<string, number> } } | undefined;
	const rubWithTowel = (group: string) => g.ChatRoomMessage({
		Type: "Activity", Content: `ChatOther-${group}-RubItem`, Sender: 2,
		Dictionary: [{ Tag: "DestinationCharacter", MemberNumber: 1 }, { Tag: "ActivityAsset", AssetName: "Towel" }],
	});

	it("a neck kiss leaves a mark in the kisser's colour, and a second one stacks", () => {
		kiss("ItemNeck", "Kiss");
		expect(mark()?.Color).toEqual(["#ff0000"]);
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toMatchObject({ neck1: true, neck2: false });
		kiss("ItemNeck", "Kiss");
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toMatchObject({ neck1: true, neck2: true });
	});

	it("cheek and forehead kisses mark those places", () => {
		kiss("ItemMouth", "PoliteKiss");
		kiss("ItemMouth", "PoliteKiss");
		kiss("ItemHead", "Kiss");
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toMatchObject({ cheek1: true, cheek2: true, forehead: true });
	});

	it("a different lipstick colour goes in the second slot", () => {
		kiss("ItemNeck", "Kiss");
		wearLips(kisser, ["#0000ff"]);
		kiss("ItemHead", "Kiss");
		expect(mark("ClothAccessory")?.Color).toEqual(["#0000ff"]);
	});

	it("kissing a gag marks it, and that comes off with the cheek marks or a safeword, even as the only mark", () => {
		kiss("ItemMouth", "GagKiss");
		expect(mark("ItemMouth3")?.Color).toEqual(["#ff0000"]);
		lipstick.RemoveKissMark("cheek");
		expect(mark("ItemMouth3")).toBeUndefined();
		kiss("ItemMouth", "GagKiss");
		lipstick.safeword();
		expect(mark("ItemMouth3")).toBeUndefined();
	});

	it("no marks from bare or dry lips, someone else's kiss, or with both slots taken", () => {
		wearLips(kisser);
		kiss("ItemNeck", "Kiss");
		wearLips(kisser, ["#ff0000"]);
		kisser.LSCG.LipstickModule.dry = true;
		kiss("ItemNeck", "Kiss");
		kiss("ItemMouth", "GagKiss");
		kisser.LSCG.LipstickModule.dry = false;
		receive.activity(kisser, "ItemNeck", "Kiss", makeCharacter({ MemberNumber: 9 }));
		expect(mark()).toBeUndefined();

		wear(player(), makeItem(makeAsset(makeGroup({ Name: "Mask", Category: "Appearance" }), { Name: "Veil" })));
		wear(player(), makeItem(makeAsset(makeGroup({ Name: "ClothAccessory", Category: "Appearance" }), { Name: "Scarf" })));
		expect(lipstick.kissMarkSlotsOccupied()).toBe(true);
		kiss("ItemNeck", "Kiss");
		expect(player().Appearance.some(i => i.Asset.Name === "Kissmark")).toBe(false);
	});

	it("a gag that isn't a kissmark takes no mark", () => {
		wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemMouth3" }), { Name: "Tape" })));
		kiss("ItemMouth", "GagKiss");
		expect(mark("ItemMouth3")).toBeUndefined();
	});

	it("a towel rubs off the marks where it's used", () => {
		kiss("ItemNeck", "Kiss");
		kiss("ItemMouth", "PoliteKiss");
		kiss("ItemHead", "Kiss");
		rubWithTowel("ItemNeck");
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toMatchObject({ neck1: false, cheek1: true, forehead: true });
		rubWithTowel("ItemMouth");
		rubWithTowel("ItemHood");
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toMatchObject({ cheek1: false, forehead: false });
	});

	it("safeword clears every mark", () => {
		kiss("ItemNeck", "Kiss");
		kiss("ItemMouth", "GagKiss");
		lipstick.safeword();
		expect(lipstick.getKissMarkStatus(mark()!.Property!.TypeRecord!)).toEqual({ cheek1: false, cheek2: false, forehead: false, neck1: false, neck2: false });
		expect(mark("ItemMouth3")).toBeUndefined();
	});

	it("does nothing while disabled, or with no marks to remove", () => {
		lipstick.RemoveKissMark("all");
		lipstick.settings.enabled = false;
		kiss("ItemNeck", "Kiss");
		expect(mark()).toBeUndefined();
	});

	it("an unreadable mouth colour counts as no lipstick", () => {
		vi.stubGlobal("ItemColorIsDefault", () => { throw new Error("bad"); });
		expect(lipstick.getKisserLipColor(kisser as never)).toBe("Default");
	});

	it("translates mark status to and from the kissmark's type record", () => {
		const status = { cheek1: true, cheek2: false, forehead: true, neck1: false, neck2: true };
		expect(lipstick.getKissMarkStatus(lipstick.getKissMarkTypeRecord(status))).toEqual(status);
	});
});
