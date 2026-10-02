// The lock permission ladder (utils.ts) against real BC Character/Asset objects and
// real InventoryGetLock/InventoryAvailable logic. HasLockKey/CanApplyLock/CanUnlock all
// gate on real Ownership/Lovership relationship state and real lock-asset flags
// (OwnerOnly/LoverOnly/FamilyOnly/ExclusiveUnlock), which only exist once real BC asset
// data is loaded -- this project's reason for a "bc" tier at all.
//
// LogQuery/LogQueryRemote are BC globals defined in Log.js, a file this harness's sparse
// checkout deliberately never loads (see test/harness/bc-loader.ts's ALL_FILES) -- they
// gate opt-in "OwnerRule"/"LoverRule" block-self-locking preferences that don't exist
// without a real logged-in account. Stubbed here to their real-world default (false, i.e.
// "rule not set" / "not blocked") so the ladder's own logic is what's under test.
import { beforeEach, describe, expect, it } from "vitest";
import { CanApplyLock, CanUnlock, HasLockKey } from "utils";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function makeCharacter(memberNumber: number): Character {
	// CharacterType.ONLINE (not NPC): IsOwned()/IsInFamilyOfMemberNumber() branch on IsNpc()
	// into NPC-specific paths (NPCEventGet, PrivateCharacter walks) this harness's sparse
	// checkout doesn't load (NPC.js) -- an "online" character skips straight to the real
	// Ownership/Lovership-based checks this suite actually wants to exercise.
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	return C;
}

function wearLock(C: Character, itemAsset: Asset, lockAsset: Asset, extraProps: Record<string, unknown> = {}): Item {
	const item = { Asset: itemAsset, Property: { LockedBy: lockAsset.Name, ...extraProps } } as never as Item;
	(C as never as { Appearance: Item[] }).Appearance.push(item);
	return item;
}

