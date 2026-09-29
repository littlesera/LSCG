// The real, hooked ChatRoomCanBeLeashedBy: whether `sourceMemberNumber` is allowed to drag
// `C` around the room. Exercised through the actual hooked global (not by calling
// LeashingModule's internals directly) to prove the hookFunction wiring works, matching
// activity-registry.bc.test.ts's own ActivityCheckPrerequisite pattern. This needs real BC
// Item/Effect/lock-asset semantics (InventoryItemHasEffect's real Asset.Effect reads,
// InventoryGetLock, real OwnerOnly/LoverOnly/FamilyOnly lock flags) -- the reason this lives
// on the "bc" tier rather than being faked. Written after a real regression in the custom
// leashing feature, to lock down ChatRoomCanBeLeashedBy's actual behavior going forward.
//
// LeashingModule.Pairings is always relative to the *local* Player (see DoGrab/
// HandleLeashingRequest: PairedMember is always "the other side", Player is implicit) --
// so this.IsLeashedBy(sourceMemberNumber)'s own branch is only ever reachable when the
// hook's `C` argument *is* Player, matching real BC's own call sites
// (ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player) at ChatRoom.js:5620/5688).
// Calling it with some other, unrelated `C` only ever exercises the vanilla fallback
// (next(args)), never LSCG's own logic.
//
// leashing.init()/load() (which installs the hookFunction) runs exactly once in beforeAll,
// like every other bc-tier suite that boots a real module -- calling it again per-test
// (an earlier draft of this file did, inside beforeEach) stacks a fresh hookFunction layer
// on top of the previous one every time, so by the Nth test there are N nested LSCG hooks
// wrapping each other; the outer ones still see stale in-between state, which surfaced as
// tests passing in isolation but failing once other tests ran first. Only the *mutable*
// state (Pairings, Player.Appearance/Ownership/Lovership, ChatRoomData) is reset per test.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { CoreModule } from "Modules/core";
import { LeashingModule, Leashing } from "Modules/leashing";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function wearNeckRestraint(C: Character, assetName: string, lockAssetName?: string): Item {
	const asset = findAsset("ItemNeckRestraints", assetName);
	const item = { Asset: asset, Property: lockAssetName ? { LockedBy: lockAssetName } : {} } as never as Item;
	(C as never as { Appearance: Item[] }).Appearance.push(item);
	return item;
}

function wear(C: Character, group: string, assetName: string): Item {
	const asset = findAsset(group, assetName);
	const item = { Asset: asset, Property: {} } as never as Item;
	(C as never as { Appearance: Item[] }).Appearance.push(item);
	return item;
}

describe("ChatRoomCanBeLeashedBy (real BC data)", () => {
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
		`);
		g.ChatRoomData = undefined; // RoomAllowsLeashing's "!ChatRoomData" branch: leashing allowed by default
		g.Player.LSCG.GlobalModule = { enabled: true }; // required for LeashingModule.Enabled (BaseModule.Enabled)
		g.ServerPlayerIsInChatRoom = () => true;
		g.Player.Appearance = [];
		g.Player.Ownership = undefined;
		g.Player.Lovership = [];
		leashing.Pairings = [];
	});

	it("allows a member LSCG has paired as leashing Player (arm grab, no physical item needed)", () => {
		// Pairing(PairedMember=1, ...): Player is being grabbed BY member 1.
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(true);
	});

	it("blocks a member LSCG has NOT paired as leashing Player", () => {
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(99, g.Player)).toBe(false);
	});

	it("Reverse grab types (chomp) only drag when Player is the source, not the target", () => {
		// IsSource=false ("Player is chomped BY member 1") does NOT grant a Reverse-type drag.
		leashing.Pairings = [new Leashing(1, 1, false, "chomp")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);

		leashing.Pairings = [new Leashing(1, 1, true, "chomp")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(true);
	});

	it("Ephemeral grab types (mouth-with-foot) never drag Player, even when LSCG-paired", () => {
		leashing.Pairings = [new Leashing(1, 1, false, "mouth-with-foot")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});

	it("blocks dragging when Player is wearing a real Mounted-effect device (isTrapped)", () => {
		wear(g.Player, "ItemDevices", "SaddleStand"); // carries the real Mounted effect
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});

	it("blocks dragging when Player is enclosed (real Enclose-effect device)", () => {
		wear(g.Player, "ItemDevices", "WoodenBox"); // carries the real Enclose effect
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});

	it("an unowned/unrelated OwnerOnly neck lock on Player blocks a non-owner from dragging", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "OwnerPadlock");
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});

	it("an OwnerOnly neck lock on Player allows Player's actual owner to drag", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "OwnerPadlock");
		g.Player.Ownership = { MemberNumber: 1, Stage: 1 };
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(true);
	});

	it("a LoverOnly neck lock on Player allows a lover to drag but blocks a non-lover", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "LoversPadlock");
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);

		g.Player.Lovership = [{ MemberNumber: 1 }];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(true);
	});

	it("a FamilyOnly neck lock on Player blocks someone outside the family", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "FamilyPadlock");
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});

	it("a plain (unrestricted) neck lock on Player never blocks dragging", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "MetalPadlock");
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(true);
	});

	it("sourceMemberNumber 0 (e.g. an NPC/system drag) always bypasses the neck-lock gate", () => {
		wearNeckRestraint(g.Player, "CollarLeash", "OwnerPadlock");
		leashing.Pairings = [new Leashing(0, 0, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(0, g.Player)).toBe(true);
	});

	it("falls through to the real vanilla check for a character LSCG hasn't paired at all", () => {
		// C here is NOT Player, so LeashingModule's own Pairings (always Player-relative)
		// never apply -- this exercises the next(args) fallback to vanilla BC's own scan,
		// proving the hook doesn't swallow the packet for characters outside LSCG's tracking.
		const other = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, 2);
		other.MemberNumber = 2;
		wearNeckRestraint(other, "CollarLeash");
		expect(g.ChatRoomCanBeLeashedBy(1, other)).toBe(true); // vanilla grants it independently
	});

	it("RoomAllowsLeashing=false suppresses LSCG's own branch (falls back to vanilla, which also blocks)", () => {
		g.ChatRoomData = { BlockCategory: ["Leashing"] };
		leashing.Pairings = [new Leashing(1, 1, false, "arm")];
		expect(g.ChatRoomCanBeLeashedBy(1, g.Player)).toBe(false);
	});
});
