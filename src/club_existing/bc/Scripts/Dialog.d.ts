/**
 * Returns character based on argument
 * @param {Character | string} C - The characer to get; can be `"Player"` to get player or empty to get current
 * @returns {Character} - The actual character
 */
declare function DialogGetCharacter(C: Character | string): Character;
/**
 * Compares the player's reputation with a given value
 * @param {ReputationType} RepType - The name of the reputation to check
 * @param {string} Value - The value to compare
 * @returns {boolean} - Returns TRUE if a specific reputation type is less or equal than a given value
 */
declare function DialogReputationLess(RepType: ReputationType, Value: string): boolean;
/**
 * Compares the player's reputation with a given value
 * @param {ReputationType} RepType - The name of the reputation to check
 * @param {string} Value - The value to compare
 * @returns {boolean} - Returns TRUE if a specific reputation type is greater or equal than a given value
 */
declare function DialogReputationGreater(RepType: ReputationType, Value: string): boolean;
/**
 * Compares the player's money with a given amount
 * @param {string} Amount - The amount of money that must be met
 * @returns {boolean} - Returns TRUE if the player has enough money
 */
declare function DialogMoneyGreater(Amount: string): boolean;
/**
 * Changes a given player's account by a given amount
 * @param {string} Amount - The amount that should be charged or added to the player's account
 * @returns {void} - Nothing
 */
declare function DialogChangeMoney(Amount: string): void;
/**
 * Alters the current player's reputation by a given amount
 * @param {ReputationType} RepType - The name of the reputation to change
 * @param {number|string} Value - The value, the player's reputation should be altered by
 * @returns {void} - Nothing
 */
declare function DialogSetReputation(RepType: ReputationType, Value: number | string): void;
/**
 * Change the player's reputation progressively through dialog options (a reputation is easier to break than to build)
 * @param {ReputationType} RepType - The name of the reputation to change
 * @param {number|string} Value - The value, the player's reputation should be altered by
 * @returns {void} - Nothing
 */
declare function DialogChangeReputation(RepType: ReputationType, Value: number | string): void;
/**
 * Equips a specific item on the player from dialog
 * @param {string} AssetName - The name of the asset that should be equipped
 * @param {AssetGroupName} AssetGroup - The name of the corresponding asset group
 * @returns {void} - Nothing
 */
declare function DialogWearItem(AssetName: string, AssetGroup: AssetGroupName): void;
/**
 * Equips a random item from a given group to the player from dialog
 * @param {AssetGroupName} AssetGroup - The name of the asset group to pick from
 * @returns {void} - Nothing
 */
declare function DialogWearRandomItem(AssetGroup: AssetGroupName): void;
/**
 * Removes an item of a specific item group from the player
 * @param {AssetGroupName} AssetGroup - The item to be removed belongs to this asset group
 * @returns {void} - Nothing
 */
declare function DialogRemoveItem(AssetGroup: AssetGroupName): void;
/**
 * Releases a character from restraints
 * @param {string | Character} C - The character to be released.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {void} - Nothing
 */
declare function DialogRelease(C: string | Character): void;
/**
 * Strips a character naked and removes the restraints
 * @param {string | Character} C - The character to be stripped and released.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {void} - Nothing
 */
declare function DialogNaked(C: string | Character): void;
/**
 * Fully restrain a character with random items
 * @param {string | Character} C - The character to be restrained.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {void} - Nothing
 */
declare function DialogFullRandomRestrain(C: string | Character): void;
/**
 * Checks, if a specific log has been registered with the player
 * @template {LogGroupType} T
 * @param {LogNameType[T]} LogType - The name of the log to search for
 * @param {T} LogGroup - The name of the log group
 * @returns {boolean} - Returns true, if a specific log is registered
 */
declare function DialogLogQuery<T extends keyof LogNameType>(LogType: LogNameType[T], LogGroup: T): boolean;
/**
 * Sets the AllowItem flag on the current character
 * @param {string} Allow - The flag to set. Either "TRUE" or "FALSE"
 * @returns {boolean} - The boolean version of the flag
 */
declare function DialogAllowItem(Allow: string): boolean;
/**
 * Returns the value of the AllowItem flag of a given character
 * @returns {boolean} - The value of the given character's AllowItem flag
 */
declare function DialogDoAllowItem(): boolean;
/**
 * Returns TRUE if the AllowItem flag doesn't allow putting an item on the current character
 * @returns {boolean} - The reversed value of the given character's AllowItem flag
 */
declare function DialogDontAllowItemPermission(): boolean;
/**
 * Returns TRUE if no item can be used by the player on the current character because of the map distance
 * @returns {boolean} - TRUE if distance is too far (more than 1 tile)
 */
declare function DialogDontAllowItemDistance(): boolean;
/**
 * Determines if the given character is kneeling
 * @param {string | Character} C - The character to check
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {boolean} - Returns true, if the given character is kneeling
 */
declare function DialogIsKneeling(C: string | Character): boolean;
/**
 * Determines if the player is owned by the current character
 * @returns {boolean} - Returns true, if the player is owned by the current character, false otherwise
 */
