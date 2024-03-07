/**
 * Loads the commands for the Player
 * @returns {void} - Nothing
 */
declare function CommandsLoad(): void;
/**
 * Translates the help for commands
 * @returns {void} - Nothing
 */
declare function CommandsTranslate(): void;
/**
 * Gets all available commands
 * @returns [ICommand[]]
 */
declare function GetCommands(): ICommand[];
/**
 * Fill the user input with the command
 * @param {string} command
 * @returns {void} - Nothing
 */
declare function CommandSet(command: string): void;
/**
 * Add a list of commands
 * @param {ICommand | ICommand[]} add - Commands to add
 * @returns {void} - Nothing
 */
declare function CommandCombine(add: ICommand | ICommand[]): void;
/**
 * Parse the input chat message
 * @param {string} msg - Input string, cannot be empty
 */
declare function CommandParse(msg: string): void;
/**
 * Prints out the help for commands with tags that include `low`
 * @param {string} low - lower case search keyword for tags
 * @param {number} [timeout] - total time to display the help message in ms
 * @returns {void} - Nothing
 */
declare function CommandHelp(low: string, timeout?: number): void;
/**
 * Prints out the help for commands
 * @param {Optional<ICommand, 'Action'>[]} CommandList - list of commands
 * @param {number} [Timeout] - total time to display the help message in ms
 * @param {boolean} [DoShowEscapeHint] - if message about message escaping should be shown
 */
declare function CommandPrintHelpFor(CommandList: Optional<ICommand, 'Action'>[], Timeout?: number, DoShowEscapeHint?: boolean): void;
/**
 * Finds command and executes it from the message
 * @param {string} msg - User input
 * @returns {void} - Nothing
 */
declare function CommandExecute(msg: string): void;
/**
 * Tries to complete the message to a command or print help about it
 * @param {string} msg - InputChat content
 */
declare function CommandAutoComplete(msg: string): void;
/** @type {ICommand[]} */
declare var Commands: ICommand[];
/** @readonly */
declare let CommandsKey: "/";
/** @type {TextCache} */
declare let CommandText: TextCache;
/**
 * @type {ICommand[]}
 */
declare const CommonCommands: ICommand[];
