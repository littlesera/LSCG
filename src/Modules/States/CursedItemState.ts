import { ApplyItem, CanRemoveItem, CanReplaceItem, canChangeCosplay, CanUnlock, getBCXActiveCurseSlots, getRandomEntry, getRandomInt, isBind, isCloth, isCosplay, isUnderwear, LSCG_SendLocal, matchesStripLevel, parseFromBase64, RemoveItem, SendAction } from "utils";
import { getModule } from "modules";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { CursedItemModule } from "Modules/cursed-item";
import { CursedItemSettingsModel, CursedItemWorn, StripLevel } from "Settings/Models/cursed-item";
import { clamp, includes, isArray, isString, remove, sortBy } from "lodash-es";

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
        });
        return this._activeOutfitsCache;
    }

    set ActiveOutfits(val: CursedItemWorn[] | undefined) {
        this._activeOutfitsCache = val;
        this.config.extensions[this.activeOutfitsKey] = LZString.compressToBase64(JSON.stringify(val));
    }

    addCurseEmotes: ((item: string) => string)[] = [
        (item) => `%NAME% shivers as a curse washes over %INTENSIVE% from %POSSESSIVE% ${item}`,
    ];

    private AddActiveOutfit(newItem: CursedItemWorn) {
        const temp = this.ActiveOutfits;
        newItem.lastTick = CommonTime();
        SendAction(getRandomEntry(this.addCurseEmotes)(newItem.ItemName));
        if (this.Settings.BlockExistingGroups)
            newItem.BlockedGroups = AssetGroup.filter(grp => grp.IsItem() && InventoryGroupIsBlocked(Player, grp.Name)).map(grp => grp.Name);
        temp?.push(newItem);
        this.ActiveOutfits = temp;
    }

    allEndEmotes: string[] = [
        "%NAME% lets out a sigh of relief as %POSSESSIVE% curses cease.",
    ];
    curseEndEmotes: ((itemName: string) => string)[] = [
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} dims as it exhausts its energy and falls off %POSSESSIVE% body.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} releases its curse and falls off %POSSESSIVE% body, depleted.`,
    ];

    ClearActiveOutfit(curseName: string | undefined = undefined, sync: boolean = false) {
        // Remove item from our list, and perhaps even remove from player? (destroy cursed items when complete/safeword is neat..)
        if (!curseName) {
            this.ActiveOutfits?.forEach(item => {
                const keyItems = this.findWornItems(item);
                keyItems.forEach(keyItem => {
                    if (keyItem) {
                        InventoryRemove(Player, keyItem.Asset.Group.Name, false);
                    }
                });
            });
            if (sync) LSCG_SendLocal("You let out a sigh of relief as your curses cease.");// SendAction(this.allEndEmotes[getRandomInt(this.allEndEmotes.length)]);
            delete this.config.extensions[this.activeOutfitsKey];
            delete this._activeOutfitsCache;
        }
        else {
            const tempList = this.ActiveOutfits;
            const targetCurse = tempList?.find(c => c.CurseName == curseName);
            if (targetCurse) {
                const keyItems = this.findWornItems(targetCurse);
                keyItems.forEach(keyItem => {
                    if (keyItem) {
                        SendAction(this.curseEndEmotes[getRandomInt(this.curseEndEmotes.length)](keyItem.Craft?.Name ?? keyItem.Asset.Description ?? "Cursed Item"));
                        InventoryRemove(Player, keyItem.Asset.Group.Name, false);
                    }
                });
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
        const asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
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

    findWornItems(cursedItem: CursedItemWorn): Item[] {
        return Player.Appearance.filter(item => item.Craft?.Name == cursedItem.ItemName && item.Craft?.MemberNumber == cursedItem.Crafter);
    }

    _spreadingCheck: number = 0; // define when the next item should trigger
    Tick(now: number): void {
        if (!this.Active || !this.Settings.enabled) return;
        let refreshNeeded = false;
        const activeOutfits = this.ActiveOutfits;

        if ((activeOutfits?.length ?? 0) <= 0) this.Recover();

        //TODO -- On each tick (1s interval) check each active outfitfor their spread speed and if they are due (need to save last tick time)
        //let cursesToCheck = this.ActiveOutfits?.filter(cursedItem => cursedItem.lastTick + this.ItemInterval(cursedItem) < now);
        // When due:
        activeOutfits?.forEach(cursedItem => {
            refreshNeeded ||= this.TickCursedItem(now, cursedItem);
        });
        if (refreshNeeded)
            ChatRoomCharacterUpdate(Player);

        super.Tick(now);
    }

    growEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `%NAME% squeaks as %POSSESSIVE% ${key} spreads further across %POSSESSIVE% body, adding ${item}.`,
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} slowly grows and spreads, adding ${item}.`,
        (key, item) => `%NAME% squirms as %POSSESSIVE% ${key} glows and expands, adding ${item}.`,
    ];

    growSelfEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `Your [${key}] spreads further across your body, adding [${item}].`,
        (key, item) => `Your [${key}] slowly grows and spreads, adding [${item}].`,
        (key, item) => `Your [${key}] glows and expands, adding [${item}].`,
    ];

    stripSelfEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `Your [${key}] removes your [${item}].`,
        (key, item) => `Your [${key}] sizzles as your [${item}] is destroyed.`,
        (key, item) => `Your [${key}] hums slightly, vaporizing your [${item}].`,
    ];

    instantEmotes: ((itemName: string) => string)[] = [
        (itemName) => `In a flash, %NAME_POSSESSIVE_DIRECT% ${itemName} grows and engulfs %INTENSIVE%.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} rapidly expands and covers %INTENSIVE%.`,
        (itemName) => `With a squeak, %NAME% is instantly covered by %POSSESSIVE% ${itemName} and its curse.`,
    ];

    instantSelfEmotes: ((itemName: string) => string)[] = [
        (itemName) => `In a flash, your ${itemName} grows and engulfs you.`,
        (itemName) => `Your ${itemName} rapidly expands and covers you.`,
        (itemName) => `With a squeak, you are instantly covered by your ${itemName} and its curse.`,
    ];

    instantRemoveEmotes: ((itemName: string) => string)[] = [
        (itemName) => `With a sizzle, %NAME_POSSESSIVE_DIRECT% ${itemName} destroys %POSSESSIVE% clothes.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} hums and vaporizes %POSSESSIVE% clothes.`,
        (itemName) => `%NAME_POSSESSIVE_DIRECT% ${itemName} shreds %POSSESSIVE% clothes.`,
    ];

    replaceKeyEmotes: ((key: string, item: string) => string)[] = [
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} dims as it exhausts its energy and falls off %POSSESSIVE% body as it is replaced with ${item}.`,
        (key, item) => `%NAME_POSSESSIVE_DIRECT% ${key} releases its curse and falls off %POSSESSIVE% body, replaced by ${item}.`,
    ];

    getItemColorString(item: ItemBundle | Item) {
        // Outfit codes may hold "#2A2A2A" where the worn item holds ["#2A2A2A"]; compare them as the same color (#838)
        const colors = isString(item.Color) ? [item.Color] : isArray(item.Color) ? item.Color : [];
        if (colors.every(c => !c || c == "Default"))
            return "Default";
        return JSON.stringify(colors);
    }

    equateColor(item: ItemBundle, worn: Item): boolean {
        const incomingColor = this.getItemColorString(item);
        const wornColor = this.getItemColorString(worn);
        if (item.Name == "Kissmark") {
            if (incomingColor == "Default" && wornColor == '["#B42340"]') return true;
        }
        return incomingColor == wornColor;
    }

    Inexhaustable(item: CursedItemWorn) {
        return item.Inexhaustable && !this.Settings.AlwaysExhaust;
    }

    itemBundleMatch(bundle: ItemBundle, item: Item) {
        return item.Craft?.Name == bundle.Craft?.Name &&
                item.Asset.Name == bundle.Name &&
                item.Asset.Group.Name == bundle.Group &&
                // Crafted items take their colors from the craft, so the worn color need not match the bundle's (#776)
                (!!bundle.Craft || this.equateColor(bundle, item));
    }

    slotIsReplaceable(group: AssetGroupName, acting: number): boolean {
        const worn = InventoryGet(Player, group);
        return !worn || CanReplaceItem(worn, acting);
    }

    shouldStripItem(item: Item, level: StripLevel): boolean {
        return matchesStripLevel(item, level);
    }

    TickCursedItem(now: number, cursedItem: CursedItemWorn): boolean {
        let refreshNeeded = false;
        const wornItems = Player.Appearance;
        const keyItem = this.findWornItems(cursedItem)?.[0];
        //   1) Look for key item and remove active outfit if it is missing
        if (!keyItem) {
            this.ClearActiveOutfit(cursedItem.CurseName);
            refreshNeeded = true;
        } else if (cursedItem.lastTick + this.ItemInterval(cursedItem) < now) {
            const outfitItems = parseFromBase64(cursedItem.OutfitCode) as ItemBundle[];
            const otherWornCursedOutfitItemGroups = this.getAllOtherCursedBundles(cursedItem).map(b => InventoryGet(Player, b.Group)?.Asset.Group.Name).filter(i => !!i).concat(getBCXActiveCurseSlots());

            //  2a) Check for strippable items
            let itemsToStrip = wornItems.filter(item =>
                this.shouldStripItem(item, cursedItem.Strip) &&
                !otherWornCursedOutfitItemGroups.includes(item.Asset.Group.Name) &&
                // Skip what can never come off (cosplay-protected, others' locks...) or the curse loops forever (#723, #741)
                CanRemoveItem(item, cursedItem.Crafter) &&
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
                    const itemToRemove = this.sortStrippableAndSelect(itemsToStrip);
                    const itemName = itemToRemove?.Craft?.Name ?? itemToRemove?.Asset.Description;
                    RemoveItem(itemToRemove, cursedItem.Crafter);
                    LSCG_SendLocal(`<span style="font-size:1.1rem">${getRandomEntry(this.stripSelfEmotes)(cursedItem.ItemName, itemName)}</span>`, false);
                }
                refreshNeeded = true;
            }

            //  2b) Compare active outfit code against Player.Appearance, identify any items missing from current wear
            const itemsToApply = outfitItems.filter(bundle => {
                    return !includes(cursedItem.BlockedGroups, bundle.Group) &&
                    this.itemIsAllowed(bundle, cursedItem.Crafter) &&                                                 // Item allowed to apply
                    (!this.Inexhaustable(cursedItem) || bundle.Group != keyItem.Asset.Group.Name) &&    // Item not key item if inexhaustable (leave key item behind if overlap)
                    !otherWornCursedOutfitItemGroups.includes(bundle.Group) &&
                    this.slotIsReplaceable(bundle.Group, cursedItem.Crafter) &&
                    !wornItems.some(item => this.itemBundleMatch(bundle, item));
                },
            );
            const publicEmote = !this.Settings.SuppressEmote && !cursedItem.SuppressEmote;
            const replacingKeyItemWhileItemsStillToRemove = itemsToStrip.length > 0 && itemsToApply.length == 1 && itemsToApply[0]?.Group == keyItem.Asset.Group.Name;
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
                        if (publicEmote) {
                            SendAction(getRandomEntry(this.instantEmotes)(cursedItem.ItemName));
                        }
                        else {
                            LSCG_SendLocal(`<span style="font-size:1.1rem">${getRandomEntry(this.instantSelfEmotes)(cursedItem.ItemName)}</span>`, false);
                        }
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
                    const itemToWear = this.shuffleSortAndSelect(itemsToApply, keyItem);
                    const replacingKey = keyItem.Asset.Group.Name == itemToWear.Group;
                    if (InventoryGet(Player, itemToWear.Group))
                        InventoryRemove(Player, itemToWear.Group);
                    const newItem = ApplyItem(itemToWear, cursedItem.Crafter, true, true);
                    const itemName = newItem?.Craft?.Name ?? newItem?.Asset.Description ?? itemToWear.Craft?.Name ?? itemToWear.Name;
                    if (replacingKey) {
                        SendAction(getRandomEntry(this.replaceKeyEmotes)(cursedItem.ItemName, itemName));
                    } else if (publicEmote) {
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

    _cursesAppliedRecently: string[] = [];

    checkItemIsValid(item: CursedItemWorn) {
        if (!this.Settings || !this.Settings.enabled || !this.Settings.Vulnerable) return false;

        const curseKey = item.CurseName + "|" + item.Crafter;
        if (includes(this._cursesAppliedRecently, curseKey)) {
            return false;
        } else {
            this._cursesAppliedRecently.push(curseKey);
            setTimeout(() => {
                remove(this._cursesAppliedRecently, key => key == curseKey);
            }, 1000 * 60 * 1); // Store applied curses for 1 minute...
        }

        let allowedMember = false;
        switch (this.Settings.Allowed) {
            case "Public":
                allowedMember = Player.BlackList.indexOf(item.Crafter) == -1;
            // falls through: each level also allows every stricter level
            case "Friend":
                allowedMember ||= (Player.FriendList?.indexOf(item.Crafter) ?? -1) > -1;
            // falls through
            case "Lover":
                allowedMember ||= Player.IsLoverOfMemberNumber(item.Crafter);
            // falls through
            case "Whitelist":
                allowedMember ||= Player.WhiteList.indexOf(item.Crafter) > -1;
            // falls through
            case "Owner":
                allowedMember ||= Player.IsOwnedByMemberNumber(item.Crafter);
            // falls through
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
        const asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
        if (!asset) return false;
        const worn = InventoryGet(Player, item.Group);

        const ownerBlocked = asset.OwnerOnly && !Player.IsOwnedByMemberNumber(acting);
        const loverBlocked = asset.LoverOnly && !Player.IsLoverOfMemberNumber(acting);
        const familyBlocked = asset.FamilyOnly && !Player.IsInFamilyOfMemberNumber(acting);

        const isBlocked = asset && InventoryIsPermissionBlocked(Player, asset.DynamicName(Player), asset.Group.Name);
        const isLimited = asset && InventoryIsPermissionLimited(Player, asset.DynamicName(Player), asset.Group.Name);
        const isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);

        const isLocked = !!worn && !CanUnlock(acting, Player, worn);
        const cosplayBlocked = isCosplay(asset) && !canChangeCosplay(acting, Player);

        return !ownerBlocked && !loverBlocked && !familyBlocked && !isBlocked && !isLimited && !isRoomDisallowed && !isLocked && !cosplayBlocked;
    }

    shuffleSortAndSelect(array: ItemBundle[], keyItem: Item): ItemBundle {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        const keyItemIsCollarAcc = keyItem.Asset.Group.Name == "ItemNeckAccessories" || keyItem.Asset.Group.Name == "ItemNeckRestraints";

        const res = sortBy(array,
            item => item.Group == keyItem.Asset.Group.Name,
            item => (keyItemIsCollarAcc && item.Group == "ItemNeck"),
            item => isBind(item.Group, []),
            item => AssetGet(Player.AssetFamily ?? "Female3DCG", item.Group, item.Name)?.IsRestraint,
            item => CommonIsNumeric(item.Property?.OverridePriority ?? 0) ? (item.Property?.OverridePriority ?? 0) : Math.max(...Object.values(item.Property?.OverridePriority ?? {}), 0),
        );

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