declare function DialogIsOwner(): boolean;
/**
 * Determines, if the current character is the player's lover
 * @returns {boolean} - Returns true, if the current character is one of the player's lovers
 */
declare function DialogIsLover(): boolean;
/**
 * Determines if the current character is owned by the player
 * @returns {boolean} - Returns true, if the current character is owned by the player, false otherwise
 */
declare function DialogIsProperty(): boolean;
/**
 * Checks, if a given character is currently restrained
 * @param {string | Character} C - The character to check.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {boolean} - Returns true, if the given character is wearing restraints, false otherwise
 */
declare function DialogIsRestrained(C: string | Character): boolean;
/**
 * Checks, if a given character is currently blinded
 * @param {string | Character} C - The character to check.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {boolean} - Returns true, if the given character is blinded, false otherwise
 */
declare function DialogIsBlind(C: string | Character): boolean;
/**
 * Checks, if a given character is currently wearing a vibrating item
 * @param {string | Character} C - The character to check.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {boolean} - Returns true, if the given character is wearing a vibrating item, false otherwise
 */
declare function DialogIsEgged(C: string | Character): boolean;
/**
 * Checks, if a given character is able to change her clothes
 * @param {string | Character} C - The character to check.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @returns {boolean} - Returns true, if the given character is able to change clothes, false otherwise
 */
declare function DialogCanInteract(C: string | Character): boolean;
/**
 * Sets a new pose for the given character
 * @param {string} C - The character whose pose should be altered.
 * Either the player (value: Player) or the current character (value: CurrentCharacter)
 * @param {null | AssetPoseName} [NewPose=null] - The new pose, the character should take.
 * Can be omitted to bring the character back to the standing position.
 * @returns {void} - Nothing
 */
declare function DialogSetPose(C: string, NewPose?: null | AssetPoseName): void;
/**
 * Checks, whether a given skill of the player is greater or equal a given value
 * @param {SkillType} SkillType - Name of the skill to check
 * @param {string} Value - The value, the given skill must be compared to
 * @returns {boolean} - Returns true if a specific skill is greater or equal than a given value
 */
declare function DialogSkillGreater(SkillType: SkillType, Value: string): boolean;
/**
 * Checks, if a given item is available in the player's inventory
 * @param {string} InventoryName
 * @param {AssetGroupName} InventoryGroup
 * @returns {boolean} - Returns true, if the item is available, false otherwise
 */
declare function DialogInventoryAvailable(InventoryName: string, InventoryGroup: AssetGroupName): boolean;
/**
 * Checks, if the player is the administrator of the current chat room
 * @returns {boolean} - Returns true, if the player belogs to the group of administrators for the current char room false otherwise
 */
declare function DialogChatRoomPlayerIsAdmin(): boolean;
/**
 * Checks, if a safe word can be used.
 * @returns {boolean} - Returns true, if the player is currently within a chat room
 */
declare function DialogChatRoomCanSafeword(): boolean;
/**
 * Checks if the player is currently owned.
 * @returns {boolean} - Returns true, if the player is currently owned by an online player (not in trial)
 */
declare function DialogCanViewRules(): boolean;
/**
 * Checks if the has enough GGTS minutes to spend on different activities, for GGTS level 6 and up
 * @param {string} Minute - The number of minutes to compare
 * @returns {boolean} - TRUE if the player has enough minutes
 */
declare function DialogGGTSMinuteGreater(Minute: string): boolean;
/**
 * Checks if the player can spend GGTS minutes on herself, for GGTS level 6 and up
 * @returns {boolean} - TRUE if the player has enough minutes
 */
declare function DialogGGTSCanSpendMinutes(): boolean;
/**
 * The player can ask GGTS for specific actions at level 6, requiring minutes as currency
 * @param {string} Action - The action to trigger
 * @param {string} Minute - The number of minutes to spend
 * @returns {void}
 */
declare function DialogGGTSAction(Action: string, Minute: string): void;
/**
 * Checks if the player can beg GGTS to unlock the room
 * @returns {boolean} - TRUE if GGTS can unlock
 */
declare function DialogGGTSCanUnlock(): boolean;
/**
 * Checks if the player can get the GGTS helmet, only available from GGTS
 * @returns {boolean} - TRUE if GGTS can unlock
 */
declare function DialogGGTSCanGetHelmet(): boolean;
/**
 * Nurses can do special GGTS interactions with other players
 * @returns {boolean} - TRUE if the player is a nurse in a GGTS room
 */
declare function DialogCanStartGGTSInteractions(): boolean;
/**
 * Nurses can ask GGTS for specific interactions with other players
 * @param {string} Interaction - The interaction to trigger
 * @returns {void}
 */
declare function DialogGGTSInteraction(Interaction: string): void;
/**
 * Checks the prerequisite for a given dialog
 * @param {number} D - Index of the dialog to check
 * @returns {boolean} - Returns true, if the prerequisite is met, false otherwise
 */
declare function DialogPrerequisite(D: number): boolean;
/**
 * Checks if the player can play VR games
 * @returns {boolean} - Whether or not the player is wearing a VR headset with Gaming type
 */
