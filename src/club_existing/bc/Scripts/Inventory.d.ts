/**
* Add a new item by group & name to character inventory
* @param {Character} C - The character that gets the new item added to her inventory
* @param {string} NewItemName - The name of the new item to add
* @param {AssetGroupName} NewItemGroup - The group name of the new item to add
* @param {boolean} [Push=true] - Set to TRUE to push to the server
*/
declare function InventoryAdd(C: Character, NewItemName: string, NewItemGroup: AssetGroupName, Push?: boolean): void;
/**
* Adds multiple new items by group & name to the character inventory
* @param {Character} C - The character that gets the new items added to her inventory
* @param {readonly ItemBundle[]} NewItems - The new items to add
* @param {Boolean} [Push=true] - Set to TRUE to push to the server, pushed by default
*/
declare function InventoryAddMany(C: Character, NewItems: readonly ItemBundle[], Push?: boolean): void;
/**
 * Creates a new item for a character based on asset group and name
 * @param {Character} C - The character to create the item for
 * @param {AssetGroupName} Group - The name of the asset group the item belongs to
 * @param {string} Name - The name of the asset for the item
 * @return {InventoryItem | null} A new item for character using the specified asset name, or null if the specified asset could not be
 *     found in the named group
 */
declare function InventoryItemCreate(C: Character, Group: AssetGroupName, Name: string): InventoryItem | null;
/**
* Deletes an item from the character inventory
* @param {Character} C - The character on which we should remove the item
* @param {string} DelItemName - The name of the item to delete
* @param {AssetGroupName} DelItemGroup - The group name of the item to delete
* @param {boolean} [Push=true] - Set to TRUE to push to the server
* @return {InventoryItem}
*/
declare function InventoryDelete(C: Character, DelItemName: string, DelItemGroup: AssetGroupName, Push?: boolean): InventoryItem;
/**
 * Deletes all currently-owned items from a given group.
 *
 * @param {Character} C - The character to remove items from
 * @param {AssetGroupName} group - The group name to clear
 * @param {boolean} [push=true] - Whether to send an update to the server
 * @return {InventoryItem[]} The list of deleted items
 */
declare function InventoryDeleteGroup(C: Character, group: AssetGroupName, push?: boolean): InventoryItem[];
/**
* Loads the current inventory for a character, can be loaded from an object of Name/Group or a compressed array using
* LZString
* @param {Character} C - The character on which we should load the inventory
* @param {string | readonly ItemBundle[] | Partial<Record<AssetGroupName, readonly AssetGroupName[]>>} Inventory - An array of Name / Group of items to load
*/
declare function InventoryLoad(C: Character, Inventory: string | readonly ItemBundle[] | Partial<Record<AssetGroupName, readonly AssetGroupName[]>>): void;
/**
* Checks if the character has the inventory available
* @param {Character} C - The character on which we should remove the item
* @param {string|'*'} InventoryName - The name of the item to validate, * means any
* @param {AssetGroupName} InventoryGroup - The group name of the item to validate
*/
declare function InventoryAvailable(C: Character, InventoryName: string | '*', InventoryGroup: AssetGroupName): boolean;
/**
* Returns an error message if a prerequisite clashes with the character's items and clothes
* @param {Character} C - The character on which we check for prerequisites
* @param {AssetPrerequisite} Prerequisite - The name of the prerequisite
* @returns {string} - The error tag, can be converted to an error message
*/
declare function InventoryPrerequisiteMessage(C: Character, Prerequisite: AssetPrerequisite): string;
/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * whose name matches one of the names in the provided list.
 * @param {Character} C - The character for whom to check equipped items
 * @param {AssetGroupName} ItemGroup - The name of the item group to check
 * @param {readonly string[]} ItemList - A list of item names to check against
 * @returns {boolean} - TRUE if the character has an item from the item list equipped in the named slot, FALSE
 * otherwise
 */
declare function InventoryIsItemInList(C: Character, ItemGroup: AssetGroupName, ItemList: readonly string[]): boolean;
/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * which has the provided prerequisite.
 * @param {Character} C - The character whose items should be checked
 * @param {AssetGroupName} ItemGroup - The name of the item group to check
 * @param {AssetPrerequisite} Prerequisite - The name of the prerequisite to look for
 * @returns {boolean} - TRUE if the character has an item equipped in the named slot which has the named prerequisite,
 * FALSE otherwise
 */
