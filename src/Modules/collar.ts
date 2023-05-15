import { BaseModule } from 'base';
import { CollarModel, CollarSettingsModel } from 'Settings/Models/collar';
import { ModuleCategory } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, SendAction, OnChat, getRandomInt, hookFunction, removeAllHooksByModule, OnActivity, OnAction, setOrIgnoreBlush, getCharacter, hookBCXCurse } from '../utils';

enum PassoutReason {
    COLLAR,
    HAND,
    PLUGS
}

export class CollarModule extends BaseModule {

    get settings(): CollarSettingsModel {
		return super.settings as CollarSettingsModel;
	}

    get Enabled(): boolean {
		return super.Enabled && this.wearingCorrectCollar;
	}

    get wearingCorrectCollar(): boolean {
        if (!this.settings.collar || !this.settings.collar.name)
            return true;

        var collar = InventoryGet(Player, "ItemNeck");
        var collarName = collar?.Craft?.Name ?? (collar?.Asset.Name ?? "");
        var collarCreator = collar?.Craft?.MemberNumber ?? 0;
        return collarName == this.settings.collar.name && collarCreator == this.settings.collar.creator;
    }

    load(): void {
        CommandCombine([
            {
                Tag: 'tight',
                Description: ": tighten collar",

                Action: () => {
                    if (!this.Enabled)
                        return;
                    this.IncreaseCollarChoke();
                }
            },
            {
                Tag: 'loose',
                Description: ": loosen collar",

                Action: () => {
                    if (!this.Enabled)
                        return;
                    this.DecreaseCollarChoke();
                }
            }
        ])

        OnChat(600, ModuleCategory.Collar, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            var lowerMsgWords = parseMsgWords(msg);
            if (this.CanActivate(sender)) {
                if ((lowerMsgWords?.indexOf(this.settings.tightTrigger ?? "tight") ?? -1) >= 0)
                    this.IncreaseCollarChoke();
                else if ((lowerMsgWords?.indexOf(this.settings.looseTrigger ?? "loose") ?? -1) >= 0)
                    this.DecreaseCollarChoke();
            }
        });

        OnActivity(100, ModuleCategory.Collar, (data, sender, msg, meta) => {
            let target = data.Dictionary?.find((d: any) => d.Tag == "TargetCharacter");
            if (!!data && 
                !!sender && 
                data.Content == "ChatOther-ItemNeck-Choke" && 
                Player.LSCG.MiscModule.handChokeEnabled &&
                !!target && 
                target.MemberNumber == Player.MemberNumber) {
                this.HandChoke(sender);
            }
        });

        OnAction(100, ModuleCategory.Collar, (data, sender, msg, meta) => {
            if (!data.Dictionary || !data.Dictionary[2] || !data.Dictionary[3])
                return;

            var target = data.Dictionary[2]?.MemberNumber;
            if (target != Player.MemberNumber)
                return;

            if ((msg == "ActionSwap" || "ActionRemove") && data.Dictionary[3]?.GroupName == "ItemNeck") {
                this.ReleaseCollar();
            }
        })

