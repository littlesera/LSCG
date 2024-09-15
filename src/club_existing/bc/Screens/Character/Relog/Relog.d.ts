/**
 * Loads the relog screen
 * @returns {void} Nothing
 */
declare function RelogLoad(): void;
/**
 * Runs the relog screen
 * @returns {void} Nothing
 */
declare function RelogRun(): void;
/**
 * Handles player click events on the relog screen
 * @returns {void} Nothing
 */
declare function RelogClick(): void;
/**
 * Handles player keyboard events on the relog screen
 * @returns {void} Nothing
 */
declare function RelogKeyDown(): void;
/**
 * Attempt to log the user in based on the current player account name and the input password
 * @returns {void} Nothing
 */
declare function RelogSend(): void;
/**
 * Sends the player back to the main login screen
 * @returns {void} Nothing
 */
declare function RelogExit(): void;
declare var RelogBackground: string;
declare var RelogCanvas: HTMLCanvasElement;
/** @type {null | { Screen: string, Module: ModuleType, Character: Character }} */
declare var RelogData: null | {
    Screen: string;
    Module: ModuleType;
    Character: Character;
};
/** @type {HTMLDivElement | null} */
declare var RelogChatLog: HTMLDivElement | null;
declare var RelogInputText: string;
