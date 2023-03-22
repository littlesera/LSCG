import bcModSDKRef from 'bondage-club-mod-sdk';

const bcModSDK = bcModSDKRef.registerMod({
    name: "CG",
    fullName: "Club Games",
    version: "0.0.1",
    repository: "https://github.com/littlesera/sera"
});
//do not touch this
async function waitFor(func, cancelFunc = () => false) {
    while (!func()) {
        if (cancelFunc())
            return false;
        await sleep(10);
    }
    return true;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseMsgWords(msg) {
    var lowerMsg = msg.toLowerCase();
    var lowerMsgWords = lowerMsg.match(/\b(\w+)\b/g);
    return lowerMsgWords;
}
function OnChat(priority, callback) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Chat")
            callback(data, args[1], args[2], args[3]);
    });
}
function OnAction(priority, callback) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Action" || data.Type == "Emote")
            callback(data, args[1], args[2], args[3]);
    });
}
function OnActivity(priority, callback) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Activity")
            callback(data, args[1], args[2], args[3]);
    });
}
function SendAction(action, senderName = '') {
    ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{ Tag: "Beep", Text: replace_template(action, senderName) }] });
}
function replace_template(text, source_name = '') {
    let result = text;
    // result = result.replaceAll("%POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive.toLocaleLowerCase())
    // result = result.replaceAll("%CAP_POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive)
    // result = result.replaceAll("%PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun.toLocaleLowerCase())
    // result = result.replaceAll("%CAP_PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun)
    // result = result.replaceAll("%INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive.toLocaleLowerCase())
    // result = result.replaceAll("%CAP_INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive)
    result = result.replaceAll("%NAME%", CharacterNickname(Player)); //Does this works to print "Lilly"? -- it should, yes
    result = result.replaceAll("%OPP_NAME%", source_name); // finally we can use the source name to make the substitution
    return result;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function settingsSave() {
    Player.OnlineSettings.ClubGames = Player.ClubGames;
    window.ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings });
}
await waitFor(() => ServerSocket && ServerIsConnected);
await waitFor(() => !!(Player === null || Player === void 0 ? void 0 : Player.AccountName));
Player.ClubGames = Player.OnlineSettings.ClubGames || {};

