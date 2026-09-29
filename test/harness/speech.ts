// Shared driver for SpeechAnalysisModule tests: say()/hear() feed lines through
// the real, hooked globals exactly as BC's own chat pipeline would (rather than
// calling the module's private methods directly), so these tests also exercise
// the hookFunction wiring itself.
import { vi } from "vitest";
import { SpeechAnalysisModule, type LSCGSpeechAnalysis } from "Modules/speech-analysis";
import type { FixtureCharacter } from "./fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

let idCounter = 0;

export interface SayOptions {
	whisperTo?: number;
	replyId?: string;
	/** What actually went out over ServerSend, if different from `text` (e.g. gag-garbled). */
	garbled?: string;
}

export interface HearOptions {
	whisper?: boolean;
	replyId?: string;
	/** The garbled text actually shown, if different from `text` (the player's true, understood line is `text`). */
	shown?: string;
}

export interface SpeechDriver {
	module: SpeechAnalysisModule;
	/** Drives the player saying `text`, through the real ChatRoomGenerateChatRoomChatMessage + ServerSend hooks. */
	say(text: string, o?: SayOptions): { a: LSCGSpeechAnalysis | null; msgId: string };
	/** Drives `sender` saying `text` to the room, through the module's real incoming ChatRoomMessageHandler. */
	hear(sender: FixtureCharacter, text: string, o?: HearOptions): string;
	/** Re-boots the module (its own supported unload()/load() cycle) with a fresh onAnalysis subscription. */
	reset(): void;
	lastAnalysis(): LSCGSpeechAnalysis | null;
}

/**
 * Attaches an onAnalysis listener and returns say()/hear()/reset() bound to it.
 *
 * Requires fake timers (`vi.useFakeTimers()`, once per file in `beforeAll` -- see
 * time.ts's note on the debounce pitfall for why not per-test). Contextual attribution
 * (who a reply is "about") is ordered by `Date.now()` (e.g. `e.at > sinceAt`), and two
 * calls made back-to-back on the real clock can land in the same millisecond, making
 * that ordering flip nondeterministically. Each say()/hear() advances the clock by a
 * couple of real-feeling seconds first, exactly as the original hand-rolled harness
 * this was ported from did with its own incrementing fake `now`.
 */
export function driveSpeechAnalysis(module: SpeechAnalysisModule): SpeechDriver {
	let last: LSCGSpeechAnalysis | null = null;
	module.onAnalysis(a => { last = a; });

	return {
		module,
		lastAnalysis: () => last,
		say(text, o = {}) {
			vi.advanceTimersByTime(2000);
			const type = o.whisperTo ? "Whisper" : "Chat";
			const msgId = "p" + ++idCounter;
			g.ChatRoomGenerateChatRoomChatMessage(type, text, o.replyId);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const Dictionary: any[] = [{ Tag: "MsgId", MsgId: msgId }];
			if (o.replyId) Dictionary.push({ Tag: "ReplyId", ReplyId: o.replyId });
			last = null;
			g.ServerSend("ChatRoomChat", { Type: type, Content: o.garbled ?? text, Target: o.whisperTo, Dictionary });
			return { a: last, msgId };
		},
		hear(sender, text, o = {}) {
			vi.advanceTimersByTime(2000);
			const msgId = "i" + ++idCounter;
			const handler = g.ChatRoomMessageHandlers.find((h: { Description?: string }) => h.Description === "LSCG Speech Analysis Incoming Context");
			handler.Callback(
				{ Type: o.whisper ? "Whisper" : "Chat", Sender: sender.MemberNumber, Content: text },
				sender,
				o.shown ?? text,
				{ MsgId: msgId, ReplyId: o.replyId, OriginalMsg: o.shown ? text : undefined },
			);
			return msgId;
		},
		reset() {
			module.unload();
			module.load();
			last = null;
			module.onAnalysis(a => { last = a; });
			vi.advanceTimersByTime(600_000);
		},
	};
}

export function tone(a: LSCGSpeechAnalysis | null): string {
	return a?.tone ?? "none";
}
