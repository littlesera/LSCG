/**
 * Get the list of struggle minigames.
 */
declare function StruggleGetMinigames(): [StruggleKnownMinigames, StruggleMinigame][];
/**
 * Main handler for drawing the struggle minigame screen
 *
 * This function is responsible for drawing either the minigame themselves, or
 * the minigame selection screen if it's not yet running.
 *
 * @param {Character} C
 * @returns {boolean} Whether the draw handler ran
 */
declare function StruggleMinigameDraw(C: Character): boolean;
/**
 * Gets the correct label for the current operation (struggling, removing, swaping, adding, etc.)
 * @param {Character} C - The character who acts
 * @param {Item} PrevItem - The first item that's part of the action
 * @param {Item} NextItem - The second item that's part of the action
 * @returns {string} - The appropriate dialog option
 */
declare function StruggleProgressGetOperation(C: Character, PrevItem: Item, NextItem: Item): string;
/**
 * We can loosen if the item allows it, if enough time was spent and if the challenge is between 1 and 9
 * @returns {boolean} - TRUE if it's allowed
 */
declare function StruggleAllowLoosen(): boolean;
/**
 * Handles the minigames' KeyDown event.
 *
 * Only applicable for the Strength minigame.
 *
 * Increases or decreases the struggle mini-game, if a/A or s/S were pressed.
 * @returns {void} - Nothing
 */
declare function StruggleKeyDown(): void;
/**
 * Handles the minigames' Click event, whether on the selection screen or in the minigame themselves.
 *
 * @returns {boolean} - Nothing
 */
declare function StruggleMinigameClick(): boolean;
/**
 * Handle the common progress and drawing of the minigame
 *
 * This function draws the minigame common UI, and updates the progress if it should
 * do so automatically.
 *
 * @param {number} [Offset]
 */
declare function StruggleMinigameDrawCommon(Offset?: number): void;
/**
 * Check if the minigame has been interrupted and we should bail out
 *
 * @param {Character} C
 * @returns {boolean}
 */
declare function StruggleMinigameCheckCancel(C: Character): boolean;
/**
 * Helper used to tell if something interrupted the minigame.
 * @param {Character} C
 * @returns {boolean}
 */
declare function StruggleMinigameWasInterrupted(C: Character): boolean;
/**
 * Handles making the character's expression when struggling.
 *
 * @param {boolean} [Decrease] - Whether the game progressed or not that tick.
 */
declare function StruggleMinigameHandleExpression(Decrease?: boolean): void;
/**
 * Helper function that handles checking and completing the minigame
 *
 * @param {Character} C - The character to check for progress.
 */
declare function StruggleProgressCheckEnd(C: Character): void;
/**
 * Check if there's a struggling minigame started.
 *
 * @returns {boolean}
 */
declare function StruggleMinigameIsRunning(): boolean;
/**
 * Starts the given struggle minigame.
 *
 * This function initializes the common state and calls the requested minigame
 * setup function.
 *
 * @param {Character} C
 * @param {StruggleKnownMinigames} MiniGame
 * @param {Item} PrevItem
 * @param {Item} NextItem
 * @param {StruggleCompletionCallback} Completion
 */
declare function StruggleMinigameStart(C: Character, MiniGame: StruggleKnownMinigames, PrevItem: Item, NextItem: Item, Completion: StruggleCompletionCallback): void;
/**
 * Stop the struggle minigame and reset it so it can be reentered.
 *
 * If the game was already played a bit, it will also log the failure in chat.
 *
 * @returns {void}
 */
declare function StruggleMinigameStop(): void;
/**
 * Perform setup for the Strength minigame.
 *
 * Called by StruggleMinigameStart. Calculates the challenge level based on the
 * base item difficulty, the skill of the rigger and the escapee and modified,
 * if the escapee is bound in a way.
 *
 * @param {Character} C - The character who tries to struggle
 * @param {Item} PrevItem - The item, the character wants to struggle out of
 * @param {Item} [NextItem] - The item that should substitute the first one
 * @returns {void} - Nothing
 */
declare function StruggleStrengthSetup(C: Character, PrevItem: Item, NextItem?: Item): void;
/**
 * Strength minigame main drawing routine.
 *
 * @param {Character} C - The character for whom the struggle dialog is drawn. That can be the player or another character.
 * @returns {void} - Nothing
 */
declare function StruggleStrengthDraw(C: Character): void;
/**
 * Handle events for the Strength minigame
 *
 * @param {"Click"|"KeyDown"} EventType
 * @returns {void}
 */
