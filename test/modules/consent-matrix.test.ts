// ConsentModule's timeout paths, the incapacitated/canAccept edge cases, and
// its defenses against stale or mismatched ids -- the parts of the offer/
// accept/refuse/force matrix that test/integration/consent.test.ts's happy
// paths don't cover. Calls ConsentModule's own methods directly for the
// sender/target-identity edge cases (IncomingAnswer/IncomingForce's own guard
// clauses are what's under test there), and goes through the full
// receive.hidden() routing where the *prompt* behavior itself matters.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule, type ConsentFlow } from "Modules/consent";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter, snapshotCharacter } from "../harness/fixtures";

describe("ConsentModule: timeouts, incapacitation, and stale/mismatched ids", () => {
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
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
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

	it("times out to a refusal when the target never answers the initial offer", () => {
		// No forcePrompt: a timed-out-as-refused offer completes immediately as
		// "declined" instead of also opening a force/back-off prompt for the
		// sender (that secondary prompt's own timeout is covered separately below).
		const flow = registerTestFlow({ forcePrompt: undefined });
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any);
		expect(consent.sentOffers.size).toBe(1);

		vi.advanceTimersByTime(ConsentModule.PROMPT_TIMEOUT + ConsentModule.REPLY_GRACE);

		expect(flow.onComplete).toHaveBeenCalledWith(expect.anything(), "declined", null);
		expect(consent.sentOffers.size).toBe(0);
	});

	it("times out to a refusal when the target never clicks the incoming prompt", () => {
		const flow = registerTestFlow({ forcePrompt: undefined });
		const sender = addToRoom(makeCharacter({ MemberNumber: 1001 }));

		consent.IncomingOffer(1001, "offer-1", "test-flow", null);
		expect(document.body.textContent).toContain("Do the thing?");

		vi.advanceTimersByTime(ConsentModule.PROMPT_TIMEOUT);

		expect(document.querySelectorAll("button")).toHaveLength(0);
		const answer = sent.hidden().find(m => m.command?.name === "consent-answer");
		expect(answer?.command?.args?.find(a => a.name === "answer")?.value).toBe("refused");
		void flow;
		void sender;
	});

	it("times out to a decline when the sender never gets a force/back-off click", () => {
		const flow = registerTestFlow();
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any, null);
		const id = [...consent.sentOffers.keys()][0];
		consent.IncomingAnswer(2002, id, "refused"); // shows the force/back-off prompt

		expect(document.body.textContent).toContain("Force it?");
		vi.advanceTimersByTime(ConsentModule.PROMPT_TIMEOUT);

		expect(flow.onComplete).toHaveBeenCalledWith(expect.anything(), "declined", null);
	});

	it("times out to a decline when a forced offer's target never resolves it", () => {
		const flow = registerTestFlow();
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any, null);
		const id = [...consent.sentOffers.keys()][0];
		consent.IncomingAnswer(2002, id, "refused");
		consent.Force(id);
		expect(consent.sentOffers.get(id)?.stage).toBe("forcing");

		vi.advanceTimersByTime(ConsentModule.REPLY_GRACE * 2);

		expect(flow.onComplete).toHaveBeenCalledWith(expect.anything(), "declined", null);
	});

	it("auto-answers \"unable\" with no prompt shown when the target is incapacitated", () => {
		const flow = registerTestFlow();
		resetWorld({ LSCG: { StateModule: { states: [{ type: "hypnotized", active: true }] } } });
		const sender = addToRoom(makeCharacter({ MemberNumber: 1001 }));

		consent.IncomingOffer(1001, "offer-2", "test-flow", null);

		expect(document.querySelectorAll("button")).toHaveLength(0);
		const answer = sent.hidden().find(m => m.command?.name === "consent-answer");
		expect(answer?.command?.args?.find(a => a.name === "answer")?.value).toBe("unable");
		void flow;
		void sender;
	});

	it("shows an \"unable\" button instead of accept when canAccept() returns false", () => {
		registerTestFlow({ canAccept: () => false, unableLabel: "Can't do that" });
		const sender = addToRoom(makeCharacter({ MemberNumber: 1001 }));

		consent.IncomingOffer(1001, "offer-3", "test-flow", null);

		const buttons = Array.from(document.querySelectorAll("button")).map(b => b.textContent);
		expect(buttons).toContain("Can't do that");
		expect(buttons).not.toContain("Yes");
		void sender;
	});

	it("IncomingAnswer ignores an answer from someone other than the offer's actual target", () => {
		const flow = registerTestFlow();
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any, null);
		const id = [...consent.sentOffers.keys()][0];

		consent.IncomingAnswer(9999, id, "accepted"); // not who the offer was sent to

		expect(flow.onAccepted).not.toHaveBeenCalled();
		expect(flow.onComplete).not.toHaveBeenCalled();
		expect(consent.sentOffers.get(id)?.stage).toBe("offered"); // unchanged
	});

	it("IncomingAnswer ignores a stale/unknown offer id", () => {
		const flow = registerTestFlow();
		consent.IncomingAnswer(2002, "not-a-real-offer-id", "accepted");
		expect(flow.onAccepted).not.toHaveBeenCalled();
	});

	it("IncomingForce ignores a force from someone other than who the refusal was sent to", () => {
		registerTestFlow();
		const sender = addToRoom(makeCharacter({ MemberNumber: 1001 }));
		consent.IncomingOffer(1001, "offer-4", "test-flow", null);
		document.querySelector("button:nth-of-type(2)")!.dispatchEvent(new Event("click", { bubbles: true })); // "No"
		expect(consent.refusedOffers.has("offer-4")).toBe(true);

		consent.IncomingForce(9999, "offer-4"); // not the original sender

		expect(consent.refusedOffers.has("offer-4")).toBe(true); // untouched
		expect(sent.hidden().some(m => m.command?.name === "consent-force-result")).toBe(false);
		void sender;
	});

	it("a refusal is forgotten (refusedOffers expires) after the sender would have given up on forcing it", () => {
		registerTestFlow();
		const sender = addToRoom(makeCharacter({ MemberNumber: 1001 }));
		consent.IncomingOffer(1001, "offer-5", "test-flow", null);
		document.querySelector("button:nth-of-type(2)")!.dispatchEvent(new Event("click", { bubbles: true })); // "No"
		expect(consent.refusedOffers.has("offer-5")).toBe(true);

		vi.advanceTimersByTime(ConsentModule.PROMPT_TIMEOUT + ConsentModule.REPLY_GRACE * 2);

		expect(consent.refusedOffers.has("offer-5")).toBe(false);
		void sender;
	});

	it("capture-and-replay: an accept from the real target still resolves normally alongside these edge cases", () => {
		// Sanity check that fake timers + the edge-case tests above haven't
		// broken the ordinary path this file doesn't otherwise re-test.
		const flow = registerTestFlow();
		const sender = snapshotCharacter(resetWorld({ MemberNumber: 1001 }));
		const target = addToRoom(makeCharacter({ MemberNumber: 2002, LSCG: {} }));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		consent.Offer("test-flow", target as any);
		const offerPacket = sent.hidden()[0]; // capture before resetWorld() clears the capture history

		resetWorld({ MemberNumber: 2002, LSCG: {} });
		addToRoom(sender);
		receive.hidden(sender, offerPacket);
		document.querySelector("button")!.dispatchEvent(new Event("click", { bubbles: true }));

		expect(flow.onAccepted).toHaveBeenCalledTimes(1);
	});
});
