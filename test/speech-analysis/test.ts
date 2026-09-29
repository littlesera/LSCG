import { actions, hooks, localMessages, sent } from "./stubs/utils";
import * as utilsStub from "./stubs/utils";
import { defaultSpeechPublicSettings, defaultSpeechReactions, sanitizeRemoteSpeechSettings } from "../../src/Settings/Models/speech-analysis";
import { fakeStates, listeners } from "./stubs/misc";
import { SpeechAnalysisModule, LSCGSpeechAnalysis } from "../../src/Modules/speech-analysis";
import { RedressedState as RealRedressedState } from "../../src/Modules/States/RedressedState";
import { StripLevel } from "../../src/Settings/Models/cursed-item";
import { OutfitOption } from "../../src/Settings/Models/magic";
import LZString from "lz-string";

const g = globalThis as any;
let now = 1_000_000;
Date.now = () => now;

const mk = (n: number, name: string) => ({ MemberNumber: n, Name: name, Nickname: name, IsPlayer: () => n === 1 });
const player = Object.assign(mk(1, "Sera"), {
    IsOwnedByMemberNumber: (m: number) => m === 99, IsLoverOfMemberNumber: (m: number) => m === 50,
    WhiteList: [60], BlackList: [66], FriendList: [70],
    IsGagged: () => false, ArousalSettings: { Progress: 10 },
});
g.Player = player;
g.ChatRoomCharacter = [player, mk(2, "Alice"), mk(3, "Bob")];
g.ChatRoomMessageHandlers = [];
g.ChatRoomRegisterMessageHandler = (h: any) => g.ChatRoomMessageHandlers.push(h);
g.IsMsgIdDictionaryEntry = (e: any) => e.Tag === "MsgId";
g.IsReplyIdDictionaryEntry = (e: any) => e.Tag === "ReplyId";
g.CharacterNickname = (c: any) => c.Nickname;
g.LZString = { compressToBase64: (s: string) => `b64(${s})` };

const m = new SpeechAnalysisModule();
m.load();
let last: LSCGSpeechAnalysis | null = null;
m.onAnalysis(a => last = a);
// All detectors now default to off; most of this suite assumes tone/profanity/phrases are on (erudite has its own tests).
m.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
const handler = g.ChatRoomMessageHandlers[0];
let id = 0;

function say(text: string, o: { whisperTo?: number; replyId?: string; garbled?: string } = {}) {
    now += 2000;
    const type = o.whisperTo ? "Whisper" : "Chat";
    const msgId = "p" + ++id;
    hooks.ChatRoomGenerateChatRoomChatMessage([type, text, o.replyId], () => {});
    const Dictionary: any[] = [{ Tag: "MsgId", MsgId: msgId }];
    if (o.replyId) Dictionary.push({ Tag: "ReplyId", ReplyId: o.replyId });
    last = null;
    hooks.ServerSend(["ChatRoomChat", { Type: type, Content: o.garbled ?? text, Target: o.whisperTo, Dictionary }], () => {});
    return { a: last as LSCGSpeechAnalysis | null, msgId };
}
function hear(sender: number, text: string, o: { whisper?: boolean; replyId?: string; shown?: string } = {}) {
    now += 2000;
    const msgId = "i" + ++id;
    const c = g.ChatRoomCharacter.find((x: any) => x.MemberNumber === sender);
    handler.Callback({ Type: o.whisper ? "Whisper" : "Chat", Sender: sender, Content: text }, c, o.shown ?? text,
        { MsgId: msgId, ReplyId: o.replyId, OriginalMsg: o.shown ? text : undefined });
    return msgId;
}
function reset() { m.unload(); m.load(); m.onAnalysis(a => last = a); now += 600_000; }