declare function InventoryDoesItemHavePrerequisite(C: Character, ItemGroup: AssetGroupName, Prerequisite: AssetPrerequisite): boolean;
/**
 * Prerequisite utility function to check whether the target group for the given character is blocked by any of the
 * given groups to check.
 * @param {Character} C - The character whose items should be checked
 * @param {AssetGroupItemName} TargetGroup - The name of the group that should be checked for being blocked
 * @param {readonly AssetGroupName[]} GroupsToCheck - The name(s) of the groups whose items should be checked
 * @returns {boolean} - TRUE if the character has an item equipped in any of the given groups to check which blocks the
 * target group, FALSE otherwise.
 */
declare function InventoryDoItemsBlockGroup(C: Character, TargetGroup: AssetGroupItemName, GroupsToCheck: readonly AssetGroupName[]): boolean;
/**
 * Prerequisite utility function to check whether the target group for the given character is exposed by all of the
 * given groups to check.
 * @param {Character} C - The character whose items should be checked
 * @param {AssetGroupItemName} TargetGroup - The name of the group that should be checked for being exposed
 * @param {readonly AssetGroupName[]} GroupsToCheck - The name(s) of the groups whose items should be checked
 * @returns {boolean} - FALSE if the character has an item equipped in ANY of the given groups to check that does not
 * expose the target group. Returns TRUE otherwise.
 */
declare function InventoryDoItemsExposeGroup(C: Character, TargetGroup: AssetGroupItemName, GroupsToCheck: readonly AssetGroupName[]): boolean;
/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in any of the named group
 * slots.
 * @param {Character} C - The character whose items should be checked
 * @param {readonly AssetGroupName[]} GroupList - The list of groups to check for items in
 * @returns {boolean} - TRUE if the character has any item equipped in any of the named groups, FALSE otherwise.
 */
declare function InventoryHasItemInAnyGroup(C: Character, GroupList: readonly AssetGroupName[]): boolean;
/**
 * Check if there are any gags with prerequisites that block the new gag from being applied
 * @param {Character} C - The character on which we check for prerequisites
 * @param {readonly AssetPrerequisite[]} BlockingPrereqs - The prerequisites we check for on lower gags
 * @returns {string} - Returns the prerequisite message if the gag is blocked, or an empty string if not
 */
declare function InventoryPrerequisiteConflictingGags(C: Character, BlockingPrereqs: readonly AssetPrerequisite[]): string;
/**
 * Returns TRUE if we can add the item, no other items must block that prerequisite
 * @param {Character} C - The character on which we check for prerequisites
 * @param {Asset} asset - The asset for which prerequisites should be checked. Any item equipped in the asset's group
 * will be ignored for the purposes of the prerequisite check.
 * @param {AssetPrerequisite | readonly AssetPrerequisite[]} [prerequisites=asset.Prerequisite] - An array of prerequisites or a string for a single
 * prerequisite. If nothing is provided, the asset's default prerequisites will be used
 * @param {boolean} [setDialog=true] - If TRUE, set the screen dialog message at the same time
 * @returns {boolean} - TRUE if the item can be added to the character
 */
