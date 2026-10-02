// Clasped leashes with real BC items, for the parts that depend on what's worn. The rest of clasping is tested
// against the fake BC in test/modules/leashing-clasp.test.ts.
//
// Clasp Leash checks its target with BC's own ChatRoomCanBeLeashed and inventory functions, which run in the
// BC realm, so the leashes, locks and devices here are BC's real ones.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { CoreModule } from "Modules/core";
import { Leashing, LeashingModule } from "Modules/leashing";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function makeCharacter(memberNumber: number, lscg = true): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	C.Nickname = `Player${String.fromCharCode(64 + memberNumber)}`;
	C.OnlineSharedSettings = { AllowPlayerLeashing: true };
	C.PermissionItems = {};
	if (lscg) C.LSCG = { GlobalModule: { enabled: true }, LeashingModule: { enabled: true } };
	return C;
}

function wear(C: Character, group: string, name: string, property: object = {}, color?: string): Item {
	const item = { Asset: findAsset(group, name), Property: property, Color: color } as never as Item;
	const appearance = (C as never as { Appearance: Item[] }).Appearance;
	(C as never as { Appearance: Item[] }).Appearance = appearance.filter(i => i.Asset.Group.Name !== group).concat(item);
	C.Effect = g.CharacterGetEffects(C);
	return item;
}

const collared = (C: Character) => wear(C, "ItemNeck", "LeatherCollar");
const leashed = (C: Character, property: object = {}) => {
	collared(C);
	return wear(C, "ItemNeckRestraints", "CollarLeash", property);
};

describe("clasped leashes with real BC items", () => {
	let leashing: LeashingModule;

	beforeAll(() => {
		registerModule(new CoreModule()).init();
		leashing = registerModule(new LeashingModule());
		leashing.init();
		leashing.load();
	});

	beforeEach(() => {
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
			ChatRoomData = null;
		`);
		g.ChatRoomData = undefined;
		g.Player.LSCG.GlobalModule = { enabled: true };
		g.Player.LSCG.LeashingModule = { enabled: true };
		g.ServerPlayerIsInChatRoom = () => true;
		g.Player.Appearance = [];
		g.Player.Effect = [];
		g.Player.Ownership = undefined;
		g.Player.Lovership = [];
		leashing.Pairings = [];
	});

	describe("what Clasp Leash can reach", () => {
		it("someone else's leash", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			leashed(B);
			expect(leashing.CanClaspTo(A, B)).toBe(true);
		});

		it("not a leash slot holding something other than a leash, like a short collar chain", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			collared(B);
			wear(B, "ItemNeckRestraints", "CollarChainShort");
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});

		it("not even when they're leashable some other way, like a bed chain on the collar and a pelvis leash", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			collared(B);
			wear(B, "ItemNeckRestraints", "Bedchain");
			wear(B, "ItemPelvis", "PelvisChainLeash");
			// Vanilla would let anyone hold them, but there's no leash on the collar to clasp to
			expect(g.ChatRoomCanBeLeashed(B)).toBe(true);
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});

		it("not a leash vanilla wouldn't let anyone pull, like someone shut in a box", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			leashed(B);
			wear(B, "ItemDevices", "WoodenBox");
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});

		it("a collar with a free leash slot, for the end of the leash", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			collared(B);
			expect(leashing.CanClaspTo(A, B)).toBe(true);
		});

		it("not a free leash slot when the end's leash is blocked or limited on them", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			collared(B);
			(B as never as { PermissionItems: object }).PermissionItems = { "ItemNeckRestraints/CollarLeash": { Permission: "Block", TypePermissions: {} } };
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});

		it("not a free leash slot without item permission on them", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			collared(B);
			B.AllowedInteractions = g.AllowedInteractions.OwnerOnly;
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});

		it("not someone who's turned leashing off, nor either end without LSCG leashing", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			leashed(A);
			leashed(B);
			B.OnlineSharedSettings = { AllowPlayerLeashing: false } as never;
			expect(leashing.CanClaspTo(A, B)).toBe(false);

			const C = makeCharacter(4, false);
			leashed(C);
			expect(leashing.CanClaspTo(A, C)).toBe(false);
			expect(leashing.CanClaspTo(C, makeCharacter(5))).toBe(false);
		});
	});

	describe("the end of the leash", () => {
		it("can be a chain leash as well as a collar leash", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			collared(A);
			wear(A, "ItemNeckRestraints", "ChainLeash");
			collared(B);
			expect(leashing.CanClaspTo(A, B)).toBe(true);
		});

		it("isn't given by a player held by something that isn't on their collar, like a pelvis leash", () => {
			const A = makeCharacter(2);
			const B = makeCharacter(3);
			collared(A);
			wear(A, "ItemPelvis", "PelvisChainLeash");
			collared(B);
			expect(g.ChatRoomCanBeLeashed(A)).toBe(true);
			expect(leashing.CanClaspTo(A, B)).toBe(false);
		});
	});

	describe("padlocks", () => {
		it("a padlock on the leash locks that end; one on the collar doesn't", () => {
			const B = makeCharacter(3);
			collared(B);
			wear(B, "ItemNeck", "LeatherCollar", { LockedBy: "MetalPadlock" });
			wear(B, "ItemNeckRestraints", "CollarLeash");
			expect(leashing.LeashLocked(B)).toBe(false);
			wear(B, "ItemNeckRestraints", "CollarLeash", { LockedBy: "MetalPadlock" });
			expect(leashing.LeashLocked(B)).toBe(true);
		});

		it("a padlock on a leash that isn't on the collar doesn't lock that end", () => {
			const B = makeCharacter(3);
			leashed(B);
			wear(B, "ItemPelvis", "PelvisChainLeash", { LockedBy: "MetalPadlock" });
			expect(leashing.LeashLocked(B)).toBe(false);
		});

		it("an owner's padlock on our leash doesn't stop the player we're clasped to from pulling us", () => {
			leashed(g.Player, { LockedBy: "OwnerPadlock" });
			g.Player.Effect = g.CharacterGetEffects(g.Player);
			leashing.Pairings = [new Leashing(2, 1, false, "leash"), new Leashing(3, 3, false, "collar")];
			expect(g.ChatRoomCanBeLeashedBy(2, g.Player)).toBe(true);
			// Anyone else still needs to be our owner
			expect(g.ChatRoomCanBeLeashedBy(3, g.Player)).toBe(false);
			expect(g.ChatRoomCanBeLeashedBy(4, g.Player)).toBe(false);
		});
	});

	describe("who can't be pulled along", () => {
		it("someone free can; someone in floor shackles or shut in a box can't", () => {
			const B = makeCharacter(3);
			leashed(B);
			expect(leashing.CantBePulled(B)).toBe(false);
			wear(B, "ItemFeet", "FloorShackles");
			expect(leashing.CantBePulled(B)).toBe(true);
			(B as never as { Appearance: Item[] }).Appearance = (B as never as { Appearance: Item[] }).Appearance.filter(i => i.Asset.Group.Name !== "ItemFeet");
			wear(B, "ItemDevices", "WoodenBox");
			expect(leashing.CantBePulled(B)).toBe(true);
		});

		it("someone in a one-way enclosure can't be pulled out, even though they can still walk", () => {
			const B = makeCharacter(3);
			leashed(B);
			wear(B, "ItemDevices", "ExclusiveWaitress");
			expect(B.CanWalk()).toBe(true);
			expect(leashing.CantBePulled(B)).toBe(true);
		});

		it("nobody there doesn't count as someone stuck", () => {
			expect(leashing.CantBePulled(null)).toBe(false);
		});
	});
});
