/** @type {ExtendedItemScriptHookCallbacks.Draw<ModularItemData>} */
declare function InventoryItemPelvisLoveChastityBeltDraw(Data: ModularItemData, OriginalFunction: () => void): void;
/** @type {ExtendedItemScriptHookCallbacks.SetOption<ModularItemData, ModularItemOption>} */
declare function InventoryItemPelvisLoveChastityBeltSetOptionHook(data: ModularItemData, originalFunction: (C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption, push: boolean) => string, C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption, push: boolean): string;
/** @type {ExtendedItemScriptHookStruct<ModularItemData, ModularItemOption>["validate"]} */
declare function InventoryItemPelvisLoveChastityBeltValidate(Data: ModularItemData, OriginalFunction: (C: Character, item: Item, newOption: ModularItemOption, previousOption: ModularItemOption) => string, C: Character, Item: Item, Option: ModularItemOption, CurrentOption: ModularItemOption): string;
/** Map the names of the love chastity belt front + black shield options to its scifi pleasure panties equivalent. */
declare const InventoryItemPelvisLoveChastityBeltCrotchShield: Map<string, string>;
