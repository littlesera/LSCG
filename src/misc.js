import { OnActivity } from "./utils";

OnActivity(100, "Little Sera Boops", (data, msg, sender, metadata) => {
    let target = data.Dictionary.find(d => d.Tag == "TargetCharacter");
    if (!!target && 
        sender.MemberNumber == Player.MemberNumber && 
        data.Content == "ChatOther-ItemLegs-Sit" &&
        CharacterCanChangeToPose(Player, "Kneel")) {
        CharacterSetActivePose(Player, "Kneel");
    }
});