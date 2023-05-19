/**
 * Resets the timer for AFK count
 * @returns {void} - Nothing
 */
declare function AfkTimerReset(): void;
/**
 * Increments the AFK Timer by 1. Is called from the browser's timer handler method.
 * @see {@link AfkTimerStart} and {@link AfkTimerStop} for the registering and unregistering of this function.
 * @returns {void} - Nothing
 */
declare function AfkTimerIncrement(): void;
/**
 * Registers the AfkTimerReset method for every event that is listed in AfkTimerEventsList and starts the timer count.
 * @returns {void} - Nothing
 */
declare function AfkTimerStart(): void;
/**
 * Unregisters the AfkTimerReset method from all events listed in AfkTimerEventsList and stops the timer count
 * @returns {void} - Nothing
 */
declare function AfkTimerStop(): void;
/**
 * Enables or disables the afk timer. Is called, when the player changes her settings in the preferences dialog
 * @param {boolean} Enabled - Determines, whether the afk timer will be enabled (true) or disabled (false).
 * @returns {void} - Nothing
 */
declare function AfkTimerSetEnabled(Enabled: boolean): void;
/**
 * Sets the players's emote to the Afk symbol, when the timer runs out and saves the current Emoticon, if there is any
 * @returns {void} - Nothing
 */
declare function AfkTimerSetIsAfk(): void;
declare var AfkTimerIncrementMs: number;
declare var AfkTimerTimout: number;
declare var AfkTimerIdle: number;
declare var AfkTimerIsSet: boolean;
/** @type {null | boolean} */
declare var AfkTimerIsEnabled: null | boolean;
declare var AfkTimerEventsList: string[];
/** @type {null | ReturnType<typeof setInterval>} */
declare var AfkTimerID: null | ReturnType<typeof setInterval>;
/** @type {null | ExpressionNameMap["Emoticon"]} */
declare var AfkTimerOldEmoticon: null | ExpressionNameMap["Emoticon"];