declare function DialogHasGamingHeadset(): boolean;
/**
 * Checks if the player can play VR games
 * @returns {boolean} - Whether or not the player is wearing a VR headset with Gaming type
 */
declare function DialogHasGamingHeadsetReady(): boolean;
/**
 * Checks if the player can watch VR games
 * @returns {boolean} - Whether or not the player is wearing a VR headset with Gaming type
 */
declare function DialogCanWatchKinkyDungeon(): boolean;
/**
 * Starts the kinky dungeon game
 * @returns {void}
 */
declare function DialogStartKinkyDungeon(): void;
/**
 * Return to previous room
 * @returns {void}
 */
declare function DialogEndKinkyDungeon(): void;
/**
 * Checks whether the player has a key for the item
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item that should be unlocked
 * @returns {boolean} - Returns true, if the player can unlock the given item with a key, false otherwise
 */
declare function DialogHasKey(C: Character, Item: Item): boolean;
/**
 * Checks whether the player is able to unlock the provided item on the provided character
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item that should be unlocked
 * @returns {boolean} - Returns true, if the player can unlock the given item, false otherwise
 */
declare function DialogCanUnlock(C: Character, Item: Item): boolean;
/**
 * Checks whether we can lockpick a lock.
 * @param {Character} C
 * @param {Item} Item
 * @returns {boolean}
 */
declare function DialogCanPickLock(C: Character, Item: Item): boolean;
/**
 * Checks whether we can lockpick a lock and return an appropriate dialog key.
 * `"PickLock"` will be returned if the lock can be picked.
 * @param {Character} C
 * @param {Item} Item
 * @returns {`PickLock${PickLockAvailability}`}
 */
declare function DialogGetPickLockDialog(C: Character, Item: Item): `PickLock${PickLockAvailability}`;
/**
 * Checks whether we can access a lock.
 *
 * This function is used to enable the locked submenu
 *
 * @param {Character} C - The character wearing the lock
 * @param {Item} Item - The locked item to inspect
 * @returns {boolean}
 */
declare function DialogCanCheckLock(C: Character, Item: Item): boolean;
/**
 * Some specific screens like the movie studio cannot allow the player to use items on herself, return FALSE if it's the case
 * @returns {boolean} - Returns TRUE if we allow using items
 */
declare function DialogAllowItemScreenException(): boolean;
/**
 * Returns the current character dialog intro
 * @returns {string} - The name of the current dialog, if such a dialog exists, any empty string otherwise
 */
declare function DialogIntro(): string;
/**
 * Generic dialog function to leave conversation. De-inititalizes global variables and reverts the
 * FocusGroup of the player and the current character to null
 * @returns {void} - Nothing
 */
declare function DialogLeave(): void;
/**
 * Generic dialog function to remove a piece of the conversation that's already done
 * @returns {void} - Nothing
 */
declare function DialogRemove(): void;
/**
 * Generic dialog function to remove any dialog from a specific group
 * @param {string} GroupName - All dialog options are removed from this group
 * @returns {void} - Nothing
 */
declare function DialogRemoveGroup(GroupName: string): void;
/**
 * Performs a "Back" action through the menu "stack".
 */
declare function DialogMenuBack(): void;
/**
 * Returns whether the current mode shows items.
 */
declare function DialogModeShowsInventory(): boolean;
/**
 * Helper used to check whether the player is in the Appearance screen
 */
declare function DialogIsInWardrobe(): boolean;
/**
 * Leaves the item menu for both characters.
 *
 * This exits the item-selecting UI and switches back to the current character's dialog options.
 *
 * @returns {void} - Nothing
 */
declare function DialogLeaveItemMenu(): void;
/**
 * Leaves the item menu of the focused item. Constructs a function name from the
 * item's asset group name and the item's name and tries to call that.
 */
declare function DialogLeaveFocusItem(): void;
/**
 * Adds the item in the dialog list
 * @param {Character} C - The character the inventory is being built for
 * @param {Item} item - The item to be added to the inventory
 * @param {boolean} isWorn - Should be true, if the item is currently being worn, false otherwise
 * @param {DialogSortOrder} [sortOrder] - Defines where in the inventory list the item is sorted
 * @returns {void} - Nothing
 */
declare function DialogInventoryAdd(C: Character, item: Item, isWorn: boolean, sortOrder?: DialogSortOrder): void;
/**
 * Creates an individual item for the dialog inventory list
 * @param {Character} C - The character the inventory is being built for
 * @param {Item} item - The item to be added to the inventory
 * @param {boolean} isWorn - Should be true if the item is currently being worn, false otherwise
 * @param {DialogSortOrder} [sortOrder] - Defines where in the inventory list the item is sorted
 * @returns {DialogInventoryItem} - The inventory item
 */
declare function DialogInventoryCreateItem(C: Character, item: Item, isWorn: boolean, sortOrder?: DialogSortOrder): DialogInventoryItem;
/**
 * Returns settings for an item based on whether the player and target have favorited it, if any
 * @param {Character} C - The targeted character
 * @param {Asset} asset - The asset to check favorite settings for
 * @param {string} [type=null] - The type of the asset to check favorite settings for
 * @returns {FavoriteState} - The details to use for the asset
 */
