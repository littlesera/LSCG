import { BaseModule } from 'base';
import { HypnoInfluence, HypnoSettingsModel, LSCGHypnoInstruction } from 'Settings/Models/hypno';
import { ModuleCategory, Subscreen } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, OnAction, OnActivity, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, callOriginal, setOrIgnoreBlush, isAllowedMember, isPhraseInString, GetTargetCharacter, GetDelimitedList, GetActivityEntryFromContent, escapeRegExp, IsActivityAllowed, LSCG_SendLocal, getCharacter, sendLSCGCommandBeep, htmlToElement, OnChat, getDominance, getCharacterByNicknameOrMemberNumber, getActivities, isCloth, replace_template, hookBCXVoice } from '../utils';
import { GuiHypno } from 'Settings/hypno';
import { getModule } from 'modules';
import { ActivityEntryModel } from 'Settings/Models/activities';
import { InjectorModule } from './injector';
import { StateModule } from './states';
import { CommandListener, CoreModule } from './core';
import { ActivitySelection, ClothingSelection, ForgetSelection, PoseSelection } from 'Settings/Remote/suggestions';
import { SuggestionMiniGame } from 'MiniGames/Suggestion';
import { registerMiniGame } from 'MiniGames/minigames';
import { StateRestrictions } from './States/BaseState';
import { Leashing, LeashingModule } from './leashing';

export class SuggestionMiniGameOptions {
    constructor(suggestion: HypnoSuggestion, sender: Character, command: string) {
        this.suggestion = suggestion;
        this.sender = sender;
        this.msg = command;
    }
    suggestion: HypnoSuggestion;
    sender: Character;
    msg: string = "";
    tintColor: {r: number, g: number, b: number, a: number}[] = [{r: 148, g: 0, b: 211, a: 0}];
    gameLength: number = 4000;
    get senderNum(): number { return this.sender?.MemberNumber ?? -1; }
    get senderName(): string { return !!this.sender ? CharacterNickname(this.sender) : ""; }
    get hintText(): string { return `${this.senderName}'s words compel you...`; }
    get failText(): string { return `You fail to resist ${this.senderName}'s suggestion.`; }
    get successText(): string { return `You shake off ${this.senderName}'s suggestion!`; }
    get submissionText(): string { return `You submit to ${this.senderName}'s suggestion...`; }
}

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
        this.installedAt = new Date().getTime();
    }
    id: string = "";
    name: string = "";
    trigger: string = "";
    installedBy: number = -1;
    installedByName: string = "";
    installedAt: number = 0;
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
            suggestionRequireHypnotizer: true,
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
        this.settings.allowSuggestions = false;
        this.settings.allowSuggestionRemoval = true;
        this.settings.remoteAccess = false;
        this.settings.locked = false;
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
					LSCG_SendLocal("zonk disabled while immersive");
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
					LSCG_SendLocal("unzonk disabled while immersive");
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
					LSCG_SendLocal("cycle-trigger disabled while immersive");
					return;
				}
				if (this.settings.enableCycle)
					this.RollTriggerWord();
			}
		}, {
            Tag: "show-influence",
            Description: ": Display which characters have hypnotic influence over you",
            Action: () => {
                if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("show-influence disabled while immersive");
					return;
				}
                this.settings.influence.forEach(inf => {
                    let fmt = new Intl.RelativeTimeFormat("en", {
                        style: "long"
                    });
                    let diff = new Date().getTime() - new Date(inf.lastInfluenced).getTime();
                    let minutes = diff / 1000 / 60;
                    let hours = minutes / 60;
                    let days = hours / 24;
                    let weeks = days / 7;
                    let diffStr = weeks > 1 ? fmt.format(-weeks, "weeks") :
                        days > 1 ? fmt.format(-days, "days") :
                        hours > 1 ? fmt.format(-hours, "hours") :
                        fmt.format(-Math.floor(minutes), "minutes");
                    LSCG_SendLocal(`${inf.memberName} [<i>${inf.memberId}</i>] -- <br>&emsp;<b>Influence:</b> ${inf.influence}, <b>Last Update:</b> ${diffStr}`, false);
                });
            }
        }, {
            Tag: "show-suggestions",
            Description: ": Display which suggestions currently reside in your mind",
            Action: () => {
                if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("show-suggestions disabled while immersive");
					return;
				}
                this.settings.suggestions.forEach(s => {
                    LSCG_SendLocal(`<b>${s.name}</b> -- <br>&emsp;Installed By: <i>${s.installedByName} [${s.installedBy}]</i>, trigger: <i>${s.trigger}</i>`, false);
                });
            }
        }, {
            Tag: "remove-suggestion",
            Description: ": Remove an installed suggestion",
            Action: (args: string, msg: string, parsed: string[]) => {
                if (!this.settings.allowSuggestionRemoval) {
                    LSCG_SendLocal("remove-suggestions disabled in settings");
					return;
                }
                else if (this.StateModule.settings.immersive) {
					LSCG_SendLocal("remove-suggestions disabled while immersive");
					return;
				} else if (Player.GetDifficulty() >= 3) {
                    LSCG_SendLocal("remove-suggestions unavailable on extreme difficulty");
					return;
                } else if (!args.trim()) {
                    LSCG_SendLocal("No suggestion name provided");
					return;
                }

                let suggestionName = args.trim();
                let ix = this.settings.suggestions.findIndex(s => s.name.toLocaleLowerCase() == suggestionName.toLocaleLowerCase());
                let suggestion = this.settings.suggestions[ix];
                if (ix < 0 || !suggestion) {
                    LSCG_SendLocal(`Suggestion '${suggestionName}' not found`);
					return;
                } else {
                    this.settings.suggestions.splice(ix, 1);
                    settingsSave();
                    LSCG_SendLocal(`Suggestion '${suggestion.name}' by ${suggestion.installedByName} [${suggestion.installedBy}] removed`)
                }
            }
        }];
    }

    SuggestionGame: SuggestionMiniGame = registerMiniGame(new SuggestionMiniGame(this));
    MiniGameOptions?: SuggestionMiniGameOptions;

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
                else if (activityEntry?.hypno && !this.hypnoActivated && !this.IsOnCooldown() && (Player.ArousalSettings?.Progress ?? 0) >= activityEntry.hypnoThreshold) {
                    this.DelayedTrigger(activityEntry, sender?.MemberNumber);
                }
            }
        });

        let handlerPriority = (ChatRoomMessageHandlers.find(h => h.Description == "Save chats and whispers to the chat log")?.Priority ?? 110) - 1;
        ChatRoomRegisterMessageHandler(<ChatRoomMessageHandler>{
            Priority: handlerPriority, // Try to make sure we run last. Other mods could potentially add handlers after this depending on arbitrary load order.
            Description: "LSCG Hypnosis Trigger Checks",
            Callback: (data: ServerChatRoomMessage, sender: Character, msg: string, metadata?: IChatRoomMessageMetadata) => {
                if (data.Type == "Chat" || data.Type == "Whisper") {
                    let newMsg = this.BlankOutTriggers(msg, sender);
                    if (!this.TopLevelCheckTriggers(msg, sender))
                        return false;
                    return { msg: newMsg }
                } 
                return false;
            }
        });

        let lastCycleCheck = 0;
        let downgradeInterval = (10 * 60 * 1000); // 10 min downgrade ticks
        let lastInfluenceCheck = CommonTime();

        let bcxCheckInterval = (2000); // 2 s bcx check ticks
        let lastbcxCheck = CommonTime();
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

                if ((now - lastInfluenceCheck) > downgradeInterval) {
                    this.DowngradeInfluences();
                    lastInfluenceCheck = now;
                }

                if ((now - lastbcxCheck) > bcxCheckInterval) {
                    this.hookBCX();
                }
            }
            return next(args);
        }, ModuleCategory.Hypno);

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

        (<any>window).LSCG_SuggestionEnd = () => this.MiniGameEnd(MiniGameVictory);

        this.RegisterSuggestionHooks();
    }

    _bcxHooked: boolean = false;
    hookBCX() {
        if (!this._bcxHooked) {
            this._bcxHooked = hookBCXVoice((evt) => {
                let msg = evt?.message;
                if (!!msg && typeof msg === 'string' && msg.startsWith("[Voice] ") && !!Player && !!Player.OnlineSettings && !! (<any>Player.OnlineSettings).BCX) {
                    let bcxSettings = JSON.parse(LZString.decompressFromBase64((<any>Player.OnlineSettings).BCX));
                    let senderId = bcxSettings?.conditions?.rules?.conditions?.other_constant_reminder?.addedBy as number;
                    if (!!senderId) {
                        msg = msg.substring(8);
                        this.TopLevelCheckTriggers(msg, <Character>{
                            MemberNumber: senderId
                        });
                    }
                }
            });
        }
    }    

    TopLevelCheckTriggers(msg: string, sender: Character) {
        if (!this.Enabled || (ChatRoomIsViewActive(ChatRoomMapViewName) && (!!sender.MapData && !ChatRoomMapViewCharacterIsHearable(sender))))
            return false;

        // Check for non-garbled trigger word, this means a trigger word could be set to what garbled speech produces >.>
        if (!this.hypnoActivated && this.CheckTrigger(msg, sender) && !this.IsOnCooldown()) {
            this.StartTriggerWord(true, sender.MemberNumber);
        } else if (this.hypnoActivated) {
            var lowerMsg = msg.toLowerCase();
            var names = [CharacterNickname(Player)];
            if (!!Player.Name && names.indexOf(Player.Name) == -1)
                names.push(Player.Name);
            if (names.some(n => isPhraseInString(lowerMsg, n)) || 
                this.StateModule.HypnoState.config.activatedBy == sender.MemberNumber || 
                this.StateModule.HypnoState.config.activatedBy == -1 ||
                sender.MemberNumber == Player.MemberNumber) {
                if (this.CheckAwakener(msg, sender)) {
                    this.TriggerRestoreWord(sender);
                } else  {
                    this.CheckSpeechTriggers(msg, sender);
                }
            }
            else
                msg =  msg.replace(/\S/gm, '-');
        }
        
        if (this.settings.allowSuggestions)
            this.CheckSuggestions(msg, sender);

        return true;
    }

    _suggestionHooks: any[] = []
    RegisterSuggestionHooks() {
        this._suggestionHooks.push(hookFunction("CommandParse", 6, (args, next) => {
			const msg = args[0].trim() as string;
            const isChat = !/^[*!/.]/.test((msg ?? "")[0]);
			if (this.forceSay_sayText && msg && (ChatRoomTargetMemberNumber ?? -1) == -1 && !msg.includes("(") && isChat) {
				if (msg.toLocaleLowerCase() === this.forceSay_sayText.toLocaleLowerCase()) {
                    this.forceSay_sayText = "";
                    let ret = next(args);
                    if (this.forceSay_BypassingSpeechBlock) {
                        this.forceSay_BypassingSpeechBlock = false;
                        this.StateModule.HypnoState.PreventSpeech();
                    }
                    return ret;
                } else {
                    LSCG_SendLocal(`You find it absurd to say anything other than '${this.forceSay_sayText}'.`);
                    return replace_template("*opens %POSSESSIVE% mouth but no sound comes out.");
                }
			}
            return next(args);
		}));
    }

    _senderCanAlwaysModifySuggestions(sender: number) {
        return Player.IsOwnedByMemberNumber(sender) ||
            Player.IsLoverOfMemberNumber(sender);
    }

    SuggestionsRequestHandler(sender: number, msg: LSCGMessageModel){
        if (this.Enabled &&
            this._senderCanAlwaysModifySuggestions(sender) ||
                (this.hypnoActivated &&
                this.settings.allowSuggestions &&
                this.allowedSpeaker(getCharacter(sender) ?? undefined))) {
                sendLSCGCommandBeep(sender, "get-suggestions-response", [{
                    name: "suggestions",
                    value: this.settings.suggestions?.filter(s => s.installedBy == sender || !s.exclusive || this._senderCanAlwaysModifySuggestions(sender)) ?? []
                }, {
                    name: "total",
                    value: this.settings.suggestions?.length ?? 0
                }])
            }
    }

    SuggestionsPushHandler(sender: number, msg: LSCGMessageModel) {
        let senderChar = getCharacter(sender);
        if (this.Enabled &&
            this._senderCanAlwaysModifySuggestions(sender) ||
                (this.hypnoActivated &&
                this.settings.allowSuggestions &&
                this.allowedSpeaker(senderChar ?? undefined))) {
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
                            this.IncreaseSpeakerInfluence(sender, 4);
                        }
                        else Object.assign(existing, incoming);
                    });
                    removedSuggestions.forEach(removed => {
                        let ix = this.settings.suggestions.findIndex(s => s.id == removed.id);
                        this.settings.suggestions.splice(ix, 1);
                    });
                    if (!AudioShouldSilenceSound(true))
                        AudioPlaySoundEffect("BellSmall");
                    LSCG_SendLocal(`${!!senderChar ? CharacterNickname(senderChar) : "Someone"} whispers into your ear, burying suggestions deep into your mind.`)
                    settingsSave();
                }
    }

    initializeTriggerWord() {
        var recycleFromCommon = this.settings.randomTrigger && (!this.settings.trigger || commonWords.indexOf(this.settings.trigger) == -1);
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
        var words = this.settings.randomTrigger ? commonWords : GetDelimitedList(this.settings.overrideWords)?.filter((word, ix, arr) => !!word && arr.indexOf(word) == ix) ?? [];
        
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

    BlankOutTriggers(msg: string, speaker: Character) {
        if (!this.StateModule.settings.immersive || !this.allowedSpeaker(speaker))
            return msg;

        let triggers = this.triggers ?? [];
        if (this.hypnoActivated)
            triggers = this.awakeners ?? [];
        triggers.filter(t => !!t).forEach(t => {
            let tWords = t?.split(" ");
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
        let suggestion = this.settings.suggestions.find(s => this._CheckForTriggers(msg, sender, [s.trigger], this.hypnoActivated) && (!s.exclusive || s.installedBy == sender.MemberNumber))
        if (!!suggestion) {
            let commandArgs = msg.slice(msg.toLocaleLowerCase().indexOf(suggestion.trigger.toLocaleLowerCase()) + suggestion.trigger.length)?.trim() ?? "";
            setTimeout(() => {
                if (!!suggestion) this.CompelSuggestion(suggestion, sender, commandArgs)
            }, 500);
        }
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
        if (!!speaker.Name)
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
        let suggestionInfluenceVal = (this.settings.influence.find(i => i.memberId == suggestion.installedBy)?.influence ?? 0)/2;
        let speakerInfluenceVal = (this.settings.influence.find(i => i.memberId == sender.MemberNumber)?.influence ?? 0)/2;
        let totalInfluence = suggestionInfluenceVal + speakerInfluenceVal;
        if (this.hypnoActivated)
            totalInfluence *= 2;
        return Math.min(100, totalInfluence);
    }

    GetResistRoll() {
        return getRandomInt(100);// + (getDominance(Player) / 2);
    }

    CompelSuggestion(suggestion: HypnoSuggestion, sender: Character, command: string) {
        if (!this.settings.allowSuggestions)
            return;

        if (!AudioShouldSilenceSound(true))
            AudioPlaySoundEffect("BellMedium");

        let bypassResistance = this.settings.alwaysSubmit || (this.settings.alwaysSubmitMemberIds.split(",").map(id => id.trim()).indexOf(sender.MemberNumber + "") > -1)
        let totalInfluence = this.GetSuggestionInfluence(suggestion, sender);
        let playerDomRepMod = 0;//getDominance(Player) / 2;
        // Calculate chance to resist suggestion, if 0 force activate
        // Otherwise prompt user in local chat with constructed message based on instructions
        if (bypassResistance || totalInfluence >= (100 + playerDomRepMod))
            this.DoSuggestion(new SuggestionMiniGameOptions(suggestion, sender, command));
        else {
            // Start Resist Game
            this.MiniGameOptions = new SuggestionMiniGameOptions(suggestion, sender, command);
            MiniGameStart(this.SuggestionGame.name, totalInfluence, "LSCG_SuggestionEnd");
        }
    }

    ReduceSpeakerInfluence(memberNumber: number, forceSave: boolean = false) {
        let influence = this.settings.influence.find(i => i.memberId == memberNumber);
        if (!!influence) {
            influence.influence--;
            influence.lastInfluenced = new Date().getTime();
            if (forceSave) settingsSave();
        }
    }

    IncreaseSpeakerInfluence(memberNumber: number, multi: number = 1) {
        let increaseAmt = 2 * multi;
        let sender = getCharacter(memberNumber);
        let influence = this.settings.influence.find(i => i.memberId == memberNumber);
        if (!!influence) {
            influence.influence = Math.min(influence.influence + increaseAmt, 100);
            influence.lastInfluenced = new Date().getTime();
            if (!!sender) influence.memberName = CharacterNickname(sender);
        } else {
            this.settings.influence.push(<HypnoInfluence>{
                memberId: memberNumber,
                memberName: !!sender ? CharacterNickname(sender) : "Someone",
                lastInfluenced: new Date().getTime(),
                influence: increaseAmt
            });
        }
        settingsSave();
    }

    AttemptResistSuggestion(suggestion: HypnoSuggestion, sender: Character, command: string) {
        // Attempt resist roll!
        // Send emote or private whisper to sender informing of the resist 
        let roll = this.GetResistRoll();
        let influence = this.GetSuggestionInfluence(suggestion, sender);
        if (roll > influence) {
            LSCG_SendLocal(`Successfully resisted the suggestion! [${roll}/${influence}]`);
            this.ReduceSpeakerInfluence(sender.MemberNumber ?? -1);
            if (suggestion.installedBy != sender.MemberNumber)
                this.ReduceSpeakerInfluence(suggestion.installedBy);
            settingsSave();
        } else {
            LSCG_SendLocal(`Failed to resist the suggestion [${roll}/${influence}], submitting to instructions.`);
            this.DoSuggestion(new SuggestionMiniGameOptions(suggestion, sender, command));
        }
    }

    ResistSuggestion(opts: SuggestionMiniGameOptions) {
        this.ReduceSpeakerInfluence(opts.senderNum);
        if (opts.suggestion.installedBy != opts.senderNum)
            this.ReduceSpeakerInfluence(opts.suggestion.installedBy);
        settingsSave();
    }

    DoSuggestion(opts: SuggestionMiniGameOptions) {
        // Iterate through instructions, calculating the configuration and target
        // Wait 2s between intstructions similar to magic
        // Send emote as player performs each instruction
        let suggestion = opts.suggestion;
        let sender = opts.sender;
        let command = opts.msg;

        this.IncreaseSpeakerInfluence(sender.MemberNumber ?? -1);
        if (suggestion.installedBy != sender.MemberNumber)
            this.IncreaseSpeakerInfluence(suggestion.installedBy);
        
        suggestion.instructions.forEach((instruction, ix, arr) => {
            setTimeout(() => {
                let config = instruction.arguments["config"];
                if (this.settings.blockedInstructions.indexOf(instruction.type) > -1) {
                    return this.BlockedInstruction(opts, instruction);
                }
                switch (instruction.type) {
                    case LSCGHypnoInstruction.activity:
                        this.ForceActivity(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.follow:
                        this.ForceFollow(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.maid:
                        this.ForceMaidWork(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.orgasm:
                        SendAction(`%NAME% ${Player.IsGagged() ? "trembled" : "gasps"} as pleasure rushes over %INTENSIVE%.`);
                        if (!!Player.ArousalSettings) {
                            Player.ArousalSettings.Progress = 100;
                            Player.ArousalSettings.OrgasmTimer = CurrentTime - 1;
                        }
                        ActivityOrgasmPrepare(Player);
                        break;
                    case LSCGHypnoInstruction.pose:
                        this.ForcePose(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.say:
                        this.ForceSay(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.strip:
                        this.ForceStrip(opts, instruction);
                        break;
                    case LSCGHypnoInstruction.denial:
                        SendAction("%NAME%'s blank expression hides %POSSESSIVE% impending denial.")
                        this.StateModule.DeniedState.Activate(opts.senderNum);
                    case LSCGHypnoInstruction.insatiable:
                        SendAction("%NAME%'s face begins to blush and %POSSESSIVE% breathing speeds up.");
                        this.StateModule.HornyState.Activate(opts.senderNum);
                    case LSCGHypnoInstruction.forget:
                        let selection = instruction.arguments["selection"] as ForgetSelection;
                        if (!selection)
                            break;
                        HypnoModule.forgettableInstruction.forEach(i => {
                            if (selection.all || selection.instructions.indexOf(i) > -1) {
                                switch (i) {
                                    case LSCGHypnoInstruction.denial:
                                        this.StateModule.DeniedState.Recover();
                                        break;
                                    case LSCGHypnoInstruction.insatiable:
                                        this.StateModule.HornyState.Recover();
                                        break;
                                    case LSCGHypnoInstruction.follow:
                                        this.BreakFollow(opts, instruction);
                                        break;
                                    case LSCGHypnoInstruction.say:
                                        this.forceSay_sayText = "";
                                        if (this.forceSay_BypassingSpeechBlock) this.StateModule.HypnoState.PreventSpeech();
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                    default:
                        break;
                }
                settingsSave();
            }, ix * 1000);
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
                    <button id="suggestion-submit-${senderId}-${suggestion.id}-${timeKey}" class="ChatMessageName" style="cursor:pointer;color:#572844;background-color: lightgreen;margin-left: 5px;font-size: inherit;"> Submit </button>
                    <button id="suggestion-resist-${senderId}-${suggestion.id}-${timeKey}" class="ChatMessageName" style="cursor:pointer;color:#572844;background-color: red;margin-left: 5px;font-size: inherit;"> Resist </button>
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
        if (resist) this.AttemptResistSuggestion(suggestion, sender, msg);
        else this.DoSuggestion(new SuggestionMiniGameOptions(suggestion, sender, msg));
    }

    MiniGameEnd(resisted: boolean) {
        console.info("suggestion minigame ended - " + resisted);
        CommonSetScreen("Online", "ChatRoom");
        if (!!this.MiniGameOptions) {
            if (resisted) this.ResistSuggestion(this.MiniGameOptions);
            else this.DoSuggestion(this.MiniGameOptions);
            this.MiniGameOptions = undefined;
        }
    }

    FindConfigurableTarget(instruction: HypnoInstruction, sender: Character, msg: string) {
        if (instruction.arguments["self"] as boolean == true)
            return Player;
        if (instruction.arguments["speakerOnly"] as boolean == true) {
            return getCharacterByNicknameOrMemberNumber(sender.MemberNumber + "");
        }
        let target = getCharacterByNicknameOrMemberNumber(instruction.arguments["config"] as string ?? "");
        if (!target) {
            let parsedMsg = msg.replace(/[^a-zA-Z ]/, "");
            target = getCharacterByNicknameOrMemberNumber(parsedMsg ?? "");
        }
        if (!target)
            target = getCharacterByNicknameOrMemberNumber(sender.MemberNumber + "");
        return target;
    }

    ForcePose(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        let poseSelection = instruction.arguments["selection"] as PoseSelection;
        console.debug(`Pose -- ${poseSelection?.upper ?? "none"} :: ${poseSelection?.lower ?? "none"} :: ${poseSelection.full ?? "none"}`);
        SendAction(`%NAME% moves their body into a pose obediently.`);
        let blocked = false;
        CharacterRefresh(Player, false);
        if (!!poseSelection.full) {
            if (PoseCategoryAvailable(Player, "BodyFull"))
                PoseSetActive(Player, poseSelection.full);
            else 
                blocked = true;
        }
        else {
            if (!!poseSelection.lower) {
                if (PoseCategoryAvailable(Player, "BodyLower"))
                    PoseSetActive(Player, poseSelection.lower);
                else 
                    blocked = true;
            }
            if (!!poseSelection.upper) {
                if (PoseCategoryAvailable(Player, "BodyUpper"))
                    PoseSetActive(Player, poseSelection.upper);
                else 
                    blocked = true;
            }
        }
        if (blocked) {
            LSCG_SendLocal(`Your current state prevents you from fully following your instruction and you shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.senderNum);
        }
        if (CurrentScreen == "ChatRoom") {
            ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
            CharacterLoadCanvas(Player);
        }
    }

    ForceMaidWork(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        // Code borrowed from BCX~
        let senderName = CharacterNickname(opts.sender);
        if (ReputationCharacterGet(Player, "Maid") < 1) {
            LSCG_SendLocal(`The maids don't allow you to fulfill your instruction and you shake a little bit of ${senderName}'s influence.`);
            SendAction("%NAME% looks confused as the maids refuse their attempt to serve drinks.");
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        if (!Player.CanWalk() || !Player.CanTalk()) {
            LSCG_SendLocal(`Your current state prevents you from following your instruction and you shake a little bit of ${senderName}'s influence.`);
            SendAction("%NAME% looks frustrated, their inability to both walk and talk preventing them from serving drinks.");
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        PoseSetActive(Player, null);
        const D = `(You find yourself in the maid sorority with only a fuzzy memory of walking here.  Another maid addresses you.) Thank you for agreeing to work!`;
        SendAction(`%NAME% suddenly walks off in the direction of the maid quarters.`);
        ChatRoomLeave();
        CommonSetScreen("Room", "MaidQuarters");
        if (MaidQuartersMaid == null)
            throw new Error("LSCG: Missing MaidQuartersMaid when expected");
        CharacterSetCurrent(MaidQuartersMaid);
        MaidQuartersMaid.CurrentDialog = D;
        MaidQuartersMaid.Stage = "205";
        MaidQuartersOnlineDrinkFromOwner = true;
    }

	forceSay_sayText: string = "";
    forceSay_BypassingSpeechBlock: boolean = false;
    ForceSay(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        let sentence = instruction.arguments["config"] as string
        if (!sentence) sentence = opts.msg;
        if (!sentence) {
            LSCG_SendLocal(`You are prompted no sentence... You shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        if (sentence.includes("(") || /^[*!/.]/.test(sentence[0])) {
            LSCG_SendLocal(`The sentence you are compelled to speak is invalid... You shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        if (!!this.forceSay_sayText)
            LSCG_SendLocal(`A new phrase enters your mind...`);
        this.forceSay_sayText = sentence;
        if (this.StateModule.HypnoState.Restrictions.Speech == "true") {
            this.forceSay_BypassingSpeechBlock = true;
            this.StateModule.HypnoState.AllowSpeech();
        }
        LSCG_SendLocal(`You want nothing else but to loudly say '${this.forceSay_sayText}'.`);
        SendAction("%NAME% mouth starts to move automatically.");
    }

    ForceActivity(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        let target = this.FindConfigurableTarget(instruction, opts.sender, opts.msg);
        let activitySelection = instruction.arguments["selection"] as ActivitySelection;
        let activityGroup = AssetGroup.find(a => a.Name == activitySelection?.group);
        let activity = !!activityGroup ? getActivities(activityGroup).find(a => a.Name == activitySelection?.name) : undefined;
        if (!!target && !!activityGroup && !!activity) {
            let tmp = this.StateModule.HypnoState.Restrictions;
            this.StateModule.HypnoState.Restrictions = <StateRestrictions>{
                Walk: "false",
                Stand: "false",
                Hearing: "false",
                Sight: "false",
                Wardrobe: "false",
                Move: "false",
                Speech: "false"
            };
            let hasItemPermission = ServerChatRoomGetAllowItem(Player, target);
            let isAllowed = hasItemPermission && ActivityAllowedForGroup(target, activityGroup?.Name as AssetGroupItemName).filter(a => !a.Blocked).findIndex(a => a.Activity.Name == activity?.Name) > -1;
            if (isAllowed) ActivityRun(Player, target, activityGroup as AssetItemGroup, <ItemActivity>{Activity: activity}, true);
            else {
                SendAction("%NAME% struggles to perform some action.");
                LSCG_SendLocal(`Something beyond your control is preventing you from following your activity instruction... You shake a little bit of ${opts.senderName}'s influence.`);
                this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            }
            this.StateModule.HypnoState.Restrictions = tmp;
        } else {
            LSCG_SendLocal(`You are unable to interpret your activity instruction and shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
        }
    }

    ForceStrip(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        if (!Player.CanChangeOwnClothes()) {
            LSCG_SendLocal(`You struggle to remove any of your clothing and shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        
        let clothing = instruction.arguments["selection"] as ClothingSelection;
        if (!clothing || !clothing?.groups) {
            LSCG_SendLocal(`You feel a fuzzy confusion without complete instructions and shake a little bit of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        let groups = clothing.groups;
        

        if (clothing.random) {
            let allGroups = AssetGroup
                            .filter(g => g.Family === Player.AssetFamily && g.Category === "Appearance" && g.AllowCustomize && isCloth(g, false))
                            .map(g => g.Name)
                            .filter(g => Player.Appearance.some(a => a.Asset.Group.Name == g));
            groups = allGroups.length > 0 ? [allGroups[getRandomInt(allGroups.length)]] : [];
            if (groups.length <= 0) {
                LSCG_SendLocal(`You feel disappointed that you have no more clothes to remove.`);
            }
        }
        else if (clothing.all) {
            groups = AssetGroup.filter(g => g.Family === Player.AssetFamily && g.Category === "Appearance" && g.AllowCustomize && isCloth(g, false)).map(g => g.Name);
        }
        
        SendAction(`%NAME% starts to remove clothing from %POSSESSIVE% body.`);

        groups.forEach(grp => {
            InventoryRemove(Player, grp as AssetGroupName, false);
        });
        
        ChatRoomCharacterUpdate(Player);
        CharacterLoadCanvas(Player);
    }

    ForceFollow(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        let target = this.FindConfigurableTarget(instruction, opts.sender, opts.msg);
        if (!target || !target.MemberNumber || target.IsPlayer()) {
            LSCG_SendLocal(`You are unable to find the person you are supposed to follow and shake some of ${opts.senderName}'s influence.`);
            this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
            return;
        }
        let module = getModule<LeashingModule>("LeashingModule");
        module.AddLeashing(new Leashing(target.MemberNumber, opts.senderNum, false, "compulsion"));
        sendLSCGCommandBeep(target.MemberNumber, "add-leashing", [{
            name: "pairedMember",
            value: Player.MemberNumber
        }, {
            name: "type",
            value: "compulsion"
        }, {
            name: "isSource",
            value: true
        }]);
        SendAction("%NAME%'s eyes start to follow %OPP_NAME%'s every movement.", target);
    }

    BreakFollow(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        let module = getModule<LeashingModule>("LeashingModule");
        let allCompelledTargets = module.Pairings.filter(p => !p.IsSource && p.Type == "compulsion").map(p => p.PairedMember);
        if (allCompelledTargets.length > 0) {
            module.RemoveAllLeashingsOfType("compulsion");
            allCompelledTargets.filter(m => !!m).forEach(memberNum => {
                sendLSCGCommandBeep(memberNum, "remove-leashing", [{
                    name: "pairedMember",
                    value: Player.MemberNumber
                }, {
                    name: "type",
                    value: "compulsion"
                }, {
                    name: "isSource",
                    value: true
                }]);
            });
            SendAction("%NAME% looks around, a little confused about how %PRONOUN% got here.");
        }
    }

    BlockedInstruction(opts: SuggestionMiniGameOptions, instruction: HypnoInstruction) {
        LSCG_SendLocal(`You are immune to the suggestion's "${instruction.type}" instruction and shake some of ${opts.senderName}'s influence.`);
        this.ReduceSpeakerInfluence(opts.sender.MemberNumber ?? -1);
        return;
    }

    DowngradeInfluences() {
        // Downgrade influences over time logarithmically...
        console.debug("Downgrading influences...");
        if (!this.settings.influence || !this.settings.influence.forEach) {
            this.settings.influence = [];
        }
        this.settings.influence?.forEach(entry => {
            let newVal = entry.influence - Math.ceil(Math.log10(entry.influence));
            console.debug(`${entry.memberName} [${entry.memberId}] pre: ${entry.influence}, post: ${newVal}`);
            entry.influence = newVal;
        });
        settingsSave();
    }

    static forgettableInstruction: LSCGHypnoInstruction[] = [
		LSCGHypnoInstruction.denial,
		LSCGHypnoInstruction.insatiable,
		LSCGHypnoInstruction.follow,
		LSCGHypnoInstruction.say
	]
}

// Random Trigger Word List
const commonWords = [ "able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young" ];