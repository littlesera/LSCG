/**
 * Checks if the current room allows for activities. (They can only be done in certain rooms)
 * @returns {boolean} - Whether or not activities can be done
 */
declare function ActivityAllowed(): boolean;
/**
 * Loads the activity dictionary that will be used throughout the game to output messages. Loads from cache first if possible.
 * @return {void} - Nothing
 */
declare function ActivityDictionaryLoad(): void;
/**
 * Translates the activity dictionary.
 * @param {string} CachePath - Path to the language cache.
 */
declare function ActivityTranslate(CachePath: string): void;
/**
 * Searches in the dictionary for a specific keyword's text
 * @param {string} KeyWord - Tag of the activity description to search for
 * @returns {string} - Description associated to the given keyword
 */
declare function ActivityDictionaryText(KeyWord: string): string;
/**
 * Resolve a group name to the correct group for activities
 * @param {IAssetFamily} family - The asset family for the named group
 * @param {AssetGroupItemName} groupname - The name of the group to resolve
 * @returns {AssetItemGroup | null} - The resolved group
 */
declare function ActivityGetGroupOrMirror(family: IAssetFamily, groupname: AssetGroupItemName): AssetItemGroup | null;
/**
 * Gets all groups that mirror or are mirrored by the given group name for activities. The returned array includes the
 * named group.
 * @param {IAssetFamily} family - The asset family for the named group
 * @param {AssetGroupName} groupName - The name of the group to resolve
 * @returns {AssetGroup[]} - The group and all groups from the same family that mirror or are mirrored by it
 */
declare function ActivityGetAllMirrorGroups(family: IAssetFamily, groupName: AssetGroupName): AssetGroup[];
/**
 * Check if any activities are possible for a character's given group.
 * @param {Character} char - The character on which the check is done
 * @param {AssetGroupItemName} groupname - The group to check access on
 * @returns {boolean} Whether any activity is possible
 */
declare function ActivityPossibleOnGroup(char: Character, groupname: AssetGroupItemName): boolean;
/**
 * Check whether a given activity can be performed on a group
 * @param {Character} char - The character being targeted
 * @param {Activity} act - The activity to consider
 * @param {AssetGroup} group - The group to check
 * @returns {boolean} whether that activity's target is valid
 */
declare function ActivityHasValidTarget(char: Character, act: Activity, group: AssetGroup): boolean;
/**
 * Check that an activity is permitted by an actor's settings.
 * @param {Activity} activity - The activity to consider
 * @param {Character|PlayerCharacter} character - The character to check with
 * @param {boolean} onOther - Whether we look at doing to or being done on
 * @returns {boolean} whether the activity is permitted
 */
declare function ActivityCheckPermissions(activity: Activity, character: Character | PlayerCharacter, onOther: boolean): boolean;
/**
 * Check that that a given prerequisite is met.
 * @param {ActivityPrerequisite} prereq - The prerequisite to consider
 * @param {Character|PlayerCharacter} acting - The character performing the activity
 * @param {Character|PlayerCharacter} acted - The character being acted on
 * @param {AssetGroup} group - The group being acted on
 * @returns {boolean} whether the given activity's prerequisite are satisfied
 */
declare function ActivityCheckPrerequisite(prereq: ActivityPrerequisite, acting: Character | PlayerCharacter, acted: Character | PlayerCharacter, group: AssetGroup): boolean;
/**
 * Check that an activity's prerequisites are met.
 * @param {Activity} activity - The activity to consider
 * @param {Character|PlayerCharacter} acting - The character performing the activity
 * @param {Character|PlayerCharacter} acted - The character being acted on
 * @param {AssetGroup} group - The group being acted on
 * @returns {boolean} whether the given activity's prerequisite are satisfied
 */
declare function ActivityCheckPrerequisites(activity: Activity, acting: Character | PlayerCharacter, acted: Character | PlayerCharacter, group: AssetGroup): boolean;
/**
 *
 * @param {ItemActivity[]} allowed
 * @param {Character} acting
 * @param {Character} acted
 * @param {ActivityName} needsItem
 * @param {Activity} activity
 */
declare function ActivityGenerateItemActivitiesFromNeed(allowed: ItemActivity[], acting: Character, acted: Character, needsItem: ActivityName, activity: Activity): boolean;
/**
 * Builds the allowed activities on a group given the character's settings.
 * @param {Character} character - The character for which to build the activity dialog options
 * @param {AssetGroupItemName} groupname - The group to check
 * @return {ItemActivity[]} - The list of allowed activities
 */
