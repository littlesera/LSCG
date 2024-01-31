/**
 * Loads a character into the buffer, creates it if it does not exist
 * @param {number} CharacterID - ID of the character
 * @param {IAssetFamily} CharacterAssetFamily - Name of the asset family of the character
 * @param {CharacterType} [Type=CharacterType.ONLINE] - The character type
 * @returns {Character} - The newly loaded character
 */
declare function CharacterReset(CharacterID: number, CharacterAssetFamily: IAssetFamily, Type?: CharacterType): Character;
/**
 * Attributes a random name for the character, does not select a name in use
 * @param {Character} C - Character for which to attribute a name
 * @returns {void} - Nothing
 */
declare function CharacterRandomName(C: Character): void;
/**
 * Substitute name and pronoun fields in dialog.
 * @param {Character} C - Character for which to build the dialog
 * @returns {void} - Nothing
 */
declare function CharacterDialogSubstitution(C: Character): void;
/**
 * Builds the dialog objects from the character CSV file
 * @param {Character} C - Character for which to build the dialog
 * @param {readonly string[][]} CSV - Content of the CSV file
 * @param {string} functionPrefix - A prefix that will be added to functions that aren't part of the Dialog or ChatRoom "namespace"
 * @returns {void} - Nothing
 */
declare function CharacterBuildDialog(C: Character, CSV: readonly string[][], functionPrefix: string): void;
/**
 * Loads the content of a CSV file to build the character dialog. Can override the current screen.
 * @param {Character} C - Character for which to build the dialog objects
 * @param {DialogInfo} [info]
 * @returns {void} - Nothing
 */
declare function CharacterLoadCSVDialog(C: Character, info?: DialogInfo): void;
/**
 * Sets the clothes based on a character archetype
 * @param {Character} C - Character to set the clothes for
 * @param {"Maid" | "Mistress" | "Employee"} Archetype - Archetype to determine the clothes to put on
 * @param {string} [ForceColor] - Color to use for the added clothes
 * @returns {void} - Nothing
 */
declare function CharacterArchetypeClothes(C: Character, Archetype: "Maid" | "Mistress" | "Employee", ForceColor?: string): void;
/**
 * Loads an NPC into the character array. The appearance is randomized, and a type can be provided to dress them in a given style.
 * @param {string} NPCType - Archetype of the NPC
 * @returns {NPCCharacter} - The randomly generated NPC
 */
declare function CharacterLoadNPC(NPCType: string): NPCCharacter;
/**
 * Create a minimal character object
 * @param {string} AccName - The account name to give to the character
 * @returns {Character} - The created character
 */
declare function CharacterLoadSimple(AccName: string): Character;
/**
 * Sets up an online character
 * @param {Character} Char - Online character to set up
 * @param {ServerAccountDataSynced} data - Character data received
 * @param {number} SourceMemberNumber - Source number of the refresh
 */
declare function CharacterOnlineRefresh(Char: Character, data: ServerAccountDataSynced, SourceMemberNumber: number): void;
/**
 * Loads an online character and flags it for a refresh if any data was changed
 * @param {ServerAccountDataSynced} data - Character data received
 * @param {number} SourceMemberNumber - Source number of the load trigger
 * @returns {Character} - The reloaded character
 */
declare function CharacterLoadOnline(data: ServerAccountDataSynced, SourceMemberNumber: number): Character;
/**
 * Deletes an NPC from the buffer
 * @param {string} NPCType - Account name of the npc to delete
 * @returns {void} - Nothing
 */
declare function CharacterDelete(NPCType: string): void;
/**
 * Deletes all online characters from the character array
 * @returns {void} - Nothing
 */
declare function CharacterDeleteAllOnline(): void;
/**
 * Refreshes the list of effects for a character. Each effect can only be found once in the effect array
 * @param {Character} C - Character for which to refresh the effect list
 * @returns {void} - Nothing
 */
declare function CharacterLoadEffect(C: Character): void;
/**
 * Refreshes the character's attribute list
 * @param {Character} C
 * @returns {void} - Nothing
 */
