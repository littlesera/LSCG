declare function PreferenceSubscreenChatLoad(): void;
/**
 * Sets the chat preferences for the player. Redirected to from the main Run function if the player is in the chat
 * settings subscreen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenChatRun(): void;
/**
 * Handles the click events for the chat settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenChatClick(): void;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenChatExit(): boolean;
/** @type {ChatColorThemeType[]} */
declare var PreferenceChatColorThemeList: ChatColorThemeType[];
declare var PreferenceChatColorThemeIndex: number;
/** @type {ChatEnterLeaveType[]} */
declare var PreferenceChatEnterLeaveList: ChatEnterLeaveType[];
declare var PreferenceChatEnterLeaveIndex: number;
/** @type {ChatMemberNumbersType[]} */
declare var PreferenceChatMemberNumbersList: ChatMemberNumbersType[];
declare var PreferenceChatMemberNumbersIndex: number;
/** @type {ChatFontSizeType[]} */
declare var PreferenceChatFontSizeList: ChatFontSizeType[];
declare var PreferenceChatFontSizeIndex: number;
declare var PreferenceChatPageIndex: number;
declare var PreferenceChatPageList: number[];
/** @type {{label: string, check: () => boolean, click: () => void}[]} */
declare const PreferenceSubscreenChatCheckboxes: {
    label: string;
    check: () => boolean;
    click: () => void;
}[];
/** @type {CommonGenerateGridParameters} */
declare const PreferenceSubscreenChatCheckboxGrid: CommonGenerateGridParameters;