declare function ActivityAllowedForGroup(character: Character, groupname: AssetGroupItemName): ItemActivity[];
/**
 * Returns TRUE if an activity can be done
 * @param {Character} C - The character to evaluate
 * @param {ActivityName} Activity - The name of the activity
 * @param {AssetGroupItemName} Group - The name of the group
 * @return {boolean} - TRUE if the activity can be done
 */
declare function ActivityCanBeDone(C: Character, Activity: ActivityName, Group: AssetGroupItemName): boolean;
/**
 * Calculates the effect of an activity performed on a zone
 * @param {Character} S - The character performing the activity
 * @param {Character} C - The character on which the activity is performed
 * @param {ActivityName | Activity} A - The activity performed
 * @param {AssetGroupItemName} Z - The group/zone name where the activity was performed
 * @param {number} [Count=1] - If the activity is done repeatedly, this defines the number of times, the activity is done.
 * If you don't want an activity to modify arousal, set this parameter to '0'
 * @param {Asset} [Asset] - The asset used to perform the activity
 * @return {void} - Nothing
 */
declare function ActivityEffect(S: Character, C: Character, A: ActivityName | Activity, Z: AssetGroupItemName, Count?: number, Asset?: Asset): void;
/**
 * Used for arousal events that are not activities, such as stimulation events
 * @param {Character} S - The character performing the activity
 * @param {Character} C - The character on which the activity is performed
 * @param {number} Amount - The base amount of arousal to add
 * @param {AssetGroupItemName} Z - The group/zone name where the activity was performed
 * @param {number} [Count=1] - If the activity is done repeatedly, this defines the number of times, the activity is done.
 * If you don't want an activity to modify arousal, set this parameter to '0'
 * @param {Asset} [Asset] - The asset used to perform the activity
 * @return {void} - Nothing
 */
declare function ActivityEffectFlat(S: Character, C: Character, Amount: number, Z: AssetGroupItemName, Count?: number, Asset?: Asset): void;
/**
 * Syncs the player arousal with everyone in chatroom
 * @param {Character} C - The character for which to sync the arousal data
 * @return {void} - Nothing
 */
declare function ActivityChatRoomArousalSync(C: Character): void;
/**
 * Sets the character arousal level and validates the value
 * @param {Character} C - The character for which to set the arousal progress of
 * @param {number} Progress - Progress to set for the character (Ranges from 0 to 100)
 * @return {void} - Nothing
 */
declare function ActivitySetArousal(C: Character, Progress: number): void;
/**
 * Sets an activity progress on a timer, activities are capped at MaxProgress
 * @param {Character} C - The character for which to set the timer for
 * @param {null | Activity} Activity - The activity for which the timer is for
 * @param {AssetGroupItemName | "ActivityOnOther"} Zone - The target zone of the activity
 * @param {number} Progress - Progress to set
 * @param {Asset} [Asset] - The asset used to perform the activity
 * @return {void} - Nothing
 */
declare function ActivitySetArousalTimer(C: Character, Activity: null | Activity, Zone: AssetGroupItemName | "ActivityOnOther", Progress: number, Asset?: Asset): void;
/**
 * Draws the arousal progress bar at the given coordinates for every orgasm timer.
 * @param {number} X - Position on the X axis
 * @param {number} Y - Position on the Y axis
 * @return {void} - Nothing
 */
declare function ActivityOrgasmProgressBar(X: number, Y: number): void;
/**
 * Ends the orgasm early if progress is close or progress is sufficient
 * @return {void} - Nothing
 */
declare function ActivityOrgasmControl(): void;
/**
 * Increases the player's willpower when resisting an orgasm.
 * @param {Character} C - The character currently resisting
 * @return {void} - Nothing
 */
declare function ActivityOrgasmWillpowerProgress(C: Character): void;
/**
 * Starts an orgasm for a given character, lasts between 5 to 15 seconds and can be displayed in a chatroom.
 * @param {Character} C - Character for which an orgasm is starting
 * @returns {void} - Nothing
 */
declare function ActivityOrgasmStart(C: Character): void;
/**
 * Triggered when an orgasm needs to be stopped
 * @param {Character} C - Character for which to stop the orgasm
 * @param {number} Progress - Arousal level to set the character at once the orgasm ends
 * @returns {void} - Nothing
 */
declare function ActivityOrgasmStop(C: Character, Progress: number): void;
/**
 * Generates an orgasm button and progresses in the orgasm mini-game. Handles the resets and success/failures
 * @param {number} Progress - Progress of the currently running mini-game
 * @returns {void} - Nothing
 */