declare function DialogGetFavoriteStateDetails(C: Character, asset: Asset, type?: string): FavoriteState;
/**
 * Return icons representing the asset's current lock state
 * @param {Item} item
 * @param {boolean} isWorn
 */
declare function DialogGetLockIcon(item: Item, isWorn: boolean): InventoryIcon[];
/**
 * Returns a list of icons associated with the asset
 * @param {Asset} asset - The asset to get icons for
 * @returns {InventoryIcon[]} - A list of icon names
 */
declare function DialogGetAssetIcons(asset: Asset): InventoryIcon[];
/**
 * Some special screens can always allow you to put on new restraints. This function determines, if this is possible
 * @returns {boolean} - Returns trues, if it is possible to put on new restraints.
 */
declare function DialogAlwaysAllowRestraint(): boolean;
/**
 * Checks whether the player can use a remote on the given character and item
 * @param {Character} C - the character that the item is equipped on
 * @param {Item} Item - the item to check for remote usage against
 * @return {VibratorRemoteAvailability} - Returns the status of remote availability: Available, NoRemote, NoLoversRemote, RemotesBlocked, CannotInteract, NoAccess, InvalidItem
 */
declare function DialogCanUseRemoteState(C: Character, Item: Item): VibratorRemoteAvailability;
/**
 * Checks whether the player can color the given item on the given character
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item to check the player's ability to color against
 * @returns {boolean} - TRUE if the player is able to color the item, FALSE otherwise
 */
declare function DialogCanColor(C: Character, Item: Item): boolean;
/**
 * Checks whether a lock can be inspected while blind.
 * @param {Item} Item - The locked item
 * @returns {boolean}
 */
declare function DialogCanInspectLock(Item: Item): boolean;
/**
 * Builds the possible dialog activity options based on the character settings
 * @param {Character} C - The character for which to build the activity dialog options
 * @return {void} - Nothing
 */
declare function DialogBuildActivities(C: Character): void;
/**
 * Build the buttons in the top menu
 * @param {Character} C - The character for whom the dialog is prepared
 * @returns {void} - Nothing
 */
declare function DialogMenuButtonBuild(C: Character): void;
/**
 * Sort the inventory list by the global variable SortOrder (a fixed number & current language description)
 * @returns {void} - Nothing
 */
declare function DialogInventorySort(): void;
/**
 * Returns TRUE if the crafted item can be used on a character, validates for owners and lovers
 * @param {Character} C - The character whose inventory must be built
 * @param {CraftingItem} Craft - The crafting properties of the item
 * @returns {Boolean} - TRUE if we can use it
 */
declare function DialogCanUseCraftedItem(C: Character, Craft: CraftingItem): boolean;
/**
 * Returns TRUE if the player can use owner locks on the target character
 * @param {Character} target - The target to (potentially) lock
 * @returns {Boolean} - TRUE if the player can use owner locks on the target, FALSE otherwise
 */
declare function DialogCanUseOwnerLockOn(target: Character): boolean;
/**
 * Returns TRUE if the player can use lover locks on the target character
 * @param {Character} target - The target to (potentially) lock
 * @returns {Boolean} - TRUE if the player can use lover locks on the target, FALSE otherwise
 */
declare function DialogCanUseLoverLockOn(target: Character): boolean;
/**
 * Returns TRUE if the player can use family locks on the target character
 * @param {Character} target - The target to (potentially) lock
 * @returns {Boolean} - TRUE if the player can use family locks on the target, FALSE otherwise
 */
declare function DialogCanUseFamilyLockOn(target: Character): boolean;
/**
 * Build the inventory listing for the dialog which is what's equipped,
 * the player's inventory and the character's inventory for that group
 * @param {Character} C - The character whose inventory must be built
 * @param {boolean} [resetOffset=false] - The offset to be at, if specified.
 * @param {boolean} [locks=false] - If TRUE we build a list of locks instead.
 * @returns {void} - Nothing
 */
declare function DialogInventoryBuild(C: Character, resetOffset?: boolean, locks?: boolean): void;
/**
 * Create a stringified list of the group and the assets currently in the dialog inventory
 * @param {Character} C - The character the dialog inventory has been built for
 * @returns {string} - The list of assets as a string
 */
declare function DialogInventoryStringified(C: Character): string;
/**
 * Build the initial state of the selection available in the facial expressions menu
 * @returns {void} - Nothing
 */
declare function DialogFacialExpressionsBuild(): void;
/**
 * Saves the expressions to a slot
 * @param {number} Slot - Index of saved expression (0 to 4)
 */
declare function DialogFacialExpressionsSave(Slot: number): void;
/**
 * Loads expressions from a slot
 * @param {number} Slot - Index of saved expression (0 to 4)
 */
declare function DialogFacialExpressionsLoad(Slot: number): void;
/**
 * Builds the savedexpressions menu previews.
 * @returns {void} - Nothing
 */
declare function DialogBuildSavedExpressionsMenu(): void;
/**
 * Draws the savedexpressions menu
 * @returns {void} - Nothing
 */
