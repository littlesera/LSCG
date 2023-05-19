/**
 * Sends a multiplayer update, trimming off stuff that doesnt need to get sent yet
 * @returns {void}
 */
declare function KinkyDungeonMultiplayerUpdate(Delay: any): void;
/**
 * Converts a string into Kinky Game Data
 * @returns {void}
 */
declare function KinkyDungeonUnpackData(KinkyData: any): void;
declare function KinkyDungeonUpdateFromData(): boolean;
/**
 * Turns the game state into a string that can be sent over
 * @returns {string} - String containing game data
 */
declare function KinkyDungeonPackData(IncludeMap: any, IncludeItems: any, IncludeInventory: any, IncludeStats: any): string;
/**
 * Sends kinky dungeon data to the target member
 * @returns {void}
 */
declare function KinkyDungeonSendData(data: any): void;
/**
 * Handles kinky dungeon data after receiving it from another player
 * @returns {void}
 */
declare function KinkyDungeonHandleData(data: any, SourceMemberNumber: any): void;
