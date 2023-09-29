import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getRandomInt, isBind, isCloth, removeCustomEffect, settingsSave, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { OutfitConfig, OutfitOption } from "Settings/Models/magic";

export class RedressedState extends BaseState {
    Type: LSCGState = "redressed";

    Icon(C: OtherCharacter): string {
        return "Icons/Dress.png";
    }
    Label(C: OtherCharacter): string {
        return "Redressed";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Wardrobe = "true";
    }

    storedOutfitKey: string = "stored-outfit";
    get StoredOutfit(): ItemBundle[] | undefined {
        let ext = this.config.extensions[this.storedOutfitKey];
        if (!ext) return undefined;
        try {
            return JSON.parse(LZString.decompressFromBase64(ext));
        }
        catch {
            return undefined;
        }
    }

    SetStoredOutfit() {
        this.config.extensions[this.storedOutfitKey] = LZString.compressToBase64(JSON.stringify(BC_ItemsToItemBundles(Player.Appearance)));
        settingsSave();
    }

    ClearStoredOutfit() {
        delete this.config.extensions[this.storedOutfitKey];
        settingsSave();
    }

    DoChange(asset: Asset | null, type: OutfitOption): boolean {
        if (!asset)
            return false;
        switch(type) {
            case OutfitOption.clothes_only:
                return isCloth(asset);
            case OutfitOption.binds_only:
                return isBind(asset);
            case OutfitOption.both:
                return isCloth(asset) || isBind(asset);
        }
    }

    StripCharacter(skipStore: boolean, type: OutfitOption, newList: ItemBundle[] = []) {
        if (!skipStore && !this.StoredOutfit)
            this.SetStoredOutfit();

        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const asset = appearance[i].Asset;
            if (this.DoChange(asset, type)) {
                if (isCloth(asset) || newList.length == 0 || newList.some(x => x.Group == asset.Group.Name))
                    appearance.splice(i, 1);
            }
        }
    }

    Apply(outfit: OutfitConfig, memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState {
        try{
            let outfitList = JSON.parse(LZString.decompressFromBase64(outfit.Code)) as ItemBundle[];
            if (!!outfitList && typeof outfitList == "object") {
                this.StripCharacter(false, outfit.Option, outfitList);
                this.WearMany(outfitList, outfit.Option);
                super.Activate(memberNumber, duration, emote);
            }
        }
        catch {
            console.warn("error parsing outfitcode in RedressedState: " + outfit.Code);
        }
        return this;
    }

    Recover(emote?: boolean | undefined): BaseState {
        super.Recover();
        if (!!this.StoredOutfit) {
            this.StripCharacter(true, OutfitOption.both);
            this.WearMany(this.StoredOutfit, OutfitOption.both, true);
            this.ClearStoredOutfit();
        }
        return this;
    }

    WearMany(items: ItemBundle[], type: OutfitOption, isRestore: boolean = false) {
        items.forEach(item => {
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            if (!!asset && this.DoChange(asset, type)) {
                let groupBlocked = InventoryGroupIsBlockedForCharacter(Player, asset.Group.Name);
                let isBlocked = InventoryBlockedOrLimited(Player, {Asset: asset})
                let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);
                if (isRestore || !(groupBlocked || isBlocked || isRoomDisallowed)) {
                    let newItem = InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, -1, item.Craft, false);
                    if (!!newItem) {
                        if (!!item.Property?.LockedBy && InventoryDoesItemAllowLock(newItem)) {
                            let lock = AssetGet(Player.AssetFamily, "ItemMisc", item.Property.LockedBy);
                            if (!!lock) InventoryLock(Player, newItem, {Asset:lock}, item.Property.LockMemberNumber)
                        }
                        if (!!item.Property?.Type && !!newItem.Property)
                            newItem.Property.Type = item.Property.Type;
                    }
                }
            }
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}