const commonWords = [
    "able",
    "about",
    "absolute",
    "accept",
    "account",
    "achieve",
    "across",
    "act",
    "active",
    "actual",
    "add",
    "address",
    "admit",
    "advertise",
    "affect",
    "afford",
    "after",
    "afternoon",
    "again",
    "against",
    "age",
    "agent",
    "ago",
    "agree",
    "air",
    "all",
    "allow",
    "almost",
    "along",
    "already",
    "alright",
    "although",
    "always",
    "america",
    "amount",
    "another",
    "answer",
    "apart",
    "apparent",
    "appear",
    "apply",
    "appoint",
    "approach",
    "appropriate",
    "area",
    "argue",
    "arm",
    "around",
    "arrange",
    "art",
    "ask",
    "associate",
    "assume",
    "attend",
    "authority",
    "available",
    "aware",
    "away",
    "awful",
    "baby",
    "back",
    "bad",
    "bag",
    "balance",
    "ball",
    "bank",
    "bar",
    "base",
    "basis",
    "bear",
    "beat",
    "beauty",
    "because",
    "become",
    "bed",
    "before",
    "begin",
    "behind",
    "believe",
    "benefit",
    "best",
    "bet",
    "between",
    "big",
    "bill",
    "birth",
    "bit",
    "black",
    "bloke",
    "blood",
    "blow",
    "blue",
    "board",
    "boat",
    "body",
    "book",
    "both",
    "bother",
    "bottle",
    "bottom",
    "box",
    "boy",
    "break",
    "brief",
    "brilliant",
    "bring",
    "britain",
    "brother",
    "budget",
    "build",
    "bus",
    "business",
    "busy",
    "buy",
    "cake",
    "call",
    "car",
    "card",
    "care",
    "carry",
    "case",
    "cat",
    "catch",
    "cause",
    "cent",
    "centre",
    "certain",
    "chair",
    "chairman",
    "chance",
    "change",
    "chap",
    "character",
    "charge",
    "cheap",
    "check",
    "child",
    "choice",
    "choose",
    "church",
    "city",
    "claim",
    "class",
    "clean",
    "clear",
    "client",
    "clock",
    "close",
    "closes",
    "clothe",
    "club",
    "coffee",
    "cold",
    "colleague",
    "collect",
    "college",
    "colour",
    "come",
    "comment",
    "commit",
    "committee",
    "common",
    "community",
    "company",
    "compare",
    "complete",
    "compute",
    "concern",
    "condition",
    "confer",
    "consider",
    "consult",
    "contact",
    "continue",
    "contract",
    "control",
    "converse",
    "cook",
    "copy",
    "corner",
    "correct",
    "cost",
    "could",
    "council",
    "count",
    "country",
    "county",
    "couple",
    "course",
    "court",
    "cover",
    "create",
    "cross",
    "cup",
    "current",
    "cut",
    "dad",
    "danger",
    "date",
    "day",
    "dead",
    "deal",
    "dear",
    "debate",
    "decide",
    "decision",
    "deep",
    "definite",
    "degree",
    "department",
    "depend",
    "describe",
    "design",
    "detail",
    "develop",
    "die",
    "difference",
    "difficult",
    "dinner",
    "direct",
    "discuss",
    "district",
    "divide",
    "doctor",
    "document",
    "dog",
    "door",
    "double",
    "doubt",
    "down",
    "draw",
    "dress",
    "drink",
    "drive",
    "drop",
    "dry",
    "due",
    "during",
    "each",
    "early",
    "east",
    "easy",
    "eat",
    "economy",
    "educate",
    "effect",
    "egg",
    "eight",
    "either",
    "elect",
    "electric",
    "eleven",
    "else",
    "employ",
    "encourage",
    "end",
    "engine",
    "english",
    "enjoy",
    "enough",
    "enter",
    "environment",
    "equal",
    "especial",
    "europe",
    "even",
    "evening",
    "ever",
    "every",
    "evidence",
    "exact",
    "example",
    "except",
    "excuse",
    "exercise",
    "exist",
    "expect",
    "expense",
    "experience",
    "explain",
    "express",
    "extra",
    "eye",
    "face",
    "fact",
    "fair",
    "fall",
    "family",
    "far",
    "farm",
    "fast",
    "father",
    "favour",
    "feed",
    "feel",
    "few",
    "field",
    "fight",
    "figure",
    "file",
    "fill",
    "film",
    "final",
    "finance",
    "find",
    "fine",
    "finish",
    "fire",
    "first",
    "fish",
    "fit",
    "five",
    "flat",
    "floor",
    "fly",
    "follow",
    "food",
    "foot",
    "force",
    "forget",
    "form",
    "fortune",
    "forward",
    "four",
    "france",
    "free",
    "friday",
    "friend",
    "from",
    "front",
    "full",
    "fun",
    "function",
    "fund",
    "further",
    "future",
    "game",
    "garden",
    "gas",
    "general",
    "germany",
    "girl",
    "give",
    "glass",
    "good",
    "goodbye",
    "govern",
    "grand",
    "grant",
    "great",
    "green",
    "ground",
    "group",
    "grow",
    "guess",
    "guy",
    "hair",
    "half",
    "hall",
    "hand",
    "hang",
    "happen",
    "happy",
    "hard",
    "hate",
    "have",
    "head",
    "health",
    "hear",
    "heart",
    "heat",
    "heavy",
    "hell",
    "help",
    "here",
    "high",
    "history",
    "hit",
    "hold",
    "holiday",
    "home",
    "honest",
    "hope",
    "horse",
    "hospital",
    "hot",
    "hour",
    "house",
    "however",
    "hullo",
    "hundred",
    "husband",
    "idea",
    "identify",
    "imagine",
    "important",
    "improve",
    "include",
    "income",
    "increase",
    "indeed",
    "individual",
    "industry",
    "inform",
    "inside",
    "instead",
    "insure",
    "interest",
    "into",
    "introduce",
    "invest",
    "involve",
    "issue",
    "item",
    "job",
    "join",
    "judge",
    "jump",
    "just",
    "keep",
    "key",
    "kid",
    "kill",
    "kind",
    "king",
    "kitchen",
    "knock",
    "know",
    "labour",
    "lad",
    "lady",
    "land",
    "language",
    "large",
    "last",
    "late",
    "laugh",
    "law",
    "lay",
    "lead",
    "learn",
    "leave",
    "left",
    "leg",
    "less",
    "letter",
    "level",
    "lie",
    "life",
    "light",
    "like",
    "likely",
    "limit",
    "line",
    "link",
    "list",
    "listen",
    "little",
    "live",
    "load",
    "local",
    "lock",
    "london",
    "long",
    "look",
    "lord",
    "lose",
    "lot",
    "love",
    "low",
    "luck",
    "lunch",
    "machine",
    "main",
    "major",
    "make",
    "man",
    "manage",
    "many",
    "mark",
    "market",
    "marry",
    "match",
    "matter",
    "may",
    "mean",
    "meaning",
    "measure",
    "meet",
    "member",
    "mention",
    "middle",
    "might",
    "mile",
    "milk",
    "million",
    "mind",
    "minister",
    "minus",
    "minute",
    "miss",
    "mister",
    "moment",
    "monday",
    "money",
    "month",
    "more",
    "morning",
    "most",
    "mother",
    "motion",
    "move",
    "much",
    "music",
    "must",
    "name",
    "nation",
    "nature",
    "near",
    "necessary",
    "need",
    "never",
    "news",
    "next",
    "nice",
    "night",
    "nine",
    "none",
    "normal",
    "north",
    "not",
    "note",
    "notice",
    "number",
    "obvious",
    "occasion",
    "odd",
    "off",
    "offer",
    "office",
    "often",
    "okay",
    "old",
    "on",
    "once",
    "one",
    "only",
    "open",
    "operate",
    "opportunity",
    "oppose",
    "order",
    "organize",
    "original",
    "other",
    "otherwise",
    "ought",
    "out",
    "over",
    "own",
    "pack",
    "page",
    "paint",
    "pair",
    "paper",
    "paragraph",
    "pardon",
    "parent",
    "park",
    "part",
    "particular",
    "party",
    "pass",
    "past",
    "pay",
    "pence",
    "pension",
    "people",
    "percent",
    "perfect",
    "perhaps",
    "period",
    "person",
    "photograph",
    "pick",
    "picture",
    "piece",
    "place",
    "plan",
    "play",
    "please",
    "plus",
    "point",
    "police",
    "policy",
    "politic",
    "poor",
    "position",
    "positive",
    "possible",
    "post",
    "pound",
    "power",
    "practise",
    "prepare",
    "present",
    "press",
    "pressure",
    "presume",
    "pretty",
    "previous",
    "price",
    "print",
    "private",
    "probable",
    "problem",
    "proceed",
    "process",
    "produce",
    "product",
    "programme",
    "project",
    "proper",
    "propose",
    "protect",
    "provide",
    "public",
    "pull",
    "purpose",
    "push",
    "quality",
    "quarter",
    "question",
    "quick",
    "quid",
    "quiet",
    "quite",
    "radio",
    "rail",
    "raise",
    "range",
    "rate",
    "rather",
    "read",
    "ready",
    "real",
    "realise",
    "really",
    "reason",
    "receive",
    "recent",
    "reckon",
    "recognize",
    "recommend",
    "record",
    "red",
    "reduce",
    "refer",
    "regard",
    "region",
    "relation",
    "remember",
    "report",
    "represent",
    "require",
    "research",
    "resource",
    "respect",
    "responsible",
    "rest",
    "result",
    "return",
    "right",
    "ring",
    "rise",
    "road",
    "role",
    "roll",
    "room",
    "round",
    "rule",
    "run",
    "safe",
    "sale",
    "same",
    "saturday",
    "save",
    "say",
    "scheme",
    "school",
    "science",
    "score",
    "scotland",
    "seat",
    "second",
    "secretary",
    "section",
    "secure",
    "see",
    "seem",
    "self",
    "sell",
    "send",
    "sense",
    "separate",
    "serious",
    "serve",
    "service",
    "set",
    "settle",
    "seven",
    "sex",
    "shall",
    "share",
    "she",
    "sheet",
    "shoe",
    "shoot",
    "shop",
    "short",
    "should",
    "show",
    "shut",
    "sick",
    "side",
    "sign",
    "similar",
    "simple",
    "since",
    "sing",
    "single",
    "sir",
    "sister",
    "sit",
    "site",
    "situate",
    "six",
    "size",
    "sleep",
    "slight",
    "slow",
    "small",
    "smoke",
    "social",
    "society",
    "some",
    "son",
    "soon",
    "sorry",
    "sort",
    "sound",
    "south",
    "space",
    "speak",
    "special",
    "specific",
    "speed",
    "spell",
    "spend",
    "square",
    "staff",
    "stage",
    "stairs",
    "stand",
    "standard",
    "start",
    "state",
    "station",
    "stay",
    "step",
    "stick",
    "still",
    "stop",
    "story",
    "straight",
    "strategy",
    "street",
    "strike",
    "strong",
    "structure",
    "student",
    "study",
    "stuff",
    "stupid",
    "subject",
    "succeed",
    "such",
    "sudden",
    "suggest",
    "suit",
    "summer",
    "sun",
    "sunday",
    "supply",
    "support",
    "suppose",
    "sure",
    "surprise",
    "switch",
    "system",
    "table",
    "take",
    "talk",
    "tape",
    "tax",
    "tea",
    "teach",
    "team",
    "telephone",
    "television",
    "tell",
    "ten",
    "tend",
    "term",
    "terrible",
    "test",
    "than",
    "thank",
    "the",
    "then",
    "there",
    "therefore",
    "they",
    "thing",
    "think",
    "thirteen",
    "thirty",
    "this",
    "thou",
    "though",
    "thousand",
    "three",
    "through",
    "throw",
    "thursday",
    "tie",
    "time",
    "today",
    "together",
    "tomorrow",
    "tonight",
    "too",
    "top",
    "total",
    "touch",
    "toward",
    "town",
    "trade",
    "traffic",
    "train",
    "transport",
    "travel",
    "treat",
    "tree",
    "trouble",
    "true",
    "trust",
    "try",
    "tuesday",
    "turn",
    "twelve",
    "twenty",
    "two",
    "type",
    "under",
    "understand",
    "union",
    "unit",
    "unite",
    "university",
    "unless",
    "until",
    "up",
    "upon",
    "use",
    "usual",
    "value",
    "various",
    "very",
    "video",
    "view",
    "village",
    "visit",
    "vote",
    "wage",
    "wait",
    "walk",
    "wall",
    "want",
    "war",
    "warm",
    "wash",
    "waste",
    "watch",
    "water",
    "way",
    "we",
    "wear",
    "wednesday",
    "week",
    "weigh",
    "welcome",
    "well",
    "west",
    "what",
    "when",
    "where",
    "whether",
    "which",
    "while",
    "white",
    "who",
    "whole",
    "why",
    "wide",
    "wife",
    "will",
    "win",
    "wind",
    "window",
    "wish",
    "with",
    "within",
    "without",
    "woman",
    "wonder",
    "wood",
    "word",
    "work",
    "world",
    "worry",
    "worse",
    "worth",
    "would",
    "write",
    "wrong",
    "year",
    "yes",
    "yesterday",
    "yet",
    "you",
    "young"
];
CommandCombine([
    {
        Tag: 'zonk',
        Description: ": zonk self",
        Action: () => {
            if (!triggerActivated)
                StartTriggerWord();
        }
    },
    {
        Tag: 'unzonk',
        Description: ": unzonk self",
        Action: () => {
            if (triggerActivated)
                TriggerRestoreTimeout();
        }
    }
]);
OnChat(1000, (data, sender, msg, metadata) => {
    var _a;
    var lowerMsgWords = parseMsgWords(msg);
    if (!hypnoActivated() &&
        !!Player.ClubGames.Hypno.trigger &&
        ((_a = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf(Player.ClubGames.Hypno.trigger)) !== null && _a !== void 0 ? _a : -1) >= 0 &&
        sender.MemberNumber != Player.MemberNumber)
        StartTriggerWord();
});
OnAction(1000, (data, sender, msg, metadata) => {
    var _a;
    var lowerMsgWords = parseMsgWords(msg);
    if (((_a = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("snaps")) !== null && _a !== void 0 ? _a : -1) >= 0 &&
        sender.MemberNumber != Player.MemberNumber &&
        hypnoActivated()) {
        TriggerRestoreSnap();
    }
});
OnActivity(1000, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
    if (!!target && target.MemberNumber == Player.MemberNumber) {
        if (data.Content == "ChatOther-ItemNose-Pet" && triggerActivated)
            TriggerRestoreBoop();
    }
});
function hypnoActivated() {
    return triggerActivated;
}
// Set Trigger
let wordLength = commonWords.length;
if (!Player.ClubGames.Hypno.trigger) {
    Player.ClubGames.Hypno.trigger = commonWords[getRandomInt(wordLength)];
    settingsSave();
}
if (!Player.ClubGames.Hypno.activatedAt) {
    Player.ClubGames.Hypno.activatedAt = 0;
    settingsSave();
}
if (!!Player.ClubGames.Hypno.existingEye1Name)
    ResetEyes();
