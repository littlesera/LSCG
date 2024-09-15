/**
 * Changes a customiation value from a chat room command
 * @param {"Image" | "Filter" | "Music"} Property - The custom property to change (Image, Filter or Music)
 * @param {string} Value - The value to set in that property
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationCommand(Property: "Image" | "Filter" | "Music", Value: string): void;
/**
 * Loads the chat Admin Custom screen properties and creates the inputs
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationLoad(): void;
/**
 * Plays or stop the background music
 * @param {string} Music - The URL of the music to play
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationPlayMusic(Music: string): void;
/**
 * Runs the customization on the current screen, can be called from elsewhere
 * @param {object} Custom - The customazation to apply
 * @param {boolean} Draw - If we must draw directly or keep values to be used by online chat rooms
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationProcess(Custom: object, Draw: boolean): void;
/**
 * When the chat Admin Custom screen runs, draws the screen
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationRun(): void;
/**
 * Handles the click events on the admin custom screen. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationClick(): void;
/**
 * Handles exiting from the admin custom screen, removes the inputs
 * @returns {void} - Nothing
 */
declare function ChatAdminRoomCustomizationExit(): void;
declare var ChatAdminRoomCustomizationBackground: string;
declare var ChatAdminRoomCustomizationCurrent: any;
declare var ChatAdminRoomCustomizationMusic: any;
declare var ChatAdminRoomCustomizationMode: any;
declare var ChatAdminRoomCustomizationMusicLibrary: {
    Name: string;
    URL: string;
    Source: string;
}[];
