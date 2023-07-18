import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetTargetCharacter, OnActivity, removeAllHooksByModule } from "../utils";
import { BaseSettingsModel, LipstickSettingsModel } from "Settings/Models/base";

export class LipstickModule extends BaseModule {

    get defaultSettings() {
        return <LipstickSettingsModel>{
            enabled: false,
            dry: false
        };
    }

    safeword(): void {
        this.RemoveKissMark("all");
    }

    load(): void {
        OnActivity(100, ModuleCategory.Lipstick, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = GetTargetCharacter(data);
            if (!!target && 
                !!sender &&
                !(sender as OtherCharacter).LSCG?.LipstickModule?.dry &&
                target == Player.MemberNumber) {
                    if (this.kissMarkSlotsOccupied())
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
                        case "ChatOther-ItemMouth-GagKiss":
                            this.AddGagKissMark(sender);
                        default:
                            break;
                    }
        
                    var item = data.Dictionary?.find((d: any) => d.Tag == "ActivityAsset");
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
    
    getExistingLipstickMarks(color: ItemColor | undefined) {
        let slots = [InventoryGet(Player, "Mask"), InventoryGet(Player, "ClothAccessory")].filter(s => !!s && s.Asset.Name == "Kissmark");

        var matching = slots.find(s => Array.isArray(s?.Color) && Array.isArray(color) && s?.Color[0] == color[0]);
        if (!!matching)
            return matching;

        if (slots.length < 2)
            return this.addLipstickMarks();
        else 
            return slots[0];
    }
    
    addLipstickMarks() {
        let slot = "Mask";
        var mask = InventoryGet(Player, "Mask");
        if (!!mask){
            slot = "ClothAccessory";
        }

        let final = InventoryGet(Player, slot);
        if (!final) {
            InventoryRemove(Player, slot);
            InventoryWear(Player, "Kissmark", slot, "Default", 1, Player.MemberNumber ?? 0, undefined, true);
            var marks = InventoryGet(Player, slot);
            if (!!marks && !!marks.Property)
                marks.Property.Type = "c0r1f0n0l0";
            return marks;
        } else return undefined;
    }
    
    kissMarkSlotsOccupied() {
        var mask = InventoryGet(Player, "Mask");
        var acc = InventoryGet(Player, "ClothAccessory");
        if (!!mask && mask.Asset.Name != "Kissmark" && !!acc && acc.Asset.Name != "Kissmark")
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

    RemoveKissMark(location: "cheek" | "forehead" | "neck" | "all") {
        var marks = [InventoryGet(Player, "Mask"), InventoryGet(Player, "ClothAccessory")].filter(m => !!m && m.Asset.Name == "Kissmark")
        if (!marks || marks.length <= 0)
            return;

        marks.forEach(mark => {
            var status = this.getKissMarkStatus(mark?.Property?.Type ?? "c0r1f0n0l0");

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
                    status.neck2 = false;
                    break;
                case "all" :
                    status.cheek1 = false;
                    status.cheek2 = false;
                    status.forehead = false;
                    status.neck1 = false;
                    status.neck2 = false;
                default :
                    break;
            }
        
            if (!!mark && !!mark.Property)
                mark.Property.Type = this.getKissMarkTypeString(status);
        })
        
        if (location == "cheek" || location == "all")
            this.removeGagKissMark();

        ChatRoomCharacterUpdate(Player);
    }
    
    AddKissMark(sender: Character, location: string) {
        var color = this.getKisserLipColor(sender);
        if (color == "Default")
            return; // No lipstick
    
        var marks = this.getExistingLipstickMarks(color);
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
                break;
            case "forehead" :
                status.forehead = true;
                break;
            case "neck" :
                if (!status.neck1)
                    status.neck1 = true;
                else
                    status.neck2 = true;
                break;
            default :
                break;
        }
    
        if (!!marks && !!marks.Property)
            marks.Property.Type = this.getKissMarkTypeString(status);
        ChatRoomCharacterUpdate(Player);
    }

    AddGagKissMark(sender: Character) {
        var color = this.getKisserLipColor(sender);
        if (color == "Default")
            return; // No lipstick

        var existingItem = InventoryGet(Player, "ItemMouth3");
        if (!!existingItem && existingItem.Asset.Name != "Kissmark")
            return;

        if (!existingItem) {
            InventoryWear(Player, "Kissmark", "ItemMouth3", "Default", 1, Player.MemberNumber ?? 0, undefined, true);
            ChatRoomCharacterUpdate(Player);
            existingItem = InventoryGet(Player, "ItemMouth3");
        }

        if (!existingItem)
            return;

        existingItem.Color = color;

        ChatRoomCharacterUpdate(Player);
    }

    removeGagKissMark() {
        var gagKissmark = InventoryGet(Player, "ItemMouth3");
        if (!!gagKissmark && gagKissmark.Asset.Name == "Kissmark")
            InventoryRemove(Player, "ItemMouth3");
    }
}