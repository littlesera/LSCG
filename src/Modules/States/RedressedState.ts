import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getRandomInt, removeCustomEffect, settingsSave, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class RedressedState extends BaseState {
    Type: LSCGState = "deaf";

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

    StripCharacter(skipStore: boolean = false) {
        if (!skipStore && !this.StoredOutfit)
            this.SetStoredOutfit();

        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const asset = appearance[i].Asset;
            if (asset.Group.AllowNone && !asset.BodyCosplay) {
                appearance.splice(i, 1);
            }
        }

        ChatRoomCharacterUpdate(Player);
    }

    ApplyOutfit(outfitCode: string, memberNumber?: number | undefined, emote?: boolean | undefined): void {
        try{
            let outfitList = JSON.parse(LZString.decompressFromBase64(outfitCode)) as ItemBundle[];
            if (!!outfitList && typeof outfitList == "object") {
                this.StripCharacter();
                this.WearMany(outfitList);
                super.Activate(memberNumber, emote);
            }
        }
        catch {
            console.warn("error parsing outfitcode in RedressedState: " + outfitCode);
        }
    }

    Recover(emote?: boolean | undefined): void {
        super.Recover();
        if (!!this.StoredOutfit) {
            this.StripCharacter(true);
            this.WearMany(this.StoredOutfit);
            this.ClearStoredOutfit();
        }
    }

    WearMany(items: ItemBundle[]) {
        items.forEach(item => {
            InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, -1, item.Craft, true);
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}