declare function InventoryAllow(C: Character, asset: Asset, prerequisites?: AssetPrerequisite | readonly AssetPrerequisite[], setDialog?: boolean): boolean;
/**
* Gets the current item / cloth worn a specific area (AssetGroup)
* @param {Character} C - The character on which we must check the appearance
* @param {AssetGroupName} AssetGroup - The name of the asset group to scan
* @returns {Item|null} - Returns the appearance which is the item / cloth asset, color and properties
*/
declare function InventoryGet(C: Character, AssetGroup: AssetGroupName): Item | null;
/**
* Applies crafted properties to the item used
* @param {Character} Source - The character that used the item
* @param {Character} Target - The character on which the item is used
* @param {AssetGroupItemName} GroupName - The name of the asset group to scan
* @param {CraftingItem} Craft - The crafted properties to apply
* @param {Boolean} Refresh - TRUE if we must refresh the character
* @param {Boolean} ApplyColor - TRUE if the items color must be (re-)applied
* @param {Boolean} CraftWarn - Whether a warning should logged whenever the crafting validation fails
* @returns {void}
*/
declare function InventoryCraft(Source: Character, Target: Character, GroupName: AssetGroupItemName, Craft: CraftingItem, Refresh: boolean, ApplyColor?: boolean, CraftWarn?: boolean): void;
/**
* Returns the number of items on a character with a specific property
* @param {Character} C - The character to validate
* @param {CraftingPropertyType} Property - The property to count
* @returns {Number} - The number of times the property is found
*/
declare function InventoryCraftCount(C: Character, Property: CraftingPropertyType): number;
/**
* Returns TRUE if an item as the specified crafted property
* @param {Item} Item - The item to validate
* @param {CraftingPropertyType} Property - The property to check
* @returns {boolean} - TRUE if the property matches
*/
declare function InventoryCraftPropertyIs(Item: Item, Property: CraftingPropertyType): boolean;
/**
* Sets the craft and type on the item, uses the achetype properties if possible.
* Note that appearance changes are _not_ pushed to the server.
* @param {Item} Item - The item being applied
* @param {Character} C - The character that must wear the item
* @param {CraftingItem} [Craft] - The crafting properties of the item
*/
declare function InventoryWearCraft(Item: Item, C: Character, Craft?: CraftingItem): void;
/**
 * Makes the character wear an item on a body area
 * @param {Character} C - The character that must wear the item
 * @param {string} AssetName - The name of the asset to wear
 * @param {AssetGroupName} AssetGroup - The name of the asset group to wear
 * @param {string | string[]} [ItemColor] - The hex color of the item, can be undefined or "Default"
 * @param {number} [Difficulty] - The difficulty, on top of the base asset difficulty, to assign to the item
 * @param {number} [MemberNumber] - The member number of the character putting the item on - defaults to -1
 * @param {CraftingItem} [Craft] - The crafting properties of the item
 * @param {boolean} [Refresh] - Whether to refresh the character and push the changes to the server
 * @returns {null | Item} - Thew newly created item or `null` if the asset does not exist
 */
declare function InventoryWear(C: Character, AssetName: string, AssetGroup: AssetGroupName, ItemColor?: string | string[], Difficulty?: number, MemberNumber?: number, Craft?: CraftingItem, Refresh?: boolean): null | Item;
/**
* Sets the difficulty to remove an item for a body area
* @param {Character} C - The character that is wearing the item
* @param {AssetGroupItemName} AssetGroup - The name of the asset group
* @param {number} Difficulty - The new difficulty level to escape from the item
*/
declare function InventorySetDifficulty(C: Character, AssetGroup: AssetGroupItemName, Difficulty: number): void;
/**
* Returns TRUE if there's already a locked item at a given body area
* @param {Character} C - The character that is wearing the item
* @param {AssetGroupItemName} AssetGroup - The name of the asset group (body area)
* @param {Boolean} CheckProperties - Set to TRUE to check for additionnal properties
* @returns {Boolean} - TRUE if the item is locked
*/
declare function InventoryLocked(C: Character, AssetGroup: AssetGroupItemName, CheckProperties: boolean): boolean;
/**
 * Makes the character wear a random item from a body area
 * @param {Character} C - The character that must wear the item
 * @param {AssetGroupName} GroupName - The name of the asset group (body area)
 * @param {number} [Difficulty] - The difficulty, on top of the base asset difficulty, to assign to the item
 * @param {boolean} [Refresh=true] - Do not call CharacterRefresh if false
 * @param {boolean} [MustOwn=false] - If TRUE, only assets that the character owns can be worn. Otherwise any asset can
 * be used
 * @param {boolean} [Extend=true] - Whether or not to randomly extend the item (i.e. set the item type), provided it has
 * an archetype that supports random extension
 * @param {readonly string[]} [AllowedAssets=null] - A list of assets from which one must be selected
 * @param {boolean} [IgnoreRequirements=false] - If True, the group being blocked and prerequisites will not prevent the item being added.
 *  NOTE: Long-term this should be replaced with better checks before calling this function.
 * @returns {Item | null} - The equipped item (if any)
 */
