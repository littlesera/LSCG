import { BaseModule } from 'base';
import { HypnoSettingsModel } from 'Settings/Models/hypno';
import { ModuleCategory } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, OnChat, OnAction, OnActivity, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, callOriginal, setOrIgnoreBlush } from '../utils';

export class HypnoModule extends BaseModule {
    get settings(): HypnoSettingsModel {
		return super.settings as HypnoSettingsModel;
	}

    load(): void {
        CommandCombine([
            {
                Tag: 'zonk',
                Description: ": zonk self",
        
                Action: () => {
                    if (!triggerActivated)
                        this.StartTriggerWord(true, Player.MemberNumber);
                }
            },
            {
                Tag: 'unzonk',
                Description: ": unzonk self",
                Action: () => {
                    if (triggerActivated)
                        this.TriggerRestoreTimeout();
                }
            },
            {
                Tag: "show-trigger",
                Description: ": reveal your current trigger word(s)",
                Action: () => {
                    ChatRoomSendLocal("Your current triggers are: " + this.triggers);
                }
            },
            {
                Tag: "cycle-trigger",
                Description: ": force cycle to a new trigger word",
                Action: () => {
                    this.RollTriggerWord();
                }
            }
        ]);
        
        // OnChat(1000, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
        //     if (!this.Enabled)
        //         return;
        //     var lowerMsgWords = parseMsgWords(msg) ?? [];
        //     if (!hypnoActivated() && 
        //         !!this.triggers && 
        //         lowerMsgWords.filter(v => this.triggers.includes(v)).length > 0 && 
        //         sender?.MemberNumber != Player.MemberNumber &&
        //         this.allowedSpeaker(sender?.MemberNumber ?? 0))
        //         this.StartTriggerWord(true, sender?.MemberNumber);
        // });

        OnAction(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            var lowerMsgWords = parseMsgWords(msg);
            if ((lowerMsgWords?.indexOf("snaps") ?? -1) >= 0 && 
                sender?.MemberNumber != Player.MemberNumber &&
                hypnoActivated()) {
                this.TriggerRestoreSnap();
            }
        });
        
