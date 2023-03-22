import { OnActivity, SendAction, getRandomInt } from "./utils";
import { hypnoActivated } from "./hypno";

OnActivity(100, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
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
]

const protestBoopReactions = [
    "%NAME% swats at %OPP_NAME%'s hand.",
    "%NAME% covers her nose protectively, squinting at %OPP_NAME%.",
    "%NAME% snatches %OPP_NAME%'s booping finger."
]

const bigProtestBoopReactions = [
    "%NAME%'s nose overloads and shuts down."
]

const boundBoopReactions = [
    "%NAME% struggles in her bindings, huffing.",
    "%NAME% frowns and squirms in her bindings.",
    "%NAME% whimpers in her bondage.",
    "%NAME% groans helplessly.",
    "%NAME% whines and wiggles in her bondage."
]

let boops = 0;
let boopShutdown = false;
let boopDecreaseLoop = setInterval(() => {
    if (boops > 0)
        boops--;
}, 5000);

function BoopReact(booperId: number | undefined) {
    if (boopShutdown || !booperId)
        return;

    let booper = ChatRoomCharacter.find(c => c.MemberNumber == booperId);
    if (!booper)
        return;

    boops++;
    
    if (boops >= 5)
        BigProtestBoopReact(booper);            
    else if (boops >= 3)
        ProtestBoopReact(booper);
    else
        NormalBoopReact();
}

function NormalBoopReact() {
    CharacterSetFacialExpression(Player, "Blush", "Low");
    SendAction(normalBoopReactions[getRandomInt(normalBoopReactions.length)]);
}

function ProtestBoopReact(booper: Character) {
    CharacterSetFacialExpression(Player, "Blush", "Medium");
    CharacterSetFacialExpression(Player, "Eyes", "Daydream");

    if (Player.IsRestrained())
        SendAction(boundBoopReactions[getRandomInt(boundBoopReactions.length)]);
    else
        SendAction(protestBoopReactions[getRandomInt(protestBoopReactions.length)], booper.Nickname);
}

function BigProtestBoopReact(booper: Character) {
    CharacterSetFacialExpression(Player, "Blush", "High");
    CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
    SendAction(bigProtestBoopReactions[getRandomInt(bigProtestBoopReactions.length)]);
    boopShutdown = true;
    setTimeout(() => boopShutdown = false, 30000);
}