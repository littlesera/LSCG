/**
 * Loads the Bondage Poker room
 * @returns {void} - Nothing
 */
declare function PokerLoad(): void;
/**
 * Draws a poker player behind the table
 * @param {PokerPlayer} P
 * @param {number} X
 * @param {number} Y
 * @returns {void} - Nothing
 */
declare function PokerDrawPlayer(P: PokerPlayer, X: number, Y: number): void;
/**
 * Gets the chip progress of the current player P
 * @param {PokerPlayer} P
 * @returns {number} - The progress as a %
 */
declare function PokerGetProgress(P: PokerPlayer): number;
/**
 * Gets a possible text for a poker player P
 * @param {PokerPlayer} P
 * @param {string} [Tag]
 * @returns {void} - Nothing
 */
declare function PokerGetText(P: PokerPlayer, Tag?: string): void;
/**
 * Gets a possible image for a poker player P
 * @param {PokerPlayer} P
 * @returns {void} - Nothing
 */
declare function PokerGetImage(P: PokerPlayer): void;
/**
 * Runs & Draws the Bondage Poker room
 * @returns {void} - Nothing
 */
declare function PokerRun(): void;
/**
 * Clears the player data for player P
 * @param {PokerPlayer} P
 * @returns {void} - Nothing
 */
declare function PokerClearData(P: PokerPlayer): void;
/**
 * Returns TRUE if the opponent has been unlocked and can be faced
 * @param {string} Opponent
 * @returns {boolean}
 */
declare function PokerChallengeUnlocked(Opponent: string): boolean;
/**
 * Picks the next/previous opponent family for a player P
 * @param {PokerPlayer} P - The player to change
 * @param {boolean} Next - Whether to pick the next or previous opponent
 * @returns {void} - Nothing
 */
declare function PokerChangeOpponentFamily(P: PokerPlayer, Next: boolean): void;
/**
 * Picks the next/previous opponent for a player P
 * @param {PokerPlayer} P
 * @param {boolean} Next - true for next, false for previous
 * @returns {void} - Nothing
 */
declare function PokerChangeOpponent(P: PokerPlayer, Next: boolean): void;
/**
 * Picks the next challenge in the list
 * @returns {PokerPlayer} - Nothing
 */
declare function PokerNextChallenge(): PokerPlayer;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function PokerClick(): void;
/**
 * Handles key presses during the bondage poker game
 * @returns {void} - Nothing
 */
declare function PokerKeyDown(): void;
/**
 * When the player exits from Bondage Poker
 * @returns {void} - Nothing
 */
declare function PokerExit(): void;
/**
 * Draws a card for a poker player PP
 * @param {PokerPlayer} PP
 * @returns {void} - Nothing
 */
declare function PokerDrawCard(PP: PokerPlayer): void;
/**
 * Returns the file name associated with the card
 * @param {number} Card
 * @returns {string} - The file name of the card image
 */
declare function PokerCardFileName(Card: number): string;
/**
 * Draw one card on the poker table, only used in Texas Hold'em
 * @returns {void} - Nothing
 */
declare function PokerTableDraw(): void;
/**
 * When all players chip in the pot
 * @returns {void} - Nothing
 */
declare function PokerAddPot(Multiplier: any, StartPos: any): void;
/**
 * When the player wins, she can unlock new opponents and win money
 * @returns {void}
 */
declare function PokerChallengeDone(): void;
/**
 * Process an action to advance the poker game
 * @param {string} Action - Bet, Raise, Fold or Watch
 * @returns {string} - The file name of the card image
 */
declare function PokerProcess(Action: string): string;
/**
 * Deals a fresh new hand for all poker players
 * @returns {void} - Nothing
 */
declare function PokerDealHands(): void;
declare var PokerBackground: string;
/** @type {PokerPlayer[]} */
declare var PokerPlayer: PokerPlayer[];
/** @type {PokerMode} */
declare var PokerMode: PokerMode;
/** @type {PokerGameType} */
declare var PokerGame: PokerGameType;
declare var PokerShowPlayer: boolean;
/** @type {PokerAsset[]} */
declare var PokerAsset: PokerAsset[];
declare var PokerPlayerCount: number;
/** @type {number[]} */
declare var PokerTableCards: number[];
declare var PokerMessage: string;
declare var PokerResultMessage: string;
declare var PokerAnte: number;
declare var PokerAnteCount: number;
declare var PokerPot: number;
declare var PokerChallenge: string[];
declare var PokerOpponentList: string[];
