/**
 * Checks if the player is helpless (maids disabled) or not.
 * @returns {boolean} - Returns true if the player still has time remaining after asking the maids to stop helping in the maid quarters
 */
declare function GamblingIsMaidsDisabled(): boolean;
/**
 * Checks if any of the subs in the gambling hall are currentyl restrained
 * @returns {boolean} - Returns true, if any of the two subs is restrained, false otherwise
 */
declare function GamblingIsSubsRestrained(): boolean;
/**
 * Checks, wether the left sub is restrained
 * @returns {boolean} - Returns true, if the left sub is restrained, false otherwise
 */
declare function GamblingFirstSubRestrained(): boolean;
/**
 * Checks, wether the left sub can offer games to the player
 * @returns {boolean} - Returns true, if neither the left sub nor the player are restrained, false otherwise
 */
declare function GamblingFirstCanPlay(): boolean;
/**
 * Checks, wether the right sub is restrained
 * @returns {boolean} - Returns true, if the right sub is restrained, false otherwise
 */
declare function GamblingSecondSubRestrained(): boolean;
/**
* Checks, wether the right sub can offer games to the player
 * @returns {boolean} - Returns true, if neither the right sub nor the player are restrained, false otherwise
  */
declare function GamblingSecondCanPlay(): boolean;
/**
 * Checks, if the simple dice game can be offered
 * @returns {boolean} - Returns true, if the left sub can offer games, false otherwise
 */
declare function GamblingCanPlaySimpleDice(): boolean;
/**
 * Checks, if the game of 21 can be offered
 * @returns {boolean} - Returns true, if the left sub can offer games
 * and the player's reputation is higer than 10, false otherwise
 */
declare function GamblingCanPlayTwentyOne(): boolean;
/**
 * Checks, if the toothpick game can be offered
 * @returns {boolean} - Returns true, if the left sub can offer games
 * and the player's reputation is higer than 20, false otherwise
 */
declare function GamblingCanPlayToothpick(): boolean;
/**
 * Checks, if the game 'Catch the fox' can be offered
 * @returns {boolean} - Returns true, if the right sub can offer games, the player's reputation is higer than 30
 * and she has enough money, false otherwise
 */
declare function GamblingCanPlayFox(): boolean;
/**
 * Checks, if the game 'Street to Roissy' can be offered
 * @returns {boolean} - Returns true, if the right sub can offer games, the player's reputation is higer than 40
 * and she has enough money, false otherwise
 */
declare function GamblingCanPlayStreetRoissy(): boolean;
/**
 * Checks, if the game 'Dare Six' can be offered
 * @returns {boolean} - Returns true, if the right sub can offer games, the player's reputation is higer than 50
 * and she has enough money, false otherwise
 */
declare function GamblingCanPlayDaredSix(): boolean;
/**
 * Checks, if the player can take one toothpick
 * @returns {boolean} - Returns true, if there is more than one pick left, false otherwise
 */
declare function GamblingToothpickCanPickOne(): boolean;
/**
 * Checks, if the player can take two toothpicks
 * @returns {boolean} - Returns true, if there are more than two picks left, false otherwise
 */
declare function GamblingToothpickCanPickTwo(): boolean;
/**
 * Checks, if the player can take three toothpicks
 * @returns {boolean} - Returns true, if there are more than three picks left, false otherwise
 */
declare function GamblingToothpickCanPickThree(): boolean;
/**
 * Checks, if the player is restrained with a locked item
 * @returns {boolean} - Returns true if a restraint is locked on the player, false otherwise
 */
declare function GamblingIsRestrainedWithLock(): boolean;
/**
 * Checks, wether the player is restrained but no lock is used
 * @returns {boolean} - Returns true, if the player is restarined, but no lock was used, false otherwise
 */
declare function GamblingIsRestrainedWithoutLock(): boolean;
/**
 * Checks, if the player owns enough money to pay for her release
 * @returns {boolean} - Returns true, if the player is not restrained with a lock and owns at least $25, false otherwise
 */
declare function GamblingCanPayToRelease(): boolean;
/**
 * Checks, if the player is too poor to pay for her release
 * @returns {boolean} - Returns true, if the player is not restrained with a lock and owns less than $25, false otherwise
 */
declare function GamblingCannotPayToRelease(): boolean;
/**
 * Checks, if the player can steal the dice
 * @returns {boolean} - Returns true, if the player is able to steal the dice, false otherwise
 */
declare function GamblingCanStealDice(): boolean;
/**
 * Loads the Gambling Hall and creates the two subs. If the player is on a rescue mission, the restraints are created.
 * This function is called dynamically.
 * @returns {void} - Nothing
 */
declare function GamblingLoad(): void;
/**
 * Run the Gambling Hall, draw all characters. This function is called dynamically at very short intervals.
 * Don't use expensive loops or call expensive functions from here
 * @returns {void} - Nothing
 */
declare function GamblingRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function GamblingClick(): void;
/**
 * Paint the stack of dice, the sum of ponits and player's money
 * @returns {true} - Always true
 */
declare function GamblingShowDiceStack(): true;
/**
 * Paint the dice for the NPC
 * @returns {true} - Always true
 */
declare function GamblingShowNpcDice(): true;
/**
 * Calculates the sum of dice in a given dice stack
 * @param {number[]} DiceStack - The dice stack to sum up
 * @returns {number} - The sum of points in the stack
 */
declare function GamblingDiceStackSum(DiceStack: number[]): number;
/**
 * Controller for the Simple Dice Game
 * @param {"new" | "win" | "lost" | "equal"} SimpleDiceState - The current game state
 * @returns {void} - Nothing
 */
