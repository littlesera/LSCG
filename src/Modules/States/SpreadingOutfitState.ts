import { isBind, isCloth, SendAction, settingsSave, stringIsCompressedItemBundleArray } from "utils";
import { getModule } from "modules";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { SpreadingOutfitModule } from "Modules/spreading-outfit";
import { SpreadingOutfitSettingsModel, SpreadingOutfitCodeConfig } from "Settings/Models/spreading-outfit";

export class SpreadingOutfitState extends BaseState {
    _settings : SpreadingOutfitSettingsModel | undefined;
    get Settings() {
        if (!this._settings)
            this._settings = getModule<SpreadingOutfitModule>("SpreadingOutfitModule").settings;
        return this._settings;
    }

    // Core Stored variable
    storedOutfitKey: string = "stored-outfit";
    get StoredOutfit(): ItemBundle[] | undefined {
        let ext = this.config.extensions[this.storedOutfitKey];
        if (!ext) return undefined;
        try {
            return JSON.parse(LZString.decompressFromBase64(ext) ?? "");
        }
        catch {
            return undefined;
        }
    }

    SetStoredOutfit(outfitListbundle: ServerItemBundle[]) {
        this.config.extensions[this.storedOutfitKey] = LZString.compressToBase64(JSON.stringify(outfitListbundle));
        settingsSave();
    }

    ClearStoredOutfit() {
        delete this.config.extensions[this.storedOutfitKey];
        settingsSave();
    }


    static CleanItemCode(code: string): string {
        let items = JSON.parse(LZString.decompressFromBase64(code) ?? "") as ItemBundle[];
        if (!items || !Array.isArray(items))
            return code;
        items = items.filter(item => SpreadingOutfitState.ItemIsAllowed(item));
        return LZString.compressToBase64(JSON.stringify(items));
    }

