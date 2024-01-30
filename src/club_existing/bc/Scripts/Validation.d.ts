/**
 * Creates the appearance update parameters used to validate an appearance diff, based on the provided target character
 * and the source character's member number.
 * @param {Character} C - The target character (to whom the appearance update is being applied)
 * @param {number} sourceMemberNumber - The member number of the source player (the person that sent the update)
 * @returns {AppearanceUpdateParameters} - Appearance update parameters used based on the relationship between the
 * target and source characters
 */
declare function ValidationCreateDiffParams(C: Character, sourceMemberNumber: number): AppearanceUpdateParameters;
/**
 * Resolves an appearance diff based on the previous item, new item, and the appearance update parameters provided.
 * Returns an {@link ItemDiffResolution} object containing the final appearance item and a valid flag indicating
 * whether or not the new item had to be modified/rolled back.
 * @param {AssetGroupName} groupName - The name of the group for the appearance diff
 * @param {Item|null} previousItem - The previous item that the target character had equipped (or null if none)
 * @param {Item|null} newItem - The new item to equip (may be identical to the previous item, or null if removing)
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
declare function ValidationResolveAppearanceDiff(groupName: AssetGroupName, previousItem: Item | null, newItem: Item | null, params: AppearanceUpdateParameters): ItemDiffResolution;
/**
 * Check whether newArray is different from oldArray.
 * @template T
 * @param {T[]} oldArray
 * @param {T[]} newArray
 * @returns {boolean}
 */
declare function ValidationHasArrayPropertyBeenModified<T>(oldArray: T[], newArray: T[]): boolean;
/**
 * Resolves an appearance diff for the ItemScript group. This group has special rules and permissions which don't
 * necessarily apply to or behave like other groups.
 * @param {Item|null} previousItem - The previous item in the group
 * @param {Item|null} newItem - The new item in the group
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @return {ItemDiffResolution} - The diff resolution
 */
declare function ValidationResolveScriptDiff(previousItem: Item | null, newItem: Item | null, { C, permissions, sourceMemberNumber }: AppearanceUpdateParameters): ItemDiffResolution;
/**
 * Resolves an appearance diff where an item is being added (i.e. there was no previous item in the asset group). Add
 * diffs are handled as the composite of two operations: item addition, followed by property modification. First we
 * check whether the base item can be added, and then we check that any added properties are permitted.
 * @param {Item} newItem - The new item to equip
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
declare function ValidationResolveAddDiff(newItem: Item, params: AppearanceUpdateParameters): ItemDiffResolution;
/**
 * Resolves an appearance diff where an item is being removed (i.e. there was previously an item in the asset group, but
 * it is being removed)
 * @param {Item} previousItem - The previous item to remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} [isSwap] - Whether or not the removal is part of an item swap operation. This will allow certain
 * items which cannot normally be removed (e.g. items with `AllowNone: false`) to be removed
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
declare function ValidationResolveRemoveDiff(previousItem: Item, params: AppearanceUpdateParameters, isSwap?: boolean): ItemDiffResolution;
/**
 * Resolves an appearance diff where an item is being swapped (i.e. there was an item previously in the asset group, but
 * the new item uses a different asset to the previous item). Swap diffs are handled as the composite of three
 * operations: item removal, item addition, and then property modification. First we check whether the previous item
 * can be removed, then whether the new item can be added, and finally we check that any added properties are permitted.
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
declare function ValidationResolveSwapDiff(previousItem: Item, newItem: Item, params: AppearanceUpdateParameters): ItemDiffResolution;
/**
 * Resolves an appearance diff where an item is being modified (i.e. there was an item previously in the asset group,
 * and the new item uses the same asset as the previous item). The function primarily validates modifications to locked
 * items
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {ItemDiffResolution} - The diff resolution - a wrapper object containing the final item and a flag
 * indicating whether or not the change was valid.
 */
declare function ValidationResolveModifyDiff(previousItem: Item, newItem: Item, params: AppearanceUpdateParameters): ItemDiffResolution;
/**
 * Resolves modifications to an item's lock properties and returns a boolean to indicate whether or not the
 * modifications were valid.
 * @param {Item} previousItem - The previous item to remove
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} itemBlocked - Whether or not the item is blocked or limited for the source player
 * @returns {boolean} - true if the lock modifications (if any) were valid, false otherwise
 */
declare function ValidationResolveLockModification(previousItem: Item, newItem: Item, params: AppearanceUpdateParameters, itemBlocked: boolean): boolean;
/**
 * Determines whether or not a lock was modified on an item from its previous and new property values
 * @param {ItemProperties} previousProperty - The previous item property
 * @param {ItemProperties} newProperty - The new item property
 * @returns {boolean} - true if the item's lock was modified (added/removed/swapped/modified), false otherwise
 */
