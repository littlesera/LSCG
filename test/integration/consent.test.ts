// Milestone-1 smoke test for the whole harness: boots real CoreModule + ConsentModule
// instances against the fake BC, drives a full offer -> accept -> complete round trip
// across two "identities" using the same process (capture-and-replay), and clicks a
// real DOM button to simulate the target's choice.
//
// Player is a single stable object mutated in place by resetWorld() (see world.ts),
// so switching "who we are" between phases means snapshotting whoever we currently
// are *before* calling resetWorld() again -- see snapshotCharacter().
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule, type ConsentFlow } from "Modules/consent";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter, snapshotCharacter } from "../harness/fixtures";

describe("ConsentModule: offer / accept / refuse / force round trip", () => {
	let consent: ConsentModule;

	beforeAll(() => {
		[, consent] = boot(new CoreModule(), new ConsentModule());
	});

	beforeEach(() => {
		resetWorld();
		consent.sentOffers.clear();
		consent.refusedOffers.clear();
		consent.offerCounter = 0;
		consent.flows.clear();
	});

	function registerTestFlow(overrides: Partial<ConsentFlow> = {}): ConsentFlow {
		const flow: ConsentFlow = {
			id: "test-flow",
			prompt: () => ({ text: "Do the thing?", accept: "Yes", refuse: "No" }),
			onAccepted: vi.fn(),
			forcePrompt: () => ({ text: "Force it?", force: "Force", backOff: "Back off" }),
			onForced: () => true,
			onComplete: vi.fn(),
			...overrides,
		};
		consent.RegisterFlow(flow);
		return flow;
	}

	function clickPromptButton(label: string): void {
		const buttons = Array.from(document.querySelectorAll("button"));
		const button = buttons.find(b => b.textContent === label);
		expect(button, `no rendered button labeled "${label}"`).toBeTruthy();
		button!.dispatchEvent(new Event("click", { bubbles: true }));
	}

	it("completes as accepted when the target clicks accept", () => {
		const flow = registerTestFlow();

		// ---- Phase 1: acting as the sender -------------------------------
		const sender = snapshotCharacter(resetWorld({ MemberNumber: 1001 }));
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any, { note: "hi" });

		const offerPackets = sent.hidden();
		expect(offerPackets).toHaveLength(1);
		expect(offerPackets[0].command?.name).toBe("consent-offer");
		const offerId = offerPackets[0].command?.args?.find(a => a.name === "id")?.value as string;
		expect(offerId).toBeTruthy();
		expect(consent.sentOffers.get(offerId)?.stage).toBe("offered");

		// ---- Phase 2: acting as the target, replaying the offer -----------
		resetWorld({ MemberNumber: target.MemberNumber, LSCG: {} });
		const senderAsSeen = addToRoom(sender);

		receive.hidden(senderAsSeen, offerPackets[0]);

		// The prompt was rendered as real DOM (see bc-lite.ts's ChatRoomSendLocal).
		expect(document.body.textContent).toContain("Do the thing?");
		clickPromptButton("Yes");

		const answerPackets = sent.hidden();
		expect(answerPackets).toHaveLength(1);
		expect(answerPackets[0].command?.name).toBe("consent-answer");
		expect(answerPackets[0].command?.args?.find(a => a.name === "answer")?.value).toBe("accepted");
		expect(flow.onAccepted).toHaveBeenCalledTimes(1);
		expect(flow.onAccepted).toHaveBeenCalledWith(expect.objectContaining({ MemberNumber: sender.MemberNumber }), { note: "hi" });

		// ---- Phase 3: back to the sender, replaying the answer -------------
		const targetSnapshot = snapshotCharacter(target);
		resetWorld({ MemberNumber: sender.MemberNumber });
		const targetAsSeen = addToRoom(targetSnapshot);

		receive.hidden(targetAsSeen, answerPackets[0]);

		expect(flow.onComplete).toHaveBeenCalledTimes(1);
		expect(flow.onComplete).toHaveBeenCalledWith(
			expect.objectContaining({ MemberNumber: target.MemberNumber }),
			"accepted",
			{ note: "hi" },
		);
		expect(consent.sentOffers.has(offerId)).toBe(false);
	});

	it("offers to a character without LSCG go straight to a local refusal when the flow has no force option", () => {
		// No forcePrompt: a refusal (including the synthetic one for a non-LSCG
		// target) completes the offer immediately instead of offering the sender
		// a force/back-off choice.
		const flow = registerTestFlow({ forcePrompt: undefined });
		resetWorld({ MemberNumber: 1001 });
		// No LSCG field -- simulates a room-mate not running the mod.
		const target = addToRoom(makeCharacter({ MemberNumber: 3003 }));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any);

		expect(sent.hidden()).toHaveLength(0);
		expect(flow.onComplete).toHaveBeenCalledWith(expect.anything(), "declined", null);
	});

	it("a refusal with a forcePrompt lets the sender force, and the target resolves it via onForced", () => {
		const flow = registerTestFlow({ onForced: () => true });
		const sender = snapshotCharacter(resetWorld({ MemberNumber: 1001 }));
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any);
		const offerId = sent.hidden()[0].command?.args?.find(a => a.name === "id")?.value as string;
		const offerPacket = sent.hidden()[0];

		// Target refuses.
		resetWorld({ MemberNumber: target.MemberNumber, LSCG: {} });
		addToRoom(sender);
		receive.hidden(sender, offerPacket);
		clickPromptButton("No");
		const refusalPacket = sent.hidden().at(-1)!;
		expect(refusalPacket.command?.args?.find(a => a.name === "answer")?.value).toBe("refused");

		// Sender sees the refusal, gets the force/back-off prompt, clicks force.
		const targetSnapshot1 = snapshotCharacter(target);
		resetWorld({ MemberNumber: sender.MemberNumber });
		addToRoom(targetSnapshot1);
		receive.hidden(targetSnapshot1, refusalPacket);
		expect(document.body.textContent).toContain("Force it?");
		clickPromptButton("Force");
		const forcePacket = sent.hidden().find(m => m.command?.name === "consent-force");
		expect(forcePacket).toBeTruthy();
		expect(forcePacket?.command?.args?.find(a => a.name === "id")?.value).toBe(offerId);

		// Target resolves the force.
		resetWorld({ MemberNumber: target.MemberNumber, LSCG: {} });
		addToRoom(sender);
		receive.hidden(sender, forcePacket!);
		const resultPacket = sent.hidden().find(m => m.command?.name === "consent-force-result");
		expect(resultPacket).toBeTruthy();
		expect(resultPacket?.command?.args?.find(a => a.name === "success")?.value).toBe(true);

		// Sender learns the outcome.
		const targetSnapshot2 = snapshotCharacter(target);
		resetWorld({ MemberNumber: sender.MemberNumber });
		addToRoom(targetSnapshot2);
		receive.hidden(targetSnapshot2, resultPacket!);
		expect(flow.onComplete).toHaveBeenCalledWith(expect.anything(), "forced", null);
	});
});
