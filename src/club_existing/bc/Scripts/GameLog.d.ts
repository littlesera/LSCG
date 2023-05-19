/**
 * Adds a new entry to the player's logs, renews the value if it already exists.
 * @template {LogGroupType} T
 * @param {LogNameType[T]} NewLogName - The name of the log
 * @param {T} NewLogGroup - The name of the log's group
 * @param {number} [NewLogValue] - Value for the log as the time in ms. Is undefined if the value is permanent
 * @param {boolean} [Push=true] - TRUE if we must push the log to the server
 * @returns {void} - Nothing
 */
declare function LogAdd<T extends keyof LogNameType>(NewLogName: LogNameType[T], NewLogGroup: T, NewLogValue?: number, Push?: boolean): void;
/**
 * Deletes a log entry.
 * @template {LogGroupType} T
 * @param {LogNameType[T]} DelLogName - The name of the log
 * @param {T} DelLogGroup - The name of the log's group
 * @param {boolean} [Push=true] - TRUE if we must push the log to the server
 * @returns {void} - Nothing
 */
declare function LogDelete<T extends keyof LogNameType>(DelLogName: LogNameType[T], DelLogGroup: T, Push?: boolean): void;
/**
 * Deletes all log entries to starts with the name.
 * @param {string} DelLogName - The name of the log
 * @param {LogGroupType} DelLogGroup - The name of the log's group
 * @param {boolean} [Push=true] - TRUE if we must push the log to the server
 * @returns {void} - Nothing
 */
declare function LogDeleteStarting(DelLogName: string, DelLogGroup: LogGroupType, Push?: boolean): void;
/**
 * Deletes all log entries in a particular log group.
 * @param {LogGroupType} DelLogGroup - The name of the log's group
 * @param {boolean} [Push=true] - TRUE if we must push the log to the server
 * @returns {void} - Nothing
 */
declare function LogDeleteGroup(DelLogGroup: LogGroupType, Push?: boolean): void;
/**
 * Searches for an existing log entry.
 * @template {LogGroupType} T
 * @param {LogNameType[T]} QueryLogName - The name of the log to search for
 * @param {T} QueryLogGroup - The name of the log's group
 * @returns {boolean} - Returns TRUE if there is an existing log matching the Name/Group with no value or a value above the current time in ms.
 */
declare function LogQuery<T extends keyof LogNameType>(QueryLogName: LogNameType[T], QueryLogGroup: T): boolean;
/**
 * Checks if there's a log entry with extra ID characters in the log of the player (Exemple: BlockScreenABC return true for ID: A, B or C)
 * @template {LogGroupType} T
 * @param {LogNameType[T]} LogName - The log name to scan
 * @param {T} LogGroup - The log group to scan
 * @param {string} ID - The ID to validate (letter, number or other chars are fine)
 * @returns {boolean} - Returns true, if the log contains that ID
 */
declare function LogContain<T extends keyof LogNameType>(LogName: LogNameType[T], LogGroup: T, ID: string): boolean;
/**
 * Returns the value associated to a log.
 * @template {LogGroupType} T
 * @param {LogNameType[T]} QueryLogName - The name of the log to query the value
 * @param {T} QueryLogGroup - The name of the log's group
 * @returns {number | null} - Returns the value of the log which is a date represented in ms or undefined. Returns null if no matching log is found.
 */
declare function LogValue<T extends keyof LogNameType>(QueryLogName: LogNameType[T], QueryLogGroup: T): number | null;
/**
 * Loads the account log.
 * @param {readonly LogRecord[]} NewLog - Existing logs received by the server
 * @returns {void} - Nothing
 */
declare function LogLoad(NewLog: readonly LogRecord[]): void;
/**
 * Searches for an existing log entry on another character.
 * @template {LogGroupType} T
 * @param {Character} C - Character to search on
 * @param {LogNameType[T]} QueryLogName - The name of the log to search for
 * @param {T} QueryLogGroup - The name of the log's group
 * @returns {boolean} - Returns TRUE if there is an existing log matching the Name/Group with no value or a value above the current time in ms.
 */
declare function LogQueryRemote<T extends keyof LogNameType>(C: Character, QueryLogName: LogNameType[T], QueryLogGroup: T): boolean;
/**
 * Filters the Player's log and returns the rule entries that the player's owner is allowed to see.
 * @param {boolean} OwnerIsLover - Indicates that the requester is also the player's lover.
 * @returns {LogRecord[]} - A list of rules that the player's owner is permitted to see
 */
declare function LogGetOwnerReadableRules(OwnerIsLover: boolean): LogRecord[];
/**
 * Filters the Player's log and returns the rule entries that the player's lover is allowed to see.
 * @returns {LogRecord[]} - A list of rules that the player's lover is permitted to see
 */
declare function LogGetLoverReadableRules(): LogRecord[];
/** @type {LogRecord[]} */
declare var Log: LogRecord[];
