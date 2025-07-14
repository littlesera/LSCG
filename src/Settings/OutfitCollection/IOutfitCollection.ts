export enum OutfitSaveResult {
    SUCCESS,
    SPACE_LOW,
    NAME_EXISTS,
    ERROR
}

export enum OutfitRemoveResult {
    SUCCESS,
    NOT_FOUND,
    ERROR
}

export enum OutfitStorageStrategy {
    SERVER,
    LOCALSTORE
}

export interface IOutfitCollection {
    // Must implement:
    // - Retrieve outfit code by name
    GetOutfitCode(key: string): string;
    GetOutfitBundle(key: string): ItemBundle[];
    // - Parse outfit code into ItemBundle
    ConvertToBundle(code: string): ItemBundle[];

    // - Store new outfit code, prevent if server save size too big
    SetOutfitCode(key: string, code: string): OutfitSaveResult;
    SetOutfitBundle(key: string, bundle: ItemBundle[]): OutfitSaveResult;
    // - Convert ItemBundle or Appearance into outfit code
    EncodeBundle(bundle: ItemBundle[]): string;

    RemoveOutfit(key: string): void;

    // - Calculate collection model size for server save
    GetOutfitCollectionBytes(): number;

    SaveOutfits(): boolean;
    GetOutfitKeys(): string[];
}