import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getRandomInt, isBind, isCloth, removeCustomEffect, settingsSave, stringIsCompressedItemBundleArray, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { OutfitConfig, OutfitOption, PolymorphOption, SpellDefinition } from "Settings/Models/magic";

export abstract class ItemBundleBaseState extends BaseState {
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

    abstract DoChange(asset: Asset | null, spell: SpellDefinition | null): boolean;

    abstract StripCharacter(skipStore: boolean, spell: SpellDefinition | null, newList: ItemBundle[]): void;

    abstract WearMany(items: ItemBundle[], spell: SpellDefinition | null, isRestore: boolean): void;

    abstract Apply(spell: SpellDefinition, memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState;

    Recover(emote?: boolean | undefined): BaseState {
        super.Recover();
        if (!!this.StoredOutfit) {
            this.StripCharacter(true, null, []);
            this.WearMany(this.StoredOutfit, null, true);
            this.ClearStoredOutfit();
        }
        return this;
    }

    GetConfiguredItemBundles(code: string, filter: (item: ItemBundle) => boolean): ItemBundle[] {
        let items: ItemBundle[] = [];
        if (stringIsCompressedItemBundleArray(code)) {
            items = JSON.parse(LZString.decompressFromBase64(code)) as ItemBundle[];
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
}