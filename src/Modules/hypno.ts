import { BaseModule } from 'base';
import { HypnoInfluence, HypnoSettingsModel, LSCGHypnoInstruction } from 'Settings/Models/hypno';
import { ModuleCategory, Subscreen } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, OnAction, OnActivity, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, callOriginal, setOrIgnoreBlush, isAllowedMember, isPhraseInString, GetTargetCharacter, GetDelimitedList, GetActivityEntryFromContent, escapeRegExp, IsActivityAllowed, LSCG_SendLocal, getCharacter, sendLSCGCommandBeep, htmlToElement, OnChat, getDominance } from '../utils';
import { GuiHypno } from 'Settings/hypno';
import { getModule } from 'modules';
import { ActivityEntryModel } from 'Settings/Models/activities';
import { InjectorModule } from './injector';
import { StateModule } from './states';
import { CommandListener, CoreModule } from './core';
import { ActivitySelection, ClothingSelection, PoseSelection } from 'Settings/Remote/suggestions';

export class HypnoInstruction {
    constructor(type: LSCGHypnoInstruction) {
        this.type = type;
        this.arguments = {};
    }
    type: LSCGHypnoInstruction = LSCGHypnoInstruction.none;
    arguments: any = {};
}
export class HypnoSuggestion {
    constructor(name: string) {
        this.id = `suggestion-${new Date().getTime()}`;
        this.name = name;
        this.installedBy = Player.MemberNumber ?? -1;
        this.installedByName = Player.Name ?? "";
    }
    id: string = "";
    name: string = "";
    trigger: string = "";
    installedBy: number = -1;
    installedByName: string = "";
    exclusive: boolean = false;
    instructions: HypnoInstruction[] = [];
}

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
            trigger: "",
            triggerRevealed: false,
            triggerTime: 5,
            locked: false,
            awakeners: "",
            limitRemoteAccessToHypnotizer: false,
            hypnoEyeColor: "#A2A2A2",
            hypnoEyeType: 9,
            speakTriggers: "",
            silenceTriggers: "",
            stats: {},
            influence: <HypnoInfluence[]>[],
            suggestions: <HypnoSuggestion[]>[]
        };
    }

    safeword(): void {
        this.StateModule.HypnoState.Recover();
    }

    get StateModule(): StateModule {
        return getModule<StateModule>("StateModule");
    }

    get commands(): ICommand[] {
        return [{
			Tag: 'zonk',
			Description: ": Hypnotize yourself",
			Action: () => {
				if (!this.Enabled)
					return;

				if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("/zonk disabled while immersive", 5000);
					return;
				}
				if (!this.hypnoActivated)
					this.StartTriggerWord(true, Player.MemberNumber);
			}
		}, {
			Tag: 'unzonk',
			Description: ": Awaken yourself",
			Action: () => {
				if (!this.Enabled)
					return;

				if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("/unzonk disabled while immersive", 5000);
					return;
				}
				if (this.hypnoActivated)
					this.TriggerRestoreTimeout();
			}
		}, {
			Tag: "cycle-trigger",
			Description: ": Force a cycle to a new trigger word if enabled",
			Action: () => {
				if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("/cycle-trigger disabled while immersive", 5000);
					return;
				}
				if (this.settings.enableCycle)
					this.RollTriggerWord();
			}
		}];
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
                } else if (activityEntry?.sleep && !getModule<InjectorModule>("InjectorModule")?.asleep) {
                    this.DelayedTrigger(activityEntry, sender?.MemberNumber, true);
                }
            }
        });

        OnChat(69, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
            if (!!sender)
                setTimeout(() => this.CheckSuggestions(msg, sender), 500);
        });

        hookFunction("SpeechGarble", 69, (args, next) => { // high priority for now.. nice.            
            if (!this.Enabled)
                return next(args);

            const C = args[0] as Character;
            if (ChatRoomIsViewActive(ChatRoomMapViewName) && !ChatRoomMapViewCharacterIsHearable(C))
                return next(args);
                
            // Check for non-garbled trigger word, this means a trigger word could be set to what garbled speech produces >.>
            let msg = callOriginal("SpeechGarble", [args[0], args[1]]);
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
                if (names.some(n => isPhraseInString(lowerMsg, n)) || 
                    this.StateModule.HypnoState.config.activatedBy == C.MemberNumber || 
                    this.StateModule.HypnoState.config.activatedBy == -1 ||
                    C.MemberNumber == Player.MemberNumber) {
                    args[1] = this.BlankOutTriggers(args[1]);
                    if (this.CheckAwakener(msg, C)) {
                        this.TriggerRestoreWord(C);
                    } else  {
                        this.CheckSpeechTriggers(msg, C);
                    }
                }
                else
                    args[1] =  args[1].replace(/\S/gm, '-');
            }

            return next(args);
        }, ModuleCategory.Hypno);

        let lastCycleCheck = 0;
        hookFunction('TimerProcess', 1, (args, next) => {
            if (ActivityAllowed()) {
                var now = CommonTime();
                let triggerTimer = (this.settings.triggerTime ?? 5) * 60000;
                let hypnoEnd = this.StateModule.HypnoState.config.activatedAt + triggerTimer;
                
                if (this.hypnoActivated && this.settings.triggerTime > 0 && hypnoEnd < now) {
                    // Hypno Trigger Timeout --
                    this.TriggerRestoreTimeout();
                }
                if (!this.hypnoActivated && (lastCycleCheck + 5000) < now) {
                    lastCycleCheck = now;
                    this.CheckNewTrigger();
                }
            }
            return next(args);
        }, ModuleCategory.Injector);

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "suggestions_get_responder",
            command: "get-suggestions",
            func: (sender: number, msg: LSCGMessageModel) => this.SuggestionsRequestHandler(sender, msg)
        });

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "suggestions_set_responder",
            command: "set-suggestions",
            func: (sender: number, msg: LSCGMessageModel) => this.SuggestionsPushHandler(sender, msg)
        })

        // Set Trigger
        if (!this.settings.trigger) {
            this.settings.trigger = this.getNewTriggerWord();            
        }
    }

    SuggestionsRequestHandler(sender: number, msg: LSCGMessageModel){
        if (this.Enabled &&
            Player.IsOwnedByMemberNumber(sender) ||
                (this.hypnoActivated &&
                this.settings.allowSuggestions &&
                this.allowedSpeaker(getCharacter(sender) ?? undefined))) {
                sendLSCGCommandBeep(sender, "get-suggestions-response", [{
                    name: "suggestions",
                    value: this.settings.suggestions?.filter(s => s.installedBy == sender || !s.exclusive) ?? []
                }, {
                    name: "total",
                    value: this.settings.suggestions?.length ?? 0
                }])
            }
    }

    SuggestionsPushHandler(sender: number, msg: LSCGMessageModel) {
        if (this.Enabled &&
            Player.IsOwnedByMemberNumber(sender) ||
                (this.hypnoActivated &&
                this.settings.allowSuggestions &&
                this.allowedSpeaker(getCharacter(sender) ?? undefined))) {
                    if (!this.settings.suggestions)
                        this.settings.suggestions = [];
                    let incomingSuggestions = (msg.command?.args.find(a => a.name == "suggestions")?.value as HypnoSuggestion[]).filter(s => !!s.trigger) ?? [];
                    let removedSuggestions = msg.command?.args.find(a => a.name == "removed")?.value as HypnoSuggestion[];
                    if (!incomingSuggestions)
                        return;
                    incomingSuggestions.forEach(incoming => {
                        let existing = this.settings.suggestions.find(s => s.id == incoming.id);
                        if (!existing) {
                            this.settings.suggestions.push(incoming);
                            if (!(this.settings.influence as HypnoInfluence[]))
                                this.settings.influence = <HypnoInfluence[]>[];
                            let influence = this.settings.influence.find(i => i.memberId == sender);
                            if (!influence) {
                                this.settings.influence.push(<HypnoInfluence>{
                                    memberId: sender,
                                    memberName: getCharacter(sender)?.Name ?? sender + "",
                                    lastInfluenced: new Date().getTime(),
                                    influence: 10
                                });
                            } else {
                                influence.lastInfluenced = new Date().getTime();
                                influence.influence = Math.max(influence.influence + 5, 100);
                                influence.memberName = getCharacter(influence.memberId)?.Name ?? influence.memberName;
                            }
                        }
                        else Object.assign(existing, incoming);
                    });
                    removedSuggestions.forEach(removed => {
                        let ix = this.settings.suggestions.findIndex(s => s.id == removed.id);
                        this.settings.suggestions.splice(ix, 1);
                    });
                    settingsSave();
                }
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

    get blockSpeechTriggers(): string[] {
        return GetDelimitedList(this.settings.silenceTriggers);
    }

    get allowSpeechTriggers(): string[] {
        return GetDelimitedList(this.settings.speakTriggers);
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
        if (!this.StateModule.settings.immersive)
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

    delayedHypnoStrings = [
        "%NAME%'s eyes flutter as %PRONOUN% fights to keep control of %POSSESSIVE% senses...",
        "%NAME% whimpers and struggles to stay awake...",
        "%NAME% can feel %POSSESSIVE% eyelids grow heavy as %PRONOUN% drifts on the edge of trance...",
        "%NAME% lets out a low moan as %POSSESSIVE% muscles relax and %PRONOUN% starts to drop..."
    ];

    delayedSleepStrings = [
        "%NAME%'s eyes flutter as %PRONOUN% fights to keep them open...",
        "%NAME% yawns and struggles to stay awake...",
        "%NAME% can feel %POSSESSIVE% eyelids grow heavy as %PRONOUN% drifts on the edge of sleep...",
        "%NAME% takes a deep, relaxing breath as %POSSESSIVE% muscles relax and %PRONOUN% eyes start to droop..."
    ]

    delayedActivations: Map<string, number> = new Map<string,number>();

    DelayedTrigger(activityEntry: ActivityEntryModel, memberNumber: number = 0, isSleep: boolean = false) {
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
            if (isSleep) {
                SendAction("%NAME% quivers with one last attempt to stay awake...");
                setTimeout(() => getModule<InjectorModule>("InjectorModule")?.Sleep(true), 4000);
            }
            else {
                SendAction("%NAME% trembles weakly with one last attempt to maintain %POSSESSIVE% senses...");
                setTimeout(() => this.StartTriggerWord(false, memberNumber), 4000);
            }
            count = 0; // reset repeats
        }
        else {
            let str = isSleep ? this.delayedSleepStrings[getRandomInt(this.delayedSleepStrings.length)] : this.delayedHypnoStrings[getRandomInt(this.delayedHypnoStrings.length)];
            SendAction(str);
        }
        this.delayedActivations.set(entryName, count);
    }

    CheckAwakener(msg: string, sender: Character): boolean {
        return this._CheckForTriggers(msg, sender, this.awakeners, true);
    }

    CheckSpeechTriggers(msg: string, sender: Character) {
        if (this._CheckForTriggers(msg, sender, this.blockSpeechTriggers, true)) {
            this.StateModule.HypnoState.PreventSpeech();
        } else if (this._CheckForTriggers(msg, sender, this.allowSpeechTriggers, true)) {
            this.StateModule.HypnoState.AllowSpeech();
        }
    }

    CheckSuggestions(msg: string, sender: Character) {
        this.settings.suggestions?.forEach(s => {            
            if (this._CheckForTriggers(msg, sender, [s.trigger], this.hypnoActivated)) {
                this.CompelSuggestion(s, sender, msg);
            }
        });
    }

    CheckTrigger(msg: string, sender: Character): boolean {
        return this._CheckForTriggers(msg, sender, this.triggers);
    }

    _CheckForTriggers(msg: string, sender: Character, triggers: string[], awakener: boolean = false): boolean {
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
        if ((now - (this.settings.cooldownTime * 1000)) < this.StateModule.HypnoState.config.recoveredAt) {
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
        this.settings.triggerCycled = false;
        if (!AudioShouldSilenceSound(true))
            AudioPlaySoundEffect("SciFiEffect", 1);
        
        if (wasWord)
            SendAction("%NAME%'s eyes immediately defocus, %POSSESSIVE% posture slumping slightly as %PRONOUN% loses control of %POSSESSIVE% body at the utterance of a trigger word.");
        else
            SendAction("%NAME%'s eyes glaze over, %POSSESSIVE% posture slumping weakly as %PRONOUN% loses control of %POSSESSIVE% body.");
        
        this.settings.stats.hypnotizedCount++;
        this.StateModule.HypnoState.Activate(memberNumber);
    }

    TriggerRestoreWord(speaker: Character) {
        SendAction("%NAME% snaps back into %POSSESSIVE% senses at %OPP_NAME%'s voice.", speaker);
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
        this.StateModule.HypnoState.Recover();
    }

    CheckNewTrigger() {
        if (this.hypnoActivated || !this.settings.enableCycle || this.settings.triggerCycled)
            return;
        var cycleAtTime = Math.max(this.StateModule.HypnoState.config.activatedAt, this.StateModule.HypnoState.config.recoveredAt) + (Math.max(1, this.settings.cycleTime || 0) * 60000)
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
        return this.StateModule?.HypnoState?.config.active ?? false;
    }

    GetSuggestionInfluence(suggestion: HypnoSuggestion, sender: Character) {
        let suggestionInfluenceVal = this.settings.influence.find(i => i.memberId == suggestion.installedBy)?.influence ?? 0;
        let speakerInfluenceVal = this.settings.influence.find(i => i.memberId == sender.MemberNumber)?.influence ?? 0;
        let totalInfluence = suggestionInfluenceVal + speakerInfluenceVal;
        if (this.hypnoActivated)
            totalInfluence *= 2;
        return totalInfluence;
    }

    GetResistRoll() {
        return getRandomInt(100) + (getDominance(Player) / 2);
    }

    CompelSuggestion(suggestion: HypnoSuggestion, sender: Character, command: string) {
        // Calculate chance to resist suggestion, if 0 force activate
        // Otherwise prompt user in local chat with constructed message based on instructions
        if (this.GetSuggestionInfluence(suggestion, sender) >= 100)
            this.DoSuggestion(suggestion, sender, command);
        else
            this.PromptResistSuggestion(suggestion, sender, command);
    }

    ReduceSpeakerInfluence(memberNumber: number) {
        let influence = this.settings.influence.find(i => i.memberId == memberNumber);
        if (!!influence) {
            influence.influence--;
            influence.lastInfluenced = new Date().getTime();
            settingsSave();
        }
    }

    IncreaseSpeakerInfluence(memberNumber: number) {
        let influence = this.settings.influence.find(i => i.memberId == memberNumber);
        if (!!influence) {
            influence.influence = Math.min(influence.influence + 2, 100);
            influence.lastInfluenced = new Date().getTime();
            settingsSave();
        }
    }

    ResistSuggestion(suggestion: HypnoSuggestion, sender: Character, command: string) {
        // Attempt resist roll!
        // Send emote or private whisper to sender informing of the resist 
        let roll = this.GetResistRoll();
        let influence = this.GetSuggestionInfluence(suggestion, sender);
        if (roll > influence) {
            LSCG_SendLocal(`Successfully resisted the suggestion! [${roll}/${influence}]`);
            this.ReduceSpeakerInfluence(sender.MemberNumber ?? -1);
            if (suggestion.installedBy != sender.MemberNumber)
                this.ReduceSpeakerInfluence(suggestion.installedBy);
        } else {
            LSCG_SendLocal(`Failed to resist the suggestion [${roll}/${influence}], submitting to instructions.`);
            this.DoSuggestion(suggestion, sender, command);
        }
    }

    DoSuggestion(suggestion: HypnoSuggestion, sender: Character, command: string) {
        // Iterate through instructions, calculating the configuration and target
        // Wait 2s between intstructions similar to magic
        // Send emote as player performs each instruction
        this.IncreaseSpeakerInfluence(sender.MemberNumber ?? -1);
        if (suggestion.installedBy != sender.MemberNumber)
            this.IncreaseSpeakerInfluence(suggestion.installedBy);
        suggestion.instructions.forEach((instruction, ix, arr) => {
            setTimeout(() => {
                let config = instruction.arguments["config"];
                switch (instruction.type) {
                    case LSCGHypnoInstruction.activity:
                        let activitySelection = instruction.arguments["selection"] as ActivitySelection;
                        LSCG_SendLocal(`Activity -- target: ${config ?? "speaker"}, activity: ${activitySelection?.group}::${activitySelection?.name}`);
                        break;
                    case LSCGHypnoInstruction.follow:
                        LSCG_SendLocal(`Follow -- ${config ?? "speaker"}`);
                        break;
                    case LSCGHypnoInstruction.maid:
                        LSCG_SendLocal(`Maid`);
                        break;
                    case LSCGHypnoInstruction.orgasm:
                        LSCG_SendLocal(`Orgasm`);
                        break;
                    case LSCGHypnoInstruction.pose:
                        let poseSelection = instruction.arguments["selection"] as PoseSelection;
                        LSCG_SendLocal(`Pose -- ${poseSelection?.upper ?? 'none'} :: ${poseSelection?.lower ?? 'none'} :: ${poseSelection.full ?? 'none'}`);
                        break;
                    case LSCGHypnoInstruction.say:
                        LSCG_SendLocal(`Say -- ${config}`);    
                        break;
                    case LSCGHypnoInstruction.strip:
                        let clothing = instruction.arguments["selection"] as ClothingSelection;
                        LSCG_SendLocal(`Strip -- all: ${clothing?.all ?? false} -- slots: \n${clothing?.groups?.join("\n")}`);
                        break;
                    default:
                        break;
                }
            }, ix * 2000);            
        })
    }

	//Show a button on screen to accept or reject money from sender
	PromptResistSuggestion(suggestion: HypnoSuggestion, sender: Character, msg: string) {
		const senderId = sender.MemberNumber ?? -1;
        const senderName = CharacterNickname(sender);
        const timeKey = new Date().getTime();
		const resistDiv = `
            <div id="suggestion-resist" class="ChatMessage ChatMessageChat" data-time="${ChatRoomCurrentTime()}" data-sender="${sender.MemberNumber}">
                <span class="ChatMessageName" style="color:${sender.LabelColor};">${senderName}'s words compel you...</span>
                <div style="display:flex;flex-direction:row;">
                    <button id="suggestion-submit-${senderId}-${suggestion.id}-${timeKey}" class="ChatMessageName" style="color:#572844;background-color: lightgreen;margin-left: 5px;font-size: inherit;"> Submit </button>
                    <button id="suggestion-resist-${senderId}-${suggestion.id}-${timeKey}" class="ChatMessageName" style="color:#572844;background-color: red;margin-left: 5px;font-size: inherit;"> Resist </button>
                </div>
            </div>`;
		const div = htmlToElement(resistDiv);
		ChatRoomAppendChat(div as HTMLElement);
		const accbtn = document.getElementById(`suggestion-submit-${senderId}-${suggestion.id}-${timeKey}`);		
		const decbtn = document.getElementById(`suggestion-resist-${senderId}-${suggestion.id}-${timeKey}`);
		accbtn?.addEventListener("click", (_ => this.ClickSuggestionButton(suggestion, sender, msg, false, [accbtn!, decbtn!])));
        decbtn?.addEventListener("click", (_ => this.ClickSuggestionButton(suggestion, sender, msg, true, [accbtn!, decbtn!])));
	}

    ClickSuggestionButton(suggestion: HypnoSuggestion, sender: Character, msg: string, resist: boolean, buttons: HTMLElement[]) {
        buttons.forEach(btn => btn.remove());
        if (resist) this.ResistSuggestion(suggestion, sender, msg);
        else this.DoSuggestion(suggestion, sender, msg);
    }
}

// Random Trigger Word List
const commonWords = [ "able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young" ];