// Keeping both sides of a grab in step: failed pulls, safewords, leaving the room,
// leash beeps, and who can set up a grab between other people.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { Leashing, LeashingModule } from "Modules/leashing";
import { addToRoom, boot, resetWorld } from "../harness/world";
import { sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("LeashingModule keeping both sides of a grab in sync", () => {
	let leashing: LeashingModule;

	beforeAll(() => {
		[, leashing] = boot(new CoreModule(), new LeashingModule());
	});

	beforeEach(() => {
		resetWorld();
		leashing.Pairings = [];
		// A room that allows leashing, and nobody holding our leash the game's way
		g.ChatRoomData.BlockCategory = [];
		g.ChatRoomLeashPlayer = null;
	});

	it("a pull we can't follow because leashing is off ends the grab on both sides", async () => {
		g.Player.OnlineSharedSettings = { AllowPlayerLeashing: false };
		leashing.Pairings = [new Leashing(222, 222, false, "collar")];
		await g.ServerHandleLeashBeep({ MemberNumber: 222, ChatRoomName: "Elsewhere" });
		expect(leashing.Pairings).toHaveLength(0);
		expect(sent.beeps()).toEqual([{
			target: 222,
			message: expect.objectContaining({ command: { name: "release", args: [{ name: "type", value: "collar" }, { name: "isSource", value: false }] } }),
		}]);
	});
	it("the game's Release safeword lets go of grabs, tells the other side and opens our eyes again", () => {
		leashing.Pairings = [new Leashing(222, 222, false, "eyes")];
		g.ChatRoomSafewordRelease();
		expect(leashing.Pairings).toHaveLength(0);
		expect(sent.beeps().map(b => b.target)).toEqual([222]);
		expect(g.CharacterSetFacialExpression).toHaveBeenCalledWith(g.Player, "Eyes", null);
	});

	it("leaving names only who's still here, when the hand we held has already gone", () => {
		addToRoom(makeCharacter({ MemberNumber: 333, Name: "PlayerC", Nickname: "PlayerC" }));
		leashing.Pairings = [new Leashing(222, 222, true, "hand"), new Leashing(333, 333, true, "collar")];
		g.ChatRoomLeave();
		expect(sent.actions()).toHaveLength(1);
		expect(sent.actions()[0]).toContain("drags PlayerC out of the room by the collar.");
	});

	it("leaving with two players chomping on us names both of them", () => {
		addToRoom(makeCharacter({ MemberNumber: 222, Name: "PlayerB", Nickname: "PlayerB" }));
		addToRoom(makeCharacter({ MemberNumber: 333, Name: "PlayerC", Nickname: "PlayerC" }));
		leashing.Pairings = [new Leashing(222, 222, false, "chomp"), new Leashing(333, 333, false, "chomp")];
		g.ChatRoomLeave();
		expect(sent.actions()[0]).toContain("drags PlayerB, and PlayerC out of the room with a wince.");
	});

	it("a room change beeps each leashed player once", () => {
		resetWorld({ LSCG: { GlobalModule: { enabled: true }, LeashingModule: { enabled: true } } });
		leashing.Pairings = [new Leashing(222, 222, true, "collar")];
		// The game's ChatRoomSync pings our leashes itself
		g.ChatRoomSync({ Name: "New room" });
		g.ChatRoomPingLeashedPlayers();
		expect(sent.raw().filter(([type, data]) => type === "AccountBeep" && data.MemberNumber === 222)).toHaveLength(1);
	});

	it("someone without item permission on us can't set up a grab between us and someone else", () => {
		addToRoom(makeCharacter({ MemberNumber: 333 }));
		g.ServerChatRoomGetAllowItem.mockReturnValueOnce(false);
		leashing.HandleLeashingRequest(333, { command: { name: "add-leashing", args: [
			{ name: "pairedMember", value: 222 },
			{ name: "type", value: "compulsion" },
			{ name: "isSource", value: true },
		] } } as LSCGMessageModel);
		expect(leashing.Pairings).toHaveLength(0);
	});

	it("a second holder pulling us somewhere else while we're already following loses their grab", async () => {
		leashing.Pairings = [new Leashing(222, 222, false, "collar"), new Leashing(333, 333, false, "collar")];
		const following = g.ServerHandleLeashBeep({ MemberNumber: 222, ChatRoomName: "Room A" });
		await g.ServerHandleLeashBeep({ MemberNumber: 333, ChatRoomName: "Room B" });
		await following;
		expect(leashing.Pairings.map(p => p.PairedMember)).toEqual([222]);
		expect(sent.beeps().map(b => b.target)).toEqual([333]);
	});

});
