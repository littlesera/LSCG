import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, removeAllHooksByModule } from "../utils";

export class LipstickModule extends BaseModule {
    load(): void {
        OnActivity(100, ModuleCategory.Lipstick, (data, sender, msg, metadata) => {
            let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
            if (!!target && 
                !!sender &&
                target.MemberNumber == Player.MemberNumber) {
                    if (this.wearingMask())
                        return;
                    switch (data.Content) {
                        case "ChatOther-ItemNeck-Kiss":
                            this.AddKissMark(sender, "neck");
                            break;
                        case "ChatOther-ItemMouth-PoliteKiss":
                            this.AddKissMark(sender, "cheek");
                            break;
                        case "ChatOther-ItemHead-Kiss":
                            this.AddKissMark(sender, "forehead");
                            break;
                        default:
                            break;
                    }
        
                    var item = data.Dictionary.find((d: any) => d.Tag == "ActivityAsset");
                    if (!!item && item.AssetName == "Towel") {
                        switch (data.Content) {
                            case "ChatOther-ItemHood-RubItem" :
                            case "ChatSelf-ItemHood-RubItem" :
                                this.RemoveKissMark("forehead");
                                break;
                            case "ChatOther-ItemMouth-RubItem" :
                            case "ChatSelf-ItemMouth-RubItem" :
                                this.RemoveKissMark("cheek");
                                break;
                            case "ChatOther-ItemNeck-RubItem" :
                            case "ChatSelf-ItemNeck-RubItem" :
                                this.RemoveKissMark("neck");
                                break;
                            default :
                                break;
                        }
                    }
            }
        });
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Lipstick);
    }

    getKisserLipColor(sender: Character): ItemColor | undefined {
        try {
            var mouth = InventoryGet(sender, "Mouth");
            if (!!mouth && mouth.Color && mouth.Color != "Default")
                return mouth.Color;
            else
                return "Default";
        }
        catch {
            return "Default";
        }
    }
    
    getExistingLipstickMarks() {
        var mask = InventoryGet(Player, "Mask");
        if (!!mask && mask.Asset.Name == "Kissmark")
            return mask;
        else
            return null;
    }
    
    addLipstickMarks() {
        InventoryRemove(Player, "Mask");
        InventoryWear(Player, "Kissmark", "Mask", "Default", 1, Player.MemberNumber ?? 0, null, true);
        var marks = InventoryGet(Player, "Mask");
        if (!!marks && !!marks.Property)
            marks.Property.Type = "c0r1f0n0l0";
        return marks;
    }
    
    wearingMask() {
        var mask = InventoryGet(Player, "Mask");
        if (!!mask && mask.Asset.Name != "Kissmark")
            return true;
        return false;
    }
    
    getKissMarkStatus(typeString: string) {
        return {
            cheek1: typeString.substring(1,2) == '1',
            cheek2: typeString.substring(3,4) == '0',
            forehead: typeString.substring(5,6) == '1',
            neck1: typeString.substring(7,8) == '1',
            neck2: typeString.substring(9,10) == '1'
        };
    }
    
    getKissMarkTypeString(status: any) {
        return "c" + (status.cheek1 ? "1" : "0") + 
            "r" + (status.cheek2 ? "0" : "1") + 
            "f" + (status.forehead ? "1" : "0") + 
            "n" + (status.neck1 ? "1" : "0") + 
            "l" + (status.neck2 ? "1" : "0");
    }
    
    RemoveKissMark(location: string) {
        var marks = this.getExistingLipstickMarks();
        if (!marks)
            return;
        var status = this.getKissMarkStatus(marks?.Property?.Type ?? "c0r1f0n0l0");
    
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
    
        if (!!marks && !!marks.Property)
            marks.Property.Type = this.getKissMarkTypeString(status);
        ChatRoomCharacterUpdate(Player);
    }
    
    AddKissMark(sender: Character, location: string) {
        var color = this.getKisserLipColor(sender);
        if (color == "Default")
            return; // No lipstick
    
        var marks = this.getExistingLipstickMarks();
        if (!marks)
            marks = this.addLipstickMarks();
        if (!marks)
            return;
    
        marks.Color = color;
        var status = this.getKissMarkStatus(marks?.Property?.Type ?? "c0r1f0n0l0");
    
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
    
        if (!!marks && !!marks.Property)
            marks.Property.Type = this.getKissMarkTypeString(status);
        ChatRoomCharacterUpdate(Player);
    }
}