declare function CharacterLoadAttributes(C: Character): void;
/**
 * Returns a list of effects for a character from some or all groups
 * @param {Character} C - The character to check
 * @param {readonly AssetGroupName[]} [Groups=null] - Optional: The list of groups to consider. If none defined, check all groups
 * @param {boolean} [AllowDuplicates=false] - Optional: If true, keep duplicates of the same effect provided they're taken from different groups
 * @returns {EffectName[]} - A list of effects
 */
declare function CharacterGetEffects(C: Character, Groups?: readonly AssetGroupName[], AllowDuplicates?: boolean): EffectName[];
/**
 * Loads a character's tints, resolving tint definitions against items from the character's appearance
 * @param {Character} C - Character whose tints should be loaded
 * @returns {void} - Nothing
 */
declare function CharacterLoadTints(C: Character): void;
/**
 * Loads a character's canvas by sorting its appearance and drawing it.
 * @param {Character} C - Character to load the canvas for
 * @returns {void} - Nothing
 */
declare function CharacterLoadCanvas(C: Character): void;
/**
 * Reloads all character canvases in need of being redrawn.
 * @returns {void} - Nothing
 */
declare function CharacterLoadCanvasAll(): void;
/**
 * Sets the current character to have a dialog with
 * @param {Character} C - Character to have a conversation with
 * @returns {void} - Nothing
 */
declare function CharacterSetCurrent(C: Character): void;
/**
 * Changes the character money and sync with the account server, factors in the cheaters version.
 * @param {Character} C - Character for which we are altering the money amount
 * @param {number} Value - Money to subtract/add
 * @returns {void} - Nothing
 */
declare function CharacterChangeMoney(C: Character, Value: number): void;
/**
 * Refreshes the character parameters (Effects, poses, canvas, settings, etc.)
 * @param {Character} C - Character to refresh
 * @param {boolean} [Push=true] - Pushes the data to the server database if true or null.
 * Note that this will *not* push appearance changes to the rest of the chatroom,
 * which requires either {@link ChatRoomCharacterItemUpdate} or {@link ChatRoomCharacterUpdate}.
 * @param {boolean} [RefreshDialog=true] - Refreshes the character dialog
 * @returns {void} - Nothing
 */
declare function CharacterRefresh(C: Character, Push?: boolean, RefreshDialog?: boolean): void;
/**
 * Refresh the character's dialog state.
 *
 * This function restore consistency between its state variables and the new character appearance,
 * like making sure the focused items are still present and deselecting them otherwise.
 *
 * @param {Character} C - Character to refresh
 * @returns {void} - Nothing
 */
declare function CharacterRefreshDialog(C: Character): void;
/**
 * Checks if a character is wearing items (restraints), the slave collar is ignored.
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is wearing an item
 */
declare function CharacterHasNoItem(C: Character): boolean;
/**
 * Checks if a character is naked
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is naked
 */
declare function CharacterIsNaked(C: Character): boolean;
/**
 * Checks if a character is in underwear
 * @param {Character} C - Character to inspect the appearance of
 * @returns {boolean} - Returns TRUE if the given character is at most in underwear (can be naked)
 */
declare function CharacterIsInUnderwear(C: Character): boolean;
/**
 * Removes all appearance items from the character
 * @param {Character} C - Character to undress
 * @returns {void} - Nothing
 */
declare function CharacterNaked(C: Character): void;
/**
 * Dresses the given character in random underwear
 * @param {Character} C - Character to randomly dress
 * @returns {void} - Nothing
 */
declare function CharacterRandomUnderwear(C: Character): void;
/**
 * Removes all appearance items from the character except underwear
 * @param {Character} C - Character to undress partially
 * @param {Array.<*>} Appearance - Appearance array to remove clothes from
 * @returns {void} - Nothing
 */
declare function CharacterUnderwear(C: Character, Appearance: Array<any>): void;
/**
 * Redresses a character based on a given appearance array
 * @param {Character} C - Character to redress
 * @param {Array.<*>} Appearance - Appearance array to redress the character with
 * @returns {void} - Nothing
 */
declare function CharacterDress(C: Character, Appearance: Array<any>): void;
/**
 * Removes all binding items from a given character
 * @param {Character} C - Character to release
 * @param {boolean} [Refresh=false] - do not call CharacterRefresh if false
 * @returns {void} - Nothing
 */
