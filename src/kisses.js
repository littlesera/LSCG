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

            var item = data.Dictionary.find(d => d.Tag == "ActivityAsset");
            if (!!item && item.AssetName == "Towel") {
                switch (data.Content) {
                    case "ChatOther-ItemHood-RubItem" :
                    case "ChatSelf-ItemHood-RubItem" :
                        RemoveKissMark("forehead");
                        break;
                    case "ChatOther-ItemMouth-RubItem" :
                    case "ChatSelf-ItemMouth-RubItem" :
                        RemoveKissMark("cheek");
                        break;
                    case "ChatOther-ItemNeck-RubItem" :
                    case "ChatSelf-ItemNeck-RubItem" :
                        RemoveKissMark("neck");
                        break;
                    default :
                        break;
                }
            }
    }
});

function getKisserLipColor(sender) {
    try {
        var mouth = InventoryGet(sender, "Mouth");
        if (!!mouth && mouth.Color != "Default")
            return mouth.Color[0];
        else
            return "Default";
    }
    catch {
        return "Default";
    }
}

function getExistingLipstickMarks() {
    var mask = InventoryGet(Player, "Mask");
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
    if (!!mask && mask.Asset.Name != "Kissmark")
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

export function RemoveKissMark(location) {
    var marks = getExistingLipstickMarks();
    if (!marks)
        return;
    var status = getKissMarkStatus(marks.Property.Type);

    switch (location) {
        case "cheek" :
            status.cheek1 = false;
            status.cheek2 = false;
            break;
        case "forehead" :
            status.forehead = false;
            break;
        case "neck" :
            status.neck1 = false;
            status.cheek2 = false;
            break;
        default :
            break;
    }

    marks.Property.Type = getKissMarkTypeString(status);
    ChatRoomCharacterUpdate(Player);
}

export function AddKissMark(sender, location) {
    var color = getKisserLipColor(sender);
    if (color == "Default")
        return; // No lipstick

    var marks = getExistingLipstickMarks();
    if (!marks) {
        marks = addLipstickMarks();
    }
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