    static ItemIsAllowed(item: ItemBundle): boolean {
        let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset)
            return false;
        return SpreadingOutfitState.AssetIsAllowed(asset);
    }

    static AssetIsAllowed(asset: Asset): boolean {
        return isCloth(asset) ||
                isBind(asset, []);
    }

    Type: LSCGState = "spreading-outfit";

    Icon(C: OtherCharacter): string {
        return "Icons/Dress.png";
    }
    Label(C: OtherCharacter): string {
        return "Outfit Spreading";
    }

    constructor(state: StateModule) {
        super(state);
    }

    DoChange(asset: Asset | null): boolean {
        if (!asset)
            return false;
        return SpreadingOutfitState.AssetIsAllowed(asset);
    }

    StripCharacter(newList: ItemBundle[] = []) {
        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const item = appearance[i];
            const asset = appearance[i].Asset;
            if (this.DoChange(asset) && !item.Property?.LockedBy) {
                if (isCloth(asset) || newList.length == 0 || newList.some(x => x.Group == asset.Group.Name))
                    appearance.splice(i, 1);
            }
        }
    }

    _spreadingCheck: number = 0; // define when the next item should trigger
    Tick(now: number): void {
        if (!this.Active) {
            super.Tick(now);
            return;
        }

        // Trigger next item
        if (this._spreadingCheck == 0 || this._spreadingCheck < now) {
            this._spreadingCheck = now + this.Settings.ItemInterval * 1000;

            if (this.StoredOutfit && this.StoredOutfit.length > 0) {
                let itemList = this.StoredOutfit;
                itemList = this.shuffleArray(itemList);
                this.WearOneMoreItem(itemList);
            }
        }
        super.Tick(now);
    }

    Recover(emote?: boolean | undefined, sender?: Character | null): BaseState {
        if (!this.Active) {
            return this;
        }

        this.Restrictions.Wardrobe = "false";
        this.ClearStoredOutfit();
        super.Recover();
        getModule<SpreadingOutfitModule>("SpreadingOutfitModule").finishingSpreadingState();
        return this;
    }

    Activate(memberNumber?: number, duration?: number, emote?: boolean): BaseState | undefined {
        try {
            if (!this.checkSettingsValid()) return undefined;

            let outfitList = this.GetConfiguredItemBundles(this.getCurrentOutfitFromSettings().Code, item => SpreadingOutfitState.ItemIsAllowed(item));
            if (!!outfitList && typeof outfitList == "object" && outfitList.length > 0) {
                this.SetStoredOutfit(outfitList);
                this._spreadingCheck = 0;
                this.Restrictions.Wardrobe = "true";
                //this.StripCharacter(outfitList);

                return super.Activate(memberNumber, duration, emote);
            }
        }
        catch {
            console.warn("error parsing outfitcode in SpreadingOutfitState: " + this.getCurrentOutfitFromSettings().Code);
        }
        return undefined;
    }

    checkSettingsValid() {
        if (!this.Settings || !this.Settings.Active) return false;
        if (this.Settings.Internal.CurrentOutfitIndex < 1 || this.Settings.Internal.CurrentOutfitIndex > 3) return false;
        let cur_outfit = this.getCurrentOutfitFromSettings();
        if (!cur_outfit || !cur_outfit.Enabled) return false;

        return true;
    }

    getCurrentOutfitFromSettings(): SpreadingOutfitCodeConfig {
        switch (this.Settings.Internal.CurrentOutfitIndex) {
            case 1:
                return this.Settings.Outfit1;
            case 2:
                return this.Settings.Outfit2;
            case 3:
                return this.Settings.Outfit3;
        }
        return this.Settings.Outfit1;
    }

    WearOneMoreItem(outfitListbundle: ServerItemBundle[]) {
        let index = this.selectNextItem(outfitListbundle);
        if (index >= 0) {
            let item = outfitListbundle[index];

            let newItem = InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, Player.MemberNumber ?? 0, item.Craft, false);
            if (!!newItem) {
                if (!!item.Property)
                    newItem.Property = item.Property;
                let itemName = (newItem?.Craft?.Name ?? item.Name);
                SendAction(`%NAME%'s cursed outfit is spreading, adding ${itemName}.`);
                ChatRoomCharacterUpdate(Player);
            }
        }
        else {
            this.Recover();
        }
    }

    selectNextItem(items: ItemBundle[]) {
        let i = 0;
        // Do all clothes 1st
        let priority: "cloth" | "bind" = "cloth";
        while (i < items.length) {
            let item = items[i];
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            let shouldSkipBind = (priority == "cloth" && asset && isBind(asset));
            let itemIsAllowed = this.DoChange(asset);
            let isBlocked = asset && InventoryIsPermissionBlocked(Player, asset.DynamicName(Player), asset.Group.Name);
            let isLimited = asset && InventoryIsPermissionLimited(Player, asset.DynamicName(Player), asset.Group.Name);
            let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);
            //let itemAlreadyWorn = InventoryIsItemInList(Player, item.Group, [item.Name]);
            let slotAlreadyFilled = asset && InventoryGet(Player, asset.Group.Name)?.Asset == asset;
            if (slotAlreadyFilled || shouldSkipBind || itemIsAllowed == false || isBlocked || isLimited || isRoomDisallowed) {
                i++;
                // Do all bind after clothes are done (disabled)
                if (i == items.length && priority == "cloth") {
                    i = 0;
                    priority = "bind";
                }
                continue;
            }

            // If we get here then this the next item to use!
            return i;
        }
        return -1;
    }

    shuffleArray(array: any): any {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
    }

    // Copied from ItemBundleBaseState
    GetConfiguredItemBundles(code: string, filter: (item: ItemBundle) => boolean): ItemBundle[] {
            let items: ItemBundle[] = [];
            if (stringIsCompressedItemBundleArray(code)) {
                items = JSON.parse(LZString.decompressFromBase64(code) ?? "") as ItemBundle[];
            }
            // Code needs to actually be full info here, build it on the source side..
            // else if (CommonIsNumeric(code) && !!Player.Wardrobe) {
            //     let ix = parseInt(code);
            //     if (ix >= 0 && ix < Player.Wardrobe.length)
            //         items = Player.Wardrobe[ix];
            // } else if (code.length <= 70 && typeof mbs !== "undefined") {
            //     items = mbs.wheelOutfits.getByName(code)?.items ?? [];
            // }

            return items.filter(item => filter(item));
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}