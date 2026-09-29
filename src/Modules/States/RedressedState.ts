import { ApplyItem, BC_ItemToItemBundle, getCharacter, isBind, isCloth, matchesStripLevel, parseFromBase64, RemoveItem, settingsSave } from "utils";
import { StripLevel } from "Settings/Models/cursed-item";

interface SlotSnapshotEntry {
    /** What was in the slot before the first speech outfit touched it (null = empty). */
    original: ItemBundle | null;
    /** Asset name the speech outfit left in the slot (null = it emptied the slot by stripping). */
    applied: string | null;
}
type SlotSnapshot = Partial<Record<AssetGroupName, SlotSnapshotEntry>>;
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

        let neckExclusions: AssetGroupItemName[] = Player.LSCG.MagicModule.allowOutfitToChangeNeckItems ? [] : ["ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints"];
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
            console.warn("error parsing outfitcode in RedressedState: " + spell.Outfit?.Key);
        }
        return this;
    }

    slotSnapshotKey: string = "slot-snapshot";

    get SlotSnapshot(): SlotSnapshot | undefined {
        const ext = this.config.extensions[this.slotSnapshotKey];
        return ext ? parseFromBase64<SlotSnapshot>(ext) : undefined;
    }

    set SlotSnapshot(snapshot: SlotSnapshot | undefined) {
        if (!snapshot || Object.keys(snapshot).length === 0) delete this.config.extensions[this.slotSnapshotKey];
        else this.config.extensions[this.slotSnapshotKey] = LZString.compressToBase64(JSON.stringify(snapshot));
    }

    /** Like Apply, but only strips what `strip` asks for; the outfit's items just replace whatever is in their own slots.
     *  Instead of the whole outfit, only the slots this actually changes are remembered, so Recover leaves anything
     *  else alone (e.g. arm binds someone added while a speech-applied gag was on). */
    ApplyAdditive(spell: SpellDefinition, memberNumber: number | undefined, duration: number | undefined, strip: StripLevel): BaseState {
        try {
            const outfitList = this.GetConfiguredItemBundles(spell.Outfit?.Code ?? "", item => RedressedState.ItemIsAllowed(item));
            if (!outfitList || outfitList.length === 0) return this;

            const toStrip = strip === StripLevel.NONE ? [] : Player.Appearance.filter(item => matchesStripLevel(item, strip));
            const candidateGroups = new Set<AssetGroupName>([
                ...outfitList.map(b => b.Group),
                ...toStrip.map(i => i.Asset.Group.Name),
            ]);
            const before = new Map<AssetGroupName, ItemBundle | null>();
            candidateGroups.forEach(g => {
                const worn = InventoryGet(Player, g);
                before.set(g, worn ? BC_ItemToItemBundle(worn) : null);
            });

            toStrip.forEach(item => RemoveItem(item, memberNumber));
            this.WearMany(outfitList, spell, false, memberNumber);

            // Remember only slots that really changed. A slot already in the snapshot (from an earlier speech outfit)
            // keeps its original contents; only what we now expect to find there is updated.
            const snapshot: SlotSnapshot = this.SlotSnapshot ?? {};
            before.forEach((original, group) => {
                const nowName = InventoryGet(Player, group)?.Asset.Name ?? null;
                if (nowName === (original?.Name ?? null)) return;
                const earlier = snapshot[group];
                snapshot[group] = { original: earlier ? earlier.original : original, applied: nowName };
            });
            this.SlotSnapshot = snapshot;
            super.Activate(memberNumber, duration);
        } catch (e) {
            console.warn("error applying outfit in RedressedState: " + spell.Outfit?.Key, e);
        }
        return this;
    }

    /** Puts back only the remembered slots, and only where the slot still holds what the speech outfit left there;
     *  a slot someone else has changed since is theirs now and is left as is. */
    RestoreSlots(): void {
        const snapshot = this.SlotSnapshot;
        if (!snapshot) return;
        for (const [group, entry] of Object.entries(snapshot) as [AssetGroupName, SlotSnapshotEntry][]) {
            const worn = InventoryGet(Player, group);
            if ((worn?.Asset.Name ?? null) !== entry.applied) continue;
            if (worn) RemoveItem(worn, Player.MemberNumber);
            if (entry.original) ApplyItem(entry.original, Player.MemberNumber, true, false);
        }
        this.SlotSnapshot = undefined;
        settingsSave();
        ChatRoomCharacterUpdate(Player);
    }

    Recover(emote?: boolean | undefined): BaseState {
        // A full stored outfit (from a Magic outfit spell) already restores every slot; otherwise restore just our slots.
        if (this.StoredOutfit) this.SlotSnapshot = undefined;
        else this.RestoreSlots();
        return super.Recover(emote);
    }

    WearMany(items: ItemBundle[], spell: SpellDefinition, isRestore: boolean = false, memberNumber: number | undefined = undefined) {
        if (!memberNumber || memberNumber == -1)
            memberNumber = Player.MemberNumber ?? 0;
        let sender = !!memberNumber ? getCharacter(memberNumber) : null;
        items.forEach(item => {
            let asset = AssetGet(Player.AssetFamily, item.Group, item.Name);
            if (!!asset && this.DoChange(asset, spell)) {
                let isBlocked = this.InventoryBlockedOrLimited(sender, AppearanceItem.fromAsset(asset));
                let isRoomDisallowed = !InventoryChatRoomAllow(asset?.Category ?? []);
                if (isRestore || !(isBlocked || isRoomDisallowed)) {
                    ApplyItem(item, memberNumber, true, !isRestore);
                }
            }
        });
        ChatRoomCharacterUpdate(Player);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}