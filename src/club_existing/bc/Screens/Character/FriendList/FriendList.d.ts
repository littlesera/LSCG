declare function FriendListLoad(): void;
declare function FriendListResize(load: boolean): void;
declare function FriendListRun(time: number): void;
declare function FriendListDraw(): void;
declare function FriendListClick(event: MouseEvent | TouchEvent): void;
declare function FriendListKeyDown(event: KeyboardEvent): boolean;
declare function FriendListUnload(): void;
declare function FriendListExit(): void;
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
 * `data.ChatRoomSpace` - The space, where this room was created.
 *
 * `data.Type` - The relationship that exists between the player and the friend of the list.
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
/**
 * Handles mode changes for friend list
 * @param {number} modeIndex - mode to change to
 */
declare function FriendListChangeMode(modeIndex: number): void;
/**
 * Sorts the friend list depending on the sorting mode
 * and the sorting direction. If the sorting mode is none nothing is done.
 * @param {FriendListSortingMode} sortingMode
 * @param {FriendListSortingDirection} sortingDirection
 */
declare function FriendListSort(sortingMode: FriendListSortingMode, sortingDirection: FriendListSortingDirection): void;
/**
 * Sorts the friend list by properties based on the search input.
 * Searched properties: Name, Nickname (NYI) and MemberNumber
 * @param {string} text
 */
declare function FriendListSearchByProperties(text: string): void;
/**
 * Highlights the searched text in the innerHTML
 * @param {Element} element
 * @param {string} text
 * @returns {string} - The innerHTML with the searched text highlighted
 */
declare function FriendListHighlightProperty(element: Element, text: string): string;
/**
 * Handles changes of the sorting mode
 * @param {FriendListSortingMode} sortingMode
 */
declare function FriendListChangeSortingMode(sortingMode: FriendListSortingMode): void;
/**
 * @this {HTMLButtonElement}
 */
declare function FriendListToggleAutoRefresh(this: HTMLButtonElement): void;
declare var FriendListBackground: string;
/** @type {number[]} */
declare var FriendListConfirmDelete: number[];
/** @type {FriendListReturn | null} */
declare var FriendListReturn: FriendListReturn | null;
/** @type {FriendListModes} */
declare var FriendListMode: FriendListModes;
declare var FriendListModeIndex: number;
/** @type {IFriendListBeepLogMessage[]} */
declare var FriendListBeepLog: IFriendListBeepLogMessage[];
/** @type {number} MemberNumber of the player to send beep to */
declare let FriendListBeepTarget: number;
declare var FriendListBeepShowRoom: boolean;
/** @type {FriendListSortingMode} */
declare let FriendListSortingMode: FriendListSortingMode;
/** @type {FriendListSortingDirection} */
declare let FriendListSortingDirection: FriendListSortingDirection;
declare namespace FriendListAutoRefresh {
    let interval: number;
    let nextRefresh: number;
}
declare const FriendListIDs: Readonly<{
    root: "friend-list-subscreen";
    navBar: "friend-list-nav-bar";
    header: "friend-list-header";
    friendList: "friend-list";
    friendListTable: "friend-list-table";
    navButtons: "friend-list-buttons";
    modeTitle: "friend-list-mode-title";
    searchInput: "friend-list-search-input";
    btnAutoRefresh: "friend-list-button-auto-refresh";
    btnRefresh: "friend-list-button-refresh";
    btnPrev: "friend-list-button-prev";
    btnNext: "friend-list-button-next";
    btnExit: "friend-list-button-exit";
    btnResetSorting: "friend-list-reset-sorting";
    beepList: "friend-list-beep-dialog";
    beepTextArea: "friend-list-beep-textarea";
    beepFooter: "friend-list-beep-footer";
}>;
