/**
 * Checks if a variable is a number
 * @param {any} n - Variable to check for
 * @returns {n is number} - Returns TRUE if the variable is a finite number
 */
declare function CommonIsNumeric(n: any): n is number;
/**
 * Gets the current time as a string
 * @returns {string} - Returns the current date and time in a yyyy-mm-dd hh:mm:ss format
 */
declare function CommonGetFormatDate(): string;
/**
 * Detects if the user is on a mobile browser
 * @returns {boolean} - Returns TRUE if the user is on a mobile browser
 */
declare function CommonDetectMobile(): boolean;
/**
 * Gets the current browser name and version
 * @returns {{Name: string, Version: string}} - Browser info
 */
declare function CommonGetBrowser(): {
    Name: string;
    Version: string;
};
/**
 * Parse a CSV file content into an array
 * @param {string} str - Content of the CSV
 * @returns {string[][]} Array representing each line of the parsed content, each line itself is split by commands and stored within an array.
 */
declare function CommonParseCSV(str: string): string[][];
/**
 *  Read a CSV file from cache, or fetch it from the server
 * @param {string} Array - Name of where the cached text is stored
 * @param {string} Path - Path/Group in which the screen is located
 * @param {string} Screen - Screen for which the file is for
 * @param {string} File - Name of the file to get
 * @returns {void} - Nothing
 */
declare function CommonReadCSV(Array: string, Path: string, Screen: string, File: string): void;
/**
 * AJAX utility to get a file and return its content. By default will retry requests 10 times
 * @param {string} Path - Path of the resource to request
 * @param {(this: XMLHttpRequest, xhr: XMLHttpRequest) => void} Callback - Callback to execute once the resource is received
 * @param {number} [RetriesLeft] - How many more times to retry if the request fails - after this hits zero, an error will be logged
 * @returns {void} - Nothing
 */
declare function CommonGet(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft?: number): void;
/**
 * Retry handler for CommonGet requests. Exponentially backs off retry attempts up to a limit of 1 minute. By default,
 * retries up to a maximum of 10 times.
 * @param {string} Path - The path of the resource to request
 * @param {(this: XMLHttpRequest, xhr: XMLHttpRequest) => void} Callback - Callback to execute once the resource is received
 * @param {number} [RetriesLeft] - How many more times to retry - after this hits zero, an error will be logged
 * @returns {void} - Nothing
 */
declare function CommonGetRetry(Path: string, Callback: (this: XMLHttpRequest, xhr: XMLHttpRequest) => void, RetriesLeft?: number): void;
declare function CommonMouseDown(event: any): void;
declare function CommonMouseUp(event: any): void;
declare function CommonMouseMove(event: any): void;
declare function CommonMouseWheel(event: WheelEvent): void;
/**
 * Catches the clicks on the main screen and forwards it to the current screen click function if it exists, otherwise it sends it to the dialog click function
 * @param {MouseEvent | TouchEvent} event - The event that triggered this
 * @returns {void} - Nothing
 */
declare function CommonClick(event: MouseEvent | TouchEvent): void;
/**
 * Returns TRUE if a section of the screen is currently touched on a mobile device
 * @param {number} X - The X position
 * @param {number} Y - The Y position
 * @param {number} W - The width of the square
 * @param {number} H - The height of the square
 * @param {TouchList} [TL] - Can give a specific touch event instead of the default one
 * @returns {boolean}
 */
declare function CommonTouchActive(X: number, Y: number, W: number, H: number, TL?: TouchList): boolean;
/**
 * Catches key presses on the main screen and forwards it to the current screen key down function if it exists, otherwise it sends it to the dialog key down function
 * @deprecated Use GameKeyDown instead
 * @param {KeyboardEvent} event - The event that triggered this
 * @returns {void} - Nothing
 */
declare function CommonKeyDown(event: KeyboardEvent): void;
/**
 * Calls a basic dynamic function if it exists, for complex functions, use: CommonDynamicFunctionParams
 * @param {string} FunctionName - Name of the function to call
 * @returns {void} - Nothing
 */
declare function CommonDynamicFunction(FunctionName: string): void;
/**
 * Calls a dynamic function with parameters (if it exists), also allow ! in front to reverse the result. The dynamic function is the provided function name in the dialog option object and it is prefixed by the current screen.
 * @param {string} FunctionName - Function name to call dynamically
 * @returns {*} - Returns what the dynamic function returns or FALSE if the function does not exist
 */
