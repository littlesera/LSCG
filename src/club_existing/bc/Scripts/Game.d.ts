declare function GameStart(): void;
declare function GameHandleError(): void;
/**
 * Periodically called in the background with low frequency, so the game doesn't freeze, even if the user switches to a different tab.
 * @returns {void}
 */
declare function GameFallbackTimer(): void;
/**
 * Main game running state, runs the drawing
 * @param {number} Timestamp
 */
declare function GameRun(Timestamp: number): void;
/**
 * Main game running state, when in the background. Skips drawing if possible.
 * @param {number} Timestamp
 */
declare function GameRunBackground(Timestamp: number): void;
/**
 * When the user presses a key, we send the KeyDown event to the current screen if it can accept it
 * @param {KeyboardEvent} event
 */
declare function GameKeyDown(event: KeyboardEvent): boolean;
declare function GameKeyUp(event: any): void;
/**
 * If the user presses the mouse button, we fire the mousedown event for other screens
 * @param {MouseEvent} event
 */
declare function GameMouseDown(event: MouseEvent): void;
/**
 * If the user releases the mouse button, we fire the mouseup and click events for other screens
 * @param {MouseEvent} event
 */
declare function GameMouseUp(event: MouseEvent): void;
declare function GameMouseWheel(event: WheelEvent): void;
/**
 * If the user moves the mouse mouse, we keep the mouse position for other scripts and fire the mousemove event for other screens
 * @param {MouseEvent} event
 */
declare function GameMouseMove(event: MouseEvent, forwardToScreens?: boolean): void;
/**
 * If the user starts touching the screen (mobile only), we fire the mousedown and click events for other screens
 * @param {TouchEvent} event
 */
declare function GameTouchStart(event: TouchEvent): void;
/**
 * If the user stops touching the screen (mobile only), we fire the mouseup event for other screens
 * @param {TouchEvent} event
 */
declare function GameTouchEnd(event: TouchEvent): void;
/**
 * if the user moves the touch, we keep the mouse position for other scripts and fire the mousemove event for other screens
 * @param {TouchEvent} event
 */
declare function GameTouchMove(event: TouchEvent, forwardToScreens?: boolean): void;
/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 * @param {MouseEvent} event
 */
declare function GameMouseLeave(event: MouseEvent): void;
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
/** @type {number | null} */
declare var GameAnimationFrameId: number | null;
/** @type {Worker | null} */
declare var GameWorker: Worker | null;
declare var CommonVersionUpdated: boolean;
/** @type {TouchList | null} */
declare var CommonTouchList: TouchList | null;
declare const DEFAULT_FRAMERATE: 60;
declare var GameMouseIsDown: boolean;
