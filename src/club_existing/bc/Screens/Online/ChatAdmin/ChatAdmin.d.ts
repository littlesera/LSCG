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
/** @type {object} */
declare var ChatAdminMapData: object;
/** @type {ServerChatRoomGame} */
declare var ChatAdminGame: ServerChatRoomGame;
/** @type {ServerChatRoomGame[]} */
declare var ChatAdminGameList: ServerChatRoomGame[];
/** @type {string | null} */
declare var ChatAdminBackgroundSelected: string | null;
/** @type {Partial<ServerChatRoomData> | null} */
declare var ChatAdminTemporaryData: Partial<ServerChatRoomData> | null;
/** @type {ServerChatRoomBlockCategory[]} */
declare var ChatAdminBlockCategory: ServerChatRoomBlockCategory[];
declare var ChatAdminInitialLoad: boolean;
/** @type {ServerChatRoomLanguage} */
declare var ChatAdminLanguage: ServerChatRoomLanguage;
declare var ChatAdminCustom: any;