declare function CommonDynamicFunctionParams(FunctionName: string): any;
/**
 *  Calls a named global function with the passed in arguments, if the named function exists. Differs from
 *  CommonDynamicFunctionParams in that arguments are not parsed from the passed in FunctionName string, but
 *  passed directly into the function call, allowing for more complex JS objects to be passed in. This
 *  function will not log to console if the provided function name does not exist as a global function.
 * @param {string} FunctionName - The name of the global function to call
 * @param {readonly any[]} [args] - zero or more arguments to be passed to the function (optional)
 * @returns {any} - returns the result of the function call, or undefined if the function name isn't valid
 */
declare function CommonCallFunctionByName(FunctionName: string, ...args: any[]): any;
/**
 * Behaves exactly like CommonCallFunctionByName, but logs a warning if the function name is invalid.
 * @param {string} FunctionName - The name of the global function to call
 * @param {readonly any[]} [args] - zero or more arguments to be passed to the function (optional)
 * @returns {any} - returns the result of the function call, or undefined if the function name isn't valid
 */
declare function CommonCallFunctionByNameWarn(FunctionName: string, ...args: any[]): any;
/**
 * Sets the current screen and calls the loading script if needed
 * @param {ModuleType} NewModule - Module of the screen to display
 * @param {string} NewScreen - Screen to display
 * @returns {void} - Nothing
 */
declare function CommonSetScreen(NewModule: ModuleType, NewScreen: string): void;
/**
 * Gets the current time in ms
 * @returns {number} - Date in ms
 */
declare function CommonTime(): number;
/**
 * Checks if a given value is a valid HEX color code
 * @param {string} Value - Potential HEX color code
 * @returns {boolean} - Returns TRUE if the string is a valid HEX color
 */
declare function CommonIsColor(Value: string): boolean;
/**
 * Checks whether an item's color has a valid value that can be interpreted by the drawing
 * functions. Valid values are null, undefined, strings, and an array containing any of the
 * aforementioned types.
 * @param {null | string | readonly (null | string)[]} [Color] - The Color value to check
 * @returns {boolean} - Returns TRUE if the color is a valid item color
 */
declare function CommonColorIsValid(Color?: null | string | readonly (null | string)[]): boolean;
/**
 * Check that the passed string looks like an acceptable email address.
 *
 * @param {string} Email
 * @returns {boolean}
 */
declare function CommonEmailIsValid(Email: string): boolean;
/**
 * Remove item from list on given index and returns it
 * @template T
 * @param {T[]} list
 * @param {number} index
 * @returns {undefined|T}
 */
declare function CommonRemoveItemFromList<T>(list: T[], index: number): undefined | T;
/**
 * Removes random item from list and returns it
 * @template T
 * @param {T[]} list
 * @returns {T}
 */
declare function CommonRemoveRandomItemFromList<T>(list: T[]): T;
/**
 * Get a random item from a list while making sure not to pick the previous one.
 * Function expects unique values in the list. If there are multiple instances of ItemPrevious, it may still return it.
 * @template T
 * @param {T} ItemPrevious - Previously selected item from the given list
 * @param {readonly T[]} ItemList - List for which to pick a random item from
 * @returns {T} - The randomly selected item from the list
 */
declare function CommonRandomItemFromList<T>(ItemPrevious: T, ItemList: readonly T[]): T;
/**
 * Converts a string of numbers split by commas to an array, sanitizes the array by removing all NaN or undefined elements.
 * @param {string} s - String of numbers split by commas
 * @returns {number[]} - Array of valid numbers from the given string
 */
declare function CommonConvertStringToArray(s: string): number[];
/**
 * Shuffles all characters in a string
 * @param {string} string - The string to shuffle
 * @returns {string} - The shuffled string
 */
declare function CommonStringShuffle(string: string): string;
/**
 * Converts an array to a string separated by commas (equivalent of .join(","))
 * @param {readonly unknown[]} Arr - Array to convert to a joined string
 * @returns {string} - String of all the array items joined together
 */
