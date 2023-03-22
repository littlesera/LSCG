import { OnActivity } from "./utils";

OnActivity(100, (data, sender, msg, metadata) => {
    let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
    if (!!target && 
        sender.MemberNumber == Player.MemberNumber && 
        data.Content == "ChatOther-ItemLegs-Sit" &&
        CharacterCanChangeToPose(Player, "Kneel")) {
        CharacterSetActivePose(Player, "Kneel");
    }
});