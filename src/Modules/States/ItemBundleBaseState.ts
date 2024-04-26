import { BC_ItemsToItemBundles, settingsSave, stringIsCompressedItemBundleArray } from "utils";
import { BaseState } from "./BaseState";
import { SpellDefinition } from "Settings/Models/magic";

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

    abstract WearMany(items: ItemBundle[], spell: SpellDefinition | null, isRestore: boolean, memberNumber: number | undefined): void;

    abstract Apply(spell: SpellDefinition, memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState;

    Recover(emote?: boolean | undefined): BaseState {
        super.Recover();
        if (!!this.StoredOutfit) {
            this.StripCharacter(true, null, []);
            this.WearMany(this.StoredOutfit, null, true, undefined);
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

    // Check if an item is limited or blocked when applied by Sender
    InventoryBlockedOrLimited(Sender: Character | null, Item: Item, ItemType?: string) {
        let Blocked = InventoryIsPermissionBlocked(Player, Item.Asset.DynamicName(Player), Item.Asset.Group.Name, ItemType);
        let Limited = !this.InventoryCheckLimitedPermission(Sender, Item, ItemType);
        return Blocked || Limited;
    }
    
    // Check if Sender has limited permission to the Item on Player
    InventoryCheckLimitedPermission(Sender: Character | null, Item: Item, ItemType?: string) {
        if (!InventoryIsPermissionLimited(Player, Item.Asset.DynamicName(Player), Item.Asset.Group.Name, ItemType)) return true;
        if (!Sender || (Sender.IsPlayer()) || Sender.IsLoverOfPlayer() || Player.IsOwnedByMemberNumber(Sender.MemberNumber!)) return true;
        if ((Player.ItemPermission! < 3) && !(Player.WhiteList.indexOf(Sender.MemberNumber!) < 0)) return true;
        return false;
    }
}