declare function StruggleStrengthHandleEvent(EventType: "Click" | "KeyDown"): void;
/**
 * Advances the Struggle minigame progress
 *
 * The change of facial expressions during struggling is done here
 * @param {boolean} [Decrease] - If set to true, the progress is decreased
 * @returns {void} - Nothing
 */
declare function StruggleStrengthProcess(Decrease?: boolean): void;
/**
 * Performs the difficulty calculation for the Strength minigame
 *
 * This function calculates the challenge level based on the base item
 * difficulty, the skill of the rigger and the escapee, accounting for the
 * escapee being bound in a way.
 *
 * @param {Character} C - The character who tries to struggle
 * @param {Item} PrevItem - The item, the character wants to struggle out of
 * @param {Item} [NextItem] - The item that should substitute the first one
 * @returns {{difficulty: number; auto: number; timer: number; }} - Nothing
 */
declare function StruggleStrengthGetDifficulty(C: Character, PrevItem: Item, NextItem?: Item): {
    difficulty: number;
    auto: number;
    timer: number;
};
/**
 * Loosen minigame main drawing routine.
 * @param {Character} C - The character for whom the struggle dialog is drawn. That can be the player or another character.
 * @returns {void} - Nothing
 */
declare function StruggleLoosenDraw(C: Character): void;
/**
 * Loosen minigame main setup.
* @returns {void} - Nothing
*/
declare function StruggleLoosenSetup(): void;
/**
 * Handle events for the loosen minigame
 * @param {"Click"|"KeyDown"} EventType
 * @returns {void}
 */
declare function StruggleLoosenHandleEvent(EventType: "Click" | "KeyDown"): void;
/**
 * Starts the dialog progress bar for struggling out of bondage and keeps the items that needs to be added / swapped / removed.
 * First the challenge level is calculated based on the base item difficulty, the skill of the rigger and the escapee and modified, if
 * the escapee is bound in a way. Also blushing and drooling, as well as playing a sound is handled in this function.
 * @param {Character} C - The character who tries to struggle
 * @param {Item} PrevItem - The item, the character wants to struggle out of
 * @param {Item} [NextItem] - The item that should substitute the first one
 * @returns {void} - Nothing
 */
declare function StruggleFlexibilitySetup(C: Character, PrevItem: Item, NextItem?: Item): void;
/**
 * Draw the Flexibility minigame
 * @param {Character} C - The character for whom the struggle dialog is drawn. That can be the player or another character.
 * @returns {void} - Nothing
 */
declare function StruggleFlexibilityDraw(C: Character): void;
/**
 * Checks for collision with the mouse
 * @returns {boolean} - Result of check
 */
declare function StruggleFlexibilityCheck(): boolean;
/**
 * Handle events for the Flexibility minigame
 *
 * @param {"Click"|"KeyDown"} EventType
 * @returns {void}
 */
declare function StruggleFlexibilityHandleEvent(EventType: "Click" | "KeyDown"): void;
/**
 * Advances the Flexibility minigame progress
 *
 * @param {boolean} [Decrease] - If set to true, the progress is decreased
 * @returns {void} - Nothing
 */
declare function StruggleFlexibilityProcess(Decrease?: boolean): void;
/**
 * Starts the dialog progress bar for struggling out of bondage and keeps the items that needs to be added / swapped / removed.
 * First the challenge level is calculated based on the base item difficulty, the skill of the rigger and the escapee and modified, if
 * the escapee is bound in a way. Also blushing and drooling, as well as playing a sound is handled in this function.
 * @param {Character} C - The character who tries to struggle
 * @param {Item} PrevItem - The item, the character wants to struggle out of
 * @param {Item} [NextItem] - The item that should substitute the first one
 * @returns {void} - Nothing
 */
declare function StruggleDexteritySetup(C: Character, PrevItem: Item, NextItem?: Item): void;
/**
 * Draw the struggle dialog
 * @param {Character} C - The character for whom the struggle dialog is drawn. That can be the player or another character.
 * @returns {void} - Nothing
 */
declare function StruggleDexterityDraw(C: Character): void;
/**
 * Handle events for the Flexibility minigame
 *
 * @param {"Click"|"KeyDown"} EventType
 * @returns {void}
 */
declare function StruggleDexterityHandleEvent(EventType: "Click" | "KeyDown"): void;
/**
 * Advances the Dexterity minigame progress
 *
 * @returns {void} - Nothing
 */
declare function StruggleDexterityProcess(): void;
/**
 * Handles events for the LockPicking minigame
 * @param {"Click"|"KeyDown"} EventType
 * @returns {void} - Nothing
 */
