/**
 * Loads the online profile screen by creating its input
 * @returns {void} - Nothing
 */
declare function OnlineProfileLoad(): void;
/**
 * Runs and draws the online profile screen
 * @returns {void} - Nothing
 */
declare function OnlineProfileRun(): void;
/**
 * Handles clicks in the online profile screen
 * @returns {void} - Nothing
 */
declare function OnlineProfileClick(): void;
/**
 * Handles exiting while in the online profile screen. It removes the input and saves the description.
 * @param {boolean} Save - Whether or not we should save the changes
 * @returns {void} - Nothing
 */
declare function OnlineProfileExit(Save: boolean): void;
declare var OnlineProfileBackground: string;
/**
 * Character used to signal, that description is compressed
 * @readonly
 */
declare var ONLINE_PROFILE_DESCRIPTION_COMPRESSION_MAGIC: string;
