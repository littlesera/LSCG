/**
 * Loads the online friend list from the server. This function is called dynamically, when the player invokes the friendlist dialog.
 * @returns {void} - Nothing
 */
declare function FriendListLoad(): void;
/**
 * Run the friend list screen - Draw the controls and print the result of the server query to the screen.
 * This function is called dynamically on a regular basis. So don't do complex loops within
 * @returns {void} - Nothing
 */
declare function FriendListRun(): void;
/**
 * Creates beep message menu
 * @param {number} MemberNumber Member number of target player
 * @param {IFriendListBeepLogMessage|null} data Beep data of received beep
 */
declare function FriendListBeep(MemberNumber: number, data?: IFriendListBeepLogMessage | null): void;
/**
 * Closes the beep menu
 */
declare function FriendListBeepMenuClose(): void;
/**
 * Sends the beep and message on send click
 */
declare function FriendListBeepMenuSend(): void;
/**
 * Shows the wanted beep on click from beep list
 * @param {number} i index of the beep
 */
declare function FriendListShowBeep(i: number): void;
/**
 * Handles the click events in the friend list. Clicks are propagated to this function from CommonClick()
 * @returns {void} - Nothing
 */
declare function FriendListClick(): void;
/**
 * This function is called, when the user exists the friend list. From here we either get back to the InformationSheet
 * or the ChatRoom search, depending on the value of the global variable 'FriendListReturn'
 * @returns {void} - Nothing
 */
declare function FriendListExit(): void;
/**
 * Exits the friendlist
 * @param {string} room The room to search for
 */
declare function FriendListChatSearch(room: string): void;
/**
 * Loads the friend list data into the HTML div element.
 * @param {ServerFriendInfo[]} data - An array of data, we receive from the server
 *
 * `data.MemberName` - The name of the player
 *
 * `data.MemberNumber` - The ID of the player
 *
 * `data.ChatRoomName` - The name of the ChatRoom
 *
 * `data.ChatRoomSpace` - The space, where this room was created. Currently this can be the Asylum or the LARP arena
 *
 * `data.Type` - The relationship that exists between the player and the friend of the list.
 * Currently, only "submissive" is supported
 * @returns {void} - Nothing
 */
declare function FriendListLoadFriendList(data: ServerFriendInfo[]): void;
/**
 * When the user wants to delete someone from her friend list this must be confirmed.
 * This function either displays the confirm message or deletes the friend from the player's friendlist
 * @param {number} MemberNumber - The member to delete from the friendlist
 * @returns {void} - Nothing
 */
declare function FriendListDelete(MemberNumber: number): void;
declare var FriendListBackground: string;
declare var FriendListContent: string;
/** @type {number[]} */
declare var FriendListConfirmDelete: number[];
/** @type {null | { Screen: string, Module: ModuleType, IsInChatRoom?: boolean, hasScrolledChat?: boolean }} */
declare var FriendListReturn: null | {
    Screen: string;
    Module: ModuleType;
    IsInChatRoom?: boolean;
    hasScrolledChat?: boolean;
};
declare var FriendListMode: string[];
declare var FriendListModeIndex: number;
/** @type {IFriendListBeepLogMessage[]} */
declare var FriendListBeepLog: IFriendListBeepLogMessage[];
/** @type {number|null} MemberNumber of the player to send beep to */
declare let FriendListBeepTarget: number | null;
declare var FriendListBeepShowRoom: boolean;
