// leashing.ts's own two ServerSend rewrites: outgoing Chat gets run through the
// speech-garble pipeline while custom-gagged (priority 1), and an outgoing
// Lick activity is swallowed and replaced with a flavour SendAction while the
// player's tongue is held (priority 5).
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { Leashing, LeashingModule } from "Modules/leashing";
import { boot, resetWorld } from "../harness/world";
import { sent } from "../harness/room";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("LeashingModule outgoing ServerSend rewrites", () => {
	let leashing: LeashingModule;

	beforeAll(() => {
		[, leashing] = boot(new CoreModule(), new LeashingModule());
	});

	beforeEach(() => {
		resetWorld();
		leashing.Pairings = [];
	});

	describe("custom-gag speech garbling", () => {
		it("leaves outgoing chat untouched when not custom-gagged", () => {
			g.ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello" });
			expect(g.SpeechGarbleByGagLevel).not.toHaveBeenCalled();
			expect(sent.chats()).toEqual(["hello"]);
		});

		it("runs outgoing chat through the garble/stutter/baby-talk pipeline while custom-gagged (someone else holding our mouth)", () => {
			leashing.Pairings.push(new Leashing(222, 222, false, "mouth")); // not IsSource -> we're the one gagged
			expect(leashing.IsCustomGagged).toBe(true);

			g.ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello" });

			expect(g.SpeechGarbleByGagLevel).toHaveBeenCalledTimes(1);
			expect(g.SpeechStutter).toHaveBeenCalledTimes(1);
			expect(g.SpeechBabyTalk).toHaveBeenCalledTimes(1);
			expect(sent.chats()).toEqual(["hello"]); // stubs are pass-through in this tier; the *calls* are what's under test
		});

		it("does not treat a gag we ourselves are holding on someone else (IsSource=true) as gagging us", () => {
			leashing.Pairings.push(new Leashing(222, 1, true, "mouth")); // we're the source (holding their mouth), not gagged ourselves
			expect(leashing.IsCustomGagged).toBe(false);

			g.ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello" });
			expect(g.SpeechGarbleByGagLevel).not.toHaveBeenCalled();
		});

		it("does not garble non-Chat ServerSend traffic", () => {
			leashing.Pairings.push(new Leashing(222, 222, false, "mouth"));
			g.ServerSend("ChatRoomChat", { Type: "Whisper", Content: "hello", Target: 222 });
			expect(g.SpeechGarbleByGagLevel).not.toHaveBeenCalled();
		});
	});

	describe("Lick blocked by a held tongue", () => {
		function sendLick() {
			g.ServerSend("ChatRoomChat", {
				Type: "Activity",
				Content: "ChatOther-ItemMouth-Lick",
				Dictionary: [{ Tag: "ActivityName", text: "Lick" }],
			});
		}

		it("lets Lick through normally when the tongue isn't held", () => {
			sendLick();
			expect(sent.raw().some(([, data]) => data.Type === "Activity")).toBe(true);
			expect(sent.actions()).toEqual([]);
		});

		it("swallows an outgoing Lick and sends a flavour action instead while the tongue is held (not by us)", () => {
			leashing.Pairings.push(new Leashing(222, 222, false, "tongue")); // not IsSource -> our tongue is the one held
			sendLick();

			expect(sent.raw().some(([, data]) => data.Type === "Activity")).toBe(false);
			expect(sent.actions()).toHaveLength(1);
			expect(sent.actions()[0]).toMatch(/tongue/i);
		});

		it("does not block Lick when the held-tongue pairing is one we hold on someone else (IsSource=true)", () => {
			leashing.Pairings.push(new Leashing(222, 1, true, "tongue"));
			sendLick();
			expect(sent.raw().some(([, data]) => data.Type === "Activity")).toBe(true);
		});
	});
});
