// The rest of utils.ts's non-drawing helpers: chat hooks, BCX hooks, settings
// export/import, size reports, asset-group classification, lock/key checks, BCX curse
// data, and the small item/character helpers.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ApplyBundleToCharacter,
	CanApplyLock,
	CanReplaceItem,
	CanUnlock,
	CompressLSCGSettings,
	GetCraftingNameAndDescriptionConcat,
	GetDataSizeReport,
	GetHandheldItemNameAndDescriptionConcat,
	GetItemName,
	HasLockKey,
	OnAction,
	OnActivity,
	OnChat,
	OnWhisper,
	RemoveItem,
	StripCharacterNoRedraw,
	activityHasDictionaryText,
	canChangeCosplay,
	downloadText,
	forceOrgasm,
	getActivityLabel,
	getActivityLabelTag,
	getBCXActiveCurseSlots,
	getBCXData,
	getDominance,
	handleImportString,
	hookBCXCurse,
	hookBCXVoice,
	htmlToElement,
	isAppearance,
	isBind,
	isBody,
	isCloth,
	isCosplay,
	isHair,
	isOutfitEditorCharacter,
	isSkin,
	parseFromBase64,
	removeAllHooksByModule,
	stringIsCompressedItemBundleArray,
	toItemBundle,
	waitFor,
} from "utils";
import { ModuleCategory } from "Settings/setting_definitions";
import { resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asAny = <T>(x: T) => x as any;

beforeEach(() => {
	resetWorld({ MemberNumber: 1, Nickname: "Sera" });
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("waitFor", () => {
	it("resolves true once the condition holds", async () => {
		vi.useFakeTimers();
		let ready = false;
		const done = waitFor(() => ready);
		await vi.advanceTimersByTimeAsync(50);
		ready = true;
		await vi.advanceTimersByTimeAsync(20);
		await expect(done).resolves.toBe(true);
	});

	it("resolves false when cancelled first", async () => {
		await expect(waitFor(() => false, () => true)).resolves.toBe(false);
	});
});

describe("chat hooks", () => {
	afterEach(() => removeAllHooksByModule(ModuleCategory.Misc));

	function deliver(Type: string) {
		g.ChatRoomMessage({ Type, Content: "hi", Sender: 2, Dictionary: [{ Tag: "x" }] });
	}

	it.each([
		["OnWhisper", OnWhisper, ["Whisper"]],
		["OnChat", OnChat, ["Chat", "Whisper"]],
		["OnAction", OnAction, ["Action", "Emote"]],
		["OnActivity", OnActivity, ["Activity"]],
	] as const)("%s only fires for its message types, with the sender resolved", (_, hook, types) => {
		const sender = addToRoom(makeCharacter({ MemberNumber: 2 }));
		const callback = vi.fn();
		hook(1, ModuleCategory.Misc, callback);
		for (const type of ["Chat", "Whisper", "Action", "Emote", "Activity", "Hidden"]) deliver(type);
		expect(callback.mock.calls.map(c => c[0].Type)).toEqual(types);
		expect(callback).toHaveBeenCalledWith(expect.anything(), sender, "hi", [{ Tag: "x" }]);
	});
});

describe("BCX hooks", () => {
	it("return false without BCX", () => {
		expect(hookBCXCurse(vi.fn())).toBe(false);
		expect(hookBCXVoice(vi.fn())).toBe(false);
	});

	it("subscribe to BCX's mod API events", () => {
		const on = vi.fn();
		vi.stubGlobal("bcx", { getModApi: () => ({ on }) });
		const curse = vi.fn();
		const voice = vi.fn();
		expect(hookBCXCurse(curse)).toBe(true);
		expect(hookBCXVoice(voice)).toBe(true);
		expect(on).toHaveBeenCalledWith("curseTrigger", curse);
		expect(on).toHaveBeenCalledWith("bcxLocalMessage", voice);
	});

	it("getBCXData / getBCXActiveCurseSlots read the active curses", () => {
		expect(getBCXData()).toBeUndefined();
		expect(getBCXActiveCurseSlots()).toEqual([]);
		const data = { conditions: { curses: { conditions: { ItemArms: { active: true }, ItemLegs: { active: false }, ItemFeet: {} } } } };
		asAny(player()).ExtensionSettings = { BCX: "1:" + g.LZString.compressToBase64(JSON.stringify(data)) };
		expect(getBCXData()).toEqual(data);
		expect(getBCXActiveCurseSlots()).toEqual(["ItemArms"]);
	});
});

describe("settings export / import", () => {
	function settings(version = LSCG_VERSION) {
		const stats = (n: number) => ({ stats: { count: n } });
		return {
			Version: version, GlobalModule: { enabled: true },
			ActivityModule: stats(1), CollarModule: stats(2), HypnoModule: stats(3), InjectorModule: stats(4), MiscModule: stats(5),
		};
	}

	it("CompressLSCGSettings round-trips through parseFromBase64", () => {
		player().LSCG = settings();
		expect(parseFromBase64(CompressLSCGSettings())).toEqual(player().LSCG);
	});

	it("handleImportString takes new settings but keeps local stats and version, backing up the old ones", () => {
		player().LSCG = settings();
		const incoming = { ...settings(), GlobalModule: { enabled: false }, CollarModule: { stats: { count: 99 }, chokeLevel: 2 } };
		expect(handleImportString(g.LZString.compressToBase64(JSON.stringify(incoming)))).toBe(true);
		expect(player().LSCG.GlobalModule.enabled).toBe(false);
		expect(player().LSCG.CollarModule).toEqual({ stats: { count: 2 }, chokeLevel: 2 });
		expect(localStorage.getItem("LSCG_1_Backup")).toBeTruthy();
	});

	it("handleImportString rejects older versions, junk and missing GlobalModule", () => {
		player().LSCG = settings();
		const compress = (o: unknown) => g.LZString.compressToBase64(JSON.stringify(o));
		expect(handleImportString(compress(settings("v0.0.1")))).toBe(false);
		expect(handleImportString(compress({ Version: LSCG_VERSION }))).toBe(false);
		expect(handleImportString("not base64 at all")).toBe(false);
		expect(handleImportString("")).toBe(false);
		expect(player().LSCG.GlobalModule.enabled).toBe(true);
	});

	it("downloadText clicks a temporary download link", () => {
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:x"), revokeObjectURL: vi.fn() });
		const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
		expect(downloadText("data", "out.lscg")).toBe("out.lscg");
		expect(downloadText("data")).toMatch(/^Export-1-\d+\.lscg$/);
		expect(click).toHaveBeenCalledTimes(2);
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
		expect(document.querySelector("a")).toBeNull();
		click.mockRestore();
	});

	it("stringIsCompressedItemBundleArray", () => {
		expect(stringIsCompressedItemBundleArray(g.LZString.compressToBase64("[]"))).toBe(true);
		expect(stringIsCompressedItemBundleArray(g.LZString.compressToBase64("{}"))).toBe(false);
		expect(stringIsCompressedItemBundleArray("garbage")).toBe(false);
	});
});

describe("GetDataSizeReport", () => {
	it("sizes primitives, sorts children biggest first, and survives cycles", () => {
		const data: Record<string, unknown> = { n: 1, s: "abc", b: true, nil: null, u: undefined, f: () => 0, sym: Symbol("x"), list: [1, 2] };
		data.self = data;
		const report = GetDataSizeReport(data, false);
		const children = report.children!;
		expect(report.type).toBe("object");
		expect(children.n).toEqual({ type: "number", sizeBytes: 8, value: 1 });
		expect(children.s).toEqual({ type: "string", sizeBytes: 3, value: "abc" });
		expect(children.b.sizeBytes).toBe(4);
		expect(children.nil.type).toBe("null");
		expect(children.u.type).toBe("undefined");
		expect(children.f).toEqual({ type: "function", sizeBytes: 0 });
		expect(children.sym.sizeBytes).toBeGreaterThan(0);
		expect(children.list).toMatchObject({ type: "array", sizeBytes: 16 });
		expect(children.self.type).toBe("circular_reference");
		const sizes = Object.values(children).map(c => c.sizeBytes);
		expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
	});

	it("logs when asked", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		GetDataSizeReport({ a: 1 });
		expect(log).toHaveBeenCalledOnce();
		log.mockRestore();
	});
});

describe("activity labels", () => {
	const activity = { Name: "Kiss" } as never;

	it("getActivityLabelTag maps vulva groups for a player with a penis", () => {
		expect(getActivityLabelTag(activity, { Name: "ItemVulva" } as never, true)).toBe("Label-ChatSelf-ItemVulva-Kiss");
		player().flags.hasPenis = true;
		expect(getActivityLabelTag(activity, { Name: "ItemVulva" } as never, false)).toBe("Label-ChatOther-ItemPenis-Kiss");
		expect(getActivityLabelTag(activity, { Name: "ItemVulvaPiercings" } as never, false)).toBe("Label-ChatOther-ItemGlans-Kiss");
	});

	it("getActivityLabel looks the tag up, or reports a missing activity", () => {
		expect(getActivityLabel(null as never, { Name: "ItemMouth" } as never, true)).toBe("ACTIVITY NOT FOUND");
		expect(getActivityLabel(activity, { Name: "ItemMouth" } as never, true)).toContain("Label-ChatSelf-ItemMouth-Kiss");
	});

	it("activityHasDictionaryText checks the loaded cache", () => {
		g.ActivityDictionaryLoad.mockReturnValueOnce({ cache: {} });
		expect(activityHasDictionaryText("x")).toBeUndefined();
		g.ActivityDictionaryLoad.mockReturnValueOnce({ loaded: true, cache: { x: "X" } });
		expect(activityHasDictionaryText("x")).toBe(true);
		g.ActivityDictionaryLoad.mockReturnValueOnce({ loaded: true, cache: {} });
		expect(activityHasDictionaryText("x")).toBe(false);
	});
});

describe("asset group classification", () => {
	const groups = () => ({
		shirt: makeGroup({ Name: "Cloth", Category: "Appearance", Clothing: true }),
		bra: makeGroup({ Name: "Bra", Category: "Appearance", Clothing: true, Underwear: true }),
		ears: makeGroup({ Name: "HairAccessory2", Category: "Appearance", Clothing: true, BodyCosplay: true }),
		hair: makeGroup({ Name: "HairFront", Category: "Appearance", AllowNone: false }),
		skin: makeGroup({ Name: "BodyUpper", Category: "Appearance", AllowNone: false }),
		eyeShadow: makeGroup({ Name: "EyeShadow", Category: "Appearance", Clothing: true }),
		pronouns: makeGroup({ Name: "Pronouns", Category: "Appearance" }),
		arms: makeGroup({ Name: "ItemArms" }),
		neck: makeGroup({ Name: "ItemNeck" }),
		tail: makeGroup({ Name: "ItemTail", BodyCosplay: true }),
	});

	it("tells clothes, underwear and cosplay apart", () => {
		const G = groups();
		expect([isCloth(G.shirt as never), isCloth(G.bra as never), isCloth(G.bra as never, false, false), isCloth(G.ears as never)]).toEqual([true, true, false, false]);
		expect(isCloth(G.ears as never, true)).toBe(true);
		expect(isCosplay(G.ears as never)).toBe(true);
		expect(isCosplay(G.shirt as never)).toBe(false);
	});

	it("identifies body, hair and skin groups", () => {
		const G = groups();
		expect([isBody(G.hair as never), isBody(G.eyeShadow as never), isBody(G.pronouns as never), isBody(G.shirt as never)]).toEqual([true, true, false, false]);
		expect([isHair(G.hair as never), isHair(G.skin as never)]).toEqual([true, false]);
		expect([isSkin(G.skin as never), isSkin(G.eyeShadow as never), isSkin(G.hair as never)]).toEqual([true, true, false]);
		expect([isAppearance(G.hair as never), isAppearance(G.arms as never)]).toEqual([true, false]);
	});

	it("isBind excludes neck slots and cosplay items", () => {
		const G = groups();
		expect([isBind(G.arms as never), isBind(G.neck as never), isBind(G.tail as never), isBind(G.shirt as never)]).toEqual([true, false, false, false]);
		expect(isBind(G.neck as never, [])).toBe(true);
	});

	it("resolves a group from an asset, an item or a name", () => {
		const G = groups();
		const asset = makeAsset(G.shirt, { Name: "Shirt" });
		expect(isCloth(asset as never)).toBe(true);
		expect(isCloth(makeItem(asset) as never)).toBe(true);
		expect(isCloth("Cloth" as never)).toBe(true);
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(isCloth("Nope" as never)).toBe(false);
		warn.mockRestore();
	});
});

describe("item and character helpers", () => {
	it("GetItemName prefers the crafted name", () => {
		expect(GetItemName({ Asset: { Description: "Rope" } } as never)).toBe("rope");
		expect(GetItemName({ Asset: { Description: "Rope" }, Craft: { Name: "Silk" } } as never)).toBe("Silk");
	});

	it("GetHandheldItemNameAndDescriptionConcat reads the player's hand by default", () => {
		const hand = makeGroup({ Name: "ItemHandheld" });
		wear(player(), makeItem(makeAsset(hand, { Name: "Wand" }), { Craft: { Name: "Staff", Description: "glowing" } }));
		expect(GetHandheldItemNameAndDescriptionConcat()).toBe("Staff | glowing");
		expect(GetHandheldItemNameAndDescriptionConcat(makeCharacter() as never)).toBeUndefined();
	});

	it("GetCraftingNameAndDescriptionConcat", () => {
		expect(GetCraftingNameAndDescriptionConcat(null)).toBeUndefined();
		expect(GetCraftingNameAndDescriptionConcat({ Name: "A", Description: "b" } as never)).toBe("A | b");
	});

	it("toItemBundle throws for an unknown asset", () => {
		const group = makeGroup({ Name: "ItemArms" });
		const asset = makeAsset(group, { Name: "Rope" });
		expect(toItemBundle(makeItem(asset) as never, undefined)).toMatchObject({ Group: "ItemArms", Name: "Rope" });
		expect(() => toItemBundle({ Asset: { Name: "Ghost", Group: group } } as never, undefined)).toThrow("Unknown asset: ItemArmsGhost");
	});

	it("getDominance reads the Dominant reputation", () => {
		expect(getDominance(makeCharacter() as never)).toBe(0);
		expect(getDominance(makeCharacter({ Reputation: [{ Type: "Dominant", Value: -40 }] }) as never)).toBe(-40);
	});

	it("htmlToElement parses the first node", () => {
		expect((htmlToElement("  <b>hi</b><i/>  ") as HTMLElement).tagName).toBe("B");
	});

	it("canChangeCosplay respects BlockBodyCosplay except for oneself", () => {
		const C = asAny(makeCharacter({ MemberNumber: 5 }));
		expect(canChangeCosplay(2, C)).toBe(true);
		C.OnlineSharedSettings = { BlockBodyCosplay: true };
		expect(canChangeCosplay(2, C)).toBe(false);
		expect(canChangeCosplay(5, C)).toBe(true);
	});

	it("isOutfitEditorCharacter recognizes the editor's preview characters", () => {
		expect(isOutfitEditorCharacter({ CharacterID: "LSCG-OutfitCreator-1" } as never)).toBe(true);
		expect(isOutfitEditorCharacter({ CharacterID: "123" } as never)).toBe(false);
		expect(isOutfitEditorCharacter(null)).toBe(false);
	});

	it("StripCharacterNoRedraw keeps only body and mandatory groups", () => {
		const C = makeCharacter();
		wear(C, makeItem(makeAsset(makeGroup({ Name: "Cloth", Category: "Appearance", Clothing: true }), { Name: "Shirt" })));
		wear(C, makeItem(makeAsset(makeGroup({ Name: "BodyUpper", Category: "Appearance", AllowNone: false }), { Name: "Body" })));
		wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Rope" })));
		StripCharacterNoRedraw(C as never);
		expect(C.Appearance.map(i => i.Asset.Name)).toEqual(["Body", "Rope"]);
	});

	it("forceOrgasm maxes arousal and starts the orgasm", () => {
		forceOrgasm();
		expect(player().ArousalSettings.Progress).toBe(100);
		expect(g.ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
	});

	it("ApplyBundleToCharacter overlays the bundle onto the current appearance", () => {
		vi.stubGlobal("ServerAppearanceBundle", vi.fn(() => [{ Group: "Cloth", Name: "Shirt" }, { Group: "Shoes", Name: "Boots" }]));
		vi.stubGlobal("ServerAppearanceLoadFromBundle", vi.fn());
		const C = makeCharacter();
		ApplyBundleToCharacter(C as never, [{ Group: "Cloth", Name: "Dress" }] as never);
		expect(g.ServerAppearanceLoadFromBundle).toHaveBeenCalledWith(C, "Female3DCG",
			[{ Group: "Shoes", Name: "Boots" }, { Group: "Cloth", Name: "Dress" }], undefined);
	});
});

describe("locks and keys", () => {
	// Relationship methods real BC Characters have and fixtures don't
	type Relations = Record<"IsLoverOfPlayer" | "IsOwnedByPlayer" | "IsFamilyOfPlayer" | "IsInFamilyOfMemberNumber" | "IsOwned" | "IsOwner", () => boolean> & { GetLoversNumbers: () => number[] };
	let acted: FixtureCharacter & Relations;
	const lockedItem = (lockAsset: Record<string, unknown>, property: Record<string, unknown> = {}, assetExtra: Record<string, unknown> = {}) => {
		const item = { Asset: { Name: "Cuffs", Enable: true, Group: makeGroup({ Name: "ItemArms" }), ...assetExtra }, Property: { LockedBy: "MetalPadlock", ...property } };
		vi.stubGlobal("InventoryGetLock", () => ({ Asset: lockAsset }));
		return item;
	};

	beforeEach(() => {
		acted = Object.assign(makeCharacter({ MemberNumber: 5 }), {
			IsLoverOfPlayer: () => false,
			IsOwnedByPlayer: () => false,
			IsFamilyOfPlayer: () => false,
			IsInFamilyOfMemberNumber: () => false,
			IsOwned: () => false,
			IsOwner: () => false,
			GetLoversNumbers: () => [],
		});
		vi.stubGlobal("InventoryAvailable", vi.fn(() => false));
		vi.stubGlobal("CommonConvertStringToArray", (s: string) => s.split(",").filter(Boolean).map(Number));
		vi.stubGlobal("LogQueryRemote", vi.fn(() => false));
	});

	it("CanUnlock: anything unlocked is fine; restrained others and exclusive locks are not", () => {
		expect(CanUnlock(1, acted as never, undefined)).toBe(false);
		expect(CanUnlock(1, acted as never, { Asset: {}, Property: {} } as never)).toBe(true);
		const item = lockedItem({});
		acted.flags.canInteract = false;
		expect(CanUnlock(1, acted as never, item as never)).toBe(false);
		acted.flags.canInteract = true;
		expect(CanUnlock(1, acted as never, lockedItem({}, { LockedBy: "ExclusivePadlock" }) as never)).toBe(true);
		g.LogQuery.mockReturnValueOnce(true);
		expect(CanUnlock(1, acted as never, item as never)).toBe(false);
	});

	it("CanUnlock: owner/lover/family-only assets need that relationship", () => {
		expect(CanUnlock(1, acted as never, lockedItem({}, {}, { OwnerOnly: true }) as never)).toBe(false);
		acted.IsOwnedByPlayer = () => true;
		expect(CanUnlock(1, acted as never, lockedItem({}, {}, { OwnerOnly: true }) as never)).toBe(true);
		expect(CanUnlock(1, acted as never, lockedItem({}, {}, { LoverOnly: true }) as never)).toBe(false);
		expect(CanUnlock(1, acted as never, lockedItem({}, {}, { FamilyOnly: true }) as never)).toBe(false);
	});

	it("HasLockKey: an owner always has the key", () => {
		acted.OwnerMemberNumber = 1;
		expect(HasLockKey(1, acted as never, lockedItem({}) as never)).toBe(true);
	});

	it("HasLockKey: high-security locks check the keyholder list, intricate locks the locker", () => {
		expect(HasLockKey(1, acted as never, lockedItem({ ExclusiveUnlock: true }, { MemberNumberListKeys: "1,2" }) as never)).toBe(true);
		expect(HasLockKey(3, acted as never, lockedItem({ ExclusiveUnlock: true }, { MemberNumberListKeys: "1,2" }) as never)).toBe(false);
		expect(HasLockKey(3, acted as never, lockedItem({ ExclusiveUnlock: true }, { LockMemberNumber: 3 }) as never)).toBe(true);
	});

	it("HasLockKey: a key asset with the matching unlock effect opens ordinary locks", () => {
		expect(HasLockKey(1, acted as never, lockedItem({}) as never)).toBe(false);
		vi.stubGlobal("AppearanceItem", { fromAsset: (a: unknown) => ({ Asset: a, Property: { Effect: ["UnlockMetalPadlock"] } }) });
		makeAsset(makeGroup({ Name: "ItemMisc" }), { Name: "MetalPadlockKey" });
		expect(HasLockKey(1, acted as never, lockedItem({}) as never)).toBe(true);
		expect(HasLockKey(1, acted as never, lockedItem({ OwnerOnly: true }) as never)).toBe(false);
		expect(HasLockKey(1, acted as never, lockedItem({ LoverOnly: true }) as never)).toBe(false);
		expect(HasLockKey(1, acted as never, lockedItem({ FamilyOnly: true }) as never)).toBe(false);
	});

	it("HasLockKey: lovers with a lovers' key open non-owner locks", () => {
		acted.IsLoverOfPlayer = () => true;
		vi.mocked(g.InventoryAvailable).mockReturnValue(true);
		expect(HasLockKey(1, acted as never, lockedItem({}, { LockedBy: "LoversPadlock" }) as never)).toBe(true);
	});

	it("HasLockKey: self-unlock blocked locks stay shut for the player", () => {
		const item = lockedItem({}, { SelfUnlock: false });
		expect(HasLockKey(1, player() as never, item as never)).toBe(false);
	});

	describe("CanApplyLock", () => {
		const lock = (asset: Record<string, unknown>) => ({ Asset: { Enable: true, IsLock: true, ...asset } }) as never;

		it("refuses a disabled lock and allows a plain one", () => {
			expect(CanApplyLock(acted as never, 1, lock({ Enable: false }))).toBe(false);
			expect(CanApplyLock(acted as never, 1, lock({}))).toBe(true);
		});

		it("owner locks need the owner", () => {
			expect(CanApplyLock(acted as never, 1, lock({ OwnerOnly: true }))).toBe(false);
			acted.OwnerMemberNumber = 1;
			expect(CanApplyLock(acted as never, 1, lock({ OwnerOnly: true }))).toBe(true);
		});

		it("lover locks need a lover, or the owner of someone with lovers", () => {
			expect(CanApplyLock(acted as never, 1, lock({ LoverOnly: true }))).toBe(false);
			acted.LoverMemberNumber = [1];
			expect(CanApplyLock(acted as never, 1, lock({ LoverOnly: true }))).toBe(true);
			acted.LoverMemberNumber = [];
			acted.GetLoversNumbers = () => [9];
			acted.OwnerMemberNumber = 1;
			expect(CanApplyLock(acted as never, 1, lock({ LoverOnly: true }))).toBe(true);
			vi.mocked(g.LogQueryRemote).mockReturnValueOnce(true);
			expect(CanApplyLock(acted as never, 1, lock({ LoverOnly: true }))).toBe(false);
		});

		it("family locks need family, and an owner can't be family-locked", () => {
			expect(CanApplyLock(acted as never, 1, lock({ FamilyOnly: true }))).toBe(false);
			acted.IsInFamilyOfMemberNumber = () => true;
			expect(CanApplyLock(acted as never, 1, lock({ FamilyOnly: true }))).toBe(true);
			acted.IsOwner = () => true;
			expect(CanApplyLock(acted as never, 1, lock({ FamilyOnly: true }))).toBe(false);
		});
	});

	it("RemoveItem / CanReplaceItem respect protected and blocked items", () => {
		const cloth = makeGroup({ Name: "Cloth", Category: "Appearance", Clothing: true });
		const shirt = wear(player(), makeItem(makeAsset(cloth, { Name: "Shirt" })));
		expect(CanReplaceItem(shirt as never, 1)).toBe(true);
		const collar = makeItem(makeAsset(makeGroup({ Name: "ItemNeck", Category: "Appearance" }), { Name: "SlaveCollar" }));
		expect(CanReplaceItem(collar as never, 1)).toBe(false);
		const body = wear(player(), makeItem(makeAsset(makeGroup({ Name: "BodyStyle", Category: "Appearance" }), { Name: "Style" })));
		RemoveItem(body as never, 1);
		RemoveItem(shirt as never, 1);
		expect(player().Appearance.map(i => i.Asset.Name)).toEqual(["Style"]);
	});
});
