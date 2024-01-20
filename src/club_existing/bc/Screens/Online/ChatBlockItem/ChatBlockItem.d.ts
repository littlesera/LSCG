/**
 * Loads the chat room item blocking screen
 * @returns {void} - Nothing
 */
declare function ChatBlockItemLoad(): void;
/**
 * When the chat room item blocking screen runs, draws the screen
 * @returns {void} - Nothing
 */
declare function ChatBlockItemRun(): void;
/**
 * Handles the click events on the chat room item blocking screen. Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function ChatBlockItemClick(): void;
/**
 * Handles exiting from the screen
 * @returns {void} - Nothing
 */
declare function ChatBlockItemExit(): void;
declare var ChatBlockItemBackground: string;
/** @type {ServerChatRoomBlockCategory[]} */
declare var ChatBlockItemList: ServerChatRoomBlockCategory[];
/** @type {ServerChatRoomBlockCategory[]} */
declare var ChatBlockItemCategory: ServerChatRoomBlockCategory[];
declare var ChatBlockItemEditable: boolean;
/** @type { { Screen?: string; } } */
declare var ChatBlockItemReturnData: {
    Screen?: string;
};
