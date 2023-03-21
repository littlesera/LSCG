import { OnActivity, SendAction, getRandomInt } from "./utils";

OnActivity(100, "Little Sera Kisses", (data, msg, sender, metadata) => {
    let target = data.Dictionary.find(d => d.Tag == "TargetCharacter");
    if (!!target && 
        target.MemberNumber == Player.MemberNumber) {
            if (wearingMask())
                return;
            switch (data.Content) {
                case "ChatOther-ItemNeck-Kiss":
                    AddKissMark(sender, "neck");
                    break;
                case "ChatOther-ItemMouth-PoliteKiss":
                    AddKissMark(sender, "cheek");
                    break;
                case "ChatOther-ItemHead-Kiss":
                    AddKissMark(sender, "forehead");
                    break;
                default:
                    break;
            }
    }
});

function getKisserLipColor(sender) {
    try {
        var mouth = GetInventory(sender, "Mouth");
        if (!!mouth)
            return mouth.Color[0];
        else
            return "Default";
    }
    catch {
        return "Default";
    }
}

function getExistingLipstickMarks() {
    var mask = GetInventory(sender, "Mask");
    if (!!mask && mask.Asset.Name == "Kissmark")
        return mask;
    else
        return null;
}

function addLipstickMarks() {
    InventoryRemove(Player, "Mask");
    InventoryWear(Player, "Kissmark", "Mask", "Default", 1, Player.MemberNumber, null, true);
    var marks = InventoryGet(Player, "Mask");
    marks.Property.Type = "c0r1f0n0l0";
    return marks;
}

function wearingMask() {
    var mask = InventoryGet(Player, "Mask");
    if (!!mask && mask.Name != "Kissmark")
        return true;
    return false;
}

function getKissMarkStatus(typeString) {
    return {
        cheek1: typeString.substring(1,2) == '1',
        cheek2: typeString.substring(3,4) == '0',
        forehead: typeString.substring(5,6) == '1',
        neck1: typeString.substring(7,8) == '1',
        neck2: typeString.substring(9,10) == '1'
    };
}

function getKissMarkTypeString(status) {
    return "c" + (status.cheek1 ? "1" : "0") + 
        "r" + (status.cheek2 ? "0" : "1") + 
        "f" + (status.forehead ? "1" : "0") + 
        "n" + (status.neck1 ? "1" : "0") + 
        "l" + (status.neck2 ? "1" : "0");
}

export function AddKissMark(sender, location) {
    var marks = getExistingLipstickMarks();
    if (!marks) {
        marks = addLipstickMarks();
    }
    var color = getKisserLipColor(sender);
    marks.Color = [color];
    var status = getKissMarkStatus(marks.Property.Type);

    // Adjust marks
    switch (location) {
        case "cheek" :
            if (!status.cheek1)
                status.cheek1 = true;
            else
                status.cheek2 = true;
                CharacterSetFacialExpression(Player, "Blush", "Low");
            break;
        case "forehead" :
            status.forehead = true;
            CharacterSetFacialExpression(Player, "Blush", "Low");
            break;
        case "neck" :
            if (!status.neck1)
                status.neck1 = true;
            else
                status.cheek2 = true;
            CharacterSetFacialExpression(Player, "Blush", "Medium");
            break;
        default :
            break;
    }

    marks.Property.Type = getKissMarkTypeString(status);
    ChatRoomCharacterUpdate(Player);
}