declare function InventoryWearRandom(C: Character, GroupName: AssetGroupName, Difficulty?: number, Refresh?: boolean, MustOwn?: boolean, Extend?: boolean, AllowedAssets?: readonly string[], IgnoreRequirements?: boolean): Item | null;
/**
 * Randomly extends an item (sets an item type, etc.) on a character
 * @param {Character} C - The character wearing the item
 * @param {AssetGroupName} GroupName - The name of the item's group
 * @param {null | Character} [C_Source] - The character setting the new item option. If `null`, assume that it is _not_ the player character.
 * @returns {Item | null} - The equipped item (if any)
 */
declare function InventoryRandomExtend(C: Character, GroupName: AssetGroupName, C_Source?: null | Character): Item;
/**
 * Select a random asset from a group, narrowed to the most preferable available options (i.e
 * unblocked/visible/unlimited) based on their binary "rank"
 * @param {Character} C - The character to pick the asset for
 * @param {AssetGroupName} GroupName - The asset group to pick the asset from. Set to an empty string to not filter by group.
 * @param {readonly Asset[]} [AllowedAssets] - Optional parameter: A list of assets from which one can be selected. If not provided,
 *     the full list of all assets is used.
 * @param {boolean} [IgnorePrerequisites=false] - If True, skip the step to check whether prerequisites are met
 *  NOTE: Long-term this should be replaced with better checks before calling this function.
 * @returns {Asset|null} - The randomly selected asset or `null` if none found
 */
declare function InventoryGetRandom(C: Character, GroupName: AssetGroupName, AllowedAssets?: readonly Asset[], IgnorePrerequisites?: boolean): Asset | null;
/**
* Removes a specific item from a character body area
* @param {Character} C - The character on which we must remove the item
* @param {AssetGroupName} AssetGroup - The name of the asset group (body area)
* @param {boolean} [Refresh] - Whether or not to trigger a character refresh. Defaults to false
*/
declare function InventoryRemove(C: Character, AssetGroup: AssetGroupName, Refresh?: boolean): void;
/**
* Returns TRUE if the body area (Asset Group) for a character is blocked and cannot be used
* @param {Character} C - The character on which we validate the group
* @param {AssetGroupItemName} [GroupName] - The name of the asset group (body area), defaults to `C.FocusGroup`
* @param {boolean} [Activity=false] - if TRUE check if activity is allowed on the asset group
* @returns {boolean} - TRUE if the group is blocked
*/
declare function InventoryGroupIsBlockedForCharacter(C: Character, GroupName?: AssetGroupItemName, Activity?: boolean): boolean;
/**
* Returns TRUE if the body area is blocked by an owner rule
* @param {Character} C - The character on which we validate the group
* @param {AssetGroupName} [GroupName] - The name of the asset group (body area)
* @returns {boolean} - TRUE if the group is blocked
*/
declare function InventoryGroupIsBlockedByOwnerRule(C: Character, GroupName?: AssetGroupName): boolean;
/**
* Returns TRUE if the body area (Asset Group) for a character is blocked and cannot be used
* Similar to InventoryGroupIsBlockedForCharacter but also blocks groups on all characters if the player is enclosed.
* @param {Character} C - The character on which we validate the group
* @param {AssetGroupItemName} [GroupName] - The name of the asset group (body area)
* @param {boolean} [Activity] - if TRUE check if activity is allowed on the asset group
* @returns {boolean} - TRUE if the group is blocked
*/
declare function InventoryGroupIsBlocked(C: Character, GroupName?: AssetGroupItemName, Activity?: boolean): boolean;
/**
* Returns TRUE if an item has a specific effect
* @param {Item} Item - The item from appearance that must be validated
* @param {EffectName} [Effect] - The name of the effect to validate, can be undefined to check for any effect
* @param {boolean} [CheckProperties=true] - If properties should be checked (defaults to `true`)
* @returns {boolean} `true` if the effect is on the item
*/
declare function InventoryItemHasEffect(Item: Item, Effect?: EffectName, CheckProperties?: boolean): boolean;
/**
* Returns TRUE if an item lock is pickable
* @param {Item} Item - The item from appearance that must be validated
* @returns {Boolean} - TRUE if PickDifficulty is on the item
*/
declare function InventoryItemIsPickable(Item: Item): boolean;
/**
 * Returns the value of a given property of an appearance item, prioritizes the Property object.
 * @template {keyof ItemProperties | keyof Asset | keyof AssetGroup} Name
 * @param {Item} Item - The appearance item to scan
 * @param {Name} PropertyName - The property name to get.
 * @param {boolean} [CheckGroup=false] - Whether or not to fall back to the item's group if the property is not found on
 * Property or Asset.
 * @returns {(ItemProperties & Asset & AssetGroup)[Name] | undefined} - The value of the requested property for the given item.
 * Returns either undefined, an empty array or object if the property or the item itself does not exist.
 */