let triggerTimeout = 0;
let triggerActivated = false;
let triggerTimer = 300000; // 5 min
let lingerInterval = setInterval(CheckNewTrigger, 5000); // check if need to reroll every 5s
let lingerTimer = 1800000; // 30min
let hornyTimeout = 0;
bcModSDK.hookFunction("Player.HasTints", 4, (args, next) => {
    if (triggerActivated)
        return true;
    return next(args);
});
bcModSDK.hookFunction("Player.GetTints", 4, (args, next) => {
    if (triggerActivated)
        return [{ r: 148, g: 0, b: 211, a: 0.4 }];
    return next(args);
});
bcModSDK.hookFunction("Player.GetBlurLevel", 4, (args, next) => {
    if (triggerActivated)
        return 3;
    return next(args);
});
const hypnoBlockStrings = [
    "%NAME%'s eyelids flutter as a thought tries to enter her blank mind...",
    "%NAME% sways weakly in her place, drifting peacefully...",
    "%NAME% trembles as something deep and forgotten fails to resurface...",
    "%NAME% moans softly as she drops even deeper into trance...",
    "%NAME% quivers, patiently awaiting something to fill her empty head..."
];
bcModSDK.hookFunction('ServerSend', 5, (args, next) => {
    // Prevent speech at choke level 4
    if (triggerActivated) {
        var type = args[0];
        if (type == "ChatRoomChat" && args[1].Type == "Chat") {
            SendAction(hypnoBlockStrings[getRandomInt(hypnoBlockStrings.length)]);
            return null;
        }
        return next(args);
    }
    return next(args);
});
function StartTriggerWord() {
    if (triggerActivated)
        return;
    triggerActivated = true;
    if (Player.ClubGames.Hypno.activatedAt == 0)
        Player.ClubGames.Hypno.activatedAt = new Date().getTime();
    AudioPlaySoundEffect("SciFiEffect", 1);
    settingsSave();
    SendAction("%NAME%'s eyes immediately unfocus, her posture slumping slightly as she loses control of her body at the utterance of a trigger word.");
    SetEyes();
    CharacterSetFacialExpression(Player, "Blush", "Medium");
    CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
    CharacterSetFacialExpression(Player, "Eyes", "Dazed");
    CharacterSetFacialExpression(Player, "Fluids", "DroolLow");
    clearTimeout(triggerTimeout);
    triggerTimeout = setTimeout(TriggerRestoreTimeout, triggerTimer);
    clearInterval(lingerInterval);
    lingerInterval = setInterval(CheckNewTrigger, 1000);
    clearInterval(hornyTimeout);
    hornyTimeout = setInterval(HypnoHorny, triggerTimer / 100);
}
function SetEyes() {
    var _a, _b, _c, _d;
    Player.ClubGames.Hypno.existingEye1Name = (_a = InventoryGet(Player, "Eyes")) === null || _a === void 0 ? void 0 : _a.Asset.Name;
    Player.ClubGames.Hypno.existingEye1Color = (_b = InventoryGet(Player, "Eyes")) === null || _b === void 0 ? void 0 : _b.Color;
    Player.ClubGames.Hypno.existingEye2Name = (_c = InventoryGet(Player, "Eyes2")) === null || _c === void 0 ? void 0 : _c.Asset.Name;
    Player.ClubGames.Hypno.existingEye2Color = (_d = InventoryGet(Player, "Eyes2")) === null || _d === void 0 ? void 0 : _d.Color;
    settingsSave();
    EnforceEyes();
}
function EnforceEyes() {
    var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes9");
    var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes9");
    var eyes1 = InventoryGet(Player, "Eyes");
    var eyes2 = InventoryGet(Player, "Eyes2");
    if (!!eyes1) {
        eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
        eyes1.Color = "#A2A2A2";
    }
    if (!!eyes2) {
        eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
        eyes2.Color = "#A2A2A2";
    }
    ChatRoomCharacterUpdate(Player);
}
function ResetEyes() {
    var _a, _b;
    var eyeAsset1 = AssetGet("Female3DCG", "Eyes", (_a = Player.ClubGames.Hypno.existingEye1Name) !== null && _a !== void 0 ? _a : "Eyes5");
    var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", (_b = Player.ClubGames.Hypno.existingEye2Name) !== null && _b !== void 0 ? _b : "Eyes5");
    var eyes1 = InventoryGet(Player, "Eyes");
    var eyes2 = InventoryGet(Player, "Eyes2");
    if (!!eyes1) {
        eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
        eyes1.Color = Player.ClubGames.Hypno.existingEye1Color;
    }
    if (!!eyes2) {
        eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
        eyes2.Color = Player.ClubGames.Hypno.existingEye2Color;
    }
    ChatRoomCharacterUpdate(Player);
    Player.ClubGames.Hypno.existingEye1Name = undefined;
    Player.ClubGames.Hypno.existingEye1Color = undefined;
    Player.ClubGames.Hypno.existingEye2Name = undefined;
    Player.ClubGames.Hypno.existingEye2Color = undefined;
    settingsSave();
}
function TriggerRestoreBoop() {
    SendAction("%NAME% reboots, blinking and gasping as she regains her senses.");
    TriggerRestore();
}
function TriggerRestoreSnap() {
    SendAction("%NAME% blinks, shaking her head with confusion as she regains her senses.");
    TriggerRestore();
}
function TriggerRestoreTimeout() {
    SendAction("%NAME% gasps, blinking with confusion and blushing.");
    TriggerRestore();
}
function TriggerRestore() {
    ResetEyes();
    AudioPlaySoundEffect("SpankSkin");
    CharacterSetFacialExpression(Player, "Eyes", "None");
    clearInterval(hornyTimeout);
    clearTimeout(triggerTimeout);
    triggerActivated = false;
}
function HypnoHorny() {
    var _a, _b;
    if (triggerActivated) {
        // enforce eye expression
        EnforceEyes();
        CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        var progress = Math.min(99, (_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0 + 5);
        ActivitySetArousal(Player, progress);
    }
}
function CheckNewTrigger() {
    if (triggerActivated)
        return;
    if (Player.ClubGames.Hypno.activatedAt > 0 && new Date().getTime() - Player.ClubGames.Hypno.activatedAt > lingerTimer)
        RollTriggerWord();
}
function RollTriggerWord() {
    SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over her.");
    Player.ClubGames.Hypno.trigger = commonWords[getRandomInt(commonWords.length)];
    Player.ClubGames.Hypno.activatedAt = 0;
    settingsSave();
}

CommandCombine([
    {
        Tag: 'tight',
        Description: ": tighten collar",
        Action: () => {
            IncreaseCollarChoke();
        }
    },
    {
        Tag: 'loose',
        Description: ": loosen collar",
        Action: () => {
            DecreaseCollarChoke();
        }
    }
]);
OnChat(600, (data, sender, msg, metadata) => {
    var _a, _b, _c;
    var lowerMsgWords = parseMsgWords(msg);
    if (!!sender && allowedChokeMembers.indexOf((_a = sender === null || sender === void 0 ? void 0 : sender.MemberNumber) !== null && _a !== void 0 ? _a : 0) >= 0) {
        if (((_b = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("tight")) !== null && _b !== void 0 ? _b : -1) >= 0)
            IncreaseCollarChoke();
        else if (((_c = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("loose")) !== null && _c !== void 0 ? _c : -1) >= 0)
            DecreaseCollarChoke();
    }
});
// Choke Collar Code
let allowedChokeMembers = [
    96251,
    60504
];
let chokeTimeout = 0;
let chokeTimer = 120000;
let chokeEventTimer = 60010;
let passout1Timer = 30000;
let passout2Timer = 15000;
let passout3Timer = 10000;
setInterval(ChokeEvent, chokeEventTimer);
Player.ClubGames.ChokeCollar.chokeLevel = Player.OnlineSettings.ClubGames.ChokeCollar.chokeLevel || 0;
settingsSave();
if (Player.ClubGames.ChokeCollar.chokeLevel > 2) {
    setChokeTimeout(DecreaseCollarChoke, chokeTimer);
}
function setChokeTimeout(f, delay) {
    clearTimeout(chokeTimeout);
    chokeTimeout = setTimeout(f, delay);
}
// event on room join
bcModSDK.hookFunction("ChatRoomSync", 4, (args, next) => {
    next(args);
    ActivateChokeEvent();
});
bcModSDK.hookFunction('ServerSend', 4, (args, next) => {
    // Prevent speech at choke level 4
    if (args[0] == "ChatRoomChat" && args[1].Type == "Chat") {
        if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
            SendAction("%NAME%'s mouth moves silently.");
            return null;
        }
        else if (Player.ClubGames.ChokeCollar.chokeLevel > 1) {
            args[1].Content = SpeechGarbleByGagLevel((Player.ClubGames.ChokeCollar.chokeLevel - 1) ** 2, args[1].Content);
            return next(args);
        }
        else
            return next(args);
    }
    else
        return next(args);
});
bcModSDK.hookFunction("Player.HasTints", 5, (args, next) => {
    if (Player.ClubGames.ChokeCollar.chokeLevel > 2)
        return true;
    return next(args);
});
bcModSDK.hookFunction("Player.GetTints", 5, (args, next) => {
    if (Player.ClubGames.ChokeCollar.chokeLevel == 3)
        return [{ r: 0, g: 0, b: 0, a: 0.2 }];
    else if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
        return [{ r: 0, g: 0, b: 0, a: 0.5 }];
    return next(args);
});
bcModSDK.hookFunction("Player.GetBlurLevel", 5, (args, next) => {
    if (Player.ClubGames.ChokeCollar.chokeLevel == 3)
        return 2;
    if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
        return 6;
    return next(args);
});
function IncreaseCollarChoke() {
    if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
        return;
    Player.ClubGames.ChokeCollar.chokeLevel++;
    AudioPlaySoundEffect("HydraulicLock");
    IncreaseArousal();
    if (Player.ClubGames.ChokeCollar.chokeLevel < 4) {
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        switch (Player.ClubGames.ChokeCollar.chokeLevel) {
            case 1:
                clearTimeout(chokeTimeout);
                SendAction("%NAME%'s eyes flutter as her collar starts to tighten around her neck with a quiet hiss.");
                CharacterSetFacialExpression(Player, "Blush", "Low");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 2:
                clearTimeout(chokeTimeout);
                SendAction("%NAME% gasps for air as her collar presses in around her neck with a hiss.");
                CharacterSetFacialExpression(Player, "Blush", "Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Surprised");
                break;
            case 3:
                setChokeTimeout(DecreaseCollarChoke, chokeTimer);
                SendAction("%NAME%'s face runs flush, choking as her collar hisses, barely allowing any air to her lungs.");
                CharacterSetFacialExpression(Player, "Blush", "High");
                CharacterSetFacialExpression(Player, "Eyes", "Scared");
                break;
        }
    }
    else if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
        Player.ClubGames.ChokeCollar.chokeLevel = 4;
        StartPassout();
    }
    settingsSave();
}
function DecreaseCollarChoke() {
    if (Player.ClubGames.ChokeCollar.chokeLevel <= 0) {
        Player.ClubGames.ChokeCollar.chokeLevel = 0;
        return;
    }
    AudioPlaySoundEffect("Deflation");
    Player.ClubGames.ChokeCollar.chokeLevel--;
    if (Player.ClubGames.ChokeCollar.chokeLevel > 0)
        setChokeTimeout(DecreaseCollarChoke, chokeTimer);
    switch (Player.ClubGames.ChokeCollar.chokeLevel) {
        case 3:
            setChokeTimeout(DecreaseCollarChoke, chokeTimer);
            SendAction("%NAME% chokes and gasps desperately as her collar slowly releases some pressure.");
            CharacterSetFacialExpression(Player, "Blush", "High");
            CharacterSetFacialExpression(Player, "Eyes", "Lewd");
            break;
        case 2:
            clearTimeout(chokeTimeout);
            SendAction("%NAME%'s collar opens a little as she lets out a moan, gulping for air.");
            CharacterSetFacialExpression(Player, "Blush", "Medium");
            CharacterSetFacialExpression(Player, "Eyes", "Sad");
            break;
        case 1:
            clearTimeout(chokeTimeout);
            SendAction("%NAME% whimpers thankfully as her collar reduces most of its pressure around her neck.");
            CharacterSetFacialExpression(Player, "Blush", "Low");
            CharacterSetFacialExpression(Player, "Eyes", "None");
            break;
        case 0:
            clearTimeout(chokeTimeout);
            SendAction("%NAME% takes a deep breath as her collar releases its grip with a hiss.");
            CharacterSetFacialExpression(Player, "Blush", "None");
            break;
    }
    settingsSave();
}
function ResetCollarChoke() {
    Player.ClubGames.ChokeCollar.chokeLevel = 0;
    clearTimeout(chokeTimeout);
    settingsSave();
}
function StartPassout() {
    SendAction("%NAME%'s eyes start to roll back, gasping and choking as her collar presses in tightly and completely with a menacing hiss.");
    CharacterSetFacialExpression(Player, "Blush", "VeryHigh");
    CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
    CharacterSetFacialExpression(Player, "Eyes", "Lewd");
    setChokeTimeout(Passout1, passout1Timer);
}
function Passout1() {
    IncreaseArousal();
    SendAction("%NAME% chokes and spasms, her collar holding tight.");
    CharacterSetFacialExpression(Player, "Blush", "Extreme");
    CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
    CharacterSetFacialExpression(Player, "Eyes", "Lewd");
    CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
    setChokeTimeout(Passout2, passout2Timer);
}
function Passout2() {
    IncreaseArousal();
    SendAction("%NAME% convulses weakly, her eyes rolling back as the collar hisses impossibly tighter.");
    AudioPlaySoundEffect("HydraulicLock");
    CharacterSetFacialExpression(Player, "Blush", "ShortBreath");
    CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
    CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
    CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
    setChokeTimeout(Passout3, passout3Timer);
}
function Passout3() {
    IncreaseArousal();
    SendAction("As %NAME% collapses unconscious, her collar releases all of its pressure with a long hiss.");
    AudioPlaySoundEffect("Deflation");
    CharacterSetFacialExpression(Player, "Blush", "Medium");
    CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
    CharacterSetFacialExpression(Player, "Eyes", "Closed");
    CharacterSetFacialExpression(Player, "Mouth", "Closed");
    clearTimeout(chokeTimeout);
    ResetCollarChoke();
}
function ChokeEvent() {
    // only activate 1/4 times triggered unless at high level
    if (Player.ClubGames.ChokeCollar.chokeLevel > 2)
        ActivateChokeEvent();
    else if (Player.ClubGames.ChokeCollar.chokeLevel == 2 && getRandomInt(8) == 0)
        ActivateChokeEvent();
    else if (Player.ClubGames.ChokeCollar.chokeLevel == 1 && getRandomInt(15) == 0)
        ActivateChokeEvent();
}
function ActivateChokeEvent() {
    const ChokeEvents = {
        low: [
            "%NAME% coughs as her collar pushes against her throat.",
            "%NAME% gulps as she feels the tight collar around her neck.",
            "%NAME% shifts nervously in her tight collar.",
            "%NAME% trembles, very conscious of the tight collar around her neck.",
            "%NAME% huffs uncomfortably in her tight collar."
        ],
        mid: [
            "%NAME% whimpers pleadingly as she struggles to take a full breath.",
            "%NAME% chokes against her collar, moaning softly.",
            "%NAME%'s eyes flutter weakly as her collar presses into her neck.",
            "%NAME% tries to focus on breathing, each inhale an effort in her collar."
        ],
        high: [
            "%NAME% splutters and chokes, struggling to breath.",
            "%NAME% grunts and moans, straining to breath.",
            "%NAME%'s eyes have trouble focusing, as she chokes and gets lightheaded."
        ]
    };
    switch (Player.ClubGames.ChokeCollar.chokeLevel) {
        case 1:
            SendAction(ChokeEvents.low[getRandomInt(ChokeEvents.low.length)]);
            break;
        case 2:
            SendAction(ChokeEvents.mid[getRandomInt(ChokeEvents.mid.length)]);
            break;
        case 3:
            SendAction(ChokeEvents.high[getRandomInt(ChokeEvents.high.length)]);
            break;
    }
}
function IncreaseArousal() {
    var _a, _b;
    ActivitySetArousal(Player, Math.min(99, (_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0 + 10));
}

OnActivity(100, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
    if (!!target &&
        target.MemberNumber == Player.MemberNumber &&
        data.Content == "ChatOther-ItemNose-Pet" &&
        !hypnoActivated()) {
        BoopReact(sender.MemberNumber);
    }
});
const normalBoopReactions = [
    "%NAME% wiggles her nose.",
    "%NAME% wiggles her nose with a small frown.",
    "%NAME% sneezes in surprise.",
    "%NAME% looks crosseyed at her nose.",
    "%NAME% wiggles her nose with a squeak.",
    "%NAME% meeps!"
];
const protestBoopReactions = [
    "%NAME% swats at %OPP_NAME%'s hand.",
    "%NAME% covers her nose protectively, squinting at %OPP_NAME%.",
    "%NAME% snatches %OPP_NAME%'s booping finger."
];
const bigProtestBoopReactions = [
    "%NAME%'s nose overloads and shuts down."
];
const boundBoopReactions = [
    "%NAME% struggles in her bindings, huffing.",
    "%NAME% frowns and squirms in her bindings.",
    "%NAME% whimpers in her bondage.",
    "%NAME% groans helplessly.",
    "%NAME% whines and wiggles in her bondage."
];
let boops = 0;
let boopShutdown = false;
setInterval(() => {
    if (boops > 0)
        boops--;
}, 5000);
function BoopReact(booperId) {
    if (boopShutdown || !booperId)
        return;
    let booper = ChatRoomCharacter.find(c => c.MemberNumber == booperId);
    if (!booper)
        return;
    boops++;
    if (boops >= 5)
        BigProtestBoopReact();
    else if (boops >= 3)
        ProtestBoopReact(booper);
    else
        NormalBoopReact();
}
function NormalBoopReact() {
    CharacterSetFacialExpression(Player, "Blush", "Low");
    SendAction(normalBoopReactions[getRandomInt(normalBoopReactions.length)]);
}
function ProtestBoopReact(booper) {
    CharacterSetFacialExpression(Player, "Blush", "Medium");
    CharacterSetFacialExpression(Player, "Eyes", "Daydream");
    if (Player.IsRestrained())
        SendAction(boundBoopReactions[getRandomInt(boundBoopReactions.length)]);
    else
        SendAction(protestBoopReactions[getRandomInt(protestBoopReactions.length)], booper.Nickname);
}
function BigProtestBoopReact(booper) {
    CharacterSetFacialExpression(Player, "Blush", "High");
    CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
    SendAction(bigProtestBoopReactions[getRandomInt(bigProtestBoopReactions.length)]);
    boopShutdown = true;
    setTimeout(() => boopShutdown = false, 30000);
}