declare function CharacterRelease(C: Character, Refresh?: boolean): void;
/**
 * Releases a character from all locks matching the given lock name
 * @param {Character} C - Character to release from the lock(s)
 * @param {AssetLockType} LockName - Name of the lock to look for
 * @returns {void} - Nothing
 */
declare function CharacterReleaseFromLock(C: Character, LockName: AssetLockType): void;
/**
 * Releases a character from all restraints that are not locked
 * @param {Character} C - Character to release
 * @returns {void} - Nothing
 */
declare function CharacterReleaseNoLock(C: Character): void;
/**
 * Removes all items except for clothing and slave collars from the character
 * @param {Character} C - Character to release
 * @returns {void} - Nothing
 */
declare function CharacterReleaseTotal(C: Character): void;
/**
 * Gets the bonus amount of a given type for a given character (Kidnap league)
 * @param {Character} C - Character for which we want to get the bonus amount
 * @param {string} BonusType - Type/name of the bonus to look for
 * @returns {number} - Active bonus amount for the bonus type
 */
declare function CharacterGetBonus(C: Character, BonusType: string): number;
/**
 * Restrains a character with random restraints. Some restraints are specifically disabled for randomization in their definition.
 * @param {Character} C - The target character to restrain
 * @param {"FEW"|"LOT"|"ALL"} [Ratio] - Amount of restraints to put on the character
 * @param {boolean} [Refresh] - do not call CharacterRefresh if false
 */
declare function CharacterFullRandomRestrain(C: Character, Ratio?: "FEW" | "LOT" | "ALL", Refresh?: boolean): void;
/**
 * Sets a specific facial expression on the character's specified AssetGroup.
 *
 * If there's a timer, the expression will expire after it. Note that a timed expression cannot override another one.
 *
 * Be careful that "Eyes" for this function means both eyes. Use Eyes1/Eyes2 to target the left or right one only.
 *
 * @param {Character} C - Character for which to set the expression of
 * @param {ExpressionGroupName | "Eyes1"} AssetGroup - Asset group for the expression
 * @param {null | ExpressionName} Expression - Name of the expression to use
 * @param {number} [Timer] - Optional: time the expression will last
 * @param {ItemColor} [Color] - Optional: color of the expression to set
 * @param {boolean} [fromQueue] - Internal: used to skip queuing the expression change if it comes from the queued expressions
 * @returns {void} - Nothing
 */
declare function CharacterSetFacialExpression(C: Character, AssetGroup: ExpressionGroupName | "Eyes1", Expression: null | ExpressionName, Timer?: number, Color?: ItemColor, fromQueue?: boolean): void;
/**
 * Resets the character's facial expression to the default
 * @param {Character} C - Character for which to reset the expression of
 * @returns {void} - Nothing
 */
declare function CharacterResetFacialExpression(C: Character): void;
/**
 * Checks if a given expression is allowed on a character
 * @param {Character} C
 * @param {Item} Item
 * @param {ExpressionName} Expression
 */
declare function CharacterIsExpressionAllowed(C: Character, Item: Item, Expression: ExpressionName): boolean;
/**
 * Gets the currently selected character
 * @returns {Character|null} - Currently selected character
 */
declare function CharacterGetCurrent(): Character | null;
/**
 * Compresses a character wardrobe from an array to a LZ string to use less storage space
 * @param {readonly ItemBundle[][]} Wardrobe - Uncompressed wardrobe
 * @returns {string} - The compressed wardrobe
 */
declare function CharacterCompressWardrobe(Wardrobe: readonly ItemBundle[][]): string;
/**
 * Decompresses a character wardrobe from a LZ String to an array if it was previously compressed (For backward compatibility with old
 * wardrobes)
 * @param {ItemBundle[][] | string} Wardrobe - The current wardrobe
 * @returns {ItemBundle[][]} - The array of wardrobe items decompressed
 */
declare function CharacterDecompressWardrobe(Wardrobe: ItemBundle[][] | string): ItemBundle[][];
/**
 * Checks if the character is wearing an item that has a specific attribute
 * @param {Character} C - The character to test for
 * @param {AssetAttribute} Attribute - The name of the attribute that must be allowed
 * @returns {boolean} - TRUE if at least one item has that attribute
 */
