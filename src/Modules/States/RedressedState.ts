import { getCharacter, isBind, isCloth, parseFromBase64 } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { OutfitOption, SpellDefinition } from "Settings/Models/magic";
import { ItemBundleBaseState } from "./ItemBundleBaseState";

export class RedressedState extends ItemBundleBaseState {
    static CleanItemCode(code: string): string {
        let items = parseFromBase64<ItemBundle[]>(code);
        if (!items || !Array.isArray(items))
            return code;
        items = items.filter(item => RedressedState.ItemIsAllowed(item));
        return LZString.compressToBase64(JSON.stringify(items));
    }

    static ItemIsAllowed(item: ItemBundle): boolean {
        let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset)
            return false;
        return RedressedState.AssetIsAllowed(asset);
    }

    static AssetIsAllowed(asset: Asset): boolean {
        return isCloth(asset) || 
                isBind(asset, []);
    }

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

    DoChange(asset: Asset | null, spell: SpellDefinition | null): boolean {
        if (!asset)
            return false;
        if (!spell)
            return RedressedState.AssetIsAllowed(asset);

        let neckExclusions = Player.LSCG.MagicModule.allowOutfitToChangeNeckItems ? [] : ["ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints"];
        switch(spell.Outfit?.Option) {
            case OutfitOption.clothes_only:
                return isCloth(asset);
            case OutfitOption.binds_only:
                return isBind(asset, neckExclusions);
            case OutfitOption.both:
                return isCloth(asset) || isBind(asset, neckExclusions);
            default:
                return false;
        }
    }

    StripCharacter(skipStore: boolean, spell: SpellDefinition | null, newList: ItemBundle[] = []) {
        if (!skipStore && !this.StoredOutfit)
            this.SetStoredOutfit();

        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const asset = appearance[i].Asset;
            if (this.DoChange(asset, spell)) {
                if (isCloth(asset) || newList.length == 0 || newList.some(x => x.Group == asset.Group.Name))
                    appearance.splice(i, 1);
            }
        }
    }

    Apply(spell: SpellDefinition, memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState {
        try{
            let outfit = spell.Outfit;
            if (!!outfit) {
                let outfitList = this.GetConfiguredItemBundles(outfit.Code, item => RedressedState.ItemIsAllowed(item));
                if (!!outfitList && typeof outfitList == "object") {
                    this.StripCharacter(false, spell, outfitList);
                    this.WearMany(outfitList, spell, false, memberNumber);
                    super.Activate(memberNumber, duration, emote);
                }
            }
        }
        catch {
            console.warn("error parsing outfitcode in RedressedState: " + spell.Outfit?.Code);
        }
        return this;
    }

    WearMany(items: ItemBundle[], spell: SpellDefinition, isRestore: boolean = false, memberNumber: number | undefined = undefined) {
        if (!memberNumber || memberNumber == -1)
            memberNumber = Player.MemberNumber ?? 0;
        let sender = !!memberNumber ? getCharacter(memberNumber) : null;
        items.forEach(item => {
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            if (!!asset && this.DoChange(asset, spell)) {
                let isBlocked = this.InventoryBlockedOrLimited(sender, {Asset: asset});
                let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);
                if (isRestore || !(isBlocked || isRoomDisallowed)) {
                    let newItem = InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, memberNumber, item.Craft, false);
                    if (!!newItem) {
                        if (!!item.Property)
                            newItem.Property = item.Property;
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