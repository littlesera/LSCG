/**
 * Start a magic battle against an opponent
 * @param {Character} Opponent
 * @param {number} Difficulty
 * @param {string} Background
 * @param {string} FunctionName
 * @returns {void} - Nothing
 */
declare function MagicBattleStart(Opponent: Character, Difficulty: number, Background: string, FunctionName: string): void;
/**
 * Loads the magic battle
 * @returns {void} - Nothing
 */
declare function MagicBattleLoad(): void;
/**
 * Returns a difficulty factor based on the character nakedness and predicament
 * @param {Character} C
 * @returns {number} - Difficulty from 0 (full cloth, no restrain) to 10 (naked, fully restrained)
 */
declare function MagicBattleGetDifficulty(C: Character): number;
/**
 * Returns the spells that are available based on opponent (C) clothing and restraints
 * @param {Character} C
 * @returns {Array<number>} - Nothing
 */
declare function MagicBattleGetAvailSpells(C: Character): Array<number>;
/**
 * Runs the magic battle, 1 player vs 1 opponent
 * @returns {void} - Nothing
 */
declare function MagicBattleRun(): void;
/**
 * Handles clicks during the game
 * @returns {void} - Nothing
 */
declare function MagicBattleClick(): void;
/**
 * Starts the magic puzzle mini-game for a specific spell (S)
 * @param {number} S
 * @returns {void} - Nothing
 */
declare function MagicBattleSpellStart(S: number): void;
/**
 * Applies the effect of a magic spell (Spell) on a character (C)
 * @param {Character} C
 * @param {number} Spell
 * @returns {void} - Nothing
 */
declare function MagicSpellEffect(C: Character, Spell: number): void;
/**
 * When the spell ends, we apply the effect of the spell on the loser
 * @returns {void} - Nothing
 */
declare function MagicBattleSpellEnd(): void;
/**
 * Handles the key press in the game, the C key for cheats
 * @returns {void} - Nothing
 */
declare function MagicBattleKeyDown(): void;
declare var MagicBattleBackground: string;
/** @type {null | Character} */
declare var MagicBattleOpponent: null | Character;
declare var MagicBattleReturnFunction: string;
declare var MagicBattleDifficulty: number;
declare var MagicBattleVictory: boolean;
/** @type {number[]} */
declare var MagicBattleAvailSpell: number[];
declare var MagicBattleOpponentSpell: number;
/** @type {null | string} */
declare var MagicBattlePlayerAppearance: null | string;
/** @type {null | string} */
declare var MagicBattleOpponentAppearance: null | string;
declare var MagicBattleSpellDifficulty: number[];