declare function CommonConvertArrayToString(Arr: readonly unknown[]): string;
/**
 * Checks whether two item colors are equal. An item color may either be a string or an array of strings.
 * @param {string | readonly string[]} C1 - The first color to check
 * @param {string | readonly string[]} C2 - The second color to check
 * @returns {boolean} - TRUE if C1 and C2 represent the same item color, FALSE otherwise
 */
declare function CommonColorsEqual(C1: string | readonly string[], C2: string | readonly string[]): boolean;
/**
 * Checks whether two arrays are equal. The arrays are considered equal if they have the same length and contain the same items in the same
 * order, as determined by === comparison
 * @param {readonly *[]} a1 - The first array to compare
 * @param {readonly *[]} a2 - The second array to compare
 * @param {boolean} [ignoreOrder] - Whether to ignore item order when considering equality
 * @returns {boolean} - TRUE if both arrays have the same length and contain the same items in the same order, FALSE otherwise
 */
declare function CommonArraysEqual(a1: readonly any[], a2: readonly any[], ignoreOrder?: boolean): boolean;
/**
 * Creates a debounced wrapper for the provided function with the provided wait time. The wrapped function will not be called as long as
 * the debounced function continues to be called. If the debounced function is called, and then not called again within the wait time, the
 * wrapped function will be called.
 * @param {function} func - The function to debounce
 * @returns {function} - A debounced version of the provided function
 */
declare function CommonDebounce(func: Function): Function;
/**
 * Creates a throttling wrapper for the provided function with the provided wait time. If the wrapped function has been successfully called
 * within the wait time, further call attempts will be delayed until the wait time has passed.
 * @param {function} func - The function to throttle
 * @returns {function} - A throttled version of the provided function
 */
declare function CommonThrottle(func: Function): Function;
/**
 * Creates a wrapper for a function to limit how often it can be called. The player-defined wait interval setting determines the
 * allowed frequency. Below 100 ms the function will be throttled and above will be debounced.
 * @template {(...args: any) => any} FunctionType
 * @param {FunctionType} func - The function to limit calls of
 * @param {number} [minWait=0] - A lower bound for how long the wait interval can be, 0 by default
 * @param {number} [maxWait=1000] - An upper bound for how long the wait interval can be, 1 second by default
 * @returns {FunctionType} - A debounced or throttled version of the function
 */
declare function CommonLimitFunction<FunctionType extends (...args: any) => any>(func: FunctionType, minWait?: number, maxWait?: number): FunctionType;
/**
 * Creates a simple memoizer.
 * The memoized function does calculate its result exactly once and from that point on, uses
 * the result stored in a local cache to speed up things.
 * @template {(...args: any) => any} T
 * @param {T} func - The function to memoize
 * @param {((arg: any) => string)[]} argConvertors - A list of stringification functions for creating a memo, one for each function argument
 * @returns {MemoizedFunction<T>} - The result of the memoized function
 */
declare function CommonMemoize<T extends (...args: any) => any>(func: T, argConvertors?: ((arg: any) => string)[]): MemoizedFunction<T>;
/**
 * Take a screenshot of specified area in "photo mode" and open the image in a new tab
 * @param {number} Left - Position of the area to capture from the left of the canvas
 * @param {number} Top - Position of the area to capture from the top of the canvas
 * @param {number} Width - Width of the area to capture
 * @param {number} Height - Height of the area to capture
 * @returns {void} - Nothing
 */
declare function CommonTakePhoto(Left: number, Top: number, Width: number, Height: number): void;
/**
 * Compares two version numbers and returns -1/0/1 if Other number is smaller/same/larger than Current one
 * @param {string} Current Current version number
 * @param {string} Other Other version number
 * @returns {-1|0|1} Comparison result
 */
declare function CommonCompareVersion(Current: string, Other: string): -1 | 0 | 1;
/**
 * A simple deep equality check function which checks whether two objects are equal. The function traverses recursively
 * into objects and arrays to check for equality. Primitives and simple types are considered equal as defined by `===`.
 * @template T
 * @param {unknown} obj1 - The first object to compare
 * @param {T} obj2 - The second object to compare
 * @returns {obj1 is T} - TRUE if both objects are equal, up to arbitrarily deeply nested property values, FALSE
 * otherwise.
 */
