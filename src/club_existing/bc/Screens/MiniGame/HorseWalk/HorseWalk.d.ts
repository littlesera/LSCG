/**
 * Generates all the carrots and crops
 * @param {number} MaxCarrot - Maximum number of carrots to generate
 * @param {number} MaxCrop - Maximum number of crops to generate
 * @returns {void} - Nothing
 */
declare function HorseWalkGenerateCarrotItems(MaxCarrot: number, MaxCrop: number): void;
/**
 * Generates all the Hurdles for the basic hurdle difficulty
 * @param {number} MaxHurdle - Maximum number of hurdles to generate
 * @returns {void} - Nothing
 */
declare function HorseWalkGenerateHurdleItems(MaxHurdle: number): void;
/**
 * Generates all the Hurdles for the hurdle training difficulty
 * @param {number} MaxHurdle - Maximum number of hurdles to generate
 * @returns {void} - Nothing
 */
declare function HorseWalkGenerateHurdleTrainingItems(MaxHurdle: number): void;
/**
 * Draws the carrots & crops, or hurdles based on the current difficulty/mode
 * @returns {void} - Nothing
 */
declare function HorseWalkDrawItem(): void;
/**
 * Loads the Horse Walk mini game and generate the items, there are more carrots on harder difficulties and there are less of them overall on mobile because it is hard (no mouse swiping)
 * @returns {void} - Nothing
 */
declare function HorseWalkLoad(): void;
/**
 * Runs the horse walk mini game and draws the characters and items on screen
 * @returns {void} - Nothing
 */
declare function HorseWalkRun(): void;
/**
 * Ends the game and sends the result back to the screen
 * @param {boolean} Victory - Whether or not the player has won
 * @returns {void} - Nothing
 */
declare function HorseWalkEnd(Victory: boolean): void;
/**
 * Validates the clicks during the horse walk mini game for mobile, moves the character and validates touched items
 * @returns {void} - Nothing
 */
declare function HorseWalkDoMove(): void;
/**
 * Handles click events during the horse walk mini game. On mobile we move the player on click.
 * @returns {void} - Nothing
 */
declare function HorseWalkClick(): void;
declare var HorseWalkBackground: string;
/** @type { null | { X: number, Y: number }[] } */
declare var HorseWalkCarrots: null | {
    X: number;
    Y: number;
}[];
/** @type { null | { X: number, Y: number }[] } */
declare var HorseWalkCrops: null | {
    X: number;
    Y: number;
}[];
/** @type { null | { X: number, Y: number, Stat: number }[] } */
declare var HorseWalkHurdle: null | {
    X: number;
    Y: number;
    Stat: number;
}[];
declare var HorseWalkPlayerX: number;
declare var HorseWalkPlayerY: number;
declare var HorseWalkItemSize: number;
declare var HorseWalkCollectedCarrots: number;
declare var HorseWalkCollectedCrops: number;
declare var HorseWalkHurdleWin: number;
declare var HorseWalkHurdleFail: number;
declare var HorseWalkHitPony: number;
declare var HorseWalkHitTrainer: number;
declare var HorseWalkDrawPony: boolean;
declare var HorseWalkDrawTrainer: boolean;
declare var HorseWalkDrawXPosition: number;
declare var HorseWalkDrawYPosition: number;
declare var HorseWalkDrawYHeigh: number;
declare var HorseWalkDrawCaracter: number;
declare var HorseWalkSpeed: number;
declare var HorseWalkText: string;
declare var HorseWalkEventTimer: number;