declare function StruggleLockPickHandleEvent(EventType: "Click" | "KeyDown"): void;
/**
 * Advances the lock picking dialog
 * @returns {void} - Nothing
 */
declare function StruggleLockPickProcess(): void;
/**
 * Draw the lockpicking dialog
 * @param {Character} C - The character for whom the lockpicking dialog is drawn. That can be the player or another character.
 * @returns {void} - Nothing
 */
declare function StruggleLockPickDraw(C: Character): void;
/**
 * Gets the correct label for the current operation (struggling, removing, swaping, adding, etc.)
 * @param {Character} C - The character who acts
 * @param {Item} Item - The item that's part of the action
 * @returns {string} - The appropriate dialog option
 */
declare function StruggleLockPickProgressGetOperation(C: Character, Item: Item): string;
/**
 * Starts the dialog progress bar for picking a lock
 * First the challenge level is calculated based on the base lock difficulty, the skill of the rigger and the escapee
 * @param {Character} C - The character who tries to struggle
 * @param {Item} Item - The item, the character wants to unlock
 * @returns {void} - Nothing
 */
declare function StruggleLockPickSetup(C: Character, Item: Item): void;
/** @type {null | number[]} */
declare var StruggleLockPickOrder: null | number[];
/** @type {null | boolean[]} */
declare var StruggleLockPickSet: null | boolean[];
/** @type {null | boolean[]} */
declare var StruggleLockPickSetFalse: null | boolean[];
/** @type {null | number[]} */
declare var StruggleLockPickOffset: null | number[];
/** @type {null | number[]} */
declare var StruggleLockPickOffsetTarget: null | number[];
/** @type {null | number[]} */
declare var StruggleLockPickImpossiblePins: null | number[];
declare var StruggleLockPickProgressSkill: number;
declare var StruggleLockPickProgressSkillLose: number;
declare var StruggleLockPickProgressChallenge: number;
declare var StruggleLockPickProgressMaxTries: number;
declare var StruggleLockPickProgressCurrentTries: number;
declare var StruggleLockPickSuccessTime: number;
declare var StruggleLockPickFailTime: number;
declare var StruggleLockPickArousalTick: number;
declare var StruggleLockPickArousalTickTime: number;
declare var StruggleLockPickArousalText: string;
declare var StruggleLockPickFailTimeout: number;
declare var StruggleLockPickTotalTries: number;
declare var StruggleProgressStruggleCount: number;
declare var StruggleProgressAuto: number;
declare var StruggleProgressOperation: string;
declare var StruggleProgressSkill: number;
declare var StruggleProgressLastKeyPress: number;
declare var StruggleProgressChallenge: number;
declare var StruggleLoosenSpeed: number;
declare var StruggleLoosenAngle: number;
declare var StruggleLoosenHoleAngle: number;
/**
 * The struggle minigame progress
 *
 * -1 means there's no game running. 0 and StruggleProgressCurrentMinigame
 * indicates the player hasn't selected a game yet.
 *
 * @type {number}
 */
declare let StruggleProgress: number;
/**
 * The minigame currently running
 * @type {StruggleKnownMinigames | ""}
 */
declare var StruggleProgressCurrentMinigame: StruggleKnownMinigames | "";
/**
 * The item worn at the beginning of the minigame
 * @type {Item | null}
 */
declare var StruggleProgressPrevItem: Item | null;
/**
 * The item that should be worn at the end of the minigame
 * @type {Item | null}
 */
declare var StruggleProgressNextItem: Item | null;
/**
 * A function called when the struggle minigame completes
 * @type {StruggleCompletionCallback}
 */
declare var StruggleExitFunction: StruggleCompletionCallback;
/** @type {null | { X: number, Y: number, Size: number, Velocity: number }[]} */
declare var StruggleProgressFlexCircles: null | {
    X: number;
    Y: number;
    Size: number;
    Velocity: number;
}[];
declare var StruggleProgressFlexTimer: number;
declare var StruggleProgressFlexMaxX: number;
declare var StruggleProgressFlexMaxY: number;
declare var StruggleProgressFlexCirclesRate: number;
declare var StruggleProgressDexTarget: number;
declare var StruggleProgressDexCurrent: number;
declare var StruggleProgressDexMax: number;
declare var StruggleProgressDexDirectionRight: boolean;
/** @type {Record<string, StruggleMinigame>} */
declare const StruggleMinigames: Record<string, StruggleMinigame>;