declare function CommonDeepEqual<T>(obj1: unknown, obj2: T): obj1 is T;
/**
 * A simple deep equality check function which checks whether two objects are equal for all properties in `subRec`.
 * The function traverses recursively into objects and arrays to check for equality.
 * Primitives and simple types are considered equal as defined by `===`.
 * @template T
 * @param {unknown} subRec - The subset-containg object to compare
 * @param {T} superRec - The superset-containg object to compare
 * @returns {subRec is Partial<T>} - Whether `subRec` is a subset of `superRec` up to arbitrarily deeply nested property values
 */
declare function CommonDeepIsSubset<T>(subRec: unknown, superRec: T): subRec is Partial<T>;
/**
 * Adds all items from the source array to the destination array if they aren't already included
 * @template T
 * @param {T[]} dest - The destination array
 * @param {readonly T[]} src - The source array
 * @returns {T[]} - The destination array
 */
declare function CommonArrayConcatDedupe<T>(dest: T[], src: readonly T[]): T[];
/**
 * Common function for removing a padlock from an item and publishing a corresponding chat message (must be called with
 * the item's group focused)
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item to unlock
 * @returns {void} - Nothing
 */
declare function CommonPadlockUnlock(C: Character, Item: Item): void;
/**
 * Common noop function
 * @returns {void} - Nothing
 */
declare function CommonNoop(): void;
/**
 * Redirects the address to HTTPS for all production environments, returns the proper heroku server
 * @returns {String} - Returns the proper server to use in production or test
 */
declare function CommonGetServer(): string;
/**
 * Performs the required substitutions on the given message
 *
 * @param {string} msg - The string to perform the substitutions on.
 * @param {CommonSubtituteSubstitution[]} substitutions - An array of [string, replacement, replacer?] subtitutions.
 */
declare function CommonStringSubstitute(msg: string, substitutions: CommonSubtituteSubstitution[]): string;
/**
 * Returns a nice version of the passed strings
 *
 * This turns ["this", "this", "that"] into "this, this, and that" using appropriate localization
 *
 * @param {string[]} strings The strings to join
 */
declare function CommonArrayJoinPretty(strings: string[]): string;
/**
 * Returns a titlecased version of the given string.
 * @param {string} str
 * @returns {string}
 */
declare function CommonStringTitlecase(str: string): string;
/**
 * Censors a string or words in that string based on the player preferences
 * @param {string} S - The string to censor
 * @returns {String} - The censored string
 */
declare function CommonCensor(S: string): string;
/**
 * Type guard which checks that a value is a simple object (i.e. a non-null object which is not an array)
 * @param {unknown} value - The value to test
 * @returns {value is Record<string, unknown>}
 */
declare function CommonIsObject(value: unknown): value is Record<string, unknown>;
/**
 * Deep-clones an object
 * @todo JSON serialization will break things like functions, Sets and Maps.
 * @template T
 * @param {T} obj
 * @param {null | ((this: any, key: string, value: any) => any)} replacer
 * @param {null | ((this: any, key: string, value: any) => any)} reviver
 * @returns {T}
 */
declare function CommonCloneDeep<T>(obj: T, reviver?: null | ((this: any, key: string, value: any) => any), replacer?: null | ((this: any, key: string, value: any) => any)): T;
/**
 * Type guard which checks that a value is a non-negative (i.e. positive or zero) integer
 * @param {unknown} value - The value to test
 * @returns {value is number}
 * @see {@link CommonIsInteger}
 */
declare function CommonIsNonNegativeInteger(value: unknown): value is number;
/**
 * Type guard which checks that a value is an integer that, optionally, falls within the specified range
 * @param {unknown} value - The value to test
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {value is number}
 */
declare function CommonIsInteger(value: unknown, min?: number, max?: number): value is number;
/**
 * Type guard which checks that a value is a finite number that, optionally, falls within the specified range
 * @param {unknown} value - The value to test
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {value is number}
 */
declare function CommonIsFinite(value: unknown, min?: number, max?: number): value is number;
/**
 * A version of {@link Array.isArray} more friendly towards readonly arrays.
 * @param {unknown} arg - The to-be validated object
 * @returns {arg is readonly unknown[]} Whether the passed object is a (potentially readonly) array
 */