declare function CharacterHasItemWithAttribute(C: Character, Attribute: AssetAttribute): boolean;
/**
 * Checks if the character is wearing an item that allows for a specific activity
 * @param {Character} C - The character to test for
 * @param {ActivityName} Activity - The name of the activity that must be allowed
 * @returns {Item[]} - A list of items allowing that activity
 */
declare function CharacterItemsForActivity(C: Character, Activity: ActivityName): Item[];
/**
 * Checks if the character is wearing an item that allows for a specific activity
 * @param {Character} C - The character to test for
 * @param {ActivityName} Activity - The name of the activity that must be allowed
 * @returns {boolean} - TRUE if at least one item allows that activity
 */
declare function CharacterHasItemForActivity(C: Character, Activity: ActivityName): boolean;
/**
 * Checks if the character is edged or not. The character is edged if every equipped vibrating item on an orgasm zone has the "Edged" effect
 * @param {Character} C - The character to check
 * @returns {boolean} - TRUE if the character is edged, FALSE otherwise
 */
declare function CharacterIsEdged(C: Character): boolean;
/**
 * Checks if the character is wearing an item flagged as a category in a blocked list
 * @param {Character} C - The character to validate
 * @param {Array} BlockList - An array of strings to validate
 * @returns {boolean} - TRUE if the character is wearing a blocked item, FALSE otherwise
 */
declare function CharacterHasBlockedItem(C: Character, BlockList: any[]): boolean;
/**
 * Retrieves the member numbers of the given character
 * @param {Character} C - The character to retrieve the lovers numbers from
 * @param {Boolean} [MembersOnly] - Whether to omit NPC lovers - defaults to false (NPCs will be included by default)
 * @returns {Array<String | Number>} - A list of member numbers or NPC account names representing the lovers of the
 * given character
 */
declare function CharacterGetLoversNumbers(C: Character, MembersOnly?: boolean): Array<string | number>;
/**
 * Returns whether the character appears upside-down on the screen which may depend on the player's own inverted status
 * @param {Character} C - The character to check
 * @returns {boolean} - If TRUE, the character appears upside-down
 */
declare function CharacterAppearsInverted(C: Character): boolean;
/**
 * Checks whether the given character can kneel unaided
 * @param {Character} C - The character to check
 * @returns {boolean} - Returns true if the character is capable of kneeling unaided, false otherwise
 */
declare function CharacterCanKneel(C: Character): boolean;
/**
 * Determines how much the character's view should be darkened based on their blind level. 1 is fully visible, 0 is pitch black.
 * @param {Character} C - The character to check
 * @param {boolean} [eyesOnly=false] - If TRUE only check whether the character has eyes closed, and ignore item effects
 * @returns {number} - The number between 0 (dark) and 1 (bright) that determines screen darkness
 */
declare function CharacterGetDarkFactor(C: Character, eyesOnly?: boolean): number;
/**
 * Gets the array of color tints that should be applied for a character in RGBA format.
 * @param {Character} C - The character
 * @returns {RGBAColor[]} - A list of RGBA tints that are currently affecting the character
 */
declare function CharacterGetTints(C: Character): RGBAColor[];
/**
 * Gets the clumsiness level of a character. This represents dexterity when interacting with locks etc. and can have a
 * maximum value of 5.
 * @param {Character} C - The character to check
 * @returns {number} - The clumsiness rating of the player, a number between 0 and 5 inclusive.
 */
declare function CharacterGetClumsiness(C: Character): number;
/**
 * Applies hooks to a character based on conditions
 * Future hooks go here
 * @param {Character} C - The character to check
 * @param {boolean} IgnoreHooks - Whether to remove some hooks from the player (such as during character dialog).
 * @returns {boolean} - If a hook was applied or removed
 */
declare function CharacterCheckHooks(C: Character, IgnoreHooks: boolean): boolean;
/**
 * Transfers an item from one character to another
 * @param {Character} FromC - The character from which to pick the item
 * @param {Character} ToC - The character on which we must put the item
 * @param {AssetGroupName} Group - The item group to transfer (Cloth, Hat, etc.)
 * @returns {void} - Nothing
 */
