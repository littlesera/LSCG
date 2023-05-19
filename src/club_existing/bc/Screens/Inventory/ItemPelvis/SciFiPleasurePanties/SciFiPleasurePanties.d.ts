/** @type {ExtendedItemScriptHookCallbacks.Draw<ModularItemData>} */
declare function InventoryItemPelvisSciFiPleasurePantiesDrawHook(Data: ModularItemData, OriginalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallback<ModularItemData, [Futuristic?: boolean]>} */
declare function InventoryItemPelvisSciFiPleasurePantiesClickHook(Data: ModularItemData, OriginalFunction: (Futuristic?: boolean) => void, Futuristic?: boolean): void;
/** @type {ExtendedItemChatCallback<ModularItemOption>} */
declare function InventoryItemPelvisSciFiPleasurePantiesChatPrefix({ previousOption, newOption }: ExtendedItemChatData<ModularItemOption>): string;
