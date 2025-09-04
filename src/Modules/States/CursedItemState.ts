import { ApplyItem, canChangeCosplay, CanUnlock, getBCXActiveCurseSlots, getRandomEntry, getRandomInt, isBind, isCloth, isCosplay, isProtectedFromRemoval, isUnderwear, LSCG_SendLocal, parseFromBase64, RemoveItem, SendAction } from "utils";
import { getModule } from "modules";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { CursedItemModule } from "Modules/cursed-item";
import { CursedItemSettingsModel, CursedItemWorn, StripLevel } from "Settings/Models/cursed-item";
import { clamp, isArray, isString, sortBy } from "lodash-es";

// TODO: Design base 'spreading' state more agnostic of 'cursed items'...

export class CursedItemState extends BaseState {
    _settings : CursedItemSettingsModel | undefined;
    get Settings() {
        if (!this._settings)
            this._settings = getModule<CursedItemModule>("CursedItemModule").settings;
        return this._settings;
    }

    // Core Stored variable
    activeOutfitsKey: string = "outfits";
    _activeOutfitsCache: CursedItemWorn[] | undefined = undefined;

    get ActiveOutfits(): CursedItemWorn[] | undefined {
        if (!this._activeOutfitsCache) {
            try {
                this._activeOutfitsCache = parseFromBase64(this.config.extensions[this.activeOutfitsKey]) ?? [];
            }
            catch (e) {
                this._activeOutfitsCache = [];
                this.config.extensions[this.activeOutfitsKey] = LZString.compressToBase64(JSON.stringify([]));
            }
        }
        this._activeOutfitsCache.forEach(item => {
            if (!item.lastTick)
                item.lastTick = 1;
        })
        return this._activeOutfitsCache
    }

    set ActiveOutfits(val: CursedItemWorn[] | undefined) {
        this._activeOutfitsCache = val;
        this.config.extensions[this.activeOutfitsKey] = LZString.compressToBase64(JSON.stringify(val));
    }

    addCurseEmotes: ((item: string) => string)[] = [
        (item) => `%NAME% shivers as a curse washes over %INTENSIVE% from %POSSESSIVE% ${item}`
    ];

    private AddActiveOutfit(newItem: CursedItemWorn) {
        let temp = this.ActiveOutfits;
        newItem.lastTick = CommonTime();
        SendAction(getRandomEntry(this.addCurseEmotes)(newItem.ItemName));
        temp?.push(newItem);
        this.ActiveOutfits = temp;
    }