declare function DialogDrawSavedExpressionsMenu(): void;
/** Handles clicks in the savedexpressions menu
 * @returns {void} - Nothing
 */
declare function DialogClickSavedExpressionsMenu(): void;
/**
 * Build the initial state of the pose menu
 * @returns {void} - Nothing
 */
declare function DialogLoadPoseMenu(): void;
/**
 * Handles the Click events in the Dialog Screen
 * @returns {boolean} - Whether a button was clicked
 */
declare function DialogMenuButtonClick(): boolean;
/**
 * Publishes the item action to the local chat room or the dialog screen
 * @param {Character} C - The character who is the actor in this action
 * @param {string} Action - The action performed
 * @param {Item} ClickItem - The item that is used
 * @returns {void} - Nothing
 */
declare function DialogPublishAction(C: Character, Action: string, ClickItem: Item): void;
/**
 * Returns TRUE if the clicked item can be processed, make sure it's not the same item as the one already used
 * @param {Item} CurrentItem - The item currently equiped
 * @param {Item} ClickItem - The clicked item
 * @returns {boolean} - TRUE when we can process
 */
declare function DialogAllowItemClick(CurrentItem: Item, ClickItem: Item): boolean;
/**
 * Handles clicks on an item
 * @param {DialogInventoryItem} ClickItem - The item that is clicked
 * @returns {void} - Nothing
 */
declare function DialogItemClick(ClickItem: DialogInventoryItem): void;
/**
 * Toggle permission of an item in the dialog inventory list
 * @param {DialogInventoryItem} item
 * @param {boolean} worn - True if the player is changing permissions for an item they're wearing
 */
declare function DialogInventoryTogglePermission(item: DialogInventoryItem, worn: boolean): void;
/**
 * Changes the dialog mode and perform the initial setup.
 *
 * @param {DialogMenuMode} mode The new mode for the dialog.
 * @param {boolean} reset Whether to reset the mode back to its defaults
 */
declare function DialogChangeMode(mode: DialogMenuMode, reset?: boolean): void;
/**
 * Change the given character's focused group.
 * @param {Character} C - The character to change the focus of.
 * @param {AssetItemGroup|string} Group - The group that should gain focus.
 */
declare function DialogChangeFocusToGroup(C: Character, Group: AssetItemGroup | string): void;
/**
 * Handles the click in the dialog screen
 * @returns {void} - Nothing
 */
declare function DialogClick(): void;
/**
 * Returns whether the clicked co-ordinates are inside the asset zone
 * @param {Character} C - The character the click is on
 * @param {RectTuple} Zone - The 4 part array of the rectangular asset zone on the character's body: [X, Y, Width, Height]
 * @param {number} Zoom - The amount the character has been zoomed
 * @param {number} X - The X co-ordinate of the click
 * @param {number} Y - The Y co-ordinate of the click
 * @param {number} HeightRatio - The displayed height ratio of the character
 * @returns {boolean} - If TRUE the click is inside the zone
 */
declare function DialogClickedInZone(C: Character, Zone: RectTuple, Zoom: number, X: number, Y: number, HeightRatio: number): boolean;
/**
 * Return the co-ordinates and dimensions of the asset group zone as it appears on screen
 * @param {Character} C - The character the zone is calculated for
 * @param {readonly [number, number, number, number]} Zone - The 4 part array of the rectangular asset zone: [X, Y, Width, Height]
 * @param {number} X - The starting X co-ordinate of the character's position
 * @param {number} Y - The starting Y co-ordinate of the character's position
 * @param {number} Zoom - The amount the character has been zoomed
 * @param {number} HeightRatio - The displayed height ratio of the character
 * @returns {[number, number, number, number]} - The 4 part array of the displayed rectangular asset zone: [X, Y, Width, Height]
 */
declare function DialogGetCharacterZone(C: Character, Zone: readonly [number, number, number, number], X: number, Y: number, Zoom: number, HeightRatio: number): [number, number, number, number];
/**
 * Finds and sets the next available character sub menu.
 * @returns {void} - Nothing
 */
declare function DialogFindNextSubMenu(): void;
/**
 * Finds and set an available character sub menu.
 * @param {string} MenuName - The name of the sub menu, see DialogSelfMenuOptions.
 * @param {boolean} force - Whether to check availability of the menu first.
 * @returns {boolean} - True, when the sub menu is found and available and was switched to. False otherwise and nothing happened.
 */
declare function DialogFindSubMenu(MenuName: string, force?: boolean): boolean;
/**
 * Finds and sets a facial expression group. The expression sub menu has to be already opened.
 * @param {ExpressionGroupName} ExpressionGroup - The name of the expression group, see XXX.
 * @returns {boolean} True, when the expression group was found and opened. False otherwise and nothing happens.
 */
declare function DialogFindFacialExpressionMenuGroup(ExpressionGroup: ExpressionGroupName): boolean;
/**
 * Displays the given text for 5 seconds
 * @param {string} status - The text to be displayed
 * @param {number} timer - the number of milliseconds to display the message for
 * @returns {void} - Nothing
 */
