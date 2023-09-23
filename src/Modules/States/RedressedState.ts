import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getRandomInt, isBind, isCloth, removeCustomEffect, settingsSave, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { OutfitConfig, OutfitOption } from "Settings/Models/magic";

export class RedressedState extends BaseState {
    Type: LSCGState = "redressed";

    get Icon(): string {
        return "Icons/Dress.png";
    }
    get Label(): string {
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

    StripCharacter(skipStore: boolean, type: OutfitOption) {
        if (!skipStore && !this.StoredOutfit)
            this.SetStoredOutfit();

        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const asset = appearance[i].Asset;
            if (this.DoChange(asset, type)) {
                appearance.splice(i, 1);
            }
        }

        ChatRoomCharacterUpdate(Player);
    }

    ApplyOutfit(outfit: OutfitConfig, memberNumber?: number | undefined, emote?: boolean | undefined): void {
        this.Activate(memberNumber, emote);
        try{
            let outfitList = JSON.parse(LZString.decompressFromBase64(outfit.Code)) as ItemBundle[];
            if (!!outfitList && typeof outfitList == "object") {
                this.StripCharacter(false, outfit.Option);
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
            this.StripCharacter(true, OutfitOption.both);
            this.WearMany(this.StoredOutfit, OutfitOption.both);
            this.ClearStoredOutfit();
        }
    }

    WearMany(items: ItemBundle[], type: OutfitOption) {
        items.forEach(item => {
            let asset = AssetGet("Female3DCG", item.Group, item.Name);
            if (this.DoChange(asset, type))
                InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, -1, item.Craft, true);
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}