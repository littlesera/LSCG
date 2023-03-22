import { BaseModule } from 'base';
import { ModuleCategory } from 'Settings/setting_definitions';
import { settingsSave, parseMsgWords, SendAction, OnChat, getRandomInt, hookFunction, removeAllHooksByModule } from '../utils';

export class CollarModule extends BaseModule {
    load(): void {

        CommandCombine([
            {
                Tag: 'tight',
                Description: ": tighten collar",

                Action: () => {
                    this.IncreaseCollarChoke();
                }
            },
            {
                Tag: 'loose',
                Description: ": loosen collar",

                Action: () => {
                    this.DecreaseCollarChoke();
                }
            }
        ])

        OnChat(600, ModuleCategory.Collar, (data, sender, msg, metadata) => {
            var lowerMsgWords = parseMsgWords(msg);
            if (!!sender && this.allowedChokeMembers.indexOf(sender?.MemberNumber ?? 0) >= 0) {
                if ((lowerMsgWords?.indexOf("tight") ?? -1) >= 0)
                    this.IncreaseCollarChoke();
                else if ((lowerMsgWords?.indexOf("loose") ?? -1) >= 0)
                    this.DecreaseCollarChoke();
            }
        });

        // event on room join
        hookFunction("ChatRoomSync", 4, (args, next) => {
            next(args);
            this.ActivateChokeEvent();
        }, ModuleCategory.Collar);

        hookFunction('ServerSend', 4, (args, next) => {
            // Prevent speech at choke level 4
            if (args[0] == "ChatRoomChat" && args[1].Type == "Chat"){
                if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
                    SendAction("%NAME%'s mouth moves silently.");
                    return null;
                }
                else if (Player.ClubGames.ChokeCollar.chokeLevel > 1) {
                    args[1].Content = SpeechGarbleByGagLevel((Player.ClubGames.ChokeCollar.chokeLevel-1)**2, args[1].Content);
                    return next(args);
                }
                else
                    return next(args);
            }
            else
                return next(args);
        }, ModuleCategory.Collar);

        hookFunction("Player.HasTints", 5, (args, next) => {
            if (Player.ClubGames.ChokeCollar.chokeLevel > 2) return true;
            return next(args);
        }, ModuleCategory.Collar);

        hookFunction("Player.GetTints", 5, (args, next) => {
            if (Player.ClubGames.ChokeCollar.chokeLevel == 3) return [{r: 0, g: 0, b: 0, a: 0.2}];
            else if (Player.ClubGames.ChokeCollar.chokeLevel == 4) return [{r: 0, g: 0, b: 0, a: 0.5}];
            return next(args);
        }, ModuleCategory.Collar);
            
        hookFunction("Player.GetBlurLevel", 5, (args, next) => {
            if (Player.ClubGames.ChokeCollar.chokeLevel == 3) return 2;
            if (Player.ClubGames.ChokeCollar.chokeLevel == 4) return 6;
            return next(args);
        }, ModuleCategory.Collar);

        this.eventInterval = setInterval(() => this.ChokeEvent(), this.chokeEventTimer);

        Player.ClubGames.ChokeCollar = Player.OnlineSettings.ClubGames.ChokeCollar || {chokeLevel: 0};
        settingsSave();

        if (Player.ClubGames.ChokeCollar.chokeLevel > 2) {
            this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
        }
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Collar);
    }

    // Choke Collar Code

    allowedChokeMembers: number[] = [
        96251,
        60504
    ];

    chokeTimeout: number = 0;
    chokeTimer: number = 120000;
    chokeEventTimer: number = 60010;
    passout1Timer: number = 30000;
    passout2Timer: number = 15000;
    passout3Timer: number = 10000;
    eventInterval: number = 0;

    setChokeTimeout(f: TimerHandler, delay: number | undefined) {
        clearTimeout(this.chokeTimeout);
        if (typeof f === "string")
            this.chokeTimeout = setTimeout(f, delay);
        else
            this.chokeTimeout = setTimeout(() => f(), delay);
    }

    IncreaseCollarChoke() {
        if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
            return;
        Player.ClubGames.ChokeCollar.chokeLevel++;
        AudioPlaySoundEffect("HydraulicLock");
        this.IncreaseArousal();
        if (Player.ClubGames.ChokeCollar.chokeLevel < 4) {
            CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
            switch (Player.ClubGames.ChokeCollar.chokeLevel) {
                case 1:
                    clearTimeout(this.chokeTimeout);
                    SendAction("%NAME%'s eyes flutter as her collar starts to tighten around her neck with a quiet hiss.");
                    CharacterSetFacialExpression(Player, "Blush", "Low");
                    CharacterSetFacialExpression(Player, "Eyes", "Sad");
                    break;
                case 2:
                    clearTimeout(this.chokeTimeout);
                    SendAction("%NAME% gasps for air as her collar presses in around her neck with a hiss.");
                    CharacterSetFacialExpression(Player, "Blush", "Medium");
                    CharacterSetFacialExpression(Player, "Eyes", "Surprised");
                    break;
                case 3:
                    this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
                    SendAction("%NAME%'s face runs flush, choking as her collar hisses, barely allowing any air to her lungs.");
                    CharacterSetFacialExpression(Player, "Blush", "High");
                    CharacterSetFacialExpression(Player, "Eyes", "Scared");
                    break;
                default:
                    break;
            }
        }
        else if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
            Player.ClubGames.ChokeCollar.chokeLevel = 4;
            this.StartPassout();
        }

        settingsSave();
    }

    DecreaseCollarChoke() {
        if (Player.ClubGames.ChokeCollar.chokeLevel <= 0) {
            Player.ClubGames.ChokeCollar.chokeLevel = 0;
            return;
        }

        AudioPlaySoundEffect("Deflation");
        Player.ClubGames.ChokeCollar.chokeLevel--;
        if (Player.ClubGames.ChokeCollar.chokeLevel > 0)
        this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);

        switch (Player.ClubGames.ChokeCollar.chokeLevel) {
            case 3:
                this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
                SendAction("%NAME% chokes and gasps desperately as her collar slowly releases some pressure.");
                CharacterSetFacialExpression(Player, "Blush", "High");
                CharacterSetFacialExpression(Player, "Eyes", "Lewd");
                break;
            case 2:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME%'s collar opens a little as she lets out a moan, gulping for air.");
                CharacterSetFacialExpression(Player, "Blush", "Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 1:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% whimpers thankfully as her collar reduces most of its pressure around her neck.");
                CharacterSetFacialExpression(Player, "Blush", "Low");
                CharacterSetFacialExpression(Player, "Eyes", "None");
                break;
            case 0:
                clearTimeout(this.chokeTimeout);
                SendAction("%NAME% takes a deep breath as her collar releases its grip with a hiss.");
                CharacterSetFacialExpression(Player, "Blush", "None");
                break;
            default:
                break;
        }

        settingsSave();
    }

    ResetCollarChoke() {
        Player.ClubGames.ChokeCollar.chokeLevel = 0;
        clearTimeout(this.chokeTimeout);
        settingsSave();
    }

    StartPassout() {
        SendAction("%NAME%'s eyes start to roll back, gasping and choking as her collar presses in tightly and completely with a menacing hiss.");
        CharacterSetFacialExpression(Player, "Blush", "VeryHigh");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        this.setChokeTimeout(this.Passout1, this.passout1Timer);
    }

    Passout1() {
        this.IncreaseArousal();
        SendAction("%NAME% chokes and spasms, her collar holding tight.");
        CharacterSetFacialExpression(Player, "Blush", "Extreme");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        this.setChokeTimeout(this.Passout2, this.passout2Timer);
    }

    Passout2() {
        this.IncreaseArousal();
        SendAction("%NAME% convulses weakly, her eyes rolling back as the collar hisses impossibly tighter.");
        AudioPlaySoundEffect("HydraulicLock");
        CharacterSetFacialExpression(Player, "Blush", "ShortBreath");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        this.setChokeTimeout(this.Passout3, this.passout3Timer);
    }

    Passout3() {
        this.IncreaseArousal();
        SendAction("As %NAME% collapses unconscious, her collar releases all of its pressure with a long hiss.");
        AudioPlaySoundEffect("Deflation");
        CharacterSetFacialExpression(Player, "Blush", "Medium");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Mouth", "Closed");
        clearTimeout(this.chokeTimeout);
        this.ResetCollarChoke();
    }

    ChokeEvent() {
        // only activate 1/4 times triggered unless at high level
        if (Player.ClubGames.ChokeCollar.chokeLevel > 2)
            this.ActivateChokeEvent();
        else if (Player.ClubGames.ChokeCollar.chokeLevel == 2 && getRandomInt(8) == 0)
            this.ActivateChokeEvent();
        else if (Player.ClubGames.ChokeCollar.chokeLevel == 1 && getRandomInt(15) == 0)
            this.ActivateChokeEvent();
    }

    ActivateChokeEvent() {
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
        }
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
            default:
                break;
        }
    }

    IncreaseArousal() {
        ActivitySetArousal(Player, Math.min(99, Player.ArousalSettings?.Progress ?? 0 + 10));
    }
}