declare function DialogSetStatus(status: string, timer?: number): void;
/**
 * Clears the current status message.
 *
 * @param {boolean} clearDefault Whether to also clear the default status.
 */
declare function DialogStatusClear(clearDefault?: boolean): void;
/**
 * Draws the current dialog status
 *
 */
declare function DialogStatusDraw(C: any): void;
/**
 * Shows the extended item menu for a given item, if possible.
 * Therefore a dynamic function name is created and then called.
 * @param {Item} Item - The item the extended menu should be shown for
 * @param {Item} [SourceItem] - The source of the extended menu
 * @returns {void} - Nothing
 */
declare function DialogExtendItem(Item: Item, SourceItem?: Item): void;
/**
 * Shows the tigthen/loosen item menu for a given item, if possible.
 * @param {Item} Item - The item to open the menu for
 * @returns {void} - Nothing
 */
declare function DialogSetTightenLoosenItem(Item: Item): void;
/**
 * Validates that the player is allowed to change the item color and swaps it on the fly
 * @param {Character} C - The player who wants to change the color
 * @param {string} Color - The new color in the format "#rrggbb"
 * @returns {void} - Nothing
 */
declare function DialogChangeItemColor(C: Character, Color: string): void;
/**
 * Draw the list of activities
 *
 * @param {Character} C - The character currently focused in the dialog.
 * @returns {void} - Nothing
 */
declare function DialogDrawActivityMenu(C: Character): void;
/**
 * Returns the button image name for a dialog menu button based on the button name.
 * @param {DialogMenuButton} ButtonName - The menu button name
 * @param {Item} FocusItem - The focused item
 * @returns {string} - The button image name
 */
declare function DialogGetMenuButtonImage(ButtonName: DialogMenuButton, FocusItem: Item): string;
/**
 * Returns the background color of a dialog menu button based on the button name.
 * @param {DialogMenuButton} ButtonName - The menu button name
 * @returns {string} - The background color that the menu button should use
 */
declare function DialogGetMenuButtonColor(ButtonName: DialogMenuButton): string;
/**
 * Determines whether or not a given dialog menu button should be disabled based on the button name.
 * @param {DialogMenuButton} ButtonName - The menu button name
 * @returns {boolean} - TRUE if the menu button should be disabled, FALSE otherwise
 */
declare function DialogIsMenuButtonDisabled(ButtonName: DialogMenuButton): boolean;
/**
 * Draw the item menu dialog
 * @param {Character} C - The character on which the item is used
 * @param {Item} Item - The item that was used
 * @returns {void} - Nothing
 */
declare function DialogDrawCrafting(C: Character, Item: Item): void;
/**
 * Draw the list of items
 *
 * @param {Character} C - The character currently focused in the dialog.
 * @returns {void} - Nothing
 */
declare function DialogDrawItemMenu(C: Character): void;
/**
 * Searches in the dialog for a specific stage keyword and returns that dialog option if we find it, error otherwise
 * @param {string} KeyWord - The key word to search for
 * @returns {string}
 */
declare function DialogFindPlayer(KeyWord: string): string;
/**
 * Searches in the dialog for a specific stage keyword and returns that dialog option if we find it
 * @param {Character} C - The character whose dialog optio*
 * @param {string} KeyWord1 - The key word to search for
 * @param {string} [KeyWord2] - An optionally given second key word. is only looked for, if specified and the first
 * keyword was not found.
 * @param {boolean} [ReturnPrevious=true] - If specified, returns the previous dialog, if neither of the the two key words were found
 ns should be searched
 * @returns {string} - The name of a dialog. That can either be the one with the keyword or the previous dialog.
 * An empty string is returned, if neither keyword was found and no previous dialog was given.
 */
declare function DialogFind(C: Character, KeyWord1: string, KeyWord2?: string, ReturnPrevious?: boolean): string;
/**
 * Searches in the dialog for a specific stage keyword and returns that dialog option if we find it and replace the names
 * @param {Character} C - The character whose dialog options should be searched
 * @param {string} KeyWord1 - The key word to search for
 * @param {string} [KeyWord2] - An optionally given second key word. is only looked for, if specified and the first
 * keyword was not found.
 * @param {boolean} [ReturnPrevious] - If specified, returns the previous dialog, if neither of the the two key words were found
 * @returns {string} - The name of a dialog. That can either be the one with the keyword or the previous dialog.
 * An empty string is returned, if neither keyword was found and no previous dialog was given. 'SourceCharacter'
 * is replaced with the player's name and 'DestinationCharacter' with the current character's name.
 */
declare function DialogFindAutoReplace(C: Character, KeyWord1: string, KeyWord2?: string, ReturnPrevious?: boolean): string;
/**
 * Draw the up/down arrow to bump a character up and down if they're hidden.
 */
declare function DialogDrawRepositionButton(): void;
/**
 * Draws the top menu buttons of the current dialog.
 *
 * @param {Character} C The character currently focused.
 */
declare function DialogDrawTopMenu(C: Character): void;
/**
 * Draws the left menu for the character
 * @param {Character} C - The currently focused character
 */
