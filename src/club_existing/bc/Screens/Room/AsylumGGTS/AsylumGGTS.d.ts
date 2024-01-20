/**
 * Returns TRUE if the player has three strikes on record
 * @returns {boolean} - TRUE if three strikes or more
 */
declare function AsylumGGTSHasThreeStrikes(): boolean;
/**
 * Returns TRUE if the player can quit GGTS
 * @returns {boolean} - TRUE if three strikes or more or in active punishment
 */
declare function AsylumGGTSCanQuit(): boolean;
/**
 * Check that GGTS is enabled in the current room.
 * @returns true if GGTS is running, false otherwise.
 */
declare function AsylumGGTSIsEnabled(): boolean;
/**
 * Returns TRUE if the player has completed the required time for the current level
 * @returns {boolean} - TRUE if level is completed with 3 strikes on record
 */
declare function AsylumGGTSLevelCompleted(): boolean;
/**
 * Returns the character GGTS level
 * @param {Character} C - The character to evaluate
 * @returns {number} - Nothing
 */
declare function AsylumGGTSGetLevel(C: Character): number;
/**
 * Returns the character's current level timer
 * @param {Character} C
 */
declare function AsylumGGTSGetLevelTime(C: Character): number;
/**
 * Returns the character's current strike count
 * @param {Character} C
 */
declare function AsylumGGTSGetStrikes(C: Character): number;
/**
 * Returns the character's currently set GGTS rules
 * @param {Character} C
 */
declare function AsylumGGTSGetRules(C: Character): string[];
/**
 * Sets the computer image based on the player level
 * @param {number} Level - The player GGTS level
 * @returns {void} - Nothing
 */
declare function AsylumGGTSComputerImage(Level: number): void;
/**
 * Loads the GGTS and computer NPC
 * @returns {void} - Nothing
 */
declare function AsylumGGTSLoad(): void;
/**
 * Runs the room
 * @returns {void} - Nothing
 */
declare function AsylumGGTSRun(): void;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function AsylumGGTSClick(): void;
/**
 * Adds the GGTS items based on the player level
 * @returns {void} - Nothing
 */
declare function AsylumGGTSSAddItems(): void;
/**
 * Starts a new GGTS level for the player
 * @param {number} Level - The new level to set
 * @returns {void} - Nothing
 */
declare function AsylumGGTSStartLevel(Level: number): void;
/**
 * Quits GGTS and deletes the player data for the game
 * @returns {void} - Nothing
 */
declare function AsylumGGTSQuit(): void;
/**
 * Builds a private room online chat room for single player GGTS experience
 * @returns {void} - Nothing
 */
declare function AsylumGGTSBuildPrivate(): void;
/**
 * Gets the new character name based on it's GGTS level
 * @param {Character} C - The character to rename
 * @returns {string} - The new name for that character
 */
declare function AsylumGGTSCharacterName(C: Character, Name: any): string;
/**
 * Sends a chat message from the GGTS.  GGTS slowly replaces the player name by the player number as level rises.
 * @param {string} Msg - The message to publish
 * @param {Character} [Target] - The member number of the target character
 * @returns {void} - Nothing
 */
declare function AsylumGGTSMessage(Msg: string, Target?: Character): void;
/**
 * Generates a new GGTS Task for the player and publishes it
 * @returns {void} - Nothing
 */
declare function AsylumGGTSSetTimer(): void;
/**
 * Returns TRUE if the query was answered by character number M
 * @param {number} Level - The player GGTS level, at level 4 or more, capital letters and punctuation matters
 * @param {number} M - The member number to evaluate
 * @param {string} TextEasy - The text to evaluate
 * @param {string} TextHard - The text to evaluate
 * @returns {boolean} - TRUE if the is done
 */
declare function AsylumGGTSQueryDone(Level: number, M: number, TextEasy: string, TextHard: string): boolean;
/**
 * Returns TRUE if the task T is currently done by character C
 * @param {Character} C - The character to evaluate
 * @param {string} T - The task to evaluate
 * @returns {boolean} - TRUE if the is done
 */
declare function AsylumGGTSTaskDone(C: Character, T: string): boolean;
/**
 * Returns TRUE if GGTS can remove an item for a body group
 * @param {Character} C - The character to evaluate
 * @param {AssetGroupName} Group - The body group on which to remove the item
 * @returns {boolean} - TRUE if removing the item is possible
 */
declare function AsylumGGTSCanRemove(C: Character, Group: AssetGroupName): boolean;
/**
 * Returns TRUE if the task T can be done in character C predicament
 * @param {Character} C - The character to evaluate
 * @param {string} T - The task to evaluate
 * @returns {boolean} - TRUE if the task can be done
 */
declare function AsylumGGTSTaskCanBeDone(C: Character, T: string): boolean;
/**
 * Returns TRUE if the task T was failed by character C
 * @param {Character} C - The character to evaluate
 * @param {string} T - The task to evaluate
 * @returns {boolean} - TRUE if the task was failed
 */
declare function AsylumGGTSTaskFail(C: Character, T: string): boolean;
/**
 * Checks if there's a futuristic item in the group slot and remove it if it's the case
 * @param {AssetGroupName} Group - The group name to validate
 * @returns {void} - Nothing
 */
declare function AsylumGGTSTaskRemoveFuturisticItem(Group: AssetGroupName): void;
/**
 * Transforms a ballgag to a panelgag for the specified group
 * @param {AssetGroupName} Group - The group name to transform
 * @returns {void} - Nothing
 */
declare function AsylumGGTSTransformGag(Group: AssetGroupName): void;
/**
 * Changes the inflation setting on the ballgag or panelgag
 * @param {AssetGroupName} Group - The group name to transform
 * @returns {void} - Nothing
 */
declare function AsylumGGTSConfigureGag(Group: AssetGroupName): void;
/**
 * Processes the tasks that doesn't need any player input. GGTS does everything and ends the task automatically.
 * @returns {void} - Nothing
 */
declare function AsylumGGTSAutomaticTask(): void;
/**
 * In a public room, some GGTS tasks can target another valid player.  Patients will do physical activities, nurses will restraint.
 * @param {string} T - The task to evaluate
 * @returns {Character} - The target character
 */
declare function AsylumGGTSFindTaskTarget(T: string): Character;
/**
 * Generates a new GGTS Task for the player and publishes it
 * @returns {void} - Nothing
 */
declare function AsylumGGTSNewTask(): void;
/**
 * Saves the game progress after a task ended
 * @param {boolean} [Fail=false] - If the task was failed, we don't add bonus time
 * @returns {void} - Nothing
 */
declare function AsylumGGTSEndTaskSave(Fail?: boolean): void;
/**
 * Adds a new rule for the player to follow or get strikes, syncs with the chatroom
 * @param {string} NewRule - The rule name to add
 * @param {boolean} Publish - TRUE if we must publish to local chat
 * @returns {void} - Nothing
 */
declare function AsylumGGTSAddRule(NewRule: string, Publish: boolean): void;
/**
 * Removes a rule for the player to follow, syncs with the chatroom
 * @param {string} Rule - The rule name to remove
 * @returns {void} - Nothing
 */
declare function AsylumGGTSRemoveRule(Rule: string): void;
/**
 * Checks if the current GGTS Task is complete
 * @returns {void} - Nothing
 */
declare function AsylumGGTSEndTask(): void;
/**
 * Checks for forbidden words spoken by a character
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if a forbidden word was said
 */
declare function AsylumGGTSForbiddenWord(C: Character): boolean;
/**
 * Processes the GGTS AI in the chatroom
 * @returns {void} - Nothing
 */
declare function AsylumGGTSProcess(): void;
/**
 * Processes the sexual activity in GGTS
 * @param {Character} S - The character performing the activity
 * @param {Character} C - The character on which the activity is performed
 * @param {string} A - The name of the activity performed
 * @param {string} Z - The group/zone name where the activity was performed
 * @param {number} [Count=1] - If the activity is done repeatedly, this defines the number of times, the activity is done.
 * @return {void} - Nothing
 */
declare function AsylumGGTSActivity(S: Character, C: Character, A: string, Z: string, Count?: number): void;
/**
 * Sets the punishment time for failing GGTS
 * @param {number} Minute - The number of minutes for the punishment
 * @returns {void} - Nothing
 */
declare function AsylumGGTSPunishmentTime(Minute: number): void;
/**
 * Starts the isolation punishment and go to the player room
 * @returns {void} - Nothing
 */
declare function AsylumGGTSStartPunishment(): void;
/**
 * Returns TRUE if the item is controlled by GGTS, so the player should not have control.  The rules changes on level 3 and GGTS takes control throughout the asylum.
 * @returns {boolean} - TRUE if the item is controlled by GGTS
 */
declare function AsylumGGTSControlItem(C: any, Item: any): boolean;
/**
 * Checks if the has enough GGTS minutes to spend on different activities, for GGTS level 6 and up
 * @param {number} Minute - The number of minutes to compare
 * @returns {boolean} - TRUE if the player has enough minutes
 */