declare function ValidationLockWasModified(previousProperty: ItemProperties, newProperty: ItemProperties): boolean;
/**
 * Returns a commonly used warning message indicating that an invalid change to an item was made, along with the target
 * and source characters' member numbers.
 * @param {Item} item - The item being modified
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {string} - The warning message
 */
declare function ValidationItemWarningMessage(item: Item, { C, sourceMemberNumber }: AppearanceUpdateParameters): string;
/**
 * Determines whether or not a lock can be modified based on the lock object and the provided appearance update
 * parameters.
 * @param {Item} lock - The lock object that is being checked, as returned by {@link InventoryGetLock}
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} [remove] - Whether the lock change is a removal
 * @returns {boolean} - TRUE if the lock can be modified, FALSE otherwise
 */
declare function ValidationIsLockChangePermitted(lock: Item, { C, fromOwner, fromLover, fromFamily }: AppearanceUpdateParameters, remove?: boolean): boolean;
/**
 * Copies an item's lock-related properties from one Property object to another based on whether or not the source
 * character has permissions to modify the lock. Rolls back any invalid changes to their previous values.
 * @param {object} sourceProperty - The original Property object on the item
 * @param {object} targetProperty - The Property object on the modified item
 * @param {boolean} hasLockPermissions - Whether or not the source character of the appearance change has permission to
 * modify the lock (as determined by {@link ValidationIsLockChangePermitted})
 * @returns {boolean} - TRUE if the target Property object was modified as a result of copying (indicating that there
 * were invalid changes to the lock), FALSE otherwise
 */
declare function ValidationRollbackInvalidLockProperties(sourceProperty: object, targetProperty: object, hasLockPermissions: boolean): boolean;
/**
 * Clones all lock properties from one Property object to another.
 * @param {ItemProperties} sourceProperty - The property object to clone properties from
 * @param {ItemProperties} targetProperty - The property object to clone properties to
 * @returns {void} - Nothing
 */
declare function ValidationCloneLock(sourceProperty: ItemProperties, targetProperty: ItemProperties): void;
/**
 * Copies the value of a single property key from a source Property object to a target Property object.
 * @param {ItemProperties} sourceProperty - The original Property object on the item
 * @param {ItemProperties} targetProperty - The Property object on the modified item
 * @param {string} key - The property key whose value to copy
 * @returns {boolean} - TRUE if the target Property object was modified as a result of copying (indicating that there
 * were invalid changes to the property), FALSE otherwise
 */
declare function ValidationCopyProperty(sourceProperty: ItemProperties, targetProperty: ItemProperties, key: string): boolean;
/**
 * Determines whether an item can be added to the target character, based on the provided appearance update parameters.
 * Note that the item's properties are not taken into account at this stage - this merely checks whether the basic item
 * can be added.
 * @param {Item} newItem - The new item to add
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @returns {boolean} - TRUE if the new item can be equipped based on the appearance update parameters, FALSE otherwise
 */
declare function ValidationCanAddItem(newItem: Item, params: AppearanceUpdateParameters): boolean;
/**
 * Determines whether the character described by the `sourceMemberNumber` parameter is permitted to add a given asset to
 * the target character `C`, based on the asset's group name, asset name and type (if applicable). This only checks
 * against the target character's limited and blocked item lists, not their global item permissions.
 * @param {Character} C - The target character
 * @param {number} sourceMemberNumber - The member number of the source character
 * @param {AssetGroupName} groupName - The name of the asset group for the intended item
 * @param {string} assetName - The asset name of the intended item
 * @param {string|null} [type] - The type of the intended item
 * @returns {boolean} - TRUE if the character with the provided source member number is _not_ allowed to equip the
 * described asset on the target character, FALSE otherwise.
 */
declare function ValidationIsItemBlockedOrLimited(C: Character, sourceMemberNumber: number, groupName: AssetGroupName, assetName: string, type?: string | null): boolean;
/**
 * Determines whether an item can be removed from the target character, based on the provided appearance update
 * parameters.
 * @param {Item} previousItem - The item to remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @param {boolean} isSwap - Whether or not the removal is part of a swap, which allows temporary removal of items with
 * `AllowNone: false`.
 * @returns {boolean} - TRUE if the item can be removed based on the appearance update parameters, FALSE otherwise
 */
