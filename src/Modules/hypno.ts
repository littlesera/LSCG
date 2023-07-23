import { BaseModule } from 'base';
import { HypnoSettingsModel } from 'Settings/Models/hypno';
import { ModuleCategory, Subscreen } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, OnAction, OnActivity, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, callOriginal, setOrIgnoreBlush, isAllowedMember, isPhraseInString, GetTargetCharacter, GetDelimitedList, GetActivityEntryFromContent, escapeRegExp, IsActivityAllowed } from '../utils';
import { GuiHypno } from 'Settings/hypno';
import { ActivityModule } from './activities';
import { getModule } from 'modules';
import { ActivityEntryModel } from 'Settings/Models/activities';

export class HypnoModule extends BaseModule {
    get settings(): HypnoSettingsModel {
        return super.settings as HypnoSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiHypno;
    }

    get defaultSettings(){
        return <HypnoSettingsModel>{
            enabled: false,
            activatedAt: 0,
            recoveredAt: 0,
            cycleTime: 30,
            enableCycle: true,
            triggerCycled: true,
            overrideMemberIds: "",
            overrideWords: "",
            allowLocked: false,
            remoteAccess: false,
            remoteAccessRequiredTrance: true,
            allowRemoteModificationOfMemberOverride: false,
            cooldownTime: 0,
            enableArousal: false,
            immersive: false,
            trigger: "",
            triggerTime: 5,
            locked: false,
            awakeners: "",
            hypnotized: false,
            hypnotizedBy: -1,
            limitRemoteAccessToHypnotizer: false,
            stats: {}
        };
    }

    safeword(): void {
        this._resetHypno();
    }

    load(): void {
        OnAction(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            var lowerMsgWords = parseMsgWords(msg);
            if ((lowerMsgWords?.indexOf("snaps") ?? -1) >= 0 && 
                sender?.MemberNumber != Player.MemberNumber &&
                this.hypnoActivated) {
                this.TriggerRestoreSnap();
            }
        });
        
