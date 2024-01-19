/**
 * Gets the current state of LARP.
 * @returns {OnlineGameStatus}
 */
declare function GameMagicBattleGetStatus(): OnlineGameStatus;
/**
 * Set the current state of LARP.
 * @param {OnlineGameStatus} s
 * @returns {void}
 */
declare function GameMagicBattleSetStatus(s: OnlineGameStatus): void;
/**
 * Checks if the character is an admin while the game is going.
 * @param {Character} C - Character to check for
 * @returns {boolean} -  Returns TRUE if that character is an admin/the game administrator
 */
declare function GameMagicBattleIsAdmin(C: Character): boolean;
/**
 * Draws the Magic Battle house icon of a character
 * @param {Character} C - Character for which to draw the icons
 * @param {number} X - Position on the X axis of the canvas
 * @param {number} Y - Position on the Y axis of the canvas
 * @param {number} Zoom - Zoom factor of the character
 * @returns {void} - Nothing
 */
declare function GameMagicBattleDrawIcon(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Loads the Magic Battle game.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleLoad(): void;
/**
 * Returns the team setup for the online magic battle.
 * @returns {"FreeForAll" | "House"} - "FreeForAll" or "House", depending on the team setup
 */
declare function GameMagicBattleGetTeamType(): "FreeForAll" | "House";
/**
 * Runs and draws the Magic Battle game.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleRun(): void;
/**
 * Runs the game from the chat room
 * @returns {void} - Nothing
 */
declare function GameMagicBattleRunProcess(): void;
/**
 * Handles clicks during the online game.
 * @returns {boolean} - Returns TRUE if the click was handled by this online click handler
 */
declare function GameMagicBattleClickProcess(): boolean;
/**
 * When the magic puzzle ends, we go back to the chat room
 * @returns {void}
 */
declare function GameMagicBattlePuzzleEnd(): void;
/**
 * Starts a Magic Battle match.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleStartProcess(): void;
/**
 * Handles clicks in the Magic Battle chat Admin screen
 * @returns {void} - Nothing
 */
declare function GameMagicBattleClick(): void;
/**
 * Triggered when the player exits the Magic Battle info screen.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleExit(): void;
/**
 * Checks if a Magic Battle match can be launched. The player must be an admin and two different houses must be selected.
 * @returns {boolean} - Returns TRUE if the game can be launched
 */
declare function GameMagicBattleCanLaunchGame(): boolean;
/**
 * Generates a new turn for the battle.
 * @param {string} Msg - Content of the turn message such as TurnNext or TurnStart
 * @returns {void} - Nothing
 */
declare function GameMagicBattleNewTurn(Msg: string): void;
/**
 * Gets a character from the Magic Battle game by member number
 * @param {number} MemberNumber - Member number of the character to get.
 * @returns {Character | null} - The corresponding character, if it exists.
 */
declare function GameMagicBattleGetPlayer(MemberNumber: number): Character | null;
/**
 * Processes the Magic Battle game clicks. This method is called from the generic OnlineGameClickCharacter function when the current game is Magic Battle.
 * @param {Character} C - Character clicked on
 * @returns {boolean} - returns TRUE if the code handles the click
 */
declare function GameMagicBattleCharacterClick(C: Character): boolean;
/**
 * Adds a game message to the chat log.
 * @param {string} Msg - Message tag
 * @param {Character} Source - Source character of the message
 * @param {Character} Target - Character targetted by the message
 * @param {ServerChatRoomGameResponse["Data"]} Data - The data linked to the packet
 * @param {string} [Color] - Color of the message to add.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleAddChatLog(Msg: string, Source: Character, Target: Character, Data: ServerChatRoomGameResponse["Data"], Color?: string): void;
/**
 * Builds the game player list.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleBuildPlayerList(): void;
/**
 * Calculates the turn winner and applies the consequences.
 * @returns {OnlineGameStatus}
 */
declare function GameMagicBattleCalculateTurnWinner(): OnlineGameStatus;
/**
 * Processes the Magic Battle game messages for turns and actions.
 * @param {ServerChatRoomGameResponse} P - Data object containing the message data.
 * @returns {void} - Nothing
 */
declare function GameMagicBattleProcess(P: ServerChatRoomGameResponse): void;
/**
 * Resets the Magic Battle game so a new game might be started
 * @returns {void} - Nothing
 */
declare function GameMagicBattleReset(): void;
/**
 * Ensure all character's MagicBattle game status are the same
 */
declare function GameMagicBattleLoadStatus(): void;
/**
 * Draws the online game images/text needed on the characters
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
declare function GameMagicBattleDrawCharacter(C: Character, X: number, Y: number, Zoom: number): void;
declare var GameMagicBattleBackground: string;
declare var GameMagicBattleTimerDelay: number;
/** @type {Character[]} */
declare var GameMagicBattlePlayer: Character[];
declare var GameMagicBattleAction: string;
/** @type {null | number} */
declare var GameMagicBattleTurnAdmin: null | number;
declare var GameMagicBattleTurnDone: boolean;
/** @type {null | number} */
declare var GameMagicBattleTurnTimer: null | number;
/** @type {null | Character} */
declare var GameMagicBattleFocusCharacter: null | Character;
/** @type {Pick<ServerChatRoomGameResponse, "Sender" | "Data">[]} */
declare var GameMagicBattleLog: Pick<ServerChatRoomGameResponse, "Sender" | "Data">[];
/** @type {{ X: number, Y: number, W: number, H: number}[]} */
declare var GameMagicBattleButton: {
    X: number;
    Y: number;
    W: number;
    H: number;
}[];