    allEndEmotes: string[] = [
        `%NAME% lets out a sigh of relief as %POSSESSIVE% curses cease.`
    ];
    curseEndEmotes: ((itemName: string) => string)[] = [
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} dims as it exhausts its energy and falls off %POSSESSIVE% body.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} releases its curse and falls off %POSSESSIVE% body, depleted.`
    ];

    ClearActiveOutfit(curseName: string | undefined = undefined, sync: boolean = false) {
        // Remove item from our list, and perhaps even remove from player? (destroy cursed items when complete/safeword is neat..)
        if (!curseName) {
            this.ActiveOutfits?.forEach(item => {
                let keyItem = this.findWornItem(item);
                if (!!keyItem) {
                    InventoryRemove(Player, keyItem.Asset.Group.Name, false);
                }
            });
            if (sync) SendAction(this.allEndEmotes[getRandomInt(this.allEndEmotes.length)]);
            delete this.config.extensions[this.activeOutfitsKey];
            delete this._activeOutfitsCache;
        }
        else {
            let tempList = this.ActiveOutfits;
            let targetCurse = tempList?.find(c => c.CurseName == curseName);
            if (!!targetCurse) {
                let keyItem = this.findWornItem(targetCurse);
                if (!!keyItem) {
                    SendAction(this.curseEndEmotes[getRandomInt(this.curseEndEmotes.length)](keyItem.Craft?.Name ?? keyItem.Asset.Description ?? "Cursed Item"));
                    InventoryRemove(Player, keyItem.Asset.Group.Name, false);
                }
                tempList?.splice(tempList.findIndex(o => o.CurseName == curseName), 1);
                this.ActiveOutfits = tempList;
            }
        }
        if (sync)
            ChatRoomCharacterUpdate(Player);
    }


    static CleanItemCode(code: string): string {
        let items = parseFromBase64(code) as ItemBundle[];
        if (!items || !Array.isArray(items))
            return code;
        items = items.filter(item => CursedItemState.ItemIsAllowed(item));
        return LZString.compressToBase64(JSON.stringify(items));
    }

    static ItemIsAllowed(item: ItemBundle): boolean {
        let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset)
            return false;
        return CursedItemState.AssetIsAllowed(asset);
    }

    static AssetIsAllowed(asset: Asset): boolean {
        return isCloth(asset) ||
                isBind(asset, []);
    }

    Type: LSCGState = "cursed-item";

    Icon(C: OtherCharacter): string {
        return "Icons/Dress.png";
    }
    Label(C: OtherCharacter): string {
        return "Cursed";
    }

    constructor(state: StateModule) {
        super(state);
    }

    ItemInterval(item: CursedItemWorn): number {
        switch (item.Speed) {
            case "slow":
                return 15 * 60000; // 15 minutes
            case "medium":
                return 1 * 60000; // 1 minute
            case "fast":
                return 10 * 1000; // 10 second
            case "instant":
                return 0; // Instant
            case "custom":
                return clamp(item.CustomSpeed, 1, 3600) * 1000; // custom value must be between 1s and 1h
            default:
                return 60000; // 1 minute default
        }
    }

    // StripCharacter(newList: ItemBundle[] = []) {
    //     const cosplayBlocked = Player.OnlineSharedSettings?.BlockBodyCosplay ?? true;
    //     let appearance = Player.Appearance;
    //     for (let i = appearance.length - 1; i >= 0; i--) {
    //         const item = appearance[i];
    //         const asset = appearance[i].Asset;
    //         if (this.DoChange(asset) && !item.Property?.LockedBy) {
    //             if (isCloth(asset) || newList.length == 0 || newList.some(x => x.Group == asset.Group.Name))
    //                 appearance.splice(i, 1);
    //         }
    //     }
    // }

    findWornItem(cursedItem: CursedItemWorn) {
        return Player.Appearance.find(item => item.Craft?.Name == cursedItem.ItemName && item.Craft?.MemberNumber == cursedItem.Crafter)
    }

    _spreadingCheck: number = 0; // define when the next item should trigger
    Tick(now: number): void {
        if (!this.Active) return;
        let refreshNeeded = false;

        if ((this.ActiveOutfits?.length ?? 0) <= 0) this.Recover();

        //TODO -- On each tick (1s interval) check each active outfitfor their spread speed and if they are due (need to save last tick time)
        //let cursesToCheck = this.ActiveOutfits?.filter(cursedItem => cursedItem.lastTick + this.ItemInterval(cursedItem) < now);
        // When due: 
        this.ActiveOutfits?.forEach(cursedItem => {
            refreshNeeded ||= this.TickCursedItem(now, cursedItem);
        });
        if (refreshNeeded)
            ChatRoomCharacterUpdate(Player);

        super.Tick(now);
    }

    growEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `%NAME% squeaks as %POSSESSIVE% ${key} spreads further across %POSSESSIVE% body, adding ${item}.`,
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} slowly grows and spreads, adding ${item}.`,
        (key, item) => `%NAME% squirms as %POSSESSIVE% ${key} glows and expands, adding ${item}.`
    ];

    growSelfEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `Your [${key}] spreads further across your body, adding [${item}].`,
        (key, item) => `Your [${key}] slowly grows and spreads, adding [${item}].`,
        (key, item) => `Your [${key}] glows and expands, adding [${item}].`
    ];

    stripSelfEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `Your [${key}] removes your [${item}].`,
        (key, item) => `Your [${key}] sizzles as your [${item}] is destroyed.`,
        (key, item) => `Your [${key}] hums slightly, vaporizing your [${item}].`
    ];

    instantEmotes: ((itemName: string) => string)[] = [
        (itemName) => `In a flash, %NAME_POSSESSIVE_DIRECT% ${itemName} grows and engulfs %INTENSIVE%.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} rapidly expands and covers %INTENSIVE%.`,
        (itemName) => `With a squeak, %NAME% is instantly covered by %POSSESSIVE% ${itemName} and its curse.`
    ];

    instantRemoveEmotes: ((itemName: string) => string)[] = [
        (itemName) => `With a sizzle, %NAME_POSSESSIVE_DIRECT% ${itemName} destroys %POSSESSIVE% clothes.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} hums and vaporizes %POSSESSIVE% clothes.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} shreds %POSSESSIVE% clothes.`
    ];

    replaceKeyEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} dims as it exhausts its energy and falls off %POSSESSIVE% body as it is replaced with ${item}.`,
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} releases its curse and falls off %POSSESSIVE% body, replaced by ${item}.`
    ];

    getItemColorString(item: ItemBundle | Item) {
        let itemColor = isString(item.Color) ? item.Color : "Default";
        if (isArray(item.Color) && ((item.Color.length == 1 && item.Color[0] == "Default") || item.Color.length == 0)) {
            itemColor = "Default";
        }
        else if (isArray(item.Color)) {
            itemColor = JSON.stringify(item.Color);
        }
        if (!itemColor || itemColor == "")
            itemColor = "Default";
        return itemColor;
    }

    equateColor(item: ItemBundle, worn: Item): boolean {
        return this.getItemColorString(item) == this.getItemColorString(worn);
    }

    Inexhaustable(item: CursedItemWorn) {
        return item.Inexhaustable && !this.Settings.AlwaysExhaust;
    }

    itemBundleMatch(bundle: ItemBundle, item: Item) {
        return item.Craft?.Name == bundle.Craft?.Name &&
                item.Asset.Name == bundle.Name && 
                item.Asset.Group.Name == bundle.Group &&
                this.equateColor(bundle, item);
    }

    shouldStripItem(item: Item, level: StripLevel): boolean {
        return  !isProtectedFromRemoval(item) &&
                ((isCloth(item, false, false) && !!(level & StripLevel.CLOTHES)) ||
                (isCosplay(item) && !!(level & StripLevel.UNDERWEAR)) ||
                (isUnderwear(item) && !!(level & StripLevel.COSPLAY)));
    }

    TickCursedItem(now: number, cursedItem: CursedItemWorn): boolean {
        let refreshNeeded = false;
        let wornItems = Player.Appearance;
        let keyItem = this.findWornItem(cursedItem);
        //   1) Look for key item and remove active outfit if it is missing
        if (!keyItem) {
            this.ClearActiveOutfit(cursedItem.CurseName);
            refreshNeeded = true;
        } else if (cursedItem.lastTick + this.ItemInterval(cursedItem) < now) {
            let outfitItems = parseFromBase64(cursedItem.OutfitCode) as ItemBundle[];
            let otherWornCursedOutfitItemGroups = this.getAllOtherCursedBundles(cursedItem).map(b => InventoryGet(Player, b.Group)?.Asset.Group.Name).filter(i => !!i).concat(getBCXActiveCurseSlots());

            //  2a) Check for strippable items
            let itemsToStrip = wornItems.filter(item => 
                this.shouldStripItem(item, cursedItem.Strip) &&
                !otherWornCursedOutfitItemGroups.includes(item.Asset.Group.Name) &&
                !outfitItems.some(bundle => this.itemBundleMatch(bundle, item)));
            
            if (!!itemsToStrip && itemsToStrip.length > 0) {
                if (cursedItem.Speed == "instant" || cursedItem.InstaStrip) {
                    // If instant strip all
                    SendAction(getRandomEntry(this.instantRemoveEmotes)(cursedItem.ItemName));
                    itemsToStrip.forEach(item => {
                        RemoveItem(item, cursedItem.Crafter);
                    });
                    itemsToStrip = [];
                } else {
                    let itemToRemove = this.sortStrippableAndSelect(itemsToStrip);
                    let itemName = itemToRemove?.Craft?.Name ?? itemToRemove?.Asset.Description;
                    RemoveItem(itemToRemove, cursedItem.Crafter);
                    LSCG_SendLocal(`<span style="font-size:1.1rem">${getRandomEntry(this.stripSelfEmotes)(cursedItem.ItemName, itemName)}</span>`, false);
                }
                refreshNeeded = true;
            }

            //  2b) Compare active outfit code against Player.Appearance, identify any items missing from current wear
            let itemsToApply = outfitItems.filter(bundle => {
                    return this.itemIsAllowed(bundle, cursedItem.Crafter) &&                                                 // Item allowed to apply
                    (!this.Inexhaustable(cursedItem) || bundle.Group != keyItem.Asset.Group.Name) &&    // Item not key item if inexhaustable (leave key item behind if overlap)
                    !otherWornCursedOutfitItemGroups.includes(bundle.Group) &&
                    !wornItems.some(item => this.itemBundleMatch(bundle, item))
                }
            );
            let replacingKeyItemWhileItemsStillToRemove = itemsToStrip.length > 0 && itemsToApply.length == 1 && itemsToApply[0]?.Group == keyItem.Asset.Group.Name;
            // 3) If no items remain unworn and cursed item is not inexhaustable, remove the key item otherwise pick what to wear
            if ((itemsToStrip?.length <= 0) &&
                (itemsToApply?.length <= 0) && 
                !this.Inexhaustable(cursedItem)) {
                this.ClearActiveOutfit(cursedItem.CurseName);
                refreshNeeded = true;
            } else if (!!itemsToApply && itemsToApply.length > 0 && !replacingKeyItemWhileItemsStillToRemove) {
                if (cursedItem.Speed == "instant") {
                    // If instant wear all
                    if (itemsToApply.length > 0) {
                        SendAction(getRandomEntry(this.instantEmotes)(cursedItem.ItemName));
                        itemsToApply.forEach(item => {
                            ApplyItem(item, cursedItem.Crafter, true, true);
                        });
                        refreshNeeded = true;
                    } else if (!this.Inexhaustable(cursedItem)) {
                        this.ClearActiveOutfit(cursedItem.CurseName);
                        refreshNeeded = true;
                    }
                } else {
                    // Sort bindings to end, followed by key item last, pick an item and wear
                    let itemToWear = this.shuffleSortAndSelect(itemsToApply, keyItem);
                    let replacingKey = keyItem.Asset.Group.Name == itemToWear.Group;
                    if (!!InventoryGet(Player, itemToWear.Group))
                        InventoryRemove(Player, itemToWear.Group);
                    let newItem = ApplyItem(itemToWear, cursedItem.Crafter, true, true);
                    let itemName = newItem?.Craft?.Name ?? newItem?.Asset.Description ?? itemToWear.Craft?.Name ?? itemToWear.Name;
                    if (replacingKey) {
                        SendAction(getRandomEntry(this.replaceKeyEmotes)(cursedItem.ItemName, itemName));
                    } else if (!this.Settings.SuppressEmote && !cursedItem.SuppressEmote) {
                        SendAction(getRandomEntry(this.growEmotes)(cursedItem.ItemName, itemName));
                    } else {
                        LSCG_SendLocal(`<span style="font-size:1.1rem">${getRandomEntry(this.growSelfEmotes)(cursedItem.ItemName, itemName)}</span>`, false);
                    }
                    // //   4) If only one item to wear and cursed item is not inexhaustable, clear the active outfit with an emote. (also remove/destroy key item??)
                    // if (itemsToApply.length <= 1 && !this.Inexhaustable(cursedItem))
                    //     this.ClearActiveOutfit(cursedItem.CurseName);
                    refreshNeeded = true;
                }
            }
            cursedItem.lastTick = now;
        }
        return refreshNeeded;
    }

    Recover(emote?: boolean | undefined, sender?: Character | null): BaseState | undefined {
        // Recover clears all active outfits
        if (!this.Active) {
            return this;
        }

        this.ClearActiveOutfit(undefined, true);
        return super.Recover();
    }

    AddCursedItem(item: CursedItemWorn, memberNumber?: number, duration?: number, emote?: boolean): BaseState | undefined {
        if (!this.checkItemIsValid(item)) return undefined;
        this.AddActiveOutfit(item);
        return this.Activate(memberNumber, duration, emote);
    }

    checkItemIsValid(item: CursedItemWorn) {
        if (!this.Settings || !this.Settings.enabled || !this.Settings.Vulnerable) return false;        
        
        let allowedMember = false;
        switch (this.Settings.Allowed) {
            case "Public": 
                allowedMember = Player.BlackList.indexOf(item.Crafter) == -1;
            case "Friend":
                allowedMember ||= (Player.FriendList?.indexOf(item.Crafter) ?? -1) > -1;
            case "Lover":
                allowedMember ||= Player.IsLoverOfMemberNumber(item.Crafter);
            case "Whitelist":
                allowedMember ||= Player.WhiteList.indexOf(item.Crafter) > -1;
            case "Owner":
                allowedMember ||= Player.IsOwnedByMemberNumber(item.Crafter);
            case "Self":
                allowedMember ||= item.Crafter == Player.MemberNumber;
                break;
        }
        
        return allowedMember;
    }

    getAllOtherCursedBundles(item: CursedItemWorn): ItemBundle[] {
        return this.ActiveOutfits?.filter(o => o.CurseName != item.CurseName)
            .map(o => parseFromBase64<ItemBundle[]>(o.OutfitCode) ?? [])
            .reduce((a, b) => a.concat(b), [])
            .filter((val, ix, arr) => arr.indexOf(val) == ix) ?? [];
    }

    itemIsAllowed(item: ItemBundle, acting: number) {        
        let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset) return false;
        let worn = InventoryGet(Player, item.Group);
        
        let ownerBlocked = asset.OwnerOnly && !Player.IsOwnedByMemberNumber(acting);
        let loverBlocked = asset.LoverOnly && !Player.IsLoverOfMemberNumber(acting);
        let familyBlocked = asset.FamilyOnly && !Player.IsInFamilyOfMemberNumber(acting);

        let isBlocked = asset && InventoryIsPermissionBlocked(Player, asset.DynamicName(Player), asset.Group.Name);
        let isLimited = asset && InventoryIsPermissionLimited(Player, asset.DynamicName(Player), asset.Group.Name);
        let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);
        let slotBlocked = !!worn && !CanUnlock(acting, Player, worn);
        let cosplayBlocked = isCosplay(asset) && !canChangeCosplay(acting, Player);

        return !ownerBlocked && !loverBlocked && !familyBlocked && !isBlocked && !isLimited && !isRoomDisallowed && !slotBlocked && !cosplayBlocked;
    }

    shuffleSortAndSelect(array: ItemBundle[], keyItem: Item): ItemBundle {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        let keyItemIsCollarAcc = keyItem.Asset.Group.Name == "ItemNeckAccessories" || keyItem.Asset.Group.Name == "ItemNeckRestraints";

        let res = sortBy(array, 
            item => item.Group == keyItem.Asset.Group.Name,
            item => (keyItemIsCollarAcc && item.Group == "ItemNeck"),
            item => isBind(item.Group, []), 
            item => AssetGet(Player.AssetFamily ?? "Female3DCG", item.Group, item.Name)?.IsRestraint,
            item => CommonIsNumeric(item.Property?.OverridePriority ?? 0) ? (item.Property?.OverridePriority ?? 0) : Math.max(...Object.values(item.Property?.OverridePriority ?? {}), 0)
        )

        return res[0];
    }

    sortStrippableAndSelect(array: Item[]): Item {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return sortBy(array,
            item => isCloth(item, false, false),
            item => isUnderwear(item),
            item => isCosplay(item),
        )[0];
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}