        OnActivity(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
            if (!!target && target.MemberNumber == Player.MemberNumber) {
                if (data.Content == "ChatOther-ItemNose-Pet" && triggerActivated)
                    this.TriggerRestoreBoop();
                else if (data.Content == "ChatOther-ItemPelvis-MassageHands" && !triggerActivated && Player.MemberNumber == 71233) {
                    this.DelayedTriggerWord(sender?.MemberNumber);
                }
            }
        });

        hookFunction("SpeechGarble", 2, (args, next) => {
            if (!this.Enabled)
                return next(args);

            const C = args[0] as Character;

            // Check for non-garbled trigger word, this means a trigger word could be set to what garbled speech produces >.>
            if (!triggerActivated && !args[2]) {
                let msg = callOriginal("SpeechGarble", args);
                if (this.CheckTrigger(msg, C))
                    this.StartTriggerWord(true, C.MemberNumber);
                return next(args);
            }

            var lowerMsg = args[1].toLowerCase();
            var names = [Player.Name.toLowerCase(), Player.Nickname?.toLowerCase() ?? Player.Name];
            if (names.some(n => lowerMsg.indexOf(n) > -1) || triggeredBy == C.MemberNumber || C.MemberNumber == Player.MemberNumber)
                args[1] = args[1];
            else
                args[1] =  args[1].replace(/\S/gm, '-');
            return next(args);
        }, ModuleCategory.Hypno);

        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (triggerActivated) return true;
            return next(args);
        }, ModuleCategory.Hypno);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.Enabled)
                return next(args);
            if (triggerActivated) return [{r: 148, g: 0, b: 211, a: 0.4}];
            return next(args);
        }, ModuleCategory.Hypno);
            
        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled)
                return next(args);
            if (triggerActivated) return 3;
            return next(args);
        }, ModuleCategory.Hypno);

        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.Enabled)
                return next(args);
            // Prevent speech at choke level 4
            if (triggerActivated) {
                var type = args[0];
                if (type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "("){
                    SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
                    return null;
                }
                return next(args);
            }
            return next(args);
        }, ModuleCategory.Hypno);

        // Set Trigger
        if (!this.settings.trigger) {
            this.settings.trigger = this.getNewTriggerWord();
            settingsSave();
        }
        if (!this.settings.activatedAt) {
            this.settings.activatedAt = 0;
            settingsSave();
        }
        if (!!this.settings.existingEye1Name)
            this.ResetEyes();

        this.lingerInterval = setInterval(() => this.CheckNewTrigger(), 5000);
    }

    initializeTriggerWord() {
        if (!this.settings.trigger) {
            this.settings.trigger = this.getNewTriggerWord();
            settingsSave();
        }
        else if (this.settings.overrideWords) {
            var words = this.settings.overrideWords.split(',').filter(word => !!word).map(word => word.toLocaleLowerCase());
            if (words.indexOf(this.settings.trigger) == -1)
                this.settings.trigger = this.getNewTriggerWord();
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Hypno);
    }

    triggerTimeout: number = 0;
    triggerTimer: number = 300000; // 5 min
    lingerInterval: number = 0; // check if need to reroll every 5s    
    hornyTimeout: number = 0;

    get triggers(): string[] {
        var overrideWords = this.settings.overrideWords?.split(",")?.filter(word => !!word).map(word => word.toLocaleLowerCase()) ?? [];
        if (overrideWords.length > 0 && !this.settings.enableCycle)
            return overrideWords;
        else
            return [this.settings.trigger];
    }

    getNewTriggerWord(): string {
        var words = this.settings.overrideWords?.split(",")?.filter(word => !!word) ?? [];
        if (words.length <= 0)
            words = commonWords;
        return words[getRandomInt(words.length)]?.toLocaleLowerCase();
    }

    allowedSpeaker(memberId: number): boolean {
        var allowedMembers = this.settings.overrideMemberIds?.split(",").map(id => +id).filter(id => id > 0) ?? [];
        if (allowedMembers.length <= 0)
            return true;
        else return allowedMembers.includes(memberId);
    }

    hypnoBlockStrings = [
        "%NAME%'s eyelids flutter as a thought tries to enter %POSSESSIVE% blank mind...",
        "%NAME% sways weakly in %POSSESSIVE% place, drifting peacefully...",
        "%NAME% trembles as something deep and forgotten fails to resurface...",
        "%NAME% moans softly as %PRONOUN% drops even deeper into trance...",
        "%NAME% quivers, patiently awaiting something to fill %POSSESSIVE% empty head..."
    ];

    DelayedTriggerWord(memberNumber: number = 0) {
        SendAction("%NAME%'s eyes flutter as %PRONOUN% fights to keep control of %POSSESSIVE% senses...");
        setTimeout(() => this.StartTriggerWord(false, memberNumber), 4000);
    }

    CheckTrigger(msg: string, sender: Character): boolean {
        var lowerMsgWords = parseMsgWords(msg) ?? [];
        return (!hypnoActivated() && 
            !!this.triggers && 
            lowerMsgWords.filter(v => this.triggers.includes(v)).length > 0 && 
            sender?.MemberNumber != Player.MemberNumber &&
            this.allowedSpeaker(sender?.MemberNumber ?? 0))
    }

    StartTriggerWord(wasWord: boolean = true, memberNumber: number = 0) {
        if (triggerActivated)
            return;

        triggerActivated = true;
        triggeredBy = memberNumber;
        if (this.settings.activatedAt == 0)
            this.settings.activatedAt = new Date().getTime();
        AudioPlaySoundEffect("SciFiEffect", 1);
        settingsSave();
        
        if (wasWord)
            SendAction("%NAME%'s eyes immediately unfocus, %POSSESSIVE% posture slumping slightly as %PRONOUN% loses control of %POSSESSIVE% body at the utterance of a trigger word.");
        else
            SendAction("%NAME%'s eyes glaze over, %POSSESSIVE% posture slumping weakly as %PRONOUN% loses control of %POSSESSIVE% body.");
        
        this.SetEyes();
        setOrIgnoreBlush("Medium");
        CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        CharacterSetFacialExpression(Player, "Fluids", "DroolLow");    
        CharacterSetFacialExpression(Player, "Mouth", null);    

        if (this.settings.triggerTime > 0) {
            let triggerTimer = (this.settings.triggerTime ?? 5) * 60000;

            clearTimeout(this.triggerTimeout);
            this.triggerTimeout = setTimeout(() => this.TriggerRestoreTimeout(), triggerTimer);
            clearInterval(this.hornyTimeout);
            this.hornyTimeout = setInterval(() => this.HypnoHorny(), triggerTimer / 100);
        } else {
            clearInterval(this.hornyTimeout);
            this.hornyTimeout = setInterval(() => this.HypnoHorny(), 10000);
        }
    }

    SetEyes() {
        this.settings.existingEye1Name = InventoryGet(Player, "Eyes")?.Asset.Name;
        this.settings.existingEye1Color = InventoryGet(Player, "Eyes")?.Color;
        this.settings.existingEye2Name = InventoryGet(Player, "Eyes2")?.Asset.Name;
        this.settings.existingEye2Color = InventoryGet(Player, "Eyes2")?.Color;
        this.settings.existingEyeExpression = WardrobeGetExpression(Player)?.Eyes ?? null;
        settingsSave();
        this.EnforceEyes();
    }

    EnforceEyes() {
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes9");
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes9");

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        if (!!eyes1) {
            eyes1.Asset = eyeAsset1 ?? <Asset>{};
            eyes1.Color = "#A2A2A2";
        }    
        if (!!eyes2) {
            eyes2.Asset = eyeAsset2  ?? <Asset>{};
            eyes2.Color = "#A2A2A2";
        }

        ChatRoomCharacterUpdate(Player);
    }

    ResetEyes() {
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", this.settings.existingEye1Name ?? "Eyes5");
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", this.settings.existingEye2Name ?? "Eyes5");

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        if (!!eyes1) {
            eyes1.Asset = eyeAsset1 ?? <Asset>{};
            eyes1.Color = this.settings.existingEye1Color;
        }    
        if (!!eyes2) {
            eyes2.Asset = eyeAsset2  ?? <Asset>{};
            eyes2.Color = this.settings.existingEye2Color;
        }

        CharacterSetFacialExpression(Player, "Eyes", this.settings.existingEyeExpression ?? null);

        ChatRoomCharacterUpdate(Player);

        this.settings.existingEye1Name = undefined;
        this.settings.existingEye1Color = undefined;
        this.settings.existingEye2Name = undefined;
        this.settings.existingEye2Color = undefined;
        settingsSave();
    }

    TriggerRestoreBoop() {
        SendAction("%NAME% reboots, blinking and gasping as %PRONOUN% regains %POSSESSIVE% senses.");
        this.TriggerRestore();
    }

    TriggerRestoreSnap() {
        SendAction("%NAME% blinks, shaking %POSSESSIVE% head with confusion as %PRONOUN% regains %POSSESSIVE% senses.");
        this.TriggerRestore();
    }

    TriggerRestoreTimeout() {
        SendAction("%NAME% gasps, blinking with confusion and blushing.");
        this.TriggerRestore();
    }

    TriggerRestore() {
        this.ResetEyes();
        AudioPlaySoundEffect("SpankSkin");
        CharacterSetFacialExpression(Player, "Eyes", "None");
        clearInterval(this.hornyTimeout);
        clearTimeout(this.triggerTimeout);
        triggerActivated = false;
    }

    HypnoHorny() {
        if (triggerActivated) {
            // enforce eye expression
            this.EnforceEyes();
            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");

            var progress = Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + 5);
            ActivitySetArousal(Player, progress);
        }
    }

    CheckNewTrigger() {
        if (triggerActivated || !this.settings.enableCycle)
            return;
        if (this.settings.activatedAt > 0 && new Date().getTime() - this.settings.activatedAt > (Math.max(1, this.settings.cycleTime || 0) * 60000))
            this.RollTriggerWord();
    }

    RollTriggerWord() {
        SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over %POSSESSIVE%.");
        this.settings.trigger = this.getNewTriggerWord();
        this.settings.activatedAt = 0;
        settingsSave();
    }
}

// Trigger Words
const commonWords = [ "able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young" ];



// ****************** Functions *****************

let triggerActivated = false;
let triggeredBy = 0;
export function hypnoActivated() {
    return triggerActivated;
}