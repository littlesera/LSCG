/**
 * Resets the timer for AFK count
 * @returns {void} - Nothing
 */
declare function AfkTimerReset(): void;
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
declare var AfkTimerTimout: number;
declare var AfkTimerIsSet: boolean;
declare var AfkTimerLastEvent: number;
/** @type {null | boolean} */
declare var AfkTimerIsEnabled: null | boolean;
declare var AfkTimerEventsList: string[];
/** @type {null | ExpressionNameMap["Emoticon"]} */
declare var AfkTimerOldEmoticon: null | ExpressionNameMap["Emoticon"];