        OnActivity(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = GetTargetCharacter(data);
            if (!!target && target == Player.MemberNumber) {
                let activityEntry = GetActivityEntryFromContent(data.Content);
                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
                    return;
                if (activityEntry?.awakener && this.hypnoActivated && !sender?.IsPlayer())
                    this.TriggerRestoreBoop();
                // Special tummy rub hypno action for Bean
                else if (activityEntry?.hypno && !this.hypnoActivated && !this.IsOnCooldown() && (Player.ArousalSettings?.Progress ?? 0) >= activityEntry.hypnoThreshold) {
                    this.DelayedTrigger(activityEntry, sender?.MemberNumber);
                }
            }
        });

        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            if (!this.Enabled)
                return;
            
            if (this.hypnoActivated) {
                this.CheckHypnotizedState();
                SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
            }
        }, ModuleCategory.Hypno);

        hookFunction("SpeechGarble", 2, (args, next) => {
            if (!this.Enabled)
                return next(args);

            const C = args[0] as Character;

            // Check for non-garbled trigger word, this means a trigger word could be set to what garbled speech produces >.>
            let msg = callOriginal("SpeechGarble", args);
            if (this.CheckTrigger(msg, C) && !this.IsOnCooldown()) {
                args[1] = this.BlankOutTriggers(args[1]);
                this.StartTriggerWord(true, C.MemberNumber);
                return next(args);
            }

            if (this.hypnoActivated) {
                var lowerMsg = args[1].toLowerCase();
                var names = [CharacterNickname(Player)];
                if (!!Player.Name && names.indexOf(Player.Name) == -1)
                    names.push(Player.Name);
                if (names.some(n => isPhraseInString(lowerMsg, n)) || this.settings.hypnotizedBy == C.MemberNumber || C.MemberNumber == Player.MemberNumber) {
                    args[1] = this.BlankOutTriggers(args[1]);
                    if (this.CheckAwakener(msg, C)) {
                        this.TriggerRestoreWord(C);
                    }
                }
                else
                    args[1] =  args[1].replace(/\S/gm, '-');
            }
            
            return next(args);
        }, ModuleCategory.Hypno);

        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hypnoActivated) return true;
            return next(args);
        }, ModuleCategory.Hypno);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.hypnoActivated) return [{r: 148, g: 0, b: 211, a: 0.4}];
            return next(args);
        }, ModuleCategory.Hypno);
            
        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.Enabled || !Player.GraphicsSettings?.AllowBlur)
                return next(args);
            if (this.hypnoActivated) return 3;
            return next(args);
        }, ModuleCategory.Hypno);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.settings.enabled && this.settings.immersive && this.hypnoActivated)
                return false;
            return next(args);
        }, ModuleCategory.Hypno);

        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.Enabled)
                return next(args);
            // Prevent speech at choke level 4
            if (this.hypnoActivated) {
                var type = args[0];
                if (type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "("){
                    SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
                    return null;
                }
                return next(args);
            }
            return next(args);
        }, ModuleCategory.Hypno);

        let lastHornyCheck = 0;
        let lastCycleCheck = 0;
        hookFunction('TimerProcess', 1, (args, next) => {
            if (ActivityAllowed()) {
                var now = CommonTime();
                let triggerTimer = (this.settings.triggerTime ?? 5) * 60000;
                let hypnoEnd = this.settings.activatedAt + triggerTimer;
                let hornyCheck = lastHornyCheck + Math.min((triggerTimer/100), 30000); // Check for arousal and eyes at least every 30 seconds. More often if hypnosis length is short.
                if (triggerTimer <= 0)
                    hornyCheck = lastHornyCheck + 30000;
                if (this.hypnoActivated && this.settings.triggerTime > 0 && hypnoEnd < now) {
                    // Hypno Timeout --
                    this.TriggerRestoreTimeout();
                }
                if (this.hypnoActivated && hornyCheck < now) {
                    lastHornyCheck = now;
                    this.HypnoHorny();
                }
                if (!this.hypnoActivated && (lastCycleCheck + 5000) < now) {
                    lastCycleCheck = now;
                    this.CheckNewTrigger();
                }
            }
            return next(args);
        }, ModuleCategory.Injector);

        // Set Trigger
        if (!this.settings.trigger) {
            this.settings.trigger = this.getNewTriggerWord();
            settingsSave();
        }
        if (!this.settings.activatedAt) {
            this.settings.activatedAt = 0;
            this.settings.recoveredAt = 0;
            settingsSave();
        }
        if (!!this.settings.existingEye1Name)
            this.ResetEyes();
    }

    initializeTriggerWord() {
        var recycleFromCommon = !this.settings.overrideWords && (!this.settings.trigger || commonWords.indexOf(this.settings.trigger) == -1);
        if (recycleFromCommon) {
            this.settings.trigger = this.getNewTriggerWord();
            settingsSave();
        }
        else if (!!this.settings.overrideWords) {
            var words = this.settings.overrideWords.split(',').filter(word => !!word).map(word => word.toLocaleLowerCase());
            if (words.indexOf(this.settings.trigger) == -1)
                this.settings.trigger = this.getNewTriggerWord();
            settingsSave();
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Hypno);
    }

    get awakeners(): string[] {
        return GetDelimitedList(this.settings.awakeners);
    }

    get triggers(): string[] {
        var overrideWords = GetDelimitedList(this.settings.overrideWords);
        if (overrideWords.length > 0 && !this.settings.enableCycle)
            return overrideWords;
        else
            return [this.settings.trigger];
    }

    getNewTriggerWord(): string {
        var currentTrigger = this.settings.trigger;
        var words = GetDelimitedList(this.settings.overrideWords)?.filter((word, ix, arr) => !!word && arr.indexOf(word) == ix) ?? [];
        if (words.length <= 0)
            words = commonWords;

        if (words.length > 1 && words.indexOf(currentTrigger) > -1)
            words = words.filter(val => val != currentTrigger);

        return words[getRandomInt(words.length)]?.toLocaleLowerCase();
    }

    allowedSpeaker(speaker: Character | undefined): boolean {
        if (speaker?.MemberNumber == Player.MemberNumber)
            return false;
        var memberId = speaker?.MemberNumber ?? 0;
        var allowedMembers = GetDelimitedList(this.settings.overrideMemberIds).map(id => +id).filter(id => id > 0) ?? [];
        if (allowedMembers.length <= 0)
            return isAllowedMember(speaker);
        else return allowedMembers.includes(memberId);
    }

    BlankOutTriggers(msg: string) {
        if (!this.settings.immersive)
            return msg;

        let triggers = this.triggers.concat(this.awakeners);
        triggers.forEach(t => {
            let tWords = t.split(" ");
            tWords = tWords.map(tw => {
                let hashLength = Math.max(3, tw.length) + (getRandomInt(4) - 2);
                return new Array(hashLength + 1).join('-');
            });
            let str = "⚠" + tWords.join(" ") + "⚠";

            msg = msg.replaceAll(new RegExp("\\b" + escapeRegExp(t) + "\\b", "ig"), str);
        });
        return msg;
    }

    hypnoBlockStrings = [
        "%NAME%'s eyelids flutter as a thought tries to enter %POSSESSIVE% blank mind...",
        "%NAME% sways weakly in %POSSESSIVE% place, drifting peacefully...",
        "%NAME% trembles as something deep and forgotten fails to resurface...",
        "%NAME% moans softly as %PRONOUN% drops even deeper into trance...",
        "%NAME% quivers, patiently awaiting something to fill %POSSESSIVE% empty head..."
    ];

    delayedHypnoStrings = [
        "%NAME%'s eyes flutter as %PRONOUN% fights to keep control of %POSSESSIVE% senses...",
        "%NAME% whimpers and struggles to stay awake...",
        "%NAME% can feel %POSSESSIVE% eyelids grow heavy as %PRONOUN% drifts on the edge of trance...",
        "%NAME% lets out a low moan as %POSSESSIVE% muscles relax and %PRONOUN% starts to drop..."
    ];

    delayedActivations: Map<string, number> = new Map<string,number>();

    DelayedTrigger(activityEntry: ActivityEntryModel, memberNumber: number = 0) {
        let entryName = activityEntry.group + "-" + activityEntry.name;
        
        setTimeout(() => {
            let activation = this.delayedActivations.get(entryName);
            if (!!activation) {
                activation = Math.max(0, activation - 1);
                this.delayedActivations.set(entryName, activation);
            }
        }, 5 * 60 * 1000);
        
        let count = this.delayedActivations.get(entryName) ?? 0;
        count++;
        if (count >= activityEntry.hypnoRequiredRepeats) {
            SendAction("%NAME% trembles weakly with one last attempt to maintain %POSSESSIVE% senses...");
            setTimeout(() => this.StartTriggerWord(false, memberNumber), 4000);
        }
        else
            SendAction(this.delayedHypnoStrings[getRandomInt(this.delayedHypnoStrings.length)]);
        this.delayedActivations.set(entryName, count);
    }

    CheckAwakener(msg: string, sender: Character) {
        return this._CheckForTriggers(msg, sender, this.awakeners, true);
    }

    CheckTrigger(msg: string, sender: Character): boolean {
        return this._CheckForTriggers(msg, sender, this.triggers);
    }

    _CheckForTriggers(msg: string, sender: Character, triggers: string[], awakener: boolean = false) {
        // Skip on OOC
        if (msg.startsWith("(") || !triggers)
            return false;

        let matched = triggers.some(trigger => {
            return isPhraseInString(msg, trigger);
        })        

        return (matched && 
            (awakener ? this.hypnoActivated : !this.hypnoActivated) &&
            this.allowedSpeaker(sender))
    }

    IsOnCooldown(): boolean {
        var now = new Date().getTime();
        if ((now - (this.settings.cooldownTime * 1000)) < this.settings.recoveredAt) {
            // Triggered during cooldown...
            if (!this.cooldownMsgSent){
                SendAction("%NAME%'s frowns as %PRONOUN% fights to remain conscious.");
                this.cooldownMsgSent = true;
            }
            return true;
        }
        return false;
    }

    StartTriggerWord(wasWord: boolean = true, memberNumber: number = 0) {
        if (this.hypnoActivated)
            return;

        this.cooldownMsgSent = false;
        this.settings.hypnotizedBy = memberNumber;
        this.settings.activatedAt = CommonTime();
        this.settings.triggerCycled = false;
        if (!AudioShouldSilenceSound(true))
            AudioPlaySoundEffect("SciFiEffect", 1);
        this.hypnoActivated = true;
        this.settings.stats.hypnotizedCount++;

        if (wasWord)
            SendAction("%NAME%'s eyes immediately unfocus, %POSSESSIVE% posture slumping slightly as %PRONOUN% loses control of %POSSESSIVE% body at the utterance of a trigger word.");
        else
            SendAction("%NAME%'s eyes glaze over, %POSSESSIVE% posture slumping weakly as %PRONOUN% loses control of %POSSESSIVE% body.");
        
        this.SetEyes();
        this.CheckHypnotizedState();
    }

    CheckHypnotizedState() {
        if (this.hypnoActivated) {
            this.EnforceEyes();
            setOrIgnoreBlush("Medium");
            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
            CharacterSetFacialExpression(Player, "Fluids", "DroolLow");    
            CharacterSetFacialExpression(Player, "Mouth", null);   
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

    TriggerRestoreWord(speaker: Character) {
        SendAction("%NAME% snaps back into their senses at %OPP_NAME%'s voice.", speaker);
        this.TriggerRestore();
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
        SendAction("%NAME% gasps, blinking and blushing with confusion.");
        this.TriggerRestore();
    }

    TriggerRestore() {        
        if (!AudioShouldSilenceSound(true))
            AudioPlaySoundEffect("SpankSkin");
        this._resetHypno();
    }

    _resetHypno() {
        this.ResetEyes();
        CharacterSetFacialExpression(Player, "Eyes", null);
        this.hypnoActivated = false;
        this.settings.recoveredAt = new Date().getTime();
        settingsSave(true);
    }

    HypnoHorny() {
        if (this.hypnoActivated) {
            // enforce eye expression
            this.EnforceEyes();
            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");

            if (this.settings.enableArousal) {
                var progress = Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + 5);
                ActivitySetArousal(Player, progress);
            }
        }
    }

    CheckNewTrigger() {
        if (this.hypnoActivated || !this.settings.enableCycle || this.settings.triggerCycled)
            return;
        var cycleAtTime = Math.max(this.settings.activatedAt, this.settings.recoveredAt) + (Math.max(1, this.settings.cycleTime || 0) * 60000)
        if (cycleAtTime < CommonTime())
            this.RollTriggerWord();
    }

    RollTriggerWord() {
        var newTrigger = this.getNewTriggerWord();
        if (newTrigger != this.settings.trigger)
            SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over %POSSESSIVE%.");
        this.settings.trigger = newTrigger;
        this.settings.triggerCycled = true;
        settingsSave();
    }

    cooldownMsgSent = false;
    get hypnoActivated(): boolean {
        return this.settings.hypnotized;
    }
    set hypnoActivated(val) {
        this.settings.hypnotized = val;
        settingsSave(true);
    }
}

// Trigger Words
const commonWords = [ "able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young" ];



// ****************** Functions *****************

//let triggerActivated = false;
//let triggeredBy = 0;