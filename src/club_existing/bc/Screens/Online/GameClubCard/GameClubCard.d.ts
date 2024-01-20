/**
 * Gets the current state of online Club Card.
 * @returns {OnlineGameStatus}
 */
declare function GameClubCardGetStatus(): OnlineGameStatus;
/**
 * Set the current state of online Club Card.
 * @param {OnlineGameStatus} s
 * @returns {void}
 */
declare function GameClubCardSetStatus(s: OnlineGameStatus): void;
/**
 * Checks if the character is an admin for the room/game.
 * @param {Character} C - Character to check for
 * @returns {boolean} -  Returns TRUE if that character is an admin/the game administrator
 */
declare function GameClubCardIsAdmin(C: Character): boolean;
/**
 * Draws the Club Card icon of a character
 * @param {Character} C - Character for which to draw the icons
 * @param {number} X - Position on the X axis of the canvas
 * @param {number} Y - Position on the Y axis of the canvas
 * @param {number} Zoom - Zoom factor of the character
 * @returns {void} - Nothing
 */
declare function GameClubCardDrawIcon(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Draws the online game images/text needed on the characters
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
declare function GameClubCardDrawCharacter(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Loads the online Club Card configuration screen.
 * @returns {void} - Nothing
 */
declare function GameClubCardLoad(): void;
/**
 * Runs the online Club Card configuration screen
 * @returns {void} - Nothing
 */
declare function GameClubCardRun(): void;
/**
 * Handles clicks in the online Club Card configuration screen
 * @returns {void} - Nothing
 */
declare function GameClubCardClick(): void;
/**
 * Triggered when the player exits the Club Card config screen.
 * @returns {void} - Nothing
 */
declare function GameClubCardExit(): void;
/**
 * Checks there's 1 player in slot 1 and slot 2 so we can start the game.
 * @returns {boolean} - Returns TRUE if the game can be launched
 */
declare function GameClubCardCanLaunchGame(): boolean;
/**
 * Returns TRUE if the game is running and can be joined
 * @returns {boolean} - TRUE if the player can join
 */
declare function GameClubCardCanJoinGame(): boolean;
/**
 * Resets the online Club Card game so a new game might be started
 * @returns {void} - Nothing
 */
declare function GameClubCardReset(): void;
/**
 * Ensure all character's Club Card game status are the same
 * @returns {void} - Nothing
 */
declare function GameClubCardLoadStatus(): void;
/**
 * Creates a bundle of cards in a string to push to the server.
 * @param {ClubCard[]} Cards - An array of c
 * @param {boolean} IncludeTime - If we must include the time property
 * @returns {string} - A string with all the cards
 */
declare function GameClubCardDoBundle(Cards: ClubCard[], IncludeTime?: boolean): string;
/**
 * Processes the club card game data received from the server
 * @param {string} Bundle - An array of c
 * @param {boolean} IncludeTime - If we must include the time property
 * @param {string} Location - The location of the card
 * @returns {ClubCard[]} - A string with all the cards
 */
declare function GameClubCardUndoBundle(Bundle: string, IncludeTime?: boolean, Location?: string): ClubCard[];
/**
 * Loads the full server bundle for a player
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {any} Bundle - An array of c
 * @returns {void} - Nothing
 */
declare function GameClubCardLoadBundle(CCPlayer: ClubCardPlayer, Bundle: any): void;
/**
 * Assigns both club card players based on the players selection
 * @param {ServerChatRoomGameResponse} Packet - The data packet to process
 * @param {Character} Char - The character that's sending the packet
 * @returns {void} - Nothing
 */
declare function GameClubCardAssignPlayers(Packet: ServerChatRoomGameResponse, Char: Character): void;
/**
 * Loads the club card game data
 * @param {ServerChatRoomGameResponse} Packet - The data packet to process
 * @returns {void} - Nothing
 */
declare function GameClubCardLoadData(Packet: ServerChatRoomGameResponse): void;
/**
 * Processes the club card game data received from the server
 * @param {ServerChatRoomGameResponse} Packet - The data packet to process
 * @returns {void} - Nothing
 */
declare function GameClubCardProcess(Packet: ServerChatRoomGameResponse): void;
/**
 * Syncs the online data with all players
 * @param {string} Progress - The progress status to push (default to action)
 * @returns {void} - Nothing
 */
declare function GameClubCardSyncOnlineData(Progress?: string): void;
/**
 * When the game ends, we go back to the online chat room
 * @returns {void} - Nothing
 */
declare function GameClubCardEnd(): void;
declare var GameClubCardBackground: string;
declare var GameClubCardEntryPlayerSlot: number;
declare var GameClubCardExpectQuery: boolean;
declare var GameClubCardQueryAdmin: boolean;
