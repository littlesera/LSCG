// Ghosted/blacklisted senders vs. the handlers that bypass the On* helpers: the hypno trigger
// ChatRoomMessageHandler and BC's leash-follow beep.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { Leashing, LeashingModule } from "Modules/leashing";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("blocked senders vs. hypno triggers and leash beeps", () => {
	let hypno: HypnoModule;
	let states: StateModule;
	let leashing: LeashingModule;

	beforeAll(() => {
		[, hypno, states, leashing] = boot(new CoreModule(), new HypnoModule(), new StateModule(), new LeashingModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		states.init();
		hypno.settings.enabled = true;
		hypno.settings.trigger = "sleepy";
		hypno.settings.overrideWords = "";
		hypno.settings.enableCycle = false;
		hypno.settings.cooldownTime = 0;
		hypno.settings.alwaysSubmitMemberIds = "";
		leashing.Pairings = [];
		g.ChatRoomData.BlockCategory = [];
		g.ChatRoomLeashPlayer = null;
		addToRoom(player());
	});


	describe.each([
		["ghost", { GhostList: [2] }],
		["black", { BlackList: [2] }],
	] as [string, { GhostList?: number[]; BlackList?: number[] }][])("%slisted speaker", (_, lists) => {
		beforeEach(() => {
			Object.assign(player(), lists);
		});

		it("cannot hypnotize with the trigger word, in chat or whisper", () => {
			const alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
			for (const type of ["Chat", "Whisper"] as const) {
				const handler = g.ChatRoomMessageHandlers.find((h: { Description?: string }) => h.Description === "LSCG Hypnosis Trigger Checks");
				handler.Callback({ Type: type, Sender: 2, Content: "you are getting sleepy now" }, alice, "you are getting sleepy now");
			}
			expect(states.HypnoState.Active).toBe(false);
		});

		it("cannot pull us along on a leash we'd otherwise follow", async () => {
			g.Player.OnlineSharedSettings = { AllowPlayerLeashing: true };
			leashing.Pairings = [new Leashing(2, 2, false, "collar")];
			await g.ServerHandleLeashBeep({ MemberNumber: 2, ChatRoomName: "Elsewhere" });
			expect(leashing.Pairings).toHaveLength(0);
		});
	});

	it("control: an unlisted speaker's trigger word still works", () => {
		const alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		const handler = g.ChatRoomMessageHandlers.find((h: { Description?: string }) => h.Description === "LSCG Hypnosis Trigger Checks");
		handler.Callback({ Type: "Chat", Sender: 2, Content: "you are getting sleepy now" }, alice, "you are getting sleepy now");
		expect(states.HypnoState.Active).toBe(true);
	});

	describe("vanilla leash gate (ChatRoomCanBeLeashedBy) and clasp setup", () => {
		beforeEach(() => {
			g.ServerChatRoomGetAllowItem.mockImplementation(() => true);
		});

		it.each([["GhostList"], ["BlackList"]])("refuses a leash from someone on the player's %s", list => {
			addToRoom(makeCharacter({ MemberNumber: 2 }));
			(player() as unknown as Record<string, unknown>)[list] = [2];
			expect(g.ChatRoomCanBeLeashedBy(2, player())).toBe(false);
		});

		it("refuses a leash from someone without item permission on the player, but not from others or the player", () => {
			addToRoom(makeCharacter({ MemberNumber: 2 }));
			addToRoom(makeCharacter({ MemberNumber: 3 }));
			g.ServerChatRoomGetAllowItem.mockImplementation((source: { MemberNumber: number }) => source.MemberNumber !== 2);
			expect(g.ChatRoomCanBeLeashedBy(2, player())).toBe(false);
			expect(g.ChatRoomCanBeLeashedBy(3, player())).not.toBe(false);
			expect(g.ChatRoomCanBeLeashedBy(1, player())).not.toBe(false);
		});

		it("ignores an add-leashing from a normal sender that pairs us with a ghosted player", () => {
			const sender = addToRoom(makeCharacter({ MemberNumber: 3 }));
			addToRoom(makeCharacter({ MemberNumber: 2 }));
			player().GhostList = [2];
			for (const type of ["hand", "leash"]) {
				receive.command(sender, "add-leashing", [
					{ name: "pairedMember", value: 2 }, { name: "type", value: type }, { name: "isSource", value: false },
				]);
			}
			expect(leashing.Pairings).toHaveLength(0);
		});
	});
});
