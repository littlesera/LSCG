/**
 * Generates the kidnap stats for the given character, factoring in any bonus it might have.
 * @param {Character} C - The character for which to generate the stats for.
 * @param {number} Bonus - The possible stat bonus a character has
 * @returns {void} - Nothing
 */
declare function KidnapLoadStats(C: Character, Bonus: number): void;
/**
 * Builds a deck of kidnap cards for the character, the deck contains 7 random cards and must contain at least 1 card of each type
 * @param {Character} C - The character for which to generate the cards
 * @returns {void} - Nothing
 */
declare function KidnapBuildCards(C: Character): void;
/**
 * Builds the inventory items that are available when kidnapping
 * @returns {void} - Nothing
 */
declare function KidnapInventoryBuild(): void;
/**
 * Sets the current battle status and its related timer
 * @param {string} NewMode - New mode for the battle
 * @returns {void} - Nothing
 */
declare function KidnapSetMode(NewMode: string): void;
/**
 * Generates a move value for the NPC based on the best possible options
 * @returns {number} - Returns the move type
 */
declare function KidnapAIMove(): number;
/**
 * Validates or checks if a given upper hand move type is available.
 * @param {number} MoveType - The type of move to check for or perform
 * @param {boolean} DoMove - Whether or not the move is being performed
 * @returns {boolean} - Returns TRUE if the upper hand move type is available
 */
declare function KidnapUpperHandMoveAvailable(MoveType: number, DoMove: boolean): boolean;
/**
 * Sets a random upper hand move for the NPC to use
 * @returns {void} - Nothing
 */
declare function KidnapAIMoveUpperHand(): void;
/**
 * Draws the move text (left side) and the effect (right side)
 * @returns {void} - Nothing
 */
declare function KidnapShowMove(): void;
/**
 * Checks if a given move is effective against a given character
 * @param {Character} C - Character for which to check if the move is
 * @param {number} MoveType - Type of move to check for
 * @returns {boolean} - Returns TRUE if the move for that person is effective
 */
declare function KidnapMoveEffective(C: Character, MoveType: number): boolean;
/**
 * Processes a selected move. Triggered when the player selects their move.
 * @param {number} CardIndex - Type of the player move (Represented by the index of the character move array)
 * @returns {void} - Nothing
 */
declare function KidnapSelectMove(CardIndex: number): void;
/**
 * Processes a selected upper handmove. Triggered when the player selects their upper hand move.
 * @param {number} PlayerMove - Type of the player upper hand move (Represented by the index of the character move array)
 * @returns {void} - Nothing
 */
declare function KidnapSelectMoveUpperHand(PlayerMove: number): void;
/**
 * Triggered when the player surrenders to her opponent
 * @returns {void} - Nothing
 */
declare function KidnapSurrender(): void;
/**
 * Starts a kidnap match
 * @param {Character} Opponent - The NPC that will be the opponent for the fight
 * @param {string} Background - The background for the fight, changes depending on which room the battle is happening
 * @param {number} Difficulty - Difficulty modifier for the fight, higher is harder
 * @param {string} ReturnFunction - The callback to execute through CommonDynamicFunction
 * @returns {void} - Nothing
 */
declare function KidnapStart(Opponent: Character, Background: string, Difficulty: number, ReturnFunction: string): void;
/**
 * Draws the given character move.
 * @param {Character} C - Character to draw the move for
 * @param {string} Header - Text to display
 * @param {number} X - Position of the text to draw on the X axis, normally the position of the character
 * @returns {void} - Nothing
 */
declare function KidnapDrawMove(C: Character, Header: string, X: number, Side: any): void;
/**
 * Draws the upper hand moves
 * @returns {void} - Nothing
 */
declare function KidnapDrawMoveUpperHand(): void;
/**
 * Draws a large timer in the middle of the screen based on the kidnapping timer.
 * @returns {void} - Nothing
 */
declare function KidnapShowTimer(): void;
/**
 * Draws a large title in the center of the screen.
 * @param {string} Title - Title to display on screen
 * @returns {void} - Nothing
 */
declare function KidnapTitle(Title: string): void;
/**
 * Shows the items that can be used by the player.
 * @returns {void} - Nothing
 */
declare function KidnapShowItem(): void;
/**
 * Runs and draws the kidnapping minigame
 * @returns {void} - Nothing
 */
declare function KidnapRun(): void;
/**
 * Handles clicks in the kidnap mini game
 * @returns {void} - Nothing
 */
declare function KidnapClick(): void;
/**
 * Returns the experience gained from having successfully fought an opponent
 * @param {Character} opponent
 * @returns
 */
declare function KidnapSuccessWillpowerProgress(opponent: Character): number;
/**
 * Handles the key press in the kidnap mini game, the C cheat key can help you recover some lost willpower
 * @returns {void} - Nothing
 */
declare function KidnapKeyDown(): void;
declare var KidnapVictory: boolean;
declare var KidnapDifficulty: number;
declare var KidnapBackground: string;
declare var KidnapReturnFunction: string;
/** @type {null | Character} */
declare var KidnapOpponent: null | Character;
/** @type {null | Item} */
declare var KidnapPlayerCloth: null | Item;
/** @type {null | Item} */
declare var KidnapPlayerClothAccessory: null | Item;
/** @type {null | Item} */
declare var KidnapPlayerClothLower: null | Item;
/** @type {null | Item} */
declare var KidnapOpponentCloth: null | Item;
/** @type {null | Item} */
declare var KidnapOpponentClothAccessory: null | Item;
/** @type {null | Item} */
declare var KidnapOpponentClothLower: null | Item;
declare var KidnapTimer: number;
declare var KidnapMode: string;
declare var KidnapDialog: string;
declare var KidnapPlayerMove: number;
declare var KidnapOpponentMove: number;
declare var KidnapPlayerDamage: number;
declare var KidnapOpponentDamage: number;
declare var KidnapResultPlayer: string;
declare var KidnapResultOpponent: string;
declare var KidnapResultUpperHand: string;
/** @type {null | Character} */
declare var KidnapUpperHandVictim: null | Character;
declare var KidnapUpperHandSelection: number;
declare var KidnapMoveType: string[];
declare var KidnapUpperHandMoveType: string[];
/** @type { [number, number, number, number][] } */
declare var KidnapMoveMap: [number, number, number, number][];
declare var KidnapRPS: string[];