declare function CommonIsArray(arg: unknown): arg is readonly unknown[];
/**
 * A {@link Object.keys} variant annotated to return respect literal key types
 * @template {string} T
 * @param {Partial<Record<T, unknown>>} record A record with string-based keys
 * @returns {T[]} The keys in the passed record
 */
declare function CommonKeys<T extends string>(record: Partial<Record<T, unknown>>): T[];
/**
 * A {@link Object.entries} variant annotated to return respect literal key types
 * @template {string} KT
 * @template VT
 * @param {Partial<Record<KT, VT>>} record A record with string-based keys
 * @returns {[KT, VT][]} The key/value pairs in the passed record
 */
declare function CommonEntries<KT extends string, VT>(record: Partial<Record<KT, VT>>): [KT, VT][];
/**
 * A {@link Array.includes} version annotated to return a type guard.
 * @template T
 * @param {readonly T[]} array The array in question
 * @param {unknown} searchElement The value to search for
 * @param {number} [fromIndex] Zero-based index at which to start searching
 * @returns {searchElement is T} Whether the array contains the passed element
 */
declare function CommonIncludes<T>(array: readonly T[], searchElement: unknown, fromIndex?: number): searchElement is T;
/**
 * A {@link Object.fromEntries} variant annotated to return respect literal key types.
 * @note The returned record is typed as being non-{@link Partial}, an assumption that may not hold in practice
 * @template {string} KT
 * @template VT
 * @param {Iterable<[key: KT, value: VT]>} iterable An iterable object that contains key-value entries for properties and methods
 * @returns {Record<KT, VT>} A record created from the passed key/value pairs
 */
declare function CommonFromEntries<KT extends string, VT>(iterable: Iterable<[key: KT, value: VT]>): Record<KT, VT>;
/**
 * Automatically generate grid coordinates based on parameters.
 * @param {number} nItems - The upper bound to the number of grid points; fewer can be returned if they do not all fit on the grid
 * @param {CommonGenerateGridParameters} grid - The grid parameters
 * @returns {RectTuple[]} - A list of grid coordinates with a length of `<= nItems`
 * @see {@link CommonGenerateGrid}
 */
declare function CommonGenerateGridCoords(nItems: number, grid: CommonGenerateGridParameters): RectTuple[];
/**
 * Automatically generate a grid based on parameters and apply a callback to each grid point.
 *
 * This function takes a list of items, grid parameters, and a callback to manage
 * creating a grid of them. It'll find the best value for margins between each cell,
 * then will call the callback passing each item with its calculated coordinates in turn.
 *
 * Returning true from the callback to stop the iteration, useful for click handlers
 * so you don't keep checking items after handling one.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} offset
 * @param {CommonGenerateGridParameters} grid
 * @param {CommonGenerateGridCallback<T>} callback
 * @returns {number} - The (offsetted) index for which the callback evaluated to `true`, or `-1` if no elements satisfy the testing
 */
declare function CommonGenerateGrid<T>(items: readonly T[], offset: number, grid: CommonGenerateGridParameters, callback: CommonGenerateGridCallback<T>): number;
/**
 * Create a copy of the passed record with all specified keys removed
 * @template {keyof RecordType} KeyType
 * @template {{}} RecordType
 * @param {RecordType} object - The to-be copied record
 * @param {Iterable<KeyType>} keys - The to-be removed keys from the record
 * @returns {Omit<RecordType, KeyType>}
 */
declare function CommonOmit<KeyType extends keyof RecordType, RecordType extends {}>(object: RecordType, keys: Iterable<KeyType>): Omit<RecordType, KeyType>;
/**
 * Create a copy of the passed record with all specified keys removed
 * @template {keyof RecordType} KeyType
 * @template {{}} RecordType
 * @param {RecordType} object - The to-be copied record
 * @param {Iterable<KeyType>} keys - The to-be removed keys from the record
 * @returns {Pick<RecordType, KeyType>}
 */
declare function CommonPick<KeyType extends keyof RecordType, RecordType extends {}>(object: RecordType, keys: Iterable<KeyType>): Pick<RecordType, KeyType>;
/**
 * Iterate through the passed iterable and yield index/value pairs.
 * @template T
 * @param {Iterable<T>} iterable - The to-be iterated iterable
 * @param {number} start - The starting index
 * @param {number} step - The step size in which the index is incremented
 * @returns {Generator<[index: number, value: T], void>}
 */