declare function DialogSelfMenuDraw(C: Character): void;
/**
 * Handles clicks on the left menu
 * @param {Character} C - The currently focused character
 */
declare function DialogSelfMenuClick(C: Character): void;
/**
 * Draws the initial Dialog screen.
 *
 * This is the main handler for drawing the Dialog UI, which activates
 * when the player clicks on herself or another player.
 *
 * @returns {void} - Nothing
 */
declare function DialogDraw(): void;
/**
 * Changes to previous dialog page
 */
declare function DialogMenuPrev(): void;
/**
 * Changes to next dialog page
 */
declare function DialogMenuNext(): void;
/**
 * Draw a single line of text with an optional item preview icon.
 *
 * This function is used when the character's group is somehow unavailable.
 *
 * @param {Character} C - The character currently being interacted with
 * @param {Item} [item] - The (optional) item in the currently selected group
 * @param {string} msg - The explanation message to draw
 */
declare function DialogDrawItemMessage(C: Character, msg: string, item?: Item): void;
/**
 * Draw the menu for changing facial expressions
 * @returns {void} - Nothing
 */
declare function DialogDrawExpressionMenu(): void;
/**
 * Return the page number of the expression item's current expression.
 * @param {ExpressionItem} item - The expression item
 * @returns {number} The page number of the item's current expression
 */
declare function DialogGetCurrentExpressionPage(item: ExpressionItem): number;
/**
 * Handles clicks in the dialog expression menu.
 * @returns {void} - Nothing
 */
declare function DialogClickExpressionMenu(): void;
/**
 * Draws the pose sub menu
 * @returns {void} - Nothing
 */
declare function DialogDrawPoseMenu(): void;
/**
 * Handles clicks in the pose sub menu
 * @returns {void} - Nothing
 */
declare function DialogClickPoseMenu(): void;
/**
 * Sets the current character sub menu to the owner rules
 * @returns {void} - Nothing
 */
declare function DialogViewOwnerRules(): void;
/**
 * Draws the rules sub menu
 * @returns {void} - Nothing
 */
declare function DialogDrawOwnerRulesMenu(): void;
/**
 * Sets the skill ratio for the player, will be a % of effectiveness applied to the skill when using it.
 * This way a player can use only a part of her bondage or evasion skill.
 * @param {SkillType} SkillType - The name of the skill to influence
 * @param {string} NewRatio - The ratio of this skill that should be used
 * @returns {void} - Nothing
 */
declare function DialogSetSkillRatio(SkillType: SkillType, NewRatio: string): void;
/**
 * Leave the dialog and revert back to a safe state, when the player uses her safe word
 * @returns {void} - Nothing
 */
declare function DialogChatRoomSafewordRevert(): void;
/**
 * Leave the dialog and release the player of all restraints before returning them to the Main Lobby
 * @returns {void} - Nothing
 */
declare function DialogChatRoomSafewordRelease(): void;
/**
 * Close the dialog and switch to the crafting screen.
 * @returns {void} - Nothing
 */
declare function DialogOpenCraftingScreen(): void;
/**
 * Check whether it's possible to access the crafting interface.
 * @returns {boolean}
 */
declare function DialogCanCraft(): boolean;
/**
 * Provides a group's real name for male characters
 *
 * @param {Character} C
 * @param {AssetGroup} G
 */
declare function DialogActualNameForGroup(C: Character, G: AssetGroup): string;
/**
 * Propose one of the struggle minigames or start one automatically.
 *
 * This function checks the difficulty of the current struggle attempt and
 * either use the Strength minigame by default or setup the menu state to show
 * the selection screen.
 *
 * @param {Character} C
 * @param {DialogStruggleActionType} Action
 * @param {Item} PrevItem
 * @param {Item} NextItem
 */
declare function DialogStruggleStart(C: Character, Action: DialogStruggleActionType, PrevItem: Item, NextItem: Item): void;
declare function DialogStruggleStop(character: Character, game: StruggleKnownMinigames, data: StruggleCompletionData): void;
declare function DialogKeyDown(event: KeyboardEvent): boolean;
declare var DialogText: string;
declare var DialogTextDefault: string;
declare var DialogTextDefaultTimer: number;
/** The duration temporary status message show up for, in ms
 * @type {number}
 */
declare var DialogTextDefaultDuration: number;
/**
 * The default color to use when applying items.
 * @type {null | string}
 */
declare var DialogColorSelect: null | string;
/**
 * The list of available items for the selected group.
 * @type {DialogInventoryItem[]}
 */
declare var DialogInventory: DialogInventoryItem[];
/**
 * The current page offset of the item list. Also used for activities.
 * @type {number}
 */
declare var DialogInventoryOffset: number;
/**
 * The grid configuration for most item views (items, permissions, activities)
 * @type {CommonGenerateGridParameters}
 */
declare const DialogInventoryGrid: CommonGenerateGridParameters;
/**
 * The item currently selected in the Dialog and showing its extended screen.
 *
 * Note that in case this is a lock, the item being locked is available in {@link DialogFocusSourceItem}.
 * @type {Item|null}
 */
