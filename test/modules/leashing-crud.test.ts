// LeashingModule's core Pairings CRUD: DoGrab/DoRelease/DoEscape (the sender
// side) and IncomingGrab/IncomingRelease (the receiver side), plus the 2-hands
// limit CanAddLeashingType enforces for hands-using grab types.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { LeashingModule } from "Modules/leashing";
import { CoreModule } from "Modules/core";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

describe("LeashingModule Pairings CRUD", () => {
	let leashing: LeashingModule;

	beforeAll(() => {
		// LeashingModule.load() calls getModule<CoreModule>("CoreModule")
		// .RegisterCommandListener(...) with no null-check, so CoreModule must
		// be registered first or load() throws.
		[, leashing] = boot(new CoreModule(), new LeashingModule());
	});

	beforeEach(() => {
		resetWorld();
		leashing.Pairings = [];
	});

	describe("DoGrab (sender side)", () => {
		it("adds a Pairing with IsSource=true and beeps the target a grab command", () => {
			const target = addToRoom(makeCharacter({ MemberNumber: 222 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(target as any, "arm");

			expect(leashing.Pairings).toHaveLength(1);
			expect(leashing.Pairings[0]).toMatchObject({ PairedMember: 222, IsSource: true, Type: "arm" });

			const beeps = sent.beeps();
			expect(beeps).toHaveLength(1);
			expect(beeps[0].target).toBe(222);
			expect(beeps[0].message.command).toEqual({ name: "grab", args: [{ name: "type", value: "arm" }] });
		});

		it("does not beep when grabbing the player themself", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const self = { ...(globalThis.Player as any), IsPlayer: () => true };
			leashing.DoGrab(self, "hand");
			expect(sent.beeps()).toHaveLength(0);
			expect(leashing.Pairings).toHaveLength(1);
		});

		it("respects the 2-hands limit: a 3rd hands-using grab is refused", () => {
			const a = addToRoom(makeCharacter({ MemberNumber: 222 }));
			const b = addToRoom(makeCharacter({ MemberNumber: 333 }));
			const c = addToRoom(makeCharacter({ MemberNumber: 444 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(a as any, "arm");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(b as any, "ear");
			expect(leashing.usingHandsCount).toBe(2);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(c as any, "tail");
			expect(leashing.usingHandsCount).toBe(2); // still 2 -- the 3rd was refused
			expect(leashing.Pairings.some(p => p.PairedMember === 444)).toBe(false);
		});

		it("\"chomp\" can only be held on one target at a time, regardless of the hands limit", () => {
			const a = addToRoom(makeCharacter({ MemberNumber: 222 }));
			const b = addToRoom(makeCharacter({ MemberNumber: 333 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(a as any, "chomp");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(b as any, "chomp");
			expect(leashing.Pairings.filter(p => p.Type === "chomp")).toHaveLength(1);
		});
	});

	describe("DoRelease (sender side)", () => {
		it("removes the matching Pairing and sends a release command to the target", () => {
			const target = addToRoom(makeCharacter({ MemberNumber: 222 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(target as any, "arm");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoRelease(target as any, "arm");

			expect(leashing.Pairings).toHaveLength(0);
			const releaseMsg = sent.hidden().find(m => m.command?.name === "release");
			expect(releaseMsg?.command?.args).toEqual([{ name: "type", value: "arm" }]);
		});

		it("only removes the matching type, leaving other grabs on the same target intact", () => {
			const target = addToRoom(makeCharacter({ MemberNumber: 222 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(target as any, "arm");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(target as any, "ear");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoRelease(target as any, "arm");

			expect(leashing.Pairings).toHaveLength(1);
			expect(leashing.Pairings[0].Type).toBe("ear");
		});
	});

	describe("DoEscape (breaking free of someone else's hold on us)", () => {
		it("removes pairings where we are not the source, and sends an escape command", () => {
			const holder = addToRoom(makeCharacter({ MemberNumber: 222 }));
			leashing.IncomingGrab(holder as never, "arm"); // someone else grabbed us

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoEscape(holder as any);

			expect(leashing.Pairings).toHaveLength(0);
			expect(sent.hidden().some(m => m.command?.name === "escape")).toBe(true);
		});
	});

	describe("IncomingGrab / IncomingRelease (receiver side)", () => {
		it("IncomingGrab adds a Pairing with IsSource=false (we're the one held)", () => {
			const grabber = addToRoom(makeCharacter({ MemberNumber: 222 }));
			leashing.IncomingGrab(grabber as never, "arm");

			expect(leashing.Pairings).toHaveLength(1);
			expect(leashing.Pairings[0]).toMatchObject({ PairedMember: 222, IsSource: false, Type: "arm" });
		});

		it("IncomingRelease removes the matching not-source Pairing", () => {
			const grabber = addToRoom(makeCharacter({ MemberNumber: 222 }));
			leashing.IncomingGrab(grabber as never, "arm");
			leashing.IncomingRelease(grabber as never, "arm");
			expect(leashing.Pairings).toHaveLength(0);
		});

		it("a bidirectional type (hand) is released on both sides at once", () => {
			// Simulate holding hands both ways (bidirectional: one Pairing per
			// direction), then release from one side -- IncomingRelease removes
			// the *other* direction too when the type is Bidirectional.
			const other = addToRoom(makeCharacter({ MemberNumber: 222 }));
			leashing.IncomingGrab(other as never, "hand");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(other as any, "hand");
			expect(leashing.Pairings).toHaveLength(2);

			leashing.IncomingRelease(other as never, "hand");
			expect(leashing.Pairings).toHaveLength(0);
		});
	});

	describe("CanDragPlayer / PlayerCanDrag (non-bidirectional \"arm\")", () => {
		it("CanDragPlayer is true when someone else grabbed us (IsSource=false)", () => {
			const other = addToRoom(makeCharacter({ MemberNumber: 222 }));
			leashing.IncomingGrab(other as never, "arm");
			expect(leashing.CanDragPlayer(leashing.Pairings[0])).toBe(true);
			// The other operands of PlayerCanDrag's `||` chain (def?.Reverse,
			// def?.Bidirectional) are `undefined`, not `false`, for a plain
			// non-reverse/non-bidirectional type like "arm" -- so a falsy result
			// here is `undefined`, not strictly `false`.
			expect(leashing.PlayerCanDrag(leashing.Pairings[0])).toBeFalsy();
		});

		it("PlayerCanDrag is true when we grabbed someone else (IsSource=true)", () => {
			const target = addToRoom(makeCharacter({ MemberNumber: 222 }));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			leashing.DoGrab(target as any, "arm");
			expect(leashing.PlayerCanDrag(leashing.Pairings[0])).toBe(true);
			expect(leashing.CanDragPlayer(leashing.Pairings[0])).toBeFalsy();
		});
	});
});
