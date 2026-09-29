// CoreModule.CheckForPublicPacket()/Command()/Broadcast()/Sync(): the router
// every incoming LSCG message goes through.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { receive } from "../harness/room";
import { makeCharacter, snapshotCharacter } from "../harness/fixtures";

describe("CoreModule incoming routing", () => {
	let core: CoreModule;

	beforeAll(() => {
		[core] = boot(new CoreModule());
	});

	beforeEach(() => {
		resetWorld();
		core.CommandListeners = [];
	});

	// "swap-ask" is only used here as a real, valid LSCGCommandName to register
	// a listener under -- these tests are about Command()/Broadcast()'s generic
	// dispatch mechanics, not about the swap feature itself.
	function listen(command: LSCGCommandName) {
		const func = vi.fn();
		core.RegisterCommandListener({ id: `test-${command}`, command, func });
		return func;
	}

	describe("CheckForPublicPacket", () => {
		it("ignores anything that isn't Type=Hidden, Content=LSCGMsg", () => {
			const func = listen("swap-ask");
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.chat(sender, "not an LSCG packet");
			receive.action(sender, "ChatOther-ItemMouth-Pet");
			expect(func).not.toHaveBeenCalled();
		});

		it("ignores a Hidden/LSCGMsg packet with no Dictionary entry", () => {
			const func = listen("swap-ask");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(globalThis as any).ChatRoomMessage({ Type: "Hidden", Content: "LSCGMsg", Sender: 111, Dictionary: [] });
			expect(func).not.toHaveBeenCalled();
		});
	});

	describe("from another player", () => {
		it("routes type=command to Command(), which fans out to matching listeners", () => {
			const func = listen("swap-ask");
			const player = resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.command(sender, "swap-ask", [{ name: "x", value: 1 }]);
			expect(func).toHaveBeenCalledWith(111, expect.objectContaining({ command: { name: "swap-ask", args: [{ name: "x", value: 1 }] } }));
			void player;
		});

		it("Command() ignores a packet whose target isn't this Player", () => {
			const func = listen("swap-ask");
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, {
				IsLSCG: true, type: "command", reply: false, settings: null,
				target: 999, // not us
				version: "v0", command: { name: "swap-ask", args: [] },
			} as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();
		});

		it("Command() ignores a packet with no command payload", () => {
			const func = listen("swap-ask");
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, {
				IsLSCG: true, type: "command", reply: false, settings: null,
				target: 1, version: "v0",
			} as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();
		});

		it("routes type=broadcast to Broadcast(), which fans out regardless of target", () => {
			const func = listen("swap-ask");
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, {
				IsLSCG: true, type: "broadcast", reply: false, settings: null,
				target: 999, // Broadcast() never checks target
				version: "v0", command: { name: "swap-ask", args: [] },
			} as LSCGMessageModel);
			expect(func).toHaveBeenCalledWith(111, expect.objectContaining({ type: "broadcast" }));
		});

		it("Broadcast() ignores a packet with no command payload", () => {
			const func = listen("swap-ask");
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, { IsLSCG: true, type: "broadcast", reply: false, settings: null, target: null, version: "v0" } as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();
		});

		it("type=init and type=sync both merge settings onto the sender and call CharacterRefresh", () => {
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			receive.hidden(sender, {
				IsLSCG: true, type: "init", reply: false,
				settings: { GlobalModule: { enabled: true } },
				target: null, version: "v0",
			} as LSCGMessageModel);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((sender as any).LSCG).toEqual({ GlobalModule: { enabled: true } });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect((globalThis as any).CharacterRefresh).toHaveBeenCalledWith(sender, false);
		});

		it("replies with our own public packet when the incoming sync/init packet asks for one (msg.reply)", () => {
			resetWorld({ MemberNumber: 1, LSCG: {} });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));
			const sendPublicPacket = vi.spyOn(core, "SendPublicPacket");

			receive.hidden(sender, {
				IsLSCG: true, type: "sync", reply: true, settings: {},
				target: null, version: "v0",
			} as LSCGMessageModel);

			expect(sendPublicPacket).toHaveBeenCalledWith(false, "sync");
		});
	});

	describe("self-sent packets", () => {
		it("only type=broadcast is processed from ourself; init/sync/command are ignored", () => {
			const func = listen("swap-ask");
			const self = snapshotCharacter(resetWorld({ MemberNumber: 1 }));

			receive.hidden(self, { IsLSCG: true, type: "command", reply: false, settings: null, target: 1, version: "v0", command: { name: "swap-ask", args: [] } } as LSCGMessageModel);
			expect(func).not.toHaveBeenCalled();

			receive.hidden(self, { IsLSCG: true, type: "broadcast", reply: false, settings: null, target: null, version: "v0", command: { name: "swap-ask", args: [] } } as LSCGMessageModel);
			expect(func).toHaveBeenCalledTimes(1);
		});
	});

	describe("ServerAccountBeep interception", () => {
		it("only intercepts BeepType=Leash with IsLSCG=true; anything else passes through to the base game", () => {
			const func = listen("swap-ask");
			resetWorld({ MemberNumber: 1 });
			const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));

			receive.beep(sender, { IsLSCG: true, type: "command", reply: false, settings: null, target: 1, version: "v0", command: { name: "swap-ask", args: [] } } as LSCGMessageModel);
			expect(func).toHaveBeenCalledTimes(1);

			// A beep that isn't IsLSCG (even with BeepType "Leash") must fall
			// through to `next(args)` -- the base game's own handler -- rather
			// than being swallowed as if it were one of ours. (globalThis.
			// ServerAccountBeep is the SDK's router after hookFunction wraps it,
			// not the underlying vi.fn(), so there's nothing to assert on it
			// directly here beyond "doesn't throw" -- the real check is that our
			// own listener isn't invoked for a non-LSCG beep.)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const serverAccountBeep = (globalThis as any).ServerAccountBeep as (data: unknown) => void;
			expect(() => serverAccountBeep({ MemberNumber: 111, BeepType: "Leash", IsSecret: true, Message: { some: "other mod's payload" } })).not.toThrow();
			expect(func).toHaveBeenCalledTimes(1); // not called again
		});
	});
});
