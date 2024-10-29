/**
 * Helper function for the futuristic hook scripts.
 * @param {ExtendedItemData<any>} data
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @param {(data: ExtendedItemData<any>) => void} DeniedFunction - The function that is called when validation fails.
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccess(data: ExtendedItemData<any>, OriginalFunction: null | (() => void), DeniedFunction: (data: ExtendedItemData<any>) => void): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessLoad(Data: ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessClick(Data: ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {ExtendedItemData<any>} Data - The extended item data (if any)
 * @param {null | (() => void)} OriginalFunction - The function that is normally called when an archetypical item reaches this point (if any).
 * @returns {boolean} - Whether the validation was successful or not.
 */
declare function FuturisticAccessDraw(Data: ExtendedItemData<any>, OriginalFunction?: null | (() => void)): boolean;
/**
 * Hook script for injecting futuristic features into an archetypical item
 * @returns {void} - Nothing
 */
declare function FuturisticAccessExit(): void;
declare function FuturisticAccessValidate(data: ExtendedItemData<any>, originalFunction: (C: Character, item: Item, newOption: any, previousOption: any, permitExisting?: boolean) => string, C: Character, item: Item, newOption: any, previousOption: any, permitExisting?: boolean): string;
declare function InventoryItemFuturisticLoadAccessDenied(): void;
/**
 * Draw the futuristic item ACCESS DENIED screen
 * @param {ExtendedItemData<any>} data
 */
declare function InventoryItemFuturisticDrawAccessDenied(data: ExtendedItemData<any>): void;
/**
 * Click the futuristic item ACCESS DENIED screen.
 * @param {ExtendedItemData<any>} data
 */
declare function InventoryItemFuturisticClickAccessDenied(data: ExtendedItemData<any>): void;
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