declare function InventoryGetItemProperty<Name extends "Block" | "BlockRemotes" | "OpenPermission" | "OpenPermissionArm" | "OpenPermissionLeg" | "OpenPermissionChastity" | "Hide" | "Name" | "Gender" | "BuyGroup" | "AllowLock" | "IsLock" | "PickDifficulty" | "OwnerOnly" | "LoverOnly" | "FamilyOnly" | "AllowTighten" | "DrawLocks" | "CustomBlindBackground" | "CraftGroup" | "AllowLockType" | "CharacterRestricted" | "AllowRemoveExclusive" | "ArousalZone" | "Difficulty" | "SelfBondage" | "SelfUnlock" | "RemoveTime" | "AlwaysInteract" | "IsRestraint" | "ParentItem" | "Enable" | "Visible" | "NotVisibleOnScreen" | "Wear" | "Activity" | "AllowActivity" | "ActivityAudio" | "ActivityExpression" | "AllowActivityOn" | "PrerequisiteBuyGroups" | "Bonus" | "Expose" | "HideItem" | "HideItemExclude" | "Require" | "AllowActivePose" | "WhitelistActivePose" | "Value" | "ExclusiveUnlock" | "RemoveAtLogin" | "LayerVisibility" | "RemoveTimer" | "MaxTimer" | "Prerequisite" | "Extended" | "AlwaysExtend" | "ExpressionTrigger" | "RemoveItemOnRemove" | "AllowEffect" | "AllowBlock" | "AllowHide" | "AllowHideItem" | "AllowTypes" | "CreateLayerTypes" | "DefaultColor" | "Audio" | "Category" | "Fetish" | "OverrideBlinking" | "DialogSortOverride" | "DynamicDescription" | "DynamicPreviewImage" | "DynamicAllowInventoryAdd" | "DynamicName" | "DynamicGroupName" | "DynamicActivity" | "DynamicAudio" | "DynamicBeforeDraw" | "DynamicAfterDraw" | "DynamicScriptDraw" | "AllowColorizeAll" | "AvailableLocations" | "OverrideHeight" | "FullAlpha" | "MirrorExpression" | "Layer" | "Attribute" | "HideItemAttribute" | "PreviewIcons" | "Tint" | "DefaultTint" | "ExpressionPrerequisite" | "Effect" | "SetPose" | "FreezeActivePose" | "AllowExpression" | "Random" | "BodyCosplay" | "HideForPose" | "Alpha" | "ColorSuffix" | "FixedPosition" | "Opacity" | "MinOpacity" | "MaxOpacity" | "InheritColor" | "AllowPose" | "PoseMapping" | "AllowColorize" | "Group" | "Text" | "Padding" | "TypeRecord" | "Door" | "Type" | "Expression" | "Mode" | "Intensity" | "State" | "Modules" | "HeightModifier" | "OverridePriority" | "ItemMemberNumber" | "LockedBy" | "LockMemberNumber" | "Password" | "LockPickSeed" | "CombinationNumber" | "MemberNumberListKeys" | "Hint" | "LockSet" | "RemoveItem" | "RemoveOnUnlock" | "ShowTimer" | "EnableRandomInput" | "MemberNumberList" | "InflateLevel" | "SuctionLevel" | "Text2" | "Text3" | "LockButt" | "HeartRate" | "AutoPunish" | "AutoPunishUndoTime" | "AutoPunishUndoTimeSetting" | "OriginalSetting" | "BlinkState" | "Option" | "PunishStruggle" | "PunishStruggleOther" | "PunishOrgasm" | "PunishStandup" | "PunishActivity" | "PunishSpeech" | "PunishRequiredSpeech" | "PunishRequiredSpeechWord" | "PunishProhibitedSpeech" | "PunishProhibitedSpeechWords" | "NextShockTime" | "PublicModeCurrent" | "PublicModePermission" | "TriggerValues" | "AccessMode" | "ShockLevel" | "InsertedBeads" | "ShowText" | "TriggerCount" | "OrgasmCount" | "RuinedOrgasmCount" | "TimeWorn" | "TimeSinceLastOrgasm" | "Iterations" | "Revert" | "UnHide" | "Texts" | "TargetAngle" | "PortalLinkCode" | "Underwear" | "Asset" | "Clothing" | "AllowNone" | "AllowCustomize" | "ParentSize" | "ParentColor" | "Zone" | "MirrorGroup" | "PreviewZone" | "MirrorActivitiesFrom" | "HasPreviewImages" | "HasType" | "ParentGroupName" | "DrawingLeft" | "DrawingTop" | "Description" | "WearTime" | "DrawingPriority" | "ZoomModifier" | "ColorableLayerCount" | "Archetype" | "AllowTint" | "Family" | "IsDefault" | "ColorSchema" | "DrawingBlink" | "IsAppearance" | "IsItem" | "IsScript">(Item: Item, PropertyName: Name, CheckGroup?: boolean): (ItemProperties & Asset & AssetGroup)[Name];
/**
 * Apply an item's expression trigger to a character if able
 * @param {Character} C - The character to update
 * @param {readonly ExpressionTrigger[]} expressions - The expression change to apply to each group
 */