declare function GamblingSimpleDiceController(SimpleDiceState: "new" | "win" | "lost" | "equal"): void;
/**
 * Draws the Toothpicks
 * @returns {true} - Always true
 */
declare function GamblingShowToothpickStack(): true;
/**
 * Controller for the Toothpick game
 * @param {"new" | "give_up" | "win" | "lost" | string} ToothpickState - The current state of the game
 * @returns {void} - Nothing
 */
declare function GamblingToothpickController(ToothpickState: "new" | "give_up" | "win" | "lost" | string): void;
/**
 * Determines the random toothpick draw of the NPC
 * @returns {number} - The toothpicks the NPC draws
 */
declare function GamblingToothpickNPCChoice(): number;
/**
 * Controller for fifteen and six
 * @param {"new" | "add" | "fin" | "win_next" | "lost_next"} TwentyOneState - The current state of the game
 * @returns {void} - Nothing
 */
declare function GamblingTwentyOneController(TwentyOneState: "new" | "add" | "fin" | "win_next" | "lost_next"): void;
/**
 * Controller for Catch the Fox
 * @param {"new" | "fox" | "hunter" | "NextDice" | "player_fox_win" | "player_fox_lost" | "player_hunter_lost" | "player_hunter_win"} FoxState - The current state of the game
 */
declare function GamblingFoxController(FoxState: "new" | "fox" | "hunter" | "NextDice" | "player_fox_win" | "player_fox_lost" | "player_hunter_lost" | "player_hunter_win"): void;
/**
 * Roll a dice for Street To Roissy and add it to the given dice stack.
 * Replace the last dice on the stack if it was not progressing to Roissy.
 * @param Stack the array to add the new dice on
 * @return {number} - The value of the dice thrown
 */
declare function GamblingStreetRoissyRollDice(Stack: any): number;
/**
 * Controller for Street to Roissy
 * @param {"new" | "nextDice" | "both" | "win" | "lost" | "end"} StreetRoissyState - The current state of the game
 * @returns {void} - Nothing
 */
declare function GamblingStreetRoissyController(StreetRoissyState: "new" | "nextDice" | "both" | "win" | "lost" | "end"): void;
/**
 * Controller for Dared Six
 * @param {"new" | "add" | "fin" | "win" | "lost"}  DaredSixState - The current state of the game
 * @returns {void} - Nothing
 */
declare function GamblingDaredSixController(DaredSixState: "new" | "add" | "fin" | "win" | "lost"): void;
/**
 * Get the dressinglevel for characters
 * @param {Character} C - The character to check
 * @returns {number} - Returns 0 if the character is naked, 2, if she's in her underwear, 3 if she's still wearing shoes. 1 otherwise
 */
declare function GamblingDressingLevel(C: Character): number;
/**
 *  Strips or ties a caracter that lost a turn
 * @param {Character} gstCarachter - The character to tie
 * @param {number} gstLevel - The current game level
 * @returns {boolean} - Returns true, if the character lost, false otherwise
 */
declare function GamblingStripTied(gstCarachter: Character, gstLevel: number): boolean;
/**
 * The left sub blindfolds the player
 * @returns {void} - Nothing
 */
declare function GamblingAnnoyGamblingFirstSub(): void;
/**
 * Uses an activity on the player or releases her
 * @param {"new"| "next" } ReleaseState - The current state of the release process
 * @returns {void} - Nothing
 */
declare function GamblingReleasePlayerGame(ReleaseState: "new" | "next"): void;
/**
 * Release the player for money
 * @returns {void} - Nothing
 */
declare function GamblingPayForFreedom(): void;
/**
 * Dresses the character back
 * @returns {void} - Nothing
 */
declare function GamblingDressBackPlayer(): void;
/**
 * When the player rescues the Gambling Subs
 * @returns {void} - Nothing
 */
declare function GamblingCompleteRescue(): void;
/**
 * The player tries to steal the dice
 * @returns {void} - Nothing
 */
declare function GamblingStealDice(): void;
declare var GamblingBackground: string;
/** @type {null | NPCCharacter} */
declare var GamblingFirstSub: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var GamblingSecondSub: null | NPCCharacter;
/** @type {null | number} */
declare var GamblingPlayerDice: null | number;
declare var GamblingPolice: any;
/** @type {null | number} */
declare var GamblingNpcDice: null | number;
/** @type {number[]} */
declare var GamblingPlayerDiceStack: number[];
/** @type {number[]} */
declare var GamblingNpcDiceStack: number[];
declare var GamblingPlayerSubState: number;
/** Game-State of NPC */
declare var GamblingNpcSubState: number;
/** Player is Fox by Fox and Hunter */
declare var GamblingPlayerIsFox: boolean;
/** Money Bet in Current Game */
declare var GamblingMoneyBet: number;
/** Show Summ of Dice Dots in DiceStack */
declare var GamblingShowDiceSum: boolean;
/** Show Money in DiceStack */
declare var GamblingShowMoney: boolean;
/** @type {null | Item[]} */
declare var GamblingAppearanceFirst: null | Item[];
/** @type {null | Item[]} */
declare var GamblingAppearanceSecond: null | Item[];
/** @type {null | Item[]} */
declare var GamblingAppearancePlayer: null | Item[];
/** Sub Player lost Cloth although forbidden by Mistress */
declare var GamblingIllegalChange: boolean;
/** available Toothpicks */
declare var GamblingToothpickCount: number;
