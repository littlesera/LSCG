// Multi-turn corpus, played through the real say()/hear() pipeline. All drafts pending review.
import type { ConversationCase } from "./types";

const H = (hear: string, text: string, extra: Partial<{ whisper: boolean; replyTo: number; shown: string }> = {}) => ({ hear, text, ...extra });

export const CONVERSATIONS: ConversationCase[] = [
	{
		name: "open question, self-nominated",
		turns: [
			{ hear: "Alice", text: "who is the worst here?" },
			{ say: "I am", expect: { tone: "negative", context: "negative" } },
		],
	},
	{
		name: "reply agrees with a put-down (private room)",
		room: ["Alice"],
		turns: [
			{ hear: "Alice", text: "you're so stupid" },
			{ say: "yes I am", replyTo: 0, expect: { tone: "negative", context: "negative" } },
		],
	},
	{
		name: "reply disagrees with a put-down (private room)",
		room: ["Alice"],
		turns: [
			{ hear: "Alice", text: "you're so stupid" },
			{ say: "no I'm not", replyTo: 0, expect: { tone: "positive" } },
		],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "agrees with a compliment (private room)",
		room: ["Alice"],
		turns: [
			{ hear: "Alice", text: "you're such a good girl" },
			{ say: "yes I am", replyTo: 0, expect: { tone: "positive", context: "positive" } },
		],
	},
	{
		name: "whispered put-down and whispered agreement",
		turns: [
			{ hear: "Alice", text: "you're useless", whisper: true },
			{ say: "yeah I know", whisperTo: "Alice", expect: { tone: "negative", context: "negative" } },
		],
	},
	{
		name: "answer to someone else's exchange is not context",
		room: ["Alice", "Bob", "Carol"],
		turns: [
			{ hear: "Alice", text: "Bob you're so stupid" },
			{ say: "yes", expect: { context: "none" } },
		],
	},
	{
		name: "stale question is ignored",
		turns: [
			{ hear: "Alice", text: "who is the worst here?" },
			{ wait: 120 },
			{ say: "I am", expect: { context: "none" } },
		],
	},
	{
		name: "garbled incoming line is ignored",
		turns: [
			{ hear: "Alice", text: "you're so stupid", shown: "mmph mmff mmmph" },
			{ say: "yes I am", expect: { context: "none" } },
		],
	},
	{
		name: "outgoing is judged un-garbled",
		turns: [
			{ say: "I am so stupid", garbled: "mmph mm mmmph", expect: { tone: "negative" } },
		],
	},
	{
		name: "neutral chat stays neutral",
		turns: [
			{ hear: "Alice", text: "want to sit by the fire?" },
			{ say: "sure, that sounds nice", replyTo: 0, expect: { tone: "neutral", context: "none" } },
			{ hear: "Bob", text: "can I join?" },
			{ say: "of course", expect: { tone: "neutral" } },
		],
	},
	{
		name: "'you' in a crowded room without a reply link",
		room: ["Alice", "Bob", "Carol"],
		turns: [
			{ hear: "Alice", text: "you're a fool" },
			{ hear: "Bob", text: "haha" },
			{ hear: "Carol", text: "so true" },
			{ say: "yes I am", expect: { context: "none" } },
		],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "open question: who is the prettiest, self-nominated",
		turns: [H("Alice", "who's the prettiest here?"), { say: "I am", expect: { tone: "positive", context: "positive" } }],
	},
	{
		name: "open question: who is the dumbest, self-nominated",
		turns: [H("Bob", "who is the dumbest person in here?"), { say: "me", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "open question answered with someone else",
		turns: [H("Alice", "who is the worst here?"), { say: "Bob is", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "open question answered with a deflection",
		turns: [H("Alice", "who is the worst here?"), { say: "not me", expect: { context: "none" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "addressed by name with a put-down, agrees",
		turns: [H("Alice", "Sera you're such a fool"), { say: "yeah I know", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "addressed by name with a compliment, agrees",
		turns: [H("Alice", "Sera you're so pretty"), { say: "thank you, I know", expect: { tone: "neutral" } }],
	},
	{
		name: "addressed by name with a compliment, thanks only",
		turns: [H("Alice", "Sera you look lovely tonight"), { say: "thank you!", expect: { tone: "neutral" } }],
	},
	{
		name: "put-down, player protests",
		turns: [H("Alice", "Sera you're useless"), { say: "hey that's not nice", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "put-down, player asks why",
		turns: [H("Alice", "you're so stupid"), { say: "why would you say that?", expect: { context: "none" } }],
	},
	{
		name: "put-down, player laughs it off",
		turns: [H("Alice", "you are so dumb"), { say: "lol", expect: { context: "none" } }],
	},
	{
		name: "put-down then accepts in the next line (private room)",
		room: ["Alice"],
		turns: [H("Alice", "you're a total idiot", {}), { say: "you're right, I am", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "praise then modest denial",
		turns: [H("Alice", "you're so smart"), { say: "no I'm not really", expect: { context: "none" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "whisper compliment, whisper agreement",
		turns: [H("Bob", "you're such a good girl", { whisper: true }), { say: "yes I am", whisperTo: "Bob", expect: { tone: "positive", context: "positive" } }],
	},
	{
		name: "whisper put-down answered in open chat",
		turns: [H("Bob", "you're useless", { whisper: true }), { say: "yes I am", expect: { context: "none" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "whisper to someone else does not pair",
		room: ["Alice", "Bob", "Carol"],
		turns: [H("Alice", "you're so dumb", { whisper: true }), { say: "yes I am", whisperTo: "Carol", expect: { context: "none" } }],
	},
	{
		name: "reply link in a crowded room does not settle who 'you' was",
		room: ["Alice", "Bob", "Carol"],
		turns: [
			H("Alice", "you're such a good girl"),
			H("Bob", "what time is it?"),
			{ say: "yes I am", replyTo: 0, expect: { tone: "neutral", context: "none" } },
		],
	},
	{
		name: "reply link to a neutral line does not pair",
		room: ["Alice", "Bob", "Carol"],
		turns: [
			H("Alice", "you're so stupid"),
			H("Bob", "want to play cards?"),
			{ say: "yes I am", replyTo: 1, expect: { context: "none" } },
		],
	},
	{
		name: "three-way room: 'you' without a link is ambiguous",
		room: ["Alice", "Bob", "Carol"],
		turns: [H("Alice", "you're stupid"), H("Bob", "what?"), H("Carol", "lol"), { say: "yes", expect: { context: "none" } }],
	},
	{
		name: "two-person room: 'you' is the player",
		room: ["Alice"],
		turns: [H("Alice", "you're so stupid"), { say: "yes I am", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "two-person room: praise is for the player",
		room: ["Alice"],
		turns: [H("Alice", "you're such a good girl"), { say: "yes I am", expect: { tone: "positive", context: "positive" } }],
	},
	{
		name: "incoming garbled praise is ignored",
		turns: [H("Alice", "you're so pretty", { shown: "mmph mmff" }), { say: "yes I am", expect: { context: "none" } }],
	},
	{
		name: "outgoing garbled positive judged un-garbled",
		turns: [{ say: "I am a good girl", garbled: "mmph mm m mmmph", expect: { tone: "positive" } }],
	},
	{
		name: "outgoing garbled neutral stays neutral",
		turns: [{ say: "I want some water please", garbled: "mmph mmm mmph mmph", expect: { tone: "neutral" } }],
	},
	{
		name: "stale put-down window expires",
		turns: [H("Alice", "you're so stupid"), { wait: 300 }, { say: "yes I am", expect: { tone: "neutral" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "immediate answer inside the window (private room)",
		room: ["Alice"],
		turns: [H("Alice", "you're so stupid"), { wait: 10 }, { say: "yes I am", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "unrelated small talk never pairs",
		turns: [H("Alice", "how was your day?"), { say: "pretty good, I went shopping", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "question about the player, plain answer",
		turns: [H("Alice", "are you tired?"), { say: "a bit", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "asked if she is a good girl, yes (private room)",
		room: ["Alice"],
		turns: [H("Alice", "are you a good girl?"), { say: "yes I am", expect: { tone: "positive" } }],
	},
	{
		name: "asked if she is a good girl, no",
		turns: [H("Alice", "are you a good girl?"), { say: "no, I'm a bad girl", expect: { tone: "negative" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "asked if she is useless, no",
		turns: [H("Alice", "are you useless?"), { say: "no", expect: { context: "none" } }],
	},
	{
		name: "asked if she is useless, yes (private room)",
		room: ["Alice"],
		turns: [H("Alice", "are you useless?"), { say: "yes", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "player puts down herself unprompted",
		turns: [{ say: "I'm so stupid, I can't believe I did that", expect: { tone: "negative" } }],
	},
	{
		name: "player affirms unprompted",
		turns: [{ say: "I did it! I'm so proud of myself", expect: { tone: "positive" } }],
	},
	{
		name: "someone else puts themselves down; player consoles",
		turns: [H("Alice", "I'm so stupid"), { say: "no you're not, you're great", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "player agrees that someone else is a failure",
		turns: [H("Alice", "Bob is such a failure"), { say: "yeah he is", expect: { tone: "neutral", context: "none" } }],
	},
	{
		name: "roleplay exchange stays neutral",
		turns: [
			H("Alice", "*ties your wrists together*"),
			{ say: "*squirms and tugs at the rope*", expect: { tone: "neutral", context: "none" } },
			H("Alice", "now be a good girl"),
			{ say: "*nods*", expect: { tone: "neutral" } },
		],
	},
	{
		name: "kink dialogue: owner calls her a slut, she says yes",
		turns: [H("Alice", "you're my little slut aren't you"), { say: "yes mistress", expect: { tone: "neutral" } }],
		tags: ["draft-label-uncertain", "kink"],
	},
	{
		name: "kink dialogue: owner asks if she is helpless",
		turns: [H("Alice", "you're completely helpless, aren't you"), { say: "yes, I can't move", expect: { tone: "neutral" } }],
		tags: ["kink"],
	},
	{
		name: "self-nomination for the best",
		turns: [H("Bob", "who is the best girl?"), { say: "me!", expect: { tone: "positive", context: "positive" } }],
	},
	{
		name: "self-nomination for the worst with emphasis",
		turns: [H("Bob", "who's the worst girl here?"), { say: "it's me", expect: { tone: "negative", context: "negative" } }],
	},
	{
		name: "whispered question, open-chat answer to the room",
		room: ["Alice", "Bob", "Carol"],
		turns: [H("Alice", "who's the worst?", { whisper: true }), { say: "I am", expect: { context: "none" } }],
		tags: ["draft-label-uncertain"],
	},
	{
		name: "profanity and tone on separate lines",
		turns: [{ say: "fuck, I'm so stupid", expect: { tone: "negative" } }, { say: "sorry about the language", expect: { tone: "neutral" } }],
	},
	{
		name: "a long calm paragraph of neutral chat",
		turns: [
			H("Alice", "how did the meeting go?"),
			{ say: "it was fine, we got through the agenda", expect: { tone: "neutral", context: "none" } },
			H("Alice", "nice, any news?"),
			{ say: "they're hiring two more people next month", expect: { tone: "neutral", context: "none" } },
		],
	},
];