declare function InventoryExpressionTriggerApply(C: Character, expressions: readonly ExpressionTrigger[]): void;
/**
* Returns the padlock item that locks another item
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Item} - A padlock item or NULL if none
*/
declare function InventoryGetLock(Item: Item): Item;
/**
* Returns TRUE if the item has an OwnerOnly flag, such as the owner padlock
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Boolean} - TRUE if owner only
*/
declare function InventoryOwnerOnlyItem(Item: Item): boolean;
/**
* Returns TRUE if the item has a LoverOnly flag, such as the lover padlock
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Boolean} - TRUE if lover only
*/
declare function InventoryLoverOnlyItem(Item: Item): boolean;
/**
* Returns TRUE if the item has a FamilyOnly flag, such as the D/s family padlock
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Boolean} - TRUE if family only
*/
declare function InventoryFamilyOnlyItem(Item: Item): boolean;
/**
* Returns TRUE if the character is wearing at least one restraint that's locked with an extra lock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one restraint with an extra lock is found
*/
declare function InventoryCharacterHasLockedRestraint(C: Character): boolean;
/**
 *
 * @param {Character} C - The character to scan
 * @param {AssetLockType} LockName - The type of lock to check for
 * @returns {Boolean} - Returns TRUE if any item has the specified lock locked onto it
 */
declare function InventoryCharacterIsWearingLock(C: Character, LockName: AssetLockType): boolean;
/**
* Returns TRUE if the character is wearing at least one item that's a restraint with a OwnerOnly flag, such as the
* owner padlock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one owner only restraint is found
*/
declare function InventoryCharacterHasOwnerOnlyRestraint(C: Character): boolean;
/**
* Returns TRUE if the character is wearing at least one item that's a restraint with a LoverOnly flag, such as the
* lover padlock
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one lover only restraint is found
*/
declare function InventoryCharacterHasLoverOnlyRestraint(C: Character): boolean;
/**
* Returns TRUE if the character is wearing at least one item that's a restraint with a FamilyOnly flag
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if one family only restraint is found
*/
declare function InventoryCharacterHasFamilyOnlyRestraint(C: Character): boolean;
/**
* Returns TRUE if at least one item on the character can be locked
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if at least one item can be locked
*/
declare function InventoryHasLockableItems(C: Character): boolean;
/**
 * Determines whether an item in its current state permits locks.
 * @param {Item} item - The item to check
 * @returns {boolean} - TRUE if the asset's current type permits locks
 */
