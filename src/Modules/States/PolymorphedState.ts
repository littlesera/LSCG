import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getRandomInt, isBind, isBody, isCloth, isCosplay, removeCustomEffect, settingsSave, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { PolymorphConfig, PolymorphOption } from "Settings/Models/magic";

export class PolymorphedState extends BaseState {
    Type: LSCGState = "polymorphed";

    Icon(C: OtherCharacter): string {
        return "Icons/Horse.png";
    }
    Label(C: OtherCharacter): string {
        return "Polymorphed";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Wardrobe = "true";
    }

    storedOutfitKey: string = "stored";
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

    DoChange(asset: Asset | null, type: PolymorphOption): boolean {
        if (!asset)
            return false;
        switch(type) {
            case PolymorphOption.cosplay_only:
                return isCosplay(asset) && !(Player.OnlineSharedSettings?.BlockBodyCosplay ?? false);
            case PolymorphOption.body_only:
                return isBody(asset) && (Player.OnlineSharedSettings?.AllowFullWardrobeAccess ?? false);
            case PolymorphOption.both:
                return (isCosplay(asset) && !(Player.OnlineSharedSettings?.BlockBodyCosplay ?? false)) || 
                       (isBody(asset) && (Player.OnlineSharedSettings?.AllowFullWardrobeAccess ?? false));
        }
    }

    StripCharacter(skipStore: boolean, type: PolymorphOption, newList: ItemBundle[] = []) {
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

    Apply(outfit: PolymorphConfig, memberNumber?: number | undefined, emote?: boolean | undefined): void {
        this.Activate(memberNumber, emote);
        try{
            let outfitList = JSON.parse(LZString.decompressFromBase64(outfit.Code)) as ItemBundle[];
            if (!!outfitList && typeof outfitList == "object") {
                this.StripCharacter(false, outfit.Option, outfitList);
                this.WearMany(outfitList, outfit.Option);
                super.Activate(memberNumber, emote);
            }
        }
        catch {
            console.warn("error parsing outfitcode in RedressedState: " + outfit.Code);
        }
    }

    Recover(emote?: boolean | undefined): void {
        super.Recover();
        if (!!this.StoredOutfit) {
            this.StripCharacter(true, PolymorphOption.both);
            this.WearMany(this.StoredOutfit, PolymorphOption.both);
            this.ClearStoredOutfit();
        }
    }

    WearMany(items: ItemBundle[], type: PolymorphOption) {
        items.forEach(item => {
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            if (this.DoChange(asset, type)) {
                let newItem = InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, -1, item.Craft, true);
                if (!!newItem && !!item.Property?.LockedBy && InventoryDoesItemAllowLock(newItem)) {
                    let lock = AssetGet(Player.AssetFamily, "ItemMisc", item.Property.LockedBy);
                    if (!!lock) InventoryLock(Player, newItem, {Asset:lock}, item.Property.LockMemberNumber)
                }
            }
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}