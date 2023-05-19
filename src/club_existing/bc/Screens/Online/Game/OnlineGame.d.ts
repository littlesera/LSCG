/**
 * Loads the online game dictionary that will be used throughout the game to output messages
 * @returns {void} - Nothing
 */
declare function OnlneGameDictionaryLoad(): void;
/**
 * @param {string} CachePath
 * @returns {void}
 */
declare function OnlineGameTranslate(CachePath: string): void;
/**
 * Searches in the dictionary for a specific keyword and returns the message linked to it
 * @param {string} KeyWord - Keyword of the text to look for
 * @returns {string} The text attached to the keyword, will return a missing text if it was not found
 */
declare function OnlineGameDictionaryText(KeyWord: string): string;
/**
 * Catches the character click from chat rooms and make sure the online game doesn't need to handle them
 * @param {Character} C - Character that has been clicked on
 * @return {boolean} Returns the return content of click function of the currently selected game, or false if there is no corresponding game
 */
declare function OnlineGameClickCharacter(C: Character): boolean;
/**
 * Catches the chat room clicks and make sure the online game doesn't need to handle them
 * @return {boolean} Returns the return content of click function of the currently selected game, or false if there is no corresponding game
 */
declare function OnlineGameClick(): boolean;
/**
 * Run the corresponding online game scripts
 * @returns {void} - Nothing
 */
declare function OnlineGameRun(): void;
/**
 * Checks if clothes can be changed in an online game space
 * @returns {boolean} - Returns TRUE if there's no online game that currently blocks changing
 */
declare function OnlineGameAllowChange(): boolean;
/**
 * Checks if blocking items is currently allowed
 * @returns {boolean} - Returns TRUE if the online game allows you to block items
 */
declare function OnlineGameAllowBlockItems(): boolean;
/**
 * Retrieves the current status of online games and stores it
 * @returns {void} - Nothing
 */
declare function OnlineGameLoadStatus(): void;
/**
 * Resets the game status if needed when the chat room data is updated
 * @returns {void} - Nothing
 */
declare function OnlineGameReset(): void;
/**
 * Returns TRUE if the MemberPlayer supplied is still in the current chat room
 * @param {number} MemberNumber - The number to validate
 * @returns {boolean} - Returns TRUE if that number is still in the room
 */
declare function OnlineGameCharacterInChatRoom(MemberNumber: number): boolean;
/**
 * Draws the online game images/text needed on the characters
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
declare function OnlineGameDrawCharacter(C: Character, X: number, Y: number, Zoom: number): void;
/** @type {null | string[][]} */
declare let OnlineGameDictionary: null | string[][];