declare function InventoryDoesItemAllowLock(item: Item): boolean;
/**
 * Applies a lock to an appearance item of a character
 * @param {Character} C - The character on which the lock must be applied
 * @param {Item|AssetGroupName} Item - The item from appearance to lock
 * @param {Item|AssetLockType} Lock - The asset of the lock or the name of the lock asset
 * @param {null|number|string} [MemberNumber] - The member number to put on the lock, or message to show
 * @param {boolean} [Update=true] - Whether or not to update the character
 */
declare function InventoryLock(C: Character, Item: Item | AssetGroupName, Lock: Item | AssetLockType, MemberNumber?: null | number | string, Update?: boolean): void;
/**
* Unlocks an item and removes all related properties
* @param {Character} C - The character on which the item must be unlocked
* @param {Item|AssetGroupItemName} Item - The item from appearance to unlock
*/
declare function InventoryUnlock(C: Character, Item: Item | AssetGroupItemName): void;
/**
* Applies a random lock on an item
* @param {Character} C - The character on which the item must be locked
* @param {Item} Item - The item from appearance to lock
* @param {Boolean} FromOwner - Set to TRUE if the source is the owner, to apply owner locks
*/
declare function InventoryLockRandom(C: Character, Item: Item, FromOwner: boolean): void;
/**
* Applies random locks on each character items that can be locked
* @param {Character} C - The character on which the items must be locked
* @param {Boolean} FromOwner - Set to TRUE if the source is the owner, to apply owner locks
*/
declare function InventoryFullLockRandom(C: Character, FromOwner: boolean): void;
/**
* Applies a specific lock  on each character items that can be locked
* @param {Character} C - The character on which the items must be locked
* @param {AssetLockType} LockType - The lock type to apply
*/
declare function InventoryFullLock(C: Character, LockType: AssetLockType): void;
/**
* Removes all common keys from the player inventory
*/
declare function InventoryConfiscateKey(): void;
/**
* Removes the remotes of the vibrators from the player inventory
*/
declare function InventoryConfiscateRemote(): void;
/**
* Returns TRUE if the item is worn by the character
* @param {Character} C - The character to scan
* @param {String} AssetName - The asset / item name to scan
* @param {AssetGroupName} AssetGroup - The asset group name to scan
* @returns {Boolean} - TRUE if item is worn
*/
declare function InventoryIsWorn(C: Character, AssetName: string, AssetGroup: AssetGroupName): boolean;
/**
 * Toggles an item's permission for the player
 * @param {Item} Item - Appearance item to toggle
 * @param {string} [Type] - Type of the item to toggle
 * @param {boolean} [Worn] - True if the player is changing permissions for an item they're wearing or if it's the first option
 * @returns {void} - Nothing
 */
declare function InventoryTogglePermission(Item: Item, Type?: string, Worn?: boolean): void;
/**
* Returns TRUE if a specific item / asset is blocked by the character item permissions
* @param {Character} C - The character on which we check the permissions
* @param {string} AssetName - The asset / item name to scan
* @param {AssetGroupName} AssetGroup - The asset group name to scan
* @param {string} [AssetType] - The asset type to scan
* @returns {boolean} - TRUE if asset / item is blocked
*/
declare function InventoryIsPermissionBlocked(C: Character, AssetName: string, AssetGroup: AssetGroupName, AssetType?: string): boolean;
/**
* Returns TRUE if a specific item / asset is favorited by the character item permissions
* @param {Character} C - The character on which we check the permissions
* @param {string} AssetName - The asset / item name to scan
* @param {AssetGroupName} AssetGroup - The asset group name to scan
* @param {string} [AssetType] - The asset type to scan
* @returns {boolean} - TRUE if asset / item is a favorite
*/
declare function InventoryIsFavorite(C: Character, AssetName: string, AssetGroup: AssetGroupName, AssetType?: string): boolean;
/**
 * Returns TRUE if a specific item / asset is limited by the character item permissions
 * @param {Character} C - The character on which we check the permissions
 * @param {string} AssetName - The asset / item name to scan
 * @param {AssetGroupName} AssetGroup - The asset group name to scan
 * @param {string} [AssetType] - The asset type to scan
 * @returns {boolean} - TRUE if asset / item is limited
 */
