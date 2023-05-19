/**
 * Helper function for the futuristic hook scripts.
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @param {() => void} DeniedFunction - The function that is called when validation fails.
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccess(OriginalFunction: null | (() => void), DeniedFunction: () => void): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {null | ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessLoad(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {null | ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessClick(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {null | ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessDraw(Data?: null | ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @returns {void} - Nothing
 */
declare function FuturisticAccessExit(): void;
/**
 * Hook script for injecting futuristic features into a typed or modular item
 * @type {ExtendedItemScriptHookCallbacks.Validate<ExtendedItemData<any>, any>}
 */
declare function FuturisticAccessValidate(Data: ExtendedItemData<any>, OriginalFunction: (C: Character, item: Item, newOption: any, previousOption: any) => string, C: Character, Item: Item, Option: any, CurrentOption: any): string;
declare function InventoryItemFuturisticLoadAccessDenied(): void;
declare function InventoryItemFuturisticDrawAccessDenied(): void;
declare function InventoryItemFuturisticClickAccessDenied(): void;
declare function InventoryItemFuturisticExitAccessDenied(): void;
/**
 * Validates, if the chosen option is possible. Sets the global variable 'DialogExtendedMessage' to the appropriate error message, if not.
 * @param {Character} C - The character to validate the option
 * @param {Item} Item - The equipped item
 * @param {boolean} changeWhenLocked - See {@link ExtendedItemOption.ChangeWhenLocked}
 * @returns {string} - Returns false and sets DialogExtendedMessage, if the chosen option is not possible.
 */
declare function InventoryItemFuturisticValidate(C: Character, Item?: Item, changeWhenLocked?: boolean): string;
/**
 * Publish a chat message for denied access.
 *
 * @param {Character} C - The character that got denied access.
 */
declare function InventoryItemFuturisticPublishAccessDenied(C: Character): void;
declare var FuturisticAccessDeniedMessage: string;
declare var FuturisticAccessCollarGroups: string[];
declare var FuturisticAccessArmGroups: string[];
declare var FuturisticAccessLegGroups: string[];
declare var FuturisticAccessChastityGroups: string[];