declare var DialogFocusItem: Item | null;
/** @type {Item|null} */
declare var DialogTightenLoosenItem: Item | null;
/**
 * The actual item being locked while the lock asset has its extended screen drawn.
 * @type {Item|null}
 */
declare var DialogFocusSourceItem: Item | null;
/** @type {null | ReturnType<typeof setTimeout>} */
declare var DialogFocusItemColorizationRedrawTimer: null | ReturnType<typeof setTimeout>;
/**
 * The list of currently visible menu item buttons.
 * @type {DialogMenuButton[]}
 */
declare var DialogMenuButton: DialogMenuButton[];
/**
 * The dialog's current mode, what is currently shown.
 * @type {DialogMenuMode}
 */
declare var DialogMenuMode: DialogMenuMode;
/** @deprecated Use {@link DialogMenuMode}. */
declare var DialogColor: never;
/** @deprecated Use {@link DialogMenuMode}. */
declare var DialogItemPermissionMode: never;
/** @deprecated Use {@link DialogMenuMode}.*/
declare var DialogItemToLock: never;
/** @deprecated Use {@link DialogMenuMode}. */
declare var DialogActivityMode: never;
/** @deprecated Use {@link DialogMenuMode}. */
declare var DialogLockMenu: never;
/** @deprecated Use {@link DialogMenuMode}. */
declare var DialogCraftingMenu: never;
/**
 * The group that was selected before we entered the expression coloring screen
 * @type {{mode: DialogMenuMode, group: AssetItemGroup}}
 */
declare var DialogExpressionPreviousMode: {
    mode: DialogMenuMode;
    group: AssetItemGroup;
};
/** @type {ExpressionItem[]} */
declare var DialogFacialExpressions: ExpressionItem[];
/** The maximum number of expressions per page for a given asset group. */
declare const DialogFacialExpressionsPerPage: 18;
/**
 * The currently selected expression page number for a given asset group.
 * Contains up to {@link DialogFacialExpressionsPerPage} expressions.
 */
declare let DialogFacialExpressionsSelectedPage: number;
declare var DialogFacialExpressionsSelected: number;
declare var DialogFacialExpressionsSelectedBlindnessLevel: number;
/** @type {Character[]} */
declare var DialogSavedExpressionPreviews: Character[];
/** @type {Pose[][]} */
declare var DialogActivePoses: Pose[][];
declare var DialogExtendedMessage: string;
/**
 * The list of available activities for the selected group.
 * @type {ItemActivity[]}
 */
declare var DialogActivity: ItemActivity[];
declare namespace DialogSortOrder {
    let Enabled: 1;
    let Equipped: 2;
    let BothFavoriteUsable: 3;
    let TargetFavoriteUsable: 4;
    let PlayerFavoriteUsable: 5;
    let Usable: 6;
    let TargetFavoriteUnusable: 7;
    let PlayerFavoriteUnusable: 8;
    let Unusable: 9;
    let Blocked: 10;
}
/** @type {null | DialogSelfMenuOptionType} */
declare var DialogSelfMenuSelected: null | DialogSelfMenuOptionType;
declare var DialogLeaveDueToItem: boolean;
declare var DialogLentLockpicks: boolean;
declare var DialogGamingPreviousRoom: string;
/** @type {"" | ModuleType} */
declare var DialogGamingPreviousModule: "" | ModuleType;
declare var DialogButtonDisabledTester: RegExp;
/**
 * The attempted action that's leading the player to struggle.
 * @type {DialogStruggleActionType?}
 */
declare let DialogStruggleAction: DialogStruggleActionType | null;
/**
 * The item we're struggling out of, or swapping from.
 * @type {Item}
 */
declare let DialogStrugglePrevItem: Item;
/**
 * The item we're swapping to.
 * @type {Item}
 */
declare let DialogStruggleNextItem: Item;
/** Whether we went through the struggle selection screen or went straight through. */
declare let DialogStruggleSelectMinigame: boolean;
/** @type {Map<string, string>} */
declare var PlayerDialog: Map<string, string>;
/** @type {FavoriteState[]} */
declare var DialogFavoriteStateDetails: FavoriteState[];
/**
 * The list of menu types available when clicking on yourself
 * @type {readonly DialogSelfMenuOptionType[]}
 */
declare var DialogSelfMenuOptions: readonly DialogSelfMenuOptionType[];
declare namespace DialogEffectIcons {
    let Table: Partial<Record<InventoryIcon, readonly EffectName[]>>;
    function GetIcons(item: Item): InventoryIcon[];
    let GetEffectIcons: (effects: EffectName[], prop?: CraftingPropertyType) => InventoryIcon[];
    function _GetGagIcon(effect: EffectName, prop?: CraftingPropertyType): InventoryIcon;
    function _GetBlindIcon(effect: EffectName, prop?: CraftingPropertyType): InventoryIcon;
    function _GetDeafIcon(effect: EffectName): InventoryIcon;
    let _GagLevelToIcon: (level?: number) => InventoryIcon;
    let _BlindLevelToIcon: (level?: number) => InventoryIcon;
}
declare function DialogMouseWheel(Event: any): boolean;