declare function InventoryIsPermissionLimited(C: Character, AssetName: string, AssetGroup: AssetGroupName, AssetType?: string): boolean;
/**
 * Returns TRUE if the item is not limited, if the player is an owner or a lover of the character, or on their whitelist
 * @param {Character} C - The character on which we check the limited permissions for the item
 * @param {Item} Item - The item being interacted with
 * @param {String} [ItemType] - The asset type to scan
 * @returns {Boolean} - TRUE if item is allowed
 */
declare function InventoryCheckLimitedPermission(C: Character, Item: Item, ItemType?: string): boolean;
/**
 * Returns TRUE if a specific item / asset is blocked or limited for the player by the character item permissions
 * @param {Character} C - The character on which we check the permissions
 * @param {Item} Item - The item being interacted with
 * @param {string | null} [ItemType] - The asset type to scan
 * @returns {Boolean} - Returns TRUE if the item cannot be used
 */
declare function InventoryBlockedOrLimited(C: Character, Item: Item, ItemType?: string | null): boolean;
/**
 * Determines whether a given item is an allowed limited item for the player (i.e. has limited permissions, but can be
 * used by the player)
 * @param {Character} C - The character whose permissions to check
 * @param {Item} item - The item to check
 * @param {string | undefined} [type] - the item type to check
 * @returns {boolean} - Returns TRUE if the given item & type is limited but allowed for the player
 */
declare function InventoryIsAllowedLimited(C: Character, item: Item, type?: string | undefined): boolean;
/**
 * Returns TRUE if the item is a key, having the effect of unlocking other items
 * @param {Item} Item - The item to validate
 * @returns {Boolean} - TRUE if item is a key
 */
declare function InventoryIsKey(Item: Item): boolean;
/**
 * Serialises the provided character's inventory into a string for easy comparisons, inventory items are uniquely
 * identified by their name and group
 * @param {Character} C - The character whose inventory we should serialise
 * @return {string} - A simple string representation of the character's inventory
 */
declare function InventoryStringify(C: Character): string;
/**
 * Returns TRUE if the inventory category is blocked in the current chat room
 * @param {readonly ServerChatRoomBlockCategory[]} Category - An array of string containing all the categories to validate
 * @return {boolean} - TRUE if it's blocked
 */
declare function InventoryChatRoomAllow(Category: readonly ServerChatRoomBlockCategory[]): boolean;
/**
 * Applies a preset expression from being shocked to the character if able
 * @param {Character} C - The character to update
 * @returns {void} - Nothing
 */
declare function InventoryShockExpression(C: Character): void;
/**
 * Extracts all lock-related properties from an item's property object
 * @param {ItemProperties} property - The property object to extract from
 * @returns {ItemProperties} - A property object containing only the lock-related properties from the provided property
 * object
 */
declare function InventoryExtractLockProperties(property: ItemProperties): ItemProperties;
/** @satisfies {Set<keyof PropertiesArray>} */
declare const PropertiesArrayLike: Set<"Block" | "Hide" | "AllowActivity" | "AllowActivityOn" | "Expose" | "HideItem" | "HideItemExclude" | "Require" | "AllowActivePose" | "Prerequisite" | "ExpressionTrigger" | "AllowEffect" | "AllowBlock" | "AllowHide" | "AllowHideItem" | "DefaultColor" | "Category" | "Fetish" | "AvailableLocations" | "Attribute" | "Tint" | "ExpressionPrerequisite" | "Effect" | "SetPose" | "AllowExpression" | "Alpha" | "MemberNumberList" | "UnHide" | "Texts">;
/** @satisfies {Set<keyof PropertiesRecord>} */
declare const PropertiesObjectLike: Set<"AllowLockType" | "ActivityExpression" | "RemoveItemOnRemove" | "PoseMapping" | "TypeRecord">;