declare function ActivityOrgasmGameGenerate(Progress: number): void;
/**
 * Triggers an orgasm for the player or an NPC which lasts from 5 to 15 seconds
 * @param {Character} C - Character for which an orgasm was triggered
 * @param {boolean} [Bypass=false] - If true, this will do a ruined orgasm rather than a real one
 * @returns {void} - Nothing
 */
declare function ActivityOrgasmPrepare(C: Character, Bypass?: boolean): void;
/**
 * Sets a character's facial expressions based on their arousal level if their settings allow it.
 * @param {Character} C - Character for which to set the facial expressions
 * @param {number} Progress - Current arousal progress
 * @returns {void} - Nothing
 */
declare function ActivityExpression(C: Character, Progress: number): void;
/**
 * With time, we increase or decrease the arousal. Validates the result to keep it within 0 to 100 and triggers an orgasm when it reaches 100
 * @param {Character} C - Character for which the timer is progressing
 * @param {number} Progress - Progress made (from -100 to 100)
 * @returns {void} - Nothing
 */
declare function ActivityTimerProgress(C: Character, Progress: number): void;
/**
 * Set the current vibrator level for drawing purposes
 * @param {Character} C - Character for which the timer is progressing
 * @param {0 | 1 | 2 | 3 | 4} Level - Level from 0 to 4 (higher = more vibration)
 * @returns {void} - Nothing
 */
declare function ActivityVibratorLevel(C: Character, Level: 0 | 1 | 2 | 3 | 4): void;
/**
 * Calculates the progress one character does on another right away
 * @param {Character} Source - The character who performed the activity
 * @param {Character} Target - The character on which the activity was performed
 * @param {Activity} Activity - The activity performed
 * @param {AssetGroup} Group - The group on which the activity is performed
 * @param {Asset} [Asset] - The asset used to perform the activity
 * @returns {void} - Nothing
 */
declare function ActivityRunSelf(Source: Character, Target: Character, Activity: Activity, Group: AssetGroup, Asset?: Asset): void;
/**
 * Build the chat tag needed for lookup in ActivityDictionary.csv
 * @param {Character} character
 * @param {AssetGroup} group
 * @param {Activity} activity
 */
declare function ActivityBuildChatTag(character: Character, group: AssetGroup, activity: Activity, is_label?: boolean): string;
/**
 * Launches a sexual activity for a character and sends the chatroom message if applicable.
 * @param {Character} actor - Character which is performing the activity
 * @param {Character} acted - Character on which the activity was triggered
 * @param {AssetItemGroup} targetGroup - The group targetted by the activity
 * @param {ItemActivity} ItemActivity - The activity performed, with its optional item used
 * @param {boolean} sendMessage - Whether to send a message to the chat or not
 */
declare function ActivityRun(actor: Character, acted: Character, targetGroup: AssetItemGroup, ItemActivity: ItemActivity, sendMessage?: boolean): void;
/**
 * Checks if a used asset should trigger an activity/arousal progress on the target character
 * @param {Character} Source - The character who used the item
 * @param {Character} Target - The character on which the item was used
 * @param {Asset} Asset - Asset used
 * @return {void} - Nothing
 */
declare function ActivityArousalItem(Source: Character, Target: Character, Asset: Asset): void;
/**
 * Checks if the character is wearing an item tagged with the fetish type name and returns the love factor for it
 * @param {Character} C - The character to validate
 * @param {FetishName} Type - The fetish type name
 * @return {number} - From -2 (hate it) to 2 (adore it) based on the player preferences
 */
declare function ActivityFetishItemFactor(C: Character, Type: FetishName): number;
/**
 * Loops in all fetishes for a character and calculates the total fetish factor
 * @param {Character} C - The character to validate
 * @return {number} - The negative/positive number will have negative/positive impact on arousal
 */
declare function ActivityFetishFactor(C: Character): number;
/** @type {null | string[][]} */
declare var ActivityDictionary: null | string[][];
declare var ActivityOrgasmGameButtonX: number;
declare var ActivityOrgasmGameButtonY: number;
declare var ActivityOrgasmGameProgress: number;
declare var ActivityOrgasmGameDifficulty: number;
declare var ActivityOrgasmGameResistCount: number;
declare var ActivityOrgasmGameTimer: number;
declare var ActivityOrgasmResistLabel: string;
declare var ActivityOrgasmRuined: boolean;