declare function CommonEnumerate<T>(iterable: Iterable<T>, start?: number, step?: number): Generator<[index: number, value: T], void>;
/**
 * Return a value clamped to a minimum and maximum
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
declare function CommonClamp(value: number, min: number, max: number): number;
/**
 * Return value % divisor but properly handling negative values
 *
 * Useful if you have a set of keys and want to move an index within its bounds with proper wrap-around.
 *
 * @param {number} value
 * @param {number} divisor
 */
declare function CommonModulo(value: number, divisor: number): number;
/**
 * Returns TRUE if the URL is valid, is from http or https or screens/ or backgrounds/ and has the required extension
 * @param {string} TestURL - The URL to test
 * @param {readonly string[]} Extension - An array containing the valid extensions
 * @returns {boolean}
*/
declare function CommonURLHasExtension(TestURL: string, Extension: readonly string[]): boolean;
/**
 * Return whether two records are equivalent for all fields as returned by {@link Object.keys}.
 * @note does *not* support the comparison of nested structures.
 * @template T
 * @param {T} rec1
 * @param {unknown} rec2
 * @returns {rec2 is T}
 */
declare function CommonObjectEqual<T>(rec1: T, rec2: unknown): rec2 is T;
/**
 * Return if the key/value pairs of `subRec` form a subset of `superRec`
 * @template T
 * @param {unknown} subRec
 * @param {T} superRec
 * @returns {subRec is Partial<T>}
 */
declare function CommonObjectIsSubset<T>(subRec: unknown, superRec: T): subRec is Partial<T>;
/**
 * Returns the object with keys and values reversed
 * @param {object} obj
 */
declare function CommonObjectFlip(obj: object): {};
/**
 * Parse the passed stringified JSON data and catch any exceptions.
 * Exceptions will cause the function to return `undefined`.
 * @param {string} data
 * @returns {any}
 * @see {@link JSON.parse}
 */
declare function CommonJSONParse(data: string): any;
/**
 * Translates the current event into movement directions
 *
 * This returns a layout independent u/d/l/r string
 *
 * @param {KeyboardEvent} event
 * @returns {"u"|"d"|"l"|"r"|undefined}
 */
declare function CommonKeyMove(event: KeyboardEvent, allowArrowKeys?: boolean): "u" | "d" | "l" | "r" | undefined;
/**
 * A {@link Set.has}/{@link Map.has} version annotated to return a type guard.
 * @template T
 * @param {{ has: (key: T) => boolean }} obj The set or map in question
 * @param {unknown} key The key to search for
 * @returns {key is T} Whether the object contains the passed key
 */
declare function CommonHas<T>(obj: {
    has: (key: T) => boolean;
}, key: unknown): key is T;
/**
 * Defines a property with the given name and the passed setter and getter
 * @example
 * CommonDeprecate(
 *  "OldFunc",
 *  function NewFunc (a, b) { return a + b; },
 * );
 * @template {any} T
 * @param {string} propertyName - The name for the new property
 * @param {()=>T} getter - The getter function for the property
 * @param {(T)=>void} setter - The setter function for the property
 */
declare function CommonProperty<T extends unknown>(propertyName: string, getter?: () => T, setter?: (T: any) => void): void;
/**
 * Assign a function to the passed namespace, creating a deprecated and non-deprecated symbol.
 * Both symbols will are in fact get/set wrappers around the same object, enforcing that `namespace[oldName] === namespace[callback.name]` *always* holds.
 * @example
 * CommonDeprecateFunction(
 *  "OldFunc",
 *  function NewFunc (a, b) { return a + b; },
 * );
 * @template {(...any) => any} T
 * @param {string} oldName - The old (deprecated) name of the symbol
 * @param {T} callback - The function with its new name
 * @param {Record<string, any>} namespace - The namespace wherein the new and old names will be stored
 */
declare function CommonDeprecateFunction<T extends (...any: any) => any>(oldName: string, callback: T, namespace?: Record<string, any>): void;
/**
 * Capitalize the first character of the passed string.
 * @template {string} T
 * @param {T} string
 * @returns {Capitalize<T>}
 */