        // Detect if choking member is bound
        OnAction(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            if (!data.Dictionary || !data.Dictionary[2] || !data.Dictionary[3])
                return;

            var target = data.Dictionary[2]?.MemberNumber;
            var targetMember = getCharacter(target);
            if (target == this.handChokingMember && msg == "ActionUse") {
                if (data.Dictionary[3]?.GroupName == "ItemHands" || data.Dictionary[3]?.GroupName == "ItemArms") {
                    this.ReleaseHandChoke(targetMember);
                }                
            }
            return;
        })

        // Check for heavy gag + nose plugs
        OnAction(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            if (!Player.LSCG.MiscModule.gagChokeEnabled)
                return;

            let airwaySlots = ["ItemMouth", "ItemMouth2", "ItemMouth3", "ItemNose"];
            let messagesToCheck = [
                "ActionUse",
                "ActionSwap",
                "ActionRemove",
                "DildoPlugGagMouthSet",
                "PlugGagMouthSet",
                "PumpGagpumpsTo",
                "PumpGagdeflatesTo",
                "ItemMouthFuturisticHarnessBallGagSet",
                "ItemMouthFuturisticPanelGagSet",
                "ItemMouthPonyGagSet"
            ]
            
            var target = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "DestinationCharacter")?.MemberNumber;
            if (!target)
                var target = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "TargetCharacter")?.MemberNumber;
            if (!target)
                var target = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "TargetCharacterName")?.MemberNumber;
            
            var targetGroup = data.Dictionary?.find((dictItem: { Tag: string; }) => dictItem.Tag == "FocusAssetGroup")?.AssetGroupName;

            if (target == Player.MemberNumber &&
                (!targetGroup || airwaySlots.indexOf(targetGroup) > -1) &&
                messagesToCheck.some(x => msg.startsWith(x))) {
                this.CheckGagSuffocate(msg, sender);
            }
            return;
        })

        hookBCXCurse("curseTrigger", (evt) => {
            if (evt.group == "ItemNose")
                setTimeout(() => {
                    this.CheckGagSuffocate("CurseUpdate", Player);
                }, 2000);
        })

        // setTimeout(() => {
        //     window.bcx?.getModApi("LSCG").on?.("curseTrigger", (event) => {
        //         console.log("I see a curse event!", event);
        //     })}, 10000);

        // event on room join
        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            if (!this.Enabled)
                return;
            else
                this.ReleaseHandChoke(null, false);
            this.ActivateChokeEvent();
            this.CheckGagSuffocate("ChatRoomSync", Player);
        }, ModuleCategory.Collar);

        hookFunction('ServerSend', 4, (args, next) => {
            // if (!this.Enabled && !Player.LSCG.MiscModule.handChokeEnabled)
            //     return next(args);
            // Prevent speech at choke level 4
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Chat" && !args[1]?.Content?.startsWith("(")){
                if (this.totalChokeLevel >= 4) {
                    SendAction(this.gagSpeechlessLines[getRandomInt(this.gagSpeechlessLines.length)]);
                    return null;
                }
                else if (this.totalChokeLevel > 1) {
                    args[1].Content = SpeechGarbleByGagLevel((this.totalChokeLevel - 1)**2, args[1].Content);
                    return next(args);
                }
                else
                    return next(args);
            }
            else
                return next(args);
        }, ModuleCategory.Collar);

        hookFunction("Player.CanWalk", 2, (args, next) => {
            if (this.handChokeModifier > 0) return false;
            return next(args);
        }, ModuleCategory.Collar);

        hookFunction("Player.HasTints", 5, (args, next) => {
            if (this.totalChokeLevel > 2 && Player.ImmersionSettings?.AllowTints) return true;
            return next(args);
        }, ModuleCategory.Collar);

        hookFunction("Player.GetTints", 5, (args, next) => {
            // if (!this.Enabled)
            //     return next(args);
            if (this.totalChokeLevel == 3) return [{r: 0, g: 0, b: 0, a: 0.2}];
            else if (this.totalChokeLevel == 4) return [{r: 0, g: 0, b: 0, a: 0.6}];
            return next(args);
        }, ModuleCategory.Collar);
            
        hookFunction("Player.GetBlurLevel", 5, (args, next) => {
            // if (!this.Enabled)
            //     return next(args);
            if (this.totalChokeLevel == 3) return 2;
            if (this.totalChokeLevel == 4) return 6;
            return next(args);
        }, ModuleCategory.Collar);

        this.eventInterval = setInterval(() => this.ChokeEvent(), this.chokeEventTimer);

        if (this.settings.chokeLevel == undefined) {
            this.settings.chokeLevel = 0;
            settingsSave();
        }

        if (this.settings.chokeLevel > 2) {
            this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Collar);
    }

    // Choke Collar Code
    get allowedChokeMembers(): number[] {
        let stringList = this.settings.allowedMembers.split(",");
        return stringList.filter(str => !!str && (+str === +str)).map(str => parseInt(str));
    }

    get totalChokeLevel(): number {
        if (this.isPluggedUp)
            return 4;
        else
            return Math.min(this.settings.chokeLevel + this.handChokeModifier, 4);
    }

    chokeTimeout: number = 0;
    chokeTimer: number = 120000;
    chokeEventTimer: number = 60010;
    passout1Timer: number = 30000;
    passout2Timer: number = 15000;
    passout3Timer: number = 10000;
    eventInterval: number = 0;
    handChokeModifier: number = 0;
    handChokingMember: number = 0;
    isPluggedUp: boolean = false;

    gagSpeechlessLines = [
        "%NAME%'s mouth moves silently.",
        "%NAME%'s mouth moves without a sound.",
        "%NAME%'s whimpers inaudibly, unable to breath.",
        "%NAME% groans and convulses.",
        "%NAME% shudders as %POSSESSIVE% lungs burn."
    ]

    CheckGagSuffocate(msg: string, sender: Character | null) {
        var chokeThreshold = 8;
        var gaspThreshold = 5;

        // slightly lower threshold for pump and pony gag to choke at max level...
        if (msg.indexOf("PumpGag") > -1 || msg.indexOf("ItemMouthPonyGag") > -1) {
            chokeThreshold = 7;
        }

        let gagLevel = SpeechGetTotalGagLevel(Player, true);
        let isNosePlugged = InventoryGet(Player, "ItemNose")?.Asset.Name == "NosePlugs";
        if (gagLevel >= chokeThreshold && isNosePlugged || 
            (msg.indexOf("PumpGagpumpsTo") > -1 && gagLevel >= 7)) { // allow lower threshold for pump gag, letting it choke when full.
            if (msg.indexOf("PumpInflate") > -1) {
                SendAction("%NAME%'s eyes widen as %POSSESSIVE% gag inflates to completely fill %POSSESSIVE% throat.");
            }
            this.isPluggedUp = true;
            this.StartPassout(PassoutReason.PLUGS, sender, 125000); // just over 2 minutes to choke out
        } else {
            this.isPluggedUp = false;
            if (this.isPassingOut && this.settings.chokeLevel < 4)
                this.ResetPlugs();
            else if (gagLevel >= gaspThreshold && isNosePlugged)
                SendAction("%NAME% splutters and gasps for air around %POSSESSIVE% gag.");
        }
    }

    setChokeTimeout(f: TimerHandler, delay: number | undefined) {
        clearTimeout(this.chokeTimeout);
        if (typeof f === "string")
            this.chokeTimeout = setTimeout(f, delay);
        else
            this.chokeTimeout = setTimeout(() => f(), delay);
    }

    handChokeTimeout: number = 0;
    HandChoke(chokingMember: Character) {
        console.debug("Hand-choke event.. coming soon.");
        
        if (this.handChokeModifier >= 4)
            return;
            
        this.handChokingMember = chokingMember.MemberNumber ?? 0;
        this.handChokeModifier = Math.min(this.handChokeModifier + 1, 4);
        this.IncreaseArousal();
        clearTimeout(this.handChokeTimeout);
        this.handChokeTimeout = setTimeout(() => this.ReleaseHandChoke(chokingMember), 60000);

        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        switch (this.totalChokeLevel) {
            case 1:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME%'s eyes flutter as %OPP_NAME% wraps their hand around %POSSESSIVE% neck.", chokingMember);
                setOrIgnoreBlush("Low");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 2:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% gasps for air as %OPP_NAME% tightens their grip on %POSSESSIVE% neck.", chokingMember);
                setOrIgnoreBlush("Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Surprised");
                break;
            case 3:
                this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
                SendAction("%NAME%'s face runs flush, choking as %OPP_NAME% presses firmly against their neck, barely allowing any air to %POSSESSIVE% lungs.", chokingMember);
                setOrIgnoreBlush("High");
                CharacterSetFacialExpression(Player, "Eyes", "Scared");
                break;
            case 4:
                clearTimeout(this.handChokeTimeout);
                this.StartPassout(PassoutReason.HAND, chokingMember, 30000);
                break;
            default:
                break;
        }
    }

    ReleaseHandChoke(chokingMember: Character | null, showEmote: boolean = true) {
        if (this.handChokeModifier > 0) {
            if (!!chokingMember && showEmote)
                SendAction("%NAME% gasps in relief as %OPP_NAME% releases their pressure on %POSSESSIVE% neck.", chokingMember);
            this.handChokeModifier = 0;
            if (this.totalChokeLevel < 4) {
                clearTimeout(this.chokeTimeout);
                this.isPassingOut = false;
            }
            // If collar still tight, wait just a second and ping an event as a "helpful" reminder
            if (this.settings.chokeLevel > 0 && showEmote)
                setTimeout(() => this.ChokeEvent(), 1000);
        }
    }

    ForceReleasePlugs() {
        InventoryRemove(Player, "ItemNose");
        this.isPluggedUp = false;
        ChatRoomCharacterUpdate(Player);
    }

    CanActivate(sender: Character | null) {
        var currentCollarObj = InventoryGet(Player, "ItemNeck");
        if (!currentCollarObj)
            return false; // Cannot choke if no collar on
        var currentCollar = <CollarModel>{
            name: currentCollarObj.Craft?.Name ?? currentCollarObj.Asset.Name,
            creator: currentCollarObj.Craft?.MemberNumber ?? 0
        };
        return !!sender &&
                (this.allowedChokeMembers.length == 0 || this.allowedChokeMembers.indexOf(sender?.MemberNumber ?? 0) >= 0) &&
                currentCollar.name == this.settings.collar?.name &&
                currentCollar.creator == this.settings.collar?.creator
    }

    IncreaseCollarChoke() {
        if (isNaN(this.settings.chokeLevel))
            this.settings.chokeLevel = 0;
        if (this.settings.chokeLevel == 4)
            return;
        this.settings.chokeLevel = Math.min(this.settings.chokeLevel + 1, 4);
        AudioPlaySoundEffect("HydraulicLock");
        this.IncreaseArousal();

        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        switch (this.totalChokeLevel) {
            case 1:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME%'s eyes flutter as %POSSESSIVE% collar starts to tighten around %POSSESSIVE% neck with a quiet hiss.");
                setOrIgnoreBlush("Low");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 2:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% gasps for air as %POSSESSIVE% collar presses in around %POSSESSIVE% neck with a hiss.");
                setOrIgnoreBlush("Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Surprised");
                break;
            case 3:
                this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
                SendAction("%NAME%'s face runs flush, choking as %POSSESSIVE% collar hisses, barely allowing any air to %POSSESSIVE% lungs.");
                setOrIgnoreBlush("High");
                CharacterSetFacialExpression(Player, "Eyes", "Scared");
                break;
            case 4:
                this.StartPassout();
                break;
            default:
                break;
        }

        settingsSave();
    }

    DecreaseCollarChoke() {
        if (this.settings.chokeLevel <= 0) {
            this.settings.chokeLevel = 0;
            return;
        }

        this.isPassingOut = false;
        AudioPlaySoundEffect("Deflation");
        this.settings.chokeLevel--;
        if (this.settings.chokeLevel > 0)
        this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);

        switch (this.totalChokeLevel) {
            case 3:
                this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
                SendAction("%NAME% chokes and gasps desperately as %POSSESSIVE% collar slowly releases some pressure.");
                setOrIgnoreBlush("High");
                CharacterSetFacialExpression(Player, "Eyes", "Lewd");
                break;
            case 2:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME%'s collar opens a little as %PRONOUN% lets out a moan, gulping for air.");
                setOrIgnoreBlush("Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 1:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% whimpers thankfully as %POSSESSIVE% collar reduces most of its pressure around %POSSESSIVE% neck.");
                setOrIgnoreBlush("Low");
                CharacterSetFacialExpression(Player, "Eyes", null);
                break;
            case 0:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% takes a deep breath as %POSSESSIVE% collar releases its grip with a hiss.");
                setOrIgnoreBlush("Default");
                break;
            default:
                break;
        }

        settingsSave();
    }

    ReleaseCollar() {
        if (this.settings.chokeLevel > 0)
            SendAction("%NAME% gulps thankfully as the threat to %POSSESSIVE% airway is removed.")
        this.ResetChoke();
    }

    ResetChoke() {
        this.settings.chokeLevel = 0;
        clearTimeout(this.chokeTimeout);
        this.isPassingOut = false;
        settingsSave();
    }

    plugReleaseEmotes = [
        "%NAME% gasps and gulps for air.",
        "%NAME%'s lungs scream as %PRONOUN% gasps desparately.",
        "%NAME% groans as air is allowed back into their lungs.",
        "%NAME% gasps for air with a whimper."
    ]

    ResetPlugs() {
        CharacterSetFacialExpression(Player, "Eyes", this.eyesAtTimeOfPassout);
        CharacterSetFacialExpression(Player, "Blush", this.blushAtTimeOfPassout);
        SendAction(this.plugReleaseEmotes[getRandomInt(this.plugReleaseEmotes.length)]);
        clearTimeout(this.chokeTimeout);
        this.isPassingOut = false;
    }

    isPassingOut: boolean = false;
    eyesAtTimeOfPassout: string = "Default";
    blushAtTimeOfPassout: string = "Default";

    StartPassout(reason: PassoutReason = PassoutReason.COLLAR, chokingMember: Character | null = null, totalTime: number = 60000) {
        //console.info("Start Passout, " + totalTime + "ms total time. Date.now() = " + Date.now());
        this.passout1Timer = totalTime * .5; // -- 1/4 of the total tiem in stage 1
        this.passout2Timer = totalTime * .3; // -- 3/10 of the total tiem in stage 1
        this.passout3Timer = totalTime * .2; // -- 1/5 of the total tiem in stage 1
        //console.info("Timer1 = " + this.passout1Timer + " Timer2 = " + this.passout2Timer + " Timer3 = " + this.passout3Timer);
        this.isPassingOut = true;
        setOrIgnoreBlush("VeryHigh");
        this.eyesAtTimeOfPassout = WardrobeGetExpression(Player)?.Eyes;
        this.blushAtTimeOfPassout = WardrobeGetExpression(Player)?.Blush;
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        this.setChokeTimeout(() => this.Passout1(reason, chokingMember), this.passout1Timer);

        if (reason == PassoutReason.COLLAR)
            SendAction("%NAME%'s eyes start to roll back, gasping and choking as %POSSESSIVE% collar presses in tightly and completely with a menacing hiss.");
        else if (reason == PassoutReason.HAND)
            SendAction("%NAME%'s eyes start to roll back with a groan as %OPP_NAME% completely closes %POSSESSIVE% airway with their hand.", chokingMember);
        else if (reason == PassoutReason.PLUGS)
            SendAction("%NAME%'s eyes flutter with a groan, unable to get any air to %POSSESSIVE% lungs.");
    }

    Passout1(reason: PassoutReason = PassoutReason.COLLAR, chokingMember: Character | null = null) {
        //console.info("Stage 2, timeout = " + this.passout1Timer + " Date.now() = " + Date.now());
        this.IncreaseArousal();
        setOrIgnoreBlush("Extreme");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        this.setChokeTimeout(() => this.Passout2(reason, chokingMember), this.passout2Timer);

        if (reason == PassoutReason.COLLAR)
            SendAction("%NAME% chokes and spasms, %POSSESSIVE% collar holding tight.");
        else if (reason == PassoutReason.HAND)
            SendAction("%NAME% chokes and spasms, %OPP_NAME% gripping %POSSESSIVE% throat relentlessly.", chokingMember);
        else if (reason == PassoutReason.PLUGS)
            SendAction("%NAME% chokes and spasms, struggling in their gag.");
    }

    Passout2(reason: PassoutReason = PassoutReason.COLLAR, chokingMember: Character | null = null) {
        //console.info("Stage 3, timeout = " + this.passout2Timer + " Date.now() = " + Date.now());
        this.IncreaseArousal();
        setOrIgnoreBlush("ShortBreath");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        this.setChokeTimeout(() => this.Passout3(reason, chokingMember), this.passout3Timer);

        if (reason == PassoutReason.COLLAR) {
            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as the collar hisses impossibly tighter.");
            AudioPlaySoundEffect("HydraulicLock");
        }
        else if (reason == PassoutReason.HAND)
            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as %OPP_NAME% clenches around their throat even tighter.", chokingMember);
        else if (reason == PassoutReason.PLUGS)
            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as their lungs scream for air.", chokingMember);
    }

    Passout3(reason: PassoutReason = PassoutReason.COLLAR, chokingMember: Character | null = null) {
        //console.info("Stage 4, timeout = " + this.passout3Timer + " Date.now() = " + Date.now());
        this.IncreaseArousal();
        this.isPassingOut = false;
        CharacterSetFacialExpression(Player, "Blush", "Medium");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Mouth", "Closed");
        clearTimeout(this.chokeTimeout);
        console.info("End Passout. Date.now() = " + Date.now());

        if (reason == PassoutReason.COLLAR) {
            SendAction("As %NAME% collapses unconscious, %POSSESSIVE% collar releases all of its pressure with a long hiss.");
            AudioPlaySoundEffect("Deflation");
            this.ResetChoke();
        }
        else if (reason == PassoutReason.HAND) {
            SendAction("As %NAME% collapses unconscious, %OPP_NAME% releases %POSSESSIVE% neck.", chokingMember);
            this.ReleaseHandChoke(chokingMember);
        }
        else if (reason == PassoutReason.PLUGS) {
            SendAction("As %NAME% slumps unconscious, %POSSESSIVE% nose plugs fall out.", chokingMember);
            this.ForceReleasePlugs();
        }
    }

    ChokeEvent() {
        if (!this.wearingCorrectCollar)
            return;
        // only activate 1/4 times triggered unless at high level
        if (this.settings.chokeLevel > 2)
            this.ActivateChokeEvent();
        else if (this.settings.chokeLevel == 2 && getRandomInt(8) == 0)
            this.ActivateChokeEvent();
        else if (this.settings.chokeLevel == 1 && getRandomInt(15) == 0)
            this.ActivateChokeEvent();
    }

    ActivateChokeEvent() {
        const ChokeEvents = {
            low: [
                "%NAME% coughs as %POSSESSIVE% collar pushes against %POSSESSIVE% throat.",
                "%NAME% gulps as %PRONOUN% feels the tight collar around %POSSESSIVE% neck.",
                "%NAME% shifts nervously in %POSSESSIVE% tight collar.",
                "%NAME% trembles, very conscious of the tight collar around %POSSESSIVE% neck.",
                "%NAME% huffs uncomfortably in %POSSESSIVE% tight collar."
            ],
            mid: [
                "%NAME% whimpers pleadingly as %PRONOUN% struggles to take a full breath.",
                "%NAME% chokes against %POSSESSIVE% collar, moaning softly.",
                "%NAME%'s eyes flutter weakly as %POSSESSIVE% collar presses into %POSSESSIVE% neck.",
                "%NAME% tries to focus on breathing, each inhale an effort in %POSSESSIVE% collar."
            ],
            high: [
                "%NAME% splutters and chokes, struggling to breath.",
                "%NAME% grunts and moans, straining to breath.",
                "%NAME%'s eyes have trouble focusing, as %PRONOUN% chokes and gets lightheaded."
            ]
        }
        switch (this.settings.chokeLevel) {
            case 1:
                SendAction(ChokeEvents.low[getRandomInt(ChokeEvents.low.length)]);
                break;
            case 2:
                SendAction(ChokeEvents.mid[getRandomInt(ChokeEvents.mid.length)]);
                break;
            case 3:
                SendAction(ChokeEvents.high[getRandomInt(ChokeEvents.high.length)]);
                break;
            default:
                break;
        }
    }

    IncreaseArousal() {
        ActivitySetArousal(Player, Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + 10));
    }
}