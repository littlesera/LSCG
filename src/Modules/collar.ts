import { BaseModule } from 'base';
import { CollarSettingsModel } from 'Settings/Models/collar';
import { ModuleCategory, Subscreen } from 'Settings/setting_definitions';
import { settingsSave, SendAction, OnChat, getRandomInt, hookFunction, removeAllHooksByModule, OnActivity, OnAction, setOrIgnoreBlush, getCharacter, hookBCXCurse, isPhraseInString, GetTargetCharacter, GetMetadata, GetDelimitedList } from '../utils';
import { GuiCollar } from 'Settings/collar';

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
        var collar = InventoryGet(Player, "ItemNeck");
        if (!collar)
            return false;

        if (!this.settings.collar || !this.settings.collar.name || this.settings.anyCollar)
            return true;

        // If configured collar is not crafted, let any inherited collar work.
        if (!this.settings.collar.creator) {
            return collar?.Asset.Name == this.settings.collar.name;
        } else {
            var collarName = collar?.Craft?.Name ?? (collar?.Asset.Name ?? "");
            var collarCreator = collar?.Craft?.MemberNumber ?? -1;
            return collarName == this.settings.collar.name && collarCreator == this.settings.collar.creator;
        }
    }

    get settingsScreen(): Subscreen | null {
        return GuiCollar;
    }

    get defaultSettings() {
		return <CollarSettingsModel>{
            enabled: false,
            allowedMembers: Player.Ownership?.MemberNumber + "" ?? "",
            chokeLevel: 0,
            tightTrigger: "tight",
            looseTrigger: "loose",
            collarPurchased: false,
            limitToCrafted: false,
            remoteAccess: false,
            allowSelfLoosening: false,
            allowSelfTightening: false,
            anyCollar: false,
            collar: {},
            immersive: false,
            lockable: false,
            locked: false,
            stats: {
                collarPassoutCount: 0,
                gagPassoutCount: 0,
                handPassoutCount: 0
            }
        };
    }

    safeword(): void {
        this.handChokeModifier = 0;
        this.ResetChoke();
    }

    load(): void {
        OnChat(1, ModuleCategory.Collar, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            this.CheckForTriggers(msg, sender);
        });

        OnAction(6, ModuleCategory.Collar, (data, sender, msg, meta) => {
            var target = GetTargetCharacter(data);
            if (target != Player.MemberNumber)
                return;

            if ((msg == "ActionSwap" || msg == "ActionRemove") && GetMetadata(data)?.GroupName == "ItemNeck") {
                this.ReleaseCollar();
            }
        })

        hookFunction("InventoryRemove", 1, (args, next) => {
            let C: Character = args[0];
            let GroupName: string = args[1];
            if (GroupName == "ItemNeck")
                this.ReleaseCollar();
            next(args);
        }, ModuleCategory.Collar);

        // Detect if choking member is bound
        OnAction(6, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            let meta = GetMetadata(data);
            let target = meta?.TargetMemberNumber;
            let targetMember = meta?.TargetCharacter;
            let groupName = meta?.GroupName;
            if (!!targetMember && target == this.handChokingMember && msg == "ActionUse") {
                if (groupName == "ItemHands" || groupName == "ItemArms") {
                    this.ReleaseHandChoke(targetMember);
                }                
            }
            return;
        })

        let lastCheckedForGags = 0;
        hookFunction("TimerProcess", 1, (args, next) => {
            let now = CommonTime();
            // Check gags every 10 seconds for any missed change..
            if (lastCheckedForGags + 10000 < now) {
                lastCheckedForGags = now;
                this.CheckGagSuffocate("TimerProcess", null);
            }
            return next(args);
        }, ModuleCategory.Collar)

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
            
            let target = GetTargetCharacter(data);
            var targetGroup = GetMetadata(data)?.GroupName;

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
            if (!Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.totalChokeLevel == 3) return [{r: 0, g: 0, b: 0, a: 0.2}];
            else if (this.totalChokeLevel == 4) return [{r: 0, g: 0, b: 0, a: 0.6}];
            return next(args);
        }, ModuleCategory.Collar);
            
        hookFunction("Player.GetBlurLevel", 5, (args, next) => {
            // if (!this.Enabled)
            //     return next(args);
            if (!Player.GraphicsSettings?.AllowBlur)
                return next(args);
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
        let stringList = GetDelimitedList(this.settings.allowedMembers);
        let memberList = stringList.filter(str => !!str && (+str === +str)).map(str => parseInt(str)).filter(id => id != Player.MemberNumber);
        if (this.settings.limitToCrafted && this.settings.collar.creator >= 0)
            memberList.push(this.settings.collar.creator);
        return memberList;
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
        if (!Player.LSCG.MiscModule.gagChokeEnabled)
            return;

        var chokeThreshold = 8;
        var gaspThreshold = 5;

        // slightly lower threshold for pump and pony gag to choke at max level...
        if (msg.indexOf("PumpGag") > -1 || msg.indexOf("ItemMouthPonyGag") > -1) {
            chokeThreshold = 7;
        }

        let gagLevel = SpeechGetTotalGagLevel(Player, true);
        if ((gagLevel >= chokeThreshold && this.IsNosePlugged || 
            (msg.indexOf("PumpGagpumpsTo") > -1 && gagLevel >= 7))) { // allow lower threshold for pump gag, letting it choke when full.
            if (!this.isPassingOut) {
                if (msg.indexOf("PumpInflate") > -1) {
                    SendAction("%NAME%'s eyes widen as %POSSESSIVE% gag inflates to completely fill %POSSESSIVE% throat.");
                }
                this.isPluggedUp = true;
                this.StartPassout(PassoutReason.PLUGS, sender, 125000); // just over 2 minutes to choke out
            }
        } else if (this.isPluggedUp) {
            if (this.isPassingOut && this.settings.chokeLevel < 4)
                this.ResetPlugs();
            else if (gagLevel >= gaspThreshold && this.IsNosePlugged)
                SendAction("%NAME% splutters and gasps for air around %POSSESSIVE% gag.");
            this.isPluggedUp = false;
        }
    }

    get IsNosePlugged(): boolean {
        var item = InventoryGet(Player, "ItemNose");
        if (!item)
            return false;
        
        if (item.Asset.Name == "NosePlugs") {
            if (!item.Craft)
                return true;
            else {
                var name = item.Craft.Name;
                var description = item.Craft.Description;
                var totalString = name + " | " + description;
        
                return !isPhraseInString(totalString, "breathable");
            }
        } else {
            return false;
        }
    }

    setChokeTimeout(f: TimerHandler, delay: number | undefined) {
        clearTimeout(this.chokeTimeout);
        if (typeof f === "string")
            this.chokeTimeout = setTimeout(f, delay);
        else
            this.chokeTimeout = setTimeout(() => f(), delay);
    }

    HandChoke(chokingMember: Character) {        
        if (this.handChokeModifier >= 4 || !Player.LSCG.MiscModule.handChokeEnabled)
            return;
            
        this.handChokingMember = chokingMember.MemberNumber ?? 0;
        this.handChokeModifier = Math.min(this.handChokeModifier + 1, 4);

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
                SendAction("%NAME%'s face runs flush, choking as %OPP_NAME% presses firmly against their neck, barely allowing any air to %POSSESSIVE% lungs.", chokingMember);
                setOrIgnoreBlush("High");
                CharacterSetFacialExpression(Player, "Eyes", "Scared");
                break;
            case 4:
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
            // If collar still tight, wait 2 seconds and ping an event as a "helpful" reminder
            if (this.settings.chokeLevel > 0 && showEmote)
                setTimeout(() => this.ChokeEvent(), 2000);
        }
    }

    ForceReleasePlugs() {
        InventoryRemove(Player, "ItemNose");
        this.isPluggedUp = false;
        ChatRoomCharacterUpdate(Player);
    }

    AllowedMember(member: Character | null, isTighten: boolean): boolean {
        if (!member)
            return false;
        // If self-triggered, check appropriate settings
        if (member.IsPlayer()) {
            if (isTighten && this.settings.allowSelfTightening)
                return true;
            else if (!isTighten && this.settings.allowSelfLoosening)
                return true;
            else
                return false;
        }
        if (this.allowedChokeMembers.length > 0)
            return this.allowedChokeMembers.indexOf(member.MemberNumber ?? 0) >= 0;
        else
            return ServerChatRoomGetAllowItem(member, Player);
    }

    CheckForTriggers(msg: string, sender: Character | null): void {
        // Skip on invalid sender, OOC, or invalid triggers.
        if (!this.settings.tightTrigger || !this.settings.looseTrigger)
            return;

        let tightTriggers = GetDelimitedList(this.settings.tightTrigger);
        let looseTriggers = GetDelimitedList(this.settings.looseTrigger);

        if (tightTriggers.some(trig => isPhraseInString(msg, trig)) && this.AllowedMember(sender, true))
            this.IncreaseCollarChoke();
        else if (looseTriggers.some(trig => isPhraseInString(msg, trig)) && this.AllowedMember(sender, false))
            this.DecreaseCollarChoke();
    }

    IncreaseCollarChoke() {
        if (isNaN(this.settings.chokeLevel))
            this.settings.chokeLevel = 0;
        if (this.settings.chokeLevel == 4)
            return;
        this.settings.chokeLevel = Math.min(this.settings.chokeLevel + 1, 4);
        if (!AudioShouldSilenceSound(true))
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

        settingsSave(true);
    }

    DecreaseCollarChoke() {
        if (this.settings.chokeLevel <= 0) {
            this.settings.chokeLevel = 0;
            return;
        }

        this.isPassingOut = false;
        if (!AudioShouldSilenceSound(true))
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
                setOrIgnoreBlush(null);
                break;
            default:
                break;
        }

        settingsSave(true);
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
        settingsSave(true);
    }

    plugReleaseEmotes = [
        "%NAME% gasps and gulps for air.",
        "%NAME%'s lungs expand hungrily as %PRONOUN% gasps in air.",
        "%NAME% groans as air is allowed back into their lungs.",
        "%NAME% gasps for air with a whimper."
    ]

    ResetPlugs() {
        CharacterSetFacialExpression(Player, "Eyes", this.eyesAtTimeOfPassout);
        CharacterSetFacialExpression(Player, "Blush", this.blushAtTimeOfPassout);
        clearTimeout(this.chokeTimeout);
        this.isPassingOut = false;
        SendAction(this.plugReleaseEmotes[getRandomInt(this.plugReleaseEmotes.length)]);
    }

    isPassingOut: boolean = false;
    eyesAtTimeOfPassout: ExpressionName | null = null;
    blushAtTimeOfPassout: ExpressionName | null = null;

    StartPassout(reason: PassoutReason = PassoutReason.COLLAR, chokingMember: Character | null = null, totalTime: number = 60000) {
        //console.info("Start Passout, " + totalTime + "ms total time. Date.now() = " + Date.now());
        this.passout1Timer = totalTime * .5; // -- 1/4 of the total tiem in stage 1
        this.passout2Timer = totalTime * .3; // -- 3/10 of the total tiem in stage 1
        this.passout3Timer = totalTime * .2; // -- 1/5 of the total tiem in stage 1
        //console.info("Timer1 = " + this.passout1Timer + " Timer2 = " + this.passout2Timer + " Timer3 = " + this.passout3Timer);
        this.isPassingOut = true;
        setOrIgnoreBlush("VeryHigh");
        this.eyesAtTimeOfPassout = WardrobeGetExpression(Player)?.Eyes ?? null;
        this.blushAtTimeOfPassout = WardrobeGetExpression(Player)?.Blush ?? null;
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
            if (!AudioShouldSilenceSound(true))
                AudioPlaySoundEffect("HydraulicLock");
        }
        else if (reason == PassoutReason.HAND)
            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as %OPP_NAME% clenches around their throat even tighter.", chokingMember);
        else if (reason == PassoutReason.PLUGS)
            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as their lungs scream for air.");
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

        if (reason == PassoutReason.COLLAR) {
            SendAction("As %NAME% collapses unconscious, %POSSESSIVE% collar releases all of its pressure with a long hiss.");
            if (!AudioShouldSilenceSound(true))
                AudioPlaySoundEffect("Deflation");
            this.ResetChoke();
            this.settings.stats.collarPassoutCount++;
        }
        else if (reason == PassoutReason.HAND) {
            SendAction("As %NAME% collapses unconscious, %OPP_NAME% releases %POSSESSIVE% neck.", chokingMember);
            this.ReleaseHandChoke(chokingMember);
            this.settings.stats.handPassoutCount++;
        }
        else if (reason == PassoutReason.PLUGS) {
            SendAction("As %NAME% slumps unconscious, %POSSESSIVE% nose plugs fall out.");
            this.ForceReleasePlugs();
            this.settings.stats.gagPassoutCount++;
        }
        settingsSave();
    }

    ChokeEvent() {
        if (!this.Enabled)
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