import { BC_ItemsToItemBundles, SendAction, addCustomEffect, getCharacter, getRandomInt, isBind, isBody, isCloth, isCosplay, isGenitals, isHair, isPronouns, isSkin, removeCustomEffect, settingsSave, waitFor } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { PolymorphConfig, PolymorphOption, SpellDefinition } from "Settings/Models/magic";
import { ItemBundleBaseState } from "./ItemBundleBaseState";

export class PolymorphedState extends ItemBundleBaseState {
    static CleanItemCode(code: string): string {
        let items = JSON.parse(LZString.decompressFromBase64(code)) as ItemBundle[];
        if (!items || !Array.isArray(items))
            return code;
        items = items.filter(item => PolymorphedState.ItemIsAllowed(item));
        return LZString.compressToBase64(JSON.stringify(items));
    }

    static ItemIsAllowed(item: ItemBundle): boolean {
        let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset)
            return false;
        return PolymorphedState.AssetIsAllowed(asset);
    }

    static AssetIsAllowed(asset: Asset): boolean {
        return isCosplay(asset) || 
            isBody(asset) ||
            isHair(asset) ||
            isSkin(asset) ||
            isGenitals(asset);
    }


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
    
    DoChange(asset: Asset | null, spell: SpellDefinition | null): boolean {
        if (!asset)
            return false;
        if (!spell)
            return PolymorphedState.AssetIsAllowed(asset);
        let config = spell.Polymorph;
        if (!config)
            return false;
        
        let allow = config.IncludeCosplay && isCosplay(asset);
        allow ||= config.IncludeAllBody && isBody(asset);
        allow ||= config.IncludeHair && isHair(asset);
        allow ||= config.IncludeSkin && isSkin(asset);
        allow ||= config.IncludeGenitals && isGenitals(asset);
        
        if ((isGenitals(asset) && !Player?.LSCG?.MagicModule?.allowChangeGenitals) ||
            (isPronouns(asset) && !Player?.LSCG?.MagicModule?.allowChangePronouns))
            allow = false;

        return allow;
    }

    skinColorChangeOnly: string[] = [
        "BodyUpper",
        "BodyLower",
        "Mouth"
    ]

    StripCharacter(skipStore: boolean, spell: SpellDefinition, newList: ItemBundle[] = []) {
        if (!skipStore && !this.StoredOutfit)
            this.SetStoredOutfit();

        const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
        let appearance = Player.Appearance;
        for (let i = appearance.length - 1; i >= 0; i--) {
            const asset = appearance[i].Asset;
            if (this.DoChange(asset, spell)) {
                let newItem = newList.find(x => x.Group == asset.Group.Name);
                if (!spell.Polymorph?.IncludeAllBody && spell.Polymorph?.IncludeSkin && 
                    !!newItem && 
                    this.skinColorChangeOnly.indexOf(asset.Group.Name) > -1) {
                    // Special handling for simple color change.
                    if (asset.Group.Name != "Mouth" || (!!newItem && !!newItem.Color && newItem.Color != "Default"))
                        appearance[i].Color = newItem.Color;
                }
                else if (newList.length == 0 || newList.some(x => x.Group == asset.Group.Name))
                    appearance.splice(i, 1);
            }
        }
    }

    Apply(spell: SpellDefinition, memberNumber?: number | undefined, duration?: number,  emote?: boolean | undefined): BaseState {
        try{
            let outfit = spell.Polymorph;
            if (!outfit)
                return this;
            let outfitList = this.GetConfiguredItemBundles(outfit.Code, item => PolymorphedState.ItemIsAllowed(item));
            if (!!outfitList && typeof outfitList == "object") {
                this.StripCharacter(false, spell, outfitList);
                this.WearMany(outfitList, spell);
                super.Activate(memberNumber, duration, emote);
            }
        }
        catch {
            console.warn("error parsing outfitcode in PolymorphedState: " + spell.Polymorph?.Code);
        }
        return this;
    }

    WearMany(items: ItemBundle[], spell: SpellDefinition, isRestore: boolean = false) {
        items.forEach(item => {
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            if (!!asset && this.DoChange(asset, spell)) {
                //let groupBlocked = InventoryGroupIsBlockedForCharacter(Player, asset.Group.Name);
                let isBlocked = InventoryBlockedOrLimited(Player, {Asset: asset})
                let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);

                let isSkinColorChangeOnly = !spell.Polymorph?.IncludeAllBody && spell.Polymorph?.IncludeSkin && this.skinColorChangeOnly.indexOf(asset.Group.Name) > -1;
                if (isRestore || !(isBlocked || isRoomDisallowed || isSkinColorChangeOnly)) {
                    let newItem = InventoryWear(Player, item.Name, item.Group, item.Color, item.Difficulty, -1, item.Craft, false);
                    if (!!newItem && !!item.Property)
                        newItem.Property = item.Property;
                }
            }
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}