declare function CharacterTransferItem(FromC: Character, ToC: Character, Group: AssetGroupName, Refresh: any): void;
/**
 * Check if the given character can be aroused at all.
 * @param {Character} C - The character to test
 * @returns {boolean} That character can be aroused
 */
declare function CharacterHasArousalEnabled(C: Character): boolean;
/**
 * Removes all ownership and owner-only data
 * @param {Character} C - The character breaking from their owner
 * @returns {void} - Nothing.
 */
declare function CharacterClearOwnership(C: Character): void;
/**
 * Returns the nickname of a character, or the name if the nickname isn't valid
 * Also validates if the character is a GGTS drone to alter her name
 * @param {Character} C - The character breaking from their owner
 * @returns {string} - The nickname to return
 */
declare function CharacterNickname(C: Character): string;
/**
 * Returns dialog text for a character based on their chosen pronouns. Default to She/Her entries
 * @param {Character} C - The character to fetch dialog for
 * @param {string} DialogKey - The type of dialog entry to look for
 * @param {boolean} HideIdentity - Whether to use generic they/them pronouns
 * @returns {string} - The text to use
 */
declare function CharacterPronoun(C: Character, DialogKey: string, HideIdentity: boolean): string;
/**
 * Returns the description text for the character's chosen pronouns. Default to She/Her
 * @param {Character} C - The character to fetch text for
 * @returns {string} - The text to use
 */
declare function CharacterPronounDescription(C: Character): string;
declare function CharacterSetNickname(C: any, Nick: any): "NicknameTooLong" | "NicknameInvalidChars";
/**
 * Updates the leash state on a character
 *
 * @param {Character} C
 */
declare function CharacterRefreshLeash(C: Character): void;
/**
 * Create and return a character's script item, if appropriate
 * @param {Character} C
 * @returns {Item}
 */
declare function CharacterScriptGet(C: Character): Item;
/**
 * Refresh the character's script
 * @param {Character} C
 */
declare function CharacterScriptRefresh(C: Character): void;
/**
 * Remove a character's script item
 * @param {Character} C
 */
declare function CharacterScriptRemove(C: Character): void;
/**
 * Sets a new pose for the character
 * @param {Character} C - Character for which to set the pose
 * @param {null | AssetPoseName} poseName - Name of the pose to set as active or `null` to return to the default pose
 * @param {boolean} [forceChange=false] - TRUE if the set pose(s) should overwrite current active pose(s)
 * @returns {void} - Nothing
 * @deprecated - Deprecated alias for {@link PoseSetActive}
 */
declare function CharacterSetActivePose(C: Character, poseName: null | AssetPoseName, forceChange?: boolean): void;
/**
 * Checks whether the given character can change to the named pose (without aid by default).
 * @param {Character} C - The character to check
 * @param {AssetPoseName} poseName - The name of the pose to check for
 * @returns {boolean} - Returns true if the character has no conflicting items and is not prevented from changing to
 * the provided pose
 * @deprecated Superseded by {@link PoseCanChangeUnaided}
 */
declare function CharacterCanChangeToPose(C: Character, poseName: AssetPoseName): boolean;
/** @type Character[] */
declare var Character: Character[];
declare var CharacterNextId: number;
/** @type {Map<BlindEffectName, number>} */
declare const CharacterBlindLevels: Map<BlindEffectName, number>;
/** @type {Map<DeafEffectName, number>} */
declare const CharacterDeafLevels: Map<DeafEffectName, number>;
/** @type {Map<BlurEffectName, number>} */
declare const CharacterBlurLevels: Map<BlurEffectName, number>;
/**
 * An enum representing the various character archetypes
 * ONLINE: The player, or a character representing another online player
 * NPC: Any NPC
 * SIMPLE: Any simple character, generally used internally and not to represent an actual in-game character
 * @type {Record<"ONLINE"|"NPC"|"SIMPLE", CharacterType>}
 */
declare var CharacterType: Record<"ONLINE" | "NPC" | "SIMPLE", CharacterType>;
