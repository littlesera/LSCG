/**
 * Loads the preference screen. This function is called dynamically, when the character enters the preference screen
 * for the first time
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsLoad(): void;
/**
 * If the setting's alert type is not allowed for this session, e.g. from using a new device/browser, reset it to 'None'
 * @param {NotificationSetting} setting - The notifications setting to check
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsCheckSetting(setting: NotificationSetting): void;
/**
 * Sets the notifications preferences for a player. Redirected to from the main Run function if the player is in the
 * notifications settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsRun(): void;
/**
 * Draws the two checkbox row for a notifications setting
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {string} Text - The text for the setting's description
 * @param {NotificationSetting} Setting - The player setting the row corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsDrawSetting(Left: number, Top: number, Text: string, Setting: NotificationSetting): void;
/**
 * Handles the click events for the notifications settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsClick(): void;
/**
 * Handles the click events within a multi-checkbox settings row.
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {NotificationSetting} Setting - The player setting the row corresponds to
 * @param {NotificationEventType} EventType - The event type the setting corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsClickSetting(Left: number, Top: number, Setting: NotificationSetting, EventType: NotificationEventType): void;
/**
 * Exits the preference screen. Resets the test notifications.
 */
declare function PreferenceSubscreenNotificationsExit(): boolean;