describe("lock permission ladder (real BC data)", () => {
	beforeEach(() => {
		g.LogQuery = () => false;
		g.LogQueryRemote = () => false;
		g.ChatRoomCharacter = [];
		// IsOwned()'s AsylumGGTSGetLevel() fallback (for a character with no Ownership set at
		// all) and IsInFamilyOfMemberNumber()'s PrivateCharacter member-number lookup both come
		// from Asylum.js/NPC.js, neither of which this harness's sparse checkout loads (see
		// test/harness/bc-loader.ts's ALL_FILES). These live as bare `var`s in the real BC vm
		// realm (not Node's globalThis), so they have to be defined through evalInBcRealm, not
		// a plain `g.X = ...` assignment, to be visible when Character.js's own code runs.
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
		`);
	});

	describe("HasLockKey", () => {
		it("returns false for no item", () => {
			const acted = makeCharacter(2);
			expect(HasLockKey(1, acted, undefined)).toBe(false);
		});

		it("the character's own owner always has the key to an enabled locked item", () => {
			const acted = makeCharacter(2);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "MetalPadlock"));
			expect(HasLockKey(1, acted, item)).toBe(true);
		});

		it("a stranger (not owner, no matching key item) cannot unlock an owner padlock", () => {
			const acted = makeCharacter(2);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "OwnerPadlock"));
			expect(HasLockKey(99, acted, item)).toBe(false);
		});

		it("a lover with a LoversPadlockKey in inventory can open a non-owner lovers padlock", () => {
			const acted = makeCharacter(2);
			acted.Lovership = [{ MemberNumber: 1 } as never];
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "LoversPadlock"), { LockedBy: "LoversPadlock" });
			const keyAsset = findAsset("ItemMisc", "LoversPadlockKey");
			(g.Player as never as { Inventory: { Name: string; Group: string }[] }).Inventory.push({ Name: keyAsset.Name, Group: "ItemMisc" });
			expect(HasLockKey(1, acted, item)).toBe(true);
		});

		it("an exclusive-unlock (intricate) padlock only grants access to the listed keyholder member numbers", () => {
			const acted = makeCharacter(2);
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "IntricatePadlock"), { MemberNumberListKeys: "5,6" });
			expect(HasLockKey(5, acted, item)).toBe(true);
			expect(HasLockKey(7, acted, item)).toBe(false);
		});

		it("a family-only lock blocks the family key when the BlockFamilyKey owner rule is set", () => {
			g.LogQuery = (rule: string, category: string) => rule === "BlockFamilyKey" && category === "OwnerRule";
			const acted = makeCharacter(2);
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "FamilyPadlock"));
			expect(HasLockKey(1, acted, item)).toBe(false);
		});
	});

	describe("CanApplyLock", () => {
		it("a disabled lock asset can never be applied", () => {
			const acted = makeCharacter(2);
			const asset = findAsset("ItemMisc", "PortalLinkPadlock");
			expect(CanApplyLock(acted, 1, { Asset: asset } as never as Item)).toBe(false);
		});

		it("an owner-only lock can be applied by the character's owner", () => {
			const acted = makeCharacter(2);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			const asset = findAsset("ItemMisc", "OwnerPadlock");
			expect(CanApplyLock(acted, 1, { Asset: asset } as never as Item)).toBe(true);
		});

		it("an owner-only lock cannot be applied by a non-owner", () => {
			const acted = makeCharacter(2);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			const asset = findAsset("ItemMisc", "OwnerPadlock");
			expect(CanApplyLock(acted, 99, { Asset: asset } as never as Item)).toBe(false);
		});

		it("self-bondage with an owner-only lock is allowed when the player is owned (by someone else) and the BlockOwnerLockSelf rule isn't set", () => {
			// selfBondage requires C.IsPlayer() && Player.MemberNumber == acting; g.Player.MemberNumber is 1.
			// Ownership must belong to someone OTHER than the acting member number (999, not 1) so that
			// IsOwnedByMemberNumber(acting) stays false and the OwnerOnly branch's selfBondage path is
			// actually reached, while C.IsOwned() is still truthy (owned by someone).
			g.Player.Ownership = { MemberNumber: 999, Stage: 1 } as never;
			const asset = findAsset("ItemMisc", "OwnerPadlock");
			expect(CanApplyLock(g.Player, 1, { Asset: asset } as never as Item)).toBe(true);
		});

		it("self-bondage with an owner-only lock is blocked by the BlockOwnerLockSelf rule", () => {
			g.LogQuery = (rule: string, category: string) => rule === "BlockOwnerLockSelf" && category === "OwnerRule";
			g.Player.Ownership = { MemberNumber: 999, Stage: 1 } as never;
			const asset = findAsset("ItemMisc", "OwnerPadlock");
			expect(CanApplyLock(g.Player, 1, { Asset: asset } as never as Item)).toBe(false);
		});

		it("a lover-only lock can be applied by a lover", () => {
			const acted = makeCharacter(2);
			acted.Lovership = [{ MemberNumber: 1 } as never];
			const asset = findAsset("ItemMisc", "LoversPadlock");
			expect(CanApplyLock(acted, 1, { Asset: asset } as never as Item)).toBe(true);
		});

		it("a lover-only lock cannot be applied by a non-lover, non-owner", () => {
			const acted = makeCharacter(2);
			const asset = findAsset("ItemMisc", "LoversPadlock");
			expect(CanApplyLock(acted, 99, { Asset: asset } as never as Item)).toBe(false);
		});

		it("a family-only lock cannot be applied by someone outside the family", () => {
			const acted = makeCharacter(2);
			const asset = findAsset("ItemMisc", "FamilyPadlock");
			expect(CanApplyLock(acted, 99, { Asset: asset } as never as Item)).toBe(false);
		});
	});

	describe("CanUnlock", () => {
		it("an item with no lock applied is always unlockable", () => {
			const acted = makeCharacter(2);
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = { Asset: collar, Property: {} } as never as Item;
			expect(CanUnlock(1, acted, item)).toBe(true);
		});

		it("an ExclusivePadlock-locked item can only be unlocked by someone other than the wearer", () => {
			const acted = makeCharacter(2);
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "ExclusivePadlock"));
			expect(CanUnlock(1, acted, item)).toBe(true);
			expect(CanUnlock(1, g.Player, item)).toBe(false); // g.Player.IsPlayer() === true
		});

		it("an owner-only-asset lock is only unlockable by the player when the acted character is owned by the player", () => {
			const acted = makeCharacter(2);
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "OwnerPadlock"));
			expect(CanUnlock(1, acted, item)).toBe(false);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			expect(CanUnlock(1, acted, item)).toBe(true);
		});

		it("falls through to HasLockKey for a plain MetalPadlock, which any owner of a MetalPadlockKey can open", () => {
			// MetalPadlock has no Owner/Lover/FamilyOnly restriction, so HasLockKey's final
			// fallback governs: it just asks "does a real BC asset carrying the matching
			// Unlock<LockName> effect exist" (MetalPadlockKey does) -- it isn't scoped to
			// whether `acting` is actually holding one. That's real BC behavior, not a gap
			// in this test's fixtures.
			const acted = makeCharacter(2);
			acted.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			const collar = findAsset("ItemNeck", "LeatherCollar");
			const item = wearLock(acted, collar, findAsset("ItemMisc", "MetalPadlock"));
			expect(CanUnlock(1, acted, item)).toBe(true);
			expect(CanUnlock(99, acted, item)).toBe(true);
		});
	});
});
