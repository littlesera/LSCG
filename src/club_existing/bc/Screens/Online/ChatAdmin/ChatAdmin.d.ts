/**
 * Loads the chat Admin screen properties and creates the inputs
 * @returns {void} - Nothing
 */
declare function ChatAdminLoad(): void;
/**
 * When the chat Admin screen runs, draws the screen
 * @returns {void} - Nothing
 */
declare function ChatAdminRun(): void;
/**
 * Handles the click events on the admin screen. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function ChatAdminClick(): void;
/**
 * Handles exiting from the admin screen, removes the inputs and resets the state of the variables
 * @returns {void} - Nothing
 */
declare function ChatAdminExit(): void;
/**
 * Handles the reception of the server response after attempting to update a chatroom: Leaves the admin screen or shows an error message
 * @param {string} data - Response from the server ("Updated" or error message)
 * @returns {void} - Nothing
 */
declare function ChatAdminResponse(data: string): void;
/**
 * Sends the chat room data packet to the server. The response will be handled by ChatAdminResponse once it is received
 * @returns {void} - Nothing
 */
declare function ChatAdminUpdateRoom(): void;
declare var ChatAdminBackground: string;
declare var ChatAdminMessage: string;
declare var ChatAdminBackgroundIndex: number;
declare var ChatAdminBackgroundSelect: string;
declare var ChatAdminPrivate: boolean;
declare var ChatAdminLocked: boolean;
/** @type {ChatRoomGame} */
declare var ChatAdminGame: ChatRoomGame;
/** @type {ChatRoomGame[]} */
declare var ChatAdminGameList: ChatRoomGame[];
/** @type {null | string} */
declare var ChatAdminBackgroundSelected: null | string;
/** @type {null | { Name: string, Language: ChatRoomLanguage, Description: string, Limit: string, AdminList: string, BanList: string, Private: boolean, Locked: boolean }} */
declare var ChatAdminTemporaryData: null | {
    Name: string;
    Language: ChatRoomLanguage;
    Description: string;
    Limit: string;
    AdminList: string;
    BanList: string;
    Private: boolean;
    Locked: boolean;
};
/** @type {ChatRoomBlockCategory[]} */
declare var ChatAdminBlockCategory: ChatRoomBlockCategory[];
declare var ChatAdminInitialLoad: boolean;
/** @type {ChatRoomLanguage} */
declare var ChatAdminLanguage: ChatRoomLanguage;
