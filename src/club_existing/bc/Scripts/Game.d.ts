declare function GameStart(): void;
/**
 * Main game running state, runs the drawing
 * @param {number} Timestamp
 */
declare function GameRun(Timestamp: number): void;
/**
 * When the user presses a key, we send the KeyDown event to the current screen if it can accept it
 * @param {KeyboardEvent} event
 */
declare function GameKeyDown(event: KeyboardEvent): void;
/**
 * Handler for document-wide keydown event
 * @param {KeyboardEvent} event
 */
declare function DocumentKeyDown(event: KeyboardEvent): void;
/**
 * When mouse move, we keep the mouse position for other scripts
 * @param {MouseEvent} event
 */
declare function MouseMove(event: MouseEvent): void;
/**
 * When the user clicks, we fire the click event for other screens
 * @param {MouseEvent} event
 */
declare function MouseClick(event: MouseEvent): void;
/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 * @param {TouchEvent} event
 */
declare function TouchStart(event: TouchEvent): void;
/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 * @param {TouchEvent} event
 */
declare function TouchEnd(event: TouchEvent): void;
/**
 * When touch moves, we keep it's position for other scripts
 * @param {TouchEvent} event
 */
declare function TouchMove(event: TouchEvent): void;
/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 * @param {MouseEvent} event
 */
declare function MouseLeave(event: MouseEvent): void;
/** @deprecated */
declare function KeyDown(event: any): void;
/** @deprecated */
declare function MainRun(Timestamp: any): void;
/** @deprecated */
declare function Click(event: any): void;
/** @deprecated */
declare function LoseFocus(event: any): void;
/** BC's version */
declare var GameVersion: string;
declare const GameVersionFormat: RegExp;
declare var CommonVersionUpdated: boolean;
/** @type {TouchList | null} */
declare var CommonTouchList: TouchList | null;
