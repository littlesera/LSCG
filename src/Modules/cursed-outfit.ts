import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { SendAction, getRandomInt, OnChat, settingsSave, removeAllHooksByModule, isPhraseInString, GetDelimitedList, OnAction, GetMetadata, GetTargetCharacter, hookFunction, GetItemNameAndDescriptionConcat, sendLSCGCommandBeep, isObject, isBind, isCloth, isCosplay, isBody, isGenitals, isPronouns, toItemBundle, parseFromBase64 } from "../utils";
import { CursedItemModel, CursedItemWorn, ItemType, CursedItemSettingsModel } from "Settings/Models/cursed-item";
import { GuiCursedItems } from "Settings/cursed-items";
import { StateModule } from "./states";
import { BaseState } from "./States/BaseState";
import { CursedItemState } from "./States/CursedItemState";
import { CommandListener, CoreModule } from "./core";
import { OutfitCollectionModule } from "./outfitCollection";
import { isArray } from "lodash-es";

// Featurization/Rework ideas:
// - Refactor outfit storage to separate model to reduce traffic to server and provide local storage option for unlimited codes
//   - If not using local storage figure out how much to limit it by. Straight number? Calculated model size limit?
//   - Make robust migrator to copy outfit codes from outfit/polymorph spells and suggestions
//   - Make sure outfit code getting for spell effects etc is done via lscg beep request/resp
// - Allow keying outfit as to custom 'spreading' crafted keyword
// - Upon wearing that item, user will beep its owner for outfit code, store locally and begin spreading state
// - Spread will continue until outfit + key item is entirely applied, and periodically check if it needs to restart (Spread will _not_ remove keyed item if there's a collision)
// - Spread can only be stopped by removing key crafted item
// Also allow voice activated outfit spread
export class CursedItemModule extends BaseModule {
    nextActivationTriggerTimeout: number | undefined = undefined;
    debug: boolean = false;

    cursedKeywords = [
        "cursed",
        "enchanted"
    ]

    get defaultSettings() {
        return <CursedItemSettingsModel>{
            enabled: false,
            Allowed: "Public",
            Vulnerable: false,
            CursedItems: [],
            SuppressEmote: false
        };
    }

    get settings(): CursedItemSettingsModel {
        return super.settings as CursedItemSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiCursedItems;
    }

    get spreadingState(): CursedItemState {
        return getModule<StateModule>("StateModule").CursedItemState;
    }

    safeword(): void {
        this.settings.enabled = false;
        this.settings.Vulnerable = false;
    }

    load(): void {
        let lastCheckedForItems = 0;
        hookFunction("TimerProcess", 1, (args, next) => {
            let now = CommonTime();
            // Check gags every 5 seconds for any new cursed items..
            if (this.Enabled && this.settings.Vulnerable && lastCheckedForItems + 5000 < now) {
                lastCheckedForItems = now;
                this.CheckForCursedItems();
            }
            return next(args);
        }, ModuleCategory.CursedItem);

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "cursed_item_request",
            command: "cursed-item-request",
            func: (sender: number, msg: LSCGMessageModel) => this.HandleCursedItemRequest(sender, msg)
        });

        getModule<CoreModule>("CoreModule").RegisterCommandListener(<CommandListener>{
            id: "cursed_item_response",
            command: "cursed-item-response",
            func: (sender: number, msg: LSCGMessageModel) => this.HandleCursedItemResponse(sender, msg)
        })
    }

    run(): void {

    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.CursedItem);
    }

    CheckForCursedItems() {
        if (!this.Enabled) return;
        // Iterate through Player.Appearance, look for crafted items that contain "cursed" keywords, then compare against our current active outfits.
        // If new items are found, ping the crafting owner for the full outfit code and add as active
        let allItems = Player.Appearance.filter(item => this.cursedKeywords.some(str => isPhraseInString(GetItemNameAndDescriptionConcat(item) ?? "", str)));
        if (allItems.length > 0) {
            let activeItems = this.spreadingState.ActiveOutfits ?? [];
            let newItems = allItems.filter(item => !activeItems.some(active => active.Crafter == item.Craft?.MemberNumber && isPhraseInString(GetItemNameAndDescriptionConcat(item) ?? "", active.ItemName)));
            newItems.forEach(item => this.SendCursedItemRequest(item))
        }
    }

    SendCursedItemRequest(item: Item) {
        let target = item.Craft?.MemberNumber ?? 0;
        if (target <= 0) return;
        let bundle = toItemBundle(item, Player);
        if (!bundle) return;

        sendLSCGCommandBeep(target, "cursed-item-request", [{
            name: "item",
            value: bundle
        }]);
    }

    private filterItem(item: ServerItemBundle, filter: ItemType[] = []): boolean {
        if (!filter || filter.length <= 0) return true;
        let group = AssetGroup.find(g => g.Name == item.Group);
        if (!group) return false;
        return filter.some(f => {
            switch (f) {
                case "bind":
                    return isBind(group!);
                case "cloth":
                    return isCloth(group!);
                case "cosplay":
                    return isCosplay(group!);
                case "body":
                    return isBody(group!);
                case "gender":
                    return isGenitals(group!) || isPronouns(group!);
            }
        })
    }

    SendCursedItemResponse(target: number, keyItem: ItemBundle, item: CursedItemModel) {
        let outfitCode = getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data.GetOutfitCode(item.OutfitKey);
        if (!outfitCode) return;

        let outfitBundle = parseFromBase64(outfitCode) as ItemBundle[];
        if (!outfitBundle || !isArray(outfitBundle) || outfitBundle.some(x => !isObject(x))) return;
        let filtered = outfitBundle.filter(bundleItem => this.filterItem(bundleItem, item.Filter));
        outfitCode = LZString.compressToBase64(JSON.stringify(filtered));

        let itemModel = <CursedItemWorn>{
            Crafter: Player.MemberNumber,
            ItemName: keyItem.Craft?.Name ?? keyItem.Name,
            CurseName: item.Name,
            Inexhaustable: item.Inexhaustable,
            SuppressEmote: item.SuppressEmote,
            Speed: item.Speed,
            CustomSpeed: item.CustomSpeed,
            OutfitCode: outfitCode
        }

        sendLSCGCommandBeep(target, "cursed-item-response", [{
            name: "item",
            value: itemModel
        }]);
    }

    HandleCursedItemRequest(sender: number, msg: LSCGMessageModel) {
        if (!this.Enabled) return;
        let bundle = msg.command?.args.find(a => a.name == "item")?.value as ItemBundle;
        if (!bundle) return;
        let itemStr = GetItemNameAndDescriptionConcat(bundle) ?? "";
        let foundItem = this.settings.CursedItems.find(item => item.Enabled && isPhraseInString(itemStr, item.Name))
        if (!!foundItem)
            this.SendCursedItemResponse(sender, bundle, foundItem);
    }

    HandleCursedItemResponse(sender: number, msg: LSCGMessageModel) {
        let item = msg.command?.args.find(a => a.name == "item")?.value as CursedItemWorn;
        if (!this.Enabled || !item || !this.spreadingState.checkItemIsValid(item)) return;
        this.spreadingState.AddCursedItem(item, sender);
    }
}
