import { bcModSDK, waitFor, parseMsgWords, SendAction, OnChat } from './utils';

const ChokeCollar_Version = '0.0.1';

const SDK = bcModSDK.registerMod({
    name: 'ChokeCollar',
    fullName: 'ChokeCollar',
    version: ChokeCollar_Version
});

await waitFor(() => !!Player?.AccountName);
loadCollarSettings();

if(Player.ChokeCollar != null){
    console.log("Choke Collar loaded");
}

window.ChokeCollar_Version = ChokeCollar_Version;

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
])

OnChat(600, "Choke Collar", (data, msg, sender, metadata) => {
    var lowerMsgWords = parseMsgWords(msg);
    if (!!sender && allowedChokeMembers.indexOf(sender.MemberNumber) >= 0) {
        if (lowerMsgWords.indexOf("tight") >= 0)
            IncreaseCollarChoke();
        else if (lowerMsgWords.indexOf("loose") >= 0)
            DecreaseCollarChoke();
    }
})

// *************** Functions *******************
function loadCollarSettings() {
    
}

// Choke Collar Code

allowedChokeMembers = [
    96251,
    60504
];

chokeTimeout = 0;
chokeTimer = 120000;
chokeEventTimer = 60010;
passout1Timer = 30000;
passout2Timer = 15000;
passout3Timer = 10000;

Player.LittleSera = Player.OnlineSettings.LittleSera || {chokeLevel: 0}
settingsSave();

if (Player.LittleSera.chokeLevel > 2) {
    setChokeTimeout(DecreaseCollarChoke, chokeTimer);
}

eventInterval = setInterval(ChokeEvent, chokeEventTimer);

function settingsSave() {
    Player.OnlineSettings.LittleSera = Player.LittleSera
    window.ServerAccountUpdate.QueueData({OnlineSettings: window.Player.OnlineSettings})
}

function setChokeTimeout(f, delay) {
    clearTimeout(chokeTimeout);
    chokeTimeout = setTimeout(f, delay);
}

// event on room join
SDK.hookFunction("ChatRoomSync", 4, (args, next) => {
    next(args);
    ActivateChokeEvent();
});

SDK.hookFunction('ServerSend', 4, (args, next) => {
    // Prevent speech at choke level 4
    if (args[0] == "ChatRoomChat" && args[1].Type == "Chat"){
        if (Player.LittleSera.chokeLevel >= 4) {
            SendAction("%NAME%'s mouth moves silently.");
            return null;
        }
        else if (Player.LittleSera.chokeLevel > 1) {
            args[1].Content = SpeechGarbleByGagLevel((Player.LittleSera.chokeLevel-1)**2, args[1].Content);
            return next(args);
        }
        else
            return next(args);
    }
    else
        return next(args);
});

SDK.hookFunction("Player.HasTints", 5, (args, next) => {
    if (Player.LittleSera.chokeLevel > 2) return true;
    return next(args);
});

SDK.hookFunction("Player.GetTints", 5, (args, next) => {
    if (Player.LittleSera.chokeLevel == 3) return [{r: 0, g: 0, b: 0, a: 0.2}];
    else if (Player.LittleSera.chokeLevel == 4) return [{r: 0, g: 0, b: 0, a: 0.5}];
    return next(args);
});
    
SDK.hookFunction("Player.GetBlurLevel", 5, (args, next) => {
    if (Player.LittleSera.chokeLevel == 3) return 2;
    if (Player.LittleSera.chokeLevel == 4) return 6;
    return next(args);
});

function IncreaseCollarChoke() {
    if (Player.LittleSera.chokeLevel == 4)
        return;
    Player.LittleSera.chokeLevel++;
    AudioPlaySoundEffect("HydraulicLock");
    IncreaseArousal();
    if (Player.LittleSera.chokeLevel < 4) {
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        switch (Player.LittleSera.chokeLevel) {
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
            default:
                break;
        }
    }
    else if (Player.LittleSera.chokeLevel >= 4) {
        Player.LittleSera.chokeLevel = 4;
        StartPassout();
    }

    settingsSave();
}

function DecreaseCollarChoke() {
    if (Player.LittleSera.chokeLevel <= 0) {
        Player.LittleSera.chokeLevel = 0;
        return;
    }

    AudioPlaySoundEffect("Deflation");
    Player.LittleSera.chokeLevel--;
    if (Player.LittleSera.chokeLevel > 0)
        setChokeTimeout(DecreaseCollarChoke, chokeTimer);

    switch (Player.LittleSera.chokeLevel) {
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
        default:
            break;
    }

    settingsSave();
}

function ResetCollarChoke() {
    Player.LittleSera.chokeLevel = 0;
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
    if (Player.LittleSera.chokeLevel > 2)
        ActivateChokeEvent();
    else if (Player.LittleSera.chokeLevel == 2 && getRandomInt(8) == 0)
        ActivateChokeEvent();
    else if (Player.LittleSera.chokeLevel == 1 && getRandomInt(15) == 0)
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
    }
    switch (Player.LittleSera.chokeLevel) {
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

function IncreaseArousal() {
    ActivitySetArousal(Player, Math.min(99, Player.ArousalSettings.Progress + 10));
    Player.BCT.splitOrgasmArousal.arousalProgress = Math.min(Player.BCT.splitOrgasmArousal.arousalProgress + 25, 100);
    BCT_API?.ActivityChatRoomBCTArousalSync(Player);
}