declare function AsylumGGTSHasMinutes(Minute: number): boolean;
/**
 * At level 6, the player can spend GGTS minutes for various reasons
 * @returns {void} - Nothing
 */
declare function AsylumGGTSSpendMinute(Minute: any): void;
/**
 * Adds a strike to the player game info.  At strike 3, we auto-unlock the door to allow players to leave.
 * @returns {void} - Nothing
 */
declare function AsylumGGTSAddStrike(): void;
/**
 * Allows the player to start the punishment phase with a futuristic gag on
 * @returns {boolean} - Returns TRUE if the player is due for a punishment with a future gag
 */
declare function AsylumGGTSFuturisticGaggedPunished(): boolean;
/**
 * Ungags the player
 * @returns {void} - Nothing
 */
declare function AsylumGGTSUngag(): void;
/**
 * When an orgasm starts, we check if it breaks any GGTS rule
 * @param {Character} C - The character getting the orgasm
 * @return {void} - Nothing
 */
declare function AsylumGGTSTOrgasm(C: Character): void;
/**
 * When the player resists an orgasm, there's a 50% chance the no-orgasm rule will be dropped
 * @return {void} - TRUE if the character can change
 */
declare function AsylumGGTSOrgasmResist(): void;
/**
 * When the player is sent to do GGTS by her owner
 * @param {number} LockTime - The number of minutes to do
 * @param {string} Msg - The nurse intro message
 * @return {void} - Nothing
 */
declare function AsylumGGTSLock(LockTime: number, Msg: string): void;
/**
 * Fully dress the character in a drone futuristic gear setup
 * @param {Character} C - The character to dress, if omitted, we use the player
 * @return {void} - Nothing
 */
declare function AsylumGGTSDroneDress(C: Character): void;
/**
 * GGTS will not allow the character to change if she's being punished or she reached level 6
 * @param {Character} C - The character to evaluate
 * @return {boolean} - TRUE if the character can change
 */
declare function AsylumGGTSAllowChange(C: Character): boolean;
/**
 * Called from Dialog.js, triggers a specific action from GGTS game
 * @param {String} Action - The action to perform
 * @param {Number} Minute - The number of minutes to remove
 * @returns {void} - Nothing
 */
declare function AsylumGGTSDialogAction(Action: string, Minute: number): void;
/**
 * Called from Dialog.js, as nurse, trigger a specific interaction for the current character
 * @param {String} Interaction - The interaction to perform
 * @returns {void} - Nothing
 */
declare function AsylumGGTSDialogInteraction(Interaction: string): void;
/**
 * Called from chat room, processes hidden GGTS messages
 * @param {Character} SenderCharacter - The character sending the message
 * @param {String} Interaction - The message sent
 * @param {ServerChatRoomMessage} data - The full message recieved
 * @returns {Object} - Nothing to be used
 */
declare function AsylumGGTSHiddenMessage(SenderCharacter: Character, Interaction: string, data: ServerChatRoomMessage): any;
/**
 * GGTS Draws the level, the number of strikes and a progress bar, level 6 shows the time in a gold frame
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
declare function AsylumGGTSDrawCharacter(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Resets the state of the GGTS game
 * @returns {void} - Nothing
 */
declare function AsylumGGTSReset(): void;
declare var AsylumGGTSBackground: string;
/** @type {null | NPCCharacter} */
declare var AsylumGGTSComputer: null | NPCCharacter;
declare var AsylumGGTSIntroDone: boolean;
declare var AsylumGGTSTimer: number;
/** @type {null | string} */
declare var AsylumGGTSTask: null | string;
/** @type {null | Character} */
declare var AsylumGGTSTaskTarget: null | Character;
declare var AsylumGGTSLastTask: string;
declare var AsylumGGTSTaskStart: number;
declare var AsylumGGTSTaskEnd: number;
/**
 * The list of available tasks, partitioned by level.
 */
declare var AsylumGGTSTaskList: string[][];
declare var AsylumGGTSLevelTime: number[];
/**
 * The last pose the character had. Used to enforce KeepPose rules.
 * @type {null | Partial<Record<AssetPoseCategory, AssetPoseName>>}
 */
declare var AsylumGGTSPreviousPose: null | Partial<Record<AssetPoseCategory, AssetPoseName>>;
declare var AsylumGGTSWordCheck: number;
declare var AsylumGGTSSpeed: number;
