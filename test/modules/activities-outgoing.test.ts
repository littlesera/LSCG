// The ServerSend hook (activities.ts) every outgoing LSCG_* / patched activity
// message goes through: dictionary text substitution, CustomPreparse ordering,
// and a CustomAction returning false swallowing the packet before it reaches
// the base game. Uses a synthetic activity registered directly against the
// real ActivityModule instance, so these tests are about the hook's own
// mechanics, independent of any one real activity's business logic (those are
// covered by test/bc-tier/activity-registry.bc.test.ts and by whichever
// module owns a given CustomAction's real side effect).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityModule, type CustomAction } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

describe("ActivityModule outgoing ServerSend hook", () => {
	let activities: ActivityModule;

	beforeAll(() => {
		[, , activities] = boot(new CoreModule(), new ConsentModule(), new ActivityModule());
	});

	beforeEach(() => {
		resetWorld();
	});

	function sendActivity(name: string, target: ReturnType<typeof makeCharacter>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).ServerSend("ChatRoomChat", {
			Type: "Activity",
			Content: `ChatOther-ItemMouth-${name}`,
			Dictionary: [
				{ Tag: "ActivityName", text: name },
				{ Tag: "DestinationCharacter", MemberNumber: target.MemberNumber },
			],
		});
	}

	it("passes through untouched when the activity is neither LSCG_-prefixed nor patched", () => {
		const target = addToRoom(makeCharacter());
		sendActivity("SomeOtherModsActivity", target);
		expect(sent.raw()).toHaveLength(1); // reached the base ServerSend as-is
	});

	it("appends the resolved dictionary text and runs CustomPreparse before the CustomAction", () => {
		const order: string[] = [];
		activities.CustomPreparseCallbacks.set("LSCG_TestActivity", () => { order.push("preparse"); });
		activities.CustomActionCallbacks.set("LSCG_TestActivity", () => { order.push("action"); });

		const target = addToRoom(makeCharacter());
		sendActivity("LSCG_TestActivity", target);

		expect(order).toEqual(["preparse", "action"]);
		const [, data] = sent.raw()[0];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const appended = (data.Dictionary as any[]).find(d => typeof d.Tag === "string" && d.Tag.includes("ActivityDictionary.csv"));
		expect(appended).toBeTruthy();
		expect(typeof appended.Text).toBe("string");
	});

	it("a CustomAction returning false swallows the packet entirely (never reaches the base ServerSend)", () => {
		const action: CustomAction["Func"] = vi.fn(() => false);
		activities.CustomActionCallbacks.set("LSCG_Swallowed", action);

		const target = addToRoom(makeCharacter());
		sendActivity("LSCG_Swallowed", target);

		expect(action).toHaveBeenCalledTimes(1);
		expect(sent.raw()).toHaveLength(0);
	});

	it("a CustomAction returning true (or nothing) lets the packet continue to the base ServerSend", () => {
		activities.CustomActionCallbacks.set("LSCG_PassThrough", () => true);
		activities.CustomActionCallbacks.set("LSCG_PassThrough2", () => { /* returns undefined */ });

		const target = addToRoom(makeCharacter());
		sendActivity("LSCG_PassThrough", target);
		sendActivity("LSCG_PassThrough2", target);

		expect(sent.raw()).toHaveLength(2);
	});

	it("passes the resolved target character and metadata to the CustomAction", () => {
		const action: CustomAction["Func"] = vi.fn();
		activities.CustomActionCallbacks.set("LSCG_WithTarget", action);
		const target = addToRoom(makeCharacter({ MemberNumber: 7777 }));

		sendActivity("LSCG_WithTarget", target);

		expect(action).toHaveBeenCalledWith(
			expect.objectContaining({ MemberNumber: 7777 }),
			expect.anything(),
			expect.anything(),
		);
	});

	it("a patched (non-LSCG_-named) activity still routes through the hook when it's in PatchedActivities", () => {
		const action: CustomAction["Func"] = vi.fn(() => false);
		activities.PatchedActivities.push("SomeBaseActivity");
		activities.CustomActionCallbacks.set("SomeBaseActivity", action);

		const target = addToRoom(makeCharacter());
		sendActivity("SomeBaseActivity", target);

		expect(action).toHaveBeenCalledTimes(1);
		expect(sent.raw()).toHaveLength(0);
	});

	it("only intercepts ChatRoomChat/Activity packets -- other ServerSend calls pass straight through", () => {
		activities.CustomActionCallbacks.set("LSCG_Ignored", () => false);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).ServerSend("ChatRoomChat", { Type: "Chat", Content: "hello" });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).ServerSend("AccountBeep", { MemberNumber: 1 });
		expect(sent.raw()).toHaveLength(2);
	});
});
