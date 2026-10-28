// Ghosted / blacklisted players must not be able to drive LSCG on the Player: hidden LSCG packets,
// Leash-type command beeps, and the OnChat/OnActivity/... reaction hooks all ignore them.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { OnAction, OnActivity, OnChat, OnWhisper } from "../../src/utils";
import { ModuleCategory } from "Settings/setting_definitions";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { receive } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

describe("ghosted/blacklisted senders are ignored", () => {
	let core: CoreModule;
	const onChat = vi.fn();
	const onWhisper = vi.fn();
	const onAction = vi.fn();
	const onActivity = vi.fn();

	beforeAll(() => {
		[core] = boot(new CoreModule());
		OnChat(1, ModuleCategory.Core, onChat);
		OnWhisper(1, ModuleCategory.Core, onWhisper);
		OnAction(1, ModuleCategory.Core, onAction);
		OnActivity(1, ModuleCategory.Core, onActivity);
	});

	beforeEach(() => {
		vi.clearAllMocks();
		core.CommandListeners = [];
	});

	function listen() {
		const func = vi.fn();
		core.RegisterCommandListener({ id: "test", command: "swap-ask", func });
		return func;
	}

	describe.each([
		["ghost", { GhostList: [111] }],
		["black", { BlackList: [111] }],
	] as [string, { GhostList?: number[]; BlackList?: number[] }][])("%slisted sender", (_, lists) => {
		beforeEach(() => {
			resetWorld({ MemberNumber: 1, ...lists });
		});

		it("cannot send a hidden LSCG command", () => {
			const func = listen();
			receive.command(addToRoom(makeCharacter({ MemberNumber: 111 })), "swap-ask");
			expect(func).not.toHaveBeenCalled();
		});

		it("cannot send a Leash-type command beep", () => {
			const func = listen();
			receive.beep(addToRoom(makeCharacter({ MemberNumber: 111 })), {
				IsLSCG: true, type: "command", reply: false, settings: null, target: 1,
				version: "v0", command: { name: "swap-ask", args: [] },
			} as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();
		});

		it("does not trigger chat, whisper, action or activity reactions", () => {
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.chat(sender, "hello");
			receive.whisper(sender, "hello");
			receive.emote(sender, "waves");
			receive.action(sender, "ChatOther-ItemMouth-Pet");
			receive.activity(sender, "ItemHands", "LSCG_HoldHand", makeCharacter({ MemberNumber: 1 }));
			expect(onChat).not.toHaveBeenCalled();
			expect(onWhisper).not.toHaveBeenCalled();
			expect(onAction).not.toHaveBeenCalled();
			expect(onActivity).not.toHaveBeenCalled();
		});
	});

	describe("a sender on neither list", () => {
		beforeEach(() => {
			resetWorld({ MemberNumber: 1, GhostList: [222], BlackList: [333] });
		});

		it("still gets through (control)", () => {
			const func = listen();
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.command(sender, "swap-ask");
			receive.beep(sender, {
				IsLSCG: true, type: "command", reply: false, settings: null, target: 1,
				version: "v0", command: { name: "swap-ask", args: [] },
			} as LSCGMessageModel);
			receive.chat(sender, "hello");
			receive.activity(sender, "ItemHands", "LSCG_HoldHand", makeCharacter({ MemberNumber: 1 }));
			expect(func).toHaveBeenCalledTimes(2);
			expect(onChat).toHaveBeenCalled();
			expect(onActivity).toHaveBeenCalled();
		});
	});

	describe("item permissions and activity preferences", () => {
		const cmd = (name: LSCGCommandName, args: { name: string; value: unknown }[] = []) => ({
			IsLSCG: true, type: "command", reply: false, settings: null, target: 1,
			version: "v0", command: { name, args },
		}) as LSCGMessageModel;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const g = globalThis as any;

		beforeEach(() => {
			resetWorld({ MemberNumber: 1 });
			g.ServerChatRoomGetAllowItem.mockImplementation(() => true);
		});

		function listenTo(command: LSCGCommandName) {
			const func = vi.fn();
			core.RegisterCommandListener({ id: `t-${command}`, command, func });
			return func;
		}

		it("drops interaction commands from someone item permissions don't allow, by hidden packet or beep", () => {
			const func = listenTo("swap-ask");
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			receive.hidden(sender, cmd("swap-ask"));
			receive.beep(sender, cmd("swap-ask"));
			expect(func).not.toHaveBeenCalled();
		});

		it("drops interaction commands from someone who isn't in the room", () => {
			const func = listenTo("swap-ask");
			receive.hidden(makeCharacter({ MemberNumber: 555 }), cmd("swap-ask"));
			expect(func).not.toHaveBeenCalled();
		});

		it("lets interaction commands through when item permissions allow them", () => {
			const func = listenTo("swap-ask");
			receive.hidden(addToRoom(makeCharacter({ MemberNumber: 111 })), cmd("swap-ask"));
			expect(func).toHaveBeenCalledTimes(1);
		});

		it("still lets non-interaction commands (release, unpair) through for someone without permission", () => {
			const func = listenTo("release");
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			g.ServerChatRoomGetAllowItem.mockImplementation(() => false);
			receive.hidden(sender, cmd("release"));
			expect(func).toHaveBeenCalledTimes(1);
		});

		it("drops a grab whose source activity the Player has blocked in their BC preferences", () => {
			const func = listenTo("grab");
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			g.Player.ArousalSettings = { Activity: "x" };
			g.PreferenceGetActivityFactor.mockImplementation((_: unknown, name: string) => (name === "Choke" ? 0 : 2));
			receive.hidden(sender, cmd("grab", [{ name: "type", value: "neck" }]));
			expect(func).not.toHaveBeenCalled();
			receive.hidden(sender, cmd("grab", [{ name: "type", value: "ear" }]));
			expect(func).toHaveBeenCalledTimes(1);
			g.PreferenceGetActivityFactor.mockReset();
		});

		it("ignores a broadcast naming a command that isn't room-wide", () => {
			const func = listenTo("swap-ask");
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, { ...cmd("swap-ask"), type: "broadcast", target: null } as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();
		});
	});
});
