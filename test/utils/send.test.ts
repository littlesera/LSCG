import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
	LSCG_SendLocal,
	LSCG_SendLocalPrompt,
	SendAction,
	SendChat,
	sendLSCGBeep,
	sendLSCGCommand,
	sendLSCGCommandBeep,
	sendLSCGMessage,
	settingsSave,
} from "utils";
import { resetWorld } from "../harness/world";
import { sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";
import type { SettingsModel } from "Settings/Models/settings";

describe("outgoing packet shapes", () => {
	beforeEach(() => {
		resetWorld({ Nickname: "Ren" });
	});

	describe("SendAction", () => {
		it("sends a localized Beep/Action packet with the templated message under the msg tag", () => {
			SendAction("%NAME% waves.");
			const raw = sent.raw();
			expect(raw).toHaveLength(1);
			const [type, data] = raw[0];
			expect(type).toBe("ChatRoomChat");
			expect(data.Type).toBe("Action");
			expect(data.Content).toBe("Beep");
			const tags = (data.Dictionary as { Tag: string; Text: string }[]).map(d => d.Tag);
			expect(tags).toEqual(expect.arrayContaining(["Beep", "发送私聊", "Biep", "Sonner", "msg"]));
			expect(sent.actions()).toEqual(["Ren waves."]);
		});

		it("resolves %OPP_NAME%-style tokens against the given source character", () => {
			const other = makeCharacter({ Nickname: "Kai" });
			SendAction("%NAME% waves at %OPP_NAME%.", other as unknown as Character);
			expect(sent.actions()).toEqual(["Ren waves at Kai."]);
		});
	});

	describe("SendChat", () => {
		it("sends a plain Chat packet with the raw message as Content", () => {
			SendChat("hello room");
			expect(sent.chats()).toEqual(["hello room"]);
			const [type, data] = sent.raw()[0];
			expect(type).toBe("ChatRoomChat");
			expect(data.Type).toBe("Chat");
		});
	});

	describe("sendLSCGMessage / sendLSCGCommand", () => {
		it("wraps the message as a Hidden/LSCGMsg packet with IsLSCG and version stamped on", () => {
			sendLSCGMessage({ type: "broadcast", reply: false, settings: null, target: null } as LSCGMessageModel);
			const hidden = sent.hidden();
			expect(hidden).toHaveLength(1);
			expect(hidden[0].IsLSCG).toBe(true);
			expect(hidden[0].version).toBeTruthy();
			const [type, data] = sent.raw()[0];
			expect(type).toBe("ChatRoomChat");
			expect(data.Type).toBe("Hidden");
			expect(data.Content).toBe("LSCGMsg");
			expect(data.Sender).toBe(globalThis.Player.MemberNumber);
		});

		it("sendLSCGCommand addresses the command to the target's MemberNumber", () => {
			const target = makeCharacter({ MemberNumber: 4242 });
			sendLSCGCommand(target as unknown as Character, "consent-offer", [{ name: "id", value: "abc" }]);
			const msg = sent.hidden()[0];
			expect(msg.target).toBe(4242);
			expect(msg.command).toEqual({ name: "consent-offer", args: [{ name: "id", value: "abc" }] });
		});

		it("defaults target to -1 when the character has no MemberNumber", () => {
			const target = { MemberNumber: undefined } as unknown as Character;
			sendLSCGCommand(target, "consent-answer");
			expect(sent.hidden()[0].target).toBe(-1);
		});
	});

	describe("sendLSCGBeep / sendLSCGCommandBeep", () => {
		it("hijacks the Leash beep type and marks it secret", () => {
			sendLSCGBeep(9999, { type: "broadcast", reply: false, settings: null, target: 9999 } as LSCGMessageModel);
			const beeps = sent.beeps();
			expect(beeps).toHaveLength(1);
			expect(beeps[0].target).toBe(9999);
			expect(beeps[0].message.IsLSCG).toBe(true);
			const [type, data] = sent.raw()[0];
			expect(type).toBe("AccountBeep");
			expect(data.BeepType).toBe("Leash");
			expect(data.IsSecret).toBe(true);
		});

		it("sendLSCGCommandBeep builds the same command shape as sendLSCGCommand, over a beep", () => {
			sendLSCGCommandBeep(1234, "collar-tighten");
			const beeps = sent.beeps();
			expect(beeps[0].target).toBe(1234);
			expect(beeps[0].message.command?.name).toBe("collar-tighten");
			expect(beeps[0].message.target).toBe(1234);
		});
	});

	describe("LSCG_SendLocal / LSCG_SendLocalPrompt", () => {
		it("escapes HTML by default", () => {
			LSCG_SendLocal("<b>hi</b>");
			expect(sent.local()[0]).toContain("&lt;b&gt;hi&lt;/b&gt;");
		});

		it("does not escape when escapeText is false", () => {
			LSCG_SendLocal("<b>hi</b>", false);
			expect(sent.local()[0]).toContain("<b>hi</b>");
		});

		it("renders real, clickable buttons and resolves exactly once on click", () => {
			const onA = vi.fn();
			const onB = vi.fn();
			LSCG_SendLocalPrompt("Choose", [
				{ label: "A", color: "green", onClick: onA },
				{ label: "B", color: "red", onClick: onB },
			], 10_000);

			const buttons = Array.from(document.querySelectorAll("button"));
			expect(buttons.map(b => b.textContent)).toEqual(["A", "B"]);

			buttons[0].dispatchEvent(new Event("click", { bubbles: true }));
			expect(onA).toHaveBeenCalledTimes(1);
			expect(onB).not.toHaveBeenCalled();

			// Both buttons are removed after resolving -- a second click on the
			// other button (if it somehow still fired) must not also resolve.
			expect(document.querySelectorAll("button")).toHaveLength(0);
		});

		it("calls onTimeout and removes the buttons if nothing was clicked in time", () => {
			vi.useFakeTimers();
			try {
				const onTimeout = vi.fn();
				const onClick = vi.fn();
				LSCG_SendLocalPrompt("Choose", [{ label: "A", color: "green", onClick }], 5000, onTimeout);
				expect(document.querySelectorAll("button")).toHaveLength(1);

				vi.advanceTimersByTime(5000);

				expect(onTimeout).toHaveBeenCalledTimes(1);
				expect(onClick).not.toHaveBeenCalled();
				expect(document.querySelectorAll("button")).toHaveLength(0);
			} finally {
				vi.useRealTimers();
			}
		});

		it("does not fire onTimeout if the prompt was already resolved by a click", () => {
			vi.useFakeTimers();
			try {
				const onTimeout = vi.fn();
				const onClick = vi.fn();
				LSCG_SendLocalPrompt("Choose", [{ label: "A", color: "green", onClick }], 5000, onTimeout);
				document.querySelector("button")!.dispatchEvent(new Event("click", { bubbles: true }));

				vi.advanceTimersByTime(5000);

				expect(onClick).toHaveBeenCalledTimes(1);
				expect(onTimeout).not.toHaveBeenCalled();
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe("settingsSave", () => {
		// debouncedSave (lodash debounce, leading+trailing) is a module-level
		// singleton shared across every test in this describe block. Toggling
		// vi.useFakeTimers()/useRealTimers() per test resyncs the mocked clock to
		// the real wall clock each time, which can land within a millisecond or
		// two of the *previous* test's recorded lastCallTime and confuse
		// lodash's "is this a new invocation window" check -- so fake timers stay
		// on for the whole block, and each test instead advances *past* the
		// previous test's debounce window itself before calling settingsSave().
		beforeAll(() => {
			vi.useFakeTimers();
		});

		afterAll(() => {
			vi.useRealTimers();
		});

		beforeEach(() => {
			vi.advanceTimersByTime(2000);
		});

		it("saves synchronously on the leading edge (compresses settings, syncs, backs up to localStorage)", () => {
			globalThis.Player.LSCG = { GlobalModule: { enabled: true } } as unknown as SettingsModel;
			settingsSave();

			expect(globalThis.Player.ExtensionSettings?.LSCG).toBeTruthy();
			expect(globalThis.ServerPlayerExtensionSettingsSync).toHaveBeenCalledWith("LSCG");
			expect(localStorage.getItem(`LSCG_${globalThis.Player.MemberNumber}_Backup`)).toBe(globalThis.Player.ExtensionSettings!.LSCG);
		});

		it("does not publish a sync packet when called without publish=true", () => {
			settingsSave();
			expect(sent.hidden().some(m => m.type === "sync")).toBe(false);
		});

		it("publishes a sync packet (via CoreModule) when called with publish=true, once a CoreModule is registered", async () => {
			const { registerModule } = await import("modules");
			const { CoreModule } = await import("Modules/core");
			const core = registerModule(new CoreModule());
			core.init();

			settingsSave(true);
			expect(sent.hidden().some(m => m.type === "sync")).toBe(true);
		});
	});
});
