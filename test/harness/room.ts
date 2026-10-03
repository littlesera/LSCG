// Outgoing capture (what reached the fake `ServerSend`/`ChatRoomSendLocal`) and
// incoming injection (feeding a message through the real, hooked `ChatRoomMessage`/
// `ServerAccountBeep` globals) for a booted world. See world.ts for boot()/resetWorld().
//
// Two-player flows (consent, spells, swap, cursed-item request/response, ...) are
// tested by capture-and-replay: take what the sender's fake ServerSend captured,
// reset the world as the target, and feed it back in via `receive.*`.
import { currentBcLite } from "./world";
import type { FixtureCharacter } from "./fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Packet = [string, any];

function calls(): Packet[] {
	return currentBcLite().ServerSend.mock.calls as Packet[];
}

// ---- Outgoing capture -------------------------------------------------------

export const sent = {
	/** Raw (type, data) pairs passed to ServerSend, in call order. */
	raw(): Packet[] {
		return calls();
	},

	/** Text of every SendAction("...") call (the localized %-token dictionary entry tagged "msg"). */
	actions(): string[] {
		return calls()
			.filter(([type, data]) => type === "ChatRoomChat" && data?.Type === "Action" && data?.Content === "Beep")
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.map(([, data]) => (data.Dictionary as any[]).find(d => d.Tag === "msg")?.Text ?? "");
	},

	/** Every SendChat(msg) call. */
	chats(): string[] {
		return calls()
			.filter(([type, data]) => type === "ChatRoomChat" && data?.Type === "Chat")
			.map(([, data]) => data.Content as string);
	},

	/** Every sendLSCGMessage(...) call, decoded back to its LSCGMessageModel payload. */
	hidden(): LSCGMessageModel[] {
		return calls()
			.filter(([type, data]) => type === "ChatRoomChat" && data?.Type === "Hidden" && data?.Content === "LSCGMsg")
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.map(([, data]) => (data.Dictionary as any[])[0].message as LSCGMessageModel);
	},

	/** Every sendLSCGBeep(...) call. */
	beeps(): { target: number; message: LSCGMessageModel }[] {
		return calls()
			.filter(([type, data]) => type === "AccountBeep" && data?.BeepType === "Leash")
			.map(([, data]) => ({ target: data.MemberNumber as number, message: data.Message as LSCGMessageModel }));
	},

	/** Every LSCG_SendLocal(Prompt) call, as raw HTML strings. */
	local(): string[] {
		return currentBcLite().ChatRoomSendLocal.mock.calls.map(([html]) => html as string);
	},
};

// ---- Incoming injection ------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chatRoomMessage(data: Record<string, any>): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).ChatRoomMessage(data);
}

export const receive = {
	chat(from: FixtureCharacter, content: string): void {
		chatRoomMessage({ Type: "Chat", Content: content, Sender: from.MemberNumber, Dictionary: [] });
	},

	whisper(from: FixtureCharacter, content: string): void {
		chatRoomMessage({ Type: "Whisper", Content: content, Sender: from.MemberNumber, Dictionary: [] });
	},

	emote(from: FixtureCharacter, content: string): void {
		chatRoomMessage({ Type: "Emote", Content: content, Sender: from.MemberNumber, Dictionary: [] });
	},

	action(from: FixtureCharacter, content: string): void {
		chatRoomMessage({ Type: "Action", Content: content, Sender: from.MemberNumber, Dictionary: [] });
	},

	/**
	 * Simulates receiving `ChatOther-<group>-<name>` (or ChatSelf when `target` is
	 * omitted / equals `from`) the way LSCG's OnActivity handlers see it.
	 */
	activity(from: FixtureCharacter, group: string, name: string, target?: FixtureCharacter): void {
		const isSelf = !target || target.MemberNumber === from.MemberNumber;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dictionary: any[] = [{ Tag: "ActivityName", text: name }];
		if (target) dictionary.push({ Tag: "DestinationCharacter", MemberNumber: target.MemberNumber });
		chatRoomMessage({
			Type: "Activity",
			Content: `Chat${isSelf ? "Self" : "Other"}-${group}-${name}`,
			Sender: from.MemberNumber,
			Dictionary: dictionary,
		});
	},

	/** Feeds an LSCGMessageModel through the "Hidden"/"LSCGMsg" channel, as CheckForPublicPacket expects. */
	hidden(from: FixtureCharacter, msg: LSCGMessageModel): void {
		chatRoomMessage({
			Type: "Hidden",
			Content: "LSCGMsg",
			Sender: from.MemberNumber,
			Dictionary: [{ message: msg }],
		});
	},

	/** Convenience wrapper for the common case: an LSCG command addressed to Player. */
	command(from: FixtureCharacter, name: LSCGCommandName, args: { name: string; value: unknown }[] = []): void {
		receive.hidden(from, {
			IsLSCG: true,
			type: "command",
			reply: false,
			settings: null,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			target: (globalThis as any).Player.MemberNumber,
			version: "v0.0.0",
			command: { name, args },
		} as LSCGMessageModel);
	},

	/** Feeds an LSCG beep (the "Leash" BeepType hijack) through ServerAccountBeep. */
	beep(from: FixtureCharacter, msg: LSCGMessageModel): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).ServerAccountBeep({ MemberNumber: from.MemberNumber, BeepType: "Leash", IsSecret: true, Message: msg });
	},
};