declare function ValidationCanRemoveItem(previousItem: Item, params: AppearanceUpdateParameters, isSwap: boolean): boolean;
/**
 * Determines whether an item can be added or removed from the target character, based on the provided appearance update
 * parameters.
 * @param {Item} item - The item to add or remove
 * @param {AppearanceUpdateParameters} params - The appearance update parameters that apply to the diff
 * @return {boolean} - TRUE if the item can be added or removed based on the appearance update parameters, FALSE
 * otherwise
 */
declare function ValidationCanAddOrRemoveItem(item: Item, { C, fromOwner, fromLover, fromFamily }: AppearanceUpdateParameters): boolean;
/**
 * Sanitizes the properties on an appearance item to ensure that no invalid properties are present. This removes invalid
 * locks, strips invalid values, and ensures property values are within the constraints defined by an item.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The appearance item to sanitize
 * @returns {boolean} - TRUE if the item was modified as part of the sanitization process (indicating that invalid
 * properties were present), FALSE otherwise
 */
declare function ValidationSanitizeProperties(C: Character, item: Item): boolean;
/**
 * Sanitizes the `Effect` array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the asset's `AllowEffect` array.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose `Effect` property should be sanitized
 * @returns {boolean} - TRUE if the item's `Effect` property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid effects were present), FALSE otherwise
 */
declare function ValidationSanitizeEffects(C: Character, item: Item): boolean;
/**
 * Sanitizes an item's lock properties, if present. This ensures that any lock on the item is valid, and removes or
 * corrects invalid properties.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose lock properties should be sanitized
 * @returns {boolean} - TRUE if the item's properties were modified as part of the sanitization process (indicating the
 * lock was not valid), FALSE otherwise
 */
declare function ValidationSanitizeLock(C: Character, item: Item): boolean;
/**
 * Sanitizes an array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the either the asset's corresponding property array or the
 * "allow" array for that item.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose property should be sanitized
 * @param {keyof (PropertiesArray.Asset | PropertiesArray.Item)} propertyName - The name of the property
 * @param {keyof PropertiesArray.Asset} allowPropertyName - The name of the property corresponding to the list of allowed property
 * values on the asset (e.g. `AllowHide` or `AllowEffect`)
 * @returns {boolean} - TRUE if the item's property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid entries were present), FALSE otherwise
 */
declare function ValidationSanitizeAllowedPropertyArray(C: Character, item: Item, propertyName: keyof (PropertiesArray.Asset | PropertiesArray.Item), allowPropertyName: keyof PropertiesArray.Asset): boolean;
/**
 * Sanitizes the `SetPose` array on an item's Property object, if present. This ensures that it is a valid array of
 * strings, and that each item in the array is present in the list of poses available in the game.
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} item - The item whose `SetPose` property should be sanitized
 * @returns {boolean} - TRUE if the item's `SetPose` property was modified as part of the sanitization process
 * (indicating it was not a valid string array, or that invalid entries were present), FALSE otherwise
 */
declare function ValidationSanitizeSetPose(C: Character, item: Item): boolean;
/**
 * Sanitizes a property on an object to ensure that it is a valid string array or null/undefined. If the property is not
 * a valid array and is not null, it will be deleted from the object. If it is a valid array, any non-string entries
 * will be removed.
 * @param {ItemProperties} property - The object whose property should be sanitized
 * @param {string} key - The key indicating which property on the object should be sanitized
 * @returns {boolean} - TRUE if the object's property was modified as part of the sanitization process (indicating  that
 * the property was not a valid array, or that it contained a non-string entry), FALSE otherwise
 */
declare function ValidationSanitizeStringArray(property: ItemProperties, key: string): boolean;
/**
 * Completely removes a lock from an item's Property object. This removes all lock-related properties, and the "Lock"
 * effect from the property object.
 * @param {ItemProperties} property - The Property object to remove the lock from
 * @param {boolean} verbose - Whether or not to print console warnings when properties are deleted. Defaults to true.
 * @returns {boolean} - TRUE if the Property object was modified as a result of the lock deletion (indicating that at
 * least one lock-related property was present), FALSE otherwise
 */
declare function ValidationDeleteLock(property: ItemProperties, verbose?: boolean): boolean;
/**
 * Fixes any cyclic blocks in the provided appearance array. The given diff map is used to determine the order in which
 * items should be rolled back or removed if block cycles are found (a block cycle being a series of items that block
 * each other in a cyclic fashion).
 * @param {Item[]} appearance - The appearance to sanitize
 * @param {AppearanceDiffMap} diffMap - The appearance diff map which indicates the items that were changed as part of
 * the appearance update that triggered this validation
 * @returns {AppearanceValidationWrapper} - A wrapper containing the final appearance, with any block cycles removed,
 * plus a valid flag indicating whether or not the appearance had to be modified.
 */
