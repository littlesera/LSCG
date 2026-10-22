// /lscg commands that read other characters: get-outfit-code only for someone whose items you may use, and who lets you copy their outfit.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { CommandModule } from "Modules/commands";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("/lscg get-outfit-code", () => {
	let core: CoreModule;
	let commands: CommandModule;
	const writeText = vi.fn(() => Promise.resolve());

	beforeAll(() => {
		[core, commands] = boot(new CoreModule(), new CommandModule());
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		addToRoom(player());
		writeText.mockClear();
	});

	const run = (args: string) => commands.getSubcommand("get-outfit-code")!.Action!(args, "", args ? [args] : []);

	it("copies another character's outfit", () => {
		addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		run("Alice");
		expect(writeText).toHaveBeenCalledOnce();
		expect(sent.local().join(" ")).toContain("copied to clipboard");
	});

	it("refuses when their item permissions don't let you use their items", () => {
		const alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		vi.mocked(ServerChatRoomGetAllowItem).mockReturnValueOnce(false);
		run("Alice");
		expect(ServerChatRoomGetAllowItem).toHaveBeenCalledWith(player(), alice);
		expect(writeText).not.toHaveBeenCalled();
		expect(sent.local().join(" ")).toContain("Alice does not allow you to copy their outfit");
	});

	describe("their own setting", () => {
		const alice = (outfitCopy?: string, extra: Record<string, unknown> = {}) => addToRoom(makeCharacter({
			MemberNumber: 2, Nickname: "Alice", LSCG: { GlobalModule: { enabled: true, ...(outfitCopy ? { outfitCopy } : {}) } }, ...extra,
		} as never));
		const copied = () => writeText.mock.calls.length > 0;

		it("Everyone: anyone with item permission", () => {
			alice("Public");
			run("Alice");
			expect(copied()).toBe(true);
		});

		it("not sent, by an older version: the same as Everyone", () => {
			alice();
			run("Alice");
			expect(copied()).toBe(true);
		});

		it("Whitelist: not a stranger", () => {
			alice("Whitelist", { WhiteList: [] });
			run("Alice");
			expect(copied()).toBe(false);
			expect(sent.local().join(" ")).toContain("Alice does not allow you to copy their outfit");
		});

		it("Whitelist: someone on it", () => {
			alice("Whitelist", { WhiteList: [1] });
			run("Alice");
			expect(copied()).toBe(true);
		});

		it("Nobody: not even someone on their whitelist", () => {
			alice("Nobody", { WhiteList: [1] });
			run("Alice");
			expect(copied()).toBe(false);
		});

		it("is shared with the room, Everyone unless chosen", () => {
			expect(core.publicSettings.GlobalModule.outfitCopy).toBe("Public");
			Player.LSCG.GlobalModule.outfitCopy = "Nobody";
			expect(core.publicSettings.GlobalModule.outfitCopy).toBe("Nobody");
		});

		it("never overrides item permission", () => {
			alice("Public");
			vi.mocked(ServerChatRoomGetAllowItem).mockReturnValueOnce(false);
			run("Alice");
			expect(copied()).toBe(false);
		});
	});

	it("always copies your own", () => {
		vi.mocked(ServerChatRoomGetAllowItem).mockReturnValue(false);
		run("");
		vi.mocked(ServerChatRoomGetAllowItem).mockReturnValue(true);
		expect(writeText).toHaveBeenCalledOnce();
	});
});
