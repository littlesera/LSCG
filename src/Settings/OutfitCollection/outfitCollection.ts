import { GetDataSizeReport, parseFromBase64, settingsSave } from "utils";
import { IOutfitCollection, OutfitRemoveResult, OutfitSaveResult, OutfitStorageStrategy } from "./IOutfitCollection";

export let LSCG_OUTFITS: OutfitCollection;

export class OutfitCombination {
    code: string = ""; // Encoded ItemBundle to be applied on top of any base outfits
    bases: string[] = []; // outfit keys to be applied (in array order) and combined with 'code'
}

export interface OutfitMap {
    [key: string]: Outfit;
}

export interface Outfit {
    key: string;
    code: string;
    inherit: string[];
}

export class OutfitCollection implements IOutfitCollection {
    static STORAGE_KEY: string = "LSCG_Outfits";
    static MAX_BYTES: number = 180000; // 180kb limit to storage size

    protected outfits: OutfitMap = {}; // Key to outfit bundle

    RemoveOutfit(key: string, save: boolean = true): void {
        key = key.toLocaleLowerCase();
        delete this.outfits[key];
        if (save)
            this.SaveOutfits();
    }

    get strategy(): OutfitStorageStrategy {
        return Player.LSCG.OutfitCollectionModule.strategy;
    }

    SetStrategy(val: OutfitStorageStrategy) {
        let prev = this.strategy;
        if (prev == val) return;

        // Switch and save
        Player.LSCG.OutfitCollectionModule.strategy = val;
        this.SaveOutfits();

        // Then clear old data
        switch (prev) {
            case OutfitStorageStrategy.LOCALSTORE:
                localStorage.removeItem(this.localStorageKey);
                break;
            case OutfitStorageStrategy.SERVER:
                Player.ExtensionSettings[OutfitCollection.STORAGE_KEY] = "";
                ServerPlayerExtensionSettingsSync(OutfitCollection.STORAGE_KEY)
                break;
        }
    }

    get localStorageKey(): string {
        return `${OutfitCollection.STORAGE_KEY}_${Player.MemberNumber}`;
    }

    get MaxBytes(): number {
        return this.strategy == OutfitStorageStrategy.SERVER ? OutfitCollection.MAX_BYTES : Number.MAX_SAFE_INTEGER;
    }

    SaveOutfits(): boolean {
        let compressedSave = LZString.compressToBase64(JSON.stringify(this));

        try {
            switch (this.strategy){
                case OutfitStorageStrategy.LOCALSTORE:
                    localStorage.setItem(this.localStorageKey, compressedSave);
                    break;
                case OutfitStorageStrategy.SERVER:
                default:
                    Player.ExtensionSettings[OutfitCollection.STORAGE_KEY] = compressedSave;
                    ServerPlayerExtensionSettingsSync(OutfitCollection.STORAGE_KEY);
                    break;
            }
            return true;
        } 
        catch (error: unknown) {
            if (error instanceof Error) {
                console.error("An error occurred saving LSCG Outfits:", error.message);
            } else {
                console.error("An unknown error occurred saving LSCG Outfits:", error);
            }
            return false;
        }
    }

    LoadOutfits(): void {
        let data: string | null;
        switch (this.strategy){
            case OutfitStorageStrategy.LOCALSTORE:
                data = localStorage.getItem(this.localStorageKey);
                if (!data && !!Player.ExtensionSettings[OutfitCollection.STORAGE_KEY]) {
                    Player.LSCG.OutfitCollectionModule.strategy = OutfitStorageStrategy.SERVER;
                    data = Player.ExtensionSettings[OutfitCollection.STORAGE_KEY];
                }
                break;
            case OutfitStorageStrategy.SERVER:
            default:
                data = Player.ExtensionSettings[OutfitCollection.STORAGE_KEY] ?? "{}";
                if (!data && !!localStorage.getItem(this.localStorageKey)) {
                    Player.LSCG.OutfitCollectionModule.strategy = OutfitStorageStrategy.LOCALSTORE;
                    data = localStorage.getItem(this.localStorageKey);
                }
                break;
        }
        Object.assign(this, parseFromBase64(data ?? "{}"));
    }

    ExpandOutfit(outfit: Outfit, seenKeys: string[] = []) {
        console.debug(`expanding outfit: ${outfit.key} -- ${seenKeys.join()}`);
        let bundle = this.ConvertToBundle(outfit.code);
        return bundle.concat(
            (outfit.inherit ?? [])
                .filter(o => seenKeys.indexOf(o.toLocaleLowerCase()) == -1)
                .map(k => this._expandOutfit(k, seenKeys))
                .reduce((a, b) => a.concat(b), [])
        ).filter((val, ix, arr) => arr.findIndex(x => x.Group == val.Group) == ix);
    }

    private _expandOutfit(key: string, seenKeys: string[] = []): ItemBundle[] {
        key = key.toLocaleLowerCase();
        seenKeys.push(key);
        let outfit = this.outfits[key];
        if (!outfit) return [];
        return this.ExpandOutfit(outfit, seenKeys);
    }

    GetOutfit(key: string): Outfit {
        return this.outfits[key.toLocaleLowerCase()];
    }
    GetOutfitCode(key: string): string {
        return LZString.compressToBase64(JSON.stringify(this.GetOutfitBundle(key)));
    }
    GetOutfitBundle(key: string): ItemBundle[] {
        let bundle = this._expandOutfit(key, []);
        return bundle;
    }
    
    RenameOutfit(oldKey: string, newKey: string, save: boolean = true) {
        oldKey = oldKey.toLocaleLowerCase();
        newKey = newKey.toLocaleLowerCase();
        let outfit = this.outfits[oldKey];
        if (!outfit) return;
        this.outfits[newKey] = outfit;
        delete this.outfits[oldKey];
    }

    SetOutfitCode(name: string, code: string | undefined, inherits: string[] | undefined = undefined, save: boolean = true): OutfitSaveResult {
        let key = name.toLocaleLowerCase();

        if (this.GetOutfitCollectionBytes() > this.MaxBytes) {
            return OutfitSaveResult.SPACE_LOW;
        }

        try
        {            
            let outfit: Outfit = this.outfits[key];
            if (!outfit) outfit = <Outfit>{key: name};
            outfit.code = code ?? outfit.code ?? "";
            outfit.inherit = inherits ?? outfit.inherit ?? [];
            this.outfits[key] = outfit;
            if (save)
                return this.SaveOutfits() ? OutfitSaveResult.SUCCESS : OutfitSaveResult.ERROR;
            else return OutfitSaveResult.SUCCESS;
        }
        catch (error: unknown) {
            return OutfitSaveResult.ERROR;
        }
    }
    SetOutfitBundle(key: string, bundle: ItemBundle[], combinations: string[] = []): OutfitSaveResult {
        return this.SetOutfitCode(key, this.EncodeBundle(bundle));
    }
    
    ConvertToBundle(code: string): ItemBundle[] {
        return parseFromBase64<ItemBundle[]>(code) ?? [];
    }
    EncodeBundle(bundle: ItemBundle[]): string {
        return LZString.compressToBase64(JSON.stringify(bundle));
    }

    GetOutfitCollectionBytes(): number {
        return GetDataSizeReport(LZString.compressToBase64(JSON.stringify(this)), false);
    }

    GetOutfitKeys(): string[] {
        return Object.keys(this.outfits);
    }

    GetOutfitNames(): string [] {
        return Object.values(this.outfits)?.map(o => o.key) ?? [];
    }

    Clear(save: boolean = true) {
        this.outfits = {};
        if (save)
            this.SaveOutfits();
    }
}