declare function ValidationResolveCyclicBlocks(appearance: Item[], diffMap: AppearanceDiffMap): AppearanceValidationWrapper;
/**
 * Finds any block cycles in the given appearance array. Block cycles are groups of items that block each other in a
 * cyclic fashion. Block cycles are represented as an array of group names that comprise the cycle. For example:
 * ["ItemArms", "ItemDevices", "ItemArms"]
 * This indicates that the item in the ItemArms group blocks the item in the ItemDevices group, and vice versa. This
 * function returns an array of such block cycles, or an empty array if none were found.
 * Be advised that cyclic block checking is relatively expensive, so should only be run when needed - don't run it every
 * frame!
 * @param {Item[]} appearance - The appearance array to check
 * @returns {string[][]} - A list of block cycles, each cycle being represented as an array of group names.
 */
declare function ValidationFindBlockCycles(appearance: Item[]): string[][];
/**
 * Finds the groups, from a provided list of groups, that are blocked by a given item.
 * @param {Item} item - The item to check
 * @param {readonly AssetGroupName[]} groupNames - A list of group names that should be used to filter the final block list
 * @returns {AssetGroupName[]} - A subset of the provided group names representing the groups that are blocked by the given
 * item.
 */
declare function ValidationGetBlockedGroups(item: Item, groupNames: readonly AssetGroupName[]): AssetGroupName[];
/**
 * Finds the groups from the provided appearance array that block a given item due to prerequisites. In this situation,
 * an item is considered to be blocking if the target item can't be added with it, but can without it.
 * @param {Item} item - The item to check
 * @param {Item[]} appearance - The appearance array to check
 * @returns {AssetGroupName[]} - A list of group names corresponding to items from the appearance array that block the given
 * item due to prerequisites
 */
declare function ValidationGetPrerequisiteBlockingGroups(item: Item, appearance: Item[]): AssetGroupName[];
/**
 * Checks whether a character permits the given permission level to modify the given item property. For example,
 * passing `Player` in as the character, `"Block"` in as the property and `ScriptPermissionLevel.FRIENDS` in as the
 * permission level will check whether the player's friends are permitted to freely modify `"Block"` properties on the
 * player's worn items without strict validation.
 * @param {Character} character - The character to check
 * @param {ScriptPermissionProperty} property - The name of the property to check
 * @param {ScriptPermissionLevel} permissionLevel - The permission level to check
 * @returns {boolean} TRUE if the character permits modifications to the provided property
 */
declare function ValidationHasScriptPermission(character: Character, property: ScriptPermissionProperty, permissionLevel: ScriptPermissionLevel): boolean;
/**
 * Checks whether a character permits any of the given permission levels to modify the given item property.
 * @param {Character} character - The character to check
 * @param {ScriptPermissionProperty} property - The name of the property to check
 * @param {readonly ScriptPermissionLevel[]} permissionLevels - The permission levels to check
 * @returns {boolean} TRUE if the character permits modifications to the provided property
 */
declare function ValidationHasSomeScriptPermission(character: Character, property: ScriptPermissionProperty, permissionLevels: readonly ScriptPermissionLevel[]): boolean;
/**
 * @template {{ [key: string]: (arg: any, C: Character) => any }} T
 * @param {unknown} arg The to-be validated record
 * @param {Character} C The character in question
 * @param {T} validators A record of validation functions; one for each property in `arg`
 * @param {boolean} allowExtraKeys whether to allow extra key/value pairs in `arg` (absent from the `validators` record) to-be returned
 * @returns {{ [k in keyof T]: ReturnType<T[k]> }} The validated `arg`
 */
declare function ValdiationApplyRecord<T extends {
    [key: string]: (arg: any, C: Character) => any;
}>(arg: unknown, C: Character, validators: T, allowExtraKeys?: boolean): { [k in keyof T]: ReturnType<T[k]>; };
declare const ValidationCombinationNumberRegex: RegExp;
declare const ValidationPasswordRegex: RegExp;
declare const ValidationDefaultCombinationNumber: "0000";
declare const ValidationDefaultPassword: "UNLOCK";
declare const ValidationRemoveTimerToleranceMs: 5000;
declare const ValidationNonModifiableLockProperties: string[];
declare const ValidationRestrictedLockProperties: string[];
declare const ValidationTimerLockProperties: string[];
declare const ValidationAllLockProperties: string[];
declare const ValidationModifiableProperties: string[];
declare const ValidationScriptableProperties: string[];
/** @type {Partial<Record<keyof ItemProperties, ScriptPermissionProperty>>} */
declare const ValidationPropertyPermissions: Partial<Record<keyof ItemProperties, ScriptPermissionProperty>>;