let pass = 0, fail = 0;
function check(name: string, actual: string, expected: string, detail = "") {
    const ok = actual === expected;
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(62)} got=${actual}${ok ? "" : ` expected=${expected} ${detail}`}`);
}
const tone = (a: LSCGSpeechAnalysis | null) => a?.tone ?? "none";

console.log("--- standalone phrase table ---");
const table: [string, string][] = [
    ["I'm so stupid", "negative"], ["I'm not very good", "negative"], ["nobody likes me", "negative"],
    ["I am worthless", "negative"], ["will anyone ever love me? probably not", "negative"],
    ["am I useless? yes", "negative"], ["I'm not bad at this", "positive"], ["everyone hates me", "negative"],
    ["I feel like such a failure", "negative"], ["I am not stupid", "positive"],
    ["I am amazing", "positive"], ["I'm proud of myself", "positive"], ["am I useless? no", "positive"],
    ["I love being her slave", "neutral"], ["the pain feels nice", "neutral"], ["I hate this stupid game", "neutral"],
    ["no worries", "neutral"], ["right, let's go", "neutral"], ["hello everyone", "neutral"],
    ["nothing can stop me", "neutral"], ["I love pizza", "neutral"],
    // self-referential verb with no object: no fixed "I am/I feel" framing needed
    ["I suck", "negative"], ["I suck at this", "negative"], ["I fail", "negative"], ["I failed", "negative"],
    // same shape, but the verb has an external object, so it's not self-deprecation
    ["I failed the test", "neutral"], ["I ruined everything", "neutral"], ["I love cooking dinner", "neutral"],
    // comparisons
    ["other people are cuter than me", "negative"], ["everyone is better than me", "negative"],
    ["you are all so much smarter than me", "negative"], ["she is more beautiful than me", "negative"],
    ["I'm less pretty than her", "negative"], ["I'm dumber than a rock", "negative"],
    ["no one is uglier than me", "negative"], ["I'm not as smart as them", "negative"],
    ["I'm as dumb as a rock", "negative"], ["I'm the dumbest person here", "negative"],
    ["I'm the least attractive one here", "negative"], ["I'm not better than anyone", "negative"],
    ["I'm prettier than her", "positive"], ["nobody is better than me", "positive"],
    ["I'm smarter than those idiots", "positive"], ["I'm as good as anyone", "positive"], ["I am the best", "positive"],
    ["I am the prettiest in the room", "positive"], ["nobody is as pretty as me", "positive"], ["I'm cuter than all of you", "positive"],
    // putting others down is not an affirmation
    ["she's uglier than me", "neutral"], ["she's less pretty than me", "neutral"], ["I'm less ugly than her", "neutral"],
    ["she's not as pretty as me", "neutral"], ["you're all dumber than me", "neutral"], ["I'm not the ugliest", "neutral"],
    ["I'm the least ugly one here", "neutral"],
    ["I'd rather stay than go", "neutral"], ["I love you more than anything", "neutral"],
    ["you are smarter than Bob", "neutral"], ["I'm older than her", "neutral"],
    ["other than me, nobody came", "neutral"],
];
for (const [t, e] of table) { reset(); check(`"${t}"`, tone(m.analyze(t)), e, JSON.stringify(m.analyze(t).negativeSelf)); }

m.settings.affirmationPhrases = "I am a good girl";
check(`phrase "I am a good girl" (configured)`, String(m.analyze("I am a good girl").positiveSelf.viaPhrase), "true");
m.settings.affirmationPhrases = "";

for (const [t, e] of [["fuck", "true"], ["f*ck", "true"], ["fuuuuck this", "true"], ["sh1t", "true"], ["classic assessment", "false"], ["hello", "false"]] as [string, string][])
    check(`profanity "${t}"`, String(m.analyze(t).profanity.detected), e, m.analyze(t).profanity.words.join(","));

console.log("--- profanity overrides ---");
{
    const prof = (t: string) => m.analyze(t).profanity;
    const words = (t: string) => prof(t).words.join(",") || "none";
    check("before overrides: 'frick' is clean", words("oh frick"), "none");
    m.settings.profanityExtras = "frick, son of a gun";
    check("extra word detected as typed", words("oh frick"), "frick");
    check("extra word does not catch disguised spellings (plain match only)", words("oh fr1ck"), "none");
    check("extra word: whole words only ('frickin' isn't 'frick')", words("frickin heck"), "none");
    check("extra multi-word phrase", words("you son of a gun"), "son of a gun");
    check("built-in list still works alongside extras", words("fuck this"), "fuck");
    m.settings.profanitySafe = "fuck";
    check("safe word removes the built-in match", words("fuck this"), "none");
    check("safe word also clears disguised spellings of the same built-in word", words("f*ck this"), "none");
    m.settings.profanitySafe = "shit";
    check("other built-ins still flagged when a different word is safe", words("fuck"), "fuck");
    m.settings.profanityExtras = ""; m.settings.profanitySafe = "";
    check("clearing overrides restores defaults", `${words("oh frick")}/${words("fuck")}`, "none/fuck");
    const cleaned = sanitizeRemoteSpeechSettings({ profanityExtras: "frick", profanitySafe: 42 });
    check("remote: profanity lists accepted as strings only", `${cleaned.profanityExtras}/${cleaned.profanitySafe}`, "frick/undefined");
}

console.log("--- contextual (3-person room) ---");
reset(); hear(2, "who is the worst?"); check(`A "who is the worst?" -> "I am"`, tone(say("I am").a), "negative");
reset(); hear(2, "who's a good girl?"); check(`A "who's a good girl?" -> "me!"`, tone(say("me!").a), "positive");
reset(); hear(2, "who is the worst?"); check(`A "who is the worst?" -> "I am going to bed"`, tone(say("I am going to bed").a), "neutral");
reset(); hear(2, "Bob you're so dumb"); check(`A "Bob you're so dumb" (to Bob) -> "yeah"`, tone(say("yeah").a), "neutral");
reset(); hear(2, "you're so dumb"); check(`A "you're so dumb" (busy room, no link) -> "yeah"`, tone(say("yeah").a), "neutral");
reset(); say("hey"); hear(2, "Bob you're so dumb"); check(`player spoke last, A "Bob you're so dumb" -> "yeah"`, tone(say("yeah").a), "neutral");
{ reset(); const saved = g.ChatRoomCharacter; g.ChatRoomCharacter = saved.slice(0, 2); hear(2, "you're so dumb"); check(`2-person room: A "you're so dumb" -> "yeah"`, tone(say("yeah").a), "negative"); g.ChatRoomCharacter = saved; }
reset(); hear(2, "Bob is so dumb", { whisper: true }); check(`A whispers "Bob is so dumb" -> whisper "yeah"`, tone(say("yeah", { whisperTo: 2 }).a), "neutral");
reset(); hear(2, "you're so dumb", { whisper: true }); check(`A whispers "you're so dumb" -> whisper "yeah"`, tone(say("yeah", { whisperTo: 2 }).a), "negative");
reset(); hear(2, "Sera is useless"); check(`A "Sera is useless" -> "true"`, tone(say("true").a), "negative");
reset(); { const { msgId } = say("hi all"); hear(2, "you're pathetic", { replyId: msgId }); check(`A replies to player "you're pathetic" -> "I know"`, tone(say("I know").a), "negative"); }
reset(); say("hey Alice"); hear(2, "you are so pathetic"); check(`turn-taking: player spoke, A "you are so pathetic" -> "sadly"`, tone(say("sadly").a), "negative");
reset(); hear(2, "you're wonderful Sera"); check(`A "you're wonderful Sera" -> "no"`, tone(say("no").a), "negative");
reset(); hear(2, "you're wonderful Sera"); check(`A "you're wonderful Sera" -> "thank you!"`, tone(say("thank you!").a), "neutral");
reset(); hear(2, "Sera you're so stupid"); check(`A "Sera you're so stupid" -> "no I'm not"`, tone(say("no I'm not").a), "positive");
reset(); hear(2, "you're dumb", { whisper: true, shown: "mmph mmm" }); check(`garbled whisper "you're dumb" -> "yeah"`, tone(say("yeah", { whisperTo: 2 }).a), "neutral");
reset(); check(`player gagged says "I'm worthless" (sent garbled)`, tone(say("I'm worthless", { garbled: "mm mmmmmph" }).a), "negative");
reset(); hear(2, "who is the worst?"); say("I am"); check(`same question answered twice`, tone(say("me").a), "neutral");
reset(); hear(2, "who is the worst?"); now += 120_000; check(`answered after window expired`, tone(say("I am").a), "neutral");
reset(); hear(2, "who is the worst?"); say("brb"); check(`unrelated line in between, then "me"`, tone(say("me").a), "neutral");
reset(); check(`split message "am I pretty?" + "no"`, (say("am I pretty?"), tone(say("no").a)), "negative");
reset(); say("fuck"); check(`profanity does not repeat on next clean line`, String(say("hello there").a?.profanity.detected), "false");

console.log("--- detector toggles ---");
reset();
m.settings.detectors = { ...m.settings.detectors, profanity: false };
check("profanity off -> not detected", String(m.analyze("fuck").profanity.detected), "false");
check("profanity off -> describe says off", String(m.describe(m.analyze("fuck")).includes("profanity: off")), "true");
m.settings.detectors = { ...m.settings.detectors, profanity: true, tone: false };
check("tone off -> self-talk neutral", tone(m.analyze("I'm so stupid")), "neutral");
hear(2, "who is the worst?");
check("tone off -> contextual answer not detected", tone(say("I am").a), "neutral");
m.settings.detectors = { ...m.settings.detectors, tone: true };
const complex = "Notwithstanding considerable epistemological uncertainty, institutional characterization remains fundamentally indeterminate";
check("reading level off by default", String(m.analyze(complex).erudite.detected), "false");
m.settings.detectors = { ...m.settings.detectors, erudite: true };
check("reading level on -> detected", String(m.analyze(complex).erudite.detected), "true");
check("reading level on, simple line -> not detected", String(m.analyze("I like to go to the park with my friends on the weekend").erudite.detected), "false");

console.log("--- reading level: word-count floor ---");
m.settings.eruditeGrade = 1; // isolate the floor: with a threshold this low, only the floor can suppress a detection
for (const t of ["Absolutely.", "Seriously?", "Ridiculous.", "Obviously.", "No, definitely not."])
    check(`floor: common short interjection "${t}" never flags`, String(m.analyze(t).erudite.detected), "false");
check("floor: 4-word line still suppressed", String(m.analyze("I am extremely disappointed.").erudite.detected), "false");
check("floor: 5-word line is assessed", String(m.analyze("That is absolutely unacceptable to me.").erudite.detected), "true");
m.settings.eruditeGrade = 10; // back to the default threshold
check("6-word eloquent line exceeds the default threshold (used to be hidden by the old 8-word floor)",
    String(m.analyze("Honestly, I am extremely disappointed today.").erudite.detected), "true");
check("6-word plain line stays under the default threshold", String(m.analyze("I really don't want to go.").erudite.detected), "false");
check("describe reports 'not enough words' below the floor, not a grade number", String(m.describe(m.analyze("Absolutely.")).includes("not enough words to assess")), "true");
m.settings.detectors = { tone: true } as any; m.init();
check("init fills missing detectors, keeps saved ones", JSON.stringify(m.settings.detectors), `{"tone":true,"profanity":false,"erudite":false,"phrases":false}`);
m.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };

console.log("--- reaction engine emotes ---");
reset();
check("every default rule starts off", String(defaultSpeechReactions().every(r => !r.enabled)), "true");
actions.length = 0;
say("I'm so worthless"); say("fuck");
check("fresh settings: no reactions fire", String(actions.length), "0");
m.settings.reactions = [
    { enabled: true, detection: "negative",  action: "applyState",  state: "denied", cooldownMs: 10_000 },
    { enabled: true, detection: "positive",  action: "removeState", state: "denied", cooldownMs: 10_000 },
    { enabled: true, detection: "profanity", action: "applyState",  state: "gagged", durationMs: 60_000, cooldownMs: 10_000 },
];
m.settings.detectors = { tone: true, profanity: true, erudite: false };
now += 60_000;
const [denied, gagged] = fakeStates;
fakeStates.forEach(s => { s.Active = false; s.calls = []; });
actions.length = 0;
say("I'm so worthless");
check("negative -> denied applied", `${denied.Active}/${denied.calls.join(",")}`, "true/activate:1:undefined");
check("apply emote sent before state", String(actions[0] ?? ""), "%NAME% whimpers as %POSSESSIVE% own words bring on an impending denial.");
actions.length = 0; now += 20_000;
say("I am amazing");
check("positive -> denied removed without generic 'wears off' emote", `${denied.Active}/${denied.calls.at(-1)}`, "false/recover:false");
check("removal emote sent", String(actions[0] ?? ""), "%NAME% sighs in relief as %POSSESSIVE% words lift the looming denial.");
actions.length = 0; now += 20_000;
say("fuck");
check("profanity -> gagged applied for 60s", `${gagged.Active}/${gagged.calls.at(-1)}`, "true/activate:1:60000");
check("gag emote (not already gagged)", String(actions[0] ?? ""), "%NAME%'s mouth keeps moving, but after those words not a single sound escapes.");
actions.length = 0;
say("I'm so worthless");
check("denied re-applied only after cooldown", String(actions.length > 0), "true");
actions.length = 0; now += 1000;
denied.Active = false; say("I'm so worthless");
check("cooldown blocks immediate re-trigger", String(actions.length), "0");
gagged.Active = false; denied.Active = false;

console.log("--- trance + outfit reactions ---");
reset();
const [, , , hyp, redressed] = fakeStates as any[];
fakeStates.forEach(s => { s.Active = false; s.calls = []; });
m.settings.reactions = [
    { enabled: true, detection: "negative", action: "applyState", state: "hypnotized", durationMs: 120_000, cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "Maid", durationMs: 300_000, cooldownMs: 0 },
    { enabled: true, detection: "positive", action: "removeState", state: "redressed", cooldownMs: 0 },
];
actions.length = 0;
say("I'm so worthless");
check("negative -> trance applied with duration", `${hyp.Active}/${hyp.calls.at(-1)}`, "true/activate:1:120000");
check("trance emote", String(actions[0]), "%NAME%'s eyes glaze over as %POSSESSIVE% own words pull %INTENSIVE% down into a deep trance.");
actions.length = 0;
say("fuck");
check("profanity -> outfit applied via redressed", `${redressed.Active}/${redressed.calls.at(-1)}`, "true/apply:Maid:1:300000");
check("outfit code built from collection", String(redressed.lastSpell.Outfit.Code), `b64([{"Group":"Cloth","Name":"MaidOutfit1"}])`);
check("outfit emote", String(String(actions[0]).includes("clothing shimmers and morphs")), "true");
check("outfit defaults: add only (strip nothing), clothes and restraints", `${redressed.lastStrip}/${redressed.lastSpell.Outfit.Option}`, "0/Clothes and Restraints");
actions.length = 0;
say("I am amazing");
check("positive -> redressed removed (outfit restored)", `${redressed.Active}/${redressed.calls.at(-1)}`, "false/recover:false");
check("restore emote", String(actions[0]), "%NAME%'s clothing shimmers and returns to what %PRONOUN% was wearing before.");
redressed.Active = false;
m.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitOption: "Clothes Only", outfitStrip: 3, cooldownMs: 0 }];
say("damn it all to hell, fuck");
check("outfit rule passes configured parts and strip level", `${redressed.lastStrip}/${redressed.lastSpell.Outfit.Option}`, "3/Clothes Only");
m.settings.reactions = [{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "missing", cooldownMs: 0 }];
actions.length = 0; redressed.calls = [];
say("shit");
check("unknown outfit key -> nothing happens", `${redressed.calls.length}/${actions.length}`, "0/0");
m.settings.reactions = [{ enabled: true, detection: "negative", action: "applyState", state: "redressed", cooldownMs: 0 }];
say("I'm so worthless");
check("applyState redressed (remove-only) -> ignored", String(redressed.calls.length), "0");
fakeStates.forEach(s => { s.Active = false; s.calls = []; });

console.log("--- ordering ---");
{
    m.settings.reactions = [{ enabled: true, detection: "negative", action: "applyState", state: "denied", cooldownMs: 0 }];
    fakeStates.forEach(s => { s.Active = false; s.calls = []; });
    actions.length = 0;
    now += 2000;
    let emotesBeforeSend = -1;
    hooks.ChatRoomGenerateChatRoomChatMessage(["Chat", "I'm so worthless"], () => {});
    hooks.ServerSend(["ChatRoomChat", { Type: "Chat", Content: "I'm so worthless", Dictionary: [] }], () => { emotesBeforeSend = actions.length; });
    check("player's line is sent before any reaction emote", `${emotesBeforeSend}/${actions.length}`, "0/1");
    fakeStates.forEach(s => { s.Active = false; s.calls = []; });
}

console.log("--- force orgasm ---");
m.settings.reactions = [{ enabled: true, detection: "positive", action: "orgasm", cooldownMs: 30_000 }];
actions.length = 0;
const before = utilsStub.orgasms;
say("I am amazing");
check("positive -> forced orgasm", String(utilsStub.orgasms - before), "1");
check("orgasm emote sent first", String(actions[0]), "%NAME%'s words trail off into a helpless moan as %PRONOUN% is pushed over the edge.");
say("I am wonderful");
check("orgasm respects cooldown", String(utilsStub.orgasms - before), "1");
const outfitRules = sanitizeRemoteSpeechSettings({ reactions: [
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitOption: "Restraints Only", outfitStrip: 7, cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", outfitOption: "Everything!", outfitStrip: 99, cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "shock", outfitOption: "Restraints Only", outfitStrip: 1, cooldownMs: 0 },
] }).reactions!;
check("remote outfit options: valid kept, invalid option/strip dropped, ignored on non-outfit rules",
    outfitRules.map(r => `${r.outfitOption ?? "-"}:${r.outfitStrip ?? "-"}`).join("|"), "Restraints Only:7|-:-|-:-");
const cleaned = sanitizeRemoteSpeechSettings({ reactions: [{ enabled: true, detection: "profanity", action: "orgasm", cooldownMs: 0, state: "denied", outfitKey: "x" }] });
check("remote orgasm rule accepted, stray fields dropped", JSON.stringify(cleaned.reactions?.[0]), `{"enabled":true,"detection":"profanity","action":"orgasm","cooldownMs":0}`);

console.log("--- phrase lists ---");
reset();
m.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
fakeStates.forEach(s => { s.Active = false; s.calls = []; });
m.settings.phraseGroups = [
    { id: "release", name: "Release phrases", phrases: `"may I have my clothes back", please mistress` },
    { id: "banned", name: "Banned words", phrases: "pizza, darn" },
];
const matched = (t: string) => m.analyze(t).phrases.matched.join(",") || "none";
check(`"May I have my clothes back?" -> release`, matched("May I have my clothes back?"), "release");
check(`"Please Mistress, I'm sorry" (case-insensitive) -> release`, matched("Please Mistress, I'm sorry"), "release");
check(`"darn, I want pizza" -> banned (one group, two hits)`, `${matched("darn, I want pizza")}/${m.analyze("darn, I want pizza").phrases.hits.length}`, "banned/2");
check(`"darnation" -> whole words only`, matched("darnation"), "none");
check(`"please mistress, no more pizza" -> both groups`, matched("please mistress, no more pizza"), "release,banned");
check("describe shows phrase hits with group name", String(m.describe(m.analyze("darn")).includes(`"darn" (Banned words)`)), "true");

const shocks: any[] = [];
g.PropertyShockPublishAction = (_c: any, item: any) => shocks.push(item.Asset.Name);
g.Player.Appearance = [{ Asset: { Name: "CollarShockUnit" }, Property: { ShockLevel: 1 } }];
m.settings.reactions = [
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "maid", cooldownMs: 0 },
    { enabled: true, detection: "phrase", phraseGroup: "release", action: "removeState", state: "redressed", cooldownMs: 0 },
    { enabled: true, detection: "phrase", phraseGroup: "banned", action: "shock", cooldownMs: 0 },
];
say("fuck this");
check("profanity -> maid outfit", String(redressed.Active), "true");
say("I want my clothes");
check("wrong phrase -> still redressed", String(redressed.Active), "true");
say("may I have my clothes back please?");
check("release phrase -> clothes restored", `${redressed.Active}/${redressed.calls.at(-1)}`, "false/recover:false");
say("I love pizza");
check("banned word -> shock from worn device", shocks.join(","), "CollarShockUnit");
g.Player.Appearance = [];
say("darn");
check("banned word, no shock device -> nothing", String(shocks.length), "1");
m.settings.detectors = { ...m.settings.detectors, phrases: false };
check("phrases detector off -> no matches", matched("pizza"), "none");
m.settings.detectors = { ...m.settings.detectors, phrases: true };
m.settings.phraseGroups = [{ id: "banned", name: "Banned", phrases: "" }];
check("empty group matches nothing", matched("anything at all"), "none");
fakeStates.forEach(s => { s.Active = false; s.calls = []; });

console.log("--- remote configuration receiver ---");
const remote = listeners.find(l => l.command === "speech-settings-set");
const send = (sender: number, value: any) => remote.func(sender, { command: { name: "speech-settings-set", args: [{ name: "settings", value }] } });
reset();
const hypno = fakeStates[3];
m.settings.remoteAccess = true; m.settings.remoteLevel = "Public";
check("trance required by default", String(m.settings.remoteRequiresTrance), "true");
hypno.Active = false; send(99, { eruditeGrade: 7 }); check("requires trance, not hypnotized -> ignored (even owner)", String(m.settings.eruditeGrade), "10");
hypno.Active = true; send(3, { eruditeGrade: 7 }); check("requires trance, hypnotized -> applied", String(m.settings.eruditeGrade), "7");
m.settings.remoteLevel = "Owner"; send(3, { eruditeGrade: 8 }); check("hypnotized but fails permission level -> ignored", String(m.settings.eruditeGrade), "7");
send(99, { remoteRequiresTrance: false }); check("remote cannot turn off trance requirement", String(m.settings.remoteRequiresTrance), "true");
hypno.Active = false;
m.settings.eruditeGrade = 10; m.settings.remoteRequiresTrance = false;
m.settings.remoteAccess = false; send(99, { negativeThreshold: -1 }); check("remote disabled -> ignored", String(m.settings.negativeThreshold), "0");
m.settings.remoteAccess = true; m.settings.remoteLevel = "Owner";
send(2, { negativeThreshold: -1 }); check("Owner level, non-owner -> ignored", String(m.settings.negativeThreshold), "0");
send(99, { negativeThreshold: -1 }); check("Owner level, owner -> applied", String(m.settings.negativeThreshold), "-1");
m.settings.remoteLevel = "Friends";
send(3, { positiveThreshold: 1 }); check("Friends level, stranger -> ignored", String(m.settings.positiveThreshold), "0.3");
send(70, { positiveThreshold: 1 }); check("Friends level, friend -> applied", String(m.settings.positiveThreshold), "1");
send(60, { eruditeGrade: 12 }); check("Friends level, whitelisted -> applied", String(m.settings.eruditeGrade), "12");
m.settings.remoteLevel = "PublicExceptBlacklist";
send(66, { eruditeGrade: 5 }); check("PublicExceptBlacklist, blacklisted -> ignored", String(m.settings.eruditeGrade), "12");
send(99, { remoteAccess: false, lockable: true, remoteLevel: "Public", enabled: false });
check("forged remoteAccess/lockable/level/enabled ignored", `${m.settings.remoteAccess}/${m.settings.lockable}/${m.settings.remoteLevel}/${m.settings.enabled}`, "true/false/PublicExceptBlacklist/false");
send(99, { locked: true }); check("lock rejected when not lockable", String(m.settings.locked), "false");
m.settings.lockable = true; send(99, { locked: true }); check("lock accepted when lockable", String(m.settings.locked), "true");
m.safeword(); check("safeword clears lock", String(m.settings.locked), "false");
send(99, { negativeThreshold: 50, contextWindowSeconds: "10" }); check("out-of-range / wrong-type numbers dropped", `${m.settings.negativeThreshold}/${m.settings.contextWindowSeconds}`, "-1/60");
send(99, { reactions: [{ enabled: true, detection: "negative", action: "applyState", state: "hacked" }, { enabled: true, detection: "profanity", action: "shock", cooldownMs: 5000 }, ...Array(20).fill({ enabled: true, detection: "positive", action: "removeState", state: "denied", cooldownMs: 1 })] });
check("rules: invalid state dropped", `${m.settings.reactions.length}/${m.settings.reactions[0].action}`, "21/shock");
send(99, { reactions: Array(200).fill({ enabled: true, detection: "positive", action: "removeState", state: "denied", cooldownMs: 1 }) });
check("rules capped at 128", String(m.settings.reactions.length), "128");
send(99, { reactions: [
    { enabled: true, detection: "negative", action: "applyState", state: "hypnotized", cooldownMs: 0 },
    { enabled: true, detection: "negative", action: "applyState", state: "redressed", cooldownMs: 0 },
    { enabled: true, detection: "positive", action: "removeState", state: "redressed", cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "  maid ", cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "", cooldownMs: 0 },
    { enabled: true, detection: "profanity", action: "outfit", outfitKey: "x".repeat(71), cooldownMs: 0 },
] });
check("remote rules: trance ok, apply-redressed/empty/long outfit dropped", m.settings.reactions.map((r: any) => r.state ?? r.outfitKey).join(","), "hypnotized,redressed,maid");
send(99, {
    phraseGroups: [
        { id: "release", name: "Release", phrases: "sorry mistress" },
        { id: "release", name: "Duplicate", phrases: "x" },
        { id: "BAD ID!", name: "Bad", phrases: "x" },
        { id: "banned", name: "N".repeat(80), phrases: 42 },
        "junk",
    ],
    reactions: [
        { enabled: true, detection: "phrase", phraseGroup: "release", action: "removeState", state: "redressed", cooldownMs: 0 },
        { enabled: true, detection: "phrase", phraseGroup: "<script>", action: "shock", cooldownMs: 0 },
        { enabled: true, detection: "phrase", action: "shock", cooldownMs: 0 },
    ],
});
check("remote phrase groups: dup/bad id/junk dropped, name capped, bad phrases emptied",
    m.settings.phraseGroups.map((p: any) => `${p.id}:${p.name.length}:${p.phrases}`).join("|"), "release:7:sorry mistress|banned:40:");
check("remote phrase rules: invalid/missing group id dropped", m.settings.reactions.map((r: any) => r.phraseGroup).join(","), "release");
m.settings.detectors = { tone: true, profanity: true, erudite: false };
send(99, { detectors: { erudite: true, bogus: true, tone: "no" } });
check("remote detectors merge partially, junk dropped", JSON.stringify(m.settings.detectors), `{"tone":true,"profanity":true,"erudite":true}`);
console.log("--- private config + hidden phrases ---");
check("public settings only carry access fields", Object.keys(defaultSpeechPublicSettings()).sort().join(","), "enabled,lockable,locked,remoteAccess,remoteLevel,remoteRequiresTrance");
reset();
m.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
g.ChatRoomCharacter.push(mk(99, "Ownerperson"));
m.settings.remoteAccess = true; m.settings.remoteLevel = "Public"; m.settings.remoteRequiresTrance = false;
m.settings.phraseGroups = [{ id: "release", name: "Release", phrases: "wearer secret" }];
const get = (sender: number) => { sent.length = 0; listeners.find(l => l.command === "speech-settings-get").func(sender, {}); return sent[0]; };
let resp = get(3);
check("get from stranger -> response sent back to them", `${resp?.name}/${resp?.target}`, "speech-settings-response/3");
let groups = resp.args[0].value.phraseGroups;
check("stranger can't see wearer's phrases", `${groups[0].hidden}/${groups[0].phrases}`, "true/");
check("response carries rules and thresholds", String(Array.isArray(resp.args[0].value.reactions) && typeof resp.args[0].value.negativeThreshold === "number"), "true");
send(3, { phraseGroups: [{ id: "release", name: "Hacked", hidden: true }, { id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
check("hidden group untouched by stranger save", `${m.settings.phraseGroups[0].name}/${m.settings.phraseGroups[0].phrases}`, "Release/wearer secret");
check("stranger's new group recorded as theirs", `${m.settings.phraseGroups[1].installedBy}/${m.settings.phraseGroups[1].phrases}`, "3/stranger secret");
send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
check("stranger can't delete a group they can't see", m.settings.phraseGroups.map((p: any) => p.id).join(","), "g-abc123,release");
groups = get(3).args[0].value.phraseGroups;
check("stranger sees their own group's phrases", groups.map((p: any) => `${p.id}:${p.hidden ? "hidden" : p.phrases}`).join("|"), "g-abc123:stranger secret|release:hidden");
check("owner sees every group", get(99).args[0].value.phraseGroups.every((p: any) => !p.hidden) ? "true" : "false", "true");
check("wearer: stranger's group hidden, own group visible", `${m.isGroupHiddenFromWearer("g-abc123")}/${m.isGroupHiddenFromWearer("release")}`, "true/false");
check("describe never reveals a hidden group's match", String(m.describe(m.analyze("stranger secret")).includes("phrases: none")), "true");
check("...but it still matches for reactions", m.analyze("stranger secret").phrases.matched.join(","), "g-abc123");
send(99, { phraseGroups: [{ id: "release", name: "Release", phrases: "owner secret" }, { id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
check("owner re-setting wearer's phrases makes them hidden from wearer", `${m.isGroupHiddenFromWearer("release")}/${m.settings.phraseGroups.find((p: any) => p.id === "release").installedBy}`, "true/99");
m.settings.remoteAccess = false;
check("get refused when remote access off", String(get(99)), "undefined");
check("remote change notifies wearer", String(localMessages.some(x => x.includes("changed your speech analysis settings"))), "true");

console.log("--- speech outfit restores only the slots it changed ---");
{
    const realLZ = g.LZString;
    g.LZString = LZString;
    g.InventoryGet = (C: any, group: string) => C.Appearance.find((i: any) => i.Asset.Group.Name === group) ?? null;
    g.AssetGet = (_f: any, group: string, name: string) => utilsStub.makeItem(group, name).Asset;
    g.AppearanceItem = { fromAsset: (asset: any) => ({ Asset: asset }) };
    g.InventoryIsPermissionBlocked = () => false;
    g.InventoryIsPermissionLimited = () => false;
    g.InventoryChatRoomAllow = () => true;
    g.ChatRoomCharacterUpdate = () => {};
    g.Player.LSCG = { MagicModule: { allowOutfitToChangeNeckItems: false } };
    g.Player.AssetFamily = "Female3DCG";

    let config: any;
    const state = new RealRedressedState({ getStateSetting: () => config } as any);
    const reset = (...items: [string, string][]) => {
        config = { type: "redressed", active: false, activationCount: 0, extensions: {} };
        g.Player.Appearance = items.map(([grp, name]) => utilsStub.makeItem(grp, name));
    };
    const outfit = (...items: [string, string][]) => ({
        Name: "test", Outfit: { Key: "test", Option: OutfitOption.both, Code: LZString.compressToBase64(JSON.stringify(items.map(([Group, Name]) => ({ Group, Name })))) },
    }) as any;
    const worn = () => g.Player.Appearance.map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort().join(",");

    reset(["Cloth", "Dress"]);
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.NONE);
    check("add-only: gag added, dress kept", worn(), "Cloth:Dress,ItemMouth:BallGag");
    utilsStub.ApplyItem({ Group: "ItemArms", Name: "Rope" });
    state.Recover(false);
    check("release keeps arm binds added afterwards, removes only the gag", worn(), "Cloth:Dress,ItemArms:Rope");

    reset(["ItemMouth", "ClothGag"]);
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.NONE);
    state.Recover(false);
    check("replaced slot gets its original item back", worn(), "ItemMouth:ClothGag");

    reset();
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.NONE);
    utilsStub.ApplyItem({ Group: "ItemMouth", Name: "TapeGag" });
    state.Recover(false);
    check("slot changed by someone else since is left alone", worn(), "ItemMouth:TapeGag");

    reset(["Cloth", "Dress"], ["ItemFeet", "Chains"]);
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.CLOTHES);
    check("strip clothing: dress removed, gag added, binds untouched", worn(), "ItemFeet:Chains,ItemMouth:BallGag");
    state.Recover(false);
    check("restore brings the stripped dress back", worn(), "Cloth:Dress,ItemFeet:Chains");

    reset(["Cloth", "Dress"]);
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.NONE);
    state.ApplyAdditive(outfit(["ItemMouth", "HarnessGag"], ["ItemHands", "Mittens"]), 1, undefined, StripLevel.NONE);
    check("second speech outfit stacks", worn(), "Cloth:Dress,ItemHands:Mittens,ItemMouth:HarnessGag");
    state.Recover(false);
    check("stacked outfits restore to before the first (originally empty mouth stays empty)", worn(), "Cloth:Dress");
    check("snapshot cleared after restore", String(state.SlotSnapshot), "undefined");

    reset(["ItemMouth", "BallGag"]);
    state.ApplyAdditive(outfit(["ItemMouth", "BallGag"]), 1, undefined, StripLevel.NONE);
    check("outfit that changes nothing remembers nothing", String(state.SlotSnapshot), "undefined");

    g.LZString = realLZ;
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exitCode = 1;
