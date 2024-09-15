/**
 * Runs the chatroom search select screen
 * @returns {void} - Nothing
 */
declare function ChatSelectRun(): void;
/**
 * Handles clicks on the chat select screen
 * @returns {void} - Nothing
 */
declare function ChatSelectClick(): void;
/**
 * Loads the chat select screen, automatically joining a chat search space if configured
 * @returns {void} - Nothing
 */
declare function ChatSelectLoad(): void;
/**
 * Start the chat search screen for the relevant chat room space
 * @param {ServerChatRoomSpace} space - The space to join
 */
declare function ChatSelectStartSearch(space: ServerChatRoomSpace): void;
declare function ChatSelectExit(): void;
/**
 * Returns whether all provided genders are allowed in the specified space
 * @param {ServerChatRoomSpace} space - The chatroom space
 * @param {AssetGender[]} genders - A list of relevant genders to check
 * @returns {boolean} - Whether the genders are allowed
 */
declare function ChatSelectGendersAllowed(space: ServerChatRoomSpace, genders: AssetGender[]): boolean;
declare var ChatSelectBackground: string;
/** @type {boolean} */
declare var ChatSelectAllowedInFemaleOnly: boolean;
/** @type {boolean} */
declare var ChatSelectAllowedInMaleOnly: boolean;