declare function CommonCapitalize<T extends string>(string: T): Capitalize<T>;
/**
 * Construct an object for holding arbitrary (user-specified) values with a mechanism to reset them to a default
 * @template T1
 * @template [T2={}]
 * @param {T1} defaults - Default values that should be restored upon reset
 * @param {null | T2} extraVars - Extra values that should *not* affected by resets
 * @param {null | { replacer?: (this: any, key: string, value: any) => any, reviver?: (this: any, key: string, value: any) => any }} resetCallbacks - Extra callbacks for affecting the deep cloning process on reset.
 * Generally only relevant if one of the fields contains non-JSON-serializible data.
 * @returns {VariableContainer<T1, T2>} - The newly created object
 */
declare function CommonVariableContainer<T1, T2 = {}>(defaults: T1, extraVars?: null | T2, resetCallbacks?: null | {
    replacer?: (this: any, key: string, value: any) => any;
    reviver?: (this: any, key: string, value: any) => any;
}): VariableContainer<T1, T2>;
/** @type {PlayerCharacter} */
declare var Player: PlayerCharacter;
/**
 * @type {number|string}
 * @deprecated Use the keyboard handler's `event` parameter instead
 */
declare var KeyPress: number | string;
/** @type {ModuleType} */
declare var CurrentModule: ModuleType;
/** @type {string} */
declare var CurrentScreen: string;
/** @type {ScreenFunctions} */
declare var CurrentScreenFunctions: ScreenFunctions;
/** @type {Character|NPCCharacter|null} */
declare var CurrentCharacter: Character | NPCCharacter | null;
declare var CurrentOnlinePlayers: number;
/**
 * A per-screen ratio of how darkened the background must be
 *
 * 1 is bright, 0 is pitch black
 */
declare var CurrentDarkFactor: number;
declare var CommonIsMobile: boolean;
/** @type {Record<string, string[][]>} */
declare var CommonCSVCache: Record<string, string[][]>;
declare var CutsceneStage: number;
declare var CommonPhotoMode: boolean;
/**
 * An enum encapsulating possible chatroom message substitution tags. Character name substitution tags are interpreted
 * in chatrooms as follows (assuming the character name is Ben987):
 * SOURCE_CHAR: "Ben987"
 * DEST_CHAR: "Ben987's" (if character is not self), "her" (if character is self)
 * DEST_CHAR_NAME: "Ben987's"
 * TARGET_CHAR: "Ben987" (if character is not self), "herself" (if character is self)
 * TARGET_CHAR_NAME: "Ben987"
 * Additionally, sending the following tags will ensure that asset names in messages are correctly translated by
 * recipients:
 * ASSET_NAME: (substituted with the localized name of the asset, if available)
 * @type {Record<"SOURCE_CHAR"|"DEST_CHAR"|"DEST_CHAR_NAME"|"TARGET_CHAR"|"TARGET_CHAR_NAME"|"ASSET_NAME"|"AUTOMATIC", CommonChatTags>}
 */
declare const CommonChatTags: Record<"SOURCE_CHAR" | "DEST_CHAR" | "DEST_CHAR_NAME" | "TARGET_CHAR" | "TARGET_CHAR_NAME" | "ASSET_NAME" | "AUTOMATIC", CommonChatTags>;
/**
 * A map of keys to common font stack definitions. Each stack definition is a
 * two-item array whose first item is an ordered list of fonts, and whose
 * second item is the generic fallback font family (e.g. sans-serif, serif,
 * etc.)
 * @constant
 * @type {Object.<String, [String[], String]>}
 */
declare const CommonFontStacks: any;
/**
 * Memoized getter function. Returns a font string specifying the player's
 * preferred font and the provided size. This is memoized as it is called on
 * every frame in many cases.
 * @param {number} size - The font size that should be specified in the
 * returned font string
 * @returns {string} - A font string specifying the requested font size and
 * the player's preferred font stack. For example:
 * 12px "Courier New", "Courier", monospace
 */
declare const CommonGetFont: MemoizedFunction<(size: any) => string>;
/**
 * Memoized getter function. Returns a font string specifying the player's
 * preferred font stack. This is memoized as it is called on every frame in
 * many cases.
 * @returns {string} - A font string specifying the player's preferred font
 * stack. For example:
 * "Courier New", "Courier", monospace
 */
declare const CommonGetFontName: MemoizedFunction<() => string>;