OnActivity(100, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
    if (!!target &&
        sender.MemberNumber == Player.MemberNumber &&
        data.Content == "ChatOther-ItemLegs-Sit" &&
        CharacterCanChangeToPose(Player, "Kneel")) {
        CharacterSetActivePose(Player, "Kneel");
    }
});

OnActivity(100, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
    if (!!target &&
        target.MemberNumber == Player.MemberNumber) {
        if (wearingMask())
            return;
        switch (data.Content) {
            case "ChatOther-ItemNeck-Kiss":
                AddKissMark(sender, "neck");
                break;
            case "ChatOther-ItemMouth-PoliteKiss":
                AddKissMark(sender, "cheek");
                break;
            case "ChatOther-ItemHead-Kiss":
                AddKissMark(sender, "forehead");
                break;
        }
        var item = data.Dictionary.find((d) => d.Tag == "ActivityAsset");
        if (!!item && item.AssetName == "Towel") {
            switch (data.Content) {
                case "ChatOther-ItemHood-RubItem":
                case "ChatSelf-ItemHood-RubItem":
                    RemoveKissMark("forehead");
                    break;
                case "ChatOther-ItemMouth-RubItem":
                case "ChatSelf-ItemMouth-RubItem":
                    RemoveKissMark("cheek");
                    break;
                case "ChatOther-ItemNeck-RubItem":
                case "ChatSelf-ItemNeck-RubItem":
                    RemoveKissMark("neck");
                    break;
            }
        }
    }
});
function getKisserLipColor(sender) {
    try {
        var mouth = InventoryGet(sender, "Mouth");
        if (!!mouth && mouth.Color && mouth.Color != "Default")
            return mouth.Color;
        else
            return "Default";
    }
    catch (_a) {
        return "Default";
    }
}
function getExistingLipstickMarks() {
    var mask = InventoryGet(Player, "Mask");
    if (!!mask && mask.Asset.Name == "Kissmark")
        return mask;
    else
        return null;
}
function addLipstickMarks() {
    var _a;
    InventoryRemove(Player, "Mask");
    InventoryWear(Player, "Kissmark", "Mask", "Default", 1, (_a = Player.MemberNumber) !== null && _a !== void 0 ? _a : 0, null, true);
    var marks = InventoryGet(Player, "Mask");
    if (!!marks && !!marks.Property)
        marks.Property.Type = "c0r1f0n0l0";
    return marks;
}
function wearingMask() {
    var mask = InventoryGet(Player, "Mask");
    if (!!mask && mask.Asset.Name != "Kissmark")
        return true;
    return false;
}
function getKissMarkStatus(typeString) {
    return {
        cheek1: typeString.substring(1, 2) == '1',
        cheek2: typeString.substring(3, 4) == '0',
        forehead: typeString.substring(5, 6) == '1',
        neck1: typeString.substring(7, 8) == '1',
        neck2: typeString.substring(9, 10) == '1'
    };
}
function getKissMarkTypeString(status) {
    return "c" + (status.cheek1 ? "1" : "0") +
        "r" + (status.cheek2 ? "0" : "1") +
        "f" + (status.forehead ? "1" : "0") +
        "n" + (status.neck1 ? "1" : "0") +
        "l" + (status.neck2 ? "1" : "0");
}
function RemoveKissMark(location) {
    var _a, _b;
    var marks = getExistingLipstickMarks();
    if (!marks)
        return;
    var status = getKissMarkStatus((_b = (_a = marks === null || marks === void 0 ? void 0 : marks.Property) === null || _a === void 0 ? void 0 : _a.Type) !== null && _b !== void 0 ? _b : "c0r1f0n0l0");
    switch (location) {
        case "cheek":
            status.cheek1 = false;
            status.cheek2 = false;
            break;
        case "forehead":
            status.forehead = false;
            break;
        case "neck":
            status.neck1 = false;
            status.cheek2 = false;
            break;
    }
    if (!!marks && !!marks.Property)
        marks.Property.Type = getKissMarkTypeString(status);
    ChatRoomCharacterUpdate(Player);
}
function AddKissMark(sender, location) {
    var _a, _b;
    var color = getKisserLipColor(sender);
    if (color == "Default")
        return; // No lipstick
    var marks = getExistingLipstickMarks();
    if (!marks)
        marks = addLipstickMarks();
    if (!marks)
        return;
    marks.Color = color;
    var status = getKissMarkStatus((_b = (_a = marks === null || marks === void 0 ? void 0 : marks.Property) === null || _a === void 0 ? void 0 : _a.Type) !== null && _b !== void 0 ? _b : "c0r1f0n0l0");
    // Adjust marks
    switch (location) {
        case "cheek":
            if (!status.cheek1)
                status.cheek1 = true;
            else
                status.cheek2 = true;
            CharacterSetFacialExpression(Player, "Blush", "Low");
            break;
        case "forehead":
            status.forehead = true;
            CharacterSetFacialExpression(Player, "Blush", "Low");
            break;
        case "neck":
            if (!status.neck1)
                status.neck1 = true;
            else
                status.cheek2 = true;
            CharacterSetFacialExpression(Player, "Blush", "Medium");
            break;
    }
    if (!!marks && !!marks.Property)
        marks.Property.Type = getKissMarkTypeString(status);
    ChatRoomCharacterUpdate(Player);
}
