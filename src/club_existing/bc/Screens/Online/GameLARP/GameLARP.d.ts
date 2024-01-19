/**
 * Gets the current state of LARP.
 * @returns {OnlineGameStatus}
 */
declare function GameLARPGetStatus(): OnlineGameStatus;
/**
 * Set the current state of LARP.
 * @param {OnlineGameStatus} s
 * @returns {void}
 */
declare function GameLARPSetStatus(s: OnlineGameStatus): void;
/**
 * Checks if the character is an admin or the LARP admin while the game is going.
 * @param {Character} C - Character to check for
 * @returns {boolean} -  Returns TRUE if that character is an admin/the game administrator
 */
declare function GameLARPIsAdmin(C: Character): boolean;
/**
 * Draws the LARP class/team icon of a character
 * @param {Character} C - Character for which to draw the icons
 * @param {number} X - Position on the X axis of the canvas
 * @param {number} Y - Position on the Y axis of the canvas
 * @param {number} Zoom - Zoom factor of the character
 * @returns {void} - Nothing
 */
declare function GameLARPDrawIcon(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Loads the LARP game.
 * @returns {void} - Nothing
 */
declare function GameLARPLoad(): void;
/**
 * Runs and draws the LARP game.
 * @returns {void} - Nothing
 */
declare function GameLARPRun(): void;
/**
 * Runs the game from the chat room
 * @returns {void} - Nothing
 */
declare function GameLARPRunProcess(): void;
/**
 * Builds the inventory selection list for a given asset group.
 * @param {AssetGroupName} FocusGroup - Asset group for which to build the inventory.
 * @returns {void} - Nothing
 */
declare function GameLARPBuildInventory(FocusGroup: AssetGroupName): void;
/**
 * Triggered when an option is selected for the current target character. The inventory for it is built and the action is published
 * @param {GameLARPOptionName} Name - Name of the selected option
 * @returns {void} - Nothing
 */
declare function GameLARPClickOption(Name: GameLARPOptionName): void;
/**
 * Handles clicks during the LARP game.
 * @returns {boolean} - Returns TRUE if the click was handled by this LARP click handler
 */
declare function GameLARPClickProcess(): boolean;
/**
 * Starts a LARP match.
 * @returns {void} - Nothing
 */
declare function GameLARPStartProcess(): void;
/**
 * Handles clicks in the LARP chat Admin screen
 * @returns {void} - Nothing
 */
declare function GameLARPClick(): void;
/**
 * Triggered when the player exits the LARP info screen.
 * @returns {void} - Nothing
 */
declare function GameLARPExit(): void;
/**
 * Checks if a LARP match can be launched. The player must be an admin and two different teams must be selected.
 * @returns {boolean} - Returns TRUE if the game can be launched
 */
declare function GameLARPCanLaunchGame(): boolean;
/**
 * Gets a specific bonus from a given character's class.
 * @param {Character} Target - Character to check for a specific bonus value.
 * @param {number} BonusType - The bonus type to get the value of.
 * @returns {number} - Total bonuses for the given character.
 */
declare function GameLARPGetBonus(Target: Character, BonusType: number): number;
/**
 * Gets the odds of successfully doing an offensive action on a given character.
 * @param {string} Action - Action attempted.
 * @param {Character} Source - Character doing the move.
 * @param {Character} Target - Character targetted by the move.
 * @returns {number} - Odds of successfully doing an offensive action. The number has two decimals.
 */
declare function GameLARPGetOdds(Action: string, Source: Character, Target: Character): number;
/**
 * In LARP, check if the given character can talk.
 * @param {Character} C - Character to check.
 * @returns {boolean} - Whether the character can talk or not
 */
declare function GameLARPCanTalk(C: Character): boolean;
/**
 * In LARP, check if the given character can walk.
 * @param {Character} C - Character to check.
 * @returns {boolean} - Whether the character can walk or not
 */
declare function GameLARPCanWalk(C: Character): boolean;
/**
 * In LARP, check if the given character can act.
 * @param {Character} C - Character to check.
 * @returns {boolean} - Whether the character can act or not
 */
declare function GameLARPCanAct(C: Character): boolean;
/**
 * In LARP, check if the given character is wearing clothes.
 * @param {Character} C - Character to check.
 * @returns {boolean} - Whether the character is wearing clothes or not
 */
declare function GameLARPClothed(C: Character): boolean;
/**
 * Checks if an item can be removed in LARP.
 * @param {Character} C - Character to check for a lock on the given group.
 * @param {AssetGroupItemName} Zone - Group to check for a lock.
 * @returns {boolean} - Returns TRUE if we can remove an item at a specific zone (cannot remove if there's a custom lock)
 */
declare function GameLARPCanRemoveItem(C: Character, Zone: AssetGroupItemName): boolean;
/**
 * Adds all available class abilities to the built basic options
 * @param {Character} Source - Character about to do an action.
 * @param {Character} Target - The character on which an action is about to be done.
 * @param {Array.<{ Name: string, Odds: number}>} Option - List of the basic options the source character can perform
 * @param {string} Ability - Character's ability.
 * @returns {void} - Nothing
 */
declare function GameLARPBuildOptionAbility(Source: Character, Target: Character, Option: Array<{
    Name: string;
    Odds: number;
}>, Ability: string): void;
/**
 * Builds the available options a character can perform on another for the LARP menu.
 * @param {Character} Source - Character about to do an action.
 * @param {Character} Target - The character on which an action is about to be done.
 * @returns {GameLARPOption[]} - Options the character can perform
 */
declare function GameLARPBuildOption(Source: Character, Target: Character): GameLARPOption[];
/**
 * Gets a character from the LARP game by member number
 * @param {number} MemberNumber - Member number of the character to get.
 * @returns {Character | null} - The corresponding character, if it exists.
 */
declare function GameLARPGetPlayer(MemberNumber: number): Character | null;
/**
 * Processes an action for a player.
 * @param {string} Action - Action attempted.
 * @param {string} ItemName - Name of the item to attempt to use.
 * @param {Character} Source - Source character of the action
 * @param {Character} Target - Character targetted by the action
 * @param {number} RNG - Random odds received for which the character's odds will be compared.
 * @returns {void} - Nothing
 */
declare function GameLARPProcessAction(Action: string, ItemName: string, Source: Character, Target: Character, RNG: number): void;
/**
 * Processes the LARP game clicks. This method is called from the generic OnlineGameClickCharacter function when the current game is LARP.
 * @param {Character} C - Character clicked on
 * @returns {boolean} - returns TRUE if the code handles the click
 */
declare function GameLARPCharacterClick(C: Character): boolean;
/**
 * Adds a LARP message to the chat log.
 * @param {string} Msg - Message tag
 * @param {Character} Source - Source character of the message
 * @param {Character} Target - Character targetted by the message
 * @param {string} Description - Description of the message (item name, team name, etc.)
 * @param {number} RNG - The number given by RNG.
 * @param {number} Odds - The number required for the move to work.
 * @param {string} [Color] - Color of the message to add.
 * @returns {void} - Nothing
 */
declare function GameLARPAddChatLog(Msg: string, Source: Character, Target: Character, Description: string, RNG: number, Odds: number, Color?: string): void;
/**
 * Sets the new turn player and publish it in the chat room
 * @param {number} NewPlayerPosition - Position of the new player
 * @param {boolean} Ascending - Whether or not the turn is ascending
 * @param {string} Msg - Message tag to display such as TurnStart, TurnSkip and TurnNext
 * @returns {void} - Nothing
 */
declare function GameLARPNewTurnPublish(NewPlayerPosition: number, Ascending: boolean, Msg: string): void;
/**
 * Generates a new turn for the LARP game.
 * @param {string} Msg - Content of the turn message such as TurnNext, TurnStart or TurnSkip
 * @returns {void} - Nothing
 */
declare function GameLARPNewTurn(Msg: string): void;
/**
 * Builds the full LARP player list. Someone with no team is not playing the match.
 * @returns {void} - Nothing
 */
declare function GameLARPBuildPlayerList(): void;
/**
 * Each time a game is over, in victory or defeat, the player progresses toward the next class level
 * @param {number} NewProgress - The progress factor to apply
 * @returns {void} - Nothing
 */
declare function GameLARPLevelProgress(NewProgress: number): void;
/**
 * Returns the class level for a LARP player, based on their LARP object
 * @param {GameLARPParameters} LARP - The LARP object, coming from the Character.Game object
 * @returns {number} - The level between 0 and 10
 */
declare function GameLARPGetClassLevel(LARP: GameLARPParameters): number;
/**
 * Returns the class level progress for a LARP player, based on their LARP object
 * @param {GameLARPParameters} LARP - The LARP object, coming from the Character.Game object
 * @returns {number} - The level progress between 0 and 1000
 */
declare function GameLARPGetClassProgress(LARP: GameLARPParameters): number;
/**
 * Moves forward in the LARP game. If there are less than 2 teams with free arms, the game is over.
 * @returns {boolean} - Returns TRUE if the game ends and runs the end scripts.
 */
declare function GameLARPContinue(): boolean;
/**
 * Processes the LARP game messages for turns and actions.
 * @param {ServerChatRoomGameResponse} P - Data object containing the message data.
 * @returns {void} - Nothing
 */
declare function GameLARPProcess(P: ServerChatRoomGameResponse): void;
/**
 * Resets the LARP game so a new game might be started
 * @returns {void} - Nothing
 */
declare function GameLARPReset(): void;
/**
 * Ensure all character's MagicBattle game status are the same
 */
declare function GameLARPLoadStatus(): void;
/**
 * Draws the online game images/text needed on the characters
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
declare function GameLARPDrawCharacter(C: Character, X: number, Y: number, Zoom: number): void;
declare var GameLARPBackground: string;
declare var GameLARPClass: {
    Name: string;
    Bonus: number[];
    Ability: string[];
}[];
declare var GameLARPTeamList: string[];
declare var GameLARPTimerDelay: number[];
declare var GameLARPEntryClass: string;
declare var GameLARPEntryTeam: string;
/** @type { { Sender: number, Time: number, RNG: number, Data: ServerChatRoomGameResponse["Data"], Success?: boolean }[] } */
declare var GameLARPProgress: {
    Sender: number;
    Time: number;
    RNG: number;
    Data: ServerChatRoomGameResponse["Data"];
    Success?: boolean;
}[];
/** @type {Character[]} */
declare var GameLARPPlayer: Character[];
/** @type {GameLARPOption[]} */
declare var GameLARPOption: GameLARPOption[];
/** @type {GameLARPOptionName | ""} */
declare var GameLARPAction: GameLARPOptionName | "";
/** @type {Asset[]} */
declare var GameLARPInventory: Asset[];
declare var GameLARPInventoryOffset: number;
declare var GameLARPTurnAdmin: number;
declare var GameLARPTurnPosition: number;
declare var GameLARPTurnAscending: boolean;
/** @type {null | number} */
declare var GameLARPTurnTimer: null | number;
declare var GameLARPTurnTimerDelay: number;
/** @type {null | Character} */
declare var GameLARPTurnFocusCharacter: null | Character;
/** @type {null | AssetGroupName} */
declare var GameLARPTurnFocusGroup